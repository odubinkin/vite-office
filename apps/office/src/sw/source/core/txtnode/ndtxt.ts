/**
 * @fileoverview Implements canonical Writer text nodes at the pinned LibreOffice `sw/source/core/txtnode/ndtxt.cxx` ownership boundary.
 */

import {
  SvxAdjust,
  SvxAdjustItem,
  SvxFirstLineIndentItem,
  SvxRightMarginItem,
  SvxTextLeftMarginItem,
} from "../../../../editeng/source/items/paraitem";
import { SfxBoolItem, SfxInt16Item, SfxStringItem } from "../../../../svl/source/items/poolitem";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import {
  RES_PARATR_ADJUST,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_LEVEL,
  RES_PARATR_LIST_ISRESTART,
  RES_PARATR_LIST_RESTARTVALUE,
  RES_PARATR_NUMRULE,
} from "../../../inc/hintids";
import {
  WRITER_LIST_WHICH_RANGES,
  WRITER_MAX_LIST_LEVEL,
  type WriterParagraphListKind,
} from "../doc/list";
import { type SwTextFormatColl, type WriterParagraphStyle } from "../doc/fmtcol";
import { type SwNumRule } from "../doc/number";
import { SwContentNode, type SwStartNode } from "../docnode/node";
import type { SwNodes } from "../docnode/nodes";
import { SwContentIndexUpdateMode } from "../bastyp/contentindex";
import type { WriterHyperlink } from "./fmtinfmt";

/** Finds the grapheme start immediately before a caret. @param text - Paragraph text. @param offset - Current UTF-16 caret offset. @returns Previous grapheme boundary. */
export function getWriterPreviousGraphemeBoundary(text: string, offset: number): number {
  const boundaries = getWriterGraphemeBoundaries(text);
  let previous = 0;
  for (const boundary of boundaries) {
    if (boundary >= offset) return previous;
    previous = boundary;
  }
  /* v8 ignore next -- Boundary enumeration includes text.length for a valid cursor offset. */
  return previous;
}

/** Finds the grapheme end immediately after a caret. @param text - Paragraph text. @param offset - Current UTF-16 caret offset. @returns Next grapheme boundary. */
export function getWriterNextGraphemeBoundary(text: string, offset: number): number {
  for (const boundary of getWriterGraphemeBoundaries(text)) if (boundary > offset) return boundary;
  /* v8 ignore next -- Callers handle the text-end cursor before requesting a boundary. */
  return text.length;
}

/** Enumerates UTF-16 grapheme boundaries with a code-point fallback. @param text - Paragraph text. @returns Ordered boundaries including zero and text length. */
function getWriterGraphemeBoundaries(text: string): readonly number[] {
  const boundaries = [0];
  if (typeof Intl.Segmenter === "function") {
    const segments = new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text);
    for (const segment of segments) boundaries.push(segment.index + segment.segment.length);
    return boundaries;
  }
  let offset = 0;
  for (const character of text) {
    offset += character.length;
    boundaries.push(offset);
  }
  return boundaries;
}
import { SwNumRuleItem } from "../para/paratr";
import { SwpHints } from "./ndhints";
import { createWriterCharacterItemSet, projectWriterCharacterAttributes } from "./txatbase";

/** Names the bounded direct character attributes currently supported by the browser Writer. */
export const WRITER_CHARACTER_FORMATS = ["bold", "italic", "underline"] as const;

/** Identifies one supported direct Writer character attribute. */
export type WriterCharacterFormat = (typeof WRITER_CHARACTER_FORMATS)[number];

/** Native Writer text payload retained by model mutations and undo. */
export interface SwTextFragment {
  readonly text: string;
  readonly hints: SwpHints;
}

/** Enumerates the bounded paragraph alignments represented by RES_PARATR_ADJUST. */
export const WRITER_PARAGRAPH_ALIGNMENTS = ["left", "center", "right", "justify"] as const;

/** Identifies one supported horizontal paragraph alignment. */
export type WriterParagraphAlignment = (typeof WRITER_PARAGRAPH_ALIGNMENTS)[number];

/**
 * Owns one Writer paragraph's canonical text, paragraph items, format collection, and range hints.
 *
 * The compatibility `runs` accessor delegates to the separate immutable projection boundary.
 */
export class SwTextNode extends SwContentNode {
  private mText: string;
  private pSwpHints: SwpHints | undefined;

