import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Nav from "@/components/ui/Nav";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "EchoChain",
  description: "Messages that travel",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen bg-black text-white font-sans">
        {/* 🌌 Subtle global background */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />

        {/* 🔝 Navigation */}
        <Nav />

        {/* 📦 App Content */}
        <div className="w-full max-w-xl mx-auto px-3 sm:px-4">{children}</div>
      </body>
    </html>
  );
}
