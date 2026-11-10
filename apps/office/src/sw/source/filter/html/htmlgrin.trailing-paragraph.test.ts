/** @fileoverview Actual text/table sections, registered positions, owned hints and document marks exercise original StripTrailingPara and its standalone Cut versus join boundary. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { SwHTMLParser } from "./swhtml";
import { HTMLTable } from "./htmltab";
import { HTMLTableOptions } from "./htmltab.options";
import { CaptionSaveStruct } from "./htmltab.caption";
import { InsertTempTableCaptionSection } from "./htmltab.sections";
import { SvxAdjust } from "../../../../editeng/inc/svxenum";
import { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { CutTextToEnd } from "../../core/txtnode/ndtxt-join";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { SvxFontHeightItem } from "../../../../editeng/inc/fhgtitem";
import * as H from "../../../inc/hintids";
/** Creates the actual importer and native body/cell scope. @param cell - Use a real core table cell. @param check - Observations while owners live. @returns Nothing. */
function inspect(
  cell: boolean,
  check: (parser: SwHTMLParser, doc: SwDoc, node: SwTextNode, table: HTMLTable) => void,
): void {
  const doc = new SwDoc(),
    node = cell
      ? doc.nodes
          .AppendTableRow(doc.nodes.MakeTableNode("trailing"), 1)
          .GetTabBoxes()[0]
          ?.GetParagraphs()[0]
      : doc.paragraphs[0];
  assert(node);
  const position = new SwPosition(node),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), UTF8)),
    table = new HTMLTable(parser, false, false, false, new HTMLTableOptions([], SvxAdjust.End));
  try {
    check(parser, doc, node, table);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
it.each([false, true])(
  "removes a real empty trailing paragraph and moves the actual cursor to its predecessor body/cell=%s",
  /** Section owners and source cursor-mark cleanup remain native. @param cell - Core scope. @returns Nothing. */ (
    cell,
  ) => {
    inspect(
      cell,
      /** Observes actual deletion and cursor owners. @param parser - Importer. @param doc - Document. @param node - Prior paragraph. @param table - Current table. @returns Nothing. */ (
        parser,
        doc,
        node,
        table,
      ) => {
        node.SetText("prefix");
        parser.m_pPam.GetPoint().SetContent(node.Len());
        doc.GetDocumentContentOperationsManager().AppendTextNode(parser.m_pPam.GetPoint());
        const trailing = parser.m_pPam.GetPoint().GetNode(),
          before = doc.nodes.Count();
        expect(trailing).not.toBe(node);
        parser.m_pPam.SetMark();
        parser.StripTrailingPara(cell ? table : null);
        expect(doc.nodes.Count()).toBe(before - 1);
        expect(parser.m_pPam.GetPoint().GetNode()).toBe(node);
        expect(parser.m_pPam.GetPoint().GetContentIndex()).toBe(6);
        expect(parser.m_pPam.HasMark()).toBe(false);
      },
    );
  },
);
it.each([false, true])(
  "keeps a sole empty section paragraph and uses the three original font heights only during a table scope=%s",
  /** Source40twip heights must be native pool items, not CSS geometry. @param inTable - Actual table scope. @returns Nothing. */ (
    inTable,
  ) => {
    inspect(
      true,
      /** Reads actual direct items and node count. @param parser - Importer. @param doc - Document. @param node - Sole cell text. @param table - Native table. @returns Nothing. */ (
        parser,
        doc,
        node,
        table,
      ) => {
        const before = doc.nodes.Count();
        parser.StripTrailingPara(inTable ? table : null);
        expect(doc.nodes.Count()).toBe(before);
        expect(parser.m_pPam.GetPoint().GetNode()).toBe(node);
        for (const which of [
          H.RES_CHRATR_FONTSIZE,
          H.RES_CHRATR_CJK_FONTSIZE,
          H.RES_CHRATR_CTL_FONTSIZE,
        ]) {
          const direct = node.GetpSwAttrSet()?.GetItemIfSet(which, false);
          if (inTable) {
            assert(direct instanceof SvxFontHeightItem);
            expect(direct.GetHeight()).toBe(40);
          } else expect(direct).toBeUndefined();
        }
      },
    );
  },
);
it("retains a nonempty paragraph and its original font when the cursor has advanced", /** Text is not treated as an as-character graphic producer. @returns Nothing. */ () => {
  inspect(
    true,
    /** Observes original text admission. @param parser - Importer. @param doc - Document. @param node - Cell text. @param table - Native table. @returns Nothing. */ (
      parser,
      doc,
      node,
      table,
    ) => {
      node.SetText("text");
      parser.m_pPam.GetPoint().SetContent(4);
      const before = doc.nodes.Count();
      parser.StripTrailingPara(table);
      expect(node.GetText()).toBe("text");
      expect(doc.nodes.Count()).toBe(before);
      expect(node.GetpSwAttrSet()?.GetItemIfSet(H.RES_CHRATR_FONTSIZE, false)).toBeUndefined();
    },
  );
});
it("standalone Cut retains source positions for negative Update and transfers real owned hints", /** Joins' all-position relocation must not leak into this source operation. @returns Nothing. */ () => {
  inspect(
    false,
    /** Compares actual source/destination registries and hint owners. @param parser - Importer. @param doc - Document. @param target - Destination. @returns Nothing. */ (
      parser,
      doc,
      target,
    ) => {
      target.SetText("prefix");
      const source = doc.nodes.MakeTextNode("late"),
        start = new SwPosition(source),
        inside = new SwPosition(source, 2),
        end = new SwPosition(source, 4),
        targetEnd = new SwPosition(target, 6);
      const item = new SwFormatINetFormat({
        url: "https://example.test/cut",
        name: "cut",
        targetFrame: "",
      });
      let hint;
      try {
        hint = source.InsertItem(item, 0, 3);
      } finally {
        item.Dispose();
      }
      assert(hint);
      try {
        CutTextToEnd(source, target);
        expect(source.GetText()).toBe("");
        expect(target.GetText()).toBe("prefixlate");
        for (const position of [start, inside, end]) {
          expect(position.GetNode()).toBe(source);
          expect(position.GetContentIndex()).toBe(0);
        }
        expect(targetEnd.GetContentIndex()).toBe(6);
        expect(target.GetpSwpHints()?.entries()).toContain(hint);
        expect(hint.GetStart()).toBe(6);
        expect(hint.GetAnyEnd()).toBe(9);
        expect(source.GetpSwpHints()).toBeUndefined();
        expect(parser.m_pPam.GetPoint().GetNode()).toBe(target);
      } finally {
        start.Dispose();
        inside.Dispose();
        end.Dispose();
        targetEnd.Dispose();
      }
    },
  );
});
it("moves late-inserted text and actual bookmarks before deleting the trailing paragraph", /** Original source repositions bookmarks at the predecessor end, after Cut collapsed their old offsets. @returns Nothing. */ () => {
  inspect(
    false,
    /** Observes core text, marks and cursor ownership. @param parser - Importer. @param doc - Document. @param node - Predecessor. @returns Nothing. */ (
      parser,
      doc,
      node,
    ) => {
      node.SetText("prefix");
      const tail = doc.nodes.MakeTextNode("late"),
        access = doc.GetIDocumentMarkAccess(),
        first = access.MakeMark(tail, 0, "first"),
        middle = access.MakeMark(tail, 2, "middle");
      parser.m_pPam.GetPoint().Assign(tail, 0);
      const before = doc.nodes.Count();
      parser.StripTrailingPara(null);
      expect(node.GetText()).toBe("prefixlate");
      expect(doc.nodes.Count()).toBe(before - 1);
      for (const mark of [first, middle]) {
        expect(mark.GetMarkPos().GetNode()).toBe(node);
        expect(mark.GetMarkPos().GetContentIndex()).toBe(10);
      }
      expect(parser.m_pPam.GetPoint().GetNode()).toBe(node);
      expect(parser.m_pPam.GetPoint().GetContentIndex()).toBe(10);
    },
  );
});
it("repositions an actual expanded internal UNO mark and source-order sorts it without making a user bookmark", /** Native reposition clears the other endpoint for a collapsed input and normalizes reversed ranges. @returns Nothing. */ () => {
  inspect(
    false,
    /** Uses original mark owner operations. @param parser - Importer. @param doc - Document. @param node - Content. @returns Nothing. */ (
      parser,
      doc,
      node,
    ) => {
      node.SetText("abcdef");
      const p = new SwPosition(node, 5),
        q = new SwPosition(node, 1),
        range = new SwPaM(p, q),
        access = doc.GetIDocumentMarkAccess(),
        mark = access.MakeUnoMark(range);
      p.Dispose();
      q.Dispose();
      try {
        access.RepositionMark(mark, range);
        expect(mark.GetMarkPos().GetContentIndex()).toBe(1);
        expect(mark.GetOtherMarkPos().GetContentIndex()).toBe(5);
        range.DeleteMark();
        range.GetPoint().SetContent(3);
        access.RepositionMark(mark, range);
        expect(mark.IsExpanded()).toBe(false);
        expect(mark.GetMarkPos().GetContentIndex()).toBe(3);
        expect(access.GetBookmarks()).toEqual([]);
        access.RepositionMark(null, range);
        expect(parser.m_pPam.GetPoint().GetNode()).toBe(node);
      } finally {
        range.Dispose();
        access.DeleteUnoMark(mark);
      }
    },
  );
});
it("caption temporary section cleanup retains its required sole paragraph and restores the original tracked body cursor", /** Real caption save/section dependencies compose without a production table-token substitute. @returns Nothing. */ () => {
  inspect(
    false,
    /** Observes native section/snapshot owners. @param parser - Importer. @param doc - Document. @param node - Body. @param table - Actual current table. @returns Nothing. */ (
      parser,
      doc,
      node,
      table,
    ) => {
      const saved = new CaptionSaveStruct(parser, parser.m_pPam.GetPoint());
      try {
        const caption = InsertTempTableCaptionSection(parser),
          text = parser.m_pPam.GetPoint().GetNode(),
          count = doc.nodes.Count();
        parser.StripTrailingPara(table);
        expect(doc.nodes.Count()).toBe(count);
        expect(text.StartOfSectionNode()).toBe(caption);
        saved.RestoreAll(parser);
        parser.m_pPam.GetPoint().Assign(saved.GetPos().GetNode(), saved.GetPos().GetContentIndex());
        expect(parser.m_pPam.GetPoint().GetNode()).toBe(node);
      } finally {
        saved.SourceDispose();
      }
    },
  );
});

it("publishes a deferred native bookmark before removing its source paragraph", /** SetAttr(false) must run before node deletion and source-order mark relocation. @returns Nothing. */ () => {
  inspect(
    false,
    /** Uses the genuine pending bookmark producer and actual mark manager. @param parser - Importer. @param doc - Document. @param node - Predecessor. @returns Nothing. */ (
      parser,
      doc,
      node,
    ) => {
      node.SetText("prefix");
      const tail = doc.nodes.MakeTextNode("");
      parser.m_pPam.GetPoint().Assign(tail, 0);
      parser.InsertBookmark("pending");
      expect(doc.GetIDocumentMarkAccess().FindMark("pending")).toBeUndefined();
      parser.StripTrailingPara(null);
      const mark = doc.GetIDocumentMarkAccess().FindMark("pending");
      assert(mark);
      expect(mark.GetMarkPos().GetNode()).toBe(node);
      expect(mark.GetMarkPos().GetContentIndex()).toBe(6);
      expect(parser.m_aSetAttrTab).toEqual([]);
    },
  );
});
