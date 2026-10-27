import { useParams, Link } from "react-router-dom";
import { FullBlogCard } from "../components/FullBlogCard";
import { useBlog } from "../hooks";
import { AppBar } from "../components/AppBar";
import { ArrowLeft } from "lucide-react";

export function Blog() {
    const { id } = useParams();
    const { blog, loading } = useBlog({ id: id || "" });

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
            <AppBar />

            {loading ? (
                <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28 mb-8"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4"></div>
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mb-10"></div>
                    <div className="space-y-4">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-4/6"></div>
                    </div>
                </div>
            ) : !blog ? (
                <div className="text-center py-24">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Story not found</h2>
                    <p className="text-slate-500 mt-2">The article you are looking for may have been removed or does not exist.</p>
                    <Link to="/blogs" className="mt-6 inline-flex items-center gap-2 text-emerald-600 font-semibold hover:underline">
                        <ArrowLeft className="w-4 h-4" /> Back to all stories
                    </Link>
                </div>
            ) : (
                <FullBlogCard
                    id={blog.id}
                    Author={blog.author.name}
                    authorId={blog.authorId}
                    title={blog.title}
                    content={blog.content}
                    Date={blog.time}
                />
            )}

            <footer className="mt-20 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    © 2026 Blogs Platform. All rights reserved.
                </div>
            </footer>
        </div>
    );
}