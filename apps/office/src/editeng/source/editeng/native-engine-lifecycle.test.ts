/** @fileoverview Original lifecycle/notification/selection member groups exercised with real document/portion/listener values and explicitly prepared unported dependencies. This fixture is not a production EditEngine. */
import { expect, it } from "vitest";
import {
  ImpEditEngine,
  UpdatePosInsert,
  type EditView,
  type ImpEditView,
} from "./impedit.lifecycle";
import { EditEngine } from "./editeng.lifecycle";
import { EditDoc } from "../../inc/editdoc";
import { ParaPortion } from "../../inc/ParagraphPortion";
import { ParaPortionList } from "../../inc/ParagraphPortionList";
import { InternalEditStatus } from "./editstt2";
import { EEControlBits as Control } from "../../inc/editstat";
import { EditPaM } from "../../inc/EditPaM";
import { EditSelection } from "../../inc/EditSelection";
import { EPaM, EE_PARA_MAX } from "../../inc/EPaM";
import { ESelection } from "../../inc/ESelection";
import { EENotify, EENotifyType as Notification } from "../../inc/editdata";
import type { ContentNode } from "../../inc/ContentNode";
import type { OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { Rectangle, Size } from "../../../tools/inc/gen";
import type { SfxBroadcaster } from "../../../svl/source/notify/SfxBroadcaster";
import type { SfxHint } from "../../../svl/inc/hint";
import { DuplicateHandling } from "../../../svl/source/notify/lstner";
import {
  SfxStyleSheet,
  SfxStyleSheetPool,
  SfxStyleFamily,
  SfxStyleSearchBits,
} from "../../../svl/inc/style";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";

/** Prepared native view dependency records calls and copies real selection/rectangle values; it is not a shipped window implementation. */
class PreparedView implements EditView, ImpEditView {
  readonly selection = new EditSelection();
  readonly changes: EditSelection[] = [];
  readonly invalidations: Rectangle[] = [];
  readonly area = new Rectangle(10, 20, 59, 99);
  /** Original prepared actual view implementation identity. @returns This fixture. */
  getImpl(): ImpEditView {
    return this;
  }
  /** Borrows the prepared native selection value. @returns Actual selection. */
  GetEditSelection(): EditSelection {
    return this.selection;
  }
  /** Copies the prepared original selection dependency and records the source caller. @param selection - Source value. @returns Nothing. */
  SetEditSelection(selection: EditSelection): void {
    this.selection.assign(selection);
    this.changes.push(new EditSelection(selection));
  }
  /** Borrows explicitly prepared output geometry. @returns Actual rectangle. */
  GetOutputArea(): Rectangle {
    return this.area;
  }
  /** Records the source window request, without supplying a renderer. @param area - Actual invalid rectangle. @returns Nothing. */
  InvalidateWindow(area: Rectangle): void {
    this.invalidations.push(new Rectangle(area));
  }
}
/** Prepared outer pointer binds the actual implemented source notification methods. */
class PreparedOuter extends EditEngine {
  readonly implementation = new PreparedEngine(this);
  readonly paragraphChanges: number[] = [];
  /** Returns actual fixture owner state. @returns Prepared internal owner. */
  getImpl(): PreparedEngine {
    return this.implementation;
  }
  /** Observes the source virtual callback dispatch. @param paragraph - Actual source index. @returns Nothing. */
  override ParaAttribsChanged(paragraph: number): void {
    this.paragraphChanges.push(paragraph);
  }
}
/** Explicit source-state fixture. Abstract parser/undo/height/style-notification dependencies remain prepared and are not implemented by a production fallback. */
class PreparedEngine extends ImpEditEngine {
  protected readonly maEditDoc = new EditDoc();
  protected readonly maParaPortionList = new ParaPortionList();
  protected readonly maStatus = new InternalEditStatus();
  readonly maEditViews: PreparedView[] = [];
  protected readonly mpEditEngine: PreparedOuter;
  protected readonly maPaperSize = new Size(0x7fffffff, 0x7fffffff);
  mnCurTextHeight = 0;
  mbFormatted = false;
  protected mbUndoEnabled = true;
  protected mbIsInUndo = false;
  mbUpdateLayout = true;
  protected mbCallParaInsertedOrDeleted = false;
  protected maModifyHdl: ((argument: null) => void) | null = null;
  protected maNotifyHdl: ((notification: EENotify) => void) | null = null;
  resets = 0;
  readonly inserted: { text: string; undo: boolean; selection: EditSelection }[] = [];
  readonly heights: ParaPortion[] = [];
  readonly hints: SfxHint[] = [];
  failure: Error | null = null;
  /** Prepares exact consumed source state; deliberately does not model unported devices/application/constructor/timers. @param outer - Prepared actual source outer pointer. @returns Prepared owner. */
  constructor(outer: PreparedOuter) {
    super();
    this.mpEditEngine = outer;
    this.maStatus.GetControlWord()[0] =
      Control.USECHARATTRIBS |
      Control.DOIDLEFORMAT |
      Control.PASTESPECIAL |
      Control.UNDOATTRIBS |
      Control.ALLOWBIGOBJS |
      Control.RTFSTYLESHEETS;
    this.InitDoc(false);
    this.SetCallParaInsertedOrDeleted(true);
    this.maEditDoc.SetModifyHdl(
      /** Binds the original prepared DocModified target. @param argument - Original null. @returns Nothing. */ (
        argument,
      ) => {
        expect(argument).toBeNull();
        this.DocModified();
      },
    );
  }
  /** Explicit prepared observer dependency; no style notification behavior is claimed. @param broadcaster - Actual registered source. @param hint - Actual source hint. @returns Nothing. */
  override Notify(broadcaster: SfxBroadcaster, hint: SfxHint): void {
    expect(this.IsListening(broadcaster)).toBe(true);
    this.hints.push(hint);
  }
  /** Prepared history-reset dependency records the source call; full undo execution is outside this fixture. @returns Nothing. */
  ResetUndoManager(): void {
    this.resets++;
  }
  /** Prepared measurement dependency only observes the requested actual next paragraph; no height is fabricated. @param portion - Actual next paragraph. @returns Nothing. */
  CalcHeight(portion: ParaPortion): void {
    this.heights.push(portion);
  }
  /** Prepared single-plain-line callee for lifecycle tests only; uses real document insertion/selection-update/notification bodies. This is not a production parser or multiline implementation. @param selection - Source collapsed selection. @param value - Explicit plain fixture text. @returns Actual inserted end. */
  ImpInsertText(selection: EditSelection, value: OUStringConstReference): EditPaM {
    this.inserted.push({
      text: text(value),
      undo: this.IsUndoEnabled(),
      selection: new EditSelection(selection),
    });
    if (this.failure) throw this.failure;
    const before = new EditPaM(selection.Max()),
      result = this.maEditDoc.InsertText(before, value),
      inserted = new ESelection(this.CreateEPaM(before));
    inserted.end = this.CreateEPaM(result);
    this.UpdateSelectionsInsert(inserted);
    this.TextModified();
    return result;
  }
  /** Prepares source document/portion state before the member under test, without simulating the enclosing parser. @param value - Single raw paragraph text. @returns Actual paragraph node. */
  appendParagraph(value: string): ContentNode {
    const start = this.maEditDoc.InsertParaBreak(this.maEditDoc.GetEndPaM(), true),
      string = unicode(value);
    try {
      this.maEditDoc.InsertText(start, string);
    } finally {
      string.dispose();
    }
    const node = start.GetNode() as ContentNode;
    this.maParaPortionList.Append(new ParaPortion(node));
    return node;
  }
  /** Explicit fixture cleanup of real owned state and registrations. @returns Nothing. */
  dispose(): void {
    this.EndListeningAll();
    this.maParaPortionList.Reset();
    this.maEditDoc.dispose();
  }
}

it("retains original notification ordinals, per-value defaults and copied parameters", /** Real notification values remain separate from a UI event facade. @returns Nothing. */ () => {
  expect(Notification.EE_NOTIFY_TEXTMODIFIED).toBe(0);
  expect(Notification.EE_NOTIFY_TEXTVIEWSELECTIONCHANGED_ENDD_PARA).toBe(8);
  const value = new EENotify(Notification.EE_NOTIFY_PARAGRAPHINSERTED);
  expect([value.nParagraph, value.nParam1, value.nParam2]).toEqual([EE_PARA_MAX, 0, 0]);
  value.nParagraph = 5;
  value.nParam1 = -3;
  value.nParam2 = 9;
  const copy = new EENotify(value);
  value.nParagraph = 8;
  expect([copy.nParagraph, copy.nParam1, copy.nParam2]).toEqual([5, -3, 9]);
  copy.assign(new EENotify(Notification.EE_NOTIFY_TEXTMODIFIED));
  expect(copy.nParagraph).toBe(EE_PARA_MAX);
});

it("calls source reset/undo/parser/view/notification paths in original SetText order", /** Full parser and UI construction remain prepared dependencies; actual lifecycle bodies and document owners execute here. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    view = new PreparedView(),
    notifications: EENotify[] = [],
    modified: null[] = [],
    input = unicode("abc");
  engine.maEditViews.push(view);
  outer.SetNotifyHdl(
    /** Copies original borrowed notifications into test evidence. @param value - Source stack value. @returns Nothing. */ (
      value,
    ) => notifications.push(new EENotify(value)),
  );
  engine.SetModifyHdl(
    /** Records original null argument. @param value - Source argument. @returns Nothing. */ (
      value,
    ) => {
      modified.push(value);
    },
  );
  try {
    engine.SetText(input);
    expect(engine.resets).toBe(3);
    expect(engine.IsUndoEnabled()).toBe(true);
    expect(engine.inserted).toHaveLength(1);
    expect(engine.inserted[0]?.undo).toBe(false);
    expect(engine.inserted[0]?.selection.HasRange()).toBe(false);
    expect(text((engine.GetEditDoc().GetObject(0) as ContentNode).GetString())).toBe("abc");
    expect(
      view.changes.map(
        /** Reads source callback order. @param selection - Stored source value. @returns Caret. */ (
          selection,
        ) => selection.Max().GetIndex(),
      ),
    ).toEqual([0, 3, 3]);
    expect(
      notifications.map(
        /** Reads original ordinal. @param value - Notification. @returns Ordinal. */ (value) =>
          value.eNotificationType,
      ),
    ).toEqual([
      Notification.EE_NOTIFY_PARAGRAPHREMOVED,
      Notification.EE_NOTIFY_PARAGRAPHINSERTED,
      Notification.EE_NOTIFY_TEXTMODIFIED,
    ]);
    expect(
      notifications.map(
        /** Reads original paragraph defaults. @param value - Notification. @returns Paragraph. */ (
          value,
        ) => value.nParagraph,
      ),
    ).toEqual([EE_PARA_MAX, 0, EE_PARA_MAX]);
    expect(modified).toEqual([null, null]);
    expect(engine.GetEditDoc().IsModified()).toBe(true);
    expect(engine.IsFormatted()).toBe(false);
  } finally {
    input.dispose();
    engine.dispose();
  }
});

