/** @fileoverview Creates Writer page frames from measured text-frame lines. */

import type { WriterPageDescriptorValue } from "./pagedesc";
import { WRITER_PAPER_SIZES } from "./pagedesc";
import type { SwTextNode } from "../txtnode/ndtxt";
import type { SwDoc } from "../doc/doc";
import { SwTableNode } from "../docnode/node";
import type { SwTable } from "../table/swtable";
import {
  createSwTextFrameInputs,
  getSwTextFrameGap,
  makeSwTextFrame,
  projectSwLineNumbers,
  type SwLineNumberMark,
  type SwTextFrame,
  type SwTextFrameInput,
  type SwTextFrameMeasurement,
  type SwTextFrameSettings,
  type SwTextLine,
} from "../text/txtfrm";
import type { SwLineNumberInfoValue } from "../../../inc/lineinfo";

/** One physical page and its ordered text-frame fragments. */
export interface SwPageFrame {
  readonly descriptor: WriterPageDescriptorValue;
  readonly number: number;
  readonly textFrames: readonly SwTextFrame[];
  readonly tableFrames: readonly SwTableFrame[];
}

/** One table fragment placed in document flow on a physical page. */
export interface SwTableFrame {
  readonly table: SwTable;
  readonly firstRow: number;
  readonly lastRow: number;
  readonly afterParagraphIndex: number;
}

/** Device measured table rows; the core owns their placement. */
export interface SwTableFrameMeasurement {
  readonly tableName: string;
  readonly rowHeights: readonly number[];
}

/** Canonical table and its position relative to body text nodes. */
interface SwTableFrameInput extends SwTableFrameMeasurement {
  readonly table: SwTable;
  readonly afterParagraphIndex: number;
}

/** Writer text-frame print bounds relative to the page body's left edge, in twips. */
export interface SwTextPrintBounds {
  readonly left: number;
  readonly right: number;
}

/** Resolves first-line print bounds after paragraph/list indentation precedence. @param paragraph - Canonical text node. @param page - Physical page descriptor. @returns Writer-relative bounds. */
export function projectSwTextPrintBounds(
  paragraph: SwTextNode,
  page: WriterPageDescriptorValue,
): SwTextPrintBounds {
  const format = paragraph.GetNumRule()?.GetNumFormat(paragraph.GetAttrListLevel());
  const left =
    format !== undefined &&
    (paragraph.DoesListGeometryWin() || paragraph.GetParagraphTextLeftMargin() === 0)
      ? format.GetIndentAt() + format.GetFirstLineIndent()
      : paragraph.GetParagraphTextLeftMargin() + paragraph.GetParagraphFirstLineIndent();
  const physicalWidth =
    page.paperFormat === "A4" &&
    page.width === (page.landscape ? WRITER_PAPER_SIZES.A4.height : WRITER_PAPER_SIZES.A4.width)
      ? Math.floor(((page.landscape ? 297 : 210) * 1440) / 25.4)
      : page.width;
  return {
    left,
    right: physicalWidth - page.leftMargin - page.rightMargin - paragraph.GetParagraphRightMargin(),
  };
}

/** Immutable descriptor graph supplied to DOM-neutral page-frame creation. */
export interface SwPageDescriptorLayout {
  readonly descriptors: readonly Readonly<{
    followName: string;
    value: WriterPageDescriptorValue;
  }>[];
  readonly initialName: string;
}

/** Immutable result of one core formatting pass. */
export interface SwRootFrameSnapshot {
  readonly revision: number;
  readonly pages: readonly SwPageFrame[];
  readonly lineNumbers: readonly (readonly (readonly SwLineNumberMark[])[])[];
}

/** Persistent Writer layout root owning page and text-frame identity over device measurements. */
export class SwRootFrame {
  private dirty = true;
  private dirtyFrom = 0;
  private lastDocument: SwDoc | undefined;
  private lastModelRevision = -1;
  private lastMeasurementRevision = -1;
  private lastDescriptor: WriterPageDescriptorValue | SwPageDescriptorLayout | undefined;
  private lastSettings: SwTextFrameSettings | undefined;
  private lastLineInfo: SwLineNumberInfoValue | undefined;
  private lastInputs: readonly SwTextFrameInput[] = [];
  private lastTableMeasurements: readonly SwTableFrameMeasurement[] = [];
  private snapshot: SwRootFrameSnapshot | undefined;
  private revision = 0;

