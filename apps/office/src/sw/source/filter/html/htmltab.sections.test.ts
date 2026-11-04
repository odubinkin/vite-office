/** @fileoverview Original table-section overload/cursor/font contracts and raw attribute/numbering rebase over genuine core table sections. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwHTMLParser } from "./swhtml";
import { HTMLTable } from "./htmltab";
import { HTMLTableOptions } from "./htmltab.options";
import { InsertTableSection, InsertTableContents } from "./htmltab.sections";
import { SwHTMLTableLayout } from "../../../inc/htmltbl";
import { SwTabCols } from "../../core/bastyp/tabcol";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { SvParserState as S } from "../../../../svtools/inc/svparser";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
import { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import * as H from "../../../inc/hintids";
import { NewNumberBulletList, NewNumberBulletListItem } from "./htmlnumreader";
import type { SwTable, SwTableBox } from "../../core/table/swtable";
/** Runs original source operations with an actual core table/cursor and actual intermediate current-table owner, without fabricating BuildTable or private parser state. @param check - Native observations. @returns Nothing. */
function inspect(
  check: (parser: SwHTMLParser, current: HTMLTable, core: SwTable, box: SwTableBox) => void,
): void {
  const doc = new SwDoc(),
    core = doc.nodes.MakeTableNode("section consumer", { width: 1000 });
  core.AddColumnWidth(1000);
  const line = doc.nodes.AppendTableRow(core, 1),
    box = line.GetTabBoxes()[0];
  assert(box);
  const node = box.GetParagraphs()[0];
  assert(node);
  const point = new SwPosition(node),
    pam = new SwPaM(point);
  point.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), UTF8));
  const current = new HTMLTable(parser, false, false, false, new HTMLTableOptions([], A.Left));
  try {
    check(parser, current, core, box);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
/** Builds an actual layout owner without inventing calculated metrics. @param core - Actual table. @returns Native layout reference. */
function layout(core: SwTable): SwHTMLTableLayout {
  return new SwHTMLTableLayout(core, 1, 1, false, false, 0, false, 0, 0, 0, A.Left, 0, 0, 0, 0, 0);
}
it.each([P.COLL_TABLE, P.COLL_TABLE_HDLN, P.COLL_TEXT])(
  "reuses the original first box section for native pool %s",
  /** Original first-cell selection changes the actual collection and preserves its section/cursor identity. @param pool - Native collection. @returns Nothing. */ (
    pool,
  ) => {
    inspect(
      /** Uses real initial table geometry. @param parser - Importer. @param current - Actual current table. @param _core - Unused core-table position. @param box - Actual first box. @returns Nothing. */ (
        parser,
        current,
        _core,
        box,
      ) => {
        const point = parser.m_pPam.GetPoint(),
          node = point.GetNode();
        assert(node instanceof SwTextNode);
        node.SetText("abc");
        point.SetContent(2);
        const start = InsertTableSection(parser, current, pool);
        expect(start).toBe(box.GetSttNd());
        expect(point.GetNode()).toBe(node);
        expect(point.GetContentIndex()).toBe(2);
        expect(node.GetTextFormatColl()).toBe(parser.m_pCSS1Parser.GetTextCollFromPool(pool));
        expect(current.m_bFirstCell).toBe(false);
        expect(node.GetpSwAttrSet()?.GetItemIfSet(H.RES_CHRATR_FONTSIZE, false)).toBeUndefined();
      },
    );
  },
);
it("appends later pool-selected sections before the actual table end and advances the cursor", /** Original MakeTextSection supplies a new actual paragraph and native collection. @returns Nothing. */ () => {
  inspect(
    /** Observes actual nodes and cursor. @param parser - Importer. @param current - Current owner. @param core - Actual core table. @returns Nothing. */ (
      parser,
      current,
      core,
    ) => {
      InsertTableSection(parser, current, P.COLL_TABLE);
      const start = InsertTableSection(parser, current, P.COLL_TABLE_HDLN);
      assert(start);
      const node = parser.m_pPam.GetPoint().GetNode();
      assert(node instanceof SwTextNode);
      expect(start.EndOfSectionNode().GetIndex() + 1).toBe(
        core.GetTableNode().EndOfSectionNode().GetIndex(),
      );
      expect(node.GetIndex()).toBe(start.GetIndex() + 1);
      expect(node.GetTextFormatColl().id).toBe("table-heading");
      expect(node.FindTableNode()).toBe(core.GetTableNode());
      expect(parser.m_pPam.GetPoint().GetContentIndex()).toBe(0);
    },
  );
});
it("uses exact40twip direct heights in the predecessor overload without moving the cursor", /** Source overload distinction is preserved for all three scripts (WRITER322). @returns Nothing. */ () => {
  inspect(
    /** Reads actual item slots rather than browser font projections. @param parser - Importer. @param current - Current owner. @param _core - Unused core-table position. @param box - First actual section. @returns Nothing. */ (
      parser,
      current,
      _core,
      box,
    ) => {
      InsertTableSection(parser, current, P.COLL_TABLE);
      const point = parser.m_pPam.GetPoint(),
        original = point.GetNode(),
        start = InsertTableSection(parser, current, box.GetSttNd());
      assert(start);
      const node = parser.m_xDoc.nodes.at(start.GetIndex() + 1);
      assert(node instanceof SwTextNode);
      expect(point.GetNode()).toBe(original);
      expect(start.GetIndex()).toBe(box.GetStartNode().EndOfSectionNode().GetIndex() + 1);
      for (const which of [
        H.RES_CHRATR_FONTSIZE,
        H.RES_CHRATR_CJK_FONTSIZE,
        H.RES_CHRATR_CTL_FONTSIZE,
      ]) {
        const height = node.GetpSwAttrSet()?.GetItemIfSet(which, false);
        assert(height instanceof SvxFontHeightItem);
        expect([height.GetHeight(), height.GetProp()]).toEqual([40, 100]);
      }
    },
  );
});
it("inserts after a predecessor table start rather than after the whole table", /** Native predecessor-overload table special case selects the table node itself. @returns Nothing. */ () => {
  inspect(
    /** Uses a real SwTableNode selector. @param parser - Importer. @param current - Current owner. @param core - Actual table. @returns Nothing. */ (
      parser,
      current,
      core,
    ) => {
      InsertTableSection(parser, current, P.COLL_TABLE);
      const start = InsertTableSection(parser, current, core.GetTableNode());
      assert(start);
      expect(start.GetIndex()).toBe(core.GetTableNode().GetIndex() + 1);
      expect(start.StartOfSectionNode()).toBe(core.GetTableNode());
    },
  );
});
it.each(["missing-predecessor", "missing-table", "nontext-first", "body-first"] as const)(
  "preserves native section Error admission for %s",
  /** Failed native branches publish the real parser state and do not manufacture a section. @param kind - Source branch. @returns Nothing. */ (
    kind,
  ) => {
    inspect(
      /** Uses actual structural/body positions for failure admission. @param parser - Importer. @param current - Current table. @param core - Actual table. @returns Nothing. */ (
        parser,
        current,
        core,
      ) => {
        if (kind === "missing-predecessor" || kind === "missing-table")
          InsertTableSection(parser, current, P.COLL_TABLE);
        if (kind === "missing-table" || kind === "body-first") {
          const body = parser.m_xDoc.paragraphs[0];
          assert(body);
          parser.m_pPam.GetPoint().Assign(body);
        }
        if (kind === "nontext-first") parser.m_pPam.GetPoint().Assign(core.GetTableNode());
        const before = parser.m_xDoc.nodes.entries().length;
        const start = InsertTableSection(
          parser,
          current,
          kind === "missing-predecessor" ? null : P.COLL_TABLE,
        );
        expect(start).toBeNull();
        expect(parser.GetStatus()).toBe(S.Error);
        expect(parser.m_xDoc.nodes.entries()).toHaveLength(before);
        expect(current.m_bFirstCell).toBe(kind === "nontext-first");
      },
    );
  },
);
it("retains the source same-table fallback when a completed table has no enclosing table", /** Original do/while keeps the last table even when no unfinished outer table exists (WRITER323). @returns Nothing. */ () => {
  inspect(
    /** Assigns a real shared layout owner, without measured-width substitution. @param parser - Importer. @param current - Current owner. @param core - Actual table. @returns Nothing. */ (
      parser,
      current,
      core,
    ) => {
      InsertTableSection(parser, current, P.COLL_TABLE);
      core.SetHTMLTableLayout(layout(core));
      const start = InsertTableSection(parser, current, P.COLL_TABLE);
      assert(start);
      expect(start.FindTableNode()).toBe(core.GetTableNode());
      expect(start.EndOfSectionNode().GetIndex() + 1).toBe(
        core.GetTableNode().EndOfSectionNode().GetIndex(),
      );
    },
  );
});
it("rebases existing native attribute heads and list continuation on real newly inserted contents", /** Original semantic/list producers create the actual live owners; no heads, rule values or positions are injected. @returns Nothing. */ () => {
  inspect(
    /** Observes real producer chains after native content insertion. @param parser - Importer. @param current - Current owner. @returns Nothing. */ (
      parser,
      current,
    ) => {
      InsertTableSection(parser, current, P.COLL_TABLE);
      NewNumberBulletList(parser, T.ORDERLIST_ON);
      NewNumberBulletListItem(parser, T.LI_ON);
      parser.NewCharFormat(T.STRONG_ON);
      parser.NewCharFormat(T.EMPHASIS_ON);
      const head = parser.m_xAttrTab.pCharFormats[0],
        rule = parser.GetNumInfo().GetNumRule();
      assert(head && rule);
      const value = InsertTableContents(parser, current, false),
        point = parser.m_pPam.GetPoint(),
        node = point.GetNode();
      assert(node instanceof SwTextNode);
      expect(value.GetStartNode()).toBe(node.FindTableBoxStartNode());
      expect(parser.m_xAttrTab.pCharFormats[0]).toBe(head);
      for (let attr = head; attr;) {
        expect([attr.GetStartParagraphIdx(), attr.GetEndParagraphIdx()]).toEqual([
          node.GetIndex(),
          node.GetIndex(),
        ]);
        expect([attr.GetStartContent(), attr.GetEndContent()]).toEqual([0, 0]);
        const next = attr.GetNext();
        if (!next) break;
        attr = next;
      }
      expect(node.GetNumRule()).toBe(rule);
      expect(node.IsCountedInList()).toBe(false);
    },
  );
});
it("shares the actual HTML layout reference and clears it at native separator adjustment", /** SetTabCols discards the original layout before changing separators; no secondary layout state or synthetic resize success is created. @returns Nothing. */ () => {
  inspect(
    /** Uses a genuine single-column native geometry. @param parser - Importer. @param current - Current intermediate owner. @param _core - Unused core-table position. @param box - Native box. @returns Nothing. */ (
      _parser,
      _current,
      core,
      box,
    ) => {
      expect(core.GetHTMLTableLayout()).toBeNull();
      const value = layout(core);
      core.SetHTMLTableLayout(value);
      expect(core.GetHTMLTableLayout()).toBe(value);
      const old = new SwTabCols();
      old.SetLeft(0);
      old.SetRight(1000);
      old.SetRightMax(2000);
      core.SetTabCols(new SwTabCols(old), old, box, false);
      expect(core.GetHTMLTableLayout()).toBeNull();
      expect(value.GetColCount()).toBe(1);
    },
  );
});
it("keeps the actual predecessor node-array owner when deriving its following boundary", /** Source SwNodeIndex borrows the predecessor array; the existing native factory rejects a foreign boundary before target node mutation. @returns Nothing. */ () => {
  inspect(
    /** Supplies a genuine foreign section without a fake pointer or index. @param parser - Actual importer. @param current - Current native owner. @returns Nothing. */ (
      parser,
      current,
    ) => {
      InsertTableSection(parser, current, P.COLL_TABLE);
      const other = new SwDoc();
      try {
        const core = other.nodes.MakeTableNode("foreign predecessor"),
          row = other.nodes.AppendTableRow(core, 1),
          box = row.GetTabBoxes()[0];
        assert(box);
        const before = parser.m_xDoc.nodes.entries().length;
        expect(
          /** Calls the actual source operation with a foreign owner. @returns A new section if admission fails to reject. */ () =>
            InsertTableSection(parser, current, box.GetSttNd()),
        ).toThrow("another document");
        expect(parser.m_xDoc.nodes.entries()).toHaveLength(before);
      } finally {
        other.Dispose();
      }
    },
  );
});
