"use client"

import {api} from "@zerota/db/convex/_generated/api"
import type {Id} from "@zerota/db/convex/_generated/dataModel"
import {usePaginatedQuery} from "convex/react"
import {motion} from "motion/react"
import {useState} from "react"
import {Activity} from "@/app/home/components/activity"

export default function Home() {
	// TODO: Add error handling
	const activities = usePaginatedQuery(
		api.activity.publicList,
		{},
		{initialNumItems: 50},
	)

	const [hoveredTab, setHoveredTab] = useState<Id<"activities"> | null>(null)

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: why not tho?
		<div
			className="flex flex-col gap-0 relative items-start"
			onMouseLeave={() => setHoveredTab(null)}
		>
			{activities.results.map(activity => (
				<Activity
					key={activity._id}
					activity={activity}
					onMouseEnter={() => setHoveredTab(activity._id)}
					onMouseLeave={() => setHoveredTab(null)}
				>
					{/* TODO: Don't create new div, but reuse one. */}
					{hoveredTab === activity._id && (
						<motion.div
							className="rounded-[16px] bg-bg-2 -z-1 absolute inset-0"
							layoutId="hover-background"
							transition={{
								type: "spring",
								stiffness: 350,
								damping: 25,
							}}
						/>
					)}
				</Activity>
			))}
		</div>
	)
}
