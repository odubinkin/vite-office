/**
 * @fileoverview Implements the supported IDocumentContentOperations subset at the pinned
 * LibreOffice `sw/source/core/doc/DocumentContentOperationsManager.cxx` ownership boundary.
 */

import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTextNode, type SwTextFragment } from "../txtnode/ndtxt";
import type { SwDoc } from "./doc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { sw_GetJoinFlags, sw_JoinText } from "./docedt";
import {
  RES_PARATR_LIST_ID,
  RES_PARATR_LIST_ISCOUNTED,
  WRITER_TEXT_NODE_WHICH_RANGES,
  RES_CHRATR_BEGIN,
  RES_CHRATR_END,
} from "../../../inc/hintids";

/** Applies every supported canonical content mutation through SwPosition and SwPaM. */
export class DocumentContentOperationsManager {
  /** Binds the operation manager to exactly one canonical document graph. @param document - Owning SwDoc. @returns Nothing. */
  public constructor(private readonly document: SwDoc) {}

  /** Replaces a same-node point-and-mark range with native Writer text and hints. @param range - Model range to replace. @param replacement - Replacement content. @returns Whether content changed. */
  public ReplaceRange(range: SwPaM, replacement: SwTextFragment): boolean {
    const { end, node, start } = this.GetSameTextNodeRange(range, "replacement");
    const current = node.CaptureTextFragment(start, end);
    if (current.text === replacement.text && current.hints.equals(replacement.hints)) return false;
    node.ReplaceRange(start, end, replacement);
    return true;
  }

  /** Inserts plain text at the point of one Writer range. @param range - Collapsed or selected model range. @param text - Inserted plain text. @param mode - Native flags,default EMPTYEXPAND. @returns Whether content changed. */
  public InsertString(
    range: SwPaM | SwPosition,
    text: string,
    mode = SwInsertFlags.EMPTYEXPAND,
  ): boolean {
    if (text.length === 0) return false;
    const position = range instanceof SwPaM ? range.GetPoint() : range;
    const node = this.GetTextNode(position, "insertion");
    node.InsertText(text, position.GetContentIndex(), mode);
    return true;
  }

  /** Inserts a native Writer fragment at one canonical position. @param position - Insertion position. @param fragment - Text plus canonical hints. @returns Whether content changed. */
  public InsertTextFragment(position: SwPosition, fragment: SwTextFragment): boolean {
    if (fragment.text.length === 0 && fragment.hints.Count() === 0) return false;
    const node = this.GetTextNode(position, "fragment insertion");
    node.ReplaceRange(position.GetContentIndex(), position.GetContentIndex(), fragment);
    return true;
  }

  /** Deletes a same-node range without joining paragraphs. @param range - Model range to delete. @returns Whether content changed. */
  public DeleteRange(range: SwPaM): boolean {
    const { end, node, start } = this.GetSameTextNodeRange(range, "deletion");
    if (start === end) return false;
    node.EraseText(start, end - start);
    return true;
  }

  /** Deletes a registered body-text selection and joins its boundaries in native order. Nontext sections/redlines/marks and native Undo construction remain outside this kernel. @param range - Actual selected range. @returns Whether deleted. */
  public DeleteAndJoin(range: SwPaM): boolean {
    if (!range.HasMark()) return false;
    const { joinText, joinPrev } = sw_GetJoinFlags(range);
    if (!joinText) return this.DeleteRange(range);
    const start = range.Start(),
      end = range.End();
    const first = this.GetTextNode(start, "deletion"),
      last = this.GetTextNode(end, "deletion");
    const startOffset = start.GetContentIndex(),
      endOffset = end.GetContentIndex();
    const selected = this.document.nodes.entries().slice(first.GetIndex(), last.GetIndex() + 1);
    if (
      selected.some(
        /** Rejects unimplemented structural selection before mutation. @param node - Selected node. @returns Unsupported node or section. */
        (node) => !(node instanceof SwTextNode),
      )
    )
      throw new Error("Writer DeleteAndJoin requires text nodes in one section.");
    first.EraseText(startOffset);
    last.EraseText(0, endOffset);
    for (const node of selected.slice(1, -1))
      this.document.nodes.removeTextNode(node as SwTextNode);
    range.GetPoint().Assign(first, startOffset);
    sw_JoinText(range, joinPrev);
    const survivor = joinPrev ? last : first;
    range.GetPoint().Assign(survivor, startOffset);
    range.GetMark().Assign(survivor, startOffset);
    return true;
  }

