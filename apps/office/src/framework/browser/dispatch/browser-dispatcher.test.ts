/** @fileoverview Verifies browser-owned Promise observation around Sfx request execution. */

import { describe, expect, it } from "vitest";

import { SfxInterface } from "../../../sfx2/source/control/objface";
import { SfxRequest } from "../../../sfx2/source/control/request";
import { createSfxShell } from "../../../sfx2/source/control/shell";
import { SfxStringItem } from "../../../svl/source/items/poolitem";
import { BrowserSfxDispatcher } from "./browser-dispatcher";

describe("BrowserSfxDispatcher", /** Defines browser dispatch tests. @returns Nothing. */ () => {
  it("publishes pending, fulfillment, and normalized failure state", /** Verifies browser operation state. @returns Completion. */ async () => {
    const dispatcher = new BrowserSfxDispatcher();
    dispatcher.Push(
      createSfxShell(
        {},
        new SfxInterface([
          {
            commandUrl: ".uno:Success",
            execute: /** Resolves a result. @returns Result promise. */ async () => "done",
            label: "Success",
            slotId: 1,
          },
          {
            commandUrl: ".uno:Failure",
            execute: /** Rejects with a coded error. @returns Rejected promise. */ async () =>
              Promise.reject(Object.assign(new Error("Denied"), { code: "denied" })),
            label: "Failure",
            slotId: 2,
          },
          {
            commandUrl: ".uno:StringFailure",
            execute: /** Rejects with text. @returns Rejected promise. */ async () =>
              Promise.reject("String denied"),
            label: "String failure",
            slotId: 3,
          },
          {
            commandUrl: ".uno:Sync",
            execute: /** Returns synchronously. @returns True. */ () => true,
            label: "Sync",
            slotId: 4,
          },
          {
            commandUrl: ".uno:NumericCodeFailure",
            execute: /** Rejects with numeric code. @returns Rejected promise. */ async () =>
              Promise.reject({ code: 3, message: "numeric" }),
            label: "Numeric code failure",
            slotId: 6,
          },
          {
            commandUrl: ".uno:BlankCodeFailure",
            execute: /** Rejects with blank code. @returns Rejected promise. */ async () =>
              Promise.reject({ code: " ", message: "blank" }),
            label: "Blank code failure",
            slotId: 7,
          },
        ]),
      ),
    );
    const successRequest = new SfxRequest(1);
    const success = dispatcher.ExecuteRequest(successRequest);
    expect(dispatcher.QueryState(".uno:Success")).toMatchObject({ enabled: true, pending: true });
    if (success.status !== "executed") throw new Error("Expected success execution");
    await success.value;
    expect(successRequest.GetReturnValue()).toEqual(new SfxStringItem(1, "done"));
    expect(dispatcher.QueryState(".uno:Success")).toEqual({ enabled: true });

    const failureRequest = new SfxRequest(2);
    const failure = dispatcher.ExecuteRequest(failureRequest);
    if (failure.status !== "executed") throw new Error("Expected failure execution");
    await failure.value;
    expect(failureRequest.IsDone()).toBe(true);
    expect(dispatcher.QueryState(".uno:Failure")).toEqual({ enabled: true, error: "Denied" });
    expect(dispatcher.GetLastCommandError()).toEqual({
      code: "denied",
      commandId: ".uno:Failure",
      error: "Denied",
    });

    const stringFailure = dispatcher.Execute(".uno:StringFailure");
    if (stringFailure.status !== "executed") throw new Error("Expected string failure execution");
    await stringFailure.value;
    expect(dispatcher.GetLastCommandError()).toEqual({
      commandId: ".uno:StringFailure",
      error: "String denied",
    });
    expect(dispatcher.Execute(".uno:Sync").status).toBe("executed");
    for (const commandUrl of [".uno:NumericCodeFailure", ".uno:BlankCodeFailure"]) {
      const result = dispatcher.Execute(commandUrl);
      if (result.status !== "executed") throw new Error("Expected code failure execution");
      await result.value;
      expect(dispatcher.GetLastCommandError()).not.toHaveProperty("code");
    }
  });

  it("keeps overlapping operation state on the latest generation", /** Verifies overlapping requests. @returns Completion. */ async () => {
    const completions: Array<{
      readonly promise: Promise<string>;
      readonly reject: (error: Error) => void;
      readonly resolve: (value: string) => void;
    }> = [];
    const dispatcher = new BrowserSfxDispatcher();
    dispatcher.Push(
      createSfxShell(
        {},
        new SfxInterface([
          {
            commandUrl: ".uno:Overlap",
            execute: /** Creates a controlled promise. @returns Pending promise. */ () => {
              let reject!: (error: Error) => void;
              let resolve!: (value: string) => void;
              const promise = new Promise<string>(
                /** Captures completion callbacks. @param resolvePromise - Resolver. @param rejectPromise - Rejecter. @returns Nothing. */ (
                  resolvePromise,
                  rejectPromise,
                ) => {
                  resolve = resolvePromise;
                  reject = rejectPromise;
                },
              );
              completions.push({ promise, reject, resolve });
              return promise;
            },
            label: "Overlap",
            slotId: 5,
          },
        ]),
      ),
    );
    const oldRequest = new SfxRequest(5);
    const oldResult = dispatcher.ExecuteRequest(oldRequest);
    const newRequest = new SfxRequest(5);
    const newResult = dispatcher.ExecuteRequest(newRequest);
    completions[0]?.resolve("old");
    if (oldResult.status !== "executed") throw new Error("Expected old execution");
    await oldResult.value;
    expect(dispatcher.QueryState(".uno:Overlap")).toMatchObject({ pending: true });
    completions[1]?.resolve("new");
    if (newResult.status !== "executed") throw new Error("Expected new execution");
    await newResult.value;
    expect(dispatcher.QueryState(".uno:Overlap")).toEqual({ enabled: true });

    const staleResult = dispatcher.ExecuteRequest(new SfxRequest(5));
    const latestResult = dispatcher.ExecuteRequest(new SfxRequest(5));
    completions[3]?.resolve("latest");
    if (latestResult.status !== "executed") throw new Error("Expected latest execution");
    await latestResult.value;
    completions[2]?.reject(new Error("stale"));
    if (staleResult.status !== "executed") throw new Error("Expected stale execution");
    await staleResult.value;
    expect(dispatcher.QueryState(".uno:Overlap")).toEqual({ enabled: true });
    expect(dispatcher.GetLastCommandError()).toBeUndefined();
  });
});
