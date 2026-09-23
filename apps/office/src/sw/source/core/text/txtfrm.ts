/** @fileoverview Writer text-frame fragments over one unchanged text node, after browser line layout. */

/** One shaped visual line, in source-node UTF-16 coordinates and Writer twips. */
export interface SwTextLine {
  readonly end: number;
  readonly height: number;
  readonly start: number;
}

/** Measurement of one text node supplied by the active device. */
export interface SwTextFrameInput {
  readonly id: string;
  readonly lines: readonly SwTextLine[];
  readonly lowerSpacing: number;
  readonly style: string;
  readonly contextualSpacing: boolean;
  readonly upperSpacing: number;
}

/** A master or follow frame; offsets always refer to the same source text node. */
export interface SwTextFrame {
  readonly end: number;
  readonly follow: boolean;
  readonly nodeId: string;
  readonly start: number;
  readonly topSpacing: number;
}

/** Writer's adjacent paragraph spacing, with contextual suppression for equal styles. @param previous - Preceding text frame input. @param current - Current text frame input. @returns Gap in twips. */
export function getSwTextFrameGap(
  previous: SwTextFrameInput | undefined,
  current: SwTextFrameInput,
): number {
  if (previous === undefined) return current.upperSpacing;
  const sameStyle = previous.style === current.style;
  if (sameStyle && previous.contextualSpacing && current.contextualSpacing) return 0;
  return Math.max(
    sameStyle && previous.contextualSpacing ? 0 : previous.lowerSpacing,
    sameStyle && current.contextualSpacing ? 0 : current.upperSpacing,
  );
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
