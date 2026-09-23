/** @fileoverview Browser projection of Writer's SwRuler/SvxRuler page and paragraph handles. */

import { useState, type PointerEvent as ReactPointerEvent } from "react";

import type { WriterPageDescriptorValue } from "../../source/core/layout/pagedesc";
import type { WriterParagraphProjection } from "./writer-view-projection";

const TWIPS_PER_CSS_PIXEL = 15;

/** Model values and Writer command callbacks consumed by both rulers. */
export interface WriterRulersProps {
  readonly horizontalVisible: boolean;
  readonly onPageChange: (value: WriterPageDescriptorValue) => void;
  readonly onParagraphIndentChange: (
    value: Readonly<{ firstLine: number; left: number; right: number }>,
  ) => void;
  readonly page: WriterPageDescriptorValue;
  readonly paragraph: WriterParagraphProjection;
}

/** Renders physical centimetre ticks and draggable Writer margin/indent markers. @param props - Geometry, paragraph, visibility, and commit callbacks. @returns Writer rulers. */
export function WriterRulers(props: WriterRulersProps): React.JSX.Element {
  const pageWidth = props.page.width / TWIPS_PER_CSS_PIXEL;
  const paragraphLeft = props.paragraph.textLeftMargin;
  const firstLine = props.paragraph.computedStyle.firstLineIndentPt * 20;
  const paragraphRight = props.paragraph.computedStyle.rightMarginPt * 20;
  return (
    <>
      {props.horizontalVisible ? (
        <div
          aria-label="Writer horizontal ruler"
          className="col-start-2 row-start-1 h-8 overflow-hidden border-b border-slate-300 bg-slate-100"
          role="toolbar"
        >
          <div
            className="relative mx-auto h-full bg-white text-[9px] text-slate-500"
            style={{ width: pageWidth }}
          >
            <div
              className="absolute inset-y-0 left-0 bg-slate-300/80"
              style={{ width: props.page.leftMargin / TWIPS_PER_CSS_PIXEL }}
            />
            <div
              className="absolute inset-y-0 right-0 bg-slate-300/80"
              style={{ width: props.page.rightMargin / TWIPS_PER_CSS_PIXEL }}
            />
            <RulerTicks
              lengthTwips={props.page.width}
              orientation="horizontal"
              originTwips={props.page.leftMargin}
            />
            <RulerHandle
              ariaLabel="Left page margin"
              axis="x"
              className="h-full w-2 bg-indigo-700/70"
              position={props.page.leftMargin / TWIPS_PER_CSS_PIXEL}
              onCommit={
                /** Commits the left page margin. @param delta - Drag delta in twips. @returns Nothing. */ (
                  delta,
                ) =>
                  props.onPageChange({
                    ...props.page,
                    leftMargin: clampMargin(
                      props.page.leftMargin + delta,
                      props.page.width - props.page.rightMargin,
                    ),
                  })
              }
            />
            <RulerHandle
              ariaLabel="Right page margin"
              axis="x"
              className="h-full w-2 bg-indigo-700/70"
              position={(props.page.width - props.page.rightMargin) / TWIPS_PER_CSS_PIXEL}
              onCommit={
                /** Commits the right page margin. @param delta - Drag delta in twips. @returns Nothing. */ (
                  delta,
                ) =>
                  props.onPageChange({
                    ...props.page,
                    rightMargin: clampMargin(
                      props.page.rightMargin - delta,
                      props.page.width - props.page.leftMargin,
                    ),
                  })
              }
            />
            <RulerHandle
              ariaLabel="Paragraph left indent"
              axis="x"
              className="h-0 w-0 border-x-[6px] border-b-[8px] border-x-transparent border-b-slate-950"
              edge="bottom"
              position={(props.page.leftMargin + paragraphLeft) / TWIPS_PER_CSS_PIXEL}
              onCommit={
                /** Commits the paragraph left indent. @param delta - Drag delta in twips. @returns Nothing. */ (
                  delta,
                ) =>
                  props.onParagraphIndentChange({
                    firstLine,
                    left: Math.max(0, paragraphLeft + delta),
                    right: paragraphRight,
                  })
              }
            />
            <RulerHandle
              ariaLabel="First line indent"
              axis="x"
              className="h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-indigo-700"
              position={(props.page.leftMargin + paragraphLeft + firstLine) / TWIPS_PER_CSS_PIXEL}
              onCommit={
                /** Commits the first-line indent. @param delta - Drag delta in twips. @returns Nothing. */ (
                  delta,
                ) =>
                  props.onParagraphIndentChange({
                    firstLine: firstLine + delta,
                    left: paragraphLeft,
                    right: paragraphRight,
                  })
              }
            />
            <RulerHandle
              ariaLabel="Paragraph right indent"
              axis="x"
              className="h-0 w-0 border-x-[6px] border-b-[8px] border-x-transparent border-b-slate-950"
              edge="bottom"
              position={
                (props.page.width - props.page.rightMargin - paragraphRight) / TWIPS_PER_CSS_PIXEL
              }
              onCommit={
                /** Commits the paragraph right indent. @param delta - Drag delta in twips. @returns Nothing. */ (
                  delta,
                ) =>
                  props.onParagraphIndentChange({
                    firstLine,
                    left: paragraphLeft,
                    right: Math.max(0, paragraphRight - delta),
                  })
              }
            />
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Renders a page-owned vertical ruler in the same scroll and page coordinate space. */
export function WriterVerticalRuler({
  onPageChange,
  page,
}: Readonly<{
  onPageChange: (value: WriterPageDescriptorValue) => void;
  page: WriterPageDescriptorValue;
}>): React.JSX.Element {
  return (
    <div
      aria-label="Writer vertical ruler"
      className="absolute -left-8 top-0 w-8 border-r border-slate-300 bg-white text-[9px] text-slate-500"
      contentEditable={false}
      role="toolbar"
      style={{ height: page.height / TWIPS_PER_CSS_PIXEL }}
    >
      <div
        className="absolute inset-x-0 top-0 bg-slate-300/80"
        style={{ height: page.topMargin / TWIPS_PER_CSS_PIXEL }}
      />
      <div
        className="absolute inset-x-0 bottom-0 bg-slate-300/80"
        style={{ height: page.bottomMargin / TWIPS_PER_CSS_PIXEL }}
      />
      <RulerTicks lengthTwips={page.height} orientation="vertical" originTwips={page.topMargin} />
      <RulerHandle
        ariaLabel="Top page margin"
        axis="y"
        className="h-2 w-full bg-indigo-700/70"
        position={page.topMargin / TWIPS_PER_CSS_PIXEL}
        onCommit={
          /** Commits the top page margin. @param delta - Drag delta in twips. @returns Nothing. */ (
            delta,
          ) =>
            onPageChange({
              ...page,
              topMargin: clampMargin(page.topMargin + delta, page.height - page.bottomMargin),
            })
        }
      />
      <RulerHandle
        ariaLabel="Bottom page margin"
        axis="y"
        className="h-2 w-full bg-indigo-700/70"
        position={(page.height - page.bottomMargin) / TWIPS_PER_CSS_PIXEL}
        onCommit={
          /** Commits the bottom page margin. @param delta - Drag delta in twips. @returns Nothing. */ (
            delta,
          ) =>
            onPageChange({
              ...page,
              bottomMargin: clampMargin(page.bottomMargin - delta, page.height - page.topMargin),
            })
        }
      />
    </div>
  );
}

/** Renders centimetre ticks along one physical page axis. @param props - Axis length and orientation. @returns Tick layer. */
function RulerTicks({
  lengthTwips,
  orientation,
  originTwips,
}: Readonly<{
  lengthTwips: number;
  orientation: "horizontal" | "vertical";
  originTwips: number;
}>): React.JSX.Element {
  const centimetreTwips = 1440 / 2.54;
  const first = Math.ceil(-originTwips / centimetreTwips);
  const last = Math.floor((lengthTwips - originTwips) / centimetreTwips);
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from(
        { length: last - first + 1 },
        /** Renders one centimetre tick. @param _value - Unused array value. @param index - Centimetre index. @returns Tick element. */ (
          _value,
          offset,
        ) => {
          const index = first + offset;
          const position = (originTwips + index * centimetreTwips) / TWIPS_PER_CSS_PIXEL;
          return (
            <span
              className="absolute border-slate-400"
              key={index}
              style={
                orientation === "horizontal"
                  ? { borderLeftWidth: 1, height: index % 5 === 0 ? 12 : 7, left: position, top: 0 }
                  : { borderTopWidth: 1, left: 0, top: position, width: index % 5 === 0 ? 12 : 7 }
              }
            >
              {index % 5 === 0 ? Math.abs(index) : ""}
            </span>
          );
        },
      )}
    </div>
  );
}

/** Renders one accessible drag handle and commits its final delta. @param props - Handle label, axis, style, position, and callback. @returns Handle button. */
function RulerHandle({
  ariaLabel,
  axis,
  className,
  edge,
  onCommit,
  position,
}: Readonly<{
  ariaLabel: string;
  axis: "x" | "y";
  className: string;
  edge?: "top" | "bottom";
  onCommit: (deltaTwips: number) => void;
  position: number;
}>): React.JSX.Element {
  const [dragDelta, setDragDelta] = useState(0);
  return (
    <button
      aria-label={ariaLabel}
      className={`absolute z-20 ${className}`}
      onPointerDown={
        /** Starts one handle drag. @param event - Pointer-down event. @returns Nothing. */ (
          event,
        ) => startDrag(event, axis, setDragDelta, onCommit)
      }
      style={
        axis === "x"
          ? {
              cursor: "ew-resize",
              left: position + dragDelta,
              ...(edge === "bottom" ? { bottom: 0 } : { top: 0 }),
              transform: "translateX(-50%)",
            }
          : {
              cursor: "ns-resize",
              left: 0,
              top: position + dragDelta,
              transform: "translateY(-50%)",
            }
      }
      title={ariaLabel}
      type="button"
    />
  );
}

/** Tracks one pointer gesture and converts its selected-axis delta to twips. @param event - Pointer-down event. @param axis - Active axis. @param onCommit - Final delta callback. @returns Nothing. */
function startDrag(
  event: ReactPointerEvent<HTMLButtonElement>,
  axis: "x" | "y",
  onPreview: (deltaPixels: number) => void,
  onCommit: (deltaTwips: number) => void,
): void {
  event.preventDefault();
  const start = axis === "x" ? event.clientX : event.clientY;
  const move =
    /** Updates the handle while dragging. @param pointerEvent - Pointer-move event. @returns Nothing. */ (
      pointerEvent: PointerEvent,
    ): void => onPreview((axis === "x" ? pointerEvent.clientX : pointerEvent.clientY) - start);
  const cancel = /** Cancels a pointer gesture. @returns Nothing. */ (): void => cleanup();
  const cleanup =
    /** Releases gesture listeners and the visual preview. @returns Nothing. */ (): void => {
      globalThis.removeEventListener("pointermove", move);
      globalThis.removeEventListener("pointerup", finish);
      globalThis.removeEventListener("pointercancel", cancel);
      onPreview(0);
    };
  const finish =
    /** Commits the final pointer position. @param pointerEvent - Pointer-up event. @returns Nothing. */ (
      pointerEvent: PointerEvent,
    ): void => {
      const end = axis === "x" ? pointerEvent.clientX : pointerEvent.clientY;
      cleanup();
      onCommit(Math.round((end - start) * TWIPS_PER_CSS_PIXEL));
    };
  globalThis.addEventListener("pointermove", move);
  globalThis.addEventListener("pointerup", finish);
  globalThis.addEventListener("pointercancel", cancel);
}

/** Keeps a dragged margin inside the page while retaining a minimum text area. @param value - Candidate margin. @param oppositeBoundary - Available opposite edge. @returns Clamped margin. */
function clampMargin(value: number, oppositeBoundary: number): number {
  return Math.max(0, Math.min(value, oppositeBoundary - 567));
}
