import { useEffect } from "react";

interface PageMeta {
    title: string;
    description?: string;
    type?: "website" | "article";
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);

    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }

    element.setAttribute("content", content);
}

/**
 * Keeps document title and the social/SEO meta tags in sync with the current page.
 */
export function usePageMeta({ title, description, type = "website" }: PageMeta) {
    useEffect(() => {
        const previousTitle = document.title;
        const pageTitle = title ? `${title} · Blogs` : "Blogs";

        document.title = pageTitle;
        upsertMeta("property", "og:title", pageTitle);
        upsertMeta("property", "og:type", type);
        upsertMeta("name", "twitter:card", "summary_large_image");
        upsertMeta("name", "twitter:title", pageTitle);

        if (description) {
            upsertMeta("name", "description", description);
            upsertMeta("property", "og:description", description);
            upsertMeta("name", "twitter:description", description);
        }

        return () => {
            document.title = previousTitle;
        };
    }, [title, description, type]);
}
