import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Calendar, ArrowRight, Trash2, Loader2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { displayTag } from "../constants";

interface BlogCardProps {
    id: string;
    title: string;
    content: string;
    Author: string;
    authorId?: string;
    Date: string;
    updatedAt?: string;
    tags?: string[];
    onDelete?: (id: string) => Promise<void> | void;
}

function formatDate(dateStr: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
        return dateStr.slice(0, 10);
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function wasEdited(time: string, updatedAt?: string) {
    if (!updatedAt || !time) return false;
    const created = new Date(time).getTime();
    const updated = new Date(updatedAt).getTime();
    if (Number.isNaN(created) || Number.isNaN(updated)) return false;
    return updated - created > 60_000;
}

export function BlogCard({
    Author,
    title,
    content,
    Date: dateStr,
    updatedAt,
    tags = [],
    id,
    authorId,
    onDelete,
}: BlogCardProps) {
    const { user } = useAuth();
    const [deleting, setDeleting] = useState(false);
    const isAuthor = Boolean(user && (user.id ? user.id === authorId : user.name === Author));

    // Estimate reading time: ~180 words per minute.
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));
    const formattedDate = formatDate(dateStr);

    const handleDelete = async () => {
        if (!onDelete || deleting) return;
        if (!window.confirm("Are you sure you want to delete this blog?")) return;

        setDeleting(true);
        try {
            await onDelete(id);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <article className="group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1">
            {/* Author info row */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Avatar name={Author} size="sm" />
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {Author}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{formattedDate}</span>
                        </div>
                        {wasEdited(dateStr, updatedAt) && (
                            <span className="hidden sm:inline text-slate-400 dark:text-slate-500">
                                · edited
                            </span>
                        )}
                    </div>
                </div>

                {isAuthor && onDelete && (
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        aria-label={`Delete ${title}`}
                        className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-50 transition-colors"
                        title="Delete article"
                    >
                        {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                )}
            </div>

            {/* Clickable post preview */}
            <Link to={`/blog/${id}`} className="block">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 line-clamp-2">
                    {title}
                </h2>
                <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed line-clamp-3">
                    {content}
                </p>
            </Link>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                            {displayTag(tag)}
                        </span>
                    ))}
                </div>
            )}

            {/* Footer row */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-medium text-slate-600 dark:text-slate-300">
                    <Clock className="w-3.5 h-3.5" />
                    {readingTime} min read
                </span>

                <Link
                    to={`/blog/${id}`}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform"
                >
                    Read article <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </article>
    );
}

export function BlogCardSkeleton() {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
            </div>
            <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-3"></div>
            <div className="space-y-2 mb-6">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-24"></div>
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20"></div>
            </div>
        </div>
    );
}
