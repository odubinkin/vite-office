/** @fileoverview Original script/bidi span aggregates and actual ParaPortion declaration boundary from ParagraphPortion.hxx. */
/** Original mutable three-field script-position value;inputs inhabit native short/signed32 domains. */
export class ScriptTypePosInfo {
  /** Original value constructor. @param nScriptType - Native i18n script. @param nStartPos - UTF16 start. @param nEndPos - Exclusive end. @returns Value. */
  constructor(
    public nScriptType: number,
    public nStartPos: number,
    public nEndPos: number,
  ) {}
}
/** Original vector element ownership uses ordinary JS values. */
export type ScriptTypePosInfos = ScriptTypePosInfo[];

/** Original mutable bidi-level span aggregate. */
export class WritingDirectionInfo {
  /** Original source aggregate construction. @param nType - Source uint8 bidi level. @param nStartPos - Raw start. @param nEndPos - Raw end. @returns Value. */
  constructor(
    public nType: number,
    public nStartPos: number,
    public nEndPos: number,
  ) {
    this.nType &= 255;
  }
}
/** Original owning vector alias. */
export type WritingDirectionInfos = WritingDirectionInfo[];
export { ParaPortion } from "../source/editeng/editdoc.portions";
