import { getDb } from "../db";
import { osintNexusFindings, nexusExploitFindings } from "../../drizzle/schema";
import { invokeLLM } from "./llm";
import { eq } from "drizzle-orm";

export class ThreatMapper {
  static async generateHeatMap(engagementId: number) {
    const db = await getDb();
    if (!db) throw new Error("Threat Mapper: Database offline.");

    const osintFindings = await db
      .select()
      .from(osintNexusFindings)
      .where(eq(osintNexusFindings.engagementId, engagementId));

    const exploitFindings = await db
      .select()
      .from(nexusExploitFindings)
      .where(eq(nexusExploitFindings.engagementId, engagementId));

    if (osintFindings.length === 0 && exploitFindings.length === 0) {
      return {
        summary: "No data available to map threat surface.",
        vectors: [],
      };
    }

    const context = {
      osint: osintFindings.map((f) => ({
        target: f.target,
        provider: f.provider,
        data: f.data,
      })),
      exploits: exploitFindings.map((f) => ({
        vulnerability: f.vulnerabilityName,
        severity: f.severity,
        cve: f.cveId,
      })),
    };

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are the RedLinux Strategic Analyst. Analyze the provided reconnaissance and vulnerability data to generate a tactical 'Heat Map'. Identify the most critical targets, prioritize them by exploitability, and suggest specific tactical vectors for the operator. Output in JSON format with 'summary', 'criticality_score', and 'tactical_vectors' array.",
        },
        {
          role: "user",
          content: `Engagement ID: ${engagementId}\nData Context:\n${JSON.stringify(context)}`,
        },
      ],
      responseFormat: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    return content
      ? JSON.parse(content)
      : { error: "Failed to generate heat map" };
  }
}
