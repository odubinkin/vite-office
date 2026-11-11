/** @fileoverview Native OOXMLDocument fast substream parsing, relationship input and note/progress fields. Complete resolve, shape/DOM ownership and model statistics remain unported. */
import type { OOXMLDocument as DocumentContract } from "../inc/ooxml/OOXMLDocument";
import type { XStatusIndicator } from "../../../../offapi/com/sun/star/task/XStatusIndicator";
import { OOXMLStreamImpl } from "./OOXMLStreamImpl";
import type { Stream } from "../inc/dmapper/resourcemodel";
import { StreamType_t } from "../inc/ooxml/OOXMLDocument";
import { OOXMLFastDocumentHandler } from "./OOXMLFastDocumentHandler";
import { InputSource } from "../../../../offapi/com/sun/star/xml/sax/InputSource";
import { Exception } from "../../../../cppu/inc/com/sun/star/uno/Exception";
import type { Reference } from "../../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInputStream } from "../../../../udkapi/com/sun/star/io/XInputStream";

/** Original document owner for represented stream identity and parser-state callbacks; no complete import entry point is advertised. */
export class OOXMLDocument implements DocumentContract {
  private mnXNoteId = 0;
  private mnPercentSize = 0;
  private mnProgressLastPos = 0;
  private mnProgressCurrentPos = 0;
  private mnProgressEndPos = 0;
  private ownedStream: OOXMLStreamImpl | null = null;
  /** Borrows the original opened stream and status callback; other native constructor services are unported rather than replaced by dummy providers. @param mpStream - Actual package stream. @param mxStatusIndicator - Actual indicator or null. @returns Owner. */
  constructor(
    private mpStream: OOXMLStreamImpl,
    private readonly mxStatusIndicator: XStatusIndicator | null,
  ) {}
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
