/** @fileoverview Consumed DomainMapper_Impl property-context and body text-append ownership; all text mutations use existing native SwXText APIs. */
import type { DomainMapper } from "./DomainMapper";
import { toInt32 } from "../../../../o3tl/inc/string_view";
import type { SwXStyleFamily } from "../../core/unocore/unostyle";
import type { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import type { SwXText } from "../../core/unocore/unotext";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
import { SwXParagraph } from "../../core/unocore/unoparagraph";
import { PropertyMap, SectionPropertyMap, ParagraphPropertyMap } from "./PropertyMap";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { text } from "../../core/unocore/unocrsrhelper";
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
  private readonly styleSheetTable = new StyleSheetTable();
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
  /** Finishes the actual paragraph through XParagraphAppend, preserving style-first property order. @param properties - Paragraph map. @returns Nothing. */
  finishParagraph(properties: PropertyMap | null): void {
    const paragraph = this.body.finishParagraph(properties?.GetPropertyValues() ?? []);
    paragraph.Release();
    this.appendedParagraph = true;
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
    this.styleSheetTable.dispose();
  }
}

import { SourceDocumentType } from "../inc/dmapper/DomainMapperFactory";
