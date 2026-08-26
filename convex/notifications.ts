import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "./profiles";

// List notifications for current user
export const listMyNotifications = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) return [];

    const limit = args.limit || 20;
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("clerkUserId", clerkUserId))
      .order("desc")
      .take(limit);

    return notifications;
  },
});

// Get unread notification count in real-time
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) return 0;

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("clerkUserId", clerkUserId).eq("isRead", false)
      )
      .collect();

    return unread.length;
  },
});

// Mark single notification as read
export const markAsRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const notification = await ctx.db.get(args.id);
    if (!notification || notification.clerkUserId !== clerkUserId) return;

    await ctx.db.patch(args.id, { isRead: true });
    return true;
  },
});

// Mark all as read
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await getAuthUserId(ctx);
    if (!clerkUserId) throw new Error("Unauthorized");

    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("clerkUserId", clerkUserId).eq("isRead", false)
      )
      .collect();

    for (const notif of unread) {
      await ctx.db.patch(notif._id, { isRead: true });
    }

    return true;
  },
});
