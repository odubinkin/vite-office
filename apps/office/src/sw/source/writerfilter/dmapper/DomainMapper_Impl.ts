/** @fileoverview Consumed DomainMapper_Impl property-context and body text-append ownership; all text mutations use existing native SwXText APIs. */
import type { DomainMapper } from "./DomainMapper";
import type { SwStartNode } from "../../core/docnode/node";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  BorderLine2,
  cppu_detail_getUnoType_BorderLine2,
} from "../../../../offapi/com/sun/star/table/BorderLine2";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import type { SwXStyleFamily } from "../../core/unocore/unostyle";
import type { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import type { SwXText } from "../../core/unocore/unotext";
import { StreamState } from "./DomainMapper_Impl.stream";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SwXParagraph } from "../../core/unocore/unoparagraph";
import { PropertyMap, SectionPropertyMap, ParagraphPropertyMap } from "./PropertyMap";
import { Sequence } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../../udkapi/com/sun/star/beans/NamedValue";
import { PropertyValue } from "../../../../udkapi/com/sun/star/beans/PropertyValue";
import { listAutoFormatType } from "../../core/unocore/unoobj-listautofmt";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text, unicode } from "../../core/unocore/unocrsrhelper";
import { PropertyIds as P, getPropertyName, isCharacterProperty } from "./PropertyIds";
import { StyleSheetTable, type StyleSheetEntry } from "./StyleSheetTable";
import { NS_ooxml } from "../inc/ooxml/resourceids";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { LineNumberPosition } from "../../../inc/lineinfo";
import {
  LineSpacing,
  cppu_detail_getUnoType_LineSpacing as lineSpacingType,
} from "../../../../offapi/com/sun/star/style/LineSpacing";
import * as LineSpacingMode from "../../../../offapi/com/sun/star/style/LineSpacingMode";
import { FieldControl, type Value } from "../inc/dmapper/resourcemodel";
import { CurrentTextPosition, FieldContext } from "./FieldContext";
import { SwPaM } from "../../core/crsr/pam";
import { SwXBookmark } from "../../core/unocore/unobkm";
import { SwXTextRange } from "../../core/unocore/unoobj2";

/** Original ContextType declaration order. */
export enum ContextType {
  CONTEXT_SECTION = 0,
  CONTEXT_PARAGRAPH = 1,
  CONTEXT_CHARACTER = 2,
  CONTEXT_STYLESHEET = 3,
  CONTEXT_LIST = 4,
}
/** Original page-margin element order. */
export enum PageMarElement {
  PAGE_MAR_TOP,
  PAGE_MAR_RIGHT,
  PAGE_MAR_BOTTOM,
  PAGE_MAR_LEFT,
  PAGE_MAR_HEADER,
  PAGE_MAR_FOOTER,
  PAGE_MAR_GUTTER,
}
/** Original mapper page-margin defaults in mm100. */
export class PageMar {
  top = Number(convertTwipToMm100(1440n));
  right = Number(convertTwipToMm100(1440n));
  bottom = this.top;
  left = this.right;
  header = Number(convertTwipToMm100(720n));
  footer = this.header;
  gutter = 0;
}
/** A native context entry borrows supplied style maps and owns maps created by PushProperties. */
interface Context {
  readonly type: ContextType;
  readonly properties: PropertyMap;
  readonly owned: boolean;
  readonly sectionReference?: SvRef<SectionPropertyMap>;
}

/** Original mapper-wide line-number settings passed across section property groups. */
interface LineNumberSettings {
  readonly nDistance: number;
  readonly nInterval: number;
  readonly bRestartAtEachPage: boolean;
}

