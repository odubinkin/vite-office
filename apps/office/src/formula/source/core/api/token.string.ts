/** @fileoverview Original shared-string token definitions from token.hxx/token.cxx, reusing the genuine svl owned value and native argument categories. */
import { FormulaToken } from "./token";
import type { FormulaTokenConstReference } from "../../../inc/types";
import { StackVar } from "../../../inc/token.enum";
import { OpCode } from "../../../inc/opcode";
import { ParamClass } from "../../../inc/paramclass";
import { SharedString, type SharedStringConstReference } from "../../../../svl/inc/sharedstring";

// Erased access witness for the original protected opcode constructor; only the original derived owner in this module can supply it.
const protectedStringConstructor = Symbol("FormulaStringToken protected opcode constructor");

/** Original shared-string token; the opcode overload is available only to its original derived owner. */
export class FormulaStringToken extends FormulaToken {
  private maString: SharedString;
  /** Original public value/copy constructors and private binding of the protected opcode constructor for the original derived owner. @param args - Original values, erased category and protected-access witness. @returns Token. */
  constructor(
    ...args:
      | [source: FormulaStringToken | SharedStringConstReference]
      | [source: SharedString, category: typeof SharedString.move]
      | [
          source: SharedStringConstReference,
          category: undefined,
          e: OpCode,
          access: typeof protectedStringConstructor,
        ]
  ) {
    const source = args[0];
    const e = args[2] ?? OpCode.ocPush;
    super(source instanceof FormulaStringToken ? source : StackVar.svString, e);
    if (source instanceof FormulaStringToken) {
      this.maString = new SharedString(source.maString);
    } else {
      const temporary =
        args[1] === SharedString.move
          ? SharedString.move(source as SharedString)
          : new SharedString(source);
      this.maString = SharedString.move(temporary);
      temporary.dispose();
    }
  }
  /** Original implicit destructor releases owned shared value before base. @returns Nothing. */
  override dispose(): void {
    this.maString.dispose();
    super.dispose();
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaStringToken(this);
  }
  /** Original const reference to the owned member. @returns Shared-string query view. */
  GetString(): SharedStringConstReference {
    return this.maString;
  }
  /** Original member assignment retains owned member identity. @param rStr - Const assigned value. @returns Nothing. */
  SetString(rStr: SharedStringConstReference): void {
    this.maString.assign(rStr);
  }
  /** Original equality. @param r - Comparison token. @returns Equal fields. */
  override equals(r: FormulaTokenConstReference): boolean {
    return super.equals(r) && this.maString.equals((r as FormulaStringToken).GetString());
  }
}

/** Original string token with explicit opcode, byte and propagation class. */
export class FormulaStringOpToken extends FormulaStringToken {
  private nByte: number;
  private eInForceArray: ParamClass;
  /** Original opcode/value and copy constructors; the original by-value intermediate r is an lvalue when passed to its base. @param args - Original values and erased category witness. @returns Token. */
  constructor(
    ...args:
      | [source: FormulaStringOpToken]
      | [e: OpCode, r: SharedStringConstReference]
      | [e: OpCode, r: SharedString, category: typeof SharedString.move]
  ) {
    const source = args[0];
    const temporary =
      source instanceof FormulaStringOpToken
        ? null
        : args[2] === SharedString.move
          ? SharedString.move(args[1] as SharedString)
          : new SharedString(args[1] as SharedStringConstReference);
    super(
      ...(source instanceof FormulaStringOpToken
        ? ([source] as const)
        : ([temporary as SharedString, undefined, source, protectedStringConstructor] as const)),
    );
    this.nByte = source instanceof FormulaStringOpToken ? source.nByte : 0;
    this.eInForceArray =
      source instanceof FormulaStringOpToken ? source.eInForceArray : ParamClass.Unknown;
    if (temporary !== null) temporary.dispose();
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaStringOpToken(this);
  }
  /** Original byte query. @returns UInt8 count. */
  GetByte(): number {
    return this.nByte;
  }
  /** Original byte assignment. @param n - Count. @returns Nothing. */
  SetByte(n: number): void {
    this.nByte = n & 0xff;
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
      this.nByte === (r as FormulaStringOpToken).nByte &&
      this.eInForceArray === (r as FormulaStringOpToken).eInForceArray
    );
  }
}

/** Original named string token with explicit stack discriminator. */
export class FormulaStringNameToken extends FormulaToken {
  private maString: SharedString;
  /** Original stack-type/value and copy constructors. @param args - Original values and erased category witness. @returns Token. */
  constructor(
    ...args:
      | [source: FormulaStringNameToken]
      | [eTypeP: StackVar, r: SharedStringConstReference]
      | [eTypeP: StackVar, r: SharedString, category: typeof SharedString.move]
  ) {
    const source = args[0];
    super(source);
    if (source instanceof FormulaStringNameToken) {
      this.maString = new SharedString(source.maString);
    } else {
      const temporary =
        args[2] === SharedString.move
          ? SharedString.move(args[1] as SharedString)
          : new SharedString(args[1] as SharedStringConstReference);
      this.maString = SharedString.move(temporary);
      temporary.dispose();
    }
  }
  /** Original implicit destructor releases member before base. @returns Nothing. */
  override dispose(): void {
    this.maString.dispose();
    super.dispose();
  }
  /** Original clone. @returns Copied token. */
  override Clone(): FormulaToken {
    return new FormulaStringNameToken(this);
  }
  /** Original const member reference. @returns Owned shared-string view. */
  GetString(): SharedStringConstReference {
    return this.maString;
  }
  /** Original equality. @param r - Comparison token. @returns Equal fields. */
  override equals(r: FormulaTokenConstReference): boolean {
    return super.equals(r) && this.maString.equals((r as FormulaStringNameToken).GetString());
  }
}
