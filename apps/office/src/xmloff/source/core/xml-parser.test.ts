/** @fileoverview Verifies tokenized SAX ordering, context ownership, and resource ceilings. */

import { describe, expect, it, vi } from "vitest";

import {
  FastAttributeList,
  parseOdfXmlStream,
  SvXMLIgnoreContext,
  SvXMLImportContext,
  type SvXMLImport,
} from "./xml-parser";
import { ODF_NAMESPACES, XMLToken } from "./xmltoken";

/** Context that records every delivered event. */
class RecordingContext extends SvXMLImportContext {
  /** Creates a recorder. @param events - Shared event sink. @returns Context. */
  public constructor(private readonly events: string[]) {
    super();
  }
  /** Records a start callback. @param element - Element token. @param attributes - Attributes. @returns Nothing. */
  public override startFastElement(element: XMLToken, attributes: FastAttributeList): void {
    this.events.push(`start:${element}:${attributes.get(XMLToken.TEXT_STYLE_NAME) ?? ""}`);
  }
  /** Records characters. @param characters - Text. @returns Nothing. */
  public override characters(characters: string): void {
    this.events.push(`text:${characters}`);
  }
  /** Records an end callback. @param element - Element token. @returns Nothing. */
  public override endFastElement(element: XMLToken): void {
    this.events.push(`end:${element}`);
  }
  /** Creates a child recorder. @returns Child context. */
  public override createFastChildContext(): SvXMLImportContext {
    return new RecordingContext(this.events);
  }
}

/** Context that intentionally inherits every inert base hook. */
class InertContext extends SvXMLImportContext {}

/** Creates a recording root factory. @param events - Event sink. @returns Root factory. */
function recordingImport(events: string[]): SvXMLImport {
  return {
    /** Accepts office:text. @param element - Root token. @returns Root context or null. */
    createFastContext(element): SvXMLImportContext | null {
      return element === XMLToken.OFFICE_TEXT ? new RecordingContext(events) : null;
    },
    /** Rejects unknown roots. @returns Null. */
    createUnknownContext(): null {
      return null;
    },
  };
}

