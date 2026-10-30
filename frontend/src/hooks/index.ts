import { useCallback, useEffect, useRef, useState } from "react";
import { api, getErrorMessage } from "../lib/api";
import type { Blog, BlogFeedResponse } from "../types";

interface UseBlogFeedOptions {
    query?: string;
    tag?: string;
}

export function useDebouncedValue<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

export function useBlogFeed({ query = "", tag }: UseBlogFeedOptions = {}) {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const requestIdRef = useRef(0);
    const loadingMoreRef = useRef(false);

    const buildParams = useCallback(
        (nextPage: number) => {
            const params: Record<string, string | number> = { page: nextPage, limit: 10 };
            const trimmedQuery = query.trim();

            if (trimmedQuery) params.q = trimmedQuery;
            if (tag && tag !== "all") params.tag = tag;

            return params;
        },
        [query, tag]
    );

    useEffect(() => {
        const requestId = ++requestIdRef.current;
        const controller = new AbortController();

        setLoading(true);
        setError(null);
        setPage(1);
        loadingMoreRef.current = false;
        setLoadingMore(false);

        api.get<BlogFeedResponse>("/api/v1/blog/bulk", {
            params: buildParams(1),
            signal: controller.signal,
        })
            .then((response) => {
                if (requestId !== requestIdRef.current) return;

                setBlogs(response.data.blogs ?? []);
                setHasMore(Boolean(response.data.pagination?.hasMore));
                setTotal(response.data.pagination?.total ?? 0);
            })
            .catch((err) => {
                if (controller.signal.aborted || requestId !== requestIdRef.current) return;

                setError(getErrorMessage(err, "Could not load stories"));
                setBlogs([]);
                setHasMore(false);
                setTotal(0);
            })
            .finally(() => {
                if (requestId === requestIdRef.current) setLoading(false);
            });

        return () => controller.abort();
    }, [buildParams, reloadKey]);

    const loadMore = useCallback(async () => {
        if (loading || loadingMoreRef.current || !hasMore) return;

        const requestId = requestIdRef.current;
        const nextPage = page + 1;
        loadingMoreRef.current = true;
        setLoadingMore(true);

        try {
            const response = await api.get<BlogFeedResponse>("/api/v1/blog/bulk", {
                params: buildParams(nextPage),
            });

            // A new search/tag request may have started while this page was loading.
            if (requestId !== requestIdRef.current) return;

            setBlogs((previous) => {
                const seen = new Set(previous.map((blog) => blog.id));
                const next = response.data.blogs.filter((blog) => !seen.has(blog.id));
                return [...previous, ...next];
            });
            setPage(nextPage);
            setHasMore(Boolean(response.data.pagination?.hasMore));
            setTotal(response.data.pagination?.total ?? 0);
        } catch (err) {
            if (requestId === requestIdRef.current) {
                setError(getErrorMessage(err, "Could not load more stories"));
            }
        } finally {
            loadingMoreRef.current = false;
            setLoadingMore(false);
        }
    }, [buildParams, hasMore, loading, page]);

    const removeBlog = useCallback((id: string) => {
        setBlogs((previous) => previous.filter((blog) => blog.id !== id));
        setTotal((previous) => Math.max(0, previous - 1));
    }, []);

    const refetch = useCallback(() => {
        setReloadKey((key) => key + 1);
    }, []);

    return {
        blogs,
        total,
        hasMore,
        loading,
        loadingMore,
        error,
        loadMore,
        removeBlog,
        refetch,
    };
}

export function useBlog({ id }: { id: string }) {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError("Missing blog id");
            return;
        }

        const controller = new AbortController();
        let active = true;

        setLoading(true);
        setError(null);
        setBlog(null);

        api.get<{ blog: Blog }>(`/api/v1/blog/${id}`, { signal: controller.signal })
            .then((response) => {
                if (active) setBlog(response.data.blog ?? null);
            })
            .catch((err) => {
                if (controller.signal.aborted || !active) return;
                setError(getErrorMessage(err, "Could not load this story"));
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            controller.abort();
        };
    }, [id]);

    return { blog, loading, error };
}
