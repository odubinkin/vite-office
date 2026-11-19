/** @fileoverview Native OOXMLDocument dispatch for the main text, relationship-selected theme and service parts, and note/progress state. */
import type { OOXMLDocument as DocumentContract } from "../inc/ooxml/OOXMLDocument";
import type { XStatusIndicator } from "../../../../offapi/com/sun/star/task/XStatusIndicator";
import { OOXMLStreamImpl } from "./OOXMLStreamImpl";
import type { Stream } from "../inc/dmapper/resourcemodel";
import { StreamType_t } from "../inc/ooxml/OOXMLDocument";
import { OOXMLFastDocumentHandler } from "./OOXMLFastDocumentHandler";
import { InputSource } from "../../../../offapi/com/sun/star/xml/sax/InputSource";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import { Reference, UNO_QUERY_THROW } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInputStream } from "../../../../udkapi/com/sun/star/io/XInputStream";
import { XSeekable } from "../../../../udkapi/com/sun/star/io/XSeekable";
import { NS_ooxml as N } from "../inc/ooxml/resourceids";
import { OUString } from "../../../../sal/inc/rtl/ustring";
import { ThemeFragmentHandler } from "../../../../oox/source/drawingml/themefragmenthandler";
import { XmlFilterBase } from "../../../../oox/source/core/xmlfilterbase";
import { BlipContext } from "../../../../oox/source/drawingml/misccontexts";
import type { EmbeddedGraphic } from "../../../../oox/source/helper/graphichelper";
import type { Theme } from "../../../../docmodel/inc/theme/Theme";

