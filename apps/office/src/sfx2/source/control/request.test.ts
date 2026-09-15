/** @fileoverview Verifies the bounded SfxRequest argument, payload, and completion contract. */

import { describe, expect, it } from "vitest";

import { SfxBoolItem, SfxStringItem } from "../../../svl/source/items/poolitem";
import { SfxRequest } from "./request";

describe("SfxRequest", /** Exercises request lifecycle and validation. @returns Nothing. */ () => {
  it("retains slot arguments and browser payload and records a return item" /** Verifies request accessors and completion. @returns Nothing. */, () => {
    const argument = new SfxStringItem(7, "value");
    const request = new SfxRequest(55, [argument], { source: "browser" });
    expect(request.GetSlot()).toBe(55);
    expect(request.GetArgs()).toEqual([argument]);
    expect(request.GetBrowserPayload()).toEqual({ source: "browser" });
    expect(request.IsDone()).toBe(false);
    expect(request.GetReturnValue()).toBeUndefined();
    const result = new SfxBoolItem(55, true);
    request.Done(result);
    expect(request.IsDone()).toBe(true);
    expect(request.GetReturnValue()).toBe(result);
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
