/** @fileoverview TOC level formats from the original xmloff index template contexts. */
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { SvXMLUnitConverter } from "../core/xmluconv";

/** Represented simple and styled fields of an original TOC template. */
export interface XMLIndexEntry {
  readonly kind:
    "chapter" | "text" | "span" | "tab-stop" | "page-number" | "link-start" | "link-end";
  readonly styleName: string;
  readonly text?: string;
  readonly display?: string;
  readonly chapterLevel?: number;
  readonly tabPosition?: number;
  readonly tabRight?: boolean;
  readonly tabFill?: string;
  readonly withTab?: boolean;
}

/** The paragraph style and ordered entry fields used at a TOC outline level. */
export interface XMLIndexTemplate {
  readonly level: number;
  readonly styleName?: string;
  readonly entries: readonly XMLIndexEntry[];
}

const indexEntries = new Map<XMLToken, XMLIndexEntry["kind"]>([
  [XMLToken.TEXT_INDEX_ENTRY_CHAPTER, "chapter"],
  [XMLToken.TEXT_INDEX_ENTRY_TEXT, "text"],
  [XMLToken.TEXT_INDEX_ENTRY_SPAN, "span"],
  [XMLToken.TEXT_INDEX_ENTRY_TAB_STOP, "tab-stop"],
  [XMLToken.TEXT_INDEX_ENTRY_PAGE_NUMBER, "page-number"],
  [XMLToken.TEXT_INDEX_ENTRY_LINK_START, "link-start"],
  [XMLToken.TEXT_INDEX_ENTRY_LINK_END, "link-end"],
]);

/** Reads one original table-of-content-entry-template. */
export class XMLIndexTemplateContext extends SvXMLImportContext {
  private readonly entries: XMLIndexEntry[] = [];
  private readonly level: [number] = [0];
  private readonly styleName: string | null;
  private readonly valid: boolean;

  /** Captures the outline level and style before reading its fields. @param attributes - Entry template attributes. @param levels - Native outline depth. @param publish - Source definition owner. @param alphabetical - Uses the original alphabetical level and token table. @returns Context. */
  public constructor(
    attributes: FastAttributeList,
    levels: number,
    private readonly publish: (template: XMLIndexTemplate) => void,
    private readonly alphabetical = false,
  ) {
    super();
    this.styleName = attributes.get(XMLToken.TEXT_STYLE_NAME);
    const level = attributes.get(XMLToken.TEXT_OUTLINE_LEVEL);
    if (alphabetical) {
      const entry =
        level === "separator" ? 1 : level === "1" ? 2 : level === "2" ? 3 : level === "3" ? 4 : 0;
      this.valid = entry !== 0;
      this.level[0] = entry;
      return;
    }
    const numeric = Number(level);
    this.valid =
      level !== null &&
      String(numeric) === level &&
      Number.isInteger(numeric) &&
      numeric >= 1 &&
      numeric <= levels;
    this.level[0] = numeric;
  }

  /** Dispatches recognized TOC pattern fields. @param token - Child token. @param attributes - Field attributes. @returns Child context. */
  public override createFastChildContext(
    token: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    const kind = indexEntries.get(token);
    if (this.alphabetical && (kind === "link-start" || kind === "link-end")) return null;
    return this.valid && kind
      ? new XMLIndexEntryContext(
          kind,
          attributes,
          /** Adds the source field. @param entry - Completed field. @returns Nothing. */ (
            entry,
          ) => {
            this.entries.push(entry);
          },
        )
      : null;
  }

  /** Publishes the original template at its one-based outline level. @returns Nothing. */
  public override endFastElement(): void {
    if (this.valid)
      this.publish({
        level: this.level[0],
        ...(this.styleName === null ? {} : { styleName: this.styleName }),
        entries: this.entries,
      });
  }
}

/** Collects one scalar or literal-text entry field. */
class XMLIndexEntryContext extends SvXMLImportContext {
  private value = "";

  /** Retains the original native field data. @param kind - TOC field type. @param attributes - Field attributes. @param publish - Template collector. @returns Context. */
  public constructor(
    private readonly kind: XMLIndexEntry["kind"],
    private readonly attributes: FastAttributeList,
    private readonly publish: (entry: XMLIndexEntry) => void,
  ) {
    super();
  }

  /** Appends the literal entry text. @param value - Parser text. @returns Nothing. */
  public override characters(value: string): void {
    this.value += value;
  }

  /** Resolves the represented field attributes in the original native contract. @returns Nothing. */
  public override endFastElement(): void {
    const { attributes, kind } = this;
    const styleName = attributes.get(XMLToken.TEXT_STYLE_NAME) ?? "";
    if (kind === "span") {
      this.publish({ kind, styleName, text: this.value });
    } else if (kind === "tab-stop") {
      const tab = attributes.get(XMLToken.STYLE_POSITION);
      const position =
        tab === null ? null : new SvXMLUnitConverter("mm100").convertMeasureToCore(tab);
      const withTab: [boolean] = [true];
      const withTabValue = attributes.get(XMLToken.STYLE_WITH_TAB);
      const hasWithTab = withTabValue !== null && Converter.convertBool(withTab, withTabValue);
      this.publish({
        kind,
        styleName,
        ...(position === null ? {} : { tabPosition: position }),
        tabRight: attributes.get(XMLToken.STYLE_TYPE) === "right",
        tabFill: attributes.get(XMLToken.STYLE_LEADER_CHAR) || " ",
        withTab: !hasWithTab || withTab[0],
      });
    } else if (kind === "chapter") {
      const level: [number] = [0];
      const display = attributes.get(XMLToken.TEXT_DISPLAY);
      const outline = attributes.get(XMLToken.TEXT_OUTLINE_LEVEL);
      this.publish({
        kind,
        styleName,
        ...(display === null ? {} : { display }),
        ...(outline !== null && Converter.convertNumber(level, outline, 0, 32767)
          ? { chapterLevel: level[0] }
          : {}),
      });
    } else this.publish({ kind, styleName });
  }
}
