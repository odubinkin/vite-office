/** @fileoverview Validates native resource error propagation, empty views and real pinned buffer ownership at public admission boundaries. */
import { expect, it } from "vitest";
import * as R from "./uresbund";
import { ResourceDataValue, res_getBuffer } from "./uresdata";
import { ResourceData, res_load, res_unload } from "./uresdata.package";
import { ResourceTable } from "./resource";
import { getFallbackData } from "./uresbund.lookup";
import {
  resCString,
  res_countArrayItems,
  res_getTableItemByIndex,
  res_getArrayItem,
} from "./uresdata.path";
import { UErrorCode as E } from "./unicode/utypes";
import { CharStringMap } from "./charstrmap";
import { UniqueCharStrings } from "./uniquecharstr";
import {
  locale_set_default,
  locale_set_default_internal,
  locale_get_default,
} from "./locid.default";

it("retains native C-map and pool incoming failures without writing storage", /** Incoming source errors prevent writes and unusable storage construction. @returns Nothing. */ () => {
  const status: [number] = [0],
    map = new CharStringMap(2, status);
  map.put("en\0ignored", "English\0ignored", status);
  expect(map.get("en")).toBe("English");
  status[0] = 1;
  map.put("en", "replacement", status);
  expect(map.get("en")).toBe("English");
  const failed = new UniqueCharStrings(status);
  expect(failed.orphanCharStrings()).toBeNull();
  expect(failed.add("ignored", status)).toBe(-1);
  const pool = new UniqueCharStrings([0]);
  expect(pool.get(0)).toBeNull();
  expect(pool.get(1)).toBeNull();
  pool.add("plain\0ignored", [0]);
  pool.freeze();
  expect(pool.get(1)).toBe("plain");
});
it("keeps the cached default locale on a failed setter and exposes the original C facade", /** Source default ownership survives a malformed replacement. @returns Nothing. */ () => {
  const prior = locale_get_default();
  try {
    locale_set_default("sr_Latn_RS");
    expect(locale_get_default()).toBe("sr_Latn_RS");
    const status: [number] = [1];
    expect(locale_set_default_internal("en_US", status)?.getName()).toBe("sr_Latn_RS");
    expect(status[0]).toBe(1);
  } finally {
    locale_set_default(prior);
  }
});
it("returns original nullable-status results without dereferencing bundle storage", /** Null status pointers are handled only by native APIs which admit them. @returns Nothing. */ () => {
  expect(R.ures_getLocaleByType(null, 0, null)).toBeNull();
  expect(R.ures_getString(null, null, null)).toBeNull();
  expect(R.ures_getInt(null, null)).toBe(-1);
  const status: [number] = [0];
  expect(R.ures_getLocaleByType(null, 1, status)).toBeNull();
  expect(status[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
  status[0] = 1;
  expect(R.ures_getLocaleByType(null, 0, status)).toBeNull();
  expect(status[0]).toBe(1);
  status[0] = 0;
  expect(R.ures_getByKeyWithFallback(null, "key", null, status)).toBeNull();
  expect(status[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
  expect(R.ures_getByKeyWithFallback(null, "key", null, null)).toBeNull();
});
it("admits ordered raw table reads and leaves failed mutable view outputs unchanged", /** The real resource table and public empty defaults retain independent output contracts. @returns Nothing. */ () => {
  const status: [number] = [0],
    root = R.ures_openDirect(null, "root", status),
    value = new ResourceDataValue();
  if (root?.resource?.type !== 2) throw new Error("Missing pinned root table");
  const view = new ResourceTable(root.resource),
    key: [string | null] = ["sentinel"];
  expect(view.getKeyAndValue(0, key, value)).toBe(true);
  expect(key[0]).toBe(root.resource.keys[0]);
  const prior = value.getResource();
  expect(view.getKeyAndValue(-1, key, value)).toBe(false);
  expect(value.getResource()).toBe(prior);
  expect(new ResourceTable().getKeyAndValue(0, key, value)).toBe(false);
  expect(res_getTableItemByIndex(root.resource, 0, null)).toBe(prior);
  expect(res_getArrayItem(root.resource, 0)).toBeNull();
  expect(res_countArrayItems(null)).toBe(0);
  expect(resCString(null)).toBe("");
  R.ures_close(root);
});
it("preserves typed value output lengths on sticky errors and resets mismatches", /** Default value holders and actual raw alias storage share native status behavior. @returns Nothing. */ () => {
  const value = new ResourceDataValue(),
    length: [number] = [77],
    status: [number] = [1];
  expect(value.getString(length, status)).toBeNull();
  expect(length[0]).toBe(77);
  expect(value.getAliasString(length, status)).toBeNull();
  expect(length[0]).toBe(77);
  expect(value.getArray(status).getSize()).toBe(0);
  expect(value.getTable(status).getSize()).toBe(0);
  status[0] = 0;
  expect(value.getArray(status).getSize()).toBe(0);
  expect(status[0]).toBe(E.U_RESOURCE_TYPE_MISMATCH);
  status[0] = 0;
  expect(value.getTable(status).getSize()).toBe(0);
  expect(status[0]).toBe(E.U_RESOURCE_TYPE_MISMATCH);
  status[0] = 0;
  expect(value.getAliasString(length, status)).toBeNull();
  expect(length[0]).toBe(0);
  expect(status[0]).toBe(E.U_RESOURCE_TYPE_MISMATCH);
  expect(res_getBuffer(null, 0, null)).toBeNull();
  const output: [R.Resource | null] = [{ type: 0, value: "old" }],
    key: [string | null] = ["missing"];
  status[0] = 0;
  expect(getFallbackData(new R.UResourceBundle(), key, output, status)).toBeNull();
  expect(output[0]).toBeNull();
  expect(status[0]).toBe(E.U_MISSING_RESOURCE_ERROR);
});
it("clears raw load ownership before failed requests and honors terminated file names", /** ResourceData is a real loader output; its prior owned handle is replaced according to source. @returns Nothing. */ () => {
  const data = new ResourceData(),
    status: [number] = [0];
  res_load(data, null, "root\0ignored", status);
  expect(status[0]).toBe(0);
  expect(data.data).not.toBeNull();
  status[0] = 1;
  res_load(data, null, "root", status);
  expect(data.data).toBeNull();
  expect(data.rootRes).toEqual({ type: 0, value: "" });
  status[0] = 0;
  res_load(data, null, "", status);
  expect(status[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
  status[0] = 0;
  res_load(data, null, "not-a-resource-6VDB2H", status);
  expect(status[0]).toBe(E.U_FILE_ACCESS_ERROR);
  res_unload(data);
  expect(data.data).toBeNull();
});
