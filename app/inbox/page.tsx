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

export default function Inbox() {
  const [user, setUser] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [ripplingId, setRipplingId] = useState<string | null>(null);

  useEffect(() => {
    setUser(DEV_USERS[0]);
    setLoading(false);
  }, []);

  const fetchDeliveries = async (userId: string) => {
    const { data, error } = await supabase
      .from("echo_deliveries")
      .select(
        `
        id,
        echoes (
          id,
          content,
          chain_length,
          lives_remaining,
          total_reach,
          status
        )
      `,
      )
      .eq("user_id", userId)
      .eq("status", "pending");

    if (error) {
      console.log("❌ Fetch error:", error);
      return;
    }

    setDeliveries(data || []);
  };

  useEffect(() => {
    if (user) fetchDeliveries(user.id);
  }, [user]);

  const getNextUser = async (echoId: string) => {
    const { data: usedDeliveries } = await supabase
      .from("echo_deliveries")
      .select("user_id")
      .eq("echo_id", echoId);

    const usedUserIds = usedDeliveries.map((d) => d.user_id);

    const { data: users } = await supabase.from("users").select("id");

    const availableUsers = users.filter((u) => !usedUserIds.includes(u.id));

    if (availableUsers.length === 0) return null;

    return availableUsers[Math.floor(Math.random() * availableUsers.length)];
  };

  const handlePass = async (delivery: any) => {
    const echoId = delivery.echoes.id;

    await supabase
      .from("echo_deliveries")
      .update({ status: "passed" })
      .eq("id", delivery.id);

    await supabase.rpc("increment_chain_length", {
      echo_id_input: echoId,
    });

    const nextUser = await getNextUser(echoId);

    if (!nextUser) {
      await supabase
        .from("echoes")
        .update({ status: "stalled" })
        .eq("id", echoId);

      fetchDeliveries(user.id);
      return;
    }

    await supabase.from("echo_deliveries").insert([
      {
        echo_id: echoId,
        user_id: nextUser.id,
        status: "pending",
      },
    ]);

    fetchDeliveries(user.id);
  };

  const handleReject = async (delivery: any) => {
    const echoId = delivery.echoes.id;

    await supabase
      .from("echo_deliveries")
      .update({ status: "rejected" })
      .eq("id", delivery.id);

    const { data: newLives } = await supabase.rpc("decrement_life", {
      echo_id_input: echoId,
    });

    if (newLives <= 0) {
      await supabase
        .from("echoes")
        .update({
          lives_remaining: 0,
          status: "dead",
        })
        .eq("id", echoId);

      fetchDeliveries(user.id);
      return;
    }

    const nextUser = await getNextUser(echoId);

    if (!nextUser) {
      await supabase
        .from("echoes")
        .update({ status: "stalled" })
        .eq("id", echoId);

      fetchDeliveries(user.id);
      return;
    }

    await supabase.from("echo_deliveries").insert([
      {
        echo_id: echoId,
        user_id: nextUser.id,
        status: "pending",
      },
    ]);

    fetchDeliveries(user.id);
  };

  if (loading || !user) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white px-3 py-4 sm:px-4 max-w-xl mx-auto">
      {/* HEADER */}
      <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3 text-center">
        Inbox <span className="text-gray-500 text-sm">({user.username})</span>
      </h1>

      {/* USER SWITCH */}
      <select
        value={user.id}
        onChange={(e) => {
          const selected = DEV_USERS.find((u) => u.id === e.target.value);
          setUser(selected);
        }}
        className="w-full px-3 py-2 mb-4 bg-white/5 border border-white/10 rounded-lg text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-cyan-500"
      >
        {DEV_USERS.map((u) => (
          <option key={u.id} value={u.id}>
            {u.username}
          </option>
        ))}
      </select>

      {/* EMPTY STATE */}
      {deliveries.length === 0 ? (
        <p className="text-center text-gray-500 text-sm mt-10">
          No echoes yet 👀
        </p>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {/* CONTEXT */}
          <p className="text-xs text-gray-500 px-1">
            Pending Echoes ({deliveries.length})
          </p>

          {deliveries.map((d, index) => (
            <div
              key={d.id}
              className={`relative overflow-hidden p-3 sm:p-4 rounded-xl backdrop-blur-lg border shadow-md transition duration-200 hover:scale-[1.02] ${
                index === 0
                  ? "bg-gradient-to-br from-purple-500/10 via-transparent to-cyan-500/10 border-purple-400/40"
                  : "bg-white/5 border-white/10"
              }`}
              style={{
                transform: ripplingId === d.id ? "scale(0.96)" : "scale(1)",
                opacity: ripplingId === d.id ? 0.7 : 1,
              }}
            >
              {/* RIPPLE */}
              {ripplingId === d.id && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="ripple" />
                </span>
              )}

              {/* CONTENT */}
              <p className="text-base sm:text-lg font-medium text-white">
                {d.echoes.content}
              </p>

              {/* META */}
              <div className="text-xs sm:text-sm text-gray-500 mt-1">
                Chain: {d.echoes.chain_length} • Lives:{" "}
                {d.echoes.lives_remaining}
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                <button
                  className="flex-1 py-2 text-sm sm:text-base rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 transition duration-200"
                  onClick={async () => {
                    setRipplingId(d.id);
                    await new Promise((r) => setTimeout(r, 600));
                    await handlePass(d);
                    setRipplingId(null);
                  }}
                >
                  Pass
                </button>

                <button
                  className="flex-1 py-2 text-sm sm:text-base rounded-lg bg-gradient-to-r from-red-500 to-pink-600 hover:scale-105 transition duration-200"
                  onClick={async () => {
                    setRipplingId(d.id);
                    await new Promise((r) => setTimeout(r, 600));
                    await handleReject(d);
                    setRipplingId(null);
                  }}
                >
                  Reject
                </button>
              </div>

              {/* STATUS */}
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <span
                  className={`w-2 h-2 rounded-full ${
                    d.echoes.status === "active"
                      ? "bg-green-400"
                      : d.echoes.status === "stalled"
                        ? "bg-yellow-400"
                        : "bg-red-400"
                  }`}
                />
                {d.echoes.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
