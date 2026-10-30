import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PenSquare, LogOut, Sun, Moon, Sparkles, BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Avatar } from "./Avatar";

export function AppBar() {
    const { user, token, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const displayName = user?.name || "Writer";

    const handleLogout = () => {
        logout();
        navigate("/signin");
    };

    return (
        <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo & Brand */}
                    <div className="flex items-center gap-3">
                        <Link to="/blogs" className="flex items-center gap-2.5 group">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                                Blogs.
                            </span>
                        </Link>
                    </div>

                    {/* Action buttons & Avatar */}
                    <div className="flex items-center gap-3 sm:gap-4">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                        </button>

                        {token ? (
                            <>
                                <Link
                                    to="/blog"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <PenSquare className="w-4 h-4" />
                                    <span className="hidden sm:inline">Write Blog</span>
                                </Link>

                                {/* User Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        aria-label="Open account menu"
                                        aria-haspopup="menu"
                                        aria-expanded={dropdownOpen}
                                        className="flex items-center gap-2 p-1 rounded-full ring-2 ring-transparent hover:ring-emerald-500/40 transition-all focus:outline-none focus-visible:ring-emerald-500/60"
                                    >
                                        <Avatar name={displayName} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Signed in as</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
                                                    {displayName}
                                                </p>
                                            </div>

                                            <Link
                                                to="/blogs"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                                All Stories
                                            </Link>

                                            <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/signin"
                                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
