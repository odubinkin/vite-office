/** @fileoverview Native serializer byte escaping, cache boundaries and mark ordering over actual ZIP fragment streams and native OOXML token IDs. */
import { readOwnedInput } from "../../../test/oox-input";
import { expect, it } from "vitest";
import { FastSerializerHelper, FSNS, MergeMarks as M } from "../../inc/fshelper";
import { FastSaxSerializer, TokenValue, invalidChar } from "./fastserializer";
import { CachedOutputStream } from "./CachedOutputStream";
import { FastTokenHandler } from "../../../oox/source/core/fasttokenhandler";
import { XmlFilterBase } from "../../../oox/source/core/xmlfilterbase";
import { ZipStorage } from "../../../oox/source/helper/zipstorage";
import { ZipFragmentStream } from "../../../oox/source/helper/zipstorage";
import { getTokenFromUtf8 as token } from "../../../oox/source/token/tokenmap";
const encoder = new TextEncoder(),
  decoder = new TextDecoder();
/** Actual native output stream owner. @returns Fragment. */ function output(): ZipFragmentStream {
  return new ZipFragmentStream("word/document.xml", "application/xml");
}
/** Escapes a string through the actual native serializer. @param text - Input. @param allow - Original switch. @returns Output. */
function escaped(text: string | Uint8Array, allow = true): string {
  const stream = output(),
    serializer = new FastSaxSerializer(stream, new FastTokenHandler());
  serializer.setAllowXEscape(allow);
  serializer.write(text, true);
  serializer.endDocument();
  return decoder.decode(stream.getBytes());
}

it("writes original document/header, lexical namespace tokens, ordered attributes and helper lifecycle", /** Actual OOXML names are used, without a private token catalog. @returns Nothing. */ () => {
  const stream = output(),
    helper = new FastSerializerHelper(stream, true, new FastTokenHandler()),
    w = token("w"),
    p = token("p"),
    r = token("r"),
    t = token("t"),
    val = token("val");
  expect(helper.getOutputStream()).toBe(stream);
  helper.startElementNS(
    w,
    p,
    FSNS(token("xmlns"), w),
    "urn:test",
    FSNS(w, val),
    null,
    FSNS(w, token("name")),
    "",
  );
  helper.startElement(FSNS(w, r), FSNS(w, val), encoder.encode("<&\"'"));
  helper.startElementNS(w, t);
  expect(helper.writeEscaped("A & Ω")).toBe(helper);
  helper.endElementNS(w, t);
  helper.endElement(FSNS(w, r));
  helper.singleElementNS(w, token("br"));
  helper.singleElement(FSNS(w, token("tab")));
  helper.endElementNS(w, p);
  expect(helper.write(" ").writeId(token("w"))).toBe(helper);
  helper.endDocument();
  helper.dispose();
  expect(decoder.decode(stream.getBytes())).toBe(
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:p xmlns:w="urn:test" w:name=""><w:r w:val="&lt;&amp;&quot;&apos;"><w:t>A &amp; Ω</w:t></w:r><w:br/><w:tab/></w:p> w',
  );
  expect(
    /** Original moved owner precondition. @returns Never. */ () => helper.endDocument(),
  ).toThrow("ended");
  const unfinished = new FastSerializerHelper(output(), false, new FastTokenHandler());
  unfinished.startDocument();
  unfinished.write(new Uint8Array([65]));
  unfinished.mark(8);
  unfinished.singleElement(p);
  unfinished.mergeTopMarks(8);
  unfinished.setAllowXEscape(false);
  unfinished.dispose();
});

it("escapes XML10 bytes, XML punctuation and original literal/already-escaped x sequences exactly", /** The native exceptions for blanks, adjacent literals and existing escapes are retained. @returns Nothing. */ () => {
  expect(escaped("<>&'\"\t\n\r")).toBe("&lt;&gt;&amp;&apos;&quot;&#9;&#10;&#13;");
  for (let code = 0; code < 32; ++code) {
    const expected =
      code === 9
        ? "&#9;"
        : code === 10
          ? "&#10;"
          : code === 13
            ? "&#13;"
            : "_x" + code.toString(16).padStart(4, "0") + "_";
    expect(escaped(new Uint8Array([code]))).toBe(expected);
  }
  expect(escaped("Ω🙂\ufffe\uffff")).toBe("Ω🙂_xfffe__xffff_");
  expect(escaped("_x0020_ _X0020_ _x0041_ _x0041_x0042_ _x005F_x0041_ _x005f_XaF09_")).toBe(
    "_x0020_ _X0020_ _x005F_x0041_ _x005F_x0041_x0042_ _x005F_x0041_ _x005f_XaF09_",
  );
  for (const value of [
    "_",
    "_x1234",
    "_x1234a",
    "_z1234_",
    "_xg234_",
    "_x1g34_",
    "_x12g4_",
    "_x123g_",
    "_x005F_x004g_",
    "_x005F_z0041_",
    "_x005F_x0041z",
    "_x005F_",
  ])
    expect(escaped(value)).toBe(value.startsWith("_x005F_") ? "_x005F_" + value.slice(1) : value);
  expect(escaped(new Uint8Array([0xef, 0x41]))).toBe("�A");
  expect(escaped(new Uint8Array([0xef, 0xbf, 0xbd]))).toBe("�");
  expect(escaped("\u0001\uffff_x0041_&", false)).toBe("\u0001\uffff_x0041_&amp;");
});

