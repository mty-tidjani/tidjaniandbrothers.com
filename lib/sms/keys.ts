import crypto from "node:crypto";

const KEY_PREFIX = "tbsms_";
const DISPLAY_PREFIX_LENGTH = KEY_PREFIX.length + 8;

export function generateApiKey() {
  const secret = `${KEY_PREFIX}${crypto.randomBytes(32).toString("base64url")}`;
  return {
    secret,
    keyPrefix: secret.slice(0, DISPLAY_PREFIX_LENGTH),
    keyHash: hashApiKey(secret),
  };
}

export function hashApiKey(secret: string): string {
  return crypto.createHash("sha256").update(secret).digest("hex");
}

/** Accepts `Authorization: Bearer <key>` or `X-API-Key: <key>`. */
export function extractApiKey(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim() || null;
  }
  return request.headers.get("x-api-key")?.trim() || null;
}
