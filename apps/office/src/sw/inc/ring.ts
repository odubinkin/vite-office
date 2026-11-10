/** @fileoverview Intrusive Writer Ring, RingContainer and forward iterator from sw/inc/ring.hxx. Native friendship is represented by module-internal link fields; checked assertions use the existing compiler binding. */
import { assert } from "../../sal/inc/cassert";

/** Original native intrusive link requirement; both root Ring and native multiple-inheritance roles use these same actual object links. */
export interface RingNode<T> {
  m_pNext: T;
  m_pPrev: T;
}
/** Original recursive intrusive link after TypeScript template erasure. No extra owner is allocated. */
interface RingLink {
  m_pNext: RingLink;
  m_pPrev: RingLink;
}
/** Native template-facing ring operations. Internal methods retain the original friend/subclass role; public type visibility binds that role across the erased constructor interface. */
interface RingFacet<T extends RingNode<T>> extends RingNode<T> {
  InitRing(ring?: T): void;
  unlink(): void;
  MoveTo(destination?: T): void;
  GetRingContainer(): RingContainer<T>;
  GetNextInRing(): T;
  GetPrevInRing(): T;
  unique(): boolean;
}
/** Erased constructor constraint for original native multiple inheritance. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Native role binding requires arbitrary primary-base constructor arguments; this type emits no runtime code.
type RingBase = new (...args: any[]) => object;
/** C++ Ring template applied to an actual primary base; TypeScript cannot express a generic mixin constructor directly. This erased constructor contract preserves both original subobjects on one identity. */
type RingConstructor<TBase extends RingBase> = {
  new <T extends RingNode<T>>(
    ...args: ConstructorParameters<TBase>
  ): InstanceType<TBase> & RingFacet<T>;
};
/** Binds one original Ring subobject to an existing native primary base without a wrapper identity or copied links. @param Base - Actual primary base. @returns Native ring role. */
export function withRing<TBase extends RingBase>(Base: TBase): RingConstructor<TBase> {
  /** Original intrusive ring algorithms operate only on actual link fields, independent of the erased native template argument. */
  class RingRole extends Base {
    public m_pNext: RingLink = this;
    public m_pPrev: RingLink = this;
    /** Original insert-before initialization. @internal @param ring - Actual destination. @returns Nothing. */
    public InitRing(ring?: RingLink): void {
      if (ring !== undefined) this.linkBefore(ring);
    }
    /** Original unlink resets this same owner to a singleton. @returns Nothing. */
    public unlink(): void {
      this.m_pPrev.m_pNext = this.m_pNext;
      this.m_pNext.m_pPrev = this.m_pPrev;
      this.m_pNext = this;
      this.m_pPrev = this;
    }
    /** Original move unlinks before optional insertion, including self movement. @param destination - Actual destination. @returns Nothing. */
    public MoveTo(destination?: RingLink): void {
      this.unlink();
      if (destination !== undefined) this.linkBefore(destination);
    }
    /** Original live container borrows this owner. @returns Native container. */
    public GetRingContainer(): RingContainer<RingLink> {
      return new RingContainer<RingLink>(this);
    }
    /** Original next member. @internal @returns Actual next owner. */
    public GetNextInRing(): RingLink {
      return this.m_pNext;
    }
    /** Original previous member. @internal @returns Actual previous owner. */
    public GetPrevInRing(): RingLink {
      return this.m_pPrev;
    }
    /** Original singleton predicate. @internal @returns Whether alone. */
    public unique(): boolean {
      return this.m_pNext === this;
    }
    /** Original four insert-before link assignments. @param destination - Existing member. @returns Nothing. */
    private linkBefore(destination: RingLink): void {
      this.m_pPrev = destination.m_pPrev;
      this.m_pNext = destination;
      destination.m_pPrev.m_pNext = this;
      destination.m_pPrev = this;
    }
  }
  // Only the native template/primary-base type intersection is erased here.
  // Runtime fields and every operation stay on the actual derived owner.
  return RingRole as unknown as RingConstructor<TBase>;
}
/** Native standalone primary-base binding. */
const StandaloneRing = withRing(Object);
/** Original standalone Ring wrapper initializes only its actual intrusive subobject. */
export class Ring<T extends RingNode<T>> extends StandaloneRing<T> {
  /** Original optional insert-before constructor. @param ring - Existing member. @returns Native ring owner. */
  constructor(ring?: T) {
    super();
    this.InitRing(ring);
  }
}

/** Native forward iterator: null current is begin, start current is end. */
export class RingIterator<T extends RingNode<T>> {
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
export class RingContainer<T extends RingNode<T>> implements Iterable<T> {
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
