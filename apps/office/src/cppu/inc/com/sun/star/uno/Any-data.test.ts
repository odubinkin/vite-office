/** @fileoverview Complete original Any.hxx selected insertion/extraction/equality/helper replays through actual shared type/value/ownership owners; pure caller logical addresses adapt C++ layout only. */
import { it } from "vitest";
import fixture from "./native-any-data-cases.json";
import { createUnoNativeCppInputs } from "../../../../../../test/uno-native-cpp-values";
import type { UnoTypeArgument } from "../../../../unotype";
import type { Any } from "./Any";
import { typelib_TypeClass as C } from "../../../../typelib/typeclass";
import type {
  typelib_TypeDescription as D,
  typelib_TypeDescriptionReference as R,
  typelib_CompoundTypeDescription as P,
} from "../../../../typelib/typedescription";
const argumentsList: Exclude<UnoTypeArgument, "Any">[] = [
  "bool",
  "sal_Bool",
  "sal_Int8",
  "sal_Int16",
  "sal_uInt16",
  "sal_Int32",
  "sal_uInt32",
  "sal_Int64",
  "sal_uInt64",
  "float",
  "double",
  "sal_Unicode",
  "OUString",
  "Type",
  ["Reference", "XInterface"],
  ["Sequence", ["Reference", "XInterface"]],
];
/** Complete original caller state and observations. @param mode - Original captured process. @returns Actual shared owners and complete observation helpers. */
async function caller(mode: "extraction" | "predicates" | "helpers") {
  const x = await createUnoNativeCppInputs(fixture.captures[mode]),
    publicAny = await import("./Any"),
    sequenceOwner = await import("../../../../uno/sequence2");
  /** Acquires the original description. @param r - Original type. @returns Acquired description. */
  function description(r: R): D {
    const d: [D | null] = [null];
    x.f.typelib_typedescriptionreference_getDescription(d, r);
    return d[0] as D;
  }
  /** Whole initialized Any and original ownership/type metadata observations. @param a - Actual public Any. @returns Nothing. */
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
  /** Source address for actual generated exception fields, using real description offsets; borrowed inputs gain no ownership or substitute type provider. @param e - Actual generated owner. @returns Original logical field storage. */
  function exceptionAddress(e: InstanceType<typeof x.RuntimeException>): unknown {
    const d = description(x.runtimeType().getTypeLibType() as R) as unknown as P,
      base = d.pBaseTypeDescription as P,
      p = new Map<number, unknown>();
    p.set((base.pMemberOffsets as Int32Array)[0] as number, []);
    p.set((base.pMemberOffsets as Int32Array)[1] as number, []);
    // Original reinterpret addresses point at these actual owner's fields; setters only write raw fields, adding no acquisition/assignment policy.
    Object.defineProperty(p.get((base.pMemberOffsets as Int32Array)[0] as number), "0", {
      get: /** Actual original Message pointer lvalue. @returns Current pointer. */ () =>
        e.Message.pData,
      set: /** Original raw field write. @param value - Assigned pointer. @returns Nothing. */ (
        value,
      ) => {
        e.Message.pData = value;
      },
      configurable: true,
    });
    const context = e.Context as unknown as { _pInterface: unknown };
    Object.defineProperty(p.get((base.pMemberOffsets as Int32Array)[1] as number), "0", {
      get: /** Actual original Context pointer lvalue. @returns Current pointer. */ () =>
        context._pInterface,
      set: /** Original raw field write without reference ownership work. @param value - Assigned pointer. @returns Nothing. */ (
        value,
      ) => {
        context._pInterface = value;
      },
      configurable: true,
    });
    x.f.typelib_typedescription_release(d.aBase);
    return p;
  }
  /** Actual generated default owner and its original field addresses. Direct logical lvalues preserve the source literal empty-string flags and real destructor; no C-default substitution or physical ABI certification. @returns Actual owned destination/address/type. */
  function defaultException(): {
    p: unknown;
    r: R;
    owner: InstanceType<typeof x.RuntimeException>;
  } {
    const owner = new x.RuntimeException();
    return { owner, p: exceptionAddress(owner), r: x.runtimeType().getTypeLibType() as R };
  }
  return {
    ...x,
    publicAny,
    sequenceOwner,
    description,
    observe,
    exceptionAddress,
    defaultException,
  };
}
it("matches complete original Any specialization and generic extraction destinations", /** Replays every initialized supported source class and complete destination state including failure and lifetime order. @returns Whole replay. */ async () => {
  const x = await caller("extraction"),
    w = x.witness(41),
    root = x.witness(91);
  w.root = root;
  root.root = root;
  /** Original selected destination and actual operation. @param id - Declared destination. @param a - Real source. @returns Nothing. */
  function pick(id: number, a: Any): void {
    x.emit(id);
    if (id < 12) {
      const arg = argumentsList[id] as Exclude<UnoTypeArgument, "Any">,
        dest: [boolean | number | bigint] = [id === 0 ? true : id === 7 || id === 8 ? 71n : 71];
      x.emit(a.extract(dest, arg));
      const r = x.unotype.getTypeFavourUnsigned(arg).getTypeLibType() as R;
      x.value(dest, r);
      x.ref(r);
    } else if (id === 12) {
      const dest = x.name("prior");
      x.emit(a.extract(dest, "OUString"));
      const r = x.unotype.getTypeFavourUnsigned("OUString").getTypeLibType() as R;
      x.value([dest.pData], r);
      x.ref(r);
      dest.dispose();
    } else if (id === 13) {
      const dest = new x.Type(x.type(C.BYTE));
      x.emit(a.extract(dest, "Type"));
      const r = x.unotype.getTypeFavourUnsigned("Type").getTypeLibType() as R;
      x.value([dest.getTypeLibType()], r);
      x.ref(r);
      dest.dispose();
    } else if (id === 14) {
      const dest: [unknown] = [root];
      x.genfunc.cpp_acquire(root);
      const arg = argumentsList[14] as Exclude<UnoTypeArgument, "Any">;
      x.emit(a.extract(dest, arg));
      const r = x.unotype.getTypeFavourUnsigned(arg).getTypeLibType() as R;
      x.value(dest, r);
      x.ref(r);
      x.globals.uno_type_destructData(dest, r, x.genfunc.cpp_release);
    } else if (id === 15) {
      const arg = argumentsList[15] as Exclude<UnoTypeArgument, "Any">,
        r = x.unotype.getTypeFavourUnsigned(arg).getTypeLibType() as R,
        dest: [import("../../../../uno/sequence2").uno_Sequence | null] = [null];
      x.sequenceOwner.uno_type_sequence_construct(dest, r, null, 0, x.genfunc.cpp_acquire);
      x.emit(a.extract(dest, arg));
      const after = x.unotype.getTypeFavourUnsigned(arg).getTypeLibType() as R;
      x.value(dest, after);
      x.ref(after);
      x.globals.uno_type_destructData(dest, r, x.genfunc.cpp_release);
    } else {
      const dest = x.defaultException();
      x.emit(a.extract(dest.p, x.runtimeType));
      const r = x.unotype.getTypeFavourUnsigned(x.runtimeType).getTypeLibType() as R;
      x.value(dest.p, r);
      x.ref(r);
      dest.owner.dispose();
    }
  }
  for (let c = 0; c <= 22; c++) {
    if ([16, 18, 21].includes(c)) continue;
    const r = x.get(c);
    let d = x.description(r);
    for (let v = 0; v < 2; v++) {
      const h = x.name("Aa"),
        p = x.sample(r, h.pData, w as unknown as Parameters<typeof x.sample>[2], v);
      x.emit(c, v);
      const a = new x.Any(p, r);
      for (let id = 0; id < 17; id++) {
        pick(id, a);
        x.observe(a);
        x.emit(w.count, root.count);
      }
      x.observe(a);
      a.dispose();
      x.globals.uno_type_destructData(p, r, x.genfunc.cpp_release);
      h.dispose();
      x.f.typelib_typedescription_release(d);
      d = x.description(r);
    }
    x.f.typelib_typedescription_release(d);
  }
  x.emit(23);
  const message = x.name("source"),
    context = new x.Reference(root),
    e = new x.RuntimeException(message, context);
  context.dispose();
  message.dispose();
  const a = new x.Any(x.exceptionAddress(e), x.runtimeType);
  pick(16, a);
  x.observe(a);
  a.dispose();
  e.dispose();
  x.emit(w.count, root.count);
  x.dispose();
  x.finish();
}, 120000);
it("matches complete original Any extractability and Any equality matrices", /** Replays all source/demand/value pairs through actual query/type/equality owners. @returns Whole matrix. */ async () => {
  const x = await caller("predicates"),
    w = x.witness(41),
    root = x.witness(91);
  w.root = root;
  for (let ac = 0; ac <= 22; ac++) {
    if ([16, 18, 21].includes(ac)) continue;
    const ar = x.get(ac),
      ad = x.description(ar);
    for (let bc = 0; bc <= 22; bc++) {
      if ([16, 18, 21].includes(bc)) continue;
      const br = x.get(bc),
        bd = x.description(br);
      for (let v = 0; v < 2; v++) {
        const ah = x.name("Aa"),
          bh = x.name(v ? "Aa" : "Bb"),
          ap = x.sample(ar, ah.pData, w as unknown as Parameters<typeof x.sample>[2], v),
          bp = x.sample(br, bh.pData, w as unknown as Parameters<typeof x.sample>[2], v);
        x.emit(ac, bc, v);
        const a = new x.Any(ap, ar),
          b = new x.Any(bp, br),
          type = x.unotype.getTypeFromTypeDescriptionReference([br]);
        x.emit(a.isExtractableTo(type));
        x.emit(a.operatorEquals(b));
        x.emit(a.operatorNotEquals(b));
        x.emit(a.operatorEquals(a));
        x.observe(a);
        x.observe(b);
        x.ref(ar);
        x.ref(br);
        x.emit(w.count, root.count);
        b.dispose();
        a.dispose();
        x.globals.uno_type_destructData(bp, br, x.genfunc.cpp_release);
        x.globals.uno_type_destructData(ap, ar, x.genfunc.cpp_release);
        bh.dispose();
        ah.dispose();
      }
      x.f.typelib_typedescription_release(bd);
    }
    x.f.typelib_typedescription_release(ad);
  }
  x.dispose();
  x.finish();
}, 120000);
it("matches complete original Any insertion has and toAny fromAny ownership", /** Replays original template and specialized helper lifetimes without a replacement value/type factory. @returns Whole helper replay. */ async () => {
  const x = await caller("helpers"),
    w = x.witness(41),
    root = x.witness(91);
  w.root = root;
  /** Original selected input and output lifetime. @param id - Original declared type label. @param source - Borrowed lvalue address. @param arg - Declared type. @returns Nothing. */
  function help(id: number, source: unknown, arg: Exclude<UnoTypeArgument, "Any">): void {
    x.emit(id);
    const a = new x.Any();
    a.insert(source, arg);
    x.observe(a);
    const b = x.publicAny.toAny(source, arg);
    x.observe(b);
    const c = x.publicAny.toAny(b);
    x.observe(c);
    const d = x.publicAny.toAnyMove(c);
    x.observe(d);
    x.observe(c);
    const e = new x.Any();
    x.emit(x.publicAny.fromAny(d, e, "Any"));
    x.observe(e);
    x.emit(x.publicAny.fromAny(e, e, "Any"));
    x.observe(e);
    e.dispose();
    d.dispose();
    c.dispose();
    x.observe(b);
    b.dispose();
    let dest: unknown, cleanup: () => void;
    if (arg === "OUString") {
      const owned = new x.OUString();
      dest = owned;
      cleanup = /** Original selected owned destructor. @returns Nothing. */ () => owned.dispose();
    } else if (arg === "Type") {
      const owned = new x.Type();
      dest = owned;
      cleanup = /** Original selected owned destructor. @returns Nothing. */ () => owned.dispose();
    } else if (Array.isArray(arg)) {
      dest = [null];
      cleanup = /** Original interface destination destructor. @returns Nothing. */ () =>
        x.globals.uno_type_destructData(dest, r, x.genfunc.cpp_release);
    } else {
      dest = [arg === "bool" ? false : arg === "sal_Int64" || arg === "sal_uInt64" ? 0n : 0];
      cleanup =
        /** Original fundamental destination has no destructor body. @returns Nothing. */ () => {};
    }
    x.emit(x.publicAny.fromAny(a, dest, arg));
    const r = x.unotype.getTypeFavourUnsigned(arg).getTypeLibType() as R;
    x.value(
      arg === "OUString"
        ? [(dest as InstanceType<typeof x.OUString>).pData]
        : arg === "Type"
          ? [(dest as InstanceType<typeof x.Type>).getTypeLibType()]
          : dest,
      r,
    );
    x.ref(r);
    x.emit(a.has(arg));
    x.observe(a);
    cleanup();
    a.dispose();
  }
  help(0, [false], "bool");
  help(1, [true], "bool");
  help(2, [255], "sal_Bool");
  help(3, [-97], "sal_Int8");
  help(4, [-12345], "sal_Int16");
  help(5, [54321], "sal_uInt16");
  help(6, [-123456789], "sal_Int32");
  help(7, [0xfedcba98], "sal_uInt32");
  help(8, [-0x123456789abcdefn], "sal_Int64");
  help(9, [0xfedcba9876543210n], "sal_uInt64");
  help(10, [Math.fround(-1.2345)], "float");
  help(11, [-0], "double");
  help(12, [0xd800], "sal_Unicode");
  const s = x.name("Aa");
  help(13, [s.pData], "OUString");
  s.dispose();
  const t = new x.Type(x.type(C.BYTE));
  help(14, [t.getTypeLibType()], "Type");
  t.dispose();
  const r = new x.Reference(w);
  help(15, [r.get()], ["Reference", "XInterface"]);
  r.dispose();
  x.emit(w.count, root.count);
  x.dispose();
  x.finish();
}, 120000);
