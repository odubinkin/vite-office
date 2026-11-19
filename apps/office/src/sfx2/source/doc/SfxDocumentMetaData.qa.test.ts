/** @fileoverview Original test_misc.cxx::testDocumentProperties setter/keyword/statistic assertions against the genuine owner; service/medium roundtrip remains pending separately. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { SfxDocumentMetaData } from "./SfxDocumentMetaData";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { XModifyListener } from "../../../offapi/com/sun/star/util/XModifyListener";
import { XModifyBroadcaster } from "../../../offapi/com/sun/star/util/XModifyBroadcaster";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { REMOVABLE } from "../../../udkapi/com/sun/star/beans/PropertyAttribute";
import type { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { Locale } from "../../../udkapi/com/sun/star/lang/Locale";
import { DateTime } from "../../../offapi/com/sun/star/util/DateTime";
import {
  NamedValue,
  cppu_detail_getUnoType_NamedValue as namedType,
} from "../../../udkapi/com/sun/star/beans/NamedValue";
import { OUString } from "../../../sal/inc/rtl/ustring";
import { own, api, u, read, releaseDomScope } from "../../../test/native-dom";
beforeAll(initializeLibXml2);
afterEach(releaseDomScope);
/** Constructs the actual source component over production process services. @returns Acquired component. */
function metadata() {
  return own(
    new Reference(
      new SfxDocumentMetaData(
        own(new Reference<XComponentContext>(getProcessComponentContext().get())),
      ),
    ),
  );
}

it("replays original scalar, text, date, language and delayed-property setter assertions", /** Ports the original pre-storage property mutations and expected values. @returns Nothing. */ () => {
  const properties = api(metadata());
  properties.setAuthor(u("me"));
  expect(read(properties.getAuthor())).toBe("me");
  properties.setGenerator(u("the computa"));
  expect(read(properties.getGenerator())).toBe("the computa");
  const date = new DateTime();
  date.Day = 1;
  date.Month = 1;
  date.Year = 2038;
  properties.setCreationDate(date);
  expect(properties.getCreationDate().Year).toBe(2038);
  properties.setTitle(u("El t'itulo"));
  expect(read(properties.getTitle())).toBe("El t'itulo");
  properties.setSubject(u("Ein verkommenes Subjekt"));
  expect(read(properties.getSubject())).toBe("Ein verkommenes Subjekt");
  properties.setDescription(u("Este descripci'on no es importante"));
  expect(read(properties.getDescription())).toBe("Este descripci'on no es importante");
  const language = own(new Locale(u("en"), u("GB"), u("")));
  properties.setLanguage(language);
  const result = own(properties.getLanguage());
  expect(read(new OUString(result.Language))).toBe("en");
  expect(read(new OUString(result.Country))).toBe("GB");
  properties.setModifiedBy(u("myself"));
  expect(read(properties.getModifiedBy())).toBe("myself");
  date.Year = 2042;
  properties.setModificationDate(date);
  expect(properties.getModificationDate().Year).toBe(2042);
  properties.setPrintedBy(u("i did not do it"));
  expect(read(properties.getPrintedBy())).toBe("i did not do it");
  date.Year = 2024;
  properties.setPrintDate(date);
  expect(properties.getPrintDate().Year).toBe(2024);
  properties.setTemplateName(u("blah"));
  expect(read(properties.getTemplateName())).toBe("blah");
  properties.setTemplateURL(u("gopher://some-hole-in-the-ground/"));
  expect(read(properties.getTemplateURL())).toBe("gopher://some-hole-in-the-ground/");
  date.Year = 2043;
  properties.setTemplateDate(date);
  expect(properties.getTemplateDate().Year).toBe(2043);
  properties.setAutoloadURL(u("http://nowhere/"));
  expect(read(properties.getAutoloadURL())).toBe("http://nowhere/");
  properties.setAutoloadSecs(3661);
  expect(properties.getAutoloadSecs()).toBe(3661);
  properties.setDefaultTarget(u("_blank"));
  expect(read(properties.getDefaultTarget())).toBe("_blank");
  properties.setEditingCycles(42);
  expect(properties.getEditingCycles()).toBe(42);
  properties.setEditingDuration(84);
  expect(properties.getEditingDuration()).toBe(84);
});

