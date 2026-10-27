import { useState, useEffect } from "react";
import { AppBar } from "../components/AppBar";
import { BACKEND_URL } from "../config";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { ArrowLeft, Send, Eye, Code } from "lucide-react";

export function BlogPost() {
    const { id } = useParams(); // If present, edit mode!
    const isEditMode = Boolean(id);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
    const [submitting, setSubmitting] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEditMode);

    const navigate = useNavigate();
    const { showToast } = useToast();

    // Fetch existing post data if in edit mode
    useEffect(() => {
        if (!isEditMode) return;
        const fetchExisting = async () => {
            try {
                const res = await axios.get(`${BACKEND_URL}/api/v1/blog/${id}`, {
                    headers: { Authorization: localStorage.getItem("token") }
                });
                if (res.data?.blog) {
                    setTitle(res.data.blog.title);
                    setContent(res.data.blog.content);
                }
            } catch {
                showToast("Failed to load blog for editing", "error");
            } finally {
                setInitialLoading(false);
            }
        };
        fetchExisting();
    }, [id, isEditMode, showToast]);

    const handleSubmit = async () => {
        if (!title.trim()) {
            showToast("Please enter a title for your blog post", "error");
            return;
        }
        if (!content.trim()) {
            showToast("Content cannot be empty", "error");
            return;
        }

        setSubmitting(true);
        try {
            if (isEditMode) {
                await axios.put(
                    `${BACKEND_URL}/api/v1/blog`,
                    { id, title, content },
                    { headers: { Authorization: localStorage.getItem("token") } }
                );
                showToast("Post updated successfully!", "success");
                navigate(`/blog/${id}`);
            } else {
                const response = await axios.post(
                    `${BACKEND_URL}/api/v1/blog`,
                    { title, content },
                    { headers: { Authorization: localStorage.getItem("token") } }
                );
                showToast("Post published successfully!", "success");
                navigate(`/blog/${response.data.id}`);
            }
        } catch {
            showToast(isEditMode ? "Failed to update blog post" : "Failed to publish blog post", "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
                <AppBar />
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <AppBar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                {/* Header bar */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Cancel
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Tab switcher: Write vs Preview */}
                        <div className="bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
                            <button
                                onClick={() => setActiveTab("write")}
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
                            <Send className="w-4 h-4" />
                            <span>{submitting ? "Publishing..." : isEditMode ? "Save Changes" : "Publish"}</span>
                        </button>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
                    {activeTab === "write" ? (
                        <div className="space-y-6">
                            <div>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Story title..."
                                    className="w-full text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent border-none outline-none focus:ring-0 px-0"
                                />
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800" />

                            <div>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={14}
                                    placeholder="Tell your story... (paragraphs, thoughts, insights)"
                                    className="w-full text-lg leading-relaxed text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent border-none outline-none focus:ring-0 resize-y px-0 font-serif"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Live preview tab */
                        <div className="space-y-6">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                                {title || <span className="text-slate-300 dark:text-slate-700 italic">Untitled Story</span>}
                            </h1>
                            <hr className="border-slate-100 dark:border-slate-800" />
                            <div className="text-slate-800 dark:text-slate-200 text-lg leading-relaxed font-serif space-y-4">
                                {content ? (
                                    content.split(/\n+/).map((p, idx) => <p key={idx}>{p}</p>)
                                ) : (
                                    <p className="text-slate-400 dark:text-slate-600 italic">No content written yet.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}