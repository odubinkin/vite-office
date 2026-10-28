/** @fileoverview Original SfxBaseModel shell/listener ownership, GetObjectShell and IsInitialized subset. Full UNO/WeakImplHelper, model guards, properties/controllers/storage/event/recovery services remain unported; this is not a complete XModel implementation. */
import { SfxListener } from "../../../svl/source/notify/lstner";
import type { SfxBroadcaster } from "../../../svl/source/notify/SfxBroadcaster";
import { SfxHint, SfxHintId } from "../../../svl/inc/hint";
import type { SfxObjectShell } from "./objsh";
/** Original consumed data-container shell reference; the full container's controller/event/property members are unported. */
class IMPL_SfxBaseModel_DataContainer {
  /** Stores the original shell owner. @param m_pObjectShell - Actual shell, optionally null. @returns Container. */
  constructor(readonly m_pObjectShell: SfxObjectShell | null) {}
}
/** Original model base for consumed shell identity and actual native listener registration. No substitute getModel/document property provider is supplied. */
export class SfxBaseModel extends SfxListener {
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
  /** Explicit C++ destructor binding releases actual listener registrations and the represented container. It is not the UNO dispose/close workflow. @returns Nothing. */
  override Dispose(): void {
    super.Dispose();
    this.m_pData = null;
  }
}
