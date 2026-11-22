/** @fileoverview Exercises native Writer page line-spacing, view state, history, and native document carriers. */
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { assert, expect, it } from "vitest";
import { SvxLineSpaceRule } from "../../../editeng/inc/svxenum";
import { SvxLineSpacingItem } from "../../../editeng/inc/lspcitem";
import type { SfxBoolItem } from "../../../svl/inc/eitem";
import { RES_PARATR_LINESPACING, RES_PARATR_REGISTER } from "../../inc/hintids";
import { ComputeRegister } from "../../source/core/layout/pagechg";
import { GetParagraphRegister, GetRegisterLineOffset } from "../../source/core/text/itrform2";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import { createWriterDocumentSession } from "../composition/writer-module";
import { decodeWriterDocument, encodeWriterDocument } from "../filter/xml/writer-document-codec";
import { WriterWorkbench } from "./writer-view";

it("selects and retains a live page register style and enables the current paragraph independently", /** Exercises the real native dialog and preserves the shared style identity. @returns Completion. */ async () => {
  const session = createWriterDocumentSession();
  const shell = session.view.GetWrtShell();
  const document = shell.GetDoc();
  const descriptor = document.GetPageDesc();
  const paragraph = shell.GetActiveParagraph();
  const reference = document.MakeTextFormatColl(
    "Register Reference",
    document.GetDfltTextFormatColl(),
  );
  const fixed = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING);
  fixed.SetLineHeight(500);
  fixed.SetLineSpaceRule(SvxLineSpaceRule.Fix);
  reference.SetFormatAttr(fixed);
  fixed.Dispose();
  try {
    render(<WriterWorkbench view={session.view} isActive />);
    act(
      /** Opens the actual Page Style slot. @returns Nothing. */ () => {
        session.view.Execute(WRITER_COMMAND_IDS.pageDialog);
      },
    );
    const mode = screen.getByRole("checkbox", { name: "Use page line-spacing" });
    const picker = screen.getByRole("combobox", { name: "Reference Style:" });
    expect(mode).not.toBeChecked();
    expect(picker).toBeDisabled();
    fireEvent.click(mode);
    fireEvent.change(picker, { target: { value: "Register Reference" } });
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(
      /** Waits for native Page Style acceptance. @returns Assertion. */ () =>
        expect(descriptor.GetRegisterFormatColl()).toBe(reference),
    );
    expect(ComputeRegister(reference)).toEqual({ height: 500, ascent: 400 });
    expect(GetRegisterLineOffset({ height: 500, ascent: 400, naturalHeight: 288 }, 0, 500)).toBe(
      64,
    );
    expect(GetParagraphRegister(paragraph)).toBeUndefined();
    expect((reference.GetAttrSet().Get(RES_PARATR_REGISTER) as SfxBoolItem).GetValue()).toBe(true);
    act(
      /** Opens the actual Paragraph slot. @returns Nothing. */ () => {
        session.view.Execute(WRITER_COMMAND_IDS.paragraphDialog);
      },
    );
    const participate = screen.getByRole("checkbox", { name: "Activate page line-spacing" });
    expect(participate).toBeEnabled();
    fireEvent.click(participate);
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await waitFor(
      /** Waits for the accepted paragraph item. @returns Assertion. */ () =>
        expect(GetParagraphRegister(paragraph)).toEqual({ height: 500, ascent: 400 }),
    );

    act(
      /** Undoes the two independent document actions. @returns Nothing. */ () => {
        expect(shell.Undo()).toBe(true);
        expect(GetParagraphRegister(paragraph)).toBeUndefined();
        expect(shell.Undo()).toBe(true);
        expect(descriptor.GetRegisterFormatColl()).toBeUndefined();
        expect((reference.GetAttrSet().Get(RES_PARATR_REGISTER) as SfxBoolItem).GetValue()).toBe(
          true,
        );
      },
    );
    act(
      /** Reapplies both native edits and the view-only grid. @returns Nothing. */ () => {
        expect(shell.Redo()).toBe(true);
        expect(shell.Redo()).toBe(true);
        reference.SetFormatName("Renamed Register Reference");
        const modified = session.docShell.IsModified();
        expect(session.view.Execute(WRITER_COMMAND_IDS.toggleBaselineGrid).status).toBe("executed");
        expect(session.docShell.IsModified()).toBe(modified);
      },
    );
    expect(session.view.IsBaselineGridVisible()).toBe(true);
    expect(descriptor.GetRegisterFormatColl()).toBe(reference);
    const title = { title: "Page line-spacing" };
    const odt = await readOdtDocument(await writeOdtDocument(document, title), title);
    const worker = decodeWriterDocument(structuredClone(encodeWriterDocument(document)));
    try {
      for (const copy of [odt.document, worker]) {
        const restored = copy.GetPageDesc().GetRegisterFormatColl();
        expect(restored?.GetName()).toBe("Renamed Register Reference");
        const node = copy.paragraphs[0];
        assert(node);
        expect(GetParagraphRegister(node)).toEqual({ height: 500, ascent: 400 });
      }
    } finally {
      odt.document.Dispose();
      worker.Dispose();
    }
    act(
      /** Removes the reference paragraph style through the owning document. @returns Nothing. */ () => {
        document.DelTextFormatColl(reference);
      },
    );
    expect(descriptor.GetRegisterFormatColl()).toBeUndefined();
  } finally {
    cleanup();
    session.Close();
  }
});
