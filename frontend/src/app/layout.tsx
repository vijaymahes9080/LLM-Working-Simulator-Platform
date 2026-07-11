import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "LLM INSIDE — Interactive LLM Working Simulator",
  description: "Type custom text and visually explore every execution stage of a Large Language Model (LLM) in real-time.",
  openGraph: {
    title: "LLM INSIDE — Interactive LLM Working Simulator",
    description: "Type custom text and visually explore every execution stage of a Large Language Model (LLM) in real-time.",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-[#06060c] text-slate-100 antialiased relative">
        {/* Animated Aurora Glow effects */}
        <div className="aurora-bg">
          <div className="aurora-glow-1"></div>
          <div className="aurora-glow-2"></div>
        </div>
        
        {/* Overlay grid lines */}
        <div className="fixed inset-0 grid-bg opacity-30 pointer-events-none z-[-9]"></div>
        
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
