import { useState, useMemo } from "react";
import { AppBar } from "../components/AppBar";
import { BlogCard, BlogCardSkeleton } from "../components/BlogCard";
import { useBlogs } from "../hooks";
import { Search, Sparkles, Layers, PenLine } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import axios from "axios";
import { BACKEND_URL } from "../config";

export function AllBlogs() {
    const { blogs, loading, setBlogs } = useBlogs();
    const { showToast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("All");

    const tags = ["All", "Tech", "Design", "AI", "Startup", "Personal"];

    const filteredBlogs = useMemo(() => {
        return blogs.filter((blog) => {
            const matchesSearch =
                blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                blog.author.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSearch;
        });
    }, [blogs, searchQuery]);

    const handleDeleteBlog = async (id: string) => {
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/blog/${id}`, {
                headers: { Authorization: localStorage.getItem("token") }
            });
            setBlogs((prev) => prev.filter((b) => b.id !== id));
            showToast("Blog post deleted successfully", "success");
        } catch {
            showToast("Failed to delete post", "error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <AppBar />

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
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search articles by title, topic, or author..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder:text-slate-400 shadow-sm"
                            />
                        </div>

                        {/* Category filter pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                            {tags.map((tag) => (
                                <button
                                    key={tag}
                                    onClick={() => setSelectedTag(tag)}
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
                {loading ? (
                    <div className="space-y-6">
                        <BlogCardSkeleton />
                        <BlogCardSkeleton />
                        <BlogCardSkeleton />
                    </div>
                ) : filteredBlogs.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm">
                        <Layers className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No articles found</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                            {searchQuery ? `No matches for "${searchQuery}". Try different keywords.` : "Be the first to share your thoughts with the community!"}
                        </p>
                        <Link to="/blog">
                            <button className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all">
                                <PenLine className="w-4 h-4" />
                                Write First Blog
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredBlogs.map((blog) => (
                            <BlogCard
                                key={blog.id}
                                id={blog.id}
                                Author={blog.author?.name || "Author"}
                                authorId={blog.authorId}
                                title={blog.title}
                                content={blog.content}
                                Date={blog.time}
                                onDelete={handleDeleteBlog}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="mt-20 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
                    <p>© 2026 Blogs Platform. Built for developers and storytellers.</p>
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                        Crafted with modern full-stack edge tech.
                    </p>
                </div>
            </footer>
        </div>
    );
}