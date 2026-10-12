/** @fileoverview Replays whole original cold/preinitialized XExceptionThrower metadata and Type/Any lifetime streams through actual shared owners. */
import { it } from "vitest";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_InterfaceTypeDescription as I,
} from "../../../cppu/inc/typelib/typedescription";
import fixture from "./native-exception-interface-cases.json";
import { createUnoNativeInterfaceContext } from "../../../test/uno-native-interface-values";
for (const mode of ["cold", "runtime-first", "exception-first", "root", "pending"] as const) {
  it(`matches complete original exception interface ${mode} stream`, /** Replays every initialized native observation without a substitute interface/exception provider. @returns Whole parity. */ async () => {
    const x = await createUnoNativeInterfaceContext(fixture.captures[mode]),
      api = await import("./XExceptionThrower"),
      { UnoType } = await import("../../../cppu/inc/unotype"),
      { cppu_detail_getUnoType: runtimeExceptionType } =
        await import("../../../cppu/inc/com/sun/star/uno/RuntimeException");
    if (mode === "root") {
      x.observe(UnoType.get("XInterface"));
      x.finish();
      return;
    }
    if (mode === "pending") {
      const { Type } = await import("../../../cppu/inc/com/sun/star/uno/Type"),
        { typelib_TypeClass: C } = await import("../../../cppu/inc/typelib/typeclass");
      const name = x.name("cppuhelper.qa.Pending"),
        member = x.name("cppuhelper.qa.Pending::later"),
        td: [I | null] = [null],
        r: [R | null] = [null];
      x.f.typelib_typedescriptionreference_new(r, C.INTERFACE_METHOD, member.pData);
      const base = UnoType.get("XInterface").getTypeLibType();
      x.f.typelib_typedescription_newMIInterface(td, name.pData, 0, 0, 0, 0, 0, 1, [base as R], 1, [
        r[0] as R,
      ]);
      x.f.typelib_typedescription_register(td as unknown as [D | null]);
      x.f.typelib_typedescriptionreference_release(r[0] as R);
      x.f.typelib_typedescription_release((td[0] as I).aBase);
      const type = new Type(
        C.INTERFACE as unknown as ReturnType<InstanceType<typeof Type>["getTypeClass"]>,
        name,
      );
      x.observe(type);
      type.dispose();
      member.dispose();
      name.dispose();
      x.finish();
      return;
    }
    if (mode === "runtime-first") {
      x.emit(90);
      x.ref(UnoType.get(runtimeExceptionType).getTypeLibType());
    } else if (mode === "exception-first") {
      x.emit(91);
      x.ref(UnoType.get("Exception").getTypeLibType());
    }
    x.emit(7, 5);
    const t = UnoType.get(api.cppu_detail_getUnoType);
    x.observe(t);
    for (let kind = 1; kind < 5; kind++) {
      const v =
        kind === 1
          ? api.XExceptionThrower.static_type()
          : kind === 2
            ? api.getCppuType(null)
            : kind === 3
              ? UnoType.get(["Reference", api.cppu_detail_getUnoType])
              : api.cppu_detail_getUnoType();
      x.emit(kind, v === t, v.getTypeLibType() === t.getTypeLibType());
      x.ref(v.getTypeLibType());
    }
    x.emit(8, 5);
    x.observe(UnoType.get(api.cppu_detail_getUnoType));
    x.finish();
  });
}
