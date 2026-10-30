/** @fileoverview Original EditPaM/EditSelection value and Adjust contracts over real ContentNodes and an explicit enclosing document-position table. */
import { expect, it } from "vitest";
import { ContentNode } from "../../inc/ContentNode";
import { EditPaM } from "../../inc/EditPaM";
import { EditSelection, type EditDocNodePositions } from "../../inc/EditSelection";
import { EditEngineItemPool } from "../../inc/editdoc";
import { EE_PARA_MAX } from "../../inc/EPaM";

it("copies nonowning node/index values and preserves original null/index negation", /** Null with a nonzero index is deliberately not the source zero value. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    node = new ContentNode(pool),
    first = new EditPaM(node, 3),
    copy = new EditPaM(first);
  try {
    first.SetIndex(5);
    expect(copy.GetNode()).toBe(node);
    expect(copy.GetIndex()).toBe(3);
    expect(new EditPaM().not()).toBe(true);
    expect(new EditPaM(null, 1).not()).toBe(false);
    copy.assign(first);
    expect(copy.equals(first)).toBe(true);
  } finally {
    node.dispose();
  }
});

it("adjusts source paragraph order by value while keeping borrowed endpoint identities", /** The mandatory position table is a prepared enclosing dependency, not a fabricated production EditDoc. @returns Nothing. */ () => {
  const pool = new EditEngineItemPool(),
    first = new ContentNode(pool),
    second = new ContentNode(pool);
  const nodes = [first, second];
  const document: EditDocNodePositions = {
    /** Supplies the original prepared paragraph-position lookup. @param node - Source node pointer. @returns Prepared position or original not-found marker. */
    GetPos(node: ContentNode | null): number {
      const index = nodes.indexOf(node as ContentNode);
      return index < 0 ? EE_PARA_MAX : index;
    },
  };
  const selection = new EditSelection(new EditPaM(second, 0), new EditPaM(first, 0)),
    start = selection.Min(),
    end = selection.Max(),
    copy = new EditSelection(selection);
  try {
    selection.Adjust(document);
    expect(selection.Min()).toBe(start);
    expect(selection.Max()).toBe(end);
    expect(start.GetNode()).toBe(first);
    expect(end.GetNode()).toBe(second);
    expect(selection.HasRange()).toBe(true);
    expect(copy.Min().GetNode()).toBe(second);
    selection.assign(new EditPaM(first, 0));
    expect(selection.HasRange()).toBe(false);
    expect(selection.IsInvalid()).toBe(false);
    const zero = new EditSelection();
    expect(zero.IsInvalid()).toBe(true);
  } finally {
    first.dispose();
    second.dispose();
  }
});
