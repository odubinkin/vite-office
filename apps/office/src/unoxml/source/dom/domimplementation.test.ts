/** @fileoverview Real native DOM implementation identity, query and source-unimplemented operations; no fabricated document or positive node facet. */
import { expect, it } from "vitest";
import { CDOMImplementation } from "./domimplementation";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { XDOMImplementation } from "../../../offapi/com/sun/star/xml/dom/XDOMImplementation";
import { XDocument } from "../../../offapi/com/sun/star/xml/dom/XDocument";
import type { XDocumentType } from "../../../offapi/com/sun/star/xml/dom/XDocumentType";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";

it("retains the original immortal singleton and does not advertise a document facet", /** Actual singleton queries survive no-op release. @returns Nothing. */ () => {
  const implementation = CDOMImplementation.get(),
    owner = new Reference(implementation),
    facet = Reference.query(owner, XDOMImplementation.static_type),
    unrelated = Reference.query(owner, XDocument.static_type);
  try {
    expect(facet.get() === implementation).toBe(true);
    expect(unrelated.is()).toBe(false);
    implementation.acquire();
    implementation.release();
    expect(CDOMImplementation.get() === implementation).toBe(true);
  } finally {
    unrelated.dispose();
    facet.dispose();
    owner.dispose();
  }
  const reacquired = new Reference(CDOMImplementation.get());
  try {
    expect(reacquired.get() === implementation).toBe(true);
  } finally {
    reacquired.dispose();
  }
});

it.each(["", "XML", "Core", "字\0XML"])(
  "preserves #i113683# defaults for %s",
  /** Native source leaves every requested feature unsupported. @param feature - Counted feature input. @returns Nothing. */ (
    feature,
  ) => {
    const implementation = CDOMImplementation.get(),
      label = unicode(feature),
      version = unicode("2.0"),
      doctype = new Reference<XDocumentType>();
    try {
      expect(implementation.hasFeature(label, version)).toBe(false);
      const document = implementation.createDocument(label, version, doctype),
        type = implementation.createDocumentType(label, version, label);
      try {
        expect(document.is()).toBe(false);
        expect(type.is()).toBe(false);
      } finally {
        type.dispose();
        document.dispose();
      }
    } finally {
      doctype.dispose();
      version.dispose();
      label.dispose();
    }
  },
);
