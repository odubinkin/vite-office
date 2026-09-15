/** @fileoverview Implements Writer's streaming SwXMLImport bridge over fast SAX contexts. */

import { SvxAdjust, SvxAdjustItem } from "../../../../editeng/source/items/paraitem";
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxFontItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import type { SfxPoolItem } from "../../../../svl/source/items/poolitem";
import type { OfficeDocument } from "../../../../sfx2/source/doc/objsh";
import {
  FastAttributeList,
  parseOdfXmlStream,
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type OdfXmlParseOptions,
  type SvXMLImport as SvXMLImportContract,
} from "../../../../xmloff/source/core/xml-parser";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import {
  XMLFontStylesContext,
  type XMLFontStylesImportTarget,
} from "../../../../xmloff/source/style/XMLFontStylesContext";
import { XMLStylesContext } from "../../../../xmloff/source/style/xmlstylei";
import type {
  OdfCharacterProperties,
  OdfParagraphAlignment,
  XMLParagraphStyle,
} from "../../../../xmloff/source/text/txtparae";
import {
  XMLTextBodyContext,
  type OdfStyleDefinition,
  type XMLParagraphImportTarget,
  type XMLParagraphListState,
  type XMLTextImportTarget,
  type XMLTextListRule,
} from "../../../../xmloff/source/text/txtparai";
import type { SwFormat } from "../../core/attr/format";
import { SwDoc } from "../../core/doc/doc";
import { SwNumFormat, SwNumRule } from "../../core/doc/number";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_FONT,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_PARATR_ADJUST,
} from "../../../inc/hintids";
import {
  getWriterOdfStyleName,
  getWriterStyleIdFromOdfName,
  WRITER_PARAGRAPH_STYLE_POOL,
} from "../../../inc/poolfmt";

const ignoredDocumentChildren = new Set([
  XMLToken.OFFICE_MASTER_STYLES,
  XMLToken.OFFICE_SETTINGS,
  XMLToken.OFFICE_SCRIPTS,
]);

const ignoredMetadataChildren = new Set([
  XMLToken.META_GENERATOR,
  XMLToken.META_INITIAL_CREATOR,
  XMLToken.META_CREATION_DATE,
  XMLToken.META_EDITING_CYCLES,
  XMLToken.META_EDITING_DURATION,
  XMLToken.META_DOCUMENT_STATISTIC,
  XMLToken.DC_CREATOR,
  XMLToken.DC_DATE,
]);

/** Imported model plus shell-owned lifecycle candidate. */
export interface ImportedWriterDocument {
  readonly document: SwDoc;
  readonly documentState: OfficeDocument;
}

/** Validates one expected ODF document root through the streaming parser. @param xml - XML stream. @param expectedRoot - Root local name. @param maxDepth - Optional depth ceiling. @returns Nothing. */
export function parseOdfXml(xml: string, expectedRoot: string, maxDepth?: number): void {
  const roots: Readonly<Record<string, XMLToken>> = {
    "document-content": XMLToken.OFFICE_DOCUMENT_CONTENT,
    "document-meta": XMLToken.OFFICE_DOCUMENT_META,
    "document-styles": XMLToken.OFFICE_DOCUMENT_STYLES,
  };
  const expected = roots[expectedRoot];
  if (expected === undefined) throw new Error(`ODF ${expectedRoot} XML is invalid.`);
  parseOdfXmlStream(
    xml,
    {
      /** Accepts only the requested root. @param element - Root token. @returns Ignore context or null. */
      createFastContext(element): SvXMLImportContext | null {
        return element === expected ? new SvXMLIgnoreContext() : null;
      },
      /** Rejects unknown roots. @returns Null. */
      createUnknownContext(): null {
        return null;
      },
    },
    maxDepth === undefined ? {} : { limits: { maxDepth } },
  );
}

