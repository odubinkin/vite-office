/**
 * @fileoverview Adapts browser keyboard events to canonical command-registry shortcut strings.
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

const modifierAliases = new Map<string, string>([
  ["alt", "Alt"],
  ["cmd", "Meta"],
  ["command", "Meta"],
  ["control", "Ctrl"],
  ["ctrl", "Ctrl"],
  ["meta", "Meta"],
  ["option", "Alt"],
  ["shift", "Shift"],
]);
const modifierOrder = ["Ctrl", "Alt", "Meta", "Shift"] as const;

/** Normalizes accelerator text at the framework accelerator boundary. @param shortcut - Raw shortcut. @returns Canonical shortcut. */
export function normalizeCommandShortcut(shortcut: string): string {
  const parts = shortcut
    .split("+")
    .map(
      /** Trims one segment. @param part - Raw segment. @returns Trimmed segment. */ (part) =>
        part.trim(),
    );
  if (
    parts.some(
      /** Detects an empty segment. @param part - Segment. @returns Whether empty. */ (part) =>
        part.length === 0,
    )
  )
    throw new Error("Command shortcut must not contain empty parts.");
  const modifiers = new Set<string>();
  const keys: string[] = [];
  for (const part of parts) {
    const modifier = modifierAliases.get(part.toLowerCase());
    if (modifier === undefined) keys.push(part.toUpperCase());
    else if (modifiers.has(modifier))
      throw new Error(`Command shortcut repeats modifier: ${modifier}`);
    else modifiers.add(modifier);
  }
  if (keys.length !== 1)
    throw new Error("Command shortcut must contain exactly one non-modifier key.");
  return [
    ...modifierOrder.filter(
      /** Keeps present modifiers. @param modifier - Canonical modifier. @returns Whether present. */ (
        modifier,
      ) => modifiers.has(modifier),
    ),
    keys[0],
  ].join("+");
}

/**
 * Converts a browser keyboard event into the command registry's shortcut input.
 *
 * @param event - Browser event fields inspected without mutation.
 * @returns Plus-separated shortcut input, or undefined for modifier-only events.
 */
export function getBrowserShortcut(event: BrowserShortcutEvent): string | undefined {
  if (["Alt", "Control", "Meta", "Shift"].includes(event.key)) return undefined;
  const key = event.key === " " ? "Space" : event.key;
  return normalizeCommandShortcut(
    [
      event.ctrlKey ? "Ctrl" : undefined,
      event.altKey ? "Alt" : undefined,
      event.shiftKey ? "Shift" : undefined,
      event.metaKey ? "Meta" : undefined,
      key,
    ]
      .filter(
        /** Retains only defined shortcut segments. @param part - Candidate segment. @returns True for text segments. */
        function isDefined(part): part is string {
          return part !== undefined;
        },
      )
      .join("+"),
  );
}
