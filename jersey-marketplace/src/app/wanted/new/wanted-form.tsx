"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function WantedForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/wanted", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to post");
      }
      const data = await res.json().catch(() => null);
      if (data?.id) {
        router.push(`/wanted/${data.id}`);
      } else {
        router.push("/wanted");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="title">What are you looking for?</Label>
            <Input id="title" name="title" required placeholder="Rosenborg 1996 home #10 player issue" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="club">Club</Label>
              <Input id="club" name="club" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="season">Season</Label>
              <Input id="season" name="season" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="player">Player (optional)</Label>
              <Input id="player" name="player" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sizePref">Size</Label>
              <Input id="sizePref" name="sizePref" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Details</Label>
            <Input id="description" name="description" placeholder="Condition expectations, variants you'll accept, etc." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="maxPrice">Max price (NOK)</Label>
            <Input id="maxPrice" name="maxPrice" type="number" min={0} />
          </div>
          <div className="grid gap-2">
            <Label>Reference photos (optional)</Label>
            <input type="file" name="images" multiple accept="image/*" className="text-sm" />
          </div>
        </CardContent>
      </Card>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-4">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? "Posting..." : "Post Wanted"}
        </Button>
      </div>
    </form>
  );
}
