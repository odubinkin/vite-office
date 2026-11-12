/** @fileoverview Original ContentProviderInfo.idl value, declared defaults and normal CPPUMaker compound metadata; all managed fields retain their real owners. */
import type { Type } from "../../../../../cppu/inc/com/sun/star/uno/Type";
import { UnoType, getTypeFromTypeDescriptionReference } from "../../../../../cppu/inc/unotype";
import {
  typelib_static_struct_type_init,
  type typelib_TypeDescriptionReference as R,
} from "../../../../../cppu/inc/typelib/typedescription";
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import { XContentProvider } from "./XContentProvider";
import { OUString, type OUStringConstReference } from "../../../../../sal/inc/rtl/ustring";
const the_type: [R | null] = [null];
/** Original cached struct type, preserving base and declared member order. @returns Borrowed shared type. */
export function cppu_detail_getUnoType(): Type {
  if (the_type[0] === null)
    typelib_static_struct_type_init(
      the_type,
      new TextEncoder().encode("com.sun.star.ucb.ContentProviderInfo\0"),
      null,
      2,
      [
        XContentProvider.static_type().getTypeLibType() as R,
        UnoType.get("OUString").getTypeLibType() as R,
      ],
      null,
    );
  return getTypeFromTypeDescriptionReference(the_type);
}
/** Complete original generated value with stable field owners. */
export class ContentProviderInfo {
  private readonly fieldContentProvider: Reference<XContentProvider> =
    new Reference<XContentProvider>();
  private readonly fieldScheme: OUString = new OUString();
  /** Original default/copy/all-member constructors in base-first order. @param args - Selected original arguments. @returns Owned value. */
  constructor(
    ...args:
      | []
      | [source: Readonly<ContentProviderInfo>]
      | [ContentProvider: Reference<XContentProvider>, Scheme: OUStringConstReference]
  ) {
    if (args.length === 1) {
      this.ContentProvider = args[0].ContentProvider;
      this.Scheme = args[0].Scheme;
    } else if (args.length === 2) {
      this.ContentProvider = args[0];
      this.Scheme = args[1];
    }
  }
  /** Original ContentProvider member. @returns Borrowed stable field owner. */
  get ContentProvider(): Reference<XContentProvider> {
    return this.fieldContentProvider;
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set ContentProvider(value: Reference<XContentProvider>) {
    this.fieldContentProvider.assign(value);
  }
  /** Original Scheme member. @returns Borrowed stable field owner. */
  get Scheme(): OUString {
    return this.fieldScheme;
  }
  /** Original member assignment. @param value - Borrowed new member value. @returns Nothing. */
  set Scheme(value: OUStringConstReference) {
    this.fieldScheme.assign(value);
  }
  /** Original implicit base/member copy assignment. @param source - Borrowed value. @returns This owner. */
  assign(source: Readonly<ContentProviderInfo>): this {
    this.ContentProvider = source.ContentProvider;
    this.Scheme = source.Scheme;
    return this;
  }
  /** Original generated field equality in source order. @param other - Other value. @returns Equality. */
  equals(other: Readonly<ContentProviderInfo>): boolean {
    return (
      this.ContentProvider.operatorEquals(other.ContentProvider) && this.Scheme.equals(other.Scheme)
    );
  }
  /** Original generated inequality. @param other - Other value. @returns Inequality. */
  notEquals(other: Readonly<ContentProviderInfo>): boolean {
    return !this.equals(other);
  }
  /** Existing logical compound lvalue lowering, without serialized or physical WASM layout claims. @param offset - Declared logical member offset. @returns Existing field address. */
  get(offset: number): unknown {
    if (offset === 0) return this.fieldContentProvider.getAddress();
    if (offset === 8) return this.fieldScheme.getDataAddress();
    return this.fieldScheme.getDataAddress();
  }
  /** Original reverse member/base destruction. @returns Nothing. */
  dispose(): void {
    this.fieldScheme.dispose();
    this.fieldContentProvider.dispose();
  }
}
/** Original generated global type getter. @returns Borrowed cached type. */
export function getCppuType(): Type {
  return cppu_detail_getUnoType();
}
