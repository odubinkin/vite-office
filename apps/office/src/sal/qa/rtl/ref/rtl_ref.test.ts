/** @fileoverview Original rtl_ref::TestReferenceRefCounting::testMove body and additional real intrusive-owner lifetime/order checks; no UNO/provider service fixture is manufactured. */
import { expect, it } from "vitest";
import { Reference } from "../../../inc/rtl/ref";
import { SAL_NO_ACQUIRE } from "../../../inc/types";
import { SimpleReferenceObject } from "../../../../salhelper/source/simplereferenceobject";
/** Original source test class deliberately accepts only explicitly flagged acquisitions. */
class MoveTestClass {
  private m_bIncFlag = false;
  private m_nRef = 0;
  /** Original guarded count increment. @returns Nothing. */
  acquire(): void {
    expect(this.m_bIncFlag, "RC was incremented when it should not have been").toBe(true);
    ++this.m_nRef;
    this.m_bIncFlag = false;
  }
  /** Original count decrement, without stack-object deletion. @returns Nothing. */
  release(): void {
    --this.m_nRef;
  }
  /** Original observer. @returns Actual count. */
  use_count(): number {
    return this.m_nRef;
  }
  /** Original next-acquisition flag. @returns Nothing. */
  set_inc_flag(): void {
    this.m_bIncFlag = true;
  }
}
/** Original source returned handle, with no extra acquisition for returning the local value. @param object - Actual source fixture. @returns Owned handle. */
function get_reference(object: MoveTestClass): Reference<MoveTestClass> {
  object.set_inc_flag();
  return new Reference(object);
}
it("ports rtl_ref::TestReferenceRefCounting::testMove", /** All original assertions and source call ordering are retained. @returns Nothing. */ () => {
  const object = new MoveTestClass();
  object.set_inc_flag();
  const test1 = new Reference(object),
    test2 = Reference.move(test1);
  try {
    expect(test2.operatorArrow().use_count()).toBe(1);
    expect(test1.is()).toBe(false);
    const returned = get_reference(object);
    try {
      test2.moveAssign(returned);
    } finally {
      returned.dispose();
    }
    expect(test2.operatorArrow().use_count()).toBe(1);
    test2.operatorArrow().set_inc_flag();
    test1.assign(test2);
    expect(test2.operatorArrow().use_count()).toBe(2);
    const empty = new Reference<MoveTestClass>();
    try {
      test2.moveAssign(empty);
    } finally {
      empty.dispose();
    }
    expect(test1.operatorArrow().use_count()).toBe(1);
    test1.moveAssign(test2);
    expect(test1.is()).toBe(false);
    expect(test2.is()).toBe(false);
    expect(object.use_count()).toBe(0);
  } finally {
    test2.dispose();
    test1.dispose();
  }
});
/** Actual SimpleReferenceObject-derived body records its logical destruction. */
class Body extends SimpleReferenceObject {
  /** Borrows test observation storage. @param events - Destruction observer. @returns Actual body. */
  constructor(private readonly events: string[]) {
    super();
  }
  /** Original derived/base destruction. @returns Nothing. */
  protected override destroy(): void {
    this.events.push("destroy");
    super.destroy();
  }
}
it("retains copy, no-acquire adoption, self assignment and transfer ownership", /** Native acquisitions remain on the actual body. @returns Nothing. */ () => {
  const events: string[] = [],
    body = new Body(events),
    first = new Reference(body),
    copy = new Reference(first);
  body.acquire();
  const adopted = new Reference(body, SAL_NO_ACQUIRE),
    empty = new Reference<Body>();
  try {
    expect(first.get()).toBe(body);
    expect(first.operatorStar()).toBe(body);
    expect(first.operatorEquals(body)).toBe(true);
    expect(first.operatorEquals(copy)).toBe(true);
    expect(first.operatorNotEquals(empty)).toBe(true);
    expect(empty.operatorEquals(null)).toBe(true);
    first.assign(first);
    copy.set(body);
    expect(copy.clear()).toBe(copy);
    copy.clear();
    first.clear();
    expect(events).toEqual([]);
    adopted.moveAssign(adopted);
    expect(adopted.is()).toBe(false);
    expect(events).toEqual(["destroy"]);
  } finally {
    empty.dispose();
    adopted.dispose();
    copy.dispose();
    first.dispose();
  }
});
