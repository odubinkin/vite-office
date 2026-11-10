/** @fileoverview Original preceding HTML cell-section traversal over real typed node sections, native rowspans and nested content chains. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import type { SwStartNode } from "../../core/docnode/node";
import { SwStartNodeType as K } from "../../../inc/ndtyp";
import { SwHTMLParser } from "./swhtml";
import { HTMLTable } from "./htmltab";
import { HTMLTableOptions } from "./htmltab.options";
import { HTMLTableCnts } from "./htmltab.contents";
import { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SvxAdjust as A } from "../../../../editeng/inc/svxenum";
import { VertOrientation as V } from "../../../../offapi/com/sun/star/text/VertOrientation";
/** Exposes an unchanged protected operation for source observations without injecting private state or results. */
class Table extends HTMLTable {
  /** Forwards original predecessor traversal. @param row - Native row or sentinel. @param col - Native column or sentinel. @returns Actual source section. */
  public override GetPrevBoxStartNode(row: number, col: number): SwStartNode | null {
    return super.GetPrevBoxStartNode(row, col);
  }
}
/** Runs actual graph/parser lifetimes. @param check - Native assertions. @returns Nothing. */
function inspect(check: (parser: SwHTMLParser, doc: SwDoc) => void): void {
  const doc = new SwDoc(),
    node = doc.paragraphs[0];
  assert(node);
  const point = new SwPosition(node),
    pam = new SwPaM(point);
  point.Dispose();
  const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), UTF8));
  try {
    check(parser, doc);
  } finally {
    parser.SourceDispose();
    pam.Dispose();
    doc.Dispose();
  }
}
/** Creates actual intermediate ownership registered at the native parser. @param parser - Actual importer. @returns Native table. */
function table(parser: SwHTMLParser): Table {
  return new Table(parser, false, false, false, new HTMLTableOptions([], A.Left));
}
/** Allocates the real source cell section through native MakeTextSection. @param doc - Actual owner. @returns Native content. */
function contents(doc: SwDoc): HTMLTableCnts {
  return new HTMLTableCnts(
    doc.nodes.MakeTextSection(
      doc.nodes.GetEndOfAutotext(),
      K.SwTableBoxStartNode,
      doc.GetTextFormatColl("table-contents"),
    ),
  );
}
/** Inserts a source cell with ordinary metadata. @param owner - Actual grid. @param value - Actual source chain. @param rows - Native span. @returns Nothing. */
function cell(owner: Table, value: HTMLTableCnts | null, rows = 1): void {
  owner.InsertCell(value, rows, 1, 0, false, 0, V.NONE, null, null, false, 0, false, 0, false);
}
it("returns the original boundary before the first cell", /** Actual SetTable binds the predecessor without synthesizing a table context. @returns Nothing. */ () => {
  inspect(
    /** Uses native boundary binding and real section identity. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const owner = table(parser),
        previous = contents(doc).GetStartNode();
      expect(owner.GetPrevBoxStartNode(0, 0)).toBeNull();
      owner.SetTable(previous, null, 0, 0);
      expect(owner.GetPrevBoxStartNode(0, 0)).toBe(previous);
    },
  );
});
it("returns the tail section of the preceding cell content chain", /** Original traversal follows Next before selecting a paragraph section. @returns Nothing. */ () => {
  inspect(
    /** Builds an actual two-section chain. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const owner = table(parser),
        first = contents(doc),
        last = contents(doc);
      first.Add(last);
      owner.OpenRow(A.End, V.TOP, [null]);
      cell(owner, first);
      cell(owner, contents(doc));
      owner.CloseRow(false);
      owner.CloseTable();
      expect(owner.GetPrevBoxStartNode(0, 1)).toBe(last.GetStartNode());
    },
  );
});
it.each([1, 2])(
  "uses previous-row span %s to select current-row or earlier-row content",
  /** Source looks at prior-row spans while choosing a current-row predecessor, then falls back to the last filled preceding-row cell. @param span - Actual first-cell row span. @returns Nothing. */ (
    span,
  ) => {
    inspect(
      /** Distinguishes real current/preceding content owners. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
        parser,
        doc,
      ) => {
        const owner = table(parser),
          a = contents(doc),
          b = contents(doc),
          c = contents(doc);
        owner.OpenRow(A.End, V.TOP, [null]);
        cell(owner, a, span);
        cell(owner, b);
        owner.CloseRow(false);
        owner.OpenRow(A.End, V.TOP, [null]);
        cell(owner, c);
        if (span === 1) cell(owner, contents(doc));
        owner.CloseRow(false);
        owner.CloseTable();
        expect(owner.GetPrevBoxStartNode(1, 1)).toBe((span === 1 ? c : b).GetStartNode());
        expect(owner.GetPrevBoxStartNode(1, 0)).toBe(b.GetStartNode());
      },
    );
  },
);
it("falls back to the origin when the preceding or last cell has no contents", /** Source diagnostic fallback is not replaced with a fabricated empty section. @returns Nothing. */ () => {
  inspect(
    /** Uses a real empty native cell and an actual origin. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const owner = table(parser),
        first = contents(doc);
      owner.OpenRow(A.End, V.TOP, [null]);
      cell(owner, first);
      cell(owner, null);
      owner.CloseRow(false);
      owner.CloseTable();
      expect(owner.GetPrevBoxStartNode(0, 2)).toBe(first.GetStartNode());
      expect(owner.GetPrevBoxStartNode(65535, 65535)).toBe(first.GetStartNode());
    },
  );
});
it("recurses through the trailing nested table to its actual last section", /** No parallel flattened cell-order list is stored. @returns Nothing. */ () => {
  inspect(
    /** Builds actual native nested-table content chains. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const inner = table(parser),
        last = contents(doc);
      inner.OpenRow(A.End, V.TOP, [null]);
      cell(inner, contents(doc));
      cell(inner, last);
      inner.CloseRow(false);
      inner.CloseTable();
      const outer = table(parser),
        first = contents(doc);
      first.Add(new HTMLTableCnts(inner));
      outer.OpenRow(A.End, V.TOP, [null]);
      cell(outer, first);
      outer.CloseRow(false);
      outer.CloseTable();
      expect(outer.GetPrevBoxStartNode(65535, 65535)).toBe(last.GetStartNode());
    },
  );
});
it("returns null when the final content has neither a start section nor a table", /** Original tail selection does not recover an earlier nonempty chain element. @returns Nothing. */ () => {
  inspect(
    /** Builds the original null-content domain without fake sections. @param parser - Importer. @param doc - Graph. @returns Nothing. */ (
      parser,
      doc,
    ) => {
      const owner = table(parser),
        first = contents(doc);
      first.Add(new HTMLTableCnts(null));
      owner.OpenRow(A.End, V.TOP, [null]);
      cell(owner, first);
      owner.CloseRow(false);
      owner.CloseTable();
      expect(owner.GetPrevBoxStartNode(65535, 65535)).toBeNull();
    },
  );
});
