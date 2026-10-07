/** @fileoverview Verifies real table text sections use Writer cursor, input, history and presentation owners without upstream execution. */
import { describe, expect, it, vi } from "vitest";
import { SwDoc } from "../../core/doc/doc";
import { SwTextNode } from "../../core/txtnode/ndtxt";
import { SwDocShell } from "../app/docsh";

import { SwEditWin } from "../docvw/edtwin";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { WriterViewProjection } from "../../../browser/presentation/writer-view-projection";
import { SwView } from "../uiview/view";

/** Requires an actual owner. @param value - Optional node. @returns Owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing native table fixture");
  return value;
}
/** Creates real adjacent cells and a separate body owner. @returns Graph and edit owners. */
function fixture() {
  const doc = new SwDoc(),
    body = required(doc.paragraphs[0]);
  body.SetText("body");
  const table = doc.nodes.MakeTableNode("Table1", {}, body);
  table.AddColumnWidth(3000);
  table.AddColumnWidth(3000);
  const row = doc.nodes.AppendTableRow(table, 2),
    box = required(row.GetTabBoxes()[0]),
    neighborBox = required(row.GetTabBoxes()[1]);
  const node = required(box.GetParagraphs()[0]),
    neighbor = required(neighborBox.GetParagraphs()[0]);
  node.SetText("abcd");
  neighbor.SetText("neighbor");
  const metadata = createDocument({ id: "native-table", suiteId: "writer", title: "Table" }),
    shell = new SwView(new SwDocShell(doc, metadata)).GetWrtShell(),
    invalidate = vi.fn(),
    edit = new SwEditWin(shell.GetView(), invalidate);
  return { doc, body, table, box, neighborBox, node, neighbor, metadata, shell, edit, invalidate };
}
/** Sets literal actual-node coordinates. @param owner - Fixture. @param offset - Point offset. @param mark - Optional fixed offset. @returns Nothing. */
function select(owner: ReturnType<typeof fixture>, offset: number, mark?: number) {
  expect(
    owner.edit.SetSelection({
      point: { nodeIndex: owner.node.GetIndex(), contentIndex: offset },
      ...(mark === undefined
        ? {}
        : { mark: { nodeIndex: owner.node.GetIndex(), contentIndex: mark } }),
    }),
  ).toBe(true);
}

