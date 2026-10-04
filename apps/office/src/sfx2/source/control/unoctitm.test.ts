/** @fileoverview Checks explicit native key metadata through real Sfx request and dispatch owners. */
import { describe, expect, it } from "vitest";
import { SfxStringItem } from "../../../svl/source/items/stritem";
import { SfxUnoAnyItem } from "../view/frame";
import { KEY_SHIFT, KEY_MOD1, KEY_MOD2, KEY_MOD3 } from "../../../vcl/keycodes";
import { SfxDispatcher } from "./dispatch";
import { SfxInterface } from "./objface";
import { SfxRequest } from "./request";
import { createSfxShell } from "./shell";
import { createUnoDispatchRequest } from "./unoctitm";

describe("explicit UNO key modifiers", /** Defines real request contracts. @returns Nothing. */ () => {
  it("retains native zero and unsigned mask independently of arguments and completion", /** Checks source numeric defaults and independent request ownership. @returns Nothing. */ () => {
    expect([KEY_SHIFT, KEY_MOD1, KEY_MOD2, KEY_MOD3]).toEqual([4096, 8192, 16384, 32768]);
    const item = new SfxStringItem(5552, "Owned"),
      request = new SfxRequest(5552, [item]);
    expect(request.GetModifier()).toBe(0);
    request.SetModifier(65535);
    request.Done(new SfxStringItem(5552, "done"));
    expect(request.GetModifier()).toBe(65535);
    expect(request.GetArgs()).toEqual([item]);
    expect(request.GetArgs()[0]).toBe(item);
    expect(request.GetReturnValue()?.QueryValue()).toBe("done");
    request.SetModifier(0);
    expect(request.GetModifier()).toBe(0);
  });

  it.each([0, 4096, 8192, 12288, 16384, 32768, 65535])(
    "filters explicit mask %s without mutating or forwarding metadata",
    /** Checks unsigned UNO extraction and item separation. @param modifier - Independent numeric fixture. @returns Nothing. */
    (modifier) => {
      const input = Object.freeze({ Template: "Owned", Family: 2, KeyModifier: modifier });
      const request = createUnoDispatchRequest(5552, input);
      expect(request.GetModifier()).toBe(modifier);
      expect((request.GetArgs()[0] as SfxUnoAnyItem).GetValue()).toEqual({
        Template: "Owned",
        Family: 2,
      });
      expect(input.KeyModifier).toBe(modifier);
      expect(createUnoDispatchRequest(5552, { KeyModifier: modifier }).GetArgs()).toEqual([]);
    },
  );

  it.each([undefined, null, "8192", true, -1, 65536, 8192.5, NaN, Infinity])(
    "filters invalid explicit metadata %s and keeps native zero",
    /** Checks failed unsigned extraction without aliasing the key into slot arguments. @param modifier - Invalid input. @returns Nothing. */
    (modifier) => {
      const request = createUnoDispatchRequest(5552, { Template: "Owned", KeyModifier: modifier });
      expect(request.GetModifier()).toBe(0);
      expect((request.GetArgs()[0] as SfxUnoAnyItem).GetValue()).toEqual({ Template: "Owned" });
      expect(createUnoDispatchRequest(5552, { KeyModifier: modifier }).GetArgs()).toEqual([]);
    },
  );

  it("preserves primitive, null, object and pooled-item payloads without key metadata", /** Checks existing bounded argument contracts. @returns Nothing. */ () => {
    const item = new SfxStringItem(5552, "Owned");
    expect(createUnoDispatchRequest(5552, [item]).GetArgs()[0]).toBe(item);
    for (const value of [undefined, null, false, "Owned", 7, { Template: "Owned" }]) {
      const request = createUnoDispatchRequest(5552, value);
      expect(request.GetModifier()).toBe(0);
      expect(request.GetArgs().length).toBe(value === undefined ? 0 : 1);
    }
  });

  it("passes explicit metadata through real dispatch but leaves URL parameters in the URL argument channel", /** Checks source boundary and caller-owned request execution. @returns Nothing. */ () => {
    const captured: SfxRequest[] = [],
      dispatcher = new SfxDispatcher();
    dispatcher.Push(
      createSfxShell(
        {},
        new SfxInterface([
          {
            commandUrl: ".uno:StyleApply",
            label: "Style",
            slotId: 5552,
            execute:
              /** Captures the actual request. @param _owner - Owner. @param request - Request. @returns Success. */ (
                _owner,
                request,
              ) => {
                captured.push(request);
                return true;
              },
          },
        ]),
      ),
    );
    dispatcher.Execute(".uno:StyleApply", { Template: "Owned", KeyModifier: 8192 });
    dispatcher.Execute(".uno:StyleApply?Template:string=Owned&KeyModifier:short=8192");
    const direct = new SfxRequest(5552, [new SfxStringItem(5552, "Owned")]);
    direct.SetModifier(12288);
    dispatcher.ExecuteRequest(direct);
    expect(
      captured.map(
        /** Reads actual key metadata. @param request - Captured request. @returns Key mask. */ (
          request,
        ) => request.GetModifier(),
      ),
    ).toEqual([8192, 0, 12288]);
    expect((captured[0]?.GetArgs()[0] as SfxUnoAnyItem).GetValue()).toEqual({ Template: "Owned" });
    expect((captured[1]?.GetArgs()[0] as SfxUnoAnyItem).GetValue()).toEqual({
      Template: "Owned",
      KeyModifier: "8192",
    });
    expect(captured[2]).toBe(direct);
    expect(direct.IsDone()).toBe(true);
  });
});
