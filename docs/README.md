# EULAlyzer AI

Analyze EULAs using AI to extract legal risk, assign a 1–100 score, and explain problem clauses in plain English.

## ✨ Features

- Paste or upload a `.txt`, `.pdf`, or `.docx` EULA
- AI-generated risk summary and score
- Save results with optional login
- Download PDF reports
- Anonymous usage or Clerk-authenticated history

## 🧠 Tech Stack

- Next.js 14
- Convex (DB + backend)
- Clerk (authentication)
- Tailwind + shadcn/ui (UI)
- Zustand + React Query (state)
- PDF parsing: `pdf-parse`, `mammoth`
- PDF generation: `jspdf`

## 🚀 Getting Started

```bash
git clone https://github.com/your-org/eulalyzer-ai.git
cd eulalyzer-ai
pnpm install
cp .env.example .env.local
pnpm dev
```

## 🛠 Environment Variables

- `CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CONVEX_DEPLOY_KEY`

## 📦 Scripts

- `pnpm dev` – start dev server
- `pnpm build` – build for prod
- `pnpm lint` – lint code

## 🧪 Testing

- `vitest` for unit tests
- `playwright` for E2E

## 🧭 Project Structure

- `/app` – routes & pages
- `/components` – UI components
- `/convex` – backend logic
- `/lib` – utils & helpers

---

© 2025 EULAlyzer AI
