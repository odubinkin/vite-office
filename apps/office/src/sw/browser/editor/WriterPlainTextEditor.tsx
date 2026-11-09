/** @fileoverview Projects Writer paragraphs through one browser implementation of SwEditWin. */

import { Fragment, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { createPortal } from "react-dom";
import { WriterRulerLaneContext } from "../presentation/writer-ruler-lane-context";

import type { SwEditWin } from "../../source/uibase/docvw/edtwin";
import type { WriterParagraphProjection as WriterParagraph } from "../presentation/writer-view-projection";
import { BrowserWriterEditWindow } from "./browser-writer-edit-window";
import { WriterEditableParagraph } from "./WriterEditableParagraph";
import { WriterEditableFlyFrame } from "./WriterEditableFlyFrame";
import { WriterEditableTable } from "./WriterEditableTable";
import type { WriterCursorSelection } from "./writer-selection-types";
import type { WriterPageDescriptorValue } from "../../source/core/layout/pagedesc";
import {
  type SwPageDescriptorLayout,
  type SwPageFrame,
  type SwTableFrame,
} from "../../source/core/layout/newfrm";
import { SwLineNumberInfo, type SwLineNumberInfoValue } from "../../inc/lineinfo";
import { CollectTextFlyFrames, IsTextFlyAnchorFrame } from "../../source/core/layout/flycnt";
import { SvxFrameDirection } from "../../../editeng/inc/frmdir";
import type { SwTextFrame, SwTextFrameSettings, SwTextLine } from "../../source/core/text/txtfrm";
import { createWriterLineMeasurements, measureWriterTextLines } from "./writer-line-measurement";

/** Defines immutable render values plus the persistent Writer edit-window owner. */
export interface WriterPlainTextEditorProps {
  readonly onContextPopup?: (
    resourceName: string,
    position: Readonly<{ x: number; y: number }>,
  ) => void;
  readonly onNumLabelMouseDown?: (event: React.MouseEvent<HTMLElement>) => boolean;
  readonly activeParagraphId: string;
  readonly cursorSelection: WriterCursorSelection;
  readonly editWindow: SwEditWin;
  readonly editingHostRef?: RefObject<HTMLElement | null>;
  readonly paragraphs: readonly WriterParagraph[];
  readonly textNodes?: readonly WriterParagraph[];
  readonly pageDescriptor: WriterPageDescriptorValue;
  readonly pageDescriptors?: SwPageDescriptorLayout["descriptors"];
  readonly paragraphSpacingSettings?: SwTextFrameSettings;
  readonly verticalRuler?: ReactNode;
  readonly showLineNumbers?: boolean;
  readonly lineNumberInfo?: SwLineNumberInfoValue;
  readonly selectedTableBoxes?: readonly number[];
}

/** Renders one root `contenteditable` and forwards browser events to one stable controller. @param props - Immutable projection and edit-window owner. @returns Logical Writer document editing host. */
export function WriterPlainTextEditor(props: WriterPlainTextEditorProps): React.JSX.Element {
  const rulerLane = useContext(WriterRulerLaneContext);
  const localRootElement = useRef<HTMLElement | null>(null);
  const rootElement = props.editingHostRef ?? localRootElement;
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
          offset,
        ) => {
          const fragments = [...paragraphElements.values()].filter(
            /** Matches the source-node identity. @param element - Mounted fragment. @returns Whether the identity matches. */ (
              element,
            ) => element.dataset.writerParagraphId === paragraphId,
          );
          const focusNode = globalThis.getSelection()?.focusNode;
          return (
            fragments.find(
              /** Retains the actual header occurrence currently carrying the caret. @param element - Mounted occurrence. @returns Whether the caret belongs here. */
              (element) =>
                element.contains(focusNode ?? null) &&
                Number(element.dataset.writerFragmentStart) <= offset &&
                offset <= Number(element.dataset.writerFragmentEnd),
            ) ??
            fragments.find(
              /** Finds the fragment containing the source offset. @param element - Mounted fragment. @returns Whether the offset belongs. */ (
                element,
              ) =>
                Number(element.dataset.writerFragmentStart) <= offset &&
                offset <= Number(element.dataset.writerFragmentEnd),
            ) ??
            fragments[fragments.length - 1]
          );
        },
      ),
    [paragraphElements, props.editWindow],
  );
  const [measuredLines, setMeasuredLines] = useState<ReadonlyMap<string, readonly SwTextLine[]>>(
    /** Starts without browser line measurements. @returns Empty line map. */ () => new Map(),
  );
  const measurements = createWriterLineMeasurements(props.paragraphs, measuredLines);
  const document = props.editWindow.GetDoc();
  const anchored = CollectTextFlyFrames(document);
  const tables = document.GetTables();
  const tableMeasurements = tables.map(
    /** map handles this value. @param table - Input 1. @returns The result. */ (table) => ({
      tableName: table.GetName(),
      rowHeights: measuredTableRows.get(table.GetName()) ?? [],
    }),
  );
  const lineInfo = props.lineNumberInfo ?? new SwLineNumberInfo().QueryValue();
  const layout = props.editWindow
    .GetView()
    .GetWrtShell()
    .GetLayout()
    .Format(
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
  const paragraphByNodeIndex = new Map(
    (props.textNodes ?? props.paragraphs).map(
      /** Indexes the common immutable native-node paragraph display. @param paragraph - Current text projection. @returns Actual node coordinate and projection. */
      (paragraph) => [paragraph.nodeIndex, paragraph],
    ),
  );
  const numberedFrames = layout.lineNumbers;
  const lastFrame = new Map<string, string>();
  for (const [pageIndex, page] of pages.entries())
    for (const frame of page.textFrames) lastFrame.set(frame.nodeId, `${pageIndex}:${frame.start}`);
  /** Paints the actual native fly anchors in a mounted body, cell or text-box fragment. @param page - Current physical page. @param nodeIndex - Actual anchor paragraph. @param width - Current native print width. @param fragment - Native body master or follow, if one exists. @returns Connected fly elements. */
  function renderAnchoredFrames(
    page: SwPageFrame,
    nodeIndex: number,
    width: number,
    fragment?: SwTextFrame,
  ): ReactNode {
    const node = document.nodes.entries()[nodeIndex]?.GetTextNode();
    if (!node) return null;
    const flies = anchored.get(node);
    if (!flies?.length) return null;
    return flies.map(
      /** Resolves the actual anchor owner in this fragment. @param fly - Original native format and section. @returns Browser frame or absent. */
      (fly) => {
        if (fragment && !IsTextFlyAnchorFrame(fly.format, fragment)) return null;
        return (
          <WriterEditableFlyFrame
            key={fly.format.GetName()}
            fly={fly}
            page={page.descriptor}
            pageNumber={page.number}
            availableWidth={width}
            paragraphLeft={node.GetParagraphTextLeftMargin()}
            paragraphRight={node.GetParagraphRightMargin()}
            rightToLeft={
              fragment?.IsRightToLeft() ??
              node.GetSwAttrSet().GetFrameDir().GetValue() === SvxFrameDirection.Horizontal_RL_TB
            }
            paragraphs={paragraphByNodeIndex}
            activeParagraphId={props.activeParagraphId}
            selectedBoxes={props.selectedTableBoxes}
            retainParagraphElement={
              /** Registers fly text and cells in the common native cursor surface. @param id - Display paragraph identity. @param element - Mounted element or cleanup. @returns Nothing. */
              (id, element) => {
                const key = `fly:${page.number}:${fly.format.GetName()}:${id}`;
                if (element === null) paragraphElements.delete(key);
                else paragraphElements.set(key, element);
              }
            }
            renderAnchoredFrames={
              /** Paints child text-frame anchors on the same physical page. @param index - Actual text anchor. @param availableWidth - Enclosing native width. @returns Editable child frames. */
              (index, availableWidth) => renderAnchoredFrames(page, index, availableWidth)
            }
          />
        );
      },
    );
  }

  const renderTable =
    /** Renders the original table and its cell-owned fly frames. @param frame - Native table fragment. @param page - Owning page. @returns Browser table. */ (
      frame: SwTableFrame,
      page: SwPageFrame,
    ): React.JSX.Element => {
      const tableName = frame.table.GetName();
      return (
        <WriterEditableTable
          key={`${tableName}:${frame.firstRow}`}
          table={frame.table}
          nativeFrame={frame.nativeFrame}
          printArea={frame.printArea}
          paragraphs={paragraphByNodeIndex}
          activeParagraphId={props.activeParagraphId}
          retainParagraphElement={
            /** Registers cell paragraphs in the same selection surface as body text. @param id - Shared display identity. @param element - Mounted paragraph. @returns Nothing. */
            (id, element) => {
              const frameKey = `${tableName}:${frame.firstRow}:${id}`;
              if (element === null) paragraphElements.delete(frameKey);
              else paragraphElements.set(frameKey, element);
            }
          }
          firstRow={frame.firstRow}
          lastRow={frame.lastRow}
          repeatedHeaderRows={frame.repeatedHeaderRows ?? 0}
          selectedBoxes={props.selectedTableBoxes}
          renderAnchoredFrames={
            anchored.size === 0
              ? undefined
              : /** Paints cell-owned frames within their actual print extent. @param index - Native anchor node. @param width - Actual cell print width. @returns Editable frames. */
                (index, width) => renderAnchoredFrames(page, index, width)
          }
        />
      );
    };

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
                Math.round(row.getBoundingClientRect().height * 15),
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
      const root = rootElement.current as HTMLElement;
      const focused = root.ownerDocument.activeElement;
      const outside =
        focused instanceof HTMLElement &&
        focused !== root.ownerDocument.body &&
        !root.contains(focused);
      if (outside && focused.closest("[data-writer-editing-host]") !== null) {
        return;
      }
      controller.RestoreSelection(props.cursorSelection);
      // Selection APIs may focus the contenteditable host. Keep toolbar navigation
      // intact while still projecting commands such as Select All into the DOM.
      if (outside) focused.focus();
    },
    [controller, measuredLines, props.cursorSelection, props.paragraphs, rootElement],
  );

  useEffect(
    /** Installs the edit-window native event boundary. @returns Listener cleanup. */
    function subscribeEditWindow(): () => void {
      return controller.Subscribe(rootElement.current as HTMLElement);
    },
    [controller, rootElement],
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
                  ) => {
                    const tableName = table.GetName();
                    return (
                      <WriterEditableTable
                        key={`measure-${tableName}`}
                        measureNaturalRows
                        table={table}
                        nativeFrame={layout.tableFrames.find(
                          /** Borrows the same original root-owned master for device measurement. @param frame - Original layout object. @returns Whether it owns this table. */
                          (frame) => frame.GetTable() === table,
                        )}
                        availableWidth={
                          props.pageDescriptor.width -
                          props.pageDescriptor.leftMargin -
                          props.pageDescriptor.rightMargin
                        }
                        paragraphs={paragraphByNodeIndex}
                        retainElement={
                          /** callback handles this value. @param element - Input 1. @returns The result. */ (
                            element,
                          ) => {
                            if (element === null) tableMeasurementElements.delete(tableName);
                            else tableMeasurementElements.set(tableName, element);
                          }
                        }
                      />
                    );
                  },
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
        onClick={
          /** Keeps the clicked cell's focus when its native cursor position was already current. @param event - Browser click. @returns Nothing. */ (
            event,
          ) => {
            controller.HandleClick(event);
            (event.target as HTMLElement).closest<HTMLElement>("[data-writer-table-cell]")?.focus();
          }
        }
        onCompositionEnd={controller.HandleCompositionEnd}
        onCompositionStart={controller.HandleCompositionStart}
        onCompositionUpdate={controller.HandleCompositionUpdate}
        onCopy={controller.HandleCopy}
        onCut={controller.HandleCut}
        onDragOver={controller.HandleDragOver}
        onDragStart={controller.HandleDragStart}
        onDrop={controller.HandleDrop}
        onFocus={
          /** Restores the retained shell cursor when the owning client explicitly regains focus. @param event - Host or paragraph focus. @returns Nothing. */ (
            event,
          ) => {
            controller.HandleFocus(event, props.cursorSelection);
          }
        }
        onContextMenu={
          /** Keeps context selection in the persistent original edit-window owner. @param event - Actual context input. @returns Nothing. */
          (event) => {
            if (props.onContextPopup !== undefined)
              controller.HandleContextMenu(event, props.onContextPopup);
          }
        }
        onKeyDown={
          /** Offers keyboard popup input before ordinary native editing keys. @param event - Actual keyboard input. @returns Nothing. */
          (event) => {
            if (
              props.onContextPopup !== undefined &&
              controller.HandleContextMenuKey(event, props.onContextPopup)
            )
              return;
            controller.HandleKeyDown(event);
          }
        }
        onMouseDown={
          /** Routes admitted native label gestures before pointer text selection. @param event - Actual document mouse input. @returns Nothing. */ (
            event,
          ) => {
            if (props.onNumLabelMouseDown?.(event)) return;
            controller.HandlePointerDown(event);
          }
        }
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
                  display: page.textFrames.some(
                    /** Chooses native-flow paint when the page contains a text anchor. @param frame - Actual page text frame. @returns Whether native float paint applies. */
                    (frame) => anchored.has(frame.GetTextNodeFirst()),
                  )
                    ? "flow-root"
                    : undefined,
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
                  .map(
                    /** Paints one leading native table on this page. @param table - Actual table fragment. @returns Browser table. */
                    (table) => renderTable(table, page),
                  )}
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
                        {renderAnchoredFrames(
                          page,
                          paragraph.nodeIndex,
                          page.descriptor.width -
                            page.descriptor.leftMargin -
                            page.descriptor.rightMargin,
                          frame,
                        )}
                        <WriterEditableParagraph
                          index={index}
                          isActive={paragraph.id === props.activeParagraphId}
                          listMarker={paragraph.listMarker}
                          paragraph={paragraph}
                          fragmentStart={frame.start}
                          fragmentEnd={frame.end}
                          topSpacingPt={frame.topSpacing / 20}
                          isFollow={frame.IsFollow()}
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
                              .map(
                                /** Paints each table on its native page. @param table - Actual table fragment. @returns Browser table. */
                                (table) => renderTable(table, page),
                              )
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
