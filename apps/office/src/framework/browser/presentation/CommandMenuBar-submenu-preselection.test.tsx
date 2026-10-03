/** @fileoverview Verifies pointer popup focus separately from keyboard item preselection. */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { BrowserCommandSource } from "./command-surface";
import { CommandMenuBar } from "./CommandMenuBar";

/** Renders two app-owned submenus with enabled commands. @returns Mounted fixture and dispatch spy. */
function renderPreselectionMenu() {
  const state = { enabled: true };
  const execute = vi.fn(
    /** Records one owned dispatch. @param commandId - Command identity. @returns Dispatch result. */ (
      commandId: string,
    ) => ({ commandId, status: "executed" as const, value: undefined }),
  );
  const source: BrowserCommandSource = {
    CreateControllerItem:
      /** Creates a stable bindings fixture. @returns Controller item. */ () => ({
        Dispose: /** Releases no fixture resources. @returns Nothing. */ () => undefined,
        GetState: /** Returns the stable enabled snapshot. @returns Command state. */ () => state,
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
                { kind: "command", commandId: "Last" },
              ],
            },
            {
              id: "spacing",
              kind: "submenu",
              label: "Spacing",
              items: [{ kind: "command", commandId: "Indent" }],
            },
          ],
        },
      ]}
      resolveArguments={/** Supplies no fixture arguments. @returns Undefined. */ () => undefined}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Format" }));
  return { ...mounted, execute, trigger: screen.getByRole("menuitem", { name: "Text" }) };
}

/** Opens the Text submenu by mouse. @returns Popup container. */
function hoverText(): HTMLElement {
  fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Text" }));
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
    fireEvent.mouseEnter(screen.getByRole("menuitem", { name: "Spacing" }));
    const popup = screen.getByRole("menu", { name: "Spacing menu" });
    expect(popup).toHaveFocus();
    expect(screen.queryByRole("menu", { name: "Text menu" })).not.toBeInTheDocument();
    fireEvent.click(within(popup).getByRole("menuitem", { name: "Indent" }));
    expect(fixture.execute).toHaveBeenCalledTimes(1);
    expect(fixture.execute).toHaveBeenCalledWith("Indent", undefined);
    expect(screen.queryAllByRole("menu")).toHaveLength(0);
  });

  it("restores parent focus when the pointer closes its child popup", /** Verifies focused popup removal without losing menu keyboard ownership. @returns Nothing. */ function closesPointerPopup(): void {
    const fixture = renderPreselectionMenu();
    hoverText();
    fireEvent.mouseLeave(fixture.trigger);
    expect(screen.queryByRole("menu", { name: "Text menu" })).not.toBeInTheDocument();
    expect(fixture.trigger).toHaveFocus();
    expect(fixture.execute).not.toHaveBeenCalled();
  });

  it("dismisses an unselected top-level popup without dispatch", /** Verifies the shared current-popup close boundary. @returns Nothing. */ function dismissesRootPopup(): void {
    const fixture = renderPreselectionMenu();
    const popup = screen.getByRole("menu", { name: "Format menu" });
    popup.focus();
    fireEvent.keyDown(popup, { key: "Enter" });
    expect(screen.queryAllByRole("menu")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Format" })).toHaveFocus();
    expect(fixture.execute).not.toHaveBeenCalled();
  });
});
