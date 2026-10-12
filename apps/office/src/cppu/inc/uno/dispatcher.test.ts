/** @fileoverview Whole original binary interface holder traces through the actual shared owner, including pointer publication and borrowed dispatcher addresses. */
import { describe, expect, it } from "vitest";
import fixture from "./native-dispatcher-cases.json";
import { createUnoNativeContext } from "../../../test/uno-native-values";
import type { UnoInterfaceReference, uno_Interface } from "./dispatcher";
import type { uno_Any } from "./any2";
import { typelib_TypeClass as C } from "../typelib/typeclass";
import type { typelib_TypeDescription as D } from "../typelib/typedescription";
/** Creates a fresh initialized original process with real caller-owned callback slots. @param mode - Whole native scenario. @returns Actual holder and caller observers. */
async function context(mode: keyof typeof fixture.captures) {
  const x = await createUnoNativeContext(fixture.captures[mode]),
    { UnoInterfaceReference: Holder } = await import("./dispatcher"),
    { SAL_NO_ACQUIRE } = await import("../../../sal/inc/types");
  let watch: UnoInterfaceReference | null = null;
  /** Reads caller identity without interface queries or acquisition. @param pointer - Borrowed interface. @returns Caller identity. */
  function ident(pointer: uno_Interface | null): number {
    return pointer === null ? 0 : (pointer as Caller).id;
  }
  /** Actual native caller record, independently of the holder implementation. */
  interface Caller extends uno_Interface {
    /** Original caller identity. */ id: number;
    /** Initialized caller count, kept alive for the whole process. */ count: number;
    /** Actual caller acquisition callback. */ acquire: NonNullable<uno_Interface["acquire"]>;
    /** Actual caller release callback. */ release: NonNullable<uno_Interface["release"]>;
  }
  /** Creates only caller callback witnesses, with no library/interface/type provider. @param id - Caller identity. @returns Original C interface record. */
  function caller(id: number): Caller {
    return {
      id,
      count: 100,
      /** Observes original callback argument and holder pointer at callback time. @param p - Original this argument. @returns Nothing. */
      acquire(p) {
        expect(p).toBe(this);
        x.emit(1, this.id, ++this.count, ident(watch === null ? null : watch.get()));
      },
      /** Observes release before subsequent pointer publication. @param p - Original this argument. @returns Nothing. */
      release(p) {
        expect(p).toBe(this);
        x.emit(2, this.id, --this.count, ident(watch === null ? null : watch.get()));
      },
      pDispatcher: null,
    };
  }
  const a = caller(1),
    b = caller(2);
  /** Records every initialized caller and holder value, without copying an owner. @param n - Observation position. @param h - Actual holder. @returns Nothing. */
  function observe(n: number, h: UnoInterfaceReference): void {
    x.emit(10, n, ident(h.get()), h.is(), a.count, b.count);
    expect(h.get()).toBe(h.m_pUnoI);
  }
  return {
    ...x,
    Holder,
    SAL_NO_ACQUIRE,
    a,
    b,
    ident,
    observe,
    /** Selects the actual field observed during native callbacks. @param h - Borrowed holder. @returns Nothing. */
    watching(h: UnoInterfaceReference | null) {
      watch = h;
    },
  };
}
describe("original UnoInterfaceReference", /** Groups complete original process proofs. @returns Nothing. */ () => {
  it("matches complete original ownership and pointer publication stream", /** Replays the whole original initialized stream. @returns Completed proof. */ async () => {
    const x = await context("ownership"),
      { Holder: H, a, b, emit, observe, SAL_NO_ACQUIRE: tag } = x;
    const empty = new H();
    observe(0, empty);
    const copyEmpty = new H(empty);
    observe(1, copyEmpty);
    copyEmpty.dispose();
    const h = new H(a);
    x.watching(h);
    observe(2, h);
    emit(h.set(b) === h);
    observe(3, h);
    h.set(b);
    observe(4, h);
    h.set(null);
    observe(5, h);
    h.set(null);
    observe(6, h);
    a.acquire(a);
    h.set(a, tag);
    observe(7, h);
    b.acquire(b);
    emit(h.set(b, tag) === h);
    observe(8, h);
    h.set(null, tag);
    observe(9, h);
    h.clear();
    observe(10, h);
    h.set(a);
    observe(11, h);
    h.clear();
    observe(12, h);
    h.set(a);
    const c = new H(h);
    observe(13, c);
    emit(c.operatorAssign(h) === c);
    observe(14, c);
    emit(c.operatorAssign(b) === c);
    observe(15, c);
    c.dispose();
    observe(16, h);
    emit(h.operatorAssign(h) === h);
    observe(17, h);
    h.operatorAssign(a);
    observe(18, h);
    h.dispose();
    x.watching(null);
    a.acquire(a);
    const adopted = new H(a, tag);
    x.watching(adopted);
    observe(19, adopted);
    adopted.dispose();
    x.watching(null);
    const nullAdopted = new H(null, tag);
    observe(20, nullAdopted);
    nullAdopted.dispose();
    empty.dispose();
    emit(90, a.count, b.count);
    x.finish();
  });
  it("matches complete original move and self move stream", /** Replays the whole original initialized stream. @returns Completed proof. */ async () => {
    const x = await context("moves"),
      { Holder: H, a, b, emit, observe } = x;
    const source = new H(a);
    x.watching(source);
    const moved = H.move(source);
    observe(0, source);
    observe(1, moved);
    const dest = new H(b);
    x.watching(dest);
    emit(dest.operatorAssignMove(moved) === dest);
    observe(2, dest);
    observe(3, moved);
    emit(dest.operatorAssignMove(dest) === dest);
    observe(4, dest);
    const empty = H.move(source);
    observe(5, empty);
    dest.operatorAssignMove(empty);
    observe(6, dest);
    observe(7, empty);
    x.watching(null);
    emit(90, a.count, b.count);
    empty.dispose();
    dest.dispose();
    moved.dispose();
    source.dispose();
    x.finish();
  });
  it("matches complete original borrowed dispatch address stream", /** Replays the whole original initialized stream. @returns Completed proof. */ async () => {
    const x = await context("dispatch"),
      { Holder: H, a, b, emit } = x;
    x.f.typelib_static_type_getByTypeClass(C.INTERFACE);
    const name = x.name("com.sun.star.uno.XInterface::queryInterface"),
      member: [D | null] = [null];
    x.f.typelib_typedescription_getByName(member, name.pData);
    const result = [0],
      argument = [0],
      args = [argument],
      mem: uno_Any = { pType: null, pData: null, pReserved: null },
      exception: [uno_Any | null] = [mem];
    let returned: number[] | null = result,
      argumentsValue: unknown[] | null = args;
    a.pDispatcher =
      /** Observes and updates actual caller addresses only. @param p - Interface pointer. @param d - Borrowed member. @param r - Return address. @param argumentsPointer - Borrowed arguments. @param exc - Inout exception cell. @returns Nothing. */ (
        p,
        d,
        r,
        argumentsPointer,
        exc,
      ) => {
        emit(
          3,
          x.ident(p),
          d === member[0],
          r === returned,
          argumentsPointer === argumentsValue,
          exc === exception,
          exc[0] === null,
        );
        expect(p).toBe(a);
        expect(d).toBe(member[0]);
        expect(r).toBe(returned);
        expect(argumentsPointer).toBe(argumentsValue);
        expect(exc).toBe(exception);
        if (r !== null) (r as number[])[0] = 71;
        if (argumentsPointer !== null) (argumentsPointer[0] as number[])[0] = 72;
        exc[0] = null;
      };
    const h = new H(a);
    x.watching(h);
    h.dispatch(member[0] as D, result, args, exception);
    emit(11, result[0] as number, argument[0] as number, exception[0] === null);
    returned = null;
    argumentsValue = null;
    exception[0] = null;
    h.dispatch(member[0] as D, null, null, exception);
    emit(12, exception[0] === null);
    h.dispose();
    x.watching(null);
    x.f.typelib_typedescription_release(member[0] as D);
    name.dispose();
    emit(90, a.count, b.count);
    x.finish();
  });
});
