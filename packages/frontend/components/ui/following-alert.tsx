"use client"

import {atom, useAtom, useAtomValue} from "jotai"
import {BrushCleaningIcon} from "lucide-react"
import {
	AnimatePresence,
	LayoutGroup,
	motion,
	useMotionValue,
} from "motion/react"
import {
	type CSSProperties,
	type PropsWithChildren,
	type ReactNode,
	type RefObject,
	useEffect,
	useState,
} from "react"
import {Toaster, toast, useSonner} from "sonner"
import {cn} from "@/lib"
import {useEvent} from "@/lib/useEvent"

type Message = {id: string; content: ReactNode}

const messageAtom = atom<Message | null>(null)

export function useFollowingAlert() {
	const [message, setMessage] = useAtom(messageAtom)
	const {toasts} = useSonner()

	const show = useEvent((content: ReactNode, customId?: string) => {
		const id = customId ?? crypto.randomUUID()
		const existingToast = toasts.some(t => t.id === id)
		if (existingToast) {
			moveToToast({id, content})
		} else {
			setMessage({id, content})
		}

		return id
	})

	const moveToToast = useEvent((message: Message) => {
		toast.custom(() => <Alert message={message} className="w-[300px]" />, {
			id: message.id,
		})
	})

	const drop = useEvent(() => {
		if (!message) return
		moveToToast(message)
	})

	function hide() {
		setMessage(null)
	}

	return {show, drop, hide}
}

export function FollowingLayoutProvider(props: PropsWithChildren) {
	const message = useAtomValue(messageAtom)
	return (
		<LayoutGroup>
			{props.children}
			<AnimatePresence>
				<CustomToaster key="toaster" className="relative z-10" />
				<DropZone
					key="drop"
					className="z-40 w-screen min-h-[70px] absolute bottom-0 right-0"
				/>
				<Following key="following" className="z-50">
					{message && (
						<Alert
							key={`following ${message.id}`}
							message={message}
							className="fixed"
						/>
					)}
				</Following>
			</AnimatePresence>
		</LayoutGroup>
	)
}

function Alert({
	message,
	className,
	style,
	ref,
}: {
	message: Message
	className?: string
	style?: CSSProperties
	ref?: RefObject<HTMLDivElement | null>
}) {
	return (
		<motion.div
			ref={ref}
			className={cn(
				"bg-black text-white p-2 text-sm rounded-xl flex items-center gap-2 w-[300px] shadow-lg",
				className,
			)}
			layoutId={message.id}
			style={style}
			transition={{
				type: "spring",
				stiffness: 300,
				damping: 25,
			}}
			data-alert
		>
			{message.content} {message.id.split("-")[0]}
		</motion.div>
	)
}

function getInitialCursor() {
	const event = global?.event as MouseEvent
	return {x: event?.clientX ?? 0, y: event?.clientY ?? 0}
}

function Following({
	children,
	className,
}: PropsWithChildren & {className?: string}) {
	const [cursor] = useState(getInitialCursor)
	const x = useMotionValue(cursor.x)
	const y = useMotionValue(cursor.y)

	const shouldFollow = children != null

	useEffect(() => {
		if (!shouldFollow) return

		const move = (e: MouseEvent) => {
			x.set(e.clientX + 15)
			y.set(e.clientY + 15)
		}
		move(global.event as MouseEvent)
		window.addEventListener("mousemove", move)
		return () => window.removeEventListener("mousemove", move)
	}, [shouldFollow, x, y])

	return (
		<motion.div
			style={{
				top: y,
				left: x,
			}}
			className={cn("fixed", className)}
		>
			{children}
		</motion.div>
	)
}

function DropZone({className}: {className?: string}) {
	const [message, setMessage] = useAtom(messageAtom)
	const {toasts} = useSonner()

	function drop() {
		if (!message) return

		toast.custom(
			() => <Alert key={message.id} message={message} className=" w-[300px]" />,
			{id: message.id},
		)
		setTimeout(() => {
			setMessage(null)
		}, 0)
	}

	return (
		// biome-ignore lint/a11y/useKeyWithMouseEvents: don't think so
		<div
			role="directory"
			onMouseOver={drop}
			className={cn(
				"opacity-0 transition-opacity p-2",
				message && toasts.length === 0 && "opacity-100",
				!message && "pointer-events-none",
				className,
			)}
		>
			<div
				className={cn(
					"border-4 border-dashed border-ui p-4 text-sm rounded-2xl flex flex-row gap-2 items-center justify-center text-tx-3",
				)}
			>
				<BrushCleaningIcon
					className="animate-sweep transition-all size-6"
					strokeWidth={2}
				/>
				<div className="text-center lex items-center gap-2">
					Whipe your cursor here
				</div>
			</div>
		</div>
	)
}

function CustomToaster({className}: {className?: string}) {
	return (
		<div className={className}>
			<Toaster
				className={cn(
					"z-10 font-sans!",
					"[&_[data-alert]]:transition-colors",
					"[&_[data-index='0'][data-expanded='false']_[data-alert]]:bg-stone-800",
					"[&_[data-index='1'][data-expanded='false']_[data-alert]]:bg-stone-700",
					"[&_[data-index='2'][data-expanded='false']_[data-alert]]:bg-stone-600",
				)}
				gap={8}
				offset={16}
				duration={3000000}
			/>
		</div>
	)
}
