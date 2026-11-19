/** @fileoverview In-progress actual native metadata owner tests. Production registration waits for original storage/medium dependencies and complete qualification. */
import { afterEach, beforeAll, expect, it } from "vitest";
import { SfxDocumentMetaData } from "./SfxDocumentMetaData";
import { initializeLibXml2 } from "../../../external/libxml2/libxml2";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XComponentContext } from "../../../udkapi/com/sun/star/uno/XComponentContext";
import { getProcessComponentContext } from "../../../comphelper/inc/processfactory";
import { XSAXSerializable } from "../../../offapi/com/sun/star/xml/sax/XSAXSerializable";
import { XDocumentProperties2 } from "../../../offapi/com/sun/star/document/XDocumentProperties2";
import { Writer } from "../../../offapi/com/sun/star/xml/sax/Writer";
import { SaxStringOutput } from "../../../comphelper/source/xml/saxstringwriter";
import { createPairs } from "../../../test/ofopxml-values";
import { own, u, read, api, releaseDomScope } from "../../../test/native-dom";
beforeAll(initializeLibXml2);
afterEach(releaseDomScope);
/** Constructs the actual source owner over the real process context. @returns Acquired owner. */
function metadata() {
  return own(
    new Reference(
      new SfxDocumentMetaData(
        own(new Reference<XComponentContext>(getProcessComponentContext().get())),
      ),
    ),
  );
}
it("constructs the actual source owner and retains real declared interface identity", /** Checks that constructs the actual source owner and retains real declared interface identity. @returns Nothing. */ () => {
  const value = metadata(),
    properties = own(
      new Reference<XDocumentProperties2>(value, UNO_QUERY_THROW, XDocumentProperties2.static_type),
    ),
    sax = own(
      new Reference<XSAXSerializable>(value, UNO_QUERY_THROW, XSAXSerializable.static_type),
    );
  expect(properties.get()).toBe(value.get());
  expect(sax.get()).toBe(value.get());
  expect(read(api(value).getTitle())).toBe("");
  expect(api(value).isModified()).toBe(false);
  api(value).setTitle(u("Native metadata 字"));
  expect(read(api(value).getTitle())).toBe("Native metadata 字");
  expect(api(value).isModified()).toBe(true);
  api(value).setModified(false);
  api(value).setTitle(u("Native metadata 字"));
  expect(api(value).isModified()).toBe(false);
});
it("serializes native properties through the actual DOM SAX facet and registered Writer", /** Checks that serializes native properties through the actual DOM SAX facet and registered Writer. @returns Nothing. */ () => {
  const value = metadata(),
    output = own(new SaxStringOutput()),
    writer = own(
      Writer.create(own(new Reference<XComponentContext>(getProcessComponentContext().get()))),
    );
  api(value).setTitle(u("A&B"));
  api(writer).setOutputStream(output.stream);
  api(value).serialize(writer, own(createPairs([])));
  expect(output.getXml()).toContain("A&amp;B");
  expect(output.getXml()).toContain("document-meta");
  const clone = own(api(value).createClone()),
    properties = own(
      new Reference<XDocumentProperties2>(clone, UNO_QUERY_THROW, XDocumentProperties2.static_type),
    );
  expect(read(api(properties).getTitle())).toBe("A&B");
  api(properties).setTitle(u("Clone"));
  expect(read(api(value).getTitle())).toBe("A&B");
});

