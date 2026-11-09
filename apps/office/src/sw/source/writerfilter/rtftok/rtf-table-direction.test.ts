/** @fileoverview RTF row and cell direction sprms through actual mapper, table formats, and Worker transfer. */
import { SwTabFrame } from "../../core/layout/tabfrm";
import { readOdtDocument } from "../../filter/xml/swxml";
import { writeOdtDocument } from "../../filter/xml/wrtxml";
import { SvxBoxItemLine } from "../../../../editeng/source/items/frmitems";
import { ZipFile } from "../../../../package/source/zipapi/ZipFile";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { existsSync, readFileSync } from "node:fs";
import { afterEach, assert, expect, it } from "vitest";
import { SvxFrameDirection as Direction } from "../../../../editeng/inc/frmdir";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { COL_AUTO, Color } from "../../../../tools/inc/color";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { SwXCell, SwXTextTableCursor } from "../../core/unocore/unotbl";
import { unicode } from "../../core/unocore/unocrsrhelper";
import type { SvxULSpaceItem } from "../../../../editeng/inc/ulspitem";
import { RES_BACKGROUND, RES_FRAMEDIR, RES_UL_SPACE } from "../../../inc/hintids";
import type { SwDoc } from "../../core/doc/doc";
import type { SwFrameFormat } from "../../core/layout/atrfrm";
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

/** Reads the native per-row cell widths and paragraph boundaries. @param document - Writer document. @returns Ordered cell layout and text. */
function cellContents(document: SwDoc) {
  const rows = [];
  for (const line of table(document).GetTabLines()) {
    const cells = [];
    for (const box of line.GetTabBoxes()) {
      const paragraphs = [];
      for (const paragraph of box.GetParagraphs()) paragraphs.push(paragraph.GetText());
      cells.push([box.GetFrameFormat().GetFrameSize().GetWidth(), paragraphs]);
    }
    rows.push(cells);
  }
  return rows;
}

it("merges RTF horizontal groups in reverse order and reopens their exported CELLX widths", /** Native cell deletion retains rich paragraph content and leaves an ordinary ragged table. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\clmgf\clbrdrr\brdrs\brdrw15\cellx1000\clmrg\clbrdrr\brdrs\brdrw45\cellx1700` +
      String.raw`\clmgf\cellx2500\clmrg\clbrdrb\brdrs\brdrw30\cellx4000\intbl first\cell {\*\bkmkstart Moved}{\*\bkmkend Moved}\b moved\b0\par second\cell third\cell\cell\row` +
      String.raw`\trowd\cellx1000\cellx1700\cellx2500\cellx4000\intbl a\cell b\cell c\cell d\cell\row`,
  );
  const expected = [
    [
      [1700, ["first", "moved", "second"]],
      [2300, ["third"]],
    ],
    [
      [1000, ["a"]],
      [700, ["b"]],
      [800, ["c"]],
      [1500, ["d"]],
    ],
  ];
  expect(cellContents(document)).toEqual(expected);
  const firstRow = table(document).GetTabLines()[0]?.GetTabBoxes();
  assert(firstRow);
  const first = firstRow[0];
  assert(first);
  expect(first.GetFrameFormat().GetBox().GetRight()?.GetOutWidth()).toBe(15);
  expect(firstRow[1]?.GetFrameFormat().GetBox().GetBottom()?.GetOutWidth()).toBe(30);
  expect(first.GetParagraphs()[1]?.GetTableBox()).toBe(first);
  const mark = document.GetIDocumentMarkAccess().GetBookmarks()[0];
  expect(mark?.GetMarkPos().GetNode()).toBe(first.GetParagraphs()[1]);
  const transferred = decodeWriterDocument(encodeWriterDocument(document));
  documents.push(transferred);
  expect(cellContents(transferred)).toEqual(expected);
  const output = RtfExport.WriteDocument(document);
  const rtf = new TextDecoder().decode(output);
  expect(rtf).not.toMatch(/\\clm(?:gf|rg)/u);
  expect(rtf).toMatch(/\\b(?:\d+)? moved/u);
  const reopened = new RtfDocumentImpl().ResolveBytes(output);
  documents.push(reopened);
  expect(cellContents(reopened)).toEqual(expected);
});

it("retains a horizontal merge across an unmarked cell and skips restart-only groups", /** The source collector keeps the most recent start coordinate until a continuation updates its endpoint. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\clmrg\cellx1000\clmgf\cellx2000\cellx3000\clmrg\cellx4000\clmgf\cellx5000\intbl a\cell b\cell c\cell d\cell e\cell\row`,
  );
  expect(cellContents(document)).toEqual([
    [
      [1000, ["a"]],
      [3000, ["b", "c", "d"]],
      [1000, ["e"]],
    ],
  ]);
});

it.each([true, false])(
  "merges compound RTF cells and removes wholly covered rows when outside cells are present: %s",
  /** Tests the source vertical-span extension and superfluous-row deletion branches. @param outside - Whether a visible outside column survives. @returns Nothing. */ (
    outside,
  ) => {
    const end = outside ? String.raw`\cellx3000` : "";
    const document = read(
      String.raw`\trowd\clmgf\clvmgf\cellx1000\clmrg\clvmgf\cellx2000` +
        end +
        String.raw`\intbl a\cell b\cell` +
        (outside ? String.raw` c\cell` : "") +
        String.raw`\row` +
        String.raw`\trowd\clmgf\clvmrg\cellx1000\clmrg\clvmrg\cellx2000` +
        end +
        String.raw`\intbl\cell\cell` +
        (outside ? String.raw` d\cell` : "") +
        String.raw`\row`,
    );
    const expected = outside
      ? [
          [
            [2000, ["a", "b"]],
            [1000, ["c"]],
          ],
          [
            [2000, [""]],
            [1000, ["d"]],
          ],
        ]
      : [[[2000, ["a", "b"]]]];
    expect(cellContents(document)).toEqual(expected);
    expect(spans(document)).toEqual(
      outside
        ? [
            [2, 1],
            [-1, 1],
          ]
        : [[1]],
    );
    const reopened = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(document));
    documents.push(reopened);
    expect(cellContents(reopened)).toEqual(expected);
    expect(spans(reopened)).toEqual(spans(document));
  },
);

