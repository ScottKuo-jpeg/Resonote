import { ReactNode, HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    hoverEffect?: boolean
}

export function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg",
                hoverEffect && "hover:bg-white/10 hover:shadow-xl transition-all duration-300",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
