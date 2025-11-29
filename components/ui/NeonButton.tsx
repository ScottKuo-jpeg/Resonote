import { ReactNode, ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface NeonButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: "primary" | "secondary"
}

export function NeonButton({
    children,
    className,
    variant = "primary",
    ...props
}: NeonButtonProps) {
    const baseStyles = "relative px-6 py-3 font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"

    const variantStyles = {
        primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/50 hover:shadow-violet-500/70 hover:scale-105",
        secondary: "border-2 border-violet-500 text-violet-400 hover:bg-violet-500/10 hover:shadow-lg hover:shadow-violet-500/30"
    }

    return (
        <button
            className={cn(
                baseStyles,
                variantStyles[variant],
                className
            )}
            {...props}
        >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />

            {/* Content */}
            <span className="relative z-10">{children}</span>
        </button>
    )
}
