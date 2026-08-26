import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Clerk Webhook Handler for User Sync
http.route({
  path: "/clerk-webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const payload = await request.json();
      const eventType = payload.type;
      const data = payload.data;

      if (eventType === "user.created" || eventType === "user.updated") {
        const clerkUserId = data.id;
        const email =
          data.email_addresses?.[0]?.email_address ||
          `${data.username || "user"}@done-events.com`;
        const displayName =
          `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
          data.username ||
          "D-One Player";
        const avatarUrl = data.image_url || data.profile_image_url || "";
        const username = data.username || undefined;

        await ctx.runMutation(api.profiles.syncProfile, {
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
