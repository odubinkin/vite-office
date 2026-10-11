/** @fileoverview Original XInterface.idl/cppumaker three-virtual-method contract; structural declaration supplies no interface implementation, provider or identity conversion. */
import type { Type } from "./Type";
import type { Any } from "./Any";
/** Actual generated root interface contract; native virtual/ABI dispatch becomes the supplied object's own methods. */
export interface XInterface {
  /** Original query returns an owned Any value, with no conversion/provider implementation here. @param aType - Borrowed demanded type. @returns Original caller-owned result. */
  queryInterface(aType: Type): Any;
  /** Original virtual reference acquisition. @returns Nothing. */
  acquire(): void;
  /** Original virtual reference release. @returns Nothing. */
  release(): void;
}
