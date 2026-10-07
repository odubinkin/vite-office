/** @fileoverview Verifies pinned known-null and unknown-null reference/event dispatch. */
import { expect, it } from "vitest";
import {
  FastAttributeList,
  parseOdfXmlStream,
  SvXMLImportContext,
  type SvXMLImportRootFactory as SvXMLImport,
} from "./xmlimp";
import { XMLToken, ODF_NAMESPACES } from "./xmltoken";

it("converts native decimal byte-view attributes with distinct absence and zero", /** Verifies literal signed, partial, control, UTF8 and overflow contracts independently of list policy. @returns Nothing. */ () => {
  expect(new FastAttributeList([]).getAsInteger(XMLToken.TEXT_START_VALUE)).toBeNull();
  for (const [value, expected] of [
    ["", 0],
    ["+", 0],
    ["-", 0],
    ["garbage", 0],
    ["-0", 0],
    ["+0", 0],
    ["0", 0],
    ["12tail", 12],
    ["+12tail", 12],
    ["-12tail", -12],
    ["1.5", 1],
    ["0x10", 0],
    ["0002", 2],
    [" \t\n+12", 12],
    [" + 12", 0],
    ["\0" + "12", 0],
    ["12\0" + "34", 12],
    ["\u00a012", 0],
    ["\u200012", 0],
    ["１２", 0],
    ["2147483647", 2147483647],
    ["2147483648", 0],
    ["-2147483648", -2147483648],
    ["-2147483649", 0],
    ["9223372036854775808", 0],
    ["-9223372036854775809", 0],
    ["9".repeat(1000), 0],
    ["0".repeat(1000) + "12", 12],
  ] as const) {
    const attributes = new FastAttributeList([
      {
        name: "text:start-value",
        prefix: "text",
        local: "start-value",
        uri: ODF_NAMESPACES.text,
        value,
      },
    ]);
    expect(attributes.getAsInteger(XMLToken.TEXT_START_VALUE), JSON.stringify(value)).toBe(
      expected,
    );
  }
});

/** Records identity, native events and child factory calls. */
class ProtocolContext extends SvXMLImportContext {
  /** Binds the trace. @param label - Context identity. @param events - Trace sink. @returns Context. */
  public constructor(
    private readonly label: string,
    private readonly events: string[],
  ) {
    super();
  }
  /** Records known start. @param token - Token. @returns Nothing. */
  public override startFastElement(token: XMLToken): void {
    this.events.push(`${this.label}:start:${token}`);
  }
  /** Records known end. @param token - Token. @returns Nothing. */
  public override endFastElement(token: XMLToken): void {
    this.events.push(`${this.label}:end:${token}`);
  }
  /** Records unknown start separately. @param uri - Namespace. @param name - Name. @returns Nothing. */
  public override startUnknownElement(uri: string, name: string): void {
    this.events.push(`${this.label}:unknown-start:${uri}:${name}`);
  }
  /** Records unknown end separately. @param uri - Namespace. @param name - Name. @returns Nothing. */
  public override endUnknownElement(uri: string, name: string): void {
    this.events.push(`${this.label}:unknown-end:${uri}:${name}`);
  }
  /** Records characters under the current identity. @param text - Text. @returns Nothing. */
  public override characters(text: string): void {
    this.events.push(`${this.label}:text:${text}`);
  }
  /** Distinguishes a native null known child from a created child. @param token - Child token. @returns Child or null. */
  public override createFastChildContext(token: XMLToken): SvXMLImportContext | null {
    this.events.push(`${this.label}:child:${token}`);
    return token === XMLToken.STYLE_TEXT_PROPERTIES
      ? null
      : new ProtocolContext("child", this.events);
  }
  /** Distinguishes an explicit unknown context from native parent reuse. @param uri - Namespace. @param name - Name. @returns Child or null. */
  public override createUnknownChildContext(uri: string, name: string): SvXMLImportContext | null {
    this.events.push(`${this.label}:unknown-child:${uri}:${name}`);
    return name === "owned" ? new ProtocolContext("owned", this.events) : null;
  }
}

