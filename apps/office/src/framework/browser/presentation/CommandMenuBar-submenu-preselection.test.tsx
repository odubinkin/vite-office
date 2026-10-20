/** @fileoverview Verifies pointer popup focus separately from keyboard item preselection. */
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { BrowserCommandSource } from "./command-surface";
import { CommandMenuBar } from "./CommandMenuBar";

/** Renders two app-owned submenus with enabled commands. @returns Mounted fixture and dispatch spy. */
function renderPreselectionMenu() {
  const state = { enabled: true },
    disabled = { enabled: false };
  const execute = vi.fn(
    /** Records one owned dispatch. @param commandId - Command identity. @returns Dispatch result. */ (
      commandId: string,
    ) => ({ commandId, status: "executed" as const, value: undefined }),
  );
  const source: BrowserCommandSource = {
    CreateControllerItem:
      /** Creates a stable bindings fixture. @param commandId - Actual fixture command. @returns Controller item. */ (
        commandId,
      ) => ({
        Dispose: /** Releases no fixture resources. @returns Nothing. */ () => undefined,
        GetState: /** Returns the stable enabled snapshot. @returns Command state. */ () =>
          commandId === "Disabled" ? disabled : state,
        Subscribe: /** Registers no fixture invalidation. @returns Cleanup. */ () =>
          /** Releases no subscription. @returns Nothing. */ () =>
            undefined,
      }),
    Execute: execute,
    QueryCommand:
      /** Resolves one owned descriptor. @param id - Command identity. @returns Descriptor. */ (
        id,
      ) => ({
        id,
        label: id,
        execute: /** Performs no fixture mutation. @returns Nothing. */ () => undefined,
      }),
  };
  const mounted = render(
    <CommandMenuBar
      ariaLabel="Preselection menus"
      commandSource={source}
      getCommandResource={
        /** Supplies the owned command label. @param id - Command identity. @returns Resource. */ (
          id,
        ) => ({ label: id, semantics: "action", shortcuts: [] })
      }
      idPrefix="preselection"
      menus={[
        {
          id: "format",
          label: "Format",
          items: [
            {
              id: "text",
              kind: "submenu",
              label: "Text",
              items: [
                { kind: "command", commandId: "First" },
                { kind: "command", commandId: "Middle" },
                {
                  id: "nested",
                  kind: "submenu",
                  label: "Nested",
                  items: [{ kind: "command", commandId: "NestedFirst" }],
                },
                { kind: "command", commandId: "Last" },
              ],
            },
            {
              id: "spacing",
              kind: "submenu",
              label: "Spacing",
              items: [{ kind: "command", commandId: "Indent" }],
            },
            { kind: "command", commandId: "Disabled" },
            { kind: "separator" },
            { id: "empty", kind: "submenu", label: "Empty", items: [] },
          ],
        },
      ]}
      resolveArguments={/** Supplies no fixture arguments. @returns Undefined. */ () => undefined}
    />,
  );
  fireEvent.click(screen.getByRole("menuitem", { name: "Format" }));
  return { ...mounted, execute, trigger: screen.getByRole("menuitem", { name: "Text" }) };
}

/** Moves within an actual popup beyond its first native ignored movement. @param entry - Actual entry. @returns Nothing. */
function move(entry: HTMLElement): void {
  fireEvent.mouseMove(entry, { clientX: 10, clientY: 10 });
  fireEvent.mouseMove(entry, { clientX: 11, clientY: 11 });
}
/** Runs actual popup admission timers under React commit. @param milliseconds - Elapsed native timer duration. @returns Nothing. */
function advance(milliseconds = 150): void {
  act(
    /** Commits expired popup timers. @returns Nothing. */ () => {
      vi.advanceTimersByTime(milliseconds);
    },
  );
}
beforeEach(
  /** Controls the original150ms timer. @returns Nothing. */ () => {
    vi.useFakeTimers();
  },
);
afterEach(
  /** Destroys windows before restoring real timers. @returns Nothing. */ () => {
    cleanup();
    vi.useRealTimers();
  },
);
/** Opens the Text submenu by mouse. @returns Popup container. */
function hoverText(): HTMLElement {
  move(screen.getByRole("menu", { name: "Format menu" }));
  move(screen.getByRole("menuitem", { name: "Text" }));
  advance();
  return screen.getByRole("menu", { name: "Text menu" });
}

