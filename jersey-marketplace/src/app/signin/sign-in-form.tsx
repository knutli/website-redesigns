"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const MIN_AGE = 13;

export function SignInForm({ mode, next }: { mode: "signin" | "signup"; next: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "");
    const birthDate = String(form.get("birthDate") ?? "");

    try {
      if (mode === "signup") {
        if (!birthDate) throw new Error("Date of birth is required");
        const age = yearsSince(new Date(birthDate));
        if (age < MIN_AGE) throw new Error(`You must be at least ${MIN_AGE} to sign up`);
        const res = await signUp.email({ email, password, name });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message);
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "signup" ? (
        <>
          <div className="grid gap-2">
            <Label htmlFor="name">Display name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="birthDate">Date of birth</Label>
            <Input id="birthDate" name="birthDate" type="date" required />
            <p className="text-xs text-muted-foreground">You must be at least {MIN_AGE} years old.</p>
          </div>
        </>
      ) : null}

      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={10}
          required
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "One moment…" : mode === "signup" ? "Create account" : "Sign in"}
      </Button>
    </form>
  );
}

function yearsSince(d: Date) {
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
