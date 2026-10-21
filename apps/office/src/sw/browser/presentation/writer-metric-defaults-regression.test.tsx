/** @fileoverview Checks metric defaults and Options transport through actual Writer owners and browser persistence. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WRITER_LAYOUT_PREFERENCES_KEY } from "../storage/writer-layout-preferences-store";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { SwTableHeightDlg } from "../../source/ui/table/rowht";
import { WriterWorkbench } from "./writer-view";
import { WriterAdvancedFormattingControls } from "./WriterAdvancedFormattingControls";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";
import { WriterRowHeightDialog } from "./WriterRowHeightDialog";

afterEach(cleanup);

it("uses the default row-height unit and millimetre page geometry with real physical drafts", /** Checks standalone dialog defaults and supported alternate-unit transport. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    doc = session.docShell.GetDoc(),
    shell = session.view.GetWrtShell(),
    table = shell.InsertTable({ mnInsMode: 0, mnRowsToRepeat: 0 }, 1, 1),
    node = table?.GetTabLines()[0]?.GetTabBoxes()[0]?.GetParagraphs()[0];
  if (node === undefined) throw new Error("Missing actual inserted row");
  try {
    shell.FocusNode(node);
    const draft = new SwTableHeightDlg(shell);
    render(<WriterRowHeightDialog draft={draft} onCancel={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByRole("spinbutton", { name: "Height (cm)" })).toBeInTheDocument();
    cleanup();
    const submit = vi.fn();
    render(
      <WriterPageStyleDialog
        unit={FieldUnit.MM}
        initialValue={doc.GetPageDesc().GetValue()}
        onCancel={vi.fn()}
        onSubmit={submit}
      />,
    );
    fireEvent.change(screen.getByRole("spinbutton", { name: "Left (mm)" }), {
      target: { value: "25.4 mm" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(submit).toHaveBeenCalledWith(expect.objectContaining({ leftMargin: 1440 }));
    cleanup();
    render(
      <WriterAdvancedFormattingControls
        commandSource={createBrowserCommandSource(session.view.GetViewFrame())}
        getCommandResource={getWriterCommandResource}
        paragraph={session.viewStore.GetSnapshot().activeParagraph.computedStyle}
        onDialogCancel={vi.fn()}
        onDialogSubmit={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  } finally {
    cleanup();
    session.Close();
  }
});

it("opens native Options from the mounted frame and persists accepted module units", /** Checks native item exchange,actual frame command and real browser preference storage. @returns Nothing. */ () => {
  const previous = localStorage.getItem(WRITER_LAYOUT_PREFERENCES_KEY),
    session = createWriterDocumentSession(),
    module = session.view.GetModule(),
    metric = module.GetMetric(false);
  try {
    module.ApplyUserMetric(FieldUnit.CM, false);
    render(<WriterWorkbench isActive view={session.view} services={session.services} />);
    act(
      /** Dispatches the actual registered browser dialog slot. @returns Nothing. */ () => {
        session.view.Execute(WRITER_COMMAND_IDS.optionsDialog);
      },
    );
    expect(screen.getByRole("dialog", { name: "Options" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Measurement unit" }), {
      target: { value: String(FieldUnit.INCH) },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(module.GetMetric(false)).toBe(FieldUnit.INCH);
    expect(JSON.parse(localStorage.getItem(WRITER_LAYOUT_PREFERENCES_KEY) as string)).toMatchObject(
      { "Other/MeasureUnit": FieldUnit.INCH },
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog", { name: "Options" })).toBeNull();
  } finally {
    cleanup();
    module.ApplyUserMetric(metric, false);
    session.Close();
    if (previous === null) localStorage.removeItem(WRITER_LAYOUT_PREFERENCES_KEY);
    else localStorage.setItem(WRITER_LAYOUT_PREFERENCES_KEY, previous);
  }
});
