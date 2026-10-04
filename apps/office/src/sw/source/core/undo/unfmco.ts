/** @fileoverview Implements paragraph style collection undo from pinned LibreOffice unfmco.cxx. */

import type { SwTextFormatColl, WriterParagraphStyle } from "../doc/fmtcol";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwPaM } from "../crsr/pam";
import { getTextFormatCollNodes, setTextFormatCollAtNode } from "../doc/docfmt";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwpHints } from "../txtnode/ndhints";
import { resetFullParagraphAutoFormat } from "../txtnode/txtedt";
import { WRITER_TEXT_NODE_WHICH_RANGES } from "../../../inc/hintids";
import { GetUndoTextNode, SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Captured paragraph collection, direct item and hint history for one native range node. */
interface FormatCollHistory {
  readonly paragraph: SwTextNode;
  readonly beforeStyle: WriterParagraphStyle;
  readonly beforeItems: SfxItemSet;
  readonly beforeHints: SwpHints;
  readonly beforeEmptyListStyle: boolean;
}

/** Reversible SwTextFormatColl assignment for the inclusive native paragraph range. */
export class SwUndoFormatColl extends SwUndo {
  private readonly history: readonly FormatCollHistory[];
  private readonly formatName: string;
  /** Captures one native range and requested collection display name. @param range - Target point/mark. @param collection - Requested collection. @param before - Cursor before formatting. @param after - Cursor after formatting. @param resetListAttrs - Native ordinary list-reset eligibility. @returns Nothing. */
  public constructor(
    range: SwPaM,
    collection: SwTextFormatColl,
    before: SwUndoCursorState,
    after: SwUndoCursorState,
    private readonly resetListAttrs = false,
  ) {
    super("Paragraph Style", before, after);
    this.formatName = collection.GetName();
    this.history = getTextFormatCollNodes(collection.GetAttrSet().GetDoc(), range).map(
      /** Captures actual per-node style/list ownership before application. @param paragraph - Selected node. @returns Original history. */
      (paragraph) => ({
        paragraph,
        beforeStyle: paragraph.GetParagraphStyle(),
        beforeItems:
          paragraph.GetpSwAttrSet()?.Clone() ??
          new SfxItemSet(paragraph.GetDoc().GetAttrPool(), WRITER_TEXT_NODE_WHICH_RANGES),
        beforeHints:
          paragraph.GetpSwpHints()?.clone() ?? new SwpHints(paragraph.GetDoc().GetAttrPool()),
        beforeEmptyListStyle: paragraph.IsEmptyListStyleDueToSetOutlineLevelAttr(),
      }),
    );
  }

  /** Reports collection identities, marker, direct items and retained hints. @returns Payload units. */
  public override GetPayloadSize(): number {
    return this.history.reduce(
      /** Counts retained paragraph collection/marker, item and hint payloads. @param size - Prior total. @param entry - Captured node. @returns Total payload units. */
      (size, entry) => size + 3 + entry.beforeItems.Count() + entry.beforeHints.Count(),
      0,
    );
  }

  /** Restores the original paragraph style collection. @param context - Active Writer context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    for (const entry of this.history) {
      const paragraph = GetUndoTextNode(document, entry.paragraph);
      paragraph.ChgFormatColl(document.GetTextFormatColl(entry.beforeStyle));
      paragraph.ResetAllAttr();
      if (entry.beforeItems.Count() !== 0) paragraph.SetAttr(entry.beforeItems);
      paragraph.SetTextHints(entry.beforeHints);
      if (entry.beforeEmptyListStyle) paragraph.SetEmptyListStyleDueToSetOutlineLevelAttr();
    }
  }

  /** Reapplies the paragraph style collection. @param context - Active Writer context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    const document = context.GetDoc();
    const nodes = this.history.map(
      /** Retains the undo graph guard before native named redo lookup. @param entry - Original range node. @returns Owned target. */
      (entry) => GetUndoTextNode(document, entry.paragraph),
    );
    const collection = document.FindTextFormatCollByName(this.formatName);
    if (collection !== undefined)
      for (const paragraph of nodes) {
        setTextFormatCollAtNode(paragraph, collection, this.resetListAttrs);
        resetFullParagraphAutoFormat(paragraph);
      }
  }
}