  /** Binds the root to its current Writer document while allowing document-shell replacement. @param getDocument - Active canonical document. @returns Nothing. */
  public constructor(private readonly getDocument: () => SwDoc) {}

  /** Invalidates the formatted graph from a changed Writer node onward. @param nodeIndex - Optional SwNodes index; absent means all frames. @returns Nothing. */
  public Invalidate(nodeIndex?: number): void {
    this.dirty = true;
    const paragraphs = this.getDocument().paragraphs;
    const affected =
      nodeIndex === undefined
        ? 0
        : paragraphs.findIndex(
            /** Finds the first node at or after the model hint. @param node - Current node. @returns Whether affected. */ (
              node,
            ) => node.GetIndex() >= nodeIndex,
          );
    this.dirtyFrom = Math.min(this.dirtyFrom, affected < 0 ? paragraphs.length : affected);
  }

  /** Formats measured text into stable page frames and line-number marks. @param measurements - Browser device line geometry only. @param descriptor - Page descriptor graph. @param settings - Writer spacing settings. @param lineInfo - Document line-number settings. @param measurementRevision - Browser device revision. @param tableMeasurements - Browser table-row geometry. @returns Immutable current layout. */
  public Format(
    measurements: readonly SwTextFrameMeasurement[],
    descriptor: WriterPageDescriptorValue | SwPageDescriptorLayout,
    settings: SwTextFrameSettings | undefined,
    lineInfo: SwLineNumberInfoValue,
    measurementRevision = 0,
    tableMeasurements: readonly SwTableFrameMeasurement[] = [],
  ): SwRootFrameSnapshot {
    const document = this.getDocument();
    const modelRevision = document.GetDocumentStateManager().GetModelRevision();
    const sameDescriptor = layoutDescriptorEqual(this.lastDescriptor, descriptor);
    const sameSettings = textFrameSettingsEqual(this.lastSettings, settings);
    const sameLineInfo = lineNumberInfoEqual(this.lastLineInfo, lineInfo);
    if (
      !this.dirty &&
      this.lastDocument === document &&
      this.lastModelRevision === modelRevision &&
      this.lastMeasurementRevision === measurementRevision &&
      sameDescriptor &&
      sameSettings &&
      sameLineInfo &&
      measurementsMatchInputs(measurements, this.lastInputs) &&
      tableMeasurementsEqual(tableMeasurements, this.lastTableMeasurements) &&
      this.snapshot !== undefined
    )
      return this.snapshot;
    const paragraphs = createSwTextFrameInputs(document, measurements);
    const tableInputs = createSwTableFrameInputs(document, tableMeasurements);
    const previous = this.snapshot?.pages ?? [];
    const previousInputs = this.lastInputs;
    const firstInputChange = paragraphs.findIndex(
      /** Locates the first changed model or device input. @param paragraph - Current input. @param index - Document order. @returns Whether changed. */ (
        paragraph,
        index,
      ) => !textFrameInputEqual(paragraph, previousInputs[index]),
    );
    const affectedFrom = Math.min(
      this.dirtyFrom,
      firstInputChange < 0 ? paragraphs.length : firstInputChange,
    );
    const unchanged = new Set(
      paragraphs
        .filter(
          /** Keeps nodes whose measured and model layout values match. @param paragraph - Current input. @param index - Document order. @returns Whether unchanged. */ (
            paragraph,
            index,
          ) => index < affectedFrom || textFrameInputEqual(paragraph, previousInputs[index]),
        )
        .map(
          /** Returns stable node identity. @param paragraph - Current input. @returns Device key. */ (
            paragraph,
          ) => paragraph.id,
        ),
    );
    const layoutGeometryUnchanged = sameDescriptor && sameSettings;
    const pages = Object.freeze(
      createSwPageFrames(paragraphs, descriptor, settings, tableInputs).map(
        /** Retains unchanged frame identities after formatting. @param page - New page. @param index - Page position. @returns Reconciled page. */
        (page, index) => {
          const oldPage = previous[index];
          const textFrames = Object.freeze(
            page.textFrames.map(
              /** Reuses a matching source fragment at the same page position. @param frame - New fragment. @param frameIndex - Position in page. @returns Persistent fragment. */ (
                frame,
                frameIndex,
              ) => {
                const oldFrame = oldPage?.textFrames[frameIndex];
                return layoutGeometryUnchanged &&
                  unchanged.has(frame.nodeId) &&
                  textFrameEqual(frame, oldFrame) &&
                  oldPage !== undefined &&
                  pageDescriptorEqual(page.descriptor, oldPage.descriptor)
                  ? (oldFrame as SwTextFrame)
                  : frame;
              },
            ),
          );
          if (
            oldPage !== undefined &&
            pageDescriptorEqual(oldPage.descriptor, page.descriptor) &&
            tableFramesEqual(oldPage.tableFrames, page.tableFrames) &&
            oldPage.textFrames.length === textFrames.length &&
            textFrames.every(
              /** Tests unchanged frame identity. @param frame - Current frame. @param frameIndex - Position. @returns Whether stable. */
              (frame, frameIndex) => frame === oldPage.textFrames[frameIndex],
            )
          )
            return oldPage;
          return Object.freeze({ ...page, textFrames });
        },
      ),
    );
    const lineNumbers = Object.freeze(
      projectSwLineNumbers(pages, paragraphs, lineInfo).map(
        /** Freezes marks on one page. @param page - Page marks. @returns Immutable marks. */
        (page) =>
          Object.freeze(
            page.map(
              /** Freezes marks on one text fragment. @param frame - Fragment marks. @returns Immutable marks. */
              (frame) =>
                Object.freeze(
                  frame.map(
                    /** Freezes one mark. @param mark - Line-number mark. @returns Immutable mark. */
                    (mark) => Object.freeze(mark),
                  ),
                ),
            ),
          ),
      ),
    );
    this.revision += 1;
    this.lastDocument = document;
    this.lastModelRevision = modelRevision;
    this.lastMeasurementRevision = measurementRevision;
    this.lastDescriptor = descriptor;
    this.lastSettings = settings;
    this.lastLineInfo = lineInfo;
    this.lastInputs = paragraphs;
    this.lastTableMeasurements = tableMeasurements;
    this.dirty = false;
    this.dirtyFrom = Number.POSITIVE_INFINITY;
    this.snapshot = Object.freeze({ revision: this.revision, pages, lineNumbers });
    return this.snapshot;
  }
}

