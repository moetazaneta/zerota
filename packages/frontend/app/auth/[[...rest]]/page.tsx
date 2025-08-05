"use client"

import {
	GoogleOneTap,
	SignIn
} from "@clerk/nextjs"

export default function Home() {
	return (
		<main>
			<div className="flex flex-col gap-8 w-96 mx-auto">
				<GoogleOneTap />
				<SignIn />
			</div>
		</main>
	)
}
