/** @fileoverview Native HTMLTable MakeTable over actual import cell sections and Writer formats. */
import { implementations } from "../../../../desktop/browser/app/uno-components";
import { InitApplicationServiceManager } from "../../../../desktop/source/app/appinit";
import { assert, expect, it } from "vitest";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { HoriOrientation as H } from "../../../../offapi/com/sun/star/text/HoriOrientation";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwDoc } from "../../core/doc/doc";
import { SwInsertTableFlags } from "../../../inc/itabenum";
import { SwHTMLParser } from "./swhtml";
import { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { HTMLTable } from "./htmltab";
import { HTMLTableOptions } from "./htmltab.options";
import { HTMLTableContext } from "./htmltab.context";
import { InsertTableContents } from "./htmltab.sections";
import { HTMLOption } from "../../../../svtools/source/svhtml/parhtml.options";
import { HtmlOptionId as O } from "../../../../svtools/inc/htmltokn";
import { RES_BACKGROUND, RES_BOXATR_FORMAT, RES_BOXATR_VALUE } from "../../../inc/hintids";
import { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { SwTableBoxNumFormat, SwTableBoxValue } from "../../core/attr/cellatr";

InitApplicationServiceManager(implementations);

/** Creates one native bootstrap cell and an actual import cursor. @param options - Authored native table options. @returns Connected test owners. */
function fixture(options: readonly HTMLOption[] = []) {
  const doc = new SwDoc({
    defaultFontDevice: {
      /** Delegates font identity to the Writer defaults. @returns Absent host preference. */
      getDefaultFont: () => undefined,
      /** Supplies deterministic physical widths. @param _font - Actual font. @param _text - Actual text. @param _start - First code unit. @param length - Measured range. @returns Twip width. */
      measureTextWidth: (_font, _text, _start, length) => length * 30,
    },
  });
  const body = doc.paragraphs[0];
  assert(body);
  const position = new SwPosition(body);
  const pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8));
  const core = doc.InsertTable(
    { mnInsMode: SwInsertTableFlags.HeadlineNoBorder, mnRowsToRepeat: 1 },
    pam.GetPoint(),
    1,
    1,
    H.LEFT,
  );
  assert(core);
  const bootstrap = core.GetTabLines()[0]?.GetTabBoxes()[0];
  const first = bootstrap?.GetParagraphs()[0];
  assert(bootstrap && first);
  const table = new HTMLTable(parser, false, false, false, new HTMLTableOptions(options, A.Left));
  const context = new HTMLTableContext(new SwPosition(body), 0, 0);
  context.SetTableNode(core.GetTableNode());
  table.SetTable(core.GetTableNode(), context, 0, 0, core);
  parser.m_xTable = table;
  pam.GetPoint().Assign(first);
  return { doc, core, bootstrap, first, table, parser, pam };
}

/** Inserts parsed content into the actual table's section graph. @param value - Original parser and table. @param text - Authored contents. @param rows - Source rowspan. @param cols - Source colspan. @param header - Source header selector. @returns Parsed section. */
function cell(
  value: ReturnType<typeof fixture>,
  text: string,
  rows: number,
  cols: number,
  header: boolean,
) {
  const contents = InsertTableContents(value.parser, value.table, header);
  const node = value.pam.GetPoint().GetNode().GetTextNode();
  assert(node);
  node.SetText(text);
  value.table.InsertCell(
    contents,
    rows,
    cols,
    0,
    false,
    0,
    V.NONE,
    null,
    null,
    false,
    0,
    false,
    0,
    false,
  );
  return node;
}

