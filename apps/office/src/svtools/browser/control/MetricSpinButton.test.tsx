/** @fileoverview Verifies real native metric parsing at the browser text/spin boundary. */
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MetricSpinButton, type MetricSpinButtonProps } from "./MetricSpinButton";
import { setConfiguredSystemLanguage } from "../../../i18nlangtag/source/isolang/mslangid";
import { FieldUnit as U } from "../../../tools/inc/fldunit";
afterEach(cleanup);
/** Binds accepted twips to a real controlled parent. @param props - Physical initialization and optional control fields. @returns Bound field. */
function Binding(props: Partial<MetricSpinButtonProps> & { initial?: number }) {
  const [value, setValue] = useState<number | undefined>(props.initial ?? 1440);
  return (
    <>
      <MetricSpinButton
        {...props}
        aria-label="Length"
        value={value}
        onValueChange={
          /** Accepts physical values. @param twips - Edited geometry. @returns Nothing. */ (
            twips,
          ) => {
            setValue(twips);
            props.onValueChange?.(twips);
          }
        }
      />
      <output data-testid="physical">{value}</output>
    </>
  );
}
it("accepts native aliases and mixed-unit entry,formats on blur and retains physical twips", /** Checks actual aliases,not a browser conversion substitute. @returns Nothing. */ () => {
  render(<Binding />);
  const field = screen.getByRole("spinbutton");
  expect(field).toHaveValue("2.54 cm");
  for (const [input, result] of [
    ["1 in", 1440],
    ["25.4 mm", 1440],
    ["72 pt", 1440],
    ["6 pc", 1440],
    ["1440 twips", 1440],
    ["2.54 cm", 1440],
    ["2″", 2880],
  ] as const) {
    fireEvent.change(field, { target: { value: input } });
    expect(screen.getByTestId("physical").textContent).toBe(String(result));
    fireEvent.blur(field);
    expect(field).toHaveValue(result === 1440 ? "2.54 cm" : "5.08 cm");
  }
});
it("preserves untouched geometry,invalid drafts and actual external value/unit changes", /** Checks no read/display roundtrip writes. @returns Nothing. */ () => {
  const change = vi.fn(),
    blur = vi.fn();
  const f = render(
      <MetricSpinButton aria-label="Length" value={23} onValueChange={change} onBlur={blur} />,
    ),
    field = screen.getByRole("spinbutton");
  expect(field).toHaveValue("0.04 cm");
  fireEvent.blur(field);
  expect(change).not.toHaveBeenCalled();
  expect(blur).toHaveBeenCalledOnce();
  for (const invalid of ["", "-", "words"]) {
    fireEvent.change(field, { target: { value: invalid } });
    expect(field).toHaveValue(invalid);
    expect(change).not.toHaveBeenCalled();
    fireEvent.blur(field);
    expect(field).toHaveValue("0.04 cm");
  }
  f.rerender(
    <MetricSpinButton aria-label="Length" value={1440} unit={U.INCH} onValueChange={change} />,
  );
  expect(field).toHaveValue("1.00″");
  f.rerender(<MetricSpinButton aria-label="Length" value={undefined} onValueChange={change} />);
  expect(field).toHaveValue("");
  fireEvent.blur(field);
  expect(field).toHaveValue("");
});
it("uses native signed range and tenth/whole display-unit stepping", /** Checks every step direction,clipping and ordinary-key ownership. @returns Nothing. */ () => {
  render(<Binding unit={U.INCH} minimum={-1440} maximum={2880} />);
  const f = screen.getByRole("spinbutton");
  for (const [key, expected] of [
    ["ArrowUp", 1469],
    ["ArrowDown", 1440],
    ["PageUp", 1728],
    ["PageDown", 1440],
  ] as const) {
    fireEvent.keyDown(f, { key });
    expect(screen.getByTestId("physical").textContent).toBe(String(expected));
  }
  fireEvent.change(f, { target: { value: "-5 in" } });
  expect(screen.getByTestId("physical").textContent).toBe("-1440");
  fireEvent.keyDown(f, { key: "PageDown" });
  expect(screen.getByTestId("physical").textContent).toBe("-1440");
  fireEvent.change(f, { target: { value: "9 in" } });
  expect(screen.getByTestId("physical").textContent).toBe("2880");
  fireEvent.change(f, { target: { value: "" } });
  fireEvent.keyDown(f, { key: "ArrowDown" });
  expect(screen.getByTestId("physical").textContent).toBe("2851");
  fireEvent.keyDown(f, { key: "Enter" });
  expect(screen.getByTestId("physical").textContent).toBe("2851");
});
it("honors consumer key cancellation and native suffixless units", /** Checks browser owner veto and native NONE formatting. @returns Nothing. */ () => {
  const change = vi.fn();
  render(
    <MetricSpinButton
      value={1}
      unit={U.NONE}
      onValueChange={change}
      onKeyDown={
        /** Retains dialog key ownership. @param event - Native keyboard event. @returns Nothing. */ (
          event,
        ) => event.preventDefault()
      }
    />,
  );
  expect(screen.getByRole("spinbutton")).toHaveValue("1.00");
  fireEvent.keyDown(screen.getByRole("spinbutton"), { key: "ArrowUp" });
  expect(change).not.toHaveBeenCalled();
});

