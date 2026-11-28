/** @fileoverview Native ODF change-info string buffer dispatch. */
import { SvXMLImportContext } from "../core/xmlimp";
import { XMLToken } from "../core/xmltoken";

/** The original lexical metadata from one change element. */
export interface XMLChangeInfo {
  readonly author: string;
  readonly comment: string;
  readonly date: string;
  readonly movedId: string;
}

/** Appends the native SAX character data for one change-info property. */
class XMLStringBufferImportContext extends SvXMLImportContext {
  /** Receives the character buffer append operation. @param append - Property buffer. @returns The initialized XMLStringBufferImportContext instance. */
  constructor(private readonly append: (data: string) => void) {
    super();
  }

  /** Appends XML character data. @param data - Characters. @returns Nothing. */
  override characters(data: string): void {
    this.append(data);
  }
}

/** Collects author, date, move identity and the original comment paragraphs. */
export class XMLChangeInfoContext extends SvXMLImportContext {
  private author = "";
  private comment = "";
  private date = "";
  private movedId = "";

  /** Binds this change's metadata consumer. @param commit - Receiver of the original buffers. @returns The initialized XMLChangeInfoContext instance. */
  constructor(private readonly commit: (info: XMLChangeInfo) => void) {
    super();
  }

  /** Routes the recognized metadata children. @param element - Original child token. @returns Context for that property's characters. */
  override createFastChildContext(element: XMLToken): SvXMLImportContext | null {
    switch (element) {
      case XMLToken.DC_CREATOR:
        return new XMLStringBufferImportContext(
          /** Appends the author. @param data - Characters. @returns Nothing. */ (data) => {
            this.author += data;
          },
        );
      case XMLToken.DC_DATE:
        return new XMLStringBufferImportContext(
          /** Appends the date. @param data - Characters. @returns Nothing. */ (data) => {
            this.date += data;
          },
        );
      case XMLToken.LOEXT_MOVE_ID:
        return new XMLStringBufferImportContext(
          /** Appends the move identifier. @param data - Characters. @returns Nothing. */ (
            data,
          ) => {
            this.movedId += data;
          },
        );
      case XMLToken.TEXT_P:
      case XMLToken.LOEXT_P:
        return new XMLStringBufferImportContext(
          /** Appends original comment text without a manufactured paragraph separator. @param data - Characters. @returns Nothing. */ (
            data,
          ) => {
            this.comment += data;
          },
        );
      default:
        return null;
    }
  }

  /** Delivers the completed change-info buffers. @returns Nothing. */
  override endFastElement(): void {
    this.commit({
      author: this.author,
      comment: this.comment,
      date: this.date,
      movedId: this.movedId,
    });
  }
}
