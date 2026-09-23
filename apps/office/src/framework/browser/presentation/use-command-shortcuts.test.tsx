/** @fileoverview Verifies that browser shortcuts consume only executed commands. */

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { SfxDispatcher } from "../../../sfx2/source/control/dispatch";
import { useCommandShortcuts } from "./use-command-shortcuts";

describe("browser command shortcuts", /** Groups browser command shortcuts. @returns Test callback result. */ () => {
  it("leaves a recognized key event available when command execution is declined", /** Checks leaves a recognized key event available when command execution is declined. @returns Test callback result. */ () => {
    const executeCommand = vi.fn(
      /** Runs the test callback. @returns Test callback result. */ () => ({ status: "disabled" }),
    );
    const dispatcher = {
      FindCommandByShortcut: vi.fn(
        /** Runs the test callback. @returns Test callback result. */ () => ({
          command: { id: "Bold" },
        }),
      ),
    } as unknown as SfxDispatcher;
    /** Runs the Host test helper. @param value0 - Test input. @returns Test callback result. */ function Host({
      isActive,
    }: {
      isActive: boolean;
    }) {
      useCommandShortcuts({
        dispatcher,
        executeCommand,
        isActive,
        resolveArguments: /** Runs the test callback. @returns Test callback result. */ () => ({}),
      });
      return null;
    }
    const view = render(<Host isActive />);
    const event = new KeyboardEvent("keydown", { key: "b", ctrlKey: true, cancelable: true });
    window.dispatchEvent(event);
    expect(executeCommand).toHaveBeenCalledWith("Bold", {});
    expect(event.defaultPrevented).toBe(false);
    view.rerender(<Host isActive={false} />);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "b", ctrlKey: true }));
    expect(executeCommand).toHaveBeenCalledTimes(1);
    view.unmount();
  });
});