it("uses old text height for empty-text invalidation and resets height only afterwards", /** Clipping uses the actual tools Rectangle Intersection source implementation. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    view = new PreparedView(),
    empty = unicode("");
  engine.maEditViews.push(view);
  engine.mnCurTextHeight = 80;
  try {
    engine.SetText(empty);
    expect(engine.inserted).toEqual([]);
    expect(engine.mnCurTextHeight).toBe(0);
    expect(view.changes).toHaveLength(2);
    expect(view.invalidations).toHaveLength(1);
    const invalid = view.invalidations[0] as Rectangle;
    expect([invalid.Left(), invalid.Top(), invalid.Right(), invalid.Bottom()]).toEqual([
      10, 20, 59, 99,
    ]);
    engine.mbUpdateLayout = false;
    engine.mnCurTextHeight = 80;
    engine.SetText(empty);
    expect(view.invalidations).toHaveLength(1);
    expect(engine.mnCurTextHeight).toBe(0);
  } finally {
    empty.dispose();
    engine.dispose();
  }
});

it("preserves disabled undo and original exception behavior without a new restoration finally", /** The source restores undo only on normal return. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    value = unicode("abc");
  try {
    engine.EnableUndo(false);
    engine.resets = 0;
    engine.SetText(value);
    expect(engine.resets).toBe(1);
    expect(engine.IsUndoEnabled()).toBe(false);
    engine.EnableUndo(true);
    engine.failure = new Error("prepared callee failure");
    expect(
      /** Invokes only the actual source caller with a failing prepared dependency. @returns Nothing. */ () =>
        engine.SetText(value),
    ).toThrow(engine.failure);
    expect(engine.IsUndoEnabled()).toBe(false);
    expect((engine.GetEditDoc().GetObject(0) as ContentNode).Len()).toBe(0);
  } finally {
    value.dispose();
    engine.dispose();
  }
});

