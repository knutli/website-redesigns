"use client";

import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function SuspectedFakeButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!reason.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "listing",
          targetId: listingId,
          kind: "fake",
          reason: reason.slice(0, 100),
          details: reason,
        }),
      });
      if (res.ok) setSent(true);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
        Thanks — our authenticity team will take a look.
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="text-destructive">
        <ShieldAlert className="mr-1.5 h-4 w-4" />
        Suspected fake?
      </Button>
    );
  }

  return (
    <Card className="border-destructive/30">
      <CardContent className="space-y-2 p-3">
        <Label className="text-destructive">Tell us what looks wrong</Label>
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Font doesn't match the era, suspicious badge, etc."
        />
        <div className="flex gap-2">
          <Button size="sm" variant="destructive" onClick={submit} disabled={!reason.trim() || busy}>
            Send
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
