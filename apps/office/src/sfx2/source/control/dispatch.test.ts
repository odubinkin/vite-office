/** @fileoverview Verifies bounded SfxSlot, SfxInterface, SfxShell, and dispatcher behavior. */

import { describe, expect, it, vi } from "vitest";

import { SfxBoolItem, SfxInt16Item, SfxStringItem } from "../../../svl/source/items/poolitem";
import { SfxDispatcher } from "./dispatch";
import { SfxInterface } from "./objface";
import { SfxRequest } from "./request";
import { createSfxShell, type SfxShell } from "./shell";
import { SfxViewFrame } from "../view/viewfrm";

/** Context retained by representative test shells. */
interface Context {
  readonly enabled: boolean;
  readonly name: string;
}

/** Creates a representative generated interface. @param prefix - Command prefix. @returns Interface. */
function createInterface(prefix = "shared"): SfxInterface<Context> {
  return new SfxInterface([
    {
      commandUrl: `${prefix}.greet`,
      execute: /** Greets the context. @param context - Shell context. @returns Greeting. */ (
        context,
      ) => `Hello ${context.name}`,
      getState: /** Reads greeting state. @param context - Shell context. @returns Slot state. */ (
        context,
      ) => ({ checked: true, enabled: true, value: context.name }),
      label: "Greet",
      shortcuts: ["Ctrl+Shift+G", "Meta+G"],
      slotId: 101,
    },
    {
      commandUrl: `${prefix}.save`,
      execute: /** Saves the context. @param context - Shell context. @returns Result. */ (
        context,
      ) => `Saved ${context.name}`,
      getState: /** Reads save state. @param context - Shell context. @returns Slot state. */ (
        context,
      ) => ({ enabled: context.enabled }),
      label: "Save",
      shortcuts: ["Meta+S"],
      slotId: 102,
    },
  ]);
}

