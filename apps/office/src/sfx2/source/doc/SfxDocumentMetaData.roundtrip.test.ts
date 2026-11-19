/** @fileoverview Original metadata custom XML and PropertyBag QA assertions across actual native DOM/SAX/Writer/initialize. The source storage/medium wrapper remains unqualified. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { SfxDocumentMetaData } from "./SfxDocumentMetaData";
import fixtures from "./SfxDocumentMetaData.fixtures.json";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { REMOVABLE } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { IllegalTypeException } from "../../../udkapi/com/sun/star/beans/IllegalTypeException";
import {
  Date as UnoDate,
  cppu_detail_getUnoType_Date as dateType,
} from "../../../offapi/com/sun/star/util/Date";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime as datetimeType,
} from "../../../offapi/com/sun/star/util/DateTime";
import {
  Time,
  cppu_detail_getUnoType_Time as timeType,
} from "../../../offapi/com/sun/star/util/Time";
import {
  Duration,
  cppu_detail_getUnoType_Duration as durationType,
} from "../../../offapi/com/sun/star/util/Duration";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { XPathAPI } from "../../../offapi/com/sun/star/xml/xpath/XPathAPI";
import { SaxStringOutput } from "../../../comphelper/source/xml/saxstringwriter";
import { createPairs } from "../../../test/ofopxml-values";
import { own, api, u, read, document, releaseDomScope } from "../../../test/native-dom";
beforeAll(initializeLibXml2);
afterEach(releaseDomScope);

/** Borrows production process services through a normal acquired reference. @returns Context owner. */
function context() {
  return own(new Reference<XComponentContext>(getProcessComponentContext().get()));
}
/** Constructs the actual owner and initializes it with a parsed native document. @param xml - Source metadata XML. @returns Acquired metadata component. */
async function metadata(xml: string) {
  const value = own(new Reference(new SfxDocumentMetaData(context()))),
    doc = await document(xml),
    arg = own(new Any(doc.getAddress(), ["Reference", XDocument.static_type])),
    args = own(
      new (Sequence.specialize<Any>("Any", 24))(
        {
          /** Borrows the real document Any. @returns Native Any address. */ get() {
            return arg;
          },
        },
        1,
      ),
    );
  api(value).initialize(args);
  return value;
}
/** Serializes through the owner's actual DOM SAX facet and registered Writer into native output bytes. @param value - Actual metadata owner. @returns Produced UTF8 XML as the language I/O boundary. */
function serialize(value: Reference<SfxDocumentMetaData>): string {
  const output = own(new SaxStringOutput()),
    writer = own(Writer.create(context()));
  api(writer).setOutputStream(output.stream);
  api(value).serialize(writer, own(createPairs([])));
  return output.getXml();
}
/** Queries the actual configured bag through its declared XPropertySet facet. @param value - Actual metadata owner. @returns Acquired property-set reference. */
function properties(value: Reference<SfxDocumentMetaData>) {
  return own(
    new Reference<XPropertySet>(
      own(api(value).getUserDefinedProperties()),
      UNO_QUERY_THROW,
      XPropertySet.static_type,
    ),
  );
}
/** Gets an actual source property Any with normal ownership. @param props - Actual bag facet. @param name - Source property name. @returns Acquired native value. */
function property(props: Reference<XPropertySet>, name: string): Any {
  return own(api(props).getPropertyValue(u(name)));
}

it("retains original CUSTOM.odt XPath content, namespaces and unknown attributes through native serialization", /** Ports testODFCustomMetadata assertions on the real metadata DOM/SAX boundary. @returns Completion. */ async () => {
  const value = await metadata(fixtures.CUSTOM.xml);
  expect(read(api(value).getAuthor())).toBe("");
  const xml = serialize(value),
    doc = await document(xml),
    xpath = own(XPathAPI.create(context()));
  api(xpath).registerNS(u("office"), u("urn:oasis:names:tc:opendocument:xmlns:office:1.0"));
  api(xpath).registerNS(u("foo"), u("http://foo.net"));
  api(xpath).registerNS(u("baz"), u("http://baz.net"));
  const bork = own(api(xpath).eval(doc, u("string(/office:document-meta/office:meta/bork)"))),
    text = own(
      api(xpath).eval(doc, u("string(/office:document-meta/office:meta/foo:bar/foo:baz)")),
    );
  expect(read(api(bork).getString())).toBe("bork");
  expect(read(api(text).getString())).toBe("bar");
  for (const path of [
    "/office:document-meta/office:meta/foo:bar",
    "/office:document-meta/office:meta/foo:bar/baz:foo",
    "/office:document-meta/office:meta/foo:bar/baz:foo[@baz:bar='foo']",
  ])
    expect(api(own(api(xpath).selectNodeList(doc, u(path)))).getLength()).toBe(1);
  const reopened = await metadata(xml);
  expect(read(api(reopened).getAuthor())).toBe("");
});

