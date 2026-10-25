/** @fileoverview Implements direct character and paragraph attribute undo from pinned LibreOffice unattr.cxx. */
import { SfxItemIter } from "../../../../svl/inc/itemiter";
import { SwClient, type SwModify } from "../../../inc/calbck";
import type { SwModelHint } from "../../../inc/hints";
import { SvxTabStopItem } from "../../../../editeng/inc/tstpitem";
import { RES_PARATR_TABSTOP, RES_CNTNT, POOLATTR_END } from "../../../inc/hintids";
import { SfxUndoAction } from "../../../../svl/source/undo/undo";
import type { SwTextFormatColl } from "../doc/fmtcol";
import type { SvxFontItem } from "../../../../editeng/inc/fontitem";
import type { SwTextFragment, SwTextNode, WriterParagraphAlignment } from "../txtnode/ndtxt";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { SwPaM, SwPosition } from "../crsr/pam";
import type { SwDoc } from "../doc/doc";
import { SwRegHistory, SwHistory } from "./rolbck";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { RES_CHRATR_BEGIN, RES_CHRATR_END } from "../../../inc/hintids";
import { getTextFormatCollNodes } from "../doc/docfmt";
import { SwpHints } from "../txtnode/ndhints";
import { clipHintOutsideRange } from "../txtnode/ndhints-range";
import { AssertTextNodeRange } from "../txtnode/ndtxt-hints";
import {
  ResetTextNodeHintItems,
  resetFullParagraphAutoFormat,
  resetParagraphTextAttributes,
} from "../txtnode/txtedt";
import {
  CopyTextFragment,
  CopyUndoFragment,
  GetFragmentPayloadSize,
  GetUndoFragmentLength,
  GetUndoTextNode,
  SwUndRng,
  SwUndo,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Native RES_CHRFMT reset history for StyleApply's full-node range, separate from collection history. */
export class SwUndoResetAttr extends SwUndo {
  private readonly m_rDoc: SwDoc;
  private readonly range: SwUndRng;
  private history: readonly Readonly<{ index: number; hints: SwpHints }>[];

  /** Captures the expanded range before initial exact text reset. @param range - Original inclusive paragraph range. @param state - Expanded full-node cursor state. @returns Nothing. */
  public constructor(range: SwPaM, state: SwUndoCursorState) {
    super("Reset Attributes", state, state);
    this.m_rDoc = state.point.node.GetDoc();
    this.range = new SwUndRng(range);
    this.history = getTextFormatCollNodes(state.point.node.GetDoc(), range).map(
      /** Captures independent native hint payload. @param node - Owned text node. @returns Hint history. */
      (node) => ({
        index: node.GetIndex(),
        hints: node.GetpSwpHints()?.clone() ?? new SwpHints(node.GetDoc().GetAttrPool()),
      }),
    );
  }

  /** Performs the initial exact reset without restoring a history cursor. @returns Nothing. */
  public ApplyExact(): void {
    this.history = this.history.map(
      /** Captures text reset at its own native boundary after collection/delete-set processing. @param entry - Range node. @returns Current hint history. */
      ({ index }) => {
        const node = this.m_rDoc.GetNodes().at(index) as SwTextNode;
        return {
          index,
          hints: node.GetpSwpHints()?.clone() ?? new SwpHints(node.GetDoc().GetAttrPool()),
        };
      },
    );
    for (const { index } of this.history)
      resetFullParagraphAutoFormat(this.m_rDoc.GetNodes().at(index) as SwTextNode);
  }

  /** Reports retained hint payload only. @returns Payload units. */
  public override GetPayloadSize(): number {
    return this.history.reduce(
      /** Counts native retained hints. @param size - Prior total. @param entry - Hint owner. @returns Total. */
      (size, entry) => size + entry.hints.Count(),
      0,
    );
  }

  /** Restores original hints before collection history rollback. @param context - Current native owner. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    for (const entry of this.history)
      GetUndoTextNode(
        context.GetDoc(),
        this.m_rDoc.GetNodes().at(entry.index) as SwTextNode,
      ).SetTextHints(entry.hints);
  }

  /** Uses native RES_CHRFMT redo's default non-exact reset, independent of collection name lookup. @param context - Current native owner. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc(),
      node = GetUndoTextNode(
        document,
        this.m_rDoc.GetNodes().at(this.range.m_nSttNode) as SwTextNode,
      ),
      point = new SwPosition(node, 0),
      range = new SwPaM(point);
    try {
      this.range.SetPaM(range);
      for (const current of getTextFormatCollNodes(document, range))
        resetParagraphTextAttributes(current);
    } finally {
      range.Dispose();
      point.Dispose();
    }
  }
}

/** Reversible direct character formatting over one same-node range. */
export class SwUndoAttr extends SwUndo {
  private readonly m_rDoc: SwDoc;
  private readonly m_nNode: number;
  private readonly afterFragment: SwTextFragment;
  private readonly beforeFragment: SwTextFragment;
  private readonly changedWhich = new Set<number>();
  private readonly directItems: SfxItemSet | undefined;
  private directHistory: SwHistory | undefined;

  /** Creates a direct-format action. @param paragraph - Target node. @param start - Formatted range start. @param beforeFragment - Original native fragment. @param afterFragment - Resulting native fragment. @param before - Cursor before formatting. @param after - Cursor after formatting. @param directItems - Full-node character set when the native paragraph branch applies. @returns Nothing. */
  public constructor(
    paragraph: SwTextNode,
    private readonly start: number,
    beforeFragment: SwTextFragment,
    afterFragment: SwTextFragment,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
    directItems?: SfxItemSet,
  ) {
    super("Character Formatting", before, after);
    this.directItems = directItems?.Clone();
    this.m_rDoc = paragraph.GetDoc();
    this.m_nNode = paragraph.GetIndex();
    this.beforeFragment = CopyUndoFragment(beforeFragment);
    this.afterFragment =
      directItems === undefined
        ? CopyUndoFragment(afterFragment)
        : {
            text: beforeFragment.text,
            hints:
              ResetTextNodeHintItems(paragraph, beforeFragment.hints, directItems) ??
              beforeFragment.hints.clone(),
          };
    const families = new Set(
      [...this.beforeFragment.hints.entries(), ...this.afterFragment.hints.entries()].map(
        /** Reads native ranged item identity. @param hint - Original snapshot attribute. @returns WhichId. */
        (hint) => hint.Which(),
      ),
    );
    for (const which of families) {
      const original = new SwpHints(
          paragraph.GetDoc().GetAttrPool(),
          this.beforeFragment.hints.entries().filter(
            /** Selects one original item family. @param hint - Snapshot attribute. @returns Whether selected. */
            (hint) => hint.Which() === which,
          ),
        ),
        replacement = new SwpHints(
          paragraph.GetDoc().GetAttrPool(),
          this.afterFragment.hints.entries().filter(
            /** Selects one replacement family. @param hint - Snapshot attribute. @returns Whether selected. */
            (hint) => hint.Which() === which,
          ),
        );
      if (!original.equals(replacement)) this.changedWhich.add(which);
    }
  }

  /** Performs the initial family-only mutation without restoring a history cursor; full native ResetAttrs history remains unverified. @returns Nothing. */
  public ApplyExact(): void {
    if (this.directItems === undefined) this.ApplyAttributes(this.m_rDoc, this.afterFragment);
    this.ApplyDirectItems(this.m_rDoc);
  }

  /** Reports changed range hints only. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return GetFragmentPayloadSize(this.beforeFragment) + GetFragmentPayloadSize(this.afterFragment);
  }

  /** Restores changed attributes without replacing text or splitting unrelated original owners. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    if (this.directHistory !== undefined) {
      this.directHistory.TmpRollback(context.GetDoc(), 0);
      this.directHistory.SetTmpEnd(this.directHistory.Count());
    }
    this.ApplyAttributes(context.GetDoc(), this.beforeFragment);
  }

  /** Reapplies changed attributes while preserving native text and unrelated hint identities. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    if (this.directItems === undefined) this.ApplyAttributes(context.GetDoc(), this.afterFragment);
    this.ApplyDirectItems(context.GetDoc());
  }

  /** Applies full-node character values through original attribute setters and registered old/reset history. @param document - Original document. @returns Nothing. */
  private ApplyDirectItems(document: SwDoc): void {
    if (this.directItems === undefined) return;
    const node = GetUndoTextNode(document, this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode);
    this.directHistory = new SwHistory();
    const recorder = new SwRegHistory(node, node, this.directHistory);
    try {
      resetParagraphTextAttributes(node, false, this.directItems);
      node.SetAttr(this.directItems);
    } finally {
      recorder.Dispose();
    }
  }

  /** Applies the represented ranged item-family delta; complete native SwHistory/InsertItemSet remains unverified. @param document - Current graph. @param fragment - Attribute snapshot. @returns Nothing. */
  private ApplyAttributes(document: SwDoc, fragment: SwTextFragment): void {
    const node = GetUndoTextNode(document, this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode),
      end = this.start + GetUndoFragmentLength(fragment);
    AssertTextNodeRange(node, this.start, end);
    if (this.changedWhich.size === 0) return;
    const hints = node.GetOrCreateSwpHints();
    for (const hint of hints.entries()) {
      if (
        !this.changedWhich.has(hint.Which()) ||
        (end === this.start
          ? hint.GetStart() !== this.start || hint.GetEnd() !== end
          : hint.GetEnd() <= this.start || hint.GetStart() >= end)
      )
        continue;
      hints.DeleteAtPos(hints.entries().indexOf(hint));
      if (end !== this.start)
        for (const retained of clipHintOutsideRange(hint, this.start, end)) hints.Insert(retained);
    }
    for (const hint of fragment.hints.entries()) {
      if (!this.changedWhich.has(hint.Which())) continue;
      const replacement = hint.clone();
      replacement.start += this.start;
      replacement.SetEnd(replacement.GetEnd() + this.start);
      hints.Insert(replacement);
    }
    hints.MergePortions(node);
    document.NotifyModelChange({ kind: "attribute-set-changed", nodeIndex: node.GetIndex() });
  }
}

/** Reversible replacement of one direct paragraph item, retaining inherited state. */
export class SwUndoParagraphItem extends SwUndo {
  private readonly m_rDoc: SwDoc;
  private readonly m_nNode: number;
  private readonly beforeItem: SfxPoolItem | undefined;
  private readonly afterItem: SfxPoolItem;
  /** Stores the direct item before and after a paragraph edit. @param paragraph - Target node. @param beforeItem - Previous direct item. @param afterItem - Replacement item. @param before - Prior cursor. @param after - Result cursor. */
  /** Handles Writer formatting state. @param paragraph - Input value. @param beforeItem - Input value. @param afterItem - Input value. @param before - Input value. @param after - Input value. @returns Callback result. */ public constructor(
    paragraph: SwTextNode,
    beforeItem: SfxPoolItem | undefined,
    afterItem: SfxPoolItem,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Paragraph Formatting", before, after);
    this.m_rDoc = paragraph.GetDoc();
    this.m_nNode = paragraph.GetIndex();
    this.beforeItem = beforeItem?.Clone() as SfxPoolItem | undefined;
    this.afterItem = afterItem.Clone() as SfxPoolItem;
  }

  /** Reports the scalar item pair. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 2;
  }

  /** Restores the previous direct or inherited item. @param context - Undo context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const node = GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
    );
    if (this.beforeItem === undefined) node.ResetAttr(this.afterItem.Which());
    else node.SetAttr(this.beforeItem);
  }

  /** Applies the replacement item. @param context - Undo context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
    ).SetAttr(this.afterItem);
  }
}

/** Builds a font-family range undo action. @param paragraph - Target node. @param start - Range start. @param end - Range end. @param family - Font family. @param before - Initial cursor. @param after - Final cursor. @returns Undo action or undefined for a no-op. */
export function CreateWriterFontUndo(
  paragraph: SwTextNode,
  start: number,
  end: number,
  family: string | SvxFontItem,
  before: SwUndoCursorState,
  after: SwUndoCursorState,
): SwUndoAttr | undefined {
  const beforeFragment = CopyTextFragment(paragraph, start, end);
  const afterFragment = paragraph.CreateFontTextFragment(start, end, family);
  return beforeFragment.hints.equals(afterFragment.hints)
    ? undefined
    : new SwUndoAttr(paragraph, start, beforeFragment, afterFragment, before, after);
}

/** Builds a font-height range undo action. @param paragraph - Target node. @param start - Range start. @param end - Range end. @param fontSizeTwips - Font height in twips. @param before - Initial cursor. @param after - Final cursor. @returns Undo action or undefined for a no-op. */
export function CreateWriterFontSizeUndo(
  paragraph: SwTextNode,
  start: number,
  end: number,
  fontSizeTwips: number,
  before: SwUndoCursorState,
  after: SwUndoCursorState,
): SwUndoAttr | undefined {
  const beforeFragment = CopyTextFragment(paragraph, start, end);
  const afterFragment = paragraph.CreateFontSizeTextFragment(start, end, fontSizeTwips);
  return beforeFragment.hints.equals(afterFragment.hints)
    ? undefined
    : new SwUndoAttr(paragraph, start, beforeFragment, afterFragment, before, after);
}

/** Reversible RES_PARATR_ADJUST change for one paragraph. */
export class SwUndoParagraphFormat extends SwUndo {
  private readonly m_rDoc: SwDoc;
  private readonly m_nNode: number;
  /** Creates one alignment action. @param paragraph - Target node. @param beforeAlignment - Original adjustment. @param afterAlignment - New adjustment. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    paragraph: SwTextNode,
    private readonly beforeAlignment: WriterParagraphAlignment,
    private readonly afterAlignment: WriterParagraphAlignment,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Paragraph Formatting", before, after);
    this.m_rDoc = paragraph.GetDoc();
    this.m_nNode = paragraph.GetIndex();
  }

  /** Reports two scalar item values. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 2;
  }

  /** Restores the previous paragraph adjustment. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
    ).SetParagraphAlignment(this.beforeAlignment);
  }

  /** Reapplies the paragraph adjustment. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.m_nNode) as SwTextNode,
    ).SetParagraphAlignment(this.afterAlignment);
  }
}

/** Original range margin action owns old native history and reexecutes the document mutation on redo. */
export class SwUndoMoveLeftMargin extends SwUndo {
  private readonly range: SwUndRng;
  private readonly m_rDoc: SwDoc;
  private readonly m_pHistory = new SwHistory();
  private readonly hasCursorState: boolean;
  /** Captures native range, direction and modulus, with an optional shell cursor adjunct. @param range - Original selection. @param right - Increase direction. @param m_bModulus - Snapping policy. @param state - Optional shell cursor state. @returns Nothing. */
  public constructor(
    range: SwPaM,
    private readonly right: boolean,
    private readonly m_bModulus: boolean,
    state?: SwUndoCursorState,
  ) {
    super("Move Left Margin", state, state);
    this.range = new SwUndRng(range);
    this.m_rDoc = range.GetPoint().GetNode().GetDoc();
    this.hasCursorState = state !== undefined;
  }
  /** Borrows the original retained history for initial registered mutation. @returns Original history. */
  public GetHistory(): SwHistory {
    return this.m_pHistory;
  }
  /** Reports native retained history entries rather than obsolete scalar margin pairs. @returns Entries. */
  public override GetPayloadSize(): number {
    return this.m_pHistory.Count();
  }
  /** Restores old direct/reset entries and reenables them for the next undo cycle. @param context - Native undo owner. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    this.m_pHistory.TmpRollback(this.GetDoc(context), 0);
    this.m_pHistory.SetTmpEnd(this.m_pHistory.Count());
    const range = this.AddUndoRedoPaM(context);
    range.Dispose();
  }
  /** Reexecutes native document semantics with current defaults and undo disabled by the manager. @param context - Native redo owner. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const range = this.AddUndoRedoPaM(context);
    try {
      context.GetDoc().MoveLeftMargin(range, this.right, this.m_bModulus);
    } finally {
      range.Dispose();
    }
  }
  /** Repeats the original command on the current repeat selection. @param context - Native repeat owner and selection. @returns Nothing. */
  public RepeatImpl(context: { GetDoc(): SwDoc; GetRepeatPaM(): SwPaM }): void {
    context.GetDoc().MoveLeftMargin(context.GetRepeatPaM(), this.right, this.m_bModulus);
  }
  /** Validates original document ownership before modifying history or constructing a range. @param context - Current undo owner. @returns Matching original document. */
  private GetDoc(context: SwUndoRedoContext): SwDoc {
    GetUndoTextNode(
      context.GetDoc(),
      this.m_rDoc.GetNodes().at(this.range.m_nSttNode) as SwTextNode,
    );
    return context.GetDoc();
  }
  /** Reconstructs the original numeric range against current native indices. @param context - Current graph and cursor destination. @returns Independent disposable native range. */
  private AddUndoRedoPaM(context: SwUndoRedoContext): SwPaM {
    const doc = this.GetDoc(context),
      position = new SwPosition(doc.GetNodes().at(this.range.m_nSttNode) as SwTextNode, 0),
      range = new SwPaM(position);
    position.Dispose();
    this.range.SetPaM(range);
    if (!this.hasCursorState)
      context.RestoreCursor({
        activeParagraph: range.GetPoint().GetNode() as SwTextNode,
        pendingCharacterItems: new SfxItemSet(doc.GetAttrPool(), [
          [RES_CHRATR_BEGIN, RES_CHRATR_END - 1],
        ]),
        point: {
          node: range.GetPoint().GetNode() as SwTextNode,
          offset: range.GetPoint().GetContentIndex(),
        },
        ...(range.HasMark()
          ? {
              mark: {
                node: range.GetMark().GetNode() as SwTextNode,
                offset: range.GetMark().GetContentIndex(),
              },
            }
          : {}),
      });
    return range;
  }
}

/** Native text-format history owns the old delta, including INVALID entries used by ChgFormat for newly authored items. */
export class SwUndoFormatAttr extends SfxUndoAction<SwUndoRedoContext> {
  public m_oOldSet: SfxItemSet | undefined;
  private readonly m_sFormatName: string;
  /** Original item-set rvalue or scalar constructor; the represented format family is paragraph collections. @param source - Transferred set or borrowed item. @param format - Original text collection. @returns Action. */
  public constructor(source: SfxItemSet | SfxPoolItem, format: SwTextFormatColl) {
    super();
    this.m_sFormatName = format.GetName();
    this.m_oOldSet =
      source instanceof SfxItemSet ? source : format.GetAttrSet().CloneAsValue(false);
    if (!(source instanceof SfxItemSet)) this.m_oOldSet.Put(source);
    // Original Init never retains a content-node index that can become stale.
    this.m_oOldSet.ClearItem(RES_CNTNT);
  }
  /** Original PutAttr overwrites previously recorded values and excludes content indices. @param item - Borrowed old item. @param doc - Original owner. @returns Nothing. */
  public PutAttr(item: SfxPoolItem, doc: SwDoc): void {
    void doc;
    if (item.Which() !== RES_CNTNT) this.m_oOldSet?.Put(item);
  }
  /** Retains the existing browser translation of this native undo operation. @returns Label. */
  public override GetComment(): string {
    return "Change Style Attributes";
  }
  /** Applies the native old set and captures the reverse delta through original format notifications. @param context - Current document. @returns Nothing. */
  public override UndoWithContext(context: SwUndoRedoContext): void {
    if (!this.m_oOldSet) return;
    const format = context.GetDoc().FindTextFormatCollByName(this.m_sFormatName);
    if (!format) return;
    const helper = new SwUndoFormatAttrHelper(format);
    try {
      format.SetFormatAttrSet(this.m_oOldSet);
      const undo = helper.GetUndo();
      if (undo?.m_oOldSet) {
        this.m_oOldSet = undo.m_oOldSet;
        undo.m_oOldSet = undefined;
      } else this.m_oOldSet.ClearItem();
    } finally {
      helper.Dispose();
    }
  }
  /** Original redo calls the same operation. @param context - Current document. @returns Nothing. */
  public override RedoWithContext(context: SwUndoRedoContext): void {
    this.UndoWithContext(context);
  }
}

/** Original text-format notification helper owns the captured SwUndoFormatAttr until its old set is transferred. */
export class SwUndoFormatAttrHelper extends SwClient {
  private m_pUndo: SwUndoFormatAttr | undefined;
  /** Registers the actual client on the actual text collection. @param m_rFormat - Borrowed collection. @returns Helper. */
  constructor(private readonly m_rFormat: SwTextFormatColl) {
    super();
    this.RegisterToModify(m_rFormat);
  }
  /** Borrows the captured native action. @returns Action or absence. */
  GetUndo(): SwUndoFormatAttr | undefined {
    return this.m_pUndo;
  }
  /** Original change and legacy-item callbacks retain native old-before-new admission. @param source - Notifying owner. @param hint - Original hint. @returns Nothing. */
  protected override SwClientNotify(source: SwModify, hint: SwModelHint): void {
    void source;
    if (hint.kind === "attr-set-change") {
      if (!hint.m_pOld || !hint.m_pNew) return;
      const set = hint.m_pOld.GetChgSet();
      if (!this.m_pUndo) this.m_pUndo = new SwUndoFormatAttr(new SfxItemSet(set), this.m_rFormat);
      else
        for (const iterator = new SfxItemIter(set); !iterator.IsAtEnd(); iterator.Next())
          this.m_pUndo.PutAttr(iterator.GetCurItem(), this.m_rFormat.GetDoc());
      return;
    }
    if (hint.kind === "object-dying")
      throw new Error("SwUndoFormatAttrHelper owner died during capture.");
    if (hint.kind !== "legacy-modify" || !hint.m_pOld || !hint.m_pNew) return;
    if (hint.m_pOld.Which() <= POOLATTR_END) {
      if (!this.m_pUndo) this.m_pUndo = new SwUndoFormatAttr(hint.m_pOld, this.m_rFormat);
      else this.m_pUndo.PutAttr(hint.m_pOld, this.m_rFormat.GetDoc());
    }
  }
}

/** Native default-attribute undo swaps via the default text collection's actual notification channel. */
export class SwUndoDefaultAttr extends SfxUndoAction<SwUndoRedoContext> {
  private m_oOldSet: SfxItemSet | undefined;
  private m_pTabStop: SvxTabStopItem | undefined;
  /** Original default undo captures tab stops separately because their values may be mutated in place. @param set - Old defaults. @param doc - Owning document. @returns Action. */
  constructor(set: SfxItemSet, doc: SwDoc) {
    super();
    void doc;
    const tabs = set.GetItemIfSet(RES_PARATR_TABSTOP, false) as SvxTabStopItem | undefined;
    if (tabs) {
      this.m_pTabStop = tabs.Clone();
      if (set.Count() !== 1) this.m_oOldSet = new SfxItemSet(set);
    } else this.m_oOldSet = new SfxItemSet(set);
  }
  /** Native default-attribute operation label. @returns Label. */
  public override GetComment(): string {
    return "Modify default values";
  }
  /** Original old-set notification transfer precedes the independent tab-stop swap. @param context - Current document. @returns Nothing. */
  public override UndoWithContext(context: SwUndoRedoContext): void {
    const doc = context.GetDoc();
    if (this.m_oOldSet) {
      const helper = new SwUndoFormatAttrHelper(doc.GetDfltTextFormatColl());
      try {
        doc.SetDefault(this.m_oOldSet);
        this.m_oOldSet = undefined;
        const captured = helper.GetUndo();
        if (captured?.m_oOldSet) {
          this.m_oOldSet = captured.m_oOldSet;
          captured.m_oOldSet = undefined;
        }
      } finally {
        helper.Dispose();
      }
    }
    if (this.m_pTabStop) {
      const old = doc.GetDefault(RES_PARATR_TABSTOP).Clone() as SvxTabStopItem;
      doc.SetDefault(this.m_pTabStop);
      this.m_pTabStop = old;
    }
  }
  /** Original redo reuses UndoImpl. @param context - Current document. @returns Nothing. */
  public override RedoWithContext(context: SwUndoRedoContext): void {
    this.UndoWithContext(context);
  }
}
