"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function resolve(status: "resolved" | "dismissed") {
    setBusy(true);
    try {
      await fetch(`/api/admin/reports/${reportId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2 pt-1">
      <Button size="compact" onClick={() => resolve("resolved")} disabled={busy}>
        Resolve
      </Button>
      <Button size="compact" variant="ghost" onClick={() => resolve("dismissed")} disabled={busy}>
        Dismiss
      </Button>
    </div>
  );
}
