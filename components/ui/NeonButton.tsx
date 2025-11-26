import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    isLoading?: boolean
    icon?: React.ReactNode
}

export function NeonButton({
    children,
    className,
    variant = 'primary',
    isLoading,
    icon,
    disabled,
    ...props
}: NeonButtonProps) {
    const variants = {
        primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] border-transparent",
        secondary: "bg-white/10 hover:bg-white/20 text-white border-white/10 hover:border-white/20 backdrop-blur-md",
        danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 hover:border-red-500/40",
        ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white border-transparent"
    }

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={cn(
                "relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 border",
                variants[variant],
                disabled && "opacity-50 cursor-not-allowed pointer-events-none",
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {!isLoading && icon}
            {children}
        </motion.button>
    )
}
