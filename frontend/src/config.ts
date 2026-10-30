const rawBackendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim();

export const BACKEND_URL = rawBackendUrl
    ? rawBackendUrl.replace(/\/+$/, "")
    : import.meta.env.DEV
      ? "http://localhost:8787"
      : "";

if (!BACKEND_URL && import.meta.env.PROD) {
    console.error(
        "VITE_BACKEND_URL is not set. API requests will fail. Add it to your environment before building."
    );
}
