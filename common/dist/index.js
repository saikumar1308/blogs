"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePostInput = exports.createPostInput = exports.signinInput = exports.signupInput = exports.tagInput = exports.TAG_OPTIONS = void 0;
const zod_1 = require("zod");
exports.TAG_OPTIONS = ["tech", "design", "ai", "startup", "personal"];
exports.tagInput = zod_1.z
    .string()
    .trim()
    .transform((tag) => tag.toLowerCase())
    .pipe(zod_1.z.enum(exports.TAG_OPTIONS, {
    errorMap: () => ({
        message: `Tags must be one of: ${exports.TAG_OPTIONS.join(", ")}`,
    }),
}));
exports.signupInput = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(32, "Username must be 32 characters or fewer")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be 128 characters or fewer"),
});
exports.signinInput = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, "Username is required").max(32),
    password: zod_1.z.string().min(1, "Password is required").max(128),
});
exports.createPostInput = zod_1.z.object({
    title: zod_1.z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(200, "Title must be 200 characters or fewer"),
    content: zod_1.z
        .string()
        .trim()
        .min(1, "Content is required")
        .max(100000, "Content is too long"),
    tags: zod_1.z.array(exports.tagInput).max(5, "A post can have at most 5 tags").default([]),
});
exports.updatePostInput = zod_1.z
    .object({
    title: zod_1.z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(200, "Title must be 200 characters or fewer")
        .optional(),
    content: zod_1.z
        .string()
        .trim()
        .min(1, "Content is required")
        .max(100000, "Content is too long")
        .optional(),
    tags: zod_1.z.array(exports.tagInput).max(5, "A post can have at most 5 tags").optional(),
})
    .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
});
