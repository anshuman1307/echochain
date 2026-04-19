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
  const [errorMsg, setErrorMsg] = useState("");
  const [focused, setFocused] = useState(false);

  // ✨ NEW STATES
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [typingPulse, setTypingPulse] = useState(false);
  const [showEchoAnim, setShowEchoAnim] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [reachAnim, setReachAnim] = useState(false);
  const [location, setLocation] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // 🔐 Auth
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

  // 🔔 REALTIME LISTENER (ECHO REACHED SOMEONE)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("echo-live")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "echo_deliveries",
        },
        (payload) => {
          console.log("🔥 REALTIME EVENT:", payload);
          const newDelivery = payload.new;

          // 🌍 RECEIVED ECHO (Inbox side)
          if (newDelivery.user_id === user.id) {
            const loc = [newDelivery.city, newDelivery.country]
              .filter(Boolean)
              .join(", ");

            setNotification(
              loc ? `📥 Echo arrived from ${loc}` : "📥 A new echo reached you",
            );

            setTimeout(() => setNotification(null), 3000);
          }

          // 🔥 YOUR ECHO GREW (Dashboard / Sender side)
          if (newDelivery.user_id !== user.id) {
            const loc = [newDelivery.city, newDelivery.country]
              .filter(Boolean)
              .join(", ");

            setLocation(loc || "somewhere");

            setNotification(
              loc
                ? `🌍 Your echo reached ${loc}`
                : "🌍 Your echo reached someone",
            );

            // 💫 trigger +1 animation
            setReachAnim(true);
            setTimeout(() => setReachAnim(false), 2000);

            setTimeout(() => setNotification(null), 3000);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // ⏱ Cooldown
  useEffect(() => {
    if (cooldown === 0) return;

    const timer = setInterval(() => {
      setCooldown((c) => c - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  // 🧠 Validation
  const validateMessage = (text: string) => {
    const trimmed = text.trim();
    if (trimmed.length < 10) return false;
    if (trimmed.split(/\s+/).length < 2) return false;
    if (/(.)\1{5,}/.test(trimmed)) return false;
    return true;
  };

  const isValid = validateMessage(message);

  // ✍️ Typing
  const handleInput = (e: any) => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = "0px";
    el.style.height = el.scrollHeight + "px";

    setMessage(e.target.value);

    setTypingPulse(true);
    setTimeout(() => setTypingPulse(false), 300);

    if (errorMsg) setErrorMsg("");
  };

  // 🎯 SEND
  const handleSend = async () => {
    if (!isValid || isSending || cooldown > 0) return;

    setIsSending(true);
    setShowEchoAnim(true);

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

    const echo = data?.[0];

    const { data: users } = await supabase
      .from("users")
      .select("id")
      .neq("id", user.id);

    if (users && users.length > 0) {
      const randomUser = users[Math.floor(Math.random() * users.length)];

      await supabase.from("echo_deliveries").insert([
        {
          echo_id: echo.id,
          user_id: randomUser.id,
          status: "pending",
          step_number: 1,
        },
      ]);
    }

    setTimeout(() => {
      setShowEchoAnim(false);
      setIsSending(false);
      setMessage("");
      setSent(true);
      setCooldown(5);

      setTimeout(() => setSent(false), 2000);
    }, 800);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="relative min-h-screen px-4 text-white overflow-hidden">
      {/* 🌊 Background */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 px-4 py-2 rounded-lg text-sm bg-white/10 backdrop-blur-md border border-white/10 animate-fade-in">
          {notification}
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black via-[#020617] to-[#020617]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-transparent animate-pulse" />

      {/* 🌍 ECHO TRAVEL ANIMATION */}
      {reachAnim && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400 text-xl font-semibold animate-float-up">
          +1 reach 🔥
        </div>
      )}
      {showEchoAnim && (
        <div className="pointer-events-none absolute left-0 top-1/2 w-full h-1">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 blur-sm animate-[moveEcho_0.8s_linear]" />
        </div>
      )}

      <style jsx>{`
        @keyframes floatUp {
          0% {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          30% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -40px);
          }
        }

        .animate-float-up {
          animation: floatUp 2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      {/* 🔔 NOTIFICATION */}
      {notification && (
        <div className="fixed top-20 right-4 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-lg text-sm animate-fade-in">
          {notification}
        </div>
      )}

      <div className="relative max-w-5xl mx-auto flex flex-col items-center justify-center min-h-[85vh] space-y-10">
        {/* HEADER */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-semibold">Send an Echo</h1>
          <p className="text-gray-500 text-sm">
            Your message will travel across strangers
          </p>
        </div>

        {/* SUCCESS */}
        {sent && (
          <div className="text-green-400 text-sm animate-bounce">
            🚀 Echo launched
          </div>
        )}

        {/* INPUT */}
        <div
          className={`
            w-full max-w-3xl rounded-2xl p-5 transition-all duration-500
            border ${focused ? "border-cyan-400/40" : "border-white/10"}
            bg-white/5 backdrop-blur-sm
            ${focused ? "shadow-[0_0_60px_rgba(34,211,238,0.25)]" : ""}
            ${typingPulse ? "scale-[1.01]" : ""}
            ${isSending ? "opacity-50 scale-95 -translate-y-4" : ""}
          `}
        >
          <textarea
            ref={textareaRef}
            placeholder="Write something worth passing on..."
            value={message}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={handleInput}
            maxLength={280}
            className="w-full bg-transparent outline-none resize-none text-lg text-white min-h-[140px]"
          />

          <div className="flex justify-between text-xs text-gray-500 mt-3">
            <span>{isValid ? "Ready 🚀" : "Make it meaningful"}</span>
            <span>{message.length}/280</span>
          </div>
        </div>

        {/* ERROR */}
        {errorMsg && (
          <div className="text-red-400 text-sm text-center">{errorMsg}</div>
        )}

        {/* CTA */}
        <Button
          onClick={handleSend}
          disabled={!isValid || cooldown > 0}
          className={`
            w-full max-w-2xl mx-auto h-12 rounded-xl text-black text-base
            bg-gradient-to-r from-cyan-400 to-purple-500
            transition-all duration-200
            active:scale-95
            ${
              cooldown > 0 ? "opacity-50" : "hover:scale-[1.03] hover:shadow-xl"
            }
          `}
        >
          {cooldown > 0 ? `Wait ${cooldown}s` : "Send Echo"}
        </Button>
      </div>
    </main>
  );
}
