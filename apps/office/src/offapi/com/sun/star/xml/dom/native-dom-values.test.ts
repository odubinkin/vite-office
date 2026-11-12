/** @fileoverview Native UNO DOM enums and owned DOMException copy/move/metadata behavior, distinct from browser DOM numeric constants and Error objects. */
import { expect, it } from "vitest";
import { NodeType, cppu_detail_getUnoType_NodeType as nodeType } from "./NodeType";
import {
  DOMExceptionType,
  cppu_detail_getUnoType_DOMExceptionType as codeType,
} from "./DOMExceptionType";
import { DOMException, cppu_detail_getUnoType as exceptionType, getCppuType } from "./DOMException";
import { Exception } from "../../../../../../cppu/inc/com/sun/star/uno/Exception";
import { Any } from "../../../../../../cppu/inc/com/sun/star/uno/Any";
import { Reference } from "../../../../../../cppu/inc/com/sun/star/uno/Reference";
import { OWeakObject } from "../../../../../../cppuhelper/inc/weak";
import { unicode, text } from "../../../../../../i18nlangtag/source/isolang/isolang.tables";
import type { typelib_CompoundTypeDescription as C } from "../../../../../../cppu/inc/typelib/typedescription";
it("retains every original enum ordinal and normal cold/warm identity", /** UNO enum declarations intentionally have different ordinals from platform DOM constants. @returns Nothing. */ () => {
  for (const [values, labels] of [
    [
      NodeType,
      [
        "ATTRIBUTE_NODE",
        "CDATA_SECTION_NODE",
        "COMMENT_NODE",
        "DOCUMENT_FRAGMENT_NODE",
        "DOCUMENT_NODE",
        "DOCUMENT_TYPE_NODE",
        "ELEMENT_NODE",
        "ENTITY_NODE",
        "ENTITY_REFERENCE_NODE",
        "NOTATION_NODE",
        "PROCESSING_INSTRUCTION_NODE",
        "TEXT_NODE",
      ],
    ],
    [
      DOMExceptionType,
      [
        "DOMSTRING_SIZE_ERR",
        "HIERARCHY_REQUEST_ERR",
        "INDEX_SIZE_ERR",
        "INUSE_ATTRIBUTE_ERR",
        "INVALID_ACCESS_ERR",
        "INVALID_CHARACTER_ERR",
        "INVALID_MODIFICATION_ERR",
        "INVALID_STATE_ERR",
        "NAMESPACE_ERR",
        "NO_DATA_ALLOWED_ERR",
        "NO_MODIFICATION_ALLOWED_ERR",
        "NOT_FOUND_ERR",
        "NOT_SUPPORTED_ERR",
        "SYNTAX_ERR",
        "WRONG_DOCUMENT_ERR",
      ],
    ],
  ] as const)
    for (const [index, label] of labels.entries())
      expect((values as Record<string, string | number>)[label]).toBe(index);
  for (const getter of [nodeType, codeType]) {
    const type = getter();
    expect(getter()).toBe(type);
    expect(type.getTypeClass()).toBe(15);
  }
  expect(nodeType().operatorEqual(codeType())).toBe(false);
});
it.each([nodeType, codeType])(
  "ports native Any testEnum same/cross-type and scalar output preservation",
  /** Actual enum Any values reject implicit scalar and other-enum conversion. @param getter - Normal enum type. @returns Nothing. */ (
    getter,
  ) => {
    const any = new Any([1], getter),
      copy = new Any(any),
      same: [number] = [2],
      different: [number] = [2];
    try {
      expect(any.getValueType().operatorEqual(getter())).toBe(true);
      expect(copy.extract(same, getter)).toBe(true);
      expect(same[0]).toBe(1);
      expect(copy.extract(different, getter === nodeType ? codeType : nodeType)).toBe(false);
      expect(different[0]).toBe(2);
      for (const descriptor of [
        "sal_Int8",
        "sal_Int16",
        "sal_uInt16",
        "sal_Int32",
        "sal_uInt32",
        "sal_Int64",
        "sal_uInt64",
        "float",
        "double",
      ] as const) {
        const value: [number] = [2];
        expect(any.extract(value, descriptor)).toBe(false);
        expect(value[0]).toBe(2);
      }
      const boolean: [boolean] = [true];
      expect(any.extract(boolean, "bool")).toBe(false);
      expect(boolean[0]).toBe(true);
    } finally {
      copy.dispose();
      any.dispose();
    }
  },
);
it("preserves actual exception inheritance, context ownership and ordered memberwise operations", /** An actual CPPU weak object supplies context identity without advertising a fake DOM implementation. @returns Nothing. */ () => {
  const context = new Reference(new OWeakObject()),
    message = unicode("wrong document"),
    original = new DOMException(message, context, DOMExceptionType.WRONG_DOCUMENT_ERR),
    empty = new DOMException(),
    copy = new DOMException(original),
    moved = DOMException.move(copy),
    assigned = new DOMException(),
    moveAssigned = new DOMException();
  try {
    expect(original).toBeInstanceOf(Exception);
    expect(original).not.toBeInstanceOf(Error);
    expect(empty.Code).toBe(DOMExceptionType.DOMSTRING_SIZE_ERR);
    expect(empty.Message.isEmpty()).toBe(true);
    expect(empty.Context.is()).toBe(false);
    expect(text(moved.Message)).toBe("wrong document");
    expect(moved.Context.get()).toBe(context.get());
    expect(moved.Code).toBe(DOMExceptionType.WRONG_DOCUMENT_ERR);
    expect(copy.Message.isEmpty()).toBe(true);
    expect(copy.Context.is()).toBe(false);
    expect(copy.Code).toBe(DOMExceptionType.WRONG_DOCUMENT_ERR);
    expect(assigned.assign(original)).toBe(assigned);
    expect(assigned.assign(assigned)).toBe(assigned);
    assigned.Code = DOMExceptionType.NAMESPACE_ERR;
    expect(original.Code).toBe(DOMExceptionType.WRONG_DOCUMENT_ERR);
    expect(moveAssigned.moveAssign(assigned)).toBe(moveAssigned);
    expect(moveAssigned.Code).toBe(DOMExceptionType.NAMESPACE_ERR);
    expect(assigned.Code).toBe(DOMExceptionType.NAMESPACE_ERR);
    expect(assigned.Message.isEmpty()).toBe(true);
    expect(moveAssigned.Context.get()).toBe(context.get());
    const type = exceptionType(),
      description = type.getTypeLibType()?.pType as unknown as C;
    expect(getCppuType()).toBe(type);
    expect(exceptionType()).toBe(type);
    expect(type.getTypeClass()).toBe(19);
    expect(description.nMembers).toBe(1);
    expect(description.ppTypeRefs?.[0] === codeType().getTypeLibType()).toBe(true);
  } finally {
    for (const value of [original, empty, copy, moved, assigned, moveAssigned]) value.dispose();
    message.dispose();
    context.dispose();
  }
});
