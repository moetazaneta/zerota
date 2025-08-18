"use client"

import {api} from "@zerota/db/convex/_generated/api"
import {type Preloaded, useMutation, usePreloadedQuery} from "convex/react"
import {EllipsisVerticalIcon, MenuIcon, TrashIcon} from "lucide-react"
import Image from "next/image"
import {IconRow} from "@/app/home/components/icon-row"
import {useImportDialog} from "@/app/profile/hooks/useImportDialog"
import {Button} from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"

export function UserProviders({
	preloaded,
}: {
	preloaded: Preloaded<typeof api.userProviders.mine>
}) {
	const {show, hide, visible, DialogComponent} = useImportDialog()
	const userProviders = usePreloadedQuery(preloaded)

	const update = useMutation(api.userProviders.update)
	const remove = useMutation(api.userProviders.remove)

	return (
		<div className="flex flex-col items-stretch gap-4w-full">
			<DialogComponent />

			<div className="flex flex-col">
				{userProviders.map(provider => (
					<Label key={provider._id} className="p-2">
						<IconRow
							className="w-full items-center gap-6 relative"
							renderImage={
								<Image
									src={provider.avatarUrl ?? ""}
									alt={provider.provider.name}
									width={50}
									height={50}
									className="size-12 rounded-xl object-cover"
								/>
							}
							renderContent={
								<div className="flex w-full items-center gap-2">
									<Image
										src={provider.provider.logoUrl}
										alt={provider.provider.name}
										width={50}
										height={50}
										className="size-8 rounded-lg object-cover absolute left-8 -bottom-2 border-4 border-bg"
									/>
									<div className="text-lg">{provider.name}</div>
									<Switch
										className="ml-auto"
										checked={provider.active}
										onCheckedChange={() =>
											update({id: provider._id, active: !provider.active})
										}
									/>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												icon
												onClick={() => remove({id: provider._id})}
											>
												<EllipsisVerticalIcon className="size-8" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={show}>Import</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuSub>
												<DropdownMenuSubTrigger variant="destructive">
													Delete
												</DropdownMenuSubTrigger>
												<DropdownMenuPortal>
													<DropdownMenuSubContent>
														<DropdownMenuLabel>Are you sure?</DropdownMenuLabel>
														<DropdownMenuSeparator />
														<DropdownMenuItem
															variant="destructive"
															onClick={() => remove({id: provider._id})}
														>
															Yes
														</DropdownMenuItem>
														<DropdownMenuItem>No</DropdownMenuItem>
													</DropdownMenuSubContent>
												</DropdownMenuPortal>
											</DropdownMenuSub>
										</DropdownMenuContent>
									</DropdownMenu>
								</div>
							}
						/>
					</Label>
				))}
			</div>
		</div>
	)
}
