import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
// "svix" is listed in package.json dependencies and marked as an
// external Node module.  Convex bundles server functions for V8, so we
// declare the import with `"use node"` semantics via the action handler.
import { Webhook } from "svix";

const http = httpRouter();

// Clerk Webhook Handler for User Sync
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
      if (!webhookSecret) return new Response("CLERK_WEBHOOK_SECRET is not configured", { status: 503 });
      const body = await request.text();
      const svixId = request.headers.get("svix-id");
      const svixTimestamp = request.headers.get("svix-timestamp");
      const svixSignature = request.headers.get("svix-signature");
      if (!svixId || !svixTimestamp || !svixSignature) return new Response("Missing webhook signature", { status: 400 });
      const payload = new Webhook(webhookSecret).verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as { type?: unknown; data?: unknown };
      const eventType = payload.type;
      const data = payload.data;

      if ((eventType === "user.created" || eventType === "user.updated") && data && typeof data === "object") {
        const user = data as Record<string, any>;
        const clerkUserId = user.id;
        if (typeof clerkUserId !== "string") return new Response("Invalid Clerk user payload", { status: 400 });
        const email =
          user.email_addresses?.[0]?.email_address ||
          `${user.username || "user"}@done-events.com`;
        const displayName =
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.username ||
          "D-One Player";
        const avatarUrl = user.image_url || user.profile_image_url || "";
        const username = typeof user.username === "string" ? user.username : undefined;

        await ctx.runMutation(internal.profiles.syncProfileFromClerk, {
          clerkUserId,
          email,
          displayName,
          avatarUrl,
          username,
        });
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      console.error("Clerk Webhook Error:", err);
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;

