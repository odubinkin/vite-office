/** @fileoverview Browser projection of Writer's SwRuler/SvxRuler page and paragraph handles. */

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { createPortal } from "react-dom";

import type { WriterPageDescriptorValue } from "../../source/core/layout/pagedesc";
import type { WriterParagraphProjection } from "./writer-view-projection";
import { useRulerTracking, type RulerTracking } from "./use-ruler-tracking";

const TWIPS_PER_CSS_PIXEL = 15;
// LibreOffice's centimetre ruler uses a 1 mm nTick1 division (svtools/source/control/ruler.cxx).
const MINOR_TICK_TWIPS = 1440 / 2.54 / 10;
const MINOR_TICK_PIXELS = MINOR_TICK_TWIPS / TWIPS_PER_CSS_PIXEL;

/** Model values and Writer command callbacks consumed by both rulers. */
export interface WriterRulersProps {
  readonly horizontalVisible: boolean;
  readonly onPageChange: (edge: "left" | "right" | "top" | "bottom", deltaTwips: number) => void;
  readonly onParagraphIndentChange: (
    edge: "left" | "firstLine" | "right",
    deltaTwips: number,
  ) => void;
  readonly page: WriterPageDescriptorValue;
  readonly paragraph: WriterParagraphProjection;
  readonly onTabStopAdd?: (positionTwips: number) => void;
  readonly onTabStopMove?: (index: number, deltaTwips: number) => void;
}

