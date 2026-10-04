/** @fileoverview Checks existing Paragraph panel controls through owned Writer bindings and frames. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { BrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WriterWorkbench } from "./writer-view";
import { WriterParagraphProperties } from "./WriterPropertiesPanel";
import { WRITER_COMMAND_IDS } from "../../uiconfig/swriter/menubar/menubar-commands";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases mounted presentation before owned sessions. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);

/** Mounts the actual Writer presenter. @returns Owned frame. */
function mountWriter() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  render(
    <WriterWorkbench
      fileDialogs={session.fileDialogs}
      isActive
      services={session.services}
      view={session.view}
    />,
  );
  return {
    session,
    sidebar: within(screen.getByRole("complementary", { name: "Writer properties sidebar" })),
  };
}

describe("Paragraph panel header controls", /** Groups native panel expansion and dialog placement. @returns Nothing. */ () => {
  it("retains command content and collapse state through the surrounding deck lifecycle", /** Checks panel expansion does not mutate the model or dispatch. @returns Nothing. */ function retainsParagraphPanel(): void {
    const { session, sidebar } = mountWriter();
    const title = sidebar.getByRole("button", { name: "Paragraph" });
    const start = sidebar.getByRole("button", { name: "Start" });
    const execute = vi.spyOn(session.view.GetViewFrame().GetDispatcher(), "Execute");
    const generation = session.view.GetDocShell().GetDocumentState().contentGeneration;
    fireEvent.click(title);
    expect(start).not.toBeVisible();
    expect(title).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(sidebar.getByRole("button", { name: "Close Sidebar Deck" }));
    fireEvent.click(sidebar.getByRole("button", { name: "Properties" }));
    expect(title).toHaveAttribute("aria-expanded", "false");
    expect(start).not.toBeVisible();
    title.focus();
    expect(fireEvent.keyDown(title, { key: "Enter" })).toBe(false);
    expect(start).toBeVisible();
    expect(start).toHaveFocus();
    expect(title).toHaveAttribute("aria-expanded", "true");
    expect(execute).not.toHaveBeenCalled();
    expect(session.view.GetDocShell().GetDocumentState().contentGeneration).toBe(generation);
    fireEvent.click(sidebar.getByRole("button", { name: "Center" }));
    expect(sidebar.getByRole("button", { name: "Center" })).toHaveAttribute("aria-pressed", "true");
  });

  it("More Options opens the existing Paragraph dialog even when panel contents are collapsed", /** Checks source controller dispatch and cancelled dialog state. @returns Nothing. */ function opensParagraphOptions(): void {
    const { session, sidebar } = mountWriter();
    const title = sidebar.getByRole("button", { name: "Paragraph" });
    fireEvent.click(title);
    const execute = vi.spyOn(session.view.GetViewFrame().GetDispatcher(), "Execute");
    const generation = session.view.GetDocShell().GetDocumentState().contentGeneration;
    fireEvent.click(sidebar.getByRole("button", { name: "More Options" }));
    expect(execute).toHaveBeenCalledWith(WRITER_COMMAND_IDS.paragraphDialog, undefined);
    expect(execute).toHaveBeenCalledTimes(1);
    const dialog = screen.getByRole("dialog", { name: "Paragraph" });
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(title).toHaveAttribute("aria-expanded", "false");
    expect(session.view.GetDocShell().GetDocumentState().contentGeneration).toBe(generation);
  });

  for (const { allDisabled, alignmentDisabled } of [
    { allDisabled: false, alignmentDisabled: false },
    { allDisabled: false, alignmentDisabled: true },
    { allDisabled: true, alignmentDisabled: true },
  ]) {
    it(`Enter selects the first enabled control with allDisabled=${allDisabled}, alignmentDisabled=${alignmentDisabled}`, /** Checks local native child focus and disabled More Options state. @returns Nothing. */ function focusesEligibleContent(): void {
      const execute = vi.fn();
      const source: BrowserCommandSource = {
        CreateControllerItem:
          /** Supplies stable owned slot state. @param id - Command identity. @returns Controller. */ (
            id,
          ) => {
            const alignmentCommands: readonly string[] = [
              WRITER_COMMAND_IDS.alignLeft,
              WRITER_COMMAND_IDS.alignCenter,
              WRITER_COMMAND_IDS.alignRight,
              WRITER_COMMAND_IDS.alignJustify,
            ];
            const state = {
              enabled:
                !allDisabled &&
                id !== WRITER_COMMAND_IDS.alignLeft &&
                !(alignmentDisabled && alignmentCommands.includes(id)),
            };
            return {
              GetState: /** Reads slot state. @returns State. */ () => state,
              Dispose: /** Releases no resources. @returns Nothing. */ () => undefined,
              Subscribe: /** Installs no listener. @returns Cleanup. */ () =>
                /** Releases no resources. @returns Nothing. */ () =>
                  undefined,
            };
          },
        Execute: execute,
        QueryCommand:
          /** Resolves owned descriptors. @param id - Command identity. @returns Descriptor. */ (
            id,
          ) => ({
            id,
            label: id,
            execute: /** Runs no command. @returns Nothing. */ () => undefined,
          }),
      };
      render(
        <WriterParagraphProperties
          alignment="left"
          commandSource={source}
          listKind="none"
          paragraphNumber={1}
          resolveArguments={/** Supplies no dialog draft. @returns Undefined. */ () => undefined}
          styleDisplayName="Standard"
        />,
      );
      const title = screen.getByRole("button", { name: "Paragraph" });
      fireEvent.click(title);
      title.focus();
      fireEvent.keyDown(title, { key: "Enter" });
      expect(
        allDisabled
          ? title
          : screen.getByRole("button", { name: alignmentDisabled ? "No List" : "Center" }),
      ).toHaveFocus();
      if (allDisabled) {
        expect(screen.getByRole("button", { name: "More Options" })).toBeDisabled();
        fireEvent.click(screen.getByRole("button", { name: "More Options" }));
      }
      expect(execute).not.toHaveBeenCalled();
    });
  }
});
