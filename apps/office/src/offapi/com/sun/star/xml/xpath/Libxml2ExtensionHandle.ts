/** @fileoverview Complete original Libxml2ExtensionHandle scalar struct and normal generated UNO type binding; native handles retain signed64 fields, not host functions. */
import type { Type } from "../../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../../cppu/inc/typelib/typedescription";
const the_type: [R | null] = [null];
/** Original normal cached struct metadata, four signed64 fields in declaration order. @returns Borrowed Type. */
export function cppu_detail_getUnoType_Libxml2ExtensionHandle(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.xml.xpath.Libxml2ExtensionHandle\0"),
      null,
      4,
      [
        UnoType.get("sal_Int64").getTypeLibType() as R,
        UnoType.get("sal_Int64").getTypeLibType() as R,
        UnoType.get("sal_Int64").getTypeLibType() as R,
        UnoType.get("sal_Int64").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original generated scalar value. */
export class Libxml2ExtensionHandle {
  private readonly cells: [bigint][] = [[0n], [0n], [0n], [0n]];
  /** Original default/copy/all-fields construction. @param args - Selected source arguments. @returns Value. */
  constructor(
    ...args:
      | []
      | [source: Libxml2ExtensionHandle]
      | [fn: bigint, data: bigint, variable: bigint, variableData: bigint]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 4) {
      this.functionLookupFunction = args[0];
      this.functionData = args[1];
      this.variableLookupFunction = args[2];
      this.variableData = args[3];
    }
  }
  /** Original signed64 field. @returns Scalar. */ get functionLookupFunction(): bigint {
    return (this.cells[0] as [bigint])[0];
  }
  /** Original declared-width field assignment. @param value - Borrowed scalar. @returns Nothing. */ set functionLookupFunction(
    value: bigint,
  ) {
    (this.cells[0] as [bigint])[0] = BigInt.asIntN(64, value);
  }
  /** Original signed64 field. @returns Scalar. */ get functionData(): bigint {
    return (this.cells[1] as [bigint])[0];
  }
  /** Original declared-width field assignment. @param value - Borrowed scalar. @returns Nothing. */ set functionData(
    value: bigint,
  ) {
    (this.cells[1] as [bigint])[0] = BigInt.asIntN(64, value);
  }
  /** Original signed64 field. @returns Scalar. */ get variableLookupFunction(): bigint {
    return (this.cells[2] as [bigint])[0];
  }
  /** Original declared-width field assignment. @param value - Borrowed scalar. @returns Nothing. */ set variableLookupFunction(
    value: bigint,
  ) {
    (this.cells[2] as [bigint])[0] = BigInt.asIntN(64, value);
  }
  /** Original signed64 field. @returns Scalar. */ get variableData(): bigint {
    return (this.cells[3] as [bigint])[0];
  }
  /** Original declared-width field assignment. @param value - Borrowed scalar. @returns Nothing. */ set variableData(
    value: bigint,
  ) {
    (this.cells[3] as [bigint])[0] = BigInt.asIntN(64, value);
  }
  /** Original memberwise assignment. @param source - Borrowed source. @returns This value. */
  assign(source: Libxml2ExtensionHandle): this {
    this.functionLookupFunction = source.functionLookupFunction;
    this.functionData = source.functionData;
    this.variableLookupFunction = source.variableLookupFunction;
    this.variableData = source.variableData;
    return this;
  }
  /** Original generated equality. @param other - Borrowed other value. @returns Equality. */ equals(
    other: Libxml2ExtensionHandle,
  ): boolean {
    return (
      this.functionLookupFunction === other.functionLookupFunction &&
      this.functionData === other.functionData &&
      this.variableLookupFunction === other.variableLookupFunction &&
      this.variableData === other.variableData
    );
  }
  /** Original generated inequality. @param other - Borrowed other value. @returns Inequality. */ notEquals(
    other: Libxml2ExtensionHandle,
  ): boolean {
    return !Libxml2ExtensionHandle.prototype.equals.call(this, other);
  }
  /** Actual logical signed64 lvalue. @param offset - Declared byte offset. @returns Existing scalar field. */ get(
    offset: number,
  ): [bigint] {
    return this.cells[offset / 8] as [bigint];
  }
}
