import {HttpRouter, HttpServer, HttpServerResponse} from "@effect/platform"
import {BunHttpServer, BunRuntime} from "@effect/platform-bun"
import {Effect, Layer, Schema} from "effect"
import {enqueueAnilistUsers} from "../schedule/enqueue"

// Define the schema for route parameters
const Params = Schema.Struct({
	userId: Schema.String,
})

// Define the router with a single route for the root URL
const router = HttpRouter.empty.pipe(
	HttpRouter.post(
		"/import/anilist/:userId",
		HttpRouter.schemaPathParams(Params).pipe(
			// Effect.flatMap(params => {
			// 	return enqueueAnilistUsers([params.userId])
			// }),
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

// Run the application
BunRuntime.runMain(Layer.launch(Layer.provide(app, ServerLive)))
