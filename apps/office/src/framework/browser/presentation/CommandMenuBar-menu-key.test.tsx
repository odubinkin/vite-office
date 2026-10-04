/** @fileoverview Verifies native menu-key activation cycles and frame input eligibility using owned fixtures. */
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CommandMenuBar } from "./CommandMenuBar";
import type { BrowserCommandSource } from "./command-surface";
import { Desktop } from "../app/desktop";
import { createOfficeModuleDescriptors } from "../app/modulemanager";
import { createWriterModuleFactory } from "../../../sw/browser/composition/writer-module";

/** Mounts one owned frame with explicit input eligibility. @param enabled - Frame eligibility. @param id - Frame identity. @param empty - Whether the menu is empty. @returns Controls. */
function mountMenuKey(enabled: boolean | undefined = true, id = "first", empty = false) {
  const state = { enabled: true };
  const execute = vi.fn(
    /** Returns an owned result. @param commandId - Identity. @returns Result. */ (
      commandId: string,
    ) => ({ commandId, status: "executed" as const, value: undefined }),
  );
  const source: BrowserCommandSource = {
    CreateControllerItem: /** Supplies stable state. @returns Controller. */ () => ({
      Dispose: /** Releases nothing. @returns Nothing. */ () => undefined,
      GetState: /** Reads enabled state. @returns State. */ () => state,
      Subscribe: /** Subscribes to no events. @returns Cleanup. */ () =>
        /** Releases nothing. @returns Nothing. */ () =>
          undefined,
    }),
    Execute: execute,
    QueryCommand:
      /** Resolves owned command metadata. @param commandId - Identity. @returns Descriptor. */ (
        commandId,
      ) => ({
        id: commandId,
        label: commandId,
        execute: /** Mutates no data. @returns Nothing. */ () => undefined,
      }),
  };
  const tree =
    /** Renders one frame without changing resources. @param eligibility - Input eligibility. @returns Frame. */ (
      eligibility: boolean | undefined,
    ) => (
      <section aria-label={`${id} frame`}>
        <input aria-label={`${id} document`} />
        <CommandMenuBar
          {...(eligibility === undefined ? {} : { isInputEnabled: eligibility })}
          ariaLabel={`${id} menus`}
          commandSource={source}
          focusDocument={
            /** Focuses this frame's client. @returns Nothing. */ () =>
              screen.getByRole("textbox", { name: `${id} document` }).focus()
          }
          getCommandResource={
            /** Supplies an owned resource. @param commandId - Identity. @returns Resource. */ (
              commandId,
            ) => ({ label: commandId, semantics: "action", shortcuts: [] })
          }
          idPrefix={id}
          menus={
            empty
              ? []
              : [
                  {
                    id: "first",
                    label: "First",
                    items: [
                      { kind: "command", commandId: "Alpha" },
                      {
                        kind: "submenu",
                        id: "child",
                        label: "Child",
                        items: [{ kind: "command", commandId: "Nested" }],
                      },
                    ],
                  },
                  {
                    id: "second",
                    label: "Second",
                    items: [{ kind: "command", commandId: "Delta" }],
                  },
                ]
          }
          resolveArguments={/** Supplies no arguments. @returns Undefined. */ () => undefined}
        />
      </section>
    );
  const result = render(tree(enabled));
  const frame = screen.getByRole("region", { name: `${id} frame` });
  return {
    document: within(frame).getByRole("textbox", { name: `${id} document` }),
    first: within(frame).queryByRole("button", { name: "First" }),
    second: within(frame).queryByRole("button", { name: "Second" }),
    execute,
    unmount: result.unmount,
    setEnabled:
      /** Changes only frame input eligibility. @param eligibility - Next eligibility. @returns Nothing. */ (
        eligibility: boolean | undefined,
      ) => result.rerender(tree(eligibility)),
  };
}

/** Sends one browser menu-key event. @param options - Event overrides. @returns Dispatched event. */
function pressMenuKey(options: KeyboardEventInit = {}): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key: "F10",
    bubbles: true,
    cancelable: true,
    ...options,
  });
  act(
    /** Publishes a native key event. @returns Nothing. */ () => {
      window.dispatchEvent(event);
    },
  );
  return event;
}

