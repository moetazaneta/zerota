// What I need to do:
// 1. get user
// 2. get user active providers
// 3. fetch provider data one by one
//
// I guess I need queue for each provider,
// so we don't meet timeout

import {Console, Context, Data, Effect, Either, Option} from "effect"
import {getAnilistUser} from "./providers/abstract/getUser"
import type {ProviderUser} from "./providers/types/user"

class AnilistProvider extends Context.Tag("AnilistProvider")<
	AnilistProvider,
	{
		readonly user: (
			name: string,
		) => Effect.Effect<ProviderUser, FetchError | UserNotFoundError>
	}
>() {}

class UserNotFoundError extends Data.TaggedError("UserNotFoundError")<{
	name: string
}> {}
class FetchError extends Data.TaggedError("FetchError")<{reason: unknown}> {}

const getUser = (name: string) =>
	Effect.gen(function* () {
		const user = yield* Effect.either(
			Effect.tryPromise(() => getAnilistUser(name)),
		)

		if (Either.isLeft(user)) {
			return yield* new FetchError({reason: user.left})
		}

		if (!user.right) {
			return yield* new UserNotFoundError({name})
		}

		return user.right
	})

const program = Effect.gen(function* () {
	const anilistProvider = yield* AnilistProvider
	const user = yield* anilistProvider.user("NyashkaNot")
	return user
}).pipe(
	Effect.provideService(AnilistProvider, {
		user: getUser,
	}),
	Effect.catchTag("FetchError", e => Console.error(e)),
	Effect.catchTag("UserNotFoundError", e =>
		Console.error(`User ${e.name} not found`),
	),
	Effect.tap(u => Console.log(u)),
)

Effect.runFork(program)
