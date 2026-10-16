/** @fileoverview Actual normal liblangtag tag fields, lifecycle and cached value operations.
 * Copyright (C) 2011–2015 Akira TAGOH. SPDX-License-Identifier: MPL-2.0
 */
import { ErrorCode, setDiagnostic, type DiagnosticSlot } from "./lt-error";
import type { RegistryEntry } from "./lt-registry";
import type { ExtensionData } from "./lt-extension";
import { lt_strlower } from "./lt-utils";

/** Original private parser-state ordinals, including source sentinel values. */
export enum TagState {
  NONE,
  LANG,
  PRE_EXTLANG,
  EXTLANG,
  PRE_SCRIPT,
  SCRIPT,
  PRE_REGION,
  REGION,
  PRE_VARIANT,
  VARIANT,
  PRE_EXTENSION,
  EXTENSION,
  IN_EXTENSION,
  EXTENSIONTOKEN,
  IN_EXTENSIONTOKEN,
  EXTENSIONTOKEN2,
  PRE_PRIVATEUSE,
  PRIVATEUSE,
  IN_PRIVATEUSE,
  PRIVATEUSETOKEN,
  IN_PRIVATEUSETOKEN,
  PRIVATEUSETOKEN2,
  END,
}

/** Original native string-filter bits. */
export enum TagFilter {
  NONE = 0,
  LANGUAGE = 1,
  EXTLANG = 2,
  SCRIPT = 4,
  REGION = 8,
  VARIANT = 16,
  EXTENSION = 32,
  PRIVATEUSE = 64,
  GRANDFATHERED = 128,
  ALL = -1,
}

/** Internal source-private tag fields shared only by the split lt-tag.c responsibilities. */
export interface Tag {
  wildcardMap: number;
  state: TagState;
  tagStringFilter: number;
  tagString: string | null;
  language: RegistryEntry | null;
  extlang: RegistryEntry | null;
  script: RegistryEntry | null;
  region: RegistryEntry | null;
  variants: RegistryEntry[];
  extension: ExtensionData | null;
  privateuse: string;
  grandfathered: RegistryEntry | null;
}

/** Creates native defaults under JS GC. @returns Actual private field owner. */
export function lt_tag_new(): Tag {
  return {
    wildcardMap: 0,
    state: TagState.NONE,
    tagStringFilter: TagFilter.NONE,
    tagString: null,
    language: null,
    extlang: null,
    script: null,
    region: null,
    variants: [],
    extension: null,
    privateuse: "",
    grandfathered: null,
  };
}

/** Clears native values without resetting parser state or filter. @param tag - Actual owner. @returns Nothing. */
export function lt_tag_clear(tag: Tag): void {
  tag.tagString = null;
  tag.language = tag.extlang = tag.script = tag.region = tag.grandfathered = null;
  tag.variants = [];
  tag.extension = null;
  tag.privateuse = "";
}

/** Copies field/list values and the original shallow module-data sharing. @param tag - Actual owner. @returns Independent tag with a fresh empty cache/filter. */
export function lt_tag_copy(tag: Tag): Tag {
  return {
    ...tag,
    tagString: null,
    tagStringFilter: TagFilter.NONE,
    variants: [...tag.variants],
    extension: tag.extension?.copy() ?? null,
  };
}

/** Appends to the original nullable cache. @param tag - Actual owner. @param value - Logical C-string value. @returns Nothing. */
export function addTagString(tag: Tag, value: string): void {
  tag.tagString = tag.tagString ? tag.tagString + "-" + value : value;
}

/** Borrows native cached string by filter, retaining filter-induced cache mutation. @param tag - Actual owner. @param filter - Native bit mask. @returns Cached value or native null. */
export function lt_tag_get_string_with_filter(tag: Tag, filter: number): string | null {
  if (tag.tagStringFilter !== filter) tag.tagString = null;
  else if (tag.tagString !== null) return tag.tagString;
  tag.tagStringFilter = filter;
  if (tag.grandfathered) {
    if (filter & TagFilter.GRANDFATHERED) addTagString(tag, tag.grandfathered.tag);
  } else if (tag.language) {
    if (filter & TagFilter.LANGUAGE) addTagString(tag, tag.language.tag);
    if (tag.extlang && filter & TagFilter.EXTLANG) addTagString(tag, tag.extlang.tag);
    if (tag.script && filter & TagFilter.SCRIPT) addTagString(tag, tag.script.tag);
    if (tag.region && filter & TagFilter.REGION) addTagString(tag, tag.region.tag);
    if (filter & TagFilter.VARIANT)
      for (const variant of tag.variants) addTagString(tag, variant.tag);
    if (tag.extension && filter & TagFilter.EXTENSION) addTagString(tag, tag.extension.getTag());
    if (tag.privateuse && filter & TagFilter.PRIVATEUSE) addTagString(tag, tag.privateuse);
  } else if (tag.privateuse) {
    if (filter & TagFilter.PRIVATEUSE) addTagString(tag, tag.privateuse);
  } else return null;
  return tag.tagString;
}

/** Gets the original ALL-filter cache. @param tag - Actual owner. @returns Native string value or null. */
export function lt_tag_get_string(tag: Tag): string | null {
  return lt_tag_get_string_with_filter(tag, TagFilter.ALL);
}

/** Truncates one native component without resetting state. @param tag - Actual owner. @param error - Optional fresh diagnostic destination. @returns Whether a component was removed. */
export function lt_tag_truncate(tag: Tag, error?: DiagnosticSlot): boolean {
  if (tag.grandfathered)
    return setDiagnostic(
      error,
      "Grandfathered subtag can't be truncated.",
      ErrorCode.LT_ERR_NO_TAG,
    );
  if (tag.privateuse) tag.privateuse = "";
  else if (tag.extension) {
    tag.extension.truncate();
    if (tag.extension.isEmpty()) tag.extension = null;
  } else if (tag.variants.length) tag.variants.pop();
  else if (tag.region) tag.region = null;
  else if (tag.script) tag.script = null;
  else if (tag.extlang) tag.extlang = null;
  else if (tag.language) tag.language = null;
  else return setDiagnostic(error, "No tags to be truncated.", ErrorCode.LT_ERR_NO_TAG);
  tag.tagString = null;
  return true;
}

/** Preserves asymmetric comparison for normal parsed tag values, as used by aliases. @param v1 - First actual owner. @param v2 - Pattern-side actual owner without wildcard ranges. @returns Original normal-tag comparison result. */
export function lt_tag_compare(v1: Tag, v2: Tag): boolean {
  if (v1.grandfathered || v2.grandfathered) return false;
  let same = v1.language === v2.language;
  for (const key of ["extlang", "script", "region"] as const)
    if (v2[key]) same = v1[key] === v2[key] && same;
  for (let i = 0; i < v2.variants.length; i++) same = v1.variants[i] === v2.variants[i] && same;
  if (v2.extension) same = v2.extension.equals(v1.extension) && same;
  if (v2.privateuse) same = lt_strlower(v1.privateuse) === lt_strlower(v2.privateuse) && same;
  return same;
}
