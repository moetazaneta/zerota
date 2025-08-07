import {motion} from "motion/react"
import type {ReactNode} from "react"
import {cn} from "@/utils/cn"

export function IconRow({
	renderImage,
	renderContent,
	className,
}: {
	renderImage: ReactNode
	renderContent: ReactNode
	className?: string
}) {
	return (
		<motion.div
			className={cn("flex items-start gap-1.5", className)}
			whileHover="hover"
		>
			<motion.div
				variants={{hover: {scale: 1.3, rotateZ: -5}}}
				className="flex-shrink-0"
			>
				{renderImage}
			</motion.div>
			{renderContent}
		</motion.div>
	)
}
