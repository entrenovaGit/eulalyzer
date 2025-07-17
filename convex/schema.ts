import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Analysis collection for storing EULA analysis results
  analysis: defineTable({
    eulaText: v.string(),
    summary: v.string(),
    riskScore: v.number(),
    riskReasons: v.array(v.string()),
    userId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),

  // Users collection (basic user data)
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // History collection for tracking user analysis views
  history: defineTable({
    userId: v.string(),
    analysisId: v.id("analysis"),
    viewedAt: v.number(),
  }).index("by_user", ["userId"]).index("by_analysis", ["analysisId"]),
});