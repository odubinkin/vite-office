/** @fileoverview Original compbase.cxx direct/deep interface query and qualified WeakComponentImplHelperBase2 fallback. Physical compiler pointer adjustment is erased to the actual same logical object. */
import { WeakComponentImplHelperBase2 } from "../inc/compbase2";
import { getTypeEntries } from "./implbase_ex";
import type { class_data, type_entry, ImplementationPointer } from "../inc/implbase_ex";
import type { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { RuntimeException } from "../../cppu/inc/com/sun/star/uno/RuntimeException";
import {
  TYPELIB_DANGER_GET,
  TYPELIB_DANGER_RELEASE,
  type typelib_TypeDescription as D,
  type typelib_TypeDescriptionReference as R,
  type typelib_InterfaceTypeDescription as I,
} from "../../cppu/inc/typelib/typedescription";
import { typelib_TypeClass as C } from "../../cppu/inc/typelib/typeclass";
import { OUString } from "../../sal/inc/rtl/ustring";
import type { rtl_uString } from "../../sal/inc/rtl/ustring.h";
import { StringConcat } from "../../sal/inc/rtl/stringconcat";
import { referenceViewOf } from "../../cppu/source/typelib/typelib";
/** Original ASCII literal binding. @param value - Source literal. @returns Terminated bytes. */
function literal(value: string): Uint8Array {
  return Uint8Array.from(
    value + "\0",
    /** Binds a known source ASCII character, without host-encoder realm identity. @param character - Source character. @returns Exact native byte. */ (
      character,
    ) => character.charCodeAt(0),
  );
}
/** Original message concatenation preserves all native UTF16 name units and actual exception owners. @param prefix - Source prefix. @param name - Borrowed name. @param suffix - Source suffix. @returns Never. */
function fail(prefix: string, name: rtl_uString, suffix: string): never {
  const message = new OUString(
      new StringConcat(
        new StringConcat(literal(prefix), OUString.unacquired([name])),
        literal(suffix),
      ),
    ),
    context = new Reference();
  try {
    throw new RuntimeException(message, context);
  } finally {
    message.dispose();
    context.dispose();
  }
}
/** Original checkInterface rejects every non-interface before consulting class data. @param type - Demanded type. @returns Nothing. */
function checkInterface(type: Type): void {
  if (Number(type.getTypeClass()) !== C.INTERFACE)
    fail(
      'querying for interface "',
      (type.getTypeLibType() as R).pTypeName,
      '": no interface type!',
    );
}
/** Original root name check, without type-class inference. @param name - Borrowed name. @returns Root predicate. */
function isXInterface(name: rtl_uString): boolean {
  return OUString.unacquired([name]).equalsAsciiL(literal("com.sun.star.uno.XInterface"), 27);
}
/** Original pointer-or-name equality also accepts equal distinct type references. @param first - First reference. @param second - Second reference. @returns Original equality. */
function td_equals(first: R, second: R): boolean {
  return (
    first === second ||
    OUString.unacquired([first.pTypeName]).equals(OUString.unacquired([second.pTypeName]))
  );
}
/** Original reference view after initialization. @param entry - Initialized entry. @returns Unacquired reference. */
function reference(entry: type_entry): R {
  return (entry.m_type as { typeRef: R }).typeRef;
}
/** Original forward multiple-base traversal with the one-base tail loop and persistent pointer adjustment; root bases are skipped. @param demanded - Demanded reference. @param type - Actual description. @param offset - Original inout byte offset. @returns Found predicate. */
function recursivelyFindType(demanded: R, type: I, offset: [number]): boolean {
  next: for (;;) {
    for (let index = 0; index < type.nBaseTypes; ++index) {
      if (index > 0) offset[0] += 8;
      const base = (type.ppBaseTypes as I[])[index] as I;
      if (base.nBaseTypes > 0) {
        if (td_equals(referenceViewOf(base.aBase), demanded)) return true;
        if (type.nBaseTypes === 1) {
          type = base;
          continue next;
        }
        if (recursivelyFindType(demanded, base, offset)) return true;
      }
    }
    return false;
  }
}
/** Original direct lookup avoids descriptions, then deep lookup uses actual typelib danger-get/release and original errors. @param demanded - Demanded reference. @param data - Static class data. @param that - Actual erased implementation pointer. @returns Borrowed interface or null. */
function queryDeepNoXInterface(demanded: R, data: class_data, that: ImplementationPointer) {
  const entries = getTypeEntries(data);
  for (let index = 0; index < data.m_nTypes; ++index) {
    const entry = entries[index] as type_entry;
    if (td_equals(reference(entry), demanded)) return that(entry.m_offset);
  }
  for (let index = 0; index < data.m_nTypes; ++index) {
    const entry = entries[index] as type_entry,
      description: [D | null] = [null];
    TYPELIB_DANGER_GET(description, reference(entry));
    if (!description[0])
      fail('cannot get type description for type "', reference(entry).pTypeName, '"!');
    const offset: [number] = [entry.m_offset],
      found = recursivelyFindType(demanded, description[0] as unknown as I, offset);
    TYPELIB_DANGER_RELEASE(description[0]);
    if (found) return that(offset[0]);
  }
  return null;
}
/** Original component helper query uses its real base root/component/weak query, not a weak-only fallback. @param type - Demanded original type. @param data - Actual specialization-static class data. @param that - Erased original compiler pointer cast. @param base - Actual component base. @returns Original acquired Any. */
export function WeakComponentImplHelper_query(
  type: Type,
  data: class_data,
  that: ImplementationPointer,
  base: WeakComponentImplHelperBase2,
): Any {
  checkInterface(type);
  const demanded = type.getTypeLibType() as R;
  if (!isXInterface(demanded.pTypeName)) {
    const pointer = queryDeepNoXInterface(demanded, data, that);
    if (pointer) return new Any([pointer], demanded);
  }
  return WeakComponentImplHelperBase2.prototype.queryInterface.call(base, type);
}
