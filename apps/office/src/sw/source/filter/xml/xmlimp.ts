/** @fileoverview Implements Writer's streaming SwXMLImport bridge over fast SAX contexts. */

import {
  SvxAdjust,
  SvxAdjustItem,
  SvxFirstLineIndentItem,
  SvxLineSpacingItem,
  SvxRightMarginItem,
  SvxTabAdjust,
  SvxTabStop,
  SvxTabStopItem,
  SvxTextLeftMarginItem,
  SvxULSpaceItem,
} from "../../../../editeng/source/items/paraitem";
import {
  FontItalic,
  FontLineStyle,
  FontWeight,
  SvxFontItem,
  SvxFontHeightItem,
  SvxPostureItem,
  SvxUnderlineItem,
  SvxWeightItem,
} from "../../../../editeng/source/items/textitem";
import { SfxBoolItem } from "../../../../svl/source/items/cenumitm";
import { SfxInt16Item } from "../../../../svl/source/items/intitem";
import { SfxStringItem } from "../../../../svl/source/items/stritem";
import { type SfxPoolItem } from "../../../../svl/source/items/poolitem";
import { createWriterCharacterItemSet } from "../../core/txtnode/txatbase";
import { SwFormatPageDesc } from "../../core/attr/fmtpdsc";
import {
  FastAttributeList,
  parseOdfXmlStream,
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type OdfXmlDiagnostic,
  type OdfXmlParseOptions,
  type SvXMLImport as SvXMLImportContract,
} from "../../../../xmloff/source/core/xmlimp";
import { XMLToken } from "../../../../xmloff/source/core/xmltoken";
import {
  XMLFontStylesContext,
  type XMLFontStylesImportTarget,
} from "../../../../xmloff/source/style/XMLFontStylesContext";
import { XMLStylesContext, type OdfPageLayout } from "../../../../xmloff/source/style/xmlstyle";
import type {
  OdfCharacterProperties,
  OdfHyperlink,
  OdfParagraphAlignment,
  OdfParagraphProperties,
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
import { LineNumberPosition, SwLineNumberInfo } from "../../../inc/lineinfo";
import type { OdfLineNumberingConfiguration } from "../../../../xmloff/source/text/XMLLineNumberingImportContext";
import { SwPosition } from "../../core/crsr/pam";
import { SwDoc } from "../../core/doc/doc";
import type { DefaultFontDevice } from "../../core/doc/default-font";
import { SwNumFormat, SwNumRule } from "../../core/doc/number";
import type { SwTextNode } from "../../core/txtnode/ndtxt";
import { WRITER_PAPER_SIZES } from "../../core/layout/pagedesc";
import type { WriterPageDescriptorValue } from "../../core/layout/pagedesc";
import {
  RES_CHRATR_CJK_POSTURE,
  RES_BREAK,
  RES_CHRATR_CJK_FONT,
  RES_CHRATR_CJK_FONTSIZE,
  RES_CHRATR_CJK_WEIGHT,
  RES_CHRATR_COLOR,
  RES_CHRATR_CTL_POSTURE,
  RES_CHRATR_CTL_FONT,
  RES_CHRATR_CTL_FONTSIZE,
  RES_CHRATR_FONT,
  RES_CHRATR_FONTSIZE,
  RES_CHRATR_CTL_WEIGHT,
  RES_CHRATR_HIGHLIGHT,
  RES_CHRATR_POSTURE,
  RES_CHRATR_UNDERLINE,
  RES_CHRATR_WEIGHT,
  RES_PARATR_ADJUST,
  RES_PARATR_SPLIT,
  RES_PARATR_ORPHANS,
  RES_PARATR_WIDOWS,
  RES_PARATR_LINESPACING,
  RES_PARATR_TABSTOP,
  RES_MARGIN_FIRSTLINE,
  RES_MARGIN_RIGHT,
  RES_MARGIN_TEXTLEFT,
  RES_UL_SPACE,
  RES_KEEP,
  RES_LINENUMBER,
} from "../../../inc/hintids";
import {
  getWriterOdfStyleName,
  getWriterStyleIdFromOdfName,
  WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL,
} from "../../../inc/poolfmt";

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
  stylesXml: string,
  contentXml: string,
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
      createInitialTextNode: false,
      locale,
      ...(options.defaultFontDevice === undefined
        ? {}
        : { defaultFontDevice: options.defaultFontDevice }),
    }),
  );
  xmlImport.parse(stylesXml, XMLToken.OFFICE_DOCUMENT_STYLES, options);
  xmlImport.finishNamedStyles();
  xmlImport.parse(contentXml, XMLToken.OFFICE_DOCUMENT_CONTENT, options);
  xmlImport.finishContent();
  if (metaXml !== undefined) xmlImport.parse(metaXml, XMLToken.OFFICE_DOCUMENT_META, options);
  return {
    document: xmlImport.document,
    title: xmlImport.title ?? metadata.title,
  };
}

