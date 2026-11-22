/** @fileoverview Exercises the native Writer page box and shadow through Page Style. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { assert, expect, it } from "vitest";
import {
  SvxBoxItemLine as Side,
  type SvxBoxInfoItem,
} from "../../../editeng/source/items/frmitems";
import type { SvxShadowItem } from "../../../editeng/source/items/frmitems.shadow";
import { SvxShadowLocation } from "../../../editeng/inc/svxenum";
import { SID_ATTR_BORDER_INNER } from "../../../svx/inc/svxids";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { MIN_BORDER_DIST } from "../../inc/swtypes";
import { RES_SHADOW } from "../../inc/hintids";
import { getPageBodyGeometry } from "../../source/core/layout/pagedesc";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { writerPageBorderStyle } from "../editor/frame-decoration";
import { decodeWriterDocument, encodeWriterDocument } from "../filter/xml/writer-document-codec";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";

it("exchanges page borders and shadows with native padding, physical placement, history and storage", /** Exercises the actual Page Style request and both document transports. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const document = shell.GetDoc();
  const page = document.GetPageDesc();
  const controller = session.view.GetDialogController();
  /** Opens the native Page Style command and its Borders tab. @returns Native command completion. */
  function open() {
    const result = session.view.Execute(WRITER_COMMAND_IDS.pageDialog);
    const dialog = controller.GetSnapshot();
    if (result.status !== "executed" || dialog?.request.kind !== "page-style")
      throw new Error("Missing native Page Style request");
    const input = dialog.request.pageInput;
    const info = input.Get(SID_ATTR_BORDER_INNER) as SvxBoxInfoItem;
    expect(info.IsDist()).toBe(true);
    expect(info.IsMinDist()).toBe(false);
    expect(info.GetDefDist()).toBe(MIN_BORDER_DIST);
    render(
      <WriterPageStyleDialog
        initialValue={dialog.request.initialValue}
        pageInput={input}
        unit={FieldUnit.POINT}
        onSubmit={
          /** Completes the original request with the accepted items. @param pageDescriptor - Page geometry. @param pageItems - Owned format delta. @returns Nothing. */
          (pageDescriptor, pageItems) => {
            if (
              !controller.Complete(dialog.id, { pageDescriptor, ...(pageItems && { pageItems }) })
            )
              pageItems?.Dispose();
          }
        }
        onCancel={
          /** Cancels the original request. @returns Nothing. */
          () => {
            controller.Cancel(dialog.id);
          }
        }
      />,
    );
    fireEvent.click(screen.getByRole("tab", { name: "Borders" }));
    return result.value;
  }
  try {
    const initial = getPageBodyGeometry(page);
    const result = open();
    expect(screen.queryByRole("checkbox", { name: "Merge with next paragraph" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "All Four Borders" }));
    const padding = screen.getByRole("spinbutton", { name: /^Left padding/ });
    expect(padding).toHaveValue("1.4 pt");
    fireEvent.change(padding, { target: { value: "0" } });
    fireEvent.blur(padding);
    const shadow = screen.getByRole("combobox", { name: "Position" });
    fireEvent.change(shadow, { target: { value: String(SvxShadowLocation.TopRight) } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await expect(result).resolves.toBe(true);
    const frame = page.GetMaster();
    const box = frame.GetBox();
    expect(box.GetSmallestDistance()).toBe(0);
    const line = box.GetTop();
    assert(line);
    const item = frame.GetAttrSet().Get(RES_SHADOW) as SvxShadowItem;
    const width = item.GetWidth();
    expect(item.GetLocation()).toBe(SvxShadowLocation.TopRight);
    expect(getPageBodyGeometry(page)).toMatchObject({
      topMargin: initial.topMargin + box.CalcLineSpace(Side.TOP, true) + width,
      rightMargin: initial.rightMargin + box.CalcLineSpace(Side.RIGHT, true) + width,
      bottomMargin: initial.bottomMargin + box.CalcLineSpace(Side.BOTTOM, true),
    });
    expect(
      writerPageBorderStyle(document, {
        descriptor: getPageBodyGeometry(page),
        number: 1,
        textFrames: [],
        tableFrames: [],
      }),
    ).toMatchObject({
      top: (initial.topMargin + width) / 15,
      right: (initial.rightMargin + width) / 15,
      bottom: initial.bottomMargin / 15,
      borderTop: expect.stringContaining("solid"),
      boxShadow: expect.stringContaining(`${width / 20}pt ${-width / 20}pt`),
    });
    expect(shell.Undo()).toBe(true);
    expect(getPageBodyGeometry(page)).toEqual(initial);
    expect(page.GetMaster().GetBox().GetTop()).toBeUndefined();
    expect(shell.Redo()).toBe(true);
    expect(page.GetMaster().GetBox().GetTop()?.equals(line)).toBe(true);

    const metadata = { title: "Page borders" };
    const saved = await readOdtDocument(await writeOdtDocument(document, metadata), metadata);
    const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    try {
      for (const restored of [saved.document, worker]) {
        const copy = restored.GetPageDesc().GetMaster();
        expect(copy.GetBox().GetTop()?.equals(line)).toBe(true);
        expect(copy.GetBox().GetSmallestDistance()).toBe(0);
        expect(copy.GetAttrSet().Get(RES_SHADOW).equals(item)).toBe(true);
      }
    } finally {
      saved.document.Dispose();
      worker.Dispose();
    }
    cleanup();
    const cancel = open();
    fireEvent.click(screen.getByRole("button", { name: "No Borders" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(cancel).resolves.toBe(false);
    expect(frame.GetBox().GetTop()?.equals(line)).toBe(true);
  } finally {
    cleanup();
    session.Close();
  }
});
