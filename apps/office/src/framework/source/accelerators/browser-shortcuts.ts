/**
 * @fileoverview Adapts browser keyboard events to canonical command-registry shortcut strings without installing listeners or mutating application state.
 */

/** Describes the browser keyboard fields needed for platform-neutral shortcut adaptation. */
export interface BrowserShortcutEvent {
  /** Whether the Alt modifier is pressed. */
  readonly altKey: boolean;
  /** Whether the Control modifier is pressed. */
  readonly ctrlKey: boolean;
  /** Browser key name for the non-modifier key. */
  readonly key: string;
  /** Whether the Meta modifier is pressed. */
  readonly metaKey: boolean;
  /** Whether the Shift modifier is pressed. */
  readonly shiftKey: boolean;
}

/**
 * Converts a browser keyboard event into the command registry's shortcut input.
 *
 * @param event - Browser event fields inspected without mutation.
 * @returns Plus-separated shortcut input, or undefined for modifier-only events.
 */
export function getBrowserShortcut(event: BrowserShortcutEvent): string | undefined {
  if (["Alt", "Control", "Meta", "Shift"].includes(event.key)) return undefined;
  return [
    event.ctrlKey ? "Ctrl" : undefined,
    event.altKey ? "Alt" : undefined,
    event.shiftKey ? "Shift" : undefined,
    event.metaKey ? "Meta" : undefined,
    event.key,
  ]
    .filter(
      /** Retains only defined shortcut segments. @param part - Candidate segment. @returns True for text segments. */
      function isDefined(part): part is string {
        return part !== undefined;
      },
    )
    .join("+");
}