/** Compares physical page geometry without serializing layout state. @param left - Previous page. @param right - Current page. @returns Whether equal. */
function pageDescriptorEqual(
  left: WriterPageDescriptorValue,
  right: WriterPageDescriptorValue,
): boolean {
  if (left === right) return true;
  return (
    left.name === right.name &&
    left.paperFormat === right.paperFormat &&
    left.width === right.width &&
    left.height === right.height &&
    left.landscape === right.landscape &&
    left.leftMargin === right.leftMargin &&
    left.rightMargin === right.rightMargin &&
    left.topMargin === right.topMargin &&
    left.bottomMargin === right.bottomMargin
  );
}

/** Compares a page descriptor and its follow graph. @param left - Previous descriptor. @param right - Current descriptor. @returns Whether equal. */
function layoutDescriptorEqual(
  left: WriterPageDescriptorValue | SwPageDescriptorLayout | undefined,
  right: WriterPageDescriptorValue | SwPageDescriptorLayout,
): boolean {
  if (left === right) return true;
  if (left === undefined) return false;
  if ("descriptors" in left && "descriptors" in right)
    return (
      left.initialName === right.initialName &&
      left.descriptors.length === right.descriptors.length &&
      left.descriptors.every(
        /** Compares one page style and follow relationship. @param record - Previous record. @param index - Descriptor order. @returns Whether equal. */ (
          record,
          index,
        ) =>
          record.followName === right.descriptors[index]?.followName &&
          pageDescriptorEqual(
            record.value,
            (right.descriptors[index] as (typeof right.descriptors)[number]).value,
          ),
      )
    );
  if ("descriptors" in left || "descriptors" in right) return false;
  return pageDescriptorEqual(left, right);
}

