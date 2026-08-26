// Convex server wrapper types for Next.js compilation
import {
  queryGeneric,
  mutationGeneric,
  actionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
  internalActionGeneric,
  httpActionGeneric,
} from "convex/server";

export const query = queryGeneric;
export const mutation = mutationGeneric;
export const action = actionGeneric;
export const internalMutation = internalMutationGeneric;
export const internalQuery = internalQueryGeneric;
export const internalAction = internalActionGeneric;
export const httpAction = httpActionGeneric;
export { httpRouter } from "convex/server";
