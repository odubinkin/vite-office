/** @fileoverview Original HTML table grid, nested layout, spacing, context and parser brush contracts over actual document/cursor owners. */
import { assert, expect, it } from "vitest";
import { SwTableBox } from "../../core/table/swtable";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { HTMLTable } from "./htmltab";
import { HTMLTableOptions } from "./htmltab.options";
import { HTMLTableCnts } from "./htmltab.contents";
import { HTMLTableContext } from "./htmltab.context";
import { SwHTMLTableLayout, SwHTMLTableLayoutColumn } from "../../../inc/htmltbl";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { Color } from "../../../../tools/inc/color";
import { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
/** Creates genuine importer/document/cursor owners and native intermediate table lifecycle. @param check - Source observations. @returns Nothing. */
function withParser(check: (parser: SwHTMLParser, doc: SwDoc, table: HTMLTable) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), RTL_TEXTENCODING_UTF8));
  const table = new HTMLTable(parser, false, false, false, new HTMLTableOptions([], A.Left));
  try {
    check(parser, doc, table);
  } finally {
    for (const owner of [...parser.m_aTables]) owner.SourceDispose();
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
/** Adds real native section contents through the actual core table owner. @param doc - Actual document. @returns Shared intermediate content. */
function contents(doc: SwDoc): HTMLTableCnts {
  const node = doc.nodes.MakeTableNode("HTML section source"),
    row = doc.nodes.AppendTableRow(node, 1),
    box = row.GetTabBoxes()[0];
  assert(box);
  return new HTMLTableCnts(box.GetSttNd());
}
/** Calls the full source insertion contract with neutral metadata. @param table - Actual intermediate owner. @param value - Native contents. @param rows - Row span. @param columns - Column span. @param width - Native option. @param relative - Width family. @returns Nothing. */
function insert(
  table: HTMLTable,
  value: HTMLTableCnts | null,
  rows = 1,
  columns = 1,
  width = 0,
  relative = false,
): void {
  table.InsertCell(
    value,
    rows,
    columns,
    width,
    relative,
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
}
it("constructs original defaults and rebuilds the grid layout while retaining content cache identity", /** Actual grid and section owners distinguish a rebuilt table layout from cached cell contents. @returns Nothing. */ () => {
  withParser(
    /** Uses only native public construction/grid queries. @param parser - Importer. @param doc - Actual model. @param table - Actual grid. @returns Nothing. */ (
      parser,
      doc,
      table,
    ) => {
      expect(parser.m_aTables).toContain(table);
      expect(table.IsNewDoc()).toBe(false);
      expect(table.GetContext()).toBeNull();
      expect(table.GetSwTable()).toBeNull();
      expect(table.GetTableAdjust(false)).toBe(A.End);
      expect(table.GetTableAdjust(true)).toBe(A.Left);
      expect(table.m_bFirstCell).toBe(true);
      expect(table.HasColTags()).toBe(false);
      table.OpenRow(A.Right, V.TOP, [null]);
      expect(table.GetInheritedAdjust()).toBe(A.Right);
      expect(table.GetInheritedVertOri()).toBe(V.CENTER);
      const value = contents(doc);
      insert(table, value);
      table.CloseRow(false);
      table.CloseTable();
      const a = table.CreateLayoutInfo(),
        b = table.CreateLayoutInfo();
      expect(a).not.toBe(b);
      expect(a.GetCell(0, 0)).not.toBe(b.GetCell(0, 0));
      expect(a.GetCell(0, 0)?.GetContents()).toBe(value.CreateLayoutInfo());
      expect(b.GetCell(0, 0)?.GetContents()).toBe(a.GetCell(0, 0)?.GetContents());
      expect([
        a.GetRowCount(),
        a.GetColCount(),
        a.GetBorder(),
        a.GetCellPadding(),
        a.GetCellSpacing(),
      ]).toEqual([1, 1, 15, 28, 30]);
      expect([a.GetMin(), a.GetMax(), a.GetBrowseWidthMin()]).toEqual([0, 0, 0]);
      expect(a.IsTopTable()).toBe(false);
      expect(a.IsExportable()).toBe(true);
    },
  );
});
it("grows earlier rows into trailing groups and narrows cell widths independently of table widths", /** Cells use conversion then narrowing; table width ToTwips saturates. @returns Nothing. */ () => {
  withParser(
    /** Creates native cells through actual source public entry points. @param parser - Importer. @param doc - Actual document. @param table - Grid. @returns Nothing. */ (
      parser,
      doc,
      table,
    ) => {
      table.OpenRow(A.End, V.TOP, [null]);
      insert(table, contents(doc));
      table.CloseRow(false);
      table.OpenRow(A.End, V.TOP, [null]);
      insert(table, contents(doc), 1, 3, 5000);
      table.CloseRow(false);
      table.CloseTable();
      expect([table.GetCell(0, 1).GetColSpan(), table.GetCell(0, 2).GetColSpan()]).toEqual([2, 1]);
      expect([
        table.GetCell(1, 0).GetColSpan(),
        table.GetCell(1, 1).GetColSpan(),
        table.GetCell(1, 2).GetColSpan(),
      ]).toEqual([3, 2, 1]);
      expect([table.GetCell(1, 0).IsCovered(), table.GetCell(1, 1).IsCovered()]).toEqual([
        false,
        true,
      ]);
      const layout = table.CreateLayoutInfo();
      expect(layout.GetCell(1, 0)?.GetWidthOption()).toBe(9464);
      expect(layout.GetCell(1, 1)?.GetWidthOption()).toBe(0);
      expect(SwHTMLParser.ToTwips(5000)).toBe(65535);
      expect(SwHTMLParser.ToTwips(1)).toBe(15);
      expect(parser.m_aTables).toHaveLength(1);
    },
  );
});
it("normalizes zero spans and trims rows created only by a spanning cell", /** CloseTable repairs source identities and an already existing layout before deleting extra grid rows. @returns Nothing. */ () => {
  withParser(
    /** Uses native lifecycle and no internal grid writes. @param parser - Importer. @param doc - Actual document. @param table - Grid. @returns Nothing. */ (
      _parser,
      doc,
      table,
    ) => {
      table.OpenRow(A.End, V.TOP, [null]);
      insert(table, contents(doc), 4, 0);
      table.CloseRow(false);
      const before = table.CreateLayoutInfo();
      expect(before.GetRowCount()).toBe(4);
      expect(before.GetCell(0, 0)?.GetRowSpan()).toBe(4);
      table.CloseTable();
      expect(table.GetCell(0, 0).GetRowSpan()).toBe(1);
      expect(before.GetCell(0, 0)?.GetRowSpan()).toBe(1);
      expect(before.GetCell(1, 0)?.GetContents()).toBeNull();
      expect(table.CreateLayoutInfo().GetRowCount()).toBe(1);
      expect(
        /** Borrows a row deleted by original finalization. @returns Cell access that must fail. */ () =>
          table.GetCell(1, 0),
      ).toThrow(RangeError);
    },
  );
});
it("repairs overlapping spans by content identity and protects the uncovered tail", /** A new colspan from the earlier hole crosses a previous row's span and preserves source protection metadata. @returns Nothing. */ () => {
  withParser(
    /** Native OpenRow locates the free leading slot; no private cursor injection. @param parser - Importer. @param doc - Document. @param table - Grid. @returns Nothing. */ (
      _parser,
      doc,
      table,
    ) => {
      const previous = contents(doc),
        replacement = contents(doc);
      table.OpenRow(A.End, V.TOP, [null]);
      insert(table, contents(doc));
      insert(table, previous, 4, 2);
      table.CloseRow(false);
      const oldLayout = table.CreateLayoutInfo();
      table.OpenRow(A.End, V.TOP, [null]);
      insert(table, replacement, 1, 2);
      table.CloseRow(false);
      expect(table.GetCell(0, 1).GetRowSpan()).toBe(1);
      expect(table.GetCell(0, 2).GetRowSpan()).toBe(1);
      expect(table.GetCell(1, 0).GetContents()).toBe(replacement);
      expect(table.GetCell(1, 1).GetContents()).toBe(replacement);
      for (let row = 1; row < 4; ++row) {
        expect(table.GetCell(row, 2).GetContents()).toBeNull();
        expect(table.GetCell(row, 2).IsUsed()).toBe(true);
        expect(oldLayout.GetCell(row, 2)?.GetContents()).toBeNull();
      }
      expect(table.GetCell(2, 1).IsUsed()).toBe(true);
      expect(table.GetCell(2, 1).GetRowSpan()).toBe(1);
      table.CloseTable();
      expect(table.CreateLayoutInfo().GetRowCount()).toBe(2);
    },
  );
});
it("skips occupied cells and preserves column-first alignment and row-first vertical inheritance", /** Native TOP means unset; HTML top is NONE and therefore overrides inherited orientation. @returns Nothing. */ () => {
  withParser(
    /** Calls column and row producers on their original owner. @param parser - Importer. @param doc - Document. @param table - Grid. @returns Nothing. */ (
      _parser,
      doc,
      table,
    ) => {
      table.InsertCol(1, 5, false, A.Center, V.BOTTOM);
      table.CloseColGroup(1, 30, true, A.Right, V.CENTER);
      table.OpenRow(A.Left, V.TOP, [null]);
      expect([table.GetInheritedAdjust(), table.GetInheritedVertOri()]).toEqual([
        A.Center,
        V.BOTTOM,
      ]);
      insert(table, contents(doc), 2);
      expect([table.GetInheritedAdjust(), table.GetInheritedVertOri()]).toEqual([
        A.Right,
        V.CENTER,
      ]);
      insert(table, contents(doc));
      table.CloseRow(false);
      table.CloseSection(true);
      table.OpenRow(A.Left, V.NONE, [null]);
      expect([table.GetInheritedAdjust(), table.GetInheritedVertOri()]).toEqual([A.Right, V.NONE]);
      insert(table, contents(doc));
      table.InsertCol(3, 200, false, A.Block, V.BOTTOM);
      table.CloseRow(false);
      table.CloseTable();
      const layout = table.CreateLayoutInfo();
      expect(layout.HasColTags()).toBe(true);
      expect(layout.GetColCount()).toBe(2);
      expect(layout.GetColumn(0)?.GetWidthOption()).toBe(75);
      expect(layout.GetColumn(1)?.GetWidthOption()).toBe(30);
      expect(layout.GetColumn(1)?.IsRelWidthOption()).toBe(true);
    },
  );
});
it("reuses an empty row index and trims unused declared columns", /** Empty-row close does not advance, and fixed COLS remains distinct from COL tags after trimming. @returns Nothing. */ () => {
  withParser(
    /** Creates a fixed-column table with source options rather than editing its grid. @param parser - Importer. @param doc - Document. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const options = new HTMLTableOptions([], A.Left);
      options.nCols = 5;
      options.nWidth = 5000;
      const table = new HTMLTable(parser, false, false, false, options);
      table.OpenRow(A.End, V.TOP, [null]);
      insert(table, contents(doc));
      table.CloseRow(false);
      table.OpenRow(A.End, V.TOP, [null]);
      table.CloseRow(true);
      table.OpenRow(A.End, V.TOP, [null]);
      insert(table, contents(doc), 0, 1);
      table.CloseRow(false);
      table.CloseTable();
      const layout = table.CreateLayoutInfo();
      expect([layout.GetRowCount(), layout.GetColCount(), layout.GetWidthOption()]).toEqual([
        2, 1, 65535,
      ]);
      expect(layout.HasColsOption()).toBe(true);
      expect(layout.HasColTags()).toBe(false);
    },
  );
});
it("creates a missing dimension for a completely unspecified empty table", /** Native fallback creates a real intermediate one-cell grid; no document table is synthesized. @returns Nothing. */ () => {
  withParser(
    /** Exercises only original CloseTable defaults. @param parser - Importer. @param doc - Document. @param table - Grid. @returns Nothing. */ (
      _parser,
      _doc,
      table,
    ) => {
      table.CloseTable();
      const layout = table.CreateLayoutInfo();
      expect([layout.GetRowCount(), layout.GetColCount()]).toEqual([1, 1]);
      expect(layout.GetCell(0, 0)?.GetContents()).toBeNull();
      expect(table.GetSwTable()).toBeNull();
    },
  );
});
it("retains original nested table references and marks compound contents nonexportable", /** The intermediate nested owner is real even though document materialization is a later pass. @returns Nothing. */ () => {
  withParser(
    /** Builds source nested owner and chained section owner. @param parser - Importer. @param doc - Document. @param table - Outer grid. @returns Nothing. */ (
      parser,
      doc,
      table,
    ) => {
      const nested = new HTMLTable(parser, false, true, false, new HTMLTableOptions([], A.Left));
      nested.OpenRow(A.End, V.TOP, [null]);
      insert(nested, contents(doc));
      nested.CloseRow(false);
      nested.CloseTable();
      const value = new HTMLTableCnts(nested);
      expect(value.GetTable()).toBe(nested);
      expect(value.GetStartNode()).toBeNull();
      table.OpenRow(A.End, V.TOP, [null]);
      insert(table, value);
      const compound = contents(doc);
      compound.Add(contents(doc));
      insert(table, compound);
      table.CloseRow(false);
      table.CloseTable();
      const layout = table.CreateLayoutInfo();
      expect(layout.IsExportable()).toBe(false);
      const nestedLayout = layout.GetCell(0, 0)?.GetContents()?.GetTable();
      expect(nestedLayout).toBeInstanceOf(SwHTMLTableLayout);
      expect(nestedLayout?.GetRowCount()).toBe(1);
      expect(value.CreateLayoutInfo().GetTable()).toBe(nestedLayout);
    },
  );
});
it("copies source metadata and binds actual core table/context identities", /** Options are not retained as a mutable sidecar; SetTable consumes a genuine owned position. @returns Nothing. */ () => {
  withParser(
    /** Supplies native constructor options and actual core owners. @param parser - Importer. @param doc - Document. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const options = new HTMLTableOptions([], A.Right);
      options.aId = "table-id";
      options.aClass = "class";
      options.aStyle = "color: red";
      options.aDir = "rtl";
      options.nHSpace = 5000;
      options.nVSpace = 2;
      options.bTableAdjust = true;
      const table = new HTMLTable(parser, true, true, true, options);
      options.aId = "changed";
      expect([table.GetId(), table.GetClass(), table.GetStyle(), table.GetDirection()]).toEqual([
        "table-id",
        "class",
        "color: red",
        "rtl",
      ]);
      expect([
        table.GetHSpace(),
        table.GetVSpace(),
        table.GetTableAdjust(false),
        table.HasParentSection(),
        table.HasToFly(),
      ]).toEqual([9464, 30, A.Right, true, true]);
      const node = doc.nodes.MakeTableNode("Actual bound table").GetTableNode(),
        context = new HTMLTableContext(
          new SwPosition(
            parser.m_pPam.GetPoint().GetNode(),
            parser.m_pPam.GetPoint().GetContentIndex(),
          ),
          7,
          3,
        );
      context.SetTableNode(node);
      table.SetTable(node, context, 12, 24, node.GetTable(), true);
      table.SetCaption(node, true);
      expect(table.GetCaptionStartNode()).toBe(node);
      expect(table.IsTopCaption()).toBe(true);
      expect(table.GetContext()).toBe(context);
      expect(table.GetSwTable()).toBe(node.GetTable());
      expect(context.GetTableNode()).toBe(node);
      expect([context.GetContextStMin(), context.GetContextStAttrMin()]).toEqual([7, 3]);
      table.CloseTable();
      expect(table.CreateLayoutInfo().IsTopTable()).toBe(true);
      table.SetParentContents(contents(doc));
      expect(table.GetParentContents()).toBeInstanceOf(HTMLTableCnts);
      table.SetHasParentSection(false);
      expect(table.HasParentSection()).toBe(false);
    },
  );
});
it("suspends and restores all independently active PRE Listing XMP flags and copies numbering", /** Restart order resets line state through original parser APIs; context numbering is an independent snapshot. @returns Nothing. */ () => {
  withParser(
    /** Real parser flags are established through public native mode methods. @param parser - Importer. @returns Nothing. */ (
      parser,
    ) => {
      const context = new HTMLTableContext(null, 1, 2);
      parser.StartPRE();
      parser.StartXMP();
      parser.StartListing();
      parser.GetNumInfo().SetDepth(4);
      context.SetNumInfo(parser.GetNumInfo());
      parser.GetNumInfo().SetDepth(1);
      context.SavePREListingXMP(parser);
      expect([parser.IsReadPRE(), parser.IsReadXMP(), parser.IsReadListing()]).toEqual([
        false,
        false,
        false,
      ]);
      expect(context.GetNumInfo().GetDepth()).toBe(4);
      parser.StartXMP();
      context.RestorePREListingXMP(parser);
      expect([parser.IsReadPRE(), parser.IsReadXMP(), parser.IsReadListing()]).toEqual([
        true,
        true,
        true,
      ]);
      context.SourceDispose();
    },
  );
});
it("uses original brush class ID inline precedence before legacy colors and image branches", /** Actual pooled sets and CSS map entries supply colors; source graphic brushes are explicitly unavailable. @returns Nothing. */ () => {
  withParser(
    /** Constructs source CSS through original property and map producers. @param parser - Importer. @param doc - Document. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const items = new SfxItemSet(doc.GetAttrPool(), parser.m_pCSS1Parser.GetWhichMap()),
        info = new SvxCSS1PropertyInfo();
      try {
        parser.m_pCSS1Parser.ParseStyleOption("background-color: #112233", items, info);
        parser.m_pCSS1Parser.InsertClass("sample", items, info);
        items.ClearItem();
        parser.m_pCSS1Parser.ParseStyleOption("background-color: #445566", items, info);
        parser.m_pCSS1Parser.InsertId("selected", items, info);
      } finally {
        items.Dispose();
      }
      const legacy = new Color(0xaabbcc),
        fromClass = parser.CreateBrushItem(legacy, "", "", "", "sample-western"),
        fromId = parser.CreateBrushItem(legacy, "", "", "selected", "sample"),
        inline = parser.CreateBrushItem(
          legacy,
          "ignored-by-CSS",
          "background-color: #778899",
          "selected",
          "sample",
        );
      expect(fromClass?.GetColor().toUInt32()).toBe(0x112233);
      expect(fromId?.GetColor().toUInt32()).toBe(0x445566);
      expect(inline?.GetColor().toUInt32()).toBe(0x778899);
      const fallback = parser.CreateBrushItem(legacy, "", "color: red", "", "");
      expect(fallback?.GetColor().toUInt32()).toBe(0xaabbcc);
      expect(parser.CreateBrushItem(null, "", "", "", "")).toBeNull();
      expect(
        /** Exercises the unrepresented source graphic-link branch after CSS precedence. @returns Brush creation that must fail. */ () =>
          parser.CreateBrushItem(null, "image.png", "", "", ""),
      ).toThrow("graphic-link brush");
      for (const brush of [fromClass, fromId, inline, fallback]) brush?.Dispose();
    },
  );
});
it("transfers only a genuinely unconsumed first box on deregistration and retains other tables", /** A distinct real box is registered at its document-owned format without stealing an already table-owned box. @returns Nothing. */ () => {
  withParser(
    /** Checks source registration and uint16 threshold behavior. @param parser - Importer. @param doc - Document. @param table - Grid. @returns Nothing. */ (
      parser,
      doc,
      table,
    ) => {
      expect(table.IsOverflowing()).toBe(false);
      for (let i = 1; i < 64001; ++i) table.IncBoxCount();
      expect(table.IsOverflowing()).toBe(true);
      for (let i = 64001; i < 65536; ++i) table.IncBoxCount();
      expect(table.IsOverflowing()).toBe(false);
      const node = doc.nodes.MakeTableNode("Unconsumed box source"),
        row = doc.nodes.AppendTableRow(node, 1),
        borrowed = row.GetTabBoxes()[0];
      assert(borrowed);
      const unconsumed = new SwTableBox(borrowed.GetFrameFormat(), borrowed.GetSttNd());
      const other = new HTMLTable(parser, false, false, false, new HTMLTableOptions([], A.Left));
      table.m_xBox1 = unconsumed;
      table.SourceDispose();
      expect(table.m_xBox1).toBeNull();
      expect(parser.m_aTables).not.toContain(table);
      expect(parser.m_aTables).toEqual([other]);
      expect(parser.m_aOrphanedTableBoxes).toEqual([unconsumed]);
    },
  );
});
it.each([
  [0, 1, true, 25, 5],
  [1, 1, true, 80, 28],
  [2, 1, true, 28, 90],
  [0, 3, true, 25, 90],
  [1, 2, true, 80, 90],
  [0, 1, false, 15, 5],
  [1, 1, false, 12, 5],
  [2, 1, false, 12, 15],
] as const)(
  "preserves native cell spacing at column %i span %i borders %s",
  /** Original current-column border test intentionally differs from a next-column lookup. @param column - Native column. @param span - Native span. @param borders - Respect actual lines. @param left - Expected left space. @param right - Expected right space. @returns Nothing. */ (
    column,
    span,
    borders,
    left,
    right,
  ) => {
    const layout = new SwHTMLTableLayout(
      null,
      1,
      3,
      false,
      false,
      0,
      false,
      3,
      5,
      7,
      A.Left,
      0,
      0,
      80,
      25,
      90,
    );
    layout.SetColumn(new SwHTMLTableLayoutColumn(0, false, false), 0);
    layout.SetColumn(new SwHTMLTableLayoutColumn(0, false, true), 1);
    layout.SetColumn(new SwHTMLTableLayoutColumn(0, false, false), 2);
    expect([
      layout.GetLeftCellSpace(column, span, borders),
      layout.GetRightCellSpace(column, span, borders),
    ]).toEqual([left, right]);
  },
);
it("sums native column widths with uint16 output wrap and handles empty availability spans", /** Public column width setters supply results directly; no automatic measurement is simulated. @returns Nothing. */ () => {
  const layout = new SwHTMLTableLayout(
      null,
      1,
      2,
      false,
      true,
      100,
      true,
      0,
      0,
      0,
      A.Left,
      0,
      0,
      0,
      0,
      0,
    ),
    a = new SwHTMLTableLayoutColumn(0, false, false),
    b = new SwHTMLTableLayoutColumn(0, false, false);
  a.SetAbsColWidth(65000);
  b.SetAbsColWidth(1000);
  a.SetRelColWidth(40000);
  b.SetRelColWidth(30000);
  layout.SetColumn(a, 0);
  layout.SetColumn(b, 1);
  const absolute: [number] = [99],
    relative: [number] = [99];
  layout.GetAvail(0, 2, absolute, relative);
  expect([absolute[0], relative[0]]).toEqual([464, 4464]);
  layout.GetAvail(1, 0, absolute, relative);
  expect([absolute[0], relative[0]]).toEqual([0, 0]);
  expect(layout.GetInhCellSpace(0, 2)).toBe(0);
  expect(layout.MayBeInFlyFrame()).toBe(false);
  layout.SetMayBeInFlyFrame(true);
  expect(layout.MayBeInFlyFrame()).toBe(true);
  expect(layout.HaveBordersChanged()).toBe(false);
  layout.SetExportable(false);
  expect(layout.IsExportable()).toBe(false);
});

it.each([
  [0, 0, 0, 0, 0, 0],
  [1, 1, 1, 15, 28, 15],
  [65535, 65535, 65535, 15, 28, 30],
  [5000, 5000, 5000, 9464, 65535, 65535],
] as const)(
  "keeps source border padding spacing conversions for %i %i %i",
  /** Default sentinels, explicit zero, minimum distance and saturation take different native branches. @param border - Border option. @param padding - Padding option. @param spacing - Spacing option. @param expectedBorder - Narrowed accounting border. @param expectedPadding - Padding with native minimum. @param expectedSpacing - Saturated spacing. @returns Nothing. */ (
    border,
    padding,
    spacing,
    expectedBorder,
    expectedPadding,
    expectedSpacing,
  ) => {
    withParser(
      /** Supplies original public option fields before constructor copies them. @param parser - Importer. @returns Nothing. */ (
        parser,
      ) => {
        const options = new HTMLTableOptions([], A.Left);
        options.nBorder = border;
        options.nCellPadding = padding;
        options.nCellSpacing = spacing;
        const table = new HTMLTable(parser, false, false, false, options);
        table.CloseTable();
        const layout = table.CreateLayoutInfo();
        expect([layout.GetBorder(), layout.GetCellPadding(), layout.GetCellSpacing()]).toEqual([
          expectedBorder,
          expectedPadding,
          expectedSpacing,
        ]);
      },
    );
  },
);
