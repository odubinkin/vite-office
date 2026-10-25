/** @fileoverview Original ScriptTypePosInfo value from ParagraphPortion.hxx;paragraph layout/storage owners remain unported. */
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
