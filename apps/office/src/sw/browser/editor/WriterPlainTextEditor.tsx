/** @fileoverview Projects Writer paragraphs through one browser implementation of SwEditWin. */

import { useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { WriterRulerLaneContext } from "../presentation/writer-ruler-lane-context";

import type { SwEditWin } from "../../source/uibase/docvw/edtwin";
import type { WriterParagraphProjection as WriterParagraph } from "../presentation/writer-view-projection";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
import type { WriterCursorSelection } from "./writer-selection-types";
import type { WriterPageDescriptorValue } from "../../source/core/layout/pagedesc";
import { createSwPageFrames, type SwPageDescriptorLayout } from "../../source/core/layout/newfrm";
import { SwLineNumberInfo, type SwLineNumberInfoValue } from "../../inc/lineinfo";
import type {
  SwTextFrameInput,
  SwTextFrameSettings,
  SwTextLine,
} from "../../source/core/text/txtfrm";
import { projectSwLineNumbers } from "../../source/core/text/txtfrm";
import { measureWriterTextLines } from "./writer-line-measurement";

/** Defines immutable render values plus the persistent Writer edit-window owner. */
export interface WriterPlainTextEditorProps {
  readonly activeParagraphId: string;
  readonly cursorSelection: WriterCursorSelection;
  readonly editWindow: SwEditWin;
  readonly paragraphs: readonly WriterParagraph[];
  readonly pageDescriptor: WriterPageDescriptorValue;
  readonly pageDescriptors?: SwPageDescriptorLayout["descriptors"];
  readonly paragraphSpacingSettings?: SwTextFrameSettings;
  readonly verticalRuler?: ReactNode;
  readonly showLineNumbers?: boolean;
  readonly lineNumberInfo?: SwLineNumberInfoValue;
}

/** Renders one root `contenteditable` and forwards browser events to one stable controller. @param props - Immutable projection and edit-window owner. @returns Logical Writer document editing host. */
export function WriterPlainTextEditor(props: WriterPlainTextEditorProps): React.JSX.Element {
  const rulerLane = useContext(WriterRulerLaneContext);
  const rootElement = useRef<HTMLElement | null>(null);
  const measurementHost = useRef<HTMLDivElement | null>(null);
  const measurementRootRef = useRef<ShadowRoot | null>(null);
  const [measurementRoot, setMeasurementRoot] = useState<ShadowRoot | null>(null);
  const [measurementRevision, setMeasurementRevision] = useState(0);
  const [paragraphElements] = useState(
    /** Creates the stable paragraph projection registry. @returns Empty paragraph registry. */ () =>
      new Map<string, HTMLParagraphElement>(),
  );
  const [measurementElements] = useState(
    /** Creates the offscreen measurement registry. @returns Empty paragraph registry. */ () =>
      new Map<string, HTMLParagraphElement>(),
  );
  const controller = useMemo(
    /** Creates the only DOM-facing Writer edit-window implementation. @returns Stable browser controller. */
    () =>
      new BrowserWriterEditWindow(
        props.editWindow,
        {
          document: globalThis.document,
          getSelection:
            /** Reads the active browser selection. @returns Current browser selection. */ () =>
              globalThis.getSelection(),
        },
        /** Resolves one mounted render identity. @param paragraphId - Projection key. @param offset - Source-node offset. @returns Mounted fragment. */ (
          paragraphId,
          offset = 0,
        ) => {
          const fragments = [...paragraphElements.values()].filter(
            /** Matches the source-node identity. @param element - Mounted fragment. @returns Whether the identity matches. */ (
              element,
            ) => element.dataset.writerParagraphId === paragraphId,
          );
          return (
            fragments.find(
              /** Finds the fragment containing the source offset. @param element - Mounted fragment. @returns Whether the offset belongs. */ (
                element,
              ) =>
                Number(element.dataset.writerFragmentStart) <= offset &&
                offset <= Number(element.dataset.writerFragmentEnd),
            ) ?? fragments[fragments.length - 1]
          );
        },
      ),
    [paragraphElements, props.editWindow],
  );
  const [measuredLines, setMeasuredLines] = useState<ReadonlyMap<string, readonly SwTextLine[]>>(
    /** Starts without browser line measurements. @returns Empty line map. */ () => new Map(),
  );
  const inputs: readonly SwTextFrameInput[] = props.paragraphs.map(
    /** Adapts one projection to a Writer text-frame input. @param paragraph - View paragraph. @returns Writer frame input. */ (
      paragraph,
    ) => ({
      id: paragraph.id,
      lines: measuredLines.get(paragraph.id) ?? [
        {
          start: 0,
          end: paragraph.text.length,
          height: paragraph.computedStyle.fontSizePt * paragraph.computedStyle.lineHeight * 20,
        },
      ],
      lowerSpacing: paragraph.computedStyle.lowerSpacingPt * 20,
      style: paragraph.style,
      contextualSpacing: paragraph.computedStyle.contextualSpacing ?? false,
      upperSpacing: paragraph.computedStyle.upperSpacingPt * 20,
      keepWithNext: paragraph.computedStyle.keepWithNext ?? false,
      countLineNumbers: paragraph.computedStyle.countLineNumbers ?? true,
    }),
  );
  const pages = createSwPageFrames(
    inputs,
    props.pageDescriptors === undefined
      ? props.pageDescriptor
      : { descriptors: props.pageDescriptors, initialName: props.pageDescriptor.name },
    props.paragraphSpacingSettings,
  );
  const paragraphById = new Map(
    props.paragraphs.map(
      /** Indexes one view paragraph. @param paragraph - View paragraph. @returns Key and paragraph pair. */ (
        paragraph,
      ) => [paragraph.id, paragraph],
    ),
  );
  const lineInfo = props.lineNumberInfo ?? new SwLineNumberInfo().QueryValue();
  const numberedFrames = projectSwLineNumbers(pages, inputs, {
    ...lineInfo,
    paintLineNumbers: props.showLineNumbers ?? lineInfo.paintLineNumbers,
  });

  useLayoutEffect(
    /** Supplies Writer with browser-shaped line boundaries after the measurement projection mounts. @returns Nothing. */
    function measureParagraphs(): () => void {
      let active = true;
      const next = new Map<string, readonly SwTextLine[]>();
      for (const paragraph of props.paragraphs) {
        const element = measurementElements.get(paragraph.id);
        if (element !== undefined)
          next.set(paragraph.id, measureWriterTextLines(paragraph, element));
      }
      if (
        next.size !== measuredLines.size ||
        [...next].some(
          /** Detects changed line geometry. @param entry - Node ID and lines. @returns Whether changed. */
          ([id, lines]) => JSON.stringify(measuredLines.get(id)) !== JSON.stringify(lines),
        )
      ) {
        globalThis.queueMicrotask(
          /** Applies measured browser geometry after this layout pass. @returns Nothing. */ (): void => {
            if (active) setMeasuredLines(next);
          },
        );
      }
      return /** Cancels the pending measurement update. @returns Nothing. */ () => {
        active = false;
      };
    },
    [
      measuredLines,
      measurementElements,
      measurementRoot,
      measurementRevision,
      props.pageDescriptor,
      props.pageDescriptors,
      props.paragraphs,
      props.paragraphSpacingSettings,
    ],
  );

  useEffect(
    /** Re-measures on browser width and font changes. @returns Observer cleanup. */ () => {
      const invalidate = /** Schedules a new measurement pass. @returns Nothing. */ (): void =>
        setMeasurementRevision(
          /** Advances the measurement revision. @param revision - Current revision. @returns Next revision. */ (
            revision,
          ) => revision + 1,
        );
      globalThis.addEventListener("resize", invalidate);
      const observer =
        typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(invalidate);
      observer?.observe(measurementHost.current as HTMLDivElement);
      void globalThis.document.fonts?.ready.then(invalidate);
      return /** Removes geometry subscriptions. @returns Nothing. */ () => {
        globalThis.removeEventListener("resize", invalidate);
        observer?.disconnect();
      };
    },
    [],
  );

  useLayoutEffect(
    /** Restores the shell-owned selection after canonical paragraph projection. @returns Nothing. */
    function restoreCanonicalSelection(): void {
      controller.RestoreSelection(props.cursorSelection);
    },
    [controller, measuredLines, props.cursorSelection, props.paragraphs],
  );

  useEffect(
    /** Installs the edit-window native event boundary. @returns Listener cleanup. */
    function subscribeEditWindow(): () => void {
      return controller.Subscribe(rootElement.current as HTMLElement);
    },
    [controller],
  );

  return (
    <>
      {props.verticalRuler && rulerLane.lane
        ? createPortal(
            <div
              className="pt-5 sm:pt-8"
              style={{ transform: `translateY(-${rulerLane.scrollTop}px)` }}
            >
              {pages.map(
                /** Mirrors each page in the fixed ruler lane. @param page - Physical page frame. @param index - Zero-based page index. @returns Ruler segment. */ (
                  page,
                  index,
                ) => (
                  <div
                    className={index < pages.length - 1 ? "mb-6" : ""}
                    data-ruler-page-index={index}
                    key={`ruler-page-${index}`}
                    style={{ height: page.descriptor.height / 15, position: "relative" }}
                  >
                    {props.verticalRuler}
                  </div>
                ),
              )}
            </div>,
            rulerLane.lane,
          )
        : null}
      <div
        ref={
          /** Isolates measurement text from document queries and selection. @param element - Measurement host. @returns Nothing. */ (
            element,
          ) => {
            measurementHost.current = element;
            if (element !== null && measurementRootRef.current === null) {
              const root = element.attachShadow({ mode: "closed" });
              measurementRootRef.current = root;
              setMeasurementRoot(root);
            }
          }
        }
        aria-hidden="true"
        contentEditable={false}
        style={{
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
          width:
            (props.pageDescriptor.width -
              props.pageDescriptor.leftMargin -
              props.pageDescriptor.rightMargin) /
            15,
        }}
      >
        {measurementRoot === null
          ? null
          : createPortal(
              <>
                <style>{`.flex{display:flex}.items-start{align-items:flex-start}.shrink-0{flex-shrink:0}.min-w-0{min-width:0}.flex-1{flex:1}.whitespace-pre-wrap{white-space:pre-wrap}p{margin:0}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}`}</style>
                {props.paragraphs.map(
                  /** Renders a full paragraph in the browser measurement surface. @param paragraph - View paragraph. @param index - Paragraph index. @returns Measurement paragraph. */ (
                    paragraph,
                    index,
                  ) => (
                    <WriterEditableParagraph
                      index={index}
                      isActive={false}
                      key={`measure-${paragraph.id}`}
                      listMarker={paragraph.listMarker}
                      paragraph={paragraph}
                      paragraphSpacingSettings={props.paragraphSpacingSettings}
                      retainElement={
                        /** Retains the measurement paragraph. @param _id - Source node ID. @param element - Mounted element. @returns Nothing. */ (
                          _id,
                          element,
                        ) => {
                          if (element === null) measurementElements.delete(paragraph.id);
                          else measurementElements.set(paragraph.id, element);
                        }
                      }
                    />
                  ),
                )}
              </>,
              measurementRoot,
            )}
      </div>
      <article
        aria-label="Writer document body"
        className="grid w-max min-w-full justify-center gap-6 px-8 text-slate-950 outline-none"
        contentEditable
        data-writer-editing-host="true"
        onClick={controller.HandleClick}
        onCompositionEnd={controller.HandleCompositionEnd}
        onCompositionStart={controller.HandleCompositionStart}
        onCompositionUpdate={controller.HandleCompositionUpdate}
        onCopy={controller.HandleCopy}
        onCut={controller.HandleCut}
        onDragOver={controller.HandleDragOver}
        onDragStart={controller.HandleDragStart}
        onDrop={controller.HandleDrop}
        onFocus={controller.HandleFocus}
        onKeyDown={controller.HandleKeyDown}
        onMouseDown={controller.HandlePointerDown}
        onMouseMove={controller.HandlePointerMove}
        onMouseUp={controller.HandlePointerUp}
        onPaste={controller.HandlePaste}
        ref={rootElement}
        suppressContentEditableWarning
      >
        {pages.map(
          /** Renders one physical page. @param page - Page paragraphs. @param pageIndex - Zero-based page index. @returns Page element. */ (
            page,
            pageIndex,
          ) => (
            <div className="relative" key={`page-${pageIndex}`}>
              <section
                aria-label={`Page ${pageIndex + 1}`}
                className="box-border flex shrink-0 flex-col overflow-hidden bg-white shadow-xl shadow-slate-400/30"
                data-writer-page={pageIndex + 1}
                role="document"
                style={{
                  height: page.descriptor.height / 15,
                  paddingBottom: page.descriptor.bottomMargin / 15,
                  paddingLeft: page.descriptor.leftMargin / 15,
                  paddingRight: page.descriptor.rightMargin / 15,
                  paddingTop: page.descriptor.topMargin / 15,
                  width: page.descriptor.width / 15,
                }}
              >
                {page.textFrames.map(
                  /** Renders one Writer text-frame fragment on the current page. @param frame - Writer fragment. @param frameIndex - Fragment index. @returns Browser paragraph. */ (
                    frame,
                    frameIndex,
                  ) => {
                    const paragraph = paragraphById.get(frame.nodeId) as WriterParagraph;
                    const index = props.paragraphs.indexOf(paragraph);
                    const marks = (numberedFrames[pageIndex] as (typeof numberedFrames)[number])[
                      frameIndex
                    ] as (typeof numberedFrames)[number][number];
                    const lineNumbers = marks.map(
                      /** Converts a Writer line mark to browser points. @param mark - Core mark. @returns Visual position. */
                      (mark) => ({ number: mark.number, topPt: mark.topTwips / 20 }),
                    );
                    return (
                      <WriterEditableParagraph
                        index={index}
                        isActive={paragraph.id === props.activeParagraphId}
                        key={`${paragraph.id}:${frame.start}`}
                        listMarker={paragraph.listMarker}
                        paragraph={paragraph}
                        paragraphSpacingSettings={props.paragraphSpacingSettings}
                        fragmentStart={frame.start}
                        fragmentEnd={frame.end}
                        topSpacingPt={frame.topSpacing / 20}
                        isFollow={frame.follow}
                        lineNumbers={lineNumbers}
                        retainElement={
                          /** Retains the DOM identity used by SwEditWin. @param paragraphId - Projection identity. @param element - Mounted paragraph or null. @returns Nothing. */ (
                            paragraphId,
                            element,
                          ) => {
                            const key = `${paragraphId}:${frame.start}`;
                            if (element === null) paragraphElements.delete(key);
                            else paragraphElements.set(key, element);
                          }
                        }
                      />
                    );
                  },
                )}
              </section>
            </div>
          ),
        )}
      </article>
    </>
  );
}
