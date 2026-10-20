/** @fileoverview Shared palette recent-color/default/disabled contracts and native browser color binding. */
import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { ColorControl } from "./ColorControl";
import { ColorSelect } from "./ColorSelect";
import { createBrowserColorItem } from "./color-item";
import { SfxObjectShell, createDocument } from "../../../sfx2/source/doc/objsh";
import { Color, ColorAlpha, COL_AUTO, COL_TRANSPARENT } from "../../../tools/inc/color";
import { browserColor } from "../../../vcl/browser/color";
import { text } from "../../../i18nlangtag/source/isolang/isolang.tables";
it("retains the native twelve-entry recent bound and RGB equality in the actual Writer palette", /** Tests visible widget choices and resulting recent controls. @returns Nothing. */ () => {
  const onColor = vi.fn(),
    props = {
      label: "Font Color",
      property: "color" as const,
      value: "#000000",
      fallback: "#000000",
      disabled: false,
      onColor,
    },
    mounted = render(<ColorControl {...props} />);
  for (const color of [
    ...Array.from(
      { length: 12 },
      /** Creates distinct RGB input choices. @param unused - Unused array item. @param index - Color position. @returns RGB choice. */ (
        _unused,
        index,
      ) => `#${(index + 1).toString(16).padStart(6, "0")}`,
    ),
    "#abcdef",
  ]) {
    fireEvent.click(screen.getByLabelText("Font Color palette"));
    fireEvent.change(screen.getByLabelText("Font Color custom color"), {
      target: { value: color },
    });
  }
  fireEvent.click(screen.getByLabelText("Font Color palette"));
  expect(screen.getAllByRole("button", { name: /^Font Color recent #/ })).toHaveLength(12);
  expect(screen.queryByRole("button", { name: "Font Color recent #000001" })).toBeNull();
  mounted.rerender(<ColorControl {...props} value="#ABCDEF" />);
  fireEvent.click(screen.getByRole("button", { name: "Font Color" }));
  fireEvent.click(screen.getByLabelText("Font Color palette"));
  expect(screen.getAllByRole("button", { name: /^Font Color recent #/ })).toHaveLength(12);
  expect(screen.queryByRole("button", { name: "Font Color recent #ABCDEF" })).toBeNull();
  expect(screen.getByRole("button", { name: "Font Color recent #abcdef" })).toBeInTheDocument();
  fireEvent.pointerDown(screen.getByLabelText("Font Color palette"));
  expect(screen.getByLabelText("Font Color palette").parentElement).toHaveAttribute("open");
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.getByLabelText("Font Color palette").parentElement).not.toHaveAttribute("open");
  fireEvent.click(screen.getByLabelText("Font Color palette"));
  fireEvent.pointerDown(document.body);
  expect(screen.getByLabelText("Font Color palette").parentElement).not.toHaveAttribute("open");
  mounted.rerender(<ColorControl {...props} disabled />);
  fireEvent.click(screen.getByLabelText("Font Color palette"));
  expect(screen.getByLabelText("Font Color palette").parentElement).not.toHaveAttribute("open");
  mounted.unmount();
});
it("uses native document defaults and independent palette item requests", /** Exercises original recent ownership rather than a fake document model. @returns Nothing. */ () => {
  const shell = new SfxObjectShell(
      createDocument({ id: "palette", suiteId: "calc", title: "Palette" }),
      { kind: "untitled", name: "Palette" },
    ),
    onSelect = vi.fn(),
    onApply = vi.fn(),
    mounted = render(
      <ColorSelect
        objectShell={shell}
        slotId={10017}
        label="Font Color"
        value={undefined}
        enabled
        onSelect={onSelect}
        onApply={onApply}
      />,
    );
  const font = shell.GetRecentColor(10017);
  expect(font?.m_aColor.toUInt32()).toBe(0xc9211e);
  if (font === undefined) throw Error("Missing seeded font color");
  expect(text(font.m_aName)).toBe("Dark Red 2");
  font?.Dispose();
  mounted.rerender(
    <ColorSelect
      objectShell={shell}
      slotId={10186}
      label="Background Color"
      value={undefined}
      enabled
      onSelect={onSelect}
      onApply={onApply}
    />,
  );
  const background = shell.GetRecentColor(10186);
  expect(background?.m_aColor.toUInt32()).toBe(0xffff00);
  background?.Dispose();
  fireEvent.click(screen.getByRole("button", { name: "Background Color" }));
  expect(onApply).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByLabelText("Background Color palette"));
  fireEvent.change(screen.getByLabelText("Background Color custom color"), {
    target: { value: "#123456" },
  });
  expect(onSelect.mock.calls[0]?.[0].GetValue().toUInt32()).toBe(0x123456);
  const recent = shell.GetRecentColor(10186);
  expect(recent?.m_aColor.toUInt32()).toBe(0x123456);
  recent?.Dispose();
  expect(shell.IsModified()).toBe(false);
  expect(shell.GetContentGeneration()).toBe(0);
  mounted.unmount();
  shell.Dispose();
});
it("keeps actual native sentinels and alpha at the browser boundary", /** Verifies opaque,transparent and partial-alpha channel projection. @returns Nothing. */ () => {
  expect(createBrowserColorItem("auto", 10017).GetValue().equals(COL_AUTO)).toBe(true);
  expect(createBrowserColorItem("transparent", 10186).GetValue().equals(COL_TRANSPARENT)).toBe(
    true,
  );
  expect(createBrowserColorItem("#AbCdEf", 10017).GetValue().toUInt32()).toBe(0xabcdef);
  expect(
    /** Rejects a non-offered lexical value before dispatch. @returns Never. */ () =>
      createBrowserColorItem("red", 10017),
  ).toThrow("RGB24");
  expect(browserColor(COL_TRANSPARENT)).toBe("transparent");
  expect(browserColor(new Color(0x123456))).toBe("#123456");
  expect(browserColor(new Color(ColorAlpha, 128, 17, 34, 51, "ColorAlphaTag"))).toBe(
    "rgba(17, 34, 51, 0.5019607843137255)",
  );
});