/** Imports all package XML into one temporary canonical document. @param stylesXml - Named styles stream. @param contentXml - Content stream. @param metadata - Shell metadata. @param metaXml - Optional metadata stream. @param options - Parser controls. @returns Imported document candidate. */
export function importWriterXml(
  stylesXml: string,
  contentXml: string,
  metadata: OfficeDocument,
  metaXml?: string,
  options: OdfXmlParseOptions = {},
): ImportedWriterDocument {
  const xmlImport = new SwXMLImport(new SwDoc());
  xmlImport.parse(stylesXml, XMLToken.OFFICE_DOCUMENT_STYLES, options);
  xmlImport.finishNamedStyles();
  xmlImport.parse(contentXml, XMLToken.OFFICE_DOCUMENT_CONTENT, options);
  xmlImport.finishContent();
  if (metaXml !== undefined) xmlImport.parse(metaXml, XMLToken.OFFICE_DOCUMENT_META, options);
  return {
    document: xmlImport.document,
    documentState:
      xmlImport.title === undefined ? metadata : { ...metadata, title: xmlImport.title },
  };
}

/** Writer import coordinator matching upstream SwXMLImport context ownership. */
class SwXMLImport implements SvXMLImportContract, XMLTextImportTarget, XMLFontStylesImportTarget {
  private expectedRoot = XMLToken.UNKNOWN;
  private officeTextCount = 0;
  private paragraphCount = 0;
  private titleSeen = false;
  private readonly styles = new Map<string, OdfStyleDefinition>();
  private readonly listRules = new Map<string, XMLTextListRule>();
  private readonly fontFaces = new Map<string, string>();
  public title: string | undefined;

  /** Creates a coordinator around a temporary document. @param document - Temporary Writer model. @returns Coordinator. */
  public constructor(public readonly document: SwDoc) {}

  /** Parses one expected package stream. @param xml - XML text. @param expectedRoot - Required root token. @param options - Parser controls. @returns Nothing. */
  public parse(xml: string, expectedRoot: XMLToken, options: OdfXmlParseOptions): void {
    this.expectedRoot = expectedRoot;
    parseOdfXmlStream(xml, this, options);
  }

