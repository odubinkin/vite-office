/** @fileoverview Strict whole original ElementExistException value/type/typed-catch observations through reused shared owners. */
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
    { ElementExistException, cppu_detail_getUnoType, getCppuType } =
      await import("./ElementExistException");
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
    ElementExistException,
    cppu_detail_getUnoType,
    getCppuType,
    witness,
  };
}
/** Replays actual default/two-field/copy/move/assignment/reverse destruction through one generated class owner. @param x - Actual process. @param E - Original selected generated value class. @returns Nothing. */
function exceptions(
  x: Awaited<ReturnType<typeof context>>,
  E: typeof x.ElementExistException,
): void {
  const { emit, text } = x,
    a = x.witness(11);
  /** Observes every initialized value field and actual counts. @param value - Original value owner. @param held - Original borrowed caller string or null. @returns Nothing. */
  function observe(value: InstanceType<typeof E>, held: rtl_uString | null): void {
    expect(value instanceof E).toBe(true);
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
    p = new E(held, contextValue);
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
it("matches complete original ElementExistException constructors assignments and reverse lifetime", /** Executes original value operations. @returns Completion. */ async () => {
  const x = await context("values-ElementExistException");
  exceptions(x, x.ElementExistException);
  x.finish();
});
it("matches complete original cold derived type registration cache and base chain", /** Executes original cold/type lifetime operations. @returns Completion. */ async () => {
  const x = await context("type-ElementExistException");
  metadata(x);
  x.finish();
});

it("matches original checked and runtime exception catch selection", /** Uses actual generated inheritance and disposes every caught value. @returns Completion. */ async () => {
  const x = await context("catches"),
    { IllegalArgumentException } = await import("../lang/IllegalArgumentException"),
    { IndexOutOfBoundsException } = await import("../lang/IndexOutOfBoundsException"),
    { NoSuchElementException } = await import("./NoSuchElementException");
  for (const E of [
    IllegalArgumentException,
    IndexOutOfBoundsException,
    x.ElementExistException,
    NoSuchElementException,
  ]) {
    try {
      throw new E();
    } catch (error) {
      expect(error instanceof x.Exception).toBe(true);
      const value = error as InstanceType<typeof x.Exception>;
      x.emit(value instanceof x.RuntimeException ? 1 : 2);
      value.dispose();
    }
  }
  x.finish();
});
