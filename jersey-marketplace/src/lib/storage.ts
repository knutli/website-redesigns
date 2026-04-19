import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

export const r2 =
  env.R2_ACCOUNT_ID && env.R2_ACCESS_KEY_ID && env.R2_SECRET_ACCESS_KEY
    ? new S3Client({
        region: "auto",
        endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
        },
      })
    : null;

export async function presignedUpload(key: string, contentType: string) {
  if (!r2 || !env.R2_BUCKET) throw new Error("R2 is not configured");
  const cmd = new PutObjectCommand({
    Bucket: env.R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(r2, cmd, { expiresIn: 60 });
}

export function publicImageUrl(key: string, opts?: { w?: number; h?: number; fit?: "cover" | "contain" }) {
  if (!env.R2_PUBLIC_URL) return `/${key}`;
  const base = env.R2_PUBLIC_URL.replace(/\/$/, "");
  if (!opts) return `${base}/${key}`;
  // Cloudflare Image Resizing URL format
  const params: string[] = [];
  if (opts.w) params.push(`width=${opts.w}`);
  if (opts.h) params.push(`height=${opts.h}`);
  if (opts.fit) params.push(`fit=${opts.fit}`);
  params.push("format=auto", "quality=82");
  return `${base}/cdn-cgi/image/${params.join(",")}/${key}`;
}
