/** @fileoverview Original public TypeDescription value wrapper from typelib/typedescription.hxx over the actual shared type-description registry. */
import { Type } from "../com/sun/star/uno/Type";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";
import {
  typelib_typedescription_acquire,
  typelib_typedescription_release,
  typelib_typedescriptionreference_getDescription,
  typelib_typedescription_getByName,
  typelib_typedescription_equals,
  typelib_typedescription_complete,
  type typelib_TypeDescription as D,
  type typelib_TypeDescriptionReference as R,
} from "./typedescription";
/** Original C++ RAII owner. The cell is the actual mutable pointer field used by registry output arguments. */
export class TypeDescription {
  private pointer: [D | null];
  /** Original pointer, reference, Type, name and copy constructors. Declared record layouts distinguish erased overloads. @param source - Borrowed original input. @returns Acquired description owner. */
  constructor(
    source: D | R | Type | TypeDescription | rtl_uString | OUStringConstReference | null = null,
  ) {
    this.pointer = [null];
    if (source instanceof TypeDescription) {
      this.pointer[0] = source.get();
      if (this.pointer[0]) typelib_typedescription_acquire(this.pointer[0]);
    } else if (source instanceof Type) {
      const reference = source.getTypeLibType();
      if (reference) typelib_typedescriptionreference_getDescription(this.pointer, reference);
    } else if (
      source !== null &&
      (source instanceof OUString || "getStr" in source || "buffer" in source)
    ) {
      typelib_typedescription_getByName(
        this.pointer,
        "getStr" in source ? (source.pData as rtl_uString) : source,
      );
    } else if (source !== null && !("pSelf" in source)) {
      typelib_typedescriptionreference_getDescription(this.pointer, source);
    } else {
      this.pointer[0] = source;
      if (source) typelib_typedescription_acquire(source);
    }
  }
  /** Original internal move constructor. @param source - Rvalue owner. @returns Transferred owner. */
  static move(source: TypeDescription): TypeDescription {
    const result = Object.create(TypeDescription.prototype) as TypeDescription;
    result.pointer = [source.pointer[0]];
    source.pointer[0] = null;
    return result;
  }
  /** Original destructor releases without clearing its field. @returns Nothing. */
  dispose(): void {
    if (this.pointer[0]) typelib_typedescription_release(this.pointer[0]);
  }
  /** Original pointer/copy assignment acquires before release, including self assignment. @param source - Borrowed original input. @returns This owner. */
  assign(source: D | TypeDescription | null): this {
    const pointer = source instanceof TypeDescription ? source.get() : source;
    if (pointer) typelib_typedescription_acquire(pointer);
    if (this.pointer[0]) typelib_typedescription_release(this.pointer[0]);
    this.pointer[0] = pointer;
    return this;
  }
  /** Original move assignment releases before transferring; self move clears. @param source - Rvalue owner. @returns This owner. */
  moveAssign(source: TypeDescription): this {
    if (this.pointer[0]) typelib_typedescription_release(this.pointer[0]);
    this.pointer[0] = source.pointer[0];
    source.pointer[0] = null;
    return this;
  }
  /** Original null-guarded registry equality. Two empty descriptions are unequal. @param source - Borrowed description or owner. @returns Original equality. */
  equals(source: D | TypeDescription | null): boolean {
    const pointer = source instanceof TypeDescription ? source.get() : source;
    return (
      this.pointer[0] !== null &&
      pointer !== null &&
      typelib_typedescription_equals(this.pointer[0], pointer)
    );
  }
  /** Original completion can replace the same actual stored pointer. @returns Nothing. */
  makeComplete(): void {
    if (this.pointer[0] && !this.pointer[0].bComplete)
      typelib_typedescription_complete(this.pointer);
  }
  /** Original borrowed pointer getter. @returns Actual description or null. */
  get(): D | null {
    return this.pointer[0];
  }
  /** Original presence test. @returns Whether set. */
  is(): boolean {
    return this.pointer[0] !== null;
  }
}
