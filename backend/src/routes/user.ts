import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'
import { signupInput } from "@saikumar1308/common-blogs";
import { hashPassword, verifyPassword } from "../crypto";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>();

userRouter.get('/me', async (c) => {
    const authHeader = c.req.header("Authorization") || "";
    try {
        const payload = await verify(authHeader, c.env.JWT_SECRET) as { id: string };
        if (!payload || !payload.id) {
            c.status(401);
            return c.json({ error: "Unauthorized" });
        }

        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: {
                id: true,
                name: true,
            }
        });

        if (!user) {
            c.status(404);
            return c.json({ error: "User not found" });
        }

        return c.json({ user });
    } catch {
        c.status(401);
        return c.json({ error: "Invalid token" });
    }
});

userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const body = await c.req.json()
    const { success } = signupInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
    try {
        const hashedPassword = await hashPassword(body.password);
        const user = await prisma.user.create({
            data: {
                name: body.name,
                password: hashedPassword,
            }
        })

        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
        return c.json({ token: jwt, name: user.name })
    } catch (error) {
        console.log(error)
        c.status(411)
        return c.json({ error: "Username already exists or error occurred" })
    }
})

userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const body = await c.req.json()
    const { success } = signupInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
    try {
        const user = await prisma.user.findUnique({
            where: {
                name: body.name,
            }
        })

        if (!user) {
            c.status(403)
            return c.json({ error: "Incorrect credentials" })
        }

        const isValid = await verifyPassword(body.password, user.password);
        if (!isValid) {
            c.status(403);
            return c.json({ error: "Incorrect credentials" });
        }

        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
        return c.json({ token: jwt, name: user.name })
    } catch (error) {
        console.log(error)
        c.status(411)
        return c.json({ error: "Sign in error" })
    }
})