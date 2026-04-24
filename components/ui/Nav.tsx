"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/inbox", label: "Inbox", icon: "📥" },
    { href: "/dashboard", label: "Ripples", icon: "📊" },
    { href: "/leaderboard", label: "Top", icon: "🌍" },
  ];

  return (
    <>
      {/* HEADER */}
      <nav className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-md mx-auto py-3 text-center font-semibold tracking-tight">
          <span className="gradient-text">Ripple</span>Chain
        </div>
      </nav>

      {/* FOOTER */}
      <div className="fixed bottom-0 w-full z-50 bg-black/80 backdrop-blur-md border-t border-white/10">
        <div className="max-w-md mx-auto flex justify-around py-2">
          {items.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative flex flex-col items-center text-sm transition-all duration-200
                  ${
                    active
                      ? "active-tab text-white"
                      : "text-gray-500 hover:text-white"
                  }
                `}
              >
                {/* ICON */}
                <span
                  className={`
                    text-lg transition-transform duration-200
                    ${active ? "scale-110" : ""}
                  `}
                >
                  {item.icon}
                </span>

                {/* LABEL */}
                <span>{item.label}</span>

                {/* 🔵 ACTIVE DOT */}
                {active && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* spacing */}
      <div className="h-14" />
      <div className="h-16" />
    </>
  );
}
