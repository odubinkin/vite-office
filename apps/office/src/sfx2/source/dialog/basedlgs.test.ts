/** @fileoverview Verifies typed Sfx dialog request ownership and completion. */

import { describe, expect, it, vi } from "vitest";

import { SfxDialogController } from "./basedlgs";

describe("SfxDialogController", /** Groups typed dialog lifecycle behavior. @returns Nothing. */ function defineDialogControllerTests(): void {
  it("publishes one request and completes only its matching identity", /** Verifies accepted completion and identity checks. @returns Completion after promise resolution. */ async function completesMatchingDialog(): Promise<void> {
    const controller = new SfxDialogController<{ readonly name: string }, number>();
    const listener = vi.fn();
    controller.Subscribe(listener);
    const completion = controller.Request({ name: "Hyperlink" });
    const request = controller.GetSnapshot();
    expect(request).toMatchObject({ id: 1, request: { name: "Hyperlink" } });
    expect(
      /** Requests a forbidden concurrent dialog. @returns Pending completion before the expected exception. */ () =>
        controller.Request({ name: "Second" }),
    ).toThrow("already active");
    expect(controller.Complete(2, 41)).toBe(false);
    expect(controller.Complete(1, 42)).toBe(true);
    await expect(completion).resolves.toEqual({ kind: "accepted", result: 42 });
    expect(controller.GetSnapshot()).toBeUndefined();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("returns explicit cancellation", /** Verifies cancelled completion. @returns Completion after promise resolution. */ async function cancelsDialog(): Promise<void> {
    const controller = new SfxDialogController<string, string>();
    const completion = controller.Request("request");
    const id = controller.GetSnapshot()?.id as number;
    expect(controller.Cancel(id)).toBe(true);
    await expect(completion).resolves.toEqual({ kind: "cancelled" });
  });
});
