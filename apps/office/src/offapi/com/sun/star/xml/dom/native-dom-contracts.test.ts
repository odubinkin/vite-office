/** @fileoverview Complete native DOM/SAX declaration contracts through actual CPPU type hierarchy and Any typed-null transport; no DOM component or parser is simulated. */
import { expect, expectTypeOf, it } from "vitest";
import { Any } from "../../../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference, UNO_QUERY } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import { UnoType } from "../../../../../../cppu/inc/unotype";
import type { XInterface } from "../../../../../../cppu/inc/com/sun/star/uno/XInterface";
import type { OUString, OUStringConstReference } from "../../../../../../sal/inc/rtl/ustring";
import { text } from "../../../../../../i18nlangtag/source/isolang/isolang.tables";
import type { typelib_InterfaceTypeDescription as I } from "../../../../../../cppu/inc/typelib/typedescription";
import type { InputSource } from "../sax/InputSource";
import * as XAttrBinding from "./XAttr";
import * as XCDATASectionBinding from "./XCDATASection";
import * as XCharacterDataBinding from "./XCharacterData";
import * as XCommentBinding from "./XComment";
import * as XDOMImplementationBinding from "./XDOMImplementation";
import * as XDocumentBinding from "./XDocument";
import * as XDocumentBuilderBinding from "./XDocumentBuilder";
import * as XDocumentFragmentBinding from "./XDocumentFragment";
import * as XDocumentTypeBinding from "./XDocumentType";
import * as XElementBinding from "./XElement";
import * as XEntityBinding from "./XEntity";
import * as XEntityReferenceBinding from "./XEntityReference";
import * as XNamedNodeMapBinding from "./XNamedNodeMap";
import * as XNodeBinding from "./XNode";
import * as XNodeListBinding from "./XNodeList";
import * as XNotationBinding from "./XNotation";
import * as XProcessingInstructionBinding from "./XProcessingInstruction";
import * as XTextBinding from "./XText";
import * as XEntityResolverBinding from "../sax/XEntityResolver";
import * as XErrorHandlerBinding from "../sax/XErrorHandler";
/** Native IDL base identities independently retained for all declarations. */
const bindings = [
  [
    "com.sun.star.xml.dom.XAttr",
    XAttrBinding.cppu_detail_getUnoType,
    XAttrBinding.getCppuType,
    XAttrBinding.XAttr,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XNodeBinding.XNode.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XCDATASection",
    XCDATASectionBinding.cppu_detail_getUnoType,
    XCDATASectionBinding.getCppuType,
    XCDATASectionBinding.XCDATASection,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XTextBinding.XText.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XCharacterData",
    XCharacterDataBinding.cppu_detail_getUnoType,
    XCharacterDataBinding.getCppuType,
    XCharacterDataBinding.XCharacterData,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XNodeBinding.XNode.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XComment",
    XCommentBinding.cppu_detail_getUnoType,
    XCommentBinding.getCppuType,
    XCommentBinding.XComment,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XCharacterDataBinding.XCharacterData.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XDOMImplementation",
    XDOMImplementationBinding.cppu_detail_getUnoType,
    XDOMImplementationBinding.getCppuType,
    XDOMImplementationBinding.XDOMImplementation,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => UnoType.get("XInterface"),
  ],
  [
    "com.sun.star.xml.dom.XDocument",
    XDocumentBinding.cppu_detail_getUnoType,
    XDocumentBinding.getCppuType,
    XDocumentBinding.XDocument,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XNodeBinding.XNode.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XDocumentBuilder",
    XDocumentBuilderBinding.cppu_detail_getUnoType,
    XDocumentBuilderBinding.getCppuType,
    XDocumentBuilderBinding.XDocumentBuilder,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => UnoType.get("XInterface"),
  ],
  [
    "com.sun.star.xml.dom.XDocumentFragment",
    XDocumentFragmentBinding.cppu_detail_getUnoType,
    XDocumentFragmentBinding.getCppuType,
    XDocumentFragmentBinding.XDocumentFragment,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XNodeBinding.XNode.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XDocumentType",
    XDocumentTypeBinding.cppu_detail_getUnoType,
    XDocumentTypeBinding.getCppuType,
    XDocumentTypeBinding.XDocumentType,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XNodeBinding.XNode.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XElement",
    XElementBinding.cppu_detail_getUnoType,
    XElementBinding.getCppuType,
    XElementBinding.XElement,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XNodeBinding.XNode.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XEntity",
    XEntityBinding.cppu_detail_getUnoType,
    XEntityBinding.getCppuType,
    XEntityBinding.XEntity,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XNodeBinding.XNode.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XEntityReference",
    XEntityReferenceBinding.cppu_detail_getUnoType,
    XEntityReferenceBinding.getCppuType,
    XEntityReferenceBinding.XEntityReference,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XNodeBinding.XNode.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XNamedNodeMap",
    XNamedNodeMapBinding.cppu_detail_getUnoType,
    XNamedNodeMapBinding.getCppuType,
    XNamedNodeMapBinding.XNamedNodeMap,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => UnoType.get("XInterface"),
  ],
  [
    "com.sun.star.xml.dom.XNode",
    XNodeBinding.cppu_detail_getUnoType,
    XNodeBinding.getCppuType,
    XNodeBinding.XNode,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => UnoType.get("XInterface"),
  ],
  [
    "com.sun.star.xml.dom.XNodeList",
    XNodeListBinding.cppu_detail_getUnoType,
    XNodeListBinding.getCppuType,
    XNodeListBinding.XNodeList,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => UnoType.get("XInterface"),
  ],
  [
    "com.sun.star.xml.dom.XNotation",
    XNotationBinding.cppu_detail_getUnoType,
    XNotationBinding.getCppuType,
    XNotationBinding.XNotation,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XNodeBinding.XNode.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XProcessingInstruction",
    XProcessingInstructionBinding.cppu_detail_getUnoType,
    XProcessingInstructionBinding.getCppuType,
    XProcessingInstructionBinding.XProcessingInstruction,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XNodeBinding.XNode.static_type(),
  ],
  [
    "com.sun.star.xml.dom.XText",
    XTextBinding.cppu_detail_getUnoType,
    XTextBinding.getCppuType,
    XTextBinding.XText,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => XCharacterDataBinding.XCharacterData.static_type(),
  ],
  [
    "com.sun.star.xml.sax.XEntityResolver",
    XEntityResolverBinding.cppu_detail_getUnoType,
    XEntityResolverBinding.getCppuType,
    XEntityResolverBinding.XEntityResolver,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => UnoType.get("XInterface"),
  ],
  [
    "com.sun.star.xml.sax.XErrorHandler",
    XErrorHandlerBinding.cppu_detail_getUnoType,
    XErrorHandlerBinding.getCppuType,
    XErrorHandlerBinding.XErrorHandler,
    /** Original IDL direct base. @returns Borrowed native base Type. */
    () => UnoType.get("XInterface"),
  ],
] as const;
it.each(bindings)(
  "retains normal type identity, direct base and typed-null transport for %s",
  /** Metadata remains native normal-mode incomplete reflection. @param name - Native qualified name. @param getter - Original normal getter. @param legacy - Deprecated getter. @param api - Generated static surface. @param parent - Original direct base type. @returns Nothing. */ (
    name,
    getter,
    legacy,
    api,
    parent,
  ) => {
    const cold = getter(),
      ownedName = cold.getTypeName();
    try {
      expect(text(ownedName)).toBe(name);
    } finally {
      ownedName.dispose();
    }
    expect(cold.getTypeClass()).toBe(22);
    expect(getter()).toBe(cold);
    expect(legacy()).toBe(cold);
    expect(legacy(null)).toBe(cold);
    expect(api.static_type()).toBe(cold);
    expect(api.static_type(null)).toBe(cold);
    const description = cold.getTypeLibType()?.pType as unknown as I;
    expect(description.nBaseTypes).toBe(1);
    expect(description.pBaseTypeDescription?.aBase.pWeakRef).toBe(parent().getTypeLibType());
    expect(description.aBase.bComplete).toBe(false);
    expect(description.nMembers).toBe(0);
    expect(parent().isAssignableFrom(cold)).toBe(true);
    const any = new Any([null], ["Reference", getter]),
      reference = new Reference(any, UNO_QUERY, getter),
      copy = new Any(any),
      output: [XInterface | null] = [null];
    try {
      expect(any.hasValue()).toBe(true);
      expect(any.getValueType().operatorEqual(cold)).toBe(true);
      expect(any.extract(output, ["Reference", getter])).toBe(true);
      expect(output[0]).toBe(null);
      expect(copy.extract(output, ["Reference", "XInterface"])).toBe(true);
      expect(output[0]).toBe(null);
      expect(reference.is()).toBe(false);
    } finally {
      reference.dispose();
      copy.dispose();
      any.dispose();
    }
  },
);
it("retains inherited native node assignability without a fake non-null DOM owner", /** Only original type metadata participates. @returns Nothing. */ () => {
  expect(XNodeBinding.XNode.static_type().isAssignableFrom(XTextBinding.XText.static_type())).toBe(
    true,
  );
  expect(
    XCharacterDataBinding.XCharacterData.static_type().isAssignableFrom(
      XCDATASectionBinding.XCDATASection.static_type(),
    ),
  ).toBe(true);
  expect(
    XElementBinding.XElement.static_type().isAssignableFrom(XTextBinding.XText.static_type()),
  ).toBe(false);
  expect(
    XDocumentBinding.XDocument.static_type().isAssignableFrom(XNodeBinding.XNode.static_type()),
  ).toBe(false);
});
it("retains original acquired reference, owned string and borrowed callback contracts", /** These compile-time witnesses derive from the actual IDL declarations. @returns Nothing. */ () => {
  expectTypeOf<Parameters<XDocumentBinding.XDocument["createElementNS"]>>().toEqualTypeOf<
    [OUStringConstReference, OUStringConstReference]
  >();
  expectTypeOf<ReturnType<XDocumentBinding.XDocument["createElementNS"]>>().toEqualTypeOf<
    Reference<XElementBinding.XElement>
  >();
  expectTypeOf<Parameters<XNodeBinding.XNode["insertBefore"]>>().toEqualTypeOf<
    [Reference<XNodeBinding.XNode>, Reference<XNodeBinding.XNode>]
  >();
  expectTypeOf<ReturnType<XNodeBinding.XNode["getNodeValue"]>>().toEqualTypeOf<OUString>();
  expectTypeOf<ReturnType<XDocumentBuilderBinding.XDocumentBuilder["newDocument"]>>().toEqualTypeOf<
    Reference<XDocumentBinding.XDocument>
  >();
  expectTypeOf<
    ReturnType<XEntityResolverBinding.XEntityResolver["resolveEntity"]>
  >().toEqualTypeOf<InputSource>();
  expectTypeOf<Parameters<XErrorHandlerBinding.XErrorHandler["error"]>>().toEqualTypeOf<
    [Readonly<Any>]
  >();
});
