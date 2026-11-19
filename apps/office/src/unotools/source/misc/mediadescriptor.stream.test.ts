/** @fileoverview Original provided-input/no-source/invalid-PostData/readonly precedence descriptor profiles. Real Any/map/stream owners and declared Reference template extraction are used; positive URL/auth/POST/default environment remain unqualified. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { SequenceAsHashMap } from "../../../comphelper/source/misc/sequenceashashmap";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { own, u, releaseDomScope } from "../../../test/native-dom";
import {
  addInputStream,
  isStreamReadOnly,
  PROP_INPUTSTREAM,
  PROP_POSTDATA,
  PROP_READONLY,
  PROP_STREAM,
  PROP_UCBCONTENT,
  PROP_URL,
} from "../../inc/mediadescriptor";
beforeAll(
  /** Actual native services/exceptions. @returns Completion. */ async () => {
    await initializeRuntime();
    initializeExceptionAbi();
  },
);
afterEach(releaseDomScope);
it("retains an existing real input without seeking, querying, replacing or opening its URL", /** Original fast path is map presence alone. @returns Nothing. */ () => {
  const data = own(new SequenceAsHashMap()),
    input = own(new Reference<XInputStream>(new MemoryInputStream(Uint8Array.of(1, 2, 3), 3)));
  input.operatorStar().skipBytes(1);
  data
    .operatorIndex(PROP_INPUTSTREAM)
    .insert(input.getAddress(), ["Reference", XInputStream.static_type]);
  data
    .operatorIndex(PROP_URL)
    .insert(u("https://invalid.example/docx").getDataAddress(), "OUString");
  const before = data.size();
  expect(addInputStream(data)).toBe(true);
  expect(data.size()).toBe(before);
  expect(input.operatorStar().available()).toBe(2);
  const empty = own(new Reference<XInputStream>()),
    found = own(
      data.getUnpackedValueOrDefault(PROP_INPUTSTREAM, empty, [
        "Reference",
        XInputStream.static_type,
      ]),
    );
  expect(found.get()).toBe(input.get());
});
it.each([false, true])(
  "preserves an existing invalid InputStream item:%s",
  /** Source presence bypasses extraction even for VOID or scalar; no successful fake stream is manufactured. @param scalar - Original value selection. @returns Nothing. */ (
    scalar,
  ) => {
    const data = own(new SequenceAsHashMap());
    if (scalar) data.operatorIndex(PROP_INPUTSTREAM).insert([42], "sal_Int32");
    else data.operatorIndex(PROP_INPUTSTREAM);
    expect(addInputStream(data)).toBe(true);
    expect(data.size()).toBe(1);
    expect(data.operatorIndex(PROP_INPUTSTREAM).hasValue()).toBe(scalar);
  },
);
it.each(["absent", "empty", "wrong"])(
  "returns false for the original no-URL descriptor:%s",
  /** Invalid/missing URL becomes the original empty default and caught UNO exception, without mutation. @param mode - Native descriptor selection. @returns Nothing. */ (
    mode,
  ) => {
    const data = own(new SequenceAsHashMap());
    if (mode === "empty") data.operatorIndex(PROP_URL).insert(u("").getDataAddress(), "OUString");
    if (mode === "wrong") data.operatorIndex(PROP_URL).insert([9], "sal_Int32");
    const size = data.size();
    expect(addInputStream(data)).toBe(false);
    expect(data.size()).toBe(size);
    expect(data.find(PROP_INPUTSTREAM)).toBeUndefined();
  },
);
it.each([false, true])(
  "retains invalid PostData failure before URL processing:%s",
  /** Source invalid PostData throws argument1 internally, caught by outer addInputStream. @param scalar - Wrong type versus VOID. @returns Nothing. */ (
    scalar,
  ) => {
    const data = own(new SequenceAsHashMap());
    if (scalar) data.operatorIndex(PROP_POSTDATA).insert([1], "sal_Int32");
    else data.operatorIndex(PROP_POSTDATA);
    data.operatorIndex(PROP_URL).insert(u("file:///tmp/ignored").getDataAddress(), "OUString");
    expect(addInputStream(data)).toBe(false);
    expect(data.find(PROP_READONLY)).toBeUndefined();
    expect(data.find(PROP_INPUTSTREAM)).toBeUndefined();
  },
);
it("keeps positive URL and PostData opening explicitly unavailable rather than replacing trust or interactions", /** No UCB/file/network opening or authentication fallback is installed. @returns Nothing. */ () => {
  const url = own(new SequenceAsHashMap());
  url.operatorIndex(PROP_URL).insert(u("file:///tmp/media.xml#part").getDataAddress(), "OUString");
  expect(
    /** Actual missing source orchestration. @returns Source result. */ () => addInputStream(url),
  ).toThrow("trust/interaction orchestration");
  const post = own(new SequenceAsHashMap()),
    input = own(new Reference<XInputStream>(new MemoryInputStream(new Uint8Array(), 0)));
  post
    .operatorIndex(PROP_POSTDATA)
    .insert(input.getAddress(), ["Reference", XInputStream.static_type]);
  expect(
    /** Actual missing source post orchestration. @returns Source result. */ () =>
      addInputStream(post),
  ).toThrow("interaction/post orchestration");
});
it.each([true, false, "wrong", "void"])(
  "retains explicit ReadOnly precedence and failed bool extraction:%s",
  /** Explicit state precedes both PostData and Stream presence. @param value - Native property selection. @returns Nothing. */ (
    value,
  ) => {
    const data = own(new SequenceAsHashMap());
    data.operatorIndex(PROP_POSTDATA);
    data.operatorIndex(PROP_STREAM);
    if (typeof value === "boolean") data.operatorIndex(PROP_READONLY).insert([value], "bool");
    else if (value === "wrong") data.operatorIndex(PROP_READONLY).insert([1], "sal_Int32");
    else data.operatorIndex(PROP_READONLY);
    expect(isStreamReadOnly(data)).toBe(value === true);
    expect(data.size()).toBe(3);
  },
);
it("retains PostData/Stream presence ordering and no-content false default", /** Even VOID items have source presence semantics. @returns Nothing. */ () => {
  const data = own(new SequenceAsHashMap());
  expect(isStreamReadOnly(data)).toBe(false);
  data.operatorIndex(PROP_STREAM);
  expect(isStreamReadOnly(data)).toBe(false);
  data.operatorIndex(PROP_POSTDATA);
  expect(isStreamReadOnly(data)).toBe(true);
  data.erase(PROP_POSTDATA);
  expect(isStreamReadOnly(data)).toBe(false);
  data.erase(PROP_STREAM);
  data.operatorIndex(PROP_UCBCONTENT).insert([7], "sal_Int32");
  expect(isStreamReadOnly(data)).toBe(false);
});
it("implements the original declared Reference template default/success/failure and independent owned results", /** Actual native interface values and ownership, without a replacement template or type provider. @returns Nothing. */ () => {
  const data = own(new SequenceAsHashMap()),
    key = u("ref"),
    fallback = own(new Reference<XInputStream>(new MemoryInputStream(Uint8Array.of(1), 1))),
    source = own(new Reference<XInputStream>(new MemoryInputStream(Uint8Array.of(2, 3), 2)));
  const absent = own(
    data.getUnpackedValueOrDefault(key, fallback, ["Reference", XInputStream.static_type]),
  );
  expect(absent.get()).toBe(fallback.get());
  data.operatorIndex(key).insert([12], "sal_Int32");
  const wrong = own(
    data.getUnpackedValueOrDefault(key, fallback, ["Reference", XInputStream.static_type]),
  );
  expect(wrong.get()).toBe(fallback.get());
  data.operatorIndex(key).insert(source.getAddress(), ["Reference", XInputStream.static_type]);
  const found = own(
    data.getUnpackedValueOrDefault(key, fallback, ["Reference", XInputStream.static_type]),
  );
  expect(found.get()).toBe(source.get());
  data.clear();
  source.clear();
  expect(found.operatorStar().available()).toBe(2);
});
