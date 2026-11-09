/** @fileoverview Single-row branch of native SwTable PrepareMerge and NewMerge. */
import { SwFormatFrameSize, SwFrameSize } from "../../../inc/fmtfsize";
import { SwNodeRange } from "../../../inc/ndindex";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { SwPosition } from "../crsr/pam";
import { DelBookmarks } from "../doc/docbm";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwTableBox, SwTableLine } from "./swtable-boxline";
import type { SwTable } from "./swtable";

/** A native single-row selection in node order. */
export interface SwBoxSelection {
  readonly line: SwTableLine;
  readonly boxes: readonly SwTableBox[];
  readonly mergeWidth: number;
}

/** Collects a connected same-row selection with no preexisting row spans. @param table - Actual owner. @param start - First endpoint. @param end - Last endpoint. @returns Actual connected selection or null. */
export function CollectBoxSelection(
  table: SwTable,
  start: SwTableBox,
  end: SwTableBox,
): SwBoxSelection | null {
  const line = start.GetUpper();
  if (!line || line !== end.GetUpper() || !table.GetTabLines().includes(line)) return null;
  const row = line.GetTabBoxes(),
    first = row.indexOf(start),
    last = row.indexOf(end);
  if (first < 0 || last <= first) return null;
  const boxes = row.slice(first, last + 1);
  let mergeWidth = 0;
  for (const box of boxes) {
    const section = box.GetStartNode(),
      nodes = section.GetNodes(),
      width = box.GetFrameFormat().GetFrameSize().GetWidth();
    if (
      box.getRowSpan() !== 1 ||
      width <= 0 ||
      section.EndOfSectionIndex() <= section.GetIndex() + 1
    )
      return null;
    for (let index = section.GetIndex() + 1; index < section.EndOfSectionIndex(); ++index)
      if (!nodes.at(index).IsTextNode()) return null;
    mergeWidth += width;
  }
  return { line, boxes, mergeWidth };
}

/** Original IsEmptyBox test for a lone empty text node with no paragraph or character fly. @param paragraph - First paragraph of the selected box. @param count - Paragraph count. @returns Whether the box is empty. */
function IsEmptyBox(paragraph: SwTextNode, count: number): boolean {
  if (count !== 1 || paragraph.Len() !== 0) return false;
  for (const format of paragraph.GetDoc().GetSpzFrameFormats()) {
    const anchor = format.GetAnchor();
    if (
      anchor.GetAnchorNode() === paragraph &&
      (anchor.GetAnchorId() === RndStdIds.FLY_AT_PARA ||
        anchor.GetAnchorId() === RndStdIds.FLY_AT_CHAR)
    )
      return false;
  }
  return true;
}

/** Moves the original paragraphs to the master and assigns its geometry and outside edges. @param selection - Validated native selection. @returns Master box. */
export function PrepareMerge(selection: SwBoxSelection): SwTableBox {
  const master = selection.boxes[0] as SwTableBox,
    destination = master.GetStartNode().EndOfSectionNode(),
    ops = destination.GetDoc().GetDocumentContentOperationsManager();
  for (const box of selection.boxes.slice(1)) {
    const paragraphs = box.GetParagraphs(),
      first = paragraphs[0] as SwTextNode;
    if (!IsEmptyBox(first, paragraphs.length)) {
      const last = paragraphs.at(-1) as SwTextNode,
        position = new SwPosition(last, last.Len());
      try {
        ops.AppendTextNode(position);
        const range = new SwNodeRange(first, position.GetNode());
        try {
          ops.MoveNodeRange(range, destination);
        } finally {
          range.Dispose();
        }
      } finally {
        position.Dispose();
      }
    }
    box.SetFrameSize(new SwFormatFrameSize(SwFrameSize.Variable, 0, 0));
  }
  master.SetFrameSize(new SwFormatFrameSize(SwFrameSize.Variable, selection.mergeWidth, 0));
  const outside = (selection.boxes.at(-1) as SwTableBox).GetFrameFormat().GetBox(),
    borders = master.GetBox();
  try {
    borders.SetLine(outside.GetRight(), SvxBoxItemLine.RIGHT);
    borders.SetLine(outside.GetBottom(), SvxBoxItemLine.BOTTOM);
    master.ClaimFrameFormat().SetFormatAttr(borders);
  } finally {
    borders.Dispose();
  }
  return master;
}

/** Deletes redundant cell sections after content and geometry have moved. @param table - Table owner. @param selection - Prepared selection. @param master - Surviving cell. @returns Nothing. */
export function NewMerge(table: SwTable, selection: SwBoxSelection, master: SwTableBox): void {
  table.SetHTMLTableLayout(null);
  const target = master.GetParagraphs()[0] as SwTextNode;
  for (const box of selection.boxes.slice(1).reverse()) {
    const start = box.GetStartNode(),
      end = start.EndOfSectionNode(),
      nodes = start.GetNodes();
    DelBookmarks(start, end);
    nodes.RemoveTableBox(
      table,
      selection.line,
      { box, nodes: nodes.entries().slice(start.GetIndex(), end.GetIndex() + 1) },
      target,
      0,
    );
  }
}
