import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Sparkles, Layers, PenLine, Loader2, RefreshCw, X } from "lucide-react";
import { BlogCard, BlogCardSkeleton } from "../components/BlogCard";
import { Layout } from "../components/Layout";
import { useBlogFeed, useDebouncedValue } from "../hooks";
import { usePageMeta } from "../hooks/usePageMeta";
import { useToast } from "../context/ToastContext";
import { api, getErrorMessage } from "../lib/api";
import { TAGS, type TagFilter } from "../constants";

export function AllBlogs() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<TagFilter>("All");
    const { showToast } = useToast();

    const debouncedQuery = useDebouncedValue(searchQuery.trim(), 300);
    const activeTag = selectedTag === "All" ? undefined : selectedTag.toLowerCase();

    const {
        blogs,
        total,
        hasMore,
        loading,
        loadingMore,
        error,
        loadMore,
        removeBlog,
        refetch,
    } = useBlogFeed({ query: debouncedQuery, tag: activeTag });

    usePageMeta({
        title: "All stories",
        description:
            "Discover thoughtfully crafted articles from engineers, designers, and creators worldwide.",
    });

    const handleDeleteBlog = async (id: string) => {
        try {
            await api.delete(`/api/v1/blog/${id}`);
            removeBlog(id);
            showToast("Blog post deleted successfully", "success");
        } catch (err) {
            showToast(getErrorMessage(err, "Failed to delete post"), "error");
        }
    };

    const resetFilters = () => {
        setSearchQuery("");
        setSelectedTag("All");
    };

    const hasFilters = Boolean(searchQuery.trim()) || selectedTag !== "All";

    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 mb-4">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>The Modern Publishing Platform</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                            Explore perspectives, code stories & ideas.
                        </h1>
                        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
                            Discover thoughtfully crafted articles from engineers, designers, and creators worldwide.
                        </p>
                    </div>

                    {/* Search & Tag row */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search articles"
                                placeholder="Search articles by title, topic, or author..."
                                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-slate-400 shadow-sm"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    aria-label="Clear search"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Category filter pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                            {TAGS.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
                                    aria-pressed={selectedTag === tag}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                                        selectedTag === tag
                                            ? "bg-emerald-600 text-white shadow-sm"
                                            : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Main feed list */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {!loading && !error && (
                    <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">
                        {total} {total === 1 ? "story" : "stories"}
                        {hasFilters ? " match your filters" : ""}
                    </p>
                )}

                {error && blogs.length > 0 && (
                    <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
                        <span>{error}</span>
                        <button onClick={refetch} className="font-semibold underline underline-offset-2">
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="space-y-6">
                        <BlogCardSkeleton />
                        <BlogCardSkeleton />
                        <BlogCardSkeleton />
                    </div>
                ) : error && blogs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
                        <RefreshCw className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Could not load stories
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            {error}
                        </p>
                        <button
                            onClick={refetch}
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Try again
                        </button>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
                        <Layers className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No articles found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            {hasFilters
                                ? "No stories match those filters. Try different keywords or a different tag."
                                : "Be the first to share your thoughts with the community!"}
                        </p>
                        {hasFilters ? (
                            <button
                                onClick={resetFilters}
                                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all"
                            >
                                Clear filters
                            </button>
                        ) : (
                            <Link
                                to="/blog"
                                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all"
                            >
                                <PenLine className="w-4 h-4" />
                                Write First Blog
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            {blogs.map((blog) => (
                                <BlogCard
                                    key={blog.id}
                                    id={blog.id}
                                    Author={blog.author?.name || "Author"}
                                    authorId={blog.authorId}
                                    title={blog.title}
                                    content={blog.content}
                                    Date={blog.time}
                                    updatedAt={blog.updatedAt}
                                    tags={blog.tags}
                                    onDelete={handleDeleteBlog}
                                />
                            ))}
                        </div>

                        {hasMore && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-400 hover:shadow-md disabled:opacity-60 transition-all"
                                >
                                    {loadingMore ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Loading...
                                        </>
                                    ) : (
                                        "Load more stories"
                                    )}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </Layout>
    );
}
