import type { ReactNode } from "react";
import { AppBar } from "./AppBar";
import { Footer } from "./Footer";

interface LayoutProps {
    children: ReactNode;
    /** Override the page background, e.g. for the reading view. */
    background?: string;
    mainClassName?: string;
}

export function Layout({
    children,
    background = "bg-slate-50 dark:bg-slate-950",
    mainClassName = "",
}: LayoutProps) {
    return (
        <div
            className={`min-h-screen flex flex-col ${background} text-slate-900 dark:text-slate-100 transition-colors duration-200`}
        >
            <AppBar />
            <div className={`flex-1 ${mainClassName}`}>{children}</div>
            <Footer />
        </div>
    );
}
