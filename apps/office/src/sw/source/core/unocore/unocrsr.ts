/** @fileoverview Native SwUnoCursor ownership/defaults and SwUnoTableCursor selection-ring construction from unocrsr.cxx/hxx. Wider SavePos/IsSelOvr/layout selection production remains outside the admitted current constructor/notification profile. */
import { SwCursor, SwTableCursor } from "../crsr/swcrsr";
import type { SwPosition } from "../crsr/pam";
import { SfxBroadcaster } from "../../../../svl/source/notify/SfxBroadcaster";
/** Erased constructor constraint for the original virtual SwUnoCursor facet on the actual ordinary/table cursor identity. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TypeScript native multiple-inheritance role binding requires arbitrary constructor arguments; this type emits no runtime code.
type CursorBase = new (...args: any[]) => SwCursor;
/** Shares original UnoCursor fields and source destructor/default methods with both actual base cursor kinds. @param Base - Original SwCursor or SwTableCursor base. @returns Original role constructor. */
function withUnoCursor<TBase extends CursorBase>(Base: TBase) {
  /** Original virtual UnoCursor subobject on the same actual cursor identity. */
  class UnoCursorRole extends Base {
    private m_bRemainInSection = true;
    private m_bSkipOverHiddenSections = false;
    private m_bSkipOverProtectSections = false;
    readonly m_aNotifier = new SfxBroadcaster();
    /** Original source default query. @returns Remain-in-section flag. */
    IsRemainInSection(): boolean {
      return this.m_bRemainInSection;
    }
    /** Original flag assignment. @param value - New source flag. @returns Nothing. */
    SetRemainInSection(value: boolean): void {
      this.m_bRemainInSection = value;
    }
    /** Original protected-section default query. @returns Skip-protected flag. */
    IsSkipOverProtectSections(): boolean {
      return this.m_bSkipOverProtectSections;
    }
    /** Original flag assignment. @param value - New source flag. @returns Nothing. */
    SetSkipOverProtectSections(value: boolean): void {
      this.m_bSkipOverProtectSections = value;
    }
    /** Original hidden-section default query. @returns Skip-hidden flag. */
    IsSkipOverHiddenSections(): boolean {
      return this.m_bSkipOverHiddenSections;
    }
    /** Original flag assignment. @param value - New source flag. @returns Nothing. */
    SetSkipOverHiddenSections(value: boolean): void {
      this.m_bSkipOverHiddenSections = value;
    }
    /** Original UNO cursor readonly availability is explicitly true. @returns Native availability. */
    IsReadOnlyAvailable(): boolean {
      return true;
    }
    /** Source destructor deletes the whole ordinary ring, then releases notifier/member and base ownership. @returns Nothing. */
    override Dispose(): void {
      const doc = this.GetPoint().GetNode().GetNodes().GetDoc();
      if (!doc.IsInDtor() && this.m_aNotifier.HasListeners())
        throw new Error("assert(UNO cursor has no listeners)");
      while (this.GetNext() !== this) {
        const next = this.GetNext();
        next.MoveTo();
        next.Dispose();
      }
      this.m_aNotifier.Dispose();
      super.Dispose();
    }
  }
  return UnoCursorRole;
}
/** Actual ordinary UNO cursor retains the original default SwCursor construction. */
export class SwUnoCursor extends withUnoCursor(SwCursor) {}
/** Actual table UNO cursor binds the original virtual UNO facet to the existing table-cursor owner and its separate selection ring. */
export class SwUnoTableCursor extends withUnoCursor(SwTableCursor) {
  private readonly m_aTableSel: SwCursor;
  /** Original table constructor creates the independent selection ring and disables RemainInSection. @param point - Native initial point. @returns Native cursor. */
  constructor(point: SwPosition) {
    super(point);
    this.m_aTableSel = new SwCursor(point);
    this.SetRemainInSection(false);
  }
  /** Original actual selection-ring borrow. @returns Native selection-ring head. */
  GetSelRing(): SwCursor {
    return this.m_aTableSel;
  }
  /** Original table destructor deletes the selection ring before releasing the UNO/base owners. @returns Nothing. */
  override Dispose(): void {
    while (this.m_aTableSel.GetNext() !== this.m_aTableSel) this.m_aTableSel.GetNext().Dispose();
    this.m_aTableSel.Dispose();
    super.Dispose();
  }
}