describe("ODF fast SAX parser", /** Groups fast parser tests. @returns Nothing. */ () => {
  it("delivers deterministic tokenized start, character, and end callbacks", /** Verifies event order. @returns Nothing. */ () => {
    const events: string[] = [];
    parseOdfXmlStream(
      `<office:text xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}"><text:p text:style-name="Standard">A<![CDATA[B]]><text:span>C</text:span></text:p></office:text>`,
      recordingImport(events),
    );
    expect(events).toEqual([
      `start:${XMLToken.OFFICE_TEXT}:`,
      `start:${XMLToken.TEXT_P}:Standard`,
      "text:A",
      "text:B",
      `start:${XMLToken.TEXT_SPAN}:`,
      "text:C",
      `end:${XMLToken.TEXT_SPAN}`,
      `end:${XMLToken.TEXT_P}`,
      `end:${XMLToken.OFFICE_TEXT}`,
    ]);
  });

  it("uses declared reject and ignore policies for unknown elements", /** Verifies unknown policies. @returns Nothing. */ () => {
    expect(
      /** Executes rejected parsing. @returns Nothing. */ () =>
        parseOdfXmlStream("<unknown/>", recordingImport([])),
    ).toThrow("Unsupported ODF XML element");
    parseOdfXmlStream("<unknown><nested/></unknown>", {
      /** Rejects known roots. @returns Null. */
      createFastContext(): null {
        return null;
      },
      /** Ignores an unknown subtree. @returns Ignore context. */
      createUnknownContext(): SvXMLImportContext {
        return new SvXMLIgnoreContext();
      },
    });
  });

  it("logs and ignores undeclared unknown child subtrees", /** Matches upstream's non-fatal unknown-child context fallback. @returns Nothing. */ () => {
    const events: string[] = [];
    const warn = vi
      .spyOn(console, "warn")
      .mockImplementation(
        /** Suppresses the expected diagnostic. @returns Nothing. */ () => undefined,
      );
    try {
      parseOdfXmlStream(
        `<office:text xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}" xmlns:foreign="urn:foreign"><foreign:extension><text:p>hidden</text:p></foreign:extension><text:p>visible</text:p></office:text>`,
        recordingImport(events),
      );
      expect(warn).toHaveBeenCalledWith("Unknown ODF element ignored: foreign:extension");
      expect(events).toEqual([
        `start:${XMLToken.OFFICE_TEXT}:`,
        `start:${XMLToken.TEXT_P}:`,
        "text:visible",
        `end:${XMLToken.TEXT_P}`,
        `end:${XMLToken.OFFICE_TEXT}`,
      ]);
    } finally {
      warn.mockRestore();
    }
  });

  it("provides inert base hooks and rejects undeclared known children", /** Covers the default context contract. @returns Nothing. */ () => {
    const context = new InertContext();
    const attributes = new FastAttributeList([]);
    context.startFastElement(XMLToken.TEXT_P, attributes);
    context.characters("text");
    context.endFastElement(XMLToken.TEXT_P);
    expect(context.createFastChildContext(XMLToken.TEXT_P, attributes)).toBeNull();
    expect(context.createUnknownChildContext("urn:test", "child", attributes)).toBeNull();
    expect(
      /** Parses a known child without a declared policy. @returns Nothing. */ () =>
        parseOdfXmlStream(
          `<office:text xmlns:office="${ODF_NAMESPACES.office}" xmlns:text="${ODF_NAMESPACES.text}"><text:p/></office:text>`,
          {
            /** Creates the inert root context. @returns Context. */
            createFastContext: () => context,
            /** Rejects unknown roots. @returns Null. */
            createUnknownContext: () => null,
          },
        ),
    ).toThrow("Unsupported ODF XML element: text:p");
    expect(
      /** Tokenizes duplicate semantic attributes. @returns Nothing. */ () =>
        new FastAttributeList([
          {
            local: "style-name",
            name: "text:style-name",
            uri: ODF_NAMESPACES.text,
            value: "A",
          },
          {
            local: "style-name",
            name: "text:style-name",
            uri: ODF_NAMESPACES.text,
            value: "B",
          },
        ] as never),
    ).toThrow("Duplicate ODF attribute");
  });

  it("logs and ignores unknown and context-unsupported attributes", /** Matches upstream's non-fatal attribute policy. @returns Nothing. */ () => {
    const warn = vi
      .spyOn(console, "warn")
      .mockImplementation(
        /** Suppresses expected diagnostics. @returns Nothing. */ () => undefined,
      );
    try {
      parseOdfXmlStream(
        `<office:text xmlns:office="${ODF_NAMESPACES.office}" xmlns:foreign="urn:foreign" foreign:property="value"/>`,
        recordingImport([]),
      );
      const attributes = new FastAttributeList([
        {
          local: "style-name",
          name: "text:style-name",
          uri: ODF_NAMESPACES.text,
          value: "Standard",
        },
      ] as never);
      attributes.assertOnly([], "test");
      expect(warn).toHaveBeenCalledWith("Unknown ODF attribute ignored: foreign:property");
      expect(warn).toHaveBeenCalledWith("Unsupported ODF test attribute ignored: text:style-name");
    } finally {
      warn.mockRestore();
    }
  });

  it("rejects DTDs, comments, malformed XML, cancellation, and every resource limit", /** Verifies parser guards. @returns Nothing. */ () => {
    const ignore: SvXMLImport = {
      /** Ignores known roots. @returns Ignore context. */
      createFastContext(): SvXMLImportContext {
        return new SvXMLIgnoreContext();
      },
      /** Ignores unknown roots. @returns Ignore context. */
      createUnknownContext(): SvXMLImportContext {
        return new SvXMLIgnoreContext();
      },
    };
    expect(
      /** Parses a DTD. @returns Nothing. */ () =>
        parseOdfXmlStream("<!DOCTYPE root><root/>", ignore),
    ).toThrow("document type");
    expect(
      /** Parses a comment. @returns Nothing. */ () =>
        parseOdfXmlStream("<root><!--x--></root>", ignore),
    ).toThrow("comment");
    expect(
      /** Parses a processing instruction. @returns Nothing. */ () =>
        parseOdfXmlStream("<root><?stage test?></root>", ignore),
    ).toThrow("processing instruction");
    expect(
      /** Parses malformed XML. @returns Nothing. */ () =>
        parseOdfXmlStream("<root><child></root>", ignore),
    ).toThrow("malformed");
    expect(
      /** Parses with cancellation. @returns Nothing. */ () =>
        parseOdfXmlStream("<root/>", ignore, {
          isCancelled: /** Cancels immediately. @returns True. */ () => true,
        }),
    ).toThrow("cancelled");
    for (const [xml, limits, message] of [
      ["<root><child/></root>", { maxDepth: 1 }, "depth"],
      ["<root><child/></root>", { maxElements: 1 }, "element"],
      ['<root a="1" b="2"/>', { maxAttributes: 1 }, "attribute"],
      ["<root>ab</root>", { maxCharacters: 1 }, "character"],
    ] as const)
      expect(
        /** Parses beyond a limit. @returns Nothing. */ () =>
          parseOdfXmlStream(xml, ignore, { limits }),
      ).toThrow(message);
    for (const maxDepth of [0, 1.5])
      expect(
        /** Parses with an invalid limit. @returns Nothing. */ () =>
          parseOdfXmlStream("<root/>", ignore, { limits: { maxDepth } }),
      ).toThrow("limit is invalid");
  });
});
