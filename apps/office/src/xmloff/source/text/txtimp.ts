/** @fileoverview Owns shared Writer body/cell text child dispatch and stream list state from native txtimp.cxx. */
import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { XMLTableContext, type XMLTableImportTarget } from "../table/XMLTableImport";
import type { OdfCharacterProperties, OdfHyperlink, OdfParagraphAlignment } from "./txtparae";
import type { XMLParagraphImportProperties, XMLParagraphListState } from "./txtparai";
import type {
  XMLTextModel,
  XMLTextCursor,
  XMLTextRange,
  XMLNamedTextContent,
} from "../../inc/txtimp";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../cppu/inc/com/sun/star/container/XIndexReplace";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { applyTextImportProperties, xmlTextString } from "./txtprmap";
import { APPEND_PARAGRAPH } from "../../../offapi/com/sun/star/text/ControlCharacter";
import { XMLParaContext, type XMLTextImportTarget } from "./txtparai";
import { XMLTextListsHelper } from "./txtlists";
import { XMLTextListBlockContext } from "./XMLTextListBlockContext";

/** Native text import locations represented by the current body/table slice. */
export type XMLTextType = "Body" | "Cell";

/** One native text import owner keeps processed list roots across body and every cell. */
export class XMLTextImportHelper {
  private readonly lists = new XMLTextListsHelper();

