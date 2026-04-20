"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import type { JerseyAnalysis } from "@/app/api/analyze-jersey/route";

type Destination = "locker" | "auction" | "fixed";

const KIT_TYPES = ["Home", "Away", "Third", "Training", "Special"] as const;

function Suggestion({ value, onAccept }: { value: string | null; onAccept: (v: string) => void }) {
  if (!value) return null;
  return (
    <button
      type="button"
      onClick={() => onAccept(value)}
      className="mt-1 inline-flex items-center gap-1 rounded-pill border border-green-400/30 bg-green-900/50 px-2.5 py-0.5 text-xs text-green-300 transition-colors hover:bg-green-900"
    >
      Suggested: {value}
    </button>
  );
}

export function UploadWizard({ userId: _userId }: { userId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Step state
  const [step, setStep] = useState<"images" | "analyzing" | "form">("images");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<JerseyAnalysis | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [club, setClub] = useState("");
  const [season, setSeason] = useState("");
  const [player, setPlayer] = useState("");
  const [size, setSize] = useState("");
  const [condition, setCondition] = useState(7);
  const [kitType, setKitType] = useState("");
  const [brand, setBrand] = useState("");
  const [authenticity, setAuthenticity] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState<Destination>("locker");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    setFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      const url = URL.createObjectURL(f);
      setPreviews((prev) => [...prev, url]);
    });
  }, []);

  const removeFile = useCallback((idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  async function analyzeImages() {
    if (files.length === 0) return;
    setStep("analyzing");
    setError(null);

    const fd = new FormData();
    files.forEach((f) => fd.append("images", f));

    try {
      const res = await fetch("/api/analyze-jersey", { method: "POST", body: fd });
      if (res.ok) {
        const { analysis: a } = (await res.json()) as { analysis: JerseyAnalysis };
        setAnalysis(a);
        if (a.condition) setCondition(a.condition);
      }
    } catch {
      // AI failed — user fills manually, no big deal
    }
    setStep("form");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const fd = new FormData();
    fd.set("title", title);
    fd.set("club", club);
    fd.set("season", season);
    fd.set("player", player);
    fd.set("size", size);
    fd.set("condition", `${condition}/10`);
    fd.set("kitType", kitType);
    fd.set("brand", brand);
    fd.set("authenticity", authenticity);
    fd.set("description", description);
    fd.set("destination", destination);
    files.forEach((f) => fd.append("images", f));

    try {
      const res = await fetch("/api/jerseys", { method: "POST", body: fd });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Upload failed");
      }
      router.push(destination === "locker" ? "/locker" : "/selling");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step 1: Images ──
  if (step === "images") {
    return (
      <div className="space-y-4">
        {previews.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square overflow-hidden rounded-md bg-card-hover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-1 top-1 rounded-full bg-background/80 p-1 backdrop-blur-sm"
                  aria-label="Remove"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-green-400/50 hover:bg-card"
          >
            <ImagePlus className="h-8 w-8 text-text-tertiary" />
            <span className="text-sm font-medium text-foreground">Choose photos</span>
            <span className="text-xs text-text-tertiary">From your files</span>
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center transition-colors hover:border-green-400/50 hover:bg-card"
          >
            <Camera className="h-8 w-8 text-text-tertiary" />
            <span className="text-sm font-medium text-foreground">Take a photo</span>
            <span className="text-xs text-text-tertiary">Use camera</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />

        <p className="text-center text-xs text-text-tertiary">
          Upload at least 2 photos — front and back. First photo is the cover.
        </p>

        {files.length > 0 ? (
          <Button onClick={analyzeImages} className="w-full" size="lg">
            Analyze {files.length} photo{files.length > 1 ? "s" : ""} with AI
          </Button>
        ) : null}
      </div>
    );
  }

  // ── Step 2: Analyzing ──
  if (step === "analyzing") {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-green-400" />
        <div>
          <p className="font-semibold text-foreground">Analyzing your jersey...</p>
          <p className="mt-1 text-sm text-text-tertiary">
            AI is identifying the team, season, and condition
          </p>
        </div>
      </div>
    );
  }

  // ── Step 3: Form with AI suggestions ──
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image preview strip */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {previews.map((src, i) => (
          <div key={i} className="h-16 w-16 shrink-0 overflow-hidden rounded-sm bg-card-hover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-full w-full object-cover" />
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-sm border border-dashed border-border text-text-tertiary hover:border-green-400/50"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Manchester United Home '99" />
            <Suggestion value={analysis?.title ?? null} onAccept={setTitle} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="club">Club</Label>
              <Input id="club" value={club} onChange={(e) => setClub(e.target.value)} />
              <Suggestion value={analysis?.club ?? null} onAccept={setClub} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="season">Season</Label>
              <Input id="season" value={season} onChange={(e) => setSeason(e.target.value)} placeholder="e.g. 1998/99" />
              <Suggestion value={analysis?.season ?? null} onAccept={setSeason} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="player">Player (optional)</Label>
              <Input id="player" value={player} onChange={(e) => setPlayer(e.target.value)} />
              <Suggestion value={analysis?.player ?? null} onAccept={setPlayer} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="size">Size</Label>
              <Input id="size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. L" />
              <Suggestion value={analysis?.size ?? null} onAccept={setSize} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Nike, adidas" />
              <Suggestion value={analysis?.brand ?? null} onAccept={setBrand} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kitType">Type</Label>
              <div className="flex flex-wrap gap-1.5">
                {KIT_TYPES.map((kt) => (
                  <button
                    key={kt}
                    type="button"
                    onClick={() => setKitType(kt)}
                    className={`rounded-pill border px-3 py-1.5 text-xs font-medium transition-colors ${
                      kitType === kt
                        ? "border-green-400 bg-green-400 text-white"
                        : "border-border bg-card text-text-secondary hover:text-foreground"
                    }`}
                  >
                    {kt}
                  </button>
                ))}
              </div>
              <Suggestion value={analysis?.kitType ?? null} onAccept={setKitType} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="condition">Condition: {condition}/10</Label>
            <input
              id="condition"
              type="range"
              min={1}
              max={10}
              value={condition}
              onChange={(e) => setCondition(Number(e.target.value))}
              className="w-full accent-green-400"
            />
            <div className="flex justify-between text-[10px] text-text-tertiary">
              <span>Poor</span>
              <span>Fair</span>
              <span>Good</span>
              <span>Excellent</span>
              <span>Mint</span>
            </div>
            {analysis?.condition ? (
              <Suggestion value={`${analysis.condition}/10`} onAccept={() => setCondition(analysis.condition!)} />
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="authenticity">Authenticity</Label>
            <div className="flex gap-2">
              {["Original", "Replica"].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAuthenticity(a)}
                  className={`rounded-pill border px-4 py-1.5 text-xs font-medium transition-colors ${
                    authenticity === a
                      ? "border-green-400 bg-green-400 text-white"
                      : "border-border bg-card text-text-secondary hover:text-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
            <Suggestion value={analysis?.authenticity ?? null} onAccept={setAuthenticity} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border-[1.5px] border-border-light bg-background px-3.5 py-3 text-sm text-foreground placeholder:text-text-tertiary focus:border-green-400 focus:outline-none"
              placeholder="Notable features, defects, history..."
            />
            <Suggestion value={analysis?.description ?? null} onAccept={setDescription} />
          </div>
        </CardContent>
      </Card>

      {/* Destination */}
      <Card>
        <CardContent className="space-y-3 p-4">
          <Label>What do you want to do?</Label>
          <div className="grid gap-2 md:grid-cols-3">
            {(["locker", "auction", "fixed"] as Destination[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDestination(d)}
                className={`rounded-md border p-3 text-left text-sm transition-colors ${
                  destination === d ? "border-green-400 bg-green-400/10" : "border-border hover:bg-card-hover"
                }`}
              >
                <div className="font-medium text-foreground">
                  {d === "locker" ? "Keep in Locker" : d === "auction" ? "Start auction" : "Buy now"}
                </div>
                <div className="text-xs text-text-tertiary">
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
            <div className="grid gap-4 pt-2 md:grid-cols-2">
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
            <div className="grid gap-2 pt-2">
              <Label htmlFor="buyNowPrice">Price (NOK)</Label>
              <Input id="buyNowPrice" name="buyNowPrice" type="number" min={0} required />
            </div>
          ) : null}
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting
          ? "Uploading…"
          : destination === "locker"
            ? "Add to locker"
            : "Submit for review"}
      </Button>
    </form>
  );
}
