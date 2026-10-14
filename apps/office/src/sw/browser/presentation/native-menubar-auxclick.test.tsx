/** @fileoverview Checks native menubar middle/right clicks reuse original bindings and browser disabled admission. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { CommandMenuBar } from "../../../framework/browser/presentation/CommandMenuBar";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { WRITER_COMMAND_IDS as ids } from "../../uiconfig/swriter/menubar/menubar-commands";

const sessions: ReturnType<typeof createWriterDocumentSession>[] = [],
  owners: HTMLElement[] = [];
afterEach(
  /** Releases original native sessions and external DOM owners. @returns Nothing. */ () => {
    cleanup();
    for (const session of sessions.splice(0)) session.Close();
    for (const owner of owners.splice(0)) owner.remove();
  },
);
/** Presents the actual Writer native bindings. @returns Original session and focus owner. */
function fixture() {
  const session = createWriterDocumentSession(),
    owner = document.createElement("input");
  sessions.push(session);
  owners.push(owner);
  document.body.append(owner);
  owner.focus();
  render(
    <CommandMenuBar
      ariaLabel="Native auxiliary menubar"
      commandSource={createBrowserCommandSource(session.view.GetViewFrame())}
      getCommandResource={getWriterCommandResource}
      idPrefix="native-aux"
      menus={[
        {
          id: "native",
          label: "Native",
          items: [
            { kind: "command", commandId: ids.undo },
            { kind: "command", commandId: ids.bold },
            {
              kind: "submenu",
              id: "child",
              label: "Child",
              items: [{ kind: "command", commandId: ids.italic }],
            },
          ],
        },
      ]}
      resolveArguments={/** Reads original native defaults. @returns Undefined. */ () => undefined}
    />,
  );
  return { session, owner, trigger: screen.getByRole("button", { name: "Native" }) };
}
/** Emits the browser-native nonprimary completion event. @param target - Original target. @param button - Native mouse button. @returns Event default cancellation. */
function auxiliary(target: HTMLElement, button: number) {
  const event = new MouseEvent("auxclick", { bubbles: true, cancelable: true, button });
  fireEvent(target, event);
  return event.defaultPrevented;
}
it.each([1, 2])(
  "native auxiliary root toggles the existing popup once button=%s",
  /** Checks native button-neutral root activation and saved focus. @param button - Mouse button. @returns Nothing. */ (
    button,
  ) => {
    const f = fixture();
    expect(auxiliary(f.trigger, button)).toBe(true);
    expect(screen.getByRole("menu")).toHaveFocus();
    expect(f.trigger).toHaveAttribute("aria-expanded", "true");
    auxiliary(f.trigger, button);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(f.owner).toHaveFocus();
  },
);
it.each([1, 2])(
  "native auxiliary command dispatches exactly once and restores original focus button=%s",
  /** Checks actual Sfx command state and original popup teardown. @param button - Mouse button. @returns Nothing. */ (
    button,
  ) => {
    const f = fixture();
    fireEvent.click(f.trigger);
    const bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });
    expect(auxiliary(bold.querySelector("span:last-child") as HTMLElement, button)).toBe(true);
    expect(f.session.view.QueryState(ids.bold).checked).toBe(true);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(f.owner).toHaveFocus();
  },
);
it.each([1, 2])(
  "native auxiliary disabled command keeps the original popup without execution button=%s",
  /** Checks HTML disabled click protection and unchanged native history. @param button - Mouse button. @returns Nothing. */ (
    button,
  ) => {
    const f = fixture();
    fireEvent.click(f.trigger);
    const undo = screen.getByRole("menuitem", { name: "Undo" });
    expect(undo).toBeDisabled();
    expect(auxiliary(undo, button)).toBe(true);
    expect(screen.getByRole("menu")).toBeVisible();
    expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it.each([1, 2])(
  "native auxiliary submenu activates its original nested command once button=%s",
  /** Checks nearest existing submenu button and real nested native state. @param button - Mouse button. @returns Nothing. */ (
    button,
  ) => {
    const f = fixture();
    fireEvent.click(f.trigger);
    auxiliary(screen.getByRole("menuitem", { name: "Child" }), button);
    expect(screen.getByRole("menu", { name: "Child menu" })).toHaveFocus();
    auxiliary(screen.getByRole("menuitemcheckbox", { name: "Italic" }), button);
    expect(f.session.view.QueryState(ids.italic).checked).toBe(true);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(f.owner).toHaveFocus();
  },
);
it("native menubar suppresses browser context menus and ignores auxiliary blank surface", /** Checks actual native menu surface owns context behavior without fabricated dispatch. @returns Nothing. */ () => {
  const f = fixture(),
    bar = screen.getByRole("menubar");
  const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2 });
  fireEvent(bar, event);
  expect(event.defaultPrevented).toBe(true);
  expect(auxiliary(bar, 1)).toBe(true);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(f.session.view.QueryState(ids.bold).checked).toBe(false);
});
