/** @fileoverview Original hierarchical package path descent over acquired child UNO storages. */
import { OStorageHelper } from "../../../comphelper/inc/storagehelper";
import { IOException } from "../../../cppu/inc/com/sun/star/io/IOException";
import { IllegalArgumentException } from "../../../cppu/inc/com/sun/star/lang/IllegalArgumentException";
import { NoSupportException } from "../../../cppu/inc/com/sun/star/lang/NoSupportException";
import { Reference, UNO_QUERY_THROW } from "../../../cppu/inc/com/sun/star/uno/Reference";
import { WeakImplHelper } from "../../../cppuhelper/inc/implbase";
import { READ, WRITE } from "../../../offapi/com/sun/star/embed/ElementModes";
import { XExtendedStorageStream } from "../../../offapi/com/sun/star/embed/XExtendedStorageStream";
import type { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import type { EventObject } from "../../../udkapi/com/sun/star/lang/EventObject";
import { XEventListener } from "../../../udkapi/com/sun/star/lang/XEventListener";
import { storageName } from "./xstorage.catalog";

/** Retains the substorage chain required by attached readonly streams. */
export class OHierarchyHolder_Impl {
  private readonly children = new Map<
    string,
    { storage: Reference<XStorage>; holder: OHierarchyHolder_Impl }
  >();
  private readonly streams = new Set<XExtendedStorageStream>();
  private parent: { holder: OHierarchyHolder_Impl; key: string } | undefined;
  private closing = false;

  /** Applies original path validation and resolves each parent before the leaf. @param root - Borrowed root storage. @param path - Original package path. @param mode - Original stream flags. @returns Owned part. */
  GetStreamHierarchically(
    root: XStorage,
    path: OUStringConstReference,
    mode: number,
  ): Reference<XExtendedStorageStream> {
    const parts = storageName(path).split("/");
    if (
      !OStorageHelper.IsValidZipEntryFileName(path.getStr().subarray(0, path.getLength()), true) ||
      parts.includes("")
    )
      throw new IllegalArgumentException();
    if (mode & WRITE) throw new NoSupportException();
    return this.open(root, parts, 0, mode);
  }

  /** Opens a direct stream or descends through an acquired child storage. @param owner - Current storage. @param parts - Validated segments. @param depth - Current segment. @param mode - Stream flags. @returns Owned part. */
  private open(
    owner: XStorage,
    parts: readonly string[],
    depth: number,
    mode: number,
  ): Reference<XExtendedStorageStream> {
    const key = parts[depth] as string;
    const units = new Uint16Array(key.length);
    for (let i = 0; i < key.length; ++i) units[i] = key.charCodeAt(i);
    const name = new OUString(units, units.length);
    try {
      if (depth === parts.length - 1) {
        const stream = owner.openStreamElement(name, mode);
        try {
          const part = new Reference<XExtendedStorageStream>(
            stream,
            UNO_QUERY_THROW,
            XExtendedStorageStream.static_type,
          );
          const listener = new Reference<XEventListener>(new HierarchyStreamListener(this));
          try {
            part.operatorStar().addEventListener(listener);
            this.streams.add(part.operatorStar());
            return part;
          } catch (error) {
            part.dispose();
            throw error;
          } finally {
            listener.dispose();
          }
        } finally {
          stream.dispose();
        }
      }
      let child = this.children.get(key);
      if (child) return child.holder.open(child.storage.operatorStar(), parts, depth + 1, mode);
      const storage = owner.openStorageElement(name, READ);
      const holder = new OHierarchyHolder_Impl();
      try {
        if (!storage.is()) throw new IOException();
        const stream = holder.open(storage.operatorStar(), parts, depth + 1, mode);
        holder.parent = { holder: this, key };
        child = { storage, holder };
        this.children.set(key, child);
        return stream;
      } catch (error) {
        holder.dispose();
        storage.dispose();
        throw error;
      }
    } finally {
      name.dispose();
    }
  }

  /** Removes a closed leaf and releases newly unused path components. @param event - Stream disposal event. @returns Nothing. */
  StreamDisposed(event: Readonly<EventObject>): void {
    this.streams.delete(event.Source.get() as XExtendedStorageStream);
    this.TestForClosing();
  }

  /** Releases the original child storage when all of its streams and children are gone. @returns Nothing. */
  private TestForClosing(): void {
    if (this.closing || this.streams.size || this.children.size || !this.parent) return;
    const { holder, key } = this.parent;
    this.parent = undefined;
    const child = holder.children.get(key);
    holder.children.delete(key);
    child?.storage.dispose();
    holder.TestForClosing();
  }

  /** Releases the acquired substorage chain in child-before-parent order. @returns Nothing. */
  dispose(): void {
    this.closing = true;
    for (const child of this.children.values()) {
      child.holder.dispose();
      child.storage.dispose();
    }
    this.children.clear();
    this.streams.clear();
  }
}

/** Original nontransacted branch receives leaf disposal notifications. */
class HierarchyStreamListener
  extends WeakImplHelper.specialize(XEventListener)
  implements XEventListener
{
  /** Borrows the branch until the leaf is disposed. @param holder - Path branch. @returns Listener. */
  constructor(private readonly holder: OHierarchyHolder_Impl) {
    super();
  }
  /** Forwards the original leaf disposal event. @param event - Stream event. @returns Nothing. */
  disposing(event: Readonly<EventObject>): void {
    this.holder.StreamDisposed(event);
  }
}
