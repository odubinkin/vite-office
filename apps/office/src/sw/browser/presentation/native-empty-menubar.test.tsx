/** @fileoverview Checks menubar child admission borrows original resources and native Writer bindings without creating empty popups. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  CommandMenuBar,
  type CommandMenuItemPlacement,
} from "../../../framework/browser/presentation/CommandMenuBar";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { WRITER_COMMAND_IDS as ids } from "../../uiconfig/swriter/menubar/menubar-commands";
/** Advances original popup movement and admission over actual rendered resources. @param entry - Original menu entry. @returns Nothing. */
function pointerAdmission(entry: HTMLElement): void {
  fireEvent.mouseMove(entry);
  fireEvent.mouseMove(entry);
  act(
    /** Commits native150ms admission. @returns Nothing. */ () => {
      vi.advanceTimersByTime(150);
    },
  );
}
beforeEach(
  /** Controls actual popup timers. @returns Nothing. */ () => {
    vi.useFakeTimers();
  },
);
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [],
  owners: HTMLElement[] = [];
afterEach(
  /** Releases original document bindings and DOM owners. @returns Nothing. */ () => {
    cleanup();
    vi.useRealTimers();
    for (const session of sessions.splice(0)) session.Close();
    for (const owner of owners.splice(0)) owner.remove();
  },
);
/** Presents two original native resource shapes. @returns Actual session, owners and resource view. */
function fixture() {
  const session = createWriterDocumentSession(),
    owner = document.createElement("input");
  sessions.push(session);
  owners.push(owner);
  document.body.append(owner);
  owner.focus();
  const source = createBrowserCommandSource(session.view.GetViewFrame());
  /** Presents current actual items without a command or state substitute. @param items - Original native placements. @returns Menubar. */
  function view(items: readonly CommandMenuItemPlacement[]) {
    return (
      <CommandMenuBar
        ariaLabel="Native child admission menubar"
        commandSource={source}
        getCommandResource={getWriterCommandResource}
        idPrefix="native-empty-menu"
        menus={[{ id: "native", label: "Native", items }]}
        resolveArguments={/** Reads original slot defaults. @returns Undefined. */ () => undefined}
      />
    );
  }
  const items: readonly CommandMenuItemPlacement[] = [
    {
      kind: "submenu",
      id: "filled",
      label: "Filled",
      items: [{ kind: "command", commandId: ids.bold }],
    },
    { kind: "submenu", id: "empty", label: "Empty", items: [] },
  ];
  const mounted = render(view(items));
  fireEvent.click(screen.getByRole("menuitem", { name: "Native" }));
  return { session, owner, ...mounted, view };
}
it.each(["ArrowRight", "Enter", " "])(
  "native empty menubar keyboard request keeps the parent without dispatch key=%s",
  /** Checks original source count gate and protected Space adapter. @param key - Existing native/browser key. @returns Nothing. */ (
    key,
  ) => {
    const f = fixture(),
      empty = screen.getByRole("menuitem", { name: "Empty" });
    fireEvent.keyDown(empty, { key });
    expect(screen.queryByRole("menu", { name: "Empty menu" })).not.toBeInTheDocument();
    expect(empty).toHaveFocus();
    expect(empty).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("menu", { name: "Native menu" })).toHaveAttribute(
      "aria-activedescendant",
      empty.id,
    );
    expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it.each(["pointer", "click", "middle", "right"])(
  "native empty menubar pointer activation does not create a child input=%s",
  /** Checks source mouse admission through existing browser-native paths. @param input - Mouse origin. @returns Nothing. */ (
    input,
  ) => {
    const f = fixture(),
      empty = screen.getByRole("menuitem", { name: "Empty" });
    if (input === "pointer") pointerAdmission(empty);
    else if (input === "click") fireEvent.click(empty);
    else
      fireEvent(
        empty,
        new MouseEvent("auxclick", {
          bubbles: true,
          cancelable: true,
          button: input === "middle" ? 1 : 2,
        }),
      );
    expect(screen.queryByRole("menu", { name: "Empty menu" })).not.toBeInTheDocument();
    expect(empty).toHaveFocus();
    expect(screen.getByRole("menu", { name: "Native menu" })).toBeVisible();
    expect(f.session.view.QueryState(ids.bold).checked).toBe(false);
  },
);
it.each(["keyboard", "pointer", "click"])(
  "native empty menubar sibling request closes the previous actual child input=%s",
  /** Checks source sibling teardown precedes the empty resource gate and later original native dispatch survives. @param input - Request origin. @returns Nothing. */ (
    input,
  ) => {
    const f = fixture(),
      filled = screen.getByRole("menuitem", { name: "Filled" }),
      empty = screen.getByRole("menuitem", { name: "Empty" });
    fireEvent.keyDown(filled, { key: "ArrowRight" });
    expect(screen.getByRole("menuitemcheckbox", { name: "Bold" })).toHaveFocus();
    if (input === "keyboard") fireEvent.keyDown(empty, { key: "ArrowRight" });
    else if (input === "pointer") pointerAdmission(empty);
    else fireEvent.click(empty);
    expect(screen.queryByRole("menu", { name: "Filled menu" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menu", { name: "Empty menu" })).not.toBeInTheDocument();
    expect(empty).toHaveFocus();
    expect(screen.getByRole("menu", { name: "Native menu" })).toBeVisible();
    fireEvent.keyDown(filled, { key: "ArrowRight" });
    fireEvent.keyDown(screen.getByRole("menuitemcheckbox", { name: "Bold" }), { key: "Enter" });
    expect(f.session.view.QueryState(ids.bold).checked).toBe(true);
    expect(f.owner).toHaveFocus();
  },
);
it("native menubar current resources reject a stale keyboard child identity", /** Checks no popup is invented from a device-only string. @returns Nothing. */ () => {
  const f = fixture(),
    filled = screen.getByRole("menuitem", { name: "Filled" });
  fireEvent.keyDown(filled, { key: "ArrowRight" });
  const popup = screen.getByRole("menu", { name: "Filled menu" });
  filled.dataset.submenuTrigger = "stale";
  fireEvent.keyDown(filled, { key: "ArrowRight" });
  expect(screen.getByRole("menu", { name: "Filled menu" })).toBe(popup);
  expect(screen.getByRole("menu", { name: "Native menu" })).toBeVisible();
  expect(f.session.view.QueryState(ids.bold).checked).toBe(false);
});
it("native menubar retains an existing actual child when its item count becomes empty", /** Checks GetItemCount prevents a new window but does not kill an already active identical child. @returns Nothing. */ () => {
  const f = fixture(),
    filled = screen.getByRole("menuitem", { name: "Filled" });
  fireEvent.keyDown(filled, { key: "ArrowRight" });
  const popup = screen.getByRole("menu", { name: "Filled menu" });
  f.rerender(f.view([{ kind: "submenu", id: "filled", label: "Filled", items: [] }]));
  fireEvent.keyDown(screen.getByRole("menuitem", { name: "Filled" }), { key: "ArrowRight" });
  expect(screen.getByRole("menu", { name: "Filled menu" })).toBe(popup);
  expect(f.session.view.QueryState(ids.bold).checked).toBe(false);
});
it.each(["Enter", " "])(
  "native menubar activation rejects a stale child while retaining its actual popup key=%s",
  /** Checks current resource admission also protects Return and the registered Space adapter. @param key - Existing activation key. @returns Nothing. */ (
    key,
  ) => {
    const f = fixture(),
      filled = screen.getByRole("menuitem", { name: "Filled" });
    fireEvent.keyDown(filled, { key: "ArrowRight" });
    const popup = screen.getByRole("menu", { name: "Filled menu" });
    filled.dataset.submenuTrigger = "stale";
    fireEvent.keyDown(filled, { key });
    expect(screen.getByRole("menu", { name: "Filled menu" })).toBe(popup);
    expect(screen.getByRole("menu", { name: "Native menu" })).toBeVisible();
    expect(f.session.view.QueryState(ids.bold).checked).toBe(false);
  },
);
