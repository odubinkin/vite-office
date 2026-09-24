/** @fileoverview Writer text-frame fragments over one unchanged text node, after browser line layout. */

import type { SwLineNumberInfoValue } from "../../../inc/lineinfo";
import type { SwPageFrame } from "../layout/newfrm";
import type { SwDoc } from "../doc/doc";
import { SvxULSpaceItem } from "../../../../editeng/source/items/paraitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { RES_KEEP, RES_LINENUMBER, RES_UL_SPACE } from "../../../inc/hintids";

/** One visible line-number glyph positioned within a text-frame fragment. */
export interface SwLineNumberMark {
  readonly number: number;
  readonly topTwips: number;
}

/** Projects page-aware line numbers after device measurement and core pagination. @param pages - Physical page frames. @param inputs - Measured text nodes. @param info - Document settings. @returns Marks aligned to page and frame indices. */
export function projectSwLineNumbers(
  pages: readonly SwPageFrame[],
  inputs: readonly SwTextFrameInput[],
  info: SwLineNumberInfoValue,
): readonly (readonly (readonly SwLineNumberMark[])[])[] {
  const byId = new Map(
    inputs.map(
      /** Indexes one measured node. @param input - Text-node measurement. @returns Key and input. */
      (input) => [input.id, input] as const,
    ),
  );
  let count = 0;
  return pages.map(
    /** Numbers one physical page. @param page - Page frame. @returns Marks by text fragment. */
    (page) => {
      if (info.restartEachPage) count = 0;
      return page.textFrames.map(
        /** Numbers one text-frame fragment. @param frame - Fragment. @returns Visible marks. */
        (frame) => {
          const input = byId.get(frame.nodeId);
          if (input === undefined) throw new Error("Line-number frame has no measured text node.");
          const marks: SwLineNumberMark[] = [];
          let topTwips = 0;
          for (const line of input.lines) {
            if (line.start < frame.start || line.end > frame.end) continue;
            if (
              input.countLineNumbers !== false &&
              (info.countBlankLines || line.start < line.end)
            ) {
              count += 1;
              if (info.paintLineNumbers && info.countBy > 0 && count % info.countBy === 0)
                marks.push({ number: count, topTwips });
            }
            topTwips += line.height;
          }
          return marks;
        },
      );
    },
  );
}

/** One shaped visual line, in source-node UTF-16 coordinates and Writer twips. */
export interface SwTextLine {
  readonly end: number;
  readonly height: number;
  readonly start: number;
}

/** Measurement of one text node supplied by the active device. */
export interface SwTextFrameMeasurement {
  readonly id: string;
  readonly lines: readonly SwTextLine[];
}

/** Core layout values of one canonical text node paired with device-shaped lines. */
export interface SwTextFrameInput {
  readonly id: string;
  readonly lines: readonly SwTextLine[];
  readonly lowerSpacing: number;
  readonly style: string;
  readonly contextualSpacing: boolean;
  readonly upperSpacing: number;
  readonly keepWithNext?: boolean;
  readonly countLineNumbers?: boolean;
}

/** Reads layout-owned values from canonical Writer nodes, pairing them only with measured lines. @param document - Active Writer document. @param measurements - Browser device line geometry in document order. @returns Core frame inputs. */
export function createSwTextFrameInputs(
  document: SwDoc,
  measurements: readonly SwTextFrameMeasurement[],
): readonly SwTextFrameInput[] {
  if (measurements.length === 0) return [];
  const nodes = document.paragraphs;
  if (nodes.length !== measurements.length)
    throw new Error("Writer layout measurements must match the current text nodes.");
  return nodes.map(
    /** Pairs one node's pooled values with its device lines. @param node - Canonical node. @param index - Document order. @returns Core frame input. */ (
      node,
      index,
    ) => {
      const measurement = measurements[index] as SwTextFrameMeasurement;
      const spacing = node.GetAttr(RES_UL_SPACE) as SvxULSpaceItem;
      return {
        id: measurement.id,
        lines: measurement.lines,
        lowerSpacing: spacing.GetLower(),
        style: node.GetParagraphStyle(),
        contextualSpacing: spacing.GetContext(),
        upperSpacing: spacing.GetUpper(),
        keepWithNext: (node.GetAttr(RES_KEEP) as SfxBoolItem).GetValue(),
        countLineNumbers: (node.GetAttr(RES_LINENUMBER) as SfxBoolItem).GetValue(),
      };
    },
  );
}

/** Document settings consumed by the supported paragraph-spacing path. */
export interface SwTextFrameSettings {
  readonly paraSpaceMax: boolean;
  readonly paraSpaceMaxAtPages: boolean;
}

/** Pinned LibreOffice compatibility defaults from Office/Compatibility.xcs. */
export const DEFAULT_SW_TEXT_FRAME_SETTINGS: SwTextFrameSettings = Object.freeze({
  paraSpaceMax: true,
  paraSpaceMaxAtPages: true,
});

/** A master or follow frame; offsets always refer to the same source text node. */
export interface SwTextFrame {
  readonly end: number;
  readonly follow: boolean;
  readonly nodeId: string;
  readonly start: number;
  readonly topSpacing: number;
}

/** Writer's adjacent paragraph spacing, with contextual suppression for equal styles. @param previous - Preceding text frame input. @param current - Current text frame input. @param settings - Document spacing flags. @returns Gap in twips. */
export function getSwTextFrameGap(
  previous: SwTextFrameInput | undefined,
  current: SwTextFrameInput,
  settings: SwTextFrameSettings = DEFAULT_SW_TEXT_FRAME_SETTINGS,
): number {
  if (previous === undefined) return settings.paraSpaceMaxAtPages ? current.upperSpacing : 0;
  const sameStyle = previous.style === current.style;
  if (sameStyle && previous.contextualSpacing && current.contextualSpacing) return 0;
  const lower = sameStyle && previous.contextualSpacing ? 0 : previous.lowerSpacing;
  const upper = sameStyle && current.contextualSpacing ? 0 : current.upperSpacing;
  return settings.paraSpaceMax ? lower + upper : Math.max(lower, upper);
}

/** Makes one frame from a consecutive range of measured lines. @param input - Source text node lines. @param firstLine - First line index. @param lastLine - Last line index. @param topSpacing - Gap before the frame. @returns Master or follow frame. */
export function makeSwTextFrame(
  input: SwTextFrameInput,
  firstLine: number,
  lastLine: number,
  topSpacing: number,
): SwTextFrame {
  const first = input.lines[firstLine];
  const last = input.lines[lastLine];
  if (first === undefined || last === undefined || lastLine < firstLine)
    throw new Error("Writer text frames require a non-empty consecutive line range.");
  return Object.freeze({
    end: last.end,
    follow: firstLine > 0,
    nodeId: input.id,
    start: first.start,
    topSpacing,
  });
}
