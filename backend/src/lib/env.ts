export type AppBindings = {
    DATABASE_URL: string;
    JWT_SECRET: string;
    /** Optional comma-separated list of allowed frontend origins. */
    CORS_ORIGINS?: string;
};

export type AppVariables = {
    userId: string;
};

export type AppEnv = {
    Bindings: AppBindings;
    Variables: AppVariables;
};
