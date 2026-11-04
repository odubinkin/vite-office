/** @fileoverview Genuine node-array mutations exercise original borrowed SwNodeIndex registration, reassignment, removal correction and separate content-position handling. No registry state or deletion results are injected. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwNodeIndex, SwPosition } from "../crsr/pam";
import { SwTextNode } from "../txtnode/ndtxt";
import { InsertTempTableCaptionSection } from "../../filter/html/htmltab.sections";
import { SwHTMLParser } from "../../filter/html/swhtml";
import { SvStream } from "../../../../tools/source/stream/stream";
import { RTL_TEXTENCODING_UTF8 as UTF8 } from "../../../../sal/inc/rtl/textenc";
import { SwPaM } from "../crsr/pam";
/** Creates a real body with three actual paragraphs. @param check - Native observations. @returns Nothing. */
function inspect(
  check: (doc: SwDoc, nodes: readonly [SwTextNode, SwTextNode, SwTextNode]) => void,
): void {
  const doc = new SwDoc(),
    first = doc.paragraphs[0];
  assert(first);
  first.SetText("first");
  const second = doc.nodes.MakeTextNode("second"),
    third = doc.nodes.MakeTextNode("third");
  try {
    check(doc, [first, second, third]);
  } finally {
    doc.Dispose();
  }
}
it("retains node identity and recalculates numeric offsets through insertion and real movement", /** Original pointers remain registered to the same surviving node across reordering. @returns Nothing. */ () => {
  inspect(
    /** Observes actual node/array owners. @param doc - Document. @param nodes - Body paragraphs. @returns Nothing. */ (
      doc,
      [first, second, third],
    ) => {
      const index = new SwNodeIndex(second),
        original = index.GetIndex();
      try {
        doc.nodes.MakeTextNode(second, doc.GetDfltTextFormatColl());
        expect(index.GetNode()).toBe(second);
        expect(index.GetIndex()).toBe(original + 1);
        doc.nodes.moveTextNode(second, 1);
        expect(index.GetNode()).toBe(second);
        expect(index.GetIndex()).toBe(third.GetIndex() + 1);
        expect(first.GetText()).toBe("first");
      } finally {
        index.Dispose();
      }
    },
  );
});
it.each([0, 1, 2])(
  "corrects a node-only index to the first following node when deleting body paragraph%s",
  /** Last-paragraph correction targets the structural end sentinel, independently of content cursor correction. @param which - Removed paragraph. @returns Nothing. */ (
    which,
  ) => {
    inspect(
      /** Observes native successor and content survivor separately. @param doc - Document. @param nodes - Body paragraphs. @returns Nothing. */ (
        doc,
        nodes,
      ) => {
        const node = nodes[which];
        assert(node);
        const following = doc.nodes.at(node.GetIndex() + 1),
          index = new SwNodeIndex(node),
          position = new SwPosition(node, 2);
        try {
          doc.nodes.removeTextNode(node);
          expect(index.GetNode()).toBe(following);
          expect(index.GetIndex()).toBe(following.GetIndex());
          if (which === 2) {
            expect(following).toBe(doc.nodes.GetEndOfContent());
            expect(position.GetNode()).toBe(nodes[1]);
            expect(position.GetContentIndex()).toBe(6);
          } else {
            expect(position.GetNode()).toBe(following);
            expect(position.GetContentIndex()).toBe(0);
          }
        } finally {
          position.Dispose();
          index.Dispose();
        }
      },
    );
  },
);
it("reassignment unlinks the old node and registers the new one, including same-owner assignment", /** Subsequent real deletions prove which native owner retains the live index. @returns Nothing. */ () => {
  inspect(
    /** Uses real array removals. @param doc - Document. @param nodes - Body paragraphs. @returns Nothing. */ (
      doc,
      [first, second, third],
    ) => {
      const index = new SwNodeIndex(first);
      try {
        index.Assign(second);
        index.Assign(second);
        doc.nodes.removeTextNode(first);
        expect(index.GetNode()).toBe(second);
        doc.nodes.removeTextNode(second);
        expect(index.GetNode()).toBe(third);
      } finally {
        index.Dispose();
      }
    },
  );
});
it("corrects every live borrowed index without changing untouched-node indices", /** Actual source ring correction has no small fixed count limit. @returns Nothing. */ () => {
  inspect(
    /** Observes actual registered indices. @param doc - Document. @param nodes - Body paragraphs. @returns Nothing. */ (
      doc,
      [first, second, third],
    ) => {
      const indices = Array.from(
          { length: 257 },
          /** Constructs native indices rather than registry entries. @returns Native index. */ () =>
            new SwNodeIndex(second),
        ),
        outside = new SwNodeIndex(first);
      try {
        doc.nodes.removeTextNode(second);
        for (const index of indices) expect(index.GetNode()).toBe(third);
        expect(outside.GetNode()).toBe(first);
      } finally {
        for (const index of indices) index.Dispose();
        outside.Dispose();
      }
    },
  );
});
it("registers a cross-document reassignment only with the actual new node", /** The original pointer assignment follows the supplied node rather than retaining a process/global registry. @returns Nothing. */ () => {
  inspect(
    /** Observes two independent documents. @param doc - First owner. @param nodes - First body. @returns Nothing. */ (
      doc,
      [first],
    ) => {
      const other = new SwDoc(),
        target = other.paragraphs[0];
      assert(target);
      const next = other.nodes.MakeTextNode("next"),
        index = new SwNodeIndex(first);
      try {
        index.Assign(target);
        doc.nodes.removeTextNode(first);
        expect(index.GetNode()).toBe(target);
        other.nodes.removeTextNode(target);
        expect(index.GetNode()).toBe(next);
      } finally {
        index.Dispose();
        other.Dispose();
      }
    },
  );
});
it("releases a position's content and node registrations together while preserving live peers", /** Disposed native owners are not inspected after destruction. @returns Nothing. */ () => {
  inspect(
    /** Exercises explicit native destructor ownership. @param doc - Document. @param nodes - Body. @returns Nothing. */ (
      doc,
      [first, second, third],
    ) => {
      const disposed = new SwPosition(second, 2),
        live = new SwNodeIndex(second);
      disposed.Dispose();
      try {
        doc.nodes.removeTextNode(second);
        expect(live.GetNode()).toBe(third);
        expect(first.GetText()).toBe("first");
      } finally {
        live.Dispose();
      }
    },
  );
});
it("corrects all structural/table/cell indices to the actual following paragraph before table destruction", /** Actual native table disposal and frame-client ownership are retained. @returns Nothing. */ () => {
  inspect(
    /** Observes a complete table removal. @param doc - Document. @param nodes - Body. @returns Nothing. */ (
      doc,
      [first],
    ) => {
      const table = doc.nodes.MakeTableNodeBefore(first, "indices", {}),
        tableNode = table.GetTableNode(),
        row = doc.nodes.AppendTableRow(table, 2),
        start = tableNode.GetIndex(),
        end = tableNode.EndOfSectionNode().GetIndex(),
        following = doc.nodes.at(end + 1);
      const indices = doc.nodes
        .entries()
        .slice(start, end + 1)
        .map(
          /** Borrows every actual structural/content node in the range. @param node - Native owner. @returns Registered index. */ (
            node,
          ) => new SwNodeIndex(node),
        );
      expect(row.GetTabBoxes()).toHaveLength(2);
      try {
        doc.nodes.DeleteTable(tableNode);
        for (const index of indices) expect(index.GetNode()).toBe(following);
      } finally {
        for (const index of indices) index.Dispose();
      }
    },
  );
});
it("rebinds node-only indices during actual paragraph replacement alongside its content positions", /** Existing replacement adapter preserves the replacement's original actual identity. @returns Nothing. */ () => {
  inspect(
    /** Observes native index and existing replacement owners. @param doc - Document. @param nodes - Body. @returns Nothing. */ (
      doc,
      [first],
    ) => {
      const replacement = new SwTextNode(doc.nodes, first.StartOfSectionNode()),
        index = new SwNodeIndex(first),
        position = new SwPosition(first, 2);
      replacement.SetText("replacement");
      try {
        doc.nodes.replaceTextNode(first, replacement);
        expect(index.GetNode()).toBe(replacement);
        expect(position.GetNode()).toBe(replacement);
        expect(position.GetContentIndex()).toBe(2);
      } finally {
        position.Dispose();
        index.Dispose();
      }
    },
  );
});
it("preserves native caption section indices while body text is removed after it", /** Real temporary-caption sections and their body-independent structural ownership remain intact. @returns Nothing. */ () => {
  inspect(
    /** Constructs actual caption/parser owners. @param doc - Document. @param nodes - Body. @returns Nothing. */ (
      doc,
      [first],
    ) => {
      const point = new SwPosition(first),
        pam = new SwPaM(point);
      point.Dispose();
      const parser = new SwHTMLParser(doc, pam, new SvStream(new Uint8Array(), UTF8)),
        caption = InsertTempTableCaptionSection(parser),
        index = new SwNodeIndex(caption);
      try {
        doc.nodes.removeTextNode(first);
        expect(index.GetNode()).toBe(caption);
        expect(index.GetIndex()).toBeLessThan(doc.nodes.GetEndOfExtras().GetIndex());
      } finally {
        index.Dispose();
        parser.SourceDispose();
        pam.Dispose();
      }
    },
  );
});

