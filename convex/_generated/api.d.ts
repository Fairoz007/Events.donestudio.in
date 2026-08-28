/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as admin from "../admin.js";
import type * as announcements from "../announcements.js";
import type * as controlCenter from "../controlCenter.js";
import type * as creators from "../creators.js";
import type * as events from "../events.js";
import type * as http from "../http.js";
import type * as leaderboards from "../leaderboards.js";
import type * as lib_auth from "../lib/auth.js";
import type * as matches from "../matches.js";
import type * as notifications from "../notifications.js";
import type * as pookalam from "../pookalam.js";
import type * as profiles from "../profiles.js";
import type * as quizzes from "../quizzes.js";
import type * as seed from "../seed.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  admin: typeof admin;
  announcements: typeof announcements;
  controlCenter: typeof controlCenter;
  creators: typeof creators;
  events: typeof events;
  http: typeof http;
  leaderboards: typeof leaderboards;
  "lib/auth": typeof lib_auth;
  matches: typeof matches;
  notifications: typeof notifications;
  pookalam: typeof pookalam;
  profiles: typeof profiles;
  quizzes: typeof quizzes;
  seed: typeof seed;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