it("replays original three keywords and typed statistic sequence mutations", /** Preserves original names, order and numeric conversion expectations. @returns Nothing. */ () => {
  const properties = api(metadata()),
    words = [u("keywordly"), u("keywordlike"), u("keywordalicious")],
    keywords = own(
      new (Sequence.specialize<OUString>("OUString", 8))(
        {
          /** Borrows an initialized native string cell. @param offset - Native sequence byte offset. @returns String cell. */ get(
            offset: number,
          ) {
            return (words[offset / 8] as OUString).getDataAddress();
          },
        },
        words.length,
      ),
    );
  properties.setKeywords(keywords);
  const readKeywords = own(properties.getKeywords());
  expect(readKeywords.getLength()).toBe(3);
  for (let i = 0; i < words.length; ++i)
    expect(
      read(
        new OUString(
          OUString.unacquired(
            readKeywords.operatorIndex(i) as unknown as Parameters<typeof OUString.unacquired>[0],
          ),
        ),
      ),
    ).toBe(read(new OUString(words[i] as OUString)));
  const values = [
      own(new NamedValue(u("SyllableCount"), own(new Any([9], "sal_Int16")))),
      own(new NamedValue(u("FrameCount"), own(new Any([2], "sal_Int16")))),
      own(new NamedValue(u("SentenceCount"), own(new Any([7], "sal_Int16")))),
    ],
    input = own(
      new (Sequence.specialize<NamedValue>(namedType, 32))(
        {
          /** Borrows a real initialized statistic aggregate. @param offset - Native sequence byte offset. @returns Actual source value. */ get(
            offset: number,
          ) {
            return values[offset / 32] as NamedValue;
          },
        },
        values.length,
      ),
    );
  properties.setDocumentStatistics(input);
  const stats = own(properties.getDocumentStatistics()),
    found = new Map<string, number>();
  for (let i = 0; i < stats.getLength(); ++i) {
    const value = NamedValue.unacquired(
        stats.operatorIndex(i) as unknown as Parameters<typeof NamedValue.unacquired>[0],
      ),
      output: [number] = [0];
    expect(Any.prototype.extract.call(value.Value, output, "sal_uInt32")).toBe(true);
    found.set(read(new OUString(value.Name)), output[0]);
  }
  expect(found.get("SyllableCount")).toBe(9);
  expect(found.get("FrameCount")).toBe(2);
  expect(found.get("SentenceCount")).toBe(7);
});

/** Actual caller Listener from test_misc.cxx, not an implementation/provider substitute. */
class Listener extends WeakImplHelper.specialize(XModifyListener) implements XModifyListener {
  private bCalled = false;
  /** Original reset observes and clears only its test flag. @returns Prior notification flag. */
  reset(): boolean {
    const old = this.bCalled;
    this.bCalled = false;
    return old;
  }
  /** Original ignored disposal callback. @param event - Borrowed event. @returns Nothing. */
  disposing(event: EventObject): void {
    void event;
  }
  /** Original modification callback. @param event - Borrowed event. @returns Nothing. */
  modified(event: EventObject): void {
    void event;
    this.bCalled = true;
  }
}
it("replays original listener registration and source PropertyBag notification forwarding", /** Tests original testDocumentProperties listener assertions on the actual owner and bag. @returns Nothing. */ () => {
  const value = metadata(),
    bag = own(api(value).getUserDefinedProperties()),
    properties = own(new Reference<XPropertySet>(bag, UNO_QUERY_THROW, XPropertySet.static_type)),
    listener = own(new Reference(new Listener())),
    broadcaster = own(
      new Reference<XModifyBroadcaster>(value, UNO_QUERY_THROW, XModifyBroadcaster.static_type),
    );
  api(broadcaster).addModifyListener(listener);
  api(value).setAuthor(u("not me"));
  expect(api(listener).reset()).toBe(true);
  api(bag).addProperty(
    u("Listener"),
    REMOVABLE,
    own(new Any(u("foo").getDataAddress(), "OUString")),
  );
  expect(api(listener).reset()).toBe(true);
  api(properties).setPropertyValue(
    u("Listener"),
    own(new Any(u("bar").getDataAddress(), "OUString")),
  );
  expect(api(listener).reset()).toBe(true);
  api(bag).removeProperty(u("Listener"));
  expect(api(listener).reset()).toBe(true);
  api(broadcaster).removeModifyListener(listener);
  api(bag).addProperty(
    u("Listener2"),
    REMOVABLE,
    own(new Any(u("foo").getDataAddress(), "OUString")),
  );
  expect(api(listener).reset()).toBe(false);
});
