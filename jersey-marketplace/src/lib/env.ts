import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  NEXT_PUBLIC_APP_URL: z.string().url(),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),

  VIPPS_ENV: z.enum(["test", "prod"]).default("test"),
  VIPPS_CLIENT_ID: z.string().optional(),
  VIPPS_CLIENT_SECRET: z.string().optional(),
  VIPPS_SUBSCRIPTION_KEY: z.string().optional(),
  VIPPS_REDIRECT_URI: z.string().url().optional(),

  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  SOKETI_APP_ID: z.string().optional(),
  SOKETI_APP_KEY: z.string().optional(),
  SOKETI_APP_SECRET: z.string().optional(),
  SOKETI_HOST: z.string().optional(),
  SOKETI_PORT: z.coerce.number().optional(),
  NEXT_PUBLIC_SOKETI_KEY: z.string().optional(),
  NEXT_PUBLIC_SOKETI_HOST: z.string().optional(),
  NEXT_PUBLIC_SOKETI_PORT: z.coerce.number().optional(),

  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  SENTRY_DSN: z.string().optional(),
  AXIOM_TOKEN: z.string().optional(),
  AXIOM_DATASET: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
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
