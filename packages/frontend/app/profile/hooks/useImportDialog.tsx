"use client"

import {useFollowingAlert} from "@/components/ui/following-alert"
import {Spinner} from "@/components/ui/shadcn-io/spinner"
import {useSimpleDialog} from "@/lib"
import {trpc} from "@/tracker"

export function useImportDialog() {
	const {show} = useFollowingAlert()
	return useSimpleDialog<{userId: string}>({
		title: "Import from Anilist",
		renderContent: (
			<div>You can import only 50 last activities from Anilist.</div>
		),
		confirmText: "Import",
		cancelText: "Cancel",
		maxWidth: 400,
		onConfirm: async ({userId}) => {
			show(
				<>
					<Spinner variant="default" size={16} />
					<div>Scrapping anilist activities</div>
				</>,
			)
			const items = await trpc.fetchAnilistActivities.mutate({
				id: String(userId),
			})
			show(`Succesfully imported ${items.length} items`, 2000)
		},
	})
}
