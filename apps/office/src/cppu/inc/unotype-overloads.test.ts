/** @fileoverview Replays complete original UnoType/Sequence.hxx overload, template/static-cell identity and ownership observations through existing real shared owners. */
import { it } from "vitest";
import { createUnoNativeContext } from "../../test/uno-native-values";
import type { UnoTypeArgument as A } from "./unotype";
import type { Type } from "./com/sun/star/uno/Type";
import fixture from "./native-unotype-cases.json";

/** Loads original process state without an unrelated type factory corpus. @param mode - Original process capture. @returns Actual original helper owners and observation writers. */
async function context(mode: keyof typeof fixture.captures) {
  const x = await createUnoNativeContext(fixture.captures[mode]),
    u = await import("./unotype"),
    s = await import("./com/sun/star/uno/Sequence-type"),
    generated = await import("./com/sun/star/uno/RuntimeException");
  const arguments_: A[] = [
      "void",
      "UnoVoidType",
      "bool",
      "sal_Bool",
      "sal_Int8",
      "sal_Int16",
      "UnoUnsignedShortType",
      "sal_uInt16",
      "sal_Int32",
      "sal_uInt32",
      "sal_Int64",
      "sal_uInt64",
      "float",
      "double",
      "UnoCharType",
      "sal_Unicode",
      "OUString",
      "Type",
      "Any",
      "Exception",
      "XInterface",
      generated.cppu_detail_getUnoType,
      ["Reference", "XInterface"],
    ],
    values: Type[] = [];
  /** Records every initialized field and acquired returned name of an actual borrowed Type. @param t - Original borrowed value. @returns Nothing. */
  function value(t: Type): void {
    x.ref(t.getTypeLibType());
    x.emit(t.getTypeClass());
    const name = t.getTypeName();
    x.text(name.pData);
    x.ref(t.getTypeLibType());
    name.dispose();
    x.ref(t.getTypeLibType());
  }
  /** Records actual borrowed values in the original order. @param types - Actual original returned views. @returns Nothing. */
  function remember(...types: Type[]): void {
    for (const t of types) {
      value(t);
      values.push(t);
    }
  }
  /** Records all actual same-view, reference, equality and compatibility pairs. @returns Nothing. */
  function pairs(): void {
    for (const a of values)
      for (const b of values) {
        x.emit(
          a === b,
          a.getTypeLibType() === b.getTypeLibType(),
          a.equals(b),
          a.isAssignableFrom(b),
        );
        x.ref(a.getTypeLibType());
        x.ref(b.getTypeLibType());
      }
  }
  /** Replays original exact template expression pairs, without sharing tuple objects to synthesize view identity. @param id - Native element label. @param element - Actual erased C++ element type. @returns Nothing. */
  function sequence(id: number, element: A): void {
    const a = u.UnoType.get(["UnoSequenceType", element]),
      again = u.UnoType.get(["UnoSequenceType", element]),
      via = u.UnoType.get(["Sequence", element]),
      unsigned = u.getTypeFavourUnsigned(["Sequence", element]),
      char = u.getTypeFavourChar(["Sequence", element]),
      legacy = s.getCppuType(["Sequence", element]),
      supplied = s.getCppuSequenceType(element, u.UnoType.get(element)),
      changed = s.getCppuSequenceType(element, u.UnoType.get("void"));
    x.emit(
      id,
      a === again,
      a === via,
      a !== unsigned,
      unsigned === legacy,
      unsigned === supplied,
      unsigned === changed,
      unsigned !== char,
      a.getTypeLibType() === unsigned.getTypeLibType(),
      char.getTypeLibType() === unsigned.getTypeLibType(),
    );
    remember(a, unsigned, char);
  }
  /** Replays exact nested C++ specializations, recursive favour calls and independent global char sequence view. @returns Nothing. */
  function nested(): void {
    const a = u.UnoType.get(["Sequence", ["Sequence", "sal_uInt16"]]),
      same = u.UnoType.get(["UnoSequenceType", ["Sequence", "sal_uInt16"]]),
      other = u.UnoType.get(["UnoSequenceType", ["UnoSequenceType", "sal_uInt16"]]),
      unsigned = u.getTypeFavourUnsigned(["Sequence", ["Sequence", "sal_uInt16"]]),
      char = u.getTypeFavourChar(["Sequence", ["Sequence", "sal_uInt16"]]),
      again = u.UnoType.get(["Sequence", ["Sequence", "sal_uInt16"]]);
    x.emit(
      a === same,
      a !== other,
      a === again,
      a !== unsigned,
      unsigned !== char,
      a.getTypeLibType() === other.getTypeLibType(),
    );
    remember(a, other, unsigned, char);
    const ch = s.getCharSequenceCppuType(),
      ch2 = s.getCharSequenceCppuType();
    x.emit(
      ch === ch2,
      ch !== u.getTypeFavourChar(["Sequence", "sal_Unicode"]),
      ch.getTypeLibType() === u.UnoType.get(["UnoSequenceType", "UnoCharType"]).getTypeLibType(),
    );
    remember(ch, u.UnoType.get(["UnoSequenceType", "UnoCharType"]));
  }
  return { ...x, u, s, arguments_, remember, pairs, sequence, nested };
}

