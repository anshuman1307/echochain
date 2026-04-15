"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const DEV_USERS = [
  { id: "11111111-1111-1111-1111-111111111111", username: "user1" },
  { id: "22222222-2222-2222-2222-222222222222", username: "user2" },
  { id: "33333333-3333-3333-3333-333333333333", username: "user3" },
  { id: "44444444-4444-4444-4444-444444444444", username: "user4" },
  { id: "55555555-5555-5555-5555-555555555555", username: "user5" },
];

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [echoes, setEchoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(DEV_USERS[0]);
    setLoading(false);
  }, []);

  const fetchEchoes = async (userId: string) => {
    const { data, error } = await supabase
      .from("echoes")
      .select("*")
      .eq("creator_id", userId)
      .order("chain_length", { ascending: false });

    if (error) {
      console.log("❌ Fetch error:", error);
      return;
    }

    setEchoes(data || []);
  };

  useEffect(() => {
    if (user) fetchEchoes(user.id);
  }, [user]);

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </main>
    );
  }

  const bestEcho = echoes[0];

  return (
    <main className="min-h-screen bg-black text-white px-3 py-4 sm:px-4 max-w-xl mx-auto">
      {/* HEADER */}
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-center">
        Dashboard{" "}
        <span className="text-gray-500 text-sm">({user.username})</span>
      </h1>

      {/* USER SWITCH */}
      <select
        value={user.id}
        onChange={(e) => {
          const selected = DEV_USERS.find((u) => u.id === e.target.value);
          setUser(selected);
        }}
        className="w-full px-3 py-2 mb-5 bg-white/5 border border-white/10 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-cyan-500"
      >
        {DEV_USERS.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>

      {/* 🔥 BEST ECHO */}
      {bestEcho && (
        <div className="mb-5 p-4 rounded-xl backdrop-blur-lg border border-yellow-400/40 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10 shadow-md">
          <h2 className="text-sm text-yellow-400 mb-1 tracking-wide">
            🔥 BEST ECHO
          </h2>

          <p className="text-base sm:text-lg font-medium text-white">
            {bestEcho.content}
          </p>

          <div className="text-xs sm:text-sm text-gray-500 mt-2">
            Chain: {bestEcho.chain_length} • Reach: {bestEcho.total_reach}
          </div>
        </div>
      )}

      {/* EMPTY */}
      {echoes.length === 0 ? (
        <p className="text-center text-gray-500 text-sm mt-10">
          No echoes yet 👀
        </p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {/* CONTEXT */}
          <p className="text-xs text-gray-500 px-1">
            Your Echoes ({echoes.length})
          </p>

          {echoes.map((e, index) => (
            <div
              key={e.id}
              className={`p-3 sm:p-4 rounded-xl backdrop-blur-lg border shadow-md transition duration-200 hover:scale-[1.02] ${
                index === 0
                  ? "bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 border-purple-400/40"
                  : "bg-white/5 border-white/10"
              }`}
            >
              {/* CONTENT */}
              <p className="text-base sm:text-lg font-medium text-white">
                {e.content}
              </p>

              {/* META */}
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                Chain: {e.chain_length} • Reach: {e.total_reach}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Lives: {e.lives_remaining}
              </div>

              {/* STATUS */}
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <span
                  className={`w-2 h-2 rounded-full ${
                    e.status === "active"
                      ? "bg-green-400"
                      : e.status === "stalled"
                        ? "bg-yellow-400"
                        : "bg-red-400"
                  }`}
                />
                {e.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
