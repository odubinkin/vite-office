/** @fileoverview Verifies the bounded SfxRequest argument, payload, and completion contract. */

import { describe, expect, it } from "vitest";

import { SfxBoolItem } from "../../../svl/source/items/cenumitm";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SfxUnoAnyItem } from "../view/frame";
import { SfxCallMode } from "./bindings";
import { SfxRequest } from "./request";

describe("SfxRequest", /** Exercises request lifecycle and validation. @returns Nothing. */ () => {
  it("retains slot arguments and browser payload and records a return item" /** Verifies request accessors and completion. @returns Nothing. */, () => {
    const argument = new SfxStringItem(7, "value");
    const request = new SfxRequest(55, [argument]);
    expect(request.GetSlot()).toBe(55);
    expect(request.GetArgs()).toEqual([argument]);
    expect(request.IsDone()).toBe(false);
    expect(request.GetReturnValue()).toBeUndefined();
    const result = new SfxBoolItem(55, true);
    request.SetReturnValue(result);
    expect(request.IsDone()).toBe(false);
    request.Done();
    expect(request.IsDone()).toBe(true);
    expect(request.GetReturnValue()).not.toBe(result);
    expect(request.GetReturnValue()?.equals(result)).toBe(true);
  });

  it("carries structured UNO arguments in SfxUnoAnyItem", /** Verifies pinned Any cloning and non-comparable semantics. @returns Nothing. */ () => {
    const value = { Name: "CharFontName", Value: "Noto Serif" };
    const item = new SfxUnoAnyItem(55, value);
    expect(item.GetValue()).toBe(value);
    expect(item.QueryValue()).toBe(value);
    expect(item.Clone()).not.toBe(item);
    expect(item.Clone().equals(item)).toBe(false);
    expect(item.equals(item)).toBe(false);
    expect(item.equals(new SfxUnoAnyItem(55, {}))).toBe(false);
  });

  it("rejects non-positive and fractional slot identities" /** Verifies slot validation. @returns Nothing. */, () => {
    expect(
      /** Creates a zero-slot request. @returns Invalid request. */ () => new SfxRequest(0),
    ).toThrow("SfxRequest slot is invalid.");
    expect(
      /** Creates a fractional-slot request. @returns Invalid request. */ () => new SfxRequest(1.5),
    ).toThrow("SfxRequest slot is invalid.");
  });
});

it("retains original API bits,WhichId append replacement and Done argument-release semantics", /** Uses actual native items and original value contracts,not a fake itemset provider. @returns Nothing. */ () => {
  const request = new SfxRequest(55, [], SfxCallMode.API | SfxCallMode.RECORD),
    a = new SfxBoolItem(7, true),
    b = new SfxBoolItem(8, false);
  expect(request.IsAPI()).toBe(true);
  expect(new SfxRequest(55).IsAPI()).toBe(false);
  request.AppendItem(a);
  request.AppendItem(b);
  request.AppendItem(new SfxBoolItem(7, false));
  expect(
    request
      .GetArgs()
      .map(
        /** Reads actual source WhichIds. @param item - Native argument. @returns Identity. */ (
          item,
        ) => item.Which(),
      ),
  ).toEqual([7, 8]);
  expect((request.GetArgs()[0] as SfxBoolItem).GetValue()).toBe(false);
  request.RemoveItem(7);
  expect(request.GetArgs()).toHaveLength(1);
  request.Done();
  expect(request.GetArgs()).toHaveLength(1);
  request.Done(true);
  expect(request.GetArgs()).toEqual([]);
  expect(request.IsDone()).toBe(true);
});
