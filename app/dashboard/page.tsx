"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [ripples, setRipples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    if (user) fetchRipples();
  }, [user]);

  const fetchRipples = async () => {
    const { data } = await supabase
      .from("echoes")
      .select("*")
      .eq("creator_id", user.id)
      .order("chain_length", { ascending: false });

    if (!data) {
      setLoading(false);
      return;
    }

    const enriched = await Promise.all(
      data.map(async (ripple) => {
        const { data: journey } = await supabase
          .from("echo_deliveries")
          .select("city, country, step_number")
          .eq("echo_id", ripple.id)
          .not("city", "is", null)
          .order("step_number", { ascending: true });

        const steps = journey || [];

        const uniqueCities = new Set(steps.map((j) => j.city)).size;
        const uniqueCountries = new Set(steps.map((j) => j.country)).size;

        return {
          ...ripple,
          journey: steps,
          uniqueCities,
          uniqueCountries,
        };
      }),
    );

    setRipples(enriched);
    setLoading(false);
  };

  const SkeletonCard = () => (
    <div className="p-5 glass-card animate-pulse text-left space-y-3">
      {" "}
      <div className="flex justify-between">
        {" "}
        <div className="h-3 w-10 bg-white/10 rounded" />{" "}
        <div className="h-3 w-12 bg-white/10 rounded" />{" "}
      </div>
      <div className="h-5 w-full bg-white/10 rounded" />
      <div className="h-5 w-3/4 bg-white/10 rounded" />
      <div className="flex justify-between mt-2">
        <div className="h-3 w-20 bg-white/10 rounded" />
        <div className="h-3 w-24 bg-white/10 rounded" />
      </div>
      <div className="flex gap-2 mt-3">
        <div className="h-6 w-16 bg-white/10 rounded-full" />
        <div className="h-6 w-16 bg-white/10 rounded-full" />
        <div className="h-6 w-16 bg-white/10 rounded-full" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <main className="min-h-screen px-4 pb-24 text-white">
        {" "}
        <div className="max-w-md mx-auto flex flex-col gap-6">
          {" "}
          <div className="space-y-2 text-center">
            {" "}
            <div className="h-6 w-40 mx-auto bg-white/10 rounded animate-pulse" />{" "}
            <div className="h-3 w-52 mx-auto bg-white/10 rounded animate-pulse" />{" "}
          </div>
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 pb-24 text-white">
      {" "}
      <div className="max-w-md mx-auto flex flex-col gap-6 text-center">
        {" "}
        <div className="space-y-2">
          {" "}
          <h1>Your Ripples</h1> <p>You started these waves 🌊</p>{" "}
        </div>
        {ripples.length === 0 ? (
          <p className="text-muted">No ripples yet</p>
        ) : (
          <div className="space-y-5">
            {ripples.map((ripple, index) => {
              const visibleJourney = (ripple.journey || []).slice(-5);
              const latest = visibleJourney.length
                ? visibleJourney[visibleJourney.length - 1]
                : null;

              return (
                <div
                  key={ripple.id}
                  className="p-5 glass-card glass-card-hover fade-in text-left"
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

                  <p className="text-xl font-medium leading-relaxed mb-3">
                    {ripple.content}
                  </p>

                  <div className="flex justify-between text-sm text-muted mb-3">
                    <span>🌍 {ripple.total_reach} reached</span>
                    <span>
                      {ripple.uniqueCities} cities • {ripple.uniqueCountries}{" "}
                      countries
                    </span>
                  </div>

                  {visibleJourney.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {visibleJourney.map((j: any, i: number) => (
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

                      {latest && (
                        <div className="text-xs text-gray-400 mt-1">
                          Currently in {latest.city}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    {ripple.status === "active" && "🌊 In motion"}
                    {ripple.status === "dead" && "💀 Ended"}
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
