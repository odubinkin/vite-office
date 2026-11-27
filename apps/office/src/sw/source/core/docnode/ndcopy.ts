/** @fileoverview In-document copying of text and table nodes in a native text section. */
import type { SwNode, SwStartNode, SwTableNode } from "./node";
import { SwTextNode } from "../txtnode/ndtxt";
import type { SwTableBox } from "../table/swtable";
import { RES_CNTNT } from "../../../inc/hintids";
import { SwSectionNode } from "./ndsect";
import { SwSectionData } from "./section";

/** Copies direct content, including table sections, before a native insertion boundary. @param source - Source section. @param target - Destination section. @param before - Connected destination boundary. @returns Copied paragraph count at this level. */
export function CopyNodes(source: SwStartNode, target: SwStartNode, before: SwNode): number {
  const nodes = source.GetNodes();
  if (
    nodes !== target.GetNodes() ||
    (source.GetIndex() <= target.GetIndex() && target.GetIndex() < source.EndOfSectionIndex())
  )
    throw new Error("Writer section copy needs distinct text sections in the same document.");
  let textCount = 0;
  for (const block of nodes.GetSectionBlocks(source)) {
    if (block instanceof SwTextNode) {
      const copy = block.CloneTo(nodes);
      copy.SetStartOfSection(target);
      nodes.insertTextNodeAfter(nodes.at(before.GetIndex() - 1), copy);
      textCount++;
    } else if (block instanceof SwSectionNode) textCount += MakeSectionCopy(block, before);
    else MakeTableCopy(block, before);
  }
  return textCount;
}

/** Recursively copies a named section and its owned format without the source node index. @param original - Source section. @param before - Destination boundary. @returns Count of copied text nodes. */
function MakeSectionCopy(original: SwSectionNode, before: SwNode): number {
  const source = original.GetSection();
  const data = source.GetSectionData();
  const doc = before.GetDoc();
  const copyData = Object.assign(new SwSectionData(data.type, data.name), data, {
    name: doc.GetUniqueSectionName(data.name),
    password: data.password.slice(),
  });
  const copy = doc.GetNodes().InsertTextSection(before, copyData);
  const format = copy.GetSection().GetFormat();
  for (const item of source.GetFormat().GetAttrSet().entries()) {
    if (item.Which() !== RES_CNTNT) format.SetFormatAttr(item);
  }
  const initial = doc.GetNodes().at(copy.GetIndex() + 1) as SwTextNode;
  const count = CopyNodes(original, copy, initial);
  if (count) doc.GetNodes().removeTextNode(initial);
  return count || 1;
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
