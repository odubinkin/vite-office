/** @fileoverview Shared Writer font controls over real Writer Sfx owners and platform font-list lifetime. */
import { FieldUnit } from "../../../tools/inc/fldunit";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  FontNameSelect as FontNameWidget,
  FontSizeSelect as FontSizeWidget,
} from "../../../svx/browser/tbxctrls/FontSelects";
import type { ComponentProps } from "react";
import { CommandSelectControl } from "../../../framework/browser/presentation/CommandSelectControl";
import type { BrowserCommandSurfaceProps } from "../../../framework/browser/presentation/command-surface";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { createWriterDocumentSession } from "../../../sw/browser/composition/writer-module";
import { getWriterCommandResource } from "../../../sw/uiconfig/swriter/writer-command-resources";
import { FontList } from "../../../svtools/browser/font-list";
import { WriterFormattingToolbar } from "./WriterFormattingToolbar";
import { createBrowserFontItem } from "../../../svx/browser/tbxctrls/font-item";
/** Actual frame/controller ports used by the original Writer font widgets. */
type ControlPorts = BrowserCommandSurfaceProps &
  Readonly<{ commandId: string; getCommandResource: typeof getWriterCommandResource }>;
/** Composes the same actual shared family widget/controller as Writer. @param props - Actual frame and widget ports. @returns Bound widget. */
function FontNameSelect({
  commandSource,
  commandId,
  getCommandResource,
  resolveArguments,
  ...widget
}: ControlPorts & Omit<ComponentProps<typeof FontNameWidget>, "value" | "enabled" | "onSelect">) {
  return (
    <CommandSelectControl
      commandSource={commandSource}
      commandId={commandId}
      getCommandResource={getCommandResource}
      resolveArguments={resolveArguments}
      argumentName="fontFamily"
    >
      {
        /** Injects native binding. @param binding - Actual frame state. @returns Widget. */ (
          binding,
        ) => <FontNameWidget {...binding} {...widget} />
      }
    </CommandSelectControl>
  );
}
/** Composes the same actual shared size widget/controller as Writer. @param props - Actual frame and widget ports. @returns Bound widget. */
function FontSizeSelect({
  commandSource,
  commandId,
  getCommandResource,
  resolveArguments,
  ...widget
}: ControlPorts & Omit<ComponentProps<typeof FontSizeWidget>, "value" | "enabled" | "onSelect">) {
  return (
    <CommandSelectControl
      commandSource={commandSource}
      commandId={commandId}
      getCommandResource={getCommandResource}
      resolveArguments={resolveArguments}
      argumentName="fontSizePt"
    >
      {
        /** Injects native binding. @param binding - Actual frame state. @returns Widget. */ (
          binding,
        ) => <FontSizeWidget {...binding} {...widget} />
      }
    </CommandSelectControl>
  );
}
afterEach(
  /** Releases actual presenter clients and platform spies. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
  },
);
it("dispatches Writer family and nonstandard sizes through real bindings and preserves argument objects", /** Exercises shared extracted controls on their original actual Writer owner. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    source = createBrowserCommandSource(session.view.GetViewFrame());
  const execute = vi.spyOn(source, "Execute");
  vi.spyOn(FontList, "FromBrowser").mockResolvedValue(
    new FontList(["Liberation Serif", "Liberation Sans"]),
  );
  try {
    source.Execute(".uno:FontHeight", { fontSizePt: 13.3 });
    render(
      <>
        <FontNameSelect
          commandId=".uno:CharFontName"
          commandSource={source}
          getCommandResource={getWriterCommandResource}
          label="Shared family"
          resolveArguments={
            /** Supplies actual browser arguments. @returns Argument object. */ () => ({
              from: "shared",
            })
          }
        />
        <FontSizeSelect
          commandId=".uno:FontHeight"
          commandSource={source}
          getCommandResource={getWriterCommandResource}
          label="Shared size"
          resolveArguments={/** Supplies a nonobject browser result. @returns Scalar. */ () => 7}
        />
      </>,
    );
    await act(
      /** Publishes platform font inventory. @returns Completion. */ async () => {
        await Promise.resolve();
      },
    );
    expect(screen.getByRole("combobox", { name: "Shared size" })).toHaveValue("13.3 pt");
    fireEvent.click(screen.getByRole("button", { name: "Show Shared size" }));
    expect(screen.queryByRole("option", { name: "13.3 pt" })).toBeNull();
    expect(
      within(screen.getByRole("listbox", { name: "Shared size" })).getAllByRole("option"),
    ).toHaveLength(32);
    fireEvent.click(screen.getByRole("button", { name: "Show Shared size" }));
    fireEvent.change(screen.getByRole("combobox", { name: "Shared family" }), {
      target: { value: "Liberation Sans" },
    });
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Shared family" }), { key: "Enter" });
    expect(execute).toHaveBeenLastCalledWith(".uno:CharFontName", {
      from: "shared",
      fontFamily: createBrowserFontItem("Liberation Sans"),
    });
    expect(session.view.GetViewFrame().GetBindings().QueryState(".uno:CharFontName").value).toBe(
      "Liberation Sans",
    );
    fireEvent.change(screen.getByRole("combobox", { name: "Shared size" }), {
      target: { value: "14" },
    });
    fireEvent.keyDown(screen.getByRole("combobox", { name: "Shared size" }), { key: "Tab" });
    expect(execute).toHaveBeenLastCalledWith(".uno:FontHeight", { fontSizePt: 14 });
    expect(session.view.GetViewFrame().GetBindings().QueryState(".uno:FontHeight").value).toBe(14);
  } finally {
    cleanup();
    session.Close();
  }
});
it("retains embedded font presentation and caller-owned fallback messages without stale font-list publication", /** Tests actual selected state and platform lifecycle rather than document substitutes. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    source = createBrowserCommandSource(session.view.GetViewFrame());
  let loaded: (value: FontList) => void = /** Initial fixture assignment. @returns Nothing. */ () =>
    undefined;
  vi.spyOn(FontList, "FromBrowser").mockImplementation(
    /** Defers real platform inventory. @returns Inventory promise. */ () =>
      new Promise<FontList>(
        /** Captures completion. @param resolve - Promise resolver. @returns Nothing. */ (
          resolve,
        ) => {
          loaded = resolve;
        },
      ),
  );
  try {
    source.Execute(".uno:CharFontName", { fontFamily: "Embedded Fixture" });
    const props = {
      commandId: ".uno:CharFontName",
      commandSource: source,
      getCommandResource: getWriterCommandResource,
      label: "Shared family",
      resolveArguments: /** Supplies nonobject arguments. @returns Undefined. */ () => undefined,
      embeddedFontFamilies: ["Embedded Fixture"],
      fontAvailability: { "Embedded Fixture": false },
    };
    const mounted = render(
      <FontNameSelect {...props} unavailableFontMessage="Caller font fallback" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Caller font fallback");
    mounted.rerender(<FontNameSelect {...props} />);
    expect(screen.queryByRole("status")).toBeNull();
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Liberation Serif" } });
    expect(source.QueryCommand(".uno:CharFontName")).toBeDefined();
    expect(source.QueryCommand(".uno:Missing")).toBeUndefined();
    mounted.unmount();
    await act(
      /** Resolves after cleanup. @returns Completion. */ async () => {
        loaded(new FontList(["Late family"]));
        await Promise.resolve();
      },
    );
  } finally {
    cleanup();
    session.Close();
  }
});
it("preserves size-control object argument augmentation through real Writer dispatch", /** Covers both browser argument forms with genuine document state. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    source = createBrowserCommandSource(session.view.GetViewFrame()),
    execute = vi.spyOn(source, "Execute");
  try {
    render(
      <FontSizeSelect
        commandSource={source}
        commandId=".uno:FontHeight"
        getCommandResource={getWriterCommandResource}
        label="Size"
        resolveArguments={
          /** Preserves caller fields. @returns Object. */ () => ({ origin: "writer" })
        }
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "18" } });
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    expect(execute).toHaveBeenLastCalledWith(".uno:FontHeight", {
      origin: "writer",
      fontSizePt: 18,
    });
  } finally {
    cleanup();
    session.Close();
  }
});

it("uses real font size toolbar binding when the host has no document focus port", /** Optional host focus cannot become a fabricated frame service. @returns Completion. */ async () => {
  const session = createWriterDocumentSession(),
    source = createBrowserCommandSource(session.view.GetViewFrame());
  try {
    render(
      <WriterFormattingToolbar
        unit={FieldUnit.CM}
        commandSource={source}
        paragraphStyleOptions={[]}
        resolveArguments={
          /** Supplies actual empty browser arguments. @returns Undefined. */ () => undefined
        }
      />,
    );
    await act(
      /** Flushes real platform font publication. @returns Completion. */ async () => {
        await Promise.resolve();
      },
    );
    const control = screen.getByRole("combobox", { name: "Font size" });
    fireEvent.change(control, { target: { value: "13.3" } });
    fireEvent.keyDown(control, { key: "Tab" });
    expect(session.view.GetViewFrame().GetBindings().QueryState(".uno:FontHeight").value).toBe(
      13.3,
    );
  } finally {
    cleanup();
    session.Close();
  }
});
