/** @fileoverview Ports native Writer OOXMLStreamImpl target lookup, external cache and relative URI resolution over shared ZIP input; distinct from oox::Relations. */
import { ReadRelationsInfoSequence } from "../../../../comphelper/source/xml/ofopxmlhelper";
import { Sequence, type SequenceElements } from "../../../../cppu/inc/com/sun/star/uno/Sequence";
import type { uno_Sequence } from "../../../../cppu/inc/uno/sequence2";
import {
  StringPair,
  cppu_detail_getUnoType_StringPair as pairType,
} from "../../../../udkapi/com/sun/star/beans/StringPair";
import type { OUStringConstReference } from "../../../../sal/inc/rtl/ustring";
const Pairs = Sequence.specialize<StringPair>(pairType, 16);
const Relations = Sequence.specialize<Sequence<StringPair>>(["Sequence", pairType], 8);
/** Existing URI binding reads exact UTF16 units from a borrowed field. @param value - Native string. @returns Host URI text. */
function text(value: OUStringConstReference): string {
  let result = "";
  const units = value.getStr();
  for (let i = 0; i < value.getLength(); ++i) result += String.fromCharCode(units[i] as number);
  return result;
}
import { ZipStorage } from "../../../../oox/source/helper/zipstorage";
import { FastTokenHandler } from "../../../../oox/source/core/fasttokenhandler";
import { FastSaxParser } from "../../../../sax/source/fastparser/fastparser";
import { streamNamespaces } from "./OOXMLFactory.tables";
import {
  UriReferenceFactory,
  RelativeUriExcessParentSegments as Excess,
} from "../../../../stoc/source/uriproc/UriReferenceFactory";
import { StreamType_t as T } from "../inc/ooxml/OOXMLDocument";

import { Reference, UNO_QUERY_THROW } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import { XRelationshipAccess } from "../../../../offapi/com/sun/star/embed/XRelationshipAccess";
import { XStream } from "../../../../udkapi/com/sun/star/io/XStream";
import type { XInputStream } from "../../../../udkapi/com/sun/star/io/XInputStream";
import { InputSource } from "../../../../offapi/com/sun/star/xml/sax/InputSource";

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

