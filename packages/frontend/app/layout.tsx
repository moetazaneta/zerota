import {
	ClerkProvider,
	RedirectToSignIn,
	SignedIn,
	SignedOut,
} from "@clerk/nextjs"
import type {Metadata} from "next"
import localFont from "next/font/local"
import {Nav} from "@/app/components/nav"
import ConvexClientProvider from "@/components/ConvexClientProvider"
import "./globals.css"
import {FollowingLayoutProvider} from "@/components/ui/following-alert"

const martianGrotesk = localFont({
	src: "./fonts/MartianGrotesk.woff2",
	variable: "--font-martian-grotesk",
})

export const metadata: Metadata = {
	title: "zeroтa",
	description: "Aggreation app for all your entertainment sources.",
	icons: {
		icon: "/02.webp",
	},
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${martianGrotesk.variable} antialiased`}>
				<ClerkProvider dynamic>
					<ConvexClientProvider>
						<SignedIn>
							<FollowingLayoutProvider>
								<div className="flex flex-col gap-8 p-8 max-w-screen-lg mx-auto">
									<aside className="flex flex-col justify-between items-center">
										<Nav />
									</aside>
									{children}
								</div>
							</FollowingLayoutProvider>
						</SignedIn>
						<SignedOut>
							<RedirectToSignIn />
						</SignedOut>
					</ConvexClientProvider>
				</ClerkProvider>
			</body>
		</html>
	)
}
