# Backend Documentation

## Backend Stack
- Convex (serverless functions + DB)
- TypeScript
- No external API — internal Convex functions only

## Key Functions
- analyzeEula
- saveAnalysis
- getHistory
- getAnalysisById
- deleteAnalysis

## Authentication
- Clerk (optional login)

## Rate Limiting
- Anonymous: 3/min
- Logged-in: 10/min

## Real-time
- Not required