/** @fileoverview Complete original public Any ownership/metadata observations with real shared C/CPPu owners and identical native C++ caller values; empty reserved bytes are never observed. */
import { it } from "vitest";
import fixture from "./native-any-ownership-cases.json";
import { createUnoNativeCppInputs } from "../../../../../../test/uno-native-cpp-values";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
} from "../../../../typelib/typedescription";
import type { Any } from "./Any";
import type { UnoTypeArgument } from "../../../../unotype";
import type { UnoNativeCppWitness } from "../../../../../../test/uno-native-cpp-values";
/** Original process and actual public ownership operations. @param mode - Original mode. @returns Shared runtime and caller observations. */
async function caller(mode: "constructors" | "histories" | "templates") {
  const x = await createUnoNativeCppInputs(fixture.captures[mode]);
  /** Acquires an actual original description. @param r - Actual reference. @returns Acquired description. */
  function description(r: R): D {
    const d: [D | null] = [null];
    x.f.typelib_typedescriptionreference_getDescription(d, r);
    return d[0] as D;
  }
  /** Reuses initialized native caller input fields; C++ witness only changes interface pointer layout. @param r - Type. @param held - Held string. @param w - C++ interface caller. @param variant - Input variant. @returns Actual original logical storage. */
  function sample(
    r: R,
    held: import("../../../../../../sal/inc/rtl/ustring.h").rtl_uString,
    w: UnoNativeCppWitness,
    variant: number,
  ): unknown {
    return x.sample(r, held, w as unknown as Parameters<typeof x.sample>[2], variant);
  }
  /** Observes every initialized Any value and its original borrowed metadata/acquired output; no indeterminate VOID reserved value is read. @param a - Actual Any. @returns Nothing. */
  function observe(a: Any): void {
    x.anyValue(a);
    x.emit(
      a.getValueTypeRef() === a.pType,
      a.getValueTypeClass(),
      a.hasValue(),
      a.getValue() === a.pData,
      a.getValueType() === a.getValueType(),
      a.getValueType().getTypeLibType() === a.pType,
    );
    x.ref(a.getValueType().getTypeLibType());
    const n = a.getValueTypeName();
    x.text(n.pData);
    x.ref(a.pType);
    n.dispose();
    x.ref(a.pType);
    const d: [D | null] = [null];
    a.getValueTypeDescription(d);
    x.desc(d[0]);
    x.f.typelib_typedescription_release(d[0] as D);
    x.ref(a.pType);
  }
  return { ...x, description, sample, observe };
}
it("matches complete original Any pointer Type description copy construction and metadata", /** Replays all initialized original class/API source inputs and destructor ordering. @returns Complete replay. */ async () => {
  const x = await caller("constructors"),
    w = x.witness(41);
  for (let c = 0; c <= 22; c++) {
    if ([16, 18, 21].includes(c)) continue;
    const r = x.get(c),
      d = x.description(r);
    for (let v = 0; v < 2; v++)
      for (let api = 0; api < 4; api++) {
        const h = x.name("Aa"),
          p = x.sample(r, h.pData, w, v);
        x.emit(c, v, api);
        if (api === 3) {
          const source = new x.Any(p, r),
            a = new x.Any(source);
          x.observe(a);
          x.observe(source);
          a.dispose();
          source.dispose();
        } else {
          const a =
            api === 0
              ? new x.Any(p, r)
              : api === 1
                ? new x.Any(p, d)
                : new x.Any(p, x.unotype.getTypeFromTypeDescriptionReference([r]));
          x.observe(a);
          a.dispose();
        }
        x.value(p, r);
        x.ref(r);
        x.text(h.pData);
        x.emit(w.count);
        x.globals.uno_type_destructData(p, r, x.genfunc.cpp_release);
        h.dispose();
      }
    x.f.typelib_typedescription_release(d);
  }
  for (let api = 0; api < 2; api++) {
    x.emit(23, api);
    const a = new x.Any(null, null);
    x.observe(a);
    a.setValue(null, null);
    x.observe(a);
    a.dispose();
  }
  x.dispose();
  x.finish();
}, 120000);
it("matches complete original Any assignment move alias repair clear and default histories", /** Replays full two-owner transitions, stable borrowed Type view and original moved-VOID non-null pointer. @returns Complete replay. */ async () => {
  const x = await caller("histories"),
    a = x.witness(41),
    b = x.witness(42);
  for (let ac = 0; ac <= 22; ac++) {
    if ([16, 18, 21].includes(ac)) continue;
    const ar = x.get(ac),
      ad = x.description(ar);
    for (let bc = 0; bc <= 22; bc++) {
      if ([16, 18, 21].includes(bc)) continue;
      const br = x.get(bc),
        bd = x.description(br),
        ah = x.name("Aa"),
        bh = x.name("Bb"),
        av = x.sample(ar, ah.pData, a, 1),
        bv = x.sample(br, bh.pData, b, 1);
      x.emit(ac, bc);
      const left = new x.Any(av, ar),
        right = new x.Any(bv, br),
        alias = left.getValueType();
      x.emit(left.assign(left) === left);
      x.observe(left);
      x.observe(right);
      x.emit(left.assign(right) === left);
      x.observe(left);
      x.observe(right);
      x.emit(alias.getTypeLibType() === left.pType);
      left.setValue(av, ad);
      x.observe(left);
      left.setValue(bv, x.unotype.getTypeFromTypeDescriptionReference([br]));
      x.observe(left);
      left.setValue(null, ar);
      x.observe(left);
      left.clear();
      x.observe(left);
      x.emit(alias.getTypeLibType() === left.pType);
      left.setValue(av, ar);
      x.emit(left.moveAssign(right) === left);
      x.observe(left);
      x.observe(right);
      x.emit(alias.getTypeLibType() === left.pType, left.moveAssign(left) === left);
      x.observe(left);
      const moved = x.Any.move(left);
      x.observe(moved);
      x.observe(left);
      x.emit(left.pData === moved, left.pData !== null);
      moved.dispose();
      left.clear();
      x.observe(left);
      x.emit(a.count, b.count);
      right.dispose();
      left.dispose();
      x.globals.uno_type_destructData(bv, br, x.genfunc.cpp_release);
      x.globals.uno_type_destructData(av, ar, x.genfunc.cpp_release);
      bh.dispose();
      ah.dispose();
      x.f.typelib_typedescription_release(bd);
    }
    x.f.typelib_typedescription_release(ad);
  }
  x.dispose();
  x.finish();
}, 120000);
it("matches original bool and fundamental Reference templated Any ownership constructors", /** Keeps C++ declared types explicit, sharing actual UnoType and value owners without inference. @returns Complete replay. */ async () => {
  const x = await caller("templates"),
    w = x.witness(41);
  /** Calls only the selected original template/bool constructor bodies. @param id - Caller label. @param value - Actual logical source address or C++ bool. @param type - Erased declared template argument, absent for original bool overload. @returns Nothing. */
  function typed(id: number, value: unknown, type?: UnoTypeArgument): void {
    x.emit(id);
    const a = type === undefined ? new x.Any(value as boolean) : new x.Any(value, type);
    x.observe(a);
    const b = new x.Any(a);
    x.observe(b);
    x.emit(b.assign(a) === b, b.assign(b) === b);
    x.observe(b);
    b.clear();
    x.observe(b);
    b.dispose();
    a.dispose();
  }
  typed(0, false);
  typed(1, true);
  typed(2, [255], "sal_Bool");
  typed(3, [-97], "sal_Int8");
  typed(4, [-12345], "sal_Int16");
  typed(5, [54321], "sal_uInt16");
  typed(6, [-123456789], "sal_Int32");
  typed(7, [0xfedcba98], "sal_uInt32");
  typed(8, [-0x123456789abcdefn], "sal_Int64");
  typed(9, [0xfedcba9876543210n], "sal_uInt64");
  typed(10, [Math.fround(-1.2345)], "float");
  typed(11, [-0], "double");
  typed(12, [0xd800], "sal_Unicode");
  const s = x.name("Aa");
  typed(13, [s.pData], "OUString");
  s.dispose();
  const t = new x.Type(x.type(C.BYTE));
  typed(14, [t.getTypeLibType()], "Type");
  t.dispose();
  const r = new x.Reference(w);
  typed(15, [r.get()], ["Reference", "XInterface"]);
  r.dispose();
  const message = x.name("exception"),
    context = new x.Reference(w),
    exception = new x.RuntimeException(message, context);
  context.dispose();
  message.dispose();
  const er = x.runtimeType().getTypeLibType() as R,
    ed = x.description(
      er,
    ) as unknown as import("../../../../typelib/typedescription").typelib_CompoundTypeDescription,
    base =
      ed.pBaseTypeDescription as import("../../../../typelib/typedescription").typelib_CompoundTypeDescription,
    source = x.copy.allocateUnoStorage() as ReadonlyMap<number, unknown>;
  (source.get((base.pMemberOffsets as Int32Array)[0] as number) as [unknown])[0] =
    exception.Message.pData;
  (source.get((base.pMemberOffsets as Int32Array)[1] as number) as [unknown])[0] =
    exception.Context.get();
  x.f.typelib_typedescription_release(ed.aBase);
  typed(16, source, x.runtimeType);
  exception.dispose();
  x.ref(x.getCppuType().getTypeLibType());
  const empty = new x.Any();
  x.observe(empty);
  empty.dispose();
  x.emit(w.count);
  x.dispose();
  x.finish();
}, 120000);
