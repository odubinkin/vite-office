/** @fileoverview RTF lexical groups, control words and Unicode fallback from sw/source/writerfilter/rtftok/rtftokenizer.cxx. */

/** Lexical events consumed by the Writer RTF document mapper. */
export type RtfToken =
  | Readonly<{ kind: "group-start" }>
  | Readonly<{ kind: "group-end" }>
  | Readonly<{ kind: "control"; name: string; parameter?: number }>
  | Readonly<{ kind: "text"; value: string }>;

/** Reports a malformed RTF stream before it can replace the active Writer model. */
export class RtfSyntaxError extends Error {
  /** Creates one input error. @param message - Failure detail. */
  public constructor(message: string) {
    super(message);
    this.name = "RtfSyntaxError";
  }
}

/** Tokenizes one RTF byte stream without projecting it through HTML or browser DOM. */
export class RtfTokenizer {
  private readonly source: Uint8Array;
  private readonly tokens: RtfToken[] = [];
  private decoder = new TextDecoder("windows-1252");
  private offset = 0;
  private depth = 0;
  private groupUnicodeSkip: number[] = [1];
  private fallback = 0;
  private bytes: number[] = [];

  /** Captures caller-owned source bytes. @param source - Complete RTF bytes. */
  public constructor(source: Uint8Array) {
    this.source = source;
  }

  /** Returns ordered lexical events after validating group balance and header. @returns RTF events. */
  public Tokenize(): readonly RtfToken[] {
    if (this.source[0] !== 0x7b || this.source[1] !== 0x5c || this.source[2] !== 0x72)
      throw new RtfSyntaxError("RTF document header is missing.");
    while (this.offset < this.source.length) {
      const byte = this.source[this.offset++] as number;
      if (byte === 0x7b) {
        this.FlushText();
        this.depth++;
        if (this.depth > 1024) throw new RtfSyntaxError("RTF group nesting is too deep.");
        this.groupUnicodeSkip.push(this.groupUnicodeSkip.at(-1) ?? 1);
        this.tokens.push({ kind: "group-start" });
      } else if (byte === 0x7d) {
        this.FlushText();
        if (this.depth === 0) throw new RtfSyntaxError("Unexpected RTF group end.");
        this.depth--;
        this.groupUnicodeSkip.pop();
        this.tokens.push({ kind: "group-end" });
      } else if (byte === 0x5c) {
        this.ReadEscape();
      } else if (byte !== 0x0d && byte !== 0x0a && byte !== 0x00) {
        this.AppendByte(byte);
      }
    }
    this.FlushText();
    if (this.depth !== 0) throw new RtfSyntaxError("Unclosed RTF group.");
    if (this.tokens.at(-1)?.kind !== "group-end")
      throw new RtfSyntaxError("RTF document has trailing content.");
    return this.tokens;
  }

  /** Reads one control word, escaped character or hex byte. */
  private ReadEscape(): void {
    const first = this.source[this.offset++];
    if (first === undefined) throw new RtfSyntaxError("Incomplete RTF control.");
    if (first === 0x27) {
      const a = this.source[this.offset++],
        b = this.source[this.offset++];
      if (a === undefined || b === undefined) throw new RtfSyntaxError("Incomplete RTF hex byte.");
      const digits = String.fromCharCode(a, b);
      if (!/^[0-9a-fA-F]{2}$/u.test(digits)) throw new RtfSyntaxError("Invalid RTF hex byte.");
      this.AppendByte(Number.parseInt(digits, 16));
      return;
    }
    if (!isLetter(first)) {
      if (first === 0x7b || first === 0x7d || first === 0x5c) this.AppendByte(first);
      else if (this.fallback > 0) this.fallback--;
      else {
        this.FlushText();
        this.tokens.push({ kind: "control", name: String.fromCharCode(first) });
      }
      return;
    }
    let name = String.fromCharCode(first);
    while (isLetter(this.source[this.offset]))
      name += String.fromCharCode(this.source[this.offset++] as number);
    let sign = 1;
    if (this.source[this.offset] === 0x2d) {
      sign = -1;
      this.offset++;
    }
    let digits = "";
    while (isDigit(this.source[this.offset]))
      digits += String.fromCharCode(this.source[this.offset++] as number);
    if (this.source[this.offset] === 0x20) this.offset++;
    const parameter = digits.length === 0 ? undefined : sign * Number(digits);
    if (name === "bin") {
      if (parameter === undefined || parameter < 0 || parameter > this.source.length - this.offset)
        throw new RtfSyntaxError("Invalid RTF binary run length.");
      this.FlushText();
      this.offset += parameter;
      return;
    }
    if (name === "ansicpg" && parameter !== undefined) {
      this.FlushText();
      try {
        this.decoder = new TextDecoder(`windows-${parameter}`);
      } catch {
        throw new RtfSyntaxError(`Unsupported RTF code page: ${parameter}.`);
      }
    }
    if (name === "uc") {
      this.groupUnicodeSkip[this.groupUnicodeSkip.length - 1] = Math.max(0, parameter ?? 1);
    } else if (name === "u") {
      this.FlushText();
      this.tokens.push({ kind: "text", value: String.fromCharCode((parameter ?? 0) & 0xffff) });
      this.fallback = this.groupUnicodeSkip.at(-1) ?? 1;
    } else if (this.fallback === 0) {
      this.FlushText();
      this.tokens.push({
        kind: "control",
        name,
        ...(parameter === undefined ? {} : { parameter }),
      });
    }
  }

  /** Adds one raw text byte, or consumes one fallback character after Unicode. @param byte - Input byte. */
  private AppendByte(byte: number): void {
    if (this.fallback > 0) {
      this.fallback--;
      return;
    }
    this.bytes.push(byte);
  }

  /** Decodes one contiguous ANSI run. */
  private FlushText(): void {
    if (this.bytes.length === 0) return;
    this.tokens.push({ kind: "text", value: this.decoder.decode(Uint8Array.from(this.bytes)) });
    this.bytes = [];
  }
}

/** Tests ASCII control-letter syntax. @param byte - Candidate. @returns Whether a letter. */
function isLetter(byte: number | undefined): boolean {
  return byte !== undefined && ((byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122));
}

/** Tests ASCII control-parameter digit syntax. @param byte - Candidate. @returns Whether a digit. */
function isDigit(byte: number | undefined): boolean {
  return byte !== undefined && byte >= 48 && byte <= 57;
}