  /** Creates the root document context. @param element - Root token. @param attributes - Root attributes. @returns Root context or null. */
  public createFastContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== this.expectedRoot) return null;
    attributes.assertOnly([XMLToken.OFFICE_VERSION], "document root");
    return new SwXMLDocContext(this, element);
  }

  /** Rejects unknown document roots. @returns Null. */
  public createUnknownContext(): null {
    return null;
  }

  /** Resolves one imported style. @param styleName - ODF style name. @returns Style definition. */
  public getStyle(styleName: string): OdfStyleDefinition | undefined {
    return this.styles.get(styleName);
  }

  /** Resolves one imported font-face declaration. @param name - Face name. @returns Model family. */
  public getFontFace(name: string): string | undefined {
    return this.fontFaces.get(name);
  }

  /** Registers one imported font-face declaration. @param name - Face name. @param familyName - Model family. @returns Nothing. */
  public registerFontFace(name: string, familyName: string): void {
    const existing = this.fontFaces.get(name);
    if (existing !== undefined && existing !== familyName)
      throw new Error(`Conflicting ODF font face: ${name}`);
    this.fontFaces.set(name, familyName);
  }

  /** Resolves pinned built-in paragraph-style names without coupling xmloff to Writer. @param styleName - ODF name. @returns Model identity. */
  public resolveBuiltInParagraphStyle(styleName: string): string | undefined {
    return getWriterStyleIdFromOdfName(styleName);
  }

  /** Resolves one document-owned list rule. @param styleName - ODF list style name. @returns Rule view. */
  public getListRule(styleName: string): XMLTextListRule | undefined {
    return this.listRules.get(styleName);
  }

  /** Registers one parsed style. @param name - ODF style name. @param definition - Parsed definition. @returns Nothing. */
  public registerStyle(name: string, definition: OdfStyleDefinition): void {
    if (this.styles.has(name)) throw new Error(`Duplicate ODF style: ${name}`);
    this.styles.set(name, definition);
  }

  /** Registers one numbering definition in Writer. @param styleName - ODF style name. @param rule - Parsed rule. @returns Nothing. */
  public registerListStyle(styleName: string, rule: XMLTextListRule): void {
    if (this.listRules.has(styleName)) throw new Error(`Duplicate ODF list style: ${styleName}`);
    this.listRules.set(styleName, rule);
    const existing = this.document.FindNumRulePtr(rule.name);
    if (existing !== undefined) {
      if (
        rule.formats.some(
          /** Detects a conflicting canonical level. @param kind - Imported kind. @param level - Level. @returns Whether conflicting. */
          (kind, level) =>
            existing.GetNumFormat(level).GetKind() !== kind ||
            (kind === "bullet" &&
              existing.GetNumFormat(level).GetBulletChar() !== (rule.bulletChars?.[level] ?? "•")),
        )
      )
        throw new Error(`Conflicting ODF list rule: ${rule.name}`);
      return;
    }
    this.document.AddNumRule(
      new SwNumRule(
        rule.name,
        rule.formats.map(
          /** Creates one canonical level format. @param kind - Marker family. @param level - Zero-based level. @returns Writer format. */
          (kind, level) => new SwNumFormat(kind, rule.bulletChars?.[level]),
        ),
        rule.name,
      ),
    );
  }

  /** Opens the sole office:text context. @returns Text body context. */
  public registerOfficeText(): XMLTextBodyContext {
    this.officeTextCount += 1;
    if (this.officeTextCount > 1)
      throw new Error("ODF content must contain exactly one office:text.");
    return new XMLTextBodyContext(this);
  }

  /** Marks the single metadata title as encountered. @returns Nothing. */
  public startTitle(): void {
    if (this.titleSeen) throw new Error("ODF metadata contains duplicate titles.");
    this.titleSeen = true;
  }

  /** Creates and configures one canonical text node. @param style - Writer style. @param alignment - Direct alignment. @param properties - Direct character properties. @param list - Optional list state. @returns Paragraph target. */
  public createParagraph(
    style: XMLParagraphStyle,
    alignment: OdfParagraphAlignment | undefined,
    properties: Partial<OdfCharacterProperties> | undefined,
    list: XMLParagraphListState | undefined,
  ): XMLParagraphImportTarget {
    const node = this.document.nodes.MakeTextNode(`paragraph-${++this.paragraphCount}`);
    node.ChgFormatColl(this.document.GetTextFormatColl(style));
    if (alignment !== undefined) node.SetParagraphAlignment(alignment);
    if (list !== undefined) {
      /* v8 ignore next -- list contexts only expose rules registered in this same temporary document. */
      if (this.document.FindNumRulePtr(list.ruleName) === undefined)
        throw new Error(`Unsupported ODF list rule: ${list.ruleName}`);
      node.SetNumRule(list.ruleName);
      node.SetListId(list.listId);
      node.SetAttrListLevel(list.level);
    }
    if (properties !== undefined)
      putCharacterProperties(
        properties,
        /** Applies a direct paragraph item. @param item - Pooled item. @returns Set result. */
        (item) => node.SetAttr(item),
      );
    return new SwXMLParagraphTarget(node);
  }

  /** Applies imported named style state. @returns Nothing. */
  public finishNamedStyles(): void {
    applyNamedParagraphStyles(this.document, this.styles);
  }

  /** Validates body cardinality and supplies Writer's empty paragraph. @returns Nothing. */
  public finishContent(): void {
    if (this.officeTextCount !== 1)
      throw new Error("ODF content must contain exactly one office:text.");
    if (this.paragraphCount === 0) this.createParagraph("default", undefined, undefined, undefined);
  }
}

/** Applies SAX character callbacks directly to one canonical text node. */
class SwXMLParagraphTarget implements XMLParagraphImportTarget {
  /** Wraps one live text node. @param node - Canonical node. @returns Paragraph target. */
  public constructor(private readonly node: SwTextNode) {}

  /** Appends SAX text with effective attributes. @param text - Character data. @param properties - Effective formatting. @returns Nothing. */
  public appendText(text: string, properties: OdfCharacterProperties): void {
    this.node.InsertText(text, this.node.Len(), properties);
  }
}

