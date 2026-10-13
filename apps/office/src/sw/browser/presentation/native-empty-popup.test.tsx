/** @fileoverview Verifies native child popup admission with original Writer frame bindings. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import { CommandPopupMenu } from "../../../framework/browser/presentation/CommandPopupMenu";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { WRITER_COMMAND_IDS as ids } from "../../uiconfig/swriter/menubar/menubar-commands";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
afterEach(
  /** Releases original frame subscriptions and documents. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
  },
);
it("native empty pointer admission keeps the original parent highlight and never executes", /** Checks nonempty gate is shared by pointer input. @returns Nothing. */ () => {
  const session = fixture(),
    trigger = screen.getByRole("menuitem", { name: "Empty" });
  fireEvent.mouseEnter(trigger.parentElement as HTMLElement);
  expect(screen.queryByRole("menu", { name: "Empty menu" })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("data-popup-highlighted", "true");
  fireEvent.mouseLeave(trigger.parentElement as HTMLElement);
  fireEvent.keyDown(trigger, { key: "Enter" });
  expect(screen.getByRole("menu", { name: "Native admission popup" })).toBeVisible();
  expect(session.view.QueryState(ids.bold).checked).toBe(false);
});
it.each(["keyboard", "pointer"])(
  "native %s empty request closes a different active sibling and all descendants",
  /** Checks native replacement precedes the empty-child gate. @param input - Original event family. @returns Nothing. */ (
    input,
  ) => {
    fixture();
    const filled = screen.getByRole("menuitem", { name: "Filled" });
    fireEvent.keyDown(filled, { key: "ArrowRight" });
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "Deep" }), { key: "ArrowRight" });
    expect(screen.getByRole("menu", { name: "Deep menu" })).toBeVisible();
    const empty = screen.getByRole("menuitem", { name: "Empty" });
    if (input === "keyboard") fireEvent.keyDown(empty, { key: "Enter" });
    else fireEvent.mouseEnter(empty.parentElement as HTMLElement);
    expect(screen.queryByRole("menu", { name: "Filled menu" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menu", { name: "Deep menu" })).not.toBeInTheDocument();
    expect(screen.queryByRole("menu", { name: "Empty menu" })).not.toBeInTheDocument();
    expect(empty).toHaveFocus();
    fireEvent.keyDown(filled, { key: "ArrowRight" });
    expect(screen.getByRole("menu", { name: "Filled menu" })).toBeVisible();
    fireEvent.keyDown(screen.getByRole("menuitemcheckbox", { name: "Bold" }), { key: "Enter" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  },
);
it("current resource ownership rejects a stale child identity without opening an invented popup", /** Checks transient device resource identity mismatch. @returns Nothing. */ () => {
  fixture();
  const filled = screen.getByRole("menuitem", { name: "Filled" });
  filled.dataset.popupTrigger = "stale";
  fireEvent.keyDown(filled, { key: "ArrowRight" });
  expect(screen.queryByRole("menu", { name: "Filled menu" })).not.toBeInTheDocument();
  expect(screen.getByRole("menu", { name: "Native admission popup" })).toBeVisible();
});
/** Presents native command bindings over two original child resource shapes. @returns Native session. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const source = createBrowserCommandSource(session.view.GetViewFrame());
  /** Owns native popup dismissal without replacing commands or state. @returns Current popup. */
  function Host() {
    const [open, setOpen] = useState(true);
    return open ? (
      <CommandPopupMenu
        ariaLabel="Native admission popup"
        commandSource={source}
        getCommandResource={getWriterCommandResource}
        items={[
          {
            kind: "submenu",
            id: "filled",
            label: "Filled",
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
          { kind: "submenu", id: "empty", label: "Empty", items: [] },
        ]}
        onClose={/** Closes before native dispatch. @returns Nothing. */ () => setOpen(false)}
        position={{ x: 20, y: 30 }}
        resolveArguments={/** Retains native slot defaults. @returns Undefined. */ () => undefined}
      />
    ) : null;
  }
  render(<Host />);
  return session;
}
it("native empty child admission does not create a popup window", /** Reproduces missing GetItemCount admission. @returns Nothing. */ () => {
  const session = fixture(),
    trigger = screen.getByRole("menuitem", { name: "Empty" });
  fireEvent.keyDown(trigger, { key: "ArrowRight" });
  expect(screen.queryByRole("menu", { name: "Empty menu" })).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByRole("menu", { name: "Native admission popup" })).toHaveAttribute(
    "aria-activedescendant",
    trigger.id,
  );
  expect(session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
});
