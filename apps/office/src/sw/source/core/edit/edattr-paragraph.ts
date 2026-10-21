/** @fileoverview Consumed inclusive paragraph-node traversal from native GetPaMAttr;this is not a full attribute-query service. */
import type { SwDoc } from "../doc/doc";
import type { SwPaM } from "../crsr/pam";
import type { SwTextNode } from "../txtnode/ndtxt";

/** Traverses the text-node portion of native GetPaMAttr's inclusive cursor-ring spans,including empty nodes and an end at offset zero. This is paragraph attribute traversal,not character selection. @param document - Actual owning document. @param cursor - Actual editing cursor ring. @returns Unique paragraph owners in native traversal order. */
export function getParagraphAttributeNodes(document: SwDoc, cursor: SwPaM): readonly SwTextNode[] {
  const paragraphs = new Set<SwTextNode>();
  for (const range of cursor.GetRingContainer())
    for (let index = range.Start().GetNodeIndex(); index <= range.End().GetNodeIndex(); index++) {
      const node = document.GetNodes().at(index);
      if (node.IsTextNode()) paragraphs.add(node as SwTextNode);
    }
  return [...paragraphs];
}