/** Dispatches document-level elements like upstream SwXMLDocContext_Impl. */
class SwXMLDocContext extends SvXMLImportContext {
  /** Creates a document dispatcher. @param xmlImport - Import owner. @param root - Current root. @returns Context. */
  public constructor(
    private readonly xmlImport: SwXMLImport,
    private readonly root: XMLToken,
  ) {
    super();
  }

  /** Dispatches one document child. @param element - Child token. @param attributes - Child attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (
      element === XMLToken.OFFICE_FONT_FACE_DECLS &&
      (this.root === XMLToken.OFFICE_DOCUMENT_STYLES ||
        this.root === XMLToken.OFFICE_DOCUMENT_CONTENT)
    ) {
      attributes.assertOnly([], "font face declarations");
      return new XMLFontStylesContext(this.xmlImport);
    }
    if (
      (element === XMLToken.OFFICE_STYLES || element === XMLToken.OFFICE_AUTOMATIC_STYLES) &&
      (this.root === XMLToken.OFFICE_DOCUMENT_STYLES ||
        this.root === XMLToken.OFFICE_DOCUMENT_CONTENT)
    ) {
      attributes.assertOnly([], "styles container");
      return new XMLStylesContext(this.xmlImport);
    }
    if (element === XMLToken.OFFICE_BODY && this.root === XMLToken.OFFICE_DOCUMENT_CONTENT) {
      attributes.assertOnly([], "body");
      return new SwXMLBodyContext(this.xmlImport);
    }
    if (element === XMLToken.OFFICE_META && this.root === XMLToken.OFFICE_DOCUMENT_META) {
      attributes.assertOnly([], "metadata");
      return new XMLMetaContext(this.xmlImport);
    }
    if (ignoredDocumentChildren.has(element)) return new SvXMLIgnoreContext();
    return null;
  }
}

/** Owns the single office:text body child. */
class SwXMLBodyContext extends SvXMLImportContext {
  /** Creates a body context. @param xmlImport - Import owner. @returns Context. */
  public constructor(private readonly xmlImport: SwXMLImport) {
    super();
  }

  /** Creates the Writer text body context. @param element - Child token. @param attributes - Child attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.OFFICE_SPREADSHEET) return new SvXMLIgnoreContext();
    if (element !== XMLToken.OFFICE_TEXT) return null;
    attributes.assertOnly([], "text body");
    return this.xmlImport.registerOfficeText();
  }
}

/** Imports metadata while explicitly ignoring the known generator element. */
class XMLMetaContext extends SvXMLImportContext {
  /** Creates a metadata context. @param xmlImport - Import owner. @returns Context. */
  public constructor(private readonly xmlImport: SwXMLImport) {
    super();
  }

  /** Creates a supported metadata child. @param element - Child token. @param attributes - Child attributes. @returns Child context or null. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element === XMLToken.DC_TITLE) {
      attributes.assertOnly([], "metadata title");
      this.xmlImport.startTitle();
      return new XMLTitleContext(
        /** Commits the parsed title. @param title - Normalized title. @returns Nothing. */
        (title) => {
          this.xmlImport.title = title;
        },
      );
    }
    if (ignoredMetadataChildren.has(element)) return new SvXMLIgnoreContext();
    return null;
  }
}

/** Accumulates the bounded title element. */
class XMLTitleContext extends SvXMLImportContext {
  private value = "";
  /** Creates a title accumulator. @param commit - Completion callback. @returns Context. */
  public constructor(private readonly commit: (title: string) => void) {
    super();
  }
  /** Appends title characters. @param characters - Decoded text. @returns Nothing. */
  public override characters(characters: string): void {
    this.value += characters;
  }
  /** Commits a non-empty normalized title. @returns Nothing. */
  public override endFastElement(): void {
    const title = this.value.trim();
    if (title.length > 0) this.commit(title);
  }
}

