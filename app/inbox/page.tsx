"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function Inbox() {
  const [delivery, setDelivery] = useState<any>(null);
  const [journey, setJourney] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRippling, setIsRippling] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
    };
    init();
  }, []);

  useEffect(() => {
    if (user) fetchNextRipple();
  }, [user]);

  const fetchNextRipple = async () => {
    const { data } = await supabase
      .from("echo_deliveries")
      .select("*, echoes(*)")
      .eq("status", "pending")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    setDelivery(data);

    if (data?.echo_id) {
      const { data: steps } = await supabase
        .from("echo_deliveries")
        .select("city, country, step_number")
        .eq("echo_id", data.echo_id)
        .not("city", "is", null)
        .order("step_number", { ascending: true });

      setJourney(steps || []);
    }

    setLoading(false);
  };

  const getLocation = async () => {
    try {
      const res = await fetch("/api/location");
      const data = await res.json();
      return {
        city: data.city || "Unknown",
        country: data.country || "Unknown",
      };
    } catch {
      return { city: "Unknown", country: "Unknown" };
    }
  };

  const selectNextUser = async (ripple: any, currentUserId: string) => {
    const { data: users } = await supabase.from("users").select("id");
    if (!users || users.length === 0) return null;

    const otherUsers = users.filter((u) => u.id !== currentUserId);

    const availableUsers = otherUsers.filter(
      (u) => !ripple.visited_users?.includes(u.id),
    );

    const pool = availableUsers.length > 0 ? availableUsers : otherUsers;

    if (pool.length === 0) return null;

    return pool[Math.floor(Math.random() * pool.length)];
  };

  const handleAction = async (type: "pass" | "reject") => {
    if (!delivery) return;

    const ripple = delivery.echoes;

    setIsRippling(true);

    setTimeout(async () => {
      const { city, country } = await getLocation();

      if (type === "pass") {
        const nextUser = await selectNextUser(ripple, user.id);
        if (!nextUser) return;

        await supabase
          .from("echoes")
          .update({
            chain_length: ripple.chain_length + 1,
            total_reach: ripple.total_reach + 1,
            visited_users: [...(ripple.visited_users || []), user.id],
          })
          .eq("id", ripple.id);

        await supabase.from("echo_deliveries").insert([
          {
            echo_id: ripple.id,
            user_id: nextUser.id,
            status: "pending",
            step_number: ripple.chain_length + 1,
          },
        ]);
      }

      if (type === "reject") {
        const newLives = ripple.lives_remaining - 1;

        await supabase
          .from("echoes")
          .update({
            lives_remaining: newLives,
            status: newLives <= 0 ? "dead" : "active",
          })
          .eq("id", ripple.id);
      }

      await supabase
        .from("echo_deliveries")
        .update({
          status: "done",
          action: type,
          city,
          country,
          rejection_reason: type === "reject" ? "User rejected" : null,
        })
        .eq("id", delivery.id);

      setIsRippling(false);
      fetchNextRipple();
    }, 600);
  };

  const ripple = delivery?.echoes;

  const renderLives = (lives: number) => {
    const safe = Math.max(0, Math.min(3, lives || 0));
    return "❤️".repeat(safe) + "💔".repeat(3 - safe);
  };

  const uniqueCities = new Set(journey.map((j) => j.city)).size;
  const uniqueCountries = new Set(journey.map((j) => j.country)).size;

  const visibleJourney = journey.slice(-5);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...{" "}
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-24 text-white">
      {" "}
      <div className="max-w-md mx-auto flex flex-col items-center gap-6 text-center">
        <div className="space-y-2">
          <h1>Inbox</h1>
          <p>A ripple is passing through you.</p>
        </div>

        {!delivery ? (
          <p className="text-muted">No ripples right now</p>
        ) : (
          <div className="relative w-full p-5 glass-card glass-card-hover fade-in overflow-hidden shadow-[0_0_60px_rgba(34,211,238,0.08)]">
            {isRippling && (
              <div className="ripple-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}

            <p className="text-xl font-medium leading-relaxed mb-3">
              {ripple.content}
            </p>

            <div className="flex justify-between mb-3">
              <div>
                <div className="text-lg font-semibold">
                  {ripple.total_reach}
                </div>
                <div className="text-muted">Reached</div>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold">
                  {ripple.chain_length}
                </div>
                <div className="text-muted">Chain</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-xl">
                {renderLives(ripple.lives_remaining)}
              </div>
              <div className="text-muted">
                {ripple.lives_remaining} lives left
              </div>
            </div>

            {visibleJourney.length > 0 && (
              <div className="mb-5 text-left">
                <p className="text-sm text-gray-400 mb-3">🌍 Journey</p>

                <div className="relative flex items-center gap-2 overflow-x-auto pb-2">
                  {visibleJourney.map((j, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div
                        className={`
                      px-3 py-1 rounded-full text-xs whitespace-nowrap
                      ${
                        i === visibleJourney.length - 1
                          ? "bg-cyan-400 text-black shadow-[0_0_12px_rgba(34,211,238,0.6)]"
                          : "bg-white/10 text-gray-300"
                      }
                    `}
                      >
                        {j.city}
                      </div>

                      {i !== visibleJourney.length - 1 && (
                        <div className="w-4 h-[2px] bg-white/20" />
                      )}
                    </div>
                  ))}
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  {uniqueCities} cities • {uniqueCountries} countries
                </p>
              </div>
            )}

            <div className="pt-3 flex gap-3">
              <Button
                onClick={() => handleAction("pass")}
                className="flex-1 btn-primary"
              >
                🌊 Pass it on
              </Button>

              <Button
                onClick={() => handleAction("reject")}
                className="flex-1 btn-danger"
              >
                💀 End it
              </Button>
            </div>

            <p className="text-subtle mt-3">
              It only survives if you pass it on.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
