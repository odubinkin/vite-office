/** @fileoverview Complete actual original SvRef ownership streams and live31-bit boundary, replayed through the single ported owner without private state mutation or post-lifetime object inspection. */
import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import fixture from "./native-ref-cases.json";
import { SvRef, SvRefBase, make_ref } from "./ref";

/** Replays a whole concrete native caller mode. @param mode - Full original capture. @returns Observed trace. */
function replay(mode: keyof typeof fixture.captures): number[] {
  const observations: number[] = [];
  let watch: SvRef<Probe> | null = null;
  /** Records complete initialized native observations. @param values - Original observations. @returns Nothing. */
  function emit(...values: (number | boolean)[]): void {
    observations.push(...values.map(Number));
  }
  /** Actual concrete native caller, with externally observed virtual destruction. */
  class Probe extends SvRefBase {
    readonly id: number;
    /** Original concrete default/member or copy constructor. @param value - Member value or original source. @returns Caller. */
    constructor(value: number | Probe) {
      super(typeof value === "number" ? undefined : value);
      this.id = typeof value === "number" ? value : value.id + 100;
      emit(10, this.id, this.GetRefCount());
    }
    /** Observes the real callback while the object is still in its derived destructor, before base-member lifetime ends. @returns Nothing. */
    protected override destroy(): void {
      emit(90, this.id, this.GetRefCount(), watch !== null && watch.get() === this);
      super.destroy();
    }
    /** Erases original automatic destruction for the caller's stack value; never inspects the object after this call. @returns Nothing. */
    endScope(): void {
      this.destroy();
    }
  }
  switch (mode) {
    case "lifecycle": {
      const object = new Probe(1);
      emit(20, object.GetRefCount());
      const p = new SvRef(object);
      watch = p;
      emit(21, object.GetRefCount());
      const q = new SvRef(p),
        r = new SvRef(object);
      emit(
        22,
        object.GetRefCount(),
        p.is(),
        p.operatorBool(),
        p.get() === object,
        p.operatorDereference() === object,
        p.operatorArrow() === object,
        p.operatorEquals(q),
        p.operatorNotEquals(q),
      );
      q.assign(q);
      emit(23, object.GetRefCount());
      r.clear();
      emit(24, object.GetRefCount());
      r.dispose();
      q.dispose();
      emit(25, object.GetRefCount());
      p.clear();
      emit(26, p.is());
      watch = null;
      const empty = new SvRef<Probe>(),
        copy = new SvRef(empty),
        moved = SvRef.move(copy);
      emit(27, empty.is(), copy.is(), moved.is(), empty.operatorEquals(moved));
      empty.assign(copy);
      empty.assign(null);
      copy.moveAssign(moved);
      moved.dispose();
      copy.dispose();
      empty.dispose();
      p.dispose();
      break;
    }
    case "assignments": {
      {
        const p = new SvRef(new Probe(2)),
          q = new SvRef(new Probe(3));
        watch = p;
        p.moveAssign(q);
        emit(30, p.operatorArrow().id, p.operatorArrow().GetRefCount(), q.is());
        q.assign(p);
        emit(31, p.operatorArrow().GetRefCount());
        q.moveAssign(q);
        emit(32, p.operatorArrow().GetRefCount(), q.is());
        p.assign(p);
        emit(33, p.operatorArrow().GetRefCount());
        p.assign(new Probe(4));
        emit(34, p.operatorArrow().GetRefCount());
        p.assign(null);
        emit(35, p.is());
        const temporary = make_ref(Probe, 5);
        p.moveAssign(temporary);
        temporary.dispose();
        emit(36, p.operatorArrow().GetRefCount());
        q.dispose();
        p.dispose();
        watch = null;
      }
      {
        const p = new SvRef(new Probe(6)),
          q = new SvRef(new Probe(7));
        watch = p;
        p.assign(q);
        emit(37, p.operatorArrow().id, p.operatorArrow().GetRefCount());
        q.clear();
        p.clear();
        watch = null;
        q.dispose();
        p.dispose();
      }
      {
        const source = new SvRef(new Probe(8)),
          moved = SvRef.move(source);
        watch = moved;
        emit(38, source.is(), moved.operatorArrow().GetRefCount());
        moved.clear();
        watch = null;
        moved.dispose();
        source.dispose();
      }
      break;
    }
    case "base": {
      const source = new SvRef(new Probe(9)),
        copy = new Probe(source.operatorDereference());
      emit(42, copy.GetRefCount());
      emit(43, copy.assign(source.operatorDereference()) === copy, copy.GetRefCount());
      copy.AddNextRef();
      copy.ReleaseRef();
      emit(44, copy.GetRefCount());
      copy.endScope();
      const object = new Probe(10);
      object.AddNextRef();
      emit(40, object.GetRefCount());
      object.ReleaseRef();
      emit(41, object.GetRefCount());
      const plain = new SvRef(new SvRefBase());
      emit(45, plain.operatorArrow().GetRefCount());
      plain.clear();
      plain.dispose();
      object.endScope();
      source.dispose();
      break;
    }
    case "boundary": {
      const object = new Probe(11);
      // Every count is reached through the real public increment, without a forged allocator/count/state setter.
      for (let i = 0; i < 1 << 30; ++i) object.AddNextRef();
      emit(50, object.GetRefCount());
      // The object is still alive and no-delete is still1. These source assertion checks do not read deleted storage.
      expect(
        /** Calls the actual live boundary precondition. @returns Nothing. */ () =>
          object.AddNextRef(),
      ).toThrow("Do not add refs to dead objects");
      expect(
        /** Checks the same live precondition before AddFirstRef changes no-delete. @returns Nothing. */ () =>
          object.AddFirstRef(),
      ).toThrow("Do not add refs to dead objects");
      for (let i = 0; i < 1 << 30; ++i) object.ReleaseRef();
      emit(51, object.GetRefCount());
      object.endScope();
      break;
    }
  }
  return observations;
}