/** Writer import coordinator matching upstream SwXMLImport context ownership. */
class SwXMLImport implements SvXMLImportContract, XMLTextImportTarget, XMLFontStylesImportTarget {
  private lineNumberingSeen = false;
  private expectedRoot = XMLToken.UNKNOWN;
  private officeTextCount = 0;
  private paragraphCount = 0;
  private titleSeen = false;
  private readonly styles = new Map<string, OdfStyleDefinition>();
  private defaultParagraphStyle: OdfStyleDefinition | undefined;
  private readonly listRules = new Map<string, XMLTextListRule>();
  private readonly fontFaces = new Map<string, string>();
  private readonly masterPages = new Map<
    string,
    Readonly<{ followName?: string; pageLayoutName: string }>
  >();
  private readonly pageLayouts = new Map<string, OdfPageLayout>();
  public title: string | undefined;
  public language: string | undefined;

  /** Creates a coordinator around a temporary document. @param document - Temporary Writer model. @returns Coordinator. */
  public constructor(public readonly document: SwDoc) {}

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

  /** Applies global ODF line numbering to the canonical Writer document. @param value - Imported configuration. @returns Nothing. */
  public registerLineNumbering(value: OdfLineNumberingConfiguration): void {
    if (this.lineNumberingSeen) throw new Error("Duplicate ODF line numbering configuration.");
    this.lineNumberingSeen = true;
    this.document.SetLineNumberInfo(
      new SwLineNumberInfo({
        countBlankLines: value.countBlankLines,
        countBy: value.countBy,
        countInFlys: value.countInFlys,
        divider: value.divider,
        dividerCountBy: value.dividerCountBy,
        paintLineNumbers: value.paintLineNumbers,
        posFromLeft: value.posFromLeft,
        position:
          value.position === "right"
            ? LineNumberPosition.Right
            : value.position === "inside"
              ? LineNumberPosition.Inside
              : value.position === "outside"
                ? LineNumberPosition.Outside
                : LineNumberPosition.Left,
        restartEachPage: value.restartEachPage,
      }),
    );
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
            (kind === "numbered" &&
              existing.GetNumFormat(level).GetSuffix() !== (rule.suffixes?.[level] ?? ".")) ||
            (kind === "bullet" &&
              existing.GetNumFormat(level).GetBulletChar() !==
                (rule.bulletChars?.[level] ?? "•")) ||
            Object.entries(rule.levelLayouts?.[level] ?? {}).some(
              /** Compares imported geometry with an existing rule. @param entry - Geometry field and value. @returns Whether they conflict. */
              ([key, value]) =>
                key === "firstLineIndent"
                  ? existing.GetNumFormat(level).GetFirstLineIndent() !== value
                  : key === "indentAt"
                    ? existing.GetNumFormat(level).GetIndentAt() !== value
                    : key === "labelFollowedBy"
                      ? existing.GetNumFormat(level).GetLabelFollowedBy() !== value
                      : existing.GetNumFormat(level).GetListtabPos() !== value,
            ),
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
          (kind, level) => {
            const indentAt = 720 + level * 360;
            return new SwNumFormat(kind, rule.bulletChars?.[level], {
              indentAt,
              listTabPosition: indentAt,
              ...rule.levelLayouts?.[level],
              /* v8 ignore next -- Streaming list-style parser always supplies suffixes for declared numeric levels. */
              ...(kind === "numbered" ? { suffix: rule.suffixes?.[level] ?? "." } : {}),
            });
          },
        ),
        rule.name,
        this.expectedRoot === XMLToken.OFFICE_DOCUMENT_CONTENT,
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

