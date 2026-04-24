"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(false);

  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [typingPulse, setTypingPulse] = useState(false);
  const [showRippleAnim, setShowRippleAnim] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [reachAnim, setReachAnim] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (!user) {
        router.push("/login");
        return;
      }

      setUser(user);
      setLoading(false);
    };

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("ripple-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "echo_deliveries",
        },
        (payload) => {
          const newDelivery = payload.new;

          if (newDelivery.user_id === user.id) {
            setNotification("📥 A ripple reached you");
          } else {
            setNotification("🌍 Your ripple spread further");
            setReachAnim(true);
            setTimeout(() => setReachAnim(false), 2000);
          }

          setTimeout(() => setNotification(null), 3000);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (cooldown === 0) return;

    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const isValid = message.trim().length > 10;

  const handleInput = (e: any) => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";

    setMessage(e.target.value);

    setTypingPulse(true);
    setTimeout(() => setTypingPulse(false), 300);
  };

  const handleSend = async () => {
    if (!isValid || isSending || cooldown > 0) return;

    setIsSending(true);
    setShowRippleAnim(true);

    const { data } = await supabase
      .from("echoes")
      .insert([
        {
          content: message,
          creator_id: user.id,
          chain_length: 1,
          lives_remaining: 3,
          status: "active",
          total_reach: 1,
        },
      ])
      .select();

    const ripple = data?.[0];

    const { data: users } = await supabase
      .from("users")
      .select("id")
      .neq("id", user.id);

    if (users?.length) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      await supabase.from("echo_deliveries").insert([
        {
          echo_id: ripple.id,
          user_id: randomUser.id,
          status: "pending",
          step_number: 1,
        },
      ]);
    }

    setTimeout(() => {
      setShowRippleAnim(false);
      setIsSending(false);
      setMessage("");
      setSent(true);
      setCooldown(5);

      setTimeout(() => setSent(false), 2000);
    }, 800);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-gray-400">
        Loading...{" "}
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-4 text-white overflow-hidden">
      {notification && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-lg text-sm bg-white/10 backdrop-blur-md border border-white/10 animate-fade-in">
          {notification}{" "}
        </div>
      )}

      {reachAnim && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 text-xl font-semibold animate-float-up">
          +1 reach 🔥
        </div>
      )}

      <div className="relative max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[85vh] space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-semibold">Start a Ripple</h1>
          <p className="text-gray-400 text-sm">
            This could reach someone far away 🌍
          </p>
        </div>

        {sent && (
          <div className="text-green-400 text-sm animate-bounce">
            🌊 Ripple started
          </div>
        )}

        <div
          className={`
        glass-card w-full max-w-3xl p-5 transition-all duration-500 relative
        ${focused ? "border-cyan-400/40" : ""}
        ${typingPulse ? "scale-[1.01]" : ""}
        ${isSending ? "opacity-50 scale-95 -translate-y-4" : ""}
      `}
        >
          <div
            className={`
          pointer-events-none absolute inset-0 rounded-2xl transition-all duration-500
          ${focused ? "shadow-[0_0_80px_rgba(34,211,238,0.25)]" : "shadow-none"}
        `}
          />

          <textarea
            ref={textareaRef}
            placeholder="Write something worth spreading..."
            value={message}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={handleInput}
            maxLength={280}
            className="w-full bg-transparent outline-none resize-none text-xl font-medium leading-relaxed min-h-[140px]"
          />

          <div className="flex justify-between text-xs text-gray-500 mt-3">
            <span>{isValid ? "Ready 🌊" : "Make it meaningful"}</span>
            <span>{message.length}/280</span>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!isValid || cooldown > 0}
          className={`
        w-full max-w-2xl mx-auto h-12 rounded-xl text-black text-base
        bg-gradient-to-r from-cyan-400 to-purple-500
        transition-all duration-200
        active:scale-95
        ${cooldown > 0 ? "opacity-50" : "hover:scale-[1.03] hover:shadow-xl"}
      `}
        >
          {cooldown > 0 ? `Wait ${cooldown}s` : "Start Ripple"}
        </Button>
      </div>
    </main>
  );
}
