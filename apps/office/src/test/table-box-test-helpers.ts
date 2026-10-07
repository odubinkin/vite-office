/** @fileoverview Migrates historical scalar table fixtures at the test boundary, outside kernel contracts. */
import {
  SvxBoxItem,
  SvxBoxInfoItem,
  SvxBoxInfoItemValidFlags,
} from "../editeng/source/items/frmitems";
import { SfxItemSet } from "../svl/source/items/itemset";
import { SID_ATTR_BORDER_INNER } from "../svx/inc/svxids";
import { RES_BOX } from "../sw/inc/hintids";
import type { SwTableBoxFormat } from "../sw/source/core/table/swtable";
import type { SwFormatVertOrient } from "../sw/inc/fmtornt";
import type { SwDoc } from "../sw/source/core/doc/doc";
import { SwCursor } from "../sw/source/core/crsr/swcrsr";
import { SwPosition } from "../sw/source/core/crsr/pam";
import { SwTableBoxStartNode, SwTableNode } from "../sw/source/core/docnode/node";
import { importBoxProperties, exportBorderShorthand } from "../xmloff/source/style/bordrhdl";

/** Historical fixture input, accepted only by test helpers. */
interface ScalarBoxFixture {
  readonly padding?: number | undefined;
  readonly border?: string | undefined;
  readonly vertOrient?: SwFormatVertOrient | undefined;
}
/** Converts an original historical fixture without changing its literal expectations. @param value - Old fixture. @param clearEdges - Source-proven cleared internal edges in operation expectations. @returns Native format. */
export function nativeBoxFormat(
  value: ScalarBoxFixture,
  clearEdges: readonly number[] = [],
): SwTableBoxFormat {
  const box = importBoxProperties(value, RES_BOX);
  for (const edge of clearEdges) box?.SetLine(undefined, edge);
  return {
    ...(box === undefined ? {} : { box }),
    ...(value.vertOrient === undefined ? {} : { vertOrient: value.vertOrient }),
  };
}
/** Projects the represented historical uniform fixture values for existing assertions. @param value - Native format. @returns Scalar test observation. */
export function tableBoxFormatForTest(value: SwTableBoxFormat): ScalarBoxFixture {
  if (value.box !== undefined)
    for (const edge of [1, 2, 3]) {
      const first = value.box.GetTop(),
        line = value.box.GetLine(edge);
      if (
        value.box.GetDistance(edge, true) !== value.box.GetDistance(0, true) ||
        (first === undefined
          ? line !== undefined
          : line === undefined ||
            !first.equals(line) ||
            first.GetScaledWidth() !== line.GetScaledWidth())
      )
        throw new Error(
          "Historical scalar observation requires a uniform native box; use explicit per-edge assertions.",
        );
    }
  return {
    ...(value.box === undefined
      ? {}
      : { padding: value.box.GetDistance(0), border: exportBorderShorthand(value.box.GetTop()) }),
    ...(value.vertOrient === undefined ? {} : { vertOrient: value.vertOrient }),
  };
}
/** Constructs native complete border items, retaining omitted historical fixture fields. @param doc - Pool owner. @param value - Historical operation fields. @param cursor - Original current cell, if valid. @returns Native item set. */
export function tableBorderItems(
  doc: SwDoc,
  value: ScalarBoxFixture,
  cursor?: SwCursor,
): SfxItemSet {
  const result = new SfxItemSet(doc.GetAttrPool(), [
    [RES_BOX, RES_BOX],
    [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
  ]);
  const section = cursor?.GetPoint().GetNode().StartOfSectionNode();
  const table =
    section instanceof SwTableBoxStartNode
      ? (section.StartOfSectionNode() as SwTableNode).GetTable()
      : undefined;
  const original = table
    ?.GetTabLines()
    .flatMap(
      /** Reads connected fixture boxes. @param row - Row. @returns Boxes. */
      (row) => row.GetTabBoxes(),
    )
    .find(
      /** Matches the original fixture point. @param box - Box. @returns Whether current. */ (
        box,
      ) => box.GetStartNode() === section,
    );
  const item = original?.GetBox() ?? new SvxBoxItem(RES_BOX),
    supplied = nativeBoxFormat(value).box;
  const info = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
  info.SetTable(true);
  info.SetDist(true);
  if (value.padding !== undefined) item.SetAllDistances(value.padding);
  if (value.border === undefined) {
    info.SetValid(SvxBoxInfoItemValidFlags.ALL, false);
    info.SetValid(SvxBoxInfoItemValidFlags.DISTANCE);
  } else {
    for (const edge of [0, 1, 2, 3]) item.SetLine(supplied?.GetLine(edge), edge);
    info.SetLine(supplied?.GetTop(), 0);
    info.SetLine(supplied?.GetLeft(), 1);
  }
  result.Put(item);
  result.Put(info);
  return result;
}

/** Captures native common table-property input for direct component fixtures, without invoking upstream. @param table - Original document table. @param selectedBoxes - Optional selected endpoint owners. @returns Owned native source input. */
export function nativeTableInputForTest(
  table: import("../sw/source/core/table/swtable").SwTable,
  selectedBoxes?: readonly import("../sw/source/core/table/swtable").SwTableBox[],
): SfxItemSet {
  const doc = table.GetTableNode().GetDoc(),
    result = new SfxItemSet(doc.GetAttrPool(), [
      [RES_BOX, RES_BOX],
      [SID_ATTR_BORDER_INNER, SID_ATTR_BORDER_INNER],
    ]);
  const info = new SvxBoxInfoItem(SID_ATTR_BORDER_INNER);
  info.SetTable(selectedBoxes === undefined || selectedBoxes.length > 1);
  info.SetDist(true);
  info.SetMinDist(true);
  info.SetDefDist(28);
  result.Put(info);
  const boxes =
    selectedBoxes ??
    table.GetTabLines().flatMap(
      /** Reads original fixture owners. @param row - Actual row. @returns Original boxes. */
      (row) => row.GetTabBoxes(),
    );
  const first = boxes[0]?.GetParagraphs()[0],
    last = boxes.at(-1)?.GetParagraphs().at(-1);
  if (first === undefined || last === undefined) return result;
  const cursor = new SwCursor(new SwPosition(first, 0));
  try {
    cursor.SetMark();
    cursor.GetMark().Assign(last, last.Len());
    doc.GetTabBorders(cursor, result);
    return result;
  } finally {
    cursor.Dispose();
  }
}
