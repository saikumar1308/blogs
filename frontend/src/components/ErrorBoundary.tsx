import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error("Unhandled UI error", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
                    <div className="text-center max-w-md">
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Something went wrong
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">
                            The page hit an unexpected error. Reloading usually fixes it.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all"
                        >
                            Reload page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
