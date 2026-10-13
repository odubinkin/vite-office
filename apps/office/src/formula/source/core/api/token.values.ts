/** @fileoverview Original token.hxx scalar, byte, FAP, external and jump token definitions from formula token.cxx; one base and genuine member owners are reused. */
import { FormulaToken } from "./token";
import type { FormulaTokenConstReference } from "../../../inc/types";
import { StackVar } from "../../../inc/token.enum";
import { OpCode } from "../../../inc/opcode";
import { ParamClass } from "../../../inc/paramclass";
import { FormulaError } from "../../../inc/errorcodes";
import type { FormulaTokenRef } from "../../../inc/types";
import { OUString, type OUStringConstReference } from "../../../../sal/inc/rtl/ustring";

/** Original whitespace token stores UInt8 count and UInt16 character. */
export class FormulaSpaceToken extends FormulaToken {
  private nByte: number;
  private cChar: number;
  /** Original scalar/copy constructors. @param args - Required count/character pair or copied token. @returns Token. */
  constructor(...args: [n: number, c: number] | [source: FormulaSpaceToken]) {
    const source = args[0];
    super(source instanceof FormulaSpaceToken ? source : StackVar.svByte, OpCode.ocWhitespace);
    this.nByte = source instanceof FormulaSpaceToken ? source.nByte : source & 0xff;
    this.cChar = source instanceof FormulaSpaceToken ? source.cChar : (args[1] as number) & 0xffff;
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaSpaceToken(this);
  }
  /** Original count query. @returns UInt8 count. */
  GetByte(): number {
    return this.nByte;
  }
  /** Original character query. @returns UInt16 code unit. */
  GetChar(): number {
    return this.cChar;
  }
  /** Original equality. @param r - Original comparison token. @returns Equal fields. */
  override equals(r: FormulaTokenConstReference): boolean {
    return (
      super.equals(r) &&
      this.nByte === (r as FormulaSpaceToken).GetByte() &&
      this.cChar === (r as FormulaSpaceToken).GetChar()
    );
  }
}

/** Original function/operator byte token with parameter propagation class. */
export class FormulaByteToken extends FormulaToken {
  private mnByte: number;
  private eInForceArray: ParamClass;
  /** Original opcode/count/class and copy constructors. @param source - Opcode or copied token. @param n - Count, originally defaults to zero. @param c - Class, originally Unknown. @returns Token. */
  constructor(source: OpCode | FormulaByteToken, n = 0, c = ParamClass.Unknown) {
    super(
      source instanceof FormulaByteToken ? source : StackVar.svByte,
      source instanceof FormulaByteToken ? source.GetOpCode() : source,
    );
    this.mnByte = source instanceof FormulaByteToken ? source.mnByte : n & 0xff;
    this.eInForceArray =
      source instanceof FormulaByteToken ? source.eInForceArray : ((c & 0xff) as ParamClass);
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaByteToken(this);
  }
  /** Original byte query. @returns UInt8 count. */
  GetByte(): number {
    return this.mnByte;
  }
  /** Original byte assignment. @param n - Count. @returns Nothing. */
  SetByte(n: number): void {
    this.mnByte = n & 0xff;
  }
  /** Original propagation query. @returns Class. */
  override GetInForceArray(): ParamClass {
    return this.eInForceArray;
  }
  /** Original propagation assignment. @param c - Class. @returns Nothing. */
  override SetInForceArray(c: ParamClass): void {
    this.eInForceArray = (c & 0xff) as ParamClass;
  }
  /** Original equality. @param r - Comparison token. @returns Equal fields. */
  override equals(r: FormulaTokenConstReference): boolean {
    return (
      super.equals(r) &&
      this.mnByte === (r as FormulaByteToken).mnByte &&
      this.eInForceArray === r.GetInForceArray()
    );
  }
}