it("keeps first style registration when InitDoc preserves formatting and releases later subscriptions", /** Uses actual style pool, styles, SfxListener registration and duplicate policy. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    pool = new SfxStyleSheetPool(engine.GetEditDoc().GetItemPool()),
    name = unicode("Prepared"),
    style = new SfxStyleSheet(name, pool, SfxStyleFamily.Para, SfxStyleSearchBits.UserDefined);
  try {
    pool.Insert(style);
    const first = engine.GetEditDoc().GetObject(0) as ContentNode;
    first.SetStyleSheet(style);
    engine.StartListening(style, DuplicateHandling.Allow);
    const second = engine.appendParagraph("b");
    second.SetStyleSheet(style);
    engine.StartListening(style, DuplicateHandling.Allow);
    engine.GetStatus().TurnOnFlags(Control.ONLINESPELLING);
    engine.InitDoc(true);
    expect(engine.GetBroadcasterCount()).toBe(1);
    expect((engine.GetEditDoc().GetObject(0) as ContentNode).GetStyleSheet()).toBe(style);
    expect((engine.GetEditDoc().GetObject(0) as ContentNode).GetWrongList()).not.toBeNull();
    expect(engine.GetParaPortions().Count()).toBe(1);
    engine.InitDoc(false);
    expect(engine.GetBroadcasterCount()).toBe(0);
    expect((engine.GetEditDoc().GetObject(0) as ContentNode).GetStyleSheet()).toBeNull();
    expect(engine.isUsedByModel()).toBe(true);
  } finally {
    engine.dispose();
    name.dispose();
  }
});

it("converts real document selections with original missing-paragraph, upper-only clipping and ordering behavior", /** Conversion is not replaced by a clamp/sort heuristic. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    first = engine.GetEditDoc().GetObject(0) as ContentNode;
  first.Append(Uint16Array.of(65, 66, 67));
  const second = engine.appendParagraph("xy");
  try {
    const selection = engine.ConvertSelection(99, 0, 0, 99);
    expect(selection.Min().GetNode()).toBe(second);
    expect(selection.Min().GetIndex()).toBe(2);
    expect(selection.Max().GetNode()).toBe(first);
    expect(selection.Max().GetIndex()).toBe(3);
    const negative = engine.CreateNormalizedSel(new ESelection(0, -2, 0, 1));
    expect(negative.Min().GetIndex()).toBe(-2);
    const restored = engine.CreateSel(
      engine.CreateESel(new EditSelection(new EditPaM(second, 1), new EditPaM(first, 2))),
    );
    expect(restored.Min().GetNode()).toBe(second);
    expect(restored.Max().GetIndex()).toBe(2);
  } finally {
    engine.dispose();
  }
});

it("updates both inserted selection endpoints and compensates already shifted paragraph identities", /** Actual source node split is prepared before the original view-update member executes. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    first = engine.GetEditDoc().GetObject(0) as ContentNode;
  first.Append(Uint16Array.of(65, 66, 67, 68));
  const later = engine.appendParagraph("xyz"),
    a = new PreparedView(),
    b = new PreparedView();
  a.selection.assign(new EditSelection(new EditPaM(first, 2), new EditPaM(first, 4)));
  b.selection.assign(new EditSelection(new EditPaM(later, 1), new EditPaM(later, 2)));
  engine.maEditViews.push(a, b);
  try {
    const split = engine.GetEditDoc().InsertParaBreak(new EditPaM(first, 2), true),
      insertedNode = split.GetNode() as ContentNode;
    engine.GetParaPortions().Insert(1, new ParaPortion(insertedNode));
    engine.UpdateSelectionsInsert(new ESelection(0, 2, 1, 0));
    expect(a.selection.Min().GetNode()).toBe(insertedNode);
    expect(a.selection.Min().GetIndex()).toBe(0);
    expect(a.selection.Max().GetIndex()).toBe(2);
    expect(b.selection.Min().GetNode()).toBe(later);
    expect(b.selection.Min().GetIndex()).toBe(1);
    expect(b.changes).toHaveLength(1);
    const original = new EditSelection(a.selection),
      deleted = new ESelection(1, 2, 0, 1);
    engine.UpdateSelectionsDelete(deleted);
    expect(a.selection.equals(original)).toBe(true);
    expect(a.changes).toHaveLength(1);
    expect(deleted.IsAdjusted()).toBe(false);
    const position = new EPaM(0, 7);
    expect(UpdatePosInsert(position, new ESelection(0, 2, 0, 4))).toBe(true);
    expect(position.nIndex).toBe(9);
  } finally {
    engine.dispose();
  }
});

it("keeps text notification separate from dirty state and recalculates only a valid following paragraph", /** Actual dirty/listener/portion state is separate from the observed unported height dependency. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    first = engine.GetEditDoc().GetObject(0) as ContentNode,
    events: EENotify[] = [];
  outer.SetNotifyHdl(
    /** Records original callback values. @param value - Source value. @returns Nothing. */ (
      value,
    ) => {
      events.push(new EENotify(value));
    },
  );
  try {
    engine.mbFormatted = true;
    engine.TextModified();
    expect(engine.GetEditDoc().IsModified()).toBe(false);
    expect(engine.IsFormatted()).toBe(false);
    expect(events[0]?.eNotificationType).toBe(Notification.EE_NOTIFY_TEXTMODIFIED);
    engine.appendParagraph("x");
    const next = engine.GetParaPortions().getRef(1);
    next.SetValid();
    engine.ParaAttribsChanged(first);
    expect(engine.GetEditDoc().IsModified()).toBe(true);
    expect(engine.heights).toEqual([next]);
    expect(outer.paragraphChanges).toEqual([]);
    next.MarkSelectionInvalid(0);
    engine.ParaAttribsChanged(first, true);
    expect(engine.heights).toHaveLength(1);
    expect(outer.paragraphChanges).toEqual([0]);
    engine.SetUndoMode(true);
    engine.ParaAttribsChanged(first);
    expect(outer.paragraphChanges).toEqual([0, 0]);
  } finally {
    engine.dispose();
  }
});

it("retains source rectangle normalization, default-empty reset and unchanged empty receiver", /** All geometry is source integer data, without a platform/device substitute. @returns Nothing. */ () => {
  const first = new Rectangle(20, 30, 10, 5),
    other = new Rectangle(15, 8, 40, 20);
  first.Intersection(other);
  expect([first.Left(), first.Top(), first.Right(), first.Bottom()]).toEqual([15, 8, 20, 20]);
  expect([other.Left(), other.Top(), other.Right(), other.Bottom()]).toEqual([15, 8, 40, 20]);
  first.Intersection(new Rectangle(50, 50, 60, 60));
  expect([first.Left(), first.Top(), first.IsEmpty()]).toEqual([0, 0, true]);
  const empty = new Rectangle(7, 8);
  empty.Intersection(other);
  expect([empty.Left(), empty.Top(), empty.IsEmpty()]).toEqual([7, 8, true]);
  const normal = new Rectangle(1, 2, 3, 4);
  normal.Intersection(new Rectangle(90, 100));
  expect([normal.Left(), normal.Top(), normal.IsEmpty()]).toEqual([0, 0, true]);
});
