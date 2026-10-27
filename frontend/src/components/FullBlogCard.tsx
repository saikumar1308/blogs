import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, Trash2, Edit3, Heart, Share2, Check } from "lucide-react";
import { Avatar } from "./AppBar";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import axios from "axios";
import { BACKEND_URL } from "../config";
import confetti from "canvas-confetti";

interface FullBlogCardProps {
    id: string;
    title: string;
    content: string;
    Author: string;
    authorId?: string;
    Date: string;
}

export function FullBlogCard({ id, Author, title, content, Date: dateStr, authorId }: FullBlogCardProps) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [likes, setLikes] = useState(12);
    const [liked, setLiked] = useState(false);
    const [copied, setCopied] = useState(false);

    const isAuthor = user && (user.name === Author || user.id === authorId);

    const wordCount = content?.trim().split(/\s+/).length || 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));

    const formattedDate = (() => {
        try {
            return new Date(dateStr).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            });
        } catch {
            return dateStr?.slice(0, 10);
        }
    })();

    const handleClap = () => {
        if (!liked) {
            setLikes(l => l + 1);
            setLiked(true);
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.8 }
            });
        } else {
            setLikes(l => l - 1);
            setLiked(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        showToast("Link copied to clipboard!", "info");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this story?")) return;
        try {
            await axios.delete(`${BACKEND_URL}/api/v1/blog/${id}`, {
                headers: { Authorization: localStorage.getItem("token") }
            });
            showToast("Blog post deleted successfully", "success");
            navigate("/blogs");
        } catch {
            showToast("Failed to delete blog post", "error");
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
                        <Link to={`/blog/edit/${id}`}>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
                                <Edit3 className="w-3.5 h-3.5" /> Edit
                            </button>
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Post Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-6">
                {title}
            </h1>

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
                        </div>
                    </div>
                </div>

                {/* Social interactions: like & share */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleClap}
                        className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                            liked
                                ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900 dark:text-rose-400"
                                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                        }`}
                    >
                        <Heart className={`w-4 h-4 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
                        <span>{likes}</span>
                    </button>

                    <button
                        onClick={handleShare}
                        className="p-2 border border-slate-200 dark:border-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
                        title="Copy link"
                    >
                        {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Content Body formatted gracefully */}
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
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Written by {Author}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Contributor and writer sharing thoughts, development patterns, and ideas on Blogs.
                    </p>
                </div>
            </div>
        </article>
    );
}