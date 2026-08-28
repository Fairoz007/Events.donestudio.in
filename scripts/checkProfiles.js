import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "https://precise-wolverine-704.convex.cloud");

async function main() {
  console.log("Checking profiles in Convex URL:", client);
}

main().catch(console.error);
