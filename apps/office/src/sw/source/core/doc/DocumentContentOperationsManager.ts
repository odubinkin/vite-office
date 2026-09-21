/**
 * @fileoverview Implements the supported IDocumentContentOperations subset at the pinned
 * LibreOffice `sw/source/core/doc/DocumentContentOperationsManager.cxx` ownership boundary.
 */

import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTextNode, type SwTextFragment } from "../txtnode/ndtxt";

/** Applies every supported canonical content mutation through SwPosition and SwPaM. */
export class DocumentContentOperationsManager {
  /** Replaces a same-node point-and-mark range with native Writer text and hints. @param range - Model range to replace. @param replacement - Replacement content. @returns Whether content changed. */
  public ReplaceRange(range: SwPaM, replacement: SwTextFragment): boolean {
    const { end, node, start } = this.GetSameTextNodeRange(range, "replacement");
    const current = node.CaptureTextFragment(start, end);
    if (current.text === replacement.text && current.hints.equals(replacement.hints)) return false;
    node.ReplaceRange(start, end, replacement);
    return true;
  }

  /** Inserts plain text at the point of one Writer range. @param range - Collapsed or selected model range. @param text - Inserted plain text. @returns Whether content changed. */
  public InsertString(range: SwPaM | SwPosition, text: string): boolean {
    if (text.length === 0) return false;
    const position = range instanceof SwPaM ? range.GetPoint() : range;
    const node = this.GetTextNode(position, "insertion");
    node.InsertText(text, position.GetContentIndex());
    return true;
  }

  /** Deletes a same-node range without joining paragraphs. @param range - Model range to delete. @returns Whether content changed. */
  public DeleteRange(range: SwPaM): boolean {
    const { end, node, start } = this.GetSameTextNodeRange(range, "deletion");
    if (start === end) return false;
    node.EraseText(start, end - start);
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
    preceding.AppendTextNode(trailing);
    preceding.GetNodes().removeTextNode(trailing);
    return offset;
  }

  /** Restores a detached trailing node after splitting the surviving prefix. @param preceding - Current joined node. @param offset - Original join offset. @param trailing - Detached node retained by undo. @returns Nothing. */
  public RestoreJoinedTextNode(preceding: SwTextNode, offset: number, trailing: SwTextNode): void {
    this.AssertConnectedTextNode(preceding, "join undo");
    if (!Number.isInteger(offset) || offset < 0 || offset > preceding.Len())
      throw new Error("Writer join undo offset is outside its SwTextNode.");
    preceding.EraseText(offset);
    preceding.GetNodes().insertTextNodeAfter(preceding, trailing);
  }

  /** Copies a supported same-node range to one canonical insertion position. @param source - Source range. @param target - Destination position. @returns Inserted UTF-16 length. */
  public CopyRange(source: SwPaM, target: SwPosition): number {
    const { end, node, start } = this.GetSameTextNodeRange(source, "copy");
    const targetNode = this.GetTextNode(target, "copy destination");
    if (targetNode.GetDoc() !== node.GetDoc())
      throw new Error("Writer copy range and destination belong to different documents.");
    const fragment = node.CaptureTextFragment(start, end);
    targetNode.ReplaceRange(target.GetContentIndex(), target.GetContentIndex(), fragment);
    return fragment.text.length;
  }

  /** Moves a supported same-node range to a position in the same document. @param source - Source range. @param target - Destination before removal. @returns Destination after the move. */
  public MoveRange(source: SwPaM, target: SwPosition): SwPosition {
    const { end, node, start } = this.GetSameTextNodeRange(source, "move");
    const targetNode = this.GetTextNode(target, "move destination");
    if (targetNode.GetDoc() !== node.GetDoc())
      throw new Error("Writer move range and destination belong to different documents.");
    const targetOffset = target.GetContentIndex();
    if (targetNode === node && targetOffset >= start && targetOffset <= end)
      throw new Error("Writer cannot move a range into itself.");
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
    if (node.GetNodes().indexOfOrUndefined(node) === undefined)
      throw new Error(`Writer ${operation} requires a connected SwTextNode.`);
  }
}
