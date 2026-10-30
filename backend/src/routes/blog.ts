import { Prisma } from "@prisma/client/edge";
import { createPostInput, updatePostInput } from "@saikumar1308/common-blogs";
import { Hono } from "hono";
import { requireAuth } from "../lib/auth";
import { apiError } from "../lib/errors";
import type { AppEnv } from "../lib/env";
import { getPrisma } from "../lib/prisma";

export const blogRouter = new Hono<AppEnv>();

const MAX_SEARCH_LENGTH = 100;
const MAX_TAG_LENGTH = 24;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

function normalizeTags(tags: string[] | undefined): string[] {
    if (!tags?.length) return [];
    return Array.from(new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)));
}

// ---------------------------------------------------------------------------
// Public reading routes
// ---------------------------------------------------------------------------

// Pagination, search & tag filtering
blogRouter.get("/bulk", async (c) => {
    const parsedPage = Number.parseInt(c.req.query("page") ?? "", 10);
    const parsedLimit = Number.parseInt(c.req.query("limit") ?? "", 10);

    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    const limit =
        Number.isFinite(parsedLimit) && parsedLimit > 0
            ? Math.min(parsedLimit, MAX_LIMIT)
            : DEFAULT_LIMIT;

    const search = (c.req.query("q") ?? "").trim().slice(0, MAX_SEARCH_LENGTH);
    const tag = (c.req.query("tag") ?? "").trim().toLowerCase().slice(0, MAX_TAG_LENGTH);
    const skip = (page - 1) * limit;

    const where: Prisma.BlogWhereInput = {};

    if (search) {
        where.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { content: { contains: search, mode: "insensitive" } },
            { author: { name: { contains: search, mode: "insensitive" } } },
        ];
    }

    if (tag && tag !== "all") {
        where.tags = { has: tag };
    }

    const prisma = getPrisma(c.env);

    const [blogs, total] = await Promise.all([
        prisma.blog.findMany({
            where,
            skip,
            take: limit,
            orderBy: [{ time: "desc" }, { id: "desc" }],
            select: {
                id: true,
                title: true,
                content: true,
                tags: true,
                time: true,
                updatedAt: true,
                authorId: true,
                author: {
                    select: {
                        name: true,
                    },
                },
            },
        }),
        prisma.blog.count({ where }),
    ]);

    return c.json({
        blogs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: skip + blogs.length < total,
        },
    });
});

blogRouter.get("/:id", async (c) => {
    const id = c.req.param("id");
    const prisma = getPrisma(c.env);

    const blog = await prisma.blog.findUnique({
        where: { id },
        select: {
            id: true,
            title: true,
            content: true,
            tags: true,
            time: true,
            updatedAt: true,
            authorId: true,
            author: {
                select: {
                    name: true,
                },
            },
        },
    });

    if (!blog) {
        return apiError(c, 404, "NOT_FOUND", "Blog post not found");
    }

    return c.json({ blog });
});

// ---------------------------------------------------------------------------
// Protected authoring routes
// ---------------------------------------------------------------------------

blogRouter.post("/", requireAuth, async (c) => {
    const body = await c.req.json().catch(() => null);
    const parsed = createPostInput.safeParse(body);

    if (!parsed.success) {
        return apiError(
            c,
            400,
            "VALIDATION_ERROR",
            "Please check the post and try again",
            parsed.error.flatten().fieldErrors
        );
    }

    const authorId = c.get("userId");
    const prisma = getPrisma(c.env);

    const blog = await prisma.blog.create({
        data: {
            title: parsed.data.title,
            content: parsed.data.content,
            tags: normalizeTags(parsed.data.tags),
            authorId,
        },
        select: { id: true },
    });

    return c.json({ id: blog.id }, 201);
});

blogRouter.put("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const authorId = c.get("userId");

    const body = await c.req.json().catch(() => null);
    const parsed = updatePostInput.safeParse(body);

    if (!parsed.success) {
        return apiError(
            c,
            400,
            "VALIDATION_ERROR",
            "Please check the post and try again",
            parsed.error.flatten().fieldErrors
        );
    }

    const prisma = getPrisma(c.env);

    const existing = await prisma.blog.findUnique({
        where: { id },
        select: { authorId: true },
    });

    if (!existing) {
        return apiError(c, 404, "NOT_FOUND", "Blog post not found");
    }

    if (existing.authorId !== authorId) {
        return apiError(c, 403, "FORBIDDEN", "You can only edit your own posts");
    }

    const data: Prisma.BlogUpdateInput = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.content !== undefined) data.content = parsed.data.content;
    if (parsed.data.tags !== undefined) data.tags = normalizeTags(parsed.data.tags);

    const blog = await prisma.blog.update({
        where: { id },
        data,
        select: { id: true },
    });

    return c.json({ id: blog.id });
});

blogRouter.delete("/:id", requireAuth, async (c) => {
    const id = c.req.param("id");
    const authorId = c.get("userId");
    const prisma = getPrisma(c.env);

    const existing = await prisma.blog.findUnique({
        where: { id },
        select: { authorId: true },
    });

    if (!existing) {
        return apiError(c, 404, "NOT_FOUND", "Blog post not found");
    }

    if (existing.authorId !== authorId) {
        return apiError(c, 403, "FORBIDDEN", "You can only delete your own posts");
    }

    await prisma.blog.delete({ where: { id } });

    return c.json({ message: "Blog post deleted" });
});
