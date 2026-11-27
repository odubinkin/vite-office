/** @fileoverview Exercises the native paragraph Area and Transparency lanes through the Writer command. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { SvxBrushItem } from "../../../editeng/inc/brushitem";
import { FillStyle } from "../../../offapi/com/sun/star/drawing/FillStyle";
import { XATTR_FILLCOLOR, XATTR_FILLTRANSPARENCE } from "../../../svx/inc/xdef";
import { XFillColorItem } from "../../../svx/inc/xflclit";
import { XFillStyleItem } from "../../../svx/inc/xfillit0";
import { XFillTransparenceItem } from "../../../svx/inc/xfltrit";
import { Color } from "../../../tools/inc/color";
import { RES_BACKGROUND } from "../../inc/hintids";
import { writerParagraphBackgroundColor } from "../../source/core/attr/swatrset";
import { SwPosition } from "../../source/core/crsr/pam";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { decodeWriterDocument, encodeWriterDocument } from "../filter/xml/writer-document-codec";
import { WriterParagraphDialog } from "./WriterParagraphDialog";

/** Opens the ordinary native Paragraph command and renders its actual request. @param session - Existing Writer session. @returns Command completion. */
function open(session: ReturnType<typeof createWriterDocumentSession>) {
  const controller = session.view.GetDialogController();
  const result = session.view.Execute(WRITER_COMMAND_IDS.paragraphDialog);
  const pending = controller.GetSnapshot();
  if (result.status !== "executed" || pending?.request.kind !== "paragraph")
    throw new Error("Missing native paragraph request.");
  render(
    <WriterParagraphDialog
      dialogRequest={{ id: pending.id, request: pending.request }}
      fontSizePt={12}
      onDialogSubmit={
        /** Applies the real native request result. @param id - Dialog identity. @param value - Actual edit. @returns Nothing. */
        (id, value) => {
          controller.Complete(id, value);
        }
      }
      onDialogCancel={
        /** Cancels the actual request. @param id - Dialog identity. @returns Nothing. */
        (id) => {
          controller.Cancel(id);
        }
      }
    />,
  );
  return result.value;
}

it("applies palette color and uniform transparency with one undo and reopens both native values", /** Ports the native Area color and 51-percent transparency reopen path. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  try {
    shell.Insert("Painted paragraph");
    const node = shell.GetActiveParagraph();
    const result = open(session);
    fireEvent.click(screen.getByRole("tab", { name: "Area" }));
    fireEvent.click(screen.getByRole("button", { name: /^Color$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Red$/ }));
    fireEvent.click(screen.getByRole("tab", { name: "Transparency" }));
    fireEvent.click(screen.getByRole("radio", { name: /^Transparency$/ }));
    const percent = screen.getByRole("spinbutton", { name: "Transparency" });
    expect(percent).toHaveValue(50);
    fireEvent.change(percent, { target: { value: "51" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await result).toBe(true);
    expect(writerParagraphBackgroundColor(node.GetSwAttrSet())).toBe("rgba(255, 0, 0, 0.49)");
    expect(shell.Undo()).toBe(true);
    expect(writerParagraphBackgroundColor(node.GetSwAttrSet())).toBe("transparent");
    expect(shell.Redo()).toBe(true);
    expect(writerParagraphBackgroundColor(node.GetSwAttrSet())).toBe("rgba(255, 0, 0, 0.49)");

    // The ordinary Worker handoff and ODT automatic style retain the same pooled item values.
    const workerDoc = decodeWriterDocument(structuredClone(encodeWriterDocument(shell.GetDoc())));
    const metadata = { title: "Area fill" };
    const saved = await readOdtDocument(await writeOdtDocument(shell.GetDoc(), metadata), metadata);
    try {
      for (const restored of [workerDoc, saved.document]) {
        const paragraph = restored.paragraphs[0];
        expect(
          (paragraph?.GetAttr(XATTR_FILLCOLOR) as XFillColorItem).GetColorValue().toUInt32(),
        ).toBe(0xff0000);
        expect(
          (paragraph?.GetAttr(XATTR_FILLTRANSPARENCE) as XFillTransparenceItem).GetValue(),
        ).toBe(51);
      }
    } finally {
      workerDoc.Dispose();
      saved.document.Dispose();
    }
    cleanup();
    const reopen = open(session);
    fireEvent.click(screen.getByRole("tab", { name: "Area" }));
    expect(screen.getByRole("button", { name: /^Red$/ })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("tab", { name: "Transparency" }));
    expect(screen.getByRole("radio", { name: /^Transparency$/ })).toBeChecked();
    expect(screen.getByRole("spinbutton", { name: "Transparency" })).toHaveValue(51);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(await reopen).toBe(false);
  } finally {
    cleanup();
    session.Close();
  }
});

it("applies a uniform override to mixed paragraphs while retaining each solid or legacy color", /** Covers mixed input and explicit none through the real Writer selection and history. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  try {
    shell.Insert("Legacy");
    shell.SplitNode();
    shell.Insert("Drawing fill");
    const [first, second] = shell.GetDoc().paragraphs;
    if (!first || !second) throw new Error("Missing test paragraphs.");
    first.SetAttr(new SvxBrushItem(new Color(0x007d22), RES_BACKGROUND));
    const inherited = shell.GetDoc().MakeTextFormatColl("Colored paragraphs");
    inherited.SetFormatAttr(new XFillStyleItem(FillStyle.SOLID));
    inherited.SetFormatAttr(new XFillColorItem("", new Color(0x2233aa)));
    inherited.SetFormatAttr(new XFillTransparenceItem(37));
    second.ChgFormatColl(inherited, false);
    const start = new SwPosition(first, 0);
    const end = new SwPosition(second, second.Len());
    shell.SetPaM(end, start);
    start.Dispose();
    end.Dispose();

    const result = open(session);
    fireEvent.click(screen.getByRole("tab", { name: "Transparency" }));
    expect(screen.getByRole("radio", { name: /^No transparency$/ })).not.toBeChecked();
    fireEvent.click(screen.getByRole("radio", { name: /^Transparency$/ }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await result).toBe(true);
    expect(writerParagraphBackgroundColor(first.GetSwAttrSet())).toBe("rgba(0, 125, 34, 0.5)");
    expect(writerParagraphBackgroundColor(second.GetSwAttrSet())).toBe("rgba(34, 51, 170, 0.5)");
    const metadata = { title: "Legacy and inherited fills" };
    const saved = await readOdtDocument(await writeOdtDocument(shell.GetDoc(), metadata), metadata);
    try {
      const [oldBrush, solid] = saved.document.paragraphs;
      expect(oldBrush && writerParagraphBackgroundColor(oldBrush.GetSwAttrSet())).toBe(
        "rgba(0, 125, 34, 0.5)",
      );
      expect(solid && writerParagraphBackgroundColor(solid.GetSwAttrSet())).toBe(
        "rgba(34, 51, 170, 0.5)",
      );
    } finally {
      saved.document.Dispose();
    }

    cleanup();
    const clear = open(session);
    fireEvent.click(screen.getByRole("tab", { name: "Area" }));
    fireEvent.click(screen.getByRole("button", { name: /^None$/ }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await clear).toBe(true);
    expect(writerParagraphBackgroundColor(first.GetSwAttrSet())).toBe("transparent");
    expect(writerParagraphBackgroundColor(second.GetSwAttrSet())).toBe("transparent");
    expect(shell.Undo()).toBe(true);
    expect(writerParagraphBackgroundColor(first.GetSwAttrSet())).toBe("rgba(0, 125, 34, 0.5)");
  } finally {
    cleanup();
    session.Close();
  }
});