it("retains append/prepend/postpone ordering, final merge mode irrelevance and native empty-stack no-op", /** Unsorted marks retain separate postponed bytes until their next merge. @returns Nothing. */ () => {
  const stream = output(),
    helper = new FastSerializerHelper(stream, false, new FastTokenHandler());
  helper.mergeTopMarks(99);
  helper.mark(1);
  helper.write("B");
  helper.mark(2);
  helper.write("A");
  helper.mergeTopMarks(2, M.PREPEND);
  helper.mark(3);
  helper.write("D");
  helper.mergeTopMarks(3, M.POSTPONE);
  helper.write("C");
  helper.mark(4);
  helper.write("E");
  helper.mergeTopMarks(4);
  helper.mergeTopMarks(1, M.PREPEND);
  helper.endDocument();
  expect(decoder.decode(stream.getBytes())).toBe("ABCED");
  const empty = new FastSaxSerializer(output(), new FastTokenHandler());
  empty.mark(1);
  expect(
    /** Native unfinished-mark precondition. @returns Never. */ () => empty.endDocument(),
  ).toThrow("active marks");
  empty.mergeTopMarks(22);
  empty.endDocument();
});

it("sorts recognized buckets, retains sticky unknown tokens, drops pre-bucket bytes and treats sorted prepend as append", /** Uses real native OOXML local tokens and repeated schema order. @returns Nothing. */ () => {
  const stream = output(),
    helper = new FastSerializerHelper(stream, false, new FastTokenHandler()),
    a = token("p"),
    b = token("r"),
    unknown = token("t"),
    missing = token("val");
  helper.mark(1, [a, b, a, missing]);
  helper.write("dropped");
  helper.singleElement(b);
  helper.singleElement(unknown);
  helper.singleElement(b);
  helper.startElement(a);
  helper.write("X");
  helper.endElement(a);
  helper.mark(2);
  helper.write("Y");
  helper.mergeTopMarks(2, M.PREPEND);
  helper.mergeTopMarks(1);
  helper.endDocument();
  expect(decoder.decode(stream.getBytes())).toBe("<p>X</p>Y<r/><t/><r/><p>X</p>Y");
});

it("keeps exact 1MiB buffering, oversized direct writes and flush-before-switch destinations", /** The actual fragment stream copies input; the cache never substitutes a second persistent stream. @returns Nothing. */ () => {
  const a = output(),
    b = output(),
    cache = new CachedOutputStream(),
    size = 0x100000,
    exact = new Uint8Array(size).fill(65),
    huge = new Uint8Array(size + 1).fill(66),
    collected: Uint8Array[] = [];
  expect(cache.getOutputStream()).toBeNull();
  expect(
    /** Original unset stream violates the output precondition. @returns Never. */ () =>
      cache.flush(),
  ).toThrow("not assigned");
  cache.setOutputStream(a);
  cache.writeBytes(exact);
  expect(a.getBytes()).toHaveLength(0);
  cache.writeBytes(new Uint8Array([67]));
  expect(a.getBytes()).toHaveLength(size);
  cache.setOutput({
    /** Receives immediate native borrowed values. @param bytes - Input. @returns Nothing. */ append(
      bytes,
    ) {
      collected.push(bytes.slice());
    },
  });
  expect(a.getBytes()[size]).toBe(67);
  cache.writeBytes(huge);
  expect(
    collected.some(
      /** Finds the oversized native chunk. @param bytes - Chunk. @returns Match. */ (bytes) =>
        bytes.length === size + 1,
    ),
  ).toBe(true);
  cache.writeBytes(new Uint8Array([68]));
  cache.resetOutputToStream();
  expect(collected.at(-1)).toEqual(new Uint8Array([68]));
  cache.setOutputStream(b);
  expect(cache.getOutputStream()).toBe(b);
  cache.writeBytes(huge);
  expect(b.getBytes()).toHaveLength(size + 1);
  cache.flush();
});

