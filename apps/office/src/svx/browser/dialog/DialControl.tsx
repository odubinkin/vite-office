/** @fileoverview Browser presentation of SVX rotation dial pointer tracking. */
import { useRef, type PointerEvent } from "react";
import type { Degree100 } from "../../../tools/inc/degree";
import { getDialMouseAngle } from "../../source/dialog/dialcontrol";

const arrowDeltas: Readonly<Record<string, number | undefined>> = {
  ArrowUp: 500,
  ArrowRight: 500,
  ArrowDown: -500,
  ArrowLeft: -500,
};

/** Renders the angle and links pointer changes to the owner of the rotation field. @param props - Angle, linked field and pending change callback. @returns Rotation dial. */
export function DialControl({
  angle,
  disabled,
  onChange,
  focusField,
}: Readonly<{
  angle: Degree100 | undefined;
  disabled: boolean;
  onChange: (angle: Degree100 | undefined) => void;
  focusField: () => void;
}>): React.JSX.Element {
  const pointer = useRef<{ id: number; original: Degree100 | undefined } | undefined>(undefined);

  /** Resolves centered browser coordinates using the original dial angle calculation. @param event - Captured pointer event. @param initial - Whether to snap the initial press. @returns Nothing. */
  function updateAngle(event: PointerEvent<HTMLDivElement>, initial: boolean): void {
    const rect = event.currentTarget.getBoundingClientRect();
    const next = getDialMouseAngle(
      event.clientX - (rect.left + rect.width / 2),
      rect.top + rect.height / 2 - event.clientY,
      initial,
    );
    if (next !== undefined) onChange(next);
  }

  /** Releases tracking and optionally restores the original rotation. @param element - Dial surface. @param cancel - Whether to restore the previous value. @returns Nothing. */
  function finish(element: HTMLDivElement, cancel: boolean): void {
    const gesture = pointer.current;
    if (!gesture) return;
    pointer.current = undefined;
    if (element.hasPointerCapture?.(gesture.id)) element.releasePointerCapture(gesture.id);
    if (cancel) onChange(gesture.original);
    focusField();
  }

  return (
    <div
      role="slider"
      aria-label="Rotation dial"
      aria-disabled={disabled}
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={angle === undefined ? undefined : Math.trunc(angle / 100)}
      tabIndex={disabled ? -1 : 0}
      className="relative mx-auto grid size-[4.5rem] touch-none select-none place-items-center rounded-full border border-slate-400 bg-white text-xs outline-offset-2 aria-disabled:opacity-50"
      onPointerDown={
        /** Captures the initial pointer and snaps to the nearest native detent. @param event - Initial pointer. @returns Nothing. */
        (event) => {
          if (disabled || !event.isPrimary || event.button !== 0 || pointer.current) return;
          event.preventDefault();
          event.currentTarget.focus();
          pointer.current = { id: event.pointerId, original: angle };
          event.currentTarget.setPointerCapture?.(event.pointerId);
          updateAngle(event, true);
        }
      }
      onPointerMove={
        /** Tracks one captured pointer at native one-degree resolution. @param event - Pointer motion. @returns Nothing. */
        (event) => {
          if (pointer.current?.id === event.pointerId) updateAngle(event, false);
        }
      }
      onPointerUp={
        /** Transfers focus to the linked field on release. @param event - Pointer release. @returns Nothing. */
        (event) => {
          if (pointer.current?.id === event.pointerId) finish(event.currentTarget, false);
        }
      }
      onPointerCancel={
        /** Restores the old angle when browser tracking is cancelled. @param event - Cancelled pointer. @returns Nothing. */
        (event) => {
          if (pointer.current?.id === event.pointerId) finish(event.currentTarget, true);
        }
      }
      onLostPointerCapture={
        /** Restores interrupted tracking. @param event - Capture loss. @returns Nothing. */
        (event) => {
          if (pointer.current?.id === event.pointerId) finish(event.currentTarget, true);
        }
      }
      onBlur={
        /** Cancels tracking when the dial loses focus. @param event - Focus change. @returns Nothing. */
        (event) => finish(event.currentTarget, true)
      }
      onKeyDown={
        /** Cancels rotation while tracking or forwards accessible arrow edits to the linked field. @param event - Dial key. @returns Nothing. */
        (event) => {
          if (
            event.key === "Escape" &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey &&
            !event.shiftKey
          ) {
            event.preventDefault();
            event.stopPropagation();
            finish(event.currentTarget, true);
            return;
          }
          if (disabled) return;
          const delta = arrowDeltas[event.key];
          if (delta === undefined) return;
          event.preventDefault();
          onChange(((angle ?? 0) + delta + 36000) % 36000);
        }
      }
    >
      {angle !== undefined && (
        <span
          className="pointer-events-none font-semibold"
          style={{ transform: `rotate(${-angle / 100}deg)` }}
        >
          ABCD
        </span>
      )}
    </div>
  );
}
