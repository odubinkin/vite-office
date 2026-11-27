/** @fileoverview Original Writer ODF table-of-content source properties and levels. */
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { XMLIndexTemplateContext, type XMLIndexTemplate } from "./XMLIndexTemplateContext";

/** Original content-index source options and its ordered template values. */
export interface XMLIndexTOCSource {
  readonly outlineLevel: number;
  readonly useOutline: boolean;
  readonly useMarks: boolean;
  readonly useStyles: boolean;
  readonly fromChapter: boolean;
  readonly relativeTabs: boolean;
  readonly title?: { readonly styleName: string; readonly text: string };
  readonly templates: readonly XMLIndexTemplate[];
  readonly sourceStyles: ReadonlyMap<number, readonly string[]>;
}

/** Imports the native TOC descriptor independently of the generated document body. */
export class XMLIndexTOCSourceContext extends SvXMLImportContext {
  private readonly templates: XMLIndexTemplate[] = [];
  private readonly sourceStyles = new Map<number, readonly string[]>();
  private title: XMLIndexTOCSource["title"];
  private outlineLevel: number;
  private readonly useOutline: [boolean] = [true];
  private readonly useMarks: [boolean] = [true];
  private readonly useStyles: [boolean] = [false];
  private readonly relativeTabs: [boolean] = [true];
  private fromChapter = false;

  /** Reads the source with the defaults of the original chapter and style service. @param attributes - TOC source attributes. @param levels - Document chapter numbering depth. @param publish - Connected index descriptor callback. @returns Context. */
  public constructor(
    attributes: FastAttributeList,
    private readonly levels: number,
    private readonly publish: (source: XMLIndexTOCSource) => void,
  ) {
    super();
    this.outlineLevel = levels;
    const depth: [number] = [0];
    const flag: [boolean] = [false];
    for (const [token, value] of attributes) {
      switch (token) {
        case XMLToken.TEXT_OUTLINE_LEVEL:
          if (value === "none") this.useOutline[0] = false;
          else if (Converter.convertNumber(depth, value, 1, levels)) {
            this.useOutline[0] = true;
            this.outlineLevel = depth[0];
          }
          break;
        case XMLToken.TEXT_USE_OUTLINE_LEVEL:
          if (Converter.convertBool(flag, value)) this.useOutline[0] = flag[0];
          break;
        case XMLToken.TEXT_USE_INDEX_MARKS:
          if (Converter.convertBool(flag, value)) this.useMarks[0] = flag[0];
          break;
        case XMLToken.TEXT_USE_INDEX_SOURCE_STYLES:
          if (Converter.convertBool(flag, value)) this.useStyles[0] = flag[0];
          break;
        case XMLToken.TEXT_INDEX_SCOPE:
          if (value === "chapter") this.fromChapter = true;
          break;
        case XMLToken.TEXT_RELATIVE_TAB_STOP_POSITION:
          if (Converter.convertBool(flag, value)) this.relativeTabs[0] = flag[0];
          break;
        default:
          break;
      }
    }
  }

  /** Routes title, entry patterns and style-based source levels. @param token - Child token. @param attributes - Child attributes. @returns Context or skipped child. */
  public override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (token === XMLToken.TEXT_INDEX_TITLE_TEMPLATE)
      return new XMLIndexTitleTemplateContext(
        attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "",
        /** Stores the source title. @param title - Title template. @returns Nothing. */ (
          title,
        ) => {
          this.title = title;
        },
      );
    if (token === XMLToken.TEXT_TABLE_OF_CONTENT_ENTRY_TEMPLATE)
      return new XMLIndexTemplateContext(
        attributes,
        this.levels,
        /** Adds an original level template. @param template - Parsed level. @returns Nothing. */ (
          template,
        ) => {
          this.templates.push(template);
        },
      );
    if (token === XMLToken.TEXT_INDEX_SOURCE_STYLES) {
      const level: [number] = [0];
      const outlineLevel = attributes.get(XMLToken.TEXT_OUTLINE_LEVEL);
      if (outlineLevel !== null && Converter.convertNumber(level, outlineLevel, 1, this.levels))
        return new XMLIndexTOCStylesContext(
          /** Stores the last definition for a source style level. @param styles - Source paragraph style names. @returns Nothing. */ (
            styles,
          ) => {
            this.sourceStyles.set(level[0], styles);
          },
        );
    }
    return null;
  }

  /** Applies the entire source descriptor to the connected index. @returns Nothing. */
  public override endFastElement(): void {
    this.publish({
      outlineLevel: this.outlineLevel,
      useOutline: this.useOutline[0],
      useMarks: this.useMarks[0],
      useStyles: this.useStyles[0],
      fromChapter: this.fromChapter,
      relativeTabs: this.relativeTabs[0],
      ...(this.title ? { title: this.title } : {}),
      templates: this.templates,
      sourceStyles: this.sourceStyles,
    });
  }
}

/** Original title template text and paragraph style. */
class XMLIndexTitleTemplateContext extends SvXMLImportContext {
  private value = "";

  /** Keeps the title style until the character data is available. @param styleName - Source style. @param publish - TOC source owner. @returns Context. */
  public constructor(
    private readonly styleName: string,
    private readonly publish: (title: NonNullable<XMLIndexTOCSource["title"]>) => void,
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
