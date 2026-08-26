import { GenericDataModel, GenericDocument } from "convex/server";

export type DataModel = GenericDataModel;
export type Doc<TableName extends string> = GenericDocument;
export type Id<TableName extends string> = string & { __tableName?: TableName };
