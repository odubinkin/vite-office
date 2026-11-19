/** @fileoverview Original ActiveDataStreamer holds actual memory streams; replacing a reference never closes or rewinds either stream. */
import { afterEach, expect, it } from "vitest";
import { ActiveDataStreamer } from "./activedatastreamer";
import {
  XActiveDataStreamer,
  cppu_detail_getUnoType,
} from "../../../udkapi/com/sun/star/io/XActiveDataStreamer";
import { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { own, api, read, releaseDomScope } from "../../../test/native-dom";
afterEach(releaseDomScope);

it("exposes the original generated interface and initially empty stream", /** Queries the genuine component and shared typelib. @returns Nothing. */ () => {
  const streamer = own(new Reference(new ActiveDataStreamer())),
    queried = own(
      new Reference<XActiveDataStreamer>(
        streamer,
        UNO_QUERY_THROW,
        XActiveDataStreamer.static_type,
      ),
    ),
    empty = own(api(queried).getStream());
  expect(queried.get()).toBe(streamer.get());
  expect(empty.is()).toBe(false);
  expect(read(cppu_detail_getUnoType().getTypeName())).toBe("com.sun.star.io.XActiveDataStreamer");
});

it("keeps acquired stream returns alive independently and never rewinds on replacement", /** Uses source memory-stream instances rather than caller substitutes. @returns Nothing. */ () => {
  const streamer = own(new Reference(new ActiveDataStreamer())),
    first = own(new Reference(new UNOMemoryStream())),
    second = own(new Reference(new UNOMemoryStream())),
    firstStream = own(new Reference<XStream>(first, UNO_QUERY_THROW, XStream.static_type)),
    secondStream = own(new Reference<XStream>(second, UNO_QUERY_THROW, XStream.static_type));
  api(first).seek(3n);
  api(second).seek(7n);
  api(streamer).setStream(firstStream);
  const retained = own(api(streamer).getStream());
  expect(retained.get()).toBe(first.get());
  api(streamer).setStream(secondStream);
  expect(own(api(streamer).getStream()).get()).toBe(second.get());
  expect(retained.get()).toBe(first.get());
  expect(api(first).getPosition()).toBe(3n);
  expect(api(second).getPosition()).toBe(7n);
  const empty = own(new Reference<XStream>());
  api(streamer).setStream(empty);
  expect(own(api(streamer).getStream()).is()).toBe(false);
  expect(api(first).getPosition()).toBe(3n);
  expect(api(second).getPosition()).toBe(7n);
});
