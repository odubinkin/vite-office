/** @fileoverview Test-only native DOM allocations and C++-style temporary ownership; every returned document/node is an actual unoxml component over pinned C memory. */
import { assert, expect } from "vitest";
import { Reference } from "../cppu/inc/com/sun/star/uno/Reference";
import type { XInterface } from "../cppu/inc/com/sun/star/uno/XInterface";
import { RuntimeException } from "../cppu/inc/com/sun/star/uno/RuntimeException";
import { DOMException } from "../offapi/com/sun/star/xml/dom/DOMException";
import type { DOMExceptionType } from "../offapi/com/sun/star/xml/dom/DOMExceptionType";
import type { XNode } from "../offapi/com/sun/star/xml/dom/XNode";
import { OUString } from "../sal/inc/rtl/ustring";
import { unicode, text } from "../i18nlangtag/source/isolang/isolang.tables";
import { initializeLibXml2, withXmlBytes } from "../external/libxml2/libxml2";
import { CDocument } from "../unoxml/source/dom/document";

const owned: { dispose(): void }[] = [];
/** Retains one actual returned owner until test scope exit. @param value - Actual owned result. @returns Same result. */
export function own<T extends { dispose(): void }>(value: T): T {
  owned.push(value);
  return value;
}
/** Original source Unicode fixture value, with deterministic scope disposal. @param value - Fixture text. @returns Actual RTL value. */
export function u(value: string): OUString {
  return own(unicode(value));
}
/** Reads and destroys an owned API string result. @param value - Actual returned value. @returns Its fixture text. */
export function read(value: OUString): string {
  try {
    return text(value);
  } finally {
    value.dispose();
  }
}
/** Borrows a nonempty actual component from a reference. @param value - Actual owner. @returns Actual component. */
export function api<T extends XInterface>(value: Reference<T>): T {
  const result = value.get();
  assert(result);
  return result;
}
/** Binds the original CreateCDocument factory to a real new/parsed C allocation; no builder or node provider is substituted. @param xml - Optional closed XML fixture. @returns Actual document owner. */
export async function document(xml?: string): Promise<Reference<CDocument>> {
  const module = await initializeLibXml2();
  const pointer =
    xml === undefined
      ? withXmlBytes(
          new Uint8Array([49, 46, 48]),
          /** Original xmlNewDoc version literal. @param version - Native bytes. @returns Native document. */ (
            version,
          ) => module._xmlNewDoc(version),
        )
      : withXmlBytes(
          new TextEncoder().encode(xml),
          /** Parses actual fixture bytes with original default options. @param value - Native bytes. @param length - Count. @returns Native document. */ (
            value,
            length,
          ) => module._xmlReadMemory(value, length, 0, 0, 0),
        );
  assert(pointer !== 0);
  return own(CDocument.CreateCDocument(pointer));
}
/** Matches a discarded C++ Reference return temporary. @param parent - Actual parent. @param child - Actual child. @returns Nothing. */
export function append(parent: XNode, child: Reference<XNode>): void {
  parent.appendChild(child).dispose();
}
/** Releases actual owned values in reverse construction order. @returns Nothing. */
export function releaseDomScope(): void {
  while (owned.length) (owned.pop() as { dispose(): void }).dispose();
}
/** Checks the genuine native exception value and disposes its owned fields. @param action - Actual API call. @param code - Expected native code. @returns Nothing. */
export function expectDom(action: () => unknown, code: DOMExceptionType): void {
  let caught = false;
  try {
    const result = action();
    if (result instanceof Reference || result instanceof OUString) result.dispose();
  } catch (error) {
    if (!(error instanceof DOMException)) throw error;
    try {
      caught = true;
      expect(error.Code).toBe(code);
    } finally {
      error.dispose();
    }
  }
  expect(caught).toBe(true);
}
/** Checks the actual RuntimeException value, not a JavaScript Error substitute. @param action - Actual API call. @returns Nothing. */
export function expectRuntime(action: () => unknown): void {
  let caught = false;
  try {
    const result = action();
    if (result instanceof Reference || result instanceof OUString) result.dispose();
  } catch (error) {
    if (!(error instanceof RuntimeException)) throw error;
    caught = true;
    error.dispose();
  }
  expect(caught).toBe(true);
}
