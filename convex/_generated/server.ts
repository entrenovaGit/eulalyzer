/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex query and mutation functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import {
  ActionBuilder,
  MutationBuilder,
  QueryBuilder,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
  queryGeneric,
  mutationGeneric,
  actionGeneric,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

/**
 * Define a query in this Convex app's public API.
 *
 * This function will be allowed to read your Convex database and will be accessible from the client.
 *
 * @param func - The query function. It receives a `QueryCtx` as its first argument.
 * @returns The wrapped query. Include this as an export from a `.ts` file in your `convex/` directory.
 */
export const query = queryGeneric<DataModel>;

/**
 * Define a mutation in this Convex app's public API.
 *
 * This function will be allowed to modify your Convex database and will be accessible from the client.
 *
 * @param func - The mutation function. It receives a `MutationCtx` as its first argument.
 * @returns The wrapped mutation. Include this as an export from a `.ts` file in your `convex/` directory.
 */
export const mutation = mutationGeneric<DataModel>;

/**
 * Define an action in this Convex app's public API.
 *
 * An action can run any JavaScript code, including non-deterministic 
 * code and code with side-effects. Actions can call third-party services 
 * and can read from and write to the Convex database indirectly by calling queries and mutations.
 *
 * @param func - The action function. It receives an `ActionCtx` as its first argument.
 * @returns The wrapped action. Include this as an export from a `.ts` file in your `convex/` directory.
 */
export const action = actionGeneric<DataModel>;

/**
 * Define a query that is only accessible from other Convex functions (but not from the client).
 *
 * This function will be allowed to read from your Convex database. It will not be accessible from the client.
 *
 * @param func - The query function. It receives a `QueryCtx` as its first argument.
 * @returns The wrapped query. Include this as an export from a `.ts` file in your `convex/` directory.
 */
export const internalQuery = internalQueryGeneric<DataModel>;

/**
 * Define a mutation that is only accessible from other Convex functions (but not from the client).
 *
 * This function will be allowed to modify your Convex database. It will not be accessible from the client.
 *
 * @param func - The mutation function. It receives a `MutationCtx` as its first argument.
 * @returns The wrapped mutation. Include this as an export from a `.ts` file in your `convex/` directory.
 */
export const internalMutation = internalMutationGeneric<DataModel>;

/**
 * Define an action that is only accessible from other Convex functions (but not from the client).
 *
 * @param func - The action function. It receives an `ActionCtx` as its first argument.
 * @returns The wrapped action. Include this as an export from a `.ts` file in your `convex/` directory.
 */
export const internalAction = internalActionGeneric<DataModel>;

/**
 * Create a wrapper to define a query within a Convex component.
 *
 * @param component - A reference to the component definition.
 * @returns A function to define a query within the component.
 */
export function queryWithinComponent<
  ComponentApi extends Record<string, unknown>,
>(
  component: any
): QueryBuilder<DataModel, "public"> {
  return queryGeneric<DataModel>;
}

/**
 * Create a wrapper to define a mutation within a Convex component.
 *
 * @param component - A reference to the component definition.
 * @returns A function to define a mutation within the component.
 */
export function mutationWithinComponent<
  ComponentApi extends Record<string, unknown>,
>(
  component: any
): MutationBuilder<DataModel, "public"> {
  return mutationGeneric<DataModel>;
}

/**
 * Create a wrapper to define an action within a Convex component.
 *
 * @param component - A reference to the component definition.
 * @returns A function to define an action within the component.
 */
export function actionWithinComponent<
  ComponentApi extends Record<string, unknown>,
>(
  component: any
): ActionBuilder<DataModel, "public"> {
  return actionGeneric<DataModel>;
}