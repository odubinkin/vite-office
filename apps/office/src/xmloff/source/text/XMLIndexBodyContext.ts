/** @fileoverview Native text:index-body dispatcher for generated index contents. */
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import type { XMLToken } from "../core/xmltoken";
import type { XMLTextImportHelper } from "./txtimp";

/** Imports the native cached index body through the ordinary text context. */
export class XMLIndexBodyContext extends SvXMLImportContext {
  private hasContent = false;

  /** Borrows the section cursor from the shared helper. @param text - Text dispatcher. @returns Context. */
  public constructor(private readonly text: XMLTextImportHelper) {
    super();
  }

  /** Uses exactly the native Section text location for contained paragraphs. @param token - Child token. @param attributes - Original child attributes. @returns Writer text context. */
  public override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    const child = this.text.CreateTextChildContext(token, attributes, "Section");
    if (child) this.hasContent = true;
    return child;
  }

  /** Reports whether a real text child was read. @returns Whether the cached body had content. */
  public HasContent(): boolean {
    return this.hasContent;
  }
}
