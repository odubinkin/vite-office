/** @fileoverview Source SAX interface namespaces, direct base graph, cache identity and legacy generated getters; no handler behavior is manufactured. */
import { assert, expect, it } from "vitest";
import * as attributes from "./XAttributeList";
import * as handler from "./XDocumentHandler";
import * as extended from "./XExtendedDocumentHandler";
import * as serializable from "./XSAXSerializable";
import * as cloneable from "../../util/XCloneable";
import { TypeDescription } from "../../../../../../cppu/inc/typelib/typedescription.hxx";
import type { typelib_InterfaceTypeDescription } from "../../../../../../cppu/inc/typelib/typedescription";
import { OUString } from "../../../../../../sal/inc/rtl/ustring";
import { text } from "../../../../../../i18nlangtag/source/isolang/isolang.tables";
it.each([
  [
    "com.sun.star.xml.sax.XAttributeList",
    attributes,
    attributes.XAttributeList,
    "com.sun.star.uno.XInterface",
  ],
  [
    "com.sun.star.xml.sax.XDocumentHandler",
    handler,
    handler.XDocumentHandler,
    "com.sun.star.uno.XInterface",
  ],
  [
    "com.sun.star.xml.sax.XExtendedDocumentHandler",
    extended,
    extended.XExtendedDocumentHandler,
    "com.sun.star.xml.sax.XDocumentHandler",
  ],
  [
    "com.sun.star.xml.sax.XSAXSerializable",
    serializable,
    serializable.XSAXSerializable,
    "com.sun.star.uno.XInterface",
  ],
  ["com.sun.star.util.XCloneable", cloneable, cloneable.XCloneable, "com.sun.star.uno.XInterface"],
] as const)(
  "retains original SDK namespace and base for %s",
  /** Verifies normal generated metadata. @param name - Exact IDL name. @param binding - Source getter exports. @param declaration - Declared static API. @param base - Original direct base. @returns Nothing. */ (
    name,
    binding,
    declaration,
    base,
  ) => {
    const type = binding.cppu_detail_getUnoType();
    expect(binding.cppu_detail_getUnoType()).toBe(type);
    expect(binding.getCppuType().equals(type)).toBe(true);
    expect(declaration.static_type().equals(type)).toBe(true);
    const typeName = type.getTypeName(),
      description = new TypeDescription(type.getTypeLibType());
    try {
      expect(text(typeName)).toBe(name);
      const actual = description.get() as unknown as typelib_InterfaceTypeDescription;
      expect(actual.nBaseTypes).toBe(1);
      const parent = actual.ppBaseTypes?.[0];
      assert(parent);
      expect(text(OUString.unacquired([parent.aBase.pTypeName]))).toBe(base);
    } finally {
      description.dispose();
      typeName.dispose();
    }
  },
);
