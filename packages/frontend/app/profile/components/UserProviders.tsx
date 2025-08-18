"use client"

import type {api} from "@zerota/db/convex/_generated/api"
import {type Preloaded, usePreloadedQuery} from "convex/react"
import Image from "next/image"
import {IconRow} from "@/app/home/components/icon-row"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"

export function UserProviders({
	preloaded,
}: {
	preloaded: Preloaded<typeof api.userProviders.mine>
}) {
	const userProviders = usePreloadedQuery(preloaded)

	return (
		<div className="flex flex-col items-stretch gap-4w-full">
			{/* <h3 className="text-lg px-2">My providers</h3> */}
			<div className="flex flex-col">
				{userProviders.map(provider => (
					<Label key={provider._id} className="p-2">
						<IconRow
							className="w-full items-center gap-4"
							renderImage={
								<Image
									src={provider.provider.logoUrl}
									alt={provider.provider.name}
									width={50}
									height={50}
									className="size-8 rounded-lg object-cover"
								/>
							}
							renderContent={
								<div className="flex w-full items-center gap-2">
									<Image
										src={provider.avatarUrl ?? ""}
										alt={provider.provider.name}
										width={50}
										height={50}
										className="size-12 rounded-xl object-cover"
									/>
									<div className="text-lg">{provider.name}</div>
									<Switch className="ml-auto" />
								</div>
							}
						/>
					</Label>
				))}
			</div>
		</div>
	)
}
