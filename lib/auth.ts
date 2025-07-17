import { db } from "@/db/drizzle";
import { account, session, subscription, user, verification } from "@/db/schema";
import {
  checkout,
  polar,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

// Utility function to safely parse dates (for future use)
// function safeParseDate(value: string | Date | null | undefined): Date | null {
//   if (!value) return null;
//   if (value instanceof Date) return value;
//   return new Date(value);
// }

// Create a simplified auth configuration for development
const isProd = process.env.NODE_ENV === 'production';
const hasRequiredEnvVars = !!(
  process.env.DATABASE_URL &&
  process.env.BETTER_AUTH_SECRET &&
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET
);

export const auth = betterAuth({
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  allowedDevOrigins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  secret: process.env.BETTER_AUTH_SECRET || 'dummy-secret-for-build',
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60, // Cache duration in seconds
  },
  database: hasRequiredEnvVars ? drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
      subscription,
    },
  }) : undefined,
  socialProviders: hasRequiredEnvVars ? {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  } : {},
  plugins: [
    nextCookies(),
    // Only add Polar plugins if environment variables are available
    ...(isProd && hasRequiredEnvVars && process.env.POLAR_ACCESS_TOKEN ? [
      polar({
        client: new Polar({
          accessToken: process.env.POLAR_ACCESS_TOKEN,
          server: "sandbox",
        }),
        createCustomerOnSignUp: true,
        use: [
          checkout({
            products: [
              {
                productId: process.env.NEXT_PUBLIC_STARTER_TIER!,
                slug: process.env.NEXT_PUBLIC_STARTER_SLUG!,
              },
            ],
            successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${process.env.POLAR_SUCCESS_URL}`,
            authenticatedUsersOnly: true,
          }),
          portal(),
          usage(),
          webhooks({
            secret: process.env.POLAR_WEBHOOK_SECRET!,
            onPayload: async ({ data, type }) => {
              // Webhook handler implementation here
              console.log('Webhook received:', type, data);
            },
          }),
        ],
      })
    ] : []),
  ],
});
