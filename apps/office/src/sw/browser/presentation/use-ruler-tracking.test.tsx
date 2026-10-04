/** @fileoverview Checks owned ruler tracking input, replacement and listener lifetimes. */
import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { useRulerTracking, type RulerTrackingCallbacks } from "./use-ruler-tracking";

/** Mounts a real DOM tracking owner without Writer state. @param props - Label and lifecycle ports. @returns Test control. */
function TrackingOwner({
  label,
  callbacks,
}: Readonly<{ label: string; callbacks: RulerTrackingCallbacks }>) {
  const tracking = useRulerTracking();
  const cancel = useRef<(() => void) | undefined>(undefined);
  return (
    <>
      <button
        type="button"
        onPointerDown={
          /** Routes the owner's real pointer input. @param event - DOM input. @returns Nothing. */ (
            event,
          ) => {
            const admitted = tracking.StartTracking(event, callbacks);
            if (admitted !== undefined) cancel.current = admitted;
          }
        }
      >
        {label}
      </button>
      <button
        type="button"
        onClick={
          /** Calls the retained cancellation safely. @returns Nothing. */ () => cancel.current?.()
        }
      >
        Cancel {label}
      </button>
    </>
  );
}

/** Creates independently observed lifecycle callbacks. @returns Owned spies. */
function callbacks() {
  return { onStart: vi.fn(), onMove: vi.fn(), onEnd: vi.fn() };
}

