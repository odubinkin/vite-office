/** @fileoverview Genuine post command SDK values retain their declared base/reference/string types across native compound copies. */
import { afterEach, expect, it } from "vitest";
import {
  PostCommandArgument,
  cppu_detail_getUnoType as baseType,
  getCppuType as getBaseType,
} from "./PostCommandArgument";
import { PostCommandArgument2, cppu_detail_getUnoType, getCppuType } from "./PostCommandArgument2";
import { Any } from "../../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../../../cppu/inc/com/sun/star/uno/Sequence";
import { UNOMemoryStream } from "../../../../../comphelper/source/streaming/memorystream";
import { ActiveDataSink } from "../../../../../ucbhelper/source/client/activedatasink";
import { OUString } from "../../../../../sal/inc/rtl/ustring";
import { own, api, u, read, releaseDomScope } from "../../../../../test/native-dom";
afterEach(releaseDomScope);

it("keeps original default fields and generated cached base/derived types", /** Observes genuine native default construction. @returns Nothing. */ () => {
  const value = own(new PostCommandArgument2());
  expect(value).toBeInstanceOf(PostCommandArgument);
  expect(value.Source.is()).toBe(false);
  expect(value.Sink.is()).toBe(false);
  expect(value.MediaType.isEmpty()).toBe(true);
  expect(value.Referer.isEmpty()).toBe(true);
  expect(getBaseType()).toBe(baseType());
  expect(getCppuType()).toBe(cppu_detail_getUnoType());
  expect(read(baseType().getTypeName())).toBe("com.sun.star.ucb.PostCommandArgument");
  expect(read(cppu_detail_getUnoType().getTypeName())).toBe(
    "com.sun.star.ucb.PostCommandArgument2",
  );
});

it("copies actual source/sink identity and UTF16 fields through Any and base values", /** Uses source memory stream and source active sink, with no substitute content service. @returns Nothing. */ () => {
  const memory = own(new Reference(new UNOMemoryStream())),
    input = own(api(memory).getInputStream()),
    sink = own(new Reference(new ActiveDataSink())),
    source = own(new PostCommandArgument2(input, sink, u("application/xml"), u("private:字"))),
    any = own(new Any(source, cppu_detail_getUnoType)),
    result = own(new PostCommandArgument2()),
    base = own(new PostCommandArgument(source));
  expect(any.extract(result, cppu_detail_getUnoType)).toBe(true);
  expect(result.equals(source)).toBe(true);
  expect(base.Source.get()).toBe(memory.get());
  expect(base.Sink.get()).toBe(sink.get());
  source.MediaType = u("changed");
  expect(read(new OUString(result.MediaType))).toBe("application/xml");
  expect(read(new OUString(result.Referer))).toBe("private:字");
  expect(result.notEquals(source)).toBe(true);
  const baseAny = own(new Any(base, baseType)),
    baseResult = own(new PostCommandArgument());
  expect(baseAny.extract(baseResult, baseType)).toBe(true);
  expect(baseResult.equals(base)).toBe(true);
  expect(baseResult.assign(baseResult)).toBe(baseResult);
});

it("retains complete derived fields through native sequence storage and compiler moves", /** Checks declaration-order lifetimes of the actual managed members. @returns Nothing. */ () => {
  const input = own(api(own(new Reference(new UNOMemoryStream()))).getInputStream()),
    sink = own(new Reference(new ActiveDataSink())),
    source = own(new PostCommandArgument2(input, sink, u("text/plain"), u("private:test"))),
    sequence = own(
      new (Sequence.specialize<PostCommandArgument2>(cppu_detail_getUnoType, 32))(
        {
          /** Borrows the actual initialized aggregate. @returns Native source address. */ get() {
            return source;
          },
        },
        1,
      ),
    ),
    raw = sequence.operatorIndex(0),
    copiedAny = own(new Any(raw, cppu_detail_getUnoType)),
    copied = own(new PostCommandArgument2());
  expect(copiedAny.extract(copied, cppu_detail_getUnoType)).toBe(true);
  expect(copied.equals(source)).toBe(true);
  const moved = own(PostCommandArgument2.move(source));
  expect(moved.equals(copied)).toBe(true);
  expect(source.Source.is()).toBe(false);
  expect(source.Sink.is()).toBe(false);
  expect(source.MediaType.isEmpty()).toBe(true);
  expect(source.Referer.isEmpty()).toBe(true);
  source.moveAssign(moved);
  expect(source.equals(copied)).toBe(true);
  expect(copied.assign(source)).toBe(copied);
});
