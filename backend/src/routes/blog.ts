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

// Pagination & search
blogRouter.get('/bulk', async (c) => {
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "10");
    const search = c.req.query("q") || "";
    const skip = (page - 1) * limit;

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    const whereClause: any = {};
    if (search.trim()) {
        whereClause.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { content: { contains: search, mode: 'insensitive' } }
        ];
    }

    const [blogs, total] = await Promise.all([
        prisma.blog.findMany({
            where: whereClause,
            skip: skip,
            take: limit,
            orderBy: {
                time: 'desc'
            },
            select: {
                id: true,
                title: true,
                content: true,
                time: true,
                authorId: true,
                author: {
                    select: {
                        name: true,
                    }
                }
            }
        }),
        prisma.blog.count({ where: whereClause })
    ]);

    return c.json({
        blogs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    })
})

blogRouter.delete('/:id', async (c) => {
    const id = c.req.param("id")
    const authorId = c.get("userId")
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL
    }).$extends(withAccelerate())

    try {
        const existing = await prisma.blog.findUnique({
            where: { id }
        });

        if (!existing) {
            c.status(404);
            return c.json({ error: "Blog not found" });
        }

        if (existing.authorId !== authorId) {
            c.status(403);
            return c.json({ error: "You are not authorized to delete this blog" });
        }

        await prisma.blog.delete({
            where: { id }
        });

        return c.json({ message: "Blog deleted successfully" });
    } catch {
        c.status(500);
        return c.json({ error: "Failed to delete blog post" });
    }
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
                authorId: true,
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