  /** Splits a text node at one canonical position and inserts the trailing node. @param position - Split position. @returns Inserted trailing text node. */
  public SplitNode(position: SwPosition): SwTextNode {
    const source = this.GetTextNode(position, "split");
    const trailing = source.SplitContent(position.GetContentIndex());
    source.GetNodes().insertTextNodeAfter(source, trailing);
    return trailing;
  }

  /** Joins an adjacent trailing paragraph into its predecessor. @param preceding - Surviving text node. @param trailing - Removed adjacent text node. @returns Join offset in the surviving node. */
  public JoinTextNodes(preceding: SwTextNode, trailing: SwTextNode): number {
    this.AssertConnectedTextNode(preceding, "join predecessor");
    this.AssertConnectedTextNode(trailing, "join successor");
    if (
      preceding.GetNodes() !== trailing.GetNodes() ||
      trailing.GetIndex() !== preceding.GetIndex() + 1
    )
      throw new Error("Writer join requires adjacent SwTextNodes in one document.");
    const offset = preceding.Len();
    if (offset !== 0) trailing.FormatToTextAttr(preceding);
    else {
      preceding.ResetAttr(RES_CHRATR_BEGIN, RES_CHRATR_END - 1);
      const direct = trailing.GetpSwAttrSet();
      if (direct !== undefined) {
        const items = new SfxItemSet(this.document.GetAttrPool(), [
          [RES_CHRATR_BEGIN, RES_CHRATR_END - 1],
        ]);
        items.PutSet(direct);
        preceding.SetAttr(items);
      }
    }
    preceding.AppendTextNode(trailing);
    preceding.GetNodes().removeTextNode(trailing);
    return offset;
  }

  /** Restores a detached trailing node after splitting the surviving prefix. @param preceding - Current joined node. @param offset - Original join offset. @param trailing - Detached node retained by undo. @returns Nothing. */
  public RestoreJoinedTextNode(preceding: SwTextNode, offset: number, trailing: SwTextNode): void {
    this.AssertConnectedTextNode(preceding, "join undo");
    if (trailing.GetDoc() !== this.document)
      throw new Error("Writer join undo node belongs to another document.");
    if (trailing.GetNodes().indexOfOrUndefined(trailing) !== undefined)
      throw new Error("Writer join undo requires a detached trailing SwTextNode.");
    if (!Number.isInteger(offset) || offset < 0 || offset > preceding.Len())
      throw new Error("Writer join undo offset is outside its SwTextNode.");
    preceding.EraseText(offset);
    preceding.GetNodes().insertTextNodeAfter(preceding, trailing);
  }

  /** Replaces a provisional split result with the retained undo node identity. @param provisional - Newly connected split node. @param retained - Detached node retained by undo. @returns Nothing. */
  public RestoreSplitTextNode(provisional: SwTextNode, retained: SwTextNode): void {
    this.AssertConnectedTextNode(provisional, "split redo");
    if (retained.GetDoc() !== this.document)
      throw new Error("Writer split redo node belongs to another document.");
    if (retained.GetNodes().indexOfOrUndefined(retained) !== undefined)
      throw new Error("Writer split redo requires a detached retained SwTextNode.");
    const provisionalFragment = provisional.CaptureTextFragment(0, provisional.Len());
    const retainedFragment = retained.CaptureTextFragment(0, retained.Len());
    if (
      provisionalFragment.text !== retainedFragment.text ||
      !provisionalFragment.hints.equals(retainedFragment.hints)
    )
      throw new Error("Writer split redo retained node does not match the provisional split.");
    provisional.GetNodes().replaceTextNode(provisional, retained);
  }

