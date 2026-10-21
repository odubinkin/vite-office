/** @fileoverview Original EditTextObject/TextRotation declaration boundary;stateful layout engines and FieldUpdater remain separate owners. */
export enum TextRotation {
  NONE,
  TOPTOBOTTOM,
  BOTTOMTOTOP,
}
export { EditTextObject } from "../source/editeng/editobj";
export { EditTextObjectImpl } from "../source/editeng/editobj.owner";
import type { EditTextObject } from "../source/editeng/editobj";
/** Native const reference to the actual rich-text class,excluding represented direct mutators and its nonconst field updater. */
export type EditTextObjectConstReference = Omit<
  EditTextObject,
  | `Set${string}`
  | `Change${string}`
  | `Clear${string}`
  | `Remove${string}`
  | "NormalizeString"
  | "GetFieldUpdater"
  | "dispose"
>;