  /** Binds the common dispatcher to actual Writer paragraph/table operations. @param target - Canonical import target. @returns Nothing.  @param model - Native operation input. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    private readonly model: XMLTextModel,
  ) {}
  private cursor: XMLTextCursor | undefined;
  private start: XMLTextRange | undefined;
  private applyParagraph: ((cursor: XMLTextCursor) => void) | undefined;
  private readonly hints: {
    start: XMLTextRange;
    end: XMLTextRange;
    properties: OdfCharacterProperties;
    hyperlink?: OdfHyperlink;
  }[] = [];
  private readonly bookmarkStarts = new Map<string, XMLTextRange>();
  /** Borrows the current native text cursor. @returns Active cursor. */
  public GetCursor(): XMLTextCursor {
    if (!this.cursor) throw new RuntimeException();
    return this.cursor;
  }
  /** Switches the shared text cursor when native table import enters or leaves a cell. @param cursor - Actual Writer API cursor. @returns Nothing. */
  public SetCursor(cursor: XMLTextCursor): void {
    this.cursor = cursor;
  }
  /** Releases import-owned cursor and hint positions after stream completion or failure. @returns Nothing. */
  public ResetCursor(): void {
    this.cursor?.dispose();
    this.cursor = undefined;
    this.start?.dispose();
    this.start = undefined;
    for (const hint of this.hints) {
      hint.start.dispose();
      hint.end.dispose();
    }
    this.hints.length = 0;
    for (const start of this.bookmarkStarts.values()) start.dispose();
    this.bookmarkStarts.clear();
  }
  /** Starts XMLParaContext's range and defers paragraph properties until after its terminating break. @param style - Resolved programmatic style. @param alignment - Direct alignment. @param left - Direct text-left margin. @param paragraph - Paragraph property map. @param properties - Direct character map. @param list - Active native list state. @param listGeometryWins - Legacy parser precedence, represented by native styles/items. @param forceListRule - Explicit automatic list declaration. @returns Nothing. */
  public BeginParagraph(
    style: string,
    alignment: OdfParagraphAlignment | undefined,
    left: number | undefined,
    paragraph: XMLParagraphImportProperties | undefined,
    properties: Partial<OdfCharacterProperties> | undefined,
    list: XMLParagraphListState | undefined,
    _listGeometryWins: boolean,
    forceListRule = false,
  ): void {
    this.start = this.GetCursor().getStart();
    this.applyParagraph =
      /** Executes this bounded native operation. @param cursor - Native operation input. @returns Native operation result. */ (
        cursor,
      ) => {
        this.SetStyleAndAttrs(cursor, style, list, forceListRule);
        applyTextImportProperties(cursor, properties, paragraph, alignment, left);
      };
  }
  /** Applies the original paragraph style/list API properties, preserving inherited numbering when already equal. @param cursor - Selected original paragraph. @param style - Native style identity. @param list - Active list state. @param forceListRule - Explicit automatic numbering. @returns Nothing. */
  public SetStyleAndAttrs(
    cursor: XMLTextCursor,
    style: string,
    list: XMLParagraphListState | undefined,
    forceListRule = false,
  ): void {
    this.SetProperty(cursor, "ParaStyleName", style);
    const ruleKey = xmlTextString("NumberingStyleName"),
      value = cursor.getPropertyValue(ruleKey),
      current = xmlTextString("");
    try {
      value.extract(current, "OUString");
      const currentName = Array.from(current.getStr().subarray(0, current.getLength()))
        .map(
          /** Executes this bounded native operation. @param unit - Native operation input. @returns Native operation result. */ (
            unit,
          ) => String.fromCharCode(unit),
        )
        .join("");
      if (list) {
        if (forceListRule || currentName !== list.ruleName) {
          if (!list.rules) throw new RuntimeException();
          const key = xmlTextString("NumberingRules"),
            value = new Any([list.rules], ["Reference", indexReplaceType]);
          try {
            cursor.setPropertyValue(key, value);
          } finally {
            key.dispose();
            value.dispose();
          }
        }
        this.SetProperty(cursor, "ListId", list.listId);
        this.SetProperty(cursor, "NumberingLevel", list.level, "sal_Int16");
        this.SetProperty(cursor, "ParaIsNumberingRestart", list.restart === true);
        if (list.startValue !== undefined)
          this.SetProperty(
            cursor,
            "NumberingStartValue",
            (list.startValue << 16) >> 16,
            "sal_Int16",
          );
        if (list.counted === false) this.SetProperty(cursor, "NumberingIsNumber", false);
      } else if (currentName !== "" && currentName !== "Outline")
        this.SetProperty(cursor, "NumberingStyleName", "");
    } finally {
      ruleKey.dispose();
      value.dispose();
      current.dispose();
    }
  }
  /** Writes an actual typed property without exposing model items to xmloff. @param cursor - Real property owner. @param name - Native property name. @param value - Scalar. @param numeric - Optional numeric type. @returns Nothing. */
  public SetProperty(
    cursor: XMLTextCursor,
    name: string,
    value: string | boolean | number,
    numeric?: "sal_Int16",
  ): void {
    const key = xmlTextString(name),
      string = typeof value === "string" ? xmlTextString(value) : undefined,
      any = string
        ? new Any(string.getDataAddress(), "OUString")
        : new Any([value], numeric ?? "bool");
    try {
      cursor.setPropertyValue(key, any);
    } finally {
      key.dispose();
      any.dispose();
      string?.dispose();
    }
  }
  /** Inserts SAX characters through XText and retains only native hint ranges, never another text model. @param characters - Parsed text. @param properties - Span property deltas. @param hyperlink - Link property deltas. @returns Nothing. */
  public InsertString(
    characters: string,
    properties: OdfCharacterProperties = {},
    hyperlink?: OdfHyperlink,
  ): void {
    if (!characters.length) return;
    const cursor = this.GetCursor(),
      start = cursor.getStart(),
      value = xmlTextString(characters);
    try {
      cursor.getText().insertString(cursor, value, false);
      if (Object.keys(properties).length || hyperlink)
        this.hints.push({
          start,
          end: cursor.getStart(),
          properties,
          ...(hyperlink ? { hyperlink } : {}),
        });
      else start.dispose();
    } catch (error) {
      start.dispose();
      throw error;
    } finally {
      value.dispose();
    }
  }
  /** Completes the paragraph through XSimpleText before applying style, automatic properties and character hints. @returns Nothing. */
  public EndParagraph(): void {
    if (this.bookmarkStarts.size) throw new Error("ODF bookmark start has no end.");
    const cursor = this.GetCursor(),
      text = cursor.getText(),
      end = cursor.getStart(),
      start = this.start;
    if (!start) throw new RuntimeException();
    text.insertControlCharacter(cursor, APPEND_PARAGRAPH, false);
    const selected = text.createTextCursorByRange(start);
    try {
      selected.gotoRange(end, true);
      this.applyParagraph?.(selected);
      for (const hint of this.hints) {
        const range = text.createTextCursorByRange(hint.start);
        try {
          range.gotoRange(hint.end, true);
          const familyName = xmlTextString("CharacterStyles");
          try {
            applyTextImportProperties(
              range,
              hint.properties,
              {},
              undefined,
              undefined,
              this.model.getAutoStyles().getByName(familyName),
            );
          } finally {
            familyName.dispose();
          }
          if (hint.hyperlink)
            for (const [key, field] of [
              ["HyperLinkURL", "url"],
              ["HyperLinkName", "name"],
              ["HyperLinkTarget", "targetFrame"],
              ["VisitedCharStyleName", "visitedStyleName"],
              ["UnvisitedCharStyleName", "styleName"],
            ] as const)
              if (hint.hyperlink[field] !== undefined)
                this.SetProperty(range, key, hint.hyperlink[field]);
        } finally {
          range.dispose();
        }
      }
    } finally {
      selected.dispose();
      start.dispose();
      end.dispose();
      this.start = undefined;
      for (const hint of this.hints) {
        hint.start.dispose();
        hint.end.dispose();
      }
      this.hints.length = 0;
      this.applyParagraph = undefined;
    }
  }
  /** Inserts the original named text-content service at a collapsed range. @param name - Bookmark name. @param range - Optional recorded collapsed start. @returns Nothing. */
  public InsertBookmark(name: string, range: XMLTextRange = this.GetCursor()): void {
    const service = xmlTextString("com.sun.star.text.Bookmark"),
      key = xmlTextString(name);
    try {
      const bookmark = this.model.createInstance(service) as XMLNamedTextContent;
      bookmark.setName(key);
      this.GetCursor().getText().insertTextContent(range, bookmark, true);
    } finally {
      service.dispose();
      key.dispose();
    }
  }
  /** Retains a range-mark start using the original live API range. @param name - Bookmark name. @returns Nothing. */
  public StartBookmark(name: string): void {
    if (this.bookmarkStarts.has(name)) throw new Error(`ODF bookmark start is duplicated: ${name}`);
    this.bookmarkStarts.set(name, this.GetCursor().getStart());
  }
  /** Completes the supported collapsed bookmark using the actual service attachment route. @param name - Bookmark name. @returns Nothing. */
  public EndBookmark(name: string): void {
    const start = this.bookmarkStarts.get(name);
    if (!start) throw new Error(`ODF bookmark end has no start: ${name}`);
    const range = this.GetCursor().getText().createTextCursorByRange(start);
    try {
      range.gotoRange(this.GetCursor(), true);
      const value = range.getString();
      try {
        if (value.getLength()) throw new Error("ODF ranged bookmarks are unsupported.");
      } finally {
        value.dispose();
      }
      this.InsertBookmark(name, start);
    } finally {
      range.dispose();
      start.dispose();
      this.bookmarkStarts.delete(name);
    }
  }
  /** Removes a trailing empty cell paragraph through the same text/cursor API. @returns Nothing. */
  public DeleteParagraph(): void {
    const cursor = this.GetCursor();
    const paragraphs = cursor.createEnumeration();
    if (paragraphs.hasMoreElements()) {
      paragraphs.nextElement().dispose();
      return;
    }
    if (!cursor.goLeft(1, true)) return;
    const empty = xmlTextString("");
    try {
      cursor.setString(empty);
      cursor.collapseToEnd();
    } finally {
      empty.dispose();
    }
  }

  /** Creates the supported native paragraph/list/table context for this text location. @param element - Child token. @param attributes - Child values. @param type - Native text location. @returns Context or native inert-child fallback. */
  public CreateTextChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
    type: XMLTextType,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TEXT_P || element === XMLToken.TEXT_H)
      return new XMLParaContext(this.target, element, attributes);
    if (element === XMLToken.TEXT_LIST)
      return new XMLTextListBlockContext(this.target, attributes, this.lists);
    if (element === XMLToken.TABLE_TABLE) {
      if (type === "Cell") throw new Error("Unsupported ODF table cell section or nested table.");
      if ("beginTable" in this.target)
        return new XMLTableContext(this.target as XMLTableImportTarget, attributes, this);
      return null;
    }
    if (element === XMLToken.TEXT_SEQUENCE_DECLS && type === "Body")
      return new SvXMLIgnoreContext(true);
    if (element === XMLToken.TEXT_SECTION)
      throw new Error(
        type === "Cell"
          ? "Unsupported ODF table cell section or nested table."
          : "Unsupported ODF text section.",
      );
    return null;
  }
}
