/** @fileoverview Exercises the unchanged native nested-extras range walk using test-friend assembly of genuine section owners. */
import { assert, expect, it } from "vitest";
import { SwDoc } from "../doc/doc";
import { SwStartNode, SwEndNode, type SwNode } from "../docnode/node";
import type { SwNodes } from "../docnode/nodes";
import { SwTextNode } from "../txtnode/ndtxt";
import { CheckNodesRange, SwNodeIndex, SwPosition, GoPreviousPos } from "./pam";
import { goPrevious } from "../docnode/nodes.navigation";
/** Builds a genuine native section before connecting its complete graph. @param doc - Actual document. @param parent - Real native parent. @param label - Text. @param nested - Nested section count. @returns Actual owners in native array order. */
function section(doc: SwDoc, parent: SwStartNode, label: string, nested: number) {
  const nodes = doc.GetNodes(),
    start = new SwStartNode(nodes, parent),
    end = new SwEndNode(nodes, start),
    text = new SwTextNode(nodes, start, doc.GetDfltTextFormatColl(), label);
  start.setEndOfSection(end);
  const children: SwNode[] = [text];
  for (let i = 0; i < nested; i++) {
    const child = section(doc, start, label + "." + i, 0);
    children.push(...child.sequence);
  }
  return { start, end, text, sequence: [start, ...children, end] };
}
/** Native tests are friends of SwNodes: this narrow adapter connects already valid native sections through the exposed array view. No ownership fields or indices are forged; node indices derive from actual array membership. @param nodes - Native owner. @param before - Connected matching fixed end. @param sequence - Real same-owner graph. @returns Nothing. */
function connect(nodes: SwNodes, before: SwEndNode, sequence: readonly SwNode[]): void {
  const view = nodes.entries() as SwNode[];
  view.splice(before.GetIndex(), 0, ...sequence);
  const stack: SwStartNode[] = [before.StartOfSectionNode()];
  for (const node of sequence) {
    expect(node.GetNodes()).toBe(nodes);
    expect(nodes.at(node.GetIndex())).toBe(node);
    if (node instanceof SwStartNode) {
      expect(node.StartOfSectionNode()).toBe(stack.at(-1));
      expect(node.EndOfSectionNode().StartOfSectionNode()).toBe(node);
      expect(node.EndOfSectionNode().GetIndex()).toBeGreaterThan(node.GetIndex());
      stack.push(node);
    } else if (node instanceof SwEndNode) {
      expect(node.StartOfSectionNode()).toBe(stack.pop());
    } else expect(node.StartOfSectionNode()).toBe(stack.at(-1));
  }
  expect(stack).toEqual([before.StartOfSectionNode()]);
}
it("admits descendants in one second-level extras section and rejects neighboring sections", /** Verifies native ancestor traversal and endpoint asymmetry. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    nodes = doc.GetNodes(),
    base = nodes.GetEndOfAutotext(),
    parent = base.StartOfSectionNode(),
    first = section(doc, parent, "First", 2),
    second = section(doc, parent, "Second", 0);
  connect(nodes, base, [...first.sequence, ...second.sequence]);
  try {
    const nested = first.sequence.filter(
      /** Selects real nested content owners. @param node - Section node. @returns Whether text. */ (
        node,
      ): node is SwTextNode => node instanceof SwTextNode,
    );
    assert(nested[1] && nested[2]);
    expect(CheckNodesRange(first.text, nested[1], true)).toBe(true);
    expect(CheckNodesRange(nested[1], nested[2], true)).toBe(true);
    expect(CheckNodesRange(nested[1], first.text, true)).toBe(true);
    expect(CheckNodesRange(nested[1], second.text, true)).toBe(false);
    expect(CheckNodesRange(first.text, second.text, true)).toBe(false);
    expect(CheckNodesRange(first.text, second.text, false)).toBe(true);
    expect(CheckNodesRange(second.text, nested[1], true)).toBe(false);
    expect(CheckNodesRange(first.start, nested[1], true)).toBe(true);
    const index = new SwNodeIndex(second.text);
    expect(goPrevious(index, false)).toBe(nested[2]);
    const position = new SwPosition(second.text);
    try {
      expect(GoPreviousPos(position, true)).toBeUndefined();
      expect(position.GetNode()).toBe(second.text);
    } finally {
      position.Dispose();
    }
  } finally {
    doc.Dispose();
  }
});
it("applies every native global lower bound before backward content traversal", /** Verifies actual fixed sections rather than surrogate indices. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    nodes = doc.GetNodes();
  try {
    for (const base of [
      nodes.GetEndOfAutotext(),
      nodes.GetEndOfPostIts(),
      nodes.GetEndOfInserts(),
      nodes.GetEndOfRedlines(),
    ]) {
      const part = section(doc, base.StartOfSectionNode(), "fixed", 0);
      connect(nodes, base, part.sequence);
      const index = new SwNodeIndex(part.text);
      expect(goPrevious(index, false)).toBeUndefined();
    }
  } finally {
    doc.Dispose();
  }
});

it("rejects crossing from root-level extras text into a separate native nested section", /** Verifies the original root-section early return. @returns Nothing. */ () => {
  const doc = new SwDoc(),
    nodes = doc.GetNodes(),
    end = nodes.GetEndOfPostIts(),
    root = end.StartOfSectionNode(),
    text = new SwTextNode(nodes, root, doc.GetDfltTextFormatColl(), "root"),
    nested = section(doc, root, "nested", 0);
  connect(nodes, end, [text, ...nested.sequence]);
  try {
    expect(CheckNodesRange(text, nested.text, true)).toBe(false);
  } finally {
    doc.Dispose();
  }
});
