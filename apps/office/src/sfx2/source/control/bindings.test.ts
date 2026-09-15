/** @fileoverview Verifies SfxBindings delegates state, invalidation, versioning, and subscriptions. */

import { describe, expect, it, vi } from "vitest";

import { SfxBindings, type SfxBindingsDispatcher } from "./bindings";

describe("SfxBindings", /** Exercises the frame-owned state facade. @returns Nothing. */ () => {
  it("keeps the frame-owned dispatcher as the single state path" /** Verifies every operation delegates to one dispatcher. @returns Nothing. */, () => {
    const unsubscribe = vi.fn();
    const dispatcher: SfxBindingsDispatcher = {
      GetVersion: vi.fn(/** Returns a stable test generation. @returns Test generation. */ () => 4),
      Invalidate: vi.fn(),
      QueryState: vi.fn(
        /** Returns a stable checked state. @returns Test slot state. */ () => ({
          checked: true,
          enabled: true,
        }),
      ),
      Subscribe: vi.fn(
        /** Returns the test unsubscribe callback. @returns Unsubscribe callback. */ () =>
          unsubscribe,
      ),
    };
    const bindings = new SfxBindings(dispatcher);
    const listener = vi.fn();
    expect(bindings.QueryState(".uno:Bold")).toEqual({ checked: true, enabled: true });
    bindings.Invalidate("document", "selection");
    expect(bindings.GetVersion()).toBe(4);
    expect(bindings.Subscribe(listener)).toBe(unsubscribe);
    expect(dispatcher.QueryState).toHaveBeenCalledWith(".uno:Bold");
    expect(dispatcher.Invalidate).toHaveBeenCalledWith("document", "selection");
    expect(dispatcher.Subscribe).toHaveBeenCalledWith(listener);
  });
});
