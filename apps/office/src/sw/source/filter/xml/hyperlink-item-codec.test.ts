/** @fileoverview Checks independent native internet style-ID literals and malformed browser records without upstream access. */
import { describe, expect, it } from "vitest";
import { SwFormatINetFormat } from "../../core/txtnode/fmtatr2";
import { SwPoolFormatId } from "../../../inc/poolfmt";
import {
  decodeSwFormatINetFormat,
  decodeSwFormatINetFormatRecord,
  encodeSfxPoolItem,
  encodeSwFormatINetFormatRecord,
} from "../../../browser/filter/xml/item-codec";

const pairs = [
  [0, 0],
  [0, 1031],
  [0, 65000],
  [0, 65535],
  [1030, 0],
  [1030, 1031],
  [1030, 65000],
  [1030, 65535],
  [65000, 0],
  [65000, 1031],
  [65000, 65000],
  [65000, 65535],
  [65535, 0],
  [65535, 1031],
  [65535, 65000],
  [65535, 65535],
] as const;

describe("native internet browser value records", /** Registers literal independent fields and strict boundary cases. @returns Nothing. */ function codecCases(): void {
  it.each(pairs)(
    "retains normal %s and visited %s independently",
    /** Checks all zero,built-in,custom and sentinel pairs through both actual codecs. @param normal - Literal normal ID. @param visited - Literal visited ID. @returns Nothing. */ function nativeIds(
      normal,
      visited,
    ): void {
      const item = new SwFormatINetFormat("url", "target");
      item.SetName("name");
      item.SetINetFormatAndId("normal", normal as SwPoolFormatId);
      item.SetVisitedFormatAndId("visited", visited as SwPoolFormatId);
      const record = encodeSwFormatINetFormatRecord(item),
        snapshot = encodeSfxPoolItem(item);
      expect(record.url).toBe("url");
      expect(record.targetFrame).toBe("target");
      expect(record.name).toBe("name");
      expect(record.styleName).toBe("normal");
      expect(record.visitedStyleName).toBe("visited");
      expect(Object.hasOwn(record, "inetFormatId")).toBe(normal !== 0);
      expect(Object.hasOwn(record, "visitedFormatId")).toBe(visited !== 0);
      expect(record.inetFormatId ?? 0).toBe(normal);
      expect(record.visitedFormatId ?? 0).toBe(visited);
      expect(snapshot.which).toBe(54);
      expect(JSON.parse(snapshot.value as string)).toEqual(record);
      for (const restored of [
        decodeSwFormatINetFormat(snapshot),
        decodeSwFormatINetFormatRecord(structuredClone(record)),
      ]) {
        expect(restored.GetINetFormatId()).toBe(normal);
        expect(restored.GetVisitedFormatId()).toBe(visited);
        expect(restored.GetHyperlink()).toEqual({
          url: "url",
          name: "name",
          targetFrame: "target",
          styleName: "normal",
          visitedStyleName: "visited",
        });
        expect(restored.equals(item)).toBe(true);
        expect(restored.GetTextINetFormat()).toBeUndefined();
        expect(restored).not.toBe(item);
      }
      expect(JSON.parse(item.QueryValue())).toEqual({
        url: "url",
        name: "name",
        targetFrame: "target",
        styleName: "normal",
        visitedStyleName: "visited",
      });
      expect(item.GetTextINetFormat()).toBeUndefined();
    },
  );
  it("keeps omitted and explicit zero IDs distinct from native styled constructor defaults", /** Checks current-schema compatibility and independent ID/name restoration. @returns Nothing. */ function zeroFields(): void {
    for (const value of [
      { url: "url" },
      { url: "url", inetFormatId: 0, visitedFormatId: 0 },
      { url: "url", inetFormatId: 1030, visitedFormatId: 1031 },
    ]) {
      const item = decodeSwFormatINetFormatRecord(value);
      expect(item.GetINetFormatId()).toBe("inetFormatId" in value ? value.inetFormatId : 0);
      expect(item.GetVisitedFormatId()).toBe(
        "visitedFormatId" in value ? value.visitedFormatId : 0,
      );
      expect(item.GetINetFormat()).toBe("");
      expect(item.GetVisitedFormat()).toBe("");
    }
    const old = {
      which: 54,
      value: '{"url":"url","styleName":"custom","visitedStyleName":"other"}',
    };
    const restored = decodeSwFormatINetFormat(old);
    expect(restored.GetINetFormatId()).toBe(0);
    expect(restored.GetVisitedFormatId()).toBe(0);
    expect(restored.GetINetFormat()).toBe("custom");
    expect(restored.GetVisitedFormat()).toBe("other");
    expect(encodeSfxPoolItem(restored)).toEqual(old);
    const record = encodeSwFormatINetFormatRecord(new SwFormatINetFormat("url", "target"));
    expect(record).toEqual({
      url: "url",
      targetFrame: "target",
      styleName: "Internet Link",
      visitedStyleName: "Visited Internet Link",
      inetFormatId: 1030,
      visitedFormatId: 1031,
    });
    const captured = decodeSwFormatINetFormatRecord(record);
    const caller = record as { styleName: string; inetFormatId: number };
    caller.styleName = "later";
    caller.inetFormatId = 0;
    expect(captured.GetINetFormat()).toBe("Internet Link");
    expect(captured.GetINetFormatId()).toBe(1030);
  });
  it.each([-1, 65536, 0.5, NaN, Infinity, -Infinity, "1030", null, true, {}, []])(
    "rejects a malformed identity %s in either native field",
    /** Checks unsigned16 boundaries and types without coercion. @param bad - Invalid browser value. @returns Nothing. */ function invalidIds(
      bad,
    ): void {
      for (const field of ["inetFormatId", "visitedFormatId"]) {
        const record = { url: "url", [field]: bad };
        expect(decodeSwFormatINetFormatRecord.bind(undefined, record)).toThrow(
          "snapshot is invalid",
        );
        expect(
          decodeSwFormatINetFormat.bind(undefined, { which: 54, value: JSON.stringify(record) }),
        ).toThrow("snapshot is invalid");
      }
    },
  );
  it("retains active-link and item snapshot validation at the shared browser boundary", /** Checks record shape,empty active destinations,WhichId and primitive parsing. @returns Nothing. */ function invalidRecords(): void {
    for (const record of [null, undefined, [], true, 0, "url", {}, { url: 0 }, { url: "" }])
      expect(decodeSwFormatINetFormatRecord.bind(undefined, record)).toThrow("snapshot is invalid");
    for (const snapshot of [
      { which: 1, value: '{"url":"url"}' },
      { which: 54, value: 3 },
      { which: 54, value: "{" },
    ])
      expect(decodeSwFormatINetFormat.bind(undefined, snapshot)).toThrow("snapshot is invalid");
  });
});
