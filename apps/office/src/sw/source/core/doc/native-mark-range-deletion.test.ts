/** @fileoverview Real document marks and native section/content ranges exercise original deleteMarks predicates, endpoint expulsion, deferred deletion and current UNO cross-cell correction. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "./doc";
import { DelBookmarks } from "./docbm";
import { SwPaM, SwPosition } from "../crsr/pam";
import { SwStartNodeType as K } from "../../../inc/ndtyp";
import { SwTextNode } from "../txtnode/ndtxt";
/** Authors actual native UNO endpoints and transfers their copies to the document mark owner. @param doc - Document. @param first - Primary content node. @param from - Primary offset. @param other - Optional other content node. @param to - Optional other offset. @returns Actual managed mark. */
function uno(doc: SwDoc, first: SwTextNode, from: number, other?: SwTextNode, to = 0) {
  const p = new SwPosition(first, from),
    q = other ? new SwPosition(other, to) : undefined,
    range = new SwPaM(p, q);
  try {
    return doc.GetIDocumentMarkAccess().MakeUnoMark(range);
  } finally {
    range.Dispose();
    p.Dispose();
    q?.Dispose();
  }
}
/** Creates genuine document body and mark owners. @param check - Native observations. @returns Nothing. */
function inspect(
  check: (doc: SwDoc, first: SwTextNode, second: SwTextNode, third: SwTextNode) => void,
): void {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  first.SetText("abcdef");
  const second = doc.nodes.MakeTextNode("second"),
    third = doc.nodes.MakeTextNode("third");
  try {
    check(doc, first, second, third);
  } finally {
    doc.Dispose();
  }
}
it.each([false, true])(
  "retains original collapsed bookmark and UNO offset boundaries through paragraph-end selection=%s",
  /** Source paragraph ends are inclusive and a collapsed UNO mark touching only the start is retained. @param paragraphEnd - Select complete paragraph suffix. @returns Nothing. */ (
    paragraphEnd,
  ) => {
    inspect(
      /** Reads only surviving mark membership and positions. @param doc - Document. @param node - Actual body paragraph. @returns Nothing. */ (
        doc,
        node,
      ) => {
        const access = doc.GetIDocumentMarkAccess(),
          ordinary = [],
          internal = [];
        for (let i = 0; i <= 6; ++i) {
          ordinary.push(access.MakeMark(node, i, `m${i}`));
          internal.push(uno(doc, node, i));
        }
        access.DeleteMarks(node, node, 2, paragraphEnd ? 6 : 4);
        const remaining = access.GetAllMarks();
        for (let i = 0; i <= 6; ++i) {
          const regular = ordinary[i],
            native = internal[i];
          assert(regular);
          assert(native);
          expect(remaining.includes(regular)).toBe(i < 2 || (!paragraphEnd && i >= 4));
          expect(remaining.includes(native)).toBe(i <= 2 || (!paragraphEnd && i >= 4));
        }
      },
    );
  },
);
it.each([false, true])(
  "deletes an expanded UNO range touching the selected non-paragraph end replace=%s",
  /** Native BOOKMARK replacement exception does not apply to UNO_BOOKMARK. @param replace - Original replacement flag. @returns Nothing. */ (
    replace,
  ) => {
    inspect(
      /** Uses actual expanded and collapsed marks at the same end. @param doc - Document. @param node - Content owner. @returns Nothing. */ (
        doc,
        node,
      ) => {
        const access = doc.GetIDocumentMarkAccess(),
          expanded = uno(doc, node, 2, node, 4),
          collapsed = uno(doc, node, 4);
        access.DeleteMarks(node, node, 2, 4, replace);
        expect(access.GetAllMarks()).not.toContain(expanded);
        expect(access.GetAllMarks()).toContain(collapsed);
        expect(collapsed.GetMarkPos().GetContentIndex()).toBe(4);
      },
    );
  },
);
it.each([false, true])(
  "expels only the interior endpoint while retaining native UNO orientation reversed=%s",
  /** Original partial-range correction does not normalize the primary endpoint as repositionMark does. @param reversed - Primary position is outside. @returns Nothing. */ (
    reversed,
  ) => {
    inspect(
      /** Observes real endpoint values after native correction. @param doc - Document. @param node - Content. @returns Nothing. */ (
        doc,
        node,
      ) => {
        const mark = uno(doc, node, reversed ? 6 : 3, node, reversed ? 3 : 6);
        doc.GetIDocumentMarkAccess().DeleteMarks(node, node, 2, 4);
        expect(mark.GetMarkPos().GetContentIndex()).toBe(reversed ? 6 : 4);
        expect(mark.GetOtherMarkPos().GetContentIndex()).toBe(reversed ? 4 : 6);
        expect(mark.IsExpanded()).toBe(true);
      },
    );
  },
);
it("deletes all wholly contained collapsed and expanded marks in a native node-only range", /** A source start-node is inclusive and the end-node is exclusive without content offsets. @returns Nothing. */ () => {
  inspect(
    /** Checks actual vector membership without reading destroyed marks. @param doc - Document. @param first - Start. @param second - Interior. @param third - Exclusive end. @returns Nothing. */ (
      doc,
      first,
      second,
      third,
    ) => {
      const access = doc.GetIDocumentMarkAccess(),
        regular = access.MakeMark(second, 1, "interior"),
        internal = uno(doc, second, 0),
        expanded = uno(doc, first, 1, second, 4),
        outside = access.MakeMark(third, 0, "outside");
      DelBookmarks(first, third);
      expect(access.GetAllMarks()).not.toContain(regular);
      expect(access.GetAllMarks()).not.toContain(internal);
      expect(access.GetAllMarks()).not.toContain(expanded);
      expect(access.GetAllMarks()).toContain(outside);
      expect(outside.GetMarkPos().GetNode()).toBe(third);
    },
  );
});
it("ignores same-node and reversed node-only DelBookmarks ranges", /** Original wrapper returns before invoking contentless same-node deletion. @returns Nothing. */ () => {
  inspect(
    /** Observes actual native mark identities. @param doc - Document. @param first - Mark owner. @param second - Later boundary. @returns Nothing. */ (
      doc,
      first,
      second,
    ) => {
      const mark = doc.GetIDocumentMarkAccess().MakeMark(first, 3, "keep");
      DelBookmarks(first, first);
      DelBookmarks(second, first);
      expect(doc.GetIDocumentMarkAccess().GetAllMarks()).toContain(mark);
      expect(mark.GetMarkPos().GetContentIndex()).toBe(3);
    },
  );
});
it("expels an endpoint from a genuine temporary caption section to the next content owner", /** EndOfExtras is structural; the source searches real following content rather than using a fabricated body position. @returns Nothing. */ () => {
  inspect(
    /** Authors original normal caption section nodes. @param doc - Document. @param body - First native body node. @returns Nothing. */ (
      doc,
      body,
    ) => {
      const caption = doc.nodes.MakeTextSection(
          doc.nodes.GetEndOfExtras(),
          K.SwNormalStartNode,
          doc.GetDfltTextFormatColl(),
        ),
        text = doc.nodes.at(caption.GetIndex() + 1);
      assert(text instanceof SwTextNode);
      text.SetText("caption");
      const mark = uno(doc, text, 2, body, 3);
      DelBookmarks(caption, caption.EndOfSectionNode());
      expect(mark.GetMarkPos().GetNode()).toBe(body);
      expect(mark.GetMarkPos().GetContentIndex()).toBe(0);
      expect(mark.GetOtherMarkPos().GetNode()).toBe(body);
      expect(mark.GetOtherMarkPos().GetContentIndex()).toBe(3);
      expect(mark.IsExpanded()).toBe(true);
    },
  );
});
it("uses the end of preceding native content when no following content survives", /** Original expulsion keeps endpoint orientation and actual predecessor length. @returns Nothing. */ () => {
  inspect(
    /** Observes the original backward fallback. @param doc - Document. @param first - Surviving content. @param second - Deleted-range start. @returns Nothing. */ (
      doc,
      first,
      second,
    ) => {
      const mark = uno(doc, second, 2, first, 1);
      DelBookmarks(second, doc.nodes.GetEndOfContent());
      expect(mark.GetMarkPos().GetNode()).toBe(first);
      expect(mark.GetMarkPos().GetContentIndex()).toBe(6);
      expect(mark.GetOtherMarkPos().GetContentIndex()).toBe(1);
      expect(mark.IsExpanded()).toBe(true);
    },
  );
});
it("retains the source opposite-endpoint fallback when neither content neighbor is available", /** Equal positions do not clear the source expanded flag when no cross-cell correction is needed. @returns Nothing. */ () => {
  inspect(
    /** Creates real extra/body endpoints across the fixed-section boundary. @param doc - Document. @param first - Body start. @returns Nothing. */ (
      doc,
      first,
    ) => {
      const caption = doc.nodes.MakeTextSection(
          doc.nodes.GetEndOfExtras(),
          K.SwNormalStartNode,
          doc.GetDfltTextFormatColl(),
        ),
        text = doc.nodes.at(caption.GetIndex() + 1);
      assert(text instanceof SwTextNode);
      text.SetText("outside");
      const mark = uno(doc, first, 2, text, 3);
      DelBookmarks(first, doc.nodes.GetEndOfContent());
      expect(mark.GetMarkPos().GetNode()).toBe(text);
      expect(mark.GetMarkPos().GetContentIndex()).toBe(3);
      expect(mark.GetOtherMarkPos().GetNode()).toBe(text);
      expect(mark.GetOtherMarkPos().GetContentIndex()).toBe(3);
      expect(mark.IsExpanded()).toBe(true);
      expect(mark.GetMarkStart()).toBe(mark.GetOtherMarkPos());
      expect(mark.GetMarkEnd()).toBe(mark.GetMarkPos());
      const pair = mark.GetMarkStartEnd();
      expect(pair[0]).toBe(mark.GetOtherMarkPos());
      expect(pair[1]).toBe(mark.GetMarkPos());
    },
  );
});
it.each([false, true])(
  "collapses an actual UNO selection when partial expulsion would cross a cell boundary reversed=%s",
  /** The surviving external endpoint is retained according to the original changed-primary/changed-other branch. @param reversed - External endpoint is primary. @returns Nothing. */ (
    reversed,
  ) => {
    inspect(
      /** Uses actual core table/cell sections. @param doc - Document. @param body - External text owner. @returns Nothing. */ (
        doc,
        body,
      ) => {
        const table = doc.nodes.MakeTableNode("marks"),
          row = doc.nodes.AppendTableRow(table, 2),
          cell = row.GetTabBoxes()[0];
        assert(cell);
        const text = cell.GetParagraphs()[0];
        assert(text);
        text.SetText("cell");
        const mark = reversed ? uno(doc, body, 2, text, 1) : uno(doc, text, 1, body, 2);
        DelBookmarks(cell.GetStartNode(), cell.GetStartNode().EndOfSectionNode());
        expect(mark.GetMarkPos().GetNode()).toBe(body);
        expect(mark.GetMarkPos().GetContentIndex()).toBe(2);
        expect(mark.IsExpanded()).toBe(false);
      },
    );
  },
);
