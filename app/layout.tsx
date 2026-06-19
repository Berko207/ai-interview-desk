import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-interview-desk.vercel.app"),
  title: "AI Interview Desk | Mock Interview Coach for AI Contract Platforms",
  description: "Claude-powered mock interviews, profile optimizer, and pipeline tracker for Mercor, Outlier, Mindrift, Alignerr and similar AI engineering contract roles. Built as a study tool and portfolio piece.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ink text-text">
        {children}
      </body>
    </html>
  );
}
