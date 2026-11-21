/** @fileoverview Original office:binary-data SAX context and output stream boundary. */
import { decodeBase64 } from "../../../comphelper/source/misc/base64";
import { SvXMLImportContext } from "./xmlimp";

/** Collects SAX character fragments and writes the complete decoded stream at close. */
export class XMLBase64ImportContext extends SvXMLImportContext {
  private text = "";

  /** Binds the graphic output sink. @param write - Receives the native decoded bytes. @returns Context. */
  constructor(private readonly write: (bytes: Uint8Array) => void) {
    super();
  }

  /** Appends original character data, including whitespace within the stream. @param value - SAX characters. @returns Nothing. */
  override characters(value: string): void {
    this.text += value;
  }

  /** Decodes through the original comphelper algorithm after all characters arrive. @returns Nothing. */
  override endFastElement(): void {
    const bytes = decodeBase64(this.text);
    this.text = "";
    this.write(bytes);
  }
}
