/** @fileoverview Immediate browser tooltips shared by office icon controls. */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** Tooltip text and its control's viewport anchor. */
interface Tooltip {
  readonly control: HTMLElement;
  readonly text: string;
}

/** Finds a control with explicit tooltip text or an accessible name for its icon. @param target - Pointer or focus target. @returns Tooltip details if available. */
function findTooltip(target: EventTarget | null): Tooltip | undefined {
  if (!(target instanceof Element)) return undefined;
  const control = target.closest<HTMLElement>("[data-office-tooltip], button[aria-label]");
  if (control === null || control.hasAttribute("title")) return undefined;
  const text =
    control.dataset.officeTooltip ??
    (control.querySelector("svg") === null ? null : control.getAttribute("aria-label"));
  return text ? { control, text } : undefined;
}

/** Shows icon help without the platform title delay or clipping by scrollable toolbars. @returns Active tooltip, when one is requested. */
export function OfficeTooltips(): React.JSX.Element | null {
  const [tooltip, setTooltip] = useState<Tooltip>();
  const bubble = useRef<HTMLDivElement>(null);
  useEffect(
    /** Tracks pointer and keyboard focus across workspace chrome and its portals. @returns Listener cleanup. */ () => {
      /** Removes the current hint. @returns Nothing. */
      function dismiss(): void {
        setTooltip(undefined);
      }
      /** Shows immediate help when the pointer enters a new control. @param event - Pointer transition. @returns Nothing. */
      function enter(event: PointerEvent): void {
        if (event.pointerType === "touch") return;
        const next = findTooltip(event.target);
        if (next !== undefined && next.control !== findTooltip(event.relatedTarget)?.control)
          setTooltip(next);
      }
      /** Clears the hint on leaving its control. @param event - Pointer transition. @returns Nothing. */
      function leave(event: PointerEvent): void {
        const previous = findTooltip(event.target);
        if (
          previous !== undefined &&
          previous.control !== findTooltip(event.relatedTarget)?.control
        )
          dismiss();
      }
      /** Gives keyboard users the same help without activating a control. @param event - Focus transition. @returns Nothing. */
      function focus(event: FocusEvent): void {
        const next = findTooltip(event.target);
        if (next?.control.matches(":focus-visible") === true) setTooltip(next);
      }
      /** Dismisses help without consuming the editor's Escape key. @param event - Keyboard input. @returns Nothing. */
      function escape(event: KeyboardEvent): void {
        if (event.key === "Escape") dismiss();
      }
      document.addEventListener("pointerover", enter, true);
      document.addEventListener("pointerout", leave, true);
      document.addEventListener("pointerdown", dismiss, true);
      document.addEventListener("focusin", focus, true);
      document.addEventListener("focusout", dismiss, true);
      document.addEventListener("keydown", escape, true);
      document.addEventListener("scroll", dismiss, true);
      window.addEventListener("blur", dismiss);
      window.addEventListener("resize", dismiss);
      return /** Releases the workspace listeners. @returns Nothing. */ () => {
        document.removeEventListener("pointerover", enter, true);
        document.removeEventListener("pointerout", leave, true);
        document.removeEventListener("pointerdown", dismiss, true);
        document.removeEventListener("focusin", focus, true);
        document.removeEventListener("focusout", dismiss, true);
        document.removeEventListener("keydown", escape, true);
        document.removeEventListener("scroll", dismiss, true);
        window.removeEventListener("blur", dismiss);
        window.removeEventListener("resize", dismiss);
      };
    },
    [],
  );
  useLayoutEffect(
    /** Positions the help within the viewport before it paints. @returns Cleanup for detached controls. */ () => {
      const element = bubble.current;
      if (tooltip === undefined || element === null) return;
      const { control } = tooltip;
      const rect = control.getBoundingClientRect();
      const { offsetWidth: width, offsetHeight: height } = element;
      const gap = 6;
      const left = Math.max(gap, Math.min(rect.left, window.innerWidth - width - gap));
      const top =
        rect.bottom + height + 2 * gap <= window.innerHeight
          ? rect.bottom + gap
          : Math.max(gap, rect.top - height - gap);
      element.style.left = `${left}px`;
      element.style.top = `${top}px`;
      const observer = new MutationObserver(
        /** Hides help for controls removed or made inert while hovered. @returns Nothing. */ () => {
          if (!control.isConnected || control.closest("[inert], [hidden]") !== null)
            setTooltip(undefined);
        },
      );
      observer.observe(document.body, {
        attributeFilter: ["hidden", "inert"],
        childList: true,
        subtree: true,
      });
      return /** Releases tracking of this control. @returns Nothing. */ () =>
        observer.disconnect();
    },
    [tooltip],
  );
  return tooltip === undefined
    ? null
    : createPortal(
        <div
          className="pointer-events-none fixed top-0 left-0 z-[100] max-w-[min(24rem,calc(100vw_-_12px))] rounded bg-slate-950 px-2 py-1 text-xs break-words text-white shadow"
          ref={bubble}
          role="tooltip"
        >
          {tooltip.text}
        </div>,
        document.body,
      );
}
