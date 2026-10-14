/** @fileoverview Verifies native popup current selection and immediate parent highlight with original Writer bindings. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CommandPopupMenu } from "../../../framework/browser/presentation/CommandPopupMenu";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { WRITER_COMMAND_IDS as ids } from "../../uiconfig/swriter/menubar/menubar-commands";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases original mounted owners before restoring the clock. @returns Nothing. */ () => {
    cleanup();
    vi.useRealTimers();
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Flushes actual timer ownership. @param ms - Elapsed native milliseconds. @returns Nothing. */
function advance(ms: number) {
  act(/** Flushes native timer callbacks. @returns Nothing. */ () => vi.advanceTimersByTime(ms));
}
/** Opens actual native resources through original bindings. @returns Original session and parent entries. */
function fixture() {
  vi.useFakeTimers();
  const session = createWriterDocumentSession();
  sessions.push(session);
  render(
    <CommandPopupMenu
      ariaLabel="Current native popup"
      commandSource={createBrowserCommandSource(session.view.GetViewFrame())}
      getCommandResource={getWriterCommandResource}
      resolveArguments={
        /** Retains original command arguments. @returns Undefined. */ () => undefined
      }
      position={{ x: 20, y: 30 }}
      onClose={/** Retains the test-owned popup lifetime. @returns Nothing. */ () => undefined}
      items={[
        {
          kind: "submenu",
          id: "first",
          label: "First",
          items: [
            { kind: "command", commandId: ids.bold },
            { kind: "command", commandId: ids.undo },
            {
              kind: "submenu",
              id: "deep",
              label: "Deep",
              items: [{ kind: "command", commandId: ids.italic }],
            },
          ],
        },
        {
          kind: "submenu",
          id: "second",
          label: "Second",
          items: [{ kind: "command", commandId: ids.italic }],
        },
        { kind: "command", commandId: ids.redo },
      ]}
    />,
  );
  const first = screen.getByRole("menuitem", { name: "First" }),
    second = screen.getByRole("menuitem", { name: "Second" });
  fireEvent.keyDown(first, { key: "ArrowRight" });
  return {
    session,
    first,
    second,
    root: screen.getByRole("menu", { name: "Current native popup" }),
    child: screen.getByRole("menu", { name: "First menu" }),
  };
}
it("child disabled selection restores its original parent and pending timer reads current highlight", /** Reproduces stale captured sibling admission and missing parent ownership. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.mouseEnter(f.second.parentElement as HTMLElement);
  advance(50);
  fireEvent.keyDown(f.child, { key: "ArrowDown" });
  const undo = screen.getByRole("menuitem", { name: "Undo" });
  expect(f.child).toHaveFocus();
  expect(f.child).toHaveAttribute("aria-activedescendant", undo.id);
  expect(f.root).toHaveAttribute("aria-activedescendant", f.first.id);
  expect(f.second).not.toHaveAttribute("data-popup-highlighted");
  advance(100);
  expect(f.child).toBeVisible();
  expect(screen.queryByRole("menu", { name: "Second menu" })).not.toBeInTheDocument();
  expect(f.child).toHaveAttribute("aria-activedescendant", undo.id);
  expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("actual child focus restores parent without moving document focus or executing", /** Checks DOM focus maps current selection to original native owner. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.mouseEnter(f.second.parentElement as HTMLElement);
  const deep = screen.getByRole("menuitem", { name: "Deep" });
  act(/** Focuses an actual enabled child entry. @returns Nothing. */ () => deep.focus());
  expect(f.root).toHaveAttribute("aria-activedescendant", f.first.id);
  advance(150);
  expect(deep).toHaveFocus();
  expect(f.child).toBeVisible();
  expect(f.session.view.QueryState(ids.bold).checked).toBe(false);
});
it("ordinary command timer also reads restored current submenu owner", /** Checks a captured non-submenu target cannot close a rehighlighted active child. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Redo" }).parentElement as HTMLElement);
  fireEvent.keyDown(f.child, { key: "End" });
  advance(150);
  expect(f.child).toBeVisible();
  expect(screen.getByRole("menuitem", { name: "Deep" })).toHaveFocus();
});
it("child selection stops its own submenu-close timer and retains current parent", /** Checks close timer belongs to actual child window. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.mouseEnter(f.second.parentElement as HTMLElement);
  fireEvent.mouseLeave(f.first.parentElement as HTMLElement);
  advance(100);
  fireEvent.keyDown(f.child, { key: "ArrowDown" });
  advance(200);
  expect(f.child).toBeVisible();
  expect(f.root).toHaveAttribute("aria-activedescendant", f.first.id);
  expect(screen.queryByRole("menu", { name: "Second menu" })).not.toBeInTheDocument();
});
it("pending descendant admission survives an unchanged active parent timer", /** Checks independently owned highlight timers and native active-window reuse. @returns Nothing. */ () => {
  const f = fixture(),
    deep = screen.getByRole("menuitem", { name: "Deep" });
  fireEvent.mouseEnter(deep.parentElement as HTMLElement);
  advance(50);
  fireEvent.mouseEnter(f.second.parentElement as HTMLElement);
  advance(50);
  fireEvent.keyDown(f.child, { key: "End" });
  advance(50);
  const nested = screen.getByRole("menu", { name: "Deep menu" });
  expect(nested).toHaveFocus();
  expect(nested).not.toHaveAttribute("aria-activedescendant");
  advance(50);
  expect(nested).toBeVisible();
  expect(screen.queryByRole("menu", { name: "Second menu" })).not.toBeInTheDocument();
});
it("native leave invalidates unaccepted highlight before pending callback", /** Checks original INVALID selection yields no child admission. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.keyDown(f.child, { key: "Escape" });
  fireEvent.mouseEnter(f.second.parentElement as HTMLElement);
  fireEvent.mouseLeave(f.second.parentElement as HTMLElement);
  expect(f.root).not.toHaveAttribute("aria-activedescendant");
  advance(200);
  expect(screen.queryByRole("menu", { name: "Second menu" })).not.toBeInTheDocument();
});
it("changed current submenu identity cannot invent a native resource", /** Checks original resource list remains admission authority at callback time. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.mouseEnter(f.second.parentElement as HTMLElement);
  f.second.dataset.popupTrigger = "missing-original-resource";
  advance(150);
  expect(f.child).toBeVisible();
  expect(screen.queryByRole("menu", { name: "Second menu" })).not.toBeInTheDocument();
  expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("pending timer reads active native window identity after immediate key activation", /** Checks the same active child cannot be recreated from a captured browser path. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.mouseEnter(f.second.parentElement as HTMLElement);
  fireEvent.keyDown(f.second, { key: "ArrowRight" });
  const italic = screen.getByRole("menuitemcheckbox", { name: "Italic" });
  expect(italic).toHaveFocus();
  advance(150);
  expect(italic).toHaveFocus();
  expect(screen.getByRole("menu", { name: "Second menu" })).toHaveAttribute(
    "aria-activedescendant",
    italic.id,
  );
});
it("grandchild selection updates only its immediate parent without recursive ancestor selection", /** Checks the original parent assignment is bounded to one native window. @returns Nothing. */ () => {
  const f = fixture(),
    deep = screen.getByRole("menuitem", { name: "Deep" });
  fireEvent.keyDown(deep, { key: "ArrowRight" });
  fireEvent.mouseEnter(f.second.parentElement as HTMLElement);
  const nested = screen.getByRole("menu", { name: "Deep menu" });
  fireEvent.keyDown(nested, { key: "ArrowDown" });
  expect(f.child).toHaveAttribute("aria-activedescendant", deep.id);
  expect(f.root).toHaveAttribute("aria-activedescendant", f.second.id);
  advance(150);
  expect(screen.queryByRole("menu", { name: "Deep menu" })).not.toBeInTheDocument();
  expect(screen.getByRole("menu", { name: "Second menu" })).toBeVisible();
});
