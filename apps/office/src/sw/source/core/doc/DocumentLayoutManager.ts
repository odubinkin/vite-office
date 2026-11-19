/** @fileoverview Native current-view/current-layout ownership queries from DocumentLayoutManager.cxx. Wider layouter, anchored-object and chain-editing responsibilities are not represented here. */
import type { SwDoc } from "./doc";
import { RndStdIds } from "../../../../svx/inc/swframetypes";
import type { SfxItemSet } from "../../../../svl/source/items/itemset";
import { SwFrameFormat, type SwFlyFrameFormat } from "../layout/atrfrm";
import { SwFormatContent } from "../../../inc/fmtcntnt";
import { SwStartNodeType } from "../../../inc/ndtyp";
import type { WriterParagraphStyle } from "./fmtcol";
import type { SwViewShell } from "../view/viewsh";
import type { SwRootFrame } from "../layout/newfrm";
/** Actual document layout manager owns the source current-view pointer, not a separate list of cursor positions. */
export class DocumentLayoutManager {
  private mpCurrentView: SwViewShell | undefined;
  /** Original document owner binding and initially null current view. @param m_rDoc - Actual document. @returns Native manager. */
  constructor(readonly m_rDoc: SwDoc) {}
  /** Releases a special fly format and its owned section through the document layout owner. @param format - Native fly removed from its text anchor. @returns Nothing. */
  DelLayoutFormat(format: SwFlyFrameFormat): void {
    const doc = this.m_rDoc;
    if (doc.IsInDtor() || !doc.GetSpzFrameFormats().erase(format)) return;
    const model = format.GetContent().GetContentIdx()?.GetNode();
    format.Dispose();
    if (model?.IsStartNode()) doc.GetDocumentContentOperationsManager().DeleteSection(model);
  }
  /** Original header/footer branch of format creation. @param request - Native layout format identity. @param items - Optional native override set. @returns Native frame format. */
  MakeLayoutFormat(
    request: RndStdIds.HEADER | RndStdIds.HEADERL | RndStdIds.HEADERR | RndStdIds.FOOTER,
    items?: SfxItemSet,
  ): SwFrameFormat {
    const header = request !== RndStdIds.FOOTER;
    let style: WriterParagraphStyle = header ? "header" : "footer";
    if (request === RndStdIds.HEADERL) style = "header-left";
    if (request === RndStdIds.HEADERR) style = "header-right";
    const doc = this.m_rDoc,
      nodes = doc.GetNodes(),
      section = nodes.MakeTextSection(
        nodes.GetEndOfAutotext(),
        header ? SwStartNodeType.SwHeaderStartNode : SwStartNodeType.SwFooterStartNode,
        doc.GetTextFormatColl(style),
      ),
      frame = new SwFrameFormat(
        doc.GetAttrPool(),
        header ? "Right header" : "Right footer",
        undefined,
        doc.GetDfltFrameFormat(),
      );
    const content = new SwFormatContent(section);
    try {
      frame.SetFormatAttr(content);
      if (items) frame.SetFormatAttrSet(items);
    } finally {
      content.Dispose();
    }
    return frame;
  }
  /** Original borrowed view query. @returns Actual current view or no view. */
  GetCurrentViewShell(): SwViewShell | undefined {
    return this.mpCurrentView;
  }
  /** Original direct view-pointer assignment. @param view - Actual view or null binding. @returns Nothing. */
  SetCurrentViewShell(view: SwViewShell | undefined): void {
    this.mpCurrentView = view;
  }
  /** Original layout query delegates to the actual current view. @returns Actual layout or no layout. */
  GetCurrentLayout(): SwRootFrame | undefined {
    return this.mpCurrentView?.GetLayout();
  }
  /** Original source predicate: a current view implies a layout. @returns Whether a view exists. */
  HasLayout(): boolean {
    return this.mpCurrentView !== undefined;
  }
}