  /** Creates and configures one canonical text node. @param style - Writer style. @param alignment - Direct alignment. @param leftMargin - Direct text-left margin. @param paragraphProperties - Direct paragraph properties. @param properties - Direct character properties. @param list - Optional list state. @param listGeometryWins - Whether list geometry overrides inherited paragraph indentation. @returns Paragraph target. */
  public createParagraph(
    style: XMLParagraphStyle,
    alignment: OdfParagraphAlignment | undefined,
    leftMargin: number | undefined,
    paragraphProperties: OdfParagraphProperties | undefined,
    properties: Partial<OdfCharacterProperties> | undefined,
    list: XMLParagraphListState | undefined,
    listGeometryWins: boolean,
  ): XMLParagraphImportTarget {
    this.paragraphCount += 1;
    const node = this.document.nodes.MakeTextNode();
    node.ChgFormatColl(this.document.GetTextFormatColl(style));
    node.SetListGeometryWins(listGeometryWins);
    if (alignment !== undefined) node.SetParagraphAlignment(alignment);
    if (leftMargin !== undefined) node.SetParagraphTextLeftMargin(leftMargin);
    if (paragraphProperties !== undefined)
      putParagraphProperties(
        paragraphProperties,
        /** Applies one direct paragraph item. @param item - Imported item. @returns Set result. */ (
          item,
        ) => node.SetAttr(item),
      );
    if (list !== undefined) {
      /* v8 ignore next -- list contexts only expose rules registered in this same temporary document. */
      if (this.document.FindNumRulePtr(list.ruleName) === undefined)
        throw new Error(`Unsupported ODF list rule: ${list.ruleName}`);
      node.SetNumRule(list.ruleName);
      node.SetListId(list.listId);
      node.SetAttrListLevel(list.level);
      node.SetListRestart(list.restart === true, list.startValue);
      this.document.GetDocumentListsManager().RegisterListItem(node);
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
    applyNamedParagraphStyles(this.document, this.styles, this.defaultParagraphStyle);
    const createValue =
      /** Converts a registered page layout to Writer geometry. @param name - Master-page name. @param layout - Imported page layout. @returns Writer page descriptor. */ (
        name: string,
        layout: OdfPageLayout,
      ): WriterPageDescriptorValue => {
        const a4 = WRITER_PAPER_SIZES.A4;
        const letter = WRITER_PAPER_SIZES.Letter;
        const matchesPaper =
          /** Matches imported oriented dimensions to one known paper size. @param size - Portrait paper dimensions. @returns Whether dimensions match. */ (
            size: Readonly<{ height: number; width: number }>,
          ): boolean =>
            layout.landscape
              ? layout.width === size.height && layout.height === size.width
              : layout.width === size.width && layout.height === size.height;
        const paperFormat = matchesPaper(a4) ? "A4" : matchesPaper(letter) ? "Letter" : "custom";
        return {
          ...layout,
          name,
          paperFormat,
        };
      };
    if (this.masterPages.size === 0) {
      const layout = this.pageLayouts.values().next().value;
      if (layout !== undefined) this.document.ChgPageDesc(createValue("Standard", layout));
      return;
    }
    for (const [name, master] of this.masterPages) {
      const layout = this.pageLayouts.get(master.pageLayoutName);
      if (layout === undefined)
        throw new Error(`Missing ODF page layout: ${master.pageLayoutName}`);
      if (name === "Standard") this.document.ChgPageDesc(createValue(name, layout));
      else {
        this.document.MakePageDesc(name);
        this.document.ChgPageDesc(createValue(name, layout), name);
      }
    }
    for (const [name, master] of this.masterPages) {
      const descriptor = this.document.FindPageDesc(name);
      const follow =
        master.followName === undefined
          ? descriptor
          : this.document.FindPageDesc(master.followName);
      if (descriptor === undefined || follow === undefined)
        throw new Error(`Missing ODF follow master page: ${master.followName ?? name}`);
      descriptor.SetFollow(follow);
    }
  }

  /** Validates body cardinality and supplies Writer's empty paragraph. @returns Nothing. */
  public finishContent(): void {
    if (this.officeTextCount !== 1)
      throw new Error("ODF content must contain exactly one office:text.");
    if (this.paragraphCount === 0)
      this.createParagraph("default", undefined, undefined, undefined, undefined, undefined, false);
  }
}

/** Applies SAX character callbacks directly to one canonical text node. */
class SwXMLParagraphTarget implements XMLParagraphImportTarget {
  /** Wraps one live text node. @param node - Canonical node. @returns Paragraph target. */
  public constructor(private readonly node: SwTextNode) {}

