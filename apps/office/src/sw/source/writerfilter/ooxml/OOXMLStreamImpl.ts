/** @fileoverview Ports native Writer OOXMLStreamImpl target lookup, external cache and relative URI resolution over shared ZIP input; distinct from oox::Relations. */
import {
  ReadRelationsInfoSequence,
  type StringPair,
} from "../../../../comphelper/source/xml/ofopxmlhelper";
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import {
  UriReferenceFactory,
  RelativeUriExcessParentSegments as Excess,
} from "../../../../stoc/source/uriproc/UriReferenceFactory";
import { StreamType_t as T } from "../inc/ooxml/OOXMLDocument";

/** Original stream type suffixes; Microsoft extension relationships have identical strict variants. */
const suffixes: Readonly<Record<number, string>> = {
  [T.DOCUMENT]: "officeDocument",
  [T.STYLES]: "styles",
  [T.WEBSETTINGS]: "webSettings",
  [T.FONTTABLE]: "fontTable",
  [T.NUMBERING]: "numbering",
  [T.FOOTNOTES]: "footnotes",
  [T.ENDNOTES]: "endnotes",
  [T.COMMENTS]: "comments",
  [T.THEME]: "theme",
  [T.CUSTOMXML]: "customXml",
  [T.CUSTOMXMLPROPS]: "customXmlProps",
  [T.GLOSSARY]: "glossaryDocument",
  [T.CHARTS]: "chart",
  [T.EMBEDDINGS]: "package",
  [T.SETTINGS]: "settings",
  [T.FOOTER]: "footer",
  [T.HEADER]: "header",
};
/** Original native globals used by custom XML/chart/header/footer iteration and embedded-object consumers. */
export const streamTargets = { customTarget: "", embeddingsTarget: "" };
const transitional = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/";
const strict = "http://purl.oclc.org/ooxml/officeDocument/relationships/";
const uriFactory = new UriReferenceFactory();

/** XML byte decoding follows SAX UTF8/UTF16 BOM and signature admission. @param bytes - XML bytes. @returns XML. */
function decode(bytes: Uint8Array): string {
  const little = (bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0x3c && bytes[1] === 0);
  const big = (bytes[0] === 0xfe && bytes[1] === 0xff) || (bytes[0] === 0 && bytes[1] === 0x3c);
  return new TextDecoder(little ? "utf-16le" : big ? "utf-16be" : "utf-8", { fatal: true }).decode(
    bytes,
  );
}

