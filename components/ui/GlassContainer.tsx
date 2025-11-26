import { HTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface GlassContainerProps extends HTMLAttributes<HTMLDivElement> {
    intensity?: 'low' | 'medium' | 'high'
    border?: boolean
}

export const GlassContainer = forwardRef<HTMLDivElement, GlassContainerProps>(
    ({ className, intensity = 'medium', border = true, children, ...props }, ref) => {

        const intensities = {
            low: "bg-black/20 backdrop-blur-sm",
            medium: "bg-black/40 backdrop-blur-md",
            high: "bg-black/60 backdrop-blur-xl"
        }

        return (
            <div
                ref={ref}
                className={cn(
                    intensities[intensity],
                    border && "border border-white/10",
                    "rounded-2xl shadow-xl",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

GlassContainer.displayName = "GlassContainer"
