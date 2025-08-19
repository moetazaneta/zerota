import {useSimpleDialog} from "@/lib"

export function useImportDialog() {
	return useSimpleDialog({
		title: "Import from Anilist",
		renderContent: (
			<div>You can import only 50 last activities from Anilist.</div>
		),
		confirmText: "Import",
		cancelText: "Cancel",
		maxWidth: 400,
		onConfirm: () => {
			console.log("import")
		},
	})
}
