/** @fileoverview Intrusive Writer Ring, RingContainer and forward iterator from sw/inc/ring.hxx. Native friendship is represented by module-internal link fields; checked assertions use the existing compiler binding. */
import { assert } from "../../sal/inc/cassert";

/** A node always belongs to a circular, doubly linked ring, including a singleton. */
export class Ring<T extends Ring<T>> {
  /** @internal Link shared with the native friend container and iterator. */
  public m_pNext: T;
  /** @internal Link shared with the native friend container and iterator. */
  public m_pPrev: T;

  /** Inserts immediately before an optional existing member. @param ring - Destination member. @returns Nothing. */
  public constructor(ring?: T) {
    this.m_pNext = this as unknown as T;
    this.m_pPrev = this as unknown as T;
    if (ring !== undefined) this.linkBefore(ring);
  }
  /** Removes this node and resets both links, as the native unlink wrapper requires. @returns Nothing. */
  public unlink(): void {
    this.m_pPrev.m_pNext = this.m_pNext;
    this.m_pNext.m_pPrev = this.m_pPrev;
    this.m_pNext = this as unknown as T;
    this.m_pPrev = this as unknown as T;
  }
  /** Moves just this member immediately before the destination, including itself. @param destination - Destination or a new singleton. @returns Nothing. */
  public MoveTo(destination?: T): void {
    this.unlink();
    if (destination !== undefined) this.linkBefore(destination);
  }
  /** Returns a live container starting at this member. @returns Native ring container. */
  public GetRingContainer(): RingContainer<T> {
    return new RingContainer(this as unknown as T);
  }
  /** Returns the next member. @returns Linked member. */
  protected GetNextInRing(): T {
    return this.m_pNext;
  }
  /** Returns the previous member. @returns Linked member. */
  protected GetPrevInRing(): T {
    return this.m_pPrev;
  }
  /** Reports native singleton state. @returns Whether next points to this member. */
  protected unique(): boolean {
    return this.m_pNext === (this as unknown as T);
  }
  /** Expands boost's native link_before into its four link assignments. @param destination - Existing member. @returns Nothing. */
  private linkBefore(destination: T): void {
    this.m_pPrev = destination.m_pPrev;
    this.m_pNext = destination;
    destination.m_pPrev.m_pNext = this as unknown as T;
    destination.m_pPrev = this as unknown as T;
  }
}

/** Native forward iterator: null current is begin, start current is end. */
export class RingIterator<T extends Ring<T>> {
  private m_pCurrent: T | undefined;
  /** Initializes a native iterator, including the default empty sentinel. @param m_pStart - Iteration origin. @param start - Begin rather than end. @returns Nothing. */
  public constructor(
    private readonly m_pStart?: T,
    start = true,
  ) {
    this.m_pCurrent = start ? undefined : m_pStart;
  }
  /** Implements native prefix increment. @returns Nothing. */
  public increment(): void {
    this.m_pCurrent = ((this.m_pCurrent ?? this.m_pStart) as T).m_pNext;
  }
  /** Compares native current sentinels with the original common-origin assertion. @param other - Iterator with the same origin. @returns Equality. */
  public equal(other: RingIterator<T>): boolean {
    assert(this.m_pStart === other.m_pStart, "m_pStart == other.m_pStart");
    return this.m_pCurrent === other.m_pCurrent;
  }
  /** Dereferences a valid native iterator; end/default dereference retains its native precondition. @returns Current member. */
  public dereference(): T {
    return (this.m_pCurrent ?? this.m_pStart) as T;
  }
}

/** Live STL-style container; JavaScript iteration adapts native begin/end/increment. */
export class RingContainer<T extends Ring<T>> implements Iterable<T> {
  /** Retains the starting node rather than copying members. @param m_pStart - Container origin. @returns Nothing. */
  public constructor(private readonly m_pStart: T) {}
  /** Returns the native begin sentinel. @returns Forward iterator. */
  public begin(): RingIterator<T> {
    return new RingIterator(this.m_pStart);
  }
  /** Returns the native end sentinel. @returns Forward iterator. */
  public end(): RingIterator<T> {
    return new RingIterator(this.m_pStart, false);
  }
  /** Measures native iterator distance. @returns Number of members. */
  public size(): number {
    let result = 0;
    for (
      const iterator = this.begin(), end = this.end();
      !iterator.equal(end);
      iterator.increment()
    )
      result++;
    return result;
  }
  /** Inserts this ring before the destination using the original two swaps and adjacency assertions. @param destination - Destination container. @returns Nothing. */
  public merge(destination: RingContainer<T>): void {
    const source = this.m_pStart,
      target = destination.m_pStart;
    assert(source.m_pPrev !== target, "m_pStart->m_pPrev != aDestRing.m_pStart");
    assert(source !== target.m_pPrev, "m_pStart != aDestRing.m_pStart->m_pPrev");
    [source.m_pPrev.m_pNext, target.m_pPrev.m_pNext] = [
      target.m_pPrev.m_pNext,
      source.m_pPrev.m_pNext,
    ];
    [source.m_pPrev, target.m_pPrev] = [target.m_pPrev, source.m_pPrev];
  }
  /** Iterates actual members in native order, observing links when incremented. @returns JavaScript iterator over the native container. */
  public *[Symbol.iterator](): IterableIterator<T> {
    for (
      const iterator = this.begin(), end = this.end();
      !iterator.equal(end);
      iterator.increment()
    )
      yield iterator.dereference();
  }
}
