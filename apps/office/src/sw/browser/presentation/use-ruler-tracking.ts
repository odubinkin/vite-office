/** @fileoverview Owns browser ruler tracking admission, input priority and termination. */
import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

const trackingWindows = new WeakMap<Window, () => void>();

/** Supplies transient ruler painting and a single accepted or cancelled termination. */
export interface RulerTrackingCallbacks {
  readonly onStart: () => void;
  readonly onMove: (event: PointerEvent) => void;
  readonly onEnd: (cancelled: boolean, event: PointerEvent | undefined) => void;
}

/** Exposes one ruler's tracking window without retaining Writer model state. */
export interface RulerTracking {
  readonly IsTracking: () => boolean;
  readonly StartTracking: (
    event: ReactPointerEvent<HTMLElement> | ReactMouseEvent<HTMLElement>,
    callbacks: RulerTrackingCallbacks,
  ) => (() => void) | undefined;
}

/** Projects Ruler admission and VCL tracking-key priority onto an owned browser window.
 * @param enabled - Whether the owning ruler is currently visible.
 * @param owner - Optional document lifetime owning the copied ruler state.
 * @returns Stable tracking admission for one mounted ruler.
 */
export function useRulerTracking(enabled = true, owner?: object): RulerTracking {
  const cancelCurrent = useRef<(() => void) | undefined>(undefined);
  const StartTracking = useCallback(
    /** Starts a left-button gesture unless this ruler already owns tracking.
     * @param event - Initiating pointer input.
     * @param callbacks - Ruler-specific painting and commit callbacks.
     * @returns Idempotent cancellation for the initiating handle, or no admitted gesture.
     */
    (
      event: ReactPointerEvent<HTMLElement> | ReactMouseEvent<HTMLElement>,
      callbacks: RulerTrackingCallbacks,
    ) => {
      if (event.button !== 0 || event.detail > 1 || cancelCurrent.current !== undefined) return;
      event.preventDefault();
      const host = event.currentTarget.ownerDocument.defaultView as Window;
      trackingWindows.get(host)?.();
      const pointerId = "pointerId" in event ? event.pointerId : undefined;
      let ended = false;

      /** Releases ownership before notifying ruler painting or application callbacks.
       * @param cancelled - Whether the preview must be discarded.
       * @param pointer - Final pointer position, absent for a keyboard termination.
       * @returns Nothing.
       */
      function EndTracking(cancelled: boolean, pointer?: PointerEvent): void {
        if (ended) return;
        ended = true;
        host.removeEventListener("pointermove", move);
        host.removeEventListener("pointerup", finish);
        host.removeEventListener("pointercancel", cancelPointer);
        host.removeEventListener("keydown", keyInput, true);
        host.removeEventListener("blur", cancel);
        trackingWindows.delete(host);
        cancelCurrent.current = undefined;
        callbacks.onEnd(cancelled, pointer);
      }
      /** Discards the active gesture without application changes. @returns Nothing. */
      function cancel(): void {
        EndTracking(true);
      }
      /** Delivers only the initiating pointer's movement. @param pointer - Window input. @returns Nothing. */
      function move(pointer: PointerEvent): void {
        if (matches(pointer)) callbacks.onMove(pointer);
      }
      /** Accepts the initiating pointer's final position. @param pointer - Window input. @returns Nothing. */
      function finish(pointer: PointerEvent): void {
        if (matches(pointer)) EndTracking(false, pointer);
      }
      /** Cancels only the initiating pointer. @param pointer - Window input. @returns Nothing. */
      function cancelPointer(pointer: PointerEvent): void {
        if (matches(pointer)) cancel();
      }
      /** Matches a captured pointer or the native document mouse domain. @param pointer - Window input. @returns Whether this gesture owns it. */
      function matches(pointer: PointerEvent): boolean {
        return pointerId === undefined
          ? !pointer.pointerType || pointer.pointerType === "mouse"
          : pointer.pointerId === pointerId;
      }
      /** Owns all key input while tracking, including modified Escape and Return.
       * @param key - Browser input before widget/document fallback.
       * @returns Nothing.
       */
      function keyInput(key: KeyboardEvent): void {
        key.preventDefault();
        key.stopImmediatePropagation();
        if (key.key === "Escape") cancel();
        else if (key.key === "Enter") EndTracking(false);
      }
      cancelCurrent.current = cancel;
      trackingWindows.set(host, cancel);
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerup", finish);
      host.addEventListener("pointercancel", cancelPointer);
      host.addEventListener("keydown", keyInput, true);
      host.addEventListener("blur", cancel);
      callbacks.onStart();
      return cancel;
    },
    [],
  );
  useEffect(
    /** Drops DOM callbacks when their ruler owner disappears. @returns Owner cleanup. */
    () => /** Cancels retained tracking. @returns Nothing. */ () => cancelCurrent.current?.(),
    [owner],
  );
  useEffect(
    /** Drops a hidden ruler's transient tracking owner. @returns Nothing. */
    () => {
      if (!enabled) cancelCurrent.current?.();
    },
    [enabled],
  );
  return {
    StartTracking,
    /** Reports whether this ruler already owns a gesture. @returns Local tracking state. */
    IsTracking: () => cancelCurrent.current !== undefined,
  };
}