  /** Creates a text node in one Writer content section. @param nodes - Owning node array. @param startOfSection - Containing section. @param formatColl - Registered paragraph style. @param text - Initial canonical text. @returns Nothing. */
  public constructor(
    nodes: SwNodes,
    startOfSection: SwStartNode,
    formatColl: SwTextFormatColl = nodes.GetDoc().GetDfltTextFormatColl(),
    text = "",
  ) {
    super(nodes, startOfSection, formatColl);
    this.mText = text;
  }

  /** Returns the canonical node text. @returns Canonical text. */
  public GetText(): string {
    return this.mText;
  }

  /** Returns text length in UTF-16 code units, matching Writer content indices. @returns UTF-16 length. */
  public Len(): number {
    return this.mText.length;
  }

  /** Returns the optional direct-format hint container. @returns Owned hints, when allocated. */
  public GetpSwpHints(): SwpHints | undefined {
    return this.pSwpHints;
  }

  /** Returns an existing hint container or creates it lazily. @returns Owned hints. */
  public GetOrCreateSwpHints(): SwpHints {
    this.pSwpHints ??= new SwpHints(this.GetDoc().GetAttrPool());
    return this.pSwpHints;
  }

  /** Replaces canonical ranged attributes without accepting a browser run projection. @param hints - Writer text attributes. @returns Nothing. */
  public SetTextHints(hints: SwpHints): void {
    for (const hint of hints.entries())
      if (hint.end > this.mText.length)
        throw new Error("Writer text hint is outside the text node.");
    const replacement = hints.clone();
    this.pSwpHints = replacement.Count() === 0 ? undefined : replacement;
    this.GetDoc().NotifyModelChange({
      kind: "attribute-set-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Returns the paragraph adjustment item as a view-friendly value. @returns Paragraph alignment. */
  public GetParagraphAlignment(): WriterParagraphAlignment {
    const adjust = (this.GetAttr(RES_PARATR_ADJUST) as SvxAdjustItem).GetAdjust();
    return getWriterParagraphAlignment(adjust);
  }

  /** Returns the effective direct text-left margin in twips. @returns Text-left margin. */
  public GetParagraphTextLeftMargin(): number {
    return (this.GetAttr(RES_MARGIN_TEXTLEFT) as SvxTextLeftMarginItem).ResolveTextLeft();
  }
  /** Returns the effective first-line indent in twips. @returns First-line indent. */
  public GetParagraphFirstLineIndent(): number {
    return (
      this.GetAttr(RES_MARGIN_FIRSTLINE) as SvxFirstLineIndentItem
    ).ResolveTextFirstLineOffset();
  }
  /** Returns the effective right paragraph margin in twips. @returns Right margin. */
  public GetParagraphRightMargin(): number {
    return (this.GetAttr(RES_MARGIN_RIGHT) as SvxRightMarginItem).ResolveRight();
  }

  /** Returns the effective list family from the paragraph's SwNumRule. @returns List kind. */
  public GetListKind(): WriterParagraphListKind {
    const rule = this.GetNumRule();
    return rule === undefined ? "none" : rule.GetNumFormat(this.GetAttrListLevel()).GetKind();
  }

  /** Returns the SwNumRuleItem value applied to this text node. @returns Rule name, or an empty string. */
  public GetNumRuleName(): string {
    return (this.GetAttr(RES_PARATR_NUMRULE) as SwNumRuleItem).GetValue();
  }

  /** Resolves the paragraph's SwNumRuleItem through the owning document table. @returns Document-owned rule, when valid. */
  public GetNumRule(): SwNumRule | undefined {
    const ruleName = this.GetNumRuleName();
    return ruleName.length === 0 ? undefined : this.GetDoc().FindNumRulePtr(ruleName);
  }

  /** Returns the zero-based RES_PARATR_LIST_LEVEL value. @returns List level. */
  public GetAttrListLevel(): number {
    return (this.GetAttr(RES_PARATR_LIST_LEVEL) as SfxInt16Item).GetValue();
  }

  /** Sets the bounded RES_PARATR_LIST_LEVEL value. @param level - Zero-based list level. @returns Nothing. */
  public SetAttrListLevel(level: number): void {
    if (!Number.isInteger(level) || level < 0 || level > WRITER_MAX_LIST_LEVEL)
      throw new Error(`Writer list level is outside 0-${WRITER_MAX_LIST_LEVEL}.`);
    if (level === 0) this.ResetAttr(RES_PARATR_LIST_LEVEL);
    else this.SetAttr(new SfxInt16Item(RES_PARATR_LIST_LEVEL, level));
  }

  /** Sets Writer's direct list restart attributes. @param restart - Whether this item restarts. @param value - Optional explicit start value. @returns Nothing. */
  public SetListRestart(restart: boolean, value?: number): void {
    if (!restart) {
      this.ResetAttr(RES_PARATR_LIST_ISRESTART);
      this.ResetAttr(RES_PARATR_LIST_RESTARTVALUE);
      return;
    }
    this.SetAttr(new SfxBoolItem(RES_PARATR_LIST_ISRESTART, true));
    if (value === undefined) this.ResetAttr(RES_PARATR_LIST_RESTARTVALUE);
    else {
      if (!Number.isInteger(value) || value < 0 || value > 32_767)
        throw new Error("Writer list restart value is outside the supported range.");
      this.SetAttr(new SfxInt16Item(RES_PARATR_LIST_RESTARTVALUE, value));
    }
  }

  /** Reports Writer's list restart flag. @returns Restart state. */
  public IsListRestart(): boolean {
    return (this.GetAttr(RES_PARATR_LIST_ISRESTART) as SfxBoolItem).GetValue();
  }

  /** Reports whether an explicit restart value is directly set. @returns Direct-value state. */
  public HasAttrListRestartValue(): boolean {
    return this.GetpSwAttrSet()?.GetItemIfSet(RES_PARATR_LIST_RESTARTVALUE, false) !== undefined;
  }

  /** Returns the direct list restart value. @returns Explicit value. */
  public GetAttrListRestartValue(): number {
    if (!this.HasAttrListRestartValue()) throw new Error("Writer list restart value is not set.");
    return (this.GetAttr(RES_PARATR_LIST_RESTARTVALUE, false) as SfxInt16Item).GetValue();
  }

  /** Returns the explicit or format-defined list start value. @returns Effective start. */
  public GetActualListStartValue(): number {
    if (this.IsListRestart() && this.HasAttrListRestartValue())
      return this.GetAttrListRestartValue();
    return this.GetNumRule()?.GetNumFormat(this.GetAttrListLevel()).GetStart() ?? 1;
  }

  /** Returns RES_PARATR_LIST_ID, falling back to the rule's default list id like Writer. @returns Effective list identity. */
  public GetListId(): string {
    const direct = (this.GetAttr(RES_PARATR_LIST_ID) as SfxStringItem).GetValue();
    return direct.length > 0 ? direct : (this.GetNumRule()?.GetDefaultListId() ?? "");
  }

  /** Sets or resets RES_PARATR_LIST_ID. @param listId - Direct list identity. @returns Nothing. */
  public SetListId(listId: string): void {
    if (listId.length === 0) this.ResetAttr(RES_PARATR_LIST_ID);
    else this.SetAttr(new SfxStringItem(RES_PARATR_LIST_ID, listId));
  }

  /** Sets or resets RES_PARATR_NUMRULE without changing list id or level. @param ruleName - Document rule name. @returns Nothing. */
  public SetNumRule(ruleName: string): void {
    if (ruleName.length === 0) this.ResetAttr(RES_PARATR_NUMRULE);
    else this.SetAttr(new SwNumRuleItem(ruleName));
  }

  /** Returns the paragraph's text format collection identity. @returns Paragraph style identity. */
  public GetParagraphStyle(): WriterParagraphStyle {
    return this.GetTextFormatColl().id;
  }

  /** Sets the paragraph adjustment item. @param alignment - New paragraph alignment. @returns Nothing. */
  public SetParagraphAlignment(alignment: WriterParagraphAlignment): void {
    this.SetAttr(new SvxAdjustItem(getSvxAdjust(alignment), RES_PARATR_ADJUST));
  }

  /** Sets the direct text-left margin in twips. @param margin - Non-negative margin. @returns Nothing. */
  public SetParagraphTextLeftMargin(margin: number): void {
    this.SetAttr(new SvxTextLeftMarginItem(margin, RES_MARGIN_TEXTLEFT));
  }
  /** Sets the direct first-line indent in twips. @param indent - Signed first-line indent. @returns Nothing. */
  public SetParagraphFirstLineIndent(indent: number): void {
    this.SetAttr(new SvxFirstLineIndentItem(indent, RES_MARGIN_FIRSTLINE));
  }
  /** Sets the direct right paragraph margin in twips. @param margin - Non-negative right margin. @returns Nothing. */
  public SetParagraphRightMargin(margin: number): void {
    this.SetAttr(new SvxRightMarginItem(margin, RES_MARGIN_RIGHT));
  }

  /** Replaces the canonical numbering/list item subset captured by Writer undo. @param items - Direct list items. @returns Nothing. */
  public SetListItems(items: SfxItemSet): void {
    const previousListId = this.GetListId();
    if (previousListId.length > 0)
      this.GetDoc().GetDocumentListsManager().GetListByName(previousListId)?.RemoveListItem(this);
    for (const which of [
      RES_PARATR_NUMRULE,
      RES_PARATR_LIST_ID,
      RES_PARATR_LIST_LEVEL,
      RES_PARATR_LIST_ISRESTART,
      RES_PARATR_LIST_RESTARTVALUE,
    ])
      this.ResetAttr(which);
    this.SetAttr(items);
    const listId = this.GetListId();
    if (this.GetNumRule() !== undefined && listId.length > 0)
      this.GetDoc()
        .GetDocumentListsManager()
        .CreateList(this.GetNumRuleName(), listId)
        .InsertListItem(this, this.GetAttrListLevel());
  }

  /** Captures direct numbering/list items for exact undo/redo. @returns Independent item set. */
  public CaptureListItems(): SfxItemSet {
    const captured = new SfxItemSet(this.GetDoc().GetAttrPool(), WRITER_LIST_WHICH_RANGES);
    const attributes = this.GetpSwAttrSet();
    for (const which of [
      RES_PARATR_NUMRULE,
      RES_PARATR_LIST_ID,
      RES_PARATR_LIST_LEVEL,
      RES_PARATR_LIST_ISRESTART,
      RES_PARATR_LIST_RESTARTVALUE,
    ]) {
      const item = attributes?.GetItemIfSet(which, false);
      if (item !== undefined) captured.Put(item);
    }
    return captured;
  }

  /** Returns the document-owned list counter after validation. @returns One-based value for numbered list items. */
  public GetListItemNumber(): number | undefined {
    const listId = this.GetListId();
    if (listId.length === 0) return undefined;
    const list = this.GetDoc().GetDocumentListsManager().GetListByName(listId);
    if (list === undefined) return undefined;
    list.ValidateListTree(this.GetDoc().paragraphs);
    return list.GetListItemNumber(this);
  }

  /** Returns the model-owned visible list label after validating the number tree. @returns Bullet or formatted numeric label. */
  public GetListLabel(): string | undefined {
    const rule = this.GetNumRule();
    if (rule === undefined) return undefined;
    const level = this.GetAttrListLevel();
    const format = rule.GetNumFormat(level);
    if (format.GetNumberingType() === "char-special") return format.GetBulletChar();
    const list = this.GetDoc().GetDocumentListsManager().GetListByName(this.GetListId());
    if (list === undefined) return undefined;
    list.ValidateListTree(this.GetDoc().paragraphs);
    const numbers = list.GetListItemNumberVector(this);
    return numbers === undefined ? undefined : rule.MakeNumString(numbers, level);
  }

  /** Inserts text and adjusts direct-format hints using effective caret attributes. @param text - Inserted text. @param offset - UTF-16 insertion offset. @param attributes - Direct attributes for inserted text. @param hyperlink - Optional inherited hyperlink. @returns Inserted text. */
  public InsertText(
    text: string,
    offset: number,
    attributes = this.GetCharacterItemsAt(offset),
    hyperlink = this.getHyperlinkAt(offset),
  ): string {
    if (text.length === 0) return text;
    this.assertRange(offset, offset);
    const hints = this.GetTextHints().insertText(
      this.mText.length,
      offset,
      text.length,
      projectWriterCharacterAttributes(attributes),
      this.GetSwAttrSet(),
      hyperlink,
    );
    this.mText = `${this.mText.slice(0, offset)}${text}${this.mText.slice(offset)}`;
    this.pSwpHints = hints.Count() === 0 ? undefined : hints;
    this.UpdateContentIndices(offset, text.length);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
    return text;
  }

  /** Erases one bounded text range and adjusts all intersecting hints. @param start - Inclusive erase offset. @param count - Maximum erased length. @returns Nothing. */
  public EraseText(start: number, count = Number.MAX_SAFE_INTEGER): void {
    const end = Math.min(this.mText.length, start + count);
    this.assertRange(start, end);
    const removedLength = end - start;
    if (removedLength === 0) return;
    const hints = this.GetTextHints().replaceRange(
      this.mText.length,
      start,
      end,
      new SwpHints(this.GetDoc().GetAttrPool()),
      0,
    );
    this.mText = `${this.mText.slice(0, start)}${this.mText.slice(end)}`;
    this.pSwpHints = hints.Count() === 0 ? undefined : hints;
    this.UpdateContentIndices(start, removedLength, SwContentIndexUpdateMode.Negative);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Replaces one text range with caller-normalized direct-format runs. @param start - Inclusive replacement start. @param end - Exclusive replacement end. @param replacementRuns - Replacement content. @returns Nothing. */
  public ReplaceRange(start: number, end: number, replacement: SwTextFragment): void {
    this.assertRange(start, end);
    const replacementText = replacement.text;
    const removedLength = end - start;
    const hints = this.GetTextHints().replaceRange(
      this.mText.length,
      start,
      end,
      replacement.hints,
      replacementText.length,
    );
    this.mText = `${this.mText.slice(0, start)}${replacementText}${this.mText.slice(end)}`;
    this.pSwpHints = hints.Count() === 0 ? undefined : hints;
    if (removedLength > replacementText.length) {
      this.UpdateContentIndices(
        start + replacementText.length,
        removedLength - replacementText.length,
        SwContentIndexUpdateMode.Negative,
      );
    } else if (replacementText.length > removedLength) {
      this.UpdateContentIndices(
        start + removedLength,
        replacementText.length - removedLength,
        SwContentIndexUpdateMode.Replace,
      );
    }
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Replaces the complete node text and clears direct character hints. @param text - New canonical text. @returns Nothing. */
  public SetText(text: string): void {
    const previousText = this.mText;
    const previousLength = previousText.length;
    this.mText = text;
    this.pSwpHints = undefined;
    if (previousLength > text.length)
      this.UpdateContentIndices(
        text.length,
        previousLength - text.length,
        SwContentIndexUpdateMode.Negative,
      );
    else if (text.length > previousLength)
      this.UpdateContentIndices(
        previousLength,
        text.length - previousLength,
        SwContentIndexUpdateMode.Replace,
      );
    if (previousText !== text)
      this.GetDoc().NotifyModelChange({
        kind: "node-content-changed",
        nodeIndex: this.GetNodes().indexOfOrUndefined(this),
      });
  }

  /** Applies or removes one direct format over a non-empty range. @param start - Inclusive format start. @param end - Exclusive format end. @param format - Toggled direct property. @returns Nothing. */
  public ToggleTextRangeFormat(start: number, end: number, format: WriterCharacterFormat): void {
    this.assertRange(start, end);
    const hints = this.GetTextHints().toggleCharacterFormat(
      this.mText.length,
      start,
      end,
      format,
      this.GetSwAttrSet(),
    );
    this.pSwpHints = hints.Count() === 0 ? undefined : hints;
    this.GetDoc().NotifyModelChange({
      kind: "attribute-set-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Reads direct attributes inherited by a collapsed caret. @param offset - UTF-16 caret offset. @returns Effective direct attributes. */
  public GetCharacterItemsAt(offset: number): SfxItemSet {
    const attributes =
      this.pSwpHints === undefined
        ? new SwpHints(this.GetDoc().GetAttrPool()).getCharacterAttributes(
            this.mText,
            offset,
            this.GetSwAttrSet(),
          )
        : this.pSwpHints.getCharacterAttributes(this.mText, offset, this.GetSwAttrSet());
    return createWriterCharacterItemSet(this.GetDoc().GetAttrPool(), attributes);
  }

  /** Queries one direct character item over a native text range. @param start - Inclusive range start. @param end - Exclusive range end. @param format - Queried item group. @returns Uniform or mixed state. */
  public GetTextRangeFormatState(
    start: number,
    end: number,
    format: WriterCharacterFormat,
  ): "mixed" | "off" | "on" {
    this.assertRange(start, end);
    return this.GetTextHints().getCharacterFormatState(
      this.mText.length,
      start,
      end,
      format,
      this.GetSwAttrSet(),
    );
  }

  /** Reads the hyperlink inherited by a caret. @param offset - UTF-16 caret offset. @returns Hyperlink metadata or undefined. */
  public getHyperlinkAt(offset: number): WriterHyperlink | undefined {
    return this.pSwpHints?.getHyperlink(this.mText, offset);
  }

  /** Applies, replaces, or removes one hyperlink over a non-empty range. @param start - Inclusive range start. @param end - Exclusive range end. @param hyperlink - Replacement hyperlink or undefined to remove. @returns Nothing. */
  public SetHyperlink(start: number, end: number, hyperlink: WriterHyperlink | undefined): void {
    this.assertRange(start, end);
    if (start === end) return;
    const hints = this.GetTextHints().setHyperlink(this.mText.length, start, end, hyperlink);
    this.pSwpHints = hints.Count() === 0 ? undefined : hints;
    this.GetDoc().NotifyModelChange({
      kind: "attribute-set-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Splits this node at one content offset and returns an uninserted trailing sibling. @param offset - UTF-16 split offset. @returns Prepared trailing text node. */
  public SplitContent(offset: number): SwTextNode {
    this.assertRange(offset, offset);
    const prefix = this.CaptureTextFragment(0, offset);
    const suffix = this.CaptureTextFragment(offset, this.Len());
    const trailing = new SwTextNode(
      this.GetNodes(),
      this.StartOfSectionNode(),
      this.GetTextFormatColl().GetNextTextFormatColl(),
      suffix.text,
    );
    const directAttributes = this.GetpSwAttrSet();
    if (directAttributes !== undefined) trailing.SetAttr(directAttributes);
    trailing.pSwpHints = suffix.hints.Count() === 0 ? undefined : suffix.hints;
    this.mText = prefix.text;
    this.pSwpHints = prefix.hints.Count() === 0 ? undefined : prefix.hints;
    this.MoveContentIndicesFrom(trailing, offset);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
    return trailing;
  }

  /** Appends another text node's content while preserving its direct attributes. @param source - Appended text node. @returns Nothing. */
  public AppendTextNode(source: SwTextNode): void {
    if (source === this) throw new Error("SwTextNode cannot append itself.");
    if (source.GetNodes() !== this.GetNodes())
      throw new Error("Joined SwTextNodes belong to different documents.");
    const offset = this.Len();
    const joinedHints = new SwpHints(this.GetDoc().GetAttrPool(), [
      ...this.GetTextHints().entries(),
      ...source.GetTextHints().shifted(offset).entries(),
    ]);
    this.mText += source.mText;
    this.pSwpHints = joinedHints.Count() === 0 ? undefined : joinedHints;
    source.MoveAllContentIndicesTo(this, offset);
    this.GetDoc().NotifyModelChange({
      kind: "node-content-changed",
      nodeIndex: this.GetNodes().indexOfOrUndefined(this),
    });
  }

  /** Creates an independent text node in another document graph. @param nodes - Destination node array. @returns Detached clone. */
  public CloneTo(nodes: SwNodes): SwTextNode {
    const clone = new SwTextNode(
      nodes,
      nodes.GetEndOfContent().StartOfSectionNode(),
      nodes.GetDoc().GetTextFormatColl(this.GetParagraphStyle()),
    );
    const direct = this.GetpSwAttrSet();
    if (direct !== undefined) clone.SetAttr(direct);
    clone.SetText(this.mText);
    if (this.pSwpHints !== undefined) clone.SetTextHints(this.pSwpHints);
    return clone;
  }

  /** Captures text and direct hints without projecting through browser runs. @param start - Inclusive offset. @param end - Exclusive offset. @returns Native fragment. */
  public CaptureTextFragment(start: number, end: number): SwTextFragment {
    this.assertRange(start, end);
    return { text: this.mText.slice(start, end), hints: this.GetTextHints().slice(start, end) };
  }

  /** Creates a native insertion fragment from text and effective character items. @param text - Inserted text. @param attributes - Effective direct character state. @param hyperlink - Optional inserted hyperlink. @returns Native text/hint fragment. */
  public CreateTextFragmentFromText(
    text: string,
    attributes: SfxItemSet,
    hyperlink?: WriterHyperlink,
  ): SwTextFragment {
    const hints = new SwpHints(this.GetDoc().GetAttrPool()).createTextHints(
      text.length,
      projectWriterCharacterAttributes(attributes),
      this.GetSwAttrSet(),
      hyperlink,
    );
    return { text, hints };
  }

  /** Creates a native fragment with one toggled character item. @param start - Inclusive source offset. @param end - Exclusive source offset. @param format - Toggled item group. @returns Native formatted fragment. */
  public CreateToggledTextFragment(
    start: number,
    end: number,
    format: WriterCharacterFormat,
  ): SwTextFragment {
    const fragment = this.CaptureTextFragment(start, end);
    return {
      text: fragment.text,
      hints: fragment.hints.toggleCharacterFormat(
        fragment.text.length,
        0,
        fragment.text.length,
        format,
        this.GetSwAttrSet(),
      ),
    };
  }

  /** Creates a native fragment with a requested font family. @param start - Inclusive source offset. @param end - Exclusive source offset. @param family - Requested serialized family. @returns Native formatted fragment. */
  public CreateFontTextFragment(start: number, end: number, family: string): SwTextFragment {
    const fragment = this.CaptureTextFragment(start, end);
    return {
      text: fragment.text,
      hints: fragment.hints.setFontFamily(
        fragment.text.length,
        0,
        fragment.text.length,
        family,
        this.GetSwAttrSet(),
      ),
    };
  }

  /** Creates a native fragment with a requested font height. @param start - Inclusive source offset. @param end - Exclusive source offset. @param fontSizeTwips - Requested height in twips. @returns Native formatted fragment. */
  public CreateFontSizeTextFragment(
    start: number,
    end: number,
    fontSizeTwips: number,
  ): SwTextFragment {
    const fragment = this.CaptureTextFragment(start, end);
    return {
      text: fragment.text,
      hints: fragment.hints.setFontSize(
        fragment.text.length,
        0,
        fragment.text.length,
        fontSizeTwips,
        this.GetSwAttrSet(),
      ),
    };
  }

  /** Creates a native fragment with replacement hyperlink metadata. @param start - Inclusive source offset. @param end - Exclusive source offset. @param hyperlink - Replacement hyperlink or undefined. @returns Native formatted fragment. */
  public CreateHyperlinkTextFragment(
    start: number,
    end: number,
    hyperlink: WriterHyperlink | undefined,
  ): SwTextFragment {
    const fragment = this.CaptureTextFragment(start, end);
    return {
      text: fragment.text,
      hints: fragment.hints.setHyperlink(fragment.text.length, 0, fragment.text.length, hyperlink),
    };
  }

  /** Returns an independent native hint container, including the empty case. @returns Independent hints. */
  private GetTextHints(): SwpHints {
    return this.pSwpHints?.clone() ?? new SwpHints(this.GetDoc().GetAttrPool());
  }

  /** Validates a same-node UTF-16 range. @param start - Inclusive offset. @param end - Exclusive offset. @returns Nothing. */
  private assertRange(start: number, end: number): void {
    if (
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 0 ||
      end < start ||
      end > this.mText.length
    )
      throw new Error("Writer text range is outside the text node.");
  }
}

/** Checks a paragraph adjustment item read from storage or UI. @param value - Unknown runtime value. @returns True for a supported alignment. */
export function isWriterParagraphAlignment(value: unknown): value is WriterParagraphAlignment {
  return WRITER_PARAGRAPH_ALIGNMENTS.includes(value as WriterParagraphAlignment);
}

/** Converts a UI alignment to Writer's paragraph adjustment enum. @param alignment - Browser alignment. @returns SvxAdjust value. */
function getSvxAdjust(alignment: WriterParagraphAlignment): SvxAdjust {
  switch (alignment) {
    case "center":
      return SvxAdjust.Center;
    case "right":
      return SvxAdjust.Right;
    case "justify":
      return SvxAdjust.Block;
    default:
      return SvxAdjust.Left;
  }
}

/** Converts Writer's paragraph adjustment enum to the current browser projection. @param adjust - Effective SvxAdjust value. @returns Browser alignment. */
function getWriterParagraphAlignment(adjust: SvxAdjust): WriterParagraphAlignment {
  switch (adjust) {
    case SvxAdjust.Center:
      return "center";
    case SvxAdjust.Right:
    case SvxAdjust.ParaEnd:
    case SvxAdjust.End:
      return "right";
    case SvxAdjust.Block:
    case SvxAdjust.BlockLine:
      return "justify";
    default:
      return "left";
  }
}
