/** @fileoverview Original internal WeakComponentImplHelperBase2/WeakComponentImplHelper2 member groups. The virtual UnoImplBase disposed flag lives on the same actual receiver; browser calls erase mutex tokens and physical C++ multiple inheritance, without a second state owner. */
import { OWeakObject } from "./weak";
import { OInterfaceContainerHelper4 } from "./interfacecontainer4";
import { WeakComponentImplHelper_query } from "../source/compbase";
import { queryInterface } from "./queryinterface";
import type { DeclaredInterface } from "./implbase";
import type { class_data } from "./implbase_ex";
import { XComponent } from "../../udkapi/com/sun/star/lang/XComponent";
import { XEventListener } from "../../udkapi/com/sun/star/lang/XEventListener";
import { XTypeProvider } from "../../udkapi/com/sun/star/lang/XTypeProvider";
import { EventObject } from "../../udkapi/com/sun/star/lang/EventObject";
import { XWeak } from "../../cppu/inc/com/sun/star/uno/XWeak";
import type { XInterface } from "../../cppu/inc/com/sun/star/uno/XInterface";
import { Reference } from "../../cppu/inc/com/sun/star/uno/Reference";
import { DisposedException } from "../../cppu/inc/com/sun/star/lang/DisposedException";
import { Type } from "../../cppu/inc/com/sun/star/uno/Type";
import { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../cppu/inc/com/sun/star/uno/Sequence";
import { OUString } from "../../sal/inc/rtl/ustring";

/** Original concrete base of component helpers. Its empty disposing hook is the actual source body, not an unported-service substitute. */
export class WeakComponentImplHelperBase2 extends OWeakObject implements XComponent {
  protected m_bDisposed: boolean;
  protected readonly maEventListeners: OInterfaceContainerHelper4<XEventListener>;
  /** Original implicit default construction; the native mutex base makes copying unavailable. @returns Actual weak/component base. */
  constructor() {
    super();
    this.m_bDisposed = false;
    this.maEventListeners = new (OInterfaceContainerHelper4.specialize<XEventListener>(
      XEventListener,
    ))();
  }
  /** Original marks disposed before the virtual hook and listener event. Throwing hooks leave the source flag set and skip later notifications. @returns Nothing. */
  dispose(): void {
    if (this.m_bDisposed) return;
    this.m_bDisposed = true;
    this.disposingComponent();
    const root = new Reference<XInterface>(this);
    let event: EventObject;
    try {
      event = new EventObject(root);
    } finally {
      root.dispose();
    }
    try {
      this.maEventListeners.disposeAndClear(event);
    } finally {
      event.dispose();
    }
  }
  /** Original protected disposing(unique_lock&) hook is empty. The host name erases that overload separately from public UNO disposing(EventObject); synchronization tokens are not manufactured. @returns Nothing. */
  protected disposingComponent(): void {}
  /** Original late registration is silently ignored, despite XComponent's callback documentation. @param listener - Actual source listener. @returns Nothing. */
  addEventListener(listener: Reference<XEventListener>): void {
    if (this.m_bDisposed) return;
    this.maEventListeners.addInterface(listener);
  }
  /** Original removal still delegates after disposal. @param listener - Actual source listener. @returns Nothing. */
  removeEventListener(listener: Reference<XEventListener>): void {
    this.maEventListeners.removeInterface(listener);
  }
  /** Original weak/component query precedes qualified OWeakObject root fallback. @param type - Demanded source type. @returns Acquired Any. */
  override queryInterface(type: Type): Any {
    const value = queryInterface(type, [
      [XWeak.static_type, this],
      [XComponent.static_type, this],
    ]);
    if (value.hasValue()) return value;
    value.dispose();
    return OWeakObject.prototype.queryInterface.call(this, type);
  }
  /** Original protected disposed check has an empty message and this object's root Context. @returns Nothing or original exception. */
  protected throwIfDisposed(): void {
    if (this.m_bDisposed) {
      const message = new OUString(),
        context = new Reference<XInterface>(this);
      try {
        throw new DisposedException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }
  /** Original empty base destructor releases its container member without implicit dispose/notification. @returns Nothing. */
  protected override destroy(): void {
    this.maEventListeners.dispose();
    super.destroy();
  }
}
/** Original template static storage, shared by all derived classes of the same exact specialization. */
interface TemplateState {
  readonly interfaces: readonly DeclaredInterface[];
  types?: Sequence<Type>;
}
/** Erased compiler constructor/static class-data binding. */
export interface WeakComponentImplHelperConstructor {
  new (): WeakComponentImplHelper2;
  readonly ClassData: class_data;
  readonly Template: TemplateState;
}
const specializations: WeakComponentImplHelperConstructor[] = [];
/** Original component/type-provider template. Native noexcept termination and physical mutex/ABI behavior are not emulated by this browser member binding. */
export abstract class WeakComponentImplHelper2
  extends WeakComponentImplHelperBase2
  implements XTypeProvider
{
  /** Original ordered Ifc... specialization and implicit XTypeProvider class-data entry. @param interfaces - Actual compiler-declared interfaces. @returns Same specialization constructor. */
  static specialize(
    ...interfaces: readonly DeclaredInterface[]
  ): WeakComponentImplHelperConstructor {
    const old = specializations.find(
      /** Compares exact ordered template declarations. @param value - Existing specialization. @returns Original identity match. */ (
        value,
      ) =>
        value.Template.interfaces.length === interfaces.length &&
        value.Template.interfaces.every(
          /** Compares actual source arguments. @param type - Declared interface. @param index - Original position. @returns Identity match. */ (
            type,
            index,
          ) => type === interfaces[index],
        ),
    );
    if (old) return old;
    const data: class_data = {
        m_nTypes: interfaces.length + 1,
        m_storedTypeRefs: false,
        m_createdId: false,
        m_id: new Int8Array(16),
        m_typeEntries: [...interfaces, XTypeProvider].map(
          /** Original compiler initializer stores the getter without evaluating it. @param value - Declared interface. @returns Original entry. */ (
            value,
          ) => ({ m_type: { getCppuType: value.static_type }, m_offset: 0 }),
        ),
      },
      body = /** Actual compiler-erased specialization adds no instance cache/provider. */ class extends WeakComponentImplHelper2 {};
    Object.defineProperties(body, {
      ClassData: { value: data },
      Template: { value: { interfaces: [...interfaces] } },
    });
    const result = body as unknown as WeakComponentImplHelperConstructor;
    specializations.push(result);
    return result;
  }
  /** Original qualified lifetime acquisition. @returns Nothing. */
  override acquire(): void {
    super.acquire();
  }
  /** Original qualified lifetime release. @returns Nothing. */
  override release(): void {
    super.release();
  }
  /** Original final template forwarding body; native noexcept is a separate process-boundary contract. @returns Nothing. */
  override dispose(): void {
    super.dispose();
  }
  /** Original final registration forwarding body. @param listener - Actual listener. @returns Nothing. */
  override addEventListener(listener: Reference<XEventListener>): void {
    super.addEventListener(listener);
  }
  /** Original final removal forwarding body. @param listener - Actual listener. @returns Nothing. */
  override removeEventListener(listener: Reference<XEventListener>): void {
    super.removeEventListener(listener);
  }
  /** Original specialized query and qualified component base fallback. @param type - Demanded source type. @returns Acquired Any. */
  override queryInterface(type: Type): Any {
    return WeakComponentImplHelper_query(
      type,
      (this.constructor as WeakComponentImplHelperConstructor).ClassData,
      /** Erases only compiler casts to the actual logical receiver. @returns Same object. */ () =>
        this,
      this,
    );
  }
  /** Original successful-once static sequence order is XWeak, XComponent, XTypeProvider, Ifc...; it is independent from class_data initialization. @returns Owned COW sequence copy. */
  getTypes(): Sequence<Type> {
    const state = (this.constructor as WeakComponentImplHelperConstructor).Template,
      Values = Sequence.specialize<Type>("Type", 8);
    if (state.types === undefined) {
      const owned: Type[] = [];
      try {
        for (const declaration of [XWeak, XComponent, XTypeProvider, ...state.interfaces])
          owned.push(new Type(declaration.static_type()));
        const fields = new Map<number, [ReturnType<Type["getTypeLibType"]>]>(
          owned.map(
            /** Borrows the actual initialized type fields as a const initializer-list address. @param value - Actual owned list element. @param index - Original byte-stride position. @returns Source read-only field. */ (
              value,
              index,
            ) => [index * 8, [value.getTypeLibType()]],
          ),
        );
        state.types = new Values(fields, owned.length);
      } finally {
        for (let index = owned.length; index--;) (owned[index] as Type).dispose();
      }
    }
    return new Values(state.types);
  }
  /** Original obsolete identifier is an empty actual byte sequence. @returns Owned empty sequence. */
  getImplementationId(): Sequence<number> {
    return new (Sequence.specialize<number>("sal_Int8", 1))();
  }
}
