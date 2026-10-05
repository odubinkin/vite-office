/** @fileoverview Verifies existing formatting, text, split/join, graph and undo node ownership. */
import { SwInsertFlags } from "../../../inc/IDocumentContentOperations";
import { describe, expect, it } from "vitest";
import { SwDoc, createWriterDocument } from "../doc/doc";
import type { SwTextNode } from "./ndtxt";
import { SwTextINetFormat } from "./txtatr2";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { SwDocShell } from "../../uibase/app/docsh";
import { SwWrtShell } from "../../uibase/wrtsh/wrtsh1";
import {
  fixtureSplitParagraph,
  fixtureMergeParagraphWithPrevious,
} from "../../../../test/wrtsh-test-helpers";
import {
  decodeWriterDocument,
  encodeWriterDocument,
} from "../../../browser/filter/xml/writer-document-codec";

/** Requires one test node. @param node - Optional node. @returns Node. */
function required(node: SwTextNode | undefined): SwTextNode {
  if (node === undefined) throw new Error("Missing transition node");
  return node;
}
/** Checks concrete links against their literal node. @param node - Actual owner. @returns Actual links. */
function links(node: SwTextNode): SwTextINetFormat[] {
  const hints = node.GetpSwpHints();
  const values =
    hints?.entries().filter(
      /** Selects the internet family. @param attr - Candidate attribute. @returns Whether internet. */ function internet(
        attr,
      ): boolean {
        return attr.Which() === 54;
      },
    ) ?? [];
  expect(values.length).toBeGreaterThan(0);
  for (const value of values) {
    expect(value).toBeInstanceOf(SwTextINetFormat);
    const link = value as SwTextINetFormat;
    expect(link.GetpTextNode()).toBe(node);
    expect(link.GetTextNode()).toBe(node);
    expect(link.m_pHints).toBe(hints);
    expect(link.format.GetTextINetFormat()).toBe(link);
  }
  return values as SwTextINetFormat[];
}
/** Creates a live linked paragraph. @returns Document and actual node. */
function fixture() {
  const doc = new SwDoc(),
    node = required(doc.paragraphs[0]);
  node.SetText("abcdef");
  node.SetHyperlink(1, 5, { url: "transition" });
  return { doc, node };
}
describe("internet node transition ownership", /** Registers actual existing transition boundaries. @returns Nothing. */ function transitionCases(): void {
  it("preserves map/item/node identity through ordinary text coordinates", /** Checks in-place native coordinate ownership. @returns Nothing. */ function ordinaryText(): void {
    const { node } = fixture(),
      map = node.GetpSwpHints(),
      attr = links(node)[0];
    node.InsertText("X", 2);
    expect(node.GetpSwpHints()).toBe(map);
    expect(links(node)[0]).toBe(attr);
    node.EraseText(2, 1);
    expect(node.GetpSwpHints()).toBe(map);
    expect(links(node)[0]).toBe(attr);
    expect([attr?.start, attr?.end]).toEqual([1, 5]);
    node.ReplaceRange(0, 6, node.CreateTextFragmentFromText("", node.GetCharacterItemsAt(0)));
    expect(node.GetpSwpHints()).toBeUndefined();
    expect(attr?.GetpTextNode()).toBeUndefined();
  });
  it.each(["format", "hyperlink", "insert", "set-text"] as const)(
    "releases replaced backlinks through %s",
    /** Checks node backlink detachment at replacement. @param kind - Existing mutation path. @returns Nothing. */ function replaceTransition(
      kind,
    ): void {
      const { node } = fixture(),
        old = links(node)[0];
      if (kind === "format") node.ToggleTextRangeFormat(1, 5, "bold");
      else if (kind === "hyperlink") node.SetHyperlink(1, 5, { url: "changed" });
      else if (kind === "insert")
        node.InsertText("X", 2, SwInsertFlags.DEFAULT, node.GetCharacterItemsAt(2), {
          url: "inserted",
        });
      else node.SetText("plain");
      expect(old?.GetpTextNode()).toBeUndefined();
      if (kind === "set-text") expect(node.GetpSwpHints()).toBeUndefined();
      else expect(links(node)).not.toContain(old);
    },
  );
  it("creates detached fragments and binds their copied or consumed links", /** Checks copied and consumed fragment ownership. @returns Nothing. */ function fragments(): void {
    const { doc, node } = fixture(),
      b = doc.GetNodes().MakeTextNode();
    b.SetText("XY");
    const fragment = node.CreateTextFragmentFromText("link", node.GetCharacterItemsAt(0), {
      url: "fragment",
    });
    const original = fragment.hints.Get(0) as SwTextINetFormat;
    expect(original.GetpTextNode()).toBeUndefined();
    b.ReplaceRange(1, 1, fragment);
    const copied = links(b)[0];
    expect(copied).not.toBe(original);
    expect(original.GetpTextNode()).toBeUndefined();
    const formatted = node.CreateHyperlinkTextFragment(1, 5, { url: "formatted" });
    expect((formatted.hints.Get(0) as SwTextINetFormat).GetpTextNode()).toBeUndefined();
    b.ReplaceRange(1, 5, formatted, true);
    expect(formatted.hints.Count()).toBe(0);
    links(b);
    expect(copied?.GetpTextNode()).toBeUndefined();
  });
  it("binds split portions and keeps the retained trailing node owner during join", /** Checks split and retained join owners. @returns Nothing. */ function splitJoin(): void {
    const { node } = fixture(),
      original = links(node)[0],
      trailing = node.SplitContent(3);
    expect(node.GetText()).toBe("abc");
    expect(trailing.GetText()).toBe("def");
    expect(original?.GetpTextNode()).toBeUndefined();
    expect(links(node)[0]).toMatchObject({ start: 1, end: 3 });
    const tail = links(trailing)[0];
    expect(tail).toMatchObject({ start: 0, end: 2 });
    node.AppendTextNode(trailing);
    expect(node.GetText()).toBe("abcdef");
    expect(links(node)).toHaveLength(2);
    expect(links(trailing)[0]).toBe(tail);
    expect(tail?.GetTextNode()).toBe(trailing);
  });
  it("binds graph-decoded links to decoded nodes", /** Checks decoded node independence. @returns Nothing. */ function graphOwners(): void {
    const { doc, node } = fixture(),
      source = links(node)[0];
    const decoded = decodeWriterDocument(encodeWriterDocument(doc)),
      target = required(decoded.paragraphs[0]);
    expect(links(target)[0]).not.toBe(source);
    expect(links(target)[0]?.GetTextNode()).not.toBe(node);
    links(node);
  });
  it("retains paragraph identity and backlinks through actual split/join undo and redo", /** Checks actual shell history and retained paragraph identity. @returns Nothing. */ function structuralHistory(): void {
    const doc = createWriterDocument(),
      node = required(doc.paragraphs[0]);
    node.SetText("abcdef");
    node.SetHyperlink(1, 5, { url: "history" });
    const state = createDocument({
      id: "internet-node-history",
      suiteId: "writer",
      title: "Internet history",
    });
    const docShell = new SwDocShell(doc, state, {
      kind: "primary",
      name: state.title,
      storageKey: state.id,
    });
    const shell = new SwWrtShell(docShell);
    const id = fixtureSplitParagraph(shell, "p-1", 3),
      trailing = required(doc.paragraphs[1]),
      tail = links(trailing)[0];
    links(node);
    expect(shell.Undo()).toBe(true);
    expect(doc.paragraphs).toHaveLength(1);
    links(node);
    expect(links(trailing)[0]).toBe(tail);
    expect(shell.Redo()).toBe(true);
    expect(doc.paragraphs[1]).toBe(trailing);
    expect(links(trailing)[0]).toBe(tail);
    fixtureMergeParagraphWithPrevious(shell, id);
    expect(doc.paragraphs).toHaveLength(1);
    links(node);
    expect(links(trailing)[0]).toBe(tail);
    expect(shell.Undo()).toBe(true);
    expect(doc.paragraphs[1]).toBe(trailing);
    links(node);
    expect(links(trailing)[0]).toBe(tail);
    expect(shell.Redo()).toBe(true);
    links(node);
    expect(links(trailing)[0]).toBe(tail);
  });
});