/** Original AutoPilot token retains original token identity through an ordinary JavaScript reference. */
export class FormulaFAPToken extends FormulaToken {
  private mnByte: number;
  private readonly pOrigToken: FormulaTokenRef;
  /** Original opcode/count/raw-pointer and copy constructors. @param args - Required opcode/count/pointer triple or copied token. @returns Token. */
  constructor(...args: [e: OpCode, n: number, p: FormulaToken | null] | [source: FormulaFAPToken]) {
    const source = args[0];
    super(
      source instanceof FormulaFAPToken ? source : StackVar.svFAP,
      source instanceof FormulaFAPToken ? source.GetOpCode() : source,
    );
    this.mnByte = source instanceof FormulaFAPToken ? source.mnByte : (args[1] as number) & 0xff;
    this.pOrigToken =
      source instanceof FormulaFAPToken ? source.pOrigToken : (args[2] as FormulaToken | null);
  }
  /** Original clone retains the original pointer. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaFAPToken(this);
  }
  /** Original pointer query. @returns Original raw token pointer. */
  GetFAPOrigToken(): FormulaToken | null {
    return this.pOrigToken;
  }
  /** Original byte query. @returns UInt8 count. */
  GetByte(): number {
    return this.mnByte;
  }
  /** Original equality compares original raw-pointer identity. @param r - Comparison token. @returns Equal fields. */
  override equals(r: FormulaTokenConstReference): boolean {
    return (
      super.equals(r) &&
      this.mnByte === (r as FormulaFAPToken).mnByte &&
      this.pOrigToken === (r as FormulaFAPToken).GetFAPOrigToken()
    );
  }
}

/** Original untyped floating point token. */
export class FormulaDoubleToken extends FormulaToken {
  private fDouble: number;
  /** Original scalar/copy constructors. @param source - Double or copied token. @returns Token. */
  constructor(source: number | FormulaDoubleToken) {
    super(source instanceof FormulaDoubleToken ? source : StackVar.svDouble);
    this.fDouble = source instanceof FormulaDoubleToken ? source.fDouble : source;
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaDoubleToken(this);
  }
  /** Original double query. @returns Double. */
  GetDouble(): number {
    return this.fDouble;
  }
  /** Original double assignment. @param fValue - Double. @returns Nothing. */
  SetDouble(fValue: number): void {
    this.fDouble = fValue;
  }
  /** Original untyped classification. @returns Zero. */
  GetDoubleType(): number {
    return 0;
  }
  /** Original IEEE equality, including unequal NaNs. @param r - Comparison token. @returns Equal fields. */
  override equals(r: FormulaTokenConstReference): boolean {
    return super.equals(r) && this.fDouble === (r as FormulaDoubleToken).GetDouble();
  }
}

/** Original double with signed16 classification. */
export class FormulaTypedDoubleToken extends FormulaDoubleToken {
  private mnType: number;
  /** Original scalar/type and copy constructors. @param args - Required double/type pair or copied token. @returns Token. */
  constructor(...args: [f: number, nType: number] | [source: FormulaTypedDoubleToken]) {
    const source = args[0];
    super(source);
    this.mnType =
      source instanceof FormulaTypedDoubleToken ? source.mnType : ((args[1] as number) << 16) >> 16;
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaTypedDoubleToken(this);
  }
  /** Original classification query. @returns Signed16 type. */
  override GetDoubleType(): number {
    return this.mnType;
  }
  /** Original classification assignment. @param nType - Type. @returns Nothing. */
  SetDoubleType(nType: number): void {
    this.mnType = (nType << 16) >> 16;
  }
  /** Original equality. @param r - Comparison token. @returns Equal fields. */
  override equals(r: FormulaTokenConstReference): boolean {
    return super.equals(r) && this.mnType === (r as FormulaTypedDoubleToken).GetDoubleType();
  }
}

