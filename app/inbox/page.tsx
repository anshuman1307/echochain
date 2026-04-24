"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function Inbox() {
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRippling, setIsRippling] = useState(false);

  useEffect(() => {
    fetchNextRipple();
  }, []);

  const fetchNextRipple = async () => {
    const { data } = await supabase
      .from("echo_deliveries")
      .select("*, echoes(*)")
      .eq("status", "pending")
      .limit(1)
      .single();

    setDelivery(data);
    setLoading(false);
  };

  const handleAction = async (type: "pass" | "reject") => {
    if (!delivery) return;

    setIsRippling(true);

    setTimeout(async () => {
      await supabase
        .from("echo_deliveries")
        .update({ status: type === "pass" ? "passed" : "rejected" })
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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-gray-400">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-24 text-white">
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

            <p className="text-xl font-medium text-white leading-relaxed mb-3">
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
