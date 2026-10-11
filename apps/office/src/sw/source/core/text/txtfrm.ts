/** @fileoverview Writer text-frame fragments over one unchanged text node, after browser line layout. */

import type { SwLineNumberInfoValue } from "../../../inc/lineinfo";
import type { SwPageFrame } from "../layout/newfrm";
import type { SwDoc } from "../doc/doc";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwContentFrame } from "../layout/ssfrm";
import { SwFrameType, type SwFrame } from "../layout/wsfrm";
import { SvxULSpaceItem } from "../../../../editeng/source/items/frmitems";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SwFormatPageDesc } from "../attr/fmtpdsc";
import { SwPosition, type SwPaM } from "../crsr/pam";
import { SwTextCursor } from "./itrtxt";
import { SwLineLayout, SwParaPortion } from "./porlay";
import { MoveTextFrameMargin } from "./frmcrsr";
import {
  RES_BREAK,
  RES_KEEP,
  RES_LINENUMBER,
  RES_PAGEDESC,
  RES_PARATR_ORPHANS,
  RES_PARATR_SPLIT,
  RES_PARATR_WIDOWS,
  RES_UL_SPACE,
} from "../../../inc/hintids";

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
  readonly node: SwTextNode;
  readonly id: string;
  readonly lines: readonly SwTextLine[];
  readonly lowerSpacing: number;
  readonly style: string;
  readonly contextualSpacing: boolean;
  readonly upperSpacing: number;
  readonly keepWithNext?: boolean;
  readonly keepTogether?: boolean;
  readonly orphans?: number;
  readonly widows?: number;
  readonly breakBefore?: boolean;
  readonly breakAfter?: boolean;
  readonly pageStyleName?: string;
  readonly pageNumber?: number;
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
      const paragraphBreak = (node.GetAttr(RES_BREAK) as SfxInt16Item).GetValue();
      const pageDesc = node.GetAttr(RES_PAGEDESC) as SwFormatPageDesc;
      const pageNumber = pageDesc.GetNumOffset();
      return {
        node,
        id: measurement.id,
        lines: measurement.lines,
        lowerSpacing: spacing.GetLower(),
        style: node.GetParagraphStyle(),
        contextualSpacing: spacing.GetContext(),
        upperSpacing: spacing.GetUpper(),
        keepWithNext: (node.GetAttr(RES_KEEP) as SfxBoolItem).GetValue(),
        keepTogether: !(node.GetAttr(RES_PARATR_SPLIT) as SfxBoolItem).GetValue(),
        orphans: (node.GetAttr(RES_PARATR_ORPHANS) as SfxInt16Item).GetValue(),
        widows: (node.GetAttr(RES_PARATR_WIDOWS) as SfxInt16Item).GetValue(),
        breakBefore: paragraphBreak === 4 || paragraphBreak === 6,
        breakAfter: paragraphBreak === 5 || paragraphBreak === 6,
        pageStyleName: pageDesc.GetPageDescName(),
        ...(pageNumber === undefined ? {} : { pageNumber }),
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
export class SwTextFrame extends SwContentFrame {
  #para: SwParaPortion | undefined;
  /** Registers the original node and retains the browser device fragment fields. @param node - Original text owner. @param nodeId - Device projection identity. @param start - Frame start. @param end - Frame end. @param topSpacing - Frame spacing. @param lines - Device-shaped lines. @param sibling - Existing native frame supplying the original root. @returns Frame. */
  public constructor(
    node: SwTextNode,
    public readonly nodeId: string,
    public readonly start: number,
    public readonly end: number,
    public readonly topSpacing: number,
    lines: readonly SwTextLine[],
    sibling?: SwFrame,
  ) {
    super(node, sibling);
    this.mnFrameType = SwFrameType.Txt;
    this.#para = createSwParaPortion(lines);
  }
  /** Resolves the original first node in the represented unmerged frame. @returns Original registered text owner. */
  public GetTextNodeFirst(): SwTextNode {
    return this.GetDep() as SwTextNode;
  }
  /** Reads the original represented unmerged frame text. @returns Original node text. */
  public GetText(): string {
    return this.GetTextNodeFirst().GetText();
  }
  /** Maps represented unmerged view text into the original node and index. @param index - Frame text index. @returns Original node and unchanged UTF-16 index. */
  public MapViewToModel(index: number): readonly [SwTextNode, number] {
    return [this.GetTextNodeFirst(), index];
  }
  /** Creates the actual registered model position from a native view index. @param index - Frame text index. @returns Original native position requiring release. */
  public MapViewToModelPos(index: number): SwPosition {
    const [node, offset] = this.MapViewToModel(index);
    return new SwPosition(node, offset);
  }
  /** Maps a represented unmerged node/index as source does without a node-dependent offset. @param _node - Native model node. @param index - Original content index. @returns Unchanged frame text index. */
  public MapModelToView(_node: SwTextNode, index: number): number {
    return index;
  }
  /** Maps an actual model position into unmerged frame text. @param position - Native model position. @returns Frame text index. */
  public MapModelToViewPos(position: SwPosition): number {
    return this.MapModelToView(position.GetNode() as SwTextNode, position.GetContentIndex());
  }
  /** Reads the original native paragraph first-line object. @returns Paragraph or missing formatting. */
  public GetPara(): SwParaPortion | undefined {
    return this.#para;
  }
  /** Replaces the original native paragraph cache and returns its previous owner, including clearing on missing input. @param para - New native paragraph or empty ownership. @returns Previous original paragraph cache. */
  public SetPara(para: SwParaPortion | undefined): SwParaPortion | undefined {
    const previous = this.#para;
    this.#para = para;
    return previous;
  }
  /** Reads the native fragment offset in represented unmerged node coordinates. @returns Original text offset. */
  public GetOffset(): number {
    return this.start;
  }
  /** Resolves the original follow at an unmerged position using native right-margin affinity. @param position - Actual native text position. @returns Original frame owning the boundary. */
  public GetFrameAtPos(position: SwPosition): SwTextFrame {
    const offset = position.GetContentIndex();
    let frame = this.flow.m_rThis as SwTextFrame;
    while (frame.GetFollow() !== undefined) {
      const follow = frame.GetFollow() as SwTextFrame;
      if (
        offset > follow.GetOffset() ||
        (offset === follow.GetOffset() && !SwTextCursor.IsRightMargin())
      )
        frame = follow;
      else break;
    }
    return frame;
  }
  /** Moves to the current visual line start. @param pam - Native cursor. @returns Admission result. */
  public LeftMargin(pam: SwPaM): boolean {
    return MoveTextFrameMargin(this, pam, true);
  }
  /** Moves to the current visual line end. @param pam - Native cursor. @param api - Include soft-line trailing spaces. @returns Admission result. */
  public RightMargin(pam: SwPaM, api = false): boolean {
    return MoveTextFrameMargin(this, pam, false, api);
  }
}

/** Writer's adjacent paragraph spacing, with contextual suppression for equal styles. @param previous - Preceding text frame input. @param current - Current text frame input. @param settings - Document spacing flags. @returns Gap in twips. */
export function getSwTextFrameGap(
  previous: Omit<SwTextFrameInput, "node"> | undefined,
  current: Omit<SwTextFrameInput, "node">,
  settings: SwTextFrameSettings = DEFAULT_SW_TEXT_FRAME_SETTINGS,
): number {
  if (previous === undefined) return settings.paraSpaceMaxAtPages ? current.upperSpacing : 0;
  const sameStyle = previous.style === current.style;
  if (sameStyle && previous.contextualSpacing && current.contextualSpacing) return 0;
  if (settings.paraSpaceMax) return previous.lowerSpacing + current.upperSpacing;
  const lower = sameStyle && previous.contextualSpacing ? 0 : previous.lowerSpacing;
  const upper = sameStyle && current.contextualSpacing ? 0 : current.upperSpacing;
  return Math.max(lower, upper);
}

/** Makes one frame from a consecutive range of measured lines. @param input - Source text node lines. @param firstLine - First line index. @param lastLine - Last line index. @param topSpacing - Gap before the frame. @param sibling - Existing native frame supplying the original root. @returns Master or follow frame. */
export function makeSwTextFrame(
  input: SwTextFrameInput,
  firstLine: number,
  lastLine: number,
  topSpacing: number,
  sibling?: SwFrame,
): SwTextFrame {
  const first = input.lines[firstLine];
  const last = input.lines[lastLine];
  if (first === undefined || last === undefined || lastLine < firstLine)
    throw new Error("Writer text frames require a non-empty consecutive line range.");
  const frame = new SwTextFrame(
    input.node,
    input.id,
    first.start,
    last.end,
    topSpacing,
    input.lines.slice(firstLine, lastLine + 1),
    sibling,
  );
  return frame;
}

/** Builds the represented native paragraph/line cache once from the existing device-line contract; full native formatting remains unported. @param lines - Original measured line lengths and heights. @returns Actual native paragraph cache or missing formatting. */
export function createSwParaPortion(lines: readonly SwTextLine[]): SwParaPortion | undefined {
  if (lines[0] === undefined) return undefined;
  const para = new SwParaPortion();
  let current: SwLineLayout = para;
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index] as SwTextLine;
    current.SetLen(line.end - line.start);
    current.SetRealHeight(line.height);
    if (index + 1 < lines.length) {
      const next = new SwLineLayout();
      current.SetNext(next);
      current = next;
    }
  }
  return para;
}
