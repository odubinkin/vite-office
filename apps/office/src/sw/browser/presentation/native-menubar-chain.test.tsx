/** @fileoverview Checks original native bindings over per-parent recursive menubar popup ownership and nearest parent focus. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import {
  CommandMenuBar,
  type CommandMenuPlacement,
} from "../../../framework/browser/presentation/CommandMenuBar";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../composition/writer-module";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { WRITER_COMMAND_IDS as ids } from "../../uiconfig/swriter/menubar/menubar-commands";
const sessions: ReturnType<typeof createWriterDocumentSession>[] = [],
  owners: HTMLElement[] = [];
afterEach(
  /** Ends original native frame bindings before document disposal. @returns Nothing. */ () => {
    cleanup();
    for (const s of sessions.splice(0)) s.Close();
    for (const owner of owners.splice(0)) owner.remove();
  },
);
/** Owns an existing recursive resource API over actual Writer commands. @returns Original view and session. */
function fixture() {
  const session = createWriterDocumentSession(),
    owner = document.createElement("input");
  sessions.push(session);
  owners.push(owner);
  document.body.append(owner);
  owner.focus();
  const menus: readonly CommandMenuPlacement[] = [
    {
      id: "native",
      label: "Native",
      items: [
        {
          id: "outer",
          kind: "submenu",
          label: "Outer",
          items: [
            { kind: "command", commandId: ids.bold },
            {
              id: "deep",
              kind: "submenu",
              label: "Deep",
              items: [
                { kind: "command", commandId: ids.undo },
                { kind: "command", commandId: ids.italic },
                {
                  id: "last",
                  kind: "submenu",
                  label: "Last",
                  items: [{ kind: "command", commandId: ids.underline }],
                },
              ],
            },
            {
              id: "sibling",
              kind: "submenu",
              label: "Sibling",
              items: [{ kind: "command", commandId: ids.italic }],
            },
            { id: "empty", kind: "submenu", label: "Empty", items: [] },
          ],
        },
        {
          id: "other",
          kind: "submenu",
          label: "Other",
          items: [{ kind: "command", commandId: ids.underline }],
        },
      ],
    },
    { id: "tail", label: "Tail", items: [{ kind: "command", commandId: ids.bold }] },
  ];
  const source = createBrowserCommandSource(session.view.GetViewFrame());
  /** Presents original owned resources for lifecycle reprojection. @param current - Current original placement graph. @returns Menubar. */
  function view(current: readonly CommandMenuPlacement[] = menus) {
    return (
      <CommandMenuBar
        ariaLabel="Native chain menubar"
        commandSource={source}
        getCommandResource={getWriterCommandResource}
        idPrefix="native-chain"
        menus={current}
        resolveArguments={/** Reads native defaults. @returns Undefined. */ () => undefined}
      />
    );
  }
  const mounted = render(view());
  fireEvent.click(screen.getByRole("button", { name: "Native" }));
  return { session, owner, menus, view, ...mounted };
}
/** Opens one original child with ordinary browser keyboard input. @param label - Native resource label. @returns Original child popup. */
function open(label: string) {
  const trigger = screen.getByRole("menuitem", { name: label });
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "ArrowRight" });
  return screen.getByRole("menu", { name: label + " menu" });
}
it("native recursive menubar preserves actual parent popups while opening three child depths", /** Checks actual original DOM identities and native disabled preselection at each level. @returns Nothing. */ () => {
  fixture();
  const root = screen.getByRole("menu", { name: "Native menu" }),
    outer = open("Outer"),
    deep = open("Deep"),
    last = open("Last");
  expect(screen.getByRole("menu", { name: "Native menu" })).toBe(root);
  expect(screen.getByRole("menu", { name: "Outer menu" })).toBe(outer);
  expect(screen.getByRole("menu", { name: "Deep menu" })).toBe(deep);
  expect(last).toBeVisible();
  expect(within(deep).getByRole("menuitem", { name: "Undo" })).toBeDisabled();
  expect(within(last).getByRole("menuitemcheckbox", { name: "Underline" })).toHaveFocus();
});
it.each(["Escape", "ArrowLeft", "Enter"])(
  "native nested menubar closes only the current disabled popup key=%s",
  /** Checks nearest original parent retains its active child without ancestor reselection. @param key - Native cancellation route. @returns Nothing. */ (
    key,
  ) => {
    const f = fixture(),
      outer = open("Outer"),
      deep = open("Deep");
    const undo = within(deep).getByRole("menuitem", { name: "Undo" });
    expect(undo).toHaveAttribute("data-popup-highlighted", "true");
    expect(deep).toHaveFocus();
    fireEvent.keyDown(deep, { key });
    expect(screen.queryByRole("menu", { name: "Deep menu" })).not.toBeInTheDocument();
    expect(screen.getByRole("menu", { name: "Outer menu" })).toBe(outer);
    expect(screen.getByRole("menuitem", { name: "Deep" })).toHaveFocus();
    expect(within(outer).getByRole("menuitemcheckbox", { name: "Bold" })).not.toHaveFocus();
    expect(f.session.docShell.GetDoc().GetUndoManager().GetUndoActionCount()).toBe(0);
  },
);
it("native recursive sibling replacement removes only the previous owned subtree", /** Checks source KillActivePopup leaves its owning parent window intact. @returns Nothing. */ () => {
  fixture();
  const outer = open("Outer");
  open("Deep");
  open("Last");
  const sibling = open("Sibling");
  expect(screen.getByRole("menu", { name: "Outer menu" })).toBe(outer);
  expect(screen.queryByRole("menu", { name: "Deep menu" })).not.toBeInTheDocument();
  expect(screen.queryByRole("menu", { name: "Last menu" })).not.toBeInTheDocument();
  expect(within(sibling).getByRole("menuitemcheckbox", { name: "Italic" })).toHaveFocus();
});
it("native nested empty admission closes its sibling subtree while retaining the original parent", /** Checks prior empty count admission applies to the owning depth. @returns Nothing. */ () => {
  fixture();
  const outer = open("Outer");
  open("Deep");
  open("Last");
  const empty = screen.getByRole("menuitem", { name: "Empty" });
  fireEvent.keyDown(empty, { key: "ArrowRight" });
  expect(screen.getByRole("menu", { name: "Outer menu" })).toBe(outer);
  expect(screen.queryByRole("menu", { name: "Deep menu" })).not.toBeInTheDocument();
  expect(screen.queryByRole("menu", { name: "Last menu" })).not.toBeInTheDocument();
  expect(screen.queryByRole("menu", { name: "Empty menu" })).not.toBeInTheDocument();
  expect(empty).toHaveFocus();
});
it("native recursive pointer children retain original parent windows without preselection", /** Checks ordinary browser pointer ownership at two independent depths. @returns Nothing. */ () => {
  fixture();
  const outerTrigger = screen.getByRole("menuitem", { name: "Outer" });
  fireEvent.mouseEnter(outerTrigger);
  const outer = screen.getByRole("menu", { name: "Outer menu" });
  expect(outer).toHaveFocus();
  const deepTrigger = screen.getByRole("menuitem", { name: "Deep" });
  fireEvent.mouseEnter(deepTrigger);
  const deep = screen.getByRole("menu", { name: "Deep menu" });
  expect(deep).toHaveFocus();
  expect(screen.getByRole("menu", { name: "Outer menu" })).toBe(outer);
  expect(deep).not.toHaveAttribute("aria-activedescendant");
  fireEvent.mouseLeave(deepTrigger.parentElement as HTMLElement, {
    relatedTarget: within(outer).getByRole("menuitemcheckbox", { name: "Bold" }),
  });
  expect(screen.queryByRole("menu", { name: "Deep menu" })).not.toBeInTheDocument();
  expect(deepTrigger).toHaveFocus();
  expect(screen.getByRole("menu", { name: "Outer menu" })).toBe(outer);
});
it("native recursive current child reuse and resource reprojection preserve selection", /** Checks no one-shot opening request is replayed for existing or projected windows. @returns Nothing. */ () => {
  const f = fixture();
  open("Outer");
  const deep = open("Deep"),
    italic = within(deep).getByRole("menuitemcheckbox", { name: "Italic" });
  italic.focus();
  fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Deep" }));
  expect(italic).toHaveFocus();
  f.rerender(f.view([...f.menus]));
  expect(screen.getByRole("menu", { name: "Deep menu" })).toBe(deep);
  expect(italic).toHaveFocus();
});
it("native recursive command teardown closes all windows before original focus and slot execution", /** Checks actual deepest native command and saved external owner. @returns Nothing. */ () => {
  const f = fixture();
  open("Outer");
  open("Deep");
  const last = open("Last");
  fireEvent.keyDown(within(last).getByRole("menuitemcheckbox", { name: "Underline" }), {
    key: "Enter",
  });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(f.owner).toHaveFocus();
  expect(f.session.view.QueryState(ids.underline).checked).toBe(true);
});
it("native recursive right arrow forwards a leaf to the next original menubar root", /** Checks source start-menu routing removes the full old child chain. @returns Nothing. */ () => {
  fixture();
  open("Outer");
  open("Deep");
  const last = open("Last");
  fireEvent.keyDown(within(last).getByRole("menuitemcheckbox", { name: "Underline" }), {
    key: "ArrowRight",
  });
  expect(screen.getByRole("menu", { name: "Tail menu" })).toBeVisible();
  expect(screen.queryByRole("menu", { name: "Native menu" })).not.toBeInTheDocument();
  expect(screen.queryByRole("menu", { name: "Outer menu" })).not.toBeInTheDocument();
  expect(screen.queryByRole("menu", { name: "Deep menu" })).not.toBeInTheDocument();
});
