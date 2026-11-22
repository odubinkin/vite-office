/** @fileoverview Implements the complete-node range branch of native SwUndoMove. */
import { SwNodeRange } from "../../../inc/ndindex";
import type { SwNode } from "../docnode/node";
import { SwUndo, type SwUndoCursorState, type SwUndoRedoContext } from "./undobj";

/** Records the original and resulting numeric positions of a native node move. */
export class SwUndoMove extends SwUndo {
  private readonly start: number;
  private readonly end: number;
  private readonly moveDestination: number;
  private destinationStart = 0;
  private destinationEnd = 0;
  private insertionPosition = 0;

  /** Captures the original positions before the node array is reordered. @param range - Half-open node selection. @param destination - Insertion boundary. @param cursor - Editing position retained by the move. @returns Move action. */
  constructor(range: SwNodeRange, destination: SwNode, cursor: SwUndoCursorState) {
    super("Move chapter", cursor);
    this.start = range.aStart.GetIndex();
    this.end = range.aEnd.GetIndex();
    this.moveDestination = destination.GetIndex();
  }

  /** Captures where the complete range and its former successor ended up. @param start - Moved first node index. @param end - Exclusive moved end index. @param insertion - Original successor's new index. @param cursor - Shell position after the move. @returns Nothing. */
  public SetDestRange(
    start: number,
    end: number,
    insertion: number,
    cursor: SwUndoCursorState,
  ): void {
    this.destinationStart = start;
    this.destinationEnd = end;
    this.insertionPosition = insertion;
    this.SetAfterCursor(cursor);
  }

  /** Counts the original and resulting range and insertion positions. @returns Payload units. */
  public override GetPayloadSize(): number {
    return 6;
  }

  /** Moves the resulting range back to its original location. @param context - History context. @returns Nothing. */
  protected override UndoImpl(context: SwUndoRedoContext): void {
    this.Move(context, this.destinationStart, this.destinationEnd, this.insertionPosition);
  }

  /** Replays the move from the original positions. @param context - History context. @returns Nothing. */
  protected override RedoImpl(context: SwUndoRedoContext): void {
    this.Move(context, this.start, this.end, this.moveDestination);
  }

  /** Applies a half-open range using the document content operations owner. @param context - History context. @param start - Inclusive node index. @param end - Exclusive node index. @param destination - Insertion boundary index. @returns Nothing. */
  private Move(context: SwUndoRedoContext, start: number, end: number, destination: number): void {
    const document = context.GetDoc();
    const nodes = document.GetNodes();
    const range = new SwNodeRange(nodes, start, end);
    try {
      document.GetDocumentContentOperationsManager().MoveNodeRange(range, nodes.at(destination));
    } finally {
      range.Dispose();
    }
  }
}
