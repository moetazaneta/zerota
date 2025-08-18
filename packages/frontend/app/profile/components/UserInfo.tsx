"use client"

import {UserProfile} from "@clerk/clerk-react"
import {api} from "@zerota/db/convex/_generated/api"
import {type Preloaded, usePreloadedQuery, useQuery} from "convex/react"
import Image from "next/image"
import {IconRow} from "@/app/home/components/icon-row"
import {Button} from "@/components/ui/button"
import {Dialog, DialogContent, DialogTrigger} from "@/components/ui/dialog"

export function UserInfo({
	preloaded,
}: {
	preloaded: Preloaded<typeof api.users.me>
}) {
	const user = usePreloadedQuery(preloaded)

	return (
		<div className="flex gap-4">
			{user.imageUrl && (
				<Image
					src={user.imageUrl}
					alt={user.name ?? ""}
					width={200}
					height={200}
					className="size-[150px] rounded-[32px] object-cover"
				/>
			)}
			<div className="flex flex-col items-start">
				<ClerkProfileButton className="mb-auto" />
				<h2 className="flex items-center gap-2 whitespace-normal text-xl">
					{user.name}
				</h2>
				<h2 className="flex items-center gap-2 whitespace-normal text-xl text-tx-3">
					@{user.username}
				</h2>
			</div>
		</div>
	)
}

export function ClerkProfileButton({className}: {className?: string}) {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button type="button" variant="secondary" className={className}>
					Edit profile
				</Button>
			</DialogTrigger>
			<DialogContent headless>
				<UserProfile />
			</DialogContent>
		</Dialog>
	)
}

export function UserName() {
	const user = useQuery(api.users.me)

	if (!user) {
		return <div>User loading...</div>
	}

	return (
		<IconRow
			renderImage={
				user.imageUrl && (
					<Image
						src={user.imageUrl}
						alt={user.name ?? ""}
						width={100}
						height={150}
						className="w-[40px] h-[40px] rounded-[12px] object-cover"
					/>
				)
			}
			renderContent={
				<>
					<h2 className="flex items-center gap-2 whitespace-normal text-xl">
						{user.name}
					</h2>
					<h2 className="flex items-center gap-2 whitespace-normal text-xl text-tx-3">
						@{user.username}
					</h2>
				</>
			}
		/>
	)
}
