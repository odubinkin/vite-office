/** @fileoverview Native SwTableSortBoxes, DelBoxNode and layout-first SwTable::GetTableBox responsibility from swtable.hxx/swtable.cxx. */
import { SortedVector } from "../../../../o3tl/inc/sorted_vector";
import type { SwTable, SwTableBox } from "./swtable";
import { SwContentNode, SwTableNode } from "../docnode/node";
import { SwIterator } from "../../../inc/calbck";
import { SwFrame } from "../layout/wsfrm";
import { SwCellFrame } from "../layout/tabfrm";
const pointerIdentities = new WeakMap<SwTableBox, bigint>();
let nextPointerIdentity = 0n;
/** JS object references have no address ordering; intern a stable opaque total order for the native std::less pointer specialization. This is not node-index ordering or an exported native memory address. @param box - Actual object pointer. @returns Opaque pointer order. */
function PointerIdentity(box: SwTableBox): bigint {
  let identity = pointerIdentities.get(box);
  if (identity === undefined) {
    identity = nextPointerIdentity++;
    pointerIdentities.set(box, identity);
  }
  return identity;
}
/** Original non-owning unique pointer vector; only its table/row graph owns box destruction. */
export class SwTableSortBoxes extends SortedVector<SwTableBox> {
  /** Original pointer-comparator specialization over actual content-box identities. @returns Empty registry. */
  public constructor() {
    super(
      /** Compares opaque original pointer identities, never section indices. @param left - First actual pointer. @param right - Second actual pointer. @returns Strict pointer order. */ (
        left,
        right,
      ) => PointerIdentity(left) < PointerIdentity(right),
    );
  }
}
/** Original friend function clears content starts before table-owned rows/boxes are destroyed; it never deletes registry entries' objects. @param boxes - Actual table registry. @returns Nothing. */
export function DelBoxNode(boxes: SwTableSortBoxes): void {
  for (const box of boxes) box.SourceClearStartNode();
}
/** Original index overload scans the next content/table node, takes the first native frame and climbs to a cell, then falls back to reverse registry lookup. No table graph or nearest-cell substitute is used. @param table - Actual source table. @param startIndex - Native section index. @returns Actual cell box or absent. */
export function GetTableBoxByStartIndex(
  table: SwTable,
  startIndex: number,
): SwTableBox | undefined {
  if (!table.GetRegisteredIn()) return undefined;
  const nodes = table.GetFrameFormat().GetDoc().GetNodes();
  let index = startIndex + 1,
    modify: SwContentNode | ReturnType<SwTable["GetFrameFormat"]> | undefined;
  while (index < nodes.Count()) {
    const node = nodes.at(index);
    if (node instanceof SwTableNode) {
      if (node.GetTable().GetRegisteredIn()) modify = node.GetTable().GetFrameFormat();
      break;
    }
    if (node instanceof SwContentNode) {
      modify = node;
      break;
    }
    index++;
  }
  if (modify) {
    const iterator = new SwIterator(SwFrame, modify);
    let frame: SwFrame | undefined;
    try {
      frame = iterator.First();
    } finally {
      iterator.dispose();
    }
    while (frame && !(frame instanceof SwCellFrame)) frame = frame.GetUpper();
    if (frame instanceof SwCellFrame) return frame.GetTabBox();
  }
  const boxes = table.GetTabSortBoxes();
  for (let i = boxes.size(); i;) {
    const box = boxes.at(--i);
    if (box?.GetSttIdx() === startIndex) return box;
  }
  return undefined;
}
