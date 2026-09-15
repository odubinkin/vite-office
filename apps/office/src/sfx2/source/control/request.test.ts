/** @fileoverview Verifies the bounded SfxRequest argument, payload, and completion contract. */

import { describe, expect, it } from "vitest";

import { SfxBoolItem, SfxStringItem, SfxUnoAnyItem } from "../../../svl/source/items/poolitem";
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
    request.Done(result);
    expect(request.IsDone()).toBe(true);
    expect(request.GetReturnValue()).toBe(result);
  });

  it("carries structured UNO arguments in SfxUnoAnyItem", /** Verifies Any cloning and identity semantics. @returns Nothing. */ () => {
    const value = { Name: "CharFontName", Value: "Noto Serif" };
    const item = new SfxUnoAnyItem(55, value);
    expect(item.GetValue()).toBe(value);
    expect(item.QueryValue()).toBe(value);
    expect(item.Clone()).not.toBe(item);
    expect(item.Clone().equals(item)).toBe(true);
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