describe("ruler tracking ownership", /** Groups source input and browser lifetime contracts. @returns Nothing. */ () => {
  for (const sample of [
    { button: 1, detail: 1 },
    { button: 2, detail: 1 },
    { button: 0, detail: 2 },
  ]) {
    it(`rejects ${JSON.stringify(sample)} without taking input`, /** Checks left-single-click admission. @returns Nothing. */ function rejectsStart() {
      const ports = callbacks();
      render(<TrackingOwner label="Ruler" callbacks={ports} />);
      const owner = screen.getByRole("button", { name: "Ruler" });
      expect(fireEvent.pointerDown(owner, { ...sample, pointerId: 1 })).toBe(true);
      expect(ports.onStart).not.toHaveBeenCalled();
      expect(fireEvent.keyDown(owner, { key: "Escape" })).toBe(true);
    });
  }

  it("admits modifiers, rejects repeat starts and accepts only its initiating pointer", /** Checks a single active gesture and foreign-pointer isolation. @returns Nothing. */ function ownsPointer() {
    const ports = callbacks();
    render(<TrackingOwner label="Ruler" callbacks={ports} />);
    const owner = screen.getByRole("button", { name: "Ruler" });
    expect(
      fireEvent.pointerDown(owner, { button: 0, pointerId: 7, ctrlKey: true, shiftKey: true }),
    ).toBe(false);
    fireEvent.pointerDown(owner, { button: 0, pointerId: 8 });
    expect(ports.onStart).toHaveBeenCalledOnce();
    fireEvent.pointerMove(window, { pointerId: 8, clientX: 20 });
    fireEvent.pointerUp(window, { pointerId: 8 });
    fireEvent.pointerCancel(window, { pointerId: 8 });
    expect(ports.onMove).not.toHaveBeenCalled();
    expect(ports.onEnd).not.toHaveBeenCalled();
    fireEvent.pointerMove(window, { pointerId: 7, clientX: 30 });
    expect(ports.onMove).toHaveBeenCalledOnce();
    fireEvent.pointerUp(window, { pointerId: 7, clientX: 40 });
    expect(ports.onEnd).toHaveBeenCalledWith(false, expect.objectContaining({ clientX: 40 }));
    fireEvent.pointerUp(window, { pointerId: 7 });
    fireEvent.click(screen.getByRole("button", { name: "Cancel Ruler" }));
    expect(ports.onEnd).toHaveBeenCalledOnce();
    expect(fireEvent.keyDown(owner, { key: "Escape" })).toBe(true);
  });

  for (const end of ["Escape", "Enter", "pointercancel", "blur", "unmount"] as const) {
    it(`terminates once on ${end} and releases global input`, /** Checks all lifecycle exits and modified tracking keys. @returns Nothing. */ function terminatesTracking() {
      const ports = callbacks();
      const rendered = render(<TrackingOwner label="Ruler" callbacks={ports} />);
      const owner = screen.getByRole("button", { name: "Ruler" });
      fireEvent.pointerDown(owner, { button: 0, pointerId: 7 });
      if (end === "Escape" || end === "Enter")
        expect(
          fireEvent.keyDown(owner, {
            key: end,
            ctrlKey: true,
            shiftKey: true,
            altKey: true,
            metaKey: true,
          }),
        ).toBe(false);
      else if (end === "pointercancel") fireEvent.pointerCancel(window, { pointerId: 7 });
      else if (end === "blur") fireEvent(window, new Event("blur"));
      else rendered.unmount();
      expect(ports.onEnd).toHaveBeenCalledWith(end !== "Enter", undefined);
      fireEvent.pointerMove(window, { pointerId: 7 });
      fireEvent.pointerUp(window, { pointerId: 7 });
      expect(ports.onMove).not.toHaveBeenCalled();
      expect(ports.onEnd).toHaveBeenCalledOnce();
      expect(fireEvent.keyDown(window, { key: "z", ctrlKey: true })).toBe(true);
    });
  }

  it("owns ordinary key input before widget and document dispatch without ending tracking", /** Checks native tracking priority and continued movement. @returns Nothing. */ function ownsKeys() {
    const ports = callbacks(),
      child = vi.fn(),
      ancestor = vi.fn();
    render(
      <div onKeyDown={ancestor}>
        <TrackingOwner label="Ruler" callbacks={ports} />
        <input aria-label="Widget" onKeyDown={child} />
      </div>,
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: "Ruler" }), {
      button: 0,
      pointerId: 7,
    });
    for (const key of ["z", "a", "b", "Tab", "F6", "Delete", "ArrowRight"])
      expect(fireEvent.keyDown(screen.getByLabelText("Widget"), { key, ctrlKey: true })).toBe(
        false,
      );
    expect(child).not.toHaveBeenCalled();
    expect(ancestor).not.toHaveBeenCalled();
    expect(ports.onEnd).not.toHaveBeenCalled();
    fireEvent.pointerMove(window, { pointerId: 7 });
    expect(ports.onMove).toHaveBeenCalledOnce();
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.keyDown(screen.getByLabelText("Widget"), { key: "a", ctrlKey: true });
    expect(child).toHaveBeenCalledOnce();
    expect(ancestor).toHaveBeenCalledOnce();
  });

  it("cancels the previous different ruler before granting the next owner", /** Checks VCL tracking replacement without stale callback delivery. @returns Nothing. */ function replacesOwner() {
    const first = callbacks(),
      second = callbacks();
    render(
      <>
        <TrackingOwner label="First" callbacks={first} />
        <TrackingOwner label="Second" callbacks={second} />
      </>,
    );
    fireEvent.pointerDown(screen.getByRole("button", { name: "First" }), {
      button: 0,
      pointerId: 1,
    });
    fireEvent.pointerDown(screen.getByRole("button", { name: "Second" }), {
      button: 0,
      pointerId: 2,
    });
    expect(first.onEnd).toHaveBeenCalledWith(true, undefined);
    expect(first.onEnd.mock.invocationCallOrder[0]).toBeLessThan(
      second.onStart.mock.invocationCallOrder[0] as number,
    );
    fireEvent.pointerUp(window, { pointerId: 1 });
    expect(second.onEnd).not.toHaveBeenCalled();
    fireEvent.pointerUp(window, { pointerId: 2 });
    expect(first.onEnd).toHaveBeenCalledOnce();
    expect(second.onEnd).toHaveBeenCalledWith(false, expect.any(PointerEvent));
  });
});
