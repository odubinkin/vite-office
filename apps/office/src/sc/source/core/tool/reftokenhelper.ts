/** @fileoverview Native reftokenhelper.cxx range/token conversions,classifiers and intersections over actual Calc reference owners. Named-expression lookup,range compilation and joining remain separate unported responsibilities. */
import { FormulaToken, StackVar } from "../../../../formula/inc/token";
import { OpCode } from "../../../../formula/inc/opcode";
import type { ScDocument } from "../../../inc/document";
import { ScAddress, ScRange } from "../../../inc/address";
import type { ScRangeList } from "../../../inc/rangelst";
import { ScSingleRefData, ScComplexRefData } from "../../../inc/refdata";
import type { ScTokenRef } from "../../../inc/types";
import {
  ScSingleRefToken,
  ScDoubleRefToken,
  ScExternalToken,
  ScExternalSingleRefToken,
  ScExternalDoubleRefToken,
} from "../../../inc/token";
/** Actual implemented native reference-token families,without a substitute reference data model. */
type ReferenceToken =
  ScSingleRefToken | ScDoubleRefToken | ScExternalSingleRefToken | ScExternalDoubleRefToken;
/** Original extraction validates the requested internal/external family before assigning the output. @param doc - Actual bounds/reference owner. @param range - Existing output value. @param token - Non-null native token. @param position - Formula origin. @param external - Original default false. @returns Whether converted. */
export function getRangeFromToken(
  doc: ScDocument,
  range: ScRange,
  token: FormulaToken,
  position: ScAddress,
  external = false,
): boolean {
  switch (token.GetType()) {
    case StackVar.svSingleRef:
      if (external) return false;
      range.assign((token as ScSingleRefToken).GetSingleRef().toAbs(doc, position));
      return true;
    case StackVar.svExternalSingleRef:
      if (!external) return false;
      range.assign((token as ScExternalSingleRefToken).GetSingleRef().toAbs(doc, position));
      return true;
    case StackVar.svDoubleRef:
      if (external) return false;
      range.assign((token as ScDoubleRefToken).GetDoubleRef().toAbs(doc, position));
      return true;
    case StackVar.svExternalDoubleRef:
      if (!external) return false;
      range.assign((token as ScExternalDoubleRefToken).GetDoubleRef().toAbs(doc, position));
      return true;
    case StackVar.svIndex:
      if (token.GetOpCode() === OpCode.ocName)
        throw new Error("Named reference tokens require native range-name ownership");
      return false;
    default:
      return false;
  }
}
/** Original ignores extraction success and appends one range for every token,including the default on failure. @param doc - Actual document. @param ranges - Appended output. @param tokens - Native token references. @param position - Formula origin. @returns Nothing. */
export function getRangeListFromTokens(
  doc: ScDocument,
  ranges: ScRangeList,
  tokens: readonly ScTokenRef[],
  position: ScAddress,
): void {
  for (const token of tokens) {
    const range = new ScRange();
    getRangeFromToken(doc, range, token as FormulaToken, position);
    ranges.push_back(range);
  }
}
/** Original always creates a double reference and sets the first/second sheet-display flags separately. @param doc - Actual limits owner. @param token - Reference output. @param range - Source value. @returns Nothing. */
export function getTokenFromRange(doc: ScDocument, token: [ScTokenRef], range: ScRange): void {
  const data = new ScComplexRefData();
  data.InitRange(range);
  data.Ref1.SetFlag3D(true);
  data.Ref2.SetFlag3D(range.aStart.Tab() !== range.aEnd.Tab());
  token[0] = new ScDoubleRefToken(doc.GetSheetLimits(), data);
}
/** Original temporary-vector/swap semantics replace all output entries while keeping caller vector identity. @param doc - Actual document. @param tokens - Existing output vector. @param ranges - Source values. @returns Nothing. */
export function getTokensFromRangeList(
  doc: ScDocument,
  tokens: ScTokenRef[],
  ranges: ScRangeList,
): void {
  const result: ScTokenRef[] = [];
  for (const range of ranges) {
    const token: [ScTokenRef] = [null];
    getTokenFromRange(doc, token, range);
    result.push(token[0]);
  }
  tokens.length = 0;
  for (const token of result) tokens.push(token);
}
/** Original four reference discriminators;named/index/list tokens are not included. @param token - Non-null native token. @returns Reference family. */
export function isRef(token: FormulaToken): boolean {
  switch (token.GetType()) {
    case StackVar.svSingleRef:
    case StackVar.svDoubleRef:
    case StackVar.svExternalSingleRef:
    case StackVar.svExternalDoubleRef:
      return true;
    default:
      return false;
  }
}
/** Original external discriminator pair. @param token - Non-null native token. @returns External reference. */
export function isExternalRef(token: FormulaToken): boolean {
  switch (token.GetType()) {
    case StackVar.svExternalSingleRef:
    case StackVar.svExternalDoubleRef:
      return true;
    default:
      return false;
  }
}
/** Original overlap order retains file-ID filtering and does not compare external table-name strings. @param doc - Actual document. @param tokens - Candidate owners. @param token - Incoming native token. @param position - Formula origin. @returns Intersection. */
export function intersects(
  doc: ScDocument,
  tokens: readonly ScTokenRef[],
  token: FormulaToken,
  position: ScAddress,
): boolean {
  if (!isRef(token)) return false;
  const external = isExternalRef(token),
    file = external ? (token as ScExternalToken).GetFileId() : 0;
  const range = new ScRange();
  getRangeFromToken(doc, range, token, position, external);
  for (const candidate of tokens) {
    const other = candidate as FormulaToken;
    if (!isRef(other)) continue;
    if (external !== isExternalRef(other)) continue;
    const next = new ScRange();
    getRangeFromToken(doc, next, other, position, external);
    if (external && file !== (other as ScExternalToken).GetFileId()) continue;
    if (range.Intersects(next)) return true;
  }
  return false;
}
/** Original normalization copies endpoints and preserves unrelated existing trim state for a single reference. @param data - Actual output owner. @param token - Native source. @returns Supported reference family. */
export function getDoubleRefDataFromToken(data: ScComplexRefData, token: FormulaToken): boolean {
  switch (token.GetType()) {
    case StackVar.svSingleRef:
    case StackVar.svExternalSingleRef: {
      const reference = (token as ScSingleRefToken | ScExternalSingleRefToken).GetSingleRef();
      data.Ref1.assign(reference);
      data.Ref1.SetFlag3D(true);
      data.Ref2.assign(reference);
      data.Ref2.SetFlag3D(false);
      break;
    }
    case StackVar.svDoubleRef:
    case StackVar.svExternalDoubleRef:
      data.assign((token as ScDoubleRefToken | ScExternalDoubleRefToken).GetDoubleRef());
      break;
    default:
      return false;
  }
  return true;
}
/** Original address/range overloads use InitAddress/InitRange without the getTokenFromRange display-flag overrides. @param doc - Actual limits owner. @param value - Source value. @returns Native reference token. */
export function createRefToken(doc: ScDocument, value: ScAddress | ScRange): FormulaToken {
  if (value instanceof ScAddress) {
    const data = new ScSingleRefData();
    data.InitAddress(value);
    return new ScSingleRefToken(doc.GetSheetLimits(), data);
  }
  const data = new ScComplexRefData();
  data.InitRange(value);
  return new ScDoubleRefToken(doc.GetSheetLimits(), data);
}
/** Original pointer query borrows the first endpoint instead of cloning it. @param token - Non-null native token. @returns Actual member or null. */
export function getSingleRef(token: FormulaToken): ScSingleRefData | null {
  switch (token.GetType()) {
    case StackVar.svSingleRef:
    case StackVar.svExternalSingleRef:
    case StackVar.svDoubleRef:
    case StackVar.svExternalDoubleRef:
      return (token as ReferenceToken).GetSingleRef();
    default:
      return null;
  }
}
