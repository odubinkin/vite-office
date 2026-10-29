/** @fileoverview Source-backed sticky-error contracts over actual ICU resource entry/cache/result owners. No fabricated package metadata, allocation result or native full-class parity is claimed. */
import { assert, expect, it } from "vitest";
import {
  entryOpen,
  entryOpenDirect,
  entryClose,
  init_entry,
  findFirstExisting,
  loadParentsExceptRoot,
  ures_flushCache,
} from "./uresbund.entries";
import { init_resb_result } from "./uresbund.alias";
import * as R from "./uresbund";
import { UErrorCode as E } from "./unicode/utypes";
import { UResOpenType } from "./uresbund.fallback";

it("retains actual entry ownership when a caller supplies an existing failure status", /** The initialized real cache and borrowed root entry remain usable after each source early-return contract. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = entryOpenDirect(null, "root", status);
  assert(root);
  const before = root.fCountExisting,
    parent = root.fParent;
  try {
    status[0] = E.U_ILLEGAL_ARGUMENT_ERROR;
    expect(init_entry("en_GB", null, status)).toBeNull();
    expect(entryOpen(null, "en_GB", UResOpenType.URES_OPEN_LOCALE_DEFAULT_ROOT, status)).toBeNull();
    expect(entryOpenDirect(null, "en_GB", status)).toBeNull();
    const current: [typeof root] = [root],
      name: [string] = ["root"];
    expect(loadParentsExceptRoot(current, name, 157, status)).toBe(false);
    expect(current[0]).toBe(root);
    expect(name[0]).toBe("root");
    expect(root.fCountExisting).toBe(before);
    expect(root.fParent).toBe(parent);
    expect(status[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
    status[0] = 0;
    const reopened = entryOpenDirect(null, "root", status);
    try {
      expect(reopened).toBe(root);
      expect(root.fCountExisting).toBe(before + 1);
      expect(status[0]).toBe(0);
    } finally {
      entryClose(reopened);
    }
    expect(root.fCountExisting).toBe(before);
  } finally {
    entryClose(root);
    ures_flushCache();
  }
});

it("keeps original missing-file search output timing under an existing failure", /** foundParent is initialized before the sticky-status return, while isRoot/isDefault and actual cache ownership are untouched. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = entryOpenDirect(null, "root", status);
  assert(root);
  const before = root.fCountExisting,
    name: [string] = ["en_GB"],
    isRoot: [boolean] = [false],
    parent: [boolean] = [false],
    isDefault: [boolean] = [true];
  try {
    status[0] = E.U_INVALID_FORMAT_ERROR;
    expect(
      findFirstExisting(
        null,
        name,
        "en_US",
        UResOpenType.URES_OPEN_LOCALE_DEFAULT_ROOT,
        isRoot,
        parent,
        isDefault,
        status,
      ),
    ).toBeNull();
    expect([name[0], isRoot[0], parent[0], isDefault[0]]).toEqual(["en_GB", false, true, true]);
    expect(status[0]).toBe(E.U_INVALID_FORMAT_ERROR);
    expect(root.fCountExisting).toBe(before);
  } finally {
    entryClose(root);
    ures_flushCache();
  }
});

it("rejects a missing valid-locale owner before overwriting an actual fill-in", /** The original explicit illegal-argument result preserves the borrowed resource and its reference count. No invalid dereference is executed. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = R.ures_openDirect(null, "root", status);
  assert(root && root.fData);
  const fill = R.ures_copyResb(null, root, status);
  assert(fill);
  const entry = root.fData,
    resource = fill.fRes,
    count = entry.fCountExisting;
  try {
    expect(init_resb_result(entry, root.fRes, null, -1, null, null, 0, fill, status)).toBeNull();
    expect(status[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
    expect(fill.fRes).toBe(resource);
    expect(fill.fData).toBe(entry);
    expect(entry.fCountExisting).toBe(count);
    status[0] = 0;
    expect(R.ures_getByKey(root, "calendar", fill, status)).toBe(fill);
    expect(status[0]).toBe(0);
    expect(fill.fRes).not.toBe(resource);
    expect(entry.fCountExisting).toBe(count);
  } finally {
    R.ures_close(fill);
    R.ures_close(root);
    ures_flushCache();
  }
});
