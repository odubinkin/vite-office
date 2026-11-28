/** @fileoverview Original ScFormulaCellGroup code,scalar metadata and cached area-listener ownership split from formulacell.cxx;column grouping remains a separate consumer. */
import { ScCompiler } from "../../../inc/compiler";
import { ScMatrixMode } from "../../../inc/formulacell";
import { FormulaError } from "../../../../formula/inc/errorcodes";
import { OpCode } from "../../../../formula/inc/opcode";
import type { Grammar } from "../../../../formula/inc/grammar";
import type { ScAddress } from "../../../inc/address";
import { ScTokenArray } from "../../../inc/tokenarray";
import type { ScFormulaCell } from "../../../inc/formulacell";
import { SvNumFormatType } from "../../../../svl/inc/zforlist";
import { GroupCalcEnabled } from "../../../inc/types";
import { ScRange, BCA_LISTEN_ALWAYS } from "../../../inc/address";
import { FormulaGroupAreaListener } from "../../../inc/grouparealistener";
import type { ScDocument } from "../../../inc/document";
import type { delayed_delete_vector_iterator } from "../../../../external/mdds/include/mdds/multi_type_vector/delayed_delete_vector";

import { ScSingleRefToken, ScDoubleRefToken, ScTableRefToken } from "../../../inc/token";
import {
  StackVar,
  FormulaDoubleToken,
  FormulaStringToken,
  FormulaIndexToken,
  FormulaByteToken,
  FormulaExternalToken,
  FormulaErrorToken,
  type FormulaToken,
} from "../../../../formula/inc/token";
import { approxEqual } from "../../../../sal/inc/rtl/math";

/** Original ScFormulaCell::CompareState discriminator. */
export enum CompareState {
  NotEqual,
  EqualInvariant,
  EqualRelativeRef,
}

