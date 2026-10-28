/** @fileoverview Original SfxModelSubComponent declaration and inline model entry/refcount delegation from docundomanager.hxx. DocumentUndoManager and SolarMutex/SfxModelGuard synchronization remain unported. */
import type { SfxBaseModel } from "../doc/sfxbasemodel";
/** Original subcomponent borrows the actual model and shares its reference counter; it supplies no independent lifetime or document provider. */
export abstract class SfxModelSubComponent {
  /** Original constructor retains a borrowed model reference without acquiring it. @param m_rModel - Actual model owner. @returns Subcomponent. */
  protected constructor(private readonly m_rModel: SfxBaseModel) {}
  /** Original fully-alive model check. @returns Nothing. */
  MethodEntryCheck(): void {
    this.m_rModel.MethodEntryCheck(true);
  }
  /** Original protected model acquisition. @returns Nothing. */
  protected acquireModel(): void {
    this.m_rModel.acquire();
  }
  /** Original protected model release, potentially destroying the actual most-derived model. @returns Nothing. */
  protected releaseModel(): void {
    this.m_rModel.release();
  }
  /** Original const/mutable borrowed overloads share one actual model identity after TS const overload erasure. @returns Borrowed model. */
  protected getBaseModel(): SfxBaseModel {
    return this.m_rModel;
  }
}
