import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    glow?: boolean
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
    ({ className, variant = 'primary', size = 'md', glow = false, children, ...props }, ref) => {

        const variants = {
            primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border border-violet-500/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.5)]",
            secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
            ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
            danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
        }

        const sizes = {
            sm: "px-3 py-1.5 text-sm",
            md: "px-4 py-2",
            lg: "px-6 py-3 text-lg"
        }

        return (
            <motion.button
                ref={ref as any}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                    "relative rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2",
                    variants[variant],
                    sizes[size],
                    glow && "shadow-[0_0_15px_rgba(124,58,237,0.3)]",
                    className
                )}
                {...(props as any)}
            >
                {children}
                {variant === 'primary' && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/20 to-white/0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                )}
            </motion.button>
        )
    }
)

PremiumButton.displayName = "PremiumButton"
