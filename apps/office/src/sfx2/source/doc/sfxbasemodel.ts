/** @fileoverview Original consumed SfxBaseModel XChild, method entry checks, weak component and shell/listener ownership. Only the implemented XChild and language XEventListener interfaces are declared on the actual WeakImplHelper base; the full native interface list, XModel/factories/controllers/storage/properties/events remain unported. Synchronous calls inline the guard's entry check; native SolarMutex/thread behavior is unverified. */
import { withSfxListener } from "../../../svl/source/notify/lstner";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XChild } from "../../../udkapi/com/sun/star/container/XChild";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { NotInitializedException } from "../../../cppu/inc/com/sun/star/lang/NotInitializedException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { OInterfaceContainerHelper3 } from "../../../comphelper/inc/interfacecontainer3";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import type { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { XModifyListener } from "../../../offapi/com/sun/star/util/XModifyListener";
import { XEventListener as DocumentXEventListener } from "../../../offapi/com/sun/star/document/XEventListener";
import type { SfxBroadcaster } from "../../../svl/source/notify/SfxBroadcaster";
import { SfxHint, SfxHintId } from "../../../svl/inc/hint";
import type { SfxObjectShell } from "./objsh";
/** Original consumed shell/parent/listener container members; full controller/property and other event members remain unported. */
class IMPL_SfxBaseModel_DataContainer {
  readonly m_aEventListeners = new (OInterfaceContainerHelper3.specialize<XEventListener>(
    XEventListener,
  ))();
  readonly m_aModifyListeners = new (OInterfaceContainerHelper3.specialize<XModifyListener>(
    XModifyListener,
  ))();
  readonly m_aDocumentEventListeners1 =
    new (OInterfaceContainerHelper3.specialize<DocumentXEventListener>(DocumentXEventListener))();
  readonly m_xParent = new Reference<XInterface>();
  /** Stores the original shell owner. @param m_pObjectShell - Actual shell, optionally null. @returns Container. */
  constructor(readonly m_pObjectShell: SfxObjectShell | null) {}
}
/** Original model base for consumed shell identity and actual native listener registration. No substitute getModel/document property provider is supplied. */
export class SfxBaseModel
  extends withSfxListener(WeakImplHelper.specialize(XChild, XEventListener))
  implements XChild, XEventListener
{
  private m_pData: IMPL_SfxBaseModel_DataContainer | null;
  /** Original represented initialization and conditional StartListening. @param shell - Actual native shell. @returns Model. */
  constructor(shell: SfxObjectShell | null) {
    super();
    this.m_pData = new IMPL_SfxBaseModel_DataContainer(shell);
    if (shell !== null) this.StartListening(shell);
  }
  /** Original nullable stored shell query, without an implicit closed-state/model repair. @returns Shell or null. */
  GetObjectShell(): SfxObjectShell | null {
    return this.m_pData?.m_pObjectShell ?? null;
  }
  /** Original data/shell/medium predicate. The current browser shell always owns an actual medium. @returns Native initialization predicate. */
  IsInitialized(): boolean {
    if (this.m_pData === null || this.m_pData.m_pObjectShell === null) return false;
    return this.m_pData.m_pObjectShell.GetMedium() !== null;
  }
  /** Original data-pointer disposed predicate. @returns Whether the represented container has been released. */
  private impl_isDisposed(): boolean {
    return this.m_pData === null;
  }
  /** Original ordered disposed/initialization checks with actual UNO exception message/context owners. @param i_mustBeInitialized - Original required-state flag. @returns Nothing. */
  MethodEntryCheck(i_mustBeInitialized: boolean): void {
    if (this.impl_isDisposed()) {
      const message = new OUString(),
        context = new Reference(this);
      try {
        throw new DisposedException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
    if (i_mustBeInitialized && !this.IsInitialized()) {
      const message = new OUString(),
        context = new Reference(this);
      try {
        throw new NotInitializedException(message, context);
      } finally {
        context.dispose();
        message.dispose();
      }
    }
  }
  /** Original fully-alive XChild read returns a separately acquired reference. The synchronous binding inlines SfxModelGuard's entry check; it supplies no substitute mutex. @returns Acquired parent. */
  getParent(): Reference<XInterface> {
    this.MethodEntryCheck(true);
    return new Reference((this.m_pData as IMPL_SfxBaseModel_DataContainer).m_xParent);
  }
  /** Original E_INITIALIZING XChild assignment permits pre-initialization and preserves member ownership. @param Parent - Borrowed parent. @returns Nothing. */
  setParent(Parent: Reference<XInterface>): void {
    this.MethodEntryCheck(false);
    (this.m_pData as IMPL_SfxBaseModel_DataContainer).m_xParent.assign(Parent);
  }
  /** Original language-event registration. @param listener - Borrowed listener. @returns Nothing. */
  addEventListener(listener: Reference<XEventListener>): void;
  /** Original document-event overload; the extra declaration argument binds the erased C++ overload, without dynamic interface guessing. @param listener - Borrowed document listener. @param declared - Original declared overload. @returns Nothing. */
  addEventListener(
    listener: Reference<DocumentXEventListener>,
    declared: typeof DocumentXEventListener,
  ): void;
  /** Original E_INITIALIZING registration bodies. @param listener - Borrowed declared listener. @param declared - Erased overload selection. @returns Nothing. */
  addEventListener(
    listener: Reference<XEventListener> | Reference<DocumentXEventListener>,
    declared?: typeof DocumentXEventListener,
  ): void {
    this.MethodEntryCheck(false);
    const data = this.m_pData as IMPL_SfxBaseModel_DataContainer;
    if (declared === DocumentXEventListener)
      data.m_aDocumentEventListeners1.addInterface(listener as Reference<DocumentXEventListener>);
    else data.m_aEventListeners.addInterface(listener);
  }
  /** Original language-event removal permits initialization. @param listener - Borrowed listener. @returns Nothing. */
  removeEventListener(listener: Reference<XEventListener>): void;
  /** Original document-event removal requires initialization. @param listener - Borrowed listener. @param declared - Original declared overload. @returns Nothing. */
  removeEventListener(
    listener: Reference<DocumentXEventListener>,
    declared: typeof DocumentXEventListener,
  ): void;
  /** Original overload-specific entry checks and single removal. @param listener - Borrowed declared listener. @param declared - Erased overload selection. @returns Nothing. */
  removeEventListener(
    listener: Reference<XEventListener> | Reference<DocumentXEventListener>,
    declared?: typeof DocumentXEventListener,
  ): void {
    this.MethodEntryCheck(declared === DocumentXEventListener);
    const data = this.m_pData as IMPL_SfxBaseModel_DataContainer;
    if (declared === DocumentXEventListener)
      data.m_aDocumentEventListeners1.removeInterface(
        listener as Reference<DocumentXEventListener>,
      );
    else data.m_aEventListeners.removeInterface(listener);
  }
  /** Original E_INITIALIZING modify registration. @param listener - Borrowed listener. @returns Nothing. */
  addModifyListener(listener: Reference<XModifyListener>): void {
    this.MethodEntryCheck(false);
    (this.m_pData as IMPL_SfxBaseModel_DataContainer).m_aModifyListeners.addInterface(listener);
  }
  /** Original fully-alive modify removal. @param listener - Borrowed listener. @returns Nothing. */
  removeModifyListener(listener: Reference<XModifyListener>): void {
    this.MethodEntryCheck(true);
    (this.m_pData as IMPL_SfxBaseModel_DataContainer).m_aModifyListeners.removeInterface(listener);
  }
  /** Original disposed short circuit, three queries and modify/language/document priority. The document arm is retained despite the original language-base query making it unreachable for conforming document listeners. @param event - Original borrowed language event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    if (this.impl_isDisposed()) return;
    const data = this.m_pData as IMPL_SfxBaseModel_DataContainer,
      mod = Reference.query(event.Source, XModifyListener.static_type);
    try {
      const listener = Reference.query(event.Source, XEventListener.static_type);
      try {
        const document = Reference.query(event.Source, DocumentXEventListener.static_type);
        try {
          if (mod.is()) data.m_aModifyListeners.removeInterface(mod as Reference<XModifyListener>);
          else if (listener.is())
            data.m_aEventListeners.removeInterface(listener as Reference<XEventListener>);
          else if (document.is())
            data.m_aDocumentEventListeners1.removeInterface(
              document as Reference<DocumentXEventListener>,
            );
        } finally {
          document.dispose();
        }
      } finally {
        listener.dispose();
      }
    } finally {
      mod.dispose();
    }
  }
  /** Original source/data guards and ignored hint cases. Service-dependent hint branches remain explicit unsupported APIs, rather than fake event/modify/storage providers. @param broadcaster - Actual source. @param hint - Native hint. @returns Nothing. */
  override Notify(broadcaster: SfxBroadcaster, hint: SfxHint): void {
    if (this.m_pData === null || broadcaster !== this.m_pData.m_pObjectShell) return;
    if (
      hint.GetId() === SfxHintId.DocChanged ||
      hint.GetId() === SfxHintId.ThisIsAnSfxEventHint ||
      hint.GetId() === SfxHintId.TitleChanged ||
      hint.GetId() === SfxHintId.ModeChanged
    )
      throw new Error(
        "SfxBaseModel modify/event/storage/controller notification services are not implemented",
      );
  }
  /** Actual weak-base zero-reference destruction dispatches to the most-derived native destructor binding. @returns Nothing. */
  protected override destroy(): void {
    this.Dispose();
  }
  /** Explicit C++ destructor binding destroys the represented data member before the listener base, releasing actual parent ownership. It is not the UNO dispose/close workflow. @returns Nothing. */
  override Dispose(): void {
    const data = this.m_pData;
    this.m_pData = null;
    data?.m_xParent.dispose();
    data?.m_aDocumentEventListeners1.dispose();
    data?.m_aModifyListeners.dispose();
    data?.m_aEventListeners.dispose();
    super.Dispose();
  }
}