it("uses the physical endpoint rectangle and transfers excess widths to the outside cell", /** A cross-row continuation selects the source rectangle and corrects an overhanging right box. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\clmgf\cellx1000\cellx2300\cellx3000\intbl a\cell b\cell outside1\cell\row` +
      String.raw`\trowd\cellx1200\clmrg\cellx2000\cellx3000\intbl c\cell d\cell outside2\cell\row`,
  );
  expect(spans(document)).toEqual([
    [2, 1],
    [-1, 1],
  ]);
  expect(cellContents(document)).toEqual([
    [
      [2000, ["a", "b", "c", "d"]],
      [1000, ["outside1"]],
    ],
    [
      [2000, [""]],
      [1000, ["outside2"]],
    ],
  ]);
});

it("hands the removed cell's side border to the surviving outside cell", /** Exercises reverse deletion and the original adjacent-border handoff. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\clmgf\cellx1000\clbrdrl\brdrs\brdrw28\cellx2000\clmrg\cellx3000\cellx4000\intbl a\cell b\cell c\cell d\cell\row`,
  );
  const cells = table(document).GetTabLines()[0]?.GetTabBoxes();
  expect(cells).toHaveLength(2);
  expect(cells?.[0]?.GetFrameFormat().GetBox().GetRight()).toBeUndefined();
  // The source's eighth-point conversion reduces a 28-twip solid line to 27.
  expect(cells?.[1]?.GetFrameFormat().GetBox().GetLeft()?.GetOutWidth()).toBe(27);
});

it("replays consecutive nested rows in the actual parent cell without consuming outer geometry", /** The original ITAP/NESTCELL/NESTROW buffer path retains interleaved content and independent cell properties. @returns Nothing. */ () => {
  const document = read(
    String.raw`{\colortbl;\red201\green61\blue27;}\trowd\cltxtbrl\cellx3000\cellx5000\pard\intbl before\par` +
      String.raw`\pard\itap2 inner1\nestcell{\*\nesttableprops\trowd\cltxbtlr\clbrdrt\brdrs\brdrw30\brdrcf1\cellx1100\nestrow}{\nonesttables\par ignored}` +
      String.raw`\pard\itap2 inner2\nestcell{\*\nesttableprops\trowd\cellx1100\nestrow}` +
      String.raw`\pard\itap0\intbl after\cell neighbor\cell\row`,
  );
  const bytes = RtfExport.WriteDocument(document);
  const exported = new TextDecoder().decode(bytes);
  expect(exported.match(/\\nestcell\b/gu)).toHaveLength(2);
  expect(exported.match(/\\nestrow\b/gu)).toHaveLength(2);
  expect(exported).toContain("{\\*\\nesttableprops\\trowd");
  const reopened = new RtfDocumentImpl().ResolveBytes(bytes);
  documents.push(reopened);
  for (const model of [document, reopened]) {
    const outer = table(model).GetTabLines()[0]?.GetTabBoxes()[0];
    assert(outer);
    const [before, nested, after] = outer.GetContentNodes();
    expect(before?.GetTextNode()?.GetText()).toBe("before");
    expect(after?.GetTextNode()?.GetText()).toBe("after");
    assert(nested instanceof SwTableNode);
    expect(nested.StartOfSectionNode()).toBe(outer.GetStartNode());
    expect(nested.GetTable().GetTabLines()).toHaveLength(2);
    const first = nested.GetTable().GetTabLines()[0]?.GetTabBoxes()[0],
      second = nested.GetTable().GetTabLines()[1]?.GetTabBoxes()[0];
    expect(first?.GetFrameFormat().GetFrameDir().GetValue()).toBe(Direction.Vertical_LR_BT);
    expect(first?.GetFrameFormat().GetFrameSize().GetWidth()).toBe(1100);
    expect(first?.GetFrameFormat().GetBox().GetTop()?.GetColor().GetRed()).toBe(201);
    expect(first?.GetParagraphs()[0]?.GetText()).toBe("inner1");
    expect(second?.GetParagraphs()[0]?.GetText()).toBe("inner2");
    expect(outer.GetFrameFormat().GetFrameSize().GetWidth()).toBe(3000);
    expect(outer.GetFrameFormat().GetFrameDir().GetValue()).toBe(Direction.Vertical_RL_TB);
    expect(table(model).GetTabLines()[0]?.GetTabBoxes()[1]?.GetParagraphs()[0]?.GetText()).toBe(
      "neighbor",
    );
  }
});

