/** @fileoverview FormulaToken semantic base with JavaScript-managed object lifetime; original concrete cast targets are erased type imports to retain a single acyclic owner. */
import { FormulaCompiler } from "./FormulaCompiler";
import { OpCode } from "../../../inc/opcode";
import { ParamClass } from "../../../inc/paramclass";
import { StackVar } from "../../../inc/token.enum";
import type {
  FormulaSpaceToken,
  FormulaByteToken,
  FormulaFAPToken,
  FormulaExternalToken,
} from "./token.values";
import type { FormulaStringOpToken } from "./token.string";
import type { FormulaTokenConstReference } from "../../../inc/types";

declare const privateAccess: unique symbol;
/** Original compiler-only PrivateAccess type; there is no public constructor or runtime access-token factory. */
export interface FormulaTokenPrivateAccess {
  readonly [privateAccess]: true;
}

/** Original token value/type contract; ordinary JS references keep the token alive. */
export class FormulaToken {
  private eOp: OpCode;
  private readonly eType: StackVar;

  /** Original type/opcode or copy constructor; copies retain semantic fields independently. @param source - Stack type or original token. @param e - Opcode for the stack-type constructor. @returns Initialized token. */
  constructor(source: StackVar | FormulaTokenConstReference, e: OpCode = OpCode.ocPush) {
    if (source instanceof FormulaToken) {
      this.eOp = source.eOp;
      this.eType = source.eType;
    } else {
      this.eOp = (e & 0xffff) as OpCode;
      this.eType = ((source as StackVar) & 0xff) as StackVar;
    }
  }

  /** Existing shared-value cleanup boundary; the base has no value resources and JS GC owns token lifetime. @returns Nothing. */
  dispose(): void {}
  /** Original stack discriminator query. @returns Original type. */
  GetType(): StackVar {
    return this.eType;
  }

  /** Original function classification including opcode exclusions, native ranges and concrete byte tokens. @returns Pure function classification. */
  IsFunction(): boolean {
    const eOp = this.eOp;
    if (!(
      eOp !== OpCode.ocPush &&
      eOp !== OpCode.ocBad &&
      eOp !== OpCode.ocColRowName &&
      eOp !== OpCode.ocColRowNameAuto &&
      eOp !== OpCode.ocName &&
      eOp !== OpCode.ocDBArea &&
      eOp !== OpCode.ocTableRef &&
      eOp !== OpCode.ocSep &&
      eOp !== OpCode.ocDPFieldName &&
      eOp !== OpCode.ocClose &&
      eOp !== OpCode.ocOpen
    ))
      return false;
    if (
      (OpCode.ocStartNoParameters <= eOp && eOp < OpCode.ocStopNoParameters) ||
      FormulaCompiler.IsOpCodeJumpCommand(eOp) ||
      (OpCode.ocStartOneParameter <= eOp && eOp < OpCode.ocStopOneParameter) ||
      (OpCode.ocStartTwoParameters <= eOp && eOp < OpCode.ocStopTwoParameters) ||
      eOp === OpCode.ocMacro ||
      eOp === OpCode.ocExternal ||
      eOp === OpCode.ocUDExternal ||
      eOp === OpCode.ocAnd ||
      eOp === OpCode.ocOr ||
      (eOp >= OpCode.ocInternalBegin && eOp <= OpCode.ocInternalEnd)
    )
      return true;
    if (eOp === OpCode.ocWhitespace) return (this as unknown as FormulaSpaceToken).GetByte() !== 0;
    if (this.eType === StackVar.svByte)
      return (this as unknown as FormulaByteToken).GetByte() !== 0;
    return false;
  }

  /** Original external reference discriminator switch. @returns External reference classification. */
  IsExternalRef(): boolean {
    switch (this.eType) {
      case StackVar.svExternalSingleRef:
      case StackVar.svExternalDoubleRef:
      case StackVar.svExternalName:
        return true;
      default:
        return false;
    }
  }

  /** Original reference discriminator switch plus table-reference opcode fallback. @returns Reference classification. */
  IsRef(): boolean {
    switch (this.eType) {
      case StackVar.svSingleRef:
      case StackVar.svDoubleRef:
      case StackVar.svExternalSingleRef:
      case StackVar.svExternalDoubleRef:
        return true;
      default:
        return this.eOp === OpCode.ocTableRef;
    }
  }

