/** @fileoverview Verifies Writer's shown sorted numbered-item registry and source filtering. */
import { expect, it } from "vitest";
import { createWriterDocument } from "./doc";
import { applyWriterParagraphList } from "./list";
import { DocumentListItemsManager } from "./DocumentListItemsManager";
import { SwNodeNum } from "../SwNumberTree/SwNodeNum";
import type { SwTextNode } from "../txtnode/ndtxt";
it("sorts independent of insertion order, suppresses equivalent positions and filters bullets and uncounted items", /** Checks literal document order and caller-owned replacement output. @returns Nothing. */ () => {
  const doc = createWriterDocument();
  const nodes = [
    doc.paragraphs[0] as SwTextNode,
    doc.nodes.MakeTextNode(),
    doc.nodes.MakeTextNode(),
    doc.nodes.MakeTextNode(),
  ];
  nodes.forEach(
    /** Creates canonical numbered and bullet records. @param node - Item. @param index - Position. @returns Nothing. */ (
      node,
      index,
    ) =>
      applyWriterParagraphList(node, {
        kind: index === 2 ? "bullet" : "numbered",
        styleId: index === 2 ? "Bullets" : "Counters",
        listId: index === 2 ? "B" : "A",
        level: 0,
      }),
  );
  (nodes[1] as SwTextNode).SetCountedInList(false);
  const records = nodes.map(
    /** Captures a shown record. @param node - Text owner. @returns Record. */ (node) =>
      node.GetNum() as SwNodeNum,
  );
  const registry = new DocumentListItemsManager();
  for (const index of [3, 1, 2, 0]) registry.addListItem(records[index] as SwNodeNum);
  registry.addListItem(records[0] as SwNodeNum);
  registry.addListItem(new SwNodeNum(nodes[0]));
  const output: SwNodeNum[] = [records[2] as SwNodeNum];
  registry.getNumItems(output);
  expect(output).toEqual([records[0], records[3]]);
  registry.removeListItem(new SwNodeNum(nodes[0]));
  registry.removeListItem(records[0] as SwNodeNum);
  registry.getNumItems(output);
  expect(output).toEqual([records[3]]);
  const root = new SwNodeNum(undefined);
  registry.addListItem(root);
  registry.addListItem(new SwNodeNum(undefined));
  registry.getNumItems(output);
  expect(output).toEqual([records[3]]);
  registry.removeListItem(root);
  doc.getIDocumentListItems().getNumItems(output);
  expect(output).toEqual([records[0], records[3]]);
  doc.nodes.moveTextNode(nodes[3] as SwTextNode, -1);
  doc.getIDocumentListItems().getNumItems(output);
  expect(output).toEqual([records[0], records[3]]);
  (nodes[0] as SwTextNode).RemoveFromList();
  doc.getIDocumentListItems().getNumItems(output);
  expect(output).toEqual([records[3]]);
  doc.Dispose();
  doc.getIDocumentListItems().getNumItems(output);
  expect(output).toEqual([]);
});
