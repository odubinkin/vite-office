/** @fileoverview Native ODF point and range index mark attribute parsing from txtparai.cxx. */
import { Converter } from "../../../sax/source/tools/converter";
import { SvXMLImportContext, type FastAttributeList } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import type { XMLTextImportHelper } from "./txtimp";

/** Original index-mark descriptor properties emitted by the shared reader. */
export interface XMLIndexMarkProperties {
  readonly kind: "toc" | "user-index" | "alphabetical-index";
  readonly alternativeText: string;
  readonly indexName: string;
  readonly level: number;
  readonly key1: string;
  readonly key2: string;
  readonly key1Reading: string;
  readonly key2Reading: string;
  readonly textReading: string;
  readonly mainEntry: boolean;
}

/** Native mark family and its original point or range boundary. */
type MarkToken = readonly [XMLIndexMarkProperties["kind"], "point" | "start" | "end"];
const indexMarkTokens = new Map<XMLToken, MarkToken>([
  [XMLToken.TEXT_TOC_MARK, ["toc", "point"]],
  [XMLToken.TEXT_TOC_MARK_START, ["toc", "start"]],
  [XMLToken.TEXT_TOC_MARK_END, ["toc", "end"]],
  [XMLToken.TEXT_USER_INDEX_MARK, ["user-index", "point"]],
  [XMLToken.TEXT_USER_INDEX_MARK_START, ["user-index", "start"]],
  [XMLToken.TEXT_USER_INDEX_MARK_END, ["user-index", "end"]],
  [XMLToken.TEXT_ALPHABETICAL_INDEX_MARK, ["alphabetical-index", "point"]],
  [XMLToken.TEXT_ALPHABETICAL_INDEX_MARK_START, ["alphabetical-index", "start"]],
  [XMLToken.TEXT_ALPHABETICAL_INDEX_MARK_END, ["alphabetical-index", "end"]],
]);

/** Routes the original point, start and end tokens to the paragraph's pending native hints. */
export class XMLIndexMarkImportContext extends SvXMLImportContext {
  /** Borrows the enclosing paragraph import cursor. @param paragraph - Native paragraph helper. @returns Context. */
  public constructor(private readonly paragraph: XMLTextImportHelper) {
    super();
  }

  /** Checks the nine original ODF mark tags. @param token - Source token. @returns Whether admitted. */
  public static IsIndexMark(token: XMLToken): boolean {
    return indexMarkTokens.has(token);
  }

  /** Reads original service-specific properties and captures the text position. @param token - Mark tag. @param attributes - Original descriptor attributes. @returns Nothing. */
  public override startFastElement(token: XMLToken, attributes: FastAttributeList): void {
    const entry = indexMarkTokens.get(token);
    if (!entry) return;
    const [kind, boundary] = entry;
    const id = boundary === "point" ? "" : (attributes.get(XMLToken.TEXT_ID) ?? "");
    if (boundary === "end") {
      if (id) this.paragraph.EndIndexMark(id);
      return;
    }
    if (boundary === "start" && !id) return;
    const level: [number] = [1];
    const outline = attributes.get(XMLToken.TEXT_OUTLINE_LEVEL);
    const limit = this.paragraph.GetIndexOutlineLevelCount();
    if (outline !== null && kind !== "alphabetical-index") {
      const parsed: [number] = [0];
      if (kind === "user-index") {
        if (Converter.convertNumber(parsed, outline, 0, limit)) level[0] = parsed[0];
      } else if (Converter.convertNumber(parsed, outline) && parsed[0] >= 1 && parsed[0] < limit) {
        level[0] = parsed[0];
      }
    }
    const alpha = kind === "alphabetical-index";
    const main: [boolean] = [false];
    const mainEntry = attributes.get(XMLToken.TEXT_MAIN_ENTRY);
    if (alpha && mainEntry !== null) Converter.convertBool(main, mainEntry);
    this.paragraph.AddIndexMark(
      {
        kind,
        level: level[0],
        alternativeText:
          boundary === "point" ? (attributes.get(XMLToken.TEXT_STRING_VALUE) ?? "") : "",
        indexName: kind === "user-index" ? (attributes.get(XMLToken.TEXT_INDEX_NAME) ?? "") : "",
        key1: alpha ? (attributes.get(XMLToken.TEXT_KEY1) ?? "") : "",
        key2: alpha ? (attributes.get(XMLToken.TEXT_KEY2) ?? "") : "",
        key1Reading: alpha ? (attributes.get(XMLToken.TEXT_KEY1_PHONETIC) ?? "") : "",
        key2Reading: alpha ? (attributes.get(XMLToken.TEXT_KEY2_PHONETIC) ?? "") : "",
        textReading: alpha ? (attributes.get(XMLToken.TEXT_STRING_VALUE_PHONETIC) ?? "") : "",
        mainEntry: main[0],
      },
      id,
    );
  }
}
