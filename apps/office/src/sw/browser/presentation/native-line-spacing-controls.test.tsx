/** @fileoverview Real frame-bound line-spacing popup, actual native items, immediate edits and preset closure. */
import { expect, it, vi } from "vitest";
import { ParaLineSpacingControl as NativePopup } from "../../../svx/browser/sidebar/paragraph/ParaLineSpacingControl";
import { SfxItemState } from "../../../svl/inc/itemset";
import { SfxInterface } from "../../../sfx2/source/control/objface";
import { createSfxShell } from "../../../sfx2/source/control/shell";
import { setConfiguredSystemLanguage } from "../../../i18nlangtag/source/isolang/mslangid";
import { SwPosition } from "../../source/core/crsr/pam";
import type { SwTextNode } from "../../source/core/txtnode/ndtxt";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { WriterLineSpacingControl } from "./WriterLineSpacingControl";
import { createWriterDocumentSession } from "../composition/writer-module";
import { createBrowserCommandSource } from "../../../framework/browser/presentation/command-surface";
import { getWriterCommandResource } from "../../uiconfig/swriter/writer-command-resources";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { SvxLineSpaceRule, SvxInterLineSpaceRule } from "../../../editeng/inc/svxenum";
import { SvxLineSpacingItem } from "../../../editeng/inc/lspcitem";
import { RES_PARATR_LINESPACING } from "../../inc/hintids";
it("uses actual eight native modes and keeps mode/value editing open while presets close", /** Real dispatch/history subscribers own formatting state. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    source = createBrowserCommandSource(session.view.GetViewFrame()),
    shell = session.view.GetWrtShell();
  const rendered = render(
    <WriterLineSpacingControl
      commandSource={source}
      getCommandResource={getWriterCommandResource}
      unit={FieldUnit.INCH}
    />,
  );
  try {
    fireEvent.click(screen.getByRole("button", { name: "Line Spacing" }));
    expect(screen.getAllByRole("option")).toHaveLength(8);
    expect(screen.getByRole("button", { name: "Spacing: 1" }).querySelector("img")).toHaveAttribute(
      "src",
    );
    expect(
      screen
        .getByRole("button", { name: "Spacing: 1.15" })
        .querySelector("img")
        ?.getAttribute("src"),
    ).toBe(
      screen.getByRole("button", { name: "Spacing: 1" }).querySelector("img")?.getAttribute("src"),
    );
    const mode = screen.getByRole("combobox", { name: "Line spacing mode" });
    fireEvent.change(mode, { target: { value: "7" } });
    const value = screen.getByRole("spinbutton", { name: "Line spacing value" });
    fireEvent.change(value, { target: { value: '0.5"' } });
    const item = shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem;
    expect(item.GetLineSpaceRule()).toBe(SvxLineSpaceRule.Fix);
    expect(item.GetLineHeight()).toBe(720);
    expect(screen.getByRole("dialog", { name: "Line Spacing" })).toBeInTheDocument();
    fireEvent.blur(value);
    expect(value).toHaveValue("0.50″");
    fireEvent.keyDown(value, { key: "ArrowUp" });
    expect(
      (
        shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
      ).GetLineHeight(),
    ).toBe(749);
    expect(
      fireEvent.mouseDown(screen.getByRole("button", { name: "Decrease line spacing value" })),
    ).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Decrease line spacing value" }));
    expect(
      (
        shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
      ).GetLineHeight(),
    ).toBe(720);
    fireEvent.click(screen.getByRole("button", { name: "Increase line spacing value" }));
    expect(
      (
        shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
      ).GetLineHeight(),
    ).toBe(749);
    fireEvent.keyDown(value, { key: "PageUp" });
    expect(value).toHaveValue("0.72″");
    fireEvent.keyDown(value, { key: "PageDown" });
    expect(value).toHaveValue("0.52″");
    fireEvent.keyDown(value, { key: "ArrowDown" });
    expect(value).toHaveValue("0.50″");
    fireEvent.change(value, { target: { value: "invalid" } });
    expect(
      (
        shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
      ).GetLineHeight(),
    ).toBe(720);
    fireEvent.blur(value);
    fireEvent.keyDown(value, { key: "a" });
    fireEvent.change(mode, { target: { value: "4" } });
    fireEvent.change(value, { target: { value: "137" } });
    expect(
      (
        shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
      ).GetPropLineSpace(),
    ).toBe(137);
    fireEvent.click(screen.getByRole("button", { name: "Spacing: 1" }));
    expect(screen.queryByRole("dialog", { name: "Line Spacing" })).toBeNull();
    expect(
      (
        shell.GetActiveParagraph().GetAttr(RES_PARATR_LINESPACING) as SvxLineSpacingItem
      ).GetInterLineSpaceRule(),
    ).toBe(SvxInterLineSpaceRule.Off);
    act(
      /** Restores through actual undo manager. @returns Nothing. */ () => {
        shell.Undo();
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "Line Spacing" }));
    expect(screen.getByRole("combobox", { name: "Line spacing mode" })).toHaveValue("4");
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Line Spacing" }), { key: "Escape" });
    expect(screen.queryByRole("dialog", { name: "Line Spacing" })).toBeNull();
  } finally {
    rendered.unmount();
    session.Close();
  }
});

