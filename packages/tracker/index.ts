import { ConvexClient } from "convex/browser";
import { api } from "db/convex/_generated/api";

console.log(process.env["CONVEX_URL"])

const client = new ConvexClient(process.env["CONVEX_URL"]!);

const unsubscribe = client.onUpdate(api.myFunctions.listNumbers, { count: 10 }, async ({ viewer, numbers }) => {
  console.log(numbers);
});

// await Bun.sleep(1000);
// unsubscribe();
// await client.close();