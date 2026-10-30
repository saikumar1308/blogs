import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";
import { apiError } from "./lib/errors";
import type { AppEnv } from "./lib/env";

const app = new Hono<AppEnv>();

app.use("*", secureHeaders());

app.use("/api/*", async (c, next) => {
    const configuredOrigins = (c.env.CORS_ORIGINS ?? "")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean);

    const corsMiddleware = cors({
        origin: (origin) => {
            // No allow-list configured: preserve the open default for local development.
            if (configuredOrigins.length === 0) return "*";
            return configuredOrigins.includes(origin) ? origin : null;
        },
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowHeaders: ["Content-Type", "Authorization"],
        maxAge: 600,
    });

    return corsMiddleware(c, next);
});

app.get("/health", (c) =>
    c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
    })
);

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

app.notFound((c) => apiError(c, 404, "NOT_FOUND", "Route not found"));

app.onError((error, c) => {
    console.error("Unhandled API error", error);
    return apiError(c, 500, "INTERNAL_ERROR", "Something went wrong. Please try again.");
});

export default app;
