/** @fileoverview Native paragraph collection search strategy from findcoll.cxx and findfmt.cxx. */
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwTextFormatColl } from "../doc/fmtcol";
import { setTextFormatCollAtNode } from "../doc/docfmt";
import { SwUndoFormatColl } from "../undo/unfmco";
import type { SwUndoCursorState } from "../undo/undobj";
import type { FindRanges, SwDocPositions } from "../../../inc/cshtyp";
import type { SwPaM } from "./pam";
import {
  FIND_FOUND,
  FIND_NOT_FOUND,
  FIND_NO_RING,
  type SwCursor,
  type SwFindParas,
  type SwSearchNodeFilter,
} from "./swcrsr";

/** Native model-text format collection strategy for ordinary Writer nodes. */
class SwFindParaFormatColl implements SwFindParas {
  /** Creates a directional search strategy. @param format - Search collection. @param replacement - Optional native replacement. @param state - Displayed cursor state for undo. @param acceptsNode - Represented layout admission. @returns Native strategy. */
  public constructor(
    private readonly format: SwTextFormatColl,
    private readonly replacement: SwTextFormatColl | undefined,
    private readonly state: SwUndoCursorState,
    private readonly acceptsNode?: SwSearchNodeFilter,
  ) {}

  /** Selects one full matching paragraph and optionally changes its native collection. @param cursor - Result PaM. @param backward - Search direction. @param region - Native model range. @returns Native result flag. */
  public DoFind(cursor: SwPaM, backward: boolean, region: SwPaM): number {
    const first = region.Start();
    const last = region.End();
    const start = backward ? last : first;
    const nodes = first.GetNode().GetNodes();
    const node = start.GetNode();
    const end = backward ? first : last;
    const step = backward ? -1 : 1;
    const offset = start.GetContentIndex();
    let index = start.GetNodeIndex();
    // FindFormatImpl advances out of the initial paragraph at its directional edge.
    if (node instanceof SwTextNode && (backward ? offset === 0 : offset === node.Len()))
      index += step;
    let firstCandidate = true;
    for (; first.GetNodeIndex() <= index && index <= last.GetNodeIndex(); index += step) {
      const candidate = nodes.at(index);
      if (!(candidate instanceof SwTextNode)) continue;
      // GetNode accepts equality only for the first content position in the region.
      if (
        !firstCandidate &&
        index === end.GetNodeIndex() &&
        end.GetContentIndex() === (backward ? candidate.Len() : 0)
      )
        break;
      firstCandidate = false;
      if (this.acceptsNode?.(candidate) === false || candidate.GetTextFormatColl() !== this.format)
        continue;
      cursor.GetPoint().Assign(candidate, candidate.Len());
      cursor.SetMark();
      cursor.GetMark().SetContent(0);
      if (backward) cursor.Exchange();
      if (this.replacement === undefined) return FIND_FOUND;
      const undo = candidate.GetDoc().GetUndoManager();
      if (undo.DoesUndo())
        undo.AddUndoAction(new SwUndoFormatColl(cursor, this.replacement, this.state, this.state));
      setTextFormatCollAtNode(candidate, this.replacement, false);
      return FIND_NO_RING;
    }
    return FIND_NOT_FOUND;
  }

  /** Reports whether matches are replaced by the strategy. @returns Replacement mode. */
  public IsReplaceMode(): boolean {
    return this.replacement !== undefined;
  }
}

/** Runs the native format search over the cursor ring with a grouped style replacement. @param cursor - Native search cursor. @param format - Search collection. @param replacement - Optional replacement collection. @param start - Initial boundary. @param end - Final boundary. @param ranges - Native search ranges. @param state - Displayed cursor state. @param acceptsNode - Represented layout admission. @returns Match count. */
export function FindFormat(
  cursor: SwCursor,
  format: SwTextFormatColl,
  replacement: SwTextFormatColl | undefined,
  start: SwDocPositions,
  end: SwDocPositions,
  ranges: FindRanges,
  state: SwUndoCursorState,
  acceptsNode?: SwSearchNodeFilter,
): number {
  const doc = cursor.GetPoint().GetNode().GetDoc();
  const undo = doc.GetUndoManager();
  const record = replacement !== undefined && undo.DoesUndo();
  if (record) undo.StartUndo("Replace Style");
  try {
    const count = cursor.FindAll(
      new SwFindParaFormatColl(format, replacement, state, acceptsNode),
      start,
      end,
      ranges,
      [false],
    );
    if (count > 0 && replacement !== undefined) doc.GetDocumentStateManager().SetModified();
    return count;
  } finally {
    if (record) undo.EndUndo();
  }
}
