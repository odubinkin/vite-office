/** @fileoverview Checks source Ctrl-F6 cancellation through actual Writer bindings and original popup owners. */
import { cleanup, createEvent, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { CommandMenuBar } from "../../../framework/browser/presentation/CommandMenuBar";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { WRITER_COMMAND_IDS as ids } from "../../uiconfig/swriter/menubar/menubar-commands";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [],
  owners: HTMLElement[] = [];
afterEach(
  /** Releases original native bindings and focus owners. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
    for (const o of owners.splice(0)) o.remove();
  },
);
/** Mounts native commands with original external and document focus owners. @param callback - Whether a frame-client callback is attached. @returns Original owners. */
function fixture(callback = true) {
  const session = createWriterDocumentSession(),
    owner = document.createElement("input"),
    client = document.createElement("textarea");
  sessions.push(session);
  owners.push(owner, client);
  document.body.append(owner, client);
  owner.focus();
  render(
    <CommandMenuBar
      ariaLabel="Native document key menus"
      commandSource={createBrowserCommandSource(session.view.GetViewFrame())}
      {...(callback
        ? {
            focusDocument: /** Focuses original frame client. @returns Nothing. */ () =>
              client.focus(),
          }
        : {})}
      getCommandResource={getWriterCommandResource}
      idPrefix="native-document-key"
      isInputEnabled
      menus={[
        {
          id: "native",
          label: "Native",
          items: [
            { kind: "command", commandId: ids.undo },
            {
              kind: "submenu",
              id: "child",
              label: "Child",
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
          ],
        },
      ]}
      resolveArguments={/** Uses native slot defaults. @returns Undefined. */ () => undefined}
    />,
  );
  return { session, owner, client, trigger: screen.getByRole("menuitem", { name: "Native" }) };
}
/** Sends original browser Ctrl-F6 and returns its consumption state. @param target - Actual focused owner. @param ctrlKey - Native Mod1 state. @returns Event. */
function f6(target: HTMLElement, ctrlKey = true) {
  const event = createEvent.keyDown(target, {
    key: "F6",
    ctrlKey,
    bubbles: true,
    cancelable: true,
  });
  fireEvent(target, event);
  return event;
}
it.each([true, false])(
  "native trigger Ctrl-F6 deactivates without a popup frameCallback=%s",
  /** Checks saved owner restoration and source document override. @param callback - Attached frame callback. @returns Nothing. */ (
    callback,
  ) => {
    const f = fixture(callback);
    fireEvent.keyDown(f.owner, { key: "F10" });
    expect(f.trigger).toHaveFocus();
    expect(f6(f.trigger).defaultPrevented).toBe(true);
    expect(callback ? f.client : f.owner).toHaveFocus();
    fireEvent.keyDown(callback ? f.client : f.owner, { key: "F10" });
    expect(f.trigger).toHaveFocus();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  },
);
it.each([true, false])(
  "native root Ctrl-F6 closes disabled preselection before focus frameCallback=%s",
  /** Checks native root cleanup without disabled slot dispatch. @param callback - Attached frame callback. @returns Nothing. */ (
    callback,
  ) => {
    const f = fixture(callback);
    fireEvent.keyDown(f.trigger, { key: "ArrowDown" });
    const root = screen.getByRole("menu", { name: "Native menu" });
    expect(root).toHaveFocus();
    expect(f6(root).defaultPrevented).toBe(true);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(callback ? f.client : f.owner).toHaveFocus();
    expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it.each([false, true])(
  "native child Ctrl-F6 returns only to its immediate parent deeper=%s",
  /** Checks source pStartedFrom ownership before global document focus. @param deeper - Whether to open another existing recursive child. @returns Nothing. */ (
    deeper,
  ) => {
    const f = fixture();
    fireEvent.click(f.trigger);
    const root = screen.getByRole("menu", { name: "Native menu" }),
      trigger = screen.getByRole("menuitem", { name: "Child" });
    fireEvent.keyDown(trigger, { key: "ArrowRight" });
    const child = screen.getByRole("menu", { name: "Child menu" });
    const parentTrigger = deeper ? screen.getByRole("menuitem", { name: "Deep" }) : trigger;
    if (deeper) fireEvent.keyDown(parentTrigger, { key: "ArrowRight" });
    const target = screen.getByRole("menu", { name: deeper ? "Deep menu" : "Child menu" });
    expect(f6(target).defaultPrevented).toBe(true);
    expect(
      screen.queryByRole("menu", { name: deeper ? "Deep menu" : "Child menu" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("menu", { name: "Native menu" })).toBe(root);
    if (deeper) expect(screen.getByRole("menu", { name: "Child menu" })).toBe(child);
    expect(parentTrigger).toHaveFocus();
    expect(f.client).not.toHaveFocus();
    expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it("native plain F6 remains unconsumed on trigger, root and child", /** Checks native unmodified F6 has no cancellation route. @returns Nothing. */ () => {
  const f = fixture();
  f.trigger.focus();
  expect(f6(f.trigger, false).defaultPrevented).toBe(false);
  expect(f.trigger).toHaveFocus();
  fireEvent.click(f.trigger);
  const root = screen.getByRole("menu", { name: "Native menu" });
  expect(f6(root, false).defaultPrevented).toBe(false);
  expect(root).toHaveFocus();
  fireEvent.keyDown(screen.getByRole("menuitem", { name: "Child" }), { key: "ArrowRight" });
  const child = screen.getByRole("menu", { name: "Child menu" }),
    bold = screen.getByRole("menuitemcheckbox", { name: "Bold" });
  expect(f6(bold, false).defaultPrevented).toBe(false);
  expect(bold).toHaveFocus();
  expect(child).toBeVisible();
});
