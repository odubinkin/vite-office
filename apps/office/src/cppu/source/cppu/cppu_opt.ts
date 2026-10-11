/** @fileoverview Original cppu_opt.cxx three C diagnostic string owners, using actual shared lazy Unicode concatenation and borrowed source field views; no exception/message/type provider. */
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { StringConcat } from "../../../sal/inc/rtl/stringconcat";
import { rtl_uString_acquire } from "../../../sal/inc/rtl/ustring.h";
import type { rtl_uString, rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import type { typelib_TypeDescriptionReference as R } from "../../inc/typelib/typedescription";
import type { uno_Any } from "../../inc/uno/any2";
/** Original known ASCII literal representation after C++ char[N] erasure. @param text - Source constant including no implicit user conversion. @returns Terminated literal bytes. */
function literal(text: string): Uint8Array {
  return Uint8Array.from(
    text + "\0",
    /** Materializes the known source ASCII char. @param char - Source character. @returns Original byte. */ (
      char,
    ) => char.charCodeAt(0),
  );
}
const queryPrefix = literal("unsatisfied query for interface of type "),
  setPrefix = literal("invalid attempt to assign an empty interface of type "),
  extractPrefix = literal("Cannot extract an Any("),
  extractMiddle = literal(") to "),
  suffix = literal("!");
/** Original unacquired view over the actual type-name field address. Nonowning getter retains the source lvalue, never copies/acquires or supplies a type/string default. @param type - Actual source type. @returns Borrowed field view. */
function typeName(type: R): OUStringConstReference {
  const slot = [] as unknown as rtl_uStringSlot;
  Object.defineProperty(slot, "0", {
    get: /** Original field read. @returns Actual current type name pointer. */ () =>
      type.pTypeName,
  });
  return OUString.unacquired(slot);
}
/** Original retained message output and destruction of the local OUString value. @param value - Actual source concatenated owner. @returns Acquired pointer. */
function retained(value: OUString): rtl_uString {
  rtl_uString_acquire(value.pData);
  const result = value.pData;
  value.dispose();
  return result;
}
/** Original unsatisfied query diagnostic. @param pType - Actual demanded type. @returns Owned original string pointer. */
export function cppu_unsatisfied_iquery_msg(pType: R): rtl_uString {
  return retained(
    new OUString(new StringConcat(new StringConcat(queryPrefix, typeName(pType)), suffix)),
  );
}
/** Original null interface assignment diagnostic. @param pType - Actual assigned interface type. @returns Owned original string pointer. */
export function cppu_unsatisfied_iset_msg(pType: R): rtl_uString {
  return retained(
    new OUString(new StringConcat(new StringConcat(setPrefix, typeName(pType)), suffix)),
  );
}
/** Original Any extraction diagnostic. @param pAny - Actual source record. @param pType - Actual destination type. @returns Owned original string pointer. */
export function cppu_Any_extraction_failure_msg(pAny: uno_Any, pType: R): rtl_uString {
  return retained(
    new OUString(
      new StringConcat(
        new StringConcat(
          new StringConcat(
            new StringConcat(extractPrefix, typeName(pAny.pType as R)),
            extractMiddle,
          ),
          typeName(pType),
        ),
        suffix,
      ),
    ),
  );
}
