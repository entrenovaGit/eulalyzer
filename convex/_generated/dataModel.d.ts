/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type { GenericId, DocumentByName, TableNamesInDataModel } from "convex/values";
import type { DataModelFromSchemaDefinition } from "convex/server";
import type schema from "../schema.js";

/**
 * The names of all of your Convex tables.
 */
export type TableNames = TableNamesInDataModel<DataModel>;

/**
 * The type of a document stored in Convex.
 */
export type Doc<TableName extends TableNames> = DocumentByName<DataModel, TableName>;

/**
 * An identifier for a document in Convex.
 *
 * Convex documents are uniquely identified by their `Id`, which is accessible
 * on the `_id` field. To learn more, see https://docs.convex.dev/database/document-ids.
 *
 * Documents can be loaded using `db.get(id)` in query and mutation functions.
 *
 * **Important**: Use `myId.toString()` to serialize an `Id` to a string.
 */
export type Id<TableName extends TableNames> = GenericId<TableName>;

export declare const Id: {
  <TableName extends TableNames>(tableName: TableName): GenericId<TableName>;
};

/**
 * A type describing your Convex data model.
 *
 * This type is used to parameterize methods like `queryGeneric` and
 * `mutationGeneric` to generate the correct types for your app.
 */
export type DataModel = DataModelFromSchemaDefinition<typeof schema>;