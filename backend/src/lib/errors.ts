import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ErrorCode =
    | "VALIDATION_ERROR"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "USERNAME_TAKEN"
    | "INVALID_CREDENTIALS"
    | "INTERNAL_ERROR";

export type ApiErrorBody = {
    error: {
        code: ErrorCode;
        message: string;
        details?: unknown;
    };
};

/**
 * Standard error response for the whole API:
 * { "error": { "code": "UNAUTHORIZED", "message": "...", "details"?: ... } }
 */
export function apiError(
    c: Context,
    status: ContentfulStatusCode,
    code: ErrorCode,
    message: string,
    details?: unknown
) {
    const error: ApiErrorBody["error"] = { code, message };
    if (details !== undefined) {
        error.details = details;
    }

    return c.json<ApiErrorBody>({ error }, status);
}
