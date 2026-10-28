/** @fileoverview Original SharedObject standalone hard-reference transitions and observable pointer-copy/release callback ordering. */
import { expect, it } from "vitest";
import { SharedObject } from "./sharedobject";
it("releases the old destination before acquiring the source and preserves external owners", /** Concrete application destruction observes actual reference transitions without replacing an owner method. @returns Nothing. */ () => {
  const events: (number | string)[] = [];
  /** Original concrete value destructor records the caller-visible order. */
  class Value extends SharedObject {
    /** Retains a caller destructor callback. @param onDestroy - Concrete destruction action. @returns Value. */
    constructor(private readonly onDestroy: () => void) {
      super();
    }
    /** Original virtual destructor callback. @returns Nothing. */
    override dispose(): void {
      this.onDestroy();
    }
  }
  const source = new Value(
    /** Records final external release. @returns Nothing. */ () => {
      events.push("source destroyed");
    },
  );
  expect(source.noHardReferences()).toBe(true);
  expect(source.hasHardReferences()).toBe(false);
  source.addRef();
  expect(source.noHardReferences()).toBe(false);
  expect(source.hasHardReferences()).toBe(true);
  const old = new Value(
    /** Source must not be acquired before the old destination's destructor. @returns Nothing. */ () => {
      events.push(source.getRefCount());
    },
  );
  old.addRef();
  const pointer: [Value | null] = [old];
  SharedObject.copyPtr(source, pointer);
  expect(events).toEqual([1]);
  expect(pointer[0]).toBe(source);
  expect(source.getRefCount()).toBe(2);
  SharedObject.copyPtr(source, pointer);
  expect(source.getRefCount()).toBe(2);
  SharedObject.clearPtr(pointer);
  expect(pointer[0]).toBeNull();
  expect(source.getRefCount()).toBe(1);
  source.deleteIfZeroRefCount();
  expect(events).toEqual([1]);
  source.removeRef();
  expect(events).toEqual([1, "source destroyed"]);
  SharedObject.copyPtr(null, pointer);
  SharedObject.clearPtr(pointer);
  const unowned = new Value(
    /** Records explicit zero-reference destruction. @returns Nothing. */ () => {
      events.push("unowned destroyed");
    },
  );
  unowned.deleteIfZeroRefCount();
  expect(events).toEqual([1, "source destroyed", "unowned destroyed"]);
});

it("clears an owned destination through the original nullable copy API", /** Native copyPtr(nullptr, dest) releases the last reference before storing null. @returns Nothing. */ () => {
  const events: string[] = [];
  /** Concrete native client records its virtual destruction. */
  class Value extends SharedObject {
    /** Records actual final release. @returns Nothing. */ override dispose(): void {
      events.push("destroyed");
    }
  }
  const value = new Value();
  value.addRef();
  const pointer: [Value | null] = [value];
  SharedObject.copyPtr(null, pointer);
  expect(pointer[0]).toBeNull();
  expect(events).toEqual(["destroyed"]);
  SharedObject.copyPtr(null, pointer);
  expect(events).toEqual(["destroyed"]);
});
