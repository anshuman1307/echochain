"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function Inbox() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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
    if (user) fetchInbox();
  }, [user]);

  const fetchInbox = async () => {
    const { data } = await supabase
      .from("echo_deliveries")
      .select("*, echoes(*)")
      .eq("status", "pending")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    setDeliveries(data || []);
    setCurrentIndex(0);
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

    if (!users) return null;

    const visited = ripple.visited_users || [];

    const eligible = users.filter(
      (u) =>
        u.id !== currentUserId &&
        u.id !== ripple.creator_id &&
        !visited.includes(u.id),
    );

    if (eligible.length === 0) return null;

    return eligible[Math.floor(Math.random() * eligible.length)];
  };

  const handleAction = async (type: "pass" | "reject") => {
    const delivery = deliveries[currentIndex];
    if (!delivery) return;

    const ripple = delivery.echoes;

    setIsRippling(true);

    setTimeout(async () => {
      const { city, country } = await getLocation();

      if (type === "pass") {
        const { data: existing } = await supabase
          .from("echo_deliveries")
          .select("id")
          .eq("echo_id", ripple.id)
          .eq("status", "pending");

        if (!existing || existing.length === 0) {
          const nextUser = await selectNextUser(ripple, user.id);

          if (!nextUser) {
            await supabase
              .from("echoes")
              .update({ status: "stalled" })
              .eq("id", ripple.id);
          } else {
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
        }
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

      const nextIndex = currentIndex + 1;

      if (nextIndex < deliveries.length) {
        setCurrentIndex(nextIndex);
      } else {
        fetchInbox();
      }

      setIsRippling(false);
    }, 500);
  };

  const delivery = deliveries[currentIndex];
  const ripple = delivery?.echoes;
  const remaining = deliveries.length - currentIndex - 1;

  const renderLives = (lives: number) => {
    const safe = Math.max(0, Math.min(3, lives || 0));
    return "❤️".repeat(safe) + "💔".repeat(3 - safe);
  };

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
          <>
            <div className="relative w-full p-5 glass-card text-left">
              {isRippling && (
                <div className="ripple-effect top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              )}

              <p className="text-xl font-medium mb-3">{ripple.content}</p>

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

              <div className="flex gap-3">
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

            {remaining > 0 && (
              <p className="text-sm text-gray-400">
                {remaining} more remaining
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