/** Compares document paragraph-spacing switches. @param left - Previous settings. @param right - Current settings. @returns Whether equal. */
function textFrameSettingsEqual(
  left: SwTextFrameSettings | undefined,
  right: SwTextFrameSettings | undefined,
): boolean {
  return (
    left === right ||
    (left !== undefined &&
      right !== undefined &&
      left.paraSpaceMax === right.paraSpaceMax &&
      left.paraSpaceMaxAtPages === right.paraSpaceMaxAtPages)
  );
}

/** Compares document line-number options. @param left - Previous options. @param right - Current options. @returns Whether equal. */
function lineNumberInfoEqual(
  left: SwLineNumberInfoValue | undefined,
  right: SwLineNumberInfoValue,
): boolean {
  return (
    left === right ||
    (left !== undefined &&
      left.divider === right.divider &&
      left.dividerCountBy === right.dividerCountBy &&
      left.posFromLeft === right.posFromLeft &&
      left.countBy === right.countBy &&
      left.position === right.position &&
      left.paintLineNumbers === right.paintLineNumbers &&
      left.countBlankLines === right.countBlankLines &&
      left.countInFlys === right.countInFlys &&
      left.restartEachPage === right.restartEachPage)
  );
}

/** Compares shaped line geometry. @param left - Previous lines. @param right - Current lines. @returns Whether equal. */
function textLinesEqual(left: readonly SwTextLine[], right: readonly SwTextLine[]): boolean {
  return (
    left === right ||
    (left.length === right.length &&
      left.every(
        /** Compares one source range and height. @param line - Previous line. @param index - Line order. @returns Whether equal. */ (
          line,
          index,
        ) =>
          line.start === right[index]?.start &&
          line.end === right[index]?.end &&
          line.height === right[index]?.height,
      ))
  );
}

/** Checks current device measurements against the last formatted values. @param measurements - Current device lines. @param inputs - Previous core inputs. @returns Whether unchanged. */
function measurementsMatchInputs(
  measurements: readonly SwTextFrameMeasurement[],
  inputs: readonly SwTextFrameInput[],
): boolean {
  return (
    measurements.length === inputs.length &&
    measurements.every(
      /** Compares one device measurement. @param measurement - Current lines. @param index - Document order. @returns Whether equal. */ (
        measurement,
        index,
      ) =>
        measurement.id === inputs[index]?.id &&
        textLinesEqual(measurement.lines, (inputs[index] as SwTextFrameInput).lines),
    )
  );
}

/** Compares model values and measured lines for one text node. @param left - Current input. @param right - Previous input. @returns Whether equal. */
function textFrameInputEqual(left: SwTextFrameInput, right: SwTextFrameInput | undefined): boolean {
  return (
    right !== undefined &&
    left.id === right.id &&
    left.style === right.style &&
    left.upperSpacing === right.upperSpacing &&
    left.lowerSpacing === right.lowerSpacing &&
    left.contextualSpacing === right.contextualSpacing &&
    left.keepWithNext === right.keepWithNext &&
    left.keepTogether === right.keepTogether &&
    left.orphans === right.orphans &&
    left.widows === right.widows &&
    left.breakBefore === right.breakBefore &&
    left.breakAfter === right.breakAfter &&
    left.pageStyleName === right.pageStyleName &&
    left.pageNumber === right.pageNumber &&
    left.countLineNumbers === right.countLineNumbers &&
    textLinesEqual(left.lines, right.lines)
  );
}

