/** @fileoverview Native JumpEdit field type and field from the pinned Writer docufld source. */
import { PlaceholderType } from "../../../../offapi/com/sun/star/text/PlaceholderType";
import type { SwField } from "../../../inc/fldbas";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import type { SwDoc } from "../doc/doc";
import type { SwCharFormat } from "../../../inc/charfmt";

/** Native JumpEdit formats in their original order. */
export enum SwJumpEditFormat {
  Text,
  Table,
  Frame,
  Graphic,
  OLE,
}

const placeholderTypes = [
  PlaceholderType.TEXT,
  PlaceholderType.TABLE,
  PlaceholderType.TEXTFRAME,
  PlaceholderType.GRAPHIC,
  PlaceholderType.OBJECT,
] as const;

/** Document-owned placeholder field type. */
export class SwJumpEditFieldType {
  /** Binds the Writer document. @param document - Native owner. @returns The initialized SwJumpEditFieldType instance. */
  public constructor(private readonly document: SwDoc) {}

  /** Returns the native field's document owner. @returns Writer document. */
  public GetDoc(): SwDoc {
    return this.document;
  }

  /** Returns the original Placeholder character format. @returns Document-owned pool format. */
  public GetCharFormat(): SwCharFormat | undefined {
    return this.document.GetCharFormatFromPool(SwPoolFormatId.CHR_JUMPEDIT);
  }
}

/** Original placeholder text and contextual help. */
export class SwJumpEditField implements SwField<SwJumpEditField> {
  /** Creates the native field. @param type - Document field type. @param format - Placeholder kind. @param text - Content between angle brackets. @param help - Placeholder description. @returns The initialized SwJumpEditField instance. */
  public constructor(
    private readonly type: SwJumpEditFieldType,
    private readonly format: SwJumpEditFormat,
    private readonly text: string,
    private readonly help: string,
  ) {}

  /** Returns the system field type. @returns Native placeholder type. */
  public GetTyp(): SwJumpEditFieldType {
    return this.type;
  }

  /** Returns the placeholder kind. @returns Native format. */
  public GetFormat(): SwJumpEditFormat {
    return this.format;
  }

  /** Reads the published UNO format, using the original text fallback. @returns Placeholder type. */
  public GetPlaceholderType(): PlaceholderType {
    return placeholderTypes[this.format] ?? PlaceholderType.TEXT;
  }

  /** Gets the original first field parameter. @returns Description. */
  public GetPar1(): string {
    return this.help;
  }

  /** Gets the original second field parameter. @returns Placeholder text. */
  public GetPar2(): string {
    return this.text;
  }

  /** Expands the original angle-bracketed presentation. @returns Field display. */
  public Expand(): string {
    return "<" + this.text + ">";
  }

  /** Copies the field without its text attribute. @returns Detached copy. */
  public Copy(): SwJumpEditField {
    return new SwJumpEditField(this.type, this.format, this.text, this.help);
  }

  /** Connects the copied field to another document. @param doc - Destination document. @returns Detached copy. */
  public CopyToDocument(doc: SwDoc): SwJumpEditField {
    return new SwJumpEditField(
      doc.getIDocumentFieldsAccess().GetJumpEditFieldType(),
      this.format,
      this.text,
      this.help,
    );
  }

  /** Releases the value-only field. @returns Nothing. */
  public Dispose(): void {}
}