it("rejects malformed erased attribute calls before emitting a tag and consumes a helper owner before output failure", /** Native static/lifetime preconditions remain explicit host failures. @returns Nothing. */ () => {
  const stream = output(),
    helper = new FastSerializerHelper(stream, false, new FastTokenHandler()),
    p = token("p");
  expect(
    /** Missing native value is invalid after variadic erasure. @returns Never. */ () =>
      helper.startElement(p, token("val")),
  ).toThrow("incomplete");
  expect(
    /** Attribute token must remain numeric. @returns Never. */ () =>
      helper.singleElement(p, "bad", "value"),
  ).toThrow("invalid");
  expect(
    /** Attribute value must retain its selected native type. @returns Never. */ () =>
      helper.singleElement(p, token("val"), 1),
  ).toThrow("invalid");
  stream.closeOutput();
  expect(
    /** Real fragment failure propagates. @returns Never. */ () => helper.endDocument(),
  ).toThrow("closed");
  helper.dispose();
});

it("opens original OOXML XML/VML/no-header serializers through XmlFilterBase and commits real package streams", /** Checks actual storage, MIME content types and fragment ownership. @returns Nothing. */ async () => {
  const storage = new ZipStorage(),
    filter = new XmlFilterBase(storage),
    w = token("w"),
    document = token("document");
  filter.addRelation(
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument",
    "word/document.xml",
  );
  const serializer = filter.openFragmentStreamWithSerializer(
    "word/document.xml",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml",
  );
  serializer.startElementNS(
    w,
    document,
    FSNS(token("xmlns"), w),
    "http://schemas.openxmlformats.org/wordprocessingml/2006/main",
  );
  serializer.endElementNS(w, document);
  serializer.endDocument();
  for (const [name, mime, suppressed, expected] of [
    ["plain.vml", "vml", false, false],
    ["typed.vml", "application/vml+xml", false, true],
    ["no.xml", "application/xml", true, false],
  ] as const) {
    const fragment = filter.openFragmentStreamWithSerializer(name, mime, suppressed);
    fragment.singleElement(token("p"));
    fragment.endDocument();
    const bytes = await storage.openInputStream(name);
    expect(bytes.is()).toBe(true);
    expect(decoder.decode(readOwnedInput(bytes) ?? undefined).startsWith("<?xml")).toBe(expected);
  }
  const reopened = new ZipStorage(filter.commitStorage()),
    xml = await reopened.openInputStream("word/document.xml"),
    contentTypes = await reopened.openInputStream("[Content_Types].xml");
  expect(decoder.decode(readOwnedInput(xml) ?? undefined)).toContain(
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"></w:document>',
  );
  expect(decoder.decode(readOwnedInput(contentTypes) ?? undefined)).toContain(
    "wordprocessingml.document.main+xml",
  );
});

it("retains native invalidChar XML10 admission for whitespace in diagnostic and escaped byte paths", /** The original file-local predicate is tested directly as well as through output. @returns Nothing. */ () => {
  for (const c of [9, 10, 13, 32, 65]) expect(invalidChar(new Uint8Array([c]), 0)).toBeUndefined();
  expect(invalidChar(new Uint8Array([0]), 0)).toEqual([0, 1]);
});

it("retains original TokenValue borrowed-view mutation before synchronous element emission", /** Native string_view ownership is not replaced by an attribute snapshot. @returns Nothing. */ () => {
  const stream = output(),
    serializer = new FastSaxSerializer(stream, new FastTokenHandler()),
    bytes = new Uint8Array([65]),
    entry = new TokenValue(token("val"), bytes);
  serializer.getTokenValueList().push(entry);
  bytes[0] = 66;
  serializer.singleFastElement(token("p"));
  serializer.endDocument();
  expect(decoder.decode(stream.getBytes())).toBe('<p val="B"/>');
  expect(serializer.getTokenValueList()).toHaveLength(0);
});

it("retains the native mark-stack/empty-flag inconsistency after initial output failure", /** The original flag assignment follows the fallible cache destination switch. @returns Nothing. */ () => {
  const stream = output();
  stream.closeOutput();
  const serializer = new FastSaxSerializer(stream, new FastTokenHandler());
  expect(
    /** Fails while flushing the old destination after pushing the mark. @returns Never. */ () =>
      serializer.mark(1),
  ).toThrow("closed");
  expect(
    /** Native release guard sees the unchanged empty flag. @returns Nothing. */ () =>
      serializer.mergeTopMarks(1),
  ).not.toThrow();
  expect(
    /** Native unchanged flag bypasses the mark-element flush as well. @returns Nothing. */ () =>
      serializer.singleFastElement(token("p")),
  ).not.toThrow();
  expect(
    /** Source end-document invariant still notices the retained mark. @returns Never. */ () =>
      serializer.endDocument(),
  ).toThrow("active marks");
});
