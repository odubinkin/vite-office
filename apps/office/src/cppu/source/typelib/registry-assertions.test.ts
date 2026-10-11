/** @fileoverview Replays genuine fatal CPPU registration invariants without assigning values to aborted native operations. */
import { describe, expect, it, vi } from "vitest";
import native from "./native-type-primitives-cases.json";
import { typelib_TypeClass as C } from "../../inc/typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_EnumTypeDescription as E,
  typelib_CompoundTypeDescription as P,
  typelib_StructTypeDescription as S,
  typelib_InterfaceTypeDescription as I,
} from "../../inc/typelib/typedescription";
import { rtl_uString_newFromStr_WithLength } from "../../../sal/inc/rtl/ustring.h";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";

/** Original typed prefix view. @param desc - Allocated description. @returns Original specific view. */
function cast<T>(desc: D): T {
  return desc as unknown as T;
}

describe("original CPPU registration assertions", /** Groups true original assertion observations. @returns Nothing. */ () => {
  it("retains every original failing invariant and assertion expression", /** Uses a fresh registry per process-equivalent failure; native abort has no post-failure return contract. @returns Completion. */ async () => {
    expect(native.registrationAssertions).toHaveLength(20);
    for (const observed of native.registrationAssertions) {
      vi.resetModules();
      const type = await import("./typelib"),
        index = observed.index;
      const cls = index < 3 ? C.ENUM : index < 9 ? C.STRUCT : index < 19 ? C.INTERFACE : C.LONG;
      const name: [rtl_uString | null] = [null],
        text = "CalcInvariant";
      const units = Uint16Array.from(
        { length: text.length },
        /** Retains each original UTF16 unit. @param _unit - Unused array-like item. @param i - Original offset. @returns Exact unit. */ (
          _unit,
          i,
        ) => text.charCodeAt(i),
      );
      rtl_uString_newFromStr_WithLength(name, units, units.length);
      /** Uses the actual original empty factory for every record supplied by this caller. @param kind - Actual original type class. @returns Owned description. */
      function empty(kind: C): D {
        const slot: [D | null] = [null];
        type.typelib_typedescription_newEmpty(slot, kind, name[0] as rtl_uString);
        return slot[0] as D;
      }
      const ref: [R | null] = [null];
      type.typelib_typedescriptionreference_new(ref, cls, name[0] as rtl_uString);
      const initial: [D | null] = [empty(cls)];
      (initial[0] as D).bOnDemand = true;
      (initial[0] as D).bComplete = false;
      type.typelib_typedescription_register(initial);
      const incoming: [D | null] = [empty(cls)];
      (incoming[0] as D).bOnDemand = true;
      if (index < 3) {
        const dst = cast<E>(initial[0] as D);
        if (index === 0) dst.nEnumValues = 1;
        else if (index === 1) dst.ppEnumNames = [name[0] as rtl_uString];
        else dst.pEnumValues = new Int32Array([0]);
      } else if (index < 9) {
        const dst = cast<P>(initial[0] as D),
          src = cast<P>(incoming[0] as D);
        if (index === 3) src.pBaseTypeDescription = cast<P>(empty(C.EXCEPTION));
        else if (index === 4) src.nMembers = 1;
        else if (index === 5) dst.nMembers = src.nMembers = 1;
        else if (index === 6) {
          dst.nMembers = src.nMembers = 1;
          dst.pMemberOffsets = new Int32Array([0]);
        } else if (index === 7) dst.ppMemberNames = [name[0] as rtl_uString];
        else cast<S>(incoming[0] as D).pParameterizedTypes = [true];
      } else if (index < 19) {
        const dst = cast<I>(initial[0] as D),
          src = cast<I>(incoming[0] as D);
        switch (index) {
          case 9:
            src.pBaseTypeDescription = cast<I>(empty(C.INTERFACE));
            break;
          case 10:
            dst.nMembers = 1;
            break;
          case 11:
            dst.ppMembers = [ref[0] as R];
            break;
          case 12:
            dst.nAllMembers = 1;
            break;
          case 13:
            dst.ppAllMembers = [ref[0] as R];
            break;
          case 14:
            dst.pMapMemberIndexToFunctionIndex = new Int32Array([0]);
            break;
          case 15:
            dst.nMapFunctionIndexToMemberIndex = 1;
            break;
          case 16:
            dst.pMapFunctionIndexToMemberIndex = new Int32Array([0]);
            break;
          case 17:
            dst.nBaseTypes = 1;
            break;
          case 18:
            dst.ppBaseTypes = [cast<I>(empty(C.INTERFACE))];
            break;
        }
      }
      expect(observed.signal).toBe("SIGABRT");
      expect(observed.diagnostic).toContain("typelib.cxx");
      let actual: unknown;
      try {
        type.typelib_typedescription_register(incoming);
      } catch (error) {
        actual = error;
      }
      expect(actual).toBeInstanceOf(Error);
      // C macro stringification preserves formatting whitespace; compare all expression tokens, retaining complete original diagnostics in the fixture.
      expect((actual as Error).message.replace(/\s/g, "")).toBe(
        `assert(${observed.expression})`.replace(/\s/g, ""),
      );
    }
  });
});
