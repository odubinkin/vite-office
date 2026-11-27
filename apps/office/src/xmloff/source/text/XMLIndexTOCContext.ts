/** @fileoverview Original ODF table-of-content service and source/body routing. */
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import type { XMLTextImportHelper } from "./txtimp";
import { XMLIndexBodyContext } from "./XMLIndexBodyContext";
import { XMLIndexTOCSourceContext, type XMLIndexTOCSource } from "./XMLIndexTOCSourceContext";

/** Original common index section properties. */
export interface XMLIndexImportProperties {
  readonly name: string;
  readonly styleName: string;
  readonly protected: boolean;
}

/** Operations on the native index descriptor and scoped cursor. */
export interface XMLIndexImport {
  readonly outlineLevels: number;
  setSource(source: XMLIndexTOCSource): void;
  end(hasContent: boolean): void;
}

/** Creates the contents index and routes its source and generated body separately. */
export class XMLIndexTOCContext extends SvXMLImportContext {
  private index: XMLIndexImport | undefined;
  private body: XMLIndexBodyContext | undefined;

  /** Holds the text dispatcher and original contents-index service boundary. @param text - Shared text helper. @param create - Writer document-index service operation. @returns Context. */
  public constructor(
    private readonly text: XMLTextImportHelper,
    private readonly create: (properties: XMLIndexImportProperties) => XMLIndexImport,
  ) {
    super();
  }

  /** Attaches the original index header properties before reading its source/body. @param _token - Current token. @param attributes - Index section properties. @returns Nothing. */
  public override startFastElement(_token: XMLToken, attributes: FastAttributeList): void {
    const protectedContent: [boolean] = [false];
    const protect = attributes.get(XMLToken.TEXT_PROTECTED);
    if (protect !== null) Converter.convertBool(protectedContent, protect);
    this.index = this.create({
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
    if (token === XMLToken.TEXT_TABLE_OF_CONTENT_SOURCE)
      return new XMLIndexTOCSourceContext(
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