/** Native context/body responsibility; section, list and table managers extend this same owner as their consumed operations are ported. */
export class DomainMapper_Impl {
  private m_pSettingsTable: SettingsTable | null = null;
  /** Original document settings owner. @returns Actual table. */
  GetSettingsTable(): SettingsTable {
    return (this.m_pSettingsTable ??= new SettingsTable(this.m_rDMapper));
  }
  /** Applies the native text defaults when the settings table has been resolved. @returns Nothing. */
  ApplySettingsTable(): void {
    const name = unicode("TabStopDistance");
    const value = new Any([this.GetSettingsTable().GetDefaultTabStop()], "sal_Int32");
    try {
      this.model.createTextDefaults().setPropertyValue(name, value);
    } finally {
      value.dispose();
      name.dispose();
    }
  }
  private readonly m_pLastSectionContext = new SvRef<SectionPropertyMap>();
  private m_bParaSectpr = false;
  /** Borrows the original last top-level section context. @returns Previous section or null. */
  GetLastSectionContext(): SectionPropertyMap | null {
    return this.m_pLastSectionContext.get();
  }
  /** Original paragraph sectPr context flag. @param value - Flag. @returns Nothing. */
  SetParaSectpr(value: boolean): void {
    this.m_bParaSectpr = value;
  }
  /** Original paragraph sectPr context flag. @returns Flag. */
  GetParaSectpr(): boolean {
    return this.m_bParaSectpr;
  }
  private m_aPageMargins = new PageMar();
  /** Original pgMar reset, independent of previous section or document geometry. @returns Nothing. */
  InitPageMargins(): void {
    this.m_aPageMargins = new PageMar();
  }
  /** Original borrowed margin values. @returns Actual current fields. */
  GetPageMargins(): Readonly<PageMar> {
    return this.m_aPageMargins;
  }
  /** Updates the active section's first-page layout flag. @param value - Title page enabled. @returns Nothing. */
  SetTitlePage(value: boolean): void {
    const section = this.GetTopContextOfType(ContextType.CONTEXT_SECTION);
    if (section instanceof SectionPropertyMap) section.SetTitlePage(value);
  }
  /** Applies Word's signed twip spacing to the original signed short UNO property. @param context - Active character or style properties. @param twips - Word character spacing. @returns Nothing. */
  SetCharacterKerning(context: PropertyMap, twips: number): void {
    const spacing = new Any([(convertTwipToMm100_Limited(twips) << 16) >> 16], "sal_Int16");
    try {
      context.Insert(P.PROP_CHAR_CHAR_KERNING, spacing);
    } finally {
      spacing.dispose();
    }
  }
  /** Original limited twip conversion and selected margin assignment. @param element - Native field selector. @param value - Twips. @returns Nothing. */
  SetPageMarginTwip(element: PageMarElement, value: number): void {
    const name = (["top", "right", "bottom", "left", "header", "footer", "gutter"] as const)[
      element
    ];
    if (name !== undefined) this.m_aPageMargins[name] = convertTwipToMm100_Limited(value);
  }
  private m_aLineNumberSettings: LineNumberSettings = {
    nDistance: -1,
    nInterval: 0,
    bRestartAtEachPage: true,
  };
  private m_bLineNumberingSet = false;
  /** Reads the native mapper-wide line-number settings. @returns Current immutable settings. */
  GetLineNumberSettings(): LineNumberSettings {
    return this.m_aLineNumberSettings;
  }
  /** Saves the updated global settings while retaining the active section properties. @param settings - Original line-number settings. @returns Nothing. */
  SetLineNumberSettings(settings: LineNumberSettings): void {
    this.m_aLineNumberSettings = settings;
  }
  /** Applies the original line number properties to their native document service in source order. @param values - Typed property and value tuples. @returns Nothing. */
  private ApplyLineNumberProperties(
    values: readonly (readonly [P, number | boolean, "bool" | "sal_Int16" | "sal_Int32"])[],
  ): void {
    const properties = this.GetTextDocument().getLineNumberingProperties();
    try {
      for (const [property, value, type] of values) {
        const item = new Any([value], type);
        try {
          properties.setPropertyValue(getPropertyName(property), item);
        } finally {
          item.dispose();
        }
      }
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
    }
  }
  /** Publishes each actual lnNumType group through the original global document property owner. @param section - Actual section context when available. @returns Nothing. */
  ApplyLineNumberSettings(section?: SectionPropertyMap): void {
    const { nInterval, nDistance, bRestartAtEachPage } = this.GetLineNumberSettings();
    if (!nInterval) {
      this.ApplyLineNumberProperties([[P.PROP_IS_ON, false, "bool"]]);
      return;
    }
    this.ApplyLineNumberProperties([
      [P.PROP_IS_ON, true, "bool"],
      [P.PROP_INTERVAL, (nInterval << 16) >> 16, "sal_Int16"],
      [P.PROP_DISTANCE, nDistance === -1 ? 500 : nDistance, "sal_Int32"],
      [P.PROP_RESTART_AT_EACH_PAGE, bRestartAtEachPage, "bool"],
    ]);
    if (nDistance === -1) section?.SetdxaLnn(283);
  }
  /** Finalizes source section line numbering and the imported header and footer style count flags. @param interval - Section interval. @param restart - Original restart token. @param distance - Section twips. @returns Nothing. */
  SetLineNumbering(interval: number, restart: number, distance: number): void {
    if (!this.m_bLineNumberingSet)
      this.ApplyLineNumberProperties([
        [P.PROP_IS_ON, true, "bool"],
        [P.PROP_COUNT_EMPTY_LINES, true, "bool"],
        [P.PROP_COUNT_LINES_IN_FRAMES, false, "bool"],
        [P.PROP_INTERVAL, (interval << 16) >> 16, "sal_Int16"],
        [P.PROP_DISTANCE, convertTwipToMm100_Limited(distance), "sal_Int32"],
        [P.PROP_NUMBER_POSITION, LineNumberPosition.Left, "sal_Int16"],
        [
          P.PROP_RESTART_AT_EACH_PAGE,
          restart === NS_ooxml.LN_Value_ST_LineNumberRestart_newPage,
          "bool",
        ],
      ]);
    this.m_bLineNumberingSet = true;
    const family = unicode("ParagraphStyles");
    try {
      const styles = this.model.getStyleFamilies().getByName(family);
      for (const name of ["Header", "Footer"]) {
        const entry = this.GetStyleSheetTable().FindStyleSheetByISTD(name);
        if (!entry?.m_pProperties) continue;
        const key = unicode(name);
        try {
          if (!styles.hasByName(key)) continue;
          const style = styles.getStyleByName(key);
          const counted = new Any(entry.m_pProperties.props().GetListId() >= 0);
          try {
            style.setPropertyValue(getPropertyName(P.PROP_PARA_LINE_NUMBER_COUNT), counted);
          } finally {
            counted.dispose();
            style.dispose();
          }
        } finally {
          key.dispose();
        }
      }
    } finally {
      family.dispose();
    }
  }
  private m_bIsFirstSection = true;
  private m_xPageStyles: SwXStyleFamily | undefined;
  private m_xNextUnusedPageStyleNo: number | undefined;
  private readonly contexts: Context[] = [];
  private readonly m_StreamStateStack: StreamState[] = [];
  /** Borrows the original active substream. @returns Current native stream state. */
  private GetStreamState(): StreamState {
    const state = this.m_StreamStateStack.at(-1);
    if (!state) throw new Error("assert(!m_StreamStateStack.empty())");
    return state;
  }
  /** Original active XTextAppend owner. @returns Current destination text. */
  get body(): SwXText {
    return this.GetStreamState().text;
  }
  /** Resolves resource callbacks with a fresh native text/stream state. @param text - Actual destination. @param resolve - Nested SAX dispatch. @returns Nothing. */
  WithTextAppend(text: SwXText, resolve: () => void): void {
    const state = new StreamState(text);
    this.m_StreamStateStack.push(state);
    try {
      resolve();
      this.RemoveLastParagraph();
    } finally {
      this.m_StreamStateStack.pop();
      state.dispose();
    }
  }

