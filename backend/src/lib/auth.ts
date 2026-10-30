import { createMiddleware } from "hono/factory";
import { sign, verify } from "hono/jwt";
import type { JWTPayload } from "hono/utils/jwt/types";
import { apiError } from "./errors";
import type { AppEnv } from "./env";

export const JWT_ISSUER = "blogs-api";
export const JWT_AUDIENCE = "blogs-web";
export const JWT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export function extractToken(authorizationHeader: string | undefined): string {
    const raw = (authorizationHeader ?? "").trim();
    if (!raw) return "";
    return raw.startsWith("Bearer ") ? raw.slice("Bearer ".length).trim() : raw;
}

export async function createToken(userId: string, secret: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const payload: JWTPayload = {
        sub: userId,
        // Keep `id` for backwards compatibility with any older clients.
        id: userId,
        iat: now,
        exp: now + JWT_TTL_SECONDS,
        iss: JWT_ISSUER,
        aud: JWT_AUDIENCE,
    };

    return sign(payload, secret);
}

/**
 * Verifies signature, expiry, issuer and audience, then returns the user id.
 */
export async function verifyToken(token: string, secret: string): Promise<string> {
    if (!token) {
        throw new Error("Missing token");
    }

    const payload = await verify(token, secret);
    const now = Math.floor(Date.now() / 1000);

    if (typeof payload.exp !== "number" || payload.exp <= now) {
        throw new Error("Token expired");
    }
    if (payload.iss !== JWT_ISSUER || payload.aud !== JWT_AUDIENCE) {
        throw new Error("Invalid token claims");
    }

    const userId =
        typeof payload.sub === "string"
            ? payload.sub
            : typeof payload.id === "string"
              ? payload.id
              : null;

    if (!userId) {
        throw new Error("Token is missing a subject");
    }

    return userId;
}

/**
 * Applied only to write endpoints. Public reading endpoints stay open.
 */
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
    const token = extractToken(c.req.header("Authorization"));

    if (!token) {
        return apiError(c, 401, "UNAUTHORIZED", "Authentication required");
    }

    try {
        const userId = await verifyToken(token, c.env.JWT_SECRET);
        c.set("userId", userId);
    } catch {
        return apiError(c, 401, "UNAUTHORIZED", "Invalid or expired token");
    }

    await next();
});
