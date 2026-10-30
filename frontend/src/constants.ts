export const TAGS = ["All", "Tech", "Design", "AI", "Startup", "Personal"] as const;

export const POST_TAGS = ["tech", "design", "ai", "startup", "personal"] as const;

export type TagFilter = (typeof TAGS)[number];

export function displayTag(tag: string): string {
    return tag.length ? tag.charAt(0).toUpperCase() + tag.slice(1) : tag;
}
