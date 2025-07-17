# Database Schema

## `analysis` Collection
- `id`: string
- `eulaText`: string
- `summary`: string
- `riskScore`: number
- `riskReasons`: string[]
- `userId?`: string
- `createdAt`: number
- `updatedAt?`: number

## `users` Collection (via Clerk)
- `id`: string
- `email`: string
- `name?`: string
- `createdAt`: number

## `history` Collection (optional)
- `userId`: string
- `analysisId`: string
- `viewedAt`: number