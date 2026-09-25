/** @fileoverview Projects Writer paragraphs through one browser implementation of SwEditWin. */

import { Fragment, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { WriterRulerLaneContext } from "../presentation/writer-ruler-lane-context";

import type { SwEditWin } from "../../source/uibase/docvw/edtwin";
import type { WriterParagraphProjection as WriterParagraph } from "../presentation/writer-view-projection";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
import { WriterEditableTable } from "./WriterEditableTable";
import type { SwTable } from "../../source/core/table/swtable";
import type { WriterCursorSelection } from "./writer-selection-types";
import type { WriterPageDescriptorValue } from "../../source/core/layout/pagedesc";
import {
  SwRootFrame,
  type SwPageDescriptorLayout,
  type SwTableFrame,
} from "../../source/core/layout/newfrm";
import { SwLineNumberInfo, type SwLineNumberInfoValue } from "../../inc/lineinfo";
import type { SwTextFrameSettings, SwTextLine } from "../../source/core/text/txtfrm";
import { createWriterLineMeasurements, measureWriterTextLines } from "./writer-line-measurement";

/** Defines immutable render values plus the persistent Writer edit-window owner. */
export interface WriterPlainTextEditorProps {
  readonly activeParagraphId: string;
  readonly cursorSelection: WriterCursorSelection;
  readonly editWindow: SwEditWin;
  readonly layout?: SwRootFrame;
  readonly paragraphs: readonly WriterParagraph[];
  readonly pageDescriptor: WriterPageDescriptorValue;
  readonly pageDescriptors?: SwPageDescriptorLayout["descriptors"];
  readonly paragraphSpacingSettings?: SwTextFrameSettings;
  readonly verticalRuler?: ReactNode;
  readonly showLineNumbers?: boolean;
  readonly lineNumberInfo?: SwLineNumberInfoValue;
  readonly selectedTable?: SwTable;
  readonly selectedTableRow?: number;
  readonly onSelectTableRow?: (table: SwTable, row: number) => void;
}

/** Renders one root `contenteditable` and forwards browser events to one stable controller. @param props - Immutable projection and edit-window owner. @returns Logical Writer document editing host. */
export function WriterPlainTextEditor(props: WriterPlainTextEditorProps): React.JSX.Element {
  const rulerLane = useContext(WriterRulerLaneContext);
  const rootElement = useRef<HTMLElement | null>(null);
  const measurementHost = useRef<HTMLDivElement | null>(null);
  const measurementRootRef = useRef<ShadowRoot | null>(null);
  const [measurementRoot, setMeasurementRoot] = useState<ShadowRoot | null>(null);
  const [measurementRevision, setMeasurementRevision] = useState(0);
  const [testLayout] = useState(
    /** Supplies a persistent layout root when the editor is mounted without a SwView. @returns Layout root. */
    () =>
      new SwRootFrame(
        /** Resolves the detached editor's current document. @returns Canonical document. */ () =>
          props.editWindow.GetDoc(),
      ),
  );
  const [paragraphElements] = useState(
    /** Creates the stable paragraph projection registry. @returns Empty paragraph registry. */ () =>
      new Map<string, HTMLParagraphElement>(),
  );
  const [measurementElements] = useState(
    /** Creates the offscreen measurement registry. @returns Empty paragraph registry. */ () =>
      new Map<string, HTMLParagraphElement>(),
  );
  const [tableMeasurementElements] = useState(
    /** callback handles this value. @returns The result. */ () =>
      new Map<string, HTMLTableElement>(),
  );
  const [measuredTableRows, setMeasuredTableRows] = useState<
    ReadonlyMap<string, readonly number[]>
  >(/** callback handles this value. @returns The result. */ () => new Map());
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
  const measurements = createWriterLineMeasurements(props.paragraphs, measuredLines);
  const tables = props.editWindow.GetDoc().GetTables();
  const tableMeasurements = tables.map(
    /** map handles this value. @param table - Input 1. @returns The result. */ (table) => ({
      tableName: table.GetName(),
      rowHeights: measuredTableRows.get(table.GetName()) ?? [],
    }),
  );
  const lineInfo = props.lineNumberInfo ?? new SwLineNumberInfo().QueryValue();
  const layout = (props.layout ?? testLayout).Format(
    measurements,
    props.pageDescriptors === undefined
      ? props.pageDescriptor
      : { descriptors: props.pageDescriptors, initialName: props.pageDescriptor.name },
    props.paragraphSpacingSettings,
    { ...lineInfo, paintLineNumbers: props.showLineNumbers ?? lineInfo.paintLineNumbers },
    measurementRevision,
    tableMeasurements,
  );
  const pages = layout.pages;
  const paragraphById = new Map(
    props.paragraphs.map(
      /** Indexes one view paragraph. @param paragraph - View paragraph. @returns Key and paragraph pair. */ (
        paragraph,
      ) => [paragraph.id, paragraph],
    ),
  );
  const numberedFrames = layout.lineNumbers;
  const lastFrame = new Map<string, string>();
  for (const [pageIndex, page] of pages.entries())
    for (const frame of page.textFrames) lastFrame.set(frame.nodeId, `${pageIndex}:${frame.start}`);
  const renderTable =
    /** renderTable handles this value. @param frame - Input 1. @returns The result. */ (
      frame: SwTableFrame,
    ): React.JSX.Element => (
      <WriterEditableTable
        key={`${frame.table.GetName()}:${frame.firstRow}`}
        table={frame.table}
        firstRow={frame.firstRow}
        lastRow={frame.lastRow}
        selectedRow={props.selectedTable === frame.table ? props.selectedTableRow : undefined}
        onSelectRow={
          /** Handles the browser table interaction. @param argument1 - Callback input. @returns Callback result. */ (
            row,
          ) => props.onSelectTableRow?.(frame.table, row)
        }
      />
    );

  useLayoutEffect(
    /** Supplies Writer with browser-shaped line boundaries after the measurement projection mounts. @returns Nothing. */
    function measureParagraphs(): () => void {
      // Print CSS hides the offscreen device surface. Reusing screen measurements
      // preserves the same physical page breaks in the printed document.
      if (globalThis.matchMedia?.("print").matches)
        return /** callback handles this value. @returns The result. */ () => undefined;
      let active = true;
      const next = new Map<string, readonly SwTextLine[]>();
      for (const paragraph of props.paragraphs) {
        const element = measurementElements.get(paragraph.id);
        if (element !== undefined)
          next.set(paragraph.id, measureWriterTextLines(paragraph, element));
      }
      const nextTableRows = new Map<string, readonly number[]>();
      for (const table of tables) {
        const element = tableMeasurementElements.get(table.GetName());
        if (element !== undefined)
          nextTableRows.set(
            table.GetName(),
            [...element.rows].map(
              /** map handles this value. @param row - Input 1. @returns The result. */ (row) =>
                row.getBoundingClientRect().height * 15,
            ),
          );
      }
      if (
        next.size !== measuredLines.size ||
        [...next].some(
          /** Detects changed line geometry. @param entry - Node ID and lines. @returns Whether changed. */
          ([id, lines]) => JSON.stringify(measuredLines.get(id)) !== JSON.stringify(lines),
        ) ||
        nextTableRows.size !== measuredTableRows.size ||
        [...nextTableRows].some(
          /** some handles this value. @param argument1 - Input 1. @returns The result. */ ([
            name,
            heights,
          ]) => JSON.stringify(measuredTableRows.get(name)) !== JSON.stringify(heights),
        )
      ) {
        globalThis.queueMicrotask(
          /** Applies measured browser geometry after this layout pass. @returns Nothing. */ (): void => {
            if (active) {
              setMeasuredLines(next);
              setMeasuredTableRows(nextTableRows);
              setMeasurementRevision(
                /** Advances the device revision after line geometry changes. @param revision - Current revision. @returns Next revision. */ (
                  revision,
                ) => revision + 1,
              );
            }
          },
        );
      }
      return /** Cancels the pending measurement update. @returns Nothing. */ () => {
        active = false;
      };
    },
    [
      measuredLines,
      measuredTableRows,
      measurementElements,
      tableMeasurementElements,
      tables,
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
      const printMedia = globalThis.matchMedia?.("print");
      printMedia?.addEventListener("change", invalidate);
      const observer =
        typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(invalidate);
      observer?.observe(measurementHost.current as HTMLDivElement);
      void globalThis.document.fonts?.ready.then(invalidate);
      return /** Removes geometry subscriptions. @returns Nothing. */ () => {
        globalThis.removeEventListener("resize", invalidate);
        printMedia?.removeEventListener("change", invalidate);
        observer?.disconnect();
      };
    },
    [],
  );

  useLayoutEffect(
    /** Restores the shell-owned selection after canonical paragraph projection. @returns Nothing. */
    function restoreCanonicalSelection(): void {
      /* c8 ignore next -- Chromium table editing verifies native focus retention. */
      if (rootElement.current?.querySelector("[data-writer-table-cell]:focus") !== null) return;
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
      <style media="print">
        {pages
          .map(
            /** map handles this value. @param page - Input 1. @param index - Input 2. @returns The result. */ (
              page,
              index,
            ) =>
              `@page writer-page-${index + 1} { size: ${page.descriptor.width / 20}pt ${page.descriptor.height / 20}pt; margin: 0; } [data-writer-page="${index + 1}"] { page: writer-page-${index + 1}; }`,
          )
          .join("\n")}
      </style>
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
                      topSpacingPt={0}
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
                {tables.map(
                  /** map handles this value. @param table - Input 1. @returns The result. */ (
                    table,
                  ) => (
                    <WriterEditableTable
                      key={`measure-${table.GetName()}`}
                      table={table}
                      /* v8 ignore next -- Hidden measurement tables are never interactive. */
                      onSelectRow={
                        /** callback handles this value. @returns The result. */ () => undefined
                      }
                      retainElement={
                        /** callback handles this value. @param element - Input 1. @returns The result. */ (
                          element,
                        ) => {
                          if (element === null) tableMeasurementElements.delete(table.GetName());
                          else tableMeasurementElements.set(table.GetName(), element);
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
                {page.tableFrames
                  .filter(
                    /** filter handles this value. @param frame - Input 1. @returns The result. */ (
                      frame,
                    ) =>
                      frame.afterParagraphIndex < 0 ||
                      !page.textFrames.some(
                        /** some handles this value. @param textFrame - Input 1. @returns The result. */ (
                          textFrame,
                        ) => props.paragraphs[frame.afterParagraphIndex]?.id === textFrame.nodeId,
                      ),
                  )
                  .map(renderTable)}
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
                      <Fragment key={`${paragraph.id}:${frame.start}`}>
                        <WriterEditableParagraph
                          index={index}
                          isActive={paragraph.id === props.activeParagraphId}
                          listMarker={paragraph.listMarker}
                          paragraph={paragraph}
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
                        {lastFrame.get(frame.nodeId) === `${pageIndex}:${frame.start}`
                          ? page.tableFrames
                              .filter(
                                /** filter handles this value. @param tableFrame - Input 1. @returns The result. */ (
                                  tableFrame,
                                ) => tableFrame.afterParagraphIndex === index,
                              )
                              .map(renderTable)
                          : null}
                      </Fragment>
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
