/** @fileoverview Implements Writer's streaming SwXMLImport bridge over fast SAX contexts. */
import { FillUnoNumRule } from "../../../../xmloff/source/style/xmlnumi";
import { Reference, UNO_QUERY } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { cppu_detail_getUnoType as indexReplaceType } from "../../../../cppu/inc/com/sun/star/container/XIndexReplace";
import { text } from "../../core/unocore/unocrsrhelper";
import type { SwXStyle } from "../../core/unocore/unostyle";
import { SwXTextDocument } from "../../uibase/uno/unotxdoc";
import { XMLTextImportHelper } from "../../../../xmloff/source/text/txtimp";
import { xmlTextString } from "../../../../xmloff/source/text/txtprmap";
import { Any } from "../../../../cppu/inc/com/sun/star/uno/Any";
import { convertTwipToMm100 } from "../../../../tools/inc/UnitConversion";

import { SwXNumberingRules } from "../../core/unocore/unosett";

import { applyNamedParagraphStyles } from "../../../../xmloff/source/style/prstylei";

import {
  FastAttributeList,
  parseOdfXmlStream,
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type OdfXmlDiagnostic,
  type OdfXmlParseOptions,
  type SvXMLImportRootFactory as SvXMLImportContract,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import {
  XMLFontStylesContext,
  type XMLFontStylesImportTarget,
  type OdfFontFaceMetadata,
} from "../../../../xmloff/source/style/XMLFontStylesContext";
import { XMLStylesContext, type OdfPageLayout } from "../../../../xmloff/source/style/xmlstyle";
import type { XMLTableImportTarget } from "../../../../xmloff/source/table/XMLTableImport";
import { SwXMLTableImport } from "./xmltbli";

import {
  XMLTextBodyContext,
  type OdfStyleDefinition,
  type XMLTextListRule,
} from "../../../../xmloff/source/text/txtparai";
import type { OdfLineNumberingConfiguration } from "../../../../xmloff/source/text/XMLLineNumberingImportContext";

import { SwDoc, type WriterEmbeddedFont } from "../../core/doc/doc";
import type { DefaultFontDevice } from "../../core/doc/default-font";

import { SwTextNode } from "../../core/txtnode/ndtxt";

import {
  getWriterStyleIdFromOdfName,
  getWriterMaterializedParagraphStyleDefinition,
} from "../../../inc/poolfmt";
import { RTL_TEXTENCODING_UTF8 } from "../../../../sal/inc/rtl/textenc";
const ignoredDocumentChildren = new Set([XMLToken.OFFICE_SETTINGS, XMLToken.OFFICE_SCRIPTS]);

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

/** Imported model plus filter-owned metadata; lifecycle remains in SfxObjectShell. */
export interface ImportedWriterDocument {
  readonly document: SwDoc;
  readonly title: string;
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
  stylesXml: string | undefined,
  contentXml: string | undefined,
  metadata: Readonly<{ title: string; locale?: string }>,
  metaXml?: string,
  options: OdfXmlParseOptions & { readonly defaultFontDevice?: DefaultFontDevice } = {},
): ImportedWriterDocument {
  let locale = metadata.locale ?? "en-US";
  if (metaXml !== undefined) {
    const metadataImport = new SwXMLImport(new SwDoc(false));
    metadataImport.parse(metaXml, XMLToken.OFFICE_DOCUMENT_META, options);
    locale = metadataImport.language ?? locale;
  }
  const xmlImport = new SwXMLImport(
    new SwDoc({
      createInitialTextNode: true,
      locale,
      ...(options.defaultFontDevice === undefined
        ? {}
        : { defaultFontDevice: options.defaultFontDevice }),
    }),
  );
  xmlImport.document.SetInReading(true);
  try {
    if (stylesXml !== undefined) {
      xmlImport.parse(stylesXml, XMLToken.OFFICE_DOCUMENT_STYLES, options);
      xmlImport.finishNamedStyles();
    }
    if (contentXml !== undefined) {
      xmlImport.parse(contentXml, XMLToken.OFFICE_DOCUMENT_CONTENT, options);
      xmlImport.finishContent();
    }
    if (metaXml !== undefined) xmlImport.parse(metaXml, XMLToken.OFFICE_DOCUMENT_META, options);
    return {
      document: xmlImport.document,
      title: xmlImport.title ?? metadata.title,
    };
  } finally {
    xmlImport.dispose();
    xmlImport.document.SetInReading(false);
  }
}

/** Writer import coordinator matching upstream SwXMLImport context ownership. */
class SwXMLImport
  extends SwXMLTableImport
  implements SvXMLImportContract, XMLTableImportTarget, XMLFontStylesImportTarget
{
  private lineNumberingSeen = false;
  private expectedRoot = XMLToken.UNKNOWN;
  private officeTextCount = 0;
  private titleSeen = false;
  private styles: XMLStylesContext | undefined;
  private autoStyles: XMLStylesContext | undefined;
  private defaultParagraphStyle: OdfStyleDefinition | undefined;
  private readonly automaticListRules = new Map<string, XMLTextListRule>();
  private readonly listRules = new Map<string, XMLTextListRule>();
  private readonly fontFaces = new Map<string, string>();
  private readonly fontFaceGenerics = new Map<string, string>();
  private readonly fontFaceMetadata = new Map<string, OdfFontFaceMetadata>();
  private readonly masterPages = new Map<
    string,
    Readonly<{ followName?: string; pageLayoutName: string }>
  >();
  private readonly pageLayouts = new Map<string, OdfPageLayout>();
  public title: string | undefined;
  public language: string | undefined;

  /** Creates a coordinator around a temporary document. @param document - Temporary Writer model. @returns Coordinator. */
  public constructor(document: SwDoc) {
    super(document);
    this.model = new SwXTextDocument(document);
    this.textImport = new XMLTextImportHelper(this, this.model);
  }
  private readonly model: SwXTextDocument;
  /** Supplies the shared text import owner used by every paragraph and table cell. @returns Active native helper. */
  public GetTextImport(): XMLTextImportHelper {
    return this.textImport as XMLTextImportHelper;
  }
  /** Supplies the original model/style/service API. @returns Writer model. */
  public GetModel(): SwXTextDocument {
    return this.model;
  }
  /** Releases import API cursors and model wrappers without destroying the imported SwDoc. @returns Nothing. */
  public dispose(): void {
    this.textImport?.ResetCursor();
    this.model.dispose();
  }

  /** Parses one expected package stream. @param xml - XML text. @param expectedRoot - Required root token. @param options - Parser controls. @returns Nothing. */
  public parse(xml: string, expectedRoot: XMLToken, options: OdfXmlParseOptions): void {
    this.expectedRoot = expectedRoot;
    const stream =
      expectedRoot === XMLToken.OFFICE_DOCUMENT_STYLES
        ? "styles.xml"
        : expectedRoot === XMLToken.OFFICE_DOCUMENT_CONTENT
          ? "content.xml"
          : "meta.xml";
    const onDiagnostic = options.onDiagnostic;
    parseOdfXmlStream(xml, this, {
      ...options,
      ...(onDiagnostic === undefined
        ? {}
        : {
            /** Adds the owning package stream. @param diagnostic - Structural event. @returns Nothing. */
            onDiagnostic: (diagnostic: OdfXmlDiagnostic): void =>
              onDiagnostic({ ...diagnostic, stream }),
          }),
    });
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

  /** Resolves one imported style by native family and name identity. @param family - Requested style family. @param styleName - ODF style name. @returns Style definition. */
  public getStyle(
    family: OdfStyleDefinition["family"],
    styleName: string,
  ): OdfStyleDefinition | undefined {
    return this.styles?.FindStyleChildContext(family, styleName)?.GetDefinition();
  }

  /** Resolves a direct style in the active automatic context. @param family - Requested family. @param styleName - ODF style name. @returns Automatic definition. */
  public getAutoStyle(
    family: OdfStyleDefinition["family"],
    styleName: string,
  ): OdfStyleDefinition | undefined {
    return this.autoStyles?.FindStyleChildContext(family, styleName)?.GetDefinition();
  }

  /** Creates and retains one native style-container context. @param automatic - Whether to replace the automatic context. @returns New owning context. */
  public CreateStylesContext(automatic: boolean): XMLStylesContext {
    const context = new XMLStylesContext(this, automatic);
    if (automatic) {
      this.autoStyles = context;
      this.automaticListRules.clear();
    } else this.styles = context;
    return context;
  }

  /** Resolves one imported font-face declaration. @param name - Face name. @returns Model family. */
  public getFontFace(name: string): string | undefined {
    return this.fontFaces.get(name);
  }

  /** Resolves an imported font face's generic family. @param name - Face name. @returns ODF generic family. */
  public getFontFaceGeneric(name: string): string | undefined {
    return this.fontFaceGenerics.get(name);
  }

  /** Resolves original font-face style/pitch/encoding values. @param name - Declared face name. @returns Stored native metadata. */
  public getFontFaceProperties(name: string): OdfFontFaceMetadata | undefined {
    return this.fontFaceMetadata.get(name);
  }

  /** Registers one imported font-face declaration. @param name - Face name. @param familyName - Model family. @param generic - ODF generic family. @param metadata - Native style, pitch and encoding. @returns Nothing. */
  public registerFontFace(
    name: string,
    familyName: string,
    generic?: string,
    metadata?: OdfFontFaceMetadata,
  ): void {
    const existing = this.fontFaces.get(name);
    if (existing !== undefined && existing !== familyName)
      throw new Error(`Conflicting ODF font face: ${name}`);
    this.fontFaces.set(name, familyName);
    if (generic !== undefined) this.fontFaceGenerics.set(name, generic);
    if (metadata !== undefined) this.fontFaceMetadata.set(name, metadata);
  }

  /** Retains one package-backed font declaration for ZIP resolution after XML import. @param font - ODF face URI. @returns Nothing. */
  public registerEmbeddedFont(font: WriterEmbeddedFont): void {
    this.document.RegisterEmbeddedFont(font);
  }

  /** Resolves pinned built-in paragraph-style names without coupling xmloff to Writer. @param styleName - ODF name. @returns Model identity. */
  public resolveBuiltInParagraphStyle(styleName: string): string | undefined {
    return getWriterStyleIdFromOdfName(styleName);
  }

  /** Resolves actual common paragraph collection ownership without flattening it into direct items. @param styleName - Common ODF identity. @returns Registered collection identity. */
  public resolveNamedParagraphStyle(styleName: string): string | undefined {
    const id = getWriterStyleIdFromOdfName(styleName);
    return (
      (id === undefined ? undefined : this.document.FindTextFormatColl(id))?.id ??
      this.document.FindTextFormatColl(styleName)?.id
    );
  }

  /** Resolves one document-owned list rule. @param styleName - ODF list style name. @returns Rule view. */
  public getListRule(styleName: string): XMLTextListRule | undefined {
    return this.automaticListRules.get(styleName) ?? this.listRules.get(styleName);
  }

  /** Applies global ODF line numbering to the canonical Writer document. @param value - Imported configuration. @returns Nothing. */
  public registerLineNumbering(value: OdfLineNumberingConfiguration): void {
    if (this.lineNumberingSeen) throw new Error("Duplicate ODF line numbering configuration.");
    this.lineNumberingSeen = true;
    const properties = this.model.getLineNumberingProperties();
    for (const [name, field] of [
      ["CountEmptyLines", "countBlankLines"],
      ["CountLinesInFrames", "countInFlys"],
      ["IsOn", "paintLineNumbers"],
      ["RestartAtEachPage", "restartEachPage"],
    ] as const) {
      const key = xmlTextString(name),
        any = new Any([value[field]], "bool");
      try {
        properties.setPropertyValue(key, any);
      } finally {
        key.dispose();
        any.dispose();
      }
    }
    for (const [name, number] of [
      ["Interval", value.countBy],
      ["SeparatorInterval", value.dividerCountBy],
      [
        "NumberPosition",
        value.position === "right"
          ? 1
          : value.position === "inside"
            ? 2
            : value.position === "outside"
              ? 3
              : 0,
      ],
    ] as const) {
      const key = xmlTextString(name),
        any = new Any([(number << 16) >> 16], "sal_Int16");
      try {
        properties.setPropertyValue(key, any);
      } finally {
        key.dispose();
        any.dispose();
      }
    }
    const distanceKey = xmlTextString("Distance"),
      distance = new Any([Number(convertTwipToMm100(BigInt(value.posFromLeft)))], "sal_Int32"),
      separatorKey = xmlTextString("SeparatorText"),
      separator = xmlTextString(value.divider),
      any = new Any(separator.getDataAddress(), "OUString");
    try {
      properties.setPropertyValue(distanceKey, distance);
      properties.setPropertyValue(separatorKey, any);
    } finally {
      distanceKey.dispose();
      distance.dispose();
      separatorKey.dispose();
      separator.dispose();
      any.dispose();
    }
  }

  /** Registers the paragraph-family default shared by all named paragraph styles. @param definition - Parsed default. @returns Nothing. */
  public registerDefaultStyle(definition: OdfStyleDefinition): void {
    if (this.defaultParagraphStyle !== undefined)
      throw new Error("Duplicate ODF default paragraph style.");
    this.defaultParagraphStyle = definition;
  }

  /** Registers one named ODF page layout. @param name - Layout name. @param layout - Physical geometry. @returns Nothing. */
  public registerPageLayout(name: string, layout: OdfPageLayout): void {
    if (this.pageLayouts.has(name)) throw new Error(`Duplicate ODF page layout: ${name}`);
    this.pageLayouts.set(name, layout);
  }

  /** Associates a named master page with its layout and optional follow style. @param name - Master-page name. @param pageLayoutName - Referenced layout. @param followName - Optional next master page. @returns Nothing. */
  public registerMasterPage(name: string, pageLayoutName: string, followName?: string): void {
    if (this.masterPages.has(name)) throw new Error(`Duplicate ODF master page: ${name}`);
    this.masterPages.set(name, {
      ...(followName === undefined ? {} : { followName }),
      pageLayoutName,
    });
  }

  /** Registers one numbering definition in Writer. @param styleName - ODF style name. @param rule - Parsed rule. @returns Nothing.  @param automatic - Native operation input. */
  public registerListStyle(styleName: string, rule: XMLTextListRule, automatic = false): void {
    const declarations = automatic ? this.automaticListRules : this.listRules;
    if (declarations.has(styleName)) throw new Error(`Duplicate ODF list style: ${styleName}`);
    let rules: SwXNumberingRules, style: SwXStyle | undefined;
    if (automatic)
      rules = this.model.createInstance(
        xmlTextString("com.sun.star.text.NumberingRules"),
      ) as SwXNumberingRules;
    else {
      const family = this.model.getStyleFamilies().getByName(xmlTextString("NumberingStyles")),
        key = xmlTextString(rule.name);
      try {
        if (!family.hasByName(key)) {
          const descriptor = this.model.createInstance(
            xmlTextString("com.sun.star.style.NumberingStyle"),
          ) as SwXStyle;
          family.insertByName(key, descriptor);
        }
        style = family.getByName(key);
        const value = style.getPropertyValue(xmlTextString("NumberingRules")),
          reference = new Reference(value, UNO_QUERY, indexReplaceType);
        try {
          rules = reference.get() as SwXNumberingRules;
          rules.acquire();
        } finally {
          reference.dispose();
          value.dispose();
        }
      } finally {
        key.dispose();
      }
    }
    try {
      FillUnoNumRule(rules, rule);
      if (style) {
        const value = new Any([rules], ["Reference", indexReplaceType]);
        try {
          style.setPropertyValue(xmlTextString("NumberingRules"), value);
        } finally {
          value.dispose();
        }
      }
      const name = rules.getName(),
        key = xmlTextString("DefaultListId"),
        value = rules.getPropertyValue(key),
        identity = xmlTextString("");
      try {
        value.extract(identity, "OUString");
        declarations.set(styleName, {
          ...rule,
          rules,
          name: text(name),
          defaultListId: text(identity),
        });
      } finally {
        name.dispose();
        key.dispose();
        value.dispose();
        identity.dispose();
      }
    } finally {
      if (style) rules.release();
    }
  }

  /** Opens the sole office:text context. @returns Text body context. */
  public registerOfficeText(): XMLTextBodyContext {
    this.officeTextCount += 1;
    if (this.officeTextCount > 1)
      throw new Error("ODF content must contain exactly one office:text.");
    this.GetTextImport().SetCursor(this.model.getText().createTextCursor());
    return new XMLTextBodyContext(this);
  }

  /** Marks the single metadata title as encountered. @returns Nothing. */
  public startTitle(): void {
    if (this.titleSeen) throw new Error("ODF metadata contains duplicate titles.");
    this.titleSeen = true;
  }

  /** Applies imported named style state. @returns Nothing. */
  public finishNamedStyles(): void {
    const paragraphs = this.styles?.GetStyleDefinitions("paragraph") ?? new Map();
    applyNamedParagraphStyles(
      this.model,
      paragraphs,
      this.defaultParagraphStyle,
      /** Resolves the declared ODF numbering name to its native display name. @param name - ODF identity. @returns Registered rule name. */
      (name) => this.listRules.get(name)?.name,
      /** Executes this bounded native operation. @param name - Native operation input. @returns Native operation result. */ (
        name,
      ) => {
        const id = getWriterStyleIdFromOdfName(name);
        return id && getWriterMaterializedParagraphStyleDefinition(id) ? id : undefined;
      },
    );
    const pages = this.model.getStyleFamilies().getByName(xmlTextString("PageStyles"));
    /** Applies original page geometry through PageStyles property owners. @param name - Master page name. @param layout - Imported physical geometry. @returns Nothing. */
    const applyPage =
      /** Executes this bounded native operation. @param name - Native operation input. @param layout - Native operation input. @returns Native operation result. */ (
        name: string,
        layout: OdfPageLayout,
      ): void => {
        const key = xmlTextString(name);
        if (!pages.hasByName(key)) {
          const descriptor = this.model.createInstance(
            xmlTextString("com.sun.star.style.PageStyle"),
          );
          pages.insertByName(key, descriptor as import("../../core/unocore/unostyle").SwXStyle);
        }
        const style = pages.getByName(key);
        for (const [field, property] of [
          ["width", "Width"],
          ["height", "Height"],
          ["leftMargin", "LeftMargin"],
          ["rightMargin", "RightMargin"],
          ["topMargin", "TopMargin"],
          ["bottomMargin", "BottomMargin"],
        ] as const) {
          const value = new Any([Number(convertTwipToMm100(BigInt(layout[field])))], "sal_Int32");
          try {
            style.setPropertyValue(xmlTextString(property), value);
          } finally {
            value.dispose();
          }
        }
        const landscape = new Any([layout.landscape], "bool");
        try {
          style.setPropertyValue(xmlTextString("IsLandscape"), landscape);
        } finally {
          landscape.dispose();
          key.dispose();
        }
      };
    if (this.masterPages.size === 0) {
      const layout = this.pageLayouts.values().next().value;
      if (layout) applyPage("Standard", layout);
      return;
    }
    for (const [name, master] of this.masterPages) {
      const layout = this.pageLayouts.get(master.pageLayoutName);
      if (!layout) throw new Error(`Missing ODF page layout: ${master.pageLayoutName}`);
      applyPage(name, layout);
    }
    for (const [name, master] of this.masterPages) {
      const follow = master.followName ?? name;
      if (!pages.hasByName(xmlTextString(follow)))
        throw new Error(`Missing ODF follow master page: ${follow}`);
      const value = xmlTextString(follow),
        any = new Any(value.getDataAddress(), "OUString");
      try {
        pages.getByName(xmlTextString(name)).setPropertyValue(xmlTextString("FollowStyle"), any);
      } finally {
        any.dispose();
        value.dispose();
      }
    }
  }

  /** Native endDocAdjustNodes removes only the final empty paragraph preceded by ordinary content. @returns Nothing. */
  public finishContent(): void {
    if (this.officeTextCount !== 1)
      throw new Error("ODF content must contain exactly one office:text.");
    const cursor =
        this.GetTextImport().GetCursor() as import("../../core/unocore/unoobj").SwXTextCursor,
      node = cursor.GetPaM().GetPoint().GetNode() as SwTextNode,
      previous = this.document.GetNodes().entries()[node.GetIndex() - 1];
    if (
      node.Len() === 0 &&
      previous instanceof SwTextNode &&
      previous.StartOfSectionNode() === node.StartOfSectionNode()
    ) {
      this.GetTextImport().ResetCursor();
      this.document.GetNodes().removeTextNode(node);
    }
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
      return new XMLFontStylesContext(this.xmlImport, RTL_TEXTENCODING_UTF8);
    }
    if (
      element === XMLToken.OFFICE_MASTER_STYLES &&
      this.root === XMLToken.OFFICE_DOCUMENT_STYLES
    ) {
      attributes.assertOnly([], "master styles");
      return new XMLMasterStylesContext(this.xmlImport);
    }
    if (
      (element === XMLToken.OFFICE_STYLES || element === XMLToken.OFFICE_AUTOMATIC_STYLES) &&
      (this.root === XMLToken.OFFICE_DOCUMENT_STYLES ||
        this.root === XMLToken.OFFICE_DOCUMENT_CONTENT)
    ) {
      attributes.assertOnly([], "styles container");
      return this.xmlImport.CreateStylesContext(element === XMLToken.OFFICE_AUTOMATIC_STYLES);
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

/** Imports the page-layout association from Writer master pages. */
class XMLMasterStylesContext extends SvXMLImportContext {
  /** Creates the master-page context for one Writer XML import. @param xmlImport - Import coordinator. @returns Nothing. */
  public constructor(private readonly xmlImport: SwXMLImport) {
    super();
  }

  /** Imports supported master-page children and ignores their unmodeled content. @param element - Child token. @param attributes - Child attributes. @returns Import context. */
  public override createFastChildContext(
    element: XMLToken,
    attributes: FastAttributeList,
  ): SvXMLImportContext | null {
    if (element !== XMLToken.STYLE_MASTER_PAGE) return new SvXMLIgnoreContext();
    const name = attributes.require(XMLToken.STYLE_NAME, "master page name");
    const pageLayoutName = attributes.require(
      XMLToken.STYLE_PAGE_LAYOUT_NAME,
      "master page layout name",
    );
    const followName = attributes.get(XMLToken.STYLE_NEXT_STYLE_NAME) ?? undefined;
    this.xmlImport.registerMasterPage(name, pageLayoutName, followName);
    return new SvXMLIgnoreContext();
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
  /** Ignores only metadata fields without canonical Writer effect. @param element - Child token. @returns Whether metadata-only. */
  public override ignoreUnknownAttributesForChild(element: XMLToken): boolean {
    return ignoredMetadataChildren.has(element);
  }
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
    if (element === XMLToken.DC_LANGUAGE) {
      attributes.assertOnly([], "metadata language");
      return new XMLTitleContext(
        /** Retains the document language for construction defaults. @param language - Parsed tag. @returns Nothing. */ (
          language,
        ) => {
          this.xmlImport.language = language;
        },
      );
    }
    if (ignoredMetadataChildren.has(element)) return new SvXMLIgnoreContext(true);
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
