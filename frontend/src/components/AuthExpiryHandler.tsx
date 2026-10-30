import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { UNAUTHORIZED_EVENT } from "../lib/api";

/**
 * Global listener for expired sessions: shows one toast and redirects only when
 * the user is on a protected authoring route.
 */
export function AuthExpiryHandler() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const handleUnauthorized = () => {
            showToast("Your session expired. Please sign in again.", "error");

            const path = window.location.pathname;
            if (path === "/blog" || path.startsWith("/blog/edit")) {
                navigate("/signin", { replace: true });
            }
        };

        window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
        return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    }, [navigate, showToast]);

    return null;
}
