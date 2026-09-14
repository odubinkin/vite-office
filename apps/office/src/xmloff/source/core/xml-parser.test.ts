/** @fileoverview Verifies the worker-safe namespace-aware ODF SAX tree and resource ceiling. */

import { describe, expect, it } from "vitest";

import { parseOdfXmlDocument } from "./xml-parser";

const OFFICE = "urn:oasis:names:tc:opendocument:xmlns:office:1.0";
const TEXT = "urn:oasis:names:tc:opendocument:xmlns:text:1.0";

describe("ODF SAX parser" /** Groups worker-safe XML parsing behavior. @returns Nothing. */, () => {
  it("builds namespace-aware elements, attributes, and ordered text" /** Verifies the neutral tree projection used by xmloff. @returns Nothing. */, () => {
    const document = parseOdfXmlDocument(
      `<?xml version="1.0"?><office:document-content xmlns:office="${OFFICE}" xmlns:text="${TEXT}"><?stage test?><office:text><text:p text:style-name="Standard">A<![CDATA[B]]><!--note--><text:span>C</text:span></text:p></office:text></office:document-content>`,
    );
    const paragraphs = document.getElementsByTagNameNS(TEXT, "p");
    expect(document.documentElement).toMatchObject({
      localName: "document-content",
      namespaceURI: OFFICE,
    });
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]?.getAttributeNS(TEXT, "style-name")).toBe("Standard");
    expect(paragraphs[0]?.getAttributeNS(TEXT, "missing")).toBeNull();
    expect(paragraphs[0]?.attributes).toEqual([
      {
        localName: "style-name",
        name: "text:style-name",
        namespaceURI: TEXT,
        value: "Standard",
      },
    ]);
    expect(paragraphs[0]?.textContent).toBe("ABC");
    expect(
      paragraphs[0]?.childNodes.map(
        /** Selects the node discriminator. @param node - Parsed node. @returns Node kind. */ (
          node,
        ) => node.kind,
      ),
    ).toEqual(["text", "text", "unsupported", "element"]);
    expect(document.getElementsByTagNameNS(TEXT, "missing")).toEqual([]);
  });

  it("rejects DTDs, malformed XML, and invalid depth ceilings" /** Verifies parser security bounds and deterministic diagnostics. @returns Nothing. */, () => {
    expect(
      /** Parses a DTD. @returns Invalid document. */ () =>
        parseOdfXmlDocument("<!DOCTYPE root><root/>"),
    ).toThrow("document type");
    expect(
      /** Parses mismatched tags. @returns Invalid document. */ () =>
        parseOdfXmlDocument("<root><child></root>"),
    ).toThrow("malformed");
    expect(
      /** Parses beyond the configured depth. @returns Invalid document. */ () =>
        parseOdfXmlDocument("<root><child/></root>", 1),
    ).toThrow("depth limit");
    for (const limit of [0, 1.5])
      expect(
        /** Parses with an invalid depth. @returns Invalid document. */ () =>
          parseOdfXmlDocument("<root/>", limit),
      ).toThrow("depth limit is invalid");
  });
});
