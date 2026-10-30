interface AvatarProps {
    name?: string;
    size?: "sm" | "md" | "lg";
}

export function Avatar({ name, size = "md" }: AvatarProps) {
    const initial = (name?.trim().charAt(0) || "U").toUpperCase();
    const sizeClasses = {
        sm: "w-7 h-7 text-xs",
        md: "w-9 h-9 text-sm",
        lg: "w-12 h-12 text-base font-semibold",
    }[size];

    return (
        <div
            aria-hidden="true"
            className={`relative inline-flex items-center justify-center ${sizeClasses} rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-medium shadow-sm shrink-0`}
        >
            <span>{initial}</span>
        </div>
    );
}