describe("Sfx slot interfaces", /** Defines interface tests. @returns Nothing. */ () => {
  it("resolves immutable generated slots by command and numeric identity", /** Verifies lookup. @returns Nothing. */ () => {
    const sfxInterface = createInterface();
    const context = { enabled: true, name: "Ada" };
    const slot = sfxInterface.GetSlot("shared.greet");
    expect(sfxInterface.GetSlots()).toHaveLength(2);
    expect(sfxInterface.GetSlot(101)).toBe(slot);
    expect(sfxInterface.GetSlot(999)).toBeUndefined();
    expect(sfxInterface.GetSlot("missing")).toBeUndefined();
    expect(slot).toMatchObject({
      commandUrl: "shared.greet",
      id: "shared.greet",
      label: "Greet",
      shortcut: "Ctrl+Shift+G",
      shortcuts: ["Ctrl+Shift+G", "Meta+G"],
      slotId: 101,
    });
    expect(slot?.Execute(context, new SfxRequest(101))).toBe("Hello Ada");
    expect(slot?.GetState(context)).toEqual({ checked: true, enabled: true, value: "Ada" });
  });

  it("rejects invalid and colliding generated metadata", /** Verifies validation. @returns Nothing. */ () => {
    const valid = {
      commandUrl: ".uno:Valid",
      execute: /** Returns nothing. @returns Nothing. */ (): void => undefined,
      label: "Valid",
      slotId: 1,
    };
    expect(
      /** Registers a blank command. @returns Invalid interface. */ () =>
        new SfxInterface([{ ...valid, commandUrl: " " }]),
    ).toThrow("Command id");
    expect(
      /** Registers a blank label. @returns Invalid interface. */ () =>
        new SfxInterface([{ ...valid, label: " " }]),
    ).toThrow("Command label");
    expect(
      /** Registers an invalid slot. @returns Invalid interface. */ () =>
        new SfxInterface([{ ...valid, slotId: 0 }]),
    ).toThrow("slot id is invalid");
    expect(
      /** Registers duplicate commands. @returns Invalid interface. */ () =>
        new SfxInterface([valid, { ...valid, slotId: 2 }]),
    ).toThrow("Duplicate command id");
    expect(
      /** Registers duplicate slots. @returns Invalid interface. */ () =>
        new SfxInterface([valid, { ...valid, commandUrl: ".uno:Other" }]),
    ).toThrow("Duplicate command slot id");
    expect(
      /** Registers duplicate shortcuts. @returns Invalid interface. */ () =>
        new SfxInterface([
          { ...valid, shortcuts: ["Ctrl+K"] },
          { ...valid, commandUrl: ".uno:Other", shortcuts: ["Ctrl+K"], slotId: 2 },
        ]),
    ).toThrow("Duplicate command shortcut");
    expect(
      /** Registers a blank shortcut. @returns Invalid interface. */ () =>
        new SfxInterface([{ ...valid, shortcuts: [" "] }]),
    ).toThrow("Command shortcut");
    expect(
      /** Registers a blank label key. @returns Invalid interface. */ () =>
        new SfxInterface([
          {
            ...valid,
            presentation: {
              labelKey: " ",
              placements: [],
              semantics: "action" as const,
              stateType: "none" as const,
            },
          },
        ]),
    ).toThrow("Command label key");
    expect(
      /** Registers invalid check state. @returns Invalid interface. */ () =>
        new SfxInterface([
          {
            ...valid,
            presentation: {
              labelKey: "valid",
              placements: [],
              semantics: "check" as const,
              stateType: "none" as const,
            },
          },
        ]),
    ).toThrow("Check commands require boolean state");
    expect(
      /** Registers invalid radio state. @returns Invalid interface. */ () =>
        new SfxInterface([
          {
            ...valid,
            presentation: {
              labelKey: "valid",
              placements: [],
              semantics: "radio" as const,
              stateType: "none" as const,
            },
          },
        ]),
    ).toThrow("Radio commands require boolean or value state");
    expect(
      /** Registers a blank placement. @returns Invalid interface. */ () =>
        new SfxInterface([
          {
            ...valid,
            presentation: {
              argumentSchema: { description: " " },
              labelKey: "valid",
              placements: [" "],
              semantics: "action" as const,
              stateType: "none" as const,
            },
          },
        ]),
    ).toThrow("Command placement");
    expect(
      /** Registers a blank argument description. @returns Invalid interface. */ () =>
        new SfxInterface([
          {
            ...valid,
            presentation: {
              argumentSchema: { description: " " },
              labelKey: "valid",
              placements: [],
              semantics: "action" as const,
              stateType: "none" as const,
            },
          },
        ]),
    ).toThrow("argument schema description");
    expect(
      new SfxInterface([
        {
          ...valid,
          presentation: {
            argumentSchema: { description: "Argument" },
            labelKey: "valid",
            placements: [],
            semantics: "action" as const,
            stateType: "none" as const,
          },
        },
        {
          ...valid,
          commandUrl: ".uno:WithoutArguments",
          presentation: {
            labelKey: "without.arguments",
            placements: [],
            semantics: "action" as const,
            stateType: "none" as const,
          },
          slotId: 2,
        },
      ]).GetSlots(),
    ).toHaveLength(2);
  });
});

