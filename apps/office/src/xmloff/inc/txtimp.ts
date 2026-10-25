/** @fileoverview Borrowed text/property/style API contracts consumed by native XMLTextImportHelper in include/xmloff/txtimp.hxx. These structural types describe the real service owners; they store no document state. */
import type { PropertyValue } from "../../udkapi/com/sun/star/beans/PropertyValue";

import type { Any } from "../../cppu/inc/com/sun/star/uno/Any";
import type { OUString, OUStringConstReference } from "../../sal/inc/rtl/ustring";
/** Consumed XPropertySet surface. */
export interface XMLPropertySet {
  getPropertyValue(name: OUStringConstReference): Any;
  setPropertyValue(name: OUStringConstReference, value: Any): void;
  setPropertyValues(names: readonly OUStringConstReference[], values: readonly Any[]): void;
}
/** Borrowed XTextRange, with explicit release of native positions at the host boundary. */
export interface XMLTextRange {
  getStart(): XMLTextRange;
  getEnd(): XMLTextRange;
  getString(): OUString;
  setString(value: OUStringConstReference): void;
  dispose(): void;
}
/** Consumed XTextCursor/XParagraphCursor contract. */
export interface XMLTextCursor extends XMLTextRange, XMLPropertySet {
  createEnumeration(): {
    hasMoreElements(): boolean;
    nextElement(): { dispose(): void };
  };
  getText(): XMLText;
  gotoRange(range: XMLTextRange, expand: boolean): void;
  gotoEnd(expand: boolean): void;
  gotoStart(expand: boolean): void;
  goLeft(count: number, expand: boolean): boolean;
  collapseToStart(): void;
  collapseToEnd(): void;
}
/** Consumed XText and XSimpleText contract. */
export interface XMLText {
  createTextCursor(): XMLTextCursor;
  createTextCursorByRange(range: XMLTextRange): XMLTextCursor;
  insertString(range: XMLTextRange, value: OUStringConstReference, absorb: boolean): void;
  insertControlCharacter(range: XMLTextRange, value: number, absorb: boolean): void;
  insertTextContent(range: XMLTextRange, content: XMLNamedTextContent, absorb: boolean): void;
}
/** The currently represented XNamed/XTextContent service. */
export interface XMLNamedTextContent {
  setName(name: OUStringConstReference): void;
}
/** Borrowed style service with the original parent/follow/property ownership. */
export interface XMLStyle extends XMLPropertySet {
  getName(): OUString;
  setName(name: OUStringConstReference): void;
  setParentStyle(name: OUStringConstReference): void;
}
/** Consumed style name container. */
export interface XMLStyleFamily {
  hasByName(name: OUStringConstReference): boolean;
  getByName(name: OUStringConstReference): XMLStyle;
  insertByName(name: OUStringConstReference, style: XMLStyle): void;
}
/** Actual model/service suppliers required by the shared text importer. */
export interface XMLTextModel {
  getText(): XMLText;
  getAutoStyles(): { getByName(name: OUStringConstReference): XMLAutoStyleFamily };
  getStyleFamilies(): { getByName(name: OUStringConstReference): XMLStyleFamily };
  createInstance(name: OUStringConstReference): unknown;
}

/** Consumed original XIndexReplace and numbering-rule name/property interfaces. */
export interface XMLNumberingRules {
  getCount(): number;
  replaceByIndex(index: number, value: Any): void;
  getName(): OUString;
  getPropertyValue(name: OUStringConstReference): Any;
}

/** Native automatic-style insertion family. */
export interface XMLAutoStyleFamily {
  insertStyle(values: readonly PropertyValue[]): {
    getPropertyValue(name: OUStringConstReference): Any;
  };
}
