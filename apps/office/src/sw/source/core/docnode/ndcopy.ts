/** @fileoverview In-document copying of text and table nodes in a native text section. */
import type { SwNode, SwStartNode, SwTableNode } from "./node";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwTableBox } from "../table/swtable";

/** Copies direct content, including table sections, before a native insertion boundary. @param source - Source section. @param target - Destination section. @param before - Connected destination boundary. @returns Copied paragraph count at this level. */
export function CopyNodes(source: SwStartNode, target: SwStartNode, before: SwNode): number {
  const nodes = source.GetNodes();
  if (
    nodes !== target.GetNodes() ||
    (source.GetIndex() <= target.GetIndex() && target.GetIndex() < source.EndOfSectionIndex())
  )
    throw new Error("Writer section copy needs distinct text sections in the same document.");
  let textCount = 0;
  for (const block of nodes.GetSectionContent(source)) {
    if (block instanceof SwTextNode) {
      const copy = block.CloneTo(nodes);
      copy.SetStartOfSection(target);
      nodes.insertTextNodeAfter(nodes.at(before.GetIndex() - 1), copy);
      textCount++;
    } else MakeTableCopy(block, before);
  }
  return textCount;
}

/** Clones the native table frame, flat row geometry and each cell's whole section. @param node - Source table node. @param before - Connected destination boundary. @returns Nothing. */
function MakeTableCopy(node: SwTableNode, before: SwNode): void {
  const nodes = node.GetNodes();
  const source = node.GetTable();
  const table = nodes.MakeTableNodeBefore(
    before,
    nodes.GetDoc().GetUniqueTableName(),
    source.GetFormat(),
  );
  table.GetFrameFormat().SetFormatAttrSet(source.GetFrameFormat().GetAttrSet());
  table.SetTableModel(source.IsNewModel());
  table.SetRowsToRepeat(source.GetRowsToRepeat());
  for (const line of source.GetTabLines()) {
    const boxes = line.GetTabBoxes();
    const row = nodes.AppendTableRow(table, boxes.length);
    row.GetFrameFormat().SetFormatAttrSet(line.GetFrameFormat().GetAttrSet());
    for (const [column, original] of boxes.entries()) {
      const box = row.GetTabBoxes()[column] as SwTableBox;
      box.GetFrameFormat().SetFormatAttrSet(original.GetFrameFormat().GetAttrSet());
      box.setRowSpan(original.getRowSpan());
      const start = box.GetStartNode();
      const placeholder = nodes.at(start.GetIndex() + 1) as SwTextNode;
      if (CopyNodes(original.GetStartNode(), start, placeholder)) nodes.removeTextNode(placeholder);
    }
  }
}
