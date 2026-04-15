"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const DEV_USERS = [
  { id: "11111111-1111-1111-1111-111111111111", username: "user1" },
  { id: "22222222-2222-2222-2222-222222222222", username: "user2" },
  { id: "33333333-3333-3333-3333-333333333333", username: "user3" },
  { id: "44444444-4444-4444-4444-444444444444", username: "user4" },
  { id: "55555555-5555-5555-5555-555555555555", username: "user5" },
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  // const [user, setUser] = useState<any>(null);
  const [user, setUser] = useState<any>(DEV_USERS[0]);
  const [loading, setLoading] = useState(true);

  // 🔐 Get current user
  // useEffect(() => {
  //   const getSession = async () => {
  //     const { data } = await supabase.auth.getSession();

  //     console.log("SESSION INIT:", data);

  //     if (data.session?.user) {
  //       setUser(data.session.user);
  //       await ensureUserExists(data.session.user);
  //     }

  //     setLoading(false);
  //   };

  //   getSession();

  //   const { data: listener } = supabase.auth.onAuthStateChange(
  //     async (event, session) => {
  //       console.log("AUTH CHANGE:", event, session);

  //       if (session?.user) {
  //         setUser(session.user);
  //         await ensureUserExists(session.user);
  //       } else {
  //         setUser(null);
  //       }
  //     },
  //   );

  //   return () => {
  //     listener.subscription.unsubscribe();
  //   };
  // }, []);

  // 🧬 Ensure user exists in DB
  const ensureUserExists = async (user: any) => {
    console.log("🧬 Checking user in DB:", user.id);

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    console.log("📦 User query result:", data, error);

    if (!data) {
      console.log("➕ Creating user in DB");

      const { error: insertError } = await supabase.from("users").insert([
        {
          id: user.id,
          username: user.email,
        },
      ]);

      console.log("📝 Insert user result:", insertError);
    }
  };

  // 🔐 Login
  const handleLogin = async () => {
    console.log("📨 Sending magic link to:", email);

    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    });

    console.log("📬 Login response:", data, error);

    if (error) {
      alert("Error sending magic link");
    } else {
      alert("Check your email!");
    }
  };

  // ✉️ Send Echo
  const handleSend = async () => {
    console.log("🚀 Sending echo...");
    if (!message.trim()) {
      console.log("⚠️ Empty message");
      return;
    }

    if (!user) {
      console.log("❌ No user found");
      return;
    }

    console.log("👤 Current user:", user);
    console.log("📝 Message:", message);

    const { data, error } = await supabase
      .from("echoes")
      .insert([
        {
          content: message,
          creator_id: user.id,
          chain_length: 1,
          lives_remaining: 3,
          status: "active",
          total_reach: 1, // add this column if not already
        },
      ])
      .select();

    if (error) {
      alert("Error sending echo: " + error.message);
      return;
    }

    const echo = data[0];

    console.log("✅ Echo created:", echo);

    // 🔍 Step 1: get all users except sender
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id")
      .neq("id", user.id);

    if (usersError || !users || users.length === 0) {
      console.log("❌ No users available to send echo");
      return;
    }

    // 🎯 Step 2: pick random user
    const randomUser = users[Math.floor(Math.random() * users.length)];

    console.log("🎯 Sending to:", randomUser.id);

    // 📦 Step 3: create delivery
    const { error: deliveryError } = await supabase
      .from("echo_deliveries")
      .insert([
        {
          echo_id: echo.id,
          user_id: randomUser.id,
          status: "pending",
        },
      ]);

    if (deliveryError) {
      console.log("❌ Delivery error:", deliveryError);
      alert("Echo created but delivery failed");
    } else {
      console.log("📨 Echo delivered successfully");
      setMessage("");
      setSent(true);

      setTimeout(() => {
        setSent(false);
      }, 3000);
    }
  };

  // ⏳ Loading
  // if (loading) {
  //   return (
  //     <main className="flex min-h-screen items-center justify-center bg-black text-white">
  //       Loading...
  //     </main>
  //   );
  // }

  // 🔐 Login UI
  // if (!user) {
  //   return (
  //     <main className="flex min-h-screen items-center justify-center bg-black text-white px-4">
  //       <div className="w-full max-w-md space-y-4">
  //         <h1 className="text-3xl font-bold tracking-tight text-center">EchoChain</h1>

  //         <input
  //           type="email"
  //           placeholder="Enter your email"
  //           value={email}
  //           onChange={(e) => setEmail(e.target.value)}
  //           className="w-full p-3 rounded bg-gray-900 border border-gray-700"
  //         />

  //         <Button className="w-full" onClick={handleLogin}>
  //           Send Magic Link
  //         </Button>
  //       </div>
  //     </main>
  //   );
  // }

  // 🏠 Main UI
  return (
    <main className="min-h-screen bg-black text-white px-3 py-6 sm:px-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-5">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center">
          EchoChain
        </h1>

        <select
          value={user.id}
          onChange={(e) => {
            const selected = DEV_USERS.find((u) => u.id === e.target.value);
            setUser(selected);
          }}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
        >
          {DEV_USERS.map((u) => (
            <option key={u.id} value={u.id}>
              {u.username}
            </option>
          ))}
        </select>

        {sent && (
          <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-300 text-center space-y-2">
            <p className="text-sm">✅ Echo sent into the network</p>

            <div className="flex gap-2 justify-center">
              <a
                href="/inbox"
                className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition"
              >
                Go to Inbox
              </a>

              <a
                href="/dashboard"
                className="px-3 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition"
              >
                View Stats
              </a>
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-md">
          <Textarea
            placeholder="Write your echo..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={280}
            className="bg-transparent border-none focus-visible:ring-0 text-base"
          />

          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-500">{message.length}/280</span>

            <Button
              className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:scale-105 transition duration-200"
              onClick={handleSend}
            >
              Send
            </Button>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full text-sm border-white/10 text-gray-400 hover:text-white hover:border-white/20"
          onClick={async () => {
            console.log("🚪 Logging out");
            await supabase.auth.signOut();
            setUser(null);
          }}
        >
          Logout
        </Button>
      </div>
    </main>
  );
}
