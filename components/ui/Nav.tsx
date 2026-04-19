"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/inbox", label: "Inbox", icon: "📥" },
    { href: "/dashboard", label: "Echoes", icon: "📊" },
    { href: "/leaderboard", label: "Top", icon: "🌍" },
  ];

  return (
    <>
      {/* 🔝 HEADER */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-md mx-auto flex items-center justify-center py-3 text-white font-semibold tracking-tight">
          EchoChain
        </div>
      </nav>

      {/* 📱 FOOTER */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-t border-white/10">
        <div className="max-w-md mx-auto flex justify-around py-2">
          {items.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center text-xs transition-all ${
                  active
                    ? "text-white scale-110"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* SPACING */}
      <div className="h-14" />
      <div className="h-16" />
    </>
  );
}
