/** @fileoverview Original consumed SfxBaseModel XChild, method entry checks, weak component and shell/listener ownership. Only the implemented XChild interface is declared on the actual WeakImplHelper base; the full native interface list, XModel/factories/controllers/storage/properties/events remain unported. Synchronous calls inline the guard's entry check; native SolarMutex/thread behavior is unverified. */
import { withSfxListener } from "../../../svl/source/notify/lstner";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XChild } from "../../../udkapi/com/sun/star/container/XChild";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import { DisposedException } from "../../../cppu/inc/com/sun/star/lang/DisposedException";
import { NotInitializedException } from "../../../cppu/inc/com/sun/star/lang/NotInitializedException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { SfxBroadcaster } from "../../../svl/source/notify/SfxBroadcaster";
import { SfxHint, SfxHintId } from "../../../svl/inc/hint";
import type { SfxObjectShell } from "./objsh";
/** Original consumed data-container shell reference; the full container's controller/event/property members are unported. */
class IMPL_SfxBaseModel_DataContainer {
  readonly m_xParent = new Reference<XInterface>();
  /** Stores the original shell owner. @param m_pObjectShell - Actual shell, optionally null. @returns Container. */
  constructor(readonly m_pObjectShell: SfxObjectShell | null) {}
}
/** Original model base for consumed shell identity and actual native listener registration. No substitute getModel/document property provider is supplied. */
export class SfxBaseModel
  extends withSfxListener(WeakImplHelper.specialize(XChild))
  implements XChild
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
    super.Dispose();
  }
}