it("replays an ITAP jump through all intermediate native table levels", /** The stack grows to the requested depth and each NESTROW returns only one level. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\cellx4000\pard\itap3 deep\nestcell{\nesttableprops\trowd\cellx800\nestrow}` +
      String.raw`\pard\itap2 middle\nestcell{\nesttableprops\trowd\cellx1600\nestrow}` +
      String.raw`\pard\intbl outside\cell\row`,
  );
  const reopened = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(document));
  documents.push(reopened);
  for (const model of [document, reopened]) {
    const outer = table(model).GetTabLines()[0]?.GetTabBoxes()[0],
      [middle, outside] = outer?.GetContentNodes() ?? [];
    assert(middle instanceof SwTableNode);
    expect(outside?.GetTextNode()?.GetText()).toBe("outside");
    const [inner, text] =
      middle.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetContentNodes() ?? [];
    assert(inner instanceof SwTableNode);
    expect(text?.GetTextNode()?.GetText()).toBe("middle");
    expect(inner.GetTable().GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0]?.GetText()).toBe(
      "deep",
    );
  }
});

it("rejects a NESTROW with no corresponding table depth", /** The original nested row validates the active buffer before publishing an incomplete table. @returns Nothing. */ () => {
  expect(
    /** Imports an orphan nested row. @returns The resulting invalid document. */ () =>
      read(String.raw`\trowd\cellx1000\intbl x\nestcell{\*\nesttableprops\trowd\nestrow}`),
  ).toThrow("Mismatch between ITAP and NESTROW.");
});

it("uses the browser nesting bound for explicit RTF table depth", /** Applies the existing lexical safety limit before allocating row buffers. @returns Nothing. */ () => {
  expect(
    /** Imports an oversized logical table depth. @returns The resulting invalid document. */ () =>
      read(String.raw`\itap2147483647`),
  ).toThrow("RTF table nesting is too deep.");
});

/** Reads a box's effective native background. @param frame - Actual frame. @returns Native brush color. */
function background(frame: SwFrameFormat | undefined): Color | undefined {
  return (frame?.GetAttrSet().Get(RES_BACKGROUND) as SvxBrushItem | undefined)?.GetColor();
}

