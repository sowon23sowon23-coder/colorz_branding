import type { Metadata } from "next";
import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";

import { AppDataProvider } from "@/components/app-data-provider";
import { AppShell } from "@/components/app-shell";

import "./globals.css";

const bodyFont = Noto_Sans_KR({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "700"] });
const displayFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", weight: ["500", "700"] });

export const metadata: Metadata = {
  title: "Gathering CRM Dashboard",
  description: "Internal gathering CRM and event operations dashboard for a university marketing club.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}>
        <AppDataProvider>
          <AppShell>{children}</AppShell>
        </AppDataProvider>
      </body>
    </html>
  );
}
