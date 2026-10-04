/** @fileoverview Projects the Sidebar docking window's local keyboard boundary onto owned DOM. */
import type { KeyboardEvent, ReactNode } from "react";

/** Supplies the existing Sidebar root without changing deck or document ownership. */
export interface SidebarDockingWindowProps {
  readonly ariaLabel: string;
  readonly children: ReactNode;
  readonly className: string;
}

const localKeys = [
  "ArrowUp",
  "ArrowDown",
  "PageUp",
  "PageDown",
  "Home",
  "End",
  "ArrowLeft",
  "ArrowRight",
  "Backspace",
  "Delete",
  "Insert",
  "Enter",
  "Escape",
] as const;

/** Renders the native docking boundary after local widget key handling.
 * @param props - Existing root presentation.
 * @param props.ariaLabel - Sidebar accessible name.
 * @param props.children - Owned deck and activation rail.
 * @param props.className - Existing root layout classes.
 * @returns Unchanged Sidebar root with local key isolation.
 */
export function SidebarDockingWindow({
  ariaLabel,
  children,
  className,
}: SidebarDockingWindowProps): React.JSX.Element {
  /** Keeps native Sidebar local key codes away from document/global accelerators.
   * @param event - Key bubbling after local child handlers.
   * @returns Nothing.
   */
  function EventNotify(event: KeyboardEvent<HTMLElement>): void {
    if (!(localKeys as readonly string[]).includes(event.key)) return;
    event.stopPropagation();
    const target = event.target as Element;
    if (
      event.defaultPrevented ||
      target.closest(
        "input, textarea, select, [contenteditable]:not([contenteditable='false'])",
      ) !== null ||
      (event.key === "Enter" && target.closest("button") !== null)
    )
      return;
    // HTML widget defaults occur after bubbling; retain their local editing/activation above.
    event.preventDefault();
  }
  return (
    <aside aria-label={ariaLabel} className={className} onKeyDown={EventNotify}>
      {children}
    </aside>
  );
}
