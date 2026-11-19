/** @fileoverview Original storage catalog mutation and commit/revert phases over actual package folder owners. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import {
  Reference,
  UNO_QUERY,
  UNO_QUERY_THROW,
} from "../../../cppu/inc/com/sun/star/uno/Reference";
import { Sequence, type SequenceElements } from "../../../cppu/inc/com/sun/star/uno/Sequence";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { XNameContainer } from "../../../cppu/inc/com/sun/star/container/XNameContainer";
import { ElementExistException } from "../../../cppu/inc/com/sun/star/container/ElementExistException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { InvalidStorageException } from "../../../offapi/com/sun/star/embed/InvalidStorageException";
import { OFOPXML, PACKAGE, ZIP } from "../../../offapi/com/sun/star/embed/StorageFormats";
import { TRUNCATE, WRITE } from "../../../offapi/com/sun/star/embed/ElementModes";
import { MutexGuard } from "../../../sal/inc/osl/mutex";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { rtl_uString_assign, type rtl_uStringSlot } from "../../../sal/inc/rtl/ustring.h";
import { OStorageHelper } from "../../../comphelper/source/misc/storagehelper";
import { XPropertySet } from "../../../udkapi/com/sun/star/beans/XPropertySet";
import { commitStorageRelations, removeStreamRelations, RelInfoStatus } from "./xstorage.relations";
import type { OStorage_Impl, SotElement_Impl } from "./xstorage.impl";

const Arguments = Sequence.specialize<Any>("Any", 24);
const Names = Sequence.specialize<rtl_uStringSlot>("OUString", 8);
/** Preserves the original UTF-16 name units when indexing the catalog. @param value - Native name. @returns Host map key. */
export function storageName(value: OUStringConstReference): string {
  let name = "";
  const units = value.getStr();
  for (let i = 0; i < value.getLength(); ++i) name += String.fromCharCode(units[i] as number);
  return name;
}
/** Creates an owned name from exact UTF-16 units. @param value - Catalog key. @returns Native string. */
function nativeName(value: string): OUString {
  const units = new Uint16Array(value.length);
  for (let i = 0; i < units.length; ++i) units[i] = value.charCodeAt(i);
  return new OUString(units, units.length);
}
/** Enumerates original ordered catalog keys once per live child. @param owner - Storage implementation. @returns Owned UNO names. */
export function getStorageElementNames(owner: OStorage_Impl): Sequence<rtl_uStringSlot> {
  const guard = new MutexGuard(owner.m_xMutex.operatorStar().GetMutex());
  try {
    owner.ReadContents();
    const keys = [...owner.m_aChildrenMap.keys()].sort();
    let count = 0;
    for (const row of owner.m_aChildrenMap.values())
      for (const child of row) if (!child.m_bIsRemoved) ++count;
    const result = new Names(count);
    try {
      const names = result.getArray() as SequenceElements;
      let index = 0;
      for (const key of keys) {
        const name = nativeName(key);
        try {
          for (const child of owner.m_aChildrenMap.get(key) ?? []) {
            if (child.m_bIsRemoved) continue;
            rtl_uString_assign(names.get(index++ * 8) as rtl_uStringSlot, name.pData);
          }
        } finally {
          name.dispose();
        }
      }
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    }
  } finally {
    guard.dispose();
  }
}

