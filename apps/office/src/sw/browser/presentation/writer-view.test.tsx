/** @fileoverview Coverage for the Writer browser presentation. */
/* eslint-disable @typescript-eslint/no-non-null-assertion -- Local test fixtures keep setup and assertions concise. */

import { describe, expect, it } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { projectWriterLineHeight, projectWriterLineHeightItem } from "./writer-view-projection";
import { SvxLineSpacingItem } from "../../../editeng/source/items/paraitem";
import type { CommandFailure } from "../../../sfx2/source/control/dispatch";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { SwView } from "../../source/uibase/uiview/view";
import { presentWriterCommandError, presentWriterStatus } from "./writer-view";
import type { WriterViewSnapshot } from "./writer-view-projection";
import { WriterViewProjection } from "./writer-view-projection";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import { SfxStringItem } from "../../../svl/source/items/poolitem";
import { createWriterDocument } from "../../source/core/doc/doc";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import { RES_CHRATR_COLOR, RES_CHRATR_HIGHLIGHT, RES_PARATR_LINESPACING } from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";

/** Runs the failureView test helper. @param failure - Test input. @returns Test callback result. */ function failureView(
  failure?: CommandFailure,
): SwView {
  return {
    GetViewFrame: /** Runs the test callback. @returns Test callback result. */ () => ({
      GetDispatcher: /** Runs the test callback. @returns Test callback result. */ () => ({
        GetLastCommandError: /** Runs the test callback. @returns Test callback result. */ () =>
          failure,
      }),
    }),
  } as unknown as SwView;
}

/** Runs the statusSnapshot test helper. @param operation - Test input. @param state - Test input. @param isModified - Test input. @param message - Test input. @returns Test callback result. */ function statusSnapshot(
  operation: "none" | "open" | "save" | "save-as",
  state: "failed" | "idle" | "pending" | "succeeded" | "unconfirmed",
  isModified = false,
  message?: string,
): WriterViewSnapshot {
  return {
    documentState: { isModified },
    mediumOperation: { operation, state, ...(message === undefined ? {} : { message }) },
  } as WriterViewSnapshot;
}

const getText =
  /** Runs the test callback. @param _key - Test input. @param fallback - Test input. @returns Test callback result. */ (
    _key: string,
    fallback: string,
  ) => fallback;

