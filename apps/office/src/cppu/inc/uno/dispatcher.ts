/** @fileoverview Original binary UNO interface/dispatch record and complete dispatcher.hxx holder; pointer publication and callback ownership follow their own source bodies. */
import type { __sal_NoAcquire } from "../../../sal/inc/types";
import type { typelib_TypeDescription } from "../typelib/typedescription";
import type { uno_Any } from "./any2";
/** Original dispatch callback including inout exception pointer; opaque argument pointers are not copied. */
export type uno_DispatchMethod = (
  pUnoI: _uno_Interface,
  pMemberType: Readonly<typelib_TypeDescription>,
  pReturn: unknown,
  pArgs: unknown[] | null,
  ppException: [uno_Any | null],
) => void;
/** Original callback-slot C interface record. Null callbacks can be declared but have no valid invocation contract. */
export interface _uno_Interface {
  /** Original acquisition function pointer. */
  acquire: ((pInterface: _uno_Interface) => void) | null;
  /** Original release function pointer. */
  release: ((pInterface: _uno_Interface) => void) | null;
  /** Original dispatcher function pointer. */
  pDispatcher: uno_DispatchMethod | null;
}
/** Original public typedef. */
export type uno_Interface = _uno_Interface;
/** Original C++ holder for the binary C interface. Explicit dispose represents its destructor, independently of the C++ Reference owner. */
export class UnoInterfaceReference {
  /** Original public borrowed pointer field. */
  m_pUnoI: uno_Interface | null;
  /** Original default, pointer/no-acquire and copy constructors. @param value - Original selected source pointer or reference. @param tag - Original no-acquire overload tag. @returns Initialized original holder. */
  constructor(value: uno_Interface | UnoInterfaceReference | null = null, tag?: __sal_NoAcquire) {
    this.m_pUnoI = value instanceof UnoInterfaceReference ? value.m_pUnoI : value;
    if (tag === undefined && this.m_pUnoI !== null)
      (this.m_pUnoI.acquire as NonNullable<uno_Interface["acquire"]>)(this.m_pUnoI);
  }
  /** Original internal move constructor transfers the pointer without acquisition. @param other - Rvalue source. @returns New holder. */
  static move(other: UnoInterfaceReference): UnoInterfaceReference {
    const result = Object.create(UnoInterfaceReference.prototype) as UnoInterfaceReference;
    result.m_pUnoI = other.m_pUnoI;
    other.m_pUnoI = null;
    return result;
  }
  /** Original destructor leaves its field intact during release. @returns Nothing. */
  dispose(): void {
    if (this.m_pUnoI !== null)
      (this.m_pUnoI.release as NonNullable<uno_Interface["release"]>)(this.m_pUnoI);
  }
  /** Original non-null predicate. @returns Whether an interface is held. */
  is(): boolean {
    return this.m_pUnoI !== null;
  }
  /** Original borrowed pointer read, without acquisition. @returns Original interface pointer. */
  get(): uno_Interface | null {
    return this.m_pUnoI;
  }
  /** Original set acquires the incoming pointer first, then releases the previous pointer before publishing the new field. @param pUnoI - Original incoming pointer. @param tag - Original no-acquire overload tag. @returns This holder. */
  set(pUnoI: uno_Interface | null, tag?: __sal_NoAcquire): this {
    if (tag === undefined && pUnoI !== null)
      (pUnoI.acquire as NonNullable<uno_Interface["acquire"]>)(pUnoI);
    if (this.m_pUnoI !== null)
      (this.m_pUnoI.release as NonNullable<uno_Interface["release"]>)(this.m_pUnoI);
    this.m_pUnoI = pUnoI;
    return this;
  }
  /** Original pointer/reference assignments call the same set body. @param value - Original assignment source. @returns This holder. */
  operatorAssign(value: UnoInterfaceReference | uno_Interface | null): this {
    return this.set(value instanceof UnoInterfaceReference ? value.m_pUnoI : value);
  }
  /** Original internal move assignment releases the old pointer before reading the source and clearing it, including self move. @param other - Rvalue source. @returns This holder. */
  operatorAssignMove(other: UnoInterfaceReference): this {
    if (this.m_pUnoI !== null)
      (this.m_pUnoI.release as NonNullable<uno_Interface["release"]>)(this.m_pUnoI);
    this.m_pUnoI = other.m_pUnoI;
    other.m_pUnoI = null;
    return this;
  }
  /** Original clear publishes null after its release callback. @returns Nothing. */
  clear(): void {
    if (this.m_pUnoI !== null) {
      (this.m_pUnoI.release as NonNullable<uno_Interface["release"]>)(this.m_pUnoI);
      this.m_pUnoI = null;
    }
  }
  /** Original dispatch forwards borrowed argument addresses and the actual inout exception cell unchanged. @param pMemberType - Borrowed member description. @param pReturn - Caller return address or null. @param pArgs - Borrowed argument addresses or null. @param ppException - Actual inout exception address. @returns Nothing. */
  dispatch(
    pMemberType: Readonly<typelib_TypeDescription>,
    pReturn: unknown,
    pArgs: unknown[] | null,
    ppException: [uno_Any | null],
  ): void {
    const pointer = this.m_pUnoI as uno_Interface;
    (pointer.pDispatcher as uno_DispatchMethod)(pointer, pMemberType, pReturn, pArgs, ppException);
  }
}
