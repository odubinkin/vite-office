/** @fileoverview Verifies browser keyboard event adaptation for typed command shortcuts. */

import { describe, expect, it } from "vitest";

import { getBrowserShortcut, type BrowserShortcutEvent } from "./browser-shortcuts";

/** Creates a keyboard event fixture with no modifiers by default. @param event - Partial event override. @returns Complete shortcut fixture. */
function createEvent(event: Partial<BrowserShortcutEvent>): BrowserShortcutEvent {
  return { altKey: false, ctrlKey: false, key: "z", metaKey: false, shiftKey: false, ...event };
}

describe("browser shortcuts" /** Groups browser keyboard shortcut adaptation cases. @returns Nothing; Vitest registers cases. */, function defineShortcutTests(): void {
  it("returns canonical registry inputs and excludes modifier-only events" /** Verifies ordering, modifiers, and modifier-only rejection. @returns Nothing; assertions validate adaptation. */, function adaptsEvents(): void {
    expect(getBrowserShortcut(createEvent({ ctrlKey: true, shiftKey: true }))).toBe("Ctrl+Shift+z");
    expect(getBrowserShortcut(createEvent({ key: "z", metaKey: true }))).toBe("Meta+z");
    expect(getBrowserShortcut(createEvent({ altKey: true }))).toBe("Alt+z");
    expect(getBrowserShortcut(createEvent({}))).toBe("z");
    expect(getBrowserShortcut(createEvent({ key: "Control" }))).toBeUndefined();
  });
});
