/** @fileoverview RTF row and cell direction sprms through actual mapper, table formats, and Worker transfer. */
import { afterEach, assert, expect, it } from "vitest";
import { SvxFrameDirection as Direction } from "../../../../editeng/inc/frmdir";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SwXCell } from "../../core/unocore/unotbl";
import { unicode } from "../../core/unocore/unocrsrhelper";
import { RES_FRAMEDIR } from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import { SwTableNode } from "../../core/docnode/node";
import { RtfExport } from "../../filter/ww8/rtfexport";
import { RtfDocumentImpl } from "./rtfdocumentimpl";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

const documents: SwDoc[] = [];
afterEach(
  /** Releases actual Writer owners. @returns Nothing. */ () => {
    for (const document of documents.splice(0)) document.Dispose();
  },
);

/** Imports native RTF table bytes. @param body - Original table controls. @returns Native document. */
function read(body: string): SwDoc {
  const document = new RtfDocumentImpl().ResolveBytes(
    new TextEncoder().encode("{\\rtf1" + body + "}"),
  );
  documents.push(document);
  return document;
}

/** Borrows the actual first table in document order. @param document - Actual Writer document. @returns Table owner. */
function table(document: SwDoc) {
  for (const node of document.GetNodes().getBodyContent())
    if (node instanceof SwTableNode) return node.GetTable();
  throw new Error("Expected an imported table.");
}

/** Reads the native span values from the actual imported table. @param document - Writer document. @returns Signed model spans. */
function spans(document: SwDoc): number[][] {
  const result: number[][] = [];
  for (const row of table(document).GetTabLines()) {
    const values: number[] = [];
    for (const box of row.GetTabBoxes()) values.push(box.getRowSpan());
    result.push(values);
  }
  return result;
}

it("converts native RTF vertical merge flags to signed boxes and writes the same controls", /** Verifies buffered cell sprms, UNO row-span setters, border selection and native reimport. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\cellx1000\clvmgf\clbrdrb\brdrs\brdrw20\cellx3000\intbl left\cell start\cell\row` +
      String.raw`\trowd\cellx1000\clvmrg\cellx3000\intbl middle\cell\cell\row` +
      String.raw`\trowd\cellx1000\clvmrg\clbrdrb\brdrs\brdrw45\cellx3000\intbl last\cell\cell\row`,
  );
  const expected = [
    [1, 3],
    [1, -2],
    [1, -1],
  ];
  expect(spans(document)).toEqual(expected);
  const rows = table(document).GetTabLines();
  const master = rows[0]?.GetTabBoxes()[1];
  const covered = rows[2]?.GetTabBoxes()[1];
  assert(master && covered);
  const lastBorder = covered.GetFrameFormat().GetBox().GetBottom()?.GetOutWidth();
  expect(lastBorder).toBeGreaterThan(0);
  expect(master.GetFrameFormat().GetBox().GetBottom()?.GetOutWidth()).toBe(lastBorder);
  expect(covered.GetParagraphs()[0]?.IsCountedInList()).toBe(false);
  const output = RtfExport.WriteDocument(document);
  const rtf = new TextDecoder().decode(output);
  expect(rtf.match(/\\clvmgf/gu)).toHaveLength(1);
  expect(rtf.match(/\\clvmrg/gu)).toHaveLength(2);
  const reopened = new RtfDocumentImpl().ResolveBytes(output);
  documents.push(reopened);
  expect(spans(reopened)).toEqual(expected);
});

it("retains open native merge groups across ordinary rows and ignores an orphan continuation", /** Preserves the source position-grouping behavior and the no-master branch. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\clvmrg\cellx1000\intbl orphan\cell\row` +
      String.raw`\trowd\clvmgf\cellx1000\intbl master\cell\row` +
      String.raw`\trowd\cellx1000\intbl gap\cell\row` +
      String.raw`\trowd\clvmrg\cellx1000\intbl covered\cell\row`,
  );
  expect(spans(document)).toEqual([[1], [2], [1], [-1]]);
});

it.each([
  [1101, [2, -1]],
  [1102, [1, 1]],
] as const)(
  "uses the native strict two-unit merge tolerance with left-indent correction at cellx %s",
  /** The master and continuation use corrected relative positions, including the exclusive threshold. @param boundary - Following row's first CELLX. @param expected - Expected master and continuation span. @returns Nothing. */ (
    boundary,
    expected,
  ) => {
    const document = read(
      String.raw`\trowd\cellx1000\clvmgf\cellx10000\intbl left\cell master\cell\row` +
        String.raw`\trowd\trleft100\cellx${boundary}\clvmrg\cellx10100\intbl left\cell\cell\row`,
    );
    expect(spans(document)).toEqual([
      [1, expected[0]],
      [1, expected[1]],
    ]);
  },
);

