/** @fileoverview Shared Writer/SVX actual popup lifecycle:lazy content,viewport placement,outside-pointer dismissal and native owner focus on Escape. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
/** Browser window ports for the real native toolbox popup lifecycle. */
interface ToolboxPopup {
  readonly ref: RefObject<HTMLDetailsElement | null>;
  readonly open: boolean;
  readonly toggle: () => void;
  readonly close: (restore?: boolean) => void;
}
/** Uses Writer's bounded viewport geometry and above/below space selection for the actual popup. @param details - Real popup element. @returns Nothing. */
function position(details: HTMLDetailsElement | null): void {
  if (!details?.open) return;
  const anchor = details.firstElementChild as HTMLElement | null,
    panel = details.lastElementChild as HTMLElement | null;
  if (!anchor || !panel || anchor === panel) return;
  const rect = anchor.getBoundingClientRect(),
    margin = 8,
    gap = 4;
  panel.style.position = "fixed";
  panel.style.maxWidth = `${Math.max(0, window.innerWidth - 2 * margin)}px`;
  const below = window.innerHeight - rect.bottom - gap - margin,
    above = rect.top - gap - margin,
    placeAbove = panel.scrollHeight > below && above > below,
    maxHeight = Math.max(0, placeAbove ? above : below),
    height = Math.min(panel.scrollHeight + 2, maxHeight);
  panel.style.left = `${Math.max(margin, Math.min(rect.left, window.innerWidth - margin - panel.offsetWidth))}px`;
  panel.style.top = `${placeAbove ? rect.top - gap - height : rect.bottom + gap}px`;
  panel.style.maxHeight = `${maxHeight}px`;
  panel.style.overflowY = "auto";
}
/** Owns the actual details window;React only projects its open state so native popup contents are created on demand. @returns Real popup ref and window actions. */
export function useToolboxPopup(): ToolboxPopup {
  const ref = useRef<HTMLDetailsElement>(null),
    [open, setOpen] = useState(false);
  const close = useCallback(
    /** Ends the actual popup before restoring its connected toolbar owner. @param restore - Return native popup focus. @returns Nothing. */ (
      restore = false,
    ) => {
      const details = ref.current;
      if (!details) return;
      const wasOpen = details.open;
      details.open = false;
      setOpen(false);
      if (restore && wasOpen)
        (details.firstElementChild as HTMLElement | null)?.focus({ preventScroll: true });
    },
    [],
  );
  const toggle = useCallback(
    /** Toggles the actual window and publishes its resulting display state. @returns Nothing. */ () => {
      const details = ref.current;
      if (!details) return;
      details.open = !details.open;
      setOpen(details.open);
    },
    [],
  );
  useLayoutEffect(
    /** Places newly created or changed popup contents before browser paint. @returns Nothing. */ () => {
      position(ref.current);
    },
  );
  useEffect(
    /** Borrows actual native popup events and shared Writer dismissal rules. @returns Cleanup. */ () => {
      const details = ref.current;
      /** Synchronizes the actual details event owner without introducing document state. @param event - Native toggle event from the attached details. @returns Nothing. */
      function changed(event: Event): void {
        setOpen((event.currentTarget as HTMLDetailsElement).open);
      }
      /** Tracks real viewport and ancestor scroll geometry. @returns Nothing. */
      function updatePosition(): void {
        position(details);
      }
      /** Leaves outside focus with its new owner. @param event - Actual pointer. @returns Nothing. */
      function dismiss(event: PointerEvent): void {
        if (!details?.contains(event.target as Node)) close();
      }
      /** Native Escape restores focus only while the popup owns it. @param event - Actual key. @returns Nothing. */
      function dismissOnEscape(event: KeyboardEvent): void {
        if (event.key === "Escape" && details?.open)
          close(details.contains(document.activeElement));
      }
      details?.addEventListener("toggle", changed);
      window.addEventListener("resize", updatePosition);
      document.addEventListener("scroll", updatePosition, true);
      document.addEventListener("pointerdown", dismiss);
      document.addEventListener("keydown", dismissOnEscape);
      return /** Releases listeners with the actual window lifecycle. @returns Nothing. */ () => {
        details?.removeEventListener("toggle", changed);
        window.removeEventListener("resize", updatePosition);
        document.removeEventListener("scroll", updatePosition, true);
        document.removeEventListener("pointerdown", dismiss);
        document.removeEventListener("keydown", dismissOnEscape);
      };
    },
    [close],
  );
  return { ref, open, toggle, close };
}
