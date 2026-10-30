import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Layout } from "../components/Layout";
import { usePageMeta } from "../hooks/usePageMeta";

export function NotFound() {
    usePageMeta({
        title: "Page not found",
        description: "The page you are looking for does not exist.",
    });

    return (
        <Layout>
            <div className="max-w-xl mx-auto px-4 py-24 text-center">
                <Compass className="w-14 h-14 text-emerald-500 mx-auto mb-5" />
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                    404
                </p>
                <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                    This page wandered off
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-3">
                    The link may be broken, or the story may have been removed.
                </p>
                <Link
                    to="/blogs"
                    className="mt-7 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to all stories
                </Link>
            </div>
        </Layout>
    );
}