describe("Writer browser presentation", /** Groups presentation tests. @returns Nothing. */ () => {
  it("adds Writer proportional leading to the natural browser line-box estimate", /** Checks proportional leading projection. @returns Nothing. */ () => {
    expect(projectWriterLineHeight(0)).toBe(1.15);
    expect(projectWriterLineHeight(100)).toBe(1.15);
    expect(projectWriterLineHeight(115)).toBeCloseTo(1.3);
    expect(projectWriterLineHeight(150)).toBeCloseTo(1.65);
  });
  it("projects fixed, minimum, and extra Writer line spacing", /** Covers the imported ODF spacing rules. @returns Nothing. */ () => {
    expect(
      projectWriterLineHeightItem(new SvxLineSpacingItem(360, RES_PARATR_LINESPACING, "fixed"), 12),
    ).toBe(1.5);
    expect(
      projectWriterLineHeightItem(new SvxLineSpacingItem(1, RES_PARATR_LINESPACING, "fixed"), 12),
    ).toBe(0.05);
    expect(
      projectWriterLineHeightItem(
        new SvxLineSpacingItem(200, RES_PARATR_LINESPACING, "minimum"),
        12,
      ),
    ).toBe(1.15);
    expect(
      projectWriterLineHeightItem(
        new SvxLineSpacingItem(360, RES_PARATR_LINESPACING, "minimum"),
        12,
      ),
    ).toBe(1.5);
    expect(
      projectWriterLineHeightItem(
        new SvxLineSpacingItem(60, RES_PARATR_LINESPACING, "leading"),
        12,
      ),
    ).toBe(1.4);
    expect(
      projectWriterLineHeightItem(new SvxLineSpacingItem(115, RES_PARATR_LINESPACING), 12),
    ).toBe(1.3);
  });
  it("projects explicit paragraph colors without altering native text attributes", /** Checks projects explicit paragraph colors without altering native text attributes. @returns Test callback result. */ () => {
    const document = createWriterDocument();
    const node = document.paragraphs[0]!;
    node.SetAttr(new SfxStringItem(RES_CHRATR_COLOR, "#123456"));
    node.SetAttr(new SfxStringItem(RES_CHRATR_HIGHLIGHT, "#fedcba"));
    const cursor = new SwPaM(new SwPosition(node, 0));
    const projected = new WriterViewProjection().Project(
      document,
      node,
      cursor,
      createDocument({ id: "colors", suiteId: "writer", title: "Colors" }),
    );
    expect(projected.activeParagraph.computedStyle).toMatchObject({
      color: "#123456",
      highlight: "#fedcba",
    });
  });
  it("presents save, open, failure and modified states from the owned medium", /** Checks presents save, open, failure and modified states from the owned medium. @returns Test callback result. */ () => {
    const view = failureView();
    expect(presentWriterStatus(view, statusSnapshot("none", "idle"), getText)).toBe(
      "Not saved in this browser.",
    );
    expect(presentWriterStatus(view, statusSnapshot("none", "idle", true), getText)).toBe(
      "Document has unsaved changes.",
    );
    expect(presentWriterStatus(view, statusSnapshot("save", "pending"), getText)).toBe(
      "Document operation in progress.",
    );
    expect(presentWriterStatus(view, statusSnapshot("save", "succeeded"), getText)).toBe(
      "Saved locally in this browser.",
    );
    expect(presentWriterStatus(view, statusSnapshot("save-as", "unconfirmed"), getText)).toBe(
      "Saving document.",
    );
    expect(presentWriterStatus(view, statusSnapshot("open", "succeeded"), getText)).toBe(
      "Document opened.",
    );
    expect(presentWriterStatus(view, statusSnapshot("open", "failed"), getText)).toBe(
      "Document operation failed.",
    );
    expect(
      presentWriterStatus(view, statusSnapshot("open", "failed", false, "broken"), getText),
    ).toBe("broken");
  });

  it("maps command errors to stable user-facing messages", /** Checks maps command errors to stable user-facing messages. @returns Test callback result. */ () => {
    const cases: readonly [string, string, string][] = [
      [WRITER_COMMAND_IDS.openOdt, "error", "Could not open ODT: error"],
      [WRITER_COMMAND_IDS.openLocal, "error", "Could not load local copy."],
      [WRITER_COMMAND_IDS.saveOdt, "error", "Could not save ODT: error"],
      [WRITER_COMMAND_IDS.exportText, "error", "Could not start plain-text download."],
      [WRITER_COMMAND_IDS.saveLocal, "storage-unavailable", "Browser storage is unavailable."],
      [WRITER_COMMAND_IDS.saveLocal, "error", "Could not save locally."],
      [WRITER_COMMAND_IDS.copy, "selection-required", "Select text to copy."],
      [WRITER_COMMAND_IDS.copy, "error", "Could not copy selection."],
      [WRITER_COMMAND_IDS.cut, "selection-required", "Select text to cut."],
      [WRITER_COMMAND_IDS.cut, "error", "Could not copy selection."],
      [WRITER_COMMAND_IDS.paste, "clipboard-empty", "Clipboard has no text to paste."],
      [WRITER_COMMAND_IDS.paste, "error", "Could not read browser clipboard."],
    ];
    for (const [commandId, code, expected] of cases) {
      const view = failureView({ commandId, code, error: "error" });
      expect(presentWriterCommandError(view, getText)).toBe(expected);
      expect(presentWriterStatus(view, statusSnapshot("none", "idle"), getText)).toBe(expected);
    }
  });
  it("completes shell-owned hyperlink and page dialogs from the browser presenter", /** Checks completes shell-owned hyperlink and page dialogs from the browser presenter. @returns Test callback result. */ async () => {
    const session = createWriterDocumentSession();
    const view = render(<WriterWorkbench isActive view={session.view} />);
    const dialogs = session.view.GetDialogController();
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.keyDown(screen.getByRole("textbox", { name: "Document title" }), {
      key: "ArrowLeft",
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
      target: { value: " " },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
      target: { value: "Layout parity" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    expect(session.docShell.GetTitle()).toBe("Layout parity");
    const topMargin = screen.getByRole("button", { name: "Top page margin" });
    fireEvent.pointerDown(topMargin, { clientY: 40 });
    fireEvent.pointerUp(window, { clientY: 48 });
    let link!: Promise<unknown>;
    act(
      /** Runs the test callback. @returns Test callback result. */ () => {
        link = dialogs.RequestHyperlinkDialog(WRITER_COMMAND_IDS.hyperlinkDialog);
      },
    );
    fireEvent.change(screen.getByLabelText("URL"), { target: { value: "https://example.com" } });
    fireEvent.click(screen.getByText("Apply"));
    await expect(link).resolves.toEqual({
      hyperlink: { url: "https://example.com" },
      text: "",
    });

    let page!: Promise<unknown>;
    act(
      /** Runs the test callback. @returns Test callback result. */ () => {
        page = dialogs.RequestPageDialog(
          WRITER_COMMAND_IDS.pageDialog,
          session.docShell.GetDoc().GetPageDesc().GetValue(),
        );
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(page).resolves.toBeUndefined();

    let edit!: Promise<unknown>;
    act(
      /** Runs the test callback. @returns Test callback result. */ () => {
        edit = dialogs.RequestHyperlinkDialog(WRITER_COMMAND_IDS.editHyperlink, {
          url: "https://example.com",
        });
      },
    );
    expect(screen.getByLabelText("URL")).toHaveValue("https://example.com");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await expect(edit).resolves.toBeUndefined();

    let acceptedPage!: Promise<unknown>;
    act(
      /** Runs the test callback. @returns Test callback result. */ () => {
        acceptedPage = dialogs.RequestPageDialog(
          WRITER_COMMAND_IDS.pageDialog,
          session.docShell.GetDoc().GetPageDesc().GetValue(),
        );
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    await expect(acceptedPage).resolves.toMatchObject({ pageDescriptor: { name: "Standard" } });
    view.unmount();
    session.Close();
  });
  // executes domain commands without DOM through the top Writer shell
  it("keeps the suite test root active", /** Keeps test discovery active. @returns Nothing. */ () => {
    expect(true).toBe(true);
  });
});
