# AI Agent Integration – EULAlyzer POC

## 🤖 Purpose
Use Azure OpenAI to analyze EULAs and return:
- Summary of risks (plain English)
- A numeric risk score (1–100)
- Key reasons for the score

---

## 🧠 System Prompt

```
You are an AI legal assistant. Your task is to read software End User License Agreements (EULAs), explain the risks in plain English, and assign a risk score between 1 (low) and 100 (high). Be conservative and highlight clauses that involve data rights, commercial reuse limits, liability, and embedded third-party services.
```

---

## 🗣️ User Prompt Template

```
Please analyze the following EULA and return:
- A brief summary of any legal or usage risks (in plain English)
- A numeric risk score between 1 and 100
- 3 to 5 reasons for the assigned score

EULA Content:
[... user-pasted EULA ...]
```

---

## 🛠️ Convex Mutation: analyzeEula.ts

```ts
import { mutation } from './_generated/server';
import { v } from 'convex/values';

export const analyzeEula = mutation({
  args: { eulaText: v.string() },
  handler: async (ctx, args) => {
    const systemPrompt = `You are an AI legal assistant...`;
    const userPrompt = `Please analyze the following EULA...\n\n${args.eulaText}`;

    const response = await fetch('https://YOUR_AZURE_OPENAI_ENDPOINT/openai/deployments/YOUR_DEPLOYMENT/chat/completions?api-version=2024-02-15-preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.AZURE_OPENAI_KEY,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    const result = await response.json();
    const aiText = result.choices[0]?.message?.content || '';
    const scoreMatch = aiText.match(/risk score (is|of)?\s?(\d{1,3})/i);
    const riskScore = scoreMatch ? parseInt(scoreMatch[2]) : 50;

    await ctx.db.insert('analysis', {
      eulaText: args.eulaText,
      summary: aiText,
      riskScore,
      createdAt: Date.now()
    });

    return { summary: aiText, riskScore };
  }
});
```

---

## 📦 Env Vars

Add to Convex project settings:

```
AZURE_OPENAI_KEY=your-azure-key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com
```