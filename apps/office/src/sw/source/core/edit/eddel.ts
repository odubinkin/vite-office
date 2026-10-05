/** @fileoverview Owns marked Writer selection deletion and flat-table cell boundaries from native eddel.cxx. */
import { SfxListUndoAction, type SfxUndoAction } from "../../../../svl/source/undo/undo";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwTableBoxStartNode } from "../docnode/node";
import { sw_GetJoinFlags } from "../doc/docedt";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwUndoDelete, type SwUndoDeleteDirection } from "../undo/undel";
import {
  createWriterCollapsedCursorState,
  createWriterUndoCursorState,
  type SwUndoCursorState,
  type SwUndoRedoContext,
} from "../undo/undobj";

/** Native delete history and sequential initial mutation; redo reuses the recorded children. */
export interface WriterDeleteSelectionOperation {
  readonly action: SfxUndoAction<SwUndoRedoContext>;
  readonly execute?: (context: SwUndoRedoContext) => void;
}

/** Prepares Delete/DeleteSel over actual marked ranges without joining different cells. @param cursor - Native editing ring. @param direction - Deletion direction. @param before - Shell state before deletion. @param after - Optional displayed table caret after entering standard mode. @returns Native operation or undefined for empty selections. */
export function createWriterDeleteSelectionOperation(
  cursor: SwPaM,
  direction: SwUndoDeleteDirection,
  before: SwUndoCursorState,
  after?: SwUndoCursorState,
): WriterDeleteSelectionOperation | undefined {
  const ranges = collectDeleteRanges(cursor);
  try {
    if (ranges.length === 0) return undefined;
    const endpoints = ranges.map(
      /** Normalizes native join direction and its surviving content position. @param range - Actual temporary PaM. @returns Post-delete cursor. */
      (range) => {
        const { joinPrev } = sw_GetJoinFlags(range);
        return createWriterCollapsedCursorState(
          (joinPrev ? range.End() : range.Start()).GetNode() as SwTextNode,
          range.Start().GetContentIndex(),
          before.pendingCharacterItems,
        );
      },
    );
    const final =
      after ??
      (cursor.IsMultiSelection() &&
      (!cursor.HasMark() || cursor.GetPoint().compare(cursor.GetMark()) === 0)
        ? createWriterCollapsedCursorState(
            cursor.GetPoint().GetNode() as SwTextNode,
            cursor.GetPoint().GetContentIndex(),
            before.pendingCharacterItems,
          )
        : (endpoints[
            cursor.IsMultiSelection() || direction === "backspace" ? 0 : endpoints.length - 1
          ] as SwUndoCursorState));
    if (!cursor.IsMultiSelection() && ranges.length === 1)
      return {
        action: createDeleteAction(
          ranges[0] as SwPaM,
          direction,
          before,
          before.tableSelection === true,
          final,
        ),
      };
    const group = new SfxListUndoAction<SwUndoRedoContext>("Delete");
    return {
      action: group,
      /** Captures each history payload at its actual post-previous-deletion node indices. @param context - Native shell context. @returns Nothing. */
      execute:
        /** Projects actual native table ownership. @param context - Current owner. @returns Operation result. */ (
          context,
        ) => {
          const currentRanges = collectDeleteRanges(cursor);
          try {
            for (let index = 0; index < currentRanges.length; index++) {
              const range = currentRanges[index] as SwPaM;
              sw_GetJoinFlags(range);
              const action = createDeleteAction(
                range,
                direction,
                before,
                index === 0,
                index === currentRanges.length - 1
                  ? final
                  : (endpoints[index] as SwUndoCursorState),
              );
              context.GetDoc().GetDocumentContentOperationsManager().DeleteAndJoin(range);
              action.SetAfterDelete(
                index === currentRanges.length - 1 ? cursor.GetPoint() : range.GetPoint(),
              );
              group.AddAction(action);
            }
            const point = cursor.GetPoint();
            context.RestoreCursor({
              ...final,
              activeParagraph: point.GetNode() as SwTextNode,
              point: { node: point.GetNode() as SwTextNode, offset: point.GetContentIndex() },
            });
          } finally {
            for (const range of currentRanges) range.Dispose();
          }
        },
    };
  } finally {
    for (const range of ranges) range.Dispose();
  }
}

/** Captures one normalized native DeleteSel history payload. @param range - Actual section range. @param direction - Deletion direction. @param before - Shell boundary. @param outerSelection - Whether this first child restores the complete original selection. @param after - Collapsed post-delete state. @returns Native delete action. */
function createDeleteAction(
  range: SwPaM,
  direction: SwUndoDeleteDirection,
  before: SwUndoCursorState,
  outerSelection: boolean,
  after: SwUndoCursorState,
): SwUndoDelete {
  const point = range.GetPoint(),
    mark = range.GetMark(),
    first = range.Start().GetNode() as SwTextNode,
    last = range.End().GetNode() as SwTextNode,
    offset = range.Start().GetContentIndex();
  const localBefore = createWriterUndoCursorState(
    point.GetNode() as SwTextNode,
    point.GetContentIndex(),
    mark.GetNode() as SwTextNode,
    mark.GetContentIndex(),
    point.GetNode() as SwTextNode,
    before.pendingCharacterItems,
  );
  return new SwUndoDelete(
    first,
    offset,
    first.GetText().slice(offset, first === last ? range.End().GetContentIndex() : undefined),
    direction,
    undefined,
    outerSelection ? before : localBefore,
    {
      ...after,
      activeParagraph: first,
      point: { node: first, offset },
    },
    first === last ? undefined : range,
  );
}

/** Collects native temporary selections, splitting only represented flat-table cross-cell spans. @param cursor - Real ring. @returns Independent owned PaMs. */
function collectDeleteRanges(cursor: SwPaM): SwPaM[] {
  const ranges: SwPaM[] = [];
  for (const current of cursor.GetRingContainer()) {
    if (!current.HasMark() || current.GetPoint().compare(current.GetMark()) === 0) continue;
    const start = current.Start(),
      end = current.End(),
      firstSection = start.GetNode().StartOfSectionNode(),
      lastSection = end.GetNode().StartOfSectionNode();
    if (
      firstSection instanceof SwTableBoxStartNode &&
      lastSection instanceof SwTableBoxStartNode &&
      firstSection !== lastSection &&
      firstSection.StartOfSectionNode() === lastSection.StartOfSectionNode()
    ) {
      const nodes = start.GetNode().GetNodes();
      let first = start.GetNode() as SwTextNode;
      for (;;) {
        const section = first.StartOfSectionNode(),
          lastCell = section === lastSection,
          last = (
            lastCell ? end.GetNode() : nodes.at(section.EndOfSectionNode().GetIndex() - 1)
          ) as SwTextNode,
          point = new SwPosition(last, lastCell ? end.GetContentIndex() : last.Len()),
          mark = new SwPosition(first, first === start.GetNode() ? start.GetContentIndex() : 0);
        try {
          if (point.compare(mark) !== 0) ranges.push(new SwPaM(point, mark));
        } finally {
          point.Dispose();
          mark.Dispose();
        }
        if (lastCell) break;
        first = nodes.at(section.EndOfSectionNode().GetIndex() + 2) as SwTextNode;
      }
    } else ranges.push(new SwPaM(current.GetPoint(), current.GetMark()));
  }
  return ranges;
}
