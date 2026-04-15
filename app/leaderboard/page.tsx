"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Leaderboard() {
  const [echoes, setEchoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser({
      id: "11111111-1111-1111-1111-111111111111",
      username: "user1",
    });
  }, []);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from("echoes")
      .select("*")
      .order("chain_length", { ascending: false })
      .limit(20);

    if (error) {
      console.log("❌ Fetch error:", error);
      return;
    }

    setEchoes(data || []);
    setLoading(false);
  };

  const reviveStalled = async () => {
    console.log("♻️ Reviving stalled echoes...");

    const { data: stalledEchoes, error } = await supabase
      .from("echoes")
      .select("*")
      .eq("status", "stalled")
      .eq("creator_id", user.id);

    if (error || !stalledEchoes) {
      console.log("❌ Error fetching stalled echoes");
      return;
    }

    for (const echo of stalledEchoes) {
      const { data: deliveries } = await supabase
        .from("echo_deliveries")
        .select("user_id")
        .eq("echo_id", echo.id);

      const usedUserIds = deliveries.map((d) => d.user_id);

      const { data: users } = await supabase.from("users").select("id");

      const availableUsers = users.filter((u) => !usedUserIds.includes(u.id));

      if (availableUsers.length === 0) continue;

      const nextUser =
        availableUsers[Math.floor(Math.random() * availableUsers.length)];

      await supabase.from("echo_deliveries").insert([
        {
          echo_id: echo.id,
          user_id: nextUser.id,
          status: "pending",
        },
      ]);

      await supabase
        .from("echoes")
        .update({ status: "active" })
        .eq("id", echo.id);
    }

    alert("Revival complete");
  };

  const reviveSingleEcho = async (echoId: string) => {
    const { data: echo, error: echoError } = await supabase
      .from("echoes")
      .select("*")
      .eq("id", echoId)
      .eq("creator_id", user.id)
      .single();

    if (echoError || !echo) return;
    if (echo.status !== "stalled") return;

    const { data: deliveries } = await supabase
      .from("echo_deliveries")
      .select("user_id")
      .eq("echo_id", echoId);

    const usedUserIds = deliveries.map((d) => d.user_id);

    const { data: users } = await supabase.from("users").select("id");

    const availableUsers = users.filter((u) => !usedUserIds.includes(u.id));

    if (availableUsers.length === 0) return;

    const nextUser =
      availableUsers[Math.floor(Math.random() * availableUsers.length)];

    await supabase.from("echo_deliveries").insert([
      {
        echo_id: echoId,
        user_id: nextUser.id,
        status: "pending",
      },
    ]);

    await supabase.from("echoes").update({ status: "active" }).eq("id", echoId);

    fetchLeaderboard();
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading leaderboard...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-3 py-4 sm:px-4 max-w-xl mx-auto">
      {/* HEADER */}
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-center">
        Leaderboard
      </h1>

      {/* ACTION */}
      <button
        onClick={reviveStalled}
        className="w-full mb-4 py-2 text-sm sm:text-base rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 transition duration-200 shadow-md"
      >
        ♻️ Revive Stalled Echoes
      </button>

      {/* EMPTY */}
      {echoes.length === 0 ? (
        <p className="text-center text-gray-500 text-sm mt-10">
          No echoes yet 👀
        </p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {/* CONTEXT */}
          <p className="text-xs text-gray-500 px-1">
            Top Echoes ({echoes.length})
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
              {/* RANK */}
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-400">
                  #{index + 1}
                </span>

                <span className="text-sm">
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                </span>
              </div>

              {/* CONTENT */}
              <p className="text-base sm:text-lg font-medium text-white">
                {e.content}
              </p>

              {/* META */}
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                Chain: {e.chain_length} • Reach: {e.total_reach}
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

              {/* REVIVE BUTTON */}
              {e.status === "stalled" && (
                <button
                  onClick={() => reviveSingleEcho(e.id)}
                  className="mt-3 w-full py-2 text-sm rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 transition duration-200"
                >
                  ♻️ Revive
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
