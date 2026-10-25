/** @fileoverview Original NumberFormatCode.idl normal generated type/value bindings over actual OUString and shared CPPU compound ownership. */
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../../../../sal/inc/rtl/ustring.h";
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
/** Original static generated type cell. */
const the_type: [R | null] = [null];
/** Original seven IDL member types share the actual cached CPPU type owner. @returns Borrowed original type. */
export function cppu_detail_getUnoType_NumberFormatCode(): Type {
  if (the_type[0] === null) {
    const short = UnoType.get("sal_Int16").getTypeLibType() as R,
      string = UnoType.get("OUString").getTypeLibType() as R;
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.i18n.NumberFormatCode\0"),
      null,
      7,
      [short, short, string, string, string, short, UnoType.get("bool").getTypeLibType() as R],
      null,
    );
  }
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Original const struct reference,retaining actual shared string fields. */
export interface NumberFormatCodeConstReference {
  readonly Type: number;
  readonly Usage: number;
  readonly Code: OUStringConstReference;
  readonly DefaultName: OUStringConstReference;
  readonly NameID: OUStringConstReference;
  readonly Index: number;
  readonly Default: boolean;
}
/** Original member address surface used by shared compound transport. */
export type NumberFormatCodeAddress = { get(offset: number): unknown };
/** Original generated mutable struct reference;the addressed Sequence owns destruction. */
export type NumberFormatCodeBorrowed = Omit<NumberFormatCode, "dispose">;

/** Original IDL value and generated member constructor/copy/destructor;member cells are shared transport lvalues,not a new ownership engine. */
export class NumberFormatCode implements NumberFormatCodeConstReference {
  private type: [number] = [0];
  private usage: [number] = [0];
  private code = new OUString();
  private defaultName = new OUString();
  private nameID = new OUString();
  private index: [number] = [0];
  private isDefault: [boolean] = [false];
  /** Original default/copy/member constructors in IDL declaration order. @param args - Native overload. @returns Initialized value. */
  constructor(
    ...args:
      | []
      | [source: NumberFormatCodeConstReference]
      | [
          type: number,
          usage: number,
          code: OUStringConstReference,
          name: OUStringConstReference,
          nameID: OUStringConstReference,
          index: number,
          isDefault: boolean,
        ]
  ) {
    if (args.length === 1) this.assign(args[0]);
    else if (args.length === 7) {
      this.Type = args[0];
      this.Usage = args[1];
      this.Code = args[2];
      this.DefaultName = args[3];
      this.NameID = args[4];
      this.Index = args[5];
      this.Default = args[6];
    }
  }
  /** Erases the original mutable E& cast over initialized compound storage without construction/acquisition. The caller retains the Sequence lifetime. @param address - Original element lvalues. @returns Nonowning live struct reference. */
  static borrowed(address: NumberFormatCodeAddress): NumberFormatCodeBorrowed {
    const view = Object.create(NumberFormatCode.prototype) as NumberFormatCode;
    view.type = address.get(0) as [number];
    view.usage = address.get(2) as [number];
    view.code = OUString.unacquired(address.get(8) as rtl_uStringSlot) as OUString;
    view.defaultName = OUString.unacquired(address.get(16) as rtl_uStringSlot) as OUString;
    view.nameID = OUString.unacquired(address.get(24) as rtl_uStringSlot) as OUString;
    view.index = address.get(32) as [number];
    view.isDefault = address.get(34) as [boolean];
    return view;
  }
  /** Original short Type field. @returns Signed16 value. */
  get Type(): number {
    return this.type[0];
  }
  /** Original short assignment. @param value - Type. @returns Nothing. */
  set Type(value: number) {
    this.type[0] = (value << 16) >> 16;
  }
  /** Original short Usage field. @returns Signed16 value. */
  get Usage(): number {
    return this.usage[0];
  }
  /** Original short assignment. @param value - Usage. @returns Nothing. */
  set Usage(value: number) {
    this.usage[0] = (value << 16) >> 16;
  }
  /** Original mutable Code string member. @returns Stable actual member. */
  get Code(): OUString {
    return this.code;
  }
  /** Original string assignment preserves member identity. @param value - Code. @returns Nothing. */
  set Code(value: OUStringConstReference) {
    this.code.assign(value);
  }
  /** Original DefaultName string member. @returns Stable actual member. */
  get DefaultName(): OUString {
    return this.defaultName;
  }
  /** Original string assignment. @param value - Name. @returns Nothing. */
  set DefaultName(value: OUStringConstReference) {
    this.defaultName.assign(value);
  }
  /** Original NameID string member. @returns Stable actual member. */
  get NameID(): OUString {
    return this.nameID;
  }
  /** Original string assignment. @param value - Message identifier. @returns Nothing. */
  set NameID(value: OUStringConstReference) {
    this.nameID.assign(value);
  }
  /** Original short Index field. @returns Signed16 index. */
  get Index(): number {
    return this.index[0];
  }
  /** Original short assignment. @param value - Index. @returns Nothing. */
  set Index(value: number) {
    this.index[0] = (value << 16) >> 16;
  }
  /** Original boolean Default field. @returns Flag. */
  get Default(): boolean {
    return this.isDefault[0];
  }
  /** Original boolean assignment. @param value - Flag. @returns Nothing. */
  set Default(value: boolean) {
    this.isDefault[0] = value;
  }
  /** Original generated memberwise copy assignment. @param source - Borrowed original value. @returns This value. */
  assign(source: NumberFormatCodeConstReference): this {
    this.Type = source.Type;
    this.Usage = source.Usage;
    this.Code = source.Code;
    this.DefaultName = source.DefaultName;
    this.NameID = source.NameID;
    this.Index = source.Index;
    this.Default = source.Default;
    return this;
  }
  /** Original metadata member addresses for actual shared compound copying. @param offset - Declared member offset. @returns Existing member lvalue. */
  get(offset: number): unknown {
    switch (offset) {
      case 0:
        return this.type;
      case 2:
        return this.usage;
      case 8:
        return this.code.getDataAddress();
      case 16:
        return this.defaultName.getDataAddress();
      case 24:
        return this.nameID.getDataAddress();
      case 32:
        return this.index;
      default:
        return this.isDefault;
    }
  }
  /** Original implicit destructor in reverse declaration order. @returns Nothing. */
  dispose(): void {
    this.nameID.dispose();
    this.defaultName.dispose();
    this.code.dispose();
  }
}