/** Applies one actual background brush to a connected native format. @param frame - Actual table/row/box format. @param color - Original color. @returns Nothing. */
function setBackground(frame: SwFrameFormat, color: Readonly<Color>): void {
  const brush = new SvxBrushItem(color, RES_BACKGROUND);
  try {
    frame.SetFormatAttr(brush);
  } finally {
    brush.Dispose();
  }
}

it("maps table background and shading controls through the actual cell brush owner", /** Tests source automatic palette entries, raw alias, strict threshold, and foreground defaults. @returns Nothing. */ () => {
  const document = read(
    String.raw`{\colortbl;\red200\green100\blue40;\red0\green255\blue0;}\trowd` +
      String.raw`\clcbpat1\cellx1000\clcbpatraw1\clshdng749\cellx2000\clcbpat1\clshdng750\cellx3000` +
      String.raw`\clcbpat1\clcfpat2\clshdng9750\cellx4000\clcbpat0\cellx5000\clcbpat999\cellx6000\intbl a\cell b\cell c\cell d\cell e\cell f\cell\row`,
  );
  const boxes = table(document).GetTabLines()[0]?.GetTabBoxes() ?? [];
  const expected = [0xc86428, 0xbe5f26, 0xb45a24, 0, COL_AUTO.toUInt32(), 0];
  expect(
    boxes.map(
      /** Reads the original packed brush color. @param box - Actual cell. @returns Color. */ (
        box,
      ) => background(box.GetFrameFormat())?.toUInt32(),
    ),
  ).toEqual(expected);
  const reopened = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(document));
  documents.push(reopened);
  expect(
    table(reopened)
      .GetTabLines()[0]
      ?.GetTabBoxes()
      .map(
        /** Reads the original packed brush color after export. @param box - Actual cell. @returns Color. */ (
          box,
        ) => background(box.GetFrameFormat())?.toUInt32(),
      ),
  ).toEqual(expected);
});

it("exports effective table, row and cell brush colors in original priority order", /** Direct automatic color falls back, while partial alpha suppresses the selected cell background. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\cellx1000\cellx2000\cellx3000\intbl a\cell b\cell c\cell\row\trowd\cellx3000\intbl d\cell\row`,
  );
  const owner = table(document),
    row = owner.GetTabLines()[0],
    [first, second, third] = row?.GetTabBoxes() ?? [];
  assert(row && first && second && third);
  setBackground(owner.GetFrameFormat(), new Color(0x5c983a));
  setBackground(row.GetFrameFormat(), new Color(0x386b9c));
  setBackground(first.GetFrameFormat(), new Color(0xc82546));
  setBackground(second.GetFrameFormat(), COL_AUTO);
  const partial = new Color(0xffee22);
  partial.SetAlpha(128);
  setBackground(third.GetFrameFormat(), partial);
  const bytes = RtfExport.WriteDocument(document);
  expect(new TextDecoder().decode(bytes).match(/\\clcbpat\d+/gu)).toHaveLength(3);
  const reopened = new RtfDocumentImpl().ResolveBytes(bytes);
  documents.push(reopened);
  expect(
    table(reopened)
      .GetTabLines()
      .map(
        /** Reads the exported selected brush at each actual cell. @param line - Actual row. @returns Original values. */ (
          line,
        ) =>
          line
            .GetTabBoxes()
            .map(
              /** Reads the original packed brush color. @param box - Actual cell. @returns Color. */ (
                box,
              ) => background(box.GetFrameFormat())?.toUInt32(),
            ),
      ),
  ).toEqual([[0xc82546, 0x386b9c, COL_AUTO.toUInt32()], [0x5c983a]]);
});

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