it.each([false, true])(
  "corrects node-only indices for actual inserted row/box removal row=%s",
  /** Native removal keeps its distinct supplied content cursor and first-following structural-node targets. @param wholeRow - Row or cell section. @returns Nothing. */ (
    wholeRow,
  ) => {
    inspect(
      /** Uses actual table section/format owners, not projected row data. @param doc - Document. @returns Nothing. */ (
        doc,
      ) => {
        const table = doc.nodes.MakeTableNode("parts"),
          first = doc.nodes.AppendTableRow(table, wholeRow ? 1 : 2),
          second = wholeRow ? doc.nodes.AppendTableRow(table, 1) : first;
        const removed = first.GetTabBoxes()[0],
          surviving = second.GetTabBoxes()[wholeRow ? 0 : 1];
        assert(removed);
        assert(surviving);
        const start = removed.GetStartNode(),
          end = start.EndOfSectionNode(),
          target = surviving.GetParagraphs()[0];
        assert(target);
        const sectionNodes = doc.nodes.entries().slice(start.GetIndex(), end.GetIndex() + 1),
          following = doc.nodes.at(end.GetIndex() + 1),
          indices = sectionNodes.map(
            /** Registers original start/text/end node identities. @param node - Native section node. @returns Borrowed index. */ (
              node,
            ) => new SwNodeIndex(node),
          );
        const position = new SwPosition(removed.GetParagraphs()[0] as SwTextNode);
        try {
          if (wholeRow)
            doc.nodes.RemoveTableRow(table, { line: first, nodes: sectionNodes }, target, 0);
          else
            doc.nodes.RemoveTableBox(
              table,
              first,
              { box: removed, nodes: sectionNodes },
              target,
              0,
            );
          for (const index of indices) expect(index.GetNode()).toBe(following);
          expect(position.GetNode()).toBe(target);
          expect(position.GetContentIndex()).toBe(0);
        } finally {
          position.Dispose();
          for (const index of indices) index.Dispose();
        }
      },
    );
  },
);

