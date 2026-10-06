/** @fileoverview Verifies Writer ASCII list output over actual native PaMs without synthetic marker metadata. */
import { describe, expect, it } from "vitest";
import { createWriterDocument } from "../../core/doc/doc";
import { applyWriterParagraphList } from "../../core/doc/list";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwASCWriter } from "./wrtasc";
/** Writes actual connected text nodes in clipboard mode. @param first - Native range start. @param last - Native range end. @returns Native ASCII selection. */
function copied(first: SwTextNode, last = first): string {
  const pam = new SwPaM(new SwPosition(last, last.Len()), new SwPosition(first, 0)),
    writer = new SwASCWriter();
  writer.m_bWriteClipboardDoc = true;
  try {
    return writer.Write(pam);
  } finally {
    pam.Dispose();
  }
}
describe("native ASCII list writer", /** Registers native list range output contracts. @returns Nothing. */ () => {
  it("suppresses labels for a selection confined to one native list paragraph", /** Checks native same-node selection rather than list item count. @returns Nothing. */ () => {
    const doc = createWriterDocument(),
      first = doc.paragraphs[0] as SwTextNode;
    first.SetText("One");
    applyWriterParagraphList(first, { kind: "bullet", level: 0 });
    expect(copied(first)).toBe("One");
  });
  it("exports actual numbering and configured bullets without a synthetic fallback marker", /** Checks real rule/tree ownership and ordinary adjacent text. @returns Nothing. */ () => {
    const doc = createWriterDocument(),
      first = doc.paragraphs[0] as SwTextNode,
      second = doc.nodes.MakeTextNode("Two"),
      body = doc.nodes.MakeTextNode("Body");
    first.SetText("One");
    applyWriterParagraphList(first, { kind: "numbered", level: 0 });
    applyWriterParagraphList(second, { kind: "bullet", level: 0 });
    expect(copied(first, body)).toBe("    1. One\n    • Two\nBody");
  });
  it("adds four spaces per native level and uses that level's default bullet character", /** Checks actual nested level configuration. @returns Nothing. */ () => {
    const doc = createWriterDocument(),
      first = doc.paragraphs[0] as SwTextNode,
      second = doc.nodes.MakeTextNode("Child");
    first.SetText("Parent");
    applyWriterParagraphList(first, { kind: "numbered", level: 0 });
    applyWriterParagraphList(second, { kind: "bullet", level: 1 });
    expect(copied(first, second)).toBe("    1. Parent\n        ◦ Child");
  });
});
