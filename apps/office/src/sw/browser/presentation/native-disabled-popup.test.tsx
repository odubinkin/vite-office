/** @fileoverview Verifies native disabled-entry popup navigation through original Writer frame bindings. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import {
  CommandPopupMenu,
  type CommandPopupMenuProps,
} from "../../../framework/browser/presentation/CommandPopupMenu";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { WRITER_COMMAND_IDS as ids } from "../../uiconfig/swriter/menubar/menubar-commands";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases original bindings and native document owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Presents actual native disabled/enabled commands in original resource order. @param items - Resource entries. @returns Native frame. */
function fixture(
  items: CommandPopupMenuProps["items"] = [
    { kind: "command", commandId: ids.undo },
    { kind: "command", commandId: ids.bold },
    { kind: "command", commandId: ids.redo },
    { kind: "command", commandId: ids.italic },
  ],
) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const source = createBrowserCommandSource(session.view.GetViewFrame());
  /** Owns popup lifetime without duplicating native state or execution. @returns Popup while open. */
  function Host() {
    const [open, setOpen] = useState(true);
    return open ? (
      <CommandPopupMenu
        ariaLabel="Native disabled popup"
        commandSource={source}
        getCommandResource={getWriterCommandResource}
        items={items}
        onClose={
          /** Closes the popup before actual dispatch. @returns Nothing. */ () => setOpen(false)
        }
        position={{ x: 20, y: 30 }}
        resolveArguments={/** Retains native defaults. @returns Undefined. */ () => undefined}
      />
    ) : null;
  }
  render(<Host />);
  return session;
}
it("native default highlights disabled first entry without executing it", /** Reproduces the enabled-only filter contradicting default SkipDisabledInMenus=false. @returns Nothing. */ () => {
  const session = fixture(),
    menu = screen.getByRole("menu"),
    undo = screen.getByRole("menuitem", { name: "Undo" });
  expect(undo).toBeDisabled();
  expect(menu).toHaveFocus();
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  expect(menu).toHaveAttribute("aria-activedescendant", undo.id);
  expect(menu).toHaveFocus();
  fireEvent.keyDown(menu, { key: "Enter" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native arrow order, Home and End include disabled entries and wrap across them", /** Checks selectable order independently from enabled and DOM focus states. @returns Nothing. */ () => {
  fixture();
  const menu = screen.getByRole("menu"),
    undo = screen.getByRole("menuitem", { name: "Undo" }),
    redo = screen.getByRole("menuitem", { name: "Redo" }),
    bold = screen.getByRole("menuitemcheckbox", { name: "Bold" }),
    italic = screen.getByRole("menuitemcheckbox", { name: "Italic" });
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  expect(bold).toHaveFocus();
  expect(undo).not.toHaveAttribute("data-popup-highlighted");
  fireEvent.keyDown(bold, { key: "ArrowDown" });
  expect(redo).toHaveAttribute("data-popup-highlighted", "true");
  expect(menu).toHaveFocus();
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  expect(italic).toHaveFocus();
  fireEvent.keyDown(italic, { key: "ArrowDown" });
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  fireEvent.keyDown(menu, { key: "ArrowUp" });
  expect(italic).toHaveFocus();
  fireEvent.keyDown(italic, { key: "ArrowUp" });
  expect(redo).toHaveAttribute("data-popup-highlighted", "true");
  fireEvent.keyDown(menu, { key: "Home" });
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  fireEvent.keyDown(menu, { key: "End" });
  expect(italic).toHaveFocus();
  expect(menu).toHaveAttribute("aria-activedescendant", italic.id);
});
it("enabled command after disabled navigation still executes the original native slot", /** Checks ordinary execution and live checked state remain native-owned. @returns Nothing. */ () => {
  const session = fixture(),
    menu = screen.getByRole("menu");
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  fireEvent.keyDown(screen.getByRole("menuitemcheckbox", { name: "Bold" }), { key: "Enter" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(session.view.QueryState(ids.bold).checked).toBe(true);
});
it("disabled first child retains child focus and Return closes only that popup", /** Checks PopupMenu::Run preselection and current StopExecute ownership. @returns Nothing. */ () => {
  const session = fixture([
    {
      kind: "submenu",
      id: "child",
      label: "Child",
      items: [
        { kind: "command", commandId: ids.undo },
        { kind: "command", commandId: ids.bold },
      ],
    },
  ]);
  const parent = screen.getByRole("menu", { name: "Native disabled popup" }),
    trigger = screen.getByRole("menuitem", { name: "Child" });
  fireEvent.keyDown(trigger, { key: "ArrowRight" });
  const child = screen.getByRole("menu", { name: "Child menu" }),
    undo = within(child).getByRole("menuitem", { name: "Undo" });
  expect(child).toHaveFocus();
  expect(undo).toBeDisabled();
  expect(child).toHaveAttribute("aria-activedescendant", undo.id);
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  fireEvent.keyDown(child, { key: "Enter" });
  expect(screen.queryByRole("menu", { name: "Child menu" })).not.toBeInTheDocument();
  expect(parent).toBeVisible();
  expect(trigger).toHaveFocus();
  expect(parent).toHaveAttribute("aria-activedescendant", trigger.id);
  expect(session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("unselected child Return cancels its popup without executing or dismissing the root", /** Checks pointer-open child has no invented first selection. @returns Nothing. */ () => {
  fixture([
    {
      kind: "submenu",
      id: "child",
      label: "Child",
      items: [{ kind: "command", commandId: ids.bold }],
    },
  ]);
  const trigger = screen.getByRole("menuitem", { name: "Child" });
  fireEvent.mouseEnter(trigger.parentElement as HTMLElement);
  const child = screen.getByRole("menu", { name: "Child menu" });
  expect(child).not.toHaveAttribute("aria-activedescendant");
  fireEvent.keyDown(child, { key: "Enter" });
  expect(screen.queryByRole("menu", { name: "Child menu" })).not.toBeInTheDocument();
  expect(screen.getByRole("menu", { name: "Native disabled popup" })).toBeVisible();
  expect(trigger).toHaveFocus();
});
it("live native enabled transition keeps selected identity and admits original Undo", /** Checks native bindings updates without copying enable state into selection. @returns Nothing. */ () => {
  const session = fixture(),
    menu = screen.getByRole("menu"),
    undo = screen.getByRole("menuitem", { name: "Undo" });
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  act(
    /** Inserts through the actual native edit window. @returns Nothing. */ () => {
      session.view.GetEditWin().InsertText("x");
    },
  );
  expect(undo).not.toBeDisabled();
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  fireEvent.keyDown(menu, { key: "Enter" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(session.docShell.GetDoc().paragraphs[0]?.GetText()).toBe("");
  expect(session.docShell.GetDoc().GetUndoManager().GetRedoActionCount()).toBe(1);
});
it("live native disabled transition cannot execute the selected command", /** Checks execution admission is read from original current bindings. @returns Nothing. */ () => {
  const session = fixture(),
    menu = screen.getByRole("menu"),
    undo = screen.getByRole("menuitem", { name: "Undo" });
  act(
    /** Creates one native history action. @returns Nothing. */ () => {
      session.view.GetEditWin().InsertText("x");
    },
  );
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  expect(undo).toHaveFocus();
  act(
    /** Navigates actual history outside the presentation. @returns Nothing. */ () => {
      session.view.Execute(ids.undo);
    },
  );
  expect(undo).toBeDisabled();
  fireEvent.keyDown(menu, { key: "Enter" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(session.docShell.GetDoc().GetUndoManager().GetRedoActionCount()).toBe(1);
});
it("focus on an ownerless wrapper cannot fabricate a highlighted entry", /** Checks popup ownership for actual DOM focus admission. @returns Nothing. */ () => {
  fixture();
  const menu = screen.getByRole("menu");
  fireEvent.focus(menu.parentElement as HTMLElement);
  expect(menu).not.toHaveAttribute("aria-activedescendant");
});
