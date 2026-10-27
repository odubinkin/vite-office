/** @fileoverview Exercises actual Writer fixed-section cursor admission across non-body text. */
import { expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwTextNode } from "../txtnode/ndtxt";
import { CheckNodesRange } from "./pam";
it("admits same fixed-section text and rejects crossings in either direction", /** Verifies source extras classification. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    nodes = doc.GetNodes();
  try {
    const ends = [
      nodes.GetEndOfAutotext(),
      nodes.GetEndOfPostIts(),
      nodes.GetEndOfInserts(),
      nodes.GetEndOfRedlines(),
    ];
    const pairs = ends.map(
      /** Inserts genuine text owners inside a fixed section. @param end - Sentinel. @returns Two native nodes. */ (
        end,
      ) => {
        const start = end.StartOfSectionNode();
        const first = new SwTextNode(nodes, start, doc.GetDfltTextFormatColl(), "first"),
          second = new SwTextNode(nodes, start, doc.GetDfltTextFormatColl(), "second");
        nodes.insertTextNodeAfter(start, first);
        nodes.insertTextNodeAfter(first, second);
        return [first, second] as const;
      },
    );
    for (const [i, [first, second]] of pairs.entries()) {
      expect(CheckNodesRange(first, second, false)).toBe(true);
      expect(CheckNodesRange(first, second, true)).toBe(true);
      expect(CheckNodesRange(first.StartOfSectionNode(), second, true)).toBe(false);
      for (const [j, [other]] of pairs.entries())
        if (i !== j) {
          expect(CheckNodesRange(first, other, true)).toBe(false);
          expect(CheckNodesRange(other, first, false)).toBe(false);
        }
    }
    const root = nodes.GetEndOfContent().StartOfSectionNode().StartOfSectionNode();
    expect(CheckNodesRange(root, root, false)).toBe(false);
  } finally {
    doc.Dispose();
  }
});
