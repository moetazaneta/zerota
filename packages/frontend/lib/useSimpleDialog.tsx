"use client"

import {useCallback, useState} from "react"
import {Button} from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import {cn} from "@/lib/cn"

interface UseSimpleDialogOptions {
	title?: string
	renderContent: React.ReactNode
	confirmText?: string
	cancelText?: string
	showCancel?: boolean
	closable?: boolean
	maxWidth?: number
	onConfirm?: () => void
	onCancel?: () => void
}

interface UseSimpleDialogReturn {
	show: () => void
	hide: () => void
	visible: boolean
	DialogComponent: React.ComponentType
}

export function useSimpleDialog({
	title,
	renderContent,
	confirmText = "Confirm",
	cancelText = "Cancel",
	showCancel = true,
	closable = true,
	maxWidth = 600,
	onConfirm,
	onCancel,
}: UseSimpleDialogOptions): UseSimpleDialogReturn {
	const [visible, setVisible] = useState(false)

	const show = useCallback(() => setVisible(true), [])
	const hide = useCallback(() => setVisible(false), [])

	const handleConfirm = useCallback(() => {
		onConfirm?.()
		hide()
	}, [onConfirm, hide])

	const handleCancel = useCallback(() => {
		onCancel?.()
		hide()
	}, [onCancel, hide])

	const DialogComponent = useCallback(() => {
		return (
			<Dialog open={visible} onOpenChange={setVisible}>
				<DialogContent
					showCloseButton={closable}
					style={{maxWidth: `${maxWidth}px`}}
				>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
					</DialogHeader>
					{renderContent}
					<DialogFooter>
						{showCancel && (
							<Button variant="outline" onClick={handleCancel}>
								{cancelText}
							</Button>
						)}
						<Button onClick={handleConfirm}>{confirmText}</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		)
	}, [
		visible,
		closable,
		renderContent,
		showCancel,
		confirmText,
		cancelText,
		handleConfirm,
		handleCancel,
		title,
		maxWidth,
	])

	return {
		show,
		hide,
		visible,
		DialogComponent,
	}
}
