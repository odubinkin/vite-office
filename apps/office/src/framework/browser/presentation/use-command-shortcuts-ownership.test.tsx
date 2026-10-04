/** @fileoverview Checks accelerator fallback after local browser key handling. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SfxDispatcher } from "../../../sfx2/source/control/dispatch";
import { useCommandShortcuts } from "./use-command-shortcuts";

afterEach(cleanup);

/** Supplies controlled accelerator results behind an actual bubbling local key owner.
 * @param status - Dispatcher execution result.
 * @returns Mounted fixture and command-boundary spies.
 */
function mountAdapter(status = "executed") {
  const lookup = vi.fn(
    /** Resolves the registered test accelerator. @returns Command descriptor or absence. */ ():
      { command: { id: string } } | undefined => ({
      command: { id: ".uno:Bold" },
    }),
  );
  const execute = vi.fn(
    /** Reports command execution. @returns Execution state. */ () => ({ status }),
  );
  const arguments_ = vi.fn(
    /** Resolves command arguments only after key ownership. @returns Arguments. */ () => ({}),
  );
  const dispatcher = { FindCommandByShortcut: lookup } as unknown as SfxDispatcher;
  /** Mounts an active adapter with an enclosing local handler.
   * @param props - Current adapter eligibility.
   * @param props.active - Whether global shortcuts are enabled.
   * @param props.consume - Whether the child handles the key.
   * @returns Key-owning button.
   */
  function Host({ active = true, consume = false }: { active?: boolean; consume?: boolean }) {
    useCommandShortcuts({
      dispatcher,
      executeCommand: execute,
      isActive: active,
      resolveArguments: arguments_,
    });
    return (
      <button
        onKeyDown={
          /** Handles the key without stopping its propagation. @param event - Local input. @returns Nothing. */
          (event) => {
            if (consume) event.preventDefault();
          }
        }
        type="button"
      >
        Local owner
      </button>
    );
  }
  const view = render(<Host />);
  return { lookup, execute, arguments_, owner: screen.getByRole("button"), view, Host };
}

describe("browser accelerator ownership", /** Groups local-handled key fallback. @returns Nothing. */ () => {
  it("does not resolve an already consumed native key", /** Checks the ownership gate precedes every command-boundary effect. @returns Nothing. */ () => {
    const fixture = mountAdapter();
    const event = new KeyboardEvent("keydown", { key: "b", ctrlKey: true, cancelable: true });
    event.preventDefault();
    window.dispatchEvent(event);
    expect(fixture.lookup).not.toHaveBeenCalled();
    expect(fixture.arguments_).not.toHaveBeenCalled();
    expect(fixture.execute).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(true);
  });

  for (const modifier of ["ctrlKey", "metaKey"] as const) {
    it(`leaves locally consumed ${modifier} keys owned before later fallback`, /** Checks React consumption, focus and subsequent unconsumed dispatch. @returns Nothing. */ function preservesLocalOwner(): void {
      const fixture = mountAdapter();
      fixture.view.rerender(<fixture.Host consume />);
      fixture.owner.focus();
      expect(fireEvent.keyDown(fixture.owner, { key: "b", [modifier]: true })).toBe(false);
      expect(fixture.lookup).not.toHaveBeenCalled();
      expect(fixture.arguments_).not.toHaveBeenCalled();
      expect(fixture.execute).not.toHaveBeenCalled();
      expect(fixture.owner).toHaveFocus();
      fixture.view.rerender(<fixture.Host />);
      expect(fireEvent.keyDown(fixture.owner, { key: "b", [modifier]: true })).toBe(false);
      expect(fixture.lookup).toHaveBeenCalledExactlyOnceWith(
        modifier === "ctrlKey" ? "Ctrl+B" : "Meta+B",
      );
      expect(fixture.arguments_).toHaveBeenCalledExactlyOnceWith(".uno:Bold");
      expect(fixture.execute).toHaveBeenCalledExactlyOnceWith(".uno:Bold", {});
    });
  }

  it("keeps declined, unknown and modifier-only input available", /** Checks unchanged fallback contracts for unowned input. @returns Nothing. */ () => {
    const fixture = mountAdapter("disabled");
    expect(fireEvent.keyDown(fixture.owner, { key: "b", ctrlKey: true })).toBe(true);
    expect(fixture.execute).toHaveBeenCalledOnce();
    fixture.lookup.mockReturnValueOnce(undefined);
    expect(fireEvent.keyDown(fixture.owner, { key: "F8" })).toBe(true);
    expect(fixture.execute).toHaveBeenCalledOnce();
    expect(fireEvent.keyDown(fixture.owner, { key: "Control", ctrlKey: true })).toBe(true);
    expect(fixture.lookup).toHaveBeenCalledTimes(2);
  });

  it("respects active changes and removes the listener on disposal", /** Checks ownership does not extend accelerator lifetime. @returns Nothing. */ () => {
    const fixture = mountAdapter();
    fixture.view.rerender(<fixture.Host active={false} />);
    expect(fireEvent.keyDown(fixture.owner, { key: "b", ctrlKey: true })).toBe(true);
    expect(fixture.lookup).not.toHaveBeenCalled();
    fixture.view.rerender(<fixture.Host />);
    fireEvent.keyDown(fixture.owner, { key: "b", ctrlKey: true });
    expect(fixture.execute).toHaveBeenCalledOnce();
    fixture.view.unmount();
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b", ctrlKey: true }));
    expect(fixture.execute).toHaveBeenCalledOnce();
  });
});
