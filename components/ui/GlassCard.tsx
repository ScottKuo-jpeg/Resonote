import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    hoverEffect?: boolean
}

export function GlassCard({ children, className, hoverEffect = false, ...props }: GlassCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl",
                hoverEffect && "hover:bg-white/10 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    )
}
