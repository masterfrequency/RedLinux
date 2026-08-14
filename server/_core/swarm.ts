import crypto from "node:crypto";
import { OSINTNexus } from "./osint";
import { getDb } from "../db";
import { osintNexusFindings, operatorSessionLogs } from "../../drizzle/schema";
import { invokeLLM } from "./llm";
import { eq, and } from "drizzle-orm";
import { NeuralMesh } from "./neuralMesh";

/**
 * Distributed Reconnaissance Swarm:
 * Orchestrates multi-node data collection with true asynchronous parallel execution
 */

export interface SwarmNode {
  id: string;
  provider: string;
  status: "pending" | "executing" | "completed" | "failed";
  findings: number;
  startTime?: Date;
  endTime?: Date;
  error?: string;
}

export interface SwarmResult {
  target: string;
  nodeCount: number;
  totalFindings: number;
  intelligence: string;
  nodes: SwarmNode[];
  executionTime: number;
  parallelizationFactor: number;
}

export class SwarmOrchestrator {
  private static readonly PROVIDERS = [
    "shodan",
    "censys",
    "greynoise",
    "crtsh",
    "whois",
  ];
  private static readonly MAX_PARALLEL_NODES = 5;

  /**
   * Dispatches a swarm of recon tasks with true parallel execution
   */
  static async dispatchSwarm(
    engagementId: number,
    target: string,
    userId: number,
  ): Promise<SwarmResult> {
    const db = await getDb();
    if (!db) throw new Error("Swarm Orchestrator: Database offline.");

    const startTime = Date.now();
    const swarmNodes: SwarmNode[] = [];

    // Initialize swarm nodes
    for (const provider of this.PROVIDERS) {
      swarmNodes.push({
        id: `${provider}-${crypto.randomBytes(4).toString("hex")}`,
        provider,
        status: "pending",
        findings: 0,
      });
    }

    // Execute swarm nodes in parallel batches
    const results = await this.executeSwarmBatch(
      engagementId,
      target,
      swarmNodes,
    );

    // Aggregate intelligence from all nodes
    const findings = await db
      .select()
      .from(osintNexusFindings)
      .where(
        and(
          eq(osintNexusFindings.engagementId, engagementId),
          eq(osintNexusFindings.target, target),
        ),
      );

    const intelligenceSummary = await this.aggregateIntelligence(
      target,
      findings,
      results,
    );

    const executionTime = Date.now() - startTime;
    const parallelizationFactor = Math.ceil(
      this.PROVIDERS.length / this.MAX_PARALLEL_NODES,
    );

    // Log swarm execution
    await db.insert(operatorSessionLogs).values({
      engagementId,
      userId,
      module: "swarm",
      action: "dispatch_parallel_swarm",
      details: JSON.stringify({
        target,
        nodeCount: results.length,
        totalFindings: findings.length,
        executionTime,
        parallelizationFactor,
        nodes: results.map((n) => ({
          id: n.id,
          provider: n.provider,
          status: n.status,
          findings: n.findings,
        })),
      }),
      status: "success",
    });

    return {
      target,
      nodeCount: results.length,
      totalFindings: findings.length,
      intelligence: intelligenceSummary,
      nodes: results,
      executionTime,
      parallelizationFactor,
    };
  }

  /**
   * Execute swarm nodes in parallel batches
   */
  private static async executeSwarmBatch(
    engagementId: number,
    target: string,
    nodes: SwarmNode[],
  ): Promise<SwarmNode[]> {
    const results: SwarmNode[] = [];

    // Process nodes in parallel batches
    for (let i = 0; i < nodes.length; i += this.MAX_PARALLEL_NODES) {
      const batch = nodes.slice(i, i + this.MAX_PARALLEL_NODES);

      // Execute batch in parallel
      const batchResults = await Promise.all(
        batch.map((node) => this.executeSwarmNode(engagementId, target, node)),
      );

      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Execute a single swarm node
   */
  private static async executeSwarmNode(
    engagementId: number,
    target: string,
    node: SwarmNode,
  ): Promise<SwarmNode> {
    const startTime = new Date();

    try {
      node.status = "executing";
      node.startTime = startTime;

      // Real OSINT scan with Neural Mesh coordination
      await OSINTNexus.runNexusScan(engagementId, target);

      // Notify the mesh of new findings
      await NeuralMesh.gossip({
        id: crypto.randomUUID(),
        senderId: node.id,
        type: "task_share",
        payload: { target, provider: node.provider },
        timestamp: Date.now(),
        signature: "node_sig",
      });

      // Count findings for this node, scoped to its provider
      const db = await getDb();
      if (db) {
        const findings = await db
          .select()
          .from(osintNexusFindings)
          .where(
            and(
              eq(osintNexusFindings.engagementId, engagementId),
              eq(osintNexusFindings.target, target),
              eq(osintNexusFindings.provider, node.provider),
            ),
          );

        node.findings = findings.length;
      }

      node.status = "completed";
      node.endTime = new Date();
    } catch (error) {
      node.status = "failed";
      node.error = error instanceof Error ? error.message : "Unknown error";
      node.endTime = new Date();
    }

    return node;
  }

  /**
   * Aggregate intelligence from all swarm nodes
   */
  private static async aggregateIntelligence(
    target: string,
    findings: any[],
    nodes: SwarmNode[],
  ): Promise<string> {
    if (findings.length === 0)
      return "No intelligence gathered by swarm nodes.";

    // Group findings by provider
    const providerData: Record<string, any[]> = {};
    findings.forEach((f) => {
      if (!providerData[f.provider]) providerData[f.provider] = [];
      providerData[f.provider].push(f);
    });

    // Build context for LLM
    const dataContext = Object.entries(providerData)
      .map(
        ([provider, data]) =>
          `[${provider}] ${data.length} findings: ${data.map((d) => d.data).join("; ")}`,
      )
      .join("\n");

    const nodeStats = nodes
      .map((n) => `${n.provider}: ${n.status} (${n.findings} findings)`)
      .join(", ");

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are the Swarm Intelligence Aggregator. Synthesize reconnaissance data from multiple parallel nodes into a concise, high-impact tactical intelligence summary. Identify critical vulnerabilities, technology stacks, and potential attack vectors. Focus on cross-node correlation and consensus findings.",
          },
          {
            role: "user",
            content: `Target: ${target}\nNode Execution: ${nodeStats}\nAggregated Data:\n${dataContext}`,
          },
        ],
      });

      const content = response.choices[0].message.content;
      return typeof content === "string" ? content : JSON.stringify(content);
    } catch (error) {
      return `Swarm aggregation completed. Total findings: ${findings.length} across ${Object.keys(providerData).length} providers.`;
    }
  }
}