/** Original index token with UInt16 index and signed16 sheet. */
export class FormulaIndexToken extends FormulaToken {
  private nIndex: number;
  private mnSheet: number;
  /** Original opcode/index/optional sheet and copy constructors. @param args - Required opcode/index with optional sheet or copied token. @returns Token. */
  constructor(...args: [e: OpCode, n: number, nSheet?: number] | [source: FormulaIndexToken]) {
    const source = args[0];
    super(
      source instanceof FormulaIndexToken ? source : StackVar.svIndex,
      source instanceof FormulaIndexToken ? source.GetOpCode() : source,
    );
    this.nIndex =
      source instanceof FormulaIndexToken ? source.nIndex : (args[1] as number) & 0xffff;
    this.mnSheet =
      source instanceof FormulaIndexToken ? source.mnSheet : ((args[2] ?? -1) << 16) >> 16;
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaIndexToken(this);
  }
  /** Original index query. @returns UInt16 index. */
  GetIndex(): number {
    return this.nIndex;
  }
  /** Original index assignment. @param n - Index. @returns Nothing. */
  SetIndex(n: number): void {
    this.nIndex = n & 0xffff;
  }
  /** Original sheet query. @returns Signed16 sheet. */
  GetSheet(): number {
    return this.mnSheet;
  }
  /** Original sheet assignment. @param n - Sheet. @returns Nothing. */
  SetSheet(n: number): void {
    this.mnSheet = (n << 16) >> 16;
  }
  /** Original equality. @param r - Comparison token. @returns Equal fields. */
  override equals(r: FormulaTokenConstReference): boolean {
    return (
      super.equals(r) &&
      this.nIndex === (r as FormulaIndexToken).GetIndex() &&
      this.mnSheet === (r as FormulaIndexToken).GetSheet()
    );
  }
}

/** Original external token owns genuine OUString and byte/propagation fields. */
export class FormulaExternalToken extends FormulaToken {
  private mnByte: number;
  private eInForceArray: ParamClass;
  private aExternal: OUString;
  /** Original overloads; OUString.move is the erased native rvalue witness for by-value arguments. @param args - Original argument/type-category combination. @returns Token. */
  constructor(
    ...args:
      | [source: FormulaExternalToken]
      | [e: OpCode, r: OUStringConstReference]
      | [e: OpCode, n: number, r: OUStringConstReference]
      | [e: OpCode, r: OUString, category: typeof OUString.move]
      | [e: OpCode, n: number, r: OUString, category: typeof OUString.move]
  ) {
    const source = args[0];
    super(
      source instanceof FormulaExternalToken ? source : StackVar.svExternal,
      source instanceof FormulaExternalToken ? source.GetOpCode() : source,
    );
    if (source instanceof FormulaExternalToken) {
      this.mnByte = source.mnByte;
      this.eInForceArray = source.eInForceArray;
      this.aExternal = new OUString(source.aExternal);
    } else {
      const hasByte = typeof args[1] === "number";
      this.mnByte = hasByte ? (args[1] as number) & 0xff : 0;
      this.eInForceArray = ParamClass.Unknown;
      const r = args[hasByte ? 2 : 1] as OUString;
      const temporary =
        args[hasByte ? 3 : 2] === OUString.move ? OUString.move(r) : new OUString(r);
      this.aExternal = OUString.move(temporary);
      temporary.dispose();
    }
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaExternalToken(this);
  }
  /** Original implicit destructor destroys owned external string before base. @returns Nothing. */
  override dispose(): void {
    this.aExternal.dispose();
    super.dispose();
  }
  /** Original const external string reference. @returns Owned string view. */
  GetExternal(): OUStringConstReference {
    return this.aExternal;
  }
  /** Original byte query. @returns UInt8 count. */
  GetByte(): number {
    return this.mnByte;
  }
  /** Original byte assignment. @param n - Count. @returns Nothing. */
  SetByte(n: number): void {
    this.mnByte = n & 0xff;
  }
  /** Original propagation query. @returns Class. */
  override GetInForceArray(): ParamClass {
    return this.eInForceArray;
  }
  /** Original propagation assignment. @param c - Class. @returns Nothing. */
  override SetInForceArray(c: ParamClass): void {
    this.eInForceArray = (c & 0xff) as ParamClass;
  }
  /** Original equality. @param r - Comparison token. @returns Equal fields. */
  override equals(r: FormulaTokenConstReference): boolean {
    return (
      super.equals(r) &&
      this.mnByte === (r as FormulaExternalToken).mnByte &&
      this.eInForceArray === (r as FormulaExternalToken).eInForceArray &&
      this.aExternal.equals((r as FormulaExternalToken).GetExternal())
    );
  }
}

/** Original missing argument token. */
export class FormulaMissingToken extends FormulaToken {
  /** Original default/copy constructors. @param source - Optional copied token. @returns Token. */
  constructor(source?: FormulaMissingToken) {
    super(source ?? StackVar.svMissing, OpCode.ocMissing);
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaMissingToken(this);
  }
  /** Original base-only equality. @param r - Comparison token. @returns Equality. */
  override equals(r: FormulaTokenConstReference): boolean {
    return super.equals(r);
  }
}

