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

// Enhanced fallback analysis using granular scoring framework
function generateFallbackAnalysis(eulaText: string) {
  const text = eulaText.toLowerCase();
  let riskScore = 0;
  const riskReasons: string[] = [];
  const riskDetails: string[] = [];

  // 1. TERMS MODIFICATION (25 points)
  if (text.includes('change') && text.includes('at any time') && text.includes('without notice')) {
    riskScore += 25;
    riskReasons.push('Terms can be changed at any time without user notice');
    riskDetails.push('Terms Modification: +25 points (immediate changes)');
  } else if (text.includes('change') && (text.includes('at any time') || text.includes('without notice'))) {
    riskScore += 20;
    riskReasons.push('Terms may be changed with limited or no advance notice');
    riskDetails.push('Terms Modification: +20 points (limited notice)');
  } else if (text.includes('modify') || text.includes('update') || text.includes('change')) {
    riskScore += 10;
    riskReasons.push('Terms may be modified with some notice provisions');
    riskDetails.push('Terms Modification: +10 points (reasonable notice)');
  }

  // 2. DATA PRIVACY & COLLECTION (25 points)
  const hasDataSharing = text.includes('third party') || text.includes('third-party') || text.includes('partners');
  const hasPersonalData = text.includes('personal') && text.includes('data');
  const hasTracking = text.includes('track') || text.includes('cookies') || text.includes('analytics');
  
  if (hasDataSharing && hasPersonalData && text.includes('share')) {
    riskScore += 25;
    riskReasons.push('Broad personal data sharing with third parties');
    riskDetails.push('Data Privacy: +25 points (extensive sharing)');
  } else if (hasDataSharing || (hasPersonalData && hasTracking)) {
    riskScore += 15;
    riskReasons.push('Data collection and potential third-party sharing');
    riskDetails.push('Data Privacy: +15 points (moderate concerns)');
  } else if (hasPersonalData || hasTracking) {
    riskScore += 5;
    riskReasons.push('Standard data collection practices');
    riskDetails.push('Data Privacy: +5 points (basic collection)');
  }

  // 3. LIABILITY & WARRANTIES (20 points)
  if ((text.includes('not liable') || text.includes('no liability')) && text.includes('damages')) {
    riskScore += 20;
    riskReasons.push('Company disclaims liability for all damages');
    riskDetails.push('Liability: +20 points (complete disclaimer)');
  } else if (text.includes('limit') && text.includes('liability')) {
    riskScore += 10;
    riskReasons.push('Company limits liability for certain damages');
    riskDetails.push('Liability: +10 points (limited protection)');
  } else if (text.includes('as is') || text.includes('without warranties')) {
    riskScore += 15;
    riskReasons.push('Service provided "as is" without warranties');
    riskDetails.push('Liability: +15 points (warranty disclaimer)');
  }

  // 4. DISPUTE RESOLUTION (15 points)
  if (text.includes('arbitration') && text.includes('binding')) {
    if (text.includes('class action') && text.includes('waive')) {
      riskScore += 15;
      riskReasons.push('Mandatory arbitration with class action waiver');
      riskDetails.push('Disputes: +15 points (forced arbitration)');
    } else {
      riskScore += 10;
      riskReasons.push('Binding arbitration required for disputes');
      riskDetails.push('Disputes: +10 points (arbitration only)');
    }
  }

  // 5. TERMINATION & ACCESS (10 points)
  if (text.includes('terminate') && (text.includes('at any time') || text.includes('without cause'))) {
    riskScore += 10;
    riskReasons.push('Service can be terminated immediately without cause');
    riskDetails.push('Termination: +10 points (immediate termination)');
  } else if (text.includes('terminate') && text.includes('notice')) {
    riskScore += 3;
    riskReasons.push('Termination allowed with advance notice');
    riskDetails.push('Termination: +3 points (notice required)');
  }

  // 6. CONTENT & IP RIGHTS (5 points)
  if (text.includes('perpetual') && text.includes('license')) {
    riskScore += 5;
    riskReasons.push('Grants perpetual license to user-generated content');
    riskDetails.push('Content Rights: +5 points (perpetual license)');
  } else if (text.includes('license') && text.includes('content')) {
    riskScore += 1;
    riskReasons.push('Limited license granted for user content');
    riskDetails.push('Content Rights: +1 point (basic license)');
  }

  // Ensure minimum analysis if no major risks found
  if (riskReasons.length === 0) {
    riskScore = 25;
    riskReasons.push('Standard commercial software terms apply');
    riskReasons.push('Review recommended for business use cases');
    riskDetails.push('Baseline: +25 points (standard terms)');
  }

  // Cap risk score and determine summary
  riskScore = Math.min(riskScore, 100);

  let summary: string;
  if (riskScore >= 86) {
    summary = "This EULA contains extremely unfavorable terms that pose significant risks to users. Strongly recommend legal review before accepting.";
  } else if (riskScore >= 71) {
    summary = "This EULA heavily favors the company with multiple high-risk clauses. Careful consideration and legal review recommended.";
  } else if (riskScore >= 51) {
    summary = "This EULA contains several concerning terms that may impact user rights. Review key sections before accepting.";
  } else if (riskScore >= 36) {
    summary = "This EULA has some notable clauses but appears within reasonable industry standards. Minor concerns identified.";
  } else if (riskScore >= 21) {
    summary = "This EULA shows good balance between company and user interests with only minor risk factors.";
  } else {
    summary = "This EULA demonstrates excellent user protections with minimal risk factors identified.";
  }

  // Add risk scoring breakdown to reasons if detailed
  if (riskDetails.length > 2) {
    riskReasons.push(`Risk Score Breakdown: ${riskScore}/100 based on ${riskDetails.length} factors`);
  }

  return {
    summary,
    riskScore,
    riskReasons,
    analysisId: `enhanced_fallback_${Date.now()}`
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
        prompt: `You are an expert legal AI specializing in software End User License Agreements (EULAs). Perform a comprehensive risk assessment using the framework below.

IMPORTANT: You must respond with valid JSON that matches the schema exactly:
- summary: A 2-3 sentence summary in plain English
- riskScore: A precise number between 1-100 based on detailed analysis
- riskReasons: An array of 3-7 specific, actionable reason strings

## GRANULAR RISK SCORING FRAMEWORK (Total: 100 points):

### 1. TERMS MODIFICATION (25 points):
- Can change "at any time" without notice: +25 points
- Can change with limited notice (< 30 days): +20 points  
- Can change with reasonable notice (30+ days): +10 points
- Cannot change without user consent: +0 points

### 2. DATA PRIVACY & COLLECTION (25 points):
- Broad data sharing with unlimited third parties: +25 points
- Data sharing with "partners" or vague terms: +20 points
- Data used for advertising/marketing without opt-out: +15 points
- Minimal data collection with clear purposes: +5 points
- Strong privacy protections with user control: +0 points

### 3. LIABILITY & WARRANTIES (20 points):
- Complete disclaimer of all liability: +20 points
- Disclaimer of consequential/incidental damages: +15 points
- Limited liability caps below reasonable amounts: +10 points
- Some liability protections maintained: +5 points
- Strong liability protections for users: +0 points

### 4. DISPUTE RESOLUTION (15 points):
- Mandatory binding arbitration, no class action: +15 points
- Arbitration with some user protections: +10 points
- Choice of arbitration or courts: +5 points
- Standard court jurisdiction: +0 points

### 5. TERMINATION & ACCESS (10 points):
- Immediate termination without cause/notice: +10 points
- Termination with limited notice: +7 points
- Fair termination with reasonable notice: +3 points
- Strong user protections on termination: +0 points

### 6. CONTENT & IP RIGHTS (5 points):
- Perpetual, irrevocable license to user content: +5 points
- Broad license with commercial rights: +3 points
- Limited license for service provision only: +1 point
- User retains full control of content: +0 points

## RISK LEVELS:
- 1-20: VERY LOW - Excellent user protections
- 21-35: LOW - Good balance, minor concerns
- 36-50: MODERATE - Some concerning clauses
- 51-70: HIGH - Multiple unfavorable terms
- 71-85: VERY HIGH - Heavily favors company
- 86-100: EXTREME - Dangerous for users

## ANALYSIS REQUIREMENTS:
1. Calculate precise risk score using the framework above
2. Identify specific clause types and their point contributions
3. Provide actionable insights about key risks
4. Consider cumulative effect of multiple concerning clauses
5. Note any particularly unusual or aggressive terms

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