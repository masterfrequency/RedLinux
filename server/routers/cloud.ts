import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb, getEngagementById } from "../db";
import { operatorSessionLogs } from "../../drizzle/schema";
import axios from "axios";

export const cloudRouter = router({
  scanBuckets: protectedProcedure
    .input(
      z.object({
        engagementId: z.number(),
        domain: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database offline.");

      const engagement = await getEngagementById(input.engagementId);
      if (!engagement || engagement.userId !== ctx.user.id) {
        throw new Error("Engagement not found or access denied");
      }

      // Real S3 bucket probing: attempt to identify publicly accessible buckets
      const potentialBuckets = [
        `${input.domain}-public`,
        `${input.domain}-backup`,
        `${input.domain}-data`,
        `${input.domain}-dev`,
        `${input.domain}-prod`,
        `${input.domain}-assets`,
        `s3-${input.domain}`,
        `bucket-${input.domain}`,
        `data-${input.domain}-prod`,
        `archive-${input.domain}`,
        input.domain,
        `${input.domain.split(".")[0]}-s3`,
      ];
      const foundBuckets: string[] = [];
      const vulnerabilities: string[] = [];

      // Real HTTP-based bucket enumeration
      for (const bucketName of potentialBuckets) {
        try {
          // Attempt to access the bucket via S3 HTTP endpoint
          const response = await axios.head(
            `https://${bucketName}.s3.amazonaws.com/`,
            {
              timeout: 5000,
              validateStatus: () => true, // Accept all status codes
            },
          );

          const statusCode = response.status;

          // 200: Bucket exists and is publicly readable
          if (statusCode === 200) {
            foundBuckets.push(bucketName);
            vulnerabilities.push(
              `${bucketName} - PUBLIC READ ACCESS (HTTP 200)`,
            );
          }
          // 403: Bucket exists but is not publicly accessible
          else if (statusCode === 403) {
            foundBuckets.push(bucketName);
            vulnerabilities.push(
              `${bucketName} - Bucket exists but restricted (HTTP 403)`,
            );
          }
          // 404: Bucket does not exist
          // Other codes: Redirect, error, etc.
        } catch (error) {
          // Network error, timeout, or DNS resolution failure
          // Continue to next bucket
        }
      }

      // Log the action with real vulnerability findings
      const details = {
        domain: input.domain,
        found: foundBuckets,
        vulnerabilities,
        scanTimestamp: new Date().toISOString(),
      };

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "cloud",
        action: "bucket_scan",
        details: JSON.stringify(details),
        status: "success",
      } as any);

      return { success: true, buckets: foundBuckets, vulnerabilities };
    }),

  checkBucketAccess: protectedProcedure
    .input(
      z.object({
        engagementId: z.number(),
        bucketName: z.string().min(1).max(255),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const engagement = await getEngagementById(input.engagementId);
      if (!engagement || engagement.userId !== ctx.user.id) {
        throw new Error("Engagement not found or access denied");
      }

      const db = await getDb();
      if (!db) throw new Error("Database offline.");

      const accessLevels = {
        public: false,
        restricted: false,
        exists: false,
      };
      let statusCode = 0;

      try {
        const response = await axios.head(
          `https://${input.bucketName}.s3.amazonaws.com/`,
          {
            timeout: 5000,
            validateStatus: () => true,
          },
        );

        statusCode = response.status;
        accessLevels.exists = true;
        if (statusCode === 200) accessLevels.public = true;
        if (statusCode === 403) accessLevels.restricted = true;
      } catch (error) {
        // Bucket not found or network error
      }

      await db.insert(operatorSessionLogs).values({
        engagementId: input.engagementId,
        userId: ctx.user.id,
        module: "cloud",
        action: "check_bucket_access",
        details: JSON.stringify({
          bucketName: input.bucketName,
          statusCode,
          accessLevels,
        }),
        status: "success",
      } as any);

      return { bucketName: input.bucketName, statusCode, accessLevels };
    }),
});
