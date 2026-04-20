"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

type Destination = "locker" | "auction" | "fixed";

export function UploadWizard({ userId: _userId }: { userId: string }) {
  const router = useRouter();
  const [destination, setDestination] = useState<Destination>("locker");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    fd.set("destination", destination);
    for (const file of files) fd.append("images", file);

    try {
      const res = await fetch("/api/jerseys", { method: "POST", body: fd });
      if (!res.ok) throw new Error((await res.json()).error ?? "Upload failed");
      const { id } = (await res.json()) as { id: string };
      router.push(destination === "locker" ? "/locker" : `/selling?new=${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required placeholder="e.g. Rosenborg 1996 home, #10" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="club">Club</Label>
              <Input id="club" name="club" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="season">Season</Label>
              <Input id="season" name="season" placeholder="e.g. 1996/97" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="player">Player (optional)</Label>
              <Input id="player" name="player" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="size">Size</Label>
              <Input id="size" name="size" placeholder="e.g. L" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="condition">Condition</Label>
            <Input id="condition" name="condition" placeholder="e.g. Excellent, a couple of loose stitches" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" />
          </div>
          <div className="grid gap-2">
            <Label>Photos</Label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Upload at least 2 photos. First photo is the cover.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <Label>Destination</Label>
          <div className="grid gap-2 md:grid-cols-3">
            {(["locker", "auction", "fixed"] as Destination[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDestination(d)}
                className={`rounded-md border p-3 text-left text-sm transition ${
                  destination === d ? "border-primary bg-primary/10" : "hover:bg-accent"
                }`}
              >
                <div className="font-medium">
                  {d === "locker" ? "Keep in Locker" : d === "auction" ? "Start auction" : "Buy now"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {d === "locker"
                    ? "Show in your collection. No review."
                    : d === "auction"
                    ? "Live-bid listing. Needs admin approval."
                    : "Fixed price. Needs admin approval."}
                </div>
              </button>
            ))}
          </div>

          {destination === "auction" ? (
            <div className="grid gap-4 pt-3 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="startPrice">Start price (NOK)</Label>
                <Input id="startPrice" name="startPrice" type="number" min={0} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reservePrice">Reserve (optional)</Label>
                <Input id="reservePrice" name="reservePrice" type="number" min={0} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="durationHours">Duration (hours)</Label>
                <Input id="durationHours" name="durationHours" type="number" min={1} defaultValue={72} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="buyNowPrice">Buy-it-now (optional)</Label>
                <Input id="buyNowPrice" name="buyNowPrice" type="number" min={0} />
              </div>
            </div>
          ) : null}

          {destination === "fixed" ? (
            <div className="grid gap-2 pt-3">
              <Label htmlFor="buyNowPrice">Price (NOK)</Label>
              <Input id="buyNowPrice" name="buyNowPrice" type="number" min={0} required />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" disabled={submitting}>
        {submitting
          ? "Uploading…"
          : destination === "locker"
          ? "Add to locker"
          : "Submit for review"}
      </Button>
    </form>
  );
}
