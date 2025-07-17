import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { ThemeProvider } from "../components/provider";
import { ConvexClientProvider } from "@/components/convex-provider";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "EULAlyzer AI - Understand what you're signing",
  description:
    "AI-powered EULA analysis that explains legal risks in plain English. Get clear risk scores and understand software agreements before you agree.",
  openGraph: {
    title: "EULAlyzer AI",
    description:
      "AI-powered EULA analysis that explains legal risks in plain English. Get clear risk scores and understand software agreements before you agree.",
    url: "eulalyzer.ai",
    siteName: "EULAlyzer AI",
    locale: "en-US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-[-apple-system,BlinkMacSystemFont]antialiased`}>
        <ConvexClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            forcedTheme="light"
            disableTransitionOnChange
          >
            {children}
            <Toaster />
            <Analytics />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
