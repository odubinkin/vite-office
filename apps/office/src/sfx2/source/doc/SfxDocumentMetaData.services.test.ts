/** @fileoverview Actual source metadata service composition, URL descriptor precedence/partial failure, thirteen native allowed types and existing listener forwarding. No substitute DocumentProperties component is installed. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { defaultBootstrap_InitialComponentContext } from "../../../cppuhelper/source/defaultbootstrap";
import { DeploymentException } from "../../../cppu/inc/com/sun/star/uno/DeploymentException";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { OInterfaceContainerHelper4 } from "../../../comphelper/inc/interfacecontainer4";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import {
  PropertyValue,
  cppu_detail_getUnoType_PropertyValue as propertyType,
} from "../../../udkapi/com/sun/star/beans/PropertyValue";
import { XPropertyContainer } from "../../../udkapi/com/sun/star/beans/XPropertyContainer";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { IllegalTypeException } from "../../../udkapi/com/sun/star/beans/IllegalTypeException";
import { MAYBEVOID, REMOVABLE } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { XModifyListener } from "../../../offapi/com/sun/star/util/XModifyListener";
import { XModifiable } from "../../../offapi/com/sun/star/util/XModifiable";
import type { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import {
  Date as UnoDate,
  cppu_detail_getUnoType_Date as dateType,
} from "../../../offapi/com/sun/star/util/Date";
import {
  DateTime,
  cppu_detail_getUnoType_DateTime as datetimeType,
} from "../../../offapi/com/sun/star/util/DateTime";
import {
  DateWithTimezone,
  cppu_detail_getUnoType_DateWithTimezone as dateTZType,
} from "../../../offapi/com/sun/star/util/DateWithTimezone";
import {
  DateTimeWithTimezone,
  cppu_detail_getUnoType_DateTimeWithTimezone as datetimeTZType,
} from "../../../offapi/com/sun/star/util/DateTimeWithTimezone";
import {
  Duration,
  cppu_detail_getUnoType_Duration as durationType,
} from "../../../offapi/com/sun/star/util/Duration";
import {
  Time,
  cppu_detail_getUnoType_Time as timeType,
} from "../../../offapi/com/sun/star/util/Time";
import { DocumentProperties } from "../../../offapi/com/sun/star/document/DocumentProperties";
import {
  XCompatWriterDocProperties,
  cppu_detail_getUnoType as compatType,
  getCppuType,
} from "../../../offapi/com/sun/star/document/XCompatWriterDocProperties";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { own, u, read, api, releaseDomScope } from "../../../test/native-dom";
import { createDOM, getURLProperties, createUserDefined } from "./SfxDocumentMetaData.services";

beforeAll(initializeLibXml2);
afterEach(releaseDomScope);
/** Acquires the actual process context. @returns Owned context. */
function context() {
  return own(new Reference<XComponentContext>(getProcessComponentContext().get()));
}
/** Binds source fixture strings to actual native Any storage. @param value - Input text. @returns Owned Any. */
function string(value: string): Any {
  return own(new Any(u(value).getDataAddress(), "OUString"));
}
/** Initializes actual source PropertyValue fields. @param name - Source descriptor key. @param value - Actual native value. @returns Owned PropertyValue. */
function property(name: string, value: Any): PropertyValue {
  const result = own(new PropertyValue());
  result.Name = u(name);
  result.Value.assign(value);
  return result;
}
/** Original native sequence copy of already initialized fixture values. @param rows - Source values. @returns Owned sequence. */
function medium(rows: readonly PropertyValue[]) {
  return own(
    new (Sequence.specialize<PropertyValue>(propertyType, 48))(
      {
        /** Borrows actual initialized native property storage. @param offset - Byte offset. @returns Native address. */
        get(offset: number) {
          return rows[offset / 48] as PropertyValue;
        },
      },
      rows.length,
    ),
  );
}
/** Reads an owned scalar result while keeping its source owner separate. @param value - Actual Any. @returns Text. */
function text(value: Any): string {
  const result = own(new OUString());
  expect(value.extract(result, "OUString")).toBe(true);
  return read(new OUString(result));
}
/** Creates the original actual listener container. @returns Owned native container. */
function listeners() {
  return own(new (OInterfaceContainerHelper4.specialize<XModifyListener>(XModifyListener))());
}
/** Application-owned actual observer of the source component. */
class Observer extends WeakImplHelper.specialize(XModifyListener) implements XModifyListener {
  calls = 0;
  source: unknown;
  /** Records the genuine source event. @param event - Borrowed native event. @returns Nothing. */
  modified(event: Readonly<EventObject>): void {
    ++this.calls;
    this.source = event.Source.get();
  }
  /** Required observer disposal callback. @param event - Native event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    void event;
  }
}
it("creates an actual empty native document through the registered source builder", /** Source createDOM supplies no metadata root until init. @returns Nothing. */ () => {
  const ctx = context(),
    doc = own(createDOM(ctx, api(ctx))),
    root = own(api(doc).getDocumentElement());
  expect(root.is()).toBe(false);
  const element = own(api(doc).createElement(u("root")));
  own(api(doc).appendChild(element));
  expect(read(api(own(api(doc).getDocumentElement())).getNodeName())).toBe("root");
});
it("constructs default source URL properties including original flags", /** Empty input still adds StreamName and does not synthesize a base URI. @returns Nothing. */ () => {
  const props = own(getURLProperties(context(), medium([]))),
    info = own(api(props).getPropertySetInfo());
  expect(text(own(api(props).getPropertyValue(u("StreamName"))))).toBe("meta.xml");
  expect(api(info).hasPropertyByName(u("BaseURI"))).toBe(false);
  const descriptor = own(api(info).getPropertyByName(u("StreamName")));
  expect(descriptor.Attributes).toBe(MAYBEVOID);
});
it("preserves DocumentBaseURL priority, first URL fallback and arbitrary Any types", /** No coercion or repair is added to original raw descriptor assignment. @returns Nothing. */ () => {
  const props = own(
    getURLProperties(
      context(),
      medium([
        property("URL", string("first")),
        property("URL", string("ignored")),
        property("DocumentBaseURL", string("base")),
        property("URL", string("ignored-again")),
        property("HierarchicalDocumentName", string("sub/document")),
      ]),
    ),
  );
  expect(text(own(api(props).getPropertyValue(u("BaseURI"))))).toBe("base");
  expect(text(own(api(props).getPropertyValue(u("StreamRelPath"))))).toBe("sub/document");
  const numeric = own(
      getURLProperties(
        context(),
        medium([
          property("DocumentBaseURL", own(new Any([42], "sal_Int32"))),
          property("URL", string("ignored")),
        ]),
      ),
    ),
    value = own(api(numeric).getPropertyValue(u("BaseURI"))),
    output = [0];
  expect(value.extract(output, "sal_Int32")).toBe(true);
  expect(output[0]).toBe(42);
  const fallback = own(
    getURLProperties(
      context(),
      medium([property("URL", string("first")), property("URL", string("last"))]),
    ),
  );
  expect(text(own(api(fallback).getPropertyValue(u("BaseURI"))))).toBe("first");
});
it("preserves void-reset versus empty-string behavior and ignores unknown descriptors", /** Source hasValue distinguishes these two actual native Any states. @returns Nothing. */ () => {
  const cleared = own(
    getURLProperties(
      context(),
      medium([
        property("URL", string("first")),
        property("DocumentBaseURL", own(new Any())),
        property("URL", string("fallback")),
        property("Ignored", string("x")),
      ]),
    ),
  );
  expect(text(own(api(cleared).getPropertyValue(u("BaseURI"))))).toBe("fallback");
  const empty = own(
    getURLProperties(
      context(),
      medium([property("DocumentBaseURL", string("")), property("URL", string("ignored"))]),
    ),
  );
  expect(text(own(api(empty).getPropertyValue(u("BaseURI"))))).toBe("");
});
it("returns the original partial URL bag after duplicate hierarchical names", /** The source catch surrounds the full loop and later mandatory StreamName addition. @returns Nothing. */ () => {
  const props = own(
      getURLProperties(
        context(),
        medium([
          property("DocumentBaseURL", string("base")),
          property("HierarchicalDocumentName", string("first")),
          property("HierarchicalDocumentName", string("second")),
        ]),
      ),
    ),
    info = own(api(props).getPropertySetInfo());
  expect(text(own(api(props).getPropertyValue(u("StreamRelPath"))))).toBe("first");
  expect(api(info).hasPropertyByName(u("BaseURI"))).toBe(false);
  expect(api(info).hasPropertyByName(u("StreamName"))).toBe(false);
});
it("creates the actual thirteen-type metadata bag and preserves lazy identity", /** Every fixture is initialized through its real SDK/native owner. @returns Nothing. */ () => {
  const bag = own(new Reference<XPropertyContainer>()),
    notify = listeners(),
    ctx = context();
  createUserDefined(ctx, bag, notify);
  const identity = bag.get();
  createUserDefined(ctx, bag, notify);
  expect(bag.get()).toBe(identity);
  const pset = own(new Reference<XPropertySet>(bag, UNO_QUERY_THROW, XPropertySet.static_type)),
    dt = new DateTime(),
    date = new UnoDate(),
    dtz = new DateTimeWithTimezone(),
    dz = new DateWithTimezone(),
    duration = new Duration(),
    time = new Time();
  const values = [
    own(new Any([true], "bool")),
    string("metadata"),
    own(new Any(dt, datetimeType)),
    own(new Any(date, dateType)),
    own(new Any(dtz, datetimeTZType)),
    own(new Any(dz, dateTZType)),
    own(new Any(duration, durationType)),
    own(new Any([1.25], "float")),
    own(new Any([2.5], "double")),
    own(new Any([3], "sal_Int16")),
    own(new Any([4], "sal_Int32")),
    own(new Any([5n], "sal_Int64")),
    own(new Any(time, timeType)),
  ];
  for (let index = 0; index < values.length; ++index) {
    const value = values[index] as Any,
      name = u("v" + index);
    api(bag).addProperty(name, REMOVABLE, value);
    expect(own(api(pset).getPropertyValue(name)).getValueType().equals(value.getValueType())).toBe(
      true,
    );
  }
  api(bag).addProperty(u(""), REMOVABLE, string("allowed"));
  expect(text(own(api(pset).getPropertyValue(u(""))))).toBe("allowed");
  let rejected = false;
  try {
    api(bag).addProperty(u("Void"), 0, own(new Any()));
  } catch (error) {
    if (!(error instanceof IllegalTypeException)) throw error;
    own(error);
    rejected = true;
  }
  expect(rejected).toBe(true);
  const bytes = own(new (Sequence.specialize<number>("sal_Int8", 1))(1));
  for (const unsupported of [
    own(new Any([7], "sal_Int8")),
    own(new Any(bytes.getAddress(), ["Sequence", "sal_Int8"])),
  ]) {
    rejected = false;
    try {
      api(bag).addProperty(u("Unsupported"), 0, unsupported);
    } catch (error) {
      if (!(error instanceof IllegalTypeException)) throw error;
      own(error);
      rejected = true;
    }
    expect(rejected).toBe(true);
  }
  rejected = false;
  try {
    api(pset).setPropertyValue(u("Missing"), string("no automatic addition"));
  } catch (error) {
    if (!(error instanceof UnknownPropertyException)) throw error;
    own(error);
    rejected = true;
  }
  expect(rejected).toBe(true);
});
it("forwards actual retained listeners once to the real source PropertyBag", /** Original lazy construction preserves source broadcaster identity and subsequent modification. @returns Nothing. */ () => {
  const bag = own(new Reference<XPropertyContainer>()),
    notify = listeners(),
    observer = new Observer(),
    listener = own(new Reference(observer));
  notify.addInterface(listener);
  createUserDefined(context(), bag, notify);
  const modified = own(new Reference<XModifiable>(bag, UNO_QUERY_THROW, XModifiable.static_type));
  api(modified).setModified(true);
  expect(observer.calls).toBe(1);
  expect(observer.source).toBe(bag.get());
  createUserDefined(context(), bag, notify);
  api(modified).setModified(true);
  expect(observer.calls).toBe(2);
  notify.clear();
  api(modified).setModified(true);
  expect(observer.calls).toBe(3);
});
it("retains the complete compatibility SDK root and genuine missing-service failure", /** No fake positive component fills the not-yet-implemented metadata service. @returns Nothing. */ () => {
  expect(getCppuType().getTypeLibType()).toBe(compatType().getTypeLibType());
  expect(getCppuType(null).getTypeLibType()).toBe(
    XCompatWriterDocProperties.static_type().getTypeLibType(),
  );
  const ctx = own(defaultBootstrap_InitialComponentContext([]));
  let caught = false;
  try {
    own(DocumentProperties.create(ctx));
  } catch (error) {
    if (!(error instanceof DeploymentException)) throw error;
    own(error);
    caught = true;
    expect(read(new OUString(error.Message))).toContain("com.sun.star.document.DocumentProperties");
  }
  expect(caught).toBe(true);
});