it("publishes source colspan widths and signed covered row spans on actual boxes", /** Reuses the initial box and uses the existing node and width ownership throughout. @returns Nothing. */ () => {
  const value = fixture();
  const { doc, core, bootstrap, first, table, parser, pam } = value;
  try {
    table.OpenRow(A.End, V.TOP, [null]);
    expect(cell(value, "first", 2, 1, true)).toBe(first);
    const wide = cell(value, "wide header", 1, 2, true);
    table.CloseRow(false);
    table.CloseSection(true);
    table.OpenRow(A.End, V.TOP, [null]);
    const below = cell(value, "below", 1, 1, false);
    table.CloseRow(false);
    table.CloseTable();
    table.MakeTable(null, 5500);
    const [row0, row1] = core.GetTabLines();
    assert(row0 && row1);
    const [actualFirst, actualWide] = row0.GetTabBoxes();
    const [covered, actualBelow, trailing] = row1.GetTabBoxes();
    expect(actualFirst).toBe(bootstrap);
    expect(actualWide?.GetParagraphs()[0]).toBe(wide);
    expect(actualBelow?.GetParagraphs()[0]).toBe(below);
    expect(actualFirst?.getRowSpan()).toBe(2);
    expect(covered?.getRowSpan()).toBe(-1);
    expect(covered?.IsEmpty()).toBe(true);
    expect(trailing?.IsEmpty()).toBe(true);
    expect(core.GetRowsToRepeat()).toBe(1);
    const layout = core.GetHTMLTableLayout();
    assert(layout);
    expect(layout.GetCell(0, 1)?.GetContents()?.GetTableBox()).toBe(actualWide);
    expect(layout.GetCell(0, 2)?.GetContents()?.GetTableBox()).toBe(actualWide);
    expect(layout.GetCell(1, 0)?.GetRowSpan()).toBe(0);
    expect(actualWide?.GetFrameSize().GetWidth()).toBe(
      (layout.GetColumn(1)?.GetRelColWidth() ?? 0) + (layout.GetColumn(2)?.GetRelColWidth() ?? 0),
    );
    expect(core.GetFrameFormat().GetFrameSize().GetWidth()).toBeGreaterThan(0);
  } finally {
    table.SourceDispose();
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
});

it("publishes original borders, minimum row height, brush, orientation and numeric cell items", /** Uses actual pooled items instead of projecting HTML option values into the view. @returns Nothing. */ () => {
  const value = fixture([
    new HTMLOption(O.HEIGHT, "height", "20"),
    new HTMLOption(O.BORDER, "border", "1"),
    new HTMLOption(O.BGCOLOR, "bgcolor", "#123456"),
  ]);
  const { doc, core, bootstrap, table, parser, pam } = value;
  try {
    table.OpenRow(A.End, V.TOP, [null]);
    const contents = InsertTableContents(parser, table, false);
    table.InsertCell(contents, 1, 1, 0, false, 0, V.CENTER, null, null, true, 0, true, 42.5, false);
    table.CloseRow(false);
    table.CloseTable();
    table.MakeTable(null, 5500);
    const line = core.GetTabLines()[0];
    assert(line);
    expect(line.GetFrameSize().GetHeight()).toBe(300);
    expect(bootstrap.GetVertOrient().GetVertOrient()).toBe(V.CENTER);
    expect(bootstrap.GetBox().GetTop()).toBeDefined();
    expect(bootstrap.GetBox().GetRight()).toBeDefined();
    const brush = core.GetFrameFormat().GetAttrSet().GetItemIfSet(RES_BACKGROUND, false);
    assert(brush instanceof SvxBrushItem);
    expect(brush.GetColor().toUInt32()).toBe(0x123456);
    const attrs = bootstrap.GetFrameFormat().GetAttrSet();
    const format = attrs.GetItemIfSet(RES_BOXATR_FORMAT, false);
    const numeric = attrs.GetItemIfSet(RES_BOXATR_VALUE, false);
    assert(format instanceof SwTableBoxNumFormat && numeric instanceof SwTableBoxValue);
    expect([format.GetValue(), numeric.GetValue()]).toEqual([0, 42.5]);
  } finally {
    table.SourceDispose();
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
});
