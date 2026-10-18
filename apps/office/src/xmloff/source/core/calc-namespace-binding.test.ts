/** @fileoverview Real SAX QName-value namespace scope binding shared by Writer/Calc import contexts. */
import { expect, it } from "vitest";
import { FastAttributeList, parseOdfXmlStream, SvXMLImportContext } from "./xmlimp";
import { ODF_NAMESPACES } from "./xmltoken";
it("resolves aliases and nested rebinding through the actual SAX parser rather than local declarations alone", /** The base list has no namespace provider until connected to a real SAX event. @returns Nothing. */ () => {
  expect(new FastAttributeList([]).getNamespaceUri("of")).toBeUndefined();
  const seen: unknown[] = [];
  /** Actual context observing namespace dispatch,without a replacement parser. */
  class Context extends SvXMLImportContext {
    /** Receives a real namespace scope. @param uri - Element URI. @param name - Local name. @param attributes - Actual SAX binding. @returns Nothing. */
    override startUnknownElement(uri: string, name: string, attributes: FastAttributeList): void {
      void uri;
      seen.push([name, attributes.getNamespaceUri("f")]);
    }
    /** Continues actual unknown-element dispatch. @returns Context. */
    override createUnknownChildContext(): SvXMLImportContext {
      return this;
    }
  }
  const context = new Context();
  parseOdfXmlStream(
    `<root xmlns="urn:test" xmlns:f="${ODF_NAMESPACES.of}"><one/><two xmlns:f="urn:external"><three/></two><four/></root>`,
    {
      createFastContext: /** Supplies native context. @returns Context. */ () => context,
      createUnknownContext: /** Supplies native context. @returns Context. */ () => context,
    },
  );
  expect(seen).toEqual([
    ["root", ODF_NAMESPACES.of],
    ["one", ODF_NAMESPACES.of],
    ["two", "urn:external"],
    ["three", "urn:external"],
    ["four", ODF_NAMESPACES.of],
  ]);
});
