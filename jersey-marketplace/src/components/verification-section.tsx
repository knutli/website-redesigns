import { Shield, Check } from "lucide-react";

type Step = { text: string; completed: boolean };

type Props = {
  steps: Step[];
};

export function VerificationSection({ steps }: Props) {
  return (
    <div className="px-4 pt-5">
      <div className="rounded-lg border border-sage/25 bg-sage-900 p-4.5" style={{ padding: 18 }}>
        {/* Header */}
        <div className="mb-3 flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage">
            <Shield className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold tracking-tight text-foreground">
              Verified Authentic
            </h3>
            <p className="text-xs text-green-300">Passed all checks</p>
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2.5">
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  step.completed
                    ? "bg-sage/30"
                    : "border-[1.5px] border-sage/30"
                }`}
              >
                {step.completed ? (
                  <Check className="h-2.5 w-2.5 text-green-300" strokeWidth={3} />
                ) : null}
              </div>
              <p className="text-sm text-text-secondary" style={{ lineHeight: 1.4 }}>
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
