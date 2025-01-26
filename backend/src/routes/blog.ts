import { PrismaClient } from "@prisma/client/edge"
import { withAccelerate } from "@prisma/extension-accelerate"
import { createPostInput, updatePostInput } from "@saikumar1308/common-blogs"
import { Hono } from "hono"
import { verify } from "hono/jwt"

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId:string,
    }
}>()

blogRouter.use('/*',async (c, next) => {
    const header = c.req.header("Authorization") || ""
    const user = await verify(header, c.env.JWT_SECRET)

    if(user){
        // @ts-ignore
        c.set("userId",user.id)
        await next()
    }else {
        c.status(403)
        return c.json({
            message: "Not logged in!"
        })
    }
})

blogRouter.post('/', async (c) => {
    const body = await c.req.json()
    const { success } = createPostInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    const blog = await prisma.blog.create({
        data:{
            title: body.title,
            content:body.content,
            authorId: authorId
        }
    })
    return c.json({id: blog.id})
})

blogRouter.put('/',async (c) => {
    const body = await c.req.json()
    const { success } = updatePostInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({ error: "invalid input" });
	}
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const blog = await prisma.blog.update({
        where:{
            id: body.id
        },
        data:{
            title: body.title,
            content: body.content,
        }
    })
    return c.json({id: blog.id})
})

// Add pagination
blogRouter.get('/bulk',async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())
    const blogs = await prisma.blog.findMany({
        select:{
            id:true,
            title:true,
            content:true,
            time:true,
            author:{
                select:{
                    name:true,
                }
            }
        }
    })
    return c.json({blogs})
})

blogRouter.get('/:id',async (c) => {
    const id = c.req.param("id")
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.blog.findFirst({
            where:{
                id: id
            },
            select:{
                id:true,
                title:true,
                content:true,
                time:true,
                author:{
                    select:{
                        name:true,
                    }
                }
            }
        })
        return c.json({blog})
    } catch (error) {
        c.status(411)
        return c.json({
            message: "Error while fetching blog post"
        })
    }
    
})