describe("submenu preselection", /** Groups pointer and keyboard opening contracts. @returns Nothing. */ function definePreselectionTests(): void {
  it("focuses a pointer-opened popup without preselecting a command", /** Verifies native popup focus without an item highlight. @returns Nothing. */ function focusesUnselectedPopup(): void {
    const fixture = renderPreselectionMenu();
    fixture.trigger.focus();
    const popup = hoverText();
    expect(popup).toHaveFocus();
    expect(popup).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("menuitem", { name: "First" })).not.toHaveFocus();
    expect(fixture.execute).not.toHaveBeenCalled();
  });

  for (const key of ["ArrowRight", "Enter", " "]) {
    it(`preselects the first command when opened with ${JSON.stringify(key)}`, /** Verifies retained keyboard opening. @returns Nothing. */ function preselectsKeyboardItem(): void {
      const fixture = renderPreselectionMenu();
      fixture.trigger.focus();
      fireEvent.keyDown(fixture.trigger, { key });
      expect(screen.getByRole("menuitem", { name: "First" })).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }

  for (const [key, label] of [
    ["ArrowDown", "First"],
    ["Home", "First"],
    ["ArrowUp", "Last"],
    ["End", "Last"],
  ] as const) {
    it(`selects ${label} from an unselected popup with ${key}`, /** Verifies native boundary navigation without dispatch. @returns Nothing. */ function navigatesUnselectedPopup(): void {
      const fixture = renderPreselectionMenu();
      const popup = hoverText();
      popup.focus();
      fireEvent.keyDown(popup, { key });
      expect(screen.getByRole("menuitem", { name: label })).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }

  for (const key of ["Enter", "Escape", "ArrowLeft"]) {
    it(`closes only the unselected submenu with ${key}`, /** Verifies no-command dismissal and parent restoration. @returns Nothing. */ function dismissesUnselectedPopup(): void {
      const fixture = renderPreselectionMenu();
      const popup = hoverText();
      popup.focus();
      fireEvent.keyDown(popup, { key });
      expect(screen.queryByRole("menu", { name: "Text menu" })).not.toBeInTheDocument();
      expect(screen.getByRole("menu", { name: "Format menu" })).toBeInTheDocument();
      expect(fixture.trigger).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }

  it("preserves selection on repeated hover and resets opening origin after close", /** Verifies current-popup reuse and pointer/keyboard reopening. @returns Nothing. */ function reopensWithRequestedOrigin(): void {
    const fixture = renderPreselectionMenu();
    fireEvent.keyDown(fixture.trigger, { key: "ArrowRight" });
    const last = screen.getByRole("menuitem", { name: "Last" });
    last.focus();
    fireEvent.mouseEnter(fixture.trigger);
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: "Escape" });
    expect(hoverText()).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menu", { name: "Text menu" }), { key: "ArrowLeft" });
    fireEvent.keyDown(fixture.trigger, { key: "Enter" });
    expect(screen.getByRole("menuitem", { name: "First" })).toHaveFocus();
    expect(fixture.execute).not.toHaveBeenCalled();
  });

  it("focuses a newly hovered sibling popup without dispatch and retains pointer execution", /** Verifies sibling switching and single command activation. @returns Nothing. */ function switchesPointerPopup(): void {
    const fixture = renderPreselectionMenu();
    fireEvent.keyDown(fixture.trigger, { key: "ArrowRight" });
    move(screen.getByRole("menuitem", { name: "Spacing" }));
    advance();
    const popup = screen.getByRole("menu", { name: "Spacing menu" });
    expect(popup).toHaveFocus();
    expect(screen.queryByRole("menu", { name: "Text menu" })).not.toBeInTheDocument();
    fireEvent.click(within(popup).getByRole("menuitem", { name: "Indent" }));
    expect(fixture.execute).toHaveBeenCalledTimes(1);
    expect(fixture.execute).toHaveBeenCalledWith("Indent", undefined);
    expect(screen.queryAllByRole("menu")).toHaveLength(0);
  });

  it("retains the active child when leaving its highlighted parent entry", /** Preserves original leave behavior for the current active popup. @returns Nothing. */ () => {
    const fixture = renderPreselectionMenu();
    const popup = hoverText();
    fireEvent.mouseLeave(fixture.trigger);
    advance(300);
    expect(popup).toBeInTheDocument();
    expect(fixture.trigger).toHaveAttribute("data-popup-highlighted", "true");
    expect(fixture.execute).not.toHaveBeenCalled();
  });

  it("dismisses an unselected top-level popup without dispatch", /** Verifies the shared current-popup close boundary. @returns Nothing. */ function dismissesRootPopup(): void {
    const fixture = renderPreselectionMenu();
    const popup = screen.getByRole("menu", { name: "Format menu" });
    popup.focus();
    fireEvent.keyDown(popup, { key: "Enter" });
    expect(screen.queryAllByRole("menu")).toHaveLength(0);
    expect(screen.getByRole("menuitem", { name: "Format" })).toHaveFocus();
    expect(fixture.execute).not.toHaveBeenCalled();
  });
});

describe("original popup pointer timers", /** Groups actual window,entry and timer transitions. @returns Nothing. */ () => {
  it("ignores enter and first motion,then admits at150ms without restarting for the same highlight", /** Checks original first-move and ChangeHighlightItem gates. @returns Nothing. */ () => {
    const fixture = renderPreselectionMenu();
    fireEvent.mouseEnter(fixture.trigger);
    advance(300);
    expect(screen.queryByRole("menu", { name: "Text menu" })).not.toBeInTheDocument();
    fireEvent.mouseMove(fixture.trigger);
    advance(300);
    expect(fixture.trigger).not.toHaveAttribute("data-popup-highlighted");
    fireEvent.mouseMove(fixture.trigger);
    advance(149);
    expect(fixture.trigger).toHaveAttribute("data-popup-highlighted", "true");
    expect(screen.queryByRole("menu", { name: "Text menu" })).not.toBeInTheDocument();
    fireEvent.mouseMove(fixture.trigger);
    advance(1);
    expect(screen.getByRole("menu", { name: "Text menu" })).toHaveFocus();
    expect(screen.getByRole("menuitem", { name: "First" })).not.toHaveAttribute(
      "data-popup-highlighted",
    );
    expect(fixture.execute).not.toHaveBeenCalled();
  });
  it("clears invalid highlight and retains the timer's invalid-entry early return", /** Checks leave before admission and original no-entry timer expiry. @returns Nothing. */ () => {
    const fixture = renderPreselectionMenu(),
      root = screen.getByRole("menu", { name: "Format menu" });
    move(fixture.trigger);
    fireEvent.mouseOut(fixture.trigger, { relatedTarget: document.body });
    advance();
    expect(root).not.toHaveAttribute("aria-activedescendant");
    expect(screen.queryByRole("menu", { name: "Text menu" })).not.toBeInTheDocument();
    move(fixture.trigger);
    fireEvent.mouseMove(root);
    advance();
    expect(screen.queryByRole("menu", { name: "Text menu" })).not.toBeInTheDocument();
  });
  it("keeps the old child until sibling admission,and ignores same-window leave transitions", /** Checks the original delayed sibling switch. @returns Nothing. */ () => {
    const fixture = renderPreselectionMenu();
    hoverText();
    const sibling = screen.getByRole("menuitem", { name: "Spacing" });
    fireEvent.mouseOut(fixture.trigger, { relatedTarget: sibling });
    expect(fixture.trigger).toHaveAttribute("data-popup-highlighted", "true");
    move(sibling);
    advance(149);
    expect(screen.getByRole("menu", { name: "Text menu" })).toBeInTheDocument();
    advance(1);
    expect(screen.getByRole("menu", { name: "Spacing menu" })).toHaveFocus();
    expect(screen.queryByRole("menu", { name: "Text menu" })).not.toBeInTheDocument();
  });
  it("highlights disabled commands and closes the old child after delay without dispatch", /** Checks native disabled pointer highlight and leaf admission. @returns Nothing. */ () => {
    const fixture = renderPreselectionMenu();
    hoverText();
    const leaf = screen.getByRole("menuitem", { name: "Disabled" });
    move(leaf);
    expect(leaf).toBeDisabled();
    expect(leaf).toHaveAttribute("data-popup-highlighted", "true");
    advance(149);
    expect(screen.getByRole("menu", { name: "Text menu" })).toBeInTheDocument();
    advance(1);
    expect(screen.queryByRole("menu", { name: "Text menu" })).not.toBeInTheDocument();
    expect(screen.getByRole("menu", { name: "Format menu" })).toHaveFocus();
    expect(fixture.execute).not.toHaveBeenCalled();
  });
  it("delays different-child close and cancels it on child reentry before first-move suppression", /** Checks original child-owned close and cancellation ordering. @returns Nothing. */ () => {
    renderPreselectionMenu();
    const popup = hoverText();
    const leaf = screen.getByRole("menuitem", { name: "Disabled" });
    move(leaf);
    fireEvent.mouseOut(leaf, { relatedTarget: document.body });
    advance(149);
    expect(popup).toBeInTheDocument();
    fireEvent.mouseMove(popup);
    advance(1);
    expect(popup).toBeInTheDocument();
    move(leaf);
    fireEvent.mouseOut(leaf, { relatedTarget: document.body });
    advance(149);
    expect(popup).toBeInTheDocument();
    advance(1);
    expect(popup).not.toBeInTheDocument();
    expect(screen.getByRole("menu", { name: "Format menu" })).toHaveFocus();
  });
  it("preserves separate nested ownership and closes only the nested active child", /** Checks nested bubbling filters and original parent close binding. @returns Nothing. */ () => {
    renderPreselectionMenu();
    const outer = hoverText();
    const nested = screen.getByRole("menuitem", { name: "Nested" });
    move(nested);
    advance();
    const child = screen.getByRole("menu", { name: "Nested menu" });
    expect(child).toHaveFocus();
    const leaf = screen.getByRole("menuitem", { name: "First" });
    move(leaf);
    fireEvent.mouseOut(leaf, { relatedTarget: document.body });
    advance();
    expect(child).not.toBeInTheDocument();
    expect(outer).toBeInTheDocument();
    expect(outer).toHaveFocus();
  });
  it("cancels admission and child-close timers when windows unmount", /** Checks original destruction cleanup with actual mounted ownership. @returns Nothing. */ () => {
    const fixture = renderPreselectionMenu();
    hoverText();
    const leaf = screen.getByRole("menuitem", { name: "Disabled" });
    move(leaf);
    fireEvent.mouseOut(leaf, { relatedTarget: document.body });
    fixture.unmount();
    advance(500);
    expect(screen.queryAllByRole("menu")).toHaveLength(0);
    expect(fixture.execute).not.toHaveBeenCalled();
  });
  it("keeps empty resources closed and retains the child without a parent highlight", /** Checks empty-resource admission and missing-highlight leave guards. @returns Nothing. */ () => {
    renderPreselectionMenu();
    move(screen.getByRole("menuitem", { name: "Empty" }));
    advance();
    expect(screen.queryByRole("menu", { name: "Empty menu" })).not.toBeInTheDocument();
    fireEvent.mouseMove(screen.getByRole("menu", { name: "Format menu" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Text" }));
    const popup = screen.getByRole("menu", { name: "Text menu" });
    fireEvent.mouseOut(screen.getByRole("menuitem", { name: "Text" }), {
      relatedTarget: document.body,
    });
    advance();
    expect(popup).toBeInTheDocument();
  });
});

it("retains focus on the active menubar trigger during leaf highlight admission", /** Checks that hover does not steal an owner outside its popup window. @returns Nothing. */ () => {
  const fixture = renderPreselectionMenu();
  const owner = screen.getByRole("menuitem", { name: "Format" });
  owner.focus();
  move(screen.getByRole("menuitem", { name: "Disabled" }));
  advance();
  expect(owner).toHaveFocus();
  expect(fixture.execute).not.toHaveBeenCalled();
});
