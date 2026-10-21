/** @fileoverview Strict whole original WrappedTargetException value/type/typed-catch observations through reused shared owners. */
import { expect, it } from "vitest";
import fixture from "./native-wrapped-target-cases.json";
import { createUnoNativeContext } from "../../../../../../test/uno-native-values";
import type { rtl_uString } from "../../../../../../sal/inc/rtl/ustring.h";
import type {
  typelib_CompoundTypeDescription as P,
  typelib_TypeDescriptionReference as R,
} from "../../../../typelib/typedescription";
/** Fresh original process with concrete interface callbacks only. @param mode - Complete native mode. @returns Original owners and unchanged whole-stream verifier. */
async function context(mode: keyof typeof fixture.captures) {
  const x = await createUnoNativeContext(fixture.captures[mode]),
    { Reference } = await import("../uno/Reference"),
    { Any } = await import("../uno/Any"),
    { typelib_TypeClass: C } = await import("../../../../typelib/typeclass"),
    { Exception } = await import("../uno/Exception"),
    { RuntimeException } = await import("../uno/RuntimeException"),
    { WrappedTargetException, cppu_detail_getUnoType, getCppuType } =
      await import("./WrappedTargetException");
  /** Actual caller-owned XInterface witness; no library type/value provider. @param value - Original identity. @returns Caller. */
  function witness(value: number) {
    return {
      value,
      count: 10,
      /** Observes original acquisition. @returns Nothing. */ acquire() {
        x.emit(1, this.value, ++this.count, -1);
      },
      /** Observes original release. @returns Nothing. */ release() {
        x.emit(2, this.value, --this.count, -1);
      },
    };
  }
  return {
    ...x,
    Reference,
    Any,
    C,
    Exception,
    RuntimeException,
    WrappedTargetException,
    cppu_detail_getUnoType,
    getCppuType,
    witness,
  };
}
/** Entire initialized type/base chain without installing synthetic descriptions. @param x - Actual original process. @returns Nothing. */
function metadata(x: Awaited<ReturnType<typeof context>>): void {
  const t = x.cppu_detail_getUnoType();
  x.ref(t.getTypeLibType());
  const name = t.getTypeName();
  x.text(name.pData);
  x.emit(t === x.cppu_detail_getUnoType());
  expect(x.getCppuType()).toBe(t);
  let p = t.getTypeLibType()?.pType as unknown as P | null;
  while (p) {
    x.desc(p.aBase);
    x.emit(p.nMembers, p.pBaseTypeDescription !== null);
    for (let i = 0; i < p.nMembers; i++) {
      x.emit((p.pMemberOffsets as Int32Array)[i] as number);
      x.text((p.ppMemberNames as rtl_uString[])[i] as rtl_uString);
      x.ref((p.ppTypeRefs as R[])[i] as R);
    }
    p = p.pBaseTypeDescription;
  }
  name.dispose();
}

/** Native Any field observations avoid opaque VOID reserved bytes and retain actual data aliases. @param x - Fresh process. @param value - Native field. @returns Nothing. */
function anyValue(
  x: Awaited<ReturnType<typeof context>>,
  value: InstanceType<Awaited<ReturnType<typeof context>>["Any"]>,
): void {
  const kind = value.getValueTypeClass() as number;
  x.emit(
    kind,
    value.hasValue(),
    value.pData === null,
    value.pData === x.copy.reservedDataAddress(value),
  );
  if (kind === x.C.LONG) x.emit((value.pData as [number])[0]);
  else if (kind === x.C.STRING) x.text((value.pData as [rtl_uString])[0]);
  else if (kind === x.C.INTERFACE) {
    const w = (value.pData as [ReturnType<typeof x.witness> | null])[0];
    x.emit(w === null);
    if (w !== null) x.emit(w.value, w.count);
  }
}
for (const kind of [0, 1, 2, 3] as const) {
  it(`matches original WrappedTargetException Any field ownership values${kind}`, /** Replays exact original generated value operations and reverse destruction. @returns Completion. */ async () => {
    const x = await context(`values${kind}`),
      a = x.witness(11),
      b = x.witness(22),
      name = x.name("Message"),
      held = x.name("Payload"),
      owner = new x.Reference(a),
      payload = new x.Any();
    if (kind !== 0) {
      const temporary =
        kind === 1
          ? new x.Any([-123456789], "sal_Int32")
          : kind === 2
            ? new x.Any([held.pData], "OUString")
            : new x.Any([b], ["Reference", "XInterface"]);
      payload.moveAssign(temporary);
      temporary.dispose();
    }
    /** Observes native generated fields and concrete caller counts. @param value - Original value. @param expected - Borrowed original message pointer. @returns Nothing. */
    function observe(
      value: InstanceType<typeof x.WrappedTargetException>,
      expected: rtl_uString | null,
    ): void {
      x.text(value.Message.pData);
      x.emit(
        value.Message.pData === expected,
        value.Context.is(),
        (value.Context.get() as typeof a | null)?.value ?? 0,
        a.count,
        b.count,
      );
      anyValue(x, value.TargetException);
    }
    const e = new x.WrappedTargetException();
    observe(e, null);
    const p = new x.WrappedTargetException(name, owner, payload);
    observe(p, name.pData);
    anyValue(x, payload);
    x.text(held.pData);
    const c = new x.WrappedTargetException(p);
    observe(c, name.pData);
    const message = c.Message,
      reference = c.Context,
      target = c.TargetException;
    x.emit(
      c.assign(c) === c,
      c.Message === message,
      c.Context === reference,
      c.TargetException === target,
    );
    observe(c, name.pData);
    x.emit(e.assign(c) === e);
    observe(e, name.pData);
    const m = x.WrappedTargetException.move(c);
    observe(c, name.pData);
    observe(m, name.pData);
    x.emit(e.moveAssign(m) === e);
    observe(e, name.pData);
    observe(m, name.pData);
    x.emit(e.moveAssign(e) === e);
    observe(e, name.pData);
    m.dispose();
    c.dispose();
    p.dispose();
    observe(e, name.pData);
    e.dispose();
    anyValue(x, payload);
    x.text(held.pData);
    x.emit(a.count, b.count);
    payload.dispose();
    owner.dispose();
    held.dispose();
    name.dispose();
    x.finish();
  });
}
it("matches original cold WrappedTargetException metadata and actual Any member type", /** Replays complete original type descriptions. @returns Completion. */ async () => {
  const x = await context("type");
  metadata(x);
  x.finish();
});
it("retains original checked Exception catch classification", /** Catches through actual shared generated inheritance. @returns Completion. */ async () => {
  const x = await context("catches");
  try {
    throw new x.WrappedTargetException();
  } catch (error) {
    expect(error instanceof x.Exception).toBe(true);
    const value = error as InstanceType<typeof x.Exception>;
    x.emit(value instanceof x.RuntimeException ? 1 : 2);
    value.dispose();
  }
  x.finish();
});