it.each([
  ["ltrrow", Direction.Horizontal_LR_TB],
  ["rtlrow", Direction.Horizontal_RL_TB],
] as const)(
  "imports the table direction of %s",
  /** Uses the original row flag and the table-owned WritingMode item. @param flag - Native control. @param expected - Native direction. @returns Nothing. */ (
    flag,
    expected,
  ) => {
    const doc = read(`\\trowd\\${flag}\\cellx1000\\intbl one\\cell\\row`);
    expect(table(doc).GetFrameFormat().GetFrameDir().GetValue()).toBe(expected);
  },
);

it("accumulates explicit row direction without resetting it for rows with no flag", /** The source table manager merges row table properties, with the last explicit value winning. @returns Nothing. */ () => {
  const doc = read(
    String.raw`\trowd\rtlrow\cellx1000\intbl one\cell\row\trowd\cellx1000\intbl two\cell\row\trowd\ltrrow\cellx1000\intbl three\cell\row\trowd\cellx1000\intbl four\cell\row`,
  );
  const owner = table(doc);
  expect(owner.GetTabLines()).toHaveLength(4);
  expect(owner.GetFrameFormat().GetFrameDir().GetValue()).toBe(Direction.Horizontal_LR_TB);
});

it("retains each CELLX text-direction snapshot and the mapper's ignored LRTB case", /** Five native control spellings and a missing control exercise actual direct-item presence. @returns Nothing. */ () => {
  const doc = read(
    String.raw`\trowd\cltxtbrl\cellx1000\cltxbtlr\cellx2000\cltxlrtbv\cellx3000\cltxtbrlv\cellx4000\cltxlrtb\cellx5000\cellx6000\intbl one\cell two\cell three\cell four\cell five\cell six\cell\row`,
  );
  const cells = table(doc).GetTabLines()[0]?.GetTabBoxes();
  assert(cells);
  expect(cells).toHaveLength(6);
  expect(
    cells.map(
      /** Reads actual direct direction; unset cells still borrow the pool default. @param cell - Native box. @returns Direct value or absent. */ (
        cell,
      ) => cell.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_FRAMEDIR, false)?.QueryValue(),
    ),
  ).toEqual([
    Direction.Vertical_RL_TB,
    Direction.Vertical_LR_BT,
    Direction.Horizontal_LR_TB,
    Direction.Vertical_RL_TB,
    undefined,
    undefined,
  ]);
});

it("retains group-owned controls only until their native property capture", /** Actual RTFSprms copy-on-write survives CELLX and does not leak uncommitted flags across group pop. @returns Nothing. */ () => {
  const doc = read(
    String.raw`\trowd{\rtlrow\cltxbtlr\cellx1000}{\cltxtbrl}\cellx2000\intbl one\cell two\cell\row`,
  );
  const owner = table(doc),
    cells = owner.GetTabLines()[0]?.GetTabBoxes();
  assert(cells);
  expect(owner.GetFrameFormat().GetFrameDir().GetValue()).toBe(Direction.Environment);
  expect(cells[0]?.GetFrameFormat().GetFrameDir().GetValue()).toBe(Direction.Vertical_LR_BT);
  expect(cells[1]?.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_FRAMEDIR, false)).toBeUndefined();
});

it("round trips table and cell direction through Worker ownership and the actual RTF exporter", /** Browser state transport and RTF bytes retain the native direction items. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\rtlrow\cltxtbrl\cellx1000\cltxbtlr\cellx2000\intbl one\cell two\cell\row`,
  );
  const restored = decodeWriterDocument(encodeWriterDocument(document));
  documents.push(restored);
  const output = RtfExport.WriteDocument(restored);
  expect(new TextDecoder().decode(output)).toMatch(/\\rtlrow.*\\cltxtbrl.*\\cltxbtlr/u);
  const reimported = new RtfDocumentImpl().ResolveBytes(output);
  documents.push(reimported);
  const owner = table(reimported),
    cells = owner.GetTabLines()[0]?.GetTabBoxes();
  expect(owner.GetFrameFormat().GetFrameDir().GetValue()).toBe(Direction.Horizontal_RL_TB);
  expect(cells?.[0]?.GetFrameFormat().GetFrameDir().GetValue()).toBe(Direction.Vertical_RL_TB);
  expect(cells?.[1]?.GetFrameFormat().GetFrameDir().GetValue()).toBe(Direction.Vertical_LR_BT);
});

it("keeps the original invalid hidden-cell-property fallback to Environment", /** Actual UNO cell setter ignores the failed native item conversion, as in unotbl.cxx. @returns Nothing. */ () => {
  const doc = read(String.raw`\trowd\cltxbtlr\cellx1000\intbl one\cell\row`);
  const box = table(doc).GetTabLines()[0]?.GetTabBoxes()[0];
  assert(box);
  const cell = new SwXCell(box),
    key = unicode("FRMDirection"),
    invalid = new Any();
  try {
    expect(box.GetFrameFormat().GetFrameDir().GetValue()).toBe(Direction.Vertical_LR_BT);
    cell.setPropertyValue(key, invalid);
    expect(box.GetFrameFormat().GetFrameDir().GetValue()).toBe(Direction.Environment);
  } finally {
    cell.dispose();
    key.dispose();
    invalid.dispose();
  }
});