/** Compares one frame's source range and placement. @param left - Current frame. @param right - Previous frame. @returns Whether equal. */
function textFrameEqual(left: SwTextFrame, right: SwTextFrame | undefined): boolean {
  return (
    right !== undefined &&
    left.nodeId === right.nodeId &&
    left.start === right.start &&
    left.end === right.end &&
    left.follow === right.follow &&
    left.topSpacing === right.topSpacing
  );
}

/** Pairs measured rows with tables in the canonical body order. @param document - Writer document. @param measurements - Browser table-row measurements. @returns Ordered table inputs. */
function createSwTableFrameInputs(
  document: SwDoc,
  measurements: readonly SwTableFrameMeasurement[],
): readonly SwTableFrameInput[] {
  const byName = new Map(
    measurements.map(
      /** map handles this value. @param entry - Input 1. @returns The result. */ (entry) =>
        [entry.tableName, entry] as const,
    ),
  );
  const tables: SwTableFrameInput[] = [];
  let paragraphIndex = -1;
  for (const node of document.nodes.getBodyContent()) {
    if (node instanceof SwTableNode) {
      const table = node.GetTable();
      const measured = byName.get(table.GetName());
      tables.push({
        table,
        tableName: table.GetName(),
        afterParagraphIndex: paragraphIndex,
        rowHeights: table
          .GetTabLines()
          .map(
            /** map handles this value. @param row - Input 1. @param index - Input 2. @returns The result. */ (
              row,
              index,
            ) => Math.max(row.GetFormat().minHeight ?? 0, measured?.rowHeights[index] ?? 240),
          ),
      });
    } else paragraphIndex += 1;
  }
  return tables;
}

/** Compares device row measurements across formatting passes. @param left - Previous measurements. @param right - Current measurements. @returns Whether the measurements match. */
function tableMeasurementsEqual(
  left: readonly SwTableFrameMeasurement[],
  right: readonly SwTableFrameMeasurement[],
): boolean {
  return (
    left.length === right.length &&
    left.every(
      /** every handles this value. @param entry - Input 1. @param index - Input 2. @returns The result. */ (
        entry,
        index,
      ) =>
        entry.tableName === right[index]?.tableName &&
        entry.rowHeights.length === right[index]?.rowHeights.length &&
        entry.rowHeights.every(
          /** every handles this value. @param height - Input 1. @param row - Input 2. @returns The result. */ (
            height,
            row,
          ) => height === right[index]?.rowHeights[row],
        ),
    )
  );
}

/** Compares table fragments for persistent page-frame identity. @param left - Previous frames. @param right - Current frames. @returns Whether the frames match. */
function tableFramesEqual(left: readonly SwTableFrame[], right: readonly SwTableFrame[]): boolean {
  return (
    left.length === right.length &&
    left.every(
      /** every handles this value. @param frame - Input 1. @param index - Input 2. @returns The result. */ (
        frame,
        index,
      ) =>
        frame.table === right[index]?.table &&
        frame.firstRow === right[index]?.firstRow &&
        frame.lastRow === right[index]?.lastRow &&
        frame.afterParagraphIndex === right[index]?.afterParagraphIndex,
    )
  );
}