describe("native table cell editing owners", /** Registers real-owner table editing contracts. @returns Nothing. */ () => {
  it("groups ordinary cell typing and restores its actual cursor through Undo/Redo", /** Checks the common input/history and notification owners. @returns Nothing. */ () => {
    const owner = fixture(),
      { doc, node, shell, edit } = owner,
      insert = vi.spyOn(node, "InsertText");
    select(owner, 2);
    expect(edit.InsertText("X")).toBe(true);
    expect(edit.InsertText("Y")).toBe(true);
    expect(node.GetText()).toBe("abXYcd");
    expect(
      insert.mock.calls.map(
        /** Reads native input modes. @param call - Actual insertion. @returns Mode. */ (call) =>
          call[2],
      ),
    ).toEqual([1, 1]);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(owner.invalidate).toHaveBeenCalledTimes(2);
    expect(edit.Undo()).toBe(true);
    expect(node.GetText()).toBe("abcd");
    expect(shell.GetCursor().GetPoint().GetNode()).toBe(node);
    expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(2);
    expect(edit.Redo()).toBe(true);
    expect(node.GetText()).toBe("abXYcd");
    expect(doc.paragraphs).toEqual([owner.body]);
    expect(owner.neighbor.GetText()).toBe("neighbor");
    shell.Close();
  });
  it.each([false, true])(
    "uses native mode5 for directional cell selection reverse=%s",
    /** Checks raw deletion and selected insertion history. @param reverse - Point before mark. @returns Nothing. */ (
      reverse,
    ) => {
      const owner = fixture(),
        { node, edit, shell } = owner;
      node.SetHyperlink(1, 3, { url: "https://cell.example/" });
      const insert = vi.spyOn(node, "InsertText");
      select(owner, reverse ? 1 : 3, reverse ? 3 : 1);
      expect(edit.ReplaceSelection("XY")).toBe(true);
      expect(node.GetText()).toBe("aXYd");
      expect(insert.mock.calls[0]?.[2]).toBe(5);
      for (let cycle = 0; cycle < 2; cycle++) {
        expect(edit.Undo()).toBe(true);
        expect(node.GetText()).toBe("abcd");
        expect(shell.GetCursor().GetPoint().GetContentIndex()).toBe(reverse ? 1 : 3);
        expect(shell.GetCursor().GetMark().GetContentIndex()).toBe(reverse ? 3 : 1);
        expect(node.GetpSwpHints()?.Count()).toBe(1);
        expect(edit.Redo()).toBe(true);
        expect(node.GetText()).toBe("aXYd");
      }
      shell.Close();
    },
  );
  it("commits composition once through the same cell shell", /** Checks composition owns no transient document mutation. @returns Nothing. */ () => {
    const owner = fixture();
    select(owner, 1);
    owner.edit.StartExtTextInput();
    owner.edit.UpdateExtTextInput("draft");
    owner.edit.UpdateExtTextInput("中");
    expect(owner.node.GetText()).toBe("abcd");
    expect(owner.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    expect(owner.edit.EndExtTextInput()).toBe(true);
    expect(owner.node.GetText()).toBe("a中bcd");
    expect(owner.doc.GetUndoManager().GetUndoActionCount()).toBe(1);
    expect(owner.edit.Undo()).toBe(true);
    expect(owner.node.GetText()).toBe("abcd");
    owner.shell.Close();
  });
  it.each(["backward", "forward"])(
    "reads split/join cell nodes from their section, direction=%s",
    /** Checks structural edit and history update the single node-array owner. @param direction - Join direction. @returns Nothing. */ (
      direction,
    ) => {
      const owner = fixture();
      select(owner, 2);
      expect(owner.edit.SplitNode()).toBe(true);
      const trailing = required(owner.box.GetParagraphs()[1]);
      expect(owner.box.GetParagraphs()).toEqual([owner.node, trailing]);
      expect([owner.node.GetText(), trailing.GetText()]).toEqual(["ab", "cd"]);
      expect(trailing.StartOfSectionNode()).toBe(owner.box.GetStartNode());
      expect(owner.edit.Undo()).toBe(true);
      expect(owner.box.GetParagraphs()).toEqual([owner.node]);
      expect(owner.edit.Redo()).toBe(true);
      expect(owner.box.GetParagraphs()).toEqual([owner.node, trailing]);
      owner.edit.SetSelection({
        point: {
          nodeIndex: direction === "backward" ? trailing.GetIndex() : owner.node.GetIndex(),
          contentIndex: direction === "backward" ? 0 : 2,
        },
      });
      expect(direction === "backward" ? owner.edit.DeleteLeft() : owner.edit.DeleteRight()).toBe(
        true,
      );
      expect(owner.box.GetParagraphs()).toEqual([owner.node]);
      expect(owner.node.GetText()).toBe("abcd");
      expect(owner.edit.Undo()).toBe(true);
      expect(owner.box.GetParagraphs()).toEqual([owner.node, trailing]);
      expect(owner.edit.Redo()).toBe(true);
      expect(owner.box.GetParagraphs()).toEqual([owner.node]);
      expect(owner.neighborBox.GetParagraphs()).toEqual([owner.neighbor]);
      owner.shell.Close();
    },
  );
  it("does not join across table/cell section sentinels", /** Checks body and adjacent cells remain separate. @returns Nothing. */ () => {
    const owner = fixture();
    select(owner, 0);
    expect(owner.edit.DeleteLeft()).toBe(false);
    select(owner, 4);
    expect(owner.edit.DeleteRight()).toBe(false);
    expect(owner.box.GetParagraphs()).toEqual([owner.node]);
    expect(owner.neighborBox.GetParagraphs()).toEqual([owner.neighbor]);
    expect(owner.body.GetText()).toBe("body");
    expect(owner.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    owner.shell.Close();
  });
  it("projects the actual active cell without inserting it in the body layout list", /** Checks immutable presentation identity and formatting ownership. @returns Nothing. */ () => {
    const owner = fixture();
    select(owner, 3);
    const projection = new WriterViewProjection();
    const before = projection.Project(
      owner.doc,
      owner.shell.GetActiveParagraph(),
      owner.shell.GetCursor(),
      owner.metadata,
    );
    expect(before.activeParagraph.nodeIndex).toBe(owner.node.GetIndex());
    expect(before.activeParagraph.text).toBe("abcd");
    expect(before.paragraphs).toHaveLength(1);
    expect(before.textNodes).toHaveLength(3);
    expect(before.cursorSelection.point.paragraphId).toBe(before.activeParagraph.id);
    owner.edit.SetSelection({
      point: { nodeIndex: owner.node.GetIndex(), contentIndex: 3 },
      mark: { nodeIndex: owner.node.GetIndex(), contentIndex: 1 },
    });
    owner.edit.ToggleCharacterFormat("bold");
    const after = projection.Project(
      owner.doc,
      owner.shell.GetActiveParagraph(),
      owner.shell.GetCursor(),
      owner.metadata,
    );
    expect(after.activeParagraph.id).toBe(before.activeParagraph.id);
    expect(
      after.activeParagraph.runs.some(
        /** Finds literal formatted text. @param run - Display portion. @returns Whether the selection is bold. */ (
          run,
        ) => run.text === "bc" && run.attributes.bold === true,
      ),
    ).toBe(true);
    expect(owner.edit.Undo()).toBe(true);
    owner.shell.Close();
  });
  it("retains one text paragraph per cell section when removing nodes", /** Checks actual section guards preserve neighboring owners. @returns Nothing. */ () => {
    const owner = fixture();
    expect(
      /** Attempts removal of the sole cell text. @returns Nothing. */ () =>
        owner.doc.nodes.removeTextNode(owner.node),
    ).toThrow("retain one paragraph");
    expect(owner.box.GetParagraphs()).toEqual([owner.node]);
    expect(owner.neighbor.GetText()).toBe("neighbor");
    expect(owner.doc.paragraphs).toEqual([owner.body]);
    owner.shell.Close();
  });
  it("formats the actual two-paragraph PaM span within a cell and restores history", /** Checks selected text traversal includes both cell nodes. @returns Nothing. */ () => {
    const owner = fixture();
    select(owner, 2);
    owner.edit.SplitNode();
    const trailing = required(owner.box.GetParagraphs()[1]);
    owner.edit.SetSelection({
      point: { nodeIndex: trailing.GetIndex(), contentIndex: 1 },
      mark: { nodeIndex: owner.node.GetIndex(), contentIndex: 1 },
    });
    expect(owner.edit.ToggleCharacterFormat("bold")).toBe(true);
    const projection = new WriterViewProjection(),
      snapshot = projection.Project(owner.doc, trailing, owner.shell.GetCursor(), owner.metadata);
    expect(
      snapshot.textNodes
        .filter(
          /** Finds literal selected bold text. @param node - Display node. @returns Whether it includes bold text. */ (
            node,
          ) =>
            node.runs.some(
              /** Finds the formatted display portion. @param run - Display portion. @returns Whether bold. */ (
                run,
              ) => run.attributes.bold === true,
            ),
        )
        .map(
          /** Reads only literal text. @param node - Display node. @returns Text. */ (node) =>
            node.text,
        ),
    ).toEqual(["ab", "cd"]);
    expect(owner.edit.Undo()).toBe(true);
    expect(owner.box.GetParagraphs()).toEqual([owner.node, trailing]);
    expect(owner.edit.Redo()).toBe(true);
    expect(owner.neighbor.GetText()).toBe("neighbor");
    owner.shell.Close();
  });
  it("requires connected cell owners and retargets content indices within that section", /** Checks membership and successor isolation on real table nodes. @returns Nothing. */ () => {
    const owner = fixture(),
      foreign = fixture();
    expect(
      /** Rejects a cell from another graph. @returns Nothing. */ () =>
        owner.doc.nodes.removeTextNode(foreign.node),
    ).toThrow("another SwNodes");
    const second = owner.doc.nodes.AppendTableCellParagraph(owner.box);
    second.SetText("second");
    const detached = new SwTextNode(
      owner.doc.nodes,
      owner.box.GetStartNode(),
      owner.doc.GetDfltTextFormatColl(),
      "detached",
    );
    expect(
      /** Rejects an unconnected node with the correct section backlink. @returns Nothing. */ () =>
        owner.doc.nodes.removeTextNode(detached),
    ).toThrow("not body content or connected cell text");
    select(owner, 2);
    owner.doc.nodes.removeTextNode(owner.node);
    expect(owner.shell.GetCursor().GetPoint().GetNode()).toBe(second);
    expect(owner.shell.GetCursor().GetPoint().GetContentIndex()).toBe(0);
    expect(owner.box.GetParagraphs()).toEqual([second]);
    expect(owner.neighborBox.GetParagraphs()).toEqual([owner.neighbor]);
    expect(owner.body.GetText()).toBe("body");
    owner.shell.Close();
    foreign.shell.Close();
  });
});
