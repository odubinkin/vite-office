/** @fileoverview Actual lexer options, core table sections, formatters and cell-save operations exercise source metadata and NOBR state. Component fixtures do not claim production BuildTable orchestration. */
import { assert, expect, it } from "vitest";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { HTMLTable } from "./htmltab";
import { HTMLTableOptions } from "./htmltab.options";
import { CellSaveStruct } from "./htmltab.cell-save";
import { InsertTableContents } from "./htmltab.sections";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SvParserState as S } from "../../../../svtools/inc/svparser";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { NfEvalDateFormat } from "../../../../svl/inc/zforlist";
import { SvxFrameDirectionItem } from "../../../../editeng/inc/frmdiritem";
import { RES_FRAMEDIR, RES_BOX } from "../../../inc/hintids";
import { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SvxCSS1PropertyInfo } from "./svxcss1.types";
/** Test-only real virtual-consumer entry creates actual source owners, consumes actual tags and invokes the original save/section/publication operations. No fake tokens, native results, private minima or measured geometry are supplied. */
class CellReader extends SwHTMLParser {
  cellTable: HTMLTable | null = null;
  private cellSave: CellSaveStruct | null = null;
  readonly publishedSpans: number[][] = [];
  /** Binds real lexer input to original component operations; the pending full table reader is not replaced or certified. @param token - Actual lexer token. @returns Nothing. */
  protected override NextToken(token: T): void {
    if (token === T.TABLE_ON) {
      this.cellTable = new HTMLTable(
        this,
        false,
        false,
        false,
        new HTMLTableOptions(this.GetOptions(), A.Left),
      );
      const core = this.m_xDoc.nodes.MakeTableNode("actual cell source"),
        row = this.m_xDoc.nodes.AppendTableRow(core, 1),
        node = row.GetTabBoxes()[0]?.GetParagraphs()[0];
      assert(node);
      this.m_pPam.GetPoint().Assign(node);
      return;
    }
    const table = this.cellTable;
    if (table && token === T.TABLEROW_ON) {
      table.OpenRow(A.Right, V.CENTER, [null]);
      return;
    }
    if (table && (token === T.TABLEDATA_ON || token === T.TABLEHEADER_ON)) {
      this.cellSave = new CellSaveStruct(this, table, token === T.TABLEHEADER_ON, true);
      this.cellSave.AddContents(InsertTableContents(this, table, token === T.TABLEHEADER_ON));
      this.SetTextCollAttrs();
      return;
    }
    if (this.cellSave && token === T.NOBR_ON) {
      this.cellSave.StartNoBreak(this.m_pPam.GetPoint());
      return;
    }
    if (this.cellSave && token === T.NOBR_OFF) {
      this.cellSave.EndNoBreak(this.m_pPam.GetPoint());
      return;
    }
    if (table && this.cellSave && (token === T.TABLEDATA_OFF || token === T.TABLEHEADER_OFF)) {
      this.cellSave.CheckNoBreak(this.m_pPam.GetPoint());
      while (this.m_aContexts.length > this.m_nContextStAttrMin + 1) {
        const context = this.PopContext();
        assert(context);
        this.EndContext(context);
      }
      this.StripTrailingLF();
      const context = this.PopContext();
      assert(context);
      this.EndContext(context);
      this.GetNumInfo().Clear();
      this.SetAttr(false);
      this.cellSave.InsertCell(this, table);
      const cell = table.GetCell(0, 0);
      this.publishedSpans.push([cell.GetRowSpan(), cell.GetColSpan()]);
      this.cellSave = null;
      return;
    }
    if (table && token === T.TABLEROW_OFF) {
      table.CloseRow(false);
      return;
    }
    if (table && token === T.TABLE_OFF) {
      table.CloseTable();
      return;
    }
    super.NextToken(token);
  }
}
/** Parses genuine bytes into actual table sections and inspects native state before deterministic source disposal. @param input - Actual HTML input. @param inspect - Source observations. @returns Nothing. */
function inspect(
  input: string,
  inspect: (reader: CellReader, doc: SwDoc, table: HTMLTable) => void,
): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const point = new SwPosition(node),
    pam = new SwPaM(point);
  point.Dispose();
  const reader = new CellReader(doc, pam, new SvStream(OUStringToOString(input, UTF8), UTF8));
  try {
    expect(reader.CallParser()).toBe(S.Accepted);
    assert(reader.cellTable);
    inspect(reader, doc, reader.cellTable);
  } finally {
    for (const table of [...reader.m_aTables]) table.SourceDispose();
    reader.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
it.each([
  ["colspan=256", 1, 256],
  ["colspan=257", 1, 1],
  ["colspan=65536", 1, 1],
  ["colspan=65537", 1, 1],
  ["rowspan=8192", 8192, 1],
  ["rowspan=8193", 1, 1],
  ["rowspan=65536", 1, 1],
  ["rowspan=2 rowspan=3 colspan=2 colspan=3", 2, 2],
] as const)(
  "retains source span narrowing/limits and duplicate precedence for %s",
  /** Actual options reach the original intermediate grid before source CloseTable trims unused spanning rows. @param options - Raw TD attributes. @param rows - Published source span. @param columns - Published source span. @returns Nothing. */ (
    options,
    rows,
    columns,
  ) => {
    inspect(
      `<table><tr><td ${options}>x</td></tr></table>`,
      /** Reads actual native published state, not a substituted result. @param reader - Native consumer. @param doc - Actual document. @param table - Actual grid. @returns Nothing. */ (
        reader,
        _doc,
        table,
      ) => {
        expect(reader.publishedSpans).toEqual([[rows, columns]]);
        expect(table.CreateLayoutInfo().GetColCount()).toBe(columns);
      },
    );
  },
);
it.each([
  ["width=50", 750, false],
  ["width='150%'", 100, true],
  ["width='65536%'", 0, false],
  ["width='65537%'", 1, true],
  ["width='2*'", 30, false],
] as const)(
  "retains native cell width %s",
  /** Cell percent admission differs from source COL asterisk-relative widths. @param options - Raw TD options. @param width - Actual stored width. @param percent - Native family. @returns Nothing. */ (
    options,
    width,
    percent,
  ) => {
    inspect(
      `<table><tr><td ${options} nowrap>x</td></tr></table>`,
      /** Observes original option values without automatic-layout substitutes. @param reader - Actual reader. @param doc - Actual document. @param table - Actual grid. @returns Nothing. */ (
        _reader,
        _doc,
        table,
      ) => {
        const cell = table.CreateLayoutInfo().GetCell(0, 0);
        assert(cell);
        expect([
          cell.GetWidthOption(),
          cell.IsPercentWidthOption(),
          cell.HasNoWrapOption(),
        ]).toEqual([width, percent, true]);
      },
    );
  },
);
it.each([
  ["<nobr>whole</nobr>", true],
  ["<nobr>whole</nobr> ", true],
  ["<nobr>whole</nobr><br>", true],
  ["<nobr>whole</nobr><br><br>", false],
  ["<nobr>whole", true],
  ["prefix<nobr>word</nobr>", false],
  ["<nobr>whole</nobr>suffix", false],
  ["<nobr>whole</nobr>&nbsp;", false],
] as const)(
  "retains whole-first-section NOBR admission for %s",
  /** Actual document positions and source one-space/LF allowance determine the layout flag. @param body - Raw native input. @param expected - Source no-break flag. @returns Nothing. */ (
    body,
    expected,
  ) => {
    inspect(
      `<table><tr><td>${body}</td></tr></table>`,
      /** Reads actual native content/layout state. @param reader - Actual reader. @param doc - Actual document. @param table - Actual grid. @returns Nothing. */ (
        _reader,
        _doc,
        table,
      ) => {
        expect(table.GetCell(0, 0).GetContents()?.CreateLayoutInfo().HasNoBreakTag()).toBe(
          expected,
        );
      },
    );
  },
);
it("publishes real numeric format metadata and uses the per-document Writer formatter policy", /** Numeric SDNUM/SDVAL must share the actual lazy document table and preserve native date defaults. @returns Nothing. */ () => {
  inspect(
    '<table><tr><td sdnum="1031;1033;0.000" sdval="12,5">shown</td></tr></table>',
    /** Original grid fields borrow a real compiled format key. @param reader - Actual importer. @param doc - Actual document. @param table - Actual grid. @returns Nothing. */ (
      _reader,
      doc,
      table,
    ) => {
      const cell = table.GetCell(0, 0),
        format: [number] = [0],
        value: [number] = [0],
        formatter = doc.GetNumberFormatter(false);
      assert(formatter);
      expect(cell.GetNumFormat(format)).toBe(true);
      expect(cell.GetValue(value)).toBe(true);
      expect(value[0]).toBe(12.5);
      const parsed = formatter.GetEntry(format[0]);
      assert(parsed);
      expect(text(parsed.GetFormatstring())).toBe("0.000");
      expect(formatter.GetEvalDateFormat()).toBe(NfEvalDateFormat.FormatThenInternational);
      expect(formatter.GetYear2000()).toBe(1950);
      expect(doc.GetNumberFormatter()).toBe(formatter);
    },
  );
});
it("retains SDVAL presence without SDNUM and does not construct a formatter", /** Source only parses numeric input when SDNUM exists, independently from the has-value flag. @returns Nothing. */ () => {
  inspect(
    '<table><tr><td sdval="42">shown</td></tr></table>',
    /** Checks original independent value/format flags and actual document owner state. @param reader - Actual importer. @param doc - Actual document. @param table - Actual grid. @returns Nothing. */ (
      _reader,
      doc,
      table,
    ) => {
      const cell = table.GetCell(0, 0),
        format: [number] = [88],
        value: [number] = [99];
      expect(cell.GetNumFormat(format)).toBe(false);
      expect(cell.GetValue(value)).toBe(true);
      expect(value[0]).toBe(0);
      expect(doc.GetNumberFormatter(false)).toBeNull();
    },
  );
});
it("retains actual CSS border ownership on the cell and source DIR matching", /** Box items are stolen from paragraph insertion for later native frame-format materialization. @returns Nothing. */ () => {
  inspect(
    '<table><tr><td style="border: 1px solid red" dir="rTl">x</td></tr></table>',
    /** Observes real box cloning and paragraph directional item. @param reader - Actual importer. @param doc - Actual graph. @param table - Actual grid. @returns Nothing. */ (
      reader,
      doc,
      table,
    ) => {
      expect(table.GetCell(0, 0).GetBoxItem()).not.toBeNull();
      const start = table.GetCell(0, 0).GetContents()?.GetStartNode();
      assert(start);
      const paragraph = doc.nodes.at(start.GetIndex() + 1);
      assert(paragraph instanceof SwTextNode);
      expect(paragraph.GetSwAttrSet().GetItemIfSet(RES_BOX, false)).toBeUndefined();
      const paragraphDirection = paragraph.GetSwAttrSet().GetItemIfSet(RES_FRAMEDIR, false);
      assert(paragraphDirection instanceof SvxFrameDirectionItem);
      expect(paragraphDirection.GetValue()).toBe(1);
      const set = new SfxItemSet(doc.GetAttrPool(), reader.m_pCSS1Parser.GetWhichMap());
      try {
        expect(
          reader.ParseStyleOptions("", "", "", set, new SvxCSS1PropertyInfo(), "", "RTL"),
        ).toBe(true);
        const direction = set.GetItemIfSet(RES_FRAMEDIR, false);
        assert(direction instanceof SvxFrameDirectionItem);
        expect(direction.GetValue()).toBe(1);
        set.ClearItem(RES_FRAMEDIR);
        expect(
          reader.ParseStyleOptions("", "", "", set, new SvxCSS1PropertyInfo(), "", " RTL "),
        ).toBe(false);
      } finally {
        set.Dispose();
      }
    },
  );
});
it.each([T.PREFORMTXT_ON, T.XMP_ON, T.LISTING_ON])(
  "suspends and restarts native lexer environment %s through the cell context",
  /** Actual lexer modes are consumed by original SplitPREListingXMP and EndContext. @param token - Native outer environment. @returns Nothing. */ (
    token,
  ) => {
    const doc = new SwDoc(),
      node = doc.paragraphs[0];
    assert(node);
    const point = new SwPosition(node),
      pam = new SwPaM(point);
    point.Dispose();
    const reader = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), UTF8));
    const table = new HTMLTable(reader, false, false, false, new HTMLTableOptions([], A.Left));
    try {
      table.OpenRow(A.End, V.TOP, [null]);
      if (token === T.PREFORMTXT_ON) reader.StartPRE();
      else if (token === T.XMP_ON) reader.StartXMP();
      else reader.StartListing();
      const save = new CellSaveStruct(reader, table, false, false);
      expect([reader.IsReadPRE(), reader.IsReadXMP(), reader.IsReadListing()]).toEqual([
        false,
        false,
        false,
      ]);
      expect(save.IsHeaderCell()).toBe(false);
      expect(save.HasFirstContents()).toBe(false);
      expect(save.IsInSection()).toBe(false);
      const context = reader.PopContext();
      assert(context);
      reader.EndContext(context);
      save.Restore(reader);
      expect([reader.IsReadPRE(), reader.IsReadXMP(), reader.IsReadListing()]).toEqual([
        token === T.PREFORMTXT_ON,
        token === T.XMP_ON,
        token === T.LISTING_ON,
      ]);
    } finally {
      table.SourceDispose();
      reader.SourceDispose();
      pam.Dispose();
      doc.Dispose();
    }
  },
);
it("keeps lazy formatter owners independent between actual documents", /** Native doc.hxx/docfmt lifetime and non-creating query remain observable through live owners, without reading destroyed formatter objects. @returns Nothing. */ () => {
  const first = new SwDoc(),
    second = new SwDoc();
  try {
    expect(first.GetNumberFormatter(false)).toBeNull();
    expect(second.GetNumberFormatter(false)).toBeNull();
    const formatter = first.GetNumberFormatter();
    expect(first.GetNumberFormatter()).toBe(formatter);
    expect(second.GetNumberFormatter(false)).toBeNull();
    expect(second.GetNumberFormatter()).not.toBe(formatter);
    expect(formatter.GetEntry(0)).not.toBeNull();
    expect(second.GetNumberFormatter().GetEvalDateFormat()).toBe(
      NfEvalDateFormat.FormatThenInternational,
    );
  } finally {
    first.Dispose();
    second.Dispose();
  }
});
it.each([0, 1, 2, 3, 4, 5, 6, 7])(
  "registers original Writer direction default/slot and native snapshot mode %s",
  /** Original init.cxx metadata is consumed by the real Writer pool, collections and text-node sets. @param mode - Original WritingMode2 value. @returns Nothing. */ (
    mode,
  ) => {
    const doc = new SwDoc();
    try {
      const pool = doc.GetAttrPool(),
        defaultItem = pool.GetPoolDefaultItem(RES_FRAMEDIR);
      assert(defaultItem instanceof SvxFrameDirectionItem);
      expect(defaultItem.GetValue()).toBe(4);
      expect(pool.GetSlotId(RES_FRAMEDIR)).toBe(10944);
      expect(pool.GetWhichIDFromSlotID(10944)).toBe(130);
      const item = pool.CreateItem({ which: RES_FRAMEDIR, value: mode });
      try {
        assert(item instanceof SvxFrameDirectionItem);
        expect(item.QueryValue()).toBe(mode);
        const node = doc.paragraphs[0];
        assert(node);
        node.SetAttr(item);
        expect(node.GetSwAttrSet().Get(RES_FRAMEDIR).QueryValue()).toBe(mode);
      } finally {
        item.Dispose();
      }
    } finally {
      doc.Dispose();
    }
  },
);
