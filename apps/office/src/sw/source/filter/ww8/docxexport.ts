/** @fileoverview Native DocxExport document-part ownership and font-table relationship/serializer routing. The actual XmlFilterBase/SwPaM bind consumed native base interfaces; drawing/property/style/main-text orchestration remains unported and no complete document export is claimed. */
import type { ZipFragmentStream } from "../../../../oox/source/helper/zipstorage";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { getRelationship, Relationship } from "../../../../oox/source/token/relationship";
import { namespaceTokens } from "../../../../oox/source/token/namespacemap";
import { getTokenFromUtf8 as token } from "../../../../oox/source/token/tokenmap";
import type { FastAttributeList } from "../../../../sax/source/tools/fastattribs";
import { FastSerializerHelper, FSNS } from "../../../../sax/inc/fshelper";
import type { SwDoc } from "../../core/doc/doc";
import type { SwPaM } from "../../core/crsr/pam";
import { DocxAttributeOutput } from "./docxattributeoutput";
import { MSWordExportBase } from "./wrtww8";
/** Actual native exporter owner for the admitted document/font parts. */
export class DocxExport extends MSWordExportBase {
  private readonly m_pDocumentFS: FastSerializerHelper;
  private readonly m_pAttrOutput: DocxAttributeOutput;
  /** Original consumed constructor keeps the document type flags and document relation/MIME selection. WriteProperties/drawings are not represented by dummy services. @param m_rFilter - Actual XML filter base binding. @param document - Actual document. @param current - Current range base binding. @param original - Actual original range. @param docm - Original macro format flag. @param template - Original template flag. @returns Exporter. */
  constructor(
    private readonly m_rFilter: XmlFilterBase,
    document: SwDoc,
    current: SwPaM,
    original: SwPaM,
    docm: boolean,
    template: boolean,
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
  }
  /** Original complete main-part namespace declaration order and MC ignorable prefixes. @returns Actual native attribute list. */
  MainXmlNamespaces(): FastAttributeList {
    const attributes = FastSerializerHelper.createAttrList();
    attributes.add(
      FSNS(token("xmlns"), token("o")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("vmlOffice") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("r")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("officeRel") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("v")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("vml") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("w")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("doc") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("w10")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("vmlWord") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("wp")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("dmlWordDr") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("pic")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("dmlPicture") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("wps")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("wps") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("wpg")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("wpg") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("mc")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("mce") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("wp14")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("wp14") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("w14")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("w14") as number),
    );
    attributes.add(
      FSNS(token("xmlns"), token("w15")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("w15") as number),
    );
    attributes.add(FSNS(token("mc"), token("Ignorable")), "w14 wp14 w15");
    return attributes;
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
    serializer.startElementNS(
      token("w"),
      token("fonts"),
      FSNS(token("xmlns"), token("w")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("doc") as number),
      FSNS(token("xmlns"), token("r")),
      this.m_rFilter.getNamespaceURL(namespaceTokens.get("officeRel") as number),
    );
    this.m_pAttrOutput.SetSerializer(serializer);
    this.m_aFontHelper.WriteFontTable(this.m_pAttrOutput);
    this.m_pAttrOutput.SetSerializer(this.m_pDocumentFS);
    serializer.endElementNS(token("w"), token("fonts"));
    serializer.endDocument();
  }
  /** Explicit native destructor binding; document export orchestration owns its matching element closes. @returns Nothing. */
  dispose(): void {
    this.m_pDocumentFS.endDocument();
  }
}
