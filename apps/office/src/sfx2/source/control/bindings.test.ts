/** @fileoverview Verifies SfxBindings delegates state, invalidation, versioning, and subscriptions. */

import { describe, expect, it, vi } from "vitest";

import { SfxBindings, type SfxBindingsDispatcher } from "./bindings";
import { SfxControllerItem } from "./ctrlitem";

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

  it("publishes stable slot-specific state through SfxControllerItem", /** Verifies one bindings subscription feeds one command control until disposal. @returns Nothing. */ () => {
    let checked = false;
    let invalidate: (() => void) | undefined;
    const unsubscribe = vi.fn();
    const dispatcher: SfxBindingsDispatcher = {
      GetVersion: /** Returns a stable test generation. @returns Test generation. */ () => 0,
      Invalidate: vi.fn(),
      QueryState: /** Returns current test slot state. @returns Slot state. */ () => ({
        checked,
        enabled: true,
      }),
      Subscribe:
        /** Captures the single bindings listener. @param listener - Invalidation listener. @returns Cleanup. */ (
          listener,
        ) => {
          invalidate = listener;
          return unsubscribe;
        },
    };
    const controller = new SfxControllerItem(".uno:Bold", new SfxBindings(dispatcher));
    const initial = controller.GetState();
    expect(controller.GetState()).toBe(initial);
    const listener = vi.fn();
    const remove = controller.Subscribe(listener);
    invalidate?.();
    expect(controller.GetState()).toBe(initial);
    expect(listener).not.toHaveBeenCalled();
    checked = true;
    invalidate?.();
    expect(controller.GetState()).toEqual({ checked: true, enabled: true });
    expect(listener).toHaveBeenCalledOnce();
    expect(remove()).toBe(true);
    controller.Dispose();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});