/** Native stream owns its external-relation cache and package-relative source directory. */
export class OOXMLStreamImpl {
  private readonly maIdCache = new Map<string, string>();
  private msPath = "";
  private msTarget = "";
  private readonly document = new Reference<XStream>();
  private fastTokenHandler: FastTokenHandler | null = null;
  private fastParser: FastSaxParser | null = null;
  /** Borrows storage; createStream supplies async native constructor initialization. @param storage - Package. @returns Stream. */
  private constructor(readonly storage: ZipStorage) {}
  /** Original document/type/id constructor paths, including VBA data's project intermediate. @param source - Storage or parent stream. @param type - Stream type or relation ID. @returns Stream. */
  static async createStream(
    source: ZipStorage | OOXMLStreamImpl,
    type: T | string = T.DOCUMENT,
  ): Promise<OOXMLStreamImpl> {
    if (type === T.VBADATA && source instanceof OOXMLStreamImpl) {
      const project = await OOXMLStreamImpl.createStream(source, T.VBAPROJECT);
      try {
        return await OOXMLStreamImpl.fromParent(project, type);
      } finally {
        project.dispose();
      }
    }
    return OOXMLStreamImpl.fromParent(source, type);
  }
  /** Native constructor initialization follows one resolved part, then resets the cache for its own relationships. @param source - Storage or parent. @param type - Type or ID. @returns Initialized stream. */
  private static async fromParent(
    source: ZipStorage | OOXMLStreamImpl,
    type: T | string,
  ): Promise<OOXMLStreamImpl> {
    const parent = source instanceof OOXMLStreamImpl ? source : null;
    if (parent && !parent.document.is())
      throw new Error("OOXML parent document stream is missing.");
    const result = new OOXMLStreamImpl(parent ? parent.storage : (source as ZipStorage));
    result.msPath = parent?.msPath ?? "";
    let relations: Sequence<Sequence<StringPair>> | undefined;
    try {
      relations = parent ? parent.getRelationships() : await result.readRootRelationships();
      const target = result.lcl_getTarget(
        relations,
        typeof type === "string" ? T.UNKNOWN : type,
        typeof type === "string" ? type : "",
      );
      if (target !== null) {
        result.msTarget = target;
        const lastSlash = target.lastIndexOf("/");
        if (lastSlash >= 0) result.msPath = target.slice(0, lastSlash + 1);
        const input = await result.storage.openInputStream(target);
        try {
          if (!input.is())
            throw new Error("OOXML relationship target stream is missing: " + target);
          const stream = new Reference<XStream>(input, UNO_QUERY_THROW, XStream.static_type);
          result.document.moveAssign(stream);
          stream.dispose();
          result.maIdCache.clear();
        } finally {
          input.dispose();
        }
      }
    } catch (error) {
      result.dispose();
      throw error;
    } finally {
      relations?.dispose();
    }
    return result;
  }
  /** Root storage relationship binding until the complete XStorage component exists. Part relationships are obtained from the actual input component. @returns Ordered root relationship sequence. */
  private async readRootRelationships(): Promise<Sequence<Sequence<StringPair>>> {
    const input = await this.storage.openInputStream("_rels/.rels");
    const source = new InputSource();
    try {
      if (!input.is()) return new Relations();
      source.aInputStream = input;
      return ReadRelationsInfoSequence(source);
    } finally {
      source.dispose();
      input.dispose();
    }
  }
  /** Original lexical target getter. @returns Target. */ getTarget(): string {
    return this.msTarget;
  }
  /** Native stream lazily owns the token handler shared by its parser contexts. @returns Handler. */
  getFastTokenHandler(): FastTokenHandler {
    this.fastTokenHandler ??= new FastTokenHandler();
    return this.fastTokenHandler;
  }
  /** Native generated stream lazily owns its synchronous parser and registers each URI once in sorted order. @returns Parser. */
  getFastParser(): FastSaxParser {
    if (!this.fastParser) {
      this.fastParser = new FastSaxParser();
      for (const [uri, token] of streamNamespaces) this.fastParser.registerNamespace(uri, token);
    }
    return this.fastParser;
  }
  /** Original input reference return shares the current stream position; it is not an independent byte copy. @returns Owned input reference, possibly empty. */
  getDocumentStream(): Reference<XInputStream> {
    return this.document.is()
      ? (this.document.get() as XStream).getInputStream()
      : new Reference<XInputStream>();
  }
  /** Releases parser/locator then input ownership; the actual XStream owns readonly relationships and property metadata. @returns Nothing. */
  dispose(): void {
    this.fastParser?.dispose();
    this.document.dispose();
  }
  /** Original ID lookup is relative to the opened stream's relationships. @param id - Relationship ID. @returns Target or empty. */
  getTargetForId(id: string): string {
    const relations = this.getRelationships();
    try {
      return this.lcl_getTarget(relations, T.UNKNOWN, id) ?? "";
    } finally {
      relations.dispose();
    }
  }
  /** Original query-throw relationship interface on the document stream; no second side-stream parse or private metadata mirror is used for parts. @returns Owned relationship value. */
  private getRelationships(): Sequence<Sequence<StringPair>> {
    const access = new Reference<XRelationshipAccess>(
      this.document,
      UNO_QUERY_THROW,
      XRelationshipAccess.static_type,
    );
    try {
      return (access.get() as XRelationshipAccess).getAllRelationships();
    } finally {
      access.dispose();
    }
  }
  /** Native ordered attribute scan, external cache and strict/transitional exact type matching. @param relations - XRelationshipAccess sequence. @param type - Selector. @param id - ID. @returns Target or no match. */
  private lcl_getTarget(
    relations: Sequence<Sequence<StringPair>>,
    type: T,
    id: string,
  ): string | null {
    if (this.maIdCache.size === 0) {
      for (let i = 0; i < relations.getLength(); ++i) {
        const sequence = Sequence.unacquired(
          Pairs,
          (relations.getConstArray() as SequenceElements).get(i * 8) as [uno_Sequence | null],
        );
        let relationId = "",
          target = "",
          external = false;
        for (let j = 0; j < sequence.getLength(); ++j) {
          const pair = StringPair.unacquired(
            (sequence.getConstArray() as SequenceElements).get(j * 16) as SequenceElements,
          );
          const first = text(pair.First),
            second = text(pair.Second);
          if (first === "Id") relationId = second;
          else if (first === "Target") target = second;
          else if (first === "TargetMode" && second === "External") external = true;
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
    for (let i = 0; i < relations.getLength(); ++i) {
      const sequence = Sequence.unacquired(
        Pairs,
        (relations.getConstArray() as SequenceElements).get(i * 8) as [uno_Sequence | null],
      );
      let external = false,
        target = "";
      for (let j = 0; j < sequence.getLength(); ++j) {
        const pair = StringPair.unacquired(
          (sequence.getConstArray() as SequenceElements).get(j * 16) as SequenceElements,
        );
        const first = text(pair.First),
          second = text(pair.Second);
        if (first === "Type" && (second === typeName || second === strictName)) found = true;
        else if (
          first === "Type" &&
          type === T.EMBEDDINGS &&
          (second === transitional + "oleObject" || second === strict + "oleObject")
        )
          found = true;
        else if (first === "Id" && second === id) found = true;
        else if (first === "Target") {
          if (
            streamTargets.customTarget !== second &&
            (type === T.CUSTOMXML || type === T.CHARTS || type === T.FOOTER || type === T.HEADER)
          )
            found = false;
          else target = second;
        } else if (first === "TargetMode" && second === "External") external = true;
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
