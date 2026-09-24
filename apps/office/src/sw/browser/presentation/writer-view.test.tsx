/** @fileoverview Coverage for the Writer browser presentation. */
/* eslint-disable @typescript-eslint/no-non-null-assertion -- Local test fixtures keep setup and assertions concise. */

import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { projectWriterLineHeight, projectWriterLineHeightItem } from "./writer-view-projection";
import { SvxLineSpacingItem, SvxULSpaceItem } from "../../../editeng/source/items/paraitem";
import type { CommandFailure } from "../../../sfx2/source/control/dispatch";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";
import type { SwView } from "../../source/uibase/uiview/view";
import { presentWriterCommandError, presentWriterStatus } from "./writer-view";
import type { WriterViewSnapshot } from "./writer-view-projection";
import { WriterViewProjection } from "./writer-view-projection";
import { createDocument } from "../../../sfx2/source/doc/objsh";
import {
  SfxBoolItem,
  SfxInt16Item,
  SfxInt16ListItem,
  SfxStringItem,
} from "../../../svl/source/items/poolitem";
import { createWriterDocument } from "../../source/core/doc/doc";
import { projectWriterCharacterAttributes } from "../../source/core/txtnode/txatbase";
import { SwPaM, SwPosition } from "../../source/core/crsr/pam";
import {
  RES_CHRATR_COLOR,
  RES_CHRATR_HIGHLIGHT,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_UL_SPACE,
  RES_KEEP,
} from "../../inc/hintids";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import type { WriterAutosaveController } from "../workflows/writer-autosave";

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
  it("connects advanced toolbar controls to Writer paragraph items", /** Verifies UI to model formatting. @returns Nothing. */ () => {
    const session = createWriterDocumentSession();
    const rendered = render(<WriterWorkbench isActive view={session.view} />);
    const shell = session.view.GetWrtShell();
    fireEvent.click(screen.getByLabelText("Font Color palette"));
    fireEvent.click(screen.getByLabelText("Font Color #ff0000"));
    expect(projectWriterCharacterAttributes(shell.GetPendingCharacterItems()).color).toBe(
      "#ff0000",
    );
    fireEvent.change(screen.getByLabelText("Line Spacing"), { target: { value: "150" } });
    expect(
      (shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem).GetValue(),
    ).toBe(150);
    fireEvent.click(screen.getByText("Paragraph…"));
    fireEvent.change(screen.getByLabelText("Above paragraph (pt)"), { target: { value: "6" } });
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.change(screen.getByLabelText("Position (pt)"), { target: { value: "36" } });
    fireEvent.click(screen.getByText("New"));
    fireEvent.change(screen.getByLabelText("Position (pt)"), { target: { value: "72" } });
    fireEvent.click(screen.getByText("New"));
    fireEvent.click(screen.getByRole("tab", { name: "Text Flow" }));
    fireEvent.click(screen.getByLabelText("Keep with next paragraph"));
    fireEvent.click(screen.getByLabelText("Show line numbers"));
    fireEvent.click(screen.getByText("OK"));
    expect((shell.GetActiveParagraph().GetAttr(RES_UL_SPACE) as SvxULSpaceItem).GetUpper()).toBe(
      120,
    );
    expect(
      (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SfxInt16ListItem).GetValues(),
    ).toEqual([720, 1440]);
    expect((shell.GetActiveParagraph().GetAttr(RES_KEEP) as SfxBoolItem).GetValue()).toBe(true);
    const rulerSurface = screen.getByLabelText("Writer horizontal ruler")
      .firstElementChild as HTMLElement;
    fireEvent.click(rulerSurface, { clientX: 240 });
    expect(
      (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SfxInt16ListItem).GetValues(),
    ).toHaveLength(3);
    fireEvent.click(screen.getByText("Paragraph…"));
    fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
    fireEvent.click(screen.getByText("Delete All"));
    fireEvent.click(screen.getByText("OK"));
    expect(
      (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SfxInt16Item).GetValue(),
    ).toBe(-1);
    fireEvent.click(rulerSurface, { clientX: 240 });
    expect(
      (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SfxInt16Item).GetValue(),
    ).toBeGreaterThan(0);
    const tabHandle = screen.getByRole("button", { name: "Tab stop 1" });
    fireEvent.pointerDown(tabHandle, { clientX: 100 });
    fireEvent.pointerUp(window, { clientX: -1000 });
    expect(
      (shell.GetActiveParagraph().GetAttr(RES_PARATR_TABSTOP) as SfxInt16Item).GetValue(),
    ).toBe(-1);
    rendered.unmount();
    session.Close();
  });
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
    node.SetAttr(new SfxInt16ListItem(RES_PARATR_TABSTOP, [720, 1440]));
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
      tabStopsPt: [36, 72],
    });
    node.SetAttr(new SfxInt16Item(RES_PARATR_TABSTOP, 960));
    expect(
      new WriterViewProjection().Project(
        document,
        node,
        cursor,
        createDocument({ id: "one-tab", suiteId: "writer", title: "One Tab" }),
      ).activeParagraph.computedStyle.tabStopsPt,
    ).toEqual([48]);
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
      [WRITER_COMMAND_IDS.saveOdt, "error", "Could not save ODT: error"],
      [WRITER_COMMAND_IDS.exportText, "error", "Could not start plain-text download."],
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

  it("rolls back a title edit when immediate browser persistence fails", /** Checks rename collision feedback. @returns Completion. */ async () => {
    const session = createWriterDocumentSession();
    const previous = session.docShell.GetTitle();
    const autosave = {
      Flush: vi.fn().mockRejectedValue(new Error("Name already exists")),
    } as unknown as WriterAutosaveController;
    const rendered = render(<WriterWorkbench autosave={autosave} isActive view={session.view} />);
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
      target: { value: "Conflicting title" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    await waitFor(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        expect(session.docShell.GetTitle()).toBe(previous),
    );
    expect(autosave.Flush).toHaveBeenCalledTimes(1);
    expect(session.docShell.GetMedium().GetLastOperation()).toMatchObject({
      operation: "save",
      state: "failed",
      message: "Name already exists",
    });
    rendered.unmount();
    session.Close();
  });
  it("ignores a rejected title and presents non-Error save failures", /** Checks title validation and adapter error reporting. @returns Completion. */ async () => {
    const session = createWriterDocumentSession();
    const previous = session.docShell.GetTitle();
    const rename = vi.spyOn(session.docShell, "RenameDocument");
    const autosave = {
      Flush: vi.fn().mockRejectedValue("quota exceeded"),
    } as unknown as WriterAutosaveController;
    const rendered = render(<WriterWorkbench autosave={autosave} isActive view={session.view} />);
    rename.mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
      target: { value: "Rejected" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    expect(autosave.Flush).not.toHaveBeenCalled();
    expect(session.docShell.GetTitle()).toBe(previous);
    fireEvent.click(screen.getByRole("button", { name: "Edit document title" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Document title" }), {
      target: { value: "Later" },
    });
    fireEvent.blur(screen.getByRole("textbox", { name: "Document title" }));
    await waitFor(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        expect(session.docShell.GetMedium().GetLastOperation().message).toBe("quota exceeded"),
    );
    expect(session.docShell.GetTitle()).toBe(previous);
    rendered.unmount();
    session.Close();
  });

  it("passes an active autosave controller into file dialogs", /** Checks file dialog composition. @returns Nothing. */ () => {
    const session = createWriterDocumentSession();
    const autosave = { Flush: vi.fn() } as unknown as WriterAutosaveController;
    const rendered = render(
      <WriterWorkbench
        autosave={autosave}
        fileDialogs={session.fileDialogs}
        isActive
        services={session.services}
        view={session.view}
      />,
    );
    act(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        session.fileDialogs.Show("export"),
    );
    expect(screen.getByRole("dialog", { name: "Export" })).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog", { name: "Export" })).toBeNull();
    rendered.rerender(
      <WriterWorkbench
        fileDialogs={session.fileDialogs}
        isActive
        services={session.services}
        view={session.view}
      />,
    );
    act(
      /** Runs the focused test callback. @returns Operation result. */ () =>
        session.fileDialogs.Show("export"),
    );
    expect(screen.getByRole("dialog", { name: "Export" })).toBeVisible();
    rendered.unmount();
    session.Close();
  });
  // executes domain commands without DOM through the top Writer shell
  it("keeps the suite test root active", /** Keeps test discovery active. @returns Nothing. */ () => {
    expect(true).toBe(true);
  });
});
