import {HttpRouter, HttpServer, HttpServerResponse} from "@effect/platform"
import {BunHttpServer, BunRuntime} from "@effect/platform-bun"
import {Console, Effect, Layer, Queue, Schema} from "effect"
import type {Doc} from "zod/v4/core"
import {enqueueAnilistUsers} from "../schedule/enqueue"
import {processSubscribedUsers} from "../schedule/process"
import {AnilistQueue, anilistQueue} from "../schedule/schedule"

// Define the schema for route parameters
const Params = Schema.Struct({
	userId: Schema.String,
})

// Define the router with a single route for the root URL
const router = HttpRouter.empty.pipe(
	// HttpRouter.get("/", HttpServerResponse.json({success: true})),
	HttpRouter.get("/", HttpServerResponse.text("Hello World")),

	HttpRouter.post(
		"/import/anilist/:userId",
		HttpRouter.schemaPathParams(Params).pipe(
			Effect.flatMap(params => {
				return enqueueAnilistUsers([params.userId])
			}),
			Effect.flatMap(() => HttpServerResponse.json({success: true})),
		),
	),
)

// Set up the application server with logging
const app = router.pipe(HttpServer.serve(), HttpServer.withLogAddress)

// Specify the port
const port = 3001

// Create a server layer with the specified port
const ServerLive = BunHttpServer.layer({port})

const AnilistServiceLive = Layer.effect(AnilistQueue, anilistQueue)

const program = Effect.gen(function* () {
	yield* Console.log("Bun HTTP server listening on http://localhost:3001")
	yield* Effect.fork(processSubscribedUsers)

	// The server is already running due to Layer.launch,
	// we just need to keep the program alive.
	// yield* Effect.never // Keeps the effect running indefinitely
})

const ProgramLive = Layer.effectDiscard(
	Effect.provide(program, AnilistServiceLive),
)

const AppLive = Layer.mergeAll(ServerLive, AnilistServiceLive, ProgramLive)

// Run the application
BunRuntime.runMain(Layer.launch(Layer.provide(app, AppLive)))

// BunRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)))
