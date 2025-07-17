import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Mutation to analyze EULA and save results
export const analyzeEula = mutation({
  args: { 
    eulaText: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const systemPrompt = `You are an AI legal assistant specializing in software End User License Agreements (EULAs). Your task is to analyze EULAs and provide:

1. A clear summary of legal risks in plain English for non-lawyers
2. A risk score from 1-100 (1=minimal risk, 100=high risk)
3. Specific reasons for the risk score

Focus on these key areas:
- Data collection and privacy rights
- Commercial use restrictions
- Liability limitations
- Third-party integrations
- Termination clauses
- Intellectual property rights

Be conservative in your assessment and highlight concerning clauses. Return your response as valid JSON only.`;

    const userPrompt = `Analyze this EULA and respond with valid JSON in this exact format:
{
  "summary": "Brief summary of legal risks in plain English (2-3 sentences)",
  "riskScore": 75,
  "riskReasons": ["Specific reason 1", "Specific reason 2", "Specific reason 3"]
}

EULA Content:
${args.eulaText}`;

    try {
      // In a real implementation, you would call OpenAI API here
      // For now, let's create a mock response
      const mockAnalysis = {
        summary: "This EULA contains several concerning clauses including broad data collection rights and limited liability protections for users. The agreement grants the company extensive permissions while providing minimal recourse for users.",
        riskScore: 75,
        riskReasons: [
          "Broad data collection and sharing permissions",
          "Limited liability protections for the company",
          "Vague termination clauses that favor the provider"
        ]
      };

      // Save analysis to database
      const analysisId = await ctx.db.insert("analysis", {
        eulaText: args.eulaText,
        summary: mockAnalysis.summary,
        riskScore: mockAnalysis.riskScore,
        riskReasons: mockAnalysis.riskReasons,
        userId: args.userId,
        createdAt: Date.now(),
      });

      return {
        ...mockAnalysis,
        analysisId,
      };
    } catch (error) {
      console.error("Error analyzing EULA:", error);
      throw new Error("Failed to analyze EULA");
    }
  },
});

// Query to get analysis by ID
export const getAnalysisById = query({
  args: { id: v.id("analysis") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Query to get user's analysis history
export const getHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("analysis")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();
  },
});

// Mutation to delete an analysis
export const deleteAnalysis = mutation({
  args: { id: v.id("analysis") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});