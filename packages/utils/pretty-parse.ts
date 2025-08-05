import * as z from "zod/v4"

/** Parse data without throwing zod error and continue mapping process. */
export const prettyParse = <T>(data: unknown, schema: z.ZodType<T>) => {
	const result = schema.safeParse(data)
	if (result.success) {
		return result.data
	}
	console.warn(z.prettifyError(result.error))

	// Return the dto data if parsing is failed to continue the process.
	return data
}