it("moves the nested table section from an RTF horizontal merge into the surviving cell", /** Verifies native parent identities, contents, mark and the exported RTF row structure. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\clmgf\cellx1000\clmrg\cellx2800\pard\intbl Master\cell Before\par` +
      String.raw`\pard\itap2 {\*\bkmkstart Nested}{\*\bkmkend Nested}Inner\nestcell{\*\nesttableprops\trowd\cellx1100\nestrow}` +
      String.raw`\pard\itap0\intbl After\cell\row`,
  );
  const reopened = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(document));
  const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
  documents.push(reopened, worker);
  for (const model of [document, reopened, worker]) {
    const boxes = table(model).GetTabLines()[0]?.GetTabBoxes();
    expect(boxes).toHaveLength(1);
    const box = boxes?.[0];
    assert(box);
    expect(box.GetFrameFormat().GetFrameSize().GetWidth()).toBe(2800);
    const [master, before, nested, after] = box.GetContentNodes();
    expect(master?.GetTextNode()?.GetText()).toBe("Master");
    expect(before?.GetTextNode()?.GetText()).toBe("Before");
    expect(after?.GetTextNode()?.GetText()).toBe("After");
    assert(nested instanceof SwTableNode);
    expect(nested.StartOfSectionNode()).toBe(box.GetStartNode());
    const inner = nested.GetTable().GetTabLines()[0]?.GetTabBoxes()[0];
    const paragraph = inner?.GetParagraphs()[0];
    expect(paragraph?.GetText()).toBe("Inner");
    expect(paragraph?.GetTableBox()).toBe(inner);
    expect(model.GetIDocumentMarkAccess().GetBookmarks()[0]?.GetMarkPos().GetNode()).toBe(
      paragraph,
    );
  }
});

it("appends the merge replacement paragraph after a structural end and moves the original section", /** Uses the original native append operation when the selected cell ends in a nested table. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\cellx1000\cellx2800\pard\intbl Master\cell Before\par` +
      String.raw`\pard\itap2 Inner\nestcell{\*\nesttableprops\trowd\cellx1100\nestrow}` +
      String.raw`\pard\itap0\intbl Trailer\cell\row`,
  );
  const boxes = table(document).GetTabLines()[0]?.GetTabBoxes();
  const master = boxes?.[0],
    source = boxes?.[1];
  assert(master && source);
  const [before, nested, trailer] = source.GetContentNodes();
  assert(nested instanceof SwTableNode && trailer && trailer.IsTextNode());
  document.nodes.RemoveNode(trailer.GetIndex(), 1, true);
  const cursor = new SwXTextTableCursor(master);
  try {
    expect(cursor.gotoCell(source, true)).toBe(true);
    expect(cursor.mergeRange()).toBe(true);
    const [, movedBefore, movedTable] = master.GetContentNodes();
    expect(movedBefore).toBe(before);
    expect(movedTable).toBe(nested);
    expect(nested.StartOfSectionNode()).toBe(master.GetStartNode());
  } finally {
    cursor.dispose();
  }
});

it("keeps the original table cursor's nearest-table name lookup when the first cell opens with a nested table", /** The outer B1 name resolves against the nested table reached by GoInNode. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\clmgf\cellx1600\clmrg\cellx2800\pard\itap2 InnerA\nestcell InnerB\nestcell` +
      String.raw`{\*\nesttableprops\trowd\cellx550\cellx1100\nestrow}\pard\itap0\intbl OuterA\cell OuterB\cell\row`,
  );
  const boxes = table(document).GetTabLines()[0]?.GetTabBoxes();
  expect(boxes).toHaveLength(2);
  const [nested, trailing] = boxes?.[0]?.GetContentNodes() ?? [];
  assert(nested instanceof SwTableNode);
  expect(trailing?.GetTextNode()?.GetText()).toBe("OuterA");
  expect(boxes?.[1]?.GetContentNodes()[0]?.GetTextNode()?.GetText()).toBe("OuterB");
  const row = nested.GetTable().GetTabLines()[0]?.GetTabBoxes();
  expect(row).toHaveLength(1);
  expect(
    row?.[0]?.GetParagraphs().map(
      /** Reads each native paragraph left by the name-resolved merge. @param node - Original node. @returns Content. */
      (node) => node.GetText(),
    ),
  ).toEqual(["InnerA", "InnerB"]);
});

