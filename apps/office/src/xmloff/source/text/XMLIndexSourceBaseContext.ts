/** @fileoverview Original common source properties and child contexts for ODF text indexes. */
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { XMLIndexTemplateContext, type XMLIndexTemplate } from "./XMLIndexTemplateContext";

/** ODF section families with a represented Writer index service. */
export type XMLIndexFamily =
  "table-of-content" | "user-index" | "alphabetical-index" | XMLSingleLevelIndexFamily;

/** Original index families that have one entry template after the heading. */
export type XMLSingleLevelIndexFamily = "table-index" | "illustration-index" | "object-index";

/** Recognizes the original single-template families. @param family - Source family. @returns Whether it has the single-level source form. */
export function isSingleLevelIndex(family: XMLIndexFamily): family is XMLSingleLevelIndexFamily {
  return family === "table-index" || family === "illustration-index" || family === "object-index";
}

/** Common source, format and cached-body descriptor properties from XMLIndexSourceBaseContext. */
export interface XMLIndexSourceProperties {
  readonly family: XMLIndexFamily;
  readonly fromChapter: boolean;
  readonly relativeTabs: boolean;
  readonly title?: { readonly styleName: string; readonly text: string };
  readonly templates: readonly XMLIndexTemplate[];
  readonly sourceStyles: ReadonlyMap<number, readonly string[]>;
  readonly sourceStyle?: string;
}

const templateElements: Readonly<Record<XMLIndexFamily, XMLToken>> = {
  "table-of-content": XMLToken.TEXT_TABLE_OF_CONTENT_ENTRY_TEMPLATE,
  "user-index": XMLToken.TEXT_USER_INDEX_ENTRY_TEMPLATE,
  "alphabetical-index": XMLToken.TEXT_ALPHABETICAL_INDEX_ENTRY_TEMPLATE,
  "table-index": XMLToken.TEXT_TABLE_INDEX_ENTRY_TEMPLATE,
  "illustration-index": XMLToken.TEXT_ILLUSTRATION_INDEX_ENTRY_TEMPLATE,
  "object-index": XMLToken.TEXT_OBJECT_INDEX_ENTRY_TEMPLATE,
};

/** Original common writer index source parsing owner. */
export class XMLIndexSourceBaseContext extends SvXMLImportContext {
  private readonly templates: XMLIndexTemplate[] = [];
  private readonly sourceStyles = new Map<number, readonly string[]>();
  private title: XMLIndexSourceProperties["title"];
  private sourceStyle: string | undefined;
  private readonly relativeTabs: [boolean] = [true];
  private fromChapter = false;

  /** Collects the original common source attributes and the index's entry-template shape. @param attributes - Original XML attributes. @param family - Source family. @param levels - Numbering rule depth. @returns Context. */
  public constructor(
    attributes: FastAttributeList,
    private readonly family: XMLIndexFamily,
    private readonly levels: number,
  ) {
    super();
    this.fromChapter = attributes.get(XMLToken.TEXT_INDEX_SCOPE) === "chapter";
    const relative = attributes.get(XMLToken.TEXT_RELATIVE_TAB_STOP_POSITION);
    if (relative !== null) Converter.convertBool(this.relativeTabs, relative);
  }

  /** Reads the original title, template or style-list child. @param token - Source child. @param attributes - Child attributes. @returns Child context when represented. */
  public override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (token === XMLToken.TEXT_INDEX_TITLE_TEMPLATE)
      return new XMLIndexTitleTemplateContext(
        attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "",
        /** Retains the original title. @param title - Title template. @returns Nothing. */
        (title) => {
          this.title = title;
        },
      );
    const alphabetical = this.family === "alphabetical-index";
    const single = isSingleLevelIndex(this.family);
    if (token === templateElements[this.family])
      return new XMLIndexTemplateContext(
        attributes,
        this.levels,
        /** Adds a connected template. @param template - Original template values. @returns Nothing. */
        (template) => {
          this.templates.push(template);
        },
        alphabetical ? "alphabetical" : single ? "single" : "outline",
      );
    if (token === XMLToken.TEXT_INDEX_SOURCE_STYLES && !alphabetical && !single) {
      const level: [number] = [0];
      const outlineLevel = attributes.get(XMLToken.TEXT_OUTLINE_LEVEL);
      if (outlineLevel !== null && Converter.convertNumber(level, outlineLevel, 1, this.levels))
        return new XMLIndexTOCStylesContext(
          /** Stores the last list of original styles at this level. @param styles - Named paragraph styles. @returns Nothing. */
          (styles) => {
            this.sourceStyles.set(level[0], styles);
          },
        );
    }
    if (
      single &&
      (token === XMLToken.TEXT_INDEX_SOURCE_STYLE || token === XMLToken.LOEXT_INDEX_SOURCE_STYLE)
    ) {
      const name = attributes.get(XMLToken.TEXT_STYLE_NAME);
      if (name) this.sourceStyle = name;
    }
    return null;
  }

  /** Supplies the source properties shared by these index families. @returns Collected native values. */
  protected GetSource(): XMLIndexSourceProperties {
    return {
      family: this.family,
      fromChapter: this.fromChapter,
      relativeTabs: this.relativeTabs[0],
      ...(this.title ? { title: this.title } : {}),
      templates: this.templates,
      sourceStyles: this.sourceStyles,
      ...(this.sourceStyle ? { sourceStyle: this.sourceStyle } : {}),
    };
  }
}

/** Reads a native boolean index-source attribute, preserving its original default. @param attributes - Source attributes. @param token - Property token. @param initial - Native default. @returns Original boolean value. */
export function readIndexSourceFlag(
  attributes: FastAttributeList,
  token: XMLToken,
  initial = false,
): boolean {
  const result: [boolean] = [initial];
  const value = attributes.get(token);
  if (value !== null) Converter.convertBool(result, value);
  return result[0];
}

/** Original title template text and paragraph style. */
class XMLIndexTitleTemplateContext extends SvXMLImportContext {
  private value = "";

  /** Keeps the title style until the character data is available. @param styleName - Source style. @param publish - TOC source owner. @returns Context. */
  public constructor(
    private readonly styleName: string,
    private readonly publish: (title: NonNullable<XMLIndexSourceProperties["title"]>) => void,
  ) {
    super();
  }

  /** Collects literal original title text. @param value - Parser text. @returns Nothing. */
  public override characters(value: string): void {
    this.value += value;
  }

  /** Publishes the original title template. @returns Nothing. */
  public override endFastElement(): void {
    this.publish({ styleName: this.styleName, text: this.value });
  }
}

/** Original style list for one heading level. */
class XMLIndexTOCStylesContext extends SvXMLImportContext {
  private readonly styles: string[] = [];

  /** Binds the style level to its source. @param publish - Source style callback. @returns Context. */
  public constructor(private readonly publish: (styles: readonly string[]) => void) {
    super();
  }

  /** Adds a declared source paragraph style. @param token - Child token. @param attributes - Source style attributes. @returns Inert child. */
  public override createFastChildContext(token: XMLToken, attributes: FastAttributeList): null {
    if (token === XMLToken.TEXT_INDEX_SOURCE_STYLE) {
      const name = attributes.get(XMLToken.TEXT_STYLE_NAME);
      if (name !== null) this.styles.push(name);
    }
    return null;
  }

  /** Publishes the original source style sequence. @returns Nothing. */
  public override endFastElement(): void {
    this.publish(this.styles);
  }
}
