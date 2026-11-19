/** @fileoverview Original synchronous StorageBase stream/path/substorage cache, recursive copy and child-before-parent commit over actual UNO streams and concrete subclass hooks. Consumed RefMap/std::map lowering retains native Unicode keys/shared owners; physical tree/iterator ABI is unqualified. */
import { Reference } from "../../../cppu/inc/com/sun/star/uno/Reference";
import type { XInputStream } from "../../../udkapi/com/sun/star/io/XInputStream";
import type { XOutputStream } from "../../../udkapi/com/sun/star/io/XOutputStream";
import type { XStream } from "../../../udkapi/com/sun/star/io/XStream";
import type { XStorage } from "../../../offapi/com/sun/star/embed/XStorage";
import { OUString, type OUStringConstReference } from "../../../sal/inc/rtl/ustring";
import { OUStringBuffer } from "../../../sal/inc/rtl/ustrbuf";
import { SharedReference } from "../core/shared-reference";
import { BinaryXInputStream } from "./binaryinputstream";
import { BinaryXOutputStream } from "./binaryoutputstream";
/** Original shared storage alias. */
export type StorageRef = SharedReference<StorageBase>;
/** Original split strips leading slashes only and preserves empty remainder ownership. @param full - Native name. @returns Owned element and remainder. */
function lclSplitFirstElement(full: OUStringConstReference): [OUString, OUString] {
  let name = new OUString(full);
  try {
    let slash = name.indexOf(47);
    while (slash === 0) {
      const next = name.copy(1);
      name.dispose();
      name = next;
      slash = name.indexOf(47);
    }
    return slash >= 0 && slash < name.getLength()
      ? [name.copy(0, slash), name.copy(slash + 1)]
      : [new OUString(name), new OUString()];
  } finally {
    name.dispose();
  }
}
/** Actual original abstract storage owner, retaining the synchronous native contract. */
export abstract class StorageBase {
  private readonly maSubStorages: { key: OUString; value: StorageRef }[] = [];
  private readonly mxInStream = new Reference<XInputStream>();
  private readonly mxOutStream = new Reference<XStream>();
  private readonly maParentPath: OUString;
  private readonly maStorageName: OUString;
  private readonly mbBaseStreamAccess: boolean;
  private readonly mbReadOnly: boolean;
  /** Original input-root constructor lowering. @param stream - Actual input. @param baseAccess - Empty-name access. @param mode - Erased source input overload. @returns Storage. */
  protected constructor(stream: Reference<XInputStream>, baseAccess: boolean, mode: "input");
  /** Original output-root constructor lowering. @param stream - Actual bidirectional stream. @param baseAccess - Empty-name access. @param mode - Erased source output overload. @returns Storage. */
  protected constructor(stream: Reference<XStream>, baseAccess: boolean, mode: "output");
  /** Original substorage constructor. @param parent - Actual parent. @param name - By-value moved native name. @param readOnly - Original mode. @returns Storage. */
  protected constructor(parent: StorageBase, name: OUStringConstReference, readOnly: boolean);
  /** Original constructor overload dispatch; no asynchronous replacement or preloaded-cache mode. @param source - Native parent or stream. @param argument - Native name or access flag. @param mode - Native read-only flag or erased stream overload. @returns Storage. */
  protected constructor(
    source: StorageBase | Reference<XInputStream> | Reference<XStream>,
    argument: OUStringConstReference | boolean,
    mode: boolean | "input" | "output",
  ) {
    if (source instanceof StorageBase) {
      this.maParentPath = source.getPath();
      this.maStorageName = new OUString(argument as OUStringConstReference);
      this.mbBaseStreamAccess = false;
      this.mbReadOnly = mode as boolean;
    } else {
      this.maParentPath = new OUString();
      this.maStorageName = new OUString();
      this.mbBaseStreamAccess = argument as boolean;
      this.mbReadOnly = mode === "input";
      if (mode === "input") this.mxInStream.assign(source as Reference<XInputStream>);
      else this.mxOutStream.assign(source as Reference<XStream>);
    }
  }
  /** Original reverse member destruction, releasing actual retained child/stream owners. @returns Nothing. */
  dispose(): void {
    this.maStorageName.dispose();
    this.maParentPath.dispose();
    this.mxOutStream.dispose();
    this.mxInStream.dispose();
    for (let i = this.maSubStorages.length - 1; i >= 0; --i) {
      const entry = this.maSubStorages[i] as { key: OUString; value: StorageRef };
      entry.value.dispose();
      entry.key.dispose();
    }
  }
  /** Original validity virtual forwarding. @returns Storage valid. */ isStorage(): boolean {
    return this.implIsStorage();
  }
  /** Original root requires validity and empty element name. @returns Root storage. */ isRootStorage(): boolean {
    return this.implIsStorage() && this.maStorageName.isEmpty();
  }
  /** Original immutable input mode. @returns Read only. */ isReadOnly(): boolean {
    return this.mbReadOnly;
  }
  /** Original XStorage virtual forwarding. @returns Owned actual interface. */ getXStorage(): Reference<XStorage> {
    return this.implGetXStorage();
  }
  /** Original borrowed const name. @returns Native element name. */ getName(): OUStringConstReference {
    return this.maStorageName;
  }
  /** Original parent separator is added only for nonempty parent. @returns Owned native path. */ getPath(): OUString {
    const buffer = new OUStringBuffer(this.maParentPath);
    try {
      if (!buffer.isEmpty()) buffer.append(Uint16Array.of(47));
      buffer.append(this.maStorageName);
      return buffer.makeStringAndClear();
    } finally {
      buffer.dispose();
    }
  }
  /** Original clears the caller-owned vector before invoking the concrete owner. @param names - Owned native names. @returns Nothing. */ getElementNames(
    names: OUString[],
  ): void {
    for (const name of names) name.dispose();
    names.length = 0;
    this.implGetElementNames(names);
  }
  /** Original read-only creation guard, slash split and recursive shared-pointer return. @param name - Native path. @param create - Create missing storage. @returns Shared substorage or empty. */ openSubStorage(
    name: OUStringConstReference,
    create: boolean,
  ): StorageRef {
    const result = new SharedReference<StorageBase>();
    if (create && this.mbReadOnly) return result;
    const [element, remainder] = lclSplitFirstElement(name);
    try {
      if (!element.isEmpty()) {
        const child = this.getSubStorage(element, create);
        try {
          result.assign(child);
        } finally {
          child.dispose();
        }
      }
      if (result.is() && !remainder.isEmpty()) {
        const child = result.operatorStar().openSubStorage(remainder, create);
        try {
          result.assign(child);
        } finally {
          child.dispose();
        }
      }
      return result;
    } catch (error) {
      result.dispose();
      throw error;
    } finally {
      remainder.dispose();
      element.dispose();
    }
  }
  /** Original exact path descent and optional empty-name base input reference. @param name - Native path. @returns Owned input. */ openInputStream(
    name: OUStringConstReference,
  ): Reference<XInputStream> {
    const [element, remainder] = lclSplitFirstElement(name);
    try {
      if (!element.isEmpty()) {
        if (remainder.isEmpty()) return this.implOpenInputStream(element);
        const child = this.getSubStorage(element, false);
        try {
          return child.is()
            ? child.operatorStar().openInputStream(remainder)
            : new Reference<XInputStream>();
        } finally {
          child.dispose();
        }
      }
      return this.mbBaseStreamAccess
        ? new Reference(this.mxInStream)
        : new Reference<XInputStream>();
    } finally {
      remainder.dispose();
      element.dispose();
    }
  }
  /** Original readonly guard, creating path descent and optional base output. @param name - Native path. @returns Owned output. */ openOutputStream(
    name: OUStringConstReference,
  ): Reference<XOutputStream> {
    if (this.mbReadOnly) return new Reference<XOutputStream>();
    const [element, remainder] = lclSplitFirstElement(name);
    try {
      if (!element.isEmpty()) {
        if (remainder.isEmpty()) return this.implOpenOutputStream(element);
        const child = this.getSubStorage(element, true);
        try {
          return child.is()
            ? child.operatorStar().openOutputStream(remainder)
            : new Reference<XOutputStream>();
        } finally {
          child.dispose();
        }
      }
      return this.mbBaseStreamAccess
        ? this.mxOutStream.operatorStar().getOutputStream()
        : new Reference<XOutputStream>();
    } finally {
      remainder.dispose();
      element.dispose();
    }
  }
  /** Original tries a source substorage before stream copying; concrete stream wrappers retain autoclose. @param destination - Actual destination. @param name - Source path. @returns Nothing. */ copyToStorage(
    destination: StorageBase,
    name: OUStringConstReference,
  ): void {
    if (!destination.isStorage() || destination.isReadOnly() || name.isEmpty()) return;
    const child = this.openSubStorage(name, false);
    try {
      if (child.is()) {
        const target = destination.openSubStorage(name, true);
        try {
          if (target.is()) child.operatorStar().copyStorageToStorage(target.operatorStar());
        } finally {
          target.dispose();
        }
      } else {
        const input = this.openInputStream(name);
        try {
          if (input.is()) {
            const output = destination.openOutputStream(name);
            try {
              if (output.is()) {
                const reader = new BinaryXInputStream(input, true);
                try {
                  const writer = new BinaryXOutputStream(output, true);
                  try {
                    reader.copyToStream(writer);
                  } finally {
                    writer.dispose();
                  }
                } finally {
                  reader.dispose();
                }
              }
            } finally {
              output.dispose();
            }
          }
        } finally {
          input.dispose();
        }
      }
    } finally {
      child.dispose();
    }
  }
  /** Original element-order recursive storage copy. @param destination - Actual destination. @returns Nothing. */ copyStorageToStorage(
    destination: StorageBase,
  ): void {
    if (!destination.isStorage() || destination.isReadOnly()) return;
    const names: OUString[] = [];
    try {
      this.getElementNames(names);
      for (const name of names) this.copyToStorage(destination, name);
    } finally {
      for (const name of names) name.dispose();
    }
  }
  /** Commits cached children in native key order, then the current storage. @param reportFailure - Propagate transaction failure at a browser output boundary. @returns Nothing. */ commit(
    reportFailure = false,
  ): void {
    if (!this.mbReadOnly) {
      for (const entry of this.maSubStorages)
        if (entry.value.is()) entry.value.operatorStar().commit(reportFailure);
      this.implCommit(reportFailure);
    }
  }
  /** Original map operator[] caches shared ownership, retries empty slots and returns by value. @param name - Direct native element. @param create - Original create flag. @returns Shared child copy. */ private getSubStorage(
    name: OUStringConstReference,
    create: boolean,
  ): StorageRef {
    let index = 0;
    while (
      index < this.maSubStorages.length &&
      (this.maSubStorages[index] as { key: OUString; value: StorageRef }).key.compareTo(name) < 0
    )
      ++index;
    let entry = this.maSubStorages[index];
    if (entry === undefined || !entry.key.equals(name)) {
      entry = { key: new OUString(name), value: new SharedReference<StorageBase>() };
      this.maSubStorages.splice(index, 0, entry);
    }
    if (!entry.value.is()) {
      const opened = this.implOpenSubStorage(name, create);
      try {
        entry.value.assign(opened);
      } finally {
        opened.dispose();
      }
    }
    return new SharedReference(entry.value);
  }
  /** Original concrete validity hook. @returns Valid storage. */ protected abstract implIsStorage(): boolean;
  /** Original concrete interface hook. @returns Owned interface. */ protected abstract implGetXStorage(): Reference<XStorage>;
  /** Original concrete enumeration hook. @param names - Cleared vector. @returns Nothing. */ protected abstract implGetElementNames(
    names: OUString[],
  ): void;
  /** Original concrete substorage hook. @param name - Direct name. @param create - Creation requested. @returns Shared actual child. */ protected abstract implOpenSubStorage(
    name: OUStringConstReference,
    create: boolean,
  ): StorageRef;
  /** Original concrete input hook. @param name - Direct name. @returns Owned input. */ protected abstract implOpenInputStream(
    name: OUStringConstReference,
  ): Reference<XInputStream>;
  /** Original concrete output hook. @param name - Direct name. @returns Owned output. */ protected abstract implOpenOutputStream(
    name: OUStringConstReference,
  ): Reference<XOutputStream>;
  /** Original concrete transaction hook. @param reportFailure - Whether the output boundary needs failures. @returns Nothing. */ protected abstract implCommit(
    reportFailure: boolean,
  ): void;
}
