import {useCallback, useLayoutEffect, useRef} from "react"

/**
 * Polyfill for React's upcoming `useEvent` hook.
 * Returns a stable function reference that always sees the latest callback.
 */

// biome-ignore lint/suspicious/noExplicitAny: it's okay
export function useEvent<T extends (...args: any[]) => any>(handler: T): T {
	const handlerRef = useRef<T>(handler)

	// keep ref updated with the latest handler
	useLayoutEffect(() => {
		handlerRef.current = handler
	})

	// return a stable function that calls the latest handler
	return useCallback(
		// biome-ignore lint/suspicious/noExplicitAny: it's okay
		((...args: any[]) => {
			return handlerRef.current(...args)
		}) as T,
		[],
	)
}
