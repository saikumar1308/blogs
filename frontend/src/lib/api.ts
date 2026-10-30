import axios, { type AxiosError } from "axios";
import { BACKEND_URL } from "../config";

export const UNAUTHORIZED_EVENT = "blogs:unauthorized";

export const api = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const status = error.response?.status;
        const url = error.config?.url ?? "";
        const isAuthRoute =
            url.includes("/api/v1/user/signin") || url.includes("/api/v1/user/signup");

        // Let the auth screens show their own error message. Everywhere else, an
        // expired/invalid session clears local state and notifies the app.
        if (status === 401 && !isAuthRoute && localStorage.getItem("token")) {
            localStorage.removeItem("token");
            localStorage.removeItem("user_name");
            window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
        }

        return Promise.reject(error);
    }
);

export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as
            | { error?: { message?: string }; message?: string }
            | undefined;

        return data?.error?.message || data?.message || fallback;
    }

    if (error instanceof Error && error.message) {
        return error.message;
    }

    return fallback;
}
