/** @fileoverview Genuine HTML byte/lexer/ring/virtual-consumer inputs exercise native COL/COLGROUP span, width, inheritance, boundary and parent-content behavior. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { HTMLTable } from "./htmltab";
import { HTMLTableOptions } from "./htmltab.options";
import { BuildTableColGroup } from "./htmltab.colgroup";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
import { SvParserState as S } from "../../../../svtools/inc/svparser";
/** Test-only original virtual-consumer entry constructs actual intermediate tables from real table tokens and delegates to the original column-group operation. It does not replace tokens, native results, private parser state or the pending production BuildTable body. */
class Reader extends SwHTMLParser {
  readonly tables: HTMLTable[] = [];
  readonly following: T[] = [];
  /** Original table/column consumer entry with native naked-COL rewind. @param token - Actual filtered lexer token. @returns Nothing. */
  protected override NextToken(token: T): void {
    if (token === T.TABLE_ON) {
      this.tables.push(
        new HTMLTable(this, false, false, false, new HTMLTableOptions(this.GetOptions(), A.Left)),
      );
      return;
    }
    const table = this.tables.at(-1);
    if (table && (token === T.COLGROUP_ON || token === T.COL_ON)) {
      if (token === T.COL_ON) this.SkipToken(-1);
      BuildTableColGroup(
        this,
        table,
        table,
        token === T.COLGROUP_ON,
        /** Binds the actual virtual consumer rather than another parser/provider. @param next - Original filtered token. @returns Nothing. */ (
          next,
        ) => this.NextToken(next),
      );
      return;
    }
    this.following.push(token);
    super.NextToken(token);
  }
}
/** Creates a genuine core table/cursor as the original section consumers' input, then parses actual bytes through the inherited HTML pipeline. @param source - Native HTML input. @param check - Assertions while all owners are alive. @returns Nothing. */
function inspect(
  source: string,
  check: (reader: Reader, doc: SwDoc, table: HTMLTable) => void,
): void {
  const doc = new SwDoc(),
    core = doc.nodes.MakeTableNode("column reader"),
    row = doc.nodes.AppendTableRow(core, 1),
    node = row.GetTabBoxes()[0]?.GetParagraphs()[0];
  assert(node);
  const point = new SwPosition(node),
    pam = new SwPaM(point);
  point.Dispose();
  const reader = new Reader(doc, pam, new SvStream(OUStringToOString(source, UTF8), UTF8));
  try {
    expect(reader.CallParser()).toBe(S.Accepted);
    const table = reader.tables[0];
    assert(table);
    check(reader, doc, table);
  } finally {
    reader.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
it.each([
  ["<colgroup span=3 width='2*'></colgroup>", 3, 2, true],
  ["<colgroup span=0></colgroup>", 0, 0, false],
  ["<colgroup span=257 width=10></colgroup>", 1, 150, false],
  ["<colgroup span=256 width=1></colgroup>", 256, 15, false],
  ["<colgroup span=65536></colgroup>", 0, 0, false],
  ["<colgroup span=65537 width=2></colgroup>", 1, 30, false],
  ["<col span=65536 width=2>", 1, 30, false],
  ["<col width='50%'>", 1, 750, false],
  ["<col width='3*'>", 1, 3, true],
  ["<col width='*'>", 1, 0, true],
  ["<colgroup span=2 span=4 width=3 width=5></colgroup>", 2, 45, false],
] as const)(
  "retains native span/width rules for %s",
  /** Source narrowing precedes the256limit, zero has distinct group/COL behavior and only an asterisk selects relative width. @param input - Original table children. @param count - Expected native columns. @param width - Expected option value. @param relative - Expected family. @returns Nothing. */ (
    input,
    count,
    width,
    relative,
  ) => {
    inspect(
      `<table>${input}</table>`,
      /** Observes actual original grid/column values without calculated-width substitutes. @param reader - Real importer. @param doc - Actual graph. @param table - Actual intermediate grid. @returns Nothing. */ (
        _reader,
        _doc,
        table,
      ) => {
        if (!count) {
          expect(
            /** Calls actual layout admission for the source zero-column state. @returns Layout if admission fails to reject. */ () =>
              table.CreateLayoutInfo(),
          ).toThrow("nonempty");
          return;
        }
        const layout = table.CreateLayoutInfo();
        expect(layout.GetColCount()).toBe(count);
        for (let i = 0; i < count; ++i) {
          expect(layout.GetColumn(i)?.GetWidthOption()).toBe(width);
          expect(layout.GetColumn(i)?.IsRelWidthOption()).toBe(relative);
        }
      },
    );
  },
);
it("suppresses the group SPAN once child COL tags exist and inherits group width for each child", /** Original group width remains the child default while explicit child values win and closing the group creates no extra columns. @returns Nothing. */ () => {
  inspect(
    "<table><colgroup span=7 width=10><col span=2><col width='20%'></colgroup></table>",
    /** Reads actual native layout columns. @param reader - Importer. @param doc - Graph. @param table - Intermediate table. @returns Nothing. */ (
      _reader,
      _doc,
      table,
    ) => {
      const layout = table.CreateLayoutInfo();
      expect(layout.GetColCount()).toBe(3);
      expect(
        [0, 1, 2].map(
          /** Reads original width options. @param column - Native index. @returns Option. */ (
            column,
          ) => layout.GetColumn(column)?.GetWidthOption(),
        ),
      ).toEqual([150, 150, 300]);
    },
  );
});
it("retains source column alignment/vertical inheritance and first duplicate precedence", /** Actual OpenRow consumes the original column defaults without injected row state. @returns Nothing. */ () => {
  inspect(
    "<table><colgroup align=right valign=middle><col align=char align=right></colgroup></table>",
    /** Uses actual row entry after the column producer. @param reader - Importer. @param doc - Graph. @param table - Actual grid. @returns Nothing. */ (
      _reader,
      _doc,
      table,
    ) => {
      table.OpenRow(A.End, V.TOP, [null]);
      expect(table.GetInheritedAdjust()).toBe(A.Left);
      expect(table.GetInheritedVertOri()).toBe(V.CENTER);
    },
  );
});
it.each(["<tr>", "<thead>", "<tbody>", "<tfoot>"])(
  "returns the native %s boundary to the outer token consumer exactly once",
  /** The real bounded ring is rewound rather than copying or replacing a structural token. @param boundary - Original boundary tag. @returns Nothing. */ (
    boundary,
  ) => {
    inspect(
      `<table><colgroup><col width=7>${boundary}tail</table>`,
      /** Observes the actual subsequent virtual-consumer dispatch. @param reader - Actual importer. @param doc - Actual graph. @param table - Actual grid. @returns Nothing. */ (
        reader,
        _doc,
        table,
      ) => {
        expect(table.CreateLayoutInfo().GetColCount()).toBe(1);
        const expected =
          boundary === "<tr>"
            ? T.TABLEROW_ON
            : boundary === "<thead>"
              ? T.THEAD_ON
              : boundary === "<tbody>"
                ? T.TBODY_ON
                : T.TFOOT_ON;
        expect(
          reader.following.filter(
            /** Counts the actual retained boundary. @param token - Original token. @returns Match. */ (
              token,
            ) => token === expected,
          ),
        ).toHaveLength(1);
      },
    );
  },
);
it("closes the current group when the next COLGROUP starts and retains both original groups", /** New-group replay must preserve the next tag's own options. @returns Nothing. */ () => {
  inspect(
    "<table><colgroup span=2 width=3><colgroup span=1 width='4*'></colgroup></table>",
    /** Reads the real combined native columns. @param reader - Importer. @param doc - Graph. @param table - Actual grid. @returns Nothing. */ (
      _reader,
      _doc,
      table,
    ) => {
      const layout = table.CreateLayoutInfo();
      expect(layout.GetColCount()).toBe(3);
      expect([
        layout.GetColumn(0)?.GetWidthOption(),
        layout.GetColumn(2)?.GetWidthOption(),
        layout.GetColumn(2)?.IsRelWidthOption(),
      ]).toEqual([45, 4, true]);
    },
  );
});
it("uses real parent contents for nonspace fallback while ignoring a lone unparented space", /** The original source whitespace condition differs from blanket trimming; actual text goes through the same native virtual consumer. @returns Nothing. */ () => {
  inspect(
    "<table><colgroup> <col>payload</colgroup></table>",
    /** Observes source section admission and native text. @param reader - Actual importer. @param doc - Actual graph. @param table - Actual grid. @returns Nothing. */ (
      _reader,
      doc,
      table,
    ) => {
      const parent = table.GetParentContents();
      assert(parent);
      const start = parent.GetStartNode();
      assert(start);
      const node = doc.nodes.at(start.GetIndex() + 1);
      expect(node.FindTableBoxStartNode()).toBe(start);
      expect(table.HasParentSection()).toBe(true);
      const core = start.FindTableNode();
      assert(core);
      expect(
        core
          .GetTable()
          .GetTabLines()[0]
          ?.GetTabBoxes()[0]
          ?.GetParagraphs()
          .map(
            /** Reads actual core paragraphs. @param paragraph - Actual node. @returns Text. */ (
              paragraph,
            ) => paragraph.GetText(),
          )
          .join(""),
      ).toBe("payload");
    },
  );
});
it("preserves native ID bookmark producers in both group and column options", /** Actual deferred mark creation runs at native terminal attribute flushing. @returns Nothing. */ () => {
  inspect(
    "<table><colgroup id=group><col id=column></colgroup></table>",
    /** Reads the actual document mark owner. @param reader - Importer. @param doc - Actual graph. @returns Nothing. */ (
      _reader,
      doc,
    ) => {
      expect(
        doc
          .GetIDocumentMarkAccess()
          .GetBookmarks()
          .map(
            /** Reads actual mark names. @param mark - Native owner. @returns Name. */ (mark) =>
              mark.GetName(),
          )
          .sort(),
      ).toEqual(["column", "group"]);
    },
  );
});
it("returns a new TABLE start to the outer consumer when the current table has no context", /** Original missing-context admission terminates the group and retains the actual next table token. @returns Nothing. */ () => {
  inspect(
    "<table><colgroup><col><table><col width=2></table>",
    /** Observes both real intermediate owners created from original table tokens. @param reader - Actual importer. @returns Nothing. */ (
      reader,
    ) => {
      expect(reader.tables).toHaveLength(2);
      expect(reader.tables[0]?.CreateLayoutInfo().GetColCount()).toBe(1);
      expect(reader.tables[1]?.CreateLayoutInfo().GetColumn(0)?.GetWidthOption()).toBe(30);
    },
  );
});