it("presents original disabled and unknown item states without inventing a uniform value", /** Direct actual popup status ports exercise native empty/sensitive fields. @returns Nothing. */ () => {
  const dispatch = vi.fn(),
    close = vi.fn();
  const rendered = render(
    <NativePopup
      unit={FieldUnit.CM}
      state={SfxItemState.DISABLED}
      item={undefined}
      dispatch={dispatch}
      close={close}
    />,
  );
  expect(screen.getByRole("combobox", { name: "Line spacing mode" })).toBeDisabled();
  expect(screen.getByRole("spinbutton", { name: "Line spacing value" })).toHaveValue("");
  expect(screen.getByRole("button", { name: "Increase line spacing value" })).toBeDisabled();
  rendered.unmount();
  const unknown = render(
    <NativePopup
      unit={FieldUnit.NONE}
      state={SfxItemState.UNKNOWN}
      item={undefined}
      dispatch={dispatch}
      close={close}
    />,
  );
  try {
    const mode = screen.getByRole("combobox", { name: "Line spacing mode" });
    expect(mode).toHaveValue("-1");
    expect(mode).toHaveFocus();
    fireEvent.change(mode, { target: { value: "6" } });
    const input = screen.getByRole("spinbutton", { name: "Line spacing value" });
    expect(input).toHaveValue("283.00");
    fireEvent.change(input, { target: { value: "0" } });
    expect(input).toHaveAttribute("aria-valuenow", "0");
    fireEvent.change(mode, { target: { value: "0" } });
    expect(input).toBeDisabled();
    expect(input).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Spacing: 2" }));
    expect(close).toHaveBeenCalledOnce();
    expect((dispatch.mock.lastCall?.[0] as SvxLineSpacingItem).GetPropLineSpace()).toBe(200);
  } finally {
    unknown.unmount();
  }
});

it("projects real mixed selection state and current locale percent formatting", /** Actual Writer ranges and configured data-language fields drive the native popup. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    shell = session.view.GetWrtShell(),
    doc = shell.GetDoc();
  const rendered = render(
    <WriterLineSpacingControl
      commandSource={createBrowserCommandSource(session.view.GetViewFrame())}
      getCommandResource={getWriterCommandResource}
      unit={FieldUnit.CM}
    />,
  );
  try {
    const first = doc.paragraphs[0] as SwTextNode,
      second = doc.nodes.MakeTextNode("second"),
      a = new SvxLineSpacingItem(200, RES_PARATR_LINESPACING),
      b = a.Clone();
    b.SetPropLineSpace(150);
    first.SetAttr(a);
    second.SetAttr(b);
    const point = new SwPosition(second, 0),
      mark = new SwPosition(first, 0);
    act(
      /** Publishes actual selected paragraphs. @returns Nothing. */ () => {
        shell.SetPaM(point, mark);
      },
    );
    point.Dispose();
    mark.Dispose();
    fireEvent.click(screen.getByRole("button", { name: "Line Spacing" }));
    expect(screen.getByRole("combobox", { name: "Line spacing mode" })).toHaveValue("-1");
    fireEvent.click(screen.getByRole("button", { name: "Spacing: 1.5" }));
    for (const language of [1031, 31770, 1553]) {
      setConfiguredSystemLanguage(language);
      fireEvent.click(screen.getByRole("button", { name: "Line Spacing" }));
      fireEvent.change(screen.getByRole("combobox", { name: "Line spacing mode" }), {
        target: { value: "4" },
      });
      const value = screen.getByRole("spinbutton", { name: "Line spacing value" });
      fireEvent.change(value, { target: { value: "137" } });
      fireEvent.blur(value);
      if (language === 1031) expect(value).toHaveValue("137\u202f%");
      else expect(value.getAttribute("value")).toContain("137");
      fireEvent.change(screen.getByRole("combobox", { name: "Line spacing mode" }), {
        target: { value: "5" },
      });
      expect(value.getAttribute("value")).toContain(" cm");
      fireEvent.keyDown(document, { key: "Escape" });
    }
  } finally {
    setConfiguredSystemLanguage(0);
    rendered.unmount();
    session.Close();
  }
});