it("restores the last live row definition after a second TROWD erases it", /** Keeps native row and cell geometry captured before the invalid mid-row reset. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\trleft100\trrh480\trkeep\cltxtbrl\cellx1500\cellx2500\pard\intbl A\cell B\cell\trowd\row`,
  );
  const row = table(document).GetTabLines()[0];
  expect(row?.GetFrameFormat().GetFrameSize().GetHeight()).toBe(480);
  expect(row?.GetFrameFormat().GetRowSplit().GetValue()).toBe(false);
  expect(cellContents(document)).toEqual([
    [
      [1400, ["A"]],
      [1000, ["B"]],
    ],
  ]);
  expect(row?.GetTabBoxes()[0]?.GetFrameFormat().GetFrameDir().GetValue()).toBe(
    Direction.Vertical_RL_TB,
  );
});

it("inherits the previous table row's cell properties when the next row has no definition", /** PARD and INTBL keep the same source table open before the next cell. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\trleft100\cltxtbrl\cellx1500\cellx2500\pard\intbl A\cell B\cell\row` +
      String.raw`\pard\intbl C\cell D\cell\row\pard After`,
  );
  expect(document.GetTables()).toHaveLength(1);
  expect(cellContents(document)).toEqual([
    [
      [1400, ["A"]],
      [1000, ["B"]],
    ],
    [
      [1400, ["C"]],
      [1000, ["D"]],
    ],
  ]);
  expect(
    table(document).GetTabLines()[1]?.GetTabBoxes()[0]?.GetFrameFormat().GetFrameDir().GetValue(),
  ).toBe(Direction.Vertical_RL_TB);
});

it("widens only the final cell of a shorter row by the source minimum correction threshold", /** Earlier widths remain unchanged, and a paragraph break resets the tracked table maximum. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\cellx1000\cellx2000\pard\intbl A\cell B\cell\row` +
      String.raw`\trowd\cellx1000\cellx1980\pard\intbl C\cell D\cell\row` +
      String.raw`\trowd\cellx1000\cellx1977\pard\intbl E\cell F\cell\row\pard Break\par` +
      String.raw`\trowd\cellx700\pard\intbl G\cell\row`,
  );
  expect(cellContents(document)).toEqual([
    [
      [1000, ["A"]],
      [1000, ["B"]],
    ],
    [
      [1000, ["C"]],
      [980, ["D"]],
    ],
    [
      [1000, ["E"]],
      [1000, ["F"]],
    ],
  ]);
  expect(
    document.GetTables()[1]?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetFrameSize().GetWidth(),
  ).toBe(700);
});

it("materializes TRWWIDTHA as a borderless empty grid-after cell", /** The source uses the positive width independently of TRFTSWIDTHA and removes the filler paragraph's spacing. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\trftsWidthA1\trwWidthA420\clbrdrr\brdrs\brdrw25\cellx1000\pard\sa200\fs36\intbl Visible\cell\row`,
  );
  expect(cellContents(document)).toEqual([
    [
      [1000, ["Visible"]],
      [420, [""]],
    ],
  ]);
  const row = table(document).GetTabLines()[0];
  const [visible, fill] = row?.GetTabBoxes() ?? [];
  expect(visible?.GetFrameFormat().GetBox().GetRight()).toBeDefined();
  const box = fill?.GetFrameFormat().GetBox();
  expect(box?.GetLeft()).toBeUndefined();
  expect(box?.GetRight()).toBeUndefined();
  expect(box?.GetTop()).toBeUndefined();
  expect(box?.GetBottom()).toBeUndefined();
  expect(
    (fill?.GetParagraphs()[0]?.GetAttr(RES_UL_SPACE) as SvxULSpaceItem | undefined)?.GetLower(),
  ).toBe(0);
});

it("uses the native minimum width after a non-increasing CELLX following a positive column", /** Checks that prepareProperties reaches the actual cell size, not just merge separators. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\cellx1000\cellx1000\cellx1600\pard\intbl A\cell B\cell C\cell\row`,
  );
  expect(cellContents(document)).toEqual([
    [
      [1000, ["A"]],
      [41, ["B"]],
      [600, ["C"]],
    ],
  ]);
});

const gridAfterFixture =
  "../../vendor/libreoffice-reference/sw/qa/extras/rtfexport/data/tdf44986.rtf";
it.skipIf(!existsSync(gridAfterFixture))(
  "keeps both cells in the first row of LibreOffice's grid-after regression",
  /** Verifies the pinned RTF input and the native RTF export of the filler cell. @returns Nothing. */
  () => {
    const document = new RtfDocumentImpl().ResolveBytes(readFileSync(gridAfterFixture));
    documents.push(document);
    const reopened = new RtfDocumentImpl().ResolveBytes(RtfExport.WriteDocument(document));
    documents.push(reopened);
    for (const model of [document, reopened]) {
      const cells = table(model).GetTabLines()[0]?.GetTabBoxes();
      expect(cells).toHaveLength(2);
      expect(cells?.[1]?.GetParagraphs()[0]?.GetText()).toBe("");
    }
  },
);

