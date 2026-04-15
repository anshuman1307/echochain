"use client";

import Link from "next/link";

export default function Nav() {
  return (
    <>
      {/* 🔝 TOP NAV (Desktop) */}
      <nav className="fixed top-0 left-0 w-full bg-black/60 backdrop-blur-md border-b border-white/10 z-50">
        <div className="max-w-xl mx-auto flex justify-between items-center px-3 sm:px-4 py-3 text-white">
          <span className="font-semibold text-base sm:text-lg tracking-tight">
            EchoChain
          </span>

          {/* Desktop links */}
          <div className="hidden sm:flex gap-5 text-sm text-gray-300">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <Link href="/inbox" className="hover:text-white transition">
              Inbox
            </Link>
            <Link href="/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/leaderboard" className="hover:text-white transition">
              Leaderboard
            </Link>
          </div>
        </div>
      </nav>

      {/* 📱 BOTTOM NAV (Mobile) */}
      <div className="sm:hidden fixed bottom-0 left-0 w-full bg-black/70 backdrop-blur-md border-t border-white/10 z-50">
        <div className="flex justify-around items-center py-2 text-xs text-gray-400">
          <Link
            href="/"
            className="flex flex-col items-center gap-1 hover:text-white"
          >
            <span>🏠</span>
            Home
          </Link>

          <Link
            href="/inbox"
            className="flex flex-col items-center gap-1 hover:text-white"
          >
            <span>📥</span>
            Inbox
          </Link>

          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 hover:text-white"
          >
            <span>📊</span>
            Stats
          </Link>

          <Link
            href="/leaderboard"
            className="flex flex-col items-center gap-1 hover:text-white"
          >
            <span>🌍</span>
            Top
          </Link>
        </div>
      </div>

      {/* 📏 SPACER (prevents content hiding behind navs) */}
      <div className="h-14 sm:h-16" />
      <div className="h-16 sm:hidden" />
    </>
  );
}