/** Compares shareable RPN and lexical tokens for a Calc formula group. @param leftCode - Source token array. @param rightCode - Adjacent token array. @returns Classification of group compatibility. */
export function CompareFormulaGroupTokens(
  leftCode: ScTokenArray,
  rightCode: ScTokenArray,
): CompareState {
  if (!leftCode.IsShareable() || !rightCode.IsShareable()) return CompareState.NotEqual;
  let left = leftCode.GetCode(),
    right = rightCode.GetCode(),
    length = leftCode.GetCodeLen(),
    otherLength = rightCode.GetCodeLen();
  if (!left || !right) return CompareState.NotEqual;
  if (length !== otherLength) return CompareState.NotEqual;
  if (leftCode.GetCodeError() !== rightCode.GetCodeError()) return CompareState.NotEqual;
  let invariant = true;
  for (let index = 0; index < length; index++) {
    const a = left[index] as FormulaToken,
      b = right[index] as FormulaToken;
    if (
      a.GetType() !== b.GetType() ||
      a.GetOpCode() !== b.GetOpCode() ||
      a.GetParamCount() !== b.GetParamCount()
    )
      return CompareState.NotEqual;
    switch (a.GetType()) {
      case StackVar.svMatrix:
      case StackVar.svExternalSingleRef:
      case StackVar.svExternalDoubleRef:
        return CompareState.NotEqual;
      case StackVar.svSingleRef: {
        const reference = (a as ScSingleRefToken).GetSingleRef();
        if (!reference.equals((b as ScSingleRefToken).GetSingleRef())) return CompareState.NotEqual;
        if (reference.IsRowRel()) invariant = false;
        break;
      }
      case StackVar.svDoubleRef: {
        const first = (a as ScDoubleRefToken).GetSingleRef(),
          second = (a as ScDoubleRefToken).GetSingleRef2();
        if (!first.equals((b as ScDoubleRefToken).GetSingleRef())) return CompareState.NotEqual;
        if (!second.equals((b as ScDoubleRefToken).GetSingleRef2())) return CompareState.NotEqual;
        if (first.IsRowRel()) invariant = false;
        if (second.IsRowRel()) invariant = false;
        break;
      }
      case StackVar.svDouble:
        if (
          !approxEqual((a as FormulaDoubleToken).GetDouble(), (b as FormulaDoubleToken).GetDouble())
        )
          return CompareState.NotEqual;
        break;
      case StackVar.svString:
        if (!(a as FormulaStringToken).GetString().equals((b as FormulaStringToken).GetString()))
          return CompareState.NotEqual;
        break;
      case StackVar.svIndex:
        if (a.GetOpCode() === OpCode.ocName || a.GetOpCode() === OpCode.ocDBArea) {
          const first = a as FormulaIndexToken,
            second = b as FormulaIndexToken;
          if (first.GetIndex() !== second.GetIndex() || first.GetSheet() !== second.GetSheet())
            return CompareState.NotEqual;
        } else if ((a as ScTableRefToken).GetIndex() !== (b as ScTableRefToken).GetIndex())
          return CompareState.NotEqual;
        break;
      case StackVar.svByte:
        if ((a as FormulaByteToken).GetByte() !== (b as FormulaByteToken).GetByte())
          return CompareState.NotEqual;
        break;
      case StackVar.svExternal:
        if (
          !(a as FormulaExternalToken)
            .GetExternal()
            .equals((b as FormulaExternalToken).GetExternal())
        )
          return CompareState.NotEqual;
        if ((a as FormulaExternalToken).GetByte() !== (b as FormulaExternalToken).GetByte())
          return CompareState.NotEqual;
        break;
      case StackVar.svError:
        if ((a as FormulaErrorToken).GetError() !== (b as FormulaErrorToken).GetError())
          return CompareState.NotEqual;
        break;
      default:
        break;
    }
  }
  left = leftCode.GetArray();
  right = rightCode.GetArray();
  length = leftCode.GetLen();
  otherLength = rightCode.GetLen();
  if (!left || !right) return CompareState.NotEqual;
  if (length !== otherLength) return CompareState.NotEqual;
  for (let index = 0; index < length; index++) {
    const a = left[index] as FormulaToken,
      b = right[index] as FormulaToken;
    if (
      a.GetType() !== b.GetType() ||
      a.GetOpCode() !== b.GetOpCode() ||
      a.GetParamCount() !== b.GetParamCount()
    )
      return CompareState.NotEqual;
    switch (a.GetType()) {
      case StackVar.svSingleRef: {
        const reference = (a as ScSingleRefToken).GetSingleRef();
        if (!reference.equals((b as ScSingleRefToken).GetSingleRef())) return CompareState.NotEqual;
        if (reference.IsRowRel()) invariant = false;
        break;
      }
      case StackVar.svDoubleRef: {
        const first = (a as ScDoubleRefToken).GetSingleRef(),
          second = (a as ScDoubleRefToken).GetSingleRef2();
        if (!first.equals((b as ScDoubleRefToken).GetSingleRef())) return CompareState.NotEqual;
        if (!second.equals((b as ScDoubleRefToken).GetSingleRef2())) return CompareState.NotEqual;
        if (first.IsRowRel()) invariant = false;
        if (second.IsRowRel()) invariant = false;
        break;
      }
      case StackVar.svIndex:
        if (a.GetOpCode() === OpCode.ocTableRef) {
          if ((a as ScTableRefToken).GetIndex() !== (b as ScTableRefToken).GetIndex())
            return CompareState.NotEqual;
        } else {
          const first = a as FormulaIndexToken,
            second = b as FormulaIndexToken;
          if (first.GetIndex() !== second.GetIndex() || first.GetSheet() !== second.GetSheet())
            return CompareState.NotEqual;
        }
        break;
      default:
        break;
    }
  }
  return invariant ? CompareState.EqualInvariant : CompareState.EqualRelativeRef;
}

/** Original copied range/fixed-endpoint key;string keys encode values for JS Map storage only. */
class AreaListenerKey {
  readonly maRange: ScRange;
  /** Copies native key values. @param range - Source range. @param mbStartFixed - Start policy. @param mbEndFixed - End policy. @returns Key. */
  constructor(
    range: ScRange,
    readonly mbStartFixed: boolean,
    readonly mbEndFixed: boolean,
  ) {
    this.maRange = new ScRange(range);
  }
  /** Original source range then boolean key order. @param other - Compared key. @returns Order. */
  compare(other: AreaListenerKey): number {
    return (
      this.maRange.compare(other.maRange) ||
      Number(this.mbStartFixed) - Number(other.mbStartFixed) ||
      Number(this.mbEndFixed) - Number(other.mbEndFixed)
    );
  }
}

