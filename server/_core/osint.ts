import axios from "axios";
import { ENV } from "./env";
import { getDb } from "../db";
import { osintNexusFindings } from "../../drizzle/schema";

export interface OSINTResult {
  provider: string;
  target: string;
  type: string;
  data: any;
  raw: any;
}

export class OSINTNexus {
  private static async queryShodan(
    target: string,
  ): Promise<OSINTResult | null> {
    if (!ENV.shodanApiKey) return null;
    try {
      const response = await axios.get(
        `https://api.shodan.io/shodan/host/${target}?key=${ENV.shodanApiKey}`,
      );
      return {
        provider: "shodan",
        target,
        type: "host_info",
        data: {
          ip: response.data.ip_str,
          org: response.data.org,
          ports: response.data.ports,
          os: response.data.os,
          vulns: response.data.vulns || [],
        },
        raw: response.data,
      };
    } catch (error) {
      console.error("Shodan query failed:", error);
      return null;
    }
  }

  private static async queryGreyNoise(
    target: string,
  ): Promise<OSINTResult | null> {
    if (!ENV.greyNoiseApiKey) return null;
    try {
      const response = await axios.get(
        `https://api.greynoise.io/v3/community/${target}`,
        {
          headers: { key: ENV.greyNoiseApiKey },
        },
      );
      return {
        provider: "greynoise",
        target,
        type: "noise_info",
        data: {
          noise: response.data.noise,
          riot: response.data.riot,
          classification: response.data.classification,
          name: response.data.name,
        },
        raw: response.data,
      };
    } catch (error) {
      console.error("GreyNoise query failed:", error);
      return null;
    }
  }

  private static async queryCensys(
    target: string,
  ): Promise<OSINTResult | null> {
    if (!ENV.censysId || !ENV.censysSecret) return null;
    try {
      const auth = Buffer.from(`${ENV.censysId}:${ENV.censysSecret}`).toString(
        "base64",
      );
      const response = await axios.get(
        `https://search.censys.io/api/v2/hosts/${target}`,
        {
          headers: { Authorization: `Basic ${auth}` },
        },
      );
      return {
        provider: "censys",
        target,
        type: "host_info",
        data: {
          services: response.data.result.services.map((s: any) => ({
            port: s.port,
            service: s.service_name,
          })),
          location: response.data.result.location,
        },
        raw: response.data,
      };
    } catch (error) {
      console.error("Censys query failed:", error);
      return null;
    }
  }

  static async runNexusScan(engagementId: number, target: string) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const providers = [
      this.queryShodan(target),
      this.queryGreyNoise(target),
      this.queryCensys(target),
    ];

    const results = await Promise.allSettled(providers);

    for (const result of results) {
      if (result.status === "fulfilled" && result.value) {
        const finding = result.value;
        await db.insert(osintNexusFindings).values({
          engagementId,
          provider: finding.provider,
          target: finding.target,
          findingType: finding.type,
          data: JSON.stringify(finding.data),
          rawResponse: JSON.stringify(finding.raw),
        });
      }
    }
  }
}