/** Applies built-in named style state. @param document - Destination. @param styles - Parsed styles. @returns Nothing. */
function applyNamedParagraphStyles(
  document: SwDoc,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
): void {
  const standard = styles.get("Standard");
  if (standard?.family !== "paragraph")
    throw new Error("ODF Writer Standard paragraph style is missing.");
  for (const poolStyle of WRITER_PARAGRAPH_STYLE_POOL) {
    const definition = styles.get(getWriterOdfStyleName(poolStyle.id));
    if (definition === undefined) continue;
    if (definition.family !== "paragraph")
      throw new Error(`ODF Writer ${poolStyle.name} paragraph style is invalid.`);
    const expectedNext = getWriterOdfStyleName(poolStyle.followId);
    if (definition.nextStyleName !== undefined && definition.nextStyleName !== expectedNext)
      throw new Error(`ODF ${poolStyle.name} has an invalid next style.`);
    const collection = document.GetTextFormatColl(poolStyle.id);
    collection.SetDerivedFrom(undefined);
    if (definition.displayName !== undefined) collection.SetFormatName(definition.displayName);
    if (definition.alignment !== undefined)
      collection.SetFormatAttr(
        new SvxAdjustItem(toSvxAdjust(definition.alignment), RES_PARATR_ADJUST),
      );
    if (definition.properties !== undefined)
      putCharacterProperties(
        definition.properties,
        /** Applies one style item. @param item - Imported item. @returns Set result. */ (item) =>
          collection.SetFormatAttr(item),
      );
  }
  for (const poolStyle of WRITER_PARAGRAPH_STYLE_POOL) {
    const definition = styles.get(getWriterOdfStyleName(poolStyle.id));
    if (definition?.family !== "paragraph") continue;
    const collection = document.GetTextFormatColl(poolStyle.id);
    const parentId =
      definition.parentStyleName === undefined
        ? undefined
        : getWriterStyleIdFromOdfName(definition.parentStyleName);
    const parent = parentId === undefined ? undefined : document.GetTextFormatColl(parentId);
    if (parent === collection || derivesFrom(parent, collection)) continue;
    collection.SetDerivedFrom(parent);
  }
}

/** Detects whether assigning a parent would form an inheritance cycle. @param format - Candidate parent. @param ancestor - Style that must not occur in the parent chain. @returns Whether the candidate derives from the style. */
function derivesFrom(format: SwFormat | undefined, ancestor: SwFormat): boolean {
  for (let current = format; current !== undefined; current = current.DerivedFrom())
    if (current === ancestor) return true;
  return false;
}

/** Converts ODF character deltas into pooled items. @param properties - Property deltas. @param put - Item sink. @returns Nothing. */
function putCharacterProperties(
  properties: Partial<OdfCharacterProperties>,
  put: (item: SfxPoolItem) => unknown,
): void {
  if (properties.fontFamily !== undefined)
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      put(new SvxFontItem(properties.fontFamily, which));
  if (properties.bold !== undefined)
    for (const which of [RES_CHRATR_WEIGHT, RES_CHRATR_CJK_WEIGHT, RES_CHRATR_CTL_WEIGHT])
      put(new SvxWeightItem(properties.bold ? FontWeight.BOLD : FontWeight.NORMAL, which));
  if (properties.italic !== undefined)
    for (const which of [RES_CHRATR_POSTURE, RES_CHRATR_CJK_POSTURE, RES_CHRATR_CTL_POSTURE])
      put(new SvxPostureItem(properties.italic ? FontItalic.NORMAL : FontItalic.NONE, which));
  if (properties.underline !== undefined)
    put(
      new SvxUnderlineItem(
        properties.underline ? FontLineStyle.SINGLE : FontLineStyle.NONE,
        RES_CHRATR_UNDERLINE,
      ),
    );
}

/** Converts ODF alignment to Writer adjustment. @param alignment - ODF alignment. @returns Writer adjustment. */
function toSvxAdjust(alignment: OdfParagraphAlignment): SvxAdjust {
  if (alignment === "left") return SvxAdjust.ParaStart;
  if (alignment === "right") return SvxAdjust.ParaEnd;
  if (alignment === "center") return SvxAdjust.Center;
  return SvxAdjust.Block;
}