it("matches complete original fundamental Reference and generated ADL overloads", /** Replays native internal C++ overload selection, repeated borrowed identity and all pairs. @returns Completion. */ async () => {
  const x = await context("types");
  for (let id = 0; id < x.arguments_.length; id++) {
    const argument = x.arguments_[id] as A,
      a = x.u.UnoType.get(argument),
      again = x.u.UnoType.get(argument),
      unsigned = x.u.getTypeFavourUnsigned(argument),
      char = x.u.getTypeFavourChar(argument);
    x.emit(id, a === again, a === unsigned, a === char);
    x.remember(a, unsigned, char);
  }
  x.pairs();
  x.finish();
});
it("matches complete original sequence template cells and nested favour overloads", /** Preserves every actual type field/count and independent original borrowed static-cell identity. @returns Completion. */ async () => {
  const x = await context("sequences"),
    types = x.arguments_.slice(3, 22);
  types.push(x.arguments_[22] as A);
  for (let id = 0; id < types.length; id++) x.sequence(id, types[id] as A);
  x.nested();
  x.pairs();
  x.finish();
});
it("matches original legacy first-call supplied element and recursive cache ownership", /** Initializes the actual member-static cell with the caller Type before another overload visits it; later supplied arguments remain ignored exactly as upstream. @returns Completion. */ async () => {
  const x = await context("seeded"),
    { u, s } = x,
    a = s.getCppuSequenceType("sal_Int32", u.UnoType.get("UnoCharType")),
    again = s.getCppuSequenceType("sal_Int32", u.UnoType.get("bool")),
    unsigned = u.getTypeFavourUnsigned(["Sequence", "sal_Int32"]),
    via = u.UnoType.get(["Sequence", "sal_Int32"]),
    char = u.getTypeFavourChar(["Sequence", "sal_Int32"]),
    outerU = u.getTypeFavourUnsigned(["Sequence", ["Sequence", "sal_Int32"]]),
    outerA = u.UnoType.get(["Sequence", ["Sequence", "sal_Int32"]]),
    outerC = u.getTypeFavourChar(["Sequence", ["Sequence", "sal_Int32"]]);
  x.emit(
    a === again,
    a === unsigned,
    a !== via,
    unsigned !== char,
    a.getTypeLibType() !== via.getTypeLibType(),
    outerU.getTypeLibType() !== outerA.getTypeLibType(),
  );
  x.remember(a, unsigned, via, char, outerU, outerA, outerC);
  x.nested();
  x.pairs();
  x.finish();
});
