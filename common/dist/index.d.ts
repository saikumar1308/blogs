import { z } from "zod";
export declare const TAG_OPTIONS: readonly ["tech", "design", "ai", "startup", "personal"];
export type Tag = (typeof TAG_OPTIONS)[number];
export declare const tagInput: z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodEnum<["tech", "design", "ai", "startup", "personal"]>>;
export declare const signupInput: z.ZodObject<{
    name: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    password: string;
}, {
    name: string;
    password: string;
}>;
export type SignupType = z.infer<typeof signupInput>;
export declare const signinInput: z.ZodObject<{
    name: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    name: string;
    password: string;
}, {
    name: string;
    password: string;
}>;
export type SigninType = z.infer<typeof signinInput>;
export declare const createPostInput: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodString;
    tags: z.ZodDefault<z.ZodArray<z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodEnum<["tech", "design", "ai", "startup", "personal"]>>, "many">>;
}, "strip", z.ZodTypeAny, {
    title: string;
    content: string;
    tags: ("tech" | "design" | "ai" | "startup" | "personal")[];
}, {
    title: string;
    content: string;
    tags?: string[] | undefined;
}>;
export type CreatePostType = z.infer<typeof createPostInput>;
export declare const updatePostInput: z.ZodEffects<z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodPipeline<z.ZodEffects<z.ZodString, string, string>, z.ZodEnum<["tech", "design", "ai", "startup", "personal"]>>, "many">>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    content?: string | undefined;
    tags?: ("tech" | "design" | "ai" | "startup" | "personal")[] | undefined;
}, {
    title?: string | undefined;
    content?: string | undefined;
    tags?: string[] | undefined;
}>, {
    title?: string | undefined;
    content?: string | undefined;
    tags?: ("tech" | "design" | "ai" | "startup" | "personal")[] | undefined;
}, {
    title?: string | undefined;
    content?: string | undefined;
    tags?: string[] | undefined;
}>;
export type UpdatePostType = z.infer<typeof updatePostInput>;
