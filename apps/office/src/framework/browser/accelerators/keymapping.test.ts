/** @fileoverview Verifies browser keyboard event adaptation for typed command shortcuts. */

import { describe, expect, it } from "vitest";

import {
  getBrowserShortcut,
  normalizeCommandShortcut,
  type BrowserShortcutEvent,
} from "./keymapping";

/** Creates a keyboard event fixture with no modifiers by default. @param event - Partial event override. @returns Complete shortcut fixture. */
function createEvent(event: Partial<BrowserShortcutEvent>): BrowserShortcutEvent {
  return { altKey: false, ctrlKey: false, key: "z", metaKey: false, shiftKey: false, ...event };
}

describe("browser shortcuts" /** Groups browser keyboard shortcut adaptation cases. @returns Nothing; Vitest registers cases. */, function defineShortcutTests(): void {
  it("returns canonical registry inputs and excludes modifier-only events" /** Verifies ordering, modifiers, and modifier-only rejection. @returns Nothing; assertions validate adaptation. */, function adaptsEvents(): void {
    expect(getBrowserShortcut(createEvent({ ctrlKey: true, shiftKey: true }))).toBe("Ctrl+Shift+Z");
    expect(getBrowserShortcut(createEvent({ key: "z", metaKey: true }))).toBe("Meta+Z");
    expect(getBrowserShortcut(createEvent({ altKey: true }))).toBe("Alt+Z");
    expect(getBrowserShortcut(createEvent({}))).toBe("Z");
    expect(getBrowserShortcut(createEvent({ key: " " }))).toBe("SPACE");
    expect(getBrowserShortcut(createEvent({ key: "Control" }))).toBeUndefined();
    expect(normalizeCommandShortcut("option + Enter")).toBe("Alt+ENTER");
    expect(
      /** Normalizes an empty part. @returns Invalid shortcut. */ () =>
        normalizeCommandShortcut("Ctrl++K"),
    ).toThrow("empty parts");
    expect(
      /** Normalizes a repeated modifier. @returns Invalid shortcut. */ () =>
        normalizeCommandShortcut("Ctrl+Ctrl+K"),
    ).toThrow("repeats modifier");
    expect(
      /** Normalizes modifier-only input. @returns Invalid shortcut. */ () =>
        normalizeCommandShortcut("Ctrl+Shift"),
    ).toThrow("exactly one");
  });
});