it("handles unknown and subsequently disabled status through actual Sfx shell and bindings", /** Native framework status transport remains separate from a complete Writer readonly service. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    frame = session.view.GetViewFrame(),
    dispatcher = frame.GetDispatcher(),
    context = { enabled: true };
  const statusShell = createSfxShell(
    context,
    new SfxInterface([
      {
        slotId: 10033,
        commandUrl: ".uno:LineSpacing",
        label: "Line Spacing",
        execute:
          /** No mutation requested by this status-only native slot fixture. @returns False. */ () =>
            false,
        getState:
          /** Actual native status without a uniform pooled item. @param value - Shell context. @returns Status. */ (
            value: typeof context,
          ) => ({ enabled: value.enabled }),
      },
    ]),
  );
  dispatcher.Push(statusShell);
  const rendered = render(
    <WriterLineSpacingControl
      commandSource={createBrowserCommandSource(frame)}
      getCommandResource={getWriterCommandResource}
      unit={FieldUnit.CM}
    />,
  );
  try {
    fireEvent.click(screen.getByRole("button", { name: "Line Spacing" }));
    expect(screen.getByRole("combobox", { name: "Line spacing mode" })).toHaveValue("-1");
    act(
      /** Invalidates the actual native framework status while popup exists. @returns Nothing. */ () => {
        context.enabled = false;
        dispatcher.Invalidate("formatting");
      },
    );
    expect(screen.getByRole("button", { name: "Line Spacing" })).toBeDisabled();
  } finally {
    rendered.unmount();
    dispatcher.Pop(statusShell);
    session.Close();
  }
});

it("positions the actual floating line-spacing panel inside the viewport and releases geometry observers", /** Explicit host geometry covers anchor edges and above/below placement;Chromium tests verify actual layout. @returns Nothing. */ () => {
  const session = createWriterDocumentSession(),
    observe = vi.fn(),
    disconnect = vi.fn();
  vi.stubGlobal("innerWidth", 390);
  vi.stubGlobal("innerHeight", 800);
  vi.stubGlobal(
    "ResizeObserver",
    /** Explicit browser observer protocol fixture. */ class {
      observe = observe;
      disconnect = disconnect;
    },
  );
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(280);
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(200);
  const rendered = render(
    <WriterLineSpacingControl
      commandSource={createBrowserCommandSource(session.view.GetViewFrame())}
      getCommandResource={getWriterCommandResource}
      unit={FieldUnit.CM}
    />,
  );
  const trigger = screen.getByRole("button", { name: "Line Spacing" }),
    anchor = trigger.parentElement as HTMLDivElement;
  const bounds = vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue({
    left: 10,
    right: 42,
    top: 20,
    bottom: 52,
    width: 32,
    height: 32,
  } as DOMRect);
  try {
    fireEvent.click(trigger);
    const panel = screen.getByRole("dialog", { name: "Line Spacing" })
      .parentElement as HTMLDivElement;
    expect(panel.parentElement).toBe(document.body);
    expect(panel.style.left).toBe("0px");
    expect(panel.style.top).toBe("52px");
    expect(panel.style.maxWidth).toBe("390px");
    expect(panel.style.maxHeight).toBe("800px");
    fireEvent.pointerDown(panel);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    bounds.mockReturnValue({
      left: 348,
      right: 380,
      top: 700,
      bottom: 732,
      width: 32,
      height: 32,
    } as DOMRect);
    fireEvent.resize(window);
    expect(panel.style.left).toBe("100px");
    expect(panel.style.top).toBe("500px");
    bounds.mockReturnValue({
      left: 800,
      right: 832,
      top: 20,
      bottom: 52,
      width: 32,
      height: 32,
    } as DOMRect);
    fireEvent.scroll(window);
    expect(panel.style.left).toBe("110px");
    expect(observe).toHaveBeenCalledWith(panel);
    fireEvent.pointerDown(document.body);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(disconnect).toHaveBeenCalled();
    const reads = bounds.mock.calls.length;
    fireEvent.resize(window);
    expect(bounds).toHaveBeenCalledTimes(reads);
  } finally {
    rendered.unmount();
    session.Close();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  }
});