/** Original remove/rename name admission. @param owner - Actual storage. @param first - Source name. @param second - Rename destination if present. @returns Nothing. */
function checkMutation(
  owner: OStorage_Impl,
  first: OUStringConstReference,
  second?: OUStringConstReference,
): void {
  for (const name of second ? [first, second] : [first]) {
    if (
      name.isEmpty() ||
      !OStorageHelper.IsValidZipEntryFileName(name.getStr().subarray(0, name.getLength()), false)
    )
      invalidName("Unexpected entry name syntax.", 1);
  }
  if (
    owner.m_nStorageType === OFOPXML &&
    (storageName(first) === "_rels" || (second && storageName(second) === "_rels"))
  )
    invalidName("", second ? 0 : 1);
  if (!(owner.m_nStorageMode & WRITE)) throw new IOException();
}
/** Original entry admission followed by the represented writable truncate branch. @param owner - Actual storage. @param name - Native name. @param mode - Effective open mode. @returns Nothing. */
export function checkWritableStream(
  owner: OStorage_Impl,
  name: OUStringConstReference,
  mode: number,
): void {
  checkMutation(owner, name);
  if ((mode & (WRITE | TRUNCATE)) !== (WRITE | TRUNCATE)) throw new IOException();
  if (owner.m_nStorageType !== ZIP && owner.m_nStorageType !== OFOPXML)
    throw new Error("OStorage PACKAGE writable encryption state is not implemented");
}
/** Original checked name diagnostic. @param text - Message. @param index - Argument position. @returns Never. */
function invalidName(text: string, index: number): never {
  const message = nativeName(text),
    context = new Reference();
  try {
    throw new IllegalArgumentException(message, context, index);
  } finally {
    context.dispose();
    message.dispose();
  }
}
/** Original closed-element removal and wrapper modification flags. @param owner - Actual storage. @param name - Existing name. @returns Nothing. */
export function removeCatalogElement(owner: OStorage_Impl, name: OUStringConstReference): void {
  const guard = new MutexGuard(owner.m_xMutex.operatorStar().GetMutex());
  try {
    checkMutation(owner, name);
    const element = owner.FindElement(name);
    if (!element) throw new NoSuchElementException();
    if (element.m_xStorage?.m_pAntiImpl || element.m_xStorage?.m_aReadOnlyWrapVector.size)
      throw new IOException();
    if (
      element.m_xStream &&
      (element.m_xStream.m_pAntiImpl || element.m_xStream.HasOpenInputStreams())
    )
      throw new IOException();
    const key = storageName(name),
      row = owner.m_aChildrenMap.get(key);
    if (!row || !row.includes(element))
      throw new Error("OStorage element not found in its catalog row");
    if (element.m_bIsInserted) {
      row.splice(row.indexOf(element), 1);
      if (!row.length) owner.m_aChildrenMap.delete(key);
      element.dispose();
    } else {
      element.m_bIsRemoved = true;
      element.m_xStorage?.dispose();
      element.m_xStorage = null;
      element.m_xStream?.dispose();
      element.m_xStream = null;
    }
    owner.m_bIsModified = owner.m_bBroadcastModified = true;
  } finally {
    guard.dispose();
  }
}
/** Original rename stages the destination key and retains the persisted original name. @param owner - Actual storage. @param from - Existing name. @param to - New name. @returns Nothing. */
export function renameCatalogElement(
  owner: OStorage_Impl,
  from: OUStringConstReference,
  to: OUStringConstReference,
): void {
  const guard = new MutexGuard(owner.m_xMutex.operatorStar().GetMutex());
  try {
    checkMutation(owner, from, to);
    if (owner.FindElement(to)) throw new ElementExistException();
    const element = owner.FindElement(from);
    if (!element) throw new NoSuchElementException();
    const oldKey = storageName(from),
      newKey = storageName(to);
    // The pinned source copies the vector. Only removal of an empty old key changes that map row.
    const rowCopy = [...(owner.m_aChildrenMap.get(oldKey) ?? [])];
    const index = rowCopy.indexOf(element);
    if (index !== -1) {
      rowCopy.splice(index, 1);
      if (!rowCopy.length) owner.m_aChildrenMap.delete(oldKey);
    }
    const target = owner.m_aChildrenMap.get(newKey) ?? [];
    target.push(element);
    owner.m_aChildrenMap.set(newKey, target);
    owner.m_bIsModified = owner.m_bBroadcastModified = true;
  } finally {
    guard.dispose();
  }
}
/** Native child folder attachment at the end of a child commit. @param child - Actual child. @param name - Parent's catalog name. @param folder - Target parent. @returns Nothing. */
function insertChildFolder(
  child: OStorage_Impl,
  name: OUStringConstReference,
  folder: XNameContainer,
): void {
  const guard = new MutexGuard(child.m_xMutex.operatorStar().GetMutex());
  try {
    if (!child.m_xPackageFolder.is()) throw new RuntimeException();
    const value = new Any(child.m_xPackageFolder.getAddress(), "XInterface");
    try {
      folder.insertByName(name, value);
    } finally {
      value.dispose();
    }
    child.m_bCommited = false;
  } finally {
    guard.dispose();
  }
}
/** Original storage catalog and persistence commit order. @param owner - Actual storage. @returns Nothing. */
export function commitStorage(owner: OStorage_Impl): void {
  const guard = new MutexGuard(owner.m_xMutex.operatorStar().GetMutex());
  try {
    if (!owner.m_bIsModified) return;
    owner.ReadContents();
    if (!owner.m_xPackageFolder.is()) throw new InvalidStorageException();
    const existing = owner.m_bCommited || owner.m_bIsRoot;
    const target = new Reference(owner.m_xPackageFolder);
    try {
      if (!existing) {
        const flag = new Any([true], "bool");
        try {
          const args = new Arguments(new Map([[0, flag]]), 1);
          try {
            const created = owner.m_xPackage.operatorStar().createInstanceWithArguments(args);
            try {
              target.set(created, UNO_QUERY, XNameContainer.static_type);
            } finally {
              created.dispose();
            }
          } finally {
            args.dispose();
          }
        } finally {
          flag.dispose();
        }
      }
      const folder = target.operatorStar();
      while (owner.m_aDeletedVector.length) {
        const element = owner.m_aDeletedVector[0] as SotElement_Impl;
        if (!element.m_bIsStorage) removeStreamRelations(owner, element.m_aOriginalName);
        if (existing) folder.removeByName(element.m_aOriginalName);
        element.dispose();
        owner.m_aDeletedVector.shift();
      }
      for (const [name, row] of owner.m_aChildrenMap) {
        for (let i = 0; i < row.length;) {
          const element = row[i] as SotElement_Impl;
          if (!element.m_bIsRemoved) {
            ++i;
            continue;
          }
          if (!element.m_bIsStorage) removeStreamRelations(owner, element.m_aOriginalName);
          if (existing) folder.removeByName(element.m_aOriginalName);
          element.dispose();
          row.splice(i, 1);
        }
        if (!row.length) owner.m_aChildrenMap.delete(name);
      }
      for (const [key, row] of owner.m_aChildrenMap) {
        const name = nativeName(key);
        try {
          for (const element of row) {
            if (element.m_bIsInserted) continue;
            element.m_xStream?.Commit();
            if (element.m_xStorage?.m_bCommited) {
              if (existing) folder.removeByName(element.m_aOriginalName);
              insertChildFolder(element.m_xStorage, name, folder);
            } else if (element.m_xStream?.m_bFlushed) {
              element.m_xStream.CommitStreamRelInfo(element.m_aOriginalName, name);
              if (existing) folder.removeByName(element.m_aOriginalName);
              element.m_xStream.InsertIntoPackageFolder(name, folder);
            } else if (!existing || !name.equals(element.m_aOriginalName)) {
              const value = (existing ? folder : owner.m_xPackageFolder.operatorStar()).getByName(
                element.m_aOriginalName,
              );
              try {
                if (existing) folder.removeByName(element.m_aOriginalName);
                folder.insertByName(name, value);
              } finally {
                value.dispose();
              }
              if (existing && owner.m_nStorageType === OFOPXML && !element.m_bIsStorage) {
                owner.OpenSubStream(element);
                element.m_xStream?.CommitStreamRelInfo(element.m_aOriginalName, name);
              }
            }
            element.m_aOriginalName.assign(name);
          }
        } finally {
          name.dispose();
        }
      }
      for (const [key, row] of owner.m_aChildrenMap) {
        const name = nativeName(key);
        try {
          for (const element of row) {
            if (!element.m_bIsInserted) continue;
            element.m_aOriginalName.assign(name);
            if (element.m_bIsStorage) {
              if (!element.m_xStorage) throw new RuntimeException();
              if (element.m_xStorage.m_bCommited) {
                insertChildFolder(element.m_xStorage, name, folder);
                element.m_bIsInserted = false;
              }
            } else {
              if (!element.m_xStream) throw new RuntimeException();
              element.m_xStream.Commit();
              if (element.m_xStream.m_bFlushed) {
                element.m_xStream.CommitStreamRelInfo(element.m_aOriginalName, name);
                element.m_xStream.InsertIntoPackageFolder(name, folder);
                element.m_bIsInserted = false;
              }
            }
          }
        } finally {
          name.dispose();
        }
      }
      if (owner.m_nStorageType === PACKAGE) {
        const properties = new Reference<XPropertySet>(
          target,
          UNO_QUERY_THROW,
          XPropertySet.static_type,
        );
        try {
          for (const [key, value] of [
            ["MediaType", owner.m_aMediaType],
            ["Version", owner.m_aVersion],
          ] as const) {
            const name = nativeName(key),
              any = new Any(value.getDataAddress(), "OUString");
            try {
              properties.operatorStar().setPropertyValue(name, any);
            } finally {
              any.dispose();
              name.dispose();
            }
          }
        } finally {
          properties.dispose();
        }
      }
      commitStorageRelations(owner, folder);
      if (owner.m_bIsRoot) owner.CommitRootPackage();
      else if (!owner.m_bCommited) {
        owner.m_xPackageFolder.assign(target);
        owner.m_bCommited = true;
      }
      owner.m_bMTFallbackUsed = false;
    } finally {
      target.dispose();
    }
  } finally {
    guard.dispose();
  }
}
/** Restores original catalog names and discards uncommitted child state. @param owner - Actual storage. @returns Nothing. */
export function revertStorage(owner: OStorage_Impl): void {
  const guard = new MutexGuard(owner.m_xMutex.operatorStar().GetMutex());
  try {
    if (!(owner.m_nStorageMode & WRITE)) return;
    const old = new Map(owner.m_aChildrenMap);
    owner.m_aChildrenMap.clear();
    for (const row of old.values()) {
      for (const element of row) {
        if (element.m_bIsInserted) element.dispose();
        else restore(owner, element);
      }
    }
    for (const element of owner.m_aDeletedVector) restore(owner, element);
    owner.m_aDeletedVector.length = 0;
    owner.m_bControlMediaType = owner.m_bControlVersion = false;
    owner.GetStorageProperties();
    if (owner.m_nStorageType === OFOPXML) {
      owner.m_xNewRelInfoStream.clear();
      owner.m_aRelInfo.realloc(0);
      owner.m_nRelInfoStatus = RelInfoStatus.NoInit;
    }
  } finally {
    guard.dispose();
  }
}
/** Original ClearElement and catalog-key restoration. @param owner - Actual storage. @param element - Persisted member. @returns Nothing. */
function restore(owner: OStorage_Impl, element: SotElement_Impl): void {
  element.m_xStorage?.dispose();
  element.m_xStorage = null;
  element.m_xStream?.dispose();
  element.m_xStream = null;
  element.m_bIsRemoved = false;
  const key = storageName(element.m_aOriginalName),
    row = owner.m_aChildrenMap.get(key) ?? [];
  row.push(element);
  owner.m_aChildrenMap.set(key, row);
}
