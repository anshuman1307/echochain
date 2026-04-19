"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);

    await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    setLoading(false);

    if (!error) setSent(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 text-white">
      <div className="w-full max-w-md flex flex-col gap-8 text-center">
        {/* 🔥 HERO */}
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight">
            Send something that spreads
          </h1>

          <p className="text-sm text-gray-400">
            Your message will travel across strangers 🌍
          </p>
        </div>

        {/* ✨ CARD */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col gap-5">
          {/* GOOGLE CTA */}
          <Button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="
    w-full h-12 rounded-xl
    bg-white text-black font-medium
    flex items-center justify-center gap-3
    hover:opacity-90 active:scale-95 transition
  "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              className="w-5 h-5"
            >
              <path
                fill="#EA4335"
                d="M24 9.5c3.15 0 5.95 1.08 8.17 3.2l6.1-6.1C34.6 2.9 29.6 1 24 1 14.8 1 6.9 6.5 3.3 14.3l7.1 5.5C12.3 13.5 17.7 9.5 24 9.5z"
              />
              <path
                fill="#34A853"
                d="M46.1 24.5c0-1.5-.1-2.6-.4-3.8H24v7.2h12.5c-.3 2.2-1.7 5.4-4.9 7.6l7.6 5.9c4.4-4 6.9-9.8 6.9-17z"
              />
              <path
                fill="#4A90E2"
                d="M10.4 28.8c-1-3-1-6.3 0-9.3l-7.1-5.5C.7 18.2 0 21 0 24c0 3 .7 5.8 2.3 8.2l8.1-3.4z"
              />
              <path
                fill="#FBBC05"
                d="M24 47c6.5 0 12-2.2 16-6l-7.6-5.9c-2.1 1.5-4.8 2.5-8.4 2.5-6.3 0-11.7-4-13.6-9.6l-8.1 3.4C6.9 41.5 14.8 47 24 47z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* DIVIDER */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex-1 h-px bg-white/10" />
            or
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* EMAIL */}
          {!sent ? (
            <>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="
                  w-full h-12 px-4 rounded-xl
                  bg-transparent border border-white/10
                  focus:border-cyan-400/40 outline-none
                  text-sm placeholder:text-gray-500
                  transition
                "
              />

              <Button
                onClick={handleMagicLink}
                disabled={loading}
                className="
                  w-full h-12 rounded-xl
                  bg-gradient-to-r from-cyan-400 to-purple-500
                  text-black font-medium
                  hover:scale-[1.02] active:scale-95 transition
                "
              >
                Send Magic Link
              </Button>
            </>
          ) : (
            <div className="text-sm text-green-400">
              ✉️ Check your email for login link
            </div>
          )}
        </div>

        {/* 🧠 TRUST SIGNAL */}
        <p className="text-xs text-gray-500">
          No spam. No feeds. Just messages that travel.
        </p>
      </div>
    </main>
  );
}