/** Renders physical centimetre ticks and draggable Writer margin/indent markers. @param props - Geometry, paragraph, visibility, and commit callbacks. @returns Writer rulers. */
export function WriterRulers(props: WriterRulersProps): React.JSX.Element {
  const tracking = useRulerTracking(props.horizontalVisible);
  const [newTab, setNewTab] = useState<number | null>(null);
  const [newTabWorkspace, setNewTabWorkspace] = useState<HTMLElement | null>(null);
  const pageWidth = props.page.width / TWIPS_PER_CSS_PIXEL;
  const paragraphLeft = props.paragraph.textLeftMargin;
  const tabStopsPt = props.paragraph.computedStyle.tabStopsPt ?? [];
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
            onPointerDown={
              /** Handles Writer formatting state. @param event - Input value. @returns Callback result. */ (
                event,
              ) => {
                const addTab = props.onTabStopAdd;
                if (
                  event.button !== 0 ||
                  event.detail > 1 ||
                  tracking.IsTracking() ||
                  event.target !== event.currentTarget ||
                  addTab === undefined
                )
                  return;
                const position = Math.round(
                  (event.clientX - event.currentTarget.getBoundingClientRect().left) *
                    TWIPS_PER_CSS_PIXEL -
                    props.page.leftMargin -
                    paragraphLeft,
                );
                if (position <= 0) return;
                const owner = event.currentTarget;
                const pagePosition = props.page.leftMargin + paragraphLeft + position;
                startDrag(
                  event,
                  "x",
                  pagePosition / TWIPS_PER_CSS_PIXEL,
                  props.page.leftMargin / TWIPS_PER_CSS_PIXEL,
                  /** Paints a new tab locally until tracking accepts it. @param delta - Transient pixel delta. @returns Nothing. */
                  (delta) =>
                    setNewTab(delta === null ? null : pagePosition / TWIPS_PER_CSS_PIXEL + delta),
                  /** Creates one model tab only after an accepted gesture. @param delta - Final snapped twip delta. @returns Nothing. */
                  (delta) => addTab(position + delta),
                  tracking,
                  /** Captures document geometry without changing the model. @returns Nothing. */ () =>
                    setNewTabWorkspace(owner.closest('[aria-label="Writer workspace"]')),
                );
              }
            }
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
              tracking={tracking}
              ariaLabel="Left page margin"
              axis="x"
              className="h-full w-2 bg-indigo-700/70"
              origin={props.page.leftMargin / TWIPS_PER_CSS_PIXEL}
              position={props.page.leftMargin / TWIPS_PER_CSS_PIXEL}
              onCommit={
                /** Commits the left page margin. @param delta - Drag delta in twips. @returns Nothing. */ (
                  delta,
                ) => props.onPageChange("left", delta)
              }
            />
            <RulerHandle
              tracking={tracking}
              ariaLabel="Right page margin"
              axis="x"
              className="h-full w-2 bg-indigo-700/70"
              origin={props.page.leftMargin / TWIPS_PER_CSS_PIXEL}
              position={(props.page.width - props.page.rightMargin) / TWIPS_PER_CSS_PIXEL}
              onCommit={
                /** Commits the right page margin. @param delta - Drag delta in twips. @returns Nothing. */ (
                  delta,
                ) => props.onPageChange("right", delta)
              }
            />
            <RulerHandle
              tracking={tracking}
              ariaLabel="Paragraph left indent"
              axis="x"
              className="h-0 w-0 border-x-[6px] border-b-[8px] border-x-transparent border-b-slate-950"
              edge="bottom"
              origin={props.page.leftMargin / TWIPS_PER_CSS_PIXEL}
              position={(props.page.leftMargin + paragraphLeft) / TWIPS_PER_CSS_PIXEL}
              onCommit={
                /** Commits the paragraph left indent. @param delta - Drag delta in twips. @returns Nothing. */ (
                  delta,
                ) => props.onParagraphIndentChange("left", delta)
              }
            />
            <RulerHandle
              tracking={tracking}
              ariaLabel="First line indent"
              axis="x"
              className="h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-indigo-700"
              origin={props.page.leftMargin / TWIPS_PER_CSS_PIXEL}
              position={(props.page.leftMargin + paragraphLeft + firstLine) / TWIPS_PER_CSS_PIXEL}
              onCommit={
                /** Commits the first-line indent. @param delta - Drag delta in twips. @returns Nothing. */ (
                  delta,
                ) => props.onParagraphIndentChange("firstLine", delta)
              }
            />
            <RulerHandle
              tracking={tracking}
              ariaLabel="Paragraph right indent"
              axis="x"
              className="h-0 w-0 border-x-[6px] border-b-[8px] border-x-transparent border-b-slate-950"
              edge="bottom"
              origin={props.page.leftMargin / TWIPS_PER_CSS_PIXEL}
              position={
                (props.page.width - props.page.rightMargin - paragraphRight) / TWIPS_PER_CSS_PIXEL
              }
              onCommit={
                /** Commits the paragraph right indent. @param delta - Drag delta in twips. @returns Nothing. */ (
                  delta,
                ) => props.onParagraphIndentChange("right", delta)
              }
            />
            {tabStopsPt.map(
              /** Handles Writer formatting state. @param positionPt - Input value. @param index - Input value. @returns Callback result. */ (
                positionPt,
                index,
              ) => (
                <RulerHandle
                  tracking={tracking}
                  ariaLabel={`Tab stop ${index + 1}`}
                  axis="x"
                  className="h-3 w-2 border-b-2 border-l-2 border-indigo-700"
                  edge="bottom"
                  key={`${positionPt}-${index}`}
                  origin={props.page.leftMargin / TWIPS_PER_CSS_PIXEL}
                  position={
                    (props.page.leftMargin + paragraphLeft + positionPt * 20) / TWIPS_PER_CSS_PIXEL
                  }
                  onCommit={
                    /** Handles Writer formatting state. @param delta - Input value. @returns Callback result. */ (
                      delta,
                    ) => props.onTabStopMove?.(index, delta)
                  }
                />
              ),
            )}
            {newTab === null ? null : (
              <span
                aria-hidden="true"
                data-ruler-new-tab="true"
                className="pointer-events-none absolute bottom-0 h-3 w-2 border-b-2 border-l-2 border-indigo-700"
                style={{ left: newTab, transform: "translateX(-50%)" }}
              />
            )}
          </div>
        </div>
      ) : null}
      {newTab !== null && newTabWorkspace !== null
        ? createPortal(renderDragGuides(newTabWorkspace, "x", newTab, null), document.body)
        : null}
    </>
  );
}

