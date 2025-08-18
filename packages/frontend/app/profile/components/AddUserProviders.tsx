"use client"

import {api} from "@zerota/db/convex/_generated/api"
import type {ProviderName} from "@zerota/db/convex/schema"
import {capitalize} from "@zerota/utils/string"
import {type Preloaded, useAction, usePreloadedQuery} from "convex/react"
import {AlertCircleIcon} from "lucide-react"
import Image from "next/image"
import {useState} from "react"
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert"
import {Button} from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {Input} from "@/components/ui/input"

export function AddUserProviders({
	preloaded,
}: {
	preloaded: Preloaded<typeof api.providers.listProviders>
}) {
	return (
		<div className="flex flex-row items-stretch gap-2">
			<AddAnilistProviderButton preloaded={preloaded} />
			<AddGoodreadsProviderButton preloaded={preloaded} />
		</div>
	)
}

export function AddAnilistProviderButton({
	preloaded,
}: {
	preloaded: Preloaded<typeof api.providers.listProviders>
}) {
	const addUserProvider = useAction(api.userProviders.addUserProvider)
	return (
		<AddProviderButton
			preloaded={preloaded}
			providerName="anilist"
			nameExample="temu"
			urlExample="https://anilist.co/user/temu"
			onAdd={addUserProvider}
		/>
	)
}

export function AddGoodreadsProviderButton({
	preloaded,
}: {
	preloaded: Preloaded<typeof api.providers.listProviders>
}) {
	const addUserProvider = useAction(api.userProviders.addUserProvider)
	return (
		<AddProviderButton
			preloaded={preloaded}
			providerName="goodreads"
			nameExample="95432671"
			urlExample="https://www.goodreads.com/user/show/95432671-artem"
			onAdd={addUserProvider}
		/>
	)
}

export function AddProviderButton({
	preloaded,
	providerName,
	nameExample,
	urlExample,
	onAdd,
}: {
	preloaded: Preloaded<typeof api.providers.listProviders>
	providerName: ProviderName
	nameExample: string
	urlExample: string
	onAdd: (obj: {providerName: ProviderName; nameOrUrl: string}) => void
}) {
	const providers = usePreloadedQuery(preloaded)
	const provider = providers[providerName]
	const [username, setUsername] = useState("")
	const [adding, setAdding] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [open, setOpen] = useState(false)

	async function handleAdd() {
		setAdding(true)
		try {
			onAdd({providerName, nameOrUrl: username})
		} catch (error) {
			console.error(error)
			setError("Something went wrong.")
		} finally {
			setAdding(false)
			setOpen(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button" variant="secondary" size="lg">
					<Image
						src={provider.logoUrl}
						alt={provider.name}
						width={100}
						height={100}
						className="size-10 rounded-xl"
					/>
					Add {capitalize(providerName)}
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[400px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						Add {capitalize(providerName)} account
					</DialogTitle>
					<DialogDescription>
						<span>Your username or link to your profile.</span>
						<br />
						<span>
							E.g. <b>{nameExample}</b> or{" "}
							<b className="break-all">{urlExample}</b>
						</span>
					</DialogDescription>
				</DialogHeader>
				{error && (
					<Alert variant="destructive">
						<AlertCircleIcon />
						<AlertTitle>{error}</AlertTitle>
						<AlertDescription></AlertDescription>
					</Alert>
				)}

				<Input
					name="search"
					placeholder={urlExample}
					value={username}
					onChange={e => {
						setUsername(e.target.value)
						setError(null)
					}}
				/>
				<DialogFooter>
					<Button type="button" onClick={handleAdd} disabled={adding}>
						{adding ? "Adding..." : "Add account"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
