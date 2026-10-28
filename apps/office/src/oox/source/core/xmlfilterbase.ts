/** @fileoverview Ports consumed XmlFilterBase XML-fragment import, cached relationship ownership, output fragment MIME and relation export; ZIP and SAX adaptation remains below this boundary. */
import { StaticNamespaceMap } from "../token/namespacemap";
import { FastSerializerHelper } from "../../../sax/inc/fshelper";
import { FastTokenHandler } from "./fasttokenhandler";
import type { SaxesTagNS } from "saxes";
import {
  parseFastXmlStream,
  type FastXmlParseOptions,
} from "../../../sax/source/fastparser/fastparser";
import {
  WriteRelationsInfoSequence,
  type StringPair,
} from "../../../comphelper/source/xml/ofopxmlhelper";
import { ZipStorage, type ZipFragmentStream } from "../helper/zipstorage";
import { type FragmentContext, type FragmentHandler } from "./fragmenthandler";
import { OFFICE_DOCUMENT_RELATION, STRICT_OFFICE_DOCUMENT_RELATION, Relations } from "./relations";
import { RelationsFragment, getRelationsPath } from "./relationshandler";
import { decodeToIUri } from "../../../tools/source/fsys/urlobj";

import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { OUString } from "../../../sal/inc/rtl/ustring";