describe("SfxDispatcher", /** Defines dispatcher tests. @returns Nothing. */ () => {
  it("resolves the top shell, state, shortcuts, invalidation, and frame ownership", /** Verifies stack behavior. @returns Nothing. */ () => {
    const dispatcher = new SfxDispatcher();
    const lower = createSfxShell({ enabled: true, name: "Lower" }, createInterface());
    const upper = createSfxShell({ enabled: false, name: "Upper" }, createInterface());
    const listener = vi.fn();
    const unsubscribe = dispatcher.Subscribe(listener);
    dispatcher.Push(lower);
    dispatcher.Push(upper);
    expect(dispatcher.GetShell(0)).toBe(upper);
    expect(dispatcher.GetShell(1)).toBe(lower);
    expect(dispatcher.GetShell(2)).toBeUndefined();
    expect(dispatcher.QueryDispatch("shared.greet")?.slot.label).toBe("Greet");
    expect(dispatcher.QuerySlot(101)?.slot.commandUrl).toBe("shared.greet");
    expect(dispatcher.Execute("shared.greet")).toMatchObject({ value: "Hello Upper" });
    expect(dispatcher.Execute("shared.save")).toEqual({
      commandId: "shared.save",
      status: "disabled",
    });
    expect(dispatcher.Execute("missing")).toEqual({ commandId: "missing", status: "missing" });
    expect(dispatcher.QueryState("shared.greet")).toEqual({
      checked: true,
      enabled: true,
      value: "Upper",
    });
    expect(dispatcher.QueryState("missing")).toEqual({ enabled: false });
    expect(dispatcher.QuerySlotState(101)).toMatchObject({ enabled: true });
    expect(dispatcher.QuerySlotState(999)).toEqual({ enabled: false });
    expect(dispatcher.FindCommandByShortcut("Ctrl+Shift+G")?.slot.commandUrl).toBe("shared.greet");
    expect(dispatcher.FindCommandByShortcut("Alt+X")).toBeUndefined();
    expect(
      dispatcher
        .GetSlots()
        .map(
          /** Projects one command URL. @param slot - Active slot. @returns URL. */ (slot) =>
            slot.commandUrl,
        ),
    ).toEqual(["shared.greet", "shared.save"]);
    expect(dispatcher.GetCommands()).toEqual(dispatcher.GetSlots());
    expect(/** Pushes a duplicate shell. @returns Nothing. */ () => dispatcher.Push(upper)).toThrow(
      "already active",
    );
    expect(
      /** Invalidates without a dependency. @returns Nothing. */ () => dispatcher.Invalidate(),
    ).toThrow("requires a dependency");
    dispatcher.Pop(upper);
    expect(dispatcher.Execute("shared.greet")).toMatchObject({ value: "Hello Lower" });
    dispatcher.Pop(upper);
    unsubscribe();
    dispatcher.Invalidate("document");
    expect(listener).toHaveBeenCalledTimes(3);
    expect(dispatcher.GetVersion()).toBe(4);
    expect(dispatcher.GetLastCommandError()).toBeUndefined();

    const frame = new SfxViewFrame<string>(dispatcher);
    frame.SetActiveView("first", [upper]);
    expect(frame.GetActiveView()).toBe("first");
    expect(frame.GetBindings().QueryState("shared.greet")).toMatchObject({ value: "Upper" });
    frame.CloseView();
    expect(frame.GetActiveView()).toBeUndefined();
  });

  it("executes request items and completes bounded synchronous results", /** Verifies request completion. @returns Nothing. */ () => {
    const captured: unknown[] = [];
    const sfxInterface = new SfxInterface<Record<string, never>>([
      {
        commandUrl: ".uno:Boolean",
        execute:
          /** Captures arguments. @param _context - Context. @param request - Request. @returns True. */ (
            _context,
            request,
          ) => {
            captured.push(request.GetArgs());
            return true;
          },
        label: "Boolean",
        slotId: 201,
      },
      {
        commandUrl: ".uno:String",
        execute: /** Returns text. @returns Text. */ () => "done",
        label: "String",
        slotId: 202,
      },
      {
        commandUrl: ".uno:Number",
        execute: /** Returns number. @returns Number. */ () => 12,
        label: "Number",
        slotId: 203,
      },
      {
        commandUrl: ".uno:Complex",
        execute: /** Returns object. @returns Object. */ () => ({ ok: true }),
        label: "Complex",
        slotId: 204,
      },
    ]);
    const dispatcher = new SfxDispatcher();
    dispatcher.Push(createSfxShell({}, sfxInterface));
    const argument = new SfxStringItem(9, "argument");
    const boolRequest = new SfxRequest(201, [argument]);
    expect(dispatcher.ExecuteRequest(boolRequest).status).toBe("executed");
    expect(boolRequest.GetReturnValue()).toEqual(new SfxBoolItem(201, true));
    dispatcher.Execute(".uno:Boolean", [argument]);
    dispatcher.Execute(".uno:Boolean", true);
    dispatcher.Execute(".uno:Boolean", "value");
    dispatcher.Execute(".uno:Boolean", 7);
    dispatcher.Execute(".uno:Boolean", { Name: "Value" });
    dispatcher.Execute(".uno:Boolean?Name:string=Value");
    dispatcher.Execute(".uno:Boolean?ignored");
    expect(captured).toHaveLength(8);
    const stringRequest = new SfxRequest(202);
    dispatcher.ExecuteRequest(stringRequest);
    expect(stringRequest.GetReturnValue()).toEqual(new SfxStringItem(202, "done"));
    const numberRequest = new SfxRequest(203);
    dispatcher.ExecuteRequest(numberRequest);
    expect(numberRequest.GetReturnValue()).toEqual(new SfxInt16Item(203, 12));
    const complexRequest = new SfxRequest(204);
    dispatcher.ExecuteRequest(complexRequest);
    expect(complexRequest.IsDone()).toBe(true);
    expect(complexRequest.GetReturnValue()).toBeUndefined();
    expect(dispatcher.ExecuteRequest(new SfxRequest(999))).toEqual({
      commandId: "slot:999",
      status: "missing",
    });
    expect(
      /** Executes a mismatched request. @returns Result. */ () =>
        dispatcher.QuerySlot(201)?.execute(new SfxRequest(202)),
    ).toThrow("slot does not match");
  });

  it("derives parameterized style state from the base generated slot", /** Verifies parameter state. @returns Nothing. */ () => {
    const dispatcher = new SfxDispatcher();
    dispatcher.Push(
      createSfxShell(
        {},
        new SfxInterface([
          {
            commandUrl: ".uno:StyleApply",
            execute: /** Returns nothing. @returns Nothing. */ (): void => undefined,
            getState: /** Returns style state. @returns Slot state. */ () => ({
              enabled: true,
              value: "heading-1",
            }),
            label: "Style",
            slotId: 301,
          },
        ]),
      ),
    );
    expect(dispatcher.QueryState(".uno:StyleApply?Style:string=Heading%201").checked).toBe(true);
    expect(
      dispatcher.QueryState(".uno:StyleApply?Style:string=Default%20Paragraph%20Style").checked,
    ).toBe(false);
  });

  it("leaves Promise observation outside core dispatch", /** Verifies async boundary. @returns Completion. */ async () => {
    const dispatcher = new SfxDispatcher();
    dispatcher.Push(
      createSfxShell(
        {},
        new SfxInterface([
          {
            commandUrl: ".uno:Async",
            execute: /** Resolves text. @returns Text promise. */ async () => "done",
            label: "Async",
            slotId: 401,
          },
        ]),
      ),
    );
    const request = new SfxRequest(401);
    const result = dispatcher.ExecuteRequest(request);
    if (result.status !== "executed") throw new Error("Expected execution");
    await result.value;
    expect(request.IsDone()).toBe(false);
  });

  it("tolerates an interface slot that a shell declines to resolve", /** Verifies sparse shell. @returns Nothing. */ () => {
    const slotInterface = createInterface();
    const sparseShell: SfxShell = {
      GetInterface: /** Returns interface. @returns Interface. */ () =>
        slotInterface as SfxInterface<unknown>,
      ResolveSlot: /** Declines resolution. @returns Undefined. */ () => undefined,
    };
    const dispatcher = new SfxDispatcher();
    dispatcher.Push(sparseShell);
    expect(dispatcher.GetSlots()).toHaveLength(2);
    expect(dispatcher.QuerySlot(101)).toBeUndefined();
  });
});