/** Original owned short jump array; the first signed16 entry is the initialized array length minus one. */
export class FormulaJumpToken extends FormulaToken {
  private pJump: Int16Array;
  private eInForceArray: ParamClass;
  /** Original opcode/short-pointer and copy constructors; valid initialized buffers only. @param args - Required opcode/complete short buffer or copied token. @returns Token. */
  constructor(...args: [e: OpCode, p: Int16Array] | [source: FormulaJumpToken]) {
    const source = args[0];
    super(
      source instanceof FormulaJumpToken ? source : StackVar.svJump,
      source instanceof FormulaJumpToken ? source.GetOpCode() : source,
    );
    const input = source instanceof FormulaJumpToken ? source.pJump : (args[1] as Int16Array);
    const length = (input[0] as number) + 1;
    this.pJump = new Int16Array(length);
    this.pJump.set(input.subarray(0, length));
    this.eInForceArray =
      source instanceof FormulaJumpToken ? source.eInForceArray : ParamClass.Unknown;
  }
  /** Original jump destructor; GC reclaims the sole-owned array allocation. @returns Nothing. */
  override dispose(): void {
    super.dispose();
  }
  /** Original live mutable jump pointer, also the const-query storage. @returns Owned short array. */
  GetJump(): Int16Array {
    return this.pJump;
  }
  /** Original equality compares length, short bytes and propagation class. @param r - Comparison token. @returns Equal initialized arrays and fields. */
  override equals(r: FormulaTokenConstReference): boolean {
    if (!super.equals(r)) return false;
    const rhs = r as FormulaJumpToken;
    if (this.pJump[0] !== rhs.GetJump()[0]) return false;
    for (let i = 1; i <= (this.pJump[0] as number); i++)
      if (this.pJump[i] !== rhs.GetJump()[i]) return false;
    return this.eInForceArray === rhs.GetInForceArray();
  }
  /** Original clone deep copies the initialized jump array. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaJumpToken(this);
  }
  /** Original propagation query. @returns Class. */
  override GetInForceArray(): ParamClass {
    return this.eInForceArray;
  }
  /** Original propagation assignment. @param c - Class. @returns Nothing. */
  override SetInForceArray(c: ParamClass): void {
    this.eInForceArray = (c & 0xff) as ParamClass;
  }
}

/** Original unknown stack token. */
export class FormulaUnknownToken extends FormulaToken {
  /** Original opcode/copy constructors. @param source - Opcode or copied token. @returns Token. */
  constructor(source: OpCode | FormulaUnknownToken) {
    super(
      source instanceof FormulaUnknownToken ? source : StackVar.svUnknown,
      source instanceof FormulaUnknownToken ? source.GetOpCode() : source,
    );
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaUnknownToken(this);
  }
  /** Original base-only equality. @param r - Comparison token. @returns Equality. */
  override equals(r: FormulaTokenConstReference): boolean {
    return super.equals(r);
  }
}

/** Original error token defaults to IllegalChar and retains its special error-only assignment. */
export class FormulaErrorToken extends FormulaToken {
  private nError: FormulaError;
  /** Original default/error/copy constructors. @param source - Error or copied token. @returns Token. */
  constructor(source: FormulaError | FormulaErrorToken = FormulaError.IllegalChar) {
    super(source instanceof FormulaErrorToken ? source : StackVar.svError);
    this.nError =
      source instanceof FormulaErrorToken ? source.nError : ((source & 0xffff) as FormulaError);
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaErrorToken(this);
  }
  /** Original error query. @returns UInt16 error. */
  GetError(): FormulaError {
    return this.nError;
  }
  /** Original error assignment. @param nErr - Error. @returns Nothing. */
  SetError(nErr: FormulaError): void {
    this.nError = (nErr & 0xffff) as FormulaError;
  }
  /** Original equality. @param r - Comparison token. @returns Equal fields. */
  override equals(r: FormulaTokenConstReference): boolean {
    return super.equals(r) && this.nError === (r as FormulaErrorToken).GetError();
  }
  /** Original operator= copies only the error and does not assign the base. @param rOther - Source error token. @returns This token. */
  assign(rOther: FormulaErrorToken): this {
    this.nError = rOther.nError;
    return this;
  }
}