/** Native shared code owner;JS references replace intrusive physical refcounts without a runtime ownership facade. */
export class ScFormulaCellGroup {
  readonly m_AreaListeners = new Map<
    string,
    { key: AreaListenerKey; listener: FormulaGroupAreaListener }
  >();
  mpCode: ScTokenArray | null = null;
  mpTopCell: ScFormulaCell | null = null;
  mnLength = 0;
  mnWeight = 0;
  mnFormatType: SvNumFormatType = SvNumFormatType.NUMBER;
  mbInvariant = false;
  mbSubTotal = false;
  mbPartOfCycle = false;
  meCalcState = GroupCalcEnabled;
  /** Original independent code copy determines vertical invariance and generates the native token hash. @param code - Source code. @returns Nothing. */
  setCode(code: ScTokenArray): void {
    this.mpCode = code.CloneValue();
    this.mbInvariant = this.mpCode.IsInvariant();
    this.mpCode.GenHash();
  }
  /** Original group compilation enables II only when source code lacks RPN;otherwise it preserves existing code and detects subtotal/aggregate opcodes. @param doc - Actual document. @param position - Formula origin. @param grammar - Native grammar. @returns Nothing. */
  compileCode(doc: ScDocument, position: ScAddress, grammar: Grammar): void {
    if (!this.mpCode) return;
    if (
      this.mpCode.GetLen() &&
      this.mpCode.GetCodeError() === FormulaError.NONE &&
      !this.mpCode.GetCodeLen()
    ) {
      const compiler = new ScCompiler(
        doc,
        position,
        this.mpCode,
        grammar,
        true,
        (this.mpTopCell as ScFormulaCell).GetMatrixFlag() !== ScMatrixMode.NONE,
      );
      this.mbSubTotal = compiler.CompileTokenArray();
      this.mnFormatType = compiler.GetNumFormatType();
    } else
      this.mbSubTotal =
        this.mpCode.HasOpCodeRPN(OpCode.ocSubTotal) || this.mpCode.HasOpCodeRPN(OpCode.ocAggregate);
  }
  /** Original range/policy cache constructs one actual listener using the borrowed real top-cell block pointer. @param top - Actual formula block pointer. @param range - Source reference range. @param startFixed - Start row policy. @param endFixed - End row policy. @returns Cached owned listener. */
  getAreaListener(
    top: delayed_delete_vector_iterator<ScFormulaCell | null>,
    range: ScRange,
    startFixed: boolean,
    endFixed: boolean,
  ): FormulaGroupAreaListener {
    const encoded = range.GetVars().join(",") + ":" + Number(startFixed) + ":" + Number(endFixed);
    let entry = this.m_AreaListeners.get(encoded);
    if (!entry) {
      const cell = top.get() as ScFormulaCell;
      entry = {
        key: new AreaListenerKey(range, startFixed, endFixed),
        listener: new FormulaGroupAreaListener(
          range,
          cell.GetDocument(),
          cell.aPos,
          this.mnLength,
          startFixed,
          endFixed,
        ),
      };
      this.m_AreaListeners.set(encoded, entry);
    }
    return entry.listener;
  }
  /** Original sorted key teardown ends actual areas,then destroys owned listeners through the existing semantic destructor boundary. @param doc - Actual document. @returns Nothing. */
  endAllGroupListening(doc: ScDocument): void {
    const entries = Array.from(this.m_AreaListeners.values()).sort(
      /** Retains native key ordering during teardown. @param left - First entry. @param right - Second entry. @returns Order. */ (
        left,
        right,
      ) => left.key.compare(right.key),
    );
    for (const { listener } of entries) {
      const range = listener.getListeningRange();
      doc.EndListeningArea(range, !range.equals(BCA_LISTEN_ALWAYS()), listener);
    }
    for (const { listener } of entries) listener.Dispose();
    this.m_AreaListeners.clear();
  }
}
