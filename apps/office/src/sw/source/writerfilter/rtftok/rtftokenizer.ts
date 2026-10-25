/** @fileoverview RTF lexical groups, control words and Unicode fallback from sw/source/writerfilter/rtftok/rtftokenizer.cxx. */

/** Lexical events consumed by the Writer RTF document mapper. */
export type RtfToken =
  | Readonly<{ kind: "group-start" }>
  | Readonly<{ kind: "group-end" }>
  | Readonly<{ kind: "control"; name: string; parameter?: number }>
  | Readonly<{ kind: "hex-break"; value: "\r" | "\n" }>
  | Readonly<{ kind: "ansi-bytes"; value: Uint8Array }>
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
  private onToken?: (token: RtfToken) => void;
  private currentCodepage?: () => number;
  private offset = 0;
  private depth = 0;
  private groupUnicodeSkip: number[] = [1];
  private groupFallback: number[] = [0];
  private bytes: number[] = [];

  /** Returns the current parser state's remaining Unicode fallback characters. */
  private get fallback(): number {
    return this.groupFallback.at(-1) ?? 0;
  }

  /** Updates only the current group state, matching native push/pop behavior. */
  private set fallback(value: number) {
    this.groupFallback[this.groupFallback.length - 1] = value;
  }

  /** Captures caller-owned source bytes. @param source - Complete RTF bytes. */
  public constructor(source: Uint8Array) {
    this.source = source;
  }

  /** Returns ordered lexical events after validating group balance and header. @returns RTF events. */
  public Tokenize(): readonly RtfToken[] {
    this.Scan();
    return this.tokens;
  }

  /** Drives the document listener while its group/font encoding is still current. */
  public Parse(onToken: (token: RtfToken) => void, currentCodepage: () => number): void {
    this.onToken = onToken;
    this.currentCodepage = currentCodepage;
    this.Scan();
  }

  /** Reads the stream, dispatching each event before consuming later bytes. */
  private Scan(): void {
    if (this.source[0] !== 0x7b || this.source[1] !== 0x5c || this.source[2] !== 0x72)
      throw new RtfSyntaxError("RTF document header is missing.");
    while (this.offset < this.source.length) {
      const byte = this.source[this.offset++] as number;
      if (byte === 0x7b) {
        this.FlushText();
        this.depth++;
        if (this.depth > 1024) throw new RtfSyntaxError("RTF group nesting is too deep.");
        this.groupUnicodeSkip.push(this.groupUnicodeSkip.at(-1) ?? 1);
        this.groupFallback.push(this.fallback);
        this.Emit({ kind: "group-start" });
      } else if (byte === 0x7d) {
        this.FlushText();
        if (this.depth === 0) throw new RtfSyntaxError("Unexpected RTF group end.");
        this.depth--;
        this.groupUnicodeSkip.pop();
        this.groupFallback.pop();
        this.Emit({ kind: "group-end" });
      } else if (byte === 0x5c) {
        this.ReadEscape();
      } else if (byte !== 0x0d && byte !== 0x0a && byte !== 0x00) {
        this.AppendByte(byte);
        if (this.currentCodepage?.() === 932 && isShiftJisLead(byte)) {
          const trail = this.source[this.offset++];
          if (trail !== undefined) this.AppendByte(trail);
        }
      }
    }
    this.FlushText();
    if (this.depth !== 0) throw new RtfSyntaxError("Unclosed RTF group.");
    if (this.tokens.at(-1)?.kind !== "group-end")
      throw new RtfSyntaxError("RTF document has trailing content.");
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
      const value = Number.parseInt(digits, 16);
      if (value === 0x0d || value === 0x0a) {
        // Keep the byte origin until the destination-aware resolveChars boundary.
        if (this.fallback !== 0) this.fallback--;
        else {
          this.FlushText();
          this.Emit({ kind: "hex-break", value: value === 0x0d ? "\r" : "\n" });
        }
      } else this.AppendByte(value);
      return;
    }
    if (!isLetter(first)) {
      if (first === 0x7b || first === 0x7d || first === 0x5c) this.AppendByte(first);
      else if (this.fallback !== 0) this.fallback--;
      else {
        this.FlushText();
        this.Emit({ kind: "control", name: String.fromCharCode(first) });
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
    if (name === "uc") {
      const width = parameter ?? 1;
      if (width >= -32768 && width <= 32767)
        this.groupUnicodeSkip[this.groupUnicodeSkip.length - 1] = width;
    } else if (name === "u") {
      const codeUnit = parameter ?? 0;
      if (codeUnit >= -32768 && codeUnit <= 65535) {
        this.FlushText();
        this.Emit({ kind: "text", value: String.fromCharCode(codeUnit & 0xffff) });
        this.fallback = this.groupUnicodeSkip.at(-1) ?? 1;
      }
    } else {
      // The native fallback counter is consumed by characters, not control words.
      this.FlushText();
      this.Emit({
        kind: "control",
        name,
        ...(parameter === undefined ? {} : { parameter }),
      });
    }
  }

  /** Adds one raw text byte, or consumes one fallback character after Unicode. @param byte - Input byte. */
  private AppendByte(byte: number): void {
    if (this.fallback !== 0) {
      this.fallback--;
      return;
    }
    this.bytes.push(byte);
  }

  /** Passes bytes to the document parser, which owns the active group and font encoding. */
  private FlushText(): void {
    if (this.bytes.length === 0) return;
    this.Emit({ kind: "ansi-bytes", value: Uint8Array.from(this.bytes) });
    this.bytes = [];
  }

  /** Publishes an event to the stream listener and lexical test buffer. */
  private Emit(token: RtfToken): void {
    this.tokens.push(token);
    this.onToken?.(token);
  }
}

/** Mirrors the pinned resolveChars Shift-JIS lead-byte range. */
function isShiftJisLead(byte: number): boolean {
  return (byte >= 0x80 && byte <= 0x9f) || byte >= 0xe0;
}

/** Tests ASCII control-letter syntax. @param byte - Candidate. @returns Whether a letter. */
function isLetter(byte: number | undefined): boolean {
  return byte !== undefined && ((byte >= 65 && byte <= 90) || (byte >= 97 && byte <= 122));
}

/** Tests ASCII control-parameter digit syntax. @param byte - Candidate. @returns Whether a digit. */
function isDigit(byte: number | undefined): boolean {
  return byte !== undefined && byte >= 48 && byte <= 57;
}
