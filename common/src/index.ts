import { z } from "zod";

export const TAG_OPTIONS = ["tech", "design", "ai", "startup", "personal"] as const;
export type Tag = (typeof TAG_OPTIONS)[number];

export const tagInput = z
    .string()
    .trim()
    .transform((tag) => tag.toLowerCase())
    .pipe(
        z.enum(TAG_OPTIONS, {
            errorMap: () => ({
                message: `Tags must be one of: ${TAG_OPTIONS.join(", ")}`,
            }),
        })
    );

export const signupInput = z.object({
    name: z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(32, "Username must be 32 characters or fewer")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be 128 characters or fewer"),
});

export type SignupType = z.infer<typeof signupInput>;

export const signinInput = z.object({
    name: z.string().trim().min(1, "Username is required").max(32),
    password: z.string().min(1, "Password is required").max(128),
});

export type SigninType = z.infer<typeof signinInput>;

export const createPostInput = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(200, "Title must be 200 characters or fewer"),
    content: z
        .string()
        .trim()
        .min(1, "Content is required")
        .max(100_000, "Content is too long"),
    tags: z.array(tagInput).max(5, "A post can have at most 5 tags").default([]),
});

export type CreatePostType = z.infer<typeof createPostInput>;

export const updatePostInput = z
    .object({
        title: z
            .string()
            .trim()
            .min(1, "Title is required")
            .max(200, "Title must be 200 characters or fewer")
            .optional(),
        content: z
            .string()
            .trim()
            .min(1, "Content is required")
            .max(100_000, "Content is too long")
            .optional(),
        tags: z.array(tagInput).max(5, "A post can have at most 5 tags").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "At least one field is required",
    });

export type UpdatePostType = z.infer<typeof updatePostInput>;
