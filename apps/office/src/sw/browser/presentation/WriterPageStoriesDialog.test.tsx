/** @fileoverview Exercises Writer native Header and Footer page-style settings and history. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { assert, expect, it } from "vitest";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SwFormatHeader } from "../../inc/fmthdft";
import { SwFrameSize } from "../../inc/fmtfsize";
import { RES_HEADER_FOOTER_EAT_SPACING } from "../../inc/hintids";
import { getActivePageStory, type SwFrameFormat } from "../../source/core/layout/atrfrm";
import { getPageBodyGeometry } from "../../source/core/layout/pagedesc";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { decodeWriterDocument, encodeWriterDocument } from "../filter/xml/writer-document-codec";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";

/** Drives the actual native Page Style request, including its pooled item output. @param session - Actual Writer session. @returns Command completion. */
function open(session: ReturnType<typeof createWriterDocumentSession>) {
  const result = session.view.Execute(WRITER_COMMAND_IDS.pageDialog);
  const controller = session.view.GetDialogController();
  const pending = controller.GetSnapshot();
  if (result.status !== "executed" || pending?.request.kind !== "page-style")
    throw new Error("Missing native Writer Page Style request.");
  render(
    <WriterPageStyleDialog
      initialValue={pending.request.initialValue}
      pageInput={pending.request.pageInput}
      unit={FieldUnit.CM}
      onSubmit={
        /** Completes the native Page Style command. @param pageDescriptor - Page geometry. @param pageItems - Owned native deltas. @returns Nothing. */
        (pageDescriptor, pageItems) => {
          if (!controller.Complete(pending.id, { pageDescriptor, ...(pageItems && { pageItems }) }))
            pageItems?.Dispose();
        }
      }
      onCancel={
        /** Cancels the native request. @returns Nothing. */
        () => {
          controller.Cancel(pending.id);
        }
      }
    />,
  );
  return result.value;
}

/** Gets the native first text paragraph rather than a serialization of a story. @param format - Actual story frame. @returns Connected paragraph. */
function firstText(format: SwFrameFormat | null) {
  const section = format?.GetContent().GetContentIdx()?.GetNode();
  assert(section?.IsStartNode());
  const paragraph = section.GetNodes().GetSectionContent(section)[0]?.GetTextNode();
  assert(paragraph);
  return paragraph;
}

