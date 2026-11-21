/** @fileoverview Native clipboard reference rotation from formulacell.cxx. */
import type { ScFormulaCell } from "./formulacell";
import type { ScSingleRefData } from "../../../inc/refdata";
import {
  ScDoubleRefToken,
  ScExternalDoubleRefToken,
  ScExternalSingleRefToken,
  ScSingleRefToken,
} from "../tool/token.references";

/** Rotates the original relative column and row offsets. @param ref - Actual reference. @returns Nothing. */
function Rotate(ref: ScSingleRefData): void {
  const col = ref.Col();
  ref.SetRelCol(ref.Row());
  ref.SetRelRow(col);
}

/** Rotates fully relative clipboard references and schedules native recompilation. @param this - Formula cloned into the transposed clipboard. @returns Nothing. */
export function TransposeReference(this: ScFormulaCell): void {
  const code = this.GetCode();
  const tokens = code.GetArray();
  if (!tokens) return;
  for (let index = 0; index < code.GetLen(); ++index) {
    const token = tokens[index];
    if (!(
      token instanceof ScSingleRefToken ||
      token instanceof ScDoubleRefToken ||
      token instanceof ScExternalSingleRefToken ||
      token instanceof ScExternalDoubleRefToken
    ))
      continue;
    const first = token.GetSingleRef();
    if (!first.IsColRel() || !first.IsRowRel()) continue;
    // The original range branch tests only svDoubleRef, which excludes external ranges.
    if (token instanceof ScDoubleRefToken) {
      const second = token.GetSingleRef2();
      if (!second.IsColRel() || !second.IsRowRel()) continue;
      Rotate(second);
    }
    Rotate(first);
    this["bCompile"] = true;
  }
}
