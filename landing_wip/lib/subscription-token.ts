import { createHmac, timingSafeEqual } from "node:crypto";

// Server-only. Short-lived HMAC magic-link tokens for /mi-suscripcion — no
// session/cookies needed, the link itself is the credential.
//
// Format: `${base64url(subscriberId.expiryEpochMs)}.${hexHmac}`

function getSecret(): string {
  const secret = process.env.EB_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "EB_AUTH_SECRET no está definido. Agregalo en .env.local (cualquier string largo y aleatorio)."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): string | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    return Buffer.from(padded + padding, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export function createToken(subscriberId: string, ttlMinutes = 30): string {
  const expiresAt = Date.now() + ttlMinutes * 60_000;
  const payload = toBase64Url(`${subscriberId}.${expiresAt}`);
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string): string | null {
  const dotIndex = token.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const payload = token.slice(0, dotIndex);
  const signature = token.slice(dotIndex + 1);

  const expected = sign(payload);
  const actual = Buffer.from(signature, "hex");
  const expectedBuf = Buffer.from(expected, "hex");
  if (actual.length !== expectedBuf.length || !timingSafeEqual(actual, expectedBuf)) {
    return null;
  }

  const decoded = fromBase64Url(payload);
  if (!decoded) return null;

  const separator = decoded.lastIndexOf(".");
  if (separator === -1) return null;

  const subscriberId = decoded.slice(0, separator);
  const expiresAt = Number(decoded.slice(separator + 1));
  if (!subscriberId || !Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

  return subscriberId;
}
