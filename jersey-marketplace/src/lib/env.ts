import { z } from "zod";

// Treat empty-string env vars as undefined so optional URL/token fields don't
// fail Zod's url validator when someone leaves a line like `R2_PUBLIC_URL=`
// in .env.local before they've obtained the real value.
const emptyToUndef = <T extends z.ZodTypeAny>(s: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), s);

const optUrl = () => emptyToUndef(z.string().url().optional());
const optStr = () => emptyToUndef(z.string().optional());

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),

  VIPPS_ENV: z.enum(["test", "prod"]).default("test"),
  VIPPS_CLIENT_ID: optStr(),
  VIPPS_CLIENT_SECRET: optStr(),
  VIPPS_SUBSCRIPTION_KEY: optStr(),
  VIPPS_REDIRECT_URI: optUrl(),

  STRIPE_SECRET_KEY: optStr(),
  STRIPE_PUBLISHABLE_KEY: optStr(),
  STRIPE_WEBHOOK_SECRET: optStr(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optStr(),

  R2_ACCOUNT_ID: optStr(),
  R2_ACCESS_KEY_ID: optStr(),
  R2_SECRET_ACCESS_KEY: optStr(),
  R2_BUCKET: optStr(),
  R2_PUBLIC_URL: optUrl(),

  SOKETI_APP_ID: optStr(),
  SOKETI_APP_KEY: optStr(),
  SOKETI_APP_SECRET: optStr(),
  SOKETI_HOST: optStr(),
  SOKETI_PORT: emptyToUndef(z.coerce.number().optional()),
  NEXT_PUBLIC_SOKETI_KEY: optStr(),
  NEXT_PUBLIC_SOKETI_HOST: optStr(),
  NEXT_PUBLIC_SOKETI_PORT: emptyToUndef(z.coerce.number().optional()),

  INNGEST_EVENT_KEY: optStr(),
  INNGEST_SIGNING_KEY: optStr(),

  RESEND_API_KEY: optStr(),
  EMAIL_FROM: optStr(),

  ANTHROPIC_API_KEY: optStr(),
  TRANSLATION_MODEL: z.string().default("claude-haiku-4-5-20251001"),

  SENTRY_DSN: optStr(),
  AXIOM_TOKEN: optStr(),
  AXIOM_DATASET: optStr(),
  NEXT_PUBLIC_POSTHOG_KEY: optStr(),
  NEXT_PUBLIC_POSTHOG_HOST: optUrl(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors,
  );
  throw new Error("Invalid environment — see OUTSTANDING_SETUP.md");
}

export const env = parsed.data;
