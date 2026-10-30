export function Footer() {
    return (
        <footer className="mt-20 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
                <p>© {new Date().getFullYear()} Blogs Platform. Built for developers and storytellers.</p>
                <p className="font-medium text-slate-700 dark:text-slate-300">
                    Crafted with modern full-stack edge tech.
                </p>
            </div>
        </footer>
    );
}