  /** Receives the native bookmark name and the paired range ID. @param id - Source attribute ID. @param value - Source value. @returns Whether consumed. */
  HandleBookmarkAttribute(id: number, value: Value): boolean {
    if (id !== NS_ooxml.LN_CT_Bookmark_name && id !== NS_ooxml.LN_CT_MarkupRangeBookmark_id)
      return false;
    const name = value.getString();
    try {
      if (id === NS_ooxml.LN_CT_Bookmark_name) {
        const entry = this.GetStreamState().bookmarks.get(this.GetStreamState().currentBookmarkId);
        if (entry) entry.name = text(name);
        else this.GetStreamState().currentBookmarkName = text(name);
      } else this.StartOrEndBookmark(text(name));
    } finally {
      name.dispose();
    }
    return true;
  }

  /** Pairs the Word marker ID and inserts the resulting native selection as a bookmark. @param id - Word range ID. @returns Nothing. */
  private StartOrEndBookmark(id: string): void {
    const position = CurrentTextPosition(this.body);
    if (!position) return;
    const opening = this.GetStreamState().bookmarks.get(id);
    if (!opening) {
      this.GetStreamState().currentBookmarkId = id;
      this.GetStreamState().bookmarks.set(id, {
        name: this.GetStreamState().currentBookmarkName,
        position,
      });
      this.GetStreamState().currentBookmarkName = "";
      return;
    }
    this.GetStreamState().bookmarks.delete(id);
    this.GetStreamState().currentBookmarkId = "";
    try {
      if (
        this.m_StreamStateStack.at(-1)?.bIsOutsideAParagraph &&
        position.GetContentIndex() === 0
      ) {
        const previous = this.body.GetTextNodes().at(-2);
        if (
          previous &&
          position.GetNode().FindTableBoxStartNode() === previous.FindTableBoxStartNode()
        )
          position.Assign(previous, previous.Len());
      }
      const expanded = opening.position.compare(position) !== 0;
      const bookmark = new SwXBookmark();
      const name = unicode(opening.name);
      const selection = new SwPaM(position, expanded ? opening.position : undefined);
      const range = new SwXTextRange(selection, this.body);
      try {
        bookmark.setName(name);
        this.body.insertTextContent(range, bookmark, expanded);
      } finally {
        range.dispose();
        selection.Dispose();
        name.dispose();
      }
    } finally {
      opening.position.Dispose();
      position.Dispose();
    }
  }

  /** Handles native field delimiters and keeps the display text of unknown fields. @param control - Byte control. @returns Whether consumed. */
  HandleFieldControl(control: number | undefined): boolean {
    const field = this.GetStreamState().fields.at(-1);
    switch (control) {
      case FieldControl.Start: {
        const next = CurrentTextPosition(this.body);
        if (next) this.GetStreamState().fields.push(new FieldContext(next));
        return true;
      }
      case FieldControl.Separator:
        if (field) field.completed = true;
        return true;
      case FieldControl.Lock:
        return true;
      case FieldControl.End:
        if (field) {
          this.GetStreamState().fields.pop();
          try {
            if (field.completed) field.ApplyResult(this.body);
          } finally {
            field.dispose();
          }
        }
        return true;
      default:
        return false;
    }
  }
  private spacingHadLine = false;
  private spacingHadLineRule = false;
  private readonly styleSheetTable = new StyleSheetTable(this);
  private defaultParaStyleName = "";
  private currentParaStyleName = "";
  private inStyleSheetImport = false;
  private m_bInDocDefaultsImport = false;
  /** Retains the source stream boundary independently of property-stack lifetime. @param value - Whether paragraph content has ended. @returns Nothing. */
  private SetIsOutsideAParagraph(value: boolean): void {
    const stream = this.m_StreamStateStack.at(-1);
    if (stream) stream.bIsOutsideAParagraph = value;
  }
  private readonly m_aRtfParagraphs = new Map<SwStartNode, SwTextNode>();
  private m_pRtfPreviousParagraph: SwTextNode | undefined;

  /** Selects the previous paragraph in the current materialized text stream. @param node - Current RTF paragraph. @returns Nothing. */
  SetRtfParagraphNode(node: SwTextNode): void {
    const section = node.StartOfSectionNode();
    this.m_pRtfPreviousParagraph = this.m_aRtfParagraphs.get(section);
    this.m_aRtfParagraphs.set(section, node);
  }

