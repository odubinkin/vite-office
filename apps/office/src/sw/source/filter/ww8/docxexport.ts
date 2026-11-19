/** @fileoverview Native DocxExport selects the Writer text range and writes the document, style, numbering, font and theme parts. */
import type { Reference as RtlReference } from "../../../../sal/inc/rtl/ref";
import type { ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { getRelationship, Relationship } from "../../../../oox/source/token/relationship";
import { namespaceTokens } from "../../../../oox/source/token/namespacemap";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { FastAttributeList } from "../../../../sax/source/tools/fastattribs";
import { FastSerializerHelper, FSNS } from "../../../../sax/inc/fshelper";
import type { SwDoc } from "../../core/doc/doc";
import { SwPaM, SwPosition } from "../../core/crsr/pam";
import { MSWordSections, SectionProperties } from "./docxattributeoutput.section";
import { DocxBookmarks } from "./docxattributeoutput.hyperlink";
import { WriteText } from "./docxexport.text";
import { DocxAttributeOutput } from "./docxattributeoutput";
import { MSWordExportBase, MSWordExportFormat } from "./wrtww8";
import { OutputStylesTable } from "./docxattributeoutput.styles";
import { writeTheme } from "../../../../oox/source/export/ThemeExport";
import { MSWordStyles } from "./wrtw8sty";
import { DocxNumberingOutput } from "./docxattributeoutput.numbering";
import { AbstractNumberingDefinitions, NumberingDefinitions } from "./wrtw8num";
import { OoxmlVersion } from "../../../../oox/inc/core/filterbase";
import {
  GetWordCompatibilityMode,
  WriteCompat,
  WriteDocumentProtection,
} from "./docxexport.settings";
import { DocxHeaderFooterExport } from "./docxexport.headerfooter";
/** Actual native exporter owner for the admitted document/font parts. */
export class DocxExport extends MSWordExportBase {
  /** Exports an entire Writer document through its original part and serializer owners. @param document - Active document graph. @param version - Selected format, defaulting to Office Open XML Text. @returns Committed OOXML bytes. */
  static async WriteDocument(
    document: SwDoc,
    version = OoxmlVersion.ISOIEC_29500_2008,
  ): Promise<Uint8Array> {
    const end = document.GetNodes().GetEndOfContent();
    const first = new SwPosition(end.StartOfSectionNode());
    const last = new SwPosition(end);
    const range = new SwPaM(first, last);
    first.Dispose();
    last.Dispose();
    const filter = new XmlFilterBase(new ZipStorage());
    try {
      const exporter = new DocxExport(filter, document, range, range, false, false, version);
      try {
        exporter.InitStyles();
        exporter.WriteMainText();
        exporter.WriteNumbering();
        exporter.WriteFonts();
        exporter.WriteTheme(document);
        exporter.WriteSettings(document, version);
      } finally {
        exporter.dispose();
      }
    } finally {
      range.Dispose();
    }
    return filter.commitStorage();
  }

  /** Original concrete export-kind identity. @returns Native format. */
  GetExportFormat(): MSWordExportFormat {
    return MSWordExportFormat.DOCX;
  }

  /** Writes the original theme fragment and document relationship. @param document - Actual Writer graph. @returns Nothing. */
  private WriteTheme(document: SwDoc): void {
    if (!document.theme) return;
    const path = "theme/theme1.xml";
    const serializer = this.m_rFilter.openFragmentStreamWithSerializer(
      "word/" + path,
      "application/vnd.openxmlformats-officedocument.theme+xml",
    );
    writeTheme(serializer, document.theme);
    this.m_rFilter.addRelation(
      this.m_pDocumentFS.getOutputStream() as ZipFragmentStream,
      getRelationship(Relationship.THEME),
      path,
    );
  }
  private defaultTabStop = 0;
  /** Receives the default paragraph tab position encountered during style output. @param distance - Tab position in twips. @returns Nothing. */
  setDefaultTabStop(distance: number): void {
    this.defaultTabStop = distance;
  }
  /** Emits the original document compatibility and theme-language settings. @param document - Actual Writer graph. @param version - Selected OOXML filter version. @returns Nothing. */
  private WriteSettings(document: SwDoc, version: OoxmlVersion): void {
    const language = document.themeFontLanguages;
    const serializer = this.m_rFilter.openFragmentStreamWithSerializer(
      "word/settings.xml",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml",
    );
    const w = token("w");
    const attributes = FastSerializerHelper.createAttrList();
    try {
      this.addNamespace(attributes, "w", "doc");
      serializer.startElementNS(w, token("settings"), attributes);
    } finally {
      attributes.dispose();
    }
    WriteDocumentProtection(document, serializer);
    if (this.defaultTabStop !== 0)
      serializer.singleElementNS(
        w,
        token("defaultTabStop"),
        FSNS(w, token("val")),
        String(this.defaultTabStop),
      );
    if (this.headerFooter.evenAndOddHeaders)
      serializer.singleElementNS(w, token("evenAndOddHeaders"));
    if (document.GetDocumentSettingManager().get("GUTTER_AT_TOP"))
      serializer.singleElementNS(w, token("gutterAtTop"));
    WriteCompat(document, serializer, version);
    if (language)
      serializer.singleElementNS(
        w,
        token("themeFontLang"),
        FSNS(w, token("val")),
        language.val ?? "",
        FSNS(w, token("eastAsia")),
        language.eastAsia ?? "",
        FSNS(w, token("bidi")),
        language.bidi ?? "",
      );
    serializer.endElementNS(w, token("settings"));
    serializer.endDocument();
    this.m_rFilter.addRelation(
      this.m_pDocumentFS.getOutputStream() as ZipFragmentStream,
      getRelationship(Relationship.SETTINGS),
      "settings.xml",
    );
  }
  private readonly m_pDocumentFS: FastSerializerHelper;
  private readonly m_pAttrOutput: DocxAttributeOutput;
  private readonly m_numberingOutput: DocxNumberingOutput;
  private readonly headerFooter: DocxHeaderFooterExport;
  private wordCompatibilityMode: number | undefined;
  /** Original consumed constructor keeps the document type flags and document relation/MIME selection. @param m_rFilter - Actual XML filter base binding. @param document - Actual document. @param current - Current range base binding. @param original - Actual original range. @param docm - Original macro format flag. @param template - Original template flag. @param version - Selected OOXML version. @returns Exporter. */
  constructor(
    private readonly m_rFilter: XmlFilterBase,
    document: SwDoc,
    current: SwPaM,
    original: SwPaM,
    docm: boolean,
    template: boolean,
    private readonly version = OoxmlVersion.ISOIEC_29500_2008,
  ) {
    super(document, current, original);
    m_rFilter.addRelation(getRelationship(Relationship.OFFICEDOCUMENT), "word/document.xml");
    const mediaType = docm
      ? template
        ? "application/vnd.ms-word.template.macroEnabledTemplate.main+xml"
        : "application/vnd.ms-word.document.macroEnabled.main+xml"
      : template
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml";
    this.m_pDocumentFS = m_rFilter.openFragmentStreamWithSerializer("word/document.xml", mediaType);
    this.m_pAttrOutput = new DocxAttributeOutput(this, this.m_pDocumentFS);
    this.m_numberingOutput = new DocxNumberingOutput(this, this.m_pAttrOutput);
    this.headerFooter = new DocxHeaderFooterExport(this, document, this.m_pDocumentFS);
  }
  /** Returns the Word compatibility mode used to express the model's geometry. @returns Cached mode. */
  GetWordCompatibilityMode(): number {
    return (this.wordCompatibilityMode ??= GetWordCompatibilityMode(this.m_rDoc, this.version));
  }
  /** Returns the selected output schema version. @returns OOXML version. */
  GetVersion(): OoxmlVersion {
    return this.version;
  }
  /** Original complete main-part namespace declaration order and MC ignorable prefixes. @returns Actual native attribute list. */
  MainXmlNamespaces(): RtlReference<FastAttributeList> {
    const attributes = FastSerializerHelper.createAttrList();
    try {
      this.addNamespace(attributes, "o", "vmlOffice");
      this.addNamespace(attributes, "r", "officeRel");
      this.addNamespace(attributes, "v", "vml");
      this.addNamespace(attributes, "w", "doc");
      this.addNamespace(attributes, "w10", "vmlWord");
      this.addNamespace(attributes, "wp", "dmlWordDr");
      this.addNamespace(attributes, "pic", "dmlPicture");
      this.addNamespace(attributes, "wps", "wps");
      this.addNamespace(attributes, "wpg", "wpg");
      this.addNamespace(attributes, "mc", "mce");
      this.addNamespace(attributes, "wp14", "wp14");
      this.addNamespace(attributes, "w14", "w14");
      this.addNamespace(attributes, "w15", "w15");
      attributes.operatorArrow().add(FSNS(token("mc"), token("Ignorable")), "w14 wp14 w15");
      return attributes;
    } catch (error) {
      attributes.dispose();
      throw error;
    }
  }
  /** Explicit lifetime of each original getNamespaceURL by-value temporary during native attribute insertion. @param attributes - Actual attribute owner. @param prefix - Source prefix token name. @param namespace - Source namespace alias. @returns Nothing. */
  private addNamespace(
    attributes: RtlReference<FastAttributeList>,
    prefix: string,
    namespace: string,
  ): void {
    const uri = this.m_rFilter.getNamespaceURL(namespaceTokens.get(namespace) as number);
    try {
      attributes.operatorArrow().add(FSNS(token("xmlns"), token(prefix)), uri);
    } finally {
      uri.dispose();
    }
  }
  /** Original filter getter. @returns Actual filter. */
  GetFilter(): XmlFilterBase {
    return this.m_rFilter;
  }
  /** Original typed output getter. @returns Actual attribute owner. */
  DocxAttrOutput(): DocxAttributeOutput {
    return this.m_pAttrOutput;
  }
  /** Original base attribute-output dispatch. @returns Actual owner. */
  AttrOutput(): DocxAttributeOutput {
    return this.m_pAttrOutput;
  }
  /** Supplies the native DOCX numbering callbacks to the shared Word traversal. @returns DOCX numbering attribute output. */
  GetNumberingOutput(): DocxNumberingOutput {
    return this.m_numberingOutput;
  }
  /** Initializes the native style slots and writes the document's style fragment before visiting the body. @returns Nothing. */
  InitStyles(): void {
    const styles = new MSWordStyles(this);
    this.m_pStyles = styles;
    this.m_rFilter.addRelation(
      this.m_pDocumentFS.getOutputStream() as ZipFragmentStream,
      getRelationship(Relationship.STYLES),
      "styles.xml",
    );
    const serializer = this.m_rFilter.openFragmentStreamWithSerializer(
      "word/styles.xml",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml",
    );
    const attributes = FastSerializerHelper.createAttrList();
    try {
      this.addNamespace(attributes, "w", "doc");
      this.addNamespace(attributes, "w14", "w14");
      this.addNamespace(attributes, "mc", "mce");
      attributes.operatorArrow().add(FSNS(token("mc"), token("Ignorable")), "w14");
      serializer.startElementNS(token("w"), token("styles"), attributes);
    } finally {
      attributes.dispose();
    }
    this.m_pAttrOutput.SetSerializer(serializer);
    try {
      OutputStylesTable(this.m_pAttrOutput, styles);
      serializer.endElementNS(token("w"), token("styles"));
      serializer.endDocument();
    } finally {
      this.m_pAttrOutput.SetSerializer(this.m_pDocumentFS);
    }
  }
  /** Writes the document element and body using the original namespace and part owners. @returns Nothing. */
  WriteMainText(): void {
    const w = token("w");
    const attributes = this.MainXmlNamespaces();
    try {
      this.m_pDocumentFS.startElementNS(w, token("document"), attributes);
    } finally {
      attributes.dispose();
    }
    this.m_pDocumentFS.startElementNS(w, token("body"));
    const body = this.m_rDoc.GetNodes().getBodyContent();
    const storySections = new MSWordSections(this.m_rDoc, body[0]);
    this.headerFooter.CheckEvenAndOddHeaders(storySections.CurrentSectionInfo().page);
    for (const block of body.slice(1))
      if (storySections.Advance(block))
        this.headerFooter.CheckEvenAndOddHeaders(storySections.CurrentSectionInfo().page);
    const sections = new MSWordSections(this.m_rDoc, body[0]);
    WriteText(this.m_pAttrOutput, body, new DocxBookmarks(this.m_rDoc), sections);
    SectionProperties(this.m_pAttrOutput, sections.CurrentSectionInfo());
    this.m_pDocumentFS.endElementNS(w, token("body"));
    this.m_pDocumentFS.endElementNS(w, token("document"));
  }

  /** Writes the active page stories before the rest of the section properties. @param page - Native page descriptor. @param breakCode - Native section break code. @returns Nothing. */
  WriteHeadersFooters(
    page: import("../../core/layout/pagedesc").SwPageDesc,
    breakCode: number,
  ): void {
    this.headerFooter.WriteHeadersFooters(page, breakCode);
  }

  /** Writes the numbered lists part when the body or styles use a numbering rule. @returns Nothing. */
  WriteNumbering(): void {
    if (!this.m_pUsedNumTable) return;
    const w = token("w");
    this.m_rFilter.addRelation(
      this.m_pDocumentFS.getOutputStream() as ZipFragmentStream,
      getRelationship(Relationship.NUMBERING),
      "numbering.xml",
    );
    const serializer = this.m_rFilter.openFragmentStreamWithSerializer(
      "word/numbering.xml",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml",
    );
    const attributes = FastSerializerHelper.createAttrList();
    try {
      this.addNamespace(attributes, "w", "doc");
      this.addNamespace(attributes, "o", "vmlOffice");
      this.addNamespace(attributes, "r", "officeRel");
      this.addNamespace(attributes, "v", "vml");
      this.addNamespace(attributes, "mc", "mce");
      this.addNamespace(attributes, "w14", "w14");
      attributes.operatorArrow().add(FSNS(token("mc"), token("Ignorable")), "w14");
      serializer.startElementNS(w, token("numbering"), attributes);
    } finally {
      attributes.dispose();
    }
    this.m_pAttrOutput.SetSerializer(serializer);
    try {
      AbstractNumberingDefinitions(this);
      NumberingDefinitions(this);
      serializer.endElementNS(w, token("numbering"));
      serializer.endDocument();
    } finally {
      this.m_pAttrOutput.SetSerializer(this.m_pDocumentFS);
    }
  }
  /** Original font fragment relationship, namespace declarations and temporary serializer switch. @returns Nothing. */
  WriteFonts(): void {
    this.m_rFilter.addRelation(
      this.m_pDocumentFS.getOutputStream() as ZipFragmentStream,
      getRelationship(Relationship.FONTTABLE),
      "fontTable.xml",
    );
    const serializer = this.m_rFilter.openFragmentStreamWithSerializer(
      "word/fontTable.xml",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.fontTable+xml",
    );
    const documentURI = this.m_rFilter.getNamespaceURL(namespaceTokens.get("doc") as number),
      relationsURI = this.m_rFilter.getNamespaceURL(namespaceTokens.get("officeRel") as number);
    try {
      serializer.startElementNS(
        token("w"),
        token("fonts"),
        FSNS(token("xmlns"), token("w")),
        documentURI,
        FSNS(token("xmlns"), token("r")),
        relationsURI,
      );
    } finally {
      relationsURI.dispose();
      documentURI.dispose();
    }
    this.m_pAttrOutput.SetSerializer(serializer);
    this.m_aFontHelper.WriteFontTable(this.m_pAttrOutput);
    this.m_pAttrOutput.SetSerializer(this.m_pDocumentFS);
    serializer.endElementNS(token("w"), token("fonts"));
    serializer.endDocument();
  }
  /** Explicit native destructor binding; document export orchestration owns its matching element closes. @returns Nothing. */
  dispose(): void {
    try {
      this.m_pDocumentFS.endDocument();
    } finally {
      try {
        this.m_pAttrOutput.dispose();
      } finally {
        this.Dispose();
      }
    }
  }
}
