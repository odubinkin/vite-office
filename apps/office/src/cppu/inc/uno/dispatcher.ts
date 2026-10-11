/** @fileoverview Original binary UNO interface/dispatch declarations; callback records do not instantiate a generated interface provider. */
import type { typelib_TypeDescription } from "../typelib/typedescription";
import type { uno_Any } from "./any2";
/** Original dispatch callback including inout exception pointer; opaque argument pointers are not copied. */
export type uno_DispatchMethod = (
  pUnoI: _uno_Interface,
  pMemberType: Readonly<typelib_TypeDescription>,
  pReturn: unknown,
  pArgs: unknown[],
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
