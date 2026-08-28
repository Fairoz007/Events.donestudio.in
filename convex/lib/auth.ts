import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getOrEnsureProfile } from "../profiles";

type Ctx = QueryCtx | MutationCtx;

export async function requireUser(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("UNAUTHENTICATED");
  let profile = await ctx.db.query("profiles")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", identity.subject)).unique();
  if (!profile && "insert" in ctx.db) {
    profile = await getOrEnsureProfile(ctx as MutationCtx, identity.subject);
  }
  if (!profile) throw new Error("PROFILE_NOT_FOUND");
  if (profile.isBanned) throw new Error("ACCOUNT_BANNED");
  if (profile.isSuspended) throw new Error("ACCOUNT_SUSPENDED");
  return { identity, profile };
}

export async function requireAdmin(ctx: Ctx) {
  const current = await requireUser(ctx);
  if (current.profile.role !== "admin" && current.profile.role !== "super_admin") {
    throw new Error("ADMIN_REQUIRED");
  }
  return current;
}

export async function requireEventHost(ctx: Ctx) {
  const current = await requireUser(ctx);
  if (
    current.profile.role !== "super_admin" &&
    current.profile.role !== "admin" &&
    !current.profile.canHostEvents &&
    current.profile.role !== "creator"
  ) {
    throw new Error("EVENT_HOST_PERMISSION_REQUIRED");
  }
  return current;
}

export async function requireSuperAdmin(ctx: Ctx) {
  const current = await requireUser(ctx);
  if (current.profile.role !== "super_admin" && current.profile.role !== "admin") {
    throw new Error("ONLY_SUPER_ADMIN_CAN_CREATE_EVENTS");
  }
  return current;
}
