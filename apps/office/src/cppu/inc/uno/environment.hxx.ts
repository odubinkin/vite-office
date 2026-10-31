/** @fileoverview Original public Environment resolved-pointer/value ownership and accessors from environment.hxx. Descriptor/current lookup and invocation-stack methods remain separate; no environment provider is supplied. */
import type { uno_Environment } from "./environment";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { rtl_uString } from "../../../sal/inc/rtl/ustring.h";

/** Original public C++ wrapper owns exactly one C environment pointer. Only the source's already-resolved pointer/default/copy/move family is bound here. */
export class Environment {
  private _pEnv: uno_Environment | null;
  /** Original pointer/default and copying constructors acquire a set environment. @param source - Borrowed environment pointer or value. @returns Owned wrapper. */
  constructor(source: uno_Environment | Environment | null = null) {
    this._pEnv = source instanceof Environment ? source._pEnv : source;
    if (this._pEnv) (this._pEnv.acquire as NonNullable<uno_Environment["acquire"]>)(this._pEnv);
  }
  /** Original internal move constructor transfers the pointer without acquiring. @param other - Original rvalue. @returns Transferred owner. */
  static move(other: Environment): Environment {
    const result = Object.create(Environment.prototype) as Environment;
    result._pEnv = other._pEnv;
    other._pEnv = null;
    return result;
  }
  /** Original destructor releases while retaining the published pointer. @returns Nothing. */
  dispose(): void {
    if (this._pEnv) (this._pEnv.release as NonNullable<uno_Environment["release"]>)(this._pEnv);
  }
  /** Original pointer/copy assignment skips identical pointers; otherwise acquire, release, publish in that order. @param source - Borrowed pointer or value. @returns This same owner. */
  assign(source: uno_Environment | Environment | null): this {
    const pointer = source instanceof Environment ? source._pEnv : source;
    if (pointer !== this._pEnv) {
      if (pointer) (pointer.acquire as NonNullable<uno_Environment["acquire"]>)(pointer);
      if (this._pEnv) (this._pEnv.release as NonNullable<uno_Environment["release"]>)(this._pEnv);
      this._pEnv = pointer;
    }
    return this;
  }
  /** Original internal move assignment releases current, transfers right and clears right; self-move clears. @param other - Original rvalue. @returns This same owner. */
  moveAssign(other: Environment): this {
    if (this._pEnv) (this._pEnv.release as NonNullable<uno_Environment["release"]>)(this._pEnv);
    this._pEnv = other._pEnv;
    other._pEnv = null;
    return this;
  }
  /** Original unacquired pointer accessor. @returns Borrowed C environment or null. */
  get(): uno_Environment | null {
    return this._pEnv;
  }
  /** Original acquired type-name value. A set environment is the source precondition. @returns Owned actual descriptor. */
  getTypeName(): OUString {
    return new OUString((this._pEnv as uno_Environment).pTypeName as rtl_uString);
  }
  /** Original borrowed free context pointer, with no identity conversion or acquisition. @returns The exact source pointer. */
  getContext(): unknown {
    return (this._pEnv as uno_Environment).pContext;
  }
  /** Original pointer-presence predicate. @returns Whether set. */
  is(): boolean {
    return this._pEnv !== null;
  }
  /** Original clear releases before publishing null; repeated clear is a no-op. @returns Nothing. */
  clear(): void {
    if (this._pEnv) {
      (this._pEnv.release as NonNullable<uno_Environment["release"]>)(this._pEnv);
      this._pEnv = null;
    }
  }
}
