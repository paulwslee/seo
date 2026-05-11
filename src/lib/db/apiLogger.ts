import { db } from "./index";
import { apiUsageLogs } from "./schema";

interface LogApiUsageParams {
  userId?: string | null;
  serviceName: string;
  modelName?: string | null;
  promptType: string;
  durationMs: number;
  promptTokens?: number;
  completionTokens?: number;
  estimatedCost?: number;
}

/**
 * AppFactorys Standard: Logs API usage (especially LLM calls) to the central database.
 * This function should be called after a successful (or failed but charged) API request.
 */
export async function logApiUsage(params: LogApiUsageParams) {
  try {
    let calculatedCost = params.estimatedCost || 0;

    // If cost not explicitly provided, calculate it based on tokens
    if (calculatedCost === 0 && params.promptTokens && params.completionTokens && params.modelName) {
      const pTokens = params.promptTokens;
      const cTokens = params.completionTokens;
      const model = params.modelName.toLowerCase();
      
      // Calculate exactly based on model (per 1M tokens)
      if (model.includes("gemini-2.5-flash")) {
        calculatedCost = (pTokens / 1000000) * 0.075 + (cTokens / 1000000) * 0.30;
      } else if (model.includes("gemini-1.5-pro")) {
        calculatedCost = (pTokens / 1000000) * 1.25 + (cTokens / 1000000) * 5.00;
      } else if (model.includes("gpt-4o-mini")) {
        calculatedCost = (pTokens / 1000000) * 0.15 + (cTokens / 1000000) * 0.60;
      } else {
        // Generic fallback
        calculatedCost = (pTokens / 1000000) * 0.10 + (cTokens / 1000000) * 0.50;
      }
    }

    await db.insert(apiUsageLogs).values({
      userId: params.userId || null,
      serviceName: params.serviceName,
      modelName: params.modelName || null,
      promptType: params.promptType,
      promptTokens: params.promptTokens || 0,
      completionTokens: params.completionTokens || 0,
      durationMs: params.durationMs,
      // Store cost in ten-thousandths of a cent if integer, or float if we change the schema. 
      // Wait, schema for estimatedCost is INTEGER.
      // So we should multiply by 1,000,000 to store micro-dollars, or just store it as is if it's supposed to be cents?
      // Let's store micro-dollars (1,000,000 microdollars = $1)
      estimatedCost: Math.round(calculatedCost * 1000000), 
    });
    console.log(`[API Logger] Logged usage for ${params.serviceName}:${params.promptType} (${params.modelName}) - ${params.durationMs}ms`);
  } catch (error) {
    // We don't want the logger failing to crash the main user request
    console.error("[API Logger] Failed to log API usage:", error);
  }
}