it("activates both native stories and saves their physical attributes as one page style operation", /** Exercises original Writer defaults, body reservation, ODT/Worker persistence and history. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const page = shell.GetDoc().GetPageDesc();
  try {
    const original = getPageBodyGeometry(page);
    const result = open(session);
    fireEvent.click(screen.getByRole("tab", { name: "Header" }));
    expect(screen.getByRole("spinbutton", { name: "Height" })).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Header on" }));
    expect(screen.getByRole("checkbox", { name: "AutoFit height" })).toBeChecked();
    fireEvent.click(screen.getByRole("checkbox", { name: "AutoFit height" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Use dynamic spacing" }));
    const leftMargin = screen.getByRole("spinbutton", { name: "Left margin" });
    fireEvent.change(leftMargin, { target: { value: "1.27" } });
    fireEvent.blur(leftMargin);
    fireEvent.click(screen.getByRole("tab", { name: "Footer" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Footer on" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    const error = screen.queryByRole("alert");
    if (error) throw new Error(error.textContent ?? "Page Style was rejected.");
    expect(await result).toBe(true);

    const header = getActivePageStory(page.GetMaster(), true);
    const footer = getActivePageStory(page.GetMaster(), false);
    assert(header && footer);
    expect(header.GetFrameSize().GetHeight()).toBe(566);
    expect(header.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Fixed);
    expect(header.GetULSpace().GetLower()).toBe(283);
    expect(header.GetLRSpace().ResolveLeft()).toBe(720);
    expect(header.GetAttrSet().Get(RES_HEADER_FOOTER_EAT_SPACING).QueryValue()).toBe(true);
    expect(footer.GetULSpace().GetUpper()).toBe(283);
    expect(footer.GetFrameSize().GetHeightSizeType()).toBe(SwFrameSize.Minimum);
    expect(getActivePageStory(page.GetLeft(), true)).toBe(header);
    expect(getActivePageStory(page.GetFirstMaster(), false)).toBe(footer);
    expect(getPageBodyGeometry(page)).toMatchObject({
      topMargin: original.topMargin + 566,
      bottomMargin: original.bottomMargin + 566,
    });
    expect(shell.Undo()).toBe(true);
    expect(getPageBodyGeometry(page)).toEqual(original);
    expect(shell.Redo()).toBe(true);
    expect(getActivePageStory(page.GetMaster(), true)).toBe(header);

    firstText(header).SetText("Document header");
    firstText(footer).SetText("Document footer");
    const metadata = { title: "Page stories" };
    const saved = await readOdtDocument(await writeOdtDocument(shell.GetDoc(), metadata), metadata);
    const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(shell.GetDoc())));
    try {
      for (const document of [saved.document, worker]) {
        const copy = document.GetPageDesc();
        const copiedHeader = getActivePageStory(copy.GetMaster(), true);
        const copiedFooter = getActivePageStory(copy.GetMaster(), false);
        expect(firstText(copiedHeader).GetText()).toBe("Document header");
        expect(firstText(copiedFooter).GetText()).toBe("Document footer");
        expect(copiedHeader?.GetLRSpace().ResolveLeft()).toBe(720);
        expect(copiedFooter?.GetULSpace().GetUpper()).toBe(283);
      }
    } finally {
      saved.document.Dispose();
      worker.Dispose();
    }
  } finally {
    cleanup();
    session.Close();
  }
});

it("restores an independently written left page header after sharing and confirms deletion", /** Exercises story stashing and the original child confirmation, including cancellation and undo. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const page = shell.GetDoc().GetPageDesc();
  try {
    page.GetMaster().SetFormatAttr(new SwFormatHeader(true));
    page.GetLeft().SetFormatAttr(new SwFormatHeader(true));
    page.ChgHeaderShare(false);
    const master = getActivePageStory(page.GetMaster(), true);
    const left = getActivePageStory(page.GetLeft(), true);
    firstText(master).SetText("Main header");
    firstText(left).SetText("Independent left header");
    const result = open(session);
    fireEvent.click(screen.getByRole("tab", { name: "Header" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Same content on left and right pages" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await result).toBe(true);
    expect(getActivePageStory(page.GetLeft(), true)).toBe(master);

    cleanup();
    const separate = open(session);
    fireEvent.click(screen.getByRole("tab", { name: "Header" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Same content on left and right pages" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Same content on first page" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await separate).toBe(true);
    expect(page.IsFirstShared()).toBe(false);
    expect(getActivePageStory(page.GetLeft(), true)).toBe(left);
    expect(firstText(left).GetText()).toBe("Independent left header");
    const first = getActivePageStory(page.GetFirstMaster(), true);
    expect(first).not.toBe(master);
    expect(firstText(first).GetText()).toBe("Main header");

    cleanup();
    const deletion = open(session);
    fireEvent.click(screen.getByRole("tab", { name: "Header" }));
    fireEvent.click(screen.getByRole("checkbox", { name: "Header on" }));
    const prompt = screen.getByRole("alertdialog", { name: "Delete header?" });
    fireEvent.click(within(prompt).getByRole("button", { name: "No" }));
    expect(screen.getByRole("checkbox", { name: "Header on" })).toBeChecked();
    fireEvent.click(screen.getByRole("checkbox", { name: "Header on" }));
    fireEvent.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Yes" }));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(await deletion).toBe(true);
    expect(getActivePageStory(page.GetMaster(), true)).toBeNull();
    expect(shell.Undo()).toBe(true);
    expect(getActivePageStory(page.GetLeft(), true)).toBe(left);
    expect(firstText(left).GetText()).toBe("Independent left header");
  } finally {
    cleanup();
    session.Close();
  }
});
