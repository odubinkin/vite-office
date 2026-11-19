/** @fileoverview Original ZipPackage hierarchy traversal and its recent-folder cache. */
import { Any } from "../../../cppu/inc/com/sun/star/uno/Any";
import { XWeak } from "../../../cppu/inc/com/sun/star/uno/XWeak";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { RuntimeException } from "../../../cppu/inc/com/sun/star/uno/RuntimeException";
import { ZipIOException } from "../../../offapi/com/sun/star/packages/zip/ZipIOException";
import { NoSuchElementException } from "../../../cppu/inc/com/sun/star/container/NoSuchElementException";
import { WrappedTargetRuntimeException } from "../../../cppu/inc/com/sun/star/lang/WrappedTargetRuntimeException";
import { getCaughtException } from "../../../cppuhelper/inc/exc_hlp";
import { withCaughtException } from "../../../cppu/inc/uno/exception-context";
import { ZipPackageFolder } from "./ZipPackageFolder.native";
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { native, text } from "./ZipPackage.metadata";

/** The ZipPackage recent directory cache and lookup methods share the root folder owned by the package. */
export class ZipPackageHierarchy {
  private readonly m_aRecent = new Map<
    string,
    { name: OUString; folder: ZipPackageFolder | null }
  >();
  /** Keeps the borrowed package root for hierarchy lookups. @param root - Root owned by ZipPackage. @returns Hierarchy. */
  constructor(private readonly root: ZipPackageFolder) {}
  /** Releases the cache's Unicode keys. @returns Nothing. */
  dispose(): void {
    for (const item of this.m_aRecent.values()) item.name.dispose();
    this.m_aRecent.clear();
  }
  /** Finds the cached record, which may hold a null folder pointer. @param name - Exact directory spelling. @returns Cached record when present. */
  find(name: OUStringConstReference): { folder: ZipPackageFolder | null } | undefined {
    return this.m_aRecent.get(text(name));
  }
  /** Original cache owns its Unicode keys and borrows folder pointers. No tree/normalization policy is added. @param name - Native key. @param folder - Source nullable pointer. @returns Nothing. */
  cache(name: OUStringConstReference, folder: ZipPackageFolder | null): void {
    const key = text(name),
      existing = this.m_aRecent.get(key);
    if (existing) existing.folder = folder;
    else this.m_aRecent.set(key, { name: new OUString(name), folder });
  }
  /** Original cache erase releases the key only. @param key - Exact host spelling. @returns Nothing. */
  private eraseCache(key: string): void {
    this.m_aRecent.get(key)?.name.dispose();
    this.m_aRecent.delete(key);
  }
  /** Compiler-erased original getXWeak/reference/Any return temporaries. @param folder - Actual folder. @returns Owned native Any. */
  private folderAny(folder: ZipPackageFolder): Any {
    const value = new Reference<XWeak>(folder);
    try {
      return new Any(value.getAddress(), ["Reference", XWeak.static_type]);
    } finally {
      value.dispose();
    }
  }
  /** Original cached and uncached hierarchy traversal; notably the trailing-folder branch caches pPrevious unchanged. @param name - Native path. @returns Source owned Any. */
  getByHierarchicalName(name: OUStringConstReference): Any {
    if (text(name) === "/") return this.folderAny(this.root);
    const streamIndex = name.lastIndexOf(47),
      folder = streamIndex === name.getLength() - 1,
      directory = streamIndex !== -1 ? name.copy(0, streamIndex) : new OUString();
    try {
      if (streamIndex !== -1) {
        const key = text(directory),
          cached = this.m_aRecent.get(key);
        if (cached) {
          const pointer = cached.folder;
          if (folder) {
            const dirIndex = name.lastIndexOf(47, streamIndex),
              part = name.subView(dirIndex === -1 ? 0 : dirIndex + 1, streamIndex - dirIndex - 1);
            if (pointer) {
              const actual = pointer.getName();
              try {
                if (actual.getLength() === part.length && actual.match(part))
                  return this.folderAny(pointer);
              } finally {
                actual.dispose();
              }
            }
          } else {
            const part = name.subView(streamIndex + 1);
            if (pointer && pointer.hasByName(part)) return pointer.getByName(part);
          }
          this.eraseCache(key);
        }
      } else if (this.root.hasByName(name)) return this.root.getByName(name);
      let old = 0,
        index: number,
        current = this.root,
        previous: ZipPackageFolder | null = null;
      while ((index = name.indexOf(47, old)) !== -1) {
        if (index === old) break;
        const part = name.subView(old, index - old);
        if (!current.hasByName(part)) throw new NoSuchElementException();
        previous = current;
        const info = current.doGetByName(part);
        if (!info.bFolder) this.streamAsFolder();
        current = info.entry.operatorArrow() as ZipPackageFolder;
        old = index + 1;
      }
      if (folder) {
        if (streamIndex !== -1) this.cache(directory, previous);
        return this.folderAny(current);
      }
      const part = name.subView(old);
      if (current.hasByName(part)) {
        if (streamIndex !== -1) this.cache(directory, current);
        return current.getByName(part);
      }
      throw new NoSuchElementException();
    } finally {
      directory.dispose();
    }
  }
  /** Original presence/cache flow and dynamic caught-exception wrapping; it does not delegate to getByHierarchicalName. Null cached pointers retain the original undefined native domain. @param name - Native path. @returns Source result. */
  hasByHierarchicalName(name: OUStringConstReference): boolean {
    if (text(name) === "/") return true;
    try {
      const streamIndex = name.lastIndexOf(47),
        folder = streamIndex === name.getLength() - 1,
        directory = streamIndex !== -1 ? name.copy(0, streamIndex) : new OUString();
      try {
        if (streamIndex !== -1) {
          const key = text(directory),
            cached = this.m_aRecent.get(key);
          if (cached) {
            const pointer = cached.folder as ZipPackageFolder;
            if (folder) {
              const dirIndex = name.lastIndexOf(47, streamIndex),
                part = name.subView(dirIndex === -1 ? 0 : dirIndex + 1, streamIndex - dirIndex - 1),
                actual = pointer.getName();
              try {
                if (actual.getLength() === part.length && actual.match(part)) return true;
              } finally {
                actual.dispose();
              }
            } else if (pointer.hasByName(name.subView(streamIndex + 1))) return true;
            this.eraseCache(key);
          }
        } else if (this.root.hasByName(name)) return true;
        let current = this.root,
          previous: ZipPackageFolder | null = null,
          old = 0,
          index: number;
        while ((index = name.indexOf(47, old)) !== -1) {
          if (index === old) break;
          const part = name.subView(old, index - old);
          if (!current.hasByName(part)) return false;
          previous = current;
          const info = current.doGetByName(part);
          if (!info.bFolder) this.streamAsFolder();
          current = info.entry.operatorArrow() as ZipPackageFolder;
          old = index + 1;
        }
        if (folder) {
          this.cache(directory, previous);
          return true;
        }
        const part = name.subView(old);
        if (current.hasByName(part)) {
          this.cache(directory, current);
          return true;
        }
      } finally {
        directory.dispose();
      }
    } catch (error) {
      if (error instanceof RuntimeException) throw error;
      if (!(error instanceof Exception)) throw error;
      try {
        const payload = withCaughtException(error, getCaughtException),
          message = native("ZipPackage::hasByHierarchicalName"),
          context = new Reference();
        try {
          throw new WrappedTargetRuntimeException(message, context, payload);
        } finally {
          context.dispose();
          message.dispose();
          payload.dispose();
        }
      } finally {
        error.dispose();
      }
    }
    return false;
  }
  /** Original checked stream/folder collision diagnostic. @returns Never. */
  private streamAsFolder(): never {
    const message = native("Bad Zip File, stream as folder"),
      context = new Reference();
    try {
      throw new ZipIOException(message, context);
    } finally {
      context.dispose();
      message.dispose();
    }
  }
}
