/** @fileoverview Verifies common native cell alignment and changed-item dialog submission over actual selected owners. */
import { nativeTableInputForTest } from "../../../test/table-box-test-helpers";
import { SwFormatFrameSize, SwFrameSize } from "../../inc/fmtfsize";
import { WriterWorkbench } from "./writer-view";

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterTableDialog } from "./WriterTableDialog";
import { SwFormatVertOrient } from "../../inc/fmtornt";
afterEach(cleanup);
for (const alignment of [0, 2, 3, 65535])
  it(
    "uses common shell alignment and emits only changed valid item " + alignment,
    /** Checks current selected cell state rather than first table cell. @returns Nothing. */ () => {
      const session = createWriterDocumentSession(),
        doc = session.docShell.GetDoc(),
        shell = session.view.GetWrtShell(),
        table = doc.nodes.MakeTableNode("State");
      table.AddColumnWidth(3000);
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(table, 2, {}, [
          { vertOrient: new SwFormatVertOrient(0, 3) },
          { vertOrient: new SwFormatVertOrient(0, alignment === 65535 ? 2 : alignment) },
        ]),
        first = row.GetTabBoxes()[0],
        second = row.GetTabBoxes()[1],
        node = second?.GetParagraphs()[0];
      if (first === undefined || second === undefined || node === undefined)
        throw Error("Missing selected graph");
      shell.FocusNode(node);
      if (alignment === 65535) shell.SelTable();
      expect(shell.GetBoxAlign()).toBe(alignment);
      const submit = vi.fn();
      render(
        <WriterTableDialog
          table={table}
          borderItems={nativeTableInputForTest(table)}
          availableWidth={6000}
          boxAlign={shell.GetBoxAlign()}
          onCancel={vi.fn()}
          onSubmit={submit}
        />,
      );
      fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
      expect(screen.getByRole("combobox", { name: "Cell vertical alignment" })).toHaveValue(
        String(alignment === 65535 ? 0 : alignment),
      );
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(submit.mock.calls[0]?.[0]).not.toHaveProperty("verticalAlign");
      const next = alignment === 3 ? 2 : 3;
      fireEvent.change(screen.getByRole("combobox", { name: "Cell vertical alignment" }), {
        target: { value: String(next) },
      });
      fireEvent.click(screen.getByRole("button", { name: "OK" }));
      expect(submit.mock.calls[1]?.[0].verticalAlign).toBe(next);
      expect(first.GetVertOrient().GetVertOrient()).toBe(3);
      session.Close();
    },
  );

for (const align of [0, 2, 3])
  it(
    "renders native fixed row vertical alignment " + align,
    /** Checks authored fixed frames use safe original text alignment. @returns Nothing. */ () => {
      const session = createWriterDocumentSession(),
        doc = session.docShell.GetDoc(),
        table = doc.nodes.MakeTableNode("FixedAlign", { width: 3000 }, doc.paragraphs[0]);
      table.AddColumnWidth(3000);
      const row = doc.nodes.AppendTableRow(
        table,
        1,
        { frameSize: new SwFormatFrameSize(SwFrameSize.Fixed, 0, 1200) },
        [{ vertOrient: new SwFormatVertOrient(0, align) }],
      );
      const node = row.GetTabBoxes()[0]?.GetParagraphs()[0];
      if (node === undefined) throw Error("Missing native fixed paragraph");
      node.SetText("Native aligned content");
      try {
        render(<WriterWorkbench isActive view={session.view} />);
        const text = screen.getByRole("textbox", { name: "Row 1 column 1 paragraph 1" }),
          frame = text.closest("[data-writer-fixed-row-content]");
        expect(frame).toHaveStyle({
          justifyContent:
            align === 2 ? "safe center" : align === 3 ? "safe flex-end" : "flex-start",
          height: "80px",
        });
        expect(text.closest("td")).toHaveStyle({
          verticalAlign: align === 2 ? "middle" : align === 3 ? "bottom" : "top",
        });
        expect(text).toHaveTextContent("Native aligned content");
      } finally {
        cleanup();
        session.Close();
      }
    },
  );