it.each(["lifecycle", "assignments", "base", "boundary"] as const)(
  "matches the entire original normal and sanitized SvRef %s trace",
  /** Compares all initialized values and the complete native stdout digest. @param mode - Original caller mode. @returns Nothing. */ (
    mode,
  ) => {
    const actual = replay(mode),
      capture = fixture.captures[mode];
    expect(actual).toEqual(capture.observations);
    expect(
      createHash("sha256")
        .update(actual.join("\n") + "\n")
        .digest("hex"),
    ).toBe(capture.digest);
  },
  180000,
);

it("retains null access and live zero-count source assertions", /** Native abort diagnostics bind to host errors; process/ABI equivalence is not claimed. @returns Nothing. */ () => {
  const empty = new SvRef<SvRefBase>(),
    base = new SvRefBase();
  expect(
    /** Calls original asserted arrow access. @returns Borrowed object. */ () =>
      empty.operatorArrow(),
  ).toThrow("assert(pObj != nullptr)");
  expect(
    /** Calls original asserted dereference. @returns Borrowed object. */ () =>
      empty.operatorDereference(),
  ).toThrow("assert(pObj != nullptr)");
  expect(
    /** Invokes release on a live unacquired object. @returns Nothing. */ () => base.ReleaseRef(),
  ).toThrow("assert(nRefCount >= 1)");
  expect(base.GetRefCount()).toBe(0);
  base.AddFirstRef();
  base.ReleaseRef();
  empty.clear();
  empty.clear();
  empty.dispose();
});

it("keeps distinct pointer equality and full make_ref argument forwarding", /** Checks the template convenience constructor against a concrete native caller. @returns Nothing. */ () => {
  /** Concrete constructor has multiple forwarded source arguments. */
  class Pair extends SvRefBase {
    /** Actual caller fields. @param first - First value. @param second - Second value. @returns Caller. */
    constructor(
      readonly first: number,
      readonly second: string,
    ) {
      super();
    }
  }
  const a = make_ref(Pair, 42, "Ж😀"),
    b = make_ref(Pair, 42, "Ж😀");
  expect(a.operatorArrow().first).toBe(42);
  expect(a.operatorArrow().second).toBe("Ж😀");
  expect(a.operatorEquals(b)).toBe(false);
  expect(a.operatorNotEquals(b)).toBe(true);
  a.dispose();
  b.dispose();
});