/** Native filter base owns package-scoped and per-fragment relationship collections. */
export class XmlFilterBase {
  private readonly relations = new Map<string, Promise<Relations>>();
  private readonly outputRelations = new Map<
    string,
    { stream?: ZipFragmentStream; entries: StringPair[][] }
  >();
  private relId = 1;
  /** Retains actual storage and cooperative SAX controls. @param storage - Package. @param options - Parser controls. @returns Filter. */
  constructor(
    protected readonly storage: ZipStorage,
    private readonly options: FastXmlParseOptions = {},
  ) {}
  /** Original export query always uses the transitional namespace map and returns empty when absent. @param namespace - Native generated namespace identity. @returns Namespace URI or empty. */
  getNamespaceURL(namespace: number): string {
    return StaticNamespaceMap().maTransitionalNamespaceMap.get(namespace) ?? "";
  }
  /** Opens an exact input fragment without imposing ODF requirements. @param path - Fragment path. @returns Owned native input reference. */
  openInputStream(path: string): Promise<Reference<XInputStream>> {
    return this.storage.openInputStream(path);
  }
  /** Ports the native SAX overload's false-on-missing/parse-error behavior and basename lowercase fallback. @param handler - Fragment handler. @returns Successful parse. */
  async importFragment(handler: FragmentHandler | null): Promise<boolean> {
    if (!handler || handler.getFragmentPath() === "") return false;
    let path = handler.getFragmentPath();
    // Binary record fragments need their own RecordParser; this XML slice does not claim XLSB support.
    if (path.endsWith(".bin")) return false;
    let stream: Reference<XInputStream> | null = null;
    const source = new InputSource();
    try {
      stream = await handler.openFragmentStream();
      if (!stream.is()) {
        const length = path.lastIndexOf("/") + 1,
          file = path.slice(length);
        const lower = file.replace(
          /[A-Z]/g,
          /** Native ASCII lower. @param c - Capital. @returns Lowercase. */ (c) => c.toLowerCase(),
        );
        if (file !== lower) {
          path = path.slice(0, length) + lower;
          const fallback = await this.openInputStream(path);
          stream.moveAssign(fallback);
          fallback.dispose();
        }
      }
      if (!stream.is()) return false;
      source.aInputStream = stream;
      const systemId = new OUString(
        Uint16Array.from(
          path.split(""),
          /** Preserves original UTF16 path units. @param c - Unit. @returns Code. */ (c) =>
            c.charCodeAt(0),
        ),
        path.length,
      );
      source.sSystemId = systemId;
      systemId.dispose();
      const stack: { context: FragmentContext | null; tag: SaxesTagNS }[] = [];
      handler.startDocument();
      parseFastXmlStream(
        source,
        {
          /** Resolves one child context; a rejected subtree receives no callbacks. @param tag - Expanded tag. @param attributes - Attributes. @returns Nothing. */
          open(tag, attributes) {
            const parent =
              stack.length === 0
                ? handler
                : (stack[stack.length - 1] as { context: FragmentContext | null }).context;
            const context = parent?.createFastChildContext(tag, attributes) ?? null;
            stack.push({ context, tag });
            context?.startFastElement(tag, attributes);
          },
          /** Delivers only to the active context. @param value - Text. @returns Nothing. */
          characters(value) {
            stack[stack.length - 1]?.context?.characters(value);
          },
          /** Completes one context. @returns Nothing. */
          close() {
            const entry = stack.pop() as { context: FragmentContext | null; tag: SaxesTagNS };
            entry.context?.endFastElement(entry.tag);
          },
        },
        this.options,
      );
      handler.endDocument();
      return true;
    } catch (error) {
      if (error instanceof Exception) error.dispose();
      return false;
    } finally {
      source.dispose();
      stream?.dispose();
    }
  }
  /** Caches even missing/partially parsed native relation collections. @param path - Owning fragment. @returns Shared collection. */
  importRelations(path: string): Promise<Relations> {
    let pending = this.relations.get(path);
    if (pending === undefined) {
      const relations = new Relations(path);
      pending = this.importFragment(new RelationsFragment(this, relations)).then(
        /** Retains original partial results after any parser failure. @returns Relations. */ () =>
          relations,
      );
      this.relations.set(path, pending);
    }
    return pending;
  }
  /** Native package-root transitional-first, strict fallback uses resolved path emptiness. @param part - Unqualified relation type. @returns Fragment path or empty. */
  async getFragmentPathFromFirstTypeFromOfficeDoc(part: string): Promise<string> {
    const relations = await this.importRelations("");
    return (
      relations.getFragmentPathFromFirstType(OFFICE_DOCUMENT_RELATION + part) ||
      relations.getFragmentPathFromFirstType(STRICT_OFFICE_DOCUMENT_RELATION + part)
    );
  }
  /** Opens a typed output stream as the native filter does. @param name - Part path. @param mediaType - MIME. @returns Stream. */
  openFragmentStream(name: string, mediaType: string): ZipFragmentStream {
    return this.storage.openOutputStream(name, mediaType);
  }
  /** Adds a root relationship with the native global counter. @param type - Type. @param target - Target. @returns ID. */
  addRelation(type: string, target: string): string;
  /** Adds a part-local relationship with its native stream counter. @param stream - Owning stream. @param type - Type. @param target - Target. @param external - External mode. @returns ID. */
  addRelation(stream: ZipFragmentStream, type: string, target: string, external?: boolean): string;
  /** Implements original root/stream relation ownership and IURI target conversion. @param first - Stream or type. @param second - Type or target. @param target - Part target. @param external - External mode. @returns ID. */
  addRelation(
    first: string | ZipFragmentStream,
    second: string,
    target?: string,
    external = false,
  ): string {
    const stream = typeof first === "string" ? undefined : first;
    const type = typeof first === "string" ? first : second;
    const value = typeof first === "string" ? second : (target as string);
    const id = "rId" + (stream === undefined ? this.relId++ : stream.GetNewRelId());
    const owner = stream?.path ?? "";
    let output = this.outputRelations.get(owner);
    if (output === undefined || output.stream !== stream) {
      output = { ...(stream === undefined ? {} : { stream }), entries: [] };
      this.outputRelations.set(owner, output);
    }
    const entry = [
      { First: "Id", Second: id },
      { First: "Type", Second: type },
      { First: "Target", Second: decodeToIUri(value) },
    ];
    if (external) entry.push({ First: "TargetMode", Second: "External" });
    output.entries.push(entry);
    return id;
  }
  /** Original XML serializer factory preserves no-header and VML media-type admission. The actual lexical token service is injected at this component boundary. @param name - Fragment path. @param mediaType - MIME. @param noHeader - Original caller override. @returns Owned serializer helper. */
  openFragmentStreamWithSerializer(
    name: string,
    mediaType: string,
    noHeader = false,
  ): FastSerializerHelper {
    const header = !noHeader && (!mediaType.includes("vml") || mediaType.includes("+xml"));
    return new FastSerializerHelper(
      this.openFragmentStream(name, mediaType),
      header,
      new FastTokenHandler(),
    );
  }
  /** Commits original relationship streams before the storage transaction. @returns OOXML bytes. */
  commitStorage(): Uint8Array {
    for (const [path, output] of this.outputRelations) {
      const stream = this.storage.openOutputStream(
        getRelationsPath(path),
        "application/vnd.openxmlformats-package.relationships+xml",
      );
      stream.writeBytes(new TextEncoder().encode(WriteRelationsInfoSequence(output.entries)));
      stream.closeOutput();
    }
    return this.storage.commit();
  }
}
