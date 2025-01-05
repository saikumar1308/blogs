import { z } from "zod";

export const signupInput = z.object({
    name: z.string(),
    password: z.string()
});

export type SignupType = z.infer<typeof signupInput>

export const createPostInput = z.object({
    title: z.string(),
    content: z.string()
})

export type CreatePostType = z.infer<typeof createPostInput>

export const updatePostInput = z.object({
    title: z.string().optional(),
    content: z.string().optional()
})

export type UpdatePostType = z.infer<typeof updatePostInput>