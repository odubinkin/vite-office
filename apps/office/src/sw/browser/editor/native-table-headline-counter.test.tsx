/** @fileoverview Checks mounted cells use original native headline count rather than transport projections. */
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted UI before original owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires an actual native owner. @param value - Optional owner. @returns Native owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw Error("Missing native headline UI owner");
  return value;
}
it.each([0, 1, 9])(
  "mounted table reads original capped count %s despite stale transport headers",
  /** Checks real cell tags, original nodes and three actual history cycles. @param count - Stored native count. @returns Nothing. */ (
    count,
  ) => {
    const session = createWriterDocumentSession();
    sessions.push(session);
    const doc = session.docShell.GetDoc(),
      shell = session.view.GetWrtShell(),
      table = doc.nodes.MakeTableNode("NativeHeadlineUI", { width: 3000 });
    table.AddColumnWidth(3000);
    const nodes: SwTextNode[] = [];
    for (let index = 0; index < 3; index++) {
      const node = required(
        doc.nodes.AppendTableRow(table, 1).GetTabBoxes()[0]?.GetParagraphs()[0],
      );
      node.SetText("Native owner" + index);
      nodes.push(node);
    }
    table.SetRowsToRepeat(count);
    shell.FocusNode(required(nodes[0]));
    const cursor = shell.GetCursor(),
      rows = [...table.GetTabLines()],
      nativeFormat = table.GetFormat.bind(table);
    vi.spyOn(table, "GetFormat").mockImplementation(
      /** Supplies a deliberately stale explicit transport view while delegating geometry. @returns Detached boundary values. */ () => ({
        ...nativeFormat(),
        headerRows: count === 0 ? 9 : 0,
        repeatHeaderRows: count === 0,
      }),
    );
    const mounted = render(<WriterWorkbench isActive view={session.view} />);
    const assertTags =
      /** Checks original native cells and caps on the actual mounted table. @returns Nothing. */ () => {
        const domTable = required(
          mounted.container.querySelector('table[aria-label="NativeHeadlineUI"]') ?? undefined,
        );
        expect(domTable.querySelectorAll("th")).toHaveLength(Math.min(count, 3));
        expect(domTable.querySelectorAll("td")).toHaveLength(3 - Math.min(count, 3));
        for (let index = 0; index < 3; index++)
          expect(
            screen.getByRole("textbox", { name: `Row ${index + 1} column 1 paragraph 1` }),
          ).toHaveAttribute("data-writer-node-index", String(required(nodes[index]).GetIndex()));
        expect(shell.GetCursor()).toBe(cursor);
        expect(table.GetTabLines()).toEqual(rows);
      };
    assertTags();
    doc.GetUndoManager().Clear();
    // Restore the transport spy before the actual command, which legitimately snapshots native state.
    vi.restoreAllMocks();
    act(
      /** Applies actual table geometry without editing its native headline member. @returns Nothing. */ () => {
        expect(shell.SetTableAttr({ width: 4000 })).toBe(true);
      },
    );
    for (let cycle = 0; cycle < 3; cycle++) {
      act(
        /** Restores original table geometry through represented native history. @returns Nothing. */ () => {
          expect(shell.Undo()).toBe(true);
        },
      );
      assertTags();
      act(
        /** Reapplies actual geometry through represented native history. @returns Nothing. */ () => {
          expect(shell.Redo()).toBe(true);
        },
      );
      assertTags();
    }
    expect(table.GetFormat().headerRows).toBe(count);
    expect(doc.GetUndoManager().GetUndoActionCount()).toBe(1);
  },
);
