import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, Trash2, Edit3, Share2, Check, Loader2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api, getErrorMessage } from "../lib/api";
import { displayTag } from "../constants";

interface FullBlogCardProps {
    id: string;
    title: string;
    content: string;
    Author: string;
    authorId?: string;
    Date: string;
    updatedAt?: string;
    tags?: string[];
}

function formatDate(dateStr?: string) {
    if (!dateStr) return "";
    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) {
        return dateStr.slice(0, 10);
    }

    return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function wasEdited(time?: string, updatedAt?: string) {
    if (!updatedAt || !time) return false;
    const created = new Date(time).getTime();
    const updated = new Date(updatedAt).getTime();
    if (Number.isNaN(created) || Number.isNaN(updated)) return false;
    return updated - created > 60_000;
}

export function FullBlogCard({
    id,
    Author,
    title,
    content,
    Date: dateStr,
    updatedAt,
    tags = [],
    authorId,
}: FullBlogCardProps) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isAuthor = Boolean(user && (user.id ? user.id === authorId : user.name === Author));

    const wordCount = content?.trim().split(/\s+/).filter(Boolean).length || 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));
    const formattedDate = formatDate(dateStr);

    const handleShare = async () => {
        const url = window.location.href;

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(url);
            } else {
                window.prompt("Copy this link:", url);
            }

            setCopied(true);
            showToast("Link copied to clipboard!", "info");
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            window.prompt("Copy this link:", url);
            showToast("Copy the link from the prompt", "info");
        }
    };

    const handleDelete = async () => {
        if (deleting) return;
        if (!window.confirm("Are you sure you want to permanently delete this story?")) return;

        setDeleting(true);
        try {
            await api.delete(`/api/v1/blog/${id}`);
            showToast("Blog post deleted successfully", "success");
            navigate("/blogs");
        } catch (err) {
            showToast(getErrorMessage(err, "Failed to delete blog post"), "error");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            {/* Back navigation */}
            <div className="flex items-center justify-between mb-8">
                <Link
                    to="/blogs"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to feed
                </Link>

                {isAuthor && (
                    <div className="flex items-center gap-2">
                        <Link
                            to={`/blog/edit/${id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <Edit3 className="w-3.5 h-3.5" /> Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 disabled:opacity-60 rounded-lg transition-colors"
                        >
                            {deleting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                            )}
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Post Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-5">
                {title}
            </h1>

            {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-6">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60"
                        >
                            {displayTag(tag)}
                        </span>
                    ))}
                </div>
            )}

            {/* Author bar & post stats */}
            <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-slate-200/80 dark:border-slate-800/80 mb-10">
                <div className="flex items-center gap-4">
                    <Avatar name={Author} size="lg" />
                    <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-base sm:text-lg">
                            {Author}
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {readingTime} min read
                            </span>
                            {wasEdited(dateStr, updatedAt) && (
                                <span className="text-slate-400 dark:text-slate-500">· edited</span>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    {copied ? "Copied" : "Share"}
                </button>
            </div>

            {/* Content Body */}
            <div className="prose prose-lg dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed font-serif text-lg sm:text-xl space-y-6">
                {content?.split(/\n+/).map((paragraph, index) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;
                    return (
                        <p key={index} className="leading-relaxed">
                            {trimmed}
                        </p>
                    );
                })}
            </div>

            {/* Author Footer Card */}
            <div className="mt-16 p-6 sm:p-8 bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center gap-5">
                <Avatar name={Author} size="lg" />
                <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Written by {Author}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Contributor sharing thoughts, development patterns, and ideas on Blogs.
                    </p>
                </div>
            </div>
        </article>
    );
}
