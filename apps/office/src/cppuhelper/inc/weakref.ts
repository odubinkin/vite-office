/** @fileoverview Original weakref.hxx declarations and complete WeakReference template wrapper. Compile-time interface binding adds no instance type metadata; lifecycle remains the single original weak.cxx helper owner. */
import { WeakReferenceHelper } from "../source/weak";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { XWeak, cppu_detail_getUnoType as weakType } from "../../cppu/inc/com/sun/star/uno/XWeak";
import { unoTypeArgumentIdentity, type UnoTypeArgument } from "../../cppu/inc/unotype";
export { WeakReferenceHelper };
/** Compiler-emitted specialization, with the native declared interface type held only on the class. */
export interface WeakReferenceConstructor {
  readonly InterfaceType: UnoTypeArgument;
  /** Original implicit copy/default and explicit hard Reference constructor. @param source - Original selected argument. @returns Original typed weak reference. */
  new (source?: Reference | WeakReferenceHelper): WeakReference;
  /** Original implicit move constructor. @param source - Rvalue. @returns Typed weak reference. */
  move(source: WeakReference): WeakReference;
}
/** Original compiler specialization identities only, never UNO/type/default/value providers. */
const specializations = new Map<unknown, WeakReferenceConstructor>();
/** Original template derives from the single helper and retains only its inherited pointer. */
export abstract class WeakReference extends WeakReferenceHelper {
  /** Erased source template binding, preserving declared interface identity without value inference. @param argument - Native interface_type declaration. @returns Original specialization constructor. */
  static specialize(argument: UnoTypeArgument): WeakReferenceConstructor {
    const identity = unoTypeArgumentIdentity(argument);
    // Original internal WeakReference<XWeak> emits duplicate assignment signatures. This is an erased compiler binding rejection, never a value/type provider or per-instance check.
    if (identity === unoTypeArgumentIdentity(weakType))
      throw new TypeError(
        "Original internal WeakReference<XWeak> has duplicate operator= overloads",
      );
    let result = specializations.get(identity);
    if (result === undefined) {
      const body = /** Original compiler-emitted template class. */ class extends WeakReference {};
      Object.defineProperty(body, "InterfaceType", { value: argument });
      result = body as unknown as WeakReferenceConstructor;
      specializations.set(identity, result);
    }
    return result;
  }
  /** Original default/implicit copy and typed hard-reference constructor. Reference<T> converts to a borrowed const Reference<XInterface>& view of the same pointer cell, without another acquire or temporary owner. @param source - Original selected argument. @returns Original typed weak reference. */
  constructor(source?: Reference | WeakReferenceHelper) {
    if (source === undefined) super();
    else super(source);
  }
  /** Original implicit compiler move constructor invokes the actual helper move without any type initialization. @param source - Typed rvalue. @returns Transferred typed owner. */
  static override move(source: WeakReference): WeakReference {
    return super.move(source) as WeakReference;
  }
  /** Original typed Reference assignment uses the same borrowed root Reference view. The separately declared internal XWeak overload retains its direct helper selection. Native implicit helper copy assignment stays the original base body. @param source - Original right side. @param declared - Exact declared XWeak overload. @returns This typed weak reference. */
  override assign(source: WeakReferenceHelper | Reference, declared?: typeof XWeak): this {
    return super.assign(source, declared);
  }
  /** Original template conversion queries the actual declared interface from the original acquired temporary root get result. @returns Hard typed reference. */
  override operatorReference(): Reference {
    const root = this.get();
    try {
      return Reference.query(
        root,
        (this.constructor as unknown as WeakReferenceConstructor).InterfaceType,
      );
    } finally {
      root.dispose();
    }
  }
}
