"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Inbox, BarChart3, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils"; // If you don't have this shadcn helper, let me know

export default function Nav() {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Home", icon: Home },
    { href: "/inbox", label: "Inbox", icon: Inbox },
    { href: "/dashboard", label: "Ripples", icon: BarChart3 },
    { href: "/leaderboard", label: "Top", icon: Globe2 },
  ];

  return (
    <>
      {/* HEADER */}
      <nav className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-white/10">
        <div className="max-w-md mx-auto py-3 text-center font-semibold tracking-tight text-white">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Ripple
          </span>
          Chain
        </div>
      </nav>

      {/* FOOTER */}
      <div className="fixed bottom-0 w-full z-50 bg-black/80 backdrop-blur-md border-t border-white/10 pb-safe">
        <div className="max-w-md mx-auto flex justify-around py-3">
          {items.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon; // Capitalize to render as a component

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 transition-all duration-200 px-4",
                  active ? "text-white" : "text-gray-500 hover:text-gray-300",
                )}
              >
                {/* ICON COMPONENT */}
                <Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 2}
                  className={cn(
                    "transition-transform duration-200",
                    active ? "scale-110 text-cyan-400" : "",
                  )}
                />

                {/* ACTIVE DOT indicator */}
                {active && (
                  <span className="absolute -bottom-1 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Spacing to prevent content from hiding behind fixed bars */}
      <div className="h-14" />
      {/* <div className="pb-20" /> */}
    </>
  );
}