it("replays original user-property values, removal and unsupported-type rejection before and after native XML serialization", /** Ports the original bag assertions while keeping the medium/provider gap explicit. @returns Completion. */ async () => {
  const value = await metadata(fixtures.TEST.xml),
    bag = own(api(value).getUserDefinedProperties()),
    time = new Time(),
    date = new UnoDate(),
    datetime = new DateTime(),
    duration = new Duration();
  time.Hours = 1;
  time.Minutes = 16;
  date.Year = 2071;
  date.Month = 2;
  date.Day = 3;
  datetime.Year = 2065;
  datetime.Month = 1;
  datetime.Day = 1;
  duration.Negative = true;
  duration.Years = 1001;
  duration.Months = 999;
  duration.Days = 888;
  duration.Hours = 777;
  duration.Minutes = 666;
  duration.Seconds = 555;
  duration.NanoSeconds = 444444444;
  api(bag).addProperty(u("Frobnicate"), REMOVABLE, own(new Any([true], "bool")));
  api(bag).addProperty(u("FrobDuration"), REMOVABLE, own(new Any(duration, durationType)));
  api(bag).addProperty(u("FrobDuration2"), REMOVABLE, own(new Any(time, timeType)));
  api(bag).addProperty(u("FrobEndDate"), REMOVABLE, own(new Any(date, dateType)));
  api(bag).addProperty(u("FrobStartTime"), REMOVABLE, own(new Any(datetime, datetimeType)));
  api(bag).addProperty(u("Pi"), REMOVABLE, own(new Any([3.1415], "double")));
  for (const name of ["Foo", "Removed"])
    api(bag).addProperty(u(name), REMOVABLE, own(new Any(u("bar").getDataAddress(), "OUString")));
  api(bag).addProperty(u(""), REMOVABLE, own(new Any(u("eeeeek").getDataAddress(), "OUString")));
  api(bag).removeProperty(u("Info 1"));
  api(bag).removeProperty(u("Removed"));
  const words = [u("foo"), u("bar")],
    forbidden = own(
      new (Sequence.specialize<OUString>("OUString", 8))(
        {
          /** Borrows the actual initialized keyword storage. @param offset - Source byte offset. @returns Native string cell. */ get(
            offset: number,
          ) {
            return (words[offset / 8] as OUString).getDataAddress();
          },
        },
        2,
      ),
    );
  let rejected = false;
  try {
    api(bag).addProperty(
      u("Forbidden"),
      REMOVABLE,
      own(new Any(forbidden.getAddress(), ["Sequence", "OUString"])),
    );
  } catch (error) {
    if (!(error instanceof IllegalTypeException)) throw error;
    own(error);
    rejected = true;
  }
  expect(rejected).toBe(true);
  const initial = properties(value),
    initialTime = new Time();
  expect(property(initial, "FrobDuration2").extract(initialTime, timeType)).toBe(true);
  expect(initialTime.equals(time)).toBe(true);
  const reopened = await metadata(serialize(value));
  for (const props of [initial, properties(reopened)]) {
    const bool: [boolean] = [false],
      pi: [number] = [0],
      resultDuration = new Duration(),
      resultDate = new UnoDate(),
      resultDateTime = new DateTime(),
      text = own(new OUString());
    expect(property(props, "Frobnicate").extract(bool, "bool")).toBe(true);
    expect(bool[0]).toBe(true);
    expect(property(props, "FrobDuration").extract(resultDuration, durationType)).toBe(true);
    expect(resultDuration.equals(duration)).toBe(true);
    expect(property(props, "FrobEndDate").extract(resultDate, dateType)).toBe(true);
    expect(resultDate.equals(date)).toBe(true);
    expect(property(props, "FrobStartTime").extract(resultDateTime, datetimeType)).toBe(true);
    expect(resultDateTime.equals(datetime)).toBe(true);
    expect(property(props, "Pi").extract(pi, "double")).toBe(true);
    expect(pi[0]).toBe(3.1415);
    expect(property(props, "Foo").extract(text, "OUString")).toBe(true);
    expect(read(new OUString(text))).toBe("bar");
    expect(property(props, "").extract(text, "OUString")).toBe(true);
    expect(read(new OUString(text))).toBe("eeeeek");
    let removed = false;
    try {
      property(props, "Removed");
    } catch (error) {
      if (!(error instanceof UnknownPropertyException)) throw error;
      own(error);
      removed = true;
    }
    expect(removed).toBe(true);
  }
  // Original post-save assertion: legacy Time becomes Duration on XML re-ingestion.
  const result = new Duration(),
    expected = new Duration(
      false,
      0,
      0,
      0,
      time.Hours,
      time.Minutes,
      time.Seconds,
      time.NanoSeconds,
    );
  expect(property(properties(reopened), "FrobDuration2").extract(result, durationType)).toBe(true);
  expect(result.equals(expected)).toBe(true);
});