it("applies the original preferred width and distinguishes numeric RTF and OOXML percentage units", /** Checks the native table-size item after RTF resource resolution. @returns Nothing. */ () => {
  const fixed = read(
    String.raw`\trowd\trftsWidth3\trwWidth4200\cellx800\cellx1900\pard\intbl A\cell B\cell\row`,
  );
  expect(table(fixed).GetFrameFormat().GetFrameSize().GetWidth()).toBe(4200);
  const rawPercent = read(
    String.raw`\trowd\trftsWidth2\trwWidth3000\cellx800\cellx1900\pard\intbl A\cell B\cell\row`,
  );
  const size = table(rawPercent).GetFrameFormat().GetFrameSize();
  expect(size.GetWidth()).toBe(1900);
  expect(size.GetWidthPercent()).toBe(0);
});

it("retains a resolved percentage and its column references through the browser's ODT format", /** Checks native relative size and actual layout from the opened document. @returns Completion. */ async () => {
  const document = read(
    `\\trowd\\trftsWidth${N.LN_Value_ST_TblWidth_pct}\\trwWidth3000\\cellx800\\cellx2000\\pard\\intbl A\\cell B\\cell\\row`,
  );
  const metadata = { title: "Relative table" };
  const bytes = writeOdtDocument(document, metadata);
  const xml = await new ZipFile(bytes).readTextEntry("content.xml");
  expect(xml).toContain('style:rel-width="60%"');
  expect(xml).toContain('style:rel-column-width="800*"');
  const reopened = (await readOdtDocument(bytes, metadata)).document;
  documents.push(reopened);
  for (const model of [document, reopened]) {
    const native = table(model);
    expect(native.GetFrameFormat().GetFrameSize().GetWidthPercent()).toBe(60);
    expect(
      native
        .GetTabLines()[0]
        ?.GetTabBoxes()
        .map(
          /** Reads the authored column reference. @param box - Native cell. @returns Original width. */
          (box) => box.GetFrameSize().GetWidth(),
        ),
    ).toEqual([800, 1200]);
    const frame = new SwTabFrame(native);
    try {
      expect(frame.Format(6000).width).toBe(3600);
    } finally {
      frame.DestroyImpl();
    }
  }
});

it("resolves TRGAPH, row defaults, cell overrides and explicit table indent through native margin properties", /** Checks half-gap fallback, unsigned metrics and the original left-margin subtraction. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\trgaph90\trpaddfl3\trpaddl50\tblind300\clpadt30\cellx1000\cellx2000\pard\intbl A\cell B\cell\row`,
  );
  const native = table(document);
  const format = native.GetFrameFormat();
  expect(format.GetLRSpace().ResolveLeft()).toBe(250);
  expect(format.GetBox().GetDistance(SvxBoxItemLine.LEFT)).toBe(50);
  expect(format.GetBox().GetDistance(SvxBoxItemLine.RIGHT)).toBe(90);
  const [a, b] = native.GetTabLines()[0]?.GetTabBoxes() ?? [];
  expect(a?.GetBox().GetDistance(SvxBoxItemLine.LEFT)).toBe(30);
  expect(b?.GetBox().GetDistance(SvxBoxItemLine.LEFT)).toBe(50);
  expect(b?.GetBox().GetDistance(SvxBoxItemLine.RIGHT)).toBe(90);
});

it("keeps the first duplicate cell edge and restores border destination ownership at group pop", /** Uses original append order and source lexical group state. @returns Nothing. */ () => {
  const document = read(
    String.raw`\trowd\clbrdrl\brdrs\brdrw20\clbrdrl\brdrs\brdrw40` +
      String.raw`{\clbrdrr\brdrs\brdrw60}\cellx1200\clbrdrt\brdrs\cellx2400\intbl One\cell Two\cell\row`,
  );
  const [first, second] = table(document).GetTabLines()[0]?.GetTabBoxes() ?? [];
  assert(first && second);
  expect(first.GetFrameFormat().GetBox().GetLeft()?.GetWidth()).toBe(20);
  expect(first.GetFrameFormat().GetBox().GetRight()).toBeUndefined();
  expect(second.GetFrameFormat().GetBox().GetTop()?.GetWidth()).toBe(15);
});
