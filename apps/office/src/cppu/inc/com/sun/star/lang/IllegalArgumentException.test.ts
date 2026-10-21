/** @fileoverview Strict whole original IllegalArgumentException value/type/typed-catch observations through reused shared owners. */
import { expect, it } from "vitest";
import fixture from "../container/native-property-container-contracts-cases.json";
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
    { Exception } = await import("../uno/Exception"),
    { RuntimeException } = await import("../uno/RuntimeException"),
    { IllegalArgumentException, cppu_detail_getUnoType, getCppuType } =
      await import("./IllegalArgumentException");
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
    Exception,
    RuntimeException,
    IllegalArgumentException,
    cppu_detail_getUnoType,
    getCppuType,
    witness,
  };
}
/** Replays actual default/two-field/copy/move/assignment/reverse destruction through one generated class owner. @param x - Actual process. @param E - Original selected generated value class. @returns Nothing. */
function exceptions(
  x: Awaited<ReturnType<typeof context>>,
  E: typeof x.IllegalArgumentException,
): void {
  const { emit, text } = x,
    a = x.witness(11);
  /** Observes every initialized value field and actual counts. @param value - Original value owner. @param held - Original borrowed caller string or null. @returns Nothing. */
  function observe(value: InstanceType<typeof E>, held: rtl_uString | null): void {
    expect(value instanceof E).toBe(true);
    emit(value.ArgumentPosition);
    text(value.Message.pData);
    emit(
      value.Message.pData === held,
      (value.Context.get() as typeof a | null)?.value ?? 0,
      value.Context.is(),
      a.count,
    );
  }
  const e = new E();
  observe(e, null);
  const held = x.name("Message"),
    contextValue = new x.Reference(a),
    p = new E(held, contextValue, -32768);
  observe(p, held.pData);
  text(held.pData);
  const c = new E(p);
  observe(c, held.pData);
  observe(p, held.pData);
  const message = c.Message,
    owner = c.Context;
  emit(c.assign(c) === c, c.Message === message, c.Context === owner);
  observe(c, held.pData);
  emit(e.assign(c) === e);
  observe(e, held.pData);
  text(held.pData);
  const m = E.move(c);
  observe(c, held.pData);
  observe(m, held.pData);
  emit(e.moveAssign(m) === e);
  observe(e, held.pData);
  observe(m, held.pData);
  text(held.pData);
  m.dispose();
  c.dispose();
  p.dispose();
  observe(e, held.pData);
  e.dispose();
  text(held.pData);
  contextValue.dispose();
  emit(a.count);
  held.dispose();
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
it("matches complete original IllegalArgumentException constructors assignments and reverse lifetime", /** Executes original value operations. @returns Completion. */ async () => {
  const x = await context("values-IllegalArgumentException");
  exceptions(x, x.IllegalArgumentException);
  x.finish();
});
it("matches complete original cold derived type registration cache and base chain", /** Executes original cold/type lifetime operations. @returns Completion. */ async () => {
  const x = await context("type-IllegalArgumentException");
  metadata(x);
  x.finish();
});

it("matches original signed16 argument positions and copy/move scalar retention", /** Replays native boundary positions and ownership. @returns Completion. */ async () => {
  const x = await context("positions"),
    a = x.witness(17),
    owner = new x.Reference(a),
    name = x.name("Argument");
  for (const n of [-32768, -1, 0, 32767]) {
    const e = new x.IllegalArgumentException(name, owner, n);
    x.emit(e.ArgumentPosition);
    const c = new x.IllegalArgumentException(e);
    x.emit(c.ArgumentPosition);
    const m = x.IllegalArgumentException.move(c);
    x.emit(c.ArgumentPosition, m.ArgumentPosition);
    e.moveAssign(m);
    x.emit(e.ArgumentPosition, m.ArgumentPosition);
    m.dispose();
    c.dispose();
    e.dispose();
  }
  x.emit(a.count);
  name.dispose();
  owner.dispose();
  x.finish();
});
