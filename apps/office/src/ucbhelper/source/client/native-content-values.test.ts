/** @fileoverview Actual UCB event/open/provider values use native Reference, Sequence and compound Any transport; no positive content, provider, broker or command processor is simulated. */
import { afterEach, expect, it } from "vitest";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { WeakReferenceHelper } from "../../../cppuhelper/inc/weakref";
import { MemoryInputStream } from "../../../comphelper/source/streaming/seqstream";
import { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import { XActiveDataSink } from "../../../udkapi/com/sun/star/io/XActiveDataSink";
import {
  Property,
  cppu_detail_getUnoType_Property as propertyType,
} from "../../../udkapi/com/sun/star/beans/Property";
import {
  EventObject,
  cppu_detail_getUnoType_EventObject as eventType,
} from "../../../udkapi/com/sun/star/lang/EventObject";
import * as Event from "../../../offapi/com/sun/star/ucb/ContentEvent";
import type { XContentProvider } from "../../../offapi/com/sun/star/ucb/XContentProvider";
import * as ProviderInfo from "../../../offapi/com/sun/star/ucb/ContentProviderInfo";
import * as Open from "../../../offapi/com/sun/star/ucb/OpenCommandArgument";
import * as Open2 from "../../../offapi/com/sun/star/ucb/OpenCommandArgument2";
import * as Sorting from "../../../offapi/com/sun/star/ucb/NumberedSortingInfo";
import { ContentAction } from "../../../offapi/com/sun/star/ucb/ContentAction";
import { OpenMode } from "../../../offapi/com/sun/star/ucb/OpenMode";
import {
  Command,
  cppu_detail_getUnoType as commandType,
} from "../../../offapi/com/sun/star/ucb/Command";
import { own, api, u, releaseDomScope } from "../../../test/native-dom";
import { ContentIdentifier } from "../../inc/contentidentifier";
import { ActiveDataSink } from "./activedatasink";
import type { typelib_CompoundTypeDescription as C } from "../../../cppu/inc/typelib/typedescription";
afterEach(releaseDomScope);
it("retains all content actions and open modes with the original non-contiguous ordinals", /** No platform event or enum ordinals are substituted. @returns Nothing. */ () => {
  expect(ContentAction).toEqual({
    INSERTED: 0,
    REMOVED: 1,
    DELETED: 2,
    EXCHANGED: 4,
    SEARCH_MATCHED: 128,
  });
  expect(OpenMode).toEqual({
    ALL: 0,
    FOLDERS: 1,
    DOCUMENTS: 3,
    DOCUMENT: 2,
    DOCUMENT_SHARE_DENY_NONE: 4,
    DOCUMENT_SHARE_DENY_WRITE: 5,
  });
});
it.each([Event, ProviderInfo, Open, Open2, Sorting] as const)(
  "preserves normal cached struct metadata %#",
  /** Uses the existing shared CPPU factory. @param binding - Actual generated value binding. @returns Nothing. */ (
    binding,
  ) => {
    const type = binding.cppu_detail_getUnoType();
    expect(binding.getCppuType()).toBe(type);
    expect(binding.cppu_detail_getUnoType()).toBe(type);
    const description = type.getTypeLibType()?.pType as unknown as C;
    expect(description.nMembers).toBe(
      binding === Event ? 3 : binding === Open ? 4 : binding === Open2 ? 1 : 2,
    );
  },
);
it("retains zero/false/empty defaults and copies empty values without invented positive providers", /** Default typed-empty references are genuine native defaults. @returns Nothing. */ () => {
  const event = own(new Event.ContentEvent()),
    info = own(new ProviderInfo.ContentProviderInfo()),
    open = own(new Open.OpenCommandArgument()),
    open2 = own(new Open2.OpenCommandArgument2()),
    sorting = own(new Sorting.NumberedSortingInfo());
  expect(event.Source.is() || event.Content.is() || event.Id.is()).toBe(false);
  expect(event.Action).toBe(0);
  expect(info.ContentProvider.is()).toBe(false);
  expect(info.Scheme.isEmpty()).toBe(true);
  expect([open.Mode, open.Priority, open2.Mode, open2.Priority, sorting.ColumnIndex]).toEqual([
    0, 0, 0, 0, 0,
  ]);
  expect(sorting.Ascending).toBe(false);
  expect(open.Sink.is() || open2.Sink.is()).toBe(false);
  expect(
    open.Properties.getLength() + open2.Properties.getLength() + open2.SortingInfo.getLength(),
  ).toBe(0);
  const copies = [
    own(new Event.ContentEvent(event)),
    own(new ProviderInfo.ContentProviderInfo(info)),
    own(new Open.OpenCommandArgument(open)),
    own(new Open2.OpenCommandArgument2(open2)),
    own(new Sorting.NumberedSortingInfo(sorting)),
  ] as const;
  expect(copies[0].equals(event)).toBe(true);
  expect(copies[1].equals(info)).toBe(true);
  expect(copies[2].equals(open)).toBe(true);
  expect(copies[3].equals(open2)).toBe(true);
  expect(copies[4].equals(sorting)).toBe(true);
  expect(
    copies[0].notEquals(event) ||
      copies[1].notEquals(info) ||
      copies[2].notEquals(open) ||
      copies[3].notEquals(open2) ||
      copies[4].notEquals(sorting),
  ).toBe(false);
});
it("copies inherited event source and a genuine identifier through Any while retaining component lifetimes", /** Source/content fields remain distinct owners; no content service is fabricated. @returns Nothing. */ () => {
  const id = own(new Reference(new ContentIdentifier(u("FiLe:///a.xml")))),
    weak = own(new WeakReferenceHelper(id)),
    source = own(new Reference(new ActiveDataSink())),
    event = own(new Event.ContentEvent(source, ContentAction.EXCHANGED, own(new Reference()), id)),
    envelope = own(new Any(event, Event.cppu_detail_getUnoType)),
    output = own(new Event.ContentEvent());
  expect(envelope.extract(output, Event.cppu_detail_getUnoType)).toBe(true);
  expect(output.equals(event)).toBe(true);
  const base = own(new EventObject());
  expect(envelope.extract(base, eventType)).toBe(true);
  expect(base.Source.operatorEquals(source)).toBe(true);
  event.Id.clear();
  id.clear();
  expect(own(weak.get()).is()).toBe(true);
  expect(own(api(output.Id).getContentIdentifier()).equals(u("FiLe:///a.xml"))).toBe(true);
  output.assign(output);
  output.Action = 0xffffffff;
  expect(output.Action).toBe(-1);
  expect(output.notEquals(event)).toBe(true);
});
it("transports a real open command, nested property/sorting sequences and active data sink through Any", /** This qualifies the actual value graph, not Content.openStream execution. @returns Nothing. */ () => {
  const property = own(new Property());
  property.Name = u("Title");
  property.Handle = -1;
  const properties = own(
    new (Sequence.specialize<Property>(propertyType, 32))(
      {
        /** Logical address of the actual single struct element. @param offset - Original byte offset. @returns Actual struct field address view. */
        get(offset: number) {
          expect(offset).toBe(0);
          return property;
        },
      },
      1,
    ),
  );
  const sorting = own(new Sorting.NumberedSortingInfo(2, true)),
    sorts = own(
      new (Sequence.specialize<Sorting.NumberedSortingInfo>(Sorting.cppu_detail_getUnoType, 8))(
        {
          /** Logical address of the actual sorting struct. @param offset - Original byte offset. @returns Actual struct field address view. */
          get(offset: number) {
            expect(offset).toBe(0);
            return sorting;
          },
        },
        1,
      ),
    ),
    sink = own(new Reference(new ActiveDataSink())),
    argument = own(new Open2.OpenCommandArgument2(OpenMode.DOCUMENT, -5, sink, properties, sorts)),
    source = own(new Command(u("open"), -1, own(new Any(argument, Open2.cppu_detail_getUnoType)))),
    envelope = own(new Any(source, commandType)),
    command = own(new Command());
  expect(envelope.extract(command, commandType)).toBe(true);
  const result = own(new Open2.OpenCommandArgument2());
  expect(command.Argument.extract(result, Open2.cppu_detail_getUnoType)).toBe(true);
  expect(result.equals(argument)).toBe(true);
  expect(result.notEquals(argument)).toBe(false);
  const base = own(new Open.OpenCommandArgument());
  expect(command.Argument.extract(base, Open.cppu_detail_getUnoType)).toBe(true);
  expect(base.equals(argument)).toBe(true);
  const inputBytes = new Uint8Array([60, 120, 47, 62]),
    input = own(new Reference<XInputStream>(new MemoryInputStream(inputBytes, inputBytes.length))),
    facet = own(
      new Reference<XActiveDataSink>(result.Sink, UNO_QUERY_THROW, XActiveDataSink.static_type),
    );
  api(facet).setInputStream(input);
  expect(own(api(facet).getInputStream()).operatorEquals(input)).toBe(true);
  const copiedProperty = own(new Property()),
    copiedSorting = own(new Sorting.NumberedSortingInfo());
  const propertyEnvelope = own(
      new Any((result.Properties.getConstArray() as SequenceElements).get(0), propertyType),
    ),
    sortingEnvelope = own(
      new Any(
        (result.SortingInfo.getConstArray() as SequenceElements).get(0),
        Sorting.cppu_detail_getUnoType,
      ),
    );
  expect(propertyEnvelope.extract(copiedProperty, propertyType)).toBe(true);
  expect(copiedProperty.Name.equals(u("Title"))).toBe(true);
  expect(copiedProperty.Handle).toBe(-1);
  expect(sortingEnvelope.extract(copiedSorting, Sorting.cppu_detail_getUnoType)).toBe(true);
  expect(copiedSorting.equals(sorting)).toBe(true);
  const another = own(new Open2.OpenCommandArgument2()).assign(result);
  another.Priority = 123;
  expect(another.notEquals(result)).toBe(true);
});
it("copies provider descriptors without manufacturing an implementation", /** Registered positive providers require the genuine broker service. @returns Nothing. */ () => {
  const provider = own(new Reference<XContentProvider>()),
    source = own(new ProviderInfo.ContentProviderInfo(provider, u("FILE"))),
    envelope = own(new Any(source, ProviderInfo.cppu_detail_getUnoType)),
    copy = own(new ProviderInfo.ContentProviderInfo());
  expect(envelope.extract(copy, ProviderInfo.cppu_detail_getUnoType)).toBe(true);
  expect(copy.equals(source)).toBe(true);
  copy.assign(copy);
  source.Scheme = u("other");
  expect(copy.notEquals(source)).toBe(true);
  expect(copy.Scheme.equals(u("FILE"))).toBe(true);
});
