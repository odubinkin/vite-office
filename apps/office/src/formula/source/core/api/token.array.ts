/** @fileoverview Original FormulaTokenArray code/RPN and recalc state from tokenarray.hxx/token.cxx; single shared owner, ordinary JS token refs and initialized active contents. */
import {
  FormulaToken,
  FormulaByteToken,
  StackVar,
  FormulaDoubleToken,
  FormulaStringToken,
  FormulaStringOpToken,
  FormulaErrorToken,
} from "../../../inc/token";
import { FormulaError } from "../../../inc/errorcodes";
import { OpCode } from "../../../inc/opcode";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";

/** Original fixed UInt8 recalculation bits and aliases. */
export const ScRecalcMode = {
  ALWAYS: 1,
  ONLOAD_MUST: 2,
  ONLOAD_ONCE: 4,
  ONLOAD_LENIENT: 8,
  NORMAL: 16,
  FORCED: 32,
  ONREFMOVE: 64,
  EMask: 31,
} as const;
/** Original UInt8 flags type, including initialized combined bits. */
export type ScRecalcMode = number;
/** Original mutable UInt16 index reference grouped at the JS call boundary. */
export interface FormulaTokenArrayIndex {
  value: number;
}
const FORMULA_MAXTOKENS = 8192;

/** Original StandardRange borrows a buffer and fixes its end at construction; replacing entries remains visible. */
export class FormulaTokenArrayStandardRange {
  /** Original begin pointer and fixed end index adapted to a JS iterable. @param mpBegin - Actual borrowed buffer. @param mpEnd - Active native size. @returns Range. */
  constructor(
    private readonly mpBegin: readonly FormulaToken[] | null,
    private readonly mpEnd: number,
  ) {}
  /** Original pointer-range traversal uses live initialized slots with a fixed end. @returns Borrowed token iterator. */
  *[Symbol.iterator](): IterableIterator<FormulaToken> {
    for (let i = 0; i < this.mpEnd; ++i)
      yield (this.mpBegin as readonly FormulaToken[])[i] as FormulaToken;
  }
}

