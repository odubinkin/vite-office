/** @fileoverview Source-backed OFOPXMLHelper parsing, lookup precedence and original SAX serialization contracts. */
import { expect, it } from "vitest";
import {
  GetContentTypeByName,
  ReadContentTypeSequence,
  WriteContentSequence,
  WriteRelationsInfoSequence,
} from "./ofopxmlhelper";
import { WriteContentTypes } from "../../../package/source/zippackage/ZipPackage";
import { createManifestProperty } from "../../../package/source/manifest/ManifestWriter";

it("preserves source order, duplicate pairs and the native extension-first lookup", /** Retains surprising upstream precedence. @returns Nothing. */ () => {
  const types = ReadContentTypeSequence(
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="default"/><Default Extension="xml" ContentType="duplicate"/><Override PartName="/word/document.xml" ContentType="override"/><Override PartName="odd" ContentType="odd-type"/></Types>',
  );
  expect(types[0]).toEqual([
    { First: "xml", Second: "default" },
    { First: "xml", Second: "duplicate" },
  ]);
  expect(GetContentTypeByName(types, "word/document.xml")).toBe("default");
  expect(GetContentTypeByName(types, "odd")).toBe("odd-type");
  expect(GetContentTypeByName(types, "FILE.XML")).toBe("");
  expect(GetContentTypeByName([], "a.xml")).toBe("");
  expect(GetContentTypeByName([[], types[1]], "word/document.xml")).toBe("override");
  expect(GetContentTypeByName([[{ First: "/plain", Second: "default-path" }], []], "plain")).toBe(
    "default-path",
  );
  expect(ReadContentTypeSequence("<Types/>")).toEqual([[], []]);
});

it.each([
  "<Other/>",
  "<Types><Other/></Types>",
  "<Types><Types/></Types>",
  "<Types><Default/></Types>",
  '<Types><Default Extension="xml"/></Types>',
  '<Types><Default ContentType="a"/></Types>',
  '<Types><Override ContentType="a"/></Types>',
  '<Types><Override PartName="/a"/></Types>',
  '<Types><Default Extension="xml" ContentType="a"><Override PartName="/a" ContentType="b"/></Default></Types>',
  '<c:Types xmlns:c="urn:types"/>',
  "<Types>",
  '<!DOCTYPE Types [<!ENTITY a "x">]><Types/>',
])(
  "rejects native content sequence shape/attribute violations %s",
  /** Exercises parser admission rather than extension-based guessing. @param xml - Invalid document. @returns Nothing. */ (
    xml,
  ) => {
    expect(
      /** Executes the actual failing operation. @returns Value or throws. */ () =>
        ReadContentTypeSequence(xml),
    ).toThrow();
  },
);

it("serializes exact metadata attributes through the native SAX writer and preserves XML whitespace", /** Checks UTF16/escaping and illegal output attributes. @returns Nothing. */ () => {
  const defaults = [{ First: "ü😀\t\n\r", Second: 'mime<&">' }],
    overrides = [{ First: "/part.xml", Second: "special" }];
  const xml = WriteContentSequence(defaults, overrides);
  expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
  expect(xml).toContain("&lt;&amp;&quot;&gt;");
  expect(ReadContentTypeSequence(xml)).toEqual([defaults, overrides]);
  const rels = WriteRelationsInfoSequence([
    [
      { First: "Id", Second: "rId1" },
      { First: "Type", Second: "type" },
      { First: "Target", Second: "https://e.test/?a=1&b=2" },
      { First: "TargetMode", Second: "External" },
    ],
  ]);
  expect(rels).toContain('Target="https://e.test/?a=1&amp;b=2"');
  expect(rels).toContain('<Relationship Id="rId1"');
  expect(WriteRelationsInfoSequence([])).toContain("<Relationships");
  expect(
    /** Executes the actual failing operation. @returns Value or throws. */ () =>
      WriteRelationsInfoSequence([[{ First: "other", Second: "x" }]]),
  ).toThrow("Invalid OOXML relationship attribute");
  expect(
    /** Executes the actual failing operation. @returns Value or throws. */ () =>
      WriteContentSequence([{ First: "bad\0", Second: "a" }], []),
  ).toThrow("Invalid character");
});

it("keeps native package defaults and omits only identical extension/type overrides", /** Exercises actual PropertyValue/Any metadata extraction. @returns Nothing. */ () => {
  const manifest = [
    [
      createManifestProperty("FullPath", ".xml"),
      createManifestProperty("MediaType", "application/xml"),
    ],
    [
      createManifestProperty("FullPath", "word/document.xml"),
      createManifestProperty("MediaType", "main"),
      createManifestProperty("Other", "ignored"),
    ],
    [createManifestProperty("FullPath", "empty"), createManifestProperty("MediaType", "")],
    [
      createManifestProperty("FullPath", "image.png"),
      createManifestProperty("MediaType", "image/png"),
    ],
    [
      createManifestProperty("FullPath", "image.PNG"),
      createManifestProperty("MediaType", "image/png"),
    ],
    [
      createManifestProperty("FullPath", "noextension"),
      createManifestProperty("MediaType", "noext"),
    ],
    [
      createManifestProperty("FullPath", "trailing."),
      createManifestProperty("MediaType", "trailing"),
    ],
  ];
  try {
    const [defaults, overrides] = ReadContentTypeSequence(WriteContentTypes(manifest));
    expect(
      defaults.map(
        /** Reads extensions in native order. @param pair - Default. @returns Extension. */ (
          pair,
        ) => pair.First,
      ),
    ).toEqual(["fntdata", "jpeg", "png", "rels", "xml"]);
    expect(overrides).toEqual([
      { First: "/.xml", Second: "application/xml" },
      { First: "/word/document.xml", Second: "main" },
      { First: "/image.PNG", Second: "image/png" },
      { First: "/noextension", Second: "noext" },
      { First: "/trailing.", Second: "trailing" },
    ]);
  } finally {
    for (const sequence of manifest)
      for (const property of sequence) {
        property.Name.dispose();
        property.Value.dispose();
      }
  }
});
