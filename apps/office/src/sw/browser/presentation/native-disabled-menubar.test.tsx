/** @fileoverview Verifies original native disabled bindings remain in menubar popup navigation order. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import {
  CommandMenuBar,
  type CommandMenuItemPlacement,
} from "../../../framework/browser/presentation/CommandMenuBar";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { WRITER_COMMAND_IDS as ids } from "../../uiconfig/swriter/menubar/menubar-commands";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [],
  owners: HTMLElement[] = [];
afterEach(
  /** Releases the original native frame bindings and actual focus owners. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
    for (const owner of owners.splice(0)) owner.remove();
  },
);
/** Presents original native disabled and enabled commands without replacing dispatch or state. @param items - Actual resource placements. @returns Original session and DOM owners. */
function fixture(
  items: readonly CommandMenuItemPlacement[] = [
    { kind: "command", commandId: ids.undo },
    { kind: "command", commandId: ids.bold },
    { kind: "separator" },
    { kind: "command", commandId: ids.redo },
    { kind: "command", commandId: ids.italic },
  ],
) {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const owner = document.createElement("input");
  document.body.append(owner);
  owners.push(owner);
  owner.focus();
  render(
    <CommandMenuBar
      ariaLabel="Native disabled menubar"
      commandSource={createBrowserCommandSource(session.view.GetViewFrame())}
      getCommandResource={getWriterCommandResource}
      idPrefix="native-disabled"
      menus={[{ id: "native", label: "Native", items }]}
      resolveArguments={/** Uses original native defaults. @returns Undefined. */ () => undefined}
    />,
  );
  return { session, owner, trigger: screen.getByRole("menuitem", { name: "Native" }) };
}
it("native root keyboard preselection includes a disabled first entry", /** Checks Menu::Execute uses SkipDisabledInMenus=false while HTML disabled stays protected. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.keyDown(f.trigger, { key: "ArrowDown" });
  const menu = screen.getByRole("menu"),
    undo = screen.getByRole("menuitem", { name: "Undo" });
  expect(undo).toBeDisabled();
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  expect(menu).toHaveFocus();
  expect(menu).toHaveAttribute("aria-activedescendant", undo.id);
  fireEvent.keyDown(menu, { key: "Enter" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(f.owner).toHaveFocus();
  expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native popup arrows and boundaries select disabled entries and wrap", /** Checks direct resource order, separators and native selection independent of browser focus. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(f.trigger);
  const menu = screen.getByRole("menu"),
    undo = screen.getByRole("menuitem", { name: "Undo" }),
    redo = screen.getByRole("menuitem", { name: "Redo" }),
    bold = screen.getByRole("menuitemcheckbox", { name: "Bold" }),
    italic = screen.getByRole("menuitemcheckbox", { name: "Italic" });
  expect(menu).not.toHaveAttribute("aria-activedescendant");
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
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
  fireEvent.keyDown(italic, { key: "Home" });
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  fireEvent.keyDown(menu, { key: "End" });
  expect(italic).toHaveFocus();
  expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native last disabled entry stays selected until Return cancellation", /** Checks last-entry admission and no disabled execution. @returns Nothing. */ () => {
  const f = fixture([
    { kind: "command", commandId: ids.bold },
    { kind: "command", commandId: ids.redo },
  ]);
  fireEvent.click(f.trigger);
  const menu = screen.getByRole("menu"),
    redo = screen.getByRole("menuitem", { name: "Redo" });
  fireEvent.keyDown(menu, { key: "End" });
  expect(redo).toHaveAttribute("data-popup-highlighted", "true");
  expect(menu).toHaveFocus();
  fireEvent.keyDown(menu, { key: "Enter" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(f.owner).toHaveFocus();
});
it("all disabled native commands remain traversable without a fabricated enabled entry", /** Checks source all-disabled popup has valid highlighted entries and no history. @returns Nothing. */ () => {
  const f = fixture([
    { kind: "command", commandId: ids.undo },
    { kind: "command", commandId: ids.redo },
  ]);
  fireEvent.keyDown(f.trigger, { key: "ArrowDown" });
  const menu = screen.getByRole("menu"),
    undo = screen.getByRole("menuitem", { name: "Undo" }),
    redo = screen.getByRole("menuitem", { name: "Redo" });
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  expect(redo).toHaveAttribute("data-popup-highlighted", "true");
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  expect(menu).toHaveFocus();
  expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("native disabled first child Return closes only its original popup", /** Checks actual submenu selection and parent focus without command execution. @returns Nothing. */ () => {
  const f = fixture([
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
  fireEvent.click(f.trigger);
  const trigger = screen.getByRole("menuitem", { name: "Child" });
  fireEvent.keyDown(trigger, { key: "ArrowRight" });
  const child = screen.getByRole("menu", { name: "Child menu" }),
    undo = within(child).getByRole("menuitem", { name: "Undo" });
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  expect(child).toHaveFocus();
  fireEvent.keyDown(child, { key: "Enter" });
  expect(screen.queryByRole("menu", { name: "Child menu" })).not.toBeInTheDocument();
  expect(screen.getByRole("menu", { name: "Native menu" })).toBeVisible();
  expect(trigger).toHaveFocus();
  expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("enabled native command after disabled selection executes and retains history", /** Checks real native slot state and synchronous external focus restoration. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.click(f.trigger);
  const menu = screen.getByRole("menu"),
    bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });
  fireEvent.keyDown(menu, { key: "Home" });
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  expect(bold).toHaveFocus();
  fireEvent.keyDown(bold, { key: "Enter" });
  expect(f.session.view.QueryState(ids.bold).checked).toBe(true);
  expect(f.owner).toHaveFocus();
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});
it("registered Space adapter preserves enabled activation and HTML disabled protection", /** Checks the deliberate browser adapter survives native disabled traversal. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.keyDown(f.trigger, { key: " " });
  const menu = screen.getByRole("menu"),
    undo = screen.getByRole("menuitem", { name: "Undo" });
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  fireEvent.keyDown(menu, { key: " " });
  expect(menu).toBeVisible();
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
  expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  const bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });
  fireEvent.keyDown(bold, { key: " " });
  expect(f.session.view.QueryState(ids.bold).checked).toBe(true);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});
