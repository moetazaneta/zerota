"use client"

import {atom, useAtom, useAtomValue} from "jotai"
import {type ReactNode, useEffect, useRef, useState} from "react"
import {cn} from "@/lib"
import {Button} from "./button"
import {Spinner} from "./shadcn-io/spinner"

const followingAtom = atom(false)
const messageAtom = atom<ReactNode>("")

export function useFollowingAlert() {
	const [isFollowing, setFollowing] = useAtom(followingAtom)
	const [message, setMessage] = useAtom(messageAtom)

	const timerId = useRef<NodeJS.Timeout | null>(null)

	function show(message: ReactNode, duration = 5000) {
		setFollowing(true)
		setMessage(message)

		timerId.current = setTimeout(hide, duration)
	}

	function hide() {
		if (timerId.current) {
			clearTimeout(timerId.current)
			timerId.current = null
		}

		setFollowing(false)
	}

	return {
		isFollowing,
		message,
		show,
		hide,
	}
}

export function FollowingAlert() {
	const isFollowing = useAtomValue(followingAtom)
	const message = useAtomValue(messageAtom)

	const [shouldZoomzoom, setShouldZoomzoom] = useState(false)

	const prevMessage = useRef(message)
	const prevIsFollowing = useRef(isFollowing)

	useEffect(() => {
		if (prevIsFollowing.current === false) {
			prevIsFollowing.current = isFollowing
			prevMessage.current = message
			return
		}

		prevIsFollowing.current = isFollowing
		prevMessage.current = message

		if (!isFollowing) return

		setShouldZoomzoom(true)
		setTimeout(() => setShouldZoomzoom(false), 200)
	}, [message, isFollowing])

	const alertRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!isFollowing) return

		function moveTo(e: MouseEvent) {
			if (!alertRef.current) return
			const leftOffset = 15
			const topOffset = 15
			alertRef.current.style.left = `${e.clientX + leftOffset}px`
			alertRef.current.style.top = `${e.clientY + topOffset}px`
		}

		const abortController = new AbortController()
		const {signal} = abortController

		moveTo(window.event as MouseEvent)
		document.addEventListener("mousemove", moveTo, {signal})

		return () => abortController.abort()
	}, [isFollowing])

	return (
		<div
			ref={alertRef}
			className={cn(
				"absolute bg-black text-white p-2 text-sm rounded-xl flex items-center gap-2 transition origin-top-left shadow-lg z-10",
				isFollowing
					? "visible opacity-100 scale-100"
					: "invisible opacity-0 scale-0",
				shouldZoomzoom ? "animate-zoomzoom" : "",
			)}
		>
			{message}
		</div>
	)
}
