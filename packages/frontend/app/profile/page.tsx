"use client"

import {api} from "@zerota/db/convex/_generated/api"
import {error} from "console"
import {useAction, useQuery} from "convex/react"
import {AlertCircleIcon} from "lucide-react"
import {motion} from "motion/react"
import Image from "next/image"
import Link from "next/link"
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
		<div className="w-full flex flex-col gap-8 items-center">
			<UserName />
			<div className="flex flex-col items-stretch gap-8 w-[300px]">
				<UserProviders />
				<AddUserProviders />
			</div>
		</div>
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
		<div className="flex flex-col items-stretch gap-2">
			{userProviders.map(provider => (
				<Label key={provider._id}>
					<IconRow
						className="w-full items-center"
						renderImage={
							<Image
								src={provider.provider.logoUrl}
								alt={provider.provider.name}
								width={50}
								height={50}
								className="w-[24px] h-[24px] rounded-[8px] object-cover"
							/>
						}
						renderContent={
							<div className="flex justify-between w-full items-center">
								<div>{provider.name}</div>
								<Switch />
							</div>
						}
					/>
				</Label>
			))}
		</div>
	)
}

function AddUserProviders() {
	return (
		<div className="flex flex-col items-stretch gap-2">
			<AddAnilistProvider />
		</div>
	)
}

function AddAnilistProvider() {
	const providers = useQuery(api.providers.listProviders)
	const addUserProvider = useAction(api.userProviders.addUserProvider)
	const [username, setUsername] = useState("")
	const [adding, setAdding] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [open, setOpen] = useState(false)

	async function handleAdd() {
		setAdding(true)
		try {
			console.log("before success")
			await addUserProvider({
				providerName: "anilist",
				nameOrUrl: username,
			})
			console.log("success")
		} catch (error) {
			console.dir(error)
			setError("Something went wrong.")
		} finally {
			setAdding(false)
			setOpen(false)
		}
	}

	if (!providers) {
		return <div>Loading...</div>
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button type="button" variant="secondary" size="lg">
					<Image
						src={providers.anilist.logoUrl}
						alt="Anilist"
						width={16}
						height={16}
					/>
					Add Anilist Provider
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[455px]">
				<DialogHeader>
					<DialogTitle>Add Anilist account</DialogTitle>
					<DialogDescription>
						<span>Your anilist username or link to your profile.</span>
						<br />
						<span>
							E.g. <b>tem</b> or <b>https://anilist.co/user/tem</b>
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
					id="username"
					placeholder="https://anilist.co/user/tem"
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
