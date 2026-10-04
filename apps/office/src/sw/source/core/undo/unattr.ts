/** @fileoverview Implements direct character and paragraph attribute undo from pinned LibreOffice unattr.cxx. */

import type { SwTextFragment, SwTextNode, WriterParagraphAlignment } from "../txtnode/ndtxt";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type { SwPaM } from "../crsr/pam";
import { getTextFormatCollNodes } from "../doc/docfmt";
import { SwpHints } from "../txtnode/ndhints";
import { resetFullParagraphAutoFormat, resetParagraphTextAttributes } from "../txtnode/txtedt";
import {
  CopyTextFragment,
  CopyUndoFragment,
  GetFragmentPayloadSize,
  GetUndoFragmentLength,
  GetUndoTextNode,
  ReplaceUndoRange,
  SwUndo,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "./undobj";

/** Native RES_CHRFMT reset history for StyleApply's full-node range, separate from collection history. */
export class SwUndoResetAttr extends SwUndo {
  private history: readonly Readonly<{ node: SwTextNode; hints: SwpHints }>[];

  /** Captures the expanded range before initial exact text reset. @param range - Original inclusive paragraph range. @param state - Expanded full-node cursor state. @returns Nothing. */
  public constructor(range: SwPaM, state: SwUndoCursorState) {
    super("Reset Attributes", state, state);
    this.history = getTextFormatCollNodes(state.point.node.GetDoc(), range).map(
      /** Captures independent native hint payload. @param node - Owned text node. @returns Hint history. */
      (node) => ({
        node,
        hints: node.GetpSwpHints()?.clone() ?? new SwpHints(node.GetDoc().GetAttrPool()),
      }),
    );
  }

  /** Performs the initial exact reset without restoring a history cursor. @returns Nothing. */
  public ApplyExact(): void {
    this.history = this.history.map(
      /** Captures text reset at its own native boundary after collection/delete-set processing. @param entry - Range node. @returns Current hint history. */
      ({ node }) => ({
        node,
        hints: node.GetpSwpHints()?.clone() ?? new SwpHints(node.GetDoc().GetAttrPool()),
      }),
    );
    for (const { node } of this.history) resetFullParagraphAutoFormat(node);
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
      GetUndoTextNode(context.GetDoc(), entry.node).SetTextHints(entry.hints);
  }

  /** Uses native RES_CHRFMT redo's default non-exact reset, independent of collection name lookup. @param context - Current native owner. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const nodes = this.history.map(
      /** Validates all nodes before mutation. @param entry - Hint owner. @returns Owned node. */
      (entry) => GetUndoTextNode(context.GetDoc(), entry.node),
    );
    for (const node of nodes) resetParagraphTextAttributes(node);
  }
}

/** Reversible direct character formatting over one same-node range. */
export class SwUndoAttr extends SwUndo {
  private readonly afterFragment: SwTextFragment;
  private readonly beforeFragment: SwTextFragment;

  /** Creates a direct-format action. @param paragraph - Target node. @param start - Formatted range start. @param beforeFragment - Original native fragment. @param afterFragment - Resulting native fragment. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private readonly start: number,
    beforeFragment: SwTextFragment,
    afterFragment: SwTextFragment,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Character Formatting", before, after);
    this.beforeFragment = CopyUndoFragment(beforeFragment);
    this.afterFragment = CopyUndoFragment(afterFragment);
  }

  /** Reports changed range hints only. @returns Approximate payload units. */
  public override GetPayloadSize(): number {
    return GetFragmentPayloadSize(this.beforeFragment) + GetFragmentPayloadSize(this.afterFragment);
  }

  /** Restores original formatted fragments. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start + GetUndoFragmentLength(this.afterFragment),
      this.beforeFragment,
    );
  }

  /** Reapplies formatted fragments. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    ReplaceUndoRange(
      context.GetDoc(),
      this.paragraph,
      this.start,
      this.start + GetUndoFragmentLength(this.beforeFragment),
      this.afterFragment,
    );
  }
}

/** Reversible replacement of one direct paragraph item, retaining inherited state. */
export class SwUndoParagraphItem extends SwUndo {
  /** Stores the direct item before and after a paragraph edit. @param paragraph - Target node. @param beforeItem - Previous direct item. @param afterItem - Replacement item. @param before - Prior cursor. @param after - Result cursor. */
  /** Handles Writer formatting state. @param paragraph - Input value. @param beforeItem - Input value. @param afterItem - Input value. @param before - Input value. @param after - Input value. @returns Callback result. */ public constructor(
    private readonly paragraph: SwTextNode,
    private readonly beforeItem: SfxPoolItem | undefined,
    private readonly afterItem: SfxPoolItem,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Paragraph Formatting", before, after);
  }

  /** Reports the scalar item pair. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 2;
  }

  /** Restores the previous direct or inherited item. @param context - Undo context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const node = GetUndoTextNode(context.GetDoc(), this.paragraph);
    if (this.beforeItem === undefined) node.ResetAttr(this.afterItem.Which());
    else node.SetAttr(this.beforeItem);
  }

  /** Applies the replacement item. @param context - Undo context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraph).SetAttr(this.afterItem);
  }
}

/** Builds a font-family range undo action. @param paragraph - Target node. @param start - Range start. @param end - Range end. @param family - Font family. @param before - Initial cursor. @param after - Final cursor. @returns Undo action or undefined for a no-op. */
export function CreateWriterFontUndo(
  paragraph: SwTextNode,
  start: number,
  end: number,
  family: string,
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
  /** Creates one alignment action. @param paragraph - Target node. @param beforeAlignment - Original adjustment. @param afterAlignment - New adjustment. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private readonly beforeAlignment: WriterParagraphAlignment,
    private readonly afterAlignment: WriterParagraphAlignment,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Paragraph Formatting", before, after);
  }

  /** Reports two scalar item values. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 2;
  }

  /** Restores the previous paragraph adjustment. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraph).SetParagraphAlignment(this.beforeAlignment);
  }

  /** Reapplies the paragraph adjustment. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraph).SetParagraphAlignment(this.afterAlignment);
  }
}

/** Reversible direct text-left margin change for one paragraph. */
export class SwUndoMoveLeftMargin extends SwUndo {
  /** Creates a margin action. @param paragraph - Target paragraph. @param beforeMargin - Original twip margin. @param afterMargin - New twip margin. @param before - Cursor before formatting. @param after - Cursor after formatting. @returns Nothing. */
  public constructor(
    private readonly paragraph: SwTextNode,
    private readonly beforeMargin: number,
    private readonly afterMargin: number,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
  ) {
    super("Move Left Margin", before, after);
  }

  /** Reports two scalar margin values. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 2;
  }

  /** Restores the previous direct text-left margin. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraph).SetParagraphTextLeftMargin(this.beforeMargin);
  }

  /** Reapplies the direct text-left margin. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    GetUndoTextNode(context.GetDoc(), this.paragraph).SetParagraphTextLeftMargin(this.afterMargin);
  }
}
