/** @fileoverview Verifies browser-native click and auxiliary input with original Writer frame bindings. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import { CommandPopupMenu } from "../../../framework/browser/presentation/CommandPopupMenu";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { WRITER_COMMAND_IDS as ids } from "../../uiconfig/swriter/menubar/menubar-commands";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const owners: HTMLElement[] = [];
afterEach(
  /** Releases original frame and DOM lifetimes. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
    for (const owner of owners.splice(0)) owner.remove();
  },
);
/** Mounts original native command state and real binding callbacks. @returns Actual session and popup owner. */
function fixture() {
  const session = createWriterDocumentSession();
  sessions.push(session);
  const owner = document.createElement("button");
  document.body.append(owner);
  owner.focus();
  owners.push(owner);
  const source = createBrowserCommandSource(session.view.GetViewFrame());
  /** Owns native popup dismissal before original command dispatch. @returns Current popup. */
  function Host() {
    const [open, setOpen] = useState(true);
    return open ? (
      <CommandPopupMenu
        ariaLabel="Native mouse popup"
        commandSource={source}
        getCommandResource={getWriterCommandResource}
        position={{ x: 20, y: 30 }}
        resolveArguments={
          /** Retains original command arguments. @returns Undefined. */ () => undefined
        }
        onClose={/** Ends popup lifetime before dispatch. @returns Nothing. */ () => setOpen(false)}
        items={[
          { kind: "command", commandId: ids.bold },
          { kind: "command", commandId: ids.undo },
          {
            kind: "submenu",
            id: "child",
            label: "Child",
            items: [{ kind: "command", commandId: ids.italic }],
          },
        ]}
      />
    ) : null;
  }
  render(<Host />);
  return { session, owner, root: screen.getByRole("menu", { name: "Native mouse popup" }) };
}
it.each([1, 2])(
  "native auxiliary button%d executes the original enabled binding once",
  /** Checks actual native state and saved focus after browser auxiliary activation. @param button - Native nonprimary button. @returns Nothing. */ (
    button,
  ) => {
    const f = fixture(),
      bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });
    expect(f.session.view.QueryState(ids.bold).checked).toBe(false);
    fireEvent(bold, new MouseEvent("auxclick", { bubbles: true, cancelable: true, button }));
    expect(screen.queryByRole("menu", { name: "Native mouse popup" })).not.toBeInTheDocument();
    expect(f.owner).toHaveFocus();
    expect(f.session.view.QueryState(ids.bold).checked).toBe(true);
  },
);
it.each([0, 1, 2])(
  "native direct button%d opens the actual child immediately",
  /** Checks source does not restrict direct submenu admission by mouse button. @param button - Actual browser button. @returns Nothing. */ (
    button,
  ) => {
    const f = fixture(),
      child = screen.getByRole("menuitem", { name: "Child" });
    fireEvent.mouseDown(child, { button });
    expect(screen.getByRole("menu", { name: "Child menu" })).toBeVisible();
    expect(screen.getByRole("menuitemcheckbox", { name: "Italic" })).toHaveFocus();
    expect(f.session.view.QueryState(ids.italic).checked).toBe(false);
  },
);
it.each([1, 2])(
  "disabled original command remains disabled for auxiliary button%d",
  /** Checks native binding state cannot be bypassed by auxiliary DOM activation. @param button - Nonprimary button. @returns Nothing. */ (
    button,
  ) => {
    const f = fixture(),
      undo = screen.getByRole("menuitem", { name: "Undo" });
    expect(undo).toBeDisabled();
    fireEvent(undo, new MouseEvent("auxclick", { bubbles: true, cancelable: true, button }));
    expect(f.root).toBeVisible();
    expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it("nested auxiliary command uses its original binding and dismisses the whole popup", /** Checks native child ownership does not replace original slot dispatch. @returns Nothing. */ () => {
  const f = fixture();
  fireEvent.mouseDown(screen.getByRole("menuitem", { name: "Child" }), { button: 2 });
  fireEvent(
    screen.getByRole("menuitemcheckbox", { name: "Italic" }),
    new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 2 }),
  );
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(f.session.view.QueryState(ids.italic).checked).toBe(true);
  expect(f.owner).toHaveFocus();
});
it("browser context menu is canceled within the owning original popup", /** Checks browser default context handling cannot replace the native resource. @returns Nothing. */ () => {
  const f = fixture();
  expect(fireEvent.contextMenu(screen.getByRole("menuitemcheckbox", { name: "Bold" }))).toBe(false);
  expect(f.root).toBeVisible();
  expect(f.session.view.QueryState(ids.bold).checked).toBe(false);
});
it.each(["click", "keyboard"])(
  "existing native %s activation retains the original binding",
  /** Checks ordinary browser and native key activation remain intact. @param input - Existing route. @returns Nothing. */ (
    input,
  ) => {
    const f = fixture(),
      bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });
    if (input === "click") fireEvent.click(bold);
    else {
      act(/** Selects the actual original command entry. @returns Nothing. */ () => bold.focus());
      fireEvent.keyDown(bold, { key: "Enter" });
    }
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(f.session.view.QueryState(ids.bold).checked).toBe(true);
  },
);
