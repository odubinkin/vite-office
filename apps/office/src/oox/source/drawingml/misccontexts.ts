/** @fileoverview DrawingML BlipContext's embedded-picture relationship and graphic import. */
import type { EmbeddedGraphic } from "../helper/graphichelper";
import type { XmlFilterBase } from "../core/xmlfilterbase";

/** Resolves the internal drawing resource from the referring XML fragment. */
export class BlipContext {
  /** Borrows the active DrawingML filter and the owning part. @param filter - Actual OOXML filter. @param fragment - Referring package part. @returns Blip context. */
  constructor(
    private readonly filter: XmlFilterBase,
    private readonly fragment: string,
  ) {}

  /** Imports the original a:blip r:embed relationship. @param id - Relationship in this fragment. @returns Encoded graphic or absence. */
  async importEmbeddedGraphic(id: string): Promise<EmbeddedGraphic | undefined> {
    const relations = await this.filter.importRelations(this.fragment);
    const path = relations.getFragmentPathFromRelId(id);
    return this.filter.getGraphicHelper().importEmbeddedGraphic(path);
  }
}
