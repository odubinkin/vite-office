/** @fileoverview Original EditTextObject/TextRotation declaration boundary;stateful layout engines and FieldUpdater remain separate owners. */
export enum TextRotation {
  NONE,
  TOPTOBOTTOM,
  BOTTOMTOTOP,
}
export { EditTextObject } from "../source/editeng/editobj";
export { EditTextObjectImpl } from "../source/editeng/editobj.owner";
