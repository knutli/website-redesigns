import { db } from "@/lib/db";
import { report, user as userTable } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { ReportActions } from "./report-actions";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const rows = await db
    .select({
      id: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      kind: report.kind,
      reason: report.reason,
      details: report.details,
      status: report.status,
      createdAt: report.createdAt,
      reporterHandle: userTable.handle,
      reporterName: userTable.name,
    })
    .from(report)
    .innerJoin(userTable, eq(userTable.id, report.reporterId))
    .where(eq(report.status, "open"))
    .orderBy(desc(report.createdAt));

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg">Reports ({rows.length} open)</h2>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-text-tertiary">
          No open reports. All clear.
        </div>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.id}>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {r.kind === "fake" ? (
                      <span className="rounded-pill bg-red-400 px-2 py-0.5 text-[10px] font-semibold text-white">
                        FAKE
                      </span>
                    ) : null}
                    <span className="text-xs uppercase tracking-badge text-text-tertiary">
                      {r.targetType} · {r.targetId.slice(0, 8)}
                    </span>
                  </div>
                  <span className="text-xs text-text-tertiary">
                    {r.reporterHandle ? `@${r.reporterHandle}` : r.reporterName}
                  </span>
                </div>
                <p className="text-sm text-foreground">{r.reason}</p>
                {r.details ? (
                  <p className="text-xs text-text-secondary">{r.details}</p>
                ) : null}
                <ReportActions reportId={r.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
