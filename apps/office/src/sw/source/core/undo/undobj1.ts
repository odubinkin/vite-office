/** @fileoverview Retains the native identity and section of a removed anchored frame. */
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import { SwFormatAnchor } from "../../../inc/fmtanchr";
import { SwPosition } from "../crsr/pam";
import { SwStartNodeType } from "../../../inc/ndtyp";
import type { SwStartNode } from "../docnode/node";
import { SwFormatContent } from "../../../inc/fmtcntnt";
import { SwFormatFlyCnt } from "../../../inc/fmtflcnt";
import { SwTextFlyCnt } from "../../../inc/txtflcnt";
import { RES_ANCHOR, RES_CNTNT } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwFlyFrameFormat } from "../layout/atrfrm";

/** Borrows a represented floating section admitted by delete history. @param format - Live floating format. @returns Original section or undefined. */
export function GetUndoFlySection(format: SwFlyFrameFormat): SwStartNode | undefined {
  const start = format.GetContent().GetContentIdx()?.GetNode();
  if (!start?.IsStartNode() || start.GetStartNodeType() !== SwStartNodeType.SwFlyStartNode)
    return undefined;
  const first = start.GetIndex() + 1;
  const end = start.EndOfSectionNode().GetIndex();
  for (let index = first; index < end; index++) {
    const node = start.GetNodes().at(index);
    if (!node.IsTextNode() && !node.GetGrfNode()) return undefined;
  }
  const doc = format.GetDoc();
  /** Checks the saved section's interior. @param index - Live node index. @returns Whether this section owns the node. */
  function inside(index: number): boolean {
    return first <= index && index < end;
  }
  for (const candidate of doc.GetSpzFrameFormats()) {
    const index = candidate.GetAnchor().GetAnchorNode()?.GetIndex();
    if (index !== undefined && inside(index)) return undefined;
  }
  for (const mark of doc.GetIDocumentMarkAccess().GetAllMarks())
    if (inside(mark.GetMarkStart().GetNodeIndex()) || inside(mark.GetMarkEnd().GetNodeIndex()))
      return undefined;
  return start;
}

/** Native subset of SwUndoFlyBase and SwUndoDelLayFormat, embedded by the fly history entry. */
export class SwUndoDelLayFormat {
  private readonly sectionPosition: number;
  private readonly nodePosition: number;
  private readonly contentPosition: number;
  private readonly anchorType: RndStdIds;
  private sectionId: number | undefined;

  /** Moves the format and its section into Writer undo ownership. @param source - Covered inline point or floating format. @returns Deletion history. */
  constructor(source: SwTextFlyCnt | SwFlyFrameFormat) {
    const hint = source instanceof SwTextFlyCnt ? source : undefined;
    const format = source instanceof SwTextFlyCnt ? source.GetAttr().GetFrameFormat() : source;
    if (!(format instanceof SwFlyFrameFormat))
      throw new Error("Writer fly history requires a fly format.");
    const section = hint ? hint.GetGraphicSection() : GetUndoFlySection(format);
    const anchor = format.GetAnchor();
    const node = anchor.GetAnchorNode()?.GetTextNode();
    if (!section || !node) throw new Error("Writer fly history requires an anchored fly section.");
    this.format = format;
    this.anchorType = anchor.GetAnchorId();
    this.contentPosition = anchor.GetAnchorContentOffset();
    const doc = format.GetDoc();
    const nodes = section.GetNodes();
    this.sectionPosition = section.GetIndex();
    format.ResetFormatAttr(RES_CNTNT);
    this.sectionId = doc
      .GetUndoManager()
      .GetUndoNodes()
      .RetainSection(nodes.DetachFlySection(section));
    this.nodePosition = node.GetIndex();
    if (hint) {
      hint.GetAttr().SetFlyFormat();
      node.EraseText(this.contentPosition, 1);
    }
    format.ResetFormatAttr(RES_ANCHOR);
    doc.GetSpzFrameFormats().erase(format);
  }

  private readonly format: SwFlyFrameFormat;

  /** Restores the original special format, graphic section, and inline marker. @returns Nothing. */
  Restore(): void {
    const id = this.sectionId;
    if (id === undefined) return;
    const doc = this.format.GetDoc();
    const nodes = doc.GetNodes();
    const node = nodes.at(this.nodePosition).GetTextNode();
    if (!node) throw new Error("Writer fly history requires a text anchor.");
    const section = doc.GetUndoManager().GetUndoNodes().TakeSection(id);
    const start = section[0];
    if (!start?.IsStartNode()) throw new Error("Writer fly history requires a section start.");
    doc.GetSpzFrameFormats().push_back(this.format);
    nodes.RestoreFlySection(this.sectionPosition, section);
    const content = new SwFormatContent(start);
    try {
      this.format.SetFormatAttr(content);
    } finally {
      content.Dispose();
    }
    if (this.anchorType === RndStdIds.FLY_AS_CHAR) {
      const hint = new SwTextFlyCnt(new SwFormatFlyCnt(this.format), this.contentPosition);
      node.InsertHint(hint, SetAttrMode.NOHINTEXPAND);
    } else {
      const position = new SwPosition(node, this.contentPosition);
      const anchor = new SwFormatAnchor(this.anchorType);
      try {
        anchor.SetAnchor(position);
        this.format.SetFormatAttr(anchor);
      } finally {
        anchor.Dispose();
        position.Dispose();
      }
    }
    this.sectionId = undefined;
  }

  /** Releases both detached owners when the history is discarded. @returns Nothing. */
  Dispose(): void {
    if (this.sectionId === undefined) return;
    this.format.GetDoc().GetUndoManager().GetUndoNodes().Release(this.sectionId);
    this.format.Dispose();
    this.sectionId = undefined;
  }
}
