import { Hono } from "hono";
import { signupInput, signinInput } from "@saikumar1308/common-blogs";
import { hashPassword, verifyPassword } from "../crypto";
import { createToken, extractToken, verifyToken } from "../lib/auth";
import { apiError } from "../lib/errors";
import type { AppEnv } from "../lib/env";
import { getPrisma } from "../lib/prisma";

export const userRouter = new Hono<AppEnv>();

userRouter.get("/me", async (c) => {
    const token = extractToken(c.req.header("Authorization"));

    if (!token) {
        return apiError(c, 401, "UNAUTHORIZED", "Authentication required");
    }

    let userId: string;
    try {
        userId = await verifyToken(token, c.env.JWT_SECRET);
    } catch {
        return apiError(c, 401, "UNAUTHORIZED", "Invalid or expired token");
    }

    const prisma = getPrisma(c.env);
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true },
    });

    if (!user) {
        return apiError(c, 401, "UNAUTHORIZED", "Account no longer exists");
    }

    return c.json({ user });
});

userRouter.post("/signup", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = signupInput.safeParse(body);

    if (!parsed.success) {
        return apiError(
            c,
            400,
            "VALIDATION_ERROR",
            "Please check the form and try again",
            parsed.error.flatten().fieldErrors
        );
    }

    const prisma = getPrisma(c.env);

    try {
        const hashedPassword = await hashPassword(parsed.data.password);
        const user = await prisma.user.create({
            data: {
                name: parsed.data.name,
                password: hashedPassword,
            },
            select: { id: true, name: true },
        });

        const token = await createToken(user.id, c.env.JWT_SECRET);
        return c.json({ token, user }, 201);
    } catch (error) {
        const code = (error as { code?: string })?.code;

        if (code === "P2002") {
            return apiError(c, 409, "USERNAME_TAKEN", "That username is already taken");
        }

        console.error("signup failed", error);
        return apiError(c, 500, "INTERNAL_ERROR", "Could not create your account");
    }
});

userRouter.post("/signin", async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = signinInput.safeParse(body);

    if (!parsed.success) {
        return apiError(
            c,
            400,
            "VALIDATION_ERROR",
            "Please check the form and try again",
            parsed.error.flatten().fieldErrors
        );
    }

    const prisma = getPrisma(c.env);

    try {
        const user = await prisma.user.findUnique({
            where: { name: parsed.data.name },
        });

        if (!user) {
            return apiError(c, 401, "INVALID_CREDENTIALS", "Incorrect username or password");
        }

        const isValid = await verifyPassword(parsed.data.password, user.password);
        if (!isValid) {
            return apiError(c, 401, "INVALID_CREDENTIALS", "Incorrect username or password");
        }

        // Transparently upgrade legacy plain-text passwords to PBKDF2 hashes.
        if (!user.password.includes(":")) {
            const upgraded = await hashPassword(parsed.data.password);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: upgraded },
            });
        }

        const token = await createToken(user.id, c.env.JWT_SECRET);
        return c.json({ token, user: { id: user.id, name: user.name } });
    } catch (error) {
        console.error("signin failed", error);
        return apiError(c, 500, "INTERNAL_ERROR", "Could not sign you in");
    }
});
