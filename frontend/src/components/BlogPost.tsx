import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Layout } from "./Layout";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api, getErrorMessage } from "../lib/api";
import { POST_TAGS, displayTag } from "../constants";
import type { Blog } from "../types";
import { ArrowLeft, Send, Eye, Code, Loader2, Lock } from "lucide-react";

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 100_000;
const MAX_TAGS = 5;

export function BlogPost() {
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
    const [submitting, setSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [postAuthor, setPostAuthor] = useState<{ id: string; name: string } | null>(null);
    const [dirty, setDirty] = useState(false);

    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { showToast } = useToast();

    // Fetch existing post data if in edit mode.
    useEffect(() => {
        if (!isEditMode || !id) {
            setInitialLoading(false);
            return;
        }

        let active = true;
        setInitialLoading(true);
        setFetchError(null);

        api.get<{ blog: Blog }>(`/api/v1/blog/${id}`)
            .then((response) => {
                if (!active) return;

                const blog = response.data.blog;
                setTitle(blog.title);
                setContent(blog.content);
                setTags(blog.tags ?? []);
                setPostAuthor({ id: blog.authorId, name: blog.author?.name ?? "" });
                setDirty(false);
            })
            .catch((err) => {
                if (!active) return;
                setFetchError(getErrorMessage(err, "Failed to load this post for editing"));
            })
            .finally(() => {
                if (active) setInitialLoading(false);
            });

        return () => {
            active = false;
        };
    }, [id, isEditMode]);

    // Warn before leaving with unsaved changes.
    useEffect(() => {
        if (!dirty) return;

        const handler = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = "";
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [dirty]);

    const isForbidden =
        isEditMode &&
        !initialLoading &&
        !authLoading &&
        Boolean(user) &&
        Boolean(postAuthor) &&
        Boolean(
            user?.id
                ? postAuthor?.id !== user.id
                : postAuthor?.name !== user?.name
        );

    const toggleTag = (tag: string) => {
        setTags((previous) => {
            if (previous.includes(tag)) {
                return previous.filter((item) => item !== tag);
            }
            if (previous.length >= MAX_TAGS) {
                showToast(`You can add up to ${MAX_TAGS} tags`, "error");
                return previous;
            }
            return [...previous, tag];
        });
        setDirty(true);
    };

    const handleCancel = () => {
        if (dirty && !window.confirm("Discard your unsaved changes?")) return;
        navigate(-1);
    };

    const handleSubmit = async () => {
        const trimmedTitle = title.trim();
        const trimmedContent = content.trim();

        if (!trimmedTitle) {
            showToast("Please enter a title for your blog post", "error");
            return;
        }
        if (!trimmedContent) {
            showToast("Content cannot be empty", "error");
            return;
        }
        if (trimmedTitle.length > MAX_TITLE_LENGTH) {
            showToast(`Titles must be ${MAX_TITLE_LENGTH} characters or fewer`, "error");
            return;
        }
        if (trimmedContent.length > MAX_CONTENT_LENGTH) {
            showToast("This post is too long", "error");
            return;
        }

        setSubmitting(true);
        try {
            if (isEditMode && id) {
                await api.put(`/api/v1/blog/${id}`, {
                    title: trimmedTitle,
                    content: trimmedContent,
                    tags,
                });
                setDirty(false);
                showToast("Post updated successfully!", "success");
                navigate(`/blog/${id}`);
            } else {
                const response = await api.post<{ id: string }>("/api/v1/blog", {
                    title: trimmedTitle,
                    content: trimmedContent,
                    tags,
                });
                setDirty(false);
                showToast("Post published successfully!", "success");
                navigate(`/blog/${response.data.id}`);
            }
        } catch (err) {
            showToast(
                getErrorMessage(
                    err,
                    isEditMode ? "Failed to update blog post" : "Failed to publish blog post"
                ),
                "error"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (initialLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </Layout>
        );
    }

    if (isForbidden) {
        return (
            <Layout>
                <div className="max-w-xl mx-auto px-4 py-24 text-center">
                    <Lock className="w-12 h-12 text-rose-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        You can only edit your own posts
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        This story belongs to {postAuthor?.name || "another writer"}.
                    </p>
                    <button
                        onClick={() => navigate(`/blog/${id}`)}
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to the story
                    </button>
                </div>
            </Layout>
        );
    }

    if (fetchError) {
        return (
            <Layout>
                <div className="max-w-xl mx-auto px-4 py-24 text-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Could not open this post
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">{fetchError}</p>
                    <button
                        onClick={() => navigate("/blogs")}
                        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to all stories
                    </button>
                </div>
            </Layout>
        );
    }

    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordCount / 180));

    return (
        <Layout>
            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Header bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <button
                        onClick={handleCancel}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Cancel
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Tab switcher: Write vs Preview */}
                        <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
                            <button
                                onClick={() => setActiveTab("write")}
                                aria-pressed={activeTab === "write"}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    activeTab === "write"
                                        ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                        : "text-slate-600 dark:text-slate-400"
                                }`}
                            >
                                <span className="flex items-center gap-1.5">
                                    <Code className="w-3.5 h-3.5" /> Editor
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab("preview")}
                                aria-pressed={activeTab === "preview"}
                                className={`px-3 py-1.5 rounded-lg transition-all ${
                                    activeTab === "preview"
                                        ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                        : "text-slate-600 dark:text-slate-400"
                                }`}
                            >
                                <span className="flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5" /> Preview
                                </span>
                            </button>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 disabled:opacity-50 transition-all"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            <span>
                                {submitting
                                    ? isEditMode
                                        ? "Saving..."
                                        : "Publishing..."
                                    : isEditMode
                                      ? "Save Changes"
                                      : "Publish"}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
                    {activeTab === "write" ? (
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="post-title" className="sr-only">
                                    Post title
                                </label>
                                <input
                                    id="post-title"
                                    type="text"
                                    value={title}
                                    maxLength={MAX_TITLE_LENGTH}
                                    onChange={(e) => {
                                        setTitle(e.target.value);
                                        setDirty(true);
                                    }}
                                    placeholder="Story title..."
                                    className="w-full text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent border-none outline-none focus:ring-0 px-0"
                                />
                                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 text-right">
                                    {title.length}/{MAX_TITLE_LENGTH}
                                </p>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            <div>
                                <label htmlFor="post-content" className="sr-only">
                                    Post content
                                </label>
                                <textarea
                                    id="post-content"
                                    value={content}
                                    maxLength={MAX_CONTENT_LENGTH}
                                    onChange={(e) => {
                                        setContent(e.target.value);
                                        setDirty(true);
                                    }}
                                    rows={14}
                                    placeholder="Tell your story... (paragraphs, thoughts, insights)"
                                    className="w-full text-lg leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent border-none outline-none focus:ring-0 resize-y px-0 font-serif"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                                    Tags <span className="font-normal normal-case">(up to {MAX_TAGS})</span>
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {POST_TAGS.map((tag) => {
                                        const selected = tags.includes(tag);
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => toggleTag(tag)}
                                                aria-pressed={selected}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                                    selected
                                                        ? "bg-emerald-600 text-white border-emerald-600"
                                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-400"
                                                }`}
                                            >
                                                {displayTag(tag)}
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                                    {wordCount} words · {readingTime} min read
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Live preview tab */
                        <div className="space-y-6">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                                {title || (
                                    <span className="text-slate-300 dark:text-slate-700 italic">
                                        Untitled Story
                                    </span>
                                )}
                            </h1>

                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                                        >
                                            {displayTag(tag)}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <hr className="border-slate-100 dark:border-slate-800" />
                            <div className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed font-serif space-y-4">
                                {content ? (
                                    content
                                        .split(/\n+/)
                                        .map((paragraph, index) =>
                                            paragraph.trim() ? (
                                                <p key={index}>{paragraph.trim()}</p>
                                            ) : null
                                        )
                                ) : (
                                    <p className="text-slate-400 dark:text-slate-600 italic">
                                        No content written yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </Layout>
    );
}
