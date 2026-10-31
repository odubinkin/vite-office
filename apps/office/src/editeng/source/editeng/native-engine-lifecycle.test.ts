/** @fileoverview Original lifecycle/notification/selection member groups exercised with real document/portion/listener values and explicitly prepared unported dependencies. This fixture is not a production EditEngine. */
import { expect, it, vi } from "vitest";
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
import type { OUString, OUStringConstReference } from "../../../sal/inc/rtl/ustring";
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
import { EditUndoInsertChars, EditUndoSplitPara } from "./editundo";
import { EditUndo, type OutlinerViewShell } from "./editund2";
import { MisspellRange } from "../../inc/misspellrange";
import { EE_FEATURE_TAB } from "../../inc/eeitem";
import { MAXCHARSINPARA } from "./impedit.constants";
import { DICTIONARY_WORD } from "../../../offapi/com/sun/star/i18n/WordType";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";

/** Prepared native view dependency records calls and copies real selection/rectangle values; it is not a shipped window implementation. */
class PreparedView implements EditView, ImpEditView {
  readonly selection = new EditSelection();
  readonly changes: EditSelection[] = [];
  readonly invalidations: Rectangle[] = [];
  readonly area = new Rectangle(10, 20, 59, 99);
  shell: OutlinerViewShell | null = null;
  /** Original prepared actual view implementation identity. @returns This fixture. */
  getImpl(): ImpEditView {
    return this;
  }
  /** Prepared source shell pointer for the no-shell fixture. @returns Null. */
  GetViewShell(): OutlinerViewShell | null {
    return this.shell;
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
  /** Explicit prepared native label dependency for action tests. @param id - Source identifier. @returns Owned label. */
  GetUndoComment(id: number): OUString {
    return unicode(`Prepared ${id}`);
  }
  /** Prepared underlying connection dependency, with actual document/portion values. @param left - Left index. @param backward - Expected source flag. @returns Actual joined position. */
  ConnectContents(left: number, backward: boolean): EditPaM {
    expect(backward).toBe(false);
    const doc = this.implementation.GetEditDoc(),
      portions = this.implementation.GetParaPortions(),
      result = doc.ConnectParagraphs(
        doc.GetObject(left) as ContentNode,
        doc.GetObject(left + 1) as ContentNode,
      );
    portions.Remove(left + 1);
    return result;
  }
  /** Prepared underlying splitting dependency invokes the actual implemented split body. @param paragraph - Actual index. @param position - Source split index. @returns Actual split result. */
  SplitContent(paragraph: number, position: number): EditPaM {
    return this.implementation.ImpInsertParaBreak(
      new EditPaM(this.implementation.GetEditDoc().GetObject(paragraph), position),
    );
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
  protected mbFuzzing = false;
  mpActiveView: EditView | null = null;
  useActualInsertion = false;
  readonly actions: EditUndo[] = [];
  readonly undoEvents: number[] = [];
  readonly deleted: EditSelection[] = [];
  wordSelection: EditSelection | null = null;
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
  /** Explicit prepared single-paragraph deletion dependency; no production deletion implementation is supplied. @param selection - Source range. @returns Actual range start after raw deletion. */
  ImpDeleteSelection(selection: EditSelection): EditPaM {
    this.deleted.push(new EditSelection(selection));
    expect(selection.Min().GetNode()).toBe(selection.Max().GetNode());
    this.maEditDoc.RemoveChars(
      selection.Min(),
      selection.Max().GetIndex() - selection.Min().GetIndex(),
    );
    return new EditPaM(selection.Min());
  }
  /** Explicit prepared word-boundary result, with no inferred/heuristic boundary. @param selection - Source caret. @param wordType - Actual WordType. @returns Prepared actual selection. */
  SelectWord(selection: EditSelection, wordType: number): EditSelection {
    expect(wordType).toBe(DICTIONARY_WORD);
    expect(selection.HasRange()).toBe(false);
    if (!this.wordSelection) throw new Error("Prepare the source word boundary dependency.");
    return new EditSelection(this.wordSelection);
  }
  /** Records original compound undo entry; no manager behavior is fabricated. @param id - Actual source identifier. @returns Nothing. */
  UndoActionStart(id: number): void {
    this.undoEvents.push(id);
  }
  /** Records original compound undo exit. @returns Nothing. */
  UndoActionEnd(): void {
    this.undoEvents.push(-1);
  }
  /** Records ownership of actual concrete source actions. @param action - Actual source action. @param merge - Original omitted/default flag. @returns Nothing. */
  InsertUndo(action: EditUndo, merge = false): void {
    expect(merge).toBe(false);
    this.actions.push(action);
  }
  /** Explicit fuzzing-state preparation. @param value - Source flag. @returns Nothing. */
  setFuzzing(value: boolean): void {
    this.mbFuzzing = value;
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
  override ImpInsertText(selection: EditSelection, value: OUStringConstReference): EditPaM {
    if (this.useActualInsertion) return super.ImpInsertText(selection, value);
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
    for (const action of this.actions) action.Dispose();
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

/** Reads actual expanded source paragraph values, without a parallel input parser. @param engine - Actual prepared owner. @returns Expanded paragraphs. */
function paragraphs(engine: PreparedEngine): string[] {
  const result: string[] = [],
    doc = engine.GetEditDoc();
  for (let index = 0; index < doc.Count(); index++) {
    const value = doc.GetParaAsString(index);
    try {
      result.push(text(value));
    } finally {
      value.dispose();
    }
  }
  return result;
}

it("inserts normalized multiline text through SetText with actual tab features and source notifications", /** No regex paragraph splitter or prepared parser participates. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    value = unicode("A\tB\r\n\rC\nD\rE\n"),
    notifications: EENotify[] = [];
  engine.useActualInsertion = true;
  engine.SetNotifyHdl(
    /** Captures original per-call values. @param event - Actual notification. @returns Nothing. */ (
      event,
    ) => notifications.push(new EENotify(event)),
  );
  try {
    engine.SetText(value);
    expect(paragraphs(engine)).toEqual(["A\tB", "", "C", "D", "E", ""]);
    expect(engine.GetParaPortions().Count()).toBe(6);
    const first = engine.GetEditDoc().GetObject(0) as ContentNode;
    expect(text(first.GetString())).toBe("A\u0001B");
    expect(first.GetCharAttribs().GetAttribs()[0]?.Which()).toBe(EE_FEATURE_TAB);
    expect(engine.actions).toHaveLength(0);
    expect(engine.undoEvents).toEqual([111, -1]);
    expect(
      notifications
        .filter(
          /** Selects source paragraph insertions. @param event - Actual value. @returns Predicate. */ (
            event,
          ) => event.eNotificationType === Notification.EE_NOTIFY_PARAGRAPHINSERTED,
        )
        .map(
          /** Reads actual paragraph index. @param event - Actual value. @returns Index. */ (
            event,
          ) => event.nParagraph,
        ),
    ).toEqual([0, 1, 2, 3, 4, 5]);
    expect(
      notifications.filter(
        /** Selects source text notifications. @param event - Actual value. @returns Predicate. */ (
          event,
        ) => event.eNotificationType === Notification.EE_NOTIFY_TEXTMODIFIED,
      ),
    ).toHaveLength(6);
  } finally {
    value.dispose();
    engine.dispose();
  }
});

it("retains LF inside a single-line engine and replaces tabs only in the source fuzzing branch", /** Single-line mode prevents paragraph tokenization; fuzzing does not alter other characters. @returns Nothing. */ () => {
  const engine = new PreparedOuter().implementation,
    value = unicode("a\r\nb\tc");
  engine.useActualInsertion = true;
  engine.GetStatus().TurnOnFlags(Control.SINGLELINE);
  try {
    engine.SetText(value);
    expect(paragraphs(engine)).toEqual(["a\nb\tc"]);
    expect(text((engine.GetEditDoc().GetObject(0) as ContentNode).GetString())).toBe("a\nb\u0001c");
    engine.setFuzzing(true);
    engine.SetText(value);
    expect(paragraphs(engine)).toEqual(["a\nb-c"]);
    expect(
      (engine.GetEditDoc().GetObject(0) as ContentNode).GetCharAttribs().GetAttribs(),
    ).toHaveLength(0);
  } finally {
    value.dispose();
    engine.dispose();
  }
});

it("retries the same input in the next paragraph at zero remaining capacity and records exact source undo actions", /** The empty first insert is retained before paragraph splitting. @returns Nothing. */ () => {
  const engine = new PreparedOuter().implementation,
    value = unicode("YZ"),
    doc = engine.GetEditDoc(),
    node = doc.GetObject(0) as ContentNode;
  engine.useActualInsertion = true;
  node.Append(new Uint16Array(MAXCHARSINPARA).fill(120));
  try {
    const end = engine.ImpInsertText(new EditSelection(doc.GetEndPaM()), value);
    expect(paragraphs(engine)).toEqual(["x".repeat(MAXCHARSINPARA), "YZ"]);
    expect(engine.CreateEPaM(end)).toEqual(new EPaM(1, 2));
    expect(
      engine.actions.map(
        /** Reads source action identity. @param action - Actual owned action. @returns ID. */ (
          action,
        ) => action.GetId(),
      ),
    ).toEqual([106, 105, 106]);
    expect(engine.actions[0]).toBeInstanceOf(EditUndoInsertChars);
    expect(engine.actions[1]).toBeInstanceOf(EditUndoSplitPara);
    expect(engine.undoEvents).toEqual([111, -1]);
  } finally {
    value.dispose();
    engine.dispose();
  }
});

it("still performs compound entry, selection update and notification for an empty direct insertion", /** Empty direct insertion differs from SetText's empty fast path. @returns Nothing. */ () => {
  const engine = new PreparedOuter().implementation,
    value = unicode(""),
    doc = engine.GetEditDoc(),
    notifications: EENotify[] = [];
  engine.useActualInsertion = true;
  engine.SetNotifyHdl(
    /** Captures original event. @param event - Actual value. @returns Nothing. */ (event) =>
      notifications.push(event),
  );
  doc.SetModified(false);
  try {
    const result = engine.InsertText(new EditSelection(doc.GetStartPaM()), value);
    expect(result.GetIndex()).toBe(0);
    expect(engine.undoEvents).toEqual([111, -1]);
    expect(engine.actions).toHaveLength(0);
    expect(doc.IsModified()).toBe(false);
    expect(
      notifications.map(
        /** Reads source event type. @param event - Actual value. @returns Type. */ (event) =>
          event.eNotificationType,
      ),
    ).toEqual([Notification.EE_NOTIFY_TEXTMODIFIED]);
  } finally {
    value.dispose();
    engine.dispose();
  }
});

it("uses actual insertion after the mandatory range-deletion dependency and preserves undo action selection calls", /** Prepared range deletion is explicit; the actual source insertion and action bodies execute. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    value = unicode("XY\tZ"),
    node = engine.GetEditDoc().GetObject(0) as ContentNode,
    view = new PreparedView();
  engine.useActualInsertion = true;
  engine.mpActiveView = view;
  node.Append(Uint16Array.of(97, 98, 99, 100, 101, 102));
  try {
    const result = outer.InsertText(
      new EditSelection(new EditPaM(node, 2), new EditPaM(node, 4)),
      value,
    );
    expect(result.GetIndex()).toBe(6);
    expect(paragraphs(engine)).toEqual(["abXY\tZef"]);
    expect(engine.deleted).toHaveLength(1);
    expect(engine.actions).toHaveLength(1);
    const action = engine.actions[0] as EditUndoInsertChars;
    const comment = action.GetComment();
    try {
      expect(text(comment)).toBe("Prepared 106");
    } finally {
      comment.dispose();
    }
    expect(action.GetViewShellId()).toBe(-1);
    expect(action.CanRepeat(null)).toBe(false);
    engine.SetUndoMode(true);
    action.UndoWithContext(null);
    expect(paragraphs(engine)).toEqual(["abef"]);
    expect([view.selection.Min().GetIndex(), view.selection.Max().GetIndex()]).toEqual([2, 2]);
    action.RedoWithContext(null);
    expect(paragraphs(engine)).toEqual(["abXY\tZef"]);
    expect([view.selection.Min().GetIndex(), view.selection.Max().GetIndex()]).toEqual([2, 6]);
    expect(engine.actions).toHaveLength(1);
  } finally {
    value.dispose();
    engine.dispose();
  }
});

it("copies right misspell ranges while retaining the original left ranges and exact split-boundary behavior", /** Source range transfer does not erase copied left ranges or move a range beginning exactly at the split. @returns Nothing. */ () => {
  const engine = new PreparedOuter().implementation,
    node = engine.GetEditDoc().GetObject(0) as ContentNode;
  node.Append(Uint16Array.of(97, 98, 99, 100, 101, 102, 103, 104));
  node.CreateWrongList();
  const wrongs = node.GetWrongList();
  if (!wrongs) throw new Error("Expected actual source WrongList.");
  wrongs.SetRanges([
    new MisspellRange(0n, 2n),
    new MisspellRange(2n, 6n),
    new MisspellRange(4n, 5n),
    new MisspellRange(6n, 8n),
    new MisspellRange(6n, 3n),
  ]);
  wrongs.SetValid();
  engine.EnableUndo(false);
  engine.GetStatus().TurnOnFlags(Control.ONLINESPELLING);
  try {
    const result = engine.ImpInsertParaBreak(new EditPaM(node, 4)),
      right = (result.GetNode() as ContentNode).GetWrongList();
    expect(paragraphs(engine)).toEqual(["abcd", "efgh"]);
    expect(wrongs.GetRanges()).toEqual([
      new MisspellRange(0n, 2n),
      new MisspellRange(2n, 4n),
      new MisspellRange(4n, 5n),
      new MisspellRange(6n, 8n),
      new MisspellRange(6n, 3n),
    ]);
    expect(right?.GetRanges()).toEqual([
      new MisspellRange(2n, 4n),
      new MisspellRange(2n, (1n << 64n) - 1n),
    ]);
    expect([wrongs.GetInvalidStart(), wrongs.GetInvalidEnd()]).toEqual([3n, 4n]);
    expect([right?.GetInvalidStart(), right?.GetInvalidEnd()]).toEqual([0n, 1n]);
  } finally {
    engine.dispose();
  }
});

it("requests the prepared dictionary boundary and applies actual ClearWrongs after spelling-enabled insertion", /** The boundary is supplied by the explicit dependency; no local word heuristic is invented. @returns Nothing. */ () => {
  const engine = new PreparedOuter().implementation,
    node = engine.GetEditDoc().GetObject(0) as ContentNode,
    value = unicode("X");
  node.Append(Uint16Array.of(97, 98, 99, 100, 101, 102));
  node.CreateWrongList();
  node.GetWrongList()?.SetRanges([new MisspellRange(0n, 6n)]);
  engine.useActualInsertion = true;
  engine.EnableUndo(false);
  engine.GetStatus().TurnOnFlags(Control.ONLINESPELLING);
  engine.wordSelection = new EditSelection(new EditPaM(node, 0), new EditPaM(node, 6));
  try {
    engine.ImpInsertText(new EditSelection(new EditPaM(node, 2)), value);
    expect(paragraphs(engine)).toEqual(["abXcdef"]);
    expect(node.GetWrongList()?.GetRanges()).toEqual([new MisspellRange(3n, 7n)]);
  } finally {
    value.dispose();
    engine.dispose();
  }
});

it("uses the real style listener on paragraph split and original split undo/redo calls", /** Explicit action/view fixture tests source ownership and active-view selection updates. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    engine = outer.implementation,
    node = engine.GetEditDoc().GetObject(0) as ContentNode,
    pool = new SfxStyleSheetPool(engine.GetEditDoc().GetItemPool()),
    name = unicode("Prepared split"),
    style = new SfxStyleSheet(name, pool, SfxStyleFamily.Para, SfxStyleSearchBits.UserDefined),
    view = new PreparedView();
  pool.Insert(style);
  node.SetStyleSheet(style);
  node.Append(Uint16Array.of(97, 98, 99, 100));
  engine.StartListening(style, DuplicateHandling.Allow);
  engine.mpActiveView = view;
  try {
    engine.ImpInsertParaBreak(new EditSelection(new EditPaM(node, 2)));
    expect(paragraphs(engine)).toEqual(["ab", "cd"]);
    expect(engine.GetBroadcasterCount()).toBe(2);
    expect(engine.GetParaPortions().Count()).toBe(2);
    const action = engine.actions[0] as EditUndoSplitPara;
    expect(action.GetId()).toBe(105);
    engine.SetUndoMode(true);
    action.Undo();
    expect(paragraphs(engine)).toEqual(["abcd"]);
    expect(view.selection.Max().GetIndex()).toBe(2);
    action.Redo();
    expect(paragraphs(engine)).toEqual(["ab", "cd"]);
    expect(view.selection.Max().GetNode()).toBe(engine.GetEditDoc().GetObject(1));
    expect(view.selection.Max().GetIndex()).toBe(0);
  } finally {
    engine.dispose();
    name.dispose();
  }
});

it("merges only matching source action types, paragraph IDs and exact adjacent positions", /** Source Merge has no whitespace or engine-pointer check. @returns Nothing. */ () => {
  const first = new PreparedOuter(),
    second = new PreparedOuter(),
    a = unicode("ab"),
    b = unicode("cd"),
    c = unicode("z"),
    left = new EditUndoInsertChars(first, new EPaM(0, 0), a),
    right = new EditUndoInsertChars(second, new EPaM(0, 2), b),
    otherPara = new EditUndoInsertChars(first, new EPaM(1, 4), c),
    gap = new EditUndoInsertChars(first, new EPaM(0, 5), c),
    split = new EditUndoSplitPara(first, 0, 2),
    view = new PreparedView();
  first.implementation.mpActiveView = view;
  first.implementation.useActualInsertion = true;
  first.implementation.EnableUndo(false);
  try {
    expect(left.Merge(split)).toBe(false);
    expect(left.Merge(otherPara)).toBe(false);
    expect(left.Merge(gap)).toBe(false);
    expect(left.Merge(right)).toBe(true);
    left.Redo();
    expect(paragraphs(first.implementation)).toEqual(["abcd"]);
    expect([view.selection.Min().GetIndex(), view.selection.Max().GetIndex()]).toEqual([0, 4]);
  } finally {
    left.Dispose();
    right.Dispose();
    otherPara.Dispose();
    gap.Dispose();
    a.dispose();
    b.dispose();
    c.dispose();
    first.implementation.dispose();
    second.implementation.dispose();
  }
});

it("returns the original caret unchanged at the source paragraph limit", /** No document split, undo action or notification is performed at EE_PARA_MAX. @returns Nothing. */ () => {
  const engine = new PreparedOuter().implementation,
    position = engine.GetEditDoc().GetStartPaM(),
    count = vi.spyOn(engine.GetEditDoc(), "Count").mockReturnValue(EE_PARA_MAX);
  try {
    expect(engine.ImpInsertParaBreak(position)).toBe(position);
    expect(engine.actions).toHaveLength(0);
    expect(engine.GetParaPortions().Count()).toBe(1);
  } finally {
    count.mockRestore();
    engine.dispose();
  }
});

it("retains the original insertion-start index when invalidating every later paragraph", /** Original aCurPaM is not reset after paragraph breaks; source call arguments are observed on real portions. @returns Nothing. */ () => {
  const engine = new PreparedOuter().implementation,
    node = engine.GetEditDoc().GetObject(0) as ContentNode,
    value = unicode("x\ny"),
    mark = vi.spyOn(ParaPortion.prototype, "MarkInvalid");
  engine.useActualInsertion = true;
  engine.EnableUndo(false);
  node.Append(Uint16Array.of(97, 98, 99));
  try {
    engine.ImpInsertText(new EditSelection(new EditPaM(node, 3)), value);
    expect(paragraphs(engine)).toEqual(["abcx", "y"]);
    expect(mark.mock.calls).toEqual([
      [3, 1],
      [4, 0],
      [3, 1],
    ]);
  } finally {
    mark.mockRestore();
    value.dispose();
    engine.dispose();
  }
});

it("captures the actual view-shell identity once and preserves null-engine action defaults", /** Action capture is separate from later active-view changes. @returns Nothing. */ () => {
  const outer = new PreparedOuter(),
    view = new PreparedView(),
    value = unicode("raw\u0000\ud800"),
    orphan = new EditUndoInsertChars(null, new EPaM(), value);
  view.shell = {
    GetViewShellId: /** Actual prepared shell identity. @returns Source ID. */ () => 42,
  };
  outer.implementation.mpActiveView = view;
  const action = new EditUndoInsertChars(outer, new EPaM(), value);
  try {
    outer.implementation.mpActiveView = null;
    expect(action.GetViewShellId()).toBe(42);
    expect(orphan.GetViewShellId()).toBe(-1);
    const comment = orphan.GetComment();
    try {
      expect(comment.isEmpty()).toBe(true);
    } finally {
      comment.dispose();
    }
    expect(orphan.Merge(null)).toBe(false);
  } finally {
    action.Dispose();
    orphan.Dispose();
    value.dispose();
    outer.implementation.dispose();
  }
});
