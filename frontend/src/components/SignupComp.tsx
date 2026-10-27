import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, User, KeyRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { BACKEND_URL } from "../config";
import axios from "axios";

export function SignupComp({ type }: { type: 'signup' | 'signin' }) {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();

    const isSignup = type === 'signup';

    async function sendRequest(e: React.FormEvent) {
        e.preventDefault();

        if (!name.trim() || !password.trim()) {
            showToast("Please fill in all fields", "error");
            return;
        }

        if (password.length < 6) {
            showToast("Password must be at least 6 characters", "error");
            return;
        }

        setLoading(true);
        try {
            const endpoint = isSignup ? "/api/v1/user/signup" : "/api/v1/user/signin";
            const res = await axios.post(`${BACKEND_URL}${endpoint}`, {
                name,
                password,
            });

            // Handle both { token, name } or raw token string format
            const token = res.data?.token || res.data;
            const userName = res.data?.name || name;

            if (token && typeof token === "string") {
                login(token, userName);
                showToast(isSignup ? "Account created successfully!" : "Welcome back!", "success");
                navigate("/blogs");
            } else {
                throw new Error("Invalid response format");
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || err.response?.data?.message || "Authentication failed";
            showToast(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-4 sm:px-6 py-12 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Brand header */}
                <div className="text-center mb-8">
                    <Link to="/blogs" className="inline-flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                            <Sparkles className="w-5 h-5" />
                        </div>
                    </Link>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white">
                        {isSignup ? "Join our publishing community" : "Welcome back to Blogs"}
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        {isSignup
                            ? "Start sharing your technical articles, tutorials, and insights today."
                            : "Enter your credentials to access your published posts."}
                    </p>
                </div>

                {/* Form card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={sendRequest} className="space-y-5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="your_username"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/40 transition-all text-sm"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 disabled:opacity-50 transition-all active:scale-[0.99]"
                        >
                            <span>{loading ? "Authenticating..." : isSignup ? "Create Account" : "Sign In"}</span>
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-sm text-slate-400">
                        {isSignup ? (
                            <span>
                                Already have an account?{" "}
                                <Link to="/signin" className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 ml-1">
                                    Sign In
                                </Link>
                            </span>
                        ) : (
                            <span>
                                Don't have an account?{" "}
                                <Link to="/signup" className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 ml-1">
                                    Sign Up
                                </Link>
                            </span>
                        )}
                    </div>
                </div>

                <div className="text-center mt-6">
                    <Link to="/blogs" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
                        ← Continue reading as guest
                    </Link>
                </div>
            </div>
        </div>
    );
}