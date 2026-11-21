/** @fileoverview Retains the native identity and section of a removed inline graphic. */
import { SwFormatContent } from "../../../inc/fmtcntnt";
import { SwFormatFlyCnt } from "../../../inc/fmtflcnt";
import { SwTextFlyCnt } from "../../../inc/txtflcnt";
import { RES_ANCHOR, RES_CNTNT } from "../../../inc/hintids";
import { SetAttrMode } from "../../../inc/swtypes";
import { SwFlyFrameFormat } from "../layout/atrfrm";

/** Native graphic subset of SwUndoFlyBase and SwUndoDelLayFormat, embedded by the fly history entry. */
export class SwUndoDelLayFormat {
  private readonly sectionPosition: number;
  private readonly nodePosition: number;
  private readonly contentPosition: number;
  private sectionId: number | undefined;

  /** Moves the format and its graphic section into Writer undo ownership. @param hint - Actual covered fly point. @returns Deletion history. */
  constructor(hint: SwTextFlyCnt) {
    const format = hint.GetAttr().GetFrameFormat();
    const section = hint.GetGraphicSection();
    const node = format?.GetAnchor().GetAnchorNode()?.GetTextNode();
    if (!(format instanceof SwFlyFrameFormat) || !section || !node)
      throw new Error("Writer fly history requires an anchored graphic section.");
    this.format = format;
    const doc = format.GetDoc();
    const nodes = section.GetNodes();
    this.sectionPosition = section.GetIndex();
    format.ResetFormatAttr(RES_CNTNT);
    this.sectionId = doc
      .GetUndoManager()
      .GetUndoNodes()
      .RetainSection(nodes.DetachGraphicSection(section));
    this.nodePosition = node.GetIndex();
    this.contentPosition = hint.GetStart();
    hint.GetAttr().SetFlyFormat();
    node.EraseText(this.contentPosition, 1);
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
    nodes.RestoreGraphicSection(this.sectionPosition, section);
    const content = new SwFormatContent(start);
    try {
      this.format.SetFormatAttr(content);
    } finally {
      content.Dispose();
    }
    const hint = new SwTextFlyCnt(new SwFormatFlyCnt(this.format), this.contentPosition);
    node.InsertHint(hint, SetAttrMode.NOHINTEXPAND);
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
