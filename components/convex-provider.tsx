"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

// Use dummy URL for build time if CONVEX_URL is not set
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://dummy.convex.cloud';
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}