  /** Copies a supported same-node range to one canonical insertion position. @param source - Source range. @param target - Destination position. @returns Inserted UTF-16 length. */
  public CopyRange(source: SwPaM, target: SwPosition): number {
    const { end, node, start } = this.GetSameTextNodeRange(source, "copy");
    const targetNode = this.GetTextNode(target, "copy destination");
    const fragment = node.CaptureTextFragment(start, end);
    targetNode.ReplaceRange(target.GetContentIndex(), target.GetContentIndex(), {
      text: fragment.text,
      hints: fragment.hints.CopyTo(this.document.GetAttrPool()),
    });
    return fragment.text.length;
  }

  /** Moves a supported same-node range to a position in the same document. @param source - Source range. @param target - Destination before removal. @returns Destination after the move. */
  public MoveRange(source: SwPaM, target: SwPosition): SwPosition {
    const { end, node, start } = this.GetSameTextNodeRange(source, "move");
    const targetNode = this.GetTextNode(target, "move destination");
    const targetOffset = target.GetContentIndex();
    if (targetNode === node && targetOffset >= start && targetOffset <= end)
      throw new Error("Writer cannot move a range into itself.");
    if (targetNode !== node) {
      const fragment = node.CutTextFragment(start, end);
      targetNode.ReplaceRange(targetOffset, targetOffset, fragment, true);
      return new SwPosition(targetNode, targetOffset + fragment.text.length);
    }
    const fragment = node.CaptureTextFragment(start, end);
    node.EraseText(start, end - start);
    const adjustedOffset =
      targetNode === node && targetOffset > end ? targetOffset - (end - start) : targetOffset;
    targetNode.ReplaceRange(adjustedOffset, adjustedOffset, fragment);
    return new SwPosition(targetNode, adjustedOffset + fragment.text.length);
  }

  /** Resolves and validates one same-node text range. @param range - Candidate range. @param operation - Error context. @returns Ordered text range. */
  private GetSameTextNodeRange(
    range: SwPaM,
    operation: string,
  ): Readonly<{ end: number; node: SwTextNode; start: number }> {
    const start = range.Start();
    const end = range.End();
    const node = this.GetTextNode(start, operation);
    if (end.GetNode() !== node)
      throw new Error(`Writer ${operation} range must stay inside one SwTextNode.`);
    return { end: end.GetContentIndex(), node, start: start.GetContentIndex() };
  }

  /** Resolves a connected text node from one model position. @param position - Candidate position. @param operation - Error context. @returns Connected node. */
  private GetTextNode(position: SwPosition, operation: string): SwTextNode {
    const node = position.GetNode();
    if (!(node instanceof SwTextNode))
      throw new Error(`Writer ${operation} requires a SwTextNode.`);
    this.AssertConnectedTextNode(node, operation);
    return node;
  }

  /** Rejects detached nodes before a canonical mutation. @param node - Candidate text node. @param operation - Error context. @returns Nothing. */
  private AssertConnectedTextNode(node: SwTextNode, operation: string): void {
    if (node.GetDoc() !== this.document)
      throw new Error(`Writer ${operation} node belongs to another document.`);
    if (node.GetNodes().indexOfOrUndefined(node) === undefined)
      throw new Error(`Writer ${operation} requires a connected SwTextNode.`);
  }
}

/** Builds native reset defaults for registered character/paragraph/frame items, excluding list83..87. Languages, direction and other unregistered native items remain outside this profile. @param document - Owning attribute pool. @returns Independent deletion item set. */
export function createParagraphStyleResetSet(document: SwDoc): SfxItemSet {
  const pool = document.GetAttrPool();
  const result = new SfxItemSet(pool, WRITER_TEXT_NODE_WHICH_RANGES);
  for (const [start, end] of WRITER_TEXT_NODE_WHICH_RANGES)
    for (let which = start; which <= end; which++)
      if (which < RES_PARATR_LIST_ID || which > RES_PARATR_LIST_ISCOUNTED)
        result.Put(pool.GetUserOrPoolDefaultItem(which));
  return result;
}
