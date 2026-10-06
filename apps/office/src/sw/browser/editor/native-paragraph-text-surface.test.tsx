/** @fileoverview Checks native paragraph text stays free of synthetic descriptions in actual body and cell selections. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "../presentation/writer-view";
import { SwPosition } from "../../source/core/crsr/pam";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted native owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Requires an actual fixture owner. @param value - Optional owner. @returns Actual owner. */
function required<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("Missing text-surface owner");
  return value;
}
/** Mounts actual body or multi-paragraph cell text. @param cell - Whether to use a native table cell. @returns Native and DOM owners. */
function fixture(cell: boolean) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    body = required(doc.paragraphs[0]);
  body.SetText(cell ? "Before" : "Alpha");
  let first = body,
    second;
  if (cell) {
    const table = doc.nodes.MakeTableNode("TextSurface", {}, body);
    table.AddColumnWidth(3000);
    table.AddColumnWidth(3000);
    const row = doc.nodes.AppendTableRow(table, 2),
      box = required(row.GetTabBoxes()[0]);
    first = required(box.GetParagraphs()[0]);
    first.SetText("Alpha");
    second = doc.nodes.AppendTableCellParagraph(box);
    second.SetText("Omega");
    required(required(row.GetTabBoxes()[1]).GetParagraphs()[0]).SetText("Neighbor");
  } else second = doc.nodes.MakeTextNode("Omega");
  shell.FocusNode(first);
  doc.GetUndoManager().Clear();
  const mounted = render(
    <WriterWorkbench
      isActive
      view={session.view}
      fileDialogs={session.fileDialogs}
      services={session.services}
    />,
  );
  const firstEditor = screen.getByRole("textbox", {
      name: cell ? "Row 1 column 1 paragraph 1" : "Writer document text",
    }),
    secondEditor = screen.getByRole("textbox", {
      name: cell ? "Row 1 column 1 paragraph 2" : "Writer paragraph 2",
    });
  return { session, doc, shell, first, second, firstEditor, secondEditor, mounted };
}
/** Finds a real native text portion. @param element - Mounted paragraph. @returns Text node. */
function textNode(element: HTMLElement): Node {
  const node = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode();
  if (node === null) throw new Error("Missing native text portion");
  return node;
}
/** Captures an actual cross-paragraph selection in either direction. @param f - Mounted owners. @param reverse - Backward direction. @returns Nothing. */
function select(f: ReturnType<typeof fixture>, reverse: boolean): void {
  const start = textNode(f.firstEditor),
    end = textNode(f.secondEditor);
  window
    .getSelection()
    ?.setBaseAndExtent(
      reverse ? end : start,
      reverse ? 4 : 1,
      reverse ? start : end,
      reverse ? 1 : 4,
    );
  fireEvent(document, new Event("selectionchange"));
}
/** Copies through the actual browser edit window. @param element - Event target. @returns Native clipboard flavors. */
function copy(element: HTMLElement): Map<string, string> {
  const flavors = new Map<string, string>();
  fireEvent.copy(element, {
    clipboardData: {
      /** Retains actual native transfer data. @param type - MIME flavor. @param value - Native serialization. @returns Nothing. */
      setData(type: string, value: string): void {
        flavors.set(type, value);
      },
    },
  });
  return flavors;
}
describe("native paragraph text surface", /** Registers actual model, range and history contracts. @returns Nothing. */ () => {
  it.each(["bullet", "numbered"] as const)(
    "copies native %s cell labels only for complete selected paragraphs",
    /** Checks complete and partial native cell list transfer without synthetic descriptions. @param kind - Native numbering kind. @returns Nothing. */ (
      kind,
    ) => {
      const f = fixture(true),
        cursor = f.shell.GetCursor();
      act(
        /** Assigns native cell list ownership. @returns Nothing. */ () => {
          f.shell.SetParagraphListKind(kind);
        },
      );
      const count = f.doc.GetUndoManager().GetUndoActionCount();
      cursor.Assign(new SwPosition(f.second, 5), new SwPosition(f.first, 0));
      const full = f.shell.CreateTransferable().CreateSelection();
      expect(f.first.GetListKind()).toBe(kind);
      expect(full?.plainText).toBe((kind === "bullet" ? "    •" : "    1.") + " Alpha\nOmega");
      expect(full?.html).toContain(kind === "bullet" ? "<ul" : "<ol");
      expect(full?.html).not.toMatch(/Paragraph style:|Paragraph list:/);
      cursor.Assign(new SwPosition(f.second, 4), new SwPosition(f.first, 1));
      const partial = f.shell.CreateTransferable().CreateSelection();
      expect(partial?.plainText).toBe("lpha\nOmeg");
      expect(partial?.html).not.toMatch(/<ol|<ul/);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(count);
    },
  );
  it("copies actual mixed body and cell nodes in native order while excluding structural nodes", /** Checks a native graph span rather than the body-only paragraph array. @returns Nothing. */ () => {
    const f = fixture(true),
      body = required(f.doc.paragraphs[0]),
      cursor = f.shell.GetCursor();
    cursor.Assign(new SwPosition(f.second, 2), new SwPosition(body, 2));
    expect(f.shell.CreateTransferable().CreateSelection()?.plainText).toBe("fore\nAlpha\nOm");
    cursor.Assign(new SwPosition(body, 2), new SwPosition(f.second, 2));
    expect(f.shell.CreateTransferable().CreateSelection()?.plainText).toBe("fore\nAlpha\nOm");
    expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
  });
  it("retains empty selected native paragraphs and rejects foreign or collapsed ranges", /** Checks native text boundaries and active document ownership without filtering empty paragraphs. @returns Nothing. */ () => {
    const f = fixture(false),
      empty = f.doc.nodes.MakeTextNode(""),
      cursor = f.shell.GetCursor();
    cursor.Assign(new SwPosition(empty, 0), new SwPosition(f.first, 0));
    expect(f.shell.CreateTransferable().CreateSelection()?.plainText).toBe("Alpha\nOmega\n");
    cursor.Assign(new SwPosition(f.first, 0), new SwPosition(f.first, 0));
    expect(f.shell.CreateTransferable().CreateSelection()).toBeUndefined();
    const foreign = createWriterDocumentSession();
    sessions.push(foreign);
    const node = required(foreign.docShell.GetDoc().paragraphs[0]);
    node.SetText("Foreign");
    cursor.Assign(new SwPosition(node, 2), new SwPosition(node, 0));
    expect(f.shell.CreateTransferable().CreateSelection()).toBeUndefined();
  });
  it.each([
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ] as const)(
    "keeps body/cell=%s reverse=%s text and native offsets without metadata",
    /** Checks actual cross-paragraph text and native clipboard. @param cell - Cell context. @param reverse - Selection direction. @returns Nothing. */ (
      cell,
      reverse,
    ) => {
      const f = fixture(cell);
      select(f, reverse);
      expect(window.getSelection()?.toString()).toBe("lphaOmeg");
      const cursor = f.shell.GetCursor();
      expect(cursor.GetPoint().GetNode()).toBe(reverse ? f.first : f.second);
      expect(cursor.GetPoint().GetContentIndex()).toBe(reverse ? 1 : 4);
      expect(cursor.GetMark().GetNode()).toBe(reverse ? f.second : f.first);
      expect(cursor.GetMark().GetContentIndex()).toBe(reverse ? 4 : 1);
      for (const element of [f.firstEditor, f.secondEditor]) {
        expect(element).not.toHaveAttribute("aria-describedby");
        expect(element).not.toHaveAccessibleDescription();
      }
      expect(f.mounted.container.querySelector('[id^="writer-paragraph-style-"]')).toBeNull();
      const flavors = copy(f.secondEditor);
      expect(flavors.get("text/plain")).toBe("lpha\nOmeg");
      expect(flavors.get("text/html")).not.toMatch(/Paragraph style:|Paragraph list:/);
      expect(f.doc.GetUndoManager().GetUndoActionCount()).toBe(0);
    },
  );
  it.each(["ctrlKey", "metaKey"] as const)(
    "%s selects actual cell paragraphs then replaces through native history",
    /** Checks keyboard command, replacement and existing neighbors. @param modifier - Platform modifier. @returns Nothing. */ (
      modifier,
    ) => {
      const f = fixture(true);
      window
        .getSelection()
        ?.setBaseAndExtent(textNode(f.secondEditor), 2, textNode(f.secondEditor), 2);
      fireEvent.keyDown(f.secondEditor, { key: "a", [modifier]: true });
      expect(window.getSelection()?.toString()).toBe("AlphaOmega");
      expect(f.shell.GetCursor().GetMark().GetNode()).toBe(f.first);
      expect(f.shell.GetCursor().GetPoint().GetNode()).toBe(f.second);
      expect(copy(f.secondEditor).get("text/plain")).toBe("Alpha\nOmega");
      act(
        /** Replaces the native cell range. @returns Nothing. */ () => {
          expect(f.shell.Insert("Replacement")).toBe(true);
        },
      );
      expect(f.first.GetText()).toBe("Replacement");
      expect(screen.queryByRole("textbox", { name: "Row 1 column 1 paragraph 2" })).toBeNull();
      expect(screen.getByRole("textbox", { name: "Row 1 column 2 paragraph 1" })).toHaveTextContent(
        "Neighbor",
      );
      act(
        /** Restores the original native paragraphs. @returns Nothing. */ () => {
          f.shell.Undo();
        },
      );
      expect(f.first.GetText()).toBe("Alpha");
      expect(f.second.GetText()).toBe("Omega");
      act(
        /** Replays the native replacement. @returns Nothing. */ () => {
          f.shell.Redo();
        },
      );
      expect(f.first.GetText()).toBe("Replacement");
      expect(screen.getByRole("textbox", { name: "Writer document text" })).toHaveTextContent(
        "Before",
      );
    },
  );
  it("keeps formatting controls, labels and history separate from accessible text", /** Checks actual style/list changes preserve native identity without helper nodes. @returns Nothing. */ () => {
    const f = fixture(false),
      id = f.firstEditor.getAttribute("data-writer-paragraph-id");
    act(
      /** Applies actual native formatting. @returns Nothing. */ () => {
        f.shell.SetParagraphStyle("heading-1");
        f.shell.SetParagraphListKind("numbered");
      },
    );
    expect(f.firstEditor).toHaveAttribute("data-writer-paragraph-id", id);
    expect(f.firstEditor).toHaveStyle({ fontSize: "18pt", fontWeight: "700" });
    expect(screen.getByLabelText("Paragraph style")).toHaveValue("heading-1");
    expect(screen.getByTestId("writer-list-marker-" + id)).toHaveTextContent("1.");
    select(f, false);
    expect(window.getSelection()?.toString()).toBe("lphaOmeg");
    expect(f.firstEditor).not.toHaveAccessibleDescription();
    act(
      /** Restores original formatting through native history. @returns Nothing. */ () => {
        f.shell.Undo();
        f.shell.Undo();
      },
    );
    expect(f.firstEditor).toHaveAttribute("data-style", "default");
    expect(screen.queryByTestId("writer-list-marker-" + id)).toBeNull();
    act(
      /** Replays the same formatting owners. @returns Nothing. */ () => {
        f.shell.Redo();
        f.shell.Redo();
      },
    );
    expect(f.firstEditor).toHaveAttribute("data-style", "heading-1");
    expect(screen.getByTestId("writer-list-marker-" + id)).toHaveTextContent("1.");
    expect(f.first.GetText()).toBe("Alpha");
    expect(f.second.GetText()).toBe("Omega");
  });
});
