/** @fileoverview Source-derived native plain manifest import cases using actual PropertyValue,Any,AttributeList and SAX owners. */
import { expect, it } from "vitest";
import { readManifestSequence } from "./ManifestReader";
import { ManifestImport, ManifestScopeEntry } from "./ManifestImport";
import { AttributeList } from "../../../comphelper/inc/attributelist";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { PropertyValue } from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { property, unicode } from "../../../test/fixtures/manifest";
import fixture from "./native-manifest-cases.json";
const ns = "urn:oasis:names:tc:opendocument:xmlns:manifest:1.0";
/** Reads actual native text. @param value - Text. @returns Content. */ function text(
  value: OUStringConstReference,
): string {
  return String.fromCharCode(...value.getStr().subarray(0, value.getLength()));
}
/** Projects native property values for assertion only. @param records - Actual records. @returns Named data. */ function rows(
  records: PropertyValue[][],
): Record<string, string | bigint>[] {
  return records.map(
    /** Extracts actual Any payloads. @param sequence - Native sequence. @returns Test values. */ (
      sequence,
    ) =>
      Object.fromEntries(
        sequence.map(
          /** Original typed extraction. @param p - Property. @returns Name and payload. */ (p) => {
            const name = text(p.Name);
            if (name === "Size") {
              const value: [bigint] = [0n];
              expect(p.Value.extract(value, "sal_Int64")).toBe(true);
              return [name, value[0]];
            }
            const value = new OUString();
            try {
              expect(p.Value.extract(value, "OUString")).toBe(true);
              expect([p.Handle, p.State]).toEqual([0, 0]);
              return [name, text(value)];
            } finally {
              value.dispose();
            }
          },
        ),
      ),
  );
}
/** Wraps plain native entries. @param body - Entry XML. @param attributes - Root metadata. @returns XML. */ function xml(
  body: string,
  attributes = "",
): string {
  return `<m:manifest xmlns:m="${ns}" ${attributes}>${body}</m:manifest>`;
}
it("reads the actual ODS fixture metadata into original property order and typed values", /** No ZIP64 or document import claim. @returns Nothing. */ () => {
  const records = readManifestSequence(fixture.manifestXml);
  expect(rows(records)).toEqual([
    { FullPath: "/", Version: "1.2", MediaType: "application/vnd.oasis.opendocument.spreadsheet" },
    { FullPath: "styles.xml", MediaType: "text/xml" },
    { FullPath: "content.xml", MediaType: "text/xml" },
  ]);
  expect(
    records.map(
      /** Reads original slot ordering after empty-property erasure. @param row - Properties. @returns Names. */ (
        row,
      ) => row.map(/** Reads name. @param p - Property. @returns Name. */ (p) => text(p.Name)),
    ),
  ).toEqual([
    ["FullPath", "Version", "MediaType"],
    ["FullPath", "MediaType"],
    ["FullPath", "MediaType"],
  ]);
});
it("keeps empty required attributes and applies package version only to the first entry without an explicit version", /** Native missing values are empty strings,not admission failures. @returns Nothing. */ () => {
  const source = xml(
    '<m:file-entry/><m:file-entry m:full-path="other" m:version="1.0" m:media-type=""/><m:file-entry m:version=""/>',
    'm:version="1.3"',
  );
  expect(rows(readManifestSequence(source))).toEqual([
    { FullPath: "", Version: "1.3", MediaType: "" },
    { FullPath: "other", Version: "1.0", MediaType: "" },
    { FullPath: "", MediaType: "" },
  ]);
  expect(
    rows(readManifestSequence(xml('<m:file-entry m:version="1.1"/>', 'm:version="1.3"')))[0]
      ?.Version,
  ).toBe("1.1");
});
it("uses the shared terminated signed64 parser for Size including prefixes,overflow and source whitespace", /** No Number/BigInt string-coercion substitute. @returns Nothing. */ () => {
  for (const [size, value] of [
    ["9223372036854775807", 9223372036854775807n],
    ["-9223372036854775808", -9223372036854775808n],
    ["9223372036854775808", 0n],
    ["-9223372036854775809", 0n],
    [" +42suffix", 42n],
    ["bad", 0n],
    ["0", 0n],
  ] as const) {
    expect(rows(readManifestSequence(xml(`<m:file-entry m:size="${size}"/>`)))[0]?.Size).toBe(
      value,
    );
  }
  expect(rows(readManifestSequence(xml('<m:file-entry m:size=""/>')))[0]).not.toHaveProperty(
    "Size",
  );
});
it("preserves old/default namespace conversion and the native inner-unknown-prefix fallback", /** Original name conversion intentionally accepts inconsistent namespace forms. @returns Nothing. */ () => {
  expect(
    rows(
      readManifestSequence(
        '<manifest xmlns="http://openoffice.org/2001/manifest" version="1.1"><file-entry full-path="/" media-type="x"/></manifest>',
      ),
    ),
  ).toEqual([{ FullPath: "/", Version: "1.1", MediaType: "x" }]);
  expect(
    rows(
      readManifestSequence(
        xml('<m:file-entry xmlns:m="urn:foreign" m:full-path="kept" m:media-type="x"/>'),
      ),
    ),
  ).toEqual([{ FullPath: "kept", MediaType: "x" }]);
  expect(
    rows(
      readManifestSequence(
        '<manifest:manifest><manifest:file-entry manifest:full-path="raw"/></manifest:manifest>',
      ),
    ),
  ).toEqual([{ FullPath: "raw", MediaType: "" }]);
});
it("preserves the original level-two entry acceptance even when its root is invalid and ignores other nested metadata", /** Suspicious parent validity is recorded rather than corrected. @returns Nothing. */ () => {
  expect(
    rows(
      readManifestSequence(
        `<wrong xmlns:m="${ns}"><m:file-entry m:full-path="accepted"/><other><m:file-entry m:full-path="ignored"/></other></wrong>`,
      ),
    ),
  ).toEqual([{ FullPath: "accepted", MediaType: "" }]);
  expect(
    rows(
      readManifestSequence(
        xml(
          '<m:file-entry m:full-path="x"><extra><m:encryption-data/></extra></m:file-entry><unrelated/>',
        ),
      ),
    ),
  ).toEqual([{ FullPath: "x", MediaType: "" }]);
});
it("discards all partial entries on actual SAX errors but retains unsupported-profile admission failures", /** Reader assignment occurs only after complete successful parsing. @returns Nothing. */ () => {
  for (const value of ["", "<broken", xml("<m:file-entry/>").slice(0, -5), "<wrong/>"]) {
    expect(readManifestSequence(value)).toEqual([]);
  }
  expect(
    /** Existing declaration admission. @returns Records. */ () =>
      readManifestSequence("<!DOCTYPE m:manifest>" + xml("")),
  ).toThrow("declarations");
  expect(
    /** Existing depth admission. @returns Records. */ () =>
      readManifestSequence(xml("<x>".repeat(256) + "</x>".repeat(256))),
  ).toThrow("depth limit");
  for (const body of [
    "<m:encrypted-key/>",
    "<loext:keyinfo/>",
    "<m:file-entry><m:encryption-data/></m:file-entry>",
  ])
    expect(
      /** Explicit unimplemented encryption profile. @returns Records. */ () =>
        readManifestSequence(xml(body)),
    ).toThrow("Encrypted manifest import");
});
it("borrows an existing destination vector and retains the original mismatched-end guard and no-op document callbacks", /** Uses actual SAX values and namespace declarations. @returns Nothing. */ () => {
  const records = [[property("FullPath", "existing")]],
    handler = new ManifestImport(records),
    root = unicode("m:manifest"),
    entry = unicode("m:file-entry"),
    wrong = unicode("wrong"),
    attrs = new AttributeList(),
    xmlns = unicode("xmlns:m"),
    uri = unicode(ns),
    version = unicode("m:version"),
    v = unicode("1.3"),
    data = unicode("raw");
  attrs.AddAttribute(xmlns, uri);
  attrs.AddAttribute(version, v);
  handler.startDocument();
  handler.setDocumentLocator(null);
  handler.startElement(root, attrs);
  handler.startElement(entry, null);
  handler.characters(data);
  handler.ignorableWhitespace(data);
  handler.processingInstruction(data, data);
  handler.endElement(wrong);
  handler.endElement(entry);
  handler.endElement(root);
  handler.endDocument();
  expect(rows(records)).toEqual([{ FullPath: "existing" }, { FullPath: "", MediaType: "" }]);
  expect(
    /** Native missing-scope precondition. @returns Nothing. */ () => handler.endElement(root),
  ).toThrow("requires a scope");
  const scope = new ManifestScopeEntry("raw", new Map());
  expect(scope.m_bValid).toBe(true);
  scope.m_bValid = false;
  scope.m_aConvertedName = "changed";
  expect(scope.m_aConvertedName).toBe("changed");
  attrs.Clear();
  for (const value of [root, entry, wrong, xmlns, uri, version, v, data]) value.dispose();
});
it("passes normal text,CDATA and processing instructions without inventing manifest fields", /** All actual plain SAX text channels are exercised. @returns Nothing. */ () => {
  expect(
    rows(
      readManifestSequence(xml('text<![CDATA[raw]]><?pi data?><m:file-entry m:full-path="x"/>')),
    ),
  ).toEqual([{ FullPath: "x", MediaType: "" }]);
});
