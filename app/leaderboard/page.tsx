"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Trophy,
  Flame,
  Globe,
  Waves,
  Timer,
  Skull,
  Loader2,
} from "lucide-react";

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
        <Loader2 className="animate-spin mr-2" size={20} />
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-24 text-white">
      <div className="max-w-md mx-auto flex flex-col gap-6 text-center">
        <div className="space-y-2">
          <h1>Top Ripples</h1>
          <p className="flex items-center justify-center gap-2">
            The waves spreading the furthest{" "}
            <Waves size={18} className="text-cyan-400" />
          </p>
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
                  className={`p-5 text-left fade-in rounded-xl transition-all ${
                    isTop
                      ? "glass-card border-yellow-300/40 shadow-[0_0_50px_rgba(250,204,21,0.25)] bg-gradient-to-br from-yellow-400/15 to-transparent"
                      : "glass-card glass-card-hover"
                  }`}
                >
                  {/* TOP ROW: Rank and Chain Stats (Fixed Overlap) */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-muted text-sm">#{index + 1}</span>

                    <div className="flex items-center gap-3">
                      {isTop && (
                        <Trophy
                          size={20}
                          className="text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.6)]"
                        />
                      )}
                      <div className="text-right">
                        <div className="font-semibold text-orange-400 flex items-center justify-end gap-1">
                          <Flame size={16} /> {ripple.chain_length}
                        </div>
                        <div className="text-subtle text-[10px] tracking-wider">
                          chain
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONTENT ROW */}
                  <p className="text-lg font-medium text-white leading-relaxed mb-6">
                    {ripple.content}
                  </p>

                  {/* BOTTOM ROW: Reach and Status */}
                  <div className="flex justify-between items-center text-sm text-muted">
                    <span className="flex items-center gap-1.5">
                      <Globe size={14} className="text-blue-400" />
                      {ripple.total_reach} reached
                    </span>

                    <span className="flex items-center gap-1.5 font-medium">
                      {ripple.status === "active" && (
                        <>
                          <Waves size={14} className="text-cyan-400" />
                          In motion
                        </>
                      )}
                      {ripple.status === "stalled" && (
                        <>
                          <Timer size={14} className="text-yellow-500" />
                          Waiting
                        </>
                      )}
                      {ripple.status === "dead" && (
                        <>
                          <Skull size={14} className="text-gray-500" />
                          Ended
                        </>
                      )}
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
