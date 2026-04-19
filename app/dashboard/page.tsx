"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [echoes, setEchoes] = useState<any[]>([]);

  useEffect(() => {
    fetchEchoes();
  }, []);

  const fetchEchoes = async () => {
    const { data } = await supabase
      .from("echoes")
      .select("*")
      .order("chain_length", { ascending: false });

    setEchoes(data || []);
  };

  return (
    <main className="min-h-screen px-4 pb-24 text-white">
      <div className="max-w-md mx-auto flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold">📊 Your Echoes</h1>
          <p className="text-sm text-gray-500">Ranked by performance 🚀</p>
        </div>

        <div className="space-y-4">
          {echoes.map((e, i) => (
            <div
              key={e.id}
              className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-left"
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm">#{i + 1}</span>
                <span className="text-yellow-400">🔥 {e.viral_score}</span>
              </div>

              <p className="text-lg text-cyan-300">{e.content}</p>

              <div className="text-sm text-gray-400 mt-2">
                🌍 {e.total_reach} reached
              </div>

              <div className="text-sm text-gray-400">
                🔥 {e.chain_length} chain
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
