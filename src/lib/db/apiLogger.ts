import { db } from "./index";
import { apiUsageLogs } from "./schema";

interface LogApiUsageParams {
  userId?: string | null;
  serviceName: string;
  modelName?: string | null;
  promptType: string;
  durationMs: number;
  estimatedCost?: number;
}

/**
 * AppFactorys Standard: Logs API usage (especially LLM calls) to the central database.
 * This function should be called after a successful (or failed but charged) API request.
 */
export async function logApiUsage(params: LogApiUsageParams) {
  try {
    await db.insert(apiUsageLogs).values({
      userId: params.userId || null,
      serviceName: params.serviceName,
      modelName: params.modelName || null,
      promptType: params.promptType,
      durationMs: params.durationMs,
      estimatedCost: params.estimatedCost || 0,
    });
    console.log(`[API Logger] Logged usage for ${params.serviceName}:${params.promptType} (${params.modelName}) - ${params.durationMs}ms`);
  } catch (error) {
    // We don't want the logger failing to crash the main user request
    console.error("[API Logger] Failed to log API usage:", error);
  }
}