/** Renders a page-owned vertical ruler in the same scroll and page coordinate space. @param props - Page descriptor and change callback. @returns Vertical ruler. */
export function WriterVerticalRuler({
  onPageChange,
  page,
}: Readonly<{
  onPageChange: (edge: "left" | "right" | "top" | "bottom", deltaTwips: number) => void;
  page: WriterPageDescriptorValue;
}>): React.JSX.Element {
  const tracking = useRulerTracking();
  return (
    <div
      aria-label="Writer vertical ruler"
      className="absolute left-0 top-0 w-8 bg-white text-[9px] text-slate-500"
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
        tracking={tracking}
        ariaLabel="Top page margin"
        axis="y"
        className="h-2 w-full bg-indigo-700/70"
        origin={page.topMargin / TWIPS_PER_CSS_PIXEL}
        position={page.topMargin / TWIPS_PER_CSS_PIXEL}
        onCommit={
          /** Commits the top page margin. @param delta - Drag delta in twips. @returns Nothing. */ (
            delta,
          ) => onPageChange("top", delta)
        }
      />
      <RulerHandle
        tracking={tracking}
        ariaLabel="Bottom page margin"
        axis="y"
        className="h-2 w-full bg-indigo-700/70"
        origin={page.topMargin / TWIPS_PER_CSS_PIXEL}
        position={(page.height - page.bottomMargin) / TWIPS_PER_CSS_PIXEL}
        onCommit={
          /** Commits the bottom page margin. @param delta - Drag delta in twips. @returns Nothing. */ (
            delta,
          ) => onPageChange("bottom", delta)
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
  const first = Math.ceil(-originTwips / MINOR_TICK_TWIPS);
  const last = Math.floor((lengthTwips - originTwips) / MINOR_TICK_TWIPS);
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {Array.from(
        { length: last - first + 1 },
        /** Renders one centimetre tick. @param _value - Unused array value. @param index - Centimetre index. @returns Tick element. */ (
          _value,
          offset,
        ) => {
          const index = first + offset;
          const position = (originTwips + index * MINOR_TICK_TWIPS) / TWIPS_PER_CSS_PIXEL;
          const wholeCentimetre = index % 10 === 0;
          const halfCentimetre = index % 5 === 0;
          return (
            <span
              className="absolute border-slate-400"
              key={index}
              style={
                orientation === "horizontal"
                  ? {
                      borderLeftWidth: 1,
                      height: wholeCentimetre ? 12 : halfCentimetre ? 8 : 4,
                      left: position,
                      top: 0,
                    }
                  : {
                      borderTopWidth: 1,
                      left: 0,
                      top: position,
                      width: wholeCentimetre ? 12 : halfCentimetre ? 8 : 4,
                    }
              }
            >
              {wholeCentimetre ? Math.abs(index / 10) : ""}
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
  origin,
  onCommit,
  position,
  tracking,
}: Readonly<{
  ariaLabel: string;
  axis: "x" | "y";
  className: string;
  edge?: "top" | "bottom";
  origin: number;
  onCommit: (deltaTwips: number) => void;
  position: number;
  tracking: RulerTracking;
}>): React.JSX.Element {
  const cancelDrag = useRef<(() => void) | undefined>(undefined);
  useEffect(
    /** Releases a removed handle while the surrounding ruler may survive. @returns Handle cleanup. */
    () => /** Discards a retained gesture. @returns Nothing. */ () => cancelDrag.current?.(),
    [],
  );
  const [dragDelta, setDragDelta] = useState<number | null>(null);
  const [dragWorkspace, setDragWorkspace] = useState<HTMLElement | null>(null);
  const [dragPageIndex, setDragPageIndex] = useState<number | null>(null);
  return (
    <>
      <button
        aria-label={ariaLabel}
        className={`absolute z-20 ${className}`}
        onPointerDown={
          /** Starts one handle drag. @param event - Pointer-down event. @returns Nothing. */ (
            event,
          ) => {
            const owner = event.currentTarget;
            const cancel = startDrag(
              event,
              axis,
              position,
              origin,
              setDragDelta,
              onCommit,
              tracking,
              /** Captures presentation ownership only for an admitted drag. @returns Nothing. */ () => {
                setDragWorkspace(owner.closest('[aria-label="Writer workspace"]'));
                const pageIndex = owner.closest<HTMLElement>("[data-ruler-page-index]");
                setDragPageIndex(
                  pageIndex === null ? null : Number(pageIndex.dataset.rulerPageIndex),
                );
              },
            );
            if (cancel !== undefined) cancelDrag.current = cancel;
          }
        }
        style={
          axis === "x"
            ? {
                cursor: "ew-resize",
                left: position + (dragDelta ?? 0),
                ...(edge === "bottom" ? { bottom: 0 } : { top: 0 }),
                transform: "translateX(-50%)",
              }
            : {
                cursor: "ns-resize",
                left: 0,
                top: position + (dragDelta ?? 0),
                transform: "translateY(-50%)",
              }
        }
        title={ariaLabel}
        type="button"
      />
      {dragDelta !== null && dragWorkspace !== null
        ? createPortal(
            renderDragGuides(dragWorkspace, axis, position + dragDelta, dragPageIndex),
            document.body,
          )
        : null}
    </>
  );
}

/** Draws the current snapped position across the visible portions of document pages. @param workspace - Writer workspace. @param axis - Active ruler axis. @param position - Snapped page position in pixels. @param pageIndex - Active page for vertical drags. @returns Guide overlay. */
function renderDragGuides(
  workspace: HTMLElement,
  axis: "x" | "y",
  position: number,
  pageIndex: number | null,
): React.JSX.Element {
  const canvas = workspace.querySelector<HTMLElement>(
    '[aria-label="Writer document canvas"]',
  ) as HTMLElement;
  const canvasRect = canvas.getBoundingClientRect();
  const pages = canvas.querySelectorAll<HTMLElement>("[data-writer-page]");
  return (
    <div aria-hidden="true" data-ruler-guide-layer="true">
      {[...pages].map(
        /** Draws one page guide. @param page - Rendered document page. @param index - Page index. @returns Guide or null. */ (
          page,
          index,
        ) => {
          if (axis === "y" && pageIndex !== null && index !== pageIndex) return null;
          const rect = page.getBoundingClientRect();
          const top = Math.max(rect.top, canvasRect.top);
          const bottom = Math.min(rect.bottom, canvasRect.bottom);
          if (bottom <= top && rect.height > 0) return null;
          if (
            axis === "y" &&
            rect.height > 0 &&
            (rect.top + position < canvasRect.top || rect.top + position > canvasRect.bottom)
          )
            return null;
          return (
            <div
              data-ruler-guide={axis}
              key={index}
              style={
                axis === "x"
                  ? {
                      position: "fixed",
                      pointerEvents: "none",
                      zIndex: 100,
                      borderLeft: "1px dashed #4f46e5",
                      left: rect.left + position,
                      top,
                      height: Math.max(0, bottom - top),
                    }
                  : {
                      position: "fixed",
                      pointerEvents: "none",
                      zIndex: 100,
                      borderTop: "1px dashed #4f46e5",
                      left: rect.left,
                      top: rect.top + position,
                      width: rect.width,
                    }
              }
            />
          );
        },
      )}
    </div>
  );
}

/** Paints one admitted gesture and converts its selected-axis delta to twips. @param event - Pointer-down event. @param axis - Active axis. @param position - Handle position in pixels. @param origin - Tick origin in pixels. @param onPreview - Transient pixel delta callback. @param onCommit - Final twip delta callback. @param tracking - Owning ruler tracking. @param onBegin - Captures presentation ownership. @returns Admitted gesture cancellation. */
function startDrag(
  event: ReactPointerEvent<HTMLElement>,
  axis: "x" | "y",
  position: number,
  origin: number,
  onPreview: (deltaPixels: number | null) => void,
  onCommit: (deltaTwips: number) => void,
  tracking: RulerTracking,
  onBegin: () => void,
): (() => void) | undefined {
  const start = axis === "x" ? event.clientX : event.clientY;
  let last = start;
  const snap =
    /** Snaps a pointer delta to the smallest ruler division. @param rawDelta - Raw drag distance in pixels. @returns Snapped distance in pixels. */ (
      rawDelta: number,
    ): number =>
      rawDelta === 0
        ? 0
        : origin +
          Math.round((position + rawDelta - origin) / MINOR_TICK_PIXELS) * MINOR_TICK_PIXELS -
          position;
  return tracking.StartTracking(event, {
    /** Starts transient painting after tracking admission. @returns Nothing. */
    onStart: () => {
      onBegin();
      onPreview(0);
    },
    /** Updates the retained position and snapped preview. @param pointer - Owned input. @returns Nothing. */
    onMove: (pointer) => {
      last = axis === "x" ? pointer.clientX : pointer.clientY;
      onPreview(snap(last - start));
    },
    /** Discards cancellation or applies one accepted final position. @param cancelled - Cancellation flag. @param pointer - Optional final pointer input. @returns Nothing. */
    onEnd: (cancelled, pointer) => {
      onPreview(null);
      if (cancelled) return;
      const end = pointer === undefined ? last : axis === "x" ? pointer.clientX : pointer.clientY;
      onCommit(Math.round(snap(end - start) * TWIPS_PER_CSS_PIXEL));
    },
  });
}
