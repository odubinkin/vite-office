/** @fileoverview Original concrete native RelationsFragment parses real XML and actual upstream DOCX/XLSX package streams into the same native Relations owner. No replacement positive handler or expanded-name adapter. */
import { readFileSync } from "node:fs";
import { afterEach, beforeAll, expect, it } from "vitest";
import { RelationsFragment } from "./relationshandler.native";
import { Relations } from "./relations.native";
import { SharedReference } from "./shared-reference";
import { XmlFilterBase } from "./xmlfilterbase";
import { ZipStorage } from "../helper/zipstorage";
import { FastParser } from "./fastparser";
import { namespaceTokens } from "../token/namespacemap";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { InputSource } from "../../../offapi/com/sun/star/xml/sax/InputSource";
import { SAXParseException } from "../../../offapi/com/sun/star/xml/sax/SAXParseException";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { inputFromBytes } from "../../../test/oox-input";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
const NS = "http://schemas.openxmlformats.org/package/2006/relationships";
beforeAll(
  /** Actual C and UNO setup. @returns Completion. */ async () => {
    await initializeLibXml2();
    initializeExceptionAbi();
  },
);
afterEach(releaseDomScope);
/** Actual native owners for one relationships part. @param path - Source fragment path. @param storage - Real optional package transport. @returns Owners. */
function fixture(path = "word/document.xml", storage = new ZipStorage()) {
  const filter = new XmlFilterBase(storage),
    relations = own(new SharedReference(new Relations(u(path)))),
    handler = own(new Reference(new RelationsFragment(filter, relations))),
    parser = own(new FastParser());
  parser.registerNamespace(namespaceTokens.get("packageRel") as number);
  parser.setDocumentHandler(own(new Reference(handler.get())));
  return { filter, relations, handler, parser };
}
/** Real byte stream source. @param xml - Actual fixture. @returns Native input. */
function input(xml: string): InputSource {
  const source = own(new InputSource());
  source.aInputStream.assign(own(inputFromBytes(new TextEncoder().encode(xml))));
  return source;
}
/** Original office type view. @param value - Native fixture. @returns Counted units. */
function view(value: string): Uint16Array {
  const native = u(value);
  return native.getStr().subarray(0, native.getLength());
}
it.each([
  ["", "_rels/.rels"],
  ["file.xml", "_rels/file.xml.rels"],
  ["word/document.xml", "word/_rels/document.xml.rels"],
  ["word/字😀.xml", "word/_rels/字😀.xml.rels"],
  ["a/b/", "a/b/_rels/.rels"],
])(
  "constructs the original native relation path %s",
  /** Actual constructor invokes the source counted-view concat helper. @param path - Fragment path. @param expected - Relationship path. @returns Nothing. */ (
    path,
    expected,
  ) => {
    const f = fixture(path);
    expect(text(f.handler.operatorStar().getFragmentPath())).toBe(expected);
    expect(f.handler.operatorStar().getRelations()).toBe(f.relations.get());
    expect(f.relations.use_count()).toBe(3);
  },
);
it("parses actual native tokens/defaults/Unicode fields and preserves first duplicate and unknown modes", /** Real native attributes drive the original handler switch. @returns Nothing. */ () => {
  const f = fixture();
  f.parser.parseStream(
    input(`<Relationships xmlns="${NS}">
    <Relationship Id="z" Type="urn:type" Target="media/字😀.xml"/>
    <Relationship Id="z" Type="ignored" Target="ignored.xml"/>
    <Relationship Id="a" Type="urn:external" Target="https://example.test" TargetMode="External"/>
    <Relationship Id="empty" Type="urn:type" Target="empty-mode" TargetMode=""/>
    <Relationship Id="invalid" Type="urn:type" Target="unknown-mode" TargetMode="bogus-mode"/>
    <Relationship Id="internal" Type="urn:type" Target="../styles.xml" TargetMode="Internal"/>
    <Relationship Id="case" Type="urn:type" Target="wrong-case" TargetMode="internal"/>
  </Relationships>`),
  );
  const values = f.relations.operatorStar();
  expect(values.size()).toBe(6);
  expect(read(values.getInternalTargetFromRelId(u("z")))).toBe("media/字😀.xml");
  expect(read(values.getFragmentPathFromRelId(u("z")))).toBe("word/media/字😀.xml");
  for (const id of ["a", "empty", "invalid", "case"])
    expect(read(values.getInternalTargetFromRelId(u(id)))).toBe("");
  expect(read(values.getExternalTargetFromRelId(u("a")))).toBe("https://example.test");
  expect(read(values.getExternalTargetFromRelId(u("invalid")))).toBe("unknown-mode");
  expect(read(values.getFragmentPathFromRelId(u("internal")))).toBe("styles.xml");
});
it("ignores incomplete fields, namespaced required attributes and declined nested/foreign contexts", /** Native parser controls subtree rejection and unknown namespace behavior. @returns Nothing. */ () => {
  const f = fixture();
  f.parser.parseStream(
    input(`<Relationships xmlns="${NS}" xmlns:p="${NS}">
    <Relationship Type="t" Target="x"/><Relationship Id="i" Target="x"/><Relationship Id="i" Type="t"/>
    <Relationship Id="" Type="t" Target="x"/><Relationship Id="i" Type="" Target="x"/><Relationship Id="i" Type="t" Target=""/>
    <Relationship p:Id="prefixed" Type="t" Target="x"/>
    <ignored><Relationship Id="hidden" Type="t" Target="x"/></ignored>
    <foreign xmlns="urn:foreign"><Relationship Id="foreign" Type="t" Target="x"/></foreign>
    <Relationship Id="visible" Type="t" Target="a_x0041_.xml"/>
  </Relationships>`),
  );
  expect(f.relations.operatorStar().size()).toBe(1);
  expect(read(f.relations.operatorStar().getInternalTargetFromRelId(u("visible")))).toBe(
    "a_x0041_.xml",
  );
});
it("retains earlier source relation insertions when the actual C stream later fails", /** Source import is deliberately not transactional within the part. @returns Nothing. */ () => {
  const f = fixture();
  let caught = false;
  try {
    f.parser.parseStream(
      input(
        `<Relationships xmlns="${NS}"><Relationship Id="before" Type="t" Target="before.xml"/></bad>`,
      ),
    );
  } catch (error) {
    if (!(error instanceof SAXParseException)) throw error;
    error.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
  expect(read(f.relations.operatorStar().getFragmentPathFromRelId(u("before")))).toBe(
    "word/before.xml",
  );
});
it.each([
  ["sw/qa/extras/ooxmlexport/data/hello.docx", "word/document.xml"],
  ["sw/qa/extras/ooxmlexport/data/strict.docx", "word/document.xml"],
  ["sc/qa/unit/data/xlsx/preserve_space.xlsx", "xl/workbook.xml"],
  ["sc/qa/unit/data/xlsx/universal-content-strict.xlsx", "xl/workbook.xml"],
])(
  "parses actual pinned upstream package relationships %s",
  /** Source handler consumes real decompressed native input without host relation conversion. @param file - Original fixture. @param main - Expected main part. @returns Completion. */ async (
    file,
    main,
  ) => {
    const storage = await ZipStorage.open(
        Uint8Array.from(readFileSync("../../vendor/libreoffice-reference/" + file)),
      ),
      f = fixture("", storage),
      source = own(new InputSource());
    source.aInputStream.assign(own(await f.filter.openInputStream("_rels/.rels")));
    f.parser.parseStream(source);
    expect(
      read(
        f.relations
          .operatorStar()
          .getFragmentPathFromFirstTypeFromOfficeDoc(view("officeDocument")),
      ),
    ).toBe(main);
    const related = fixture(main, storage),
      part = own(new InputSource());
    part.aInputStream.assign(
      own(
        await related.filter.openInputStream(
          text(related.handler.operatorStar().getFragmentPath()),
        ),
      ),
    );
    related.parser.parseStream(part);
    expect(
      read(
        related.relations.operatorStar().getFragmentPathFromFirstTypeFromOfficeDoc(view("styles")),
      ),
    ).not.toBe("");
  },
);
