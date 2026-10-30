import { useParams, Link } from "react-router-dom";
import { FullBlogCard } from "../components/FullBlogCard";
import { Layout } from "../components/Layout";
import { useBlog } from "../hooks";
import { usePageMeta } from "../hooks/usePageMeta";
import { ArrowLeft } from "lucide-react";

export function Blog() {
    const { id } = useParams();
    const { blog, loading, error } = useBlog({ id: id || "" });

    const description = blog
        ? blog.content.replace(/\s+/g, " ").trim().slice(0, 160)
        : "Read the latest stories on Blogs.";

    usePageMeta({
        title: blog?.title ?? "Story",
        description,
        type: "article",
    });

    return (
        <Layout background="bg-white dark:bg-slate-950">
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
                <div className="text-center py-24 px-4">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        Story not found
                    </h1>
                    <p className="text-slate-500 mt-2">
                        {error || "The article you are looking for may have been removed or does not exist."}
                    </p>
                    <Link
                        to="/blogs"
                        className="mt-6 inline-flex items-center gap-2 text-emerald-600 font-semibold hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to all stories
                    </Link>
                </div>
            ) : (
                <FullBlogCard
                    id={blog.id}
                    Author={blog.author?.name || "Author"}
                    authorId={blog.authorId}
                    title={blog.title}
                    content={blog.content}
                    Date={blog.time}
                    updatedAt={blog.updatedAt}
                    tags={blog.tags}
                />
            )}
        </Layout>
    );
}
