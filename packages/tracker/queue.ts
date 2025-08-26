import {api} from "@zerota/db/convex/_generated/api"
import {getAnilistActivities} from "./anilist"
import {http} from "./http"
import {postHog} from "./posthog"

class AnilistQueue {
	private delayMs = 10000

	private queue: string[] = []

	add(id: string) {
		this.queue.push(id)
	}

	subscribe(callback: (id: string) => void) {
		// TODO: now if it's empty for 15 sec, and item is added,
		// it will wait another 5 sec. Could be improved.
		const interval = setInterval(() => {
			const id = this.queue.shift()
			if (!id) return
			callback(id)
		}, this.delayMs)
		return () => clearInterval(interval)
	}
}

const anilistQueue = new AnilistQueue()

type Status =
	| {
			type: "idle"
	  }
	| {
			type: "fetching"
			id: string
	  }
	| {
			type: "saving"
			id: string
	  }
	| {
			type: "error"
			id: string
			error: Error
	  }

class AnilistScheduler {
	private queue = anilistQueue

	public status: Status = {type: "idle"}

	add(id: string) {
		postHog.capture({
			event: "anilist_scheduler_added",
			distinctId: "dev",
			properties: {
				id: id,
			},
		})
		this.queue.add(id)
	}

	constructor() {
		postHog.capture({
			event: "anilist_scheduler_created",
			distinctId: "dev",
		})
		this.queue.subscribe(id => this.process(id))
	}

	private async process(id: string) {
		postHog.capture({
			event: "anilist_scheduler_processing",
			distinctId: "dev",
			properties: {
				id: id,
			},
		})
		this.status = {type: "fetching", id}
		const activities = await getAnilistActivities(id)
		postHog.capture({
			event: "anilist_scheduler_activities_fetched",
			distinctId: "dev",
			properties: {
				id: id,
				activities: activities.length,
			},
		})
		this.status = {type: "saving", id}
		const saved = await Promise.all(
			activities.map(activity =>
				http.mutation(api.activity.createStatusActivity, activity),
			),
		)
		postHog.capture({
			event: "anilist_scheduler_activities_saved",
			distinctId: "dev",
			properties: {
				id: id,
				activities: saved.length,
			},
		})
		this.status = {type: "idle"}
	}
}

export const anilistScheduler = new AnilistScheduler()
