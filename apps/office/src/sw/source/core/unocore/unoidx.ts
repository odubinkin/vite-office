/** @fileoverview Writer UNO document-index descriptor and text-bound attachment. */
import type { SwDoc } from "../doc/doc";
import type { SwSectionNode } from "../docnode/ndsect";
import { SwTOXBaseSection } from "../inc/doctxm";
import { SwTOXBase } from "../tox/tox";
import type { SwXTextRange } from "./unoobj2";

/** Native contents-index service descriptor used by stream import. */
export class SwXDocumentIndex {
  private readonly descriptor: SwTOXBase;
  private section: SwTOXBaseSection | undefined;

  /** Registers the contents descriptor with its original document type. @param document - Native document. @returns New index descriptor. */
  public constructor(private readonly document: SwDoc) {
    this.descriptor = new SwTOXBase(document.GetTOXType());
  }

  /** Returns descriptor fields before attachment and connected fields afterwards. @returns Index properties. */
  public GetTOXBase(): SwTOXBase {
    return this.section?.tox ?? this.descriptor;
  }

  /** Attaches the index at the Writer paragraph boundary used by the XML reader. @param range - Native insertion cursor. @returns Attached native section. */
  public attach(range: SwXTextRange): SwSectionNode {
    const selection = range.GetPaM();
    const point = selection.GetPoint();
    const node = point.GetNode().GetTextNode();
    if (
      this.section ||
      selection.HasMark() ||
      point.GetContentIndex() !== 0 ||
      node?.GetDoc() !== this.document
    )
      throw new Error("Writer index requires an unattached paragraph insertion boundary.");
    const inserted = this.document.InsertTableOf(node, this.descriptor);
    const section = inserted.GetSection();
    if (!(section instanceof SwTOXBaseSection))
      throw new Error("Writer index section is missing its descriptor.");
    this.section = section;
    return inserted;
  }
}