import { Sequence } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XCompatWriterDocProperties } from "../../../offapi/com/sun/star/document/XCompatWriterDocProperties";
import { CompatWriterDocPropsImpl } from "./SfxDocumentMetaData.compat";
import { document } from "../../../test/native-dom";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { OUString } from "../../../sal/inc/rtl/ustring";
import fixtures from "./SfxDocumentMetaData.fixtures.json";
/** Original actual native Any sequence initialization. @param values - Actual initialized owners. @returns Owned argument sequence. */
function arguments_(values: Any[]) {
  return own(
    new (Sequence.specialize<Any>("Any", 24))(
      {
        /** Selects an Any fixture by its native sequence byte offset. @param offset - Byte offset within the source sequence. @returns Borrowed sequence value. */ get(
          offset: number,
        ) {
          return values[offset / 24] as Any;
        },
      },
      values.length,
    ),
  );
}
it("initializes the actual original TEST.odt metadata and retains source user-bag modification state", /** Checks that initializes the actual original TEST.odt metadata and retains source user-bag modification state. @returns Nothing. */ async () => {
  const value = metadata(),
    doc = await document(fixtures.TEST.xml);
  api(value).initialize(
    arguments_([own(new Any(doc.getAddress(), ["Reference", XDocument.static_type]))]),
  );
  // Original test_misc.cxx::testDocumentProperties read assertions, after native initialize
  // of the committed original meta.xml. The upstream loadFromMedium wrapper remains pending.
  expect(read(api(value).getAuthor())).toBe("Karl-Heinz Mustermann");
  expect(read(api(value).getGenerator())).toBe(
    "StarOffice/8$Solaris_x86 OpenOffice.org_project/680m232$Build-9227",
  );
  expect(api(value).getCreationDate().Year).toBe(2007);
  expect(read(api(value).getTitle())).toBe("Urgent Memo");
  expect(read(api(value).getSubject())).toBe("Wichtige Mitteilung");
  expect(read(api(value).getDescription())).toBe(
    "Modern internal company memorandum in full-blocked style",
  );
  expect(read(api(value).getModifiedBy())).toBe("Karl-Heinz Mustermann");
  expect(api(value).getModificationDate().Month).toBe(10);
  expect(read(api(value).getPrintedBy())).toBe("Karl-Heinz Mustermann");
  expect(api(value).getPrintDate().Day).toBe(29);
  expect(read(api(value).getTemplateName())).toBe("Modern Memo");
  expect(read(api(value).getTemplateURL())).toMatch(/memmodern\.ott$/u);
  expect(api(value).getTemplateDate().Hours).toBe(17);
  expect(read(api(value).getAutoloadURL())).toMatch(/\/TEST\.odt$/u);
  expect(api(value).getAutoloadSecs()).toBe(0);
  expect(read(api(value).getDefaultTarget())).toBe("_blank");
  expect(api(value).getEditingCycles()).toBe(3);
  expect(api(value).getEditingDuration()).toBe(320);
  const keywords = own(api(value).getKeywords());
  expect(keywords.getLength()).toBe(3);
  for (const [index, expected] of ["Memo", "Asien", "Reis"].entries())
    expect(
      read(
        new OUString(
          OUString.unacquired(
            keywords.operatorIndex(index) as unknown as Parameters<typeof OUString.unacquired>[0],
          ),
        ),
      ),
    ).toBe(expected);
  const bag = own(api(value).getUserDefinedProperties()),
    props = own(new Reference<XPropertySet>(bag, UNO_QUERY_THROW, XPropertySet.static_type));
  for (const [name, expected] of [
    ["Hinweis", "Dies ist ein wichtiger Hinweis"],
    ["Warnung", "Kann Spuren von Nüssen enthalten"],
  ]) {
    const any = own(api(props).getPropertyValue(u(name as string))),
      text = own(new OUString());
    expect(any.extract(text, "OUString")).toBe(true);
    expect(read(new OUString(text))).toBe(expected);
  }
  expect(api(value).isModified()).toBe(true);
  api(value).setModified(false);
  expect(api(value).isModified()).toBe(false);
  const empty = await document('<other xmlns="urn:unrelated"/>');
  api(value).initialize(
    arguments_([own(new Any(empty.getAddress(), ["Reference", XDocument.static_type]))]),
  );
  expect(read(api(value).getTitle())).toBe("");
  expect(api(value).isModified()).toBe(false);
});
it("retains the original last-document argument and failure-before-reinitialization behavior", /** Checks that retains the original last-document argument and failure-before-reinitialization behavior. @returns Nothing. */ async () => {
  const value = metadata(),
    first = await document(
      '<o:document-meta xmlns:o="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:d="http://purl.org/dc/elements/1.1/"><o:meta><d:title>First</d:title></o:meta></o:document-meta>',
    ),
    last = await document(
      '<o:document-meta xmlns:o="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:d="http://purl.org/dc/elements/1.1/"><o:meta><d:title>Last</d:title></o:meta></o:document-meta>',
    );
  api(value).initialize(
    arguments_([
      own(new Any(first.getAddress(), ["Reference", XDocument.static_type])),
      own(new Any(last.getAddress(), ["Reference", XDocument.static_type])),
    ]),
  );
  expect(read(api(value).getTitle())).toBe("Last");
  let caught = false;
  try {
    api(value).initialize(
      arguments_([
        own(new Any(first.getAddress(), ["Reference", XDocument.static_type])),
        own(new Any([1], "sal_Int32")),
      ]),
    );
  } catch (error) {
    if (!(error instanceof IllegalArgumentException)) throw error;
    own(error);
    caught = true;
    expect(error.ArgumentPosition).toBe(1);
  }
  expect(caught).toBe(true);
  expect(read(api(value).getTitle())).toBe("Last");
});
it("preserves delayed template values, native scalar conversion and disposal admission", /** Checks that preserves delayed template values, native scalar conversion and disposal admission. @returns Nothing. */ () => {
  const value = metadata();
  api(value).setTemplateName(u("Template"));
  api(value).setTemplateURL(u("file:///template"));
  api(value).setAutoloadSecs(42);
  api(value).setDefaultTarget(u("_blank"));
  api(value).setEditingCycles(12);
  api(value).setEditingDuration(123);
  expect(read(api(value).getTemplateName())).toBe("Template");
  expect(read(api(value).getTemplateURL())).toBe("file:///template");
  expect(api(value).getAutoloadSecs()).toBe(42);
  expect(api(value).getEditingCycles()).toBe(12);
  expect(api(value).getEditingDuration()).toBe(123);
  api(value).dispose();
  let caught = false;
  try {
    api(value).getTitle();
  } catch (error) {
    if (!(error instanceof RuntimeException)) throw error;
    own(error);
    caught = true;
    expect(error.Context.get()).toBe(value.get());
  }
  expect(caught).toBe(true);
});
it("constructs the actual compatibility subclass and preserves original DOM-only cloning", /** Checks that constructs the actual compatibility subclass and preserves original DOM-only cloning. @returns Nothing. */ () => {
  const value = own(
      new Reference(
        new CompatWriterDocPropsImpl(
          own(new Reference<XComponentContext>(getProcessComponentContext().get())),
        ),
      ),
    ),
    compat = own(
      new Reference<XCompatWriterDocProperties>(
        value,
        UNO_QUERY_THROW,
        XCompatWriterDocProperties.static_type,
      ),
    );
  expect(compat.get()).toBe(value.get());
  api(value).setManager(u("Manager"));
  api(value).setCategory(u("Category"));
  api(value).setCompany(u("Company"));
  expect(api(value).isModified()).toBe(false);
  api(value).setTitle(u("Title"));
  const clone = own(api(value).createClone()),
    extra = own(
      new Reference<XCompatWriterDocProperties>(
        clone,
        UNO_QUERY_THROW,
        XCompatWriterDocProperties.static_type,
      ),
    ),
    props = own(
      new Reference<XDocumentProperties2>(clone, UNO_QUERY_THROW, XDocumentProperties2.static_type),
    );
  expect(read(api(props).getTitle())).toBe("Title");
  expect(read(api(extra).getManager())).toBe("");
  expect(read(api(extra).getCategory())).toBe("");
  expect(read(api(extra).getCompany())).toBe("");
});
