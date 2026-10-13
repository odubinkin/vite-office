/** @fileoverview Verifies popup focus, navigation and execution using original native frame bindings. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  CommandPopupMenu,
  type CommandPopupMenuProps,
} from "../../../framework/browser/presentation/CommandPopupMenu";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { WRITER_COMMAND_IDS as ids } from "../../uiconfig/swriter/menubar/menubar-commands";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [];
const owners: HTMLElement[] = [];
afterEach(
  /** Releases all original command subscriptions and focus owners. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    for (const s of sessions.splice(0)) s.Close();
    for (const el of owners.splice(0)) el.remove();
  },
);
/** Mounts a focus-owning popup over real native command bindings. @param items - Resource placements. @param localized - Whether submenu labels are localized. @returns Native source and saved/outside owners. */
function fixture(
  items: CommandPopupMenuProps["items"] = [
    { kind: "command", commandId: "missing" },
    { kind: "separator" },
    { kind: "command", commandId: ids.bold },
    {
      kind: "submenu",
      id: "child",
      label: "Child",
      items: [
        { kind: "command", commandId: ids.italic },
        {
          kind: "submenu",
          id: "deep",
          label: "Deep",
          items: [{ kind: "command", commandId: ids.bold }],
        },
      ],
    },
    { kind: "command", commandId: ids.italic },
  ],
  localized = false,
) {
  const s = createWriterDocumentSession();
  sessions.push(s);
  const owner = document.createElement("input"),
    outside = document.createElement("input");
  document.body.append(owner, outside);
  owners.push(owner, outside);
  owner.focus();
  const source = createBrowserCommandSource(s.view.GetViewFrame());
  /** Owns popup dismissal as the application does. @returns Popup while active. */ function Host() {
    const [open, setOpen] = useState(true);
    return open ? (
      <CommandPopupMenu
        ariaLabel="Original popup"
        commandSource={source}
        getCommandResource={
          /** Supplies test presentation labels over original live slot state. @param id - Native URL. @returns Resource label. */ (
            id,
          ) => ({
            label: id === ids.bold ? "Alpha" : id === ids.italic ? "Beta" : "Disabled",
            semantics: "action",
            shortcuts: [],
          })
        }
        {...(localized
          ? {
              getMenuLabel:
                /** Localizes only resource labels. @param _id - Native identity. @param label - Resource text. @returns Localized text. */ (
                  _id: string,
                  label: string,
                ) => "Localized " + label,
            }
          : {})}
        items={items}
        onClose={/** Releases the popup before dispatch. @returns Nothing. */ () => setOpen(false)}
        position={{ x: 20, y: 30 }}
        resolveArguments={/** Uses native default arguments. @returns Undefined. */ () => undefined}
      />
    ) : null;
  }
  const mounted = render(<Host />);
  return { s, source, owner, outside, mounted };
}
it("standalone native popup starts unselected and includes disabled entries by source default", /** Checks source standalone no-first-preselection and wrap/boundaries. @returns Nothing. */ () => {
  const f = fixture(),
    menu = screen.getByRole("menu", { name: "Original popup" }),
    a = within(menu).getByRole("menuitem", { name: "Alpha" }),
    b = within(menu).getByRole("menuitem", { name: "Beta" });
  expect(menu).toHaveFocus();
  expect(screen.getByRole("menuitem", { name: "Disabled" })).toBeDisabled();
  fireEvent.keyDown(menu, { key: "ArrowUp" });
  expect(b).toHaveFocus();
  fireEvent.keyDown(b, { key: "ArrowDown" });
  expect(screen.getByRole("menuitem", { name: "Disabled" })).toHaveAttribute(
    "data-popup-highlighted",
    "true",
  );
  expect(menu).toHaveFocus();
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  expect(a).toHaveFocus();
  fireEvent.keyDown(a, { key: "Home" });
  expect(screen.getByRole("menuitem", { name: "Disabled" })).toHaveAttribute(
    "data-popup-highlighted",
    "true",
  );
  expect(menu).toHaveFocus();
  fireEvent.keyDown(menu, { key: "ArrowUp" });
  expect(b).toHaveFocus();
  fireEvent.keyDown(a, { key: "End" });
  expect(b).toHaveFocus();
  fireEvent.keyDown(b, { key: "ArrowRight" });
  expect(b).toHaveFocus();
  fireEvent.keyDown(b, { key: "ArrowLeft" });
  expect(menu).toBeVisible();
  fireEvent.keyDown(b, { key: "x" });
  expect(b).toHaveFocus();
  fireEvent.keyDown(b, { key: "Escape" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(f.owner).toHaveFocus();
});
it("actual command dispatch observes completed popup teardown and restored focus", /** Checks synchronous final native execute boundary. @returns Nothing. */ () => {
  const f = fixture(),
    dispatcher = f.s.view.GetViewFrame().GetDispatcher(),
    execute = dispatcher.Execute.bind(dispatcher),
    observer = vi.spyOn(dispatcher, "Execute").mockImplementation(
      /** Observes actual boundary then executes native command. @param id - Original URL. @param args - Native arguments. @returns Original native result. */ (
        id,
        args,
      ) => {
        expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        expect(f.owner).toHaveFocus();
        return execute(id, args);
      },
    );
  fireEvent.keyDown(screen.getByRole("menuitem", { name: "Alpha" }), { key: "Enter" });
  expect(observer).toHaveBeenCalledOnce();
  expect(f.s.view.QueryState(ids.bold).checked).toBe(true);
});
it("native popup Space does not replace the explicit Return command route", /** Checks source keyboard default handling cannot invent a command execution. @returns Nothing. */ () => {
  const f = fixture(),
    item = screen.getByRole("menuitem", { name: "Alpha" }),
    execute = vi.spyOn(f.s.view.GetViewFrame().GetDispatcher(), "Execute");
  act(/** Highlights an actual enabled entry. @returns Nothing. */ () => item.focus());
  expect(fireEvent.keyDown(item, { key: " " })).toBe(false);
  expect(execute).not.toHaveBeenCalled();
  expect(item).toHaveFocus();
  expect(screen.getByRole("menu", { name: "Original popup" })).toBeVisible();
});
it("keyboard children retain parent ownership and close one level at a time", /** Checks actual submenu key focus and nested ordering. @returns Nothing. */ () => {
  const f = fixture(),
    child = screen.getByRole("menuitem", { name: "Child" });
  fireEvent.keyDown(child, { key: "ArrowRight" });
  const sub = screen.getByRole("menu", { name: "Child menu" });
  expect(within(sub).getByRole("menuitem", { name: "Beta" })).toHaveFocus();
  const deep = within(sub).getByRole("menuitem", { name: "Deep" });
  fireEvent.keyDown(deep, { key: "Enter" });
  const leaf = screen.getByRole("menu", { name: "Deep menu" });
  expect(within(leaf).getByRole("menuitem", { name: "Alpha" })).toHaveFocus();
  fireEvent.keyDown(leaf, { key: "Escape" });
  expect(deep).toHaveFocus();
  expect(screen.queryByRole("menu", { name: "Deep menu" })).not.toBeInTheDocument();
  fireEvent.keyDown(deep, { key: "ArrowLeft" });
  expect(child).toHaveFocus();
  fireEvent.keyDown(child, { key: "Enter" });
  expect(screen.getByRole("menu", { name: "Child menu" })).toBeVisible();
  fireEvent.keyDown(screen.getByRole("menu", { name: "Child menu" }), { key: "F6", ctrlKey: true });
  expect(child).toHaveFocus();
  fireEvent.keyDown(child, { key: "F6", ctrlKey: true });
  expect(f.owner).toHaveFocus();
});
it("pointer child opening stays unselected and sibling departure closes its descendants", /** Checks pointer policy independently of key preselection. @returns Nothing. */ () => {
  fixture(undefined, true);
  const child = screen.getByRole("menuitem", { name: "Localized Child" });
  fireEvent.mouseLeave(child.parentElement as HTMLElement);
  expect(screen.queryByRole("menu", { name: "Localized Child menu" })).not.toBeInTheDocument();
  fireEvent.mouseEnter(child.parentElement as HTMLElement);
  const menu = screen.getByRole("menu", { name: "Localized Child menu" });
  expect(menu).toBeVisible();
  expect(within(menu).getByRole("menuitem", { name: "Beta" })).not.toHaveFocus();
  fireEvent.mouseLeave(child.parentElement as HTMLElement);
  expect(screen.queryByRole("menu", { name: "Localized Child menu" })).not.toBeInTheDocument();
  expect(child).toHaveFocus();
});
it("outside pointer cancellation retains the new owner without a native command", /** Keeps external focus transfer owned by its actual target. @returns Nothing. */ () => {
  const f = fixture(),
    execute = vi.spyOn(f.s.view.GetViewFrame().GetDispatcher(), "Execute");
  fireEvent.mouseDown(f.outside);
  act(/** Gives focus to the outside control. @returns Nothing. */ () => f.outside.focus());
  expect(f.outside).toHaveFocus();
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(execute).not.toHaveBeenCalled();
});
it("outside focus cancellation leaves its new owner focused", /** Checks keyboard focus exit without stealing focus back. @returns Nothing. */ () => {
  const f = fixture();
  act(/** Transfers actual document focus outside. @returns Nothing. */ () => f.outside.focus());
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(f.outside).toHaveFocus();
});
it("disconnected saved owner is not revived on dismissal", /** Checks actual focus owner removal during popup execution. @returns Nothing. */ () => {
  const f = fixture();
  f.owner.remove();
  fireEvent.keyDown(screen.getByRole("menu", { name: "Original popup" }), { key: "Escape" });
  expect(f.owner.isConnected).toBe(false);
  expect(document.activeElement).not.toBe(f.owner);
});
it("empty native popup admits navigation and cancellation without a fabricated entry", /** Checks resource-empty live frame input. @returns Nothing. */ () => {
  fixture([]);
  const menu = screen.getByRole("menu", { name: "Original popup" });
  for (const key of ["ArrowUp", "ArrowDown", "Home", "End", " ", "ArrowRight"])
    fireEvent.keyDown(menu, { key });
  expect(menu).toHaveFocus();
  fireEvent.keyDown(menu, { key: "Enter" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});
it("unavailable saved focus does not invent a replacement owner on cancellation", /** Checks a transient device focus query failure without changing native dispatch. @returns Nothing. */ () => {
  const query = vi.spyOn(document, "activeElement", "get").mockReturnValue(null),
    f = fixture();
  query.mockRestore();
  const menu = screen.getByRole("menu", { name: "Original popup" });
  fireEvent.keyDown(menu, { key: "Escape" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(f.owner).not.toHaveFocus();
});
it("empty child grabs popup focus without fabricating an enabled command", /** Checks child keyboard focus independently of command preselection. @returns Nothing. */ () => {
  fixture([{ kind: "submenu", id: "empty", label: "Empty", items: [] }]);
  const trigger = screen.getByRole("menuitem", { name: "Empty" });
  fireEvent.keyDown(trigger, { key: "ArrowRight" });
  const menu = screen.getByRole("menu", { name: "Empty menu" });
  expect(menu).toHaveFocus();
  fireEvent.keyDown(menu, { key: "ArrowLeft" });
  expect(trigger).toHaveFocus();
});
it("temporarily unavailable child lookup retains popup ownership and admits cancellation", /** Checks device lookup failure while retaining original resource and commands. @returns Nothing. */ () => {
  fixture();
  const menu = screen.getByRole("menu", { name: "Original popup" }),
    root = menu.parentElement as HTMLElement,
    lookup = vi.spyOn(root, "querySelector").mockReturnValue(null),
    trigger = screen.getByRole("menuitem", { name: "Child" });
  fireEvent.keyDown(trigger, { key: "ArrowRight" });
  lookup.mockRestore();
  const child = screen.getByRole("menu", { name: "Child menu" });
  expect(child).toBeVisible();
  fireEvent.keyDown(child, { key: "Escape" });
  expect(trigger).toHaveFocus();
});
it("reusing an active child retains its current selected entry", /** Prevents repeated pointer ownership from resetting keyboard selection. @returns Nothing. */ () => {
  fixture();
  const trigger = screen.getByRole("menuitem", { name: "Child" });
  fireEvent.keyDown(trigger, { key: "ArrowRight" });
  const child = screen.getByRole("menu", { name: "Child menu" }),
    entry = within(child).getByRole("menuitem", { name: "Beta" });
  expect(entry).toHaveFocus();
  fireEvent.mouseEnter(trigger.parentElement as HTMLElement);
  expect(entry).toHaveFocus();
});
