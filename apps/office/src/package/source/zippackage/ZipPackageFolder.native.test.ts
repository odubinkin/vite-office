/** @fileoverview Original package entry/folder/container contracts over actual UNO components; no replacement parent, stream, listener or service. Native hashing/iterator invalidation and unbound stream/save profiles are excluded. */
import { beforeAll, afterEach, it, expect } from "vitest";
import { initializeExceptionAbi } from "../../../cppuhelper/browser/exception-abi";
import { initializeRuntime } from "../../../external/emscripten/runtime";
import { own, u, read, releaseDomScope } from "../../../test/native-dom";
import { ZipPackageFolderEnumeration } from "./ZipPackageFolderEnumeration";
import { ZipPackageFolder } from "./ZipPackageFolder.native";
import { Reference, UNO_QUERY } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  XNamed,
  cppu_detail_getUnoType as namedType,
  getCppuType as namedPointerType,
} from "../../../udkapi/com/sun/star/container/XNamed";
import { XChild } from "../../../udkapi/com/sun/star/container/XChild";
import { XNameContainer } from "../../../cppu/inc/com/sun/star/container/XNameContainer";
import { XEnumerationAccess } from "../../../udkapi/com/sun/star/container/XEnumerationAccess";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { XServiceInfo } from "../../../cppu/inc/com/sun/star/lang/XServiceInfo";
import type { XInterface } from "../../../cppu/inc/com/sun/star/uno/XInterface";
import type { XPropertyChangeListener } from "../../../udkapi/com/sun/star/beans/XPropertyChangeListener";
import type { XVetoableChangeListener } from "../../../udkapi/com/sun/star/beans/XVetoableChangeListener";
import {
  NoSupportException,
  getCppuType as supportType,
} from "../../../cppu/inc/com/sun/star/lang/NoSupportException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { ElementExistException } from "../../../cppu/inc/com/sun/star/container/ElementExistException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { UnknownPropertyException } from "../../../cppu/inc/com/sun/star/beans/UnknownPropertyException";
import { UNOMemoryStream } from "../../../comphelper/source/streaming/memorystream";
import { OUString } from "../../../sal/inc/rtl/ustring";
import type { SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import type { rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
beforeAll(
  /** Real UNO runtime. @returns Completion. */ async () => {
    await initializeExceptionAbi();
    await initializeRuntime();
  },
);
afterEach(releaseDomScope);
/** Real component graph. @param name - Optional name. @param remove - Removal mode. @returns Actual folder. */
function folder(name = "", remove = false): Reference<ZipPackageFolder> {
  const result = own(new Reference(new ZipPackageFolder(own(new Reference()), 0, remove)));
  if (name) result.operatorStar().setName(u(name));
  return result;
}
/** Original Any component value. @param ref - Actual component. @returns Any. */
function element(ref: Reference<XInterface>): Any {
  return own(new Any(ref.getAddress(), "XInterface"));
}
/** Original returned Any extraction. @param value - Actual returned value. @returns Root reference. */
function extract(value: Any): Reference<XInterface> {
  const result = own(new Reference<XInterface>());
  expect(value.extract(result.getAddress(), "XInterface")).toBe(true);
  return result;
}
/** Observe/dispose real generated exceptions. @param operation - Actual action. @param type - Expected class. @returns Exception observation. */
function fails(
  operation: () => unknown,
  type:
    | typeof RuntimeException
    | typeof NoSupportException
    | typeof NoSuchElementException
    | typeof ElementExistException
    | typeof IllegalArgumentException
    | typeof UnknownPropertyException,
): void {
  let caught = false;
  try {
    operation();
  } catch (e) {
    if (!(e instanceof type)) throw e;
    e.dispose();
    caught = true;
  }
  expect(caught).toBe(true);
}
it("constructs original defaults and publishes inherited plus added UNO interfaces", /** All queries use real component type metadata. @returns Nothing. */ () => {
  const ref = folder(),
    b = ref.operatorStar();
  for (const declaration of [
    XNamed,
    XChild,
    XNameContainer,
    XEnumerationAccess,
    XPropertySet,
    XServiceInfo,
  ])
    expect(own(new Reference(ref, UNO_QUERY, declaration.static_type)).get()).toBe(b);
  expect(b.IsFolder()).toBe(true);
  expect(read(b.getName())).toBe("");
  expect(b.aEntry.nVersion).toBe(-1);
  expect(b.aEntry.nFlag).toBe(0);
  expect(b.aEntry.nMethod).toBe(0);
  expect(b.aEntry.nTime).toBe(-1);
  expect(b.aEntry.nCrc).toBe(0);
  expect(b.aEntry.nSize).toBe(0n);
  expect(b.aEntry.nCompressedSize).toBe(0n);
  expect(b.aEntry.nOffset).toBe(-1n);
  expect(own(b.getParent()).is()).toBe(false);
  expect(own(b.getPropertySetInfo()).is()).toBe(false);
  expect(b.hasElements()).toBe(false);
  expect(namedPointerType()).toBe(namedType());
  expect(XNamed.static_type()).toBe(namedType());
  own(b.getElementType());
  b.SetFolder(false);
  expect(b.IsFolder()).toBe(false);
  b.SetFolder(true);
  b.setPackageFormat_Impl(2);
  b.setRemoveOnInsertMode_Impl(true);
});
it("inserts actual folders, returns XWeak Any, independent names, enumeration and exact Unicode keys", /** Container/reference semantics. @returns Nothing. */ () => {
  const root = folder(),
    child = folder("old"),
    r = root.operatorStar(),
    c = child.operatorStar();
  r.insertByName(u("字é"), element(child));
  expect(r.hasByName(u("字é"))).toBe(true);
  expect(r.hasByName(u("字é"))).toBe(false);
  expect(read(c.getName())).toBe("字é");
  expect(own(c.getParent()).get()).toBe(r);
  expect(extract(own(r.getByName(u("字é")))).get()).toBe(c);
  expect(r.doGetByName(u("字é")).bFolder).toBe(true);
  const names = own(r.getElementNames()),
    cells = names.getConstArray() as SequenceElements;
  expect(names.getLength()).toBe(1);
  expect(read(new OUString(OUString.unacquired(cells.get(0) as rtl_uStringSlot)))).toBe("字é");
  const en = own(r.createEnumeration()),
    enumeration = en.operatorStar();
  expect(enumeration.hasMoreElements()).toBe(true);
  expect(extract(own(enumeration.nextElement())).get()).toBe(c);
  expect(enumeration.hasMoreElements()).toBe(false);
  fails(
    /** Actual exhausted iteration. @returns Nothing. */ () => enumeration.nextElement(),
    NoSuchElementException,
  );
  r.removeByName(u("字é"));
  expect(own(c.getParent()).is()).toBe(false);
  expect(r.hasElements()).toBe(false);
});
it("preserves remove-before-name-validation, detached rename, and duplicate-name ordering", /** Original destructive operations are not repaired. @returns Nothing. */ () => {
  const root = folder(),
    child = folder("a"),
    r = root.operatorStar(),
    c = child.operatorStar();
  r.insertByName(u("a"), element(child));
  fails(
    /** Invalid name removes first. @returns Nothing. */ () => c.setName(u("../bad")),
    RuntimeException,
  );
  expect(r.hasByName(u("a"))).toBe(false);
  expect(read(c.getName())).toBe("a");
  expect(own(c.getParent()).is()).toBe(false);
  r.insertByName(u("a"), element(child));
  c.setName(u("b"));
  expect(r.hasElements()).toBe(false);
  expect(read(c.getName())).toBe("b");
  r.insertByName(u("b"), element(child));
  fails(
    /** Duplicate name checked before bad Any. @returns Nothing. */ () =>
      r.insertByName(u("b"), own(new Any())),
    ElementExistException,
  );
});
it("retains original parent removal-mode and emplace temporary destructor behavior", /** Actual two-folder graph; no private state forcing. @returns Nothing. */ () => {
  const a = folder(),
    b = folder(),
    child = folder("c"),
    c = child.operatorStar();
  a.operatorStar().insertByName(u("c"), element(child));
  c.setParent(b);
  expect(a.operatorStar().hasByName(u("c"))).toBe(true);
  expect(b.operatorStar().hasByName(u("c"))).toBe(true);
  // Original doSetParent inserts a temporary ZipContentInfo whose default move retains the raw pointer.
  expect(own(c.getParent()).is()).toBe(false);
  b.operatorStar().doInsertByName(c, true);
  expect(own(c.getParent()).get()).toBe(b.get());
  c.setParent(b);
  expect(own(c.getParent()).get()).toBe(b.get());
  c.setRemoveOnInsertMode_Impl(true);
  c.setParent(a);
  expect(b.operatorStar().hasByName(u("c"))).toBe(false);
  expect(own(c.getParent()).get()).toBe(a.get());
  const empty = folder();
  empty.operatorStar().doSetParent(a.operatorStar());
  expect(own(empty.operatorStar().getParent()).get()).toBe(a.get());
  empty.operatorStar().clearParent();
});
it("rejects unsupported parents and invalid elements and preserves destructive replace failure", /** Real wrong component, null and noninterface Any. @returns Nothing. */ () => {
  const root = folder(),
    child = folder("c"),
    memory = own(new Reference(new UNOMemoryStream())),
    r = root.operatorStar();
  fails(
    /** Null parent. @returns Nothing. */ () =>
      child.operatorStar().setParent(own(new Reference())),
    NoSupportException,
  );
  fails(
    /** Nonfolder parent. @returns Nothing. */ () => child.operatorStar().setParent(memory),
    NoSupportException,
  );
  fails(
    /** Bad Any. @returns Nothing. */ () => r.insertByName(u("x"), own(new Any())),
    IllegalArgumentException,
  );
  fails(
    /** Wrong component. @returns Nothing. */ () => r.insertByName(u("x"), element(memory)),
    IllegalArgumentException,
  );
  fails(
    /** Missing removal. @returns Nothing. */ () => r.removeByName(u("none")),
    NoSuchElementException,
  );
  fails(
    /** Missing replacement. @returns Nothing. */ () => r.replaceByName(u("none"), element(child)),
    NoSuchElementException,
  );
  r.insertByName(u("c"), element(child));
  fails(
    /** Replacement loses old entry on validation failure. @returns Nothing. */ () =>
      r.replaceByName(u("c"), own(new Any())),
    IllegalArgumentException,
  );
  expect(r.hasByName(u("c"))).toBe(false);
  r.insertByName(u("c"), element(child));
  const other = folder("other");
  r.replaceByName(u("c"), element(other));
  expect(extract(own(r.getByName(u("c")))).get()).toBe(other.get());
});
it("retains property values on wrong-type extraction, no-op listeners and original services", /** No fake listener or property provider. @returns Nothing. */ () => {
  const b = folder().operatorStar();
  b.SetMediaType(u("application/test"));
  b.SetVersion(u("1.3"));
  expect(read(new OUString(b.GetMediaType()))).toBe("application/test");
  expect(read(new OUString(b.GetVersion()))).toBe("1.3");
  for (const name of ["MediaType", "Version"]) {
    b.setPropertyValue(u(name), own(new Any([7], "sal_Int32")));
    const value = own(b.getPropertyValue(u(name))),
      target = own(new OUString());
    expect(value.extract(target, "OUString")).toBe(true);
    expect(read(new OUString(target))).toBe(name === "MediaType" ? "application/test" : "1.3");
    b.setPropertyValue(u(name), own(new Any(u("changed").getDataAddress(), "OUString")));
  }
  b.setPropertyValue(u("Size"), own(new Any([9123n], "sal_Int64")));
  b.setPropertyValue(u("Size"), own(new Any(u("wrong").getDataAddress(), "OUString")));
  const size = [0n];
  expect(own(b.getPropertyValue(u("Size"))).extract(size, "sal_Int64")).toBe(true);
  expect(size[0]).toBe(9123n);
  fails(
    /** Unknown get. @returns Nothing. */ () => b.getPropertyValue(u("No")),
    UnknownPropertyException,
  );
  fails(
    /** Unknown set. @returns Nothing. */ () => b.setPropertyValue(u("No"), own(new Any())),
    UnknownPropertyException,
  );
  const propertyListener = own(new Reference<XPropertyChangeListener>()),
    vetoListener = own(new Reference<XVetoableChangeListener>());
  b.addPropertyChangeListener(u(""), propertyListener);
  b.removePropertyChangeListener(u(""), propertyListener);
  b.addVetoableChangeListener(u(""), vetoListener);
  b.removeVetoableChangeListener(u(""), vetoListener);
  expect(read(b.getImplementationName())).toBe("ZipPackageFolder");
  expect(b.supportsService(u("com.sun.star.packages.PackageFolder"))).toBe(true);
  expect(b.supportsService(u("No"))).toBe(false);
  const en = own(b.createEnumeration()).operatorStar();
  if (!(en instanceof ZipPackageFolderEnumeration)) throw new Error("native enumeration missing");
  expect(en.hasMoreElements()).toBe(false);
  expect(read(en.getImplementationName())).toBe("ZipPackageFolderEnumeration");
  expect(en.supportsService(u("com.sun.star.packages.PackageFolderEnumeration"))).toBe(true);
  expect(en.supportsService(u("No"))).toBe(false);
  own(en.getSupportedServiceNames());
  own(b.getSupportedServiceNames());
  expect(supportType()).toBe(supportType());
  const explicit = own(new NoSupportException(u("source message"), own(new Reference(b))));
  expect(explicit.Context.get()).toBe(b);
  const error = own(new NoSupportException()),
    copy = own(new NoSupportException(error));
  own(NoSupportException.move(copy));
});
