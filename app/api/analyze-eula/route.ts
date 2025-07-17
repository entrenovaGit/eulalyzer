import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

interface EulaAnalysisRequest {
  eulaText: string;
}

const EulaAnalysisSchema = z.object({
  summary: z.string().describe('Brief summary of legal risks in plain English (2-3 sentences)'),
  riskScore: z.number().min(1).max(100).describe('Risk score from 1-100 (1=minimal risk, 100=high risk)'),
  riskReasons: z.array(z.string()).describe('Specific reasons for the risk score')
});

// Fallback analysis function for when AI fails
function generateFallbackAnalysis(eulaText: string) {
  const text = eulaText.toLowerCase();
  let riskScore = 30; // Start with medium-low risk
  const riskReasons: string[] = [];

  // High risk patterns
  if (text.includes('change') && (text.includes('at any time') || text.includes('without notice'))) {
    riskScore += 25;
    riskReasons.push('Terms can be changed unilaterally without proper notice');
  }

  if (text.includes('not liable') || text.includes('no liability')) {
    riskScore += 20;
    riskReasons.push('Company disclaims liability for damages');
  }

  if (text.includes('arbitration') && text.includes('binding')) {
    riskScore += 15;
    riskReasons.push('Mandatory binding arbitration required for disputes');
  }

  if (text.includes('data') && (text.includes('share') || text.includes('third party'))) {
    riskScore += 15;
    riskReasons.push('User data may be shared with third parties');
  }

  if (text.includes('perpetual') && text.includes('license')) {
    riskScore += 20;
    riskReasons.push('Grants perpetual license to user content');
  }

  // Ensure minimum reasons
  if (riskReasons.length === 0) {
    riskReasons.push('Standard terms and conditions apply');
    riskReasons.push('Review recommended for specific use case');
  }

  // Cap risk score
  riskScore = Math.min(riskScore, 100);

  const summary = riskScore > 70 
    ? "This EULA contains several high-risk clauses that heavily favor the company. Careful review is strongly recommended before accepting."
    : riskScore > 40 
    ? "This EULA has some concerning clauses but appears to be within typical industry standards. Review key sections carefully."
    : "This EULA appears to have relatively standard terms with acceptable risk levels for most users.";

  return {
    summary,
    riskScore,
    riskReasons,
    analysisId: `fallback_${Date.now()}`
  };
}

export async function POST(req: Request) {
  try {
    const { eulaText }: EulaAnalysisRequest = await req.json();
    
    if (!eulaText || eulaText.trim().length === 0) {
      return Response.json({ error: "EULA text is required" }, { status: 400 });
    }

    if (eulaText.length > 50000) {
      return Response.json({ error: "EULA text is too long (max 50,000 characters)" }, { status: 400 });
    }

    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      // Fallback to mock response if no API key
      const mockAnalysis = {
        summary: "This EULA contains several concerning clauses including broad data collection rights and limited liability protections for users. The agreement grants the company extensive permissions while providing minimal recourse for users.",
        riskScore: 75,
        riskReasons: [
          "Broad data collection and sharing permissions",
          "Limited liability protections for the company", 
          "Vague termination clauses that favor the provider"
        ],
        analysisId: `mock_${Date.now()}`
      };
      return Response.json(mockAnalysis);
    }

    // Generate AI analysis using OpenAI with expert knowledge
    try {
      const { object: analysis } = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: EulaAnalysisSchema,
        prompt: `You are an AI legal assistant specializing in software End User License Agreements (EULAs). Analyze the EULA and provide exactly what is requested in the schema format.

IMPORTANT: You must respond with valid JSON that matches the schema exactly:
- summary: A 2-3 sentence summary in plain English
- riskScore: A number between 1-100 
- riskReasons: An array of 3-5 specific reason strings

## RISK SCORING GUIDELINES:

HIGH RISK (90-100): Dangerous clauses like unilateral changes, broad data sharing, no liability protection
MEDIUM RISK (40-75): Concerning but manageable clauses with some protections
LOW RISK (1-39): Good practices with user protections

## ANALYSIS FRAMEWORK:
1. Change Management: How can terms be modified?
2. Data Rights: What data is collected and used?
3. Liability: Who bears risk for damages?
4. Dispute Resolution: Courts vs. arbitration
5. Termination: Notice and data access

EULA Content:
${eulaText.slice(0, 4000)}`, // Limit text to avoid token limits
      });

      const response = {
        ...analysis,
        analysisId: `ai_${Date.now()}`
      };

      return Response.json(response);
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      
      // Fallback to deterministic analysis based on text patterns
      const fallbackAnalysis = generateFallbackAnalysis(eulaText);
      return Response.json(fallbackAnalysis);
    }

  } catch (error) {
    console.error("EULA analysis error:", error);
    return Response.json(
      { error: "Failed to analyze EULA. Please try again." },
      { status: 500 }
    );
  }
}