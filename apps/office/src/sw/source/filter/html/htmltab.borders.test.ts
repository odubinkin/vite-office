/** @fileoverview Native HTML table FRAME/RULES/group and nested background inheritance over real table/cell/section owners, plus actual core layout border and box-width publication. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { HTMLTable } from "./htmltab";
import { HTMLTableOptions } from "./htmltab.options";
import { HTMLTableCnts } from "./htmltab.contents";
import { HTMLParser } from "../../../../svtools/source/svhtml/parhtml";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import type { SvxBrushItem } from "../../../../editeng/source/items/frmitems.brush";
import { Color } from "../../../../tools/inc/color";
import { SwHTMLTableLayout, SwHTMLTableLayoutColumn } from "../../../inc/htmltbl";
import type { SwTableBox } from "../../core/table/swtable";
import { SwFrameSize } from "../../../inc/fmtfsize";
/** Test-only access forwards original protected operations without overriding their logic, result or native state. */
class Table extends HTMLTable {
  /** Forwards original border completion. @returns Nothing. */
  public override SetBorders(): void {
    super.SetBorders();
  }
  /** Reads original completion state. @returns Flag. */
  public override BordersSet(): boolean {
    return super.BordersSet();
  }
  /** Reads original own brush. @returns Borrowed source brush. */
  public override GetBGBrush(): SvxBrushItem | null {
    return super.GetBGBrush();
  }
  /** Reads original inherited brush. @returns Borrowed source brush. */
  public override GetInhBGBrush(): SvxBrushItem | null {
    return super.GetInhBGBrush();
  }
  /** Forwards original top spacing. @param row - Native row. @returns Twips. */
  public override GetTopCellSpace(row: number): number {
    return super.GetTopCellSpace(row);
  }
  /** Forwards original bottom spacing. @param row - Native row. @param span - Native span. @returns Twips. */
  public override GetBottomCellSpace(row: number, span: number): number {
    return super.GetBottomCellSpace(row, span);
  }
  /** Forwards original parent inheritance. @param parent - Real parent. @param row - Row. @param col - Column. @param span - Span. @param first - First content. @param last - Last content. @returns Nothing. */
  public override InheritBorders(
    parent: HTMLTable,
    row: number,
    col: number,
    span: number,
    first: boolean,
    last: boolean,
  ): void {
    super.InheritBorders(parent, row, col, span, first, last);
  }
  /** Forwards original vertical inheritance. @param parent - Actual parent. @param col - Column. @param span - Span. @returns Nothing. */
  public override InheritVertBorders(parent: HTMLTable, col: number, span: number): void {
    super.InheritVertBorders(parent, col, span);
  }
}
/** Test-only protected access; actual column/grid/frame operations and state remain in the original owner. */
class Layout extends SwHTMLTableLayout {
  /** Forwards original native border addition. @param min - Output. @param max - Output. @param absolute - Output. @param col - Column. @param span - Span. @param borders - Respect native borders. @returns Nothing. */
  public override AddBorderWidth(
    min: [number],
    max: [number],
    absolute: [number],
    col: number,
    span: number,
    borders = true,
  ): void {
    super.AddBorderWidth(min, max, absolute, col, span, borders);
  }
  /** Forwards original actual box format write. @param box - Real box. @param col - Column. @param span - Span. @returns Nothing. */
  public override SetBoxWidth(box: SwTableBox, col: number, span: number): void {
    super.SetBoxWidth(box, col, span);
  }
}
/** Captures actual source table options at the native lexer callback. */
class OptionsReader extends HTMLParser {
  value: HTMLTableOptions | undefined;
  /** Consumes only real table start callbacks. @param token - Native token. @returns Nothing. */
  protected override NextToken(token: T): void {
    if (token === T.TABLE_ON) this.value = new HTMLTableOptions(this.GetOptions(), A.Left);
  }
}
/** Constructs options from actual byte tokens. @param attrs - HTML attributes. @returns Native options. */
function options(attrs: string): HTMLTableOptions {
  const reader = new OptionsReader(
    new SvStream(OUStringToOString(`<table ${attrs}></table>`, UTF8), UTF8),
    false,
  );
  reader.CallParser();
  assert(reader.value);
  return reader.value;
}
/** Runs with actual native document, cursor and importer lifetimes. @param check - Native assertions. @returns Nothing. */
function inspect(check: (parser: SwHTMLParser, doc: SwDoc) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), UTF8));
  try {
    check(parser, doc);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
/** Allocates a genuine core section through the existing native table owner. @param doc - Actual graph. @returns Intermediate contents borrowing a real section. */
function section(doc: SwDoc): HTMLTableCnts {
  const table = doc.nodes.MakeTableNode("border section"),
    row = doc.nodes.AppendTableRow(table, 1),
    box = row.GetTabBoxes()[0];
  assert(box);
  return new HTMLTableCnts(box.GetSttNd());
}
/** Inserts a real source cell without producing layout metrics. @param table - Actual intermediate grid. @param contents - Actual section/table chain. @param brush - Native shared cell brush. @param rows - Row span. @returns Nothing. */
function cell(
  table: HTMLTable,
  contents: HTMLTableCnts | null,
  brush: SvxBrushItem | null = null,
  rows = 1,
): void {
  table.InsertCell(contents, rows, 1, 0, false, 0, V.NONE, brush, null, false, 0, false, 0, false);
}
/** Creates a populated, closed actual grid. @param parser - Native importer. @param doc - Actual graph. @param attrs - Source options. @returns Native grid. */
function one(parser: SwHTMLParser, doc: SwDoc, attrs = ""): Table {
  const table = new Table(parser, false, false, false, options(attrs));
  table.OpenRow(A.End, V.TOP, [null]);
  cell(table, section(doc));
  table.CloseRow(false);
  table.CloseTable();
  return table;
}
/** Creates an actual parser brush value. @param parser - Native importer. @param rgb - Native color. @returns Real brush. */
function brush(parser: SwHTMLParser, rgb: number): SvxBrushItem {
  const value = parser.CreateBrushItem(new Color(rgb), "", "", "", "");
  assert(value);
  return value;
}
it.each([
  ["void", false],
  ["above", false],
  ["below", false],
  ["hsides", false],
  ["lhs", true],
  ["rhs", false],
  ["vsides", true],
  ["box", true],
  ["border", true],
] as const)(
  "sets original first-column FRAME=%s admission",
  /** Real native options and layout columns retain the source outside-edge selection. @param frame - Frame option. @param left - Expected left edge. @returns Nothing. */ (
    frame,
    left,
  ) => {
    inspect(
      /** Observes actual layout column state. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
        parser,
        doc,
      ) => {
        const table = one(parser, doc, `border=3 frame=${frame} rules=none`);
        expect(table.BordersSet()).toBe(false);
        table.SetBorders();
        expect(table.BordersSet()).toBe(true);
        expect(table.CreateLayoutInfo().GetColumn(0)?.HasLeftBorder()).toBe(left);
      },
    );
  },
);
it.each([
  ["none", [false, false, false]],
  ["all", [false, true, true]],
  ["cols", [false, true, true]],
  ["rows", [false, true, false]],
  ["groups", [false, true, false]],
] as const)(
  "applies original RULES=%s and column group boundaries",
  /** Rows rules also create vertical group separators, preserving source cross-axis behavior. @param rules - Rules option. @param expected - Native column border flags. @returns Nothing. */ (
    rules,
    expected,
  ) => {
    inspect(
      /** Builds native groups before actual cell insertion. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
        parser,
        doc,
      ) => {
        const table = new Table(
          parser,
          false,
          false,
          false,
          options(`border=2 frame=void rules=${rules}`),
        );
        table.InsertCol(1, 0, false, A.End, V.TOP);
        table.CloseColGroup(0, 0, false, A.End, V.TOP);
        table.InsertCol(2, 0, false, A.End, V.TOP);
        table.OpenRow(A.End, V.TOP, [null]);
        for (let i = 0; i < 3; ++i) cell(table, section(doc));
        table.CloseRow(false);
        table.CloseTable();
        table.SetBorders();
        const layout = table.CreateLayoutInfo();
        expect(
          [0, 1, 2].map(
            /** Reads actual native columns. @param col - Column. @returns Border flag. */ (col) =>
              layout.GetColumn(col)?.HasLeftBorder(),
          ),
        ).toEqual(expected);
      },
    );
  },
);
it("keeps Netscape vertical spacing separate from actual FRAME admission", /** Source spacing always accounts for the border option even when the corresponding actual edge is disabled. @returns Nothing. */ () => {
  inspect(
    /** Compares real source option profiles. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const table = new Table(
        parser,
        false,
        false,
        false,
        options("border=3 frame=void rules=none cellpadding=2 cellspacing=4"),
      );
      for (let row = 0; row < 2; ++row) {
        table.OpenRow(A.End, V.TOP, [null]);
        cell(table, section(doc));
        table.CloseRow(false);
      }
      table.CloseTable();
      table.SetBorders();
      expect(table.GetTopCellSpace(0)).toBe(135);
      expect(table.GetTopCellSpace(1)).toBe(30);
      expect(table.GetBottomCellSpace(1, 1)).toBe(135);
      expect(table.GetBottomCellSpace(0, 1)).toBe(90);
      expect(table.CreateLayoutInfo().GetColumn(0)?.HasLeftBorder()).toBe(false);
    },
  );
});
it.each(["cell", "row", "table", "inherited"] as const)(
  "inherits the native %s background through actual nested contents",
  /** Real SetBorders visits a shared nested table once and clones the selected source brush. @param source - Native fallback family. @returns Nothing. */ (
    source,
  ) => {
    inspect(
      /** Builds actual source ownership and fallback values. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
        parser,
        doc,
      ) => {
        const outer = new Table(parser, false, false, false, options("border=1 frame=box"));
        const child = one(parser, doc, "border=0 bgcolor=blue"),
          chosen = brush(parser, 0x123456);
        if (source === "table") outer.SetBGBrush(chosen);
        if (source === "inherited") {
          const grand = one(parser, doc, "bgcolor=#123456");
          outer.OpenRow(A.End, V.TOP, [null]);
          cell(outer, new HTMLTableCnts(child));
          outer.CloseRow(false);
          outer.CloseTable();
          outer.InheritBorders(grand, 0, 0, 1, true, true);
        } else {
          outer.OpenRow(A.End, V.TOP, [source === "row" ? chosen : null]);
          cell(outer, new HTMLTableCnts(child), source === "cell" ? chosen : null);
          outer.CloseRow(false);
          outer.CloseTable();
        }
        outer.SetBorders();
        expect(child.BordersSet()).toBe(true);
        expect(child.GetInhBGBrush()?.GetColor().toUInt32()).toBe(0x123456);
        expect(child.GetInhBGBrush()).not.toBe(chosen);
        expect(child.GetBGBrush()?.GetColor().toUInt32()).toBe(0x0000ff);
        const inherited = child.GetInhBGBrush();
        outer.SetBGBrush(brush(parser, 0xff0000));
        outer.SetBorders();
        expect(child.GetInhBGBrush()).toBe(inherited);
        outer.CreateLayoutInfo();
        child.InheritVertBorders(outer, 0, 1);
      },
    );
  },
);
it("does not inherit a parent row/table background through a partial-height cell", /** Source fallback beyond the cell brush is admitted only for a full-height containing cell. @returns Nothing. */ () => {
  inspect(
    /** Uses two real parent rows. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const child = one(parser, doc),
        outer = new Table(parser, false, false, false, options("bgcolor=red"));
      outer.OpenRow(A.End, V.TOP, [brush(parser, 0x123456)]);
      cell(outer, new HTMLTableCnts(child));
      outer.CloseRow(false);
      outer.OpenRow(A.End, V.TOP, [null]);
      cell(outer, section(doc));
      outer.CloseRow(false);
      outer.CloseTable();
      outer.SetBorders();
      expect(child.GetInhBGBrush()).toBeNull();
    },
  );
});
it("retains an already inherited background when a later parent provides none", /** Original conditional assignment leaves the prior clone unchanged (WRITER319). @returns Nothing. */ () => {
  inspect(
    /** Calls native inheritance with real closed grids. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const child = one(parser, doc),
        first = one(parser, doc, "bgcolor=red"),
        second = one(parser, doc);
      child.InheritBorders(first, 0, 0, 1, true, true);
      const inherited = child.GetInhBGBrush();
      assert(inherited);
      child.InheritBorders(second, 0, 0, 1, false, false);
      expect(child.GetInhBGBrush()).toBe(inherited);
    },
  );
});
it("adds border spaces in the wide metric domain and publishes actual box frame widths", /** Native AddBorderWidth sums narrowed sides without narrowing their sum; SetBoxWidth writes the actual core format and keeps native wide SwTwips summation. @returns Nothing. */ () => {
  inspect(
    /** Uses actual native column values and a real core box. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
      _parser,
      doc,
    ) => {
      const layout = new Layout(
        null,
        1,
        2,
        false,
        false,
        0,
        false,
        0,
        40000,
        0,
        A.Left,
        0,
        0,
        0,
        0,
        0,
      );
      const first = new SwHTMLTableLayoutColumn(0, false, false),
        second = new SwHTMLTableLayoutColumn(0, false, false);
      layout.SetColumn(first, 0);
      layout.SetColumn(second, 1);
      const min: [number] = [10],
        max: [number] = [20],
        absolute: [number] = [30];
      layout.AddBorderWidth(min, max, absolute, 0, 1);
      expect([min[0], max[0], absolute[0]]).toEqual([80010, 80020, 80030]);
      first.SetRelColWidth(40000);
      second.SetRelColWidth(40000);
      const table = doc.nodes.MakeTableNode("wide native width"),
        line = doc.nodes.AppendTableRow(table, 1),
        box = line.GetTabBoxes()[0];
      assert(box);
      layout.SetBoxWidth(box, 0, 2);
      expect(box.GetFrameFormat().GetFrameSize().GetWidth()).toBe(80000);
      expect(box.GetFrameFormat().GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Variable);
      const abs: [number] = [0],
        rel: [number] = [0];
      layout.GetAvail(0, 2, abs, rel);
      expect(rel[0]).toBe(80000 & 65535);
    },
  );
});
