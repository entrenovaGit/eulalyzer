import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { db } from "@/db/drizzle";
import { analysis } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface EulaAnalysisRequest {
  eulaText: string;
  userId?: string;
}

interface EulaAnalysisResponse {
  summary: string;
  riskScore: number;
  riskReasons: string[];
  analysisId: string;
}

export async function POST(req: Request) {
  try {
    const { eulaText }: EulaAnalysisRequest = await req.json();
    
    if (!eulaText || eulaText.trim().length === 0) {
      return Response.json({ error: "EULA text is required" }, { status: 400 });
    }

    // Rate limiting check would go here
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    
    const systemPrompt = `You are an AI legal assistant. Your task is to read software End User License Agreements (EULAs), explain the risks in plain English, and assign a risk score between 1 (low) and 100 (high). Be conservative and highlight clauses that involve data rights, commercial reuse limits, liability, and embedded third-party services.

Return your response in the following JSON format:
{
  "summary": "Brief summary of legal risks in plain English",
  "riskScore": 75,
  "riskReasons": ["Reason 1", "Reason 2", "Reason 3"]
}`;

    const userPrompt = `Please analyze the following EULA and return:
- A brief summary of any legal or usage risks (in plain English)
- A numeric risk score between 1 and 100
- 3 to 5 specific reasons for the assigned score

EULA Content:
${eulaText}`;

    const result = await generateText({
      model: openai("gpt-4o"),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      maxTokens: 800,
    });

    // Parse AI response
    let summary = result.text;
    let riskScore = 50;
    let riskReasons: string[] = [];

    try {
      const jsonMatch = summary.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        summary = parsed.summary;
        riskScore = Math.min(100, Math.max(1, parsed.riskScore));
        riskReasons = parsed.riskReasons || [];
      }
    } catch {
      // Fallback parsing if JSON format fails
      const scoreMatch = summary.match(/risk score (is|of)?\s?(\d{1,3})/i);
      if (scoreMatch) {
        riskScore = Math.min(100, Math.max(1, parseInt(scoreMatch[2])));
      }
    }

    // Save analysis to database
    const [savedAnalysis] = await db.insert(analysis).values({
      eulaText,
      summary,
      riskScore,
      riskReasons,
      userId: session?.user?.id || null,
      createdAt: Date.now(),
    }).returning();

    const response: EulaAnalysisResponse = {
      summary,
      riskScore,
      riskReasons,
      analysisId: savedAnalysis.id,
    };

    return Response.json(response);

  } catch (error) {
    console.error("EULA analysis error:", error);
    return Response.json(
      { error: "Failed to analyze EULA. Please try again." },
      { status: 500 }
    );
  }
}
