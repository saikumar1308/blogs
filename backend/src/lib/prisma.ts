import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import type { AppBindings } from "./env";

/**
 * Prisma clients are created per request, which is the recommended pattern for
 * serverless/edge runtimes using Prisma Accelerate.
 */
export function getPrisma(env: Pick<AppBindings, "DATABASE_URL">) {
    return new PrismaClient({
        datasourceUrl: env.DATABASE_URL,
    }).$extends(withAccelerate());
}