  /** Appends SAX text with effective attributes. @param text - Character data. @param properties - Effective formatting. @param hyperlink - Optional enclosing hyperlink. @returns Nothing. */
  public appendText(
    text: string,
    properties: OdfCharacterProperties,
    hyperlink?: OdfHyperlink,
  ): void {
    const position = new SwPosition(this.node, this.node.Len(), "redline");
    try {
      this.node
        .GetDoc()
        .GetDocumentContentOperationsManager()
        .InsertTextFragment(
          position,
          this.node.CreateTextFragmentFromText(
            text,
            createWriterCharacterItemSet(this.node.GetDoc().GetAttrPool(), properties),
            hyperlink,
          ),
        );
    } finally {
      position.Dispose();
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
      return new XMLFontStylesContext(this.xmlImport);
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

/** Applies built-in named style state. @param document - Destination. @param styles - Parsed styles. @param defaultStyle - Shared paragraph defaults. @returns Nothing. */
function applyNamedParagraphStyles(
  document: SwDoc,
  styles: ReadonlyMap<string, OdfStyleDefinition>,
  defaultStyle?: OdfStyleDefinition,
): void {
  const standard = styles.get("Standard");
  if (standard?.family !== "paragraph")
    throw new Error("ODF Writer Standard paragraph style is missing.");
  for (const poolStyle of WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL) {
    const definition = styles.get(getWriterOdfStyleName(poolStyle.id));
    if (definition === undefined) continue;
    if (definition.family !== "paragraph")
      throw new Error(`ODF Writer ${poolStyle.name} paragraph style is invalid.`);
    const collection = document.GetTextFormatColl(poolStyle.id);
    collection.SetDerivedFrom(undefined);
    if (defaultStyle?.alignment !== undefined)
      collection.SetFormatAttr(
        new SvxAdjustItem(toSvxAdjust(defaultStyle.alignment), RES_PARATR_ADJUST),
      );
    if (defaultStyle?.leftMargin !== undefined)
      collection.SetFormatAttr(
        new SvxTextLeftMarginItem(defaultStyle.leftMargin, RES_MARGIN_TEXTLEFT),
      );
    if (defaultStyle?.paragraphProperties !== undefined)
      putParagraphProperties(
        defaultStyle.paragraphProperties,
        /** Applies one default paragraph item. @param item - Imported item. @returns Set result. */
        (item) => collection.SetFormatAttr(item),
      );
    if (defaultStyle?.properties !== undefined)
      putCharacterProperties(
        defaultStyle.properties,
        /** Applies one default character item. @param item - Imported item. @returns Set result. */
        (item) => collection.SetFormatAttr(item),
      );
    if (definition.displayName !== undefined) collection.SetFormatName(definition.displayName);
    if (definition.alignment !== undefined)
      collection.SetFormatAttr(
        new SvxAdjustItem(toSvxAdjust(definition.alignment), RES_PARATR_ADJUST),
      );
    if (definition.leftMargin !== undefined)
      collection.SetFormatAttr(
        new SvxTextLeftMarginItem(definition.leftMargin, RES_MARGIN_TEXTLEFT),
      );
    if (definition.paragraphProperties !== undefined)
      putParagraphProperties(
        definition.paragraphProperties,
        /** Applies one named-style paragraph item. @param item - Imported item. @returns Set result. */ (
          item,
        ) => collection.SetFormatAttr(item),
      );
    if (definition.properties !== undefined)
      putCharacterProperties(
        definition.properties,
        /** Applies one style item. @param item - Imported item. @returns Set result. */ (item) =>
          collection.SetFormatAttr(item),
      );
  }
  for (const poolStyle of WRITER_AVAILABLE_PARAGRAPH_STYLE_POOL) {
    const definition = styles.get(getWriterOdfStyleName(poolStyle.id));
    if (definition?.family !== "paragraph") continue;
    const collection = document.GetTextFormatColl(poolStyle.id);
    const parentId =
      definition.parentStyleName === undefined
        ? undefined
        : getWriterStyleIdFromOdfName(definition.parentStyleName);
    const parent = parentId === undefined ? undefined : document.GetTextFormatColl(parentId);
    if (parent !== collection && !derivesFrom(parent, collection))
      collection.SetDerivedFrom(parent);
    const followId =
      definition.nextStyleName === undefined
        ? undefined
        : getWriterStyleIdFromOdfName(definition.nextStyleName);
    collection.SetNextTextFormatColl(
      followId === undefined ? collection : document.GetTextFormatColl(followId),
    );
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
  if (properties.color !== undefined) put(new SfxStringItem(RES_CHRATR_COLOR, properties.color));
  if (properties.fontFamily !== undefined)
    for (const which of [RES_CHRATR_FONT, RES_CHRATR_CJK_FONT, RES_CHRATR_CTL_FONT])
      put(new SvxFontItem(properties.fontFamily, which));
  if (properties.fontSizeTwips !== undefined)
    for (const which of [RES_CHRATR_FONTSIZE, RES_CHRATR_CJK_FONTSIZE, RES_CHRATR_CTL_FONTSIZE])
      put(new SvxFontHeightItem(properties.fontSizeTwips, which));
  if (properties.highlight !== undefined)
    put(new SfxStringItem(RES_CHRATR_HIGHLIGHT, properties.highlight));
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

/** Converts ODF paragraph deltas into pooled items. @param properties - Property deltas. @param put - Item sink. @returns Nothing. */
function putParagraphProperties(
  properties: OdfParagraphProperties,
  put: (item: SfxPoolItem) => unknown,
): void {
  if (properties.firstLineIndent !== undefined || properties.autoTextIndent !== undefined)
    put(
      new SvxFirstLineIndentItem(
        properties.firstLineIndent ?? 0,
        RES_MARGIN_FIRSTLINE,
        properties.autoTextIndent === true,
      ),
    );
  if (properties.rightMargin !== undefined)
    put(new SvxRightMarginItem(properties.rightMargin, RES_MARGIN_RIGHT));
  if (
    properties.upperSpacing !== undefined ||
    properties.lowerSpacing !== undefined ||
    properties.contextualSpacing !== undefined
  )
    put(
      new SvxULSpaceItem(
        properties.upperSpacing ?? 0,
        properties.lowerSpacing ?? 0,
        RES_UL_SPACE,
        properties.contextualSpacing === true,
      ),
    );
  const lineMode =
    properties.lineHeightTwips !== undefined
      ? "fixed"
      : properties.lineHeightAtLeastTwips !== undefined
        ? "minimum"
        : properties.lineSpacingTwips !== undefined
          ? "leading"
          : "proportional";
  const lineValue =
    properties.lineHeightTwips ??
    properties.lineHeightAtLeastTwips ??
    properties.lineSpacingTwips ??
    properties.lineHeightPercent;
  if (lineValue !== undefined)
    put(
      new SvxLineSpacingItem(
        lineValue,
        RES_PARATR_LINESPACING,
        lineMode,
        properties.fontIndependentLineSpacing === true,
      ),
    );
  if (properties.tabStopDetails !== undefined)
    put(
      SvxTabStopItem.FromStops(
        RES_PARATR_TABSTOP,
        properties.tabStopDetails.map(
          /** Builds an upstream Writer tab from ODF properties. @param stop - ODF tab. @returns Writer tab. */
          (stop) =>
            new SvxTabStop(
              stop.position,
              stop.alignment === "right"
                ? SvxTabAdjust.Right
                : stop.alignment === "center"
                  ? SvxTabAdjust.Center
                  : stop.alignment === "char"
                    ? SvxTabAdjust.Decimal
                    : stop.alignment === "default"
                      ? SvxTabAdjust.Default
                      : SvxTabAdjust.Left,
              stop.decimal,
              stop.fill,
            ),
        ),
      ),
    );
  if (properties.keepWithNext !== undefined)
    put(new SfxBoolItem(RES_KEEP, properties.keepWithNext));
  if (properties.keepTogether !== undefined)
    put(new SfxBoolItem(RES_PARATR_SPLIT, !properties.keepTogether));
  if (properties.orphans !== undefined)
    put(new SfxInt16Item(RES_PARATR_ORPHANS, properties.orphans));
  if (properties.widows !== undefined) put(new SfxInt16Item(RES_PARATR_WIDOWS, properties.widows));
  if (properties.pageStyleName !== undefined || properties.pageNumber !== undefined)
    put(
      new SwFormatPageDesc(
        properties.pageStyleName ?? "",
        properties.pageNumber === undefined || properties.pageNumber === "auto"
          ? undefined
          : properties.pageNumber,
      ),
    );
  if (properties.breakBefore !== undefined || properties.breakAfter !== undefined)
    put(
      new SfxInt16Item(
        RES_BREAK,
        properties.breakBefore === "page" && properties.breakAfter === "page"
          ? 6
          : properties.breakBefore === "page"
            ? 4
            : properties.breakAfter === "page"
              ? 5
              : 0,
      ),
    );
  if (properties.countLineNumbers !== undefined)
    put(new SfxBoolItem(RES_LINENUMBER, properties.countLineNumbers));
}

/** Converts ODF alignment to Writer adjustment. @param alignment - ODF alignment. @returns Writer adjustment. */
function toSvxAdjust(alignment: OdfParagraphAlignment): SvxAdjust {
  if (alignment === "left") return SvxAdjust.ParaStart;
  if (alignment === "right") return SvxAdjust.ParaEnd;
  if (alignment === "center") return SvxAdjust.Center;
  return SvxAdjust.Block;
}