describe("menubar menu key", /** Groups activation and frame-routing contracts. @returns Nothing. */ function menuKeyCases(): void {
  it("activates the first root without a popup and restores its saved document on F10", /** Checks one native activation cycle. @returns Nothing. */ function togglesMenuCycle(): void {
    const fixture = mountMenuKey();
    fixture.document.focus();
    expect(pressMenuKey().defaultPrevented).toBe(true);
    expect(fixture.first).toHaveFocus();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(pressMenuKey().defaultPrevented).toBe(true);
    expect(fixture.document).toHaveFocus();
    expect(fixture.execute).not.toHaveBeenCalled();
  });

  it("defaults to its document without a saved owner and resets each cycle to first root", /** Checks default client and fresh activation. @returns Nothing. */ function startsFreshCycle(): void {
    const fixture = mountMenuKey();
    pressMenuKey();
    fireEvent.keyDown(fixture.first as HTMLElement, { key: "ArrowRight" });
    expect(fixture.second).toHaveFocus();
    pressMenuKey();
    expect(fixture.document).toHaveFocus();
    pressMenuKey();
    expect(fixture.first).toHaveFocus();
  });

  for (const child of [false, true]) {
    it(`deactivates the ${child ? "child" : "root"} popup through F10 without executing`, /** Checks root forwarding and cleanup. @returns Nothing. */ function closesPopupCycle(): void {
      const fixture = mountMenuKey();
      fixture.document.focus();
      fireEvent.click(fixture.first as HTMLElement);
      if (child)
        fireEvent.keyDown(screen.getByRole("menuitem", { name: "Child" }), { key: "ArrowRight" });
      pressMenuKey();
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(fixture.document).toHaveFocus();
      expect(fixture.execute).not.toHaveBeenCalled();
    });
  }

  for (const options of [
    { shiftKey: true },
    { ctrlKey: true },
    { altKey: true },
    { metaKey: true },
    { key: "F9" },
  ]) {
    it(`leaves ${JSON.stringify(options)} untouched`, /** Checks unhandled keys keep their native/browser owner. @returns Nothing. */ function preservesOtherKeys(): void {
      const fixture = mountMenuKey();
      fixture.document.focus();
      expect(pressMenuKey(options).defaultPrevented).toBe(false);
      expect(fixture.document).toHaveFocus();
    });
  }

  it("leaves an already consumed menu key untouched", /** Checks event ownership before the frame adapter. @returns Nothing. */ function preservesConsumedKey(): void {
    const fixture = mountMenuKey();
    fixture.document.focus();
    const event = new KeyboardEvent("keydown", { key: "F10", cancelable: true });
    event.preventDefault();
    act(
      /** Sends the consumed key. @returns Nothing. */ () => {
        window.dispatchEvent(event);
      },
    );
    expect(fixture.document).toHaveFocus();
  });

  it("only routes to the eligible frame and observes eligibility changes", /** Checks active/input-enabled frame routing. @returns Nothing. */ function routesEligibleFrame(): void {
    const first = mountMenuKey(false);
    const second = mountMenuKey(true, "second");
    second.document.focus();
    pressMenuKey();
    expect(second.first).toHaveFocus();
    pressMenuKey();
    second.setEnabled(false);
    first.setEnabled(true);
    first.document.focus();
    pressMenuKey();
    expect(first.first).toHaveFocus();
  });

  it("ignores a disabled frame and removes its listener when unmounted", /** Checks rejection and listener lifetime. @returns Nothing. */ function removesListener(): void {
    const fixture = mountMenuKey(false);
    fixture.document.focus();
    expect(pressMenuKey().defaultPrevented).toBe(false);
    fixture.setEnabled(true);
    fixture.unmount();
    expect(pressMenuKey().defaultPrevented).toBe(false);
  });

  it("does not consume a key when no first root exists", /** Checks a detached empty adapter has no usable menu. @returns Nothing. */ function ignoresEmptyMenu(): void {
    const fixture = mountMenuKey(true, "first", true);
    fixture.document.focus();
    expect(pressMenuKey().defaultPrevented).toBe(false);
    expect(fixture.document).toHaveFocus();
  });

  it("requires explicit frame eligibility for the global menu key", /** Checks the detached presenter default. @returns Nothing. */ function ignoresUnattachedMenu(): void {
    const fixture = mountMenuKey();
    fixture.setEnabled(undefined);
    fixture.document.focus();
    expect(pressMenuKey().defaultPrevented).toBe(false);
    expect(fixture.document).toHaveFocus();
  });

  it("activates the actual Writer menu from its editing host", /** Checks real frame eligibility wiring. @returns Nothing. */ function activatesWriterMenu(): void {
    globalThis.history.replaceState(null, "", "/writer");
    render(<Desktop modules={createOfficeModuleDescriptors([createWriterModuleFactory()])} />);
    const editor = screen.getByLabelText("Writer document body");
    editor.focus();
    pressMenuKey();
    expect(screen.getByRole("button", { name: "File" })).toHaveFocus();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    pressMenuKey();
    expect(editor).toHaveFocus();
  });
});
