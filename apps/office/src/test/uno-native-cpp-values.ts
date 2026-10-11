/** @fileoverview Pure native C++ virtual caller witnesses reuse actual public Any/Reference/RuntimeException owners and existing complete field/count observations; no type/value/query provider replaces a library body. */
import { createUnoNativeInputs } from "./uno-native-values";
import type { UnoNativeCapture } from "./uno-native-values";
import { typelib_TypeClass as C } from "../cppu/inc/typelib/typeclass";
import type { XInterface } from "../cppu/inc/com/sun/star/uno/XInterface";
import type { Type } from "../cppu/inc/com/sun/star/uno/Type";
/** Actual authored native C++ caller state, separate from binary UNO callback layout. */
export interface UnoNativeCppWitness extends XInterface {
  /** Caller label. */
  id: number;
  /** Caller live count. */
  count: number;
  /** Caller query variant. */
  mode: number;
  /** Caller supplied query result. */
  root: UnoNativeCppWitness | null;
}
/** Loads complete shared observations and actual public ownership classes, then supplies only native caller virtual methods. @param capture - Whole original mode. @returns Actual runtime owners and observations. */
export async function createUnoNativeCppInputs(capture: UnoNativeCapture) {
  const x = await createUnoNativeInputs(capture, true),
    { Any, getCppuType } = await import("../cppu/inc/com/sun/star/uno/Any"),
    genfunc = await import("../cppu/inc/com/sun/star/uno/genfunc"),
    { Reference } = await import("../cppu/inc/com/sun/star/uno/Reference"),
    { RuntimeException, cppu_detail_getUnoType: runtimeType } =
      await import("../cppu/inc/com/sun/star/uno/RuntimeException"),
    { Type } = await import("../cppu/inc/com/sun/star/uno/Type"),
    unotype = await import("../cppu/inc/unotype");
  /** Actual caller object only: virtual calls record supplied pointer/count/type and return real Any values. @param id - Original label. @returns Caller virtual object. */
  function witness(id: number): UnoNativeCppWitness {
    const w: UnoNativeCppWitness = {
      id,
      count: 10000,
      mode: 0,
      root: null,
      /** Original caller acquire event. @returns Nothing. */
      acquire(): void {
        x.emit(1, w.id, ++w.count);
      },
      /** Original caller release event. @returns Nothing. */
      release(): void {
        x.emit(2, w.id, --w.count);
      },
      /** Native authored query witness, never a replacement for genfunc query. @param type - Actual borrowed type view. @returns Actual owned Any. */
      queryInterface(type: Type): InstanceType<typeof Any> {
        x.emit(4, w.id, w.mode);
        x.ref(type.getTypeLibType());
        if (w.mode === 0) return new Any([w.root], x.type(C.INTERFACE));
        if (w.mode === 1) return new Any();
        if (w.mode === 2) {
          const held = x.name("other");
          try {
            return new Any([held.pData], "OUString");
          } finally {
            held.dispose();
          }
        }
        if (w.mode === 3) {
          const held = x.name("query"),
            context = new Reference(w.root);
          try {
            throw new RuntimeException(held, context);
          } finally {
            context.dispose();
            held.dispose();
          }
        }
        throw Error("caller"); // Actual caller's non-RuntimeException signal, not a library error adaptation.
      },
    };
    return w;
  }
  return {
    ...x,
    Any,
    Reference,
    RuntimeException,
    runtimeType,
    Type,
    unotype,
    getCppuType,
    genfunc,
    witness,
  };
}
