/** @fileoverview Native hdrcont resize arithmetic over shared VCL browser tracking; only temporary drag painting lives here. Dimensions and history stay in actual header/view owners. */
import { useState, type PointerEvent as ReactPointerEvent } from "react";
import { useWindowTracking } from "../../../vcl/browser/use-window-tracking";
import { browserPointerStyle } from "../../../vcl/browser/pointer";
import { PointerStyle } from "../../../vcl/ptrstyle";

/** Original header geometry operations supplied by the document controller. */
export interface ScHeaderSizing {
  readonly GetEntrySize: (width: boolean, index: number) => number;
  readonly SetEntrySize: (width: boolean, index: number, pixels: number) => void;
  readonly HideEntries: (width: boolean, first: number, last: number) => void;
}
/** One boundary of a real visible header and its native view lifetime. */
interface Props {
  readonly width: boolean;
  readonly index: number;
  readonly label: string;
  readonly disabled: boolean;
  readonly owner: object;
  readonly sizing: ScHeaderSizing;
}
/** Projects native header tracking through the same VCL window tracking used by Writer rulers. @param props - Real header and native geometry operations. @returns Boundary target and temporary guide. */
export function ScHeaderResizeHandle({
  width,
  index,
  label,
  disabled,
  owner,
  sizing,
}: Props): React.JSX.Element {
  const tracking = useWindowTracking(!disabled, owner),
    [guide, setGuide] = useState<{ position: number; bounds: DOMRect }>();
  /** Uses native integer pointer coordinates. @param event - Browser pointer. @returns Header-axis pixel. */
  function coordinate(event: Pick<PointerEvent, "clientX" | "clientY">): number {
    return Math.trunc(width ? event.clientX : event.clientY);
  }
  /** Starts only admitted native single-button tracking; actual geometry is committed solely on accepted termination. @param event - Boundary press. @returns Nothing. */
  function start(event: ReactPointerEvent<HTMLButtonElement>): void {
    if (disabled) return;
    const target = event.currentTarget,
      grid = target.closest('[role="grid"]') as HTMLElement,
      startPosition = coordinate(event);
    let position = startPosition,
      moved = false;
    tracking.StartTracking(event, {
      onStart:
        /** Draws the original initial tracking guide without changing the source dimensions. @returns Nothing. */ () => {
          setGuide({ position, bounds: grid.getBoundingClientRect() });
        },
      onMove:
        /** Retains the original two-pixel moved flag even after returning to the start. @param pointer - Tracked input. @returns Nothing. */ (
          pointer,
        ) => {
          const next = coordinate(pointer);
          if (next === position) return;
          position = next;
          if (position <= startPosition - 2 || position >= startPosition + 2) moved = true;
          setGuide({ position, bounds: grid.getBoundingClientRect() });
        },
      onEnd:
        /** Clears transient paint before source operations can remove a header. @param cancelled - Tracking cancellation. @param pointer - Final pointer or keyboard termination. @returns Nothing. */ (
          cancelled,
          pointer,
        ) => {
          setGuide(undefined);
          grid.focus();
          if (cancelled || !moved) return;
          const entry = (target.parentElement as HTMLElement).getBoundingClientRect();
          let size =
              (pointer === undefined ? position : coordinate(pointer)) +
              2 -
              Math.trunc(width ? entry.left : entry.top),
            current = index;
          if (size < 0) {
            let first = 0;
            while (size < 0) {
              first = current;
              if (current > 0) {
                current--;
                size += sizing.GetEntrySize(width, current);
              } else size = 0;
            }
            sizing.HideEntries(width, first, index);
          } else sizing.SetEntrySize(width, index, size & 0xffff);
        },
    });
  }
  return (
    <>
      <button
        type="button"
        aria-label={`Resize ${label}`}
        disabled={disabled}
        tabIndex={-1}
        className={
          width
            ? "absolute -right-[5px] top-0 z-[5] h-full w-[11px] touch-none disabled:pointer-events-none"
            : "absolute -bottom-[5px] left-0 z-[5] h-[11px] w-full touch-none disabled:pointer-events-none"
        }
        style={{
          cursor: browserPointerStyle(width ? PointerStyle.HSizeBar : PointerStyle.VSizeBar),
        }}
        onPointerDown={start}
        onClick={
          /** A resize target never changes the source selection. @param event - Synthesized click. @returns Nothing. */ (
            event,
          ) => {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      />
      {guide && (
        <div
          aria-hidden="true"
          data-calc-resize-guide="true"
          className="pointer-events-none fixed z-50 bg-indigo-600"
          style={
            width
              ? {
                  left: guide.position,
                  top: guide.bounds.top,
                  width: 1,
                  height: guide.bounds.height,
                }
              : {
                  left: guide.bounds.left,
                  top: guide.position,
                  width: guide.bounds.width,
                  height: 1,
                }
          }
        />
      )}
    </>
  );
}