  /** Implements the source previous-paragraph bottom-edge removal for consecutive between borders. @returns Whether the current border can become a top edge. */
  handlePreviousParagraphBorderInBetween(): boolean {
    const node = this.m_pRtfPreviousParagraph;
    if (!node || this.IsStyleSheetImport()) return false;
    const paragraph = new SwXParagraph(node, this.body);
    const connect = paragraph.getPropertyValue(getPropertyName(P.PROP_PARA_CONNECT_BORDERS));
    try {
      const flag: [boolean] = [true];
      connect.extract(flag, "bool");
      if (flag[0]) return false;
      const empty = new Any(new BorderLine2(), cppu_detail_getUnoType_BorderLine2);
      try {
        paragraph.setPropertyValue(getPropertyName(P.PROP_BOTTOM_BORDER), empty);
      } finally {
        empty.dispose();
      }
      return true;
    } finally {
      connect.dispose();
      paragraph.Release();
    }
  }
  /** Borrows actual Writer model/text interfaces. @param m_rDMapper - Original mapper callback owner. @param model - Destination model. @param m_eDocumentType - Original immutable source-format field. @param m_bIsNewDoc - Whether the filter owns a new document. @returns Mapper state. */
  constructor(
    private readonly m_rDMapper: DomainMapper,
    readonly model: SwXTextDocument,
    private readonly m_eDocumentType: SourceDocumentType,
    private readonly m_bIsNewDoc: boolean,
  ) {
    this.m_StreamStateStack.push(new StreamState(model.getText()));
  }
  /** Original document-default phase. @param value - Import phase. @returns Nothing. */
  SetDocDefaultsImport(value: boolean): void {
    this.m_bInDocDefaultsImport = value;
  }
  private m_pListTable: ListsManager | undefined;
  private m_bInNumberingImport = false;
  private readonly m_aListOverrideApplied = new Set<number>();
  private m_bInAnyTableImport = false;
  /** Original lazy numbering manager belongs to this import owner. @returns Actual manager. */
  GetListTable(): ListsManager {
    return (this.m_pListTable ??= new ListsManager(this.m_rDMapper));
  }
  /** Original list-style query uses the actual concrete definition. @param id - Concrete ID. @returns Owned native name. */
  GetListStyleName(id: number): OUString {
    return unicode(this.GetListTable().GetList(id)?.GetStyleName() ?? "");
  }
  /** Original direct/style metadata level lookup. @param entry - Native style. @param paragraph - Optional direct context. @returns Signed level. */
  GetListLevel(entry: StyleSheetEntry | null, paragraph?: ParagraphPropertyMap): number {
    return GetListLevel.call(this, entry, paragraph);
  }
  /** Original style-level conflict validation. @param id - Native identifier. @returns Nothing. */
  ValidateListLevel(id: string): void {
    ValidateListLevel.call(this, id);
  }
  /** Original numbering phase before applying a paragraph property vector. @param properties - Native paragraph map. @param remove - Original removal flag. @param noNumbering - Original cancellation flag. @returns Original finish locals. */
  PrepareParagraphNumbering(
    properties: ParagraphPropertyMap | null,
    remove = false,
    noNumbering = false,
  ): ParagraphNumbering {
    return PrepareParagraphNumbering.call(this, properties, remove, noNumbering);
  }
  /** Original numbering phase after creation/property application. @param paragraph - Actual paragraph API. @param properties - Native paragraph map. @param numbering - Original locals. @returns Nothing. */
  FinishParagraphNumbering(
    paragraph: SwXParagraph,
    properties: ParagraphPropertyMap | null,
    numbering: ParagraphNumbering,
  ): void {
    FinishParagraphNumbering.call(
      this,
      paragraph,
      properties,
      numbering,
      this.m_aListOverrideApplied,
    );
  }
  /** Native named numbering-style property lookup. @param id - Concrete list. @param level - Original index. @param property - Native name. @returns Signed32 result. */
  getNumberingProperty(id: number, level: number, property: string): number {
    return getNumberingProperty.call(this, id, level, property);
  }
  /** Native property lookup on the directly applied numbering service and level in the top context. @param property - Native name. @returns Signed32 value or zero. */
  getCurrentNumberingProperty(property: string): number {
    return getCurrentNumberingProperty.call(this, property);
  }
  /** Original numbering-table phase. @param value - Phase state. @returns Nothing. */
  SetNumberingImport(value: boolean): void {
    this.m_bInNumberingImport = value;
  }
  /** Native numbering phase query. @returns Phase state. */
  IsNumberingImport(): boolean {
    return this.m_bInNumberingImport;
  }
  /** Original any-resource-table phase. @param value - Phase state. @returns Nothing. */
  SetAnyTableImport(value: boolean): void {
    this.m_bInAnyTableImport = value;
  }
  /** Native any-table phase query. @returns Phase state. */
  IsAnyTableImport(): boolean {
    return this.m_bInAnyTableImport;
  }
  /** Original document-default query. @returns Import phase. */
  IsDocDefaultsImport(): boolean {
    return this.m_bInDocDefaultsImport;
  }
  /** Original current context type. @returns Native enum. */
  GetTopContextType(): ContextType {
    const current = this.contexts.at(-1);
    if (!current) throw new Error("assert(!m_aContextStack.empty())");
    return current.type;
  }
  /** Native last-write deferred property copy in the current stream. @param id - Resource identity. @param value - Borrowed native value. @returns Nothing. */
  deferCharacterProperty(id: number, value: Any): void {
    const stream = this.m_StreamStateStack.at(-1);
    if (!stream) throw new Error("assert(!m_StreamStateStack.empty())");
    const values = stream.deferredCharacterProperties;
    values.get(id)?.dispose();
    values.set(id, new Any(value));
  }
  /** Original flush delegates calculation back to the mapper before clearing native Any owners. @param charContext - Original context assertion selector. @returns Nothing. */
  processDeferredCharacterProperties(charContext = true): void {
    const stream = this.m_StreamStateStack.at(-1);
    if (!stream) throw new Error("assert(!m_StreamStateStack.empty())");
    const values = stream.deferredCharacterProperties;
    if (values.size) {
      this.m_rDMapper.processDeferredCharacterProperties(values, charContext);
      for (const value of values.values()) value.dispose();
      values.clear();
    }
  }
  /** Original immutable source-format query. @returns Whether RTF. */
  IsRTFImport(): boolean {
    return this.m_eDocumentType === SourceDocumentType.RTF;
  }
  /** Original immutable source-format query. @returns Whether OOXML. */
  IsOOXMLImport(): boolean {
    return this.m_eDocumentType === SourceDocumentType.OOXML;
  }
  /** Original insertion-mode guard used by page-story import. @returns Whether this is a new document. */
  IsNewDoc(): boolean {
    return this.m_bIsNewDoc;
  }
  /** Original stylesheet phase query. @returns Whether importing a style. */
  IsStyleSheetImport(): boolean {
    return this.inStyleSheetImport;
  }
  /** Original borrowed document supplier. @returns Actual model. */
  GetTextDocument(): SwXTextDocument {
    return this.model;
  }
  /** Original lazy page-style-family cache borrows actual document styles. @returns Actual family. */
  GetPageStyles(): SwXStyleFamily {
    return (this.m_xPageStyles ??= this.model.getStyleFamilies().GetPageStyles());
  }
  /** Original scan-once Converted suffix allocator retains native signed32 prefix parsing. @returns Owned programmatic name. */
  GetUnusedPageStyleName(): OUString {
    if (this.m_xNextUnusedPageStyleNo === undefined) {
      let maximum = 0;
      for (const name of this.GetPageStyles().getElementNames())
        if (name.startsWith("Converted")) {
          const suffix = name.slice(9),
            units = new Uint16Array(suffix.length);
          for (let index = 0; index < suffix.length; ++index)
            units[index] = suffix.charCodeAt(index);
          const value = toInt32(units);
          if (value > maximum) maximum = value;
        }
      this.m_xNextUnusedPageStyleNo = maximum + 1;
    }
    const name = "Converted" + this.m_xNextUnusedPageStyleNo++;
    const units = new Uint16Array(name.length);
    for (let index = 0; index < name.length; ++index) units[index] = name.charCodeAt(index);
    return new OUString(units, units.length);
  }
  private m_xCharacterStyles: SwXStyleFamily | undefined;
  private m_xNextUnusedCharacterStyleNo: number | undefined;
  /** Original lazy actual character-style family. @returns Borrowed family. */
  GetCharacterStyles(): SwXStyleFamily {
    return (this.m_xCharacterStyles ??= this.model.getStyleFamilies().GetCharacterStyles());
  }
  /** Original scan-once ListLabel suffix allocator, including signed prefix parsing. @returns Owned name. */
  GetUnusedCharacterStyleName(): OUString {
    if (this.m_xNextUnusedCharacterStyleNo === undefined) {
      let maximum = 0;
      for (const name of this.GetCharacterStyles().getElementNames())
        if (name.startsWith("ListLabel ")) {
          const suffix = name.slice(10),
            units = new Uint16Array(suffix.length);
          for (let index = 0; index < suffix.length; ++index)
            units[index] = suffix.charCodeAt(index);
          const value = toInt32(units);
          if (value > 0 && value > maximum) maximum = value;
        }
      this.m_xNextUnusedCharacterStyleNo = maximum + 1;
    }
    const name = "ListLabel " + this.m_xNextUnusedCharacterStyleNo++;
    const units = new Uint16Array(name.length);
    for (let index = 0; index < name.length; ++index) units[index] = name.charCodeAt(index);
    return new OUString(units, units.length);
  }
  /** Original list context borrows the supplied native level map. @param properties - Actual level. @returns Nothing. */
  PushListProperties(properties: PropertyMap): void {
    this.contexts.push({ type: ContextType.CONTEXT_LIST, properties, owned: false });
  }
  /** Original context creation. @param type - Context type. @returns New map. */
  PushProperties(type: ContextType): PropertyMap {
    const properties =
      type === ContextType.CONTEXT_SECTION
        ? new SectionPropertyMap(this.m_bIsFirstSection)
        : type === ContextType.CONTEXT_PARAGRAPH
          ? new ParagraphPropertyMap()
          : new PropertyMap();
    if (type === ContextType.CONTEXT_SECTION) this.m_bIsFirstSection = false;
    if (type === ContextType.CONTEXT_PARAGRAPH) this.SetIsOutsideAParagraph(false);
    this.contexts.push({
      type,
      properties,
      owned: true,
      ...(properties instanceof SectionPropertyMap
        ? { sectionReference: new SvRef(properties) }
        : {}),
    });
    return properties;
  }
  /** Original style context retains the shared supplied map. @param properties - Shared map. @returns Nothing. */
  PushStyleProperties(properties: PropertyMap): void {
    this.contexts.push({ type: ContextType.CONTEXT_STYLESHEET, properties, owned: false });
  }
  /** Original context pop requires matching stream nesting. @param type - Expected type. @returns Nothing. */
  PopProperties(type: ContextType): void {
    const current = this.contexts.at(-1);
    if (!current || current.type !== type)
      throw new Error("DomainMapper context nesting is invalid.");
    if (
      type === ContextType.CONTEXT_SECTION &&
      this.contexts.filter(
        /** Counts the original section stack independently of paragraph/run contexts. @param entry - Actual stack entry. @returns Whether a section. */ (
          entry,
        ) => entry.type === ContextType.CONTEXT_SECTION,
      ).length === 1
    ) {
      if (!(current.properties instanceof SectionPropertyMap))
        throw new Error("assert(SectionPropertyMap)");
      this.m_pLastSectionContext.assign(current.properties);
    }
    this.contexts.pop();
    if (type === ContextType.CONTEXT_PARAGRAPH) this.SetIsOutsideAParagraph(true);
    if (current.sectionReference) current.sectionReference.clear();
    else if (current.owned) current.properties.dispose();
  }
  /** Original nullable current map. @returns Map or null. */ GetTopContext(): PropertyMap | null {
    return this.contexts.at(-1)?.properties ?? null;
  }
  /** Original type-specific innermost map lookup. @param type - Requested type. @returns Map or null. */
  GetTopContextOfType(type: ContextType): PropertyMap | null {
    for (let i = this.contexts.length - 1; i >= 0; --i) {
      const context = this.contexts[i] as Context;
      if (context.type === type) return context.properties;
    }
    return null;
  }
  /** Borrows original import stylesheet owner. @returns Table. */ GetStyleSheetTable(): StyleSheetTable {
    return this.styleSheetTable;
  }
  /** Native stylesheet-import mode controls current-entry lookup and default-name caching. @param importing - Import phase. @returns Nothing. */ SetStyleSheetImport(
    importing: boolean,
  ): void {
    this.inStyleSheetImport = importing;
  }
  /** Native stream-state paragraph style fallback. @param name - Converted style name. @returns Nothing. */ SetCurrentParaStyleName(
    name: string,
  ): void {
    this.currentParaStyleName = name;
  }
  /** Original default paragraph style cache remains unset while importing styles. @returns Converted default name. */
  GetDefaultParaStyleName(): string {
    if (this.defaultParaStyleName === "") {
      const entry = this.styleSheetTable.FindDefaultParaStyle();
      if (entry && entry.m_sConvertedStyleName !== "") {
        if (!this.inStyleSheetImport) this.defaultParaStyleName = entry.m_sConvertedStyleName;
        return entry.m_sConvertedStyleName;
      }
      return "Standard";
    }
    return this.defaultParaStyleName;
  }
  /** Original body current style uses paragraph context, then saved fallback, then imported default. @returns Converted style name. */
  GetCurrentParaStyleName(): string {
    let name = this.currentParaStyleName;
    const property = this.GetTopContextOfType(ContextType.CONTEXT_PARAGRAPH)?.getProperty(
      P.PROP_PARA_STYLE_NAME,
    );
    if (property) {
      const value = new OUString();
      try {
        if (property[1].extract(value, "OUString")) name = text(value);
      } finally {
        value.dispose();
        property[1].dispose();
      }
    }
    if (!this.inStyleSheetImport && name === "") name = this.GetDefaultParaStyleName();
    return name;
  }
  /** Native imported-style inheritance, self-parent guard and paragraph-before-character DocDefaults precedence. @param id - Native property. @param initial - First entry. @param docDefaults - Include document defaults. @param para - Paragraph context. @param isDocDefault - Optional native output flag. @returns Owned Any, void if absent. */
  GetPropertyFromStyleSheet(
    id: P,
    initial: StyleSheetEntry | null,
    docDefaults: boolean,
    para: boolean,
    isDocDefault?: [boolean],
  ): Any {
    let entry = initial;
    while (entry) {
      const property = entry.m_pProperties.getProperty(id);
      if (property) {
        if (isDocDefault) isDocDefault[0] = entry.m_pProperties.isDocDefault(id);
        return property[1];
      }
      const parent =
        entry.m_sBaseStyleIdentifier === ""
          ? null
          : this.styleSheetTable.FindStyleSheetByISTD(entry.m_sBaseStyleIdentifier);
      if (entry === parent) break;
      entry = parent;
    }
    if (docDefaults && para) {
      const property = this.styleSheetTable.GetDefaultParaProps().getProperty(id);
      if (property) {
        if (isDocDefault) isDocDefault[0] = true;
        return property[1];
      }
    }
    if (docDefaults && isCharacterProperty(id)) {
      const property = this.styleSheetTable.GetDefaultCharProps().getProperty(id);
      if (property) {
        if (isDocDefault) isDocDefault[0] = true;
        return property[1];
      }
    }
    if (isDocDefault) isDocDefault[0] = false;
    return new Any();
  }
  /** Clears the source line-attribute flags before resolving the current spacing property. @returns Nothing. */
  StartLineSpacing(): void {
    this.spacingHadLine = false;
    this.spacingHadLineRule = false;
  }
  /** Applies one source spacing attribute to the current native UNO LineSpacing property. @param id - Attribute identity. @param value - Native integer or rule token. @param negativeFlip - Source flag for inherited exact spacing. @returns Nothing. */
  SetLineSpacing(id: number, value: number, negativeFlip = true): void {
    const n = NS_ooxml,
      single = 240,
      singleMm100 = convertTwipToMm100_Limited(single),
      spacing = new LineSpacing(LineSpacingMode.FIX, singleMm100),
      context = this.GetTopContext();
    const current = context?.getProperty(P.PROP_PARA_LINE_SPACING)?.[1];
    try {
      current?.extract(spacing, lineSpacingType);
    } finally {
      current?.dispose();
    }
    if (id === n.LN_CT_Spacing_line) {
      this.spacingHadLine = true;
      const amount =
        spacing.Mode === LineSpacingMode.PROP
          ? Math.sign(value) * Math.round(Math.abs((value * 100) / single))
          : convertTwipToMm100_Limited(value);
      spacing.Height = (amount << 16) >> 16;
    } else {
      this.spacingHadLineRule = true;
      if (value === n.LN_Value_doc_ST_LineSpacingRule_auto) {
        if (spacing.Mode !== LineSpacingMode.PROP) {
          if (spacing.Height >= 0) {
            spacing.Mode = LineSpacingMode.PROP;
            spacing.Height = (Math.round((spacing.Height * 100) / singleMm100) << 16) >> 16;
          } else {
            spacing.Mode = LineSpacingMode.FIX;
            spacing.Height = -spacing.Height;
          }
        }
      } else if (value === n.LN_Value_doc_ST_LineSpacingRule_atLeast) {
        spacing.Mode = spacing.Height < 0 ? LineSpacingMode.FIX : LineSpacingMode.MINIMUM;
        spacing.Height = Math.abs(spacing.Height);
      } else if (spacing.Height < 0) {
        if (negativeFlip) spacing.Mode = LineSpacingMode.MINIMUM;
        spacing.Height = -spacing.Height;
      } else spacing.Mode = LineSpacingMode.FIX;
    }
    if (context) {
      const item = new Any(spacing, lineSpacingType);
      try {
        context.Insert(P.PROP_PARA_LINE_SPACING, item);
      } finally {
        item.dispose();
      }
    }
  }
  /** Reinterprets line-only values using the inherited rule or Word's automatic default. @returns Nothing. */
  FinishLineSpacing(): void {
    if (!this.spacingHadLine || this.spacingHadLineRule) return;
    const currentStyle = this.styleSheetTable.GetCurrentEntry();
    const entry = this.inStyleSheetImport
      ? this.styleSheetTable.FindStyleSheetByISTD(currentStyle?.m_sBaseStyleIdentifier ?? "")
      : this.styleSheetTable.FindStyleSheetByConvertedStyleName(this.GetCurrentParaStyleName());
    const spacing = new LineSpacing();
    const inherited = this.GetPropertyFromStyleSheet(
      P.PROP_PARA_LINE_SPACING,
      entry,
      !this.IsDocDefaultsImport(),
      true,
    );
    const n = NS_ooxml;
    try {
      inherited.extract(spacing, lineSpacingType);
    } finally {
      inherited.dispose();
    }
    const rule =
      spacing.Mode === LineSpacingMode.FIX
        ? n.LN_Value_doc_ST_LineSpacingRule_exact
        : spacing.Mode === LineSpacingMode.MINIMUM
          ? n.LN_Value_doc_ST_LineSpacingRule_atLeast
          : n.LN_Value_doc_ST_LineSpacingRule_auto;
    this.SetLineSpacing(
      n.LN_CT_Spacing_lineRule,
      rule,
      rule !== n.LN_Value_doc_ST_LineSpacingRule_exact,
    );
  }
  /** Original style toggle lookup uses the imported current entry or the current paragraph's converted-name entry. @param id - Property. @returns Owned Any. */
  GetPropertyFromParaStyleSheet(id: P): Any {
    const entry = this.inStyleSheetImport
      ? this.styleSheetTable.GetCurrentEntry()
      : this.styleSheetTable.FindStyleSheetByConvertedStyleName(this.GetCurrentParaStyleName());
    return this.GetPropertyFromStyleSheet(id, entry, true, true);
  }
  /** Original character-style lookup excludes stylesheet phase, the style-name property itself and non-character properties. @param id - Property. @param context - Direct map. @returns Owned native value. */
  GetPropertyFromCharStyleSheet(id: P, context: PropertyMap | null): Any {
    if (this.inStyleSheetImport || id === P.PROP_CHAR_STYLE_NAME || !isCharacterProperty(id))
      return new Any();
    const name = new OUString(),
      value = this.GetAnyProperty(P.PROP_CHAR_STYLE_NAME, context);
    try {
      const entry = value.extract(name, "OUString")
        ? this.styleSheetTable.FindStyleSheetByConvertedStyleName(text(name))
        : null;
      return this.GetPropertyFromStyleSheet(id, entry, false, false);
    } finally {
      name.dispose();
      value.dispose();
    }
  }
  /** Original final property precedence: direct run, direct paragraph, character style, paragraph style and document defaults. @param id - Property. @param context - Direct map. @returns Owned native value. */
  GetAnyProperty(id: P, context: PropertyMap | null): Any {
    const direct = context?.getProperty(id);
    if (direct) return direct[1];
    const paragraph = this.GetTopContextOfType(ContextType.CONTEXT_PARAGRAPH);
    if (paragraph && paragraph !== context) {
      const property = paragraph.getProperty(id);
      if (property) return property[1];
    }
    if (id !== P.PROP_CHAR_STYLE_NAME && isCharacterProperty(id)) {
      const inherited = this.GetPropertyFromCharStyleSheet(id, context);
      if (inherited.hasValue()) return inherited;
      inherited.dispose();
    }
    return this.GetPropertyFromParaStyleSheet(id);
  }
  /** Appends through the canonical NOHINTEXPAND import API. @param value - Native text. @param properties - Current character map. @returns Nothing. */
  appendTextPortion(value: OUStringConstReference, properties: PropertyMap | null): void {
    const field = this.GetStreamState().fields.at(-1);
    if (field && !field.completed) {
      field.command += text(value);
      return;
    }
    if (value.getLength()) this.processDeferredCharacterProperties();
    const range = this.body.appendTextPortion(value, properties?.GetPropertyValues() ?? []);
    range.dispose();
  }
  /** Native finishParagraph extracts Char-prefixed values into ListAutoFormat while retaining the original direct properties. The caller owns this value vector. @param properties - Actual paragraph context. @returns Owned generated values. */
  GetParagraphPropertyValues(properties: PropertyMap | null): PropertyValue[] {
    const result = (properties?.GetPropertyValues() ?? []).map(
      /** Native vector copy owns its fields. @param value - Map value. @returns Independent copy. */ (
        value,
      ) => new PropertyValue(value),
    );
    const chars: NamedValue[] = [];
    try {
      for (const value of result)
        if (text(value.Name).startsWith("Char"))
          chars.push(new NamedValue(value.Name, value.Value));
      if (chars.length) {
        const Values = Sequence.specialize<NamedValue>(namedType, 32);
        const sequence = new Values(
          new Map(
            chars.map(
              /** Native compound element addresses. @param value - Value. @param index - Index. @returns Address pair. */ (
                value,
                index,
              ) => [index * 32, value],
            ),
          ),
          chars.length,
        );
        const name = new OUString(
          Uint16Array.from(
            "ListAutoFormat",
            /** Native ASCII unit. @param c - Character. @returns Unit. */ (c) => c.charCodeAt(0),
          ),
          14,
        );
        try {
          const value = new Any(sequence.getAddress(), listAutoFormatType);
          try {
            result.push(new PropertyValue(name, 0, value, 0));
          } finally {
            value.dispose();
          }
        } finally {
          name.dispose();
          sequence.dispose();
        }
      }
      return result;
    } catch (error) {
      for (const value of result) {
        value.Value.dispose();
        value.Name.dispose();
      }
      throw error;
    } finally {
      for (const value of chars) value.dispose();
    }
  }

