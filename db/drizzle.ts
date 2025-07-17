import { config } from "dotenv";
import { drizzle } from 'drizzle-orm/neon-http';

config({ path: ".env" }); // or .env.local

// Use a dummy URL for build time if DATABASE_URL is not set
const dbUrl = process.env.DATABASE_URL || 'postgres://dummy:dummy@localhost:5432/dummy';
export const db = drizzle(dbUrl);
