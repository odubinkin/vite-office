/** @fileoverview Whole original public Mapping header streams through actual typelib and Type owners; C mapping callbacks are explicit enclosing caller input. */
import { expect, it } from "vitest";
import type { Mapping as Owner } from "./mapping.hxx";
import type { uno_Mapping } from "./mapping";
import type {
  typelib_TypeDescription as D,
  typelib_InterfaceTypeDescription as I,
} from "../typelib/typedescription";
import { typelib_TypeClass as C } from "../typelib/typeclass";
import { TypeClass } from "../../../udkapi/com/sun/star/uno/TypeClass";
import fixture from "./native-public-mapping-cases.json";
import { createUnoNativeContext } from "../../../test/uno-native-values";

for (const mode of ["ownership", "direct", "types", "throwing"] as const) {
  it(`matches complete original public Mapping ${mode} stream`, /** Replays every initialized owner/callback/type field, not selected final outcomes. @returns Whole-stream parity. */ async () => {
    const x = await createUnoNativeContext(fixture.captures[mode]),
      { Mapping } = await import("./mapping.hxx"),
      { Type } = await import("../com/sun/star/uno/Type");
    /** Caller-owned C record with observation labels and callback counts. */
    type Input = uno_Mapping & { label: number; count: number };
    const raw = [{}, {}, {}];
    let watched: Owner | null = null,
      expected: I | null = null,
      calls = 0,
      drop = false,
      fail = false;
    const failure = new Error("prepared callback failure");
    /** Labels original caller mapping pointers without supplying an address implementation. @param value - Original pointer. @returns Stable label. */
    function identity(value: uno_Mapping | null): number {
      return value ? (value as Input).label : -1;
    }
    /** Labels only original opaque caller interfaces. @param value - Caller input. @returns Stable label. */
    function pointer(value: unknown): number {
      return value === null
        ? -1
        : raw.includes(value as object)
          ? raw.indexOf(value as object)
          : -2;
    }
    /** Observes the source callback before owner publication. @param value - Mapping. @returns Nothing. */
    function acquire(value: uno_Mapping): void {
      const r = value as Input;
      x.emit(30, r.label, ++r.count, watched ? identity(watched.get()) : -2);
    }
    /** Observes source release before clear/move/destructor publication. @param value - Mapping. @returns Nothing. */
    function release(value: uno_Mapping): void {
      const r = value as Input;
      x.emit(31, r.label, --r.count, watched ? identity(watched.get()) : -2);
    }
    /** Original caller-supplied map boundary reports the actual borrowed type and inout pointer. @param value - Mapping. @param out - Same output address. @param input - Input pointer. @param type - Actual interface view. @returns Nothing. */
    function map(value: uno_Mapping, out: [unknown], input: unknown, type: I): void {
      x.emit(40, identity(value), pointer(out[0]), pointer(input), type === expected);
      x.desc(type.aBase);
      calls++;
      if (fail) throw failure;
      out[0] = drop ? null : input;
    }
    /** Prepared caller C record, with no production registry or bridge substitute. @param label - Original label. @returns Input. */
    function input(label: number): Input {
      return { label, count: 100, acquire, release, mapInterface: map };
    }
    /** Complete original wrapper pointer observations. @param value - Owner. @returns Nothing. */
    function snapshot(value: Owner): void {
      x.emit(70, identity(value.get()), value.is());
    }
    const a = input(0),
      b = input(1);
    if (mode === "ownership") {
      const empty = new Mapping();
      watched = empty;
      snapshot(empty);
      const emptyCopy = new Mapping(empty);
      snapshot(emptyCopy);
      emptyCopy.dispose();
      const value = new Mapping(a);
      watched = value;
      snapshot(value);
      const copy = new Mapping(value);
      snapshot(copy);
      const moved = Mapping.move(copy);
      snapshot(copy);
      snapshot(moved);
      value.assign(a);
      snapshot(value);
      value.assign(value);
      snapshot(value);
      value.assign(b);
      snapshot(value);
      value.moveAssign(moved);
      snapshot(value);
      snapshot(moved);
      value.moveAssign(value);
      snapshot(value);
      value.assign(b);
      value.clear();
      snapshot(value);
      value.clear();
      snapshot(value);
      moved.dispose();
      copy.dispose();
      value.assign(a);
      snapshot(value);
      watched = null;
      value.dispose();
      empty.dispose();
    } else {
      const root: [D | null] = [null];
      x.f.typelib_typedescriptionreference_getDescription(
        root,
        x.f.typelib_static_type_getByTypeClass(C.INTERFACE)[0] as NonNullable<
          ReturnType<typeof x.f.typelib_static_type_getByTypeClass>[0]
        >,
      );
      expected = (root[0] as D).pSelf as unknown as I;
      const value = new Mapping(a);
      watched = value;
      if (mode === "direct") {
        const out: [unknown] = [raw[2]];
        value.mapInterface(out, raw[0], expected);
        x.emit(80, pointer(out[0]));
        out[0] = value.mapInterface(raw[1], expected);
        x.emit(81, pointer(out[0]));
        out[0] = value.mapInterface(null, expected);
        x.emit(82, pointer(out[0]));
        drop = true;
        value.mapInterface(out, raw[0], root[0] as D);
        x.emit(83, pointer(out[0]));
      } else if (mode === "types") {
        const type = new Type((root[0] as D).pWeakRef as NonNullable<D["pWeakRef"]>),
          out: [unknown] = [raw[2]];
        value.mapInterface(out, raw[0], type);
        x.emit(80, pointer(out[0]));
        out[0] = value.mapInterface(raw[1], type);
        x.emit(81, pointer(out[0]));
        const name = x.name("public.Mapping.missing"),
          missing = new Type(TypeClass.INTERFACE, name);
        value.mapInterface(out, raw[0], missing);
        x.emit(82, pointer(out[0]), calls);
        out[0] = value.mapInterface(raw[0], missing);
        x.emit(83, pointer(out[0]), calls);
        const none = new Mapping();
        none.mapInterface(out, raw[0], missing);
        x.emit(84, pointer(out[0]), calls);
        none.dispose();
        missing.dispose();
        name.dispose();
        type.dispose();
      } else {
        const type = new Type((root[0] as D).pWeakRef as NonNullable<D["pWeakRef"]>),
          out: [unknown] = [raw[2]];
        fail = true;
        expect(
          /** Invokes the actual original throwing callback boundary. @returns Nothing or the unchanged caller exception. */ () =>
            value.mapInterface(out, raw[0], type),
        ).toThrow(failure);
        x.emit(85, pointer(out[0]), calls);
        x.desc(root[0]);
        type.dispose();
      }
      watched = null;
      value.dispose();
      x.desc(root[0]);
      x.f.typelib_typedescription_release(root[0] as D);
    }
    x.emit(90, a.count, b.count, calls);
    x.finish();
  });
}
