/** @fileoverview Common VCL tracking accepts the legacy browser mouse domain while isolating touch/pen pointers. */
import { expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useWindowTracking, type WindowTrackingCallbacks } from "./use-window-tracking";
/** Mounts the actual common mouse-entry boundary. @param props - Observed tracking callbacks. @returns Mouse handle. */
function MouseOwner({
  callbacks,
}: {
  readonly callbacks: WindowTrackingCallbacks;
}): React.JSX.Element {
  const tracking = useWindowTracking();
  return (
    <button
      type="button"
      onMouseDown={
        /** Admits the genuine React mouse event without inventing a pointer id. @param event - Mouse press. @returns Nothing. */ (
          event,
        ) => {
          tracking.StartTracking(event, callbacks);
        }
      }
    >
      Legacy mouse
    </button>
  );
}
it("retains the legacy mouse domain and ignores touch or pen during mouse tracking", /** Checks native mouse fallback independently of pointer-id tracking. @returns Nothing. */ () => {
  const callbacks = { onStart: vi.fn(), onMove: vi.fn(), onEnd: vi.fn() };
  render(<MouseOwner callbacks={callbacks} />);
  fireEvent.mouseDown(screen.getByRole("button", { name: "Legacy mouse" }), { button: 0 });
  expect(callbacks.onStart).toHaveBeenCalledOnce();
  fireEvent.pointerMove(window, { pointerId: 1, pointerType: "touch", clientX: 10 });
  fireEvent.pointerMove(window, { pointerId: 2, pointerType: "pen", clientX: 11 });
  expect(callbacks.onMove).not.toHaveBeenCalled();
  fireEvent.pointerMove(window, { pointerId: 3, pointerType: "mouse", clientX: 12 });
  fireEvent(window, new MouseEvent("pointermove", { clientX: 13, bubbles: true }));
  expect(callbacks.onMove).toHaveBeenCalledTimes(2);
  fireEvent.pointerUp(window, { pointerId: 3, pointerType: "mouse", clientX: 14 });
  expect(callbacks.onEnd).toHaveBeenCalledExactlyOnceWith(
    false,
    expect.objectContaining({ clientX: 14 }),
  );
});
