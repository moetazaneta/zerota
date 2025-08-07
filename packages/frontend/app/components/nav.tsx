"use client"

import {api} from "@zerota/db/convex/_generated/api"
import {useQuery} from "convex/react"
import {DynamicIcon} from "lucide-react/dynamic"
import {motion, useSpring} from "motion/react"
import Image from "next/image"
import Link from "next/link"
import {useCallback, useEffect, useRef, useState} from "react"
import {IconRow} from "@/app/home/components/icon-row"
import {cn} from "@/lib/utils"

const links = [
	{
		href: "/home",
		icon: "home",
		label: "Home",
	},
	{
		href: "/dev-tool",
		icon: "settings",
		label: "Dev tools",
	},
	{
		href: "/profile",
		icon: "user",
		label: "Profile",
	},
] as const

export function Nav({
	activeId,
	onChange,
	keepOnActive = true,
}: {
	activeId?: string
	onChange?: (id: string) => void
	keepOnActive?: boolean
}) {
	const user = useQuery(api.users.me)

	const containerRef = useRef<HTMLDivElement | null>(null)
	const [hoveredId, setHoveredId] = useState<string | null>(null)
	const [focusedId, setFocusedId] = useState<string | null>(null)

	// Track rect and visibility for overlay
	const [overlay, setOverlay] = useState<{
		x: number
		y: number
		width: number
		height: number
		visible: boolean
	}>({x: 0, y: 0, width: 0, height: 0, visible: false})

	// Springs for smooth movement/resize
	const x = useSpring(0, {stiffness: 500, damping: 40, mass: 0.6})
	const y = useSpring(0, {stiffness: 500, damping: 40, mass: 0.6})
	const w = useSpring(0, {stiffness: 500, damping: 40, mass: 0.6})
	const h = useSpring(0, {stiffness: 500, damping: 40, mass: 0.6})

	const setOverlayToTab = useCallback(
		(id: string | null) => {
			const container = containerRef.current
			if (!container) return

			if (!id) {
				setOverlay(prev => ({...prev, visible: false}))
				return
			}

			const tabEl = container.querySelector<HTMLButtonElement>(
				`[data-tab-id="${id}"]`,
			)
			if (!tabEl) {
				setOverlay(prev => ({...prev, visible: false}))
				return
			}

			const cRect = container.getBoundingClientRect()
			const tRect = tabEl.getBoundingClientRect()

			const left = tRect.left - cRect.left + container.scrollLeft
			const top = tRect.top - cRect.top + container.scrollTop

			const visible = overlay.visible

			setOverlay({
				x: left,
				y: top,
				width: tRect.width,
				height: tRect.height,
				visible: true,
			})

			if (visible) {
				x.set(left)
				y.set(top)
				w.set(tRect.width)
				h.set(tRect.height)
			} else {
				x.jump(left)
				y.jump(top)
				w.jump(tRect.width)
				h.jump(tRect.height)
			}
		},
		[x, y, w, h, overlay.visible],
	)

	// Decide which tab the overlay should target
	const targetId =
		hoveredId || focusedId || (keepOnActive ? (activeId ?? null) : null)

	useEffect(() => {
		setOverlayToTab(targetId ?? null)
	}, [targetId, setOverlayToTab])

	// Keep overlay aligned on resize
	useEffect(() => {
		const onResize = () => setOverlayToTab(targetId ?? null)
		window.addEventListener("resize", onResize)
		return () => window.removeEventListener("resize", onResize)
	}, [targetId, setOverlayToTab])

	return (
		<nav
			className="flex flex-row w-full"
			ref={containerRef}
			onMouseLeave={() => {
				setHoveredId(null)
				if (!keepOnActive) setOverlayToTab(null)
			}}
		>
			<motion.div
				className="bg-bg-2 rounded-[16px] -z-1 absolute"
				style={{
					x,
					y,
					width: w,
					height: h,
					opacity: overlay.visible ? 1 : 0,
				}}
				aria-hidden="true"
			/>

			{links.map(({href, icon, label}) => (
				<Link
					className={cn("px-2 py-2", icon === "user" && "ml-auto")}
					href={href}
					key={href}
					data-tab-id={href}
					onMouseEnter={() => setHoveredId(href)}
					onMouseMove={() => setHoveredId(href)}
					onFocus={() => setFocusedId(href)}
					onBlur={() => setFocusedId(prev => (prev === href ? null : prev))}
					onClick={() => onChange?.(href)}
					aria-pressed={href === activeId}
				>
					{icon === "user" && (
						<IconRow
							renderImage={
								<Image
									src={user?.imageUrl ?? ""}
									alt="User"
									width={50}
									height={50}
									className="size-6 rounded-lg"
								/>
							}
							renderContent={<div>{label}</div>}
						/>
					)}
					{/* {icon !== "user" && (
						<IconRow
							renderImage={<DynamicIcon name={icon} className="size-6" />}
							renderContent={<div>{label}</div>}
						/>
					)} */}
					{icon !== "user" && label}
				</Link>
			))}
		</nav>
	)
}
