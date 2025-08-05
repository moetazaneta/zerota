import type {PublicActivity} from "@zerota/db/convex/activity"
import type {Media, StatusActivity} from "@zerota/db/convex/schema"
import {motion} from "motion/react"
import Image from "next/image"
import Link from "next/link"
import type {HTMLAttributes, PropsWithChildren} from "react"

export function Activity({
	activity,
	children,
	...props
}: PropsWithChildren<
	{activity: PublicActivity} & HTMLAttributes<HTMLDivElement>
>) {
	const map: Record<Media["type"], Record<StatusActivity["status"], string>> = {
		anime: {
			completed: "completed",
			inProgress: "watched",
			onHold: "paused",
			dropped: "dropped",
			planned: "plans to watch",
			repeating: "rewatching",
		},
		manga: {
			completed: "completed",
			inProgress: "reading",
			onHold: "paused",
			dropped: "dropped",
			planned: "plans to read",
			repeating: "rereading",
		},
		book: {
			completed: "completed",
			inProgress: "reading",
			onHold: "paused",
			dropped: "dropped",
			planned: "plans to read",
			repeating: "rereading",
		},
		movie: {
			completed: "completed",
			inProgress: "watching",
			onHold: "paused",
			dropped: "dropped",
			planned: "plans to watch",
			repeating: "rewatching",
		},
		game: {
			completed: "completed",
			inProgress: "playing",
			onHold: "paused",
			dropped: "dropped",
			planned: "plans to play",
			repeating: "rereplaying",
		},
	}

	const noProgress = ["completed", "onHold", "dropped", "planned", "repeating"]

	return (
		<div
			key={activity._id}
			className="rounded-[16px] px-3 p-2 flex flex-wrap items-start gap-x-2 gap-y-0 relative whitespace-nowrap"
			{...props}
		>
			{children}

			<motion.div
				className="flex items-center gap-1.5 cursor-pointer flex-shrink-0"
				whileHover="hover"
			>
				<motion.div
					variants={{hover: {scale: 1.3, rotateZ: -5}}}
					className="flex-shrink-0"
				>
					{activity.providerAuthor.avatarUrl && (
						<Image
							src={activity.providerAuthor.avatarUrl}
							alt={activity.providerAuthor.name}
							width={24}
							height={24}
							className="w-[24px] h-[24px] rounded-[8px] object-cover"
						/>
					)}
				</motion.div>
				<div className="link">
					{activity.providerAuthor.name}
				</div>
			</motion.div>
			<div>
				{/* {activity.media.type} */}
				{map[activity.media.type][activity.status]}
			</div>
			{!noProgress.includes(activity.status) && (
				<>
					<div>{activity.progress}</div>
					<div>{activity.progressUnit}</div>
				</>
			)}

			<motion.div
				className="flex items-start gap-1.5 cursor-pointer"
				whileHover="hover"
			>
				<motion.div
					variants={{hover: {scale: 1.3, rotateZ: -5}}}
					className="flex-shrink-0"
				>
					<Image
						src={activity.media.posterUrl}
						alt={activity.media.title}
						width={100}
						height={150}
						className="w-[24px] h-[32px] rounded-[8px] object-cover"
					/>
				</motion.div>
				<Link
					href={activity.media.url}
					className="flex items-center gap-2 cursor-pointer whitespace-normal"
				>
					<div className="link">
						{activity.media.title}
					</div>
				</Link>
			</motion.div>
		</div>
	)
}