/** Original document owner for represented stream identity and parser-state callbacks; no complete import entry point is advertised. */
export class OOXMLDocument implements DocumentContract {
  private mnXNoteId = 0;
  private mnPercentSize = 0;
  private mnProgressLastPos = 0;
  private mnProgressCurrentPos = 0;
  private mnProgressEndPos = 0;
  private ownedStream: OOXMLStreamImpl | null = null;
  private readonly headerFooterStreams = new Map<
    string,
    OOXMLStreamImpl | { readonly failure: unknown }
  >();
  /** Borrows the original opened stream and status callback; other native constructor services are unported rather than replaced by dummy providers. @param mpStream - Actual package stream. @param mxStatusIndicator - Actual indicator or null. @param shapeFilter - Shared DrawingML package owner. @param fragmentGraphics - Prepared package images by part. @returns Owner. */
  constructor(
    private mpStream: OOXMLStreamImpl,
    private readonly mxStatusIndicator: XStatusIndicator | null,
    private readonly shapeFilter = new XmlFilterBase(mpStream.storage),
    private readonly fragmentGraphics = new Map<string, ReadonlyMap<string, EmbeddedGraphic>>(),
  ) {}
  /** Resolves pre-body filter parts in source order, then parses the main document on the shared mapper. @param handler - Actual Writer resource receiver. @param installTheme - Optional native document theme sink. @returns Completion. */
  async resolve(handler: Stream, installTheme?: (theme: Theme) => void): Promise<void> {
    const input = this.mpStream.getDocumentStream();
    try {
      if (!input.is()) throw new Error("Word document part is missing.");
      await this.resolveFastSubStream(handler, StreamType_t.SETTINGS);
      const theme = await this.resolveTheme();
      if (theme) installTheme?.(theme);
      for (const type of [StreamType_t.FONTTABLE, StreamType_t.STYLES, StreamType_t.NUMBERING]) {
        await this.resolveFastSubStream(handler, type);
      }
      if (handler.substream)
        for (const id of this.mpStream.getHeaderFooterIds()) {
          try {
            this.headerFooterStreams.set(id, await OOXMLStreamImpl.createStream(this.mpStream, id));
          } catch (error) {
            if (error instanceof Exception) error.dispose();
            else this.headerFooterStreams.set(id, { failure: error });
          }
        }
      if (handler.picture) {
        await this.prepareEmbeddedGraphics(this.mpStream.getTarget());
        for (const part of this.headerFooterStreams.values()) {
          if (part instanceof OOXMLStreamImpl) await this.prepareEmbeddedGraphics(part.getTarget());
        }
      }
      const parser = this.mpStream.getFastParser();
      const receiver = new OOXMLFastDocumentHandler(handler, this, this.mnXNoteId);
      parser.setFastDocumentHandler(receiver);
      parser.setTokenHandler(this.mpStream.getFastTokenHandler());
      const source = new InputSource();
      const target = OUString.fromUtf8(new TextEncoder().encode(this.mpStream.getTarget()));
      try {
        source.sSystemId = target;
        source.aInputStream = input;
        parser.parseStream(source);
        if (!receiver.sawDocumentElement()) throw new Error("Word document element is missing.");
      } finally {
        target.dispose();
        source.dispose();
      }
    } finally {
      for (const stream of this.headerFooterStreams.values())
        if (stream instanceof OOXMLStreamImpl) stream.dispose();
      this.headerFooterStreams.clear();
      input.dispose();
    }
  }
  /** Maps the native header type before entering the document receiver's substream context. @param stream - Body receiver. @param type - Native page type. @param id - Package relationship. @returns Nothing. */
  resolveHeader(stream: Stream, type: number, id: string): void {
    this.resolveHeaderFooter(stream, type, id, N.LN_headerl, N.LN_headerr, N.LN_headerf);
  }
  /** Maps the native footer type before entering the document receiver's substream context. @param stream - Body receiver. @param type - Native page type. @param id - Package relationship. @returns Nothing. */
  resolveFooter(stream: Stream, type: number, id: string): void {
    this.resolveHeaderFooter(stream, type, id, N.LN_footerl, N.LN_footerr, N.LN_footerf);
  }
  /** Resolves one original part reference with the part's own relationship and SAX context. @param receiver - Body receiver. @param type - Native page type. @param id - Package relationship. @param even - Native even substream ID. @param normal - Native default substream ID. @param first - Native first substream ID. @returns Nothing. */
  private resolveHeaderFooter(
    receiver: Stream,
    type: number,
    id: string,
    even: number,
    normal: number,
    first: number,
  ): void {
    const kind =
      type === N.LN_Value_ST_HdrFtr_even
        ? even
        : type === N.LN_Value_ST_HdrFtr_default
          ? normal
          : type === N.LN_Value_ST_HdrFtr_first
            ? first
            : undefined;
    if (kind === undefined) return;
    if (!receiver.substream)
      throw new Error("The Writer receiver does not support header/footer content.");
    const part = this.headerFooterStreams.get(id);
    if (!part) return;
    if ("failure" in part) throw part.failure;
    const { shapeFilter, fragmentGraphics } = this;
    receiver.substream(kind, {
      /** Rewinds the local package part for each reference and resolves its native stream. @param handler - Active header/footer receiver. @returns Nothing. */
      resolve(handler: Stream): void {
        const input = part.getDocumentStream();
        try {
          if (!input.is()) return;
          const seekable = new Reference<XSeekable>(input, UNO_QUERY_THROW, XSeekable.static_type);
          try {
            seekable.operatorStar().seek(0n);
          } finally {
            seekable.dispose();
          }
          const parser = part.getFastParser();
          const document = new OOXMLDocument(part, null, shapeFilter, fragmentGraphics);
          const context = new OOXMLFastDocumentHandler(handler, document, 0);
          context.setIsSubstream(true);
          parser.setFastDocumentHandler(context);
          parser.setTokenHandler(part.getFastTokenHandler());
          const source = new InputSource();
          try {
            source.aInputStream = input;
            parser.parseStream(source);
          } finally {
            source.dispose();
            document.dispose();
          }
        } finally {
          input.dispose();
        }
      },
    });
  }
  /** Uses the native Word relationship target with the original shared DrawingML theme fragment owner. @returns Imported theme or absence. */
  private async resolveTheme(): Promise<Theme | undefined> {
    const stream = await OOXMLStreamImpl.createStream(this.mpStream, StreamType_t.THEME);
    try {
      const path = stream.getTarget();
      if (!path) return undefined;
      const filter = new XmlFilterBase(stream.storage);
      const fragment = new ThemeFragmentHandler(filter, path);
      if (await filter.importFragment(fragment)) return fragment.theme;
      return undefined;
    } finally {
      stream.dispose();
    }
  }
  /** Original relationship-selected service-part path. Only UNO opening errors are swallowed. Parse/close failures propagate and deliberately leave mpStream switched, as in the pinned source. Async opening is the existing ZIP decompression binding. @param rStreamHandler - Actual resource receiver. @param nType - Native stream selector. @returns Completion. */
  async resolveFastSubStream(rStreamHandler: Stream, nType: StreamType_t): Promise<void> {
    let stream: OOXMLStreamImpl;
    try {
      stream = await OOXMLStreamImpl.createStream(this.mpStream, nType);
    } catch (error) {
      if (!(error instanceof Exception)) throw error;
      error.dispose();
      return;
    }
    const savedStream = this.mpStream;
    const savedOwnedStream = this.ownedStream;
    this.ownedStream = stream;
    this.mpStream = stream;
    try {
      const parser = stream.getFastParser();
      parser.setFastDocumentHandler(
        new OOXMLFastDocumentHandler(rStreamHandler, this, this.mnXNoteId),
      );
      parser.setTokenHandler(stream.getFastTokenHandler());
      const input = stream.getDocumentStream();
      try {
        if (input.is()) {
          const source = new InputSource();
          try {
            source.aInputStream = input;
            parser.parseStream(source);
            (input.get() as XInputStream).closeInput();
          } finally {
            source.dispose();
          }
        }
      } finally {
        input.dispose();
      }
    } catch (error) {
      savedOwnedStream?.dispose();
      throw error;
    }
    this.mpStream = savedStream;
    this.ownedStream = savedOwnedStream;
    stream.dispose();
  }
  /** Resolves package I/O before the synchronous native SAX callbacks. @param fragment - Active body or story fragment. @returns Completion. */
  private async prepareEmbeddedGraphics(fragment: string): Promise<void> {
    if (this.fragmentGraphics.has(fragment)) return;
    const relations = await this.shapeFilter.importRelations(fragment);
    const graphics = new Map<string, EmbeddedGraphic>();
    const blip = new BlipContext(this.shapeFilter, fragment);
    for (const [id, relation] of relations.getRelationsFromTypeFromOfficeDoc("image").entries()) {
      if (relation.mbExternal) continue;
      const image = await blip.importEmbeddedGraphic(id);
      if (image) graphics.set(id, image);
    }
    this.fragmentGraphics.set(fragment, graphics);
  }
  /** Reads the embedded graphic in the active part's relationship scope. @param id - Fragment-relative relationship ID. @returns Prepared graphic. */
  getEmbeddedGraphic(id: string): EmbeddedGraphic | undefined {
    return this.fragmentGraphics.get(this.mpStream.getTarget())?.get(id);
  }
  /** Original input getter returns an owning input reference after destruction of its temporary package stream. Missing relationships return an empty reference; opening errors propagate. @param id - Original relationship identity in the current stream. @returns Owned input reference. */
  async getInputStreamForId(id: string): Promise<Reference<XInputStream>> {
    const stream = await OOXMLStreamImpl.createStream(this.mpStream, id);
    try {
      return stream.getDocumentStream();
    } finally {
      stream.dispose();
    }
  }
  /** Releases substreams retained by an exceptional native parse. The constructor's stream and status interface remain borrowed by this represented owner. @returns Nothing. */
  dispose(): void {
    this.ownedStream?.dispose();
    this.ownedStream = null;
  }
  /** Original signed32 note identity assignment. @param id - Native note ID. @returns Nothing. */
  setXNoteId(id: number): void {
    this.mnXNoteId = id | 0;
  }
  /** Original stored note identity. @returns Signed32 ID. */
  getXNoteId(): number {
    return this.mnXNoteId;
  }
  /** Original borrowed current stream target, using the stream's existing immutable UTF16 host binding. @returns Target. */
  getTarget(): string {
    return this.mpStream.getTarget();
  }
  /** Original delegation preserves stream-relative and external-ID cache rules. @param id - Native relationship ID binding. @returns Resolved target or empty. */
  getTargetForId(id: string): string {
    return this.mpStream.getTargetForId(id);
  }
  /** Original paragraph progress increments even without known statistics. Positive-end initialization belongs to unported resolve/model statistics; no artificial setter is introduced. @returns Nothing. */
  incrementProgress(): void {
    this.mnProgressCurrentPos++;
    if (
      this.mnProgressEndPos &&
      this.mnProgressCurrentPos > this.mnProgressLastPos + this.mnPercentSize &&
      this.mnProgressLastPos < this.mnProgressEndPos
    ) {
      this.mnProgressLastPos = this.mnProgressCurrentPos;
      if (this.mxStatusIndicator) this.mxStatusIndicator.setValue(this.mnProgressLastPos);
    }
  }
}