/** Original shared code/RPN storage operation family; copies share tokens, active arrays are independent and GC owns object lifetime. */
export class FormulaTokenArray {
  static readonly ReplaceMode = { CODE_ONLY: 0, CODE_AND_RPN: 1 } as const;
  protected pCode: FormulaToken[] | null = null;
  protected pRPN: FormulaToken[] | null = null;
  protected nLen = 0;
  protected nRPN = 0;
  protected nError = FormulaError.NONE;
  protected nMode: ScRecalcMode = ScRecalcMode.NORMAL;
  protected bHyperLink = false;
  protected mbFromRangeName = false;
  protected mbShareable = true;
  protected mbFinalized = false;
  protected mbDynamicArrayFunction = false;
  /** Original default and shallow-copy constructors. @param source - Optional copied array. @returns Array owner. */
  constructor(source?: FormulaTokenArray) {
    if (source) this.Assign(source);
  }
  /** Original rvalue construction transfers arrays and empties source lengths, leaving its metadata flags. @param source - Moved array. @returns New owner. */
  static move(source: FormulaTokenArray): FormulaTokenArray {
    const result = new FormulaTokenArray();
    result.Move(source);
    return result;
  }
  /** Original protected Assign overload for copied state. @param source - Copied array. @returns Nothing. */
  protected Assign(source: FormulaTokenArray): void;
  /** Original optimized XML placeholder Assign overload. @param count - UInt16 count. @param tokens - Genuine initialized XML tokens. @returns Nothing. */
  protected Assign(count: number, tokens: readonly FormulaToken[]): void;
  /** Original copied code/RPN preserve token identities; XML input requires empty receiver and valid initialized ocStringXML elements. @param source - Array or UInt16 count. @param tokens - XML input when count supplied. @returns Nothing. */
  protected Assign(source: FormulaTokenArray | number, tokens?: readonly FormulaToken[]): void {
    if (typeof source === "number") {
      this.nLen = source & 0xffff;
      this.pCode = (tokens as readonly FormulaToken[]).slice(0, this.nLen);
      this.mbFinalized = true;
      return;
    }
    this.nLen = source.nLen;
    this.nRPN = source.nRPN;
    this.nError = source.nError;
    this.nMode = source.nMode;
    this.bHyperLink = source.bHyperLink;
    this.mbFromRangeName = source.mbFromRangeName;
    this.mbShareable = source.mbShareable;
    this.mbFinalized = source.mbFinalized;
    this.mbDynamicArrayFunction = source.mbDynamicArrayFunction;
    this.pCode = null;
    this.pRPN = null;
    if (this.nLen) {
      this.pCode = (source.pCode as FormulaToken[]).slice(0, this.nLen);
      this.mbFinalized = true;
    }
    if (this.nRPN) this.pRPN = (source.pRPN as FormulaToken[]).slice(0, this.nRPN);
  }
  /** Original protected move transfers references before resetting source lengths; other source flags remain. @param source - Moved array. @returns Nothing. */
  protected Move(source: FormulaTokenArray): void {
    this.pCode = source.pCode;
    source.pCode = null;
    this.pRPN = source.pRPN;
    source.pRPN = null;
    this.nLen = source.nLen;
    source.nLen = 0;
    this.nRPN = source.nRPN;
    source.nRPN = 0;
    this.nError = source.nError;
    this.nMode = source.nMode;
    this.bHyperLink = source.bHyperLink;
    this.mbFromRangeName = source.mbFromRangeName;
    this.mbShareable = source.mbShareable;
    this.mbFinalized = source.mbFinalized;
    this.mbDynamicArrayFunction = source.mbDynamicArrayFunction;
  }
  /** Original copy assignment has a self guard. @param source - Copied array. @returns This owner. */
  copy_assign(source: FormulaTokenArray): this {
    if (this === source) return this;
    this.Clear();
    this.Assign(source);
    return this;
  }
  /** Original move assignment clears first, including self-move clearing. @param source - Moved array. @returns This owner. */
  move_assign(source: FormulaTokenArray): this {
    this.Clear();
    this.Move(source);
    return this;
  }
  /** Original full reset; token identity held by other owners survives. @returns Nothing. */
  Clear(): void {
    this.pCode = null;
    this.pRPN = null;
    this.nError = FormulaError.NONE;
    this.nLen = this.nRPN = 0;
    this.bHyperLink = false;
    this.mbFromRangeName = false;
    this.mbShareable = true;
    this.mbFinalized = false;
    this.mbDynamicArrayFunction = false;
    this.ClearRecalcMode();
  }
  /** Original finalization closes only nonempty code; physical reserve reallocation is unnecessary for JS. @returns Nothing. */
  Finalize(): void {
    if (this.nLen && !this.mbFinalized) this.mbFinalized = true;
  }
  /** Original base token check intentionally performs no value operation. @param token - Checked token. @returns Nothing. */
  CheckToken(token: FormulaToken): void {
    void token;
  }
  /** Original RPN checks use the shared virtual hook on every active token. @returns Nothing. */
  CheckAllRPNTokens(): void {
    for (let i = 0; i < this.nRPN; ++i)
      this.CheckToken((this.pRPN as FormulaToken[])[i] as FormulaToken);
  }
  /** Original base array merge has no implementation; separator remains appended. @returns Null. */
  MergeArray(): null {
    return null;
  }
  /** Original protected append, finalized rejection and terminal ocStop at8192 preserve logical behavior without capacity allocation/refcounts. @param token - Genuine new token. @returns Added token or null. */
  protected Add(token: FormulaToken): FormulaToken | null {
    if (this.mbFinalized) return null;
    if (!this.pCode) this.pCode = [];
    if (this.nLen < FORMULA_MAXTOKENS - 1) {
      this.CheckToken(token);
      this.pCode[this.nLen++] = token;
      return token.GetOpCode() === OpCode.ocArrayClose ? this.MergeArray() : token;
    }
    if (this.nLen === FORMULA_MAXTOKENS - 1)
      this.pCode[this.nLen++] = new FormulaByteToken(OpCode.ocStop);
    return null;
  }
  /** Original public clone-and-add entry. @param token - Source token. @returns Added independent payload clone or null. */
  AddToken(token: FormulaToken): FormulaToken | null {
    return this.Add(token.Clone());
  }
  /** Original numeric token append. @param value - Numeric payload. @returns Added token or null. */
  AddDouble(value: number): FormulaToken | null {
    return this.Add(new FormulaDoubleToken(value));
  }
  /** Original shared-string token append. @param value - Shared value. @returns Added token or null. */
  AddString(value: SharedStringConstReference): FormulaToken | null {
    return this.Add(new FormulaStringToken(value));
  }
  /** Original malformed-source token append uses a non-interned SharedString value. @param value - Original Unicode source. @returns Added token or null. */
  AddBad(value: OUStringConstReference): FormulaToken | null {
    const string = new SharedString(value);
    try {
      return this.Add(new FormulaStringOpToken(OpCode.ocBad, string, SharedString.move));
    } finally {
      string.dispose();
    }
  }
  /** Original error-token append. @param error - Error. @returns Added token or null. */
  AddError(error: FormulaError): FormulaToken | null {
    return this.Add(new FormulaErrorToken(error));
  }
  /** Original RPN replacement writes the same actual token identity. @param offset - UInt16 position. @param token - Replacement. @returns Token or null. */
  ReplaceRPNToken(offset: number, token: FormulaToken): FormulaToken | null {
    offset &= 0xffff;
    if (offset >= this.nRPN) return null;
    this.CheckToken(token);
    (this.pRPN as FormulaToken[])[offset] = token;
    return token;
  }
  /** Original replacement scans RPN matches when requested; ownership-count gates specialize to actual identity matches. @param offset - UInt16 position. @param token - Replacement. @param mode - Original replacement mode. @returns Token or null. */
  ReplaceToken(offset: number, token: FormulaToken, mode: number): FormulaToken | null {
    offset &= 0xffff;
    if (offset >= this.nLen) return null;
    this.CheckToken(token);
    const code = this.pCode as FormulaToken[],
      old = code[offset] as FormulaToken;
    code[offset] = token;
    if (mode === FormulaTokenArray.ReplaceMode.CODE_AND_RPN)
      for (let i = 0; i < this.nRPN; ++i)
        if ((this.pRPN as FormulaToken[])[i] === old) (this.pRPN as FormulaToken[])[i] = token;
    return token;
  }
  /** Original forward-index removal and UInt16 addition/narrowing preserve its adjacent-RPN skip behavior. Valid caller ranges are required. @param offset - UInt16 start. @param count - UInt16 count. @returns Removed count. */
  RemoveToken(offset: number, count: number): number {
    offset &= 0xffff;
    count &= 0xffff;
    if (offset >= this.nLen) return 0;
    const stop = Math.min((offset + count) & 0xffff, this.nLen);
    count = (stop - offset) & 0xffff;
    const code = this.pCode as FormulaToken[];
    for (let j = offset; j < stop; ++j) {
      const old = code[j];
      for (let i = 0; i < this.nRPN; ++i)
        if ((this.pRPN as FormulaToken[])[i] === old) {
          for (let x = i + 1; x < this.nRPN; ++x)
            (this.pRPN as FormulaToken[])[x - 1] = (this.pRPN as FormulaToken[])[x] as FormulaToken;
          --this.nRPN;
        }
    }
    for (let x = stop; x < this.nLen; ++x) code[x - count] = code[x] as FormulaToken;
    this.nLen = (this.nLen - count) & 0xffff;
    return count;
  }
  /** Original RPN deletion only clears an allocated buffer when its active length is nonzero. @returns Nothing. */
  DelRPN(): void {
    if (this.nRPN) this.pRPN = null;
    this.nRPN = 0;
  }
  /** Original compiler data transfer copies initialized pointer identities; caller supplies at least UInt16 size entries. @param data - Genuine tokens. @param size - UInt16 length. @returns Nothing. */
  CreateNewRPNArrayFromData(data: readonly FormulaToken[], size: number): void {
    this.nRPN = size & 0xffff;
    this.pRPN = data.slice(0, this.nRPN);
  }
  /** Original raw code pointer view contains initialized active storage; no spare capacity certification. @returns Actual array or null. */
  GetArray(): readonly FormulaToken[] | null {
    return this.pCode;
  }
  /** Original raw RPN pointer view contains initialized active storage. @returns Actual array or null. */
  GetCode(): readonly FormulaToken[] | null {
    return this.pRPN;
  }
  /** Original first code token query. @returns Token or null. */
  FirstToken(): FormulaToken | null {
    return this.nLen ? ((this.pCode as FormulaToken[])[0] as FormulaToken) : null;
  }
  /** Original narrowed index query. @param index - UInt16 position. @returns Token or null. */
  TokenAt(index: number): FormulaToken | null {
    index &= 0xffff;
    return index >= this.nLen ? null : ((this.pCode as FormulaToken[])[index] as FormulaToken);
  }
  /** Original previous opcode with bounds checks. @param index - UInt16 position. @returns Opcode or ocNone. */
  OpCodeBefore(index: number): OpCode {
    index &= 0xffff;
    return index === 0 || index > this.nLen
      ? OpCode.ocNone
      : ((this.pCode as FormulaToken[])[index - 1] as FormulaToken).GetOpCode();
  }
  /** Original mutable UInt16 peek index decrements only on success. @param index - Caller index. @returns Previous token or null. */
  PeekPrev(index: FormulaTokenArrayIndex): FormulaToken | null {
    index.value &= 0xffff;
    if (index.value > 0 && index.value <= this.nLen)
      return (this.pCode as FormulaToken[])[--index.value] as FormulaToken;
    return null;
  }
  /** Original first RPN query. @returns Token or null. */
  FirstRPNToken(): FormulaToken | null {
    return this.nRPN ? ((this.pRPN as FormulaToken[])[0] as FormulaToken) : null;
  }
  /** Original last RPN query. @returns Token or null. */
  LastRPNToken(): FormulaToken | null {
    return this.nRPN ? ((this.pRPN as FormulaToken[])[this.nRPN - 1] as FormulaToken) : null;
  }
  /** Original outer function is last RPN opcode. @returns Opcode or ocNone. */
  GetOuterFuncOpCode(): OpCode {
    return this.nRPN ? (this.LastRPNToken() as FormulaToken).GetOpCode() : OpCode.ocNone;
  }
  /** Original initialized code token range, excluding stale tail values. @returns Active borrowed identities. */
  Tokens(): FormulaTokenArrayStandardRange {
    return new FormulaTokenArrayStandardRange(this.pCode, this.nLen);
  }
  /** Original initialized RPN range, excluding stale tail values. @returns Active borrowed identities. */
  RPNTokens(): FormulaTokenArrayStandardRange {
    return new FormulaTokenArrayStandardRange(this.pRPN, this.nRPN);
  }
  /** Original reference search includes code and RPN. @returns Reference presence. */
  HasReferences(): boolean {
    for (const token of this.Tokens()) if (token.IsRef()) return true;
    for (const token of this.RPNTokens()) if (token.IsRef()) return true;
    return false;
  }
  /** Original external-reference search uses code only. @returns External reference presence. */
  HasExternalRef(): boolean {
    for (const token of this.Tokens()) if (token.IsExternalRef()) return true;
    return false;
  }
  /** Original code opcode search. @param opcode - Opcode. @returns Presence. */
  HasOpCode(opcode: OpCode): boolean {
    for (const token of this.Tokens()) if (token.GetOpCode() === (opcode & 0xffff)) return true;
    return false;
  }
  /** Original RPN opcode search. @param opcode - Opcode. @returns Presence. */
  HasOpCodeRPN(opcode: OpCode): boolean {
    for (const token of this.RPNTokens()) if (token.GetOpCode() === (opcode & 0xffff)) return true;
    return false;
  }
  /** Original name/index search. @returns Name or column/row name presence. */
  HasNameOrColRowName(): boolean {
    for (const token of this.Tokens())
      if (token.GetType() === StackVar.svIndex || token.GetOpCode() === OpCode.ocColRowName)
        return true;
    return false;
  }
  /** Original opcode-set search. @param opcodes - Genuine opcode set. @returns Presence. */
  HasOpCodes(opcodes: ReadonlySet<OpCode>): boolean {
    for (const token of this.Tokens()) if (opcodes.has(token.GetOpCode())) return true;
    return false;
  }
  /** Original code length. @returns UInt16 length. */
  GetLen(): number {
    return this.nLen;
  }
  /** Original RPN length. @returns UInt16 length. */
  GetCodeLen(): number {
    return this.nRPN;
  }
  /** Original code error. @returns Error. */
  GetCodeError(): FormulaError {
    return this.nError;
  }
  /** Original fixed UInt16 error assignment. @param error - Error. @returns Nothing. */
  SetCodeError(error: FormulaError): void {
    this.nError = (error & 0xffff) as FormulaError;
  }
  /** Original hyperlink assignment. @param value - Flag. @returns Nothing. */
  SetHyperLink(value: boolean): void {
    this.bHyperLink = value;
  }
  /** Original hyperlink query. @returns Flag. */
  IsHyperLink(): boolean {
    return this.bHyperLink;
  }
  /** Original range-name assignment. @param value - Flag. @returns Nothing. */
  SetFromRangeName(value: boolean): void {
    this.mbFromRangeName = value;
  }
  /** Original range-name query. @returns Flag. */
  IsFromRangeName(): boolean {
    return this.mbFromRangeName;
  }
  /** Original shareability assignment. @param value - Flag. @returns Nothing. */
  SetShareable(value: boolean): void {
    this.mbShareable = value;
  }
  /** Original shareability query. @returns Flag. */
  IsShareable(): boolean {
    return this.mbShareable;
  }
  /** Original dynamic-function assignment. @param value - Flag. @returns Nothing. */
  SetDynamicArrayFunction(value: boolean): void {
    this.mbDynamicArrayFunction = value;
  }
  /** Original dynamic-function query. @returns Flag. */
  HasDynamicArrayFunction(): boolean {
    return this.mbDynamicArrayFunction;
  }
  /** Original recalc mode. @returns UInt8 mode. */
  GetRecalcMode(): ScRecalcMode {
    return this.nMode;
  }
  /** Original combined-bit query. @returns Nonexclusive initialized bits. */
  GetCombinedBitsRecalcMode(): ScRecalcMode {
    return this.nMode & (ScRecalcMode.FORCED | ScRecalcMode.ONREFMOVE);
  }
  /** Original combined-bit addition. @param bits - UInt8 mode. @returns Nothing. */
  SetCombinedBitsRecalcMode(bits: ScRecalcMode): void {
    this.nMode = (this.nMode | (bits & (ScRecalcMode.FORCED | ScRecalcMode.ONREFMOVE))) & 0xff;
  }
  /** Original exclusive/combined assignment. @param bits - UInt8 mode. @returns Nothing. */
  SetMaskedRecalcMode(bits: ScRecalcMode): void {
    this.nMode = (this.GetCombinedBitsRecalcMode() | (bits & 0xff)) & 0xff;
  }
  /** Original exclusive-bit priority and combined-bit accumulation. @param bits - UInt8 mode. @returns Nothing. */
  AddRecalcMode(bits: ScRecalcMode): void {
    bits &= 0xff;
    const exclusive = bits & ScRecalcMode.EMask;
    if (exclusive) {
      let bit: number;
      if (exclusive & (exclusive - 1)) {
        bit = 1;
        while ((bit & ScRecalcMode.EMask) !== 0) {
          if (exclusive & bit) break;
          bit <<= 1;
        }
      } else bit = exclusive;
      if (bit < (this.nMode & ScRecalcMode.EMask)) this.SetMaskedRecalcMode(bit);
    }
    this.SetCombinedBitsRecalcMode(bits);
  }
  /** Original recalc default reset. @returns Nothing. */
  ClearRecalcMode(): void {
    this.nMode = ScRecalcMode.NORMAL;
  }
  /** Original normal exclusive setter preserves combined bits. @returns Nothing. */
  SetExclusiveRecalcModeNormal(): void {
    this.SetMaskedRecalcMode(ScRecalcMode.NORMAL);
  }
  /** Original always exclusive setter preserves combined bits. @returns Nothing. */
  SetExclusiveRecalcModeAlways(): void {
    this.SetMaskedRecalcMode(ScRecalcMode.ALWAYS);
  }
  /** Original forced addition. @returns Nothing. */
  SetRecalcModeForced(): void {
    this.nMode |= ScRecalcMode.FORCED;
  }
  /** Original reference-move addition. @returns Nothing. */
  SetRecalcModeOnRefMove(): void {
    this.nMode |= ScRecalcMode.ONREFMOVE;
  }
  /** Original normal test. @returns Flag. */
  IsRecalcModeNormal(): boolean {
    return Boolean(this.nMode & ScRecalcMode.NORMAL);
  }
  /** Original always test. @returns Flag. */
  IsRecalcModeAlways(): boolean {
    return Boolean(this.nMode & ScRecalcMode.ALWAYS);
  }
  /** Original forced test. @returns Flag. */
  IsRecalcModeForced(): boolean {
    return Boolean(this.nMode & ScRecalcMode.FORCED);
  }
  /** Original reference-move test. @returns Flag. */
  IsRecalcModeOnRefMove(): boolean {
    return Boolean(this.nMode & ScRecalcMode.ONREFMOVE);
  }
  /** Original inclusive exclusive-bit priority test, including zero. @returns Import requirement. */
  IsRecalcModeMustAfterImport(): boolean {
    return (this.nMode & ScRecalcMode.EMask) <= ScRecalcMode.ONLOAD_ONCE;
  }
  /** Original import flag cleanup preserves always mode and combined bits. @returns Nothing. */
  ClearRecalcModeMustAfterImport(): void {
    if (this.IsRecalcModeMustAfterImport() && !this.IsRecalcModeAlways())
      this.SetExclusiveRecalcModeNormal();
  }
}
