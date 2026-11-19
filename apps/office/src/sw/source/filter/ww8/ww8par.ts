/** @fileoverview Original export numbering equivalence from ww8par.cxx; importer and list-level geometry remain outside this owner slice. */
import { SwNumFormat, type SwNumRule, type ConstSwNumFormat } from "../../core/doc/number";
/** Original rule metadata equality fast path followed by exported one/nine-level comparison. @param first - Actual rule. @param second - Actual rule. @returns Whether export formats differ. */
export function AreListsDifferentForExport(first: SwNumRule, second: SwNumRule): boolean {
  if (first.Equals(second)) return false;
  if (first.IsContinusNum() !== second.IsContinusNum()) return true;
  for (let level = 0; level < (first.IsContinusNum() ? 1 : 9); ++level)
    if (AreListLevelsDifferentForExport(first.Get(level), second.Get(level))) return true;
  return false;
}
/** Original character-style comparison uses direct native item-set equality, then clears copied style names/registrations. @param first - Actual level. @param second - Actual level. @returns Whether export formats differ. */
export function AreListLevelsDifferentForExport(
  first: ConstSwNumFormat,
  second: ConstSwNumFormat,
): boolean {
  if (first.Equals(second)) return false;
  const firstStyle = first.GetCharFormat(),
    secondStyle = second.GetCharFormat();
  if ((firstStyle === undefined) !== (secondStyle === undefined)) return true;
  if (
    firstStyle !== undefined &&
    secondStyle !== undefined &&
    !firstStyle.GetAttrSet().Equals(secondStyle.GetAttrSet(), true)
  )
    return true;
  const left = new SwNumFormat(first),
    right = new SwNumFormat(second);
  try {
    left.SetCharFormatName("");
    right.SetCharFormatName("");
    left.SetCharFormat(undefined);
    right.SetCharFormat(undefined);
    return !left.Equals(right);
  } finally {
    right.Dispose();
    left.Dispose();
  }
}
