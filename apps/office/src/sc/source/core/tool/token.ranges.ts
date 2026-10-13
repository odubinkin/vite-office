/** @fileoverview Original extendRangeReference operation from Calc token.cxx; JS GC replaces only native refcount-dependent in-place reuse with cloning. */
import { StackVar } from "../../../../formula/inc/token";
import type { FormulaToken } from "../../../../formula/inc/token";
import type { FormulaTokenRef } from "../../../../formula/inc/types";
import { ScAddress } from "../../../inc/address";
import { ScSheetLimits } from "../../../inc/sheetlimits";
import { ScComplexRefData } from "../../../inc/refdata";
import {
  ScSingleRefToken,
  ScDoubleRefToken,
  ScRefListToken,
  ScExternalSingleRefToken,
  ScExternalDoubleRefToken,
} from "./token.references";

/** Original range extension across actual reference tokens; unique native ownership optimization is omitted under user-authorized GC. @param limits - Result bounds owner. @param token1 - Left genuine token. @param token2 - Right genuine token. @param position - Formula origin. @param _bReuseDoubleRef - Original reuse hint retained; GC always uses native clone path without ownership counts. @returns Extended actual token or null. */
export function extendRangeReference(
  limits: ScSheetLimits,
  token1: FormulaToken,
  token2: FormulaToken,
  position: ScAddress,
  _bReuseDoubleRef: boolean,
): FormulaTokenRef {
  void _bReuseDoubleRef;
  let type1 = token1.GetType();
  if (
    type1 !== StackVar.svSingleRef &&
    type1 !== StackVar.svDoubleRef &&
    type1 !== StackVar.svRefList &&
    type1 !== StackVar.svExternalSingleRef &&
    type1 !== StackVar.svExternalDoubleRef
  )
    return null;
  let type2 = token2.GetType();
  if (
    type2 !== StackVar.svSingleRef &&
    type2 !== StackVar.svDoubleRef &&
    type2 !== StackVar.svRefList
  )
    return null;
  let result: ScDoubleRefToken | ScExternalDoubleRefToken | null = null;
  let external = type1 === StackVar.svExternalSingleRef;
  if ((type1 === StackVar.svSingleRef || external) && type2 === StackVar.svSingleRef) {
    const second = (token2 as ScSingleRefToken).GetSingleRef();
    if (external && second.IsFlag3D()) return null;
    const range = new ScComplexRefData();
    range.Ref1.assign(
      external
        ? (token1 as ScExternalSingleRefToken).GetSingleRef()
        : (token1 as ScSingleRefToken).GetSingleRef(),
    );
    range.Ref2.assign(range.Ref1);
    range.Ref2.SetFlag3D(false);
    range.Extend(limits, second, position);
    if (external) {
      const first = token1 as ScExternalSingleRefToken;
      result = new ScExternalDoubleRefToken(first.GetFileId(), first.GetTableName(), range);
    } else result = new ScDoubleRefToken(limits, range);
  } else {
    external = external || type1 === StackVar.svExternalDoubleRef;
    let list: ScComplexRefData[] | null = null;
    if (type1 === StackVar.svDoubleRef) {
      result = (token1 as ScDoubleRefToken).Clone() as ScDoubleRefToken;
      type1 = StackVar.svUnknown;
    } else if (type2 === StackVar.svDoubleRef) {
      result = (token2 as ScDoubleRefToken).Clone() as ScDoubleRefToken;
      type2 = StackVar.svUnknown;
    } else if (type1 === StackVar.svRefList) list = (token1 as ScRefListToken).GetRefList();
    else if (type2 === StackVar.svRefList) list = (token2 as ScRefListToken).GetRefList();
    if (list) {
      if (list.length === 0) return null;
      if (external) return null;
      result = new ScDoubleRefToken(limits, list[0] as ScComplexRefData);
    }
    if (!result) return null;
    const types = [type1, type2],
      tokens = [token1, token2],
      range = (result as ScDoubleRefToken).GetDoubleRef();
    for (let i = 0; i < 2; ++i) {
      const token = tokens[i] as FormulaToken;
      switch (types[i]) {
        case StackVar.svSingleRef:
          range.Extend(limits, (token as ScSingleRefToken).GetSingleRef(), position);
          break;
        case StackVar.svDoubleRef:
          range.Extend(limits, (token as ScDoubleRefToken).GetDoubleRef(), position);
          break;
        case StackVar.svRefList: {
          const refs = (token as ScRefListToken).GetRefList();
          if (refs.length === 0) return null;
          for (const ref of refs) range.Extend(limits, ref, position);
          break;
        }
        case StackVar.svExternalSingleRef:
          if (range.Ref1.IsFlag3D() || range.Ref2.IsFlag3D()) return null;
          else range.Extend(limits, (token as ScExternalSingleRefToken).GetSingleRef(), position);
          break;
        case StackVar.svExternalDoubleRef:
          if (range.Ref1.IsFlag3D() || range.Ref2.IsFlag3D()) return null;
          else range.Extend(limits, (token as ScExternalDoubleRefToken).GetDoubleRef(), position);
          break;
        default:
          break;
      }
    }
  }
  return result;
}