  /** Finishes the actual paragraph through XParagraphAppend, preserving style-first property order. @param properties - Paragraph map. @returns Nothing. */
  finishParagraph(properties: PropertyMap | null): void {
    const context = properties instanceof ParagraphPropertyMap ? properties : null,
      numbering = this.PrepareParagraphNumbering(context),
      values = this.GetParagraphPropertyValues(properties);
    try {
      const paragraph = this.body.finishParagraph(values);
      try {
        if (this.IsOOXMLImport() && this.m_StreamStateStack.length === 1) {
          const section = this.GetTopContextOfType(ContextType.CONTEXT_SECTION);
          if (section instanceof SectionPropertyMap)
            section.SetStartingNode(paragraph.GetPaM().Start().GetNode().GetTextNode());
        }
        this.FinishParagraphNumbering(paragraph, context, numbering);
      } finally {
        paragraph.Release();
      }
      this.GetStreamState().appendedParagraph = true;
      this.SetIsOutsideAParagraph(true);
    } finally {
      for (const value of values) {
        value.Value.dispose();
        value.Name.dispose();
      }
    }
  }
  /** Original body trailing-paragraph deletion uses XComponent paragraph disposal rather than merging formatting into its predecessor. @returns Nothing. */
  RemoveLastParagraph(): void {
    if (!this.GetStreamState().appendedParagraph) return;
    const nodes = this.body.GetTextNodes(),
      last = nodes.at(-1);
    if (last && nodes.length > 1 && last.GetText() === "") {
      const paragraph = new SwXParagraph(last, this.body);
      paragraph.dispose();
      paragraph.Release();
    }
    this.GetStreamState().appendedParagraph = false;
  }
  /** Releases only filter-owned temporary maps; model lifetime remains external. @returns Nothing. */
  dispose(): void {
    while (this.contexts.length) {
      const context = this.contexts.pop() as Context;
      if (context.sectionReference) context.sectionReference.clear();
      else if (context.owned) context.properties.dispose();
    }
    for (const stream of this.m_StreamStateStack.splice(0)) stream.dispose();
    this.m_aRtfParagraphs.clear();
    this.m_pRtfPreviousParagraph = undefined;
    this.m_pLastSectionContext.clear();
    this.m_pListTable?.dispose();
    this.m_pListTable = undefined;
    this.m_pSettingsTable?.dispose();
    this.styleSheetTable.dispose();
  }
}

import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";

import { ListsManager } from "./NumberingManager";

import { GetListLevel, ValidateListLevel } from "./DomainMapper_Impl.numbering";

import {
  PrepareParagraphNumbering,
  FinishParagraphNumbering,
  getNumberingProperty,
  getCurrentNumberingProperty,
  type ParagraphNumbering,
} from "./DomainMapper_Impl.paragraph-numbering";

import { convertTwipToMm100_Limited } from "./ConversionHelper";

import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";

import { SvRef } from "../../../../tools/inc/ref";

import { SettingsTable } from "./SettingsTable";
