/** @fileoverview Native sw/qa/core/uwriter.cxx intrusive-ring sequence and source predicate boundaries. */
import { expect, it } from "vitest";
import { Ring, RingIterator } from "./ring";

/** Exposes the same protected ring operations as original TestRing. */
class TestRing extends Ring<TestRing> {
  /** Returns next. @returns Member. */
  public GetNext(): TestRing {
    return this.GetNextInRing();
  }
  /** Returns previous. @returns Member. */
  public GetPrev(): TestRing {
    return this.GetPrevInRing();
  }
  /** Returns singleton state. @returns Native unique result. */
  public lonely(): boolean {
    return this.unique();
  }
}
it("preserves original testIntrusiveRing movement, merge order and self movement", /** Exercises the named original ring contract. @returns Nothing. */ () => {
  const rings = Array.from(
    { length: 5 },
    /** Constructs an independent singleton. @returns Native ring member. */ () => new TestRing(),
  );
  const [a, b, c, d, e] = rings as [TestRing, TestRing, TestRing, TestRing, TestRing];
  expect(a.GetRingContainer().size()).toBe(1);
  for (const ring of rings) expect(ring.lonely()).toBe(true);
  b.MoveTo(a);
  c.MoveTo(a);
  e.MoveTo(d);
  expect([...a.GetRingContainer()]).toEqual([a, b, c]);
  expect(d.GetRingContainer().size()).toBe(2);
  d.GetRingContainer().merge(a.GetRingContainer());
  for (let index = 0; index < 5; index++) {
    const ring = rings[index] as TestRing;
    expect(ring.GetRingContainer().size()).toBe(5);
    expect(ring.GetNext()).toBe(rings[(index + 1) % 5]);
    expect(ring.GetNext().GetPrev()).toBe(ring);
    expect(ring.lonely()).toBe(false);
  }
  a.MoveTo(a);
  expect(a.lonely()).toBe(true);
  expect([...b.GetRingContainer()]).toEqual([b, c, d, e]);
  c.MoveTo();
  expect(c.lonely()).toBe(true);
  d.unlink();
  d.unlink();
  expect([...b.GetRingContainer()]).toEqual([b, e]);
});
it("inserts at construction and follows live links with native iterator sentinels", /** Exercises the named original ring contract. @returns Nothing. */ () => {
  const a = new TestRing(),
    b = new TestRing(a),
    container = a.GetRingContainer();
  const iterator = container.begin();
  expect(iterator.dereference()).toBe(a);
  expect(iterator.equal(container.end())).toBe(false);
  const c = new TestRing(b);
  iterator.increment();
  expect(iterator.dereference()).toBe(c);
  iterator.increment();
  expect(iterator.dereference()).toBe(b);
  iterator.increment();
  expect(iterator.equal(container.end())).toBe(true);
  expect(container.size()).toBe(3);
  expect(new RingIterator<TestRing>().equal(new RingIterator<TestRing>())).toBe(true);
  expect(
    /** Invokes the original checked predicate. @returns Native operation result. */ () =>
      container.begin().equal(b.GetRingContainer().begin()),
  ).toThrow("m_pStart == other.m_pStart");
});
it("keeps both original merge adjacency assertions", /** Exercises the named original ring contract. @returns Nothing. */ () => {
  const a = new TestRing(),
    b = new TestRing(a),
    c = new TestRing(a);
  expect(
    /** Invokes the original checked predicate. @returns Native operation result. */ () =>
      a.GetRingContainer().merge(c.GetRingContainer()),
  ).toThrow("m_pStart->m_pPrev");
  expect(
    /** Invokes the original checked predicate. @returns Native operation result. */ () =>
      a.GetRingContainer().merge(b.GetRingContainer()),
  ).toThrow("m_pStart != aDestRing");
  expect([...a.GetRingContainer()]).toEqual([a, b, c]);
});
it("preserves the source nonadjacent same-ring split despite the already-merged comment", /** Exercises the named original ring contract. @returns Nothing. */ () => {
  const a = new TestRing(),
    b = new TestRing(a),
    c = new TestRing(a),
    d = new TestRing(a);
  a.GetRingContainer().merge(c.GetRingContainer());
  expect([...a.GetRingContainer()]).toEqual([a, b]);
  expect([...c.GetRingContainer()]).toEqual([c, d]);
  expect(a.GetPrev()).toBe(b);
  expect(c.GetPrev()).toBe(d);
});
