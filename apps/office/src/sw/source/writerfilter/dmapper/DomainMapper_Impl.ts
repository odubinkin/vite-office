/** @fileoverview Consumed DomainMapper_Impl property-context and body text-append ownership; all text mutations use existing native SwXText APIs. */
import type { DomainMapper } from "./DomainMapper";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import type { SwXStyleFamily } from "../../core/unocore/unostyle";
import type { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import type { SwXText } from "../../core/unocore/unotext";
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
import { PropertyIds as P, isCharacterProperty } from "./PropertyIds";
import { StyleSheetTable, type StyleSheetEntry } from "./StyleSheetTable";

/** Original ContextType declaration order. */
export enum ContextType {
  CONTEXT_SECTION = 0,
  CONTEXT_PARAGRAPH = 1,
  CONTEXT_CHARACTER = 2,
  CONTEXT_STYLESHEET = 3,
  CONTEXT_LIST = 4,
}
/** A native context entry borrows supplied style maps and owns maps created by PushProperties. */
interface Context {
  readonly type: ContextType;
  readonly properties: PropertyMap;
  readonly owned: boolean;
}

/** Native context/body responsibility; section, list and table managers extend this same owner as their consumed operations are ported. */
export class DomainMapper_Impl {
  private m_bIsFirstSection = true;
  private m_xPageStyles: SwXStyleFamily | undefined;
  private m_xNextUnusedPageStyleNo: number | undefined;
  private readonly contexts: Context[] = [];
  private readonly body: SwXText;
  private appendedParagraph = false;
  private readonly styleSheetTable = new StyleSheetTable(this);
  private defaultParaStyleName = "";
  private currentParaStyleName = "";
  private inStyleSheetImport = false;
  private m_bInDocDefaultsImport = false;
  /** Represented body stream; substream producers extend the original stack when consumed. */
  private readonly m_StreamStateStack = [{ deferredCharacterProperties: new Map<number, Any>() }];
  /** Borrows actual Writer model/text interfaces. @param m_rDMapper - Original mapper callback owner. @param model - Destination model. @param m_eDocumentType - Original immutable source-format field. @returns Mapper state. */
  constructor(
    private readonly m_rDMapper: DomainMapper,
    readonly model: SwXTextDocument,
    private readonly m_eDocumentType: SourceDocumentType,
  ) {
    this.body = model.getText();
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
    this.contexts.push({ type, properties, owned: true });
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
    this.contexts.pop();
    if (current.owned) current.properties.dispose();
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
        this.FinishParagraphNumbering(paragraph, context, numbering);
      } finally {
        paragraph.Release();
      }
      this.appendedParagraph = true;
    } finally {
      for (const value of values) {
        value.Value.dispose();
        value.Name.dispose();
      }
    }
  }
  /** Original body trailing-paragraph deletion uses XComponent paragraph disposal rather than merging formatting into its predecessor. @returns Nothing. */
  RemoveLastParagraph(): void {
    if (!this.appendedParagraph) return;
    const nodes = this.body.GetTextNodes(),
      last = nodes.at(-1);
    if (last && nodes.length > 1 && last.GetText() === "") {
      const paragraph = new SwXParagraph(last, this.body);
      paragraph.dispose();
      paragraph.Release();
    }
    this.appendedParagraph = false;
  }
  /** Releases only filter-owned temporary maps; model lifetime remains external. @returns Nothing. */
  dispose(): void {
    while (this.contexts.length) {
      const context = this.contexts.pop() as Context;
      if (context.owned) context.properties.dispose();
    }
    for (const stream of this.m_StreamStateStack)
      for (const value of stream.deferredCharacterProperties.values()) value.dispose();
    this.m_StreamStateStack.length = 0;
    this.m_pListTable?.dispose();
    this.m_pListTable = undefined;
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