it.each(["array-default", "array", "node-forward", "node-back", "copy", "copy-forward"] as const)(
  "retains original node/array/copy constructor and assignment offsets for%s",
  /** Each overload resolves the actual source owner before registering, and follows later deletion. @param mode - Original overload family. @returns Nothing. */ (
    mode,
  ) => {
    inspect(
      /** Compares actual owners and their registered index targets. @param doc - Document. @param nodes - Body. @returns Nothing. */ (
        doc,
        [first, second, third],
      ) => {
        const origin = new SwNodeIndex(first),
          index =
            mode === "array-default"
              ? new SwNodeIndex(doc.nodes)
              : mode === "array"
                ? new SwNodeIndex(doc.nodes, second.GetIndex())
                : mode === "node-forward"
                  ? new SwNodeIndex(first, 1)
                  : mode === "node-back"
                    ? new SwNodeIndex(third, -1)
                    : mode === "copy"
                      ? new SwNodeIndex(origin)
                      : new SwNodeIndex(origin, 1);
        try {
          expect(index.GetNodes()).toBe(doc.nodes);
          expect(index.GetNode()).toBe(
            mode === "array-default" ? doc.nodes.at(0) : mode === "copy" ? first : second,
          );
          expect(index.Assign(doc.nodes, first.GetIndex())).toBe(index);
          expect(index.GetNode()).toBe(first);
          index.Assign(origin, 1);
          expect(index.GetNode()).toBe(second);
          index.Assign(third, -1);
          expect(index.GetNode()).toBe(second);
          doc.nodes.removeTextNode(second);
          expect(index.GetNode()).toBe(third);
          expect(origin.GetNode()).toBe(first);
        } finally {
          index.Dispose();
          origin.Dispose();
        }
      },
    );
  },
);
