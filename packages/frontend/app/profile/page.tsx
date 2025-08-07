"use client"

import {UserProfile} from "@clerk/clerk-react"
import {api} from "@zerota/db/convex/_generated/api"
import type {ProviderName} from "@zerota/db/convex/schema"
import {capitalize} from "@zerota/utils/string"
import {useAction, useQuery} from "convex/react"
import {AlertCircleIcon} from "lucide-react"
import Image from "next/image"
import {useState} from "react"
import {IconRow} from "@/app/home/components/icon-row"
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
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"

export default function Profile() {
	return (
		<div className="flex flex-col gap-8">
			<UserInfo />
			<div className="flex flex-col items-stretch gap-8">
				<UserProviders />
				<AddUserProviders />
			</div>
		</div>
	)
}

function UserInfo() {
	const user = useQuery(api.users.me)

	if (!user) {
		return <div>User loading...</div>
	}

	return (
		<div className="flex gap-4">
			<Image
				src={user.imageUrl ?? ""}
				alt={user.name ?? ""}
				width={200}
				height={200}
				className="size-[150px] rounded-[32px] object-cover"
			/>
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

function ClerkProfileButton({className}: {className?: string}) {
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

function UserName() {
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

function UserProviders() {
	const userProviders = useQuery(api.userProviders.mine)

	if (!userProviders) {
		return <div>User providers loading...</div>
	}

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

function AddUserProviders() {
	return (
		<div className="flex flex-row items-stretch gap-2">
			<AddAnilistProviderButton />
			<AddGoodreadsProviderButton />
		</div>
	)
}

function AddAnilistProviderButton() {
	const addUserProvider = useAction(api.userProviders.addUserProvider)
	return (
		<AddProviderButton
			providerName="anilist"
			nameExample="temu"
			urlExample="https://anilist.co/user/temu"
			onAdd={addUserProvider}
		/>
	)
}

function AddGoodreadsProviderButton() {
	const addUserProvider = useAction(api.userProviders.addUserProvider)
	return (
		<AddProviderButton
			providerName="goodreads"
			nameExample="95432671"
			urlExample="https://www.goodreads.com/user/show/95432671-artem"
			onAdd={addUserProvider}
		/>
	)
}

function AddProviderButton({
	providerName,
	nameExample,
	urlExample,
	onAdd,
}: {
	providerName: ProviderName
	nameExample: string
	urlExample: string
	onAdd: (obj: {providerName: ProviderName; nameOrUrl: string}) => void
}) {
	const providers = useQuery(api.providers.listProviders)
	const provider = providers?.[providerName]
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

	if (!providers || !provider) {
		return <div>Loading...</div>
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