/** Creates at least the initial page; splits a text node only at measured line boundaries. @param paragraphs - Ordered text node measurements. @param descriptor - Physical page geometry. @param settings - Paragraph spacing policy. @param tables - Ordered table frames. @returns Ordered page frames. */
export function createSwPageFrames(
  paragraphs: readonly SwTextFrameInput[],
  descriptor: WriterPageDescriptorValue | SwPageDescriptorLayout,
  settings?: SwTextFrameSettings,
  tables: readonly SwTableFrameInput[] = [],
): readonly SwPageFrame[] {
  const descriptorRecords =
    "descriptors" in descriptor
      ? descriptor.descriptors
      : [{ followName: descriptor.name, value: descriptor }];
  if (descriptorRecords.length === 0) throw new Error("Writer layout requires a page descriptor.");
  const descriptorByName = new Map(
    descriptorRecords.map(
      /** Indexes one immutable page descriptor. @param record - Descriptor record. @returns Name and record. */ (
        record,
      ) => [record.value.name, record] as const,
    ),
  );
  const initialDescriptor = descriptorByName.get(
    "initialName" in descriptor ? descriptor.initialName : descriptor.name,
  );
  if (initialDescriptor === undefined)
    throw new Error("Writer layout initial page descriptor is missing.");
  let activeDescriptor: (typeof descriptorRecords)[number] = initialDescriptor;
  const pages: SwTextFrame[][] = [[]];
  const pageTables: SwTableFrame[][] = [[]];
  const pageDescriptors: WriterPageDescriptorValue[] = [activeDescriptor.value];
  const pageNumberOverrides = new Map<number, number>();
  let used = 0;
  /** Advances to the current descriptor's follow page. @returns Nothing. */
  function startFollowPage(): void {
    const follow = descriptorByName.get(activeDescriptor.followName);
    if (follow === undefined) throw new Error("Writer layout follow page descriptor is missing.");
    pages.push([]);
    pageTables.push([]);
    activeDescriptor = follow;
    pageDescriptors.push(follow.value);
    used = 0;
  }
  /** Checks whether either kind of content already occupies the page. @returns Whether the current page has content. */
  function hasContent(): boolean {
    return (
      (pages[pages.length - 1] as SwTextFrame[]).length > 0 ||
      (pageTables[pageTables.length - 1] as SwTableFrame[]).length > 0
    );
  }
  /** Flows tables immediately after one body paragraph, splitting only between rows. @param afterParagraphIndex - Body paragraph position. @returns Nothing. */
  function placeTables(afterParagraphIndex: number): void {
    for (const input of tables) {
      if (input.afterParagraphIndex !== afterParagraphIndex) continue;
      const format = input.table.GetFormat();
      for (let row = 0; row < input.rowHeights.length; row += 1) {
        const height = input.rowHeights[row] as number;
        const descriptor = pageDescriptors[pageDescriptors.length - 1] as WriterPageDescriptorValue;
        const bodyHeight = descriptor.height - descriptor.topMargin - descriptor.bottomMargin;
        const spacing = row === 0 ? (format.marginTop ?? 0) : 0;
        if (hasContent() && used + spacing + height > bodyHeight) startFollowPage();
        const frames = pageTables[pageTables.length - 1] as SwTableFrame[];
        const previous = frames[frames.length - 1];
        if (previous?.table === input.table && previous.lastRow === row - 1)
          frames[frames.length - 1] = { ...previous, lastRow: row };
        else frames.push({ table: input.table, firstRow: row, lastRow: row, afterParagraphIndex });
        used += (row === 0 ? (format.marginTop ?? 0) : 0) + height;
      }
      used += format.marginBottom ?? 0;
    }
  }
  placeTables(-1);
  for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
    const gap = getSwTextFrameGap(paragraphs[paragraphIndex - 1], paragraph, settings);
    const nextParagraph = paragraphs[paragraphIndex + 1];
    const requestedStyle = paragraph.pageStyleName;
    if (
      (requestedStyle !== undefined &&
        requestedStyle !== "" &&
        requestedStyle !== activeDescriptor.value.name) ||
      paragraph.pageNumber !== undefined
    ) {
      const selected: (typeof descriptorRecords)[number] | undefined =
        requestedStyle === undefined || requestedStyle === ""
          ? activeDescriptor
          : descriptorByName.get(requestedStyle);
      if (selected === undefined)
        throw new Error(`Writer paragraph page style is missing: ${requestedStyle}`);
      if (hasContent()) {
        pages.push([]);
        pageTables.push([]);
        pageDescriptors.push(selected.value);
      } else pageDescriptors[pageDescriptors.length - 1] = selected.value;
      activeDescriptor = selected;
      used = 0;
      if (paragraph.pageNumber !== undefined)
        pageNumberOverrides.set(pages.length - 1, paragraph.pageNumber);
    }
    if (paragraph.breakBefore && hasContent()) {
      startFollowPage();
    }
    const currentDescriptor = pageDescriptors[pages.length - 1] as WriterPageDescriptorValue;
    const availableHeight =
      currentDescriptor.height - currentDescriptor.topMargin - currentDescriptor.bottomMargin;
    const wholeParagraphHeight = paragraph.lines.reduce(
      /** Handles Writer formatting state. @param sum - Input value. @param line - Input value. @returns Callback result. */ (
        sum,
        line,
      ) => sum + line.height,
      0,
    );
    const nextFirstLine = nextParagraph?.lines[0];
    let movedForKeepTogether = false;
    if (
      paragraph.keepTogether &&
      hasContent() &&
      wholeParagraphHeight <= availableHeight &&
      used + gap + wholeParagraphHeight > availableHeight
    ) {
      startFollowPage();
      movedForKeepTogether = true;
    }
    if (
      !movedForKeepTogether &&
      paragraph.keepWithNext &&
      nextParagraph !== undefined &&
      nextFirstLine !== undefined &&
      hasContent() &&
      wholeParagraphHeight + nextFirstLine.height <= availableHeight &&
      used +
        gap +
        wholeParagraphHeight +
        getSwTextFrameGap(paragraph, nextParagraph, settings) +
        nextFirstLine.height >
        availableHeight
    ) {
      startFollowPage();
    }
    let firstLine = 0;
    while (firstLine < paragraph.lines.length) {
      const page = pages[pages.length - 1] as SwTextFrame[];
      const pageDescriptor = pageDescriptors[pages.length - 1] as WriterPageDescriptorValue;
      const bodyHeight =
        pageDescriptor.height - pageDescriptor.topMargin - pageDescriptor.bottomMargin;
      const topSpacing = firstLine === 0 ? gap : 0;
      const line = paragraph.lines[firstLine] as (typeof paragraph.lines)[number];
      if (hasContent() && used + topSpacing + line.height > bodyHeight) {
        startFollowPage();
        continue;
      }
      let lastLine = firstLine;
      let height = topSpacing + line.height;
      while (
        lastLine + 1 < paragraph.lines.length &&
        used + height + (paragraph.lines[lastLine + 1] as SwTextLine).height <= bodyHeight
      ) {
        lastLine += 1;
        height += (paragraph.lines[lastLine] as SwTextLine).height;
      }
      const minimumBefore = paragraph.orphans ?? 2;
      const minimumAfter = paragraph.widows ?? 2;
      if (lastLine + 1 < paragraph.lines.length) {
        const latestValidLastLine = paragraph.lines.length - minimumAfter - 1;
        if (latestValidLastLine >= firstLine + minimumBefore - 1)
          while (lastLine > latestValidLastLine) {
            height -= (paragraph.lines[lastLine] as SwTextLine).height;
            lastLine -= 1;
          }
      }
      const linesOnPage = lastLine - firstLine + 1;
      const linesRemaining = paragraph.lines.length - lastLine - 1;
      if (
        linesRemaining > 0 &&
        hasContent() &&
        (linesOnPage < minimumBefore || linesRemaining < minimumAfter)
      ) {
        startFollowPage();
        continue;
      }
      page.push(makeSwTextFrame(paragraph, firstLine, lastLine, topSpacing));
      used += height;
      firstLine = lastLine + 1;
      if (firstLine < paragraph.lines.length) {
        startFollowPage();
      }
    }
    if (paragraph.breakAfter && nextParagraph !== undefined) {
      startFollowPage();
    }
    placeTables(paragraphIndex);
  }
  let numberedPage = 0;
  return Object.freeze(
    pages.map(
      /** Freezes one physical page. @param textFrames - Page content frames. @param index - Page index. @returns Immutable page frame. */ (
        textFrames,
        index,
      ) => {
        numberedPage = pageNumberOverrides.get(index) ?? numberedPage + 1;
        return Object.freeze({
          descriptor: pageDescriptors[index] as WriterPageDescriptorValue,
          number: numberedPage,
          textFrames: Object.freeze(textFrames),
          tableFrames: Object.freeze(pageTables[index] as SwTableFrame[]),
        });
      },
    ),
  );
}
