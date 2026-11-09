/** @fileoverview Native text fly anchors and represented content-frame placement from flycnt.cxx. */
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import type { SwDoc } from "../doc/doc";
import type { SwTableNode } from "../docnode/node";
import type { SwTextFrame } from "../text/txtfrm";
import type { SwTextNode } from "../txtnode/ndtxt";
import { SwFlyFrameFormat } from "./atrfrm";

/** Actual text frame content bound to its native anchor. */
export type BoundTextFrame = Readonly<{
  format: SwFlyFrameFormat;
  content: readonly (SwTextNode | SwTableNode)[];
}>;
/** Native export frame sets indexed by their actual text owner. */
export type BoundTextFrames = ReadonlyMap<SwTextNode, readonly BoundTextFrame[]>;

/** Collects native text frame formats by their actual anchored Writer paragraph. @param document - Native Writer model. @returns Bound frame sets. */
export function CollectTextFlyFrames(document: SwDoc): BoundTextFrames {
  const anchored = new Map<SwTextNode, BoundTextFrame[]>();
  for (const format of document.GetSpzFrameFormats()) {
    if (!(format instanceof SwFlyFrameFormat)) continue;
    const anchor = format.GetAnchor();
    const owner = anchor.GetAnchorNode()?.GetTextNode();
    const start = format.GetContent().GetContentIdx()?.GetNode();
    if (
      !owner ||
      !start?.IsStartNode() ||
      (anchor.GetAnchorId() !== RndStdIds.FLY_AT_PARA &&
        anchor.GetAnchorId() !== RndStdIds.FLY_AT_CHAR)
    )
      continue;
    const frames = anchored.get(owner) ?? [];
    frames.push({ format, content: document.nodes.GetSectionContent(start) });
    anchored.set(owner, frames);
  }
  return anchored;
}

/** Selects the original fly anchor fragment, with a boundary character belonging to its follow. @param format - Connected native fly. @param frame - Native anchor master or follow. @returns Whether this fragment carries the anchor. */
export function IsTextFlyAnchorFrame(format: SwFlyFrameFormat, frame: SwTextFrame): boolean {
  const anchor = format.GetAnchor();
  if (anchor.GetAnchorId() === RndStdIds.FLY_AT_PARA) return !frame.IsFollow();
  const offset = anchor.GetAnchorContentOffset();
  return (
    offset >= frame.start && (offset < frame.end || (offset === frame.end && !frame.GetFollow()))
  );
}
