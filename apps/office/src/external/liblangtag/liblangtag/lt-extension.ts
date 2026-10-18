/** @fileoverview Native normal extension container and default callback values under JS GC.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */
import type { TagDiagnostic } from "./lt-error";
import type { Tag } from "./lt-tag";
import { lt_strlower } from "./lt-utils";
import { UnicodeExtensionData, precheckUnicodeExtension } from "../extensions/lt-ext-ldml-u";
import { TransformExtensionData } from "../extensions/lt-ext-ldml-t";

/** Source callback data contract consumed by the container, without a dynamic module loader. */
interface ModuleData {
  parseTag(subtag: string): TagDiagnostic | null;
  getTag(): string;
  validateTag(): boolean;
}

/** Original _lt_ext_default_data_t value callbacks. */
class DefaultExtensionData implements ModuleData {
  #tags = "";
  /** Appends original spelling without alias/case transformation. @param subtag - Scanner token. @returns Success. */
  parseTag(subtag: string): null {
    this.#tags = this.#tags ? this.#tags + "-" + subtag : subtag;
    return null;
  }
  /** Borrows default payload value. @returns Original tokens. */
  getTag(): string {
    return this.#tags;
  }
  /** Preserves original final-state callback. @returns True. */
  validateTag(): true {
    return true;
  }
}

/** Native extension values/cache with source-shared callback data on copy. */
export class ExtensionData {
  readonly #modules = new Map<string, ModuleData>();
  #singleton: string | null = null;
  #cachedTag = "";

  /** Reports original case-insensitive singleton presence. @param singleton - Normal singleton. @returns Presence. */
  hasSingleton(singleton: string): boolean {
    return this.#modules.has(lt_strlower(singleton));
  }

  /** Creates one actual callback data value after native parent prechecks. @param singleton - Normal unique singleton, excluding x. @param tag - Actual parent fields. @returns Fresh-slot diagnostic or success. */
  addSingleton(singleton: string, tag: Tag): TagDiagnostic | null {
    const key = lt_strlower(singleton);
    if (key === "u" || key === "t") {
      const error = precheckUnicodeExtension(tag.grandfathered, tag.extlang);
      if (error) return error;
    }
    const data =
      key === "u"
        ? new UnicodeExtensionData()
        : key === "t"
          ? new TransformExtensionData()
          : new DefaultExtensionData();
    this.#modules.set(key, data);
    this.#singleton = key;
    this.#cachedTag = this.#cachedTag ? this.#cachedTag + "-" + singleton : singleton;
    return null;
  }

  /** Appends through the active native callback; caller must have added a singleton. @param subtag - Token. @returns Diagnostic or success. */
  addTag(subtag: string): TagDiagnostic | null {
    const error = (this.#modules.get(this.#singleton as string) as ModuleData).parseTag(subtag);
    if (!error) this.#cachedTag += "-" + subtag;
    return error;
  }

  /** Returns native original cached spelling. @returns Cached tokens including singleton. */
  getTag(): string {
    return this.#cachedTag;
  }

  /** Emits native ordinal singleton order with each real callback's own payload. @returns Canonicalized extension string. */
  getCanonicalizedTag(): string {
    return this.#keys()
      .map(
        /** Calls actual callback data, preserving observable getter sorting. @param key - Singleton. @returns Complete extension. */
        (key) => key + "-" + (this.#modules.get(key) as ModuleData).getTag(),
      )
      .join("-");
  }

  /** Checks the active callback or the original empty/default state. @returns Native validity. */
  validateState(): boolean {
    return this.#singleton === null
      ? true
      : (this.#modules.get(this.#singleton)?.validateTag() ?? false);
  }

  /** Cancels the active singleton and rebuilds the original cache by exact spelling. @returns Nothing. */
  cancelTag(): void {
    if (this.#singleton === null || !this.#modules.has(this.#singleton)) return;
    this.#modules.delete(this.#singleton);
    const parts = this.#cachedTag.split("-"),
      end = parts.indexOf(this.#singleton);
    this.#cachedTag = (end < 0 ? parts : parts.slice(0, end)).join("-");
    this.#singleton = null;
  }

  /** Copies container state while sharing original callback data identities. @returns Independent container/cache. */
  copy(): ExtensionData {
    const value = new ExtensionData();
    value.#singleton = this.#singleton;
    value.#cachedTag = this.#cachedTag;
    for (const [key, data] of this.#modules) value.#modules.set(key, data);
    return value;
  }

  /** Removes the highest native ordinal singleton; cached spelling intentionally stays. @returns Whether one was removed. */
  truncate(): boolean {
    const key = this.#keys().pop();
    return key === undefined ? false : this.#modules.delete(key);
  }

  /** Reports remaining actual callback values. @returns Whether empty. */
  isEmpty(): boolean {
    return this.#modules.size === 0;
  }

  /** Compares the native callback payloads, not cached spelling. @param other - Second container. @returns Native normal-extension equality. */
  equals(other: ExtensionData | null): boolean {
    if (this === other) return true;
    if (!other) return false;
    for (const key of new Set([...this.#keys(), ...other.#keys()])) {
      const left = this.#modules.get(key),
        right = other.#modules.get(key);
      if (!left || !right) return false;
      if (left.getTag() !== right.getTag()) return false;
    }
    return true;
  }

  /** Gives native digit then lowercase-letter singleton order. @returns Sorted normal keys. */
  #keys(): string[] {
    return [...this.#modules.keys()].sort();
  }
}