/** Creates a supported root context. @param events - Trace. @returns Root port. */
function root(events: string[]): SvXMLImport {
  return {
    /** Accepts the known root. @returns Context. */
    createFastContext: () => new ProtocolContext("root", events),
    /** Accepts an explicitly supported unknown root. @returns Context. */
    createUnknownContext: () => new ProtocolContext("root", events),
  };
}

it("matches native inert known children and reused unknown parent event traces", /** Asserts identities through nested wrappers and siblings using an independent manual trace. @returns Nothing. */ () => {
  const events: string[] = [];
  parseOdfXmlStream(
    `<office:text xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:style="${ODF_NAMESPACES.style}" xmlns:f="urn:foreign"><style:text-properties>discard<f:wrapper><text:p>discard</text:p></f:wrapper></style:text-properties><f:wrapper>A<f:nested>B</f:nested><text:p>C</text:p>D</f:wrapper><text:p>E</text:p></office:text>`,
    root(events),
    {
      /** Suppresses structural warnings in identity assertions. @returns Nothing. */ onDiagnostic:
        () => undefined,
    },
  );
  expect(events).toEqual([
    `root:start:${XMLToken.OFFICE_TEXT}`,
    `root:child:${XMLToken.STYLE_TEXT_PROPERTIES}`,
    "root:unknown-child:urn:foreign:wrapper",
    "root:unknown-start:urn:foreign:wrapper",
    "root:text:A",
    "root:unknown-child:urn:foreign:nested",
    "root:unknown-start:urn:foreign:nested",
    "root:text:B",
    "root:unknown-end:urn:foreign:nested",
    `root:child:${XMLToken.TEXT_P}`,
    `child:start:${XMLToken.TEXT_P}`,
    "child:text:C",
    `child:end:${XMLToken.TEXT_P}`,
    "root:text:D",
    "root:unknown-end:urn:foreign:wrapper",
    `root:child:${XMLToken.TEXT_P}`,
    `child:start:${XMLToken.TEXT_P}`,
    "child:text:E",
    `child:end:${XMLToken.TEXT_P}`,
    `root:end:${XMLToken.OFFICE_TEXT}`,
  ]);
});

it("delivers unknown callbacks to explicit contexts and supported unknown roots", /** Asserts known hooks never receive UNKNOWN and parent identity resumes after owned children. @returns Nothing. */ () => {
  const events: string[] = [];
  parseOdfXmlStream('<f:root xmlns:f="urn:foreign"><f:owned>A</f:owned>B</f:root>', root(events));
  expect(events).toEqual([
    "root:unknown-start:urn:foreign:root",
    "root:unknown-child:urn:foreign:owned",
    "owned:unknown-start:urn:foreign:owned",
    "owned:text:A",
    "owned:unknown-end:urn:foreign:owned",
    "root:text:B",
    "root:unknown-end:urn:foreign:root",
  ]);
});

it("retains explicit child errors and inert native unknown hooks", /** Covers thrown factory diagnostics without changing parser guards or root admission. @returns Nothing. */ () => {
  const inert = new SvXMLImportContext();
  inert.startUnknownElement("urn:test", "child", new FastAttributeList([]));
  inert.endUnknownElement("urn:test", "child");
  /** Declares an unsupported child independently of importer fallback. */
  class RejectContext extends SvXMLImportContext {
    /** Rejects an explicitly Unsupported ODF feature. @returns Never. */
    public override createFastChildContext(): never {
      throw new Error("Unsupported ODF feature");
    }
  }
  const diagnostic = {
    /** Suppresses structural warnings in identity assertions. @returns Nothing. */ onDiagnostic:
      () => undefined,
  };
  expect(
    /** Parses a declared unsupported child. @returns Nothing. */ () =>
      parseOdfXmlStream(
        `<office:text xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}"><text:p/></office:text>`,
        {
          /** Creates the rejecting owner. @returns Context. */ createFastContext: () =>
            new RejectContext(),
          /** Rejects unknown roots. @returns Null. */ createUnknownContext: () => null,
        },
        diagnostic,
      ),
  ).toThrow("Unsupported ODF feature");
});
