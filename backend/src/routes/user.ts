import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import { signupInput } from "@saikumar1308/common-blogs";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string,
    }
}>();

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
        const user = await prisma.user.create({
            data: {
                name: body.name,
                password: body.password
            }
        })

        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
        return c.json(jwt)
    } catch (error) {
        console.log(error)
        c.status(411)
        return c.json({ error: "error while signing up!!!" })
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
                password: body.password,
            }
        })

        if (!user) {
            c.status(403)
            return c.json({ error: "Incorrect Credentials" })
        }

        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
        return c.json(jwt)
    } catch (error) {
        console.log(error)
        c.status(411)
        return c.text('Invalid!')
    }

})