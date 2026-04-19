"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function Inbox() {
  const [echo, setEcho] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEcho();
  }, []);

  const fetchEcho = async () => {
    const { data } = await supabase
      .from("echo_deliveries")
      .select("*, echoes(*)")
      .eq("status", "pending")
      .limit(1)
      .single();

    setEcho(data);
    setLoading(false);
  };

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
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-semibold">📥 Your Inbox</h1>
          <p className="text-sm text-gray-500">
            This message is passing through you
          </p>
        </div>

        {!echo ? (
          <p className="text-gray-400">No messages</p>
        ) : (
          <div className="w-full p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col gap-4">
            <p className="text-lg font-medium text-white">
              {echo.echoes.content}
            </p>

            <div className="flex justify-between text-sm">
              <div>
                <div className="text-lg font-semibold">
                  {echo.echoes.total_reach}
                </div>
                <div className="text-xs text-gray-500">Reached</div>
              </div>

              <div className="text-right">
                <div className="text-lg font-semibold">
                  {echo.echoes.chain_length}
                </div>
                <div className="text-xs text-gray-500">Passed</div>
              </div>
            </div>

            <div>
              <div className="text-xl">
                {renderLives(echo.echoes.lives_remaining)}
              </div>
              <div className="text-sm text-gray-400">
                {echo.echoes.lives_remaining} lives left
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 h-11 bg-gradient-to-r from-cyan-400 to-purple-500 text-black">
                🚀 Pass it on
              </Button>
              <Button className="flex-1 h-11 bg-red-500 text-white">
                💀 End it
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
