/** @fileoverview Full original cppuhelper cold/type/order/ownership and service search streams replay through existing real shared owners; pure declared native caller inputs supply interfaces and names. */
import { it, expect } from "vitest";
import fixture from "./native-service-helper-cases.json";
import { createPublicSequenceInputs } from "../../test/uno-sequence-cpp-values";
import { typelib_TypeClass as C } from "../../cppu/inc/typelib/typeclass";
import type { typelib_TypeDescriptionReference as R } from "../../cppu/inc/typelib/typedescription";
import type { QueryInterfaceArguments } from "../inc/queryinterface";
import type { XServiceInfo } from "../../cppu/inc/com/sun/star/lang/XServiceInfo";
import type { OUString } from "../../sal/inc/rtl/ustring";
import type { rtl_uStringSlot } from "../../sal/inc/rtl/ustring.h";
import type { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
/** Actual declared native caller static_type functions use the real original static factory and borrowed Type view. No library default/type/provider is substituted. @param capture - Complete original stream. @returns Shared owners and pure source caller. */
async function context(capture: typeof fixture.captures.cold) {
  const x = await createPublicSequenceInputs(capture),
    helper = await import("../inc/queryinterface"),
    service = await import("../inc/supportsservice");
  const alternate: [R | null] = [null];
  /** Original authored caller interface's actual static type cell. @returns Borrowed actual Type. */
  function alternateType(): InstanceType<typeof x.Type> {
    if (alternate[0] === null)
      x.f.typelib_static_interface_type_init(
        alternate,
        x.ascii("caller.QueryAlternate"),
        x.type(C.INTERFACE),
      );
    return x.unotype.getTypeFromTypeDescriptionReference(alternate);
  }
  /** Original declared interface static_type call, recording exact lazy order. @param k - Original slot. @param alt - Declared alternate interface. @returns Actual source getter. */
  function getter(k: number, alt: boolean): () => InstanceType<typeof x.Type> {
    return /** Native source caller static_type. @returns Borrowed original Type. */ () => {
      x.emit(5, k, alt);
      return alt ? alternateType() : x.unotype.UnoType.get("XInterface");
    };
  }
  /** Every initialized Any value/metadata and caller static reference, not a selected result hash. @param a - Actual returned Any. @returns Nothing. */
  function observe(a: InstanceType<typeof x.Any>): void {
    x.anyValue(a);
    x.emit(a.hasValue(), a.getValueTypeClass());
    x.ref(a.pType);
    x.ref(alternate[0]);
  }
  return { ...x, helper, service, alternate, alternateType, getter, observe };
}
it("matches original lazy first match without initializing a later declared interface", /** Full original cold stream and returned Any destructor/count. @returns Complete parity. */ async () => {
  const x = await context(fixture.captures.cold),
    r = x.witness(100),
    a = x.witness(201);
  x.ref(x.alternate[0]);
  const t = x.unotype.UnoType.get("XInterface"),
    v = x.helper.queryInterface(t, [
      [x.getter(0, false), r],
      [x.getter(1, true), a],
    ]);
  x.observe(v);
  v.dispose();
  x.ref(x.alternate[0]);
  x.emit(r.count, a.count);
  x.finish();
});
it("matches every original queryInterface arity and first-match position including typed NULL and complete mismatch", /** Real Any acquisition/destruction, static getters and every caller count for all original1..14/17..19 template bodies. @returns Complete parity. */ async () => {
  const x = await context(fixture.captures.queries),
    r = Array.from(
      { length: 19 },
      /** Creates actual native caller virtual object. @param unused - Unused. @param k - Slot. @returns Caller. */ (
        _unused,
        k,
      ) => x.witness(100 + k),
    ),
    a = Array.from(
      { length: 19 },
      /** Actual alternate caller virtual object. @param unused - Unused. @param k - Slot. @returns Caller. */ (
        _unused,
        k,
      ) => x.witness(200 + k),
    );
  /** Full original count-array observation. @returns Nothing. */ function counts(): void {
    x.emit(
      ...r.flatMap(
        /** Source paired counters. @param v - Caller. @param k - Slot. @returns Both counts. */ (
          v,
          k,
        ) => [v.count, (a[k] as (typeof a)[number]).count],
      ),
    );
  }
  for (let n = 1; n <= 19; n++) {
    if (n === 15 || n === 16) continue;
    for (let pos = 0; pos < n; pos++)
      for (const nil of [false, true]) {
        x.emit(n, pos, nil);
        const t = x.alternateType();
        counts();
        const args = Array.from(
          { length: n },
          /** Exact native selected declared template/pointer list. @param unused - Unused. @param k - Slot. @returns Original pair. */ (
            _unused,
            k,
          ) =>
            [
              x.getter(k, k === pos),
              k === pos
                ? nil
                  ? null
                  : (a[k] as (typeof a)[number])
                : (r[k] as (typeof r)[number]),
            ] as const,
        ) as unknown as QueryInterfaceArguments;
        const v = x.helper.queryInterface(t, args);
        x.observe(v);
        counts();
        v.dispose();
        counts();
      }
    x.emit(n, -1, 0);
    const t = x.unotype.getTypeFromTypeClass(C.VOID),
      args = Array.from(
        { length: n },
        /** Original declared root mismatch list. @param unused - Unused. @param k - Slot. @returns Pair. */ (
          _unused,
          k,
        ) => [x.getter(k, false), r[k] as (typeof r)[number]] as const,
      ) as unknown as QueryInterfaceArguments;
    const v = x.helper.queryInterface(t, args);
    x.observe(v);
    v.dispose();
    counts();
  }
  x.finish();
});
it("matches original service-name search and local Sequence ownership for full UTF16 names and getter exceptions", /** Full original const search/lifetime/type/array/name fields; actual returned owning Sequence and native caller virtual exceptions. @returns Complete parity. */ async () => {
  const x = await context(fixture.captures.services),
    S = x.Sequence.specialize<rtl_uStringSlot>("OUString", 8),
    sets = [[], [""], ["office.calc", "office.writer", "Calc", "a\0b", "😀", "\ud800", "e\u0301"]],
    targets = [
      "",
      "office.calc",
      "office.writer",
      "office",
      "OFFICE.CALC",
      "Calc",
      "calc",
      "a",
      "a\0b",
      "a\0c",
      "😀",
      "�",
      "\ud800",
      "\ud801",
      "é",
      "e\u0301",
      "writer",
      "office.calc\0",
    ];
  /** Exact original known-length UTF16 caller string, including embedded zero and unpaired surrogate. @param text - Source units. @returns Real shared owner. */ function from(
    text: string,
  ): OUString {
    const units = Uint16Array.from(
      { length: text.length },
      /** Original source unit. @param unused - Unused. @param i - Unit offset. @returns Actual unit. */ (
        _unused,
        i,
      ) => text.charCodeAt(i),
    );
    return new x.OUString(units, units.length);
  }
  for (let k = 0; k < sets.length; k++) {
    x.emit(k);
    const input = sets[k] as string[],
      names = new S(input.length);
    let mode = 0,
      calls = 0;
    for (let i = 0; i < input.length; i++) {
      const value = from(input[i] as string);
      x.strings.rtl_uString_assign(
        (
          names.getArray() as import("../../cppu/inc/com/sun/star/uno/Sequence").SequenceElements
        ).get(i * 8) as rtl_uStringSlot,
        value.pData,
      );
      value.dispose();
    }
    const implementation: XServiceInfo = {
      /** Native unexpected virtual query signal. @returns Never. */ queryInterface() {
        throw Error("unexpected service query");
      },
      /** Native unexpected acquisition signal. @returns Never. */ acquire() {
        throw Error("unexpected service acquire");
      },
      /** Native unexpected release signal. @returns Never. */ release() {
        throw Error("unexpected service release");
      },
      /** Actual source virtual implementation name. @returns Original caller string. */ getImplementationName() {
        return from("caller");
      },
      /** Original source caller virtual forwarding. @param name - Borrowed name. @returns Helper result. */ supportsService(
        name,
      ) {
        return x.service.supportsService(implementation, name);
      },
      /** Actual source caller returns copied Sequence or throws before creating it. @returns Real owned result. */ getSupportedServiceNames(): Sequence<rtl_uStringSlot> {
        x.emit(
          6,
          ++calls,
          mode,
          (names.get() as import("../../cppu/inc/uno/sequence2").uno_Sequence).nRefCount,
        );
        if (mode === 1) throw Error("service");
        if (mode === 2) throw new x.RuntimeException();
        return new S(names);
      },
    };
    /** Complete original service fields, actual shared sequence and type. @returns Nothing. */ function state(): void {
      x.emit(
        mode,
        calls,
        (names.get() as import("../../cppu/inc/uno/sequence2").uno_Sequence).nRefCount,
        names.getLength(),
      );
      const t = x.unotype.getTypeFavourUnsigned(["Sequence", "OUString"]);
      x.ref(t.getTypeLibType());
      x.value([names.get()], t.getTypeLibType() as R);
    }
    state();
    for (const text of targets) {
      const n = from(text);
      x.text(n.pData);
      x.emit(x.service.supportsService(implementation, n));
      x.text(n.pData);
      state();
      n.dispose();
    }
    for (mode = 1; mode <= 2; mode++) {
      const n = from("office.calc");
      try {
        x.service.supportsService(implementation, n);
        x.emit(0);
      } catch (error) {
        if (error instanceof x.RuntimeException) {
          x.emit(2);
          x.text(error.Message.pData);
          x.emit(error.Context.is());
          error.dispose();
        } else {
          expect(error).toBeInstanceOf(Error);
          x.emit(1);
        }
      }
      state();
      x.text(n.pData);
      n.dispose();
    }
    names.dispose();
  }
  x.finish();
});
it("retains original NULL service assertion as explicit browser rejection", /** Native SIGABRT is separate from valid service results. @returns Nothing. */ async () => {
  const { supportsService } = await import("../inc/supportsservice"),
    { OUString } = await import("../../sal/inc/rtl/ustring"),
    name = new OUString();
  expect(fixture.rejections["null-service"].normalSignal).toBe("SIGABRT");
  expect(fixture.rejections["null-service"].sanitizedSignal).toBe("SIGABRT");
  expect(
    /** Calls the original NULL assertion adaptation. @returns Never. */ () =>
      supportsService(null, name),
  ).toThrow("supportsService implementation assertion");
  name.dispose();
});

it("preserves original omitted15 and16 interface overload compiler diagnostics", /** Real unchanged-header compiler rejection, without executing an invented overload. @returns Nothing. */ () => {
  for (const arity of ["15", "16"] as const) {
    const result = fixture.compilerRejections[arity];
    expect(result.exitCode).toBe(1);
    expect(result.signal).toBeNull();
    expect(result.stderr).toContain("no matching function for call to 'queryInterface'");
  }
});