it("uses actual configured locale decimal and alternate separators", /** Checks native localized text conversion. @returns Nothing. */ () => {
  setConfiguredSystemLanguage(1031);
  try {
    render(<Binding />);
    const field = screen.getByRole("spinbutton");
    expect(field).toHaveValue("2,54 cm");
    for (const text of ["25,4 mm", "2,54 cm"]) {
      fireEvent.change(field, { target: { value: text } });
      expect(screen.getByTestId("physical").textContent).toBe("1440");
      fireEvent.blur(field);
      expect(field).toHaveValue("2,54 cm");
    }
  } finally {
    setConfiguredSystemLanguage(0);
  }
});
it("presents an undefined native slot and a changed display unit independently of value", /** Checks actual empty slot and same-value unit reprojection. @returns Nothing. */ () => {
  const change = vi.fn();
  const f = render(<MetricSpinButton value={undefined} onValueChange={change} />),
    field = screen.getByRole("spinbutton");
  expect(field).toHaveValue("");
  fireEvent.change(field, { target: { value: "-" } });
  fireEvent.blur(field);
  expect(change).not.toHaveBeenCalled();
  f.rerender(<MetricSpinButton value={1440} onValueChange={change} />);
  fireEvent.blur(field);
  f.rerender(<MetricSpinButton value={1440} unit={U.POINT} onValueChange={change} />);
  expect(field).toHaveValue("72.0 pt");
});

it("preserves original missing versus actual locale decimal alternate behavior", /** Checks actual German grouping and Arabic alternate resources. @returns Nothing. */ () => {
  try {
    setConfiguredSystemLanguage(1031);
    render(<Binding />);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "2.54 cm" } });
    expect(screen.getByTestId("physical").textContent).toBe("144000");
    cleanup();
    setConfiguredSystemLanguage(1025);
    render(<Binding />);
    fireEvent.change(screen.getByRole("spinbutton"), { target: { value: "2.54 cm" } });
    expect(screen.getByTestId("physical").textContent).toBe("1440");
  } finally {
    setConfiguredSystemLanguage(0);
  }
});

it("presents clickable native spin arrows with focus retention and range sensitivity", /** Checks pointer controls over the same numeric owner. @returns Nothing. */ () => {
  const f = render(<Binding unit={U.INCH} minimum={0} maximum={1469} />),
    field = screen.getByRole("spinbutton"),
    up = screen.getByRole("button", { name: "Increase Length" }),
    down = screen.getByRole("button", { name: "Decrease Length" });
  fireEvent.mouseDown(up);
  fireEvent.click(up);
  expect(field).toHaveFocus();
  expect(screen.getByTestId("physical").textContent).toBe("1469");
  expect(up).toBeDisabled();
  fireEvent.click(down);
  expect(screen.getByTestId("physical").textContent).toBe("1440");
  fireEvent.change(field, { target: { value: "0" } });
  expect(down).toBeDisabled();
  f.rerender(<MetricSpinButton value={undefined} onValueChange={vi.fn()} disabled />);
  expect(screen.getByRole("button", { name: "Increase value" })).toBeDisabled();
});

it("uses source millimetre/point precision and increments and degree suffix spacing", /** Checks actual helper dispatch in the browser. @returns Nothing. */ () => {
  const f = render(<Binding unit={U.MM} />),
    field = screen.getByRole("spinbutton");
  expect(field).toHaveValue("25.40 mm");
  fireEvent.keyDown(field, { key: "ArrowUp" });
  expect(screen.getByTestId("physical").textContent).toBe("1468");
  f.rerender(<MetricSpinButton value={1440} unit={U.DEGREE} onValueChange={vi.fn()} />);
  expect(screen.getByRole("spinbutton")).toHaveValue("1440.00°");
});
