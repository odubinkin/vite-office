/** @fileoverview Verifies native popup submenu timer ownership with original Writer frame bindings. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
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
  /** Releases mounted owners before restoring the real clock. @returns Nothing. */ () => {
    cleanup();
    vi.useRealTimers();
    for (const s of sessions.splice(0)) s.Close();
  },
);
/** Advances the actual browser timer queue while flushing rendering. @param milliseconds - Native clock interval. @returns Nothing. */
function advance(milliseconds: number) {
  act(
    /** Flushes elapsed native timer work. @returns Nothing. */ () => {
      vi.advanceTimersByTime(milliseconds);
    },
  );
}
const originalItems: CommandPopupMenuProps["items"] = [
  {
    kind: "submenu",
    id: "first",
    label: "First",
    items: [
      { kind: "command", commandId: ids.bold },
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
  { kind: "submenu", id: "empty", label: "Empty", items: [] },
  { kind: "command", commandId: ids.undo },
];
/** Mounts original command bindings and native child resources. @returns Actual session and mount. */
function fixture() {
  vi.useFakeTimers();
  const session = createWriterDocumentSession();
  sessions.push(session);
  const source = createBrowserCommandSource(session.view.GetViewFrame());
  /** Owns resource/lifetime changes without replacing native command state. @param props - Current resources. @param props.items - Native placements. @returns Current popup. */
  function Host({ items }: { items: CommandPopupMenuProps["items"] }) {
    const [open, setOpen] = useState(true);
    return open ? (
      <CommandPopupMenu
        ariaLabel="Native delay popup"
        commandSource={source}
        getCommandResource={getWriterCommandResource}
        items={items}
        onClose={/** Releases before native dispatch. @returns Nothing. */ () => setOpen(false)}
        position={{ x: 20, y: 30 }}
        resolveArguments={
          /** Retains original native arguments. @returns Undefined. */ () => undefined
        }
      />
    ) : null;
  }
  const mounted = render(<Host items={originalItems} />);
  return { session, mounted, Host };
}
it("native pointer child waits150ms and starts unselected", /** Reproduces the immediate hover contradicting native menu delay. @returns Nothing. */ () => {
  fixture();
  const trigger = screen.getByRole("menuitem", { name: "First" });
  fireEvent.mouseEnter(trigger.parentElement as HTMLElement);
  expect(screen.queryByRole("menu", { name: "First menu" })).not.toBeInTheDocument();
  advance(149);
  expect(screen.queryByRole("menu", { name: "First menu" })).not.toBeInTheDocument();
  advance(1);
  const child = screen.getByRole("menu", { name: "First menu" });
  expect(child).toHaveFocus();
  expect(child).not.toHaveAttribute("aria-activedescendant");
});
it("leaving before acceptance cancels pending pointer open", /** Checks original timer cancellation and unchanged native command state. @returns Nothing. */ () => {
  const f = fixture(),
    trigger = screen.getByRole("menuitem", { name: "First" });
  fireEvent.mouseEnter(trigger.parentElement as HTMLElement);
  advance(100);
  fireEvent.mouseLeave(trigger.parentElement as HTMLElement);
  advance(200);
  expect(screen.queryByRole("menu", { name: "First menu" })).not.toBeInTheDocument();
  expect(f.session.view.QueryState(ids.bold).checked).toBe(false);
});
it("last sibling pointer request owns the parent timer", /** Checks a superseded resource cannot open later. @returns Nothing. */ () => {
  fixture();
  fireEvent.mouseEnter(
    screen.getByRole("menuitem", { name: "First" }).parentElement as HTMLElement,
  );
  advance(100);
  fireEvent.mouseEnter(
    screen.getByRole("menuitem", { name: "Second" }).parentElement as HTMLElement,
  );
  advance(149);
  expect(screen.queryByRole("menu", { name: "First menu" })).not.toBeInTheDocument();
  expect(screen.queryByRole("menu", { name: "Second menu" })).not.toBeInTheDocument();
  advance(1);
  expect(screen.getByRole("menu", { name: "Second menu" })).toHaveFocus();
});
it("owning parent leave retains child while a different highlight closes after150ms", /** Checks native ownership condition for delayed child shutdown. @returns Nothing. */ () => {
  fixture();
  const first = screen.getByRole("menuitem", { name: "First" });
  fireEvent.keyDown(first, { key: "ArrowRight" });
  fireEvent.mouseLeave(first.parentElement as HTMLElement);
  advance(300);
  expect(screen.getByRole("menu", { name: "First menu" })).toBeVisible();
  const undo = screen.getByRole("menuitem", { name: "Undo" });
  fireEvent.mouseEnter(undo.parentElement as HTMLElement);
  fireEvent.mouseLeave(first.parentElement as HTMLElement);
  advance(149);
  expect(screen.getByRole("menu", { name: "First menu" })).toBeVisible();
  advance(1);
  expect(screen.queryByRole("menu", { name: "First menu" })).not.toBeInTheDocument();
  expect(undo).toHaveAttribute("data-popup-highlighted", "true");
});
it("reentering active parent cancels delayed closure and preserves child selection", /** Checks repeated ownership cannot reset a keyboard-selected child. @returns Nothing. */ () => {
  fixture();
  const first = screen.getByRole("menuitem", { name: "First" });
  fireEvent.keyDown(first, { key: "ArrowRight" });
  const bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });
  fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Undo" }).parentElement as HTMLElement);
  fireEvent.mouseLeave(first.parentElement as HTMLElement);
  advance(100);
  fireEvent.mouseEnter(first.parentElement as HTMLElement);
  advance(300);
  expect(screen.getByRole("menu", { name: "First menu" })).toBeVisible();
  expect(bold).toHaveFocus();
});
it("keyboard and direct left activation bypass delay and cancel pending pointer work", /** Checks native null-timer activation and first-child preselection. @returns Nothing. */ () => {
  fixture();
  const first = screen.getByRole("menuitem", { name: "First" }),
    second = screen.getByRole("menuitem", { name: "Second" });
  fireEvent.mouseEnter(first.parentElement as HTMLElement);
  fireEvent.keyDown(second, { key: "ArrowRight" });
  expect(screen.getByRole("menuitemcheckbox", { name: "Italic" })).toHaveFocus();
  advance(300);
  expect(screen.queryByRole("menu", { name: "First menu" })).not.toBeInTheDocument();
  fireEvent.mouseDown(first, { button: 1 });
  expect(screen.queryByRole("menu", { name: "First menu" })).not.toBeInTheDocument();
  fireEvent.mouseDown(first, { button: 0 });
  expect(screen.getByRole("menuitemcheckbox", { name: "Bold" })).toHaveFocus();
});
it("empty pointer replacement waits before closing a prior nonempty child", /** Checks timer activation keeps original empty admission without an empty window. @returns Nothing. */ () => {
  fixture();
  fireEvent.keyDown(screen.getByRole("menuitem", { name: "First" }), { key: "ArrowRight" });
  const empty = screen.getByRole("menuitem", { name: "Empty" });
  fireEvent.mouseEnter(empty.parentElement as HTMLElement);
  advance(149);
  expect(screen.getByRole("menu", { name: "First menu" })).toBeVisible();
  advance(1);
  expect(screen.queryByRole("menu", { name: "First menu" })).not.toBeInTheDocument();
  expect(screen.queryByRole("menu", { name: "Empty menu" })).not.toBeInTheDocument();
  expect(empty).toHaveFocus();
});
it("nested pointer timers stay owned by their actual popup and Escape clears descendants", /** Checks parent cancellation cannot leave a nested callback alive. @returns Nothing. */ () => {
  fixture();
  const first = screen.getByRole("menuitem", { name: "First" });
  fireEvent.keyDown(first, { key: "ArrowRight" });
  const deep = screen.getByRole("menuitem", { name: "Deep" });
  fireEvent.mouseEnter(deep.parentElement as HTMLElement);
  advance(149);
  expect(screen.queryByRole("menu", { name: "Deep menu" })).not.toBeInTheDocument();
  advance(1);
  expect(screen.getByRole("menu", { name: "Deep menu" })).toBeVisible();
  fireEvent.mouseEnter(deep.parentElement as HTMLElement);
  fireEvent.keyDown(screen.getByRole("menu", { name: "Deep menu" }), { key: "Escape" });
  advance(300);
  expect(screen.queryByRole("menu", { name: "Deep menu" })).not.toBeInTheDocument();
  expect(screen.getByRole("menu", { name: "First menu" })).toBeVisible();
});
it.each(["escape", "outside", "unmount", "resource"])(
  "native %s lifetime ends all pending pointer callbacks",
  /** Checks real window/resource teardown. @param end - Lifetime boundary. @returns Nothing. */ (
    end,
  ) => {
    const f = fixture(),
      first = screen.getByRole("menuitem", { name: "First" });
    fireEvent.mouseEnter(first.parentElement as HTMLElement);
    if (end === "escape") fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    else if (end === "outside") fireEvent.mouseDown(document.body);
    else if (end === "unmount") f.mounted.unmount();
    else f.mounted.rerender(<f.Host items={[]} />);
    advance(300);
    expect(screen.queryByRole("menu", { name: "First menu" })).not.toBeInTheDocument();
    expect(f.session.view.QueryState(ids.bold).checked).toBe(false);
  },
);
it("command pointer request closes differing child without executing a native slot", /** Checks timer HighlightChanged handles non-submenu selection. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.keyDown(screen.getByRole("menuitem", { name: "First" }), { key: "ArrowRight" });
  const undo = screen.getByRole("menuitem", { name: "Undo" });
  fireEvent.mouseEnter(undo.parentElement as HTMLElement);
  advance(149);
  expect(screen.getByRole("menu", { name: "First menu" })).toBeVisible();
  advance(1);
  expect(screen.queryByRole("menu", { name: "First menu" })).not.toBeInTheDocument();
  fireEvent.mouseLeave(undo.parentElement as HTMLElement);
  expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
it("direct reactivation retains the selected active child", /** Checks native active-window admission does not reset its selection. @returns Nothing. */ () => {
  fixture();
  const first = screen.getByRole("menuitem", { name: "First" });
  fireEvent.mouseDown(first, { button: 0 });
  const deep = screen.getByRole("menuitem", { name: "Deep" });
  act(() => deep.focus());
  fireEvent.mouseDown(first, { button: 0 });
  expect(screen.getByRole("menu", { name: "First menu" })).toBeVisible();
  expect(deep).toHaveFocus();
});
it("child keyboard work leaves a pending parent replacement owned by the parent", /** Checks independent timer depth through observable native admission. @returns Nothing. */ () => {
  fixture();
  fireEvent.keyDown(screen.getByRole("menuitem", { name: "First" }), { key: "ArrowRight" });
  fireEvent.mouseEnter(
    screen.getByRole("menuitem", { name: "Second" }).parentElement as HTMLElement,
  );
  advance(50);
  fireEvent.keyDown(screen.getByRole("menu", { name: "First menu" }), { key: "ArrowDown" });
  advance(100);
  expect(screen.queryByRole("menu", { name: "First menu" })).not.toBeInTheDocument();
  expect(screen.getByRole("menu", { name: "Second menu" })).toHaveFocus();
  advance(100);
  expect(screen.queryByRole("menu", { name: "Deep menu" })).not.toBeInTheDocument();
});