/** Native stream owns its external-relation cache and package-relative source directory. */
export class OOXMLStreamImpl {
  private readonly maIdCache = new Map<string, string>();
  private msPath = "";
  private msTarget = "";
  private document: Uint8Array | null = null;
  private relationships: readonly (readonly StringPair[])[] = [];
  /** Borrows storage; createStream supplies async native constructor initialization. @param storage - Package. @returns Stream. */
  private constructor(readonly storage: ZipStorage) {}
  /** Original document/type/id constructor paths, including VBA data's project intermediate. @param source - Storage or parent stream. @param type - Stream type or relation ID. @returns Stream. */
  static async createStream(
    source: ZipStorage | OOXMLStreamImpl,
    type: T | string = T.DOCUMENT,
  ): Promise<OOXMLStreamImpl> {
    if (type === T.VBADATA && source instanceof OOXMLStreamImpl) {
      const project = await OOXMLStreamImpl.createStream(source, T.VBAPROJECT);
      return OOXMLStreamImpl.fromParent(project, type);
    }
    return OOXMLStreamImpl.fromParent(source, type);
  }
  /** Native constructor initialization follows one resolved part, then resets the cache for its own relationships. @param source - Storage or parent. @param type - Type or ID. @returns Initialized stream. */
  private static async fromParent(
    source: ZipStorage | OOXMLStreamImpl,
    type: T | string,
  ): Promise<OOXMLStreamImpl> {
    const parent = source instanceof OOXMLStreamImpl ? source : null;
    if (parent && parent.document === null)
      throw new Error("OOXML parent document stream is missing.");
    const result = new OOXMLStreamImpl(parent ? parent.storage : (source as ZipStorage));
    result.msPath = parent?.msPath ?? "";
    const relations = parent ? parent.relationships : await result.readRelations("");
    const target = result.lcl_getTarget(
      relations,
      typeof type === "string" ? T.UNKNOWN : type,
      typeof type === "string" ? type : "",
    );
    if (target !== null) {
      result.msTarget = target;
      const lastSlash = target.lastIndexOf("/");
      if (lastSlash >= 0) result.msPath = target.slice(0, lastSlash + 1);
      result.document = await result.storage.openInputStream(target);
      if (result.document === null)
        throw new Error("OOXML relationship target stream is missing: " + target);
      result.maIdCache.clear();
      result.relationships = await result.readRelations(target);
    }
    return result;
  }
  /** Reads the storage relationship side stream through the native sequence helper. @param target - Part or root. @returns Ordered relationship sequence. */
  private async readRelations(target: string): Promise<readonly (readonly StringPair[])[]> {
    const slash = target.lastIndexOf("/"),
      directory = target.slice(0, slash + 1),
      basename = target.slice(slash + 1);
    const bytes = await this.storage.openInputStream(directory + "_rels/" + basename + ".rels");
    return bytes === null ? [] : ReadRelationsInfoSequence(decode(bytes));
  }
  /** Original lexical target getter. @returns Target. */ getTarget(): string {
    return this.msTarget;
  }
  /** Borrows the immutable opened input part. @returns Bytes or missing stream. */ getDocumentStream(): Uint8Array | null {
    return this.document;
  }
  /** Decodes XML when the caller consumes the document SAX stream. @returns XML or null. */ getDocumentXml():
    string | null {
    return this.document === null ? null : decode(this.document);
  }
  /** Original ID lookup is relative to the opened stream's relationships. @param id - Relationship ID. @returns Target or empty. */
  getTargetForId(id: string): string {
    return this.lcl_getTarget(this.relationships, T.UNKNOWN, id) ?? "";
  }
  /** Native ordered attribute scan, external cache and strict/transitional exact type matching. @param relations - XRelationshipAccess sequence. @param type - Selector. @param id - ID. @returns Target or no match. */
  private lcl_getTarget(
    relations: readonly (readonly StringPair[])[],
    type: T,
    id: string,
  ): string | null {
    if (this.maIdCache.size === 0) {
      for (const sequence of relations) {
        let relationId = "",
          target = "",
          external = false;
        for (const pair of sequence) {
          if (pair.First === "Id") relationId = pair.Second;
          else if (pair.First === "Target") target = pair.Second;
          else if (pair.First === "TargetMode" && pair.Second === "External") external = true;
        }
        if (external || target.startsWith("#")) this.maIdCache.set(relationId, target);
      }
    }
    const cached = this.maIdCache.get(id);
    if (cached !== undefined) return cached;
    const suffix = suffixes[type];
    let typeName = suffix === undefined ? "" : transitional + suffix,
      strictName = suffix === undefined ? "" : strict + suffix;
    if (type === T.COMMENTS_EXTENDED)
      typeName = strictName =
        "http://schemas.microsoft.com/office/2011/relationships/commentsExtended";
    else if (type === T.VBAPROJECT)
      typeName = strictName = "http://schemas.microsoft.com/office/2006/relationships/vbaProject";
    else if (type === T.VBADATA)
      typeName = strictName = "http://schemas.microsoft.com/office/2006/relationships/wordVbaData";
    let found = false;
    for (const sequence of relations) {
      let external = false,
        target = "";
      for (const pair of sequence) {
        if (pair.First === "Type" && (pair.Second === typeName || pair.Second === strictName))
          found = true;
        else if (
          pair.First === "Type" &&
          type === T.EMBEDDINGS &&
          (pair.Second === transitional + "oleObject" || pair.Second === strict + "oleObject")
        )
          found = true;
        else if (pair.First === "Id" && pair.Second === id) found = true;
        else if (pair.First === "Target") {
          if (
            streamTargets.customTarget !== pair.Second &&
            (type === T.CUSTOMXML || type === T.CHARTS || type === T.FOOTER || type === T.HEADER)
          )
            found = false;
          else target = pair.Second;
        } else if (pair.First === "TargetMode" && pair.Second === "External") external = true;
      }
      if (found) {
        if (external) return target;
        const absolute = uriFactory.makeAbsolute(
          uriFactory.parse("file:///" + this.msPath),
          uriFactory.parse(target),
          true,
          Excess.RETAIN,
        );
        if (absolute === null) return null;
        const resolved = absolute.getPath().slice(1);
        if (type === T.EMBEDDINGS) streamTargets.embeddingsTarget = resolved;
        return resolved;
      }
    }
    return null;
  }
}
