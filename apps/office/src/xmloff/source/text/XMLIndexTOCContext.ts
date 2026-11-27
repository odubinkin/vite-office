/** @fileoverview Original ODF table-of-content service and source/body routing. */
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import type { XMLTextImportHelper } from "./txtimp";
import { XMLIndexBodyContext } from "./XMLIndexBodyContext";
import { XMLIndexTOCSourceContext, type XMLIndexTOCSource } from "./XMLIndexTOCSourceContext";

import type { XMLIndexFamily } from "./XMLIndexSourceBaseContext";
import { XMLIndexUserSourceContext, type XMLIndexUserSource } from "./XMLIndexUserSourceContext";
import {
  XMLIndexAlphabeticalSourceContext,
  type XMLIndexAlphabeticalSource,
} from "./XMLIndexAlphabeticalSourceContext";

/** Type-specific properties accepted by the represented native index service. */
export type XMLIndexSource = XMLIndexTOCSource | XMLIndexUserSource | XMLIndexAlphabeticalSource;

const indexElements: ReadonlyMap<XMLToken, XMLIndexFamily> = new Map([
  [XMLToken.TEXT_TABLE_OF_CONTENT, "table-of-content"],
  [XMLToken.TEXT_USER_INDEX, "user-index"],
  [XMLToken.TEXT_ALPHABETICAL_INDEX, "alphabetical-index"],
]);

/** Original common index section properties. */
export interface XMLIndexImportProperties {
  readonly family: XMLIndexFamily;
  readonly name: string;
  readonly styleName: string;
  readonly protected: boolean;
}

/** Operations on the native index descriptor and scoped cursor. */
export interface XMLIndexImport {
  readonly outlineLevels: number;
  setSource(source: XMLIndexSource): void;
  end(hasContent: boolean): void;
}

/** Creates the contents index and routes its source and generated body separately. */
export class XMLIndexTOCContext extends SvXMLImportContext {
  private index: XMLIndexImport | undefined;
  private family: XMLIndexFamily | undefined;
  private body: XMLIndexBodyContext | undefined;

  /** Holds the text dispatcher and original contents-index service boundary. @param text - Shared text helper. @param create - Writer document-index service operation. @returns Context. */
  public constructor(
    private readonly text: XMLTextImportHelper,
    private readonly create: (properties: XMLIndexImportProperties) => XMLIndexImport,
  ) {
    super();
  }

  /** Recognizes the represented index types in document body content. @param token - ODF body element. @returns Whether this context can attach the native service. */
  public static IsIndex(token: XMLToken): boolean {
    return indexElements.has(token);
  }

  /** Attaches the original index header properties before reading its source/body. @param _token - Current token. @param attributes - Index section properties. @returns Nothing. */
  public override startFastElement(token: XMLToken, attributes: FastAttributeList): void {
    this.family = indexElements.get(token);
    if (!this.family) return;
    const protectedContent: [boolean] = [false];
    const protect = attributes.get(XMLToken.TEXT_PROTECTED);
    if (protect !== null) Converter.convertBool(protectedContent, protect);
    this.index = this.create({
      family: this.family,
      name: attributes.get(XMLToken.TEXT_NAME) ?? "",
      styleName: attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "",
      protected: protectedContent[0],
    });
  }

  /** Selects the source and generated body contexts. @param token - Document index child. @param attributes - Original child values. @returns Native context. */
  public override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (!this.index) return null;
    if (this.family === "table-of-content" && token === XMLToken.TEXT_TABLE_OF_CONTENT_SOURCE)
      return new XMLIndexTOCSourceContext(
        attributes,
        this.index.outlineLevels,
        this.index.setSource,
      );
    if (this.family === "user-index" && token === XMLToken.TEXT_USER_INDEX_SOURCE)
      return new XMLIndexUserSourceContext(
        attributes,
        this.index.outlineLevels,
        this.index.setSource,
      );
    if (this.family === "alphabetical-index" && token === XMLToken.TEXT_ALPHABETICAL_INDEX_SOURCE)
      return new XMLIndexAlphabeticalSourceContext(
        attributes,
        this.index.outlineLevels,
        this.index.setSource,
      );
    if (token === XMLToken.TEXT_INDEX_BODY) {
      this.body = new XMLIndexBodyContext(this.text);
      return this.body;
    }
    return null;
  }

  /** Returns the importer to the original body cursor. @returns Nothing. */
  public override endFastElement(): void {
    this.index?.end(this.body?.HasContent() ?? false);
  }
}
