"use client"

import {useEffect, useState} from "react"
import {Button} from "@/components/ui/button"
import {useFollowingAlert} from "@/components/ui/following-alert"
import {Switch} from "@/components/ui/switch"

function getRandomMilk() {
	const milks = [
		"🍫 chocolate",
		"🍌 banana",
		"💩 vanilla",
		"🍓 strawberry",
		"🐫 caramel",
	]
	return milks[Math.floor(Math.random() * milks.length)]
}

export default function DevTools() {
	const {show, drop, hide} = useFollowingAlert()

	const [cycling, setCycling] = useState(false)

	// biome-ignore lint/correctness/useExhaustiveDependencies: don't need
	useEffect(() => {
		if (cycling) {
			const toastId = show(getRandomMilk())
			const interval = setInterval(() => {
				show(getRandomMilk(), toastId)
			}, 2000)
			return () => clearInterval(interval)
		}
	}, [cycling])

	return (
		<div className="flex flex-col items-center">
			<div className="flex gap-2">
				{/** biome-ignore lint/a11y/noLabelWithoutControl: false positive */}
				<label className="flex gap-2 items-center">
					Cycle
					<Switch checked={cycling} onCheckedChange={setCycling} />
				</label>
				<Button onClick={() => show(getRandomMilk())}>random milk</Button>
				<Button onClick={() => setCycling(v => !v)}>cycle</Button>
				<Button onClick={() => hide()}>hide</Button>
				<Button onClick={() => drop()}>drop</Button>
			</div>
		</div>
	)
}
