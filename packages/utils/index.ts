export * from "./pretty-parse"
export * from "./strict-omit"
export * from "./string"

export function wait(duration = 0) {
	return new Promise(resolve => setTimeout(resolve, duration))
}
