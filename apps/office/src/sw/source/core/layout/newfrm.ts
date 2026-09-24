/** @fileoverview Creates Writer page frames from measured text-frame lines. */

import type { WriterPageDescriptorValue } from "./pagedesc";
import { WRITER_PAPER_SIZES } from "./pagedesc";
import type { SwTextNode } from "../txtnode/ndtxt";
import {
  getSwTextFrameGap,
  makeSwTextFrame,
  projectSwLineNumbers,
  type SwLineNumberMark,
  type SwTextFrame,
  type SwTextFrameInput,
  type SwTextFrameSettings,
  type SwTextLine,
} from "../text/txtfrm";
import type { SwLineNumberInfoValue } from "../../../inc/lineinfo";

/** One physical page and its ordered text-frame fragments. */
export interface SwPageFrame {
  readonly descriptor: WriterPageDescriptorValue;
  readonly number: number;
  readonly textFrames: readonly SwTextFrame[];
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
  private signature: string | undefined;
  private dirty = true;
  private snapshot: SwRootFrameSnapshot | undefined;
  private inputSignatures = new Map<string, string>();
  private revision = 0;

  /** Invalidates the formatted graph after a document or style change. @returns Nothing. */
  public Invalidate(): void {
    this.dirty = true;
  }

  /** Formats measured text into stable page frames and line-number marks. @param paragraphs - Browser device measurements and Writer paragraph values. @param descriptor - Page descriptor graph. @param settings - Writer spacing settings. @param lineInfo - Document line-number settings. @returns Immutable current layout. */
  public Format(
    paragraphs: readonly SwTextFrameInput[],
    descriptor: WriterPageDescriptorValue | SwPageDescriptorLayout,
    settings: SwTextFrameSettings | undefined,
    lineInfo: SwLineNumberInfoValue,
  ): SwRootFrameSnapshot {
    const signature = JSON.stringify([paragraphs, descriptor, settings, lineInfo]);
    if (!this.dirty && this.signature === signature && this.snapshot !== undefined)
      return this.snapshot;
    const previous = this.snapshot?.pages ?? [];
    const nextInputSignatures = new Map(
      paragraphs.map(
        /** Captures one measured paragraph contract. @param paragraph - Device and model input. @returns Node identity and signature. */
        (paragraph) => [paragraph.id, JSON.stringify(paragraph)] as const,
      ),
    );
    const reusable = new Map<string, SwTextFrame[]>();
    for (const page of previous)
      for (const frame of page.textFrames) {
        const key = frameKey(frame, page.descriptor, this.inputSignatures);
        const existing = reusable.get(key) ?? [];
        existing.push(frame);
        reusable.set(key, existing);
      }
    const pages = Object.freeze(
      createSwPageFrames(paragraphs, descriptor, settings).map(
        /** Retains unchanged frame identities after formatting. @param page - New page. @param index - Page position. @returns Reconciled page. */
        (page, index) => {
          const textFrames = Object.freeze(
            page.textFrames.map(
              /** Reuses a matching source fragment. @param frame - New fragment. @returns Persistent fragment. */
              (frame) =>
                reusable.get(frameKey(frame, page.descriptor, nextInputSignatures))?.shift() ??
                frame,
            ),
          );
          const oldPage = previous[index];
          if (
            oldPage !== undefined &&
            JSON.stringify(oldPage.descriptor) === JSON.stringify(page.descriptor) &&
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
    this.signature = signature;
    this.inputSignatures = nextInputSignatures;
    this.dirty = false;
    this.snapshot = Object.freeze({ revision: this.revision, pages, lineNumbers });
    return this.snapshot;
  }
}

/** Keys an unchanged source fragment independently of its current page position. @param frame - Fragment. @param descriptor - Page geometry. @param signatures - Measured paragraph inputs. @returns Stable fragment key. */
function frameKey(
  frame: SwTextFrame,
  descriptor: WriterPageDescriptorValue,
  signatures: ReadonlyMap<string, string>,
): string {
  return JSON.stringify([
    frame.nodeId,
    frame.start,
    frame.end,
    frame.follow,
    frame.topSpacing,
    descriptor,
    signatures.get(frame.nodeId),
  ]);
}

/** Creates at least the initial page; splits a text node only at measured line boundaries. @param paragraphs - Ordered text node measurements. @param descriptor - Physical page geometry. @param settings - Paragraph spacing policy. @returns Ordered page frames. */
export function createSwPageFrames(
  paragraphs: readonly SwTextFrameInput[],
  descriptor: WriterPageDescriptorValue | SwPageDescriptorLayout,
  settings?: SwTextFrameSettings,
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
  let activeDescriptor = descriptorByName.get(
    "initialName" in descriptor ? descriptor.initialName : descriptor.name,
  );
  if (activeDescriptor === undefined)
    throw new Error("Writer layout initial page descriptor is missing.");
  const pages: SwTextFrame[][] = [[]];
  const pageDescriptors: WriterPageDescriptorValue[] = [activeDescriptor.value];
  let used = 0;
  for (const [paragraphIndex, paragraph] of paragraphs.entries()) {
    const gap = getSwTextFrameGap(paragraphs[paragraphIndex - 1], paragraph, settings);
    const nextParagraph = paragraphs[paragraphIndex + 1];
    const currentPage = pages[pages.length - 1] as SwTextFrame[];
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
    if (
      paragraph.keepWithNext &&
      nextParagraph !== undefined &&
      nextFirstLine !== undefined &&
      currentPage.length > 0 &&
      wholeParagraphHeight + nextFirstLine.height <= availableHeight &&
      used +
        gap +
        wholeParagraphHeight +
        getSwTextFrameGap(paragraph, nextParagraph, settings) +
        nextFirstLine.height >
        availableHeight
    ) {
      pages.push([]);
      activeDescriptor = descriptorByName.get(activeDescriptor.followName);
      if (activeDescriptor === undefined)
        throw new Error("Writer layout follow page descriptor is missing.");
      pageDescriptors.push(activeDescriptor.value);
      used = 0;
    }
    let firstLine = 0;
    while (firstLine < paragraph.lines.length) {
      const page = pages[pages.length - 1] as SwTextFrame[];
      const pageDescriptor = pageDescriptors[pages.length - 1] as WriterPageDescriptorValue;
      const bodyHeight =
        pageDescriptor.height - pageDescriptor.topMargin - pageDescriptor.bottomMargin;
      const topSpacing = firstLine === 0 ? gap : 0;
      const line = paragraph.lines[firstLine] as (typeof paragraph.lines)[number];
      if (page.length > 0 && used + topSpacing + line.height > bodyHeight) {
        pages.push([]);
        activeDescriptor = descriptorByName.get(activeDescriptor.followName);
        if (activeDescriptor === undefined)
          throw new Error("Writer layout follow page descriptor is missing.");
        pageDescriptors.push(activeDescriptor.value);
        used = 0;
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
      page.push(makeSwTextFrame(paragraph, firstLine, lastLine, topSpacing));
      used += height;
      firstLine = lastLine + 1;
      if (firstLine < paragraph.lines.length) {
        pages.push([]);
        activeDescriptor = descriptorByName.get(activeDescriptor.followName);
        if (activeDescriptor === undefined)
          throw new Error("Writer layout follow page descriptor is missing.");
        pageDescriptors.push(activeDescriptor.value);
        used = 0;
      }
    }
  }
  return Object.freeze(
    pages.map(
      /** Freezes one physical page. @param textFrames - Page content frames. @param index - Page index. @returns Immutable page frame. */ (
        textFrames,
        index,
      ) =>
        Object.freeze({
          descriptor: pageDescriptors[index] as WriterPageDescriptorValue,
          number: index + 1,
          textFrames: Object.freeze(textFrames),
        }),
    ),
  );
}
