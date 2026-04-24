"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Leaderboard() {
  const [ripples, setRipples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from("echoes")
      .select("*")
      .order("chain_length", { ascending: false })
      .limit(20);

    setRipples(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-24 text-white">
      <div className="max-w-md mx-auto flex flex-col gap-6 text-center">
        <div className="space-y-2">
          <h1>Top Ripples</h1>
          <p>The waves spreading the furthest 🌊</p>
        </div>

        {ripples.length === 0 ? (
          <p className="text-muted">No ripples yet</p>
        ) : (
          <div className="space-y-4">
            {ripples.map((ripple, index) => {
              const isTop = index === 0;

              return (
                <div
                  key={ripple.id}
                  className={`p-5 text-left fade-in ${
                    isTop
                      ? "glass-card border-yellow-300/40 shadow-[0_0_50px_rgba(250,204,21,0.25)] bg-gradient-to-br from-yellow-400/15 to-transparent"
                      : "glass-card glass-card-hover"
                  }`}
                >
                  <div className="flex justify-between mb-3">
                    <span className="text-muted">#{index + 1}</span>

                    <div className="text-right">
                      <div className="font-semibold text-orange-400">
                        🔥 {ripple.chain_length}
                      </div>
                      <div className="text-subtle">chain</div>
                    </div>
                  </div>

                  {isTop && (
                    <div className="absolute top-2 right-3 text-yellow-300 text-lg">
                      🥇
                    </div>
                  )}

                  <p className="text-xl font-medium text-white leading-relaxed mb-2">
                    {ripple.content}
                  </p>

                  <div className="flex justify-between text-muted">
                    <span>🌍 {ripple.total_reach} reached</span>

                    <span>
                      {ripple.status === "active" && "🌊 In motion"}
                      {ripple.status === "stalled" && "⏸ Waiting"}
                      {ripple.status === "dead" && "💀 Ended"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
