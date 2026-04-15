"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (error) {
      alert("Error sending magic link");
    } else {
      alert("Check your email!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="space-y-4 w-full max-w-sm">
        <h1 className="text-xl font-bold">Login</h1>

        <Input
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button onClick={handleLogin} className="w-full">
          Send Magic Link
        </Button>
      </div>
    </div>
  );
}