  /** Original parameter classification, retaining concrete casts rather than inventing a base GetByte virtual. @returns UInt8 parameter count. */
  GetParamCount(): number {
    const eOp = this.eOp;
    if (
      eOp < OpCode.ocStopDiv &&
      eOp !== OpCode.ocExternal &&
      eOp !== OpCode.ocMacro &&
      eOp !== OpCode.ocUDExternal &&
      !FormulaCompiler.IsOpCodeJumpCommand(eOp) &&
      eOp !== OpCode.ocPercentSign
    )
      return 0;
    else if (
      OpCode.ocStartBinaryOperators <= eOp &&
      eOp < OpCode.ocStopBinaryOperators &&
      eOp !== OpCode.ocAnd &&
      eOp !== OpCode.ocOr
    )
      return 2;
    else if (
      (OpCode.ocStartUnaryOperators <= eOp && eOp < OpCode.ocStopUnaryOperators) ||
      eOp === OpCode.ocPercentSign
    )
      return 1;
    else if (OpCode.ocStartNoParameters <= eOp && eOp < OpCode.ocStopNoParameters) return 0;
    else if (FormulaCompiler.IsOpCodeJumpCommand(eOp)) return 1;
    if (this.GetType() === StackVar.svByte) {
      const n = (this as unknown as FormulaByteToken).GetByte();
      if (n !== 0) return n;
    }
    if (this.GetType() === StackVar.svFAP) {
      const n = (this as unknown as FormulaFAPToken).GetByte();
      if (n !== 0) return n;
    }
    if (this.GetType() === StackVar.svExternal) {
      const n = (this as unknown as FormulaExternalToken).GetByte();
      if (n !== 0) return n;
    }
    if (
      this.GetType() === StackVar.svString &&
      // Original ocBad/ocStringXML alternatives are already excluded by the first return.
      // Keep the two reachable original alternatives; the native caller retains the full original body.
      (eOp === OpCode.ocStringName || eOp === OpCode.ocDPFieldName)
    ) {
      const n = (this as unknown as FormulaStringOpToken).GetByte();
      if (n !== 0) return n;
    }
    return 0;
  }

  /** Original opcode query. @returns UInt16 opcode. */
  GetOpCode(): OpCode {
    return this.eOp;
  }
  /** Original force-array propagation predicate. @returns Whether the current parameter class forces array behavior. */
  IsInForceArray(): boolean {
    const eParam = this.GetInForceArray();
    return (
      eParam === ParamClass.ForceArray ||
      eParam === ParamClass.ReferenceOrForceArray ||
      eParam === ParamClass.ReferenceOrRefArray ||
      eParam === ParamClass.ForceArrayReturn
    );
  }
  /** Original default virtual class, including pushed matrix return propagation. @returns Original parameter class. */
  GetInForceArray(): ParamClass {
    return this.eOp === OpCode.ocPush && this.eType === StackVar.svMatrix
      ? ParamClass.ForceArrayReturn
      : ParamClass.Unknown;
  }
  /** Original release-build dummy setter; native debug builds assert. @param _c - Ignored class in this base dummy. @returns Nothing. */
  SetInForceArray(_c: ParamClass): void {
    void _c;
  }
  /** Original virtual base copy. @returns Independent token with reset policy/count. */
  Clone(): FormulaToken {
    return new FormulaToken(this);
  }
  /** Original text comparison calls virtual equality. @param rToken - Other token. @returns Virtual equality result. */
  TextEqual(rToken: FormulaTokenConstReference): boolean {
    return this.equals(rToken);
  }
  /** Original operator== compares stack type/opcode and deliberately ignores count/policy. @param rToken - Other token. @returns Base equality. */
  equals(rToken: FormulaTokenConstReference): boolean {
    return this.eType === (rToken as FormulaToken).eType && this.GetOpCode() === rToken.GetOpCode();
  }
  /** Original compiler-only mutation; the erased private witness has no public constructor. @param e - New opcode. @param _access - Original PrivateAccess reference. @returns Nothing. */
  NewOpCode(e: OpCode, _access: FormulaTokenPrivateAccess): void {
    void _access;
    this.eOp = (e & 0xffff) as OpCode;
  }
}
