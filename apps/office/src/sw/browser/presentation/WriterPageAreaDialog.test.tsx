/** @fileoverview Exercises native Page Style fill and geometry as one document operation. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import { XATTR_FILLCOLOR, XATTR_FILLSTYLE, XATTR_FILLTRANSPARENCE } from "../../../svx/inc/xdef";
import type { XFillStyleItem } from "../../../svx/inc/xfillit0";
import type { XFillColorItem } from "../../../svx/inc/xflclit";
import type { XFillTransparenceItem } from "../../../svx/inc/xfltrit";
import { SwFormatPageDesc } from "../../source/core/attr/fmtpdsc";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { decodeWriterDocument, encodeWriterDocument } from "../filter/xml/writer-document-codec";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";

/** Opens the native Page Style slot and mounts the corresponding typed request. @param session - Actual Writer document. @returns Accepted command promise. */
function open(session: ReturnType<typeof createWriterDocumentSession>) {
  const controller = session.view.GetDialogController();
  const result = session.view.Execute(WRITER_COMMAND_IDS.pageDialog);
  const pending = controller.GetSnapshot();
  if (result.status !== "executed" || pending?.request.kind !== "page-style")
    throw new Error("Missing native Writer Page Style request.");
  render(
    <WriterPageStyleDialog
      initialValue={pending.request.initialValue}
      pageInput={pending.request.pageInput}
      onSubmit={
        /** Completes the actual native request. @param pageDescriptor - Geometry. @param pageItems - Native fill deltas. @returns Nothing. */
        (pageDescriptor, pageItems) => {
          if (!controller.Complete(pending.id, { pageDescriptor, ...(pageItems && { pageItems }) }))
            pageItems?.Dispose();
        }
      }
      onCancel={
        /** Cancels the native page request. @returns Nothing. */
        () => {
          controller.Cancel(pending.id);
        }
      }
    />,
  );
  return result.value;
}

it("applies and reopens the active named page format and undoes geometry and fill together", /** Exercises current-page ownership, cancellation, history, and both document transports. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const doc = shell.GetDoc();
  try {
    const standard = doc.GetPageDesc();
    const alternate = doc.MakePageDesc("Cover Page", standard);
    shell.Insert("Cover");
    shell.GetActiveParagraph().SetAttr(new SwFormatPageDesc(alternate.GetName()));
    const initial = alternate.GetValue();
    const result = open(session);
    expect(
      screen.getAllByRole("tab").map(
        /** Reads accessible upstream tab labels in order. @param tab - Notebook tab. @returns Label. */
        (tab) => tab.textContent,
      ),
    ).toEqual(["Page", "Area", "Transparency"]);
    fireEvent.click(screen.getByRole("radio", { name: "Landscape" }));
    fireEvent.click(screen.getByRole("tab", { name: "Area" }));
    fireEvent.click(screen.getByRole("button", { name: /^Color$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^#ff0000$/ }));
    fireEvent.click(screen.getByRole("tab", { name: "Transparency" }));
    fireEvent.click(screen.getByRole("radio", { name: /^Transparency$/ }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Transparency" }), {
      target: { value: "38" },
    });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await result).toBe(true);

    const alternateItems = alternate.GetMaster().GetAttrSet();
    expect(alternate.GetValue()).toMatchObject({ landscape: true, width: initial.height });
    expect(
      (standard.GetMaster().GetAttrSet().Get(XATTR_FILLSTYLE) as XFillStyleItem).GetValue(),
    ).toBe(FillStyle.NONE);
    expect((alternateItems.Get(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(
      FillStyle.SOLID,
    );
    expect((alternateItems.Get(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem).GetValue()).toBe(
      38,
    );
    expect(shell.Undo()).toBe(true);
    expect(alternate.GetValue()).toEqual(initial);
    expect((alternateItems.Get(XATTR_FILLSTYLE) as XFillStyleItem).GetValue()).toBe(FillStyle.NONE);
    expect(shell.Redo()).toBe(true);
    expect(alternate.GetValue().landscape).toBe(true);

    const metadata = { title: "Page Area" };
    const reopened = await readOdtDocument(await writeOdtDocument(doc, metadata), metadata);
    const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(doc)));
    try {
      for (const copy of [reopened.document, worker]) {
        const owner = copy.FindPageDesc("Cover Page");
        const items = owner?.GetMaster().GetAttrSet();
        expect(owner?.GetLandscape()).toBe(true);
        expect((items?.Get(XATTR_FILLCOLOR) as XFillColorItem).GetColorValue().toUInt32()).toBe(
          0xff0000,
        );
        expect((items?.Get(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem).GetValue()).toBe(38);
      }
    } finally {
      reopened.document.Dispose();
      worker.Dispose();
    }

    cleanup();
    const cancel = open(session);
    fireEvent.click(screen.getByRole("tab", { name: "Transparency" }));
    expect(screen.getByRole("spinbutton", { name: "Transparency" })).toHaveValue(38);
    fireEvent.click(screen.getByRole("radio", { name: "No transparency" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await cancel).toBe(false);
    expect((alternateItems.Get(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem).GetValue()).toBe(
      38,
    );

    cleanup();
    const accept = open(session);
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await accept).toBe(false);
  } finally {
    cleanup();
    session.Close();
  }
});
