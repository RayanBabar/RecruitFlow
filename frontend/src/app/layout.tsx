import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "RecruitFlow — AI-Powered Recruitment Platform",
    template: "%s | RecruitFlow",
  },
  description:
    "RecruitFlow is an AI-powered recruitment platform that automates resume parsing, candidate scoring, and mock interviews to help you hire smarter and faster.",
  keywords: ["recruitment", "ATS", "AI hiring", "resume parsing", "mock interview", "job portal"],
  authors: [{ name: "RecruitFlow" }],
  creator: "RecruitFlow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://recruitflow.app",
    siteName: "RecruitFlow",
    title: "RecruitFlow — AI-Powered Recruitment Platform",
    description:
      "Automate resume parsing, candidate scoring, and mock interviews with AI.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
