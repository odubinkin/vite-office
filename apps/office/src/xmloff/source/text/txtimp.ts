/** @fileoverview Owns shared Writer body/cell text child dispatch and stream list state from native txtimp.cxx. */
import { FastAttributeList, SvXMLIgnoreContext, SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";
import { XMLTableContext, type XMLTableImportTarget } from "../table/XMLTableImport";
import type { OdfCharacterProperties, OdfHyperlink, OdfParagraphAlignment } from "./txtparae";
import type { XMLParagraphImportProperties, XMLParagraphListState } from "./txtparai";
import type {
  XMLTextModel,
  XMLAnnotationTextContent,
  XMLTextCursor,
  XMLTextRange,
  XMLNamedTextContent,
  XMLPropertySet,
  XMLText,
} from "../../inc/txtimp";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../cppu/inc/com/sun/star/container/XIndexReplace";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { applyTextImportProperties, xmlTextString } from "./txtprmap";
import { APPEND_PARAGRAPH } from "../../../offapi/com/sun/star/text/ControlCharacter";
import {
  XMLNumberedParaContext,
  XMLParaContext,
  resolveParagraphStyle,
  type XMLTextImportTarget,
} from "./txtparai";
import { XMLTextListsHelper } from "./txtlists";
import { XMLTextFrameContext } from "./XMLTextFrameContext";
import { XMLTextListBlockContext } from "./XMLTextListBlockContext";
import { XMLSectionImportContext } from "./XMLSectionImportContext";
import { XMLIndexTOCContext } from "./XMLIndexTOCContext";

/** Native text import locations represented by the current body/table slice. */
export type XMLTextType = "Body" | "Cell" | "TextBox" | "HeaderFooter" | "Annotation" | "Section";

/** One native named style application and the direct properties from its enclosing span. */
export interface XMLCharacterStyleLayer {
  readonly name: string;
  readonly precedingProperties: OdfCharacterProperties;
}

/** Original pending ranged character and link properties for the current text context. */
interface TextImportHint {
  start: XMLTextRange;
  end: XMLTextRange;
  properties: OdfCharacterProperties;
  hyperlink?: OdfHyperlink;
  characterStyles: readonly XMLCharacterStyleLayer[];
}

/** One native text import owner keeps processed list roots across body and every cell. */
export class XMLTextImportHelper {
  private readonly lists = new XMLTextListsHelper();
  private cellParaStyleDefault = "";

  /** Gets the explicit cell paragraph default in the current SAX scope. @returns Source style name. */
  public GetCellParaStyleDefault(): string {
    return this.cellParaStyleDefault;
  }

  /** Saves or restores the cell paragraph default. @param name - Source paragraph style name. @returns Nothing. */
  public SetCellParaStyleDefault(name: string): void {
    this.cellParaStyleDefault = name;
  }

  /** Applies the cell's paragraph style without reapplying numbering or outline state. @param cursor - Actual paragraph text cursor. @param name - Explicit cell style name. @returns Nothing. */
  public ApplyCellParaStyle(cursor: XMLTextCursor, name: string): void {
    if (!name) return;
    const automatic = this.target.getAutoStyle("paragraph", name);
    const parentName = automatic?.parentStyleName ?? (automatic ? "" : name);
    if (parentName) {
      const style =
        this.target.resolveNamedParagraphStyle?.(parentName) ??
        this.target.resolveBuiltInParagraphStyle?.(parentName);
      if (style !== undefined) this.SetProperty(cursor, "ParaStyleName", style);
    }
    if (!automatic) return;
    const resolved = resolveParagraphStyle(name, false, this.target);
    applyTextImportProperties(
      cursor,
      resolved.properties,
      resolved.paragraphProperties,
      resolved.alignment,
      resolved.leftMargin,
    );
  }

  /** Binds the common dispatcher to actual Writer paragraph/table operations. @param target - Canonical import target. @returns Nothing.  @param model - Native operation input. */
  public constructor(
    private readonly target: XMLTextImportTarget,
    private readonly model: XMLTextModel,
  ) {}
  private cursor: XMLTextCursor | undefined;
  private start: XMLTextRange | undefined;
  private applyParagraph: ((cursor: XMLTextCursor) => void) | undefined;
  private hints: TextImportHint[] = [];
  private annotationDepth = 0;
  private readonly annotations = new Map<string, XMLAnnotationTextContent>();
  private readonly bookmarkStarts = new Map<
    string,
    { range: XMLTextRange; text: XMLText; hidden: boolean; condition: string }
  >();
  private readonly textContexts: {
    isolateList: boolean;
    cursor: XMLTextCursor | undefined;
    start: XMLTextRange | undefined;
    applyParagraph: ((cursor: XMLTextCursor) => void) | undefined;
    hints: TextImportHint[];
  }[] = [];

  /** Saves the original cursor, enclosing paragraph ranges and list context for a nested text frame. @param cursor - Frame text cursor. @returns Nothing. */
  public PushTextFrameCursor(cursor: XMLTextCursor): void {
    this.PushTextCursor(cursor, true);
  }

  /** Enters a named section in the current list context. @param cursor - Section text cursor. @returns Nothing. */
  public PushSectionCursor(cursor: XMLTextCursor): void {
    this.PushTextCursor(cursor, false);
  }

  /** Suspends text ranges so the child text can use the same dispatch helpers. @param cursor - Child text cursor. @param isolateList - Whether to isolate list state. @returns Nothing. */
  private PushTextCursor(cursor: XMLTextCursor, isolateList: boolean): void {
    this.textContexts.push({
      isolateList,
      cursor: this.cursor,
      start: this.start,
      applyParagraph: this.applyParagraph,
      hints: this.hints,
    });
    this.cursor = cursor;
    this.start = undefined;
    this.applyParagraph = undefined;
    this.hints = [];
    if (isolateList) this.lists.PushListContext();
  }

  /** Releases frame text ranges and restores the enclosing original paragraph and list context. @returns Nothing. */
  public PopTextFrameCursor(): void {
    this.PopTextCursor();
  }

  /** Restores the cursor from before the named section. @returns Nothing. */
  public PopSectionCursor(): void {
    this.PopTextCursor();
  }

  /** Resumes the parent cursor and its original list context. @returns Nothing. */
  private PopTextCursor(): void {
    const saved = this.textContexts.pop();
    if (saved === undefined) throw new RuntimeException();
    this.ClearCursor();
    this.cursor = saved.cursor;
    this.start = saved.start;
    this.applyParagraph = saved.applyParagraph;
    this.hints = saved.hints;
    if (saved.isolateList) this.lists.PopListContext();
  }
  /** Suspends the containing text while the annotation TextRange owns the active cursor. @param cursor - Annotation text cursor. @returns Nothing. */
  public PushAnnotationCursor(cursor: XMLTextCursor): void {
    this.PushTextFrameCursor(cursor);
    this.annotationDepth++;
  }

  /** Restores the containing text after the annotation is parsed. @returns Nothing. */
  public PopAnnotationCursor(): void {
    this.PopTextFrameCursor();
    this.annotationDepth--;
  }

  /** Determines whether direct EditEngine range properties are in use. @returns Whether the cursor is in annotation text. */
  public IsAnnotationText(): boolean {
    return this.annotationDepth > 0;
  }

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
    this.cellParaStyleDefault = "";
    this.annotationDepth = 0;
    while (this.textContexts.length !== 0) this.PopTextCursor();
    this.ClearCursor();
    for (const start of this.bookmarkStarts.values()) start.range.dispose();
    this.bookmarkStarts.clear();
  }

  /** Releases the current text location without clearing suspended parent contexts. @returns Nothing. */
  private ClearCursor(): void {
    this.cursor?.dispose();
    this.cursor = undefined;
    this.start?.dispose();
    this.start = undefined;
    this.applyParagraph = undefined;
    for (const hint of this.hints) {
      hint.start.dispose();
      hint.end.dispose();
    }
    this.hints.length = 0;
  }
  /** Starts a paragraph and defers its native style application until after the break. @param style - Paragraph style. @param alignment - Direct alignment. @param left - Direct margin. @param paragraph - Paragraph properties. @param properties - Direct character map. @param list - Native list state. @param listGeometryWins - Legacy parser precedence. @param forceListRule - Explicit automatic list declaration. @param markerProperties - Direct text properties of the paragraph mark. @param applyStyle - Whether the paragraph supplies its own style. @param outlineLevel - Native text heading level or zero for a plain paragraph. @returns Nothing. */
  public BeginParagraph(
    style: string,
    alignment: OdfParagraphAlignment | undefined,
    left: number | undefined,
    paragraph: XMLParagraphImportProperties | undefined,
    properties: Partial<OdfCharacterProperties> | undefined,
    list: XMLParagraphListState | undefined,
    _listGeometryWins: boolean,
    forceListRule = false,
    markerProperties?: Partial<OdfCharacterProperties>,
    applyStyle = true,
    outlineLevel?: number,
  ): void {
    const cellStyle = this.cellParaStyleDefault;
    this.start = this.GetCursor().getStart();
    this.applyParagraph =
      /** Executes this bounded native operation. @param cursor - Native operation input. @returns Native operation result. */ (
        cursor,
      ) => {
        if (!this.IsAnnotationText()) {
          this.ApplyCellParaStyle(cursor, cellStyle);
          this.SetStyleAndAttrs(cursor, style, list, forceListRule, applyStyle || !cellStyle);
        }
        const paragraphTarget = cursor.getParagraphPropertySet?.() ?? cursor;
        if (outlineLevel !== undefined && !this.IsAnnotationText())
          applyParagraphOutlineLevel(paragraphTarget, outlineLevel);
        applyTextImportProperties(paragraphTarget, properties, paragraph, alignment, left);
        if (markerProperties && !this.IsAnnotationText()) {
          const name = xmlTextString("CharacterStyles");
          try {
            const family = this.model.getAutoStyles().getByName(name);
            applyTextImportProperties(
              cursor,
              markerProperties,
              {},
              undefined,
              undefined,
              family,
              "ListAutoFormat",
            );
          } finally {
            name.dispose();
          }
        }
      };
  }
  /** Applies the original paragraph style/list API properties, preserving inherited numbering when already equal. @param cursor - Selected original paragraph. @param style - Native style identity. @param list - Active list state. @param forceListRule - Explicit automatic numbering. @param applyStyle - Whether the paragraph supplies its own style. @returns Nothing. */
  public SetStyleAndAttrs(
    cursor: XMLTextCursor,
    style: string,
    list: XMLParagraphListState | undefined,
    forceListRule = false,
    applyStyle = true,
  ): void {
    if (applyStyle) this.SetProperty(cursor, "ParaStyleName", style);
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
    cursor: Pick<XMLPropertySet, "setPropertyValue">,
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
  /** Inserts SAX characters through XText and retains only native hint ranges, never another text model. @param characters - Parsed text. @param properties - Span property deltas. @param hyperlink - Link property deltas. @param characterStyles - Common style names in source nesting order. @returns Nothing. */
  public InsertString(
    characters: string,
    properties: OdfCharacterProperties = {},
    hyperlink?: OdfHyperlink,
    characterStyles: readonly XMLCharacterStyleLayer[] = [],
  ): void {
    if (!characters.length) return;
    const cursor = this.GetCursor(),
      start = cursor.getStart(),
      value = xmlTextString(characters);
    try {
      cursor.getText().insertString(cursor, value, false);
      if (Object.keys(properties).length || hyperlink || characterStyles.length)
        this.hints.push({
          start,
          end: cursor.getStart(),
          properties,
          characterStyles,
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
          if (this.IsAnnotationText()) {
            applyTextImportProperties(range, hint.properties);
            continue;
          }
          const familyName = xmlTextString("CharacterStyles");
          try {
            const family = this.model.getAutoStyles().getByName(familyName);
            for (const style of hint.characterStyles) {
              applyTextImportProperties(
                range,
                style.precedingProperties,
                {},
                undefined,
                undefined,
                family,
              );
              this.SetProperty(range, "CharStyleName", style.name);
            }
            applyTextImportProperties(range, hint.properties, {}, undefined, undefined, family);
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
  /** Creates a detached Annotation field before importing its content. @param name - ODF annotation name. @returns Native descriptor. */
  public CreateAnnotation(name: string): XMLAnnotationTextContent {
    const service = xmlTextString("com.sun.star.text.TextField.Annotation");
    const key = xmlTextString(name);
    try {
      const field = this.model.createInstance(service) as XMLAnnotationTextContent;
      field.setName(key);
      return field;
    } finally {
      service.dispose();
      key.dispose();
    }
  }

  /** Inserts a prepared Annotation field at the current body cursor. @param name - ODF annotation name. @param field - Prepared descriptor. @returns Nothing. */
  public InsertAnnotation(name: string, field: XMLAnnotationTextContent): void {
    const cursor = this.GetCursor();
    cursor.getText().insertTextContent(cursor, field, false);
    this.MovePastAnnotation(cursor, field);
    if (name) this.annotations.set(name, field);
  }

  /** Reattaches a named annotation to the range ending at the active text cursor. @param name - ODF annotation name. @returns Nothing. */
  public EndAnnotation(name: string): void {
    const field = this.annotations.get(name);
    if (!field) return;
    this.annotations.delete(name);
    const cursor = this.GetCursor();
    const text = cursor.getText();
    const anchor = field.getAnchor();
    const range = text.createTextCursorByRange(cursor);
    try {
      try {
        range.gotoRange(anchor, true);
      } catch (error) {
        if (!(error instanceof RuntimeException)) throw error;
      }
      text.insertTextContent(range, field, true);
      this.MovePastAnnotation(cursor, field);
    } finally {
      range.dispose();
      anchor.dispose();
    }
  }

  /** Keeps the importer after the new point text field. @param cursor - Active import cursor. @param field - Attached annotation. @returns Nothing. */
  private MovePastAnnotation(cursor: XMLTextCursor, field: XMLAnnotationTextContent): void {
    const anchor = field.getAnchor();
    const end = anchor.getEnd();
    try {
      cursor.gotoRange(end, false);
    } finally {
      end.dispose();
      anchor.dispose();
    }
  }

  /** Attaches an original named text-content service. @param name - Bookmark name. @param range - Optional selected range. @param properties - Range bookmark attributes. @returns Nothing. */
  public InsertBookmark(
    name: string,
    range?: XMLTextRange,
    properties?: Readonly<{ hidden: boolean; condition: string }>,
  ): void {
    const service = xmlTextString("com.sun.star.text.Bookmark"),
      key = xmlTextString(name),
      selected = range ?? this.GetCursor().getStart();
    try {
      const bookmark = this.model.createInstance(service) as XMLNamedTextContent;
      bookmark.setName(key);
      this.GetCursor().getText().insertTextContent(selected, bookmark, true);
      if (properties) {
        this.SetProperty(bookmark, "BookmarkHidden", properties.hidden);
        this.SetProperty(bookmark, "BookmarkCondition", properties.condition);
      }
    } finally {
      service.dispose();
      key.dispose();
      if (range === undefined) selected.dispose();
    }
  }
  /** Retains the latest live start for this name. @param name - Bookmark name. @param hidden - Source visibility flag. @param condition - Source hide expression. @returns Nothing. */
  public StartBookmark(name: string, hidden: boolean, condition: string): void {
    const cursor = this.GetCursor();
    const range = cursor.getStart();
    this.bookmarkStarts.get(name)?.range.dispose();
    this.bookmarkStarts.set(name, { range, text: cursor.getText(), hidden, condition });
  }
  /** Attaches an ODF bookmark to the completed live range. @param name - Bookmark name. @returns Nothing. */
  public EndBookmark(name: string): void {
    const start = this.bookmarkStarts.get(name);
    if (!start) return;
    this.bookmarkStarts.delete(name);
    try {
      const cursor = this.GetCursor();
      const text = cursor.getText();
      if (start.text !== text) return;
      const end = cursor.getStart();
      try {
        const range = text.createTextCursorByRange(end);
        try {
          try {
            range.gotoRange(start.range, true);
          } catch (error) {
            if (!(error instanceof RuntimeException)) throw error;
          }
          this.InsertBookmark(name, range, start);
        } finally {
          range.dispose();
        }
      } finally {
        end.dispose();
      }
    } finally {
      start.range.dispose();
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

  /** Creates the original inline draw:frame context for an active Writer text importer. @param attributes - Source frame attributes. @returns Text frame context or native inert fallback. */
  public CreateTextFrameContext(attributes: FastAttributeList): SvXMLImportContext | null {
    const { target } = this;
    return target.beginTextFrame && target.endTextFrame
      ? new XMLTextFrameContext(
          {
            beginTextFrame: target.beginTextFrame.bind(target),
            endTextFrame: target.endTextFrame.bind(target),
            ...(target.insertGraphicFrame === undefined
              ? {}
              : { insertGraphicFrame: target.insertGraphicFrame.bind(target) }),
          },
          this,
          attributes,
        )
      : null;
  }

  /** Creates the supported native paragraph/list/table context for this text location. @param element - Child token. @param attributes - Child values. @param type - Native text location. @returns Context or native inert-child fallback. */
  public CreateTextChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
    type: XMLTextType,
  ): SvXMLImportContext | null {
    if (element === XMLToken.TEXT_P || element === XMLToken.TEXT_H)
      return new XMLParaContext(this.target, element, attributes);
    if (type === "Annotation") return null;
    if (element === XMLToken.TEXT_NUMBERED_PARAGRAPH)
      return new XMLNumberedParaContext(this.target, attributes, this.lists);
    if (element === XMLToken.TEXT_LIST)
      return new XMLTextListBlockContext(this.target, attributes, this.lists);
    if (element === XMLToken.TABLE_TABLE) {
      if ("beginTable" in this.target)
        return new XMLTableContext(this.target as XMLTableImportTarget, attributes, this);
      return null;
    }
    if (element === XMLToken.TEXT_SEQUENCE_DECLS && type === "Body")
      return new SvXMLIgnoreContext(true);
    if (element === XMLToken.TEXT_TABLE_OF_CONTENT && this.target.beginDocumentIndex)
      return new XMLIndexTOCContext(this, this.target.beginDocumentIndex.bind(this.target));
    if (
      (element === XMLToken.TEXT_SECTION || element === XMLToken.TEXT_INDEX_TITLE) &&
      this.target.beginTextSection
    )
      return new XMLSectionImportContext(this, this.target.beginTextSection.bind(this.target));
    return null;
  }
}

/** Applies an ODF heading level only when it differs from its assigned paragraph style. @param target - Paragraph property owner. @param level - ODF paragraph level. @returns Nothing. */
function applyParagraphOutlineLevel(target: XMLPropertySet, level: number): void {
  const name = xmlTextString("OutlineLevel");
  try {
    const inherited = target.getPropertyValue(name);
    try {
      const current: [number] = [0];
      if (!inherited.extract(current, "sal_Int16") || current[0] === level) return;
      const value = new Any([level], "sal_Int16");
      try {
        target.setPropertyValue(name, value);
      } finally {
        value.dispose();
      }
    } finally {
      inherited.dispose();
    }
  } finally {
    name.dispose();
  }
}
