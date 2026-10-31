/** @fileoverview Native HTML insertion splits/joins, target snapshot reuse and actual document mark ownership over current Writer graphs. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPosition, SwPaM } from "../../core/crsr/pam";
import { SwTextNode, projectWriterTextRuns } from "../../core/txtnode/ndtxt";
import { SwHTMLParser } from "./swhtml";
import { PrepareHTMLInsertion } from "./swhtml.insertion";
import { HTMLAttrContext } from "./htmlctxt";
import { SvStream } from "../../../../tools/source/stream/stream";
import { OUStringToOString } from "../../../../sal/rtl/ustring-convert";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvParserState } from "../../../../svtools/inc/svparser";
import { SvxWeightItem } from "../../../../editeng/inc/wghtitem";
import { FontWeight } from "../../../../tools/inc/fontenum";
import { RES_CHRATR_WEIGHT } from "../../../inc/hintids";
import { SwPoolFormatId as P } from "../../../inc/poolfmt";
import { HtmlTokenId as T } from "../../../../svtools/inc/htmltokn";
/** Supplies actual source parser/doc/cursor and releases all native owned positions/items. @param source - HTML bytes. @param target - Existing paragraph contents. @param offset - Actual insertion position. @param check - Native observations. @param newDoc - Source mode. @returns Nothing. */
function withParser(
  source: string,
  target: string,
  offset: number,
  check: (parser: SwHTMLParser, doc: SwDoc, node: SwTextNode) => void,
  newDoc = false,
): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  node.SetText(target);
  const position = new SwPosition(node, offset),
    pam = new SwPaM(position);
  position.Dispose();
  const parser = new SwHTMLParser(
    doc,
    pam,
    new SvStream(OUStringToOString(source, UTF8), UTF8),
    "",
    "",
    newDoc,
  );
  try {
    check(parser, doc, node);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
it("inserts inline HTML between real prefix/suffix text and preserves bookmark and cursor offsets", /** Double splitting isolates formatting while native joins retain one final actual paragraph. @returns Nothing. */ () => {
  withParser(
    "<b>X</b>",
    "leftRIGHT",
    4,
    /** Uses only actual document marks and parser entry. @param parser - Importer. @param doc - Native graph. @param node - Original target. @returns Nothing. */ (
      parser,
      doc,
      node,
    ) => {
      const left = doc.GetIDocumentMarkAccess().MakeMark(node, 2, "left"),
        right = doc.GetIDocumentMarkAccess().MakeMark(node, 6, "right");
      expect(parser.CallParser()).toBe(SvParserState.Accepted);
      expect(doc.paragraphs).toHaveLength(1);
      const final = doc.paragraphs[0];
      assert(final);
      expect(final.GetText()).toBe("leftXRIGHT");
      expect(parser.m_pPam.GetPoint().GetNode()).toBe(final);
      expect(parser.m_pPam.GetPoint().GetContentIndex()).toBe(5);
      expect([left.GetMarkPos().GetNode(), right.GetMarkPos().GetNode()]).toEqual([final, final]);
      expect([left.GetMarkPos().GetContentIndex(), right.GetMarkPos().GetContentIndex()]).toEqual([
        2, 7,
      ]);
      expect(
        projectWriterTextRuns(final).map(
          /** Reads actual effective range values. @param run - Native projection. @returns Text and weight. */ (
            run,
          ) => [run.text, run.attributes.bold],
        ),
      ).toEqual([
        ["left", false],
        ["X", true],
        ["RIGHT", false],
      ]);
    },
  );
});
it("keeps the original empty suffix after a closing block in existing-document mode", /** Native Continue cancels one split by joining the appended tail into the original suffix, rather than deleting that suffix as the former EOF-only shortcut did. @returns Nothing. */ () => {
  withParser(
    "<p>X</p>",
    "",
    0,
    /** Checks real final graph and insertion-end point. @param parser - Importer. @param doc - Native graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      expect(parser.CallParser()).toBe(SvParserState.Accepted);
      expect(
        doc.paragraphs.map(
          /** Reads actual node strings. @param node - Native paragraph. @returns Text. */ (node) =>
            node.GetText(),
        ),
      ).toEqual(["X", ""]);
      expect(parser.m_pPam.GetPoint().GetNode()).toBe(doc.paragraphs[1]);
      expect(parser.m_pPam.GetPoint().GetContentIndex()).toBe(0);
    },
  );
});
it("removes the appended tail in new-document mode using native previous-node admission", /** This explicit mode contrast uses the same byte reader, no projected HTML model. @returns Nothing. */ () => {
  withParser(
    "<p>X</p>",
    "",
    0,
    /** Native full-document mode has no existing target suffix. @param parser - Importer. @param doc - Native graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      expect(parser.CallParser()).toBe(SvParserState.Accepted);
      expect(
        doc.paragraphs.map(
          /** Reads actual text nodes. @param node - Paragraph. @returns Text. */ (node) =>
            node.GetText(),
        ),
      ).toEqual(["X"]);
    },
    true,
  );
});
it("preserves target hard character values while applying inline HTML formatting only to inserted text", /** Real target snapshot restoration and source CutImpl hard attributes cooperate across both joins. @returns Nothing. */ () => {
  withParser(
    "<i>X</i>",
    "abCD",
    2,
    /** Supplies actual direct target state before native preparation. @param parser - Importer. @param doc - Native graph. @param node - Actual target. @returns Nothing. */ (
      parser,
      doc,
      node,
    ) => {
      node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
      expect(parser.CallParser()).toBe(SvParserState.Accepted);
      const final = doc.paragraphs[0];
      assert(final);
      expect(final.GetText()).toBe("abXCD");
      expect(
        projectWriterTextRuns(final).map(
          /** Reads native ranges after transfer. @param run - Projection. @returns Actual semantic values. */ (
            run,
          ) => [run.text, run.attributes.bold, run.attributes.italic],
        ),
      ).toEqual([
        ["ab", true, false],
        ["X", true, true],
        ["CD", true, false],
      ]);
    },
  );
});
it("clones and suppresses equal target items independently for each selected paragraph collection", /** This source preparation/style phase is driven through real native entry points; the cached target is never injected or mutated by the test. @returns Nothing. */ () => {
  withParser(
    "",
    "",
    0,
    /** Native preparation produces the actual target snapshot. @param parser - Importer. @param doc - Native graph. @param node - Actual target. @returns Nothing. */ (
      parser,
      doc,
      node,
    ) => {
      node.SetAttr(new SvxWeightItem(FontWeight.WEIGHT_BOLD, RES_CHRATR_WEIGHT));
      PrepareHTMLInsertion(parser);
      const snapshot = parser.m_pTargetCharAttrs;
      assert(snapshot);
      expect(snapshot.GetItemIfSet(RES_CHRATR_WEIGHT, false)).toBeInstanceOf(SvxWeightItem);
      const undo = doc.GetUndoManager(),
        old = undo.DoesUndo();
      undo.DoUndo(false);
      try {
        parser.SetTextCollAttrs();
        const current = parser.m_pPam.GetPoint().GetNode();
        assert(current instanceof SwTextNode);
        expect(
          (
            current.GetpSwAttrSet()?.GetItemIfSet(RES_CHRATR_WEIGHT, false) as SvxWeightItem
          ).GetValue(),
        ).toBe(FontWeight.WEIGHT_BOLD);
        parser.PushContext(new HTMLAttrContext(T.HEAD1_ON, P.COLL_HEADLINE1));
        parser.SetTextCollAttrs();
        expect(current.GetpSwAttrSet()?.GetItemIfSet(RES_CHRATR_WEIGHT, false)).toBeUndefined();
        expect((current.GetAttr(RES_CHRATR_WEIGHT) as SvxWeightItem).GetValue()).toBe(
          FontWeight.WEIGHT_BOLD,
        );
        expect(parser.m_pTargetCharAttrs).toBe(snapshot);
        expect((snapshot.GetItemIfSet(RES_CHRATR_WEIGHT, false) as SvxWeightItem).GetValue()).toBe(
          FontWeight.WEIGHT_BOLD,
        );
      } finally {
        undo.DoUndo(old);
      }
    },
  );
});
it("restores native undo recording after successful import and preserves an already disabled state", /** Actual mode restoration uses finally, including a preexisting disabled recording state. @returns Nothing. */ () => {
  withParser(
    "<b>X</b>",
    "",
    0,
    /** Runs source entry with real enabled state. @param parser - Importer. @param doc - Actual graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      expect(doc.GetUndoManager().DoesUndo()).toBe(true);
      parser.CallParser();
      expect(doc.GetUndoManager().DoesUndo()).toBe(true);
    },
  );
  withParser(
    "X",
    "",
    0,
    /** Existing disabled state survives the native import scope. @param parser - Importer. @param doc - Actual graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      doc.GetUndoManager().DoUndo(false);
      parser.CallParser();
      expect(doc.GetUndoManager().DoesUndo()).toBe(false);
    },
  );
});
it("includes actual internal UNO marks in source paragraph-bookmark admission without exposing them in the UI catalog", /** Native all-mark vector borrows both real mark families. @returns Nothing. */ () => {
  withParser(
    "",
    "X",
    0,
    /** Creates and removes the actual document-owned UNO mark. @param parser - Importer. @param doc - Native graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const range = new SwPaM(parser.m_pPam.GetPoint());
      try {
        const mark = doc.GetIDocumentMarkAccess().MakeUnoMark(range);
        expect(doc.GetIDocumentMarkAccess().GetBookmarks()).toHaveLength(0);
        expect(doc.GetIDocumentMarkAccess().GetAllMarks()).toEqual([mark]);
        expect(parser.HasCurrentParaBookmarks(true)).toBe(true);
        doc.GetIDocumentMarkAccess().DeleteUnoMark(mark);
        expect(parser.HasCurrentParaBookmarks(true)).toBe(false);
        expect(doc.GetIDocumentMarkAccess().GetAllMarks()).toHaveLength(0);
      } finally {
        range.Dispose();
      }
    },
  );
});
it("preserves the source early stop on an expanded mark whose primary position is after the current paragraph", /** The vector is sorted by mark start but the native query compares GetMarkPos; do not repair this source-state mismatch. @returns Nothing. */ () => {
  withParser(
    "",
    "A",
    0,
    /** Uses real native paragraphs, expanded mark orientation and a user bookmark. @param parser - Importer. @param doc - Native graph. @param first - Actual first paragraph. @returns Nothing. */ (
      parser,
      doc,
      first,
    ) => {
      const point = new SwPosition(first, 1);
      doc.GetDocumentContentOperationsManager().AppendTextNode(point);
      const middle = point.GetNode();
      assert(middle instanceof SwTextNode);
      middle.SetText("B");
      doc.GetDocumentContentOperationsManager().AppendTextNode(point);
      const last = point.GetNode();
      assert(last instanceof SwTextNode);
      last.SetText("C");
      const beginning = new SwPosition(first),
        end = new SwPosition(last),
        range = new SwPaM(end, beginning);
      beginning.Dispose();
      end.Dispose();
      point.Dispose();
      try {
        const expanded = doc.GetIDocumentMarkAccess().MakeUnoMark(range),
          bookmark = doc.GetIDocumentMarkAccess().MakeMark(middle, 0, "middle");
        parser.m_pPam.GetPoint().Assign(middle, 0);
        expect(doc.GetIDocumentMarkAccess().GetAllMarks()).toEqual([expanded, bookmark]);
        expect(parser.HasCurrentParaBookmarks(true)).toBe(false);
        doc.GetIDocumentMarkAccess().DeleteUnoMark(expanded);
        expect(parser.HasCurrentParaBookmarks(true)).toBe(true);
      } finally {
        range.Dispose();
      }
    },
  );
});
