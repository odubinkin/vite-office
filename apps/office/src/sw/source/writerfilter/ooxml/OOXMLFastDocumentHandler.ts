/** @fileoverview Native lazy root context, original root/unknown dispatch, note/forward initialization and substream section state. Diagnostic-only SAX hooks are inert in this release binding. */
import type { Stream } from "../inc/dmapper/resourcemodel";
import type { OOXMLDocument } from "../inc/ooxml/OOXMLDocument";
import { OOXMLFastContextHandler } from "./OOXMLFastContextHandler";
import { OOXMLFactory } from "./OOXMLFactory";
import type { FastDocument } from "../../../../sax/source/fastparser/fastparser";

/** Native document SAX handler borrows its stream and document for one parse. */
export class OOXMLFastDocumentHandler implements FastDocument {
  private mxContextHandler: OOXMLFastContextHandler | null = null;
  /** Native context-service parameter is omitted from host transport; no UNO service is registered. @param mpStream - Stream or null for unknown root. @param mpDocument - Document or null. @param mnXNoteId - Current note identity. @returns Handler. */
  constructor(
    private readonly mpStream: Stream | null,
    private readonly mpDocument: OOXMLDocument | null,
    private readonly mnXNoteId: number,
  ) {}
  /** Original lazy root setup and note delegation occur once. @returns Root context. */
  getContextHandler(): OOXMLFastContextHandler {
    if (!this.mxContextHandler) {
      this.mxContextHandler = new OOXMLFastContextHandler();
      this.mxContextHandler.setStream(this.mpStream);
      this.mxContextHandler.setDocument(this.mpDocument);
      this.mxContextHandler.getParserState().setXNoteId(this.mnXNoteId);
      this.mxContextHandler.setForwardEvents(true);
    }
    return this.mxContextHandler;
  }
  /** Original unknown-root handler refuses every child. @param token - Root fast token. @returns Root context or null. */
  createFastChildContext(token: number): OOXMLFastContextHandler | null {
    if (this.mpStream === null && this.mpDocument === null) return null;
    return OOXMLFactory.createFastChildContextFromStart(this.getContextHandler(), token);
  }
  /** Original unknown root gets a fresh inert document handler. @returns Handler. */ createUnknownChildContext(): OOXMLFastDocumentHandler {
    return new OOXMLFastDocumentHandler(null, null, 0);
  }
  /** Native diagnostic-only start hook. @returns Nothing. */ startFastElement(): void {}
  /** Native diagnostic-only unknown start hook. @returns Nothing. */ startUnknownElement(): void {}
  /** Native diagnostic-only close hook. @returns Nothing. */ endFastElement(): void {}
  /** Native diagnostic-only unknown close hook. @returns Nothing. */ endUnknownElement(): void {}
  /** Original document text callback is inert. @returns Nothing. */ characters(): void {}
  /** Original document start callback is inert. @returns Nothing. */ startDocument(): void {}
  /** Original document end callback is inert. @returns Nothing. */ endDocument(): void {}
  /** Original substream initializes existing-section state without opening a new section. @param value - Substream flag. @returns Nothing. */ setIsSubstream(
    value: boolean,
  ): void {
    if (this.mpStream !== null && this.mpDocument !== null)
      this.getContextHandler().getParserState().setInSectionGroup(value);
  }
}
