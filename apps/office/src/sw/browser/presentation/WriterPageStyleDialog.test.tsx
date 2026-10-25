/** @fileoverview Verifies page geometry editing and validation in the Writer dialog. */

import { fireEvent, render, screen } from "@testing-library/react";
import fs from "node:fs";
import { describe, expect, it, vi } from "vitest";

import { createDefaultWriterPageDescriptor } from "../../../test/writer-page-descriptor";
import { FieldUnit } from "../../../tools/inc/fldunit";
import { WriterPageStyleDialog } from "./WriterPageStyleDialog";
import { readOdtDocument } from "../../source/filter/xml/swxml";
import { writeOdtDocument } from "../../source/filter/xml/wrtxml";

describe("Writer Page Style dialog", /** Groups Writer Page Style dialog. @returns Test callback result. */ () => {
  it("inspects and edits an upstream ODT page descriptor through save and reopen", /** Checks imported geometry in the existing Page tab. @returns Completion. */ async () => {
    const bytes = new Uint8Array(
      fs.readFileSync("src/sw/qa/extras/embedded_fonts/data/embedded-font-props.odt"),
    );
    const metadata = { title: "Page fixture" };
    const options = {
      onDiagnostic: /** Suppresses unrelated upstream diagnostics. @returns Nothing. */ () =>
        undefined,
    };
    const opened = await readOdtDocument(bytes, metadata, undefined, options);
    const initial = opened.document.GetPageDesc().GetValue();
    const onSubmit = vi.fn(
      /** Applies the dialog result to canonical page state. @param value - Accepted descriptor. @returns Nothing. */ (
        value: typeof initial,
      ) => opened.document.ChgPageDesc(value),
    );
    render(<WriterPageStyleDialog initialValue={initial} onCancel={vi.fn()} onSubmit={onSubmit} />);
    expect(screen.getByLabelText("Width (cm)")).toHaveAttribute(
      "aria-valuenow",
      String(Number(((initial.width * 2.54) / 1440).toFixed(2))),
    );
    fireEvent.change(screen.getByLabelText("Left (cm)"), { target: { value: "3" } });
    fireEvent.click(screen.getByText("OK"));
    expect(onSubmit).toHaveBeenCalledOnce();
    const reopened = await readOdtDocument(
      writeOdtDocument(opened.document, metadata),
      metadata,
      undefined,
      options,
    );
    expect(reopened.document.GetPageDesc().GetValue().leftMargin).toBe(
      Math.round((3 * 1440) / 2.54),
    );
  });

  it("keeps selected paper dimensions consistent with landscape orientation", /** Checks keeps selected paper dimensions consistent with landscape orientation. @returns Test callback result. */ () => {
    const onSubmit = vi.fn();
    const initialValue = createDefaultWriterPageDescriptor("en-US").GetValue();
    render(
      <WriterPageStyleDialog initialValue={initialValue} onCancel={vi.fn()} onSubmit={onSubmit} />,
    );
    fireEvent.click(screen.getByLabelText("Landscape"));
    fireEvent.change(screen.getByLabelText("Paper format"), { target: { value: "4" } });
    fireEvent.click(screen.getByText("OK"));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        landscape: true,
        height: 11906,
        width: 16838,
      }),
    );
    fireEvent.click(screen.getByLabelText("Landscape"));
    fireEvent.click(screen.getByLabelText("Portrait"));
    fireEvent.change(screen.getByLabelText("Paper format"), { target: { value: "8" } });
    fireEvent.click(screen.getByText("OK"));
    expect(onSubmit).toHaveBeenLastCalledWith(
      expect.objectContaining({
        landscape: false,
        height: 15840,
        width: 12240,
      }),
    );
  });

  it("accepts native original items when Reset and a same-known-paper manual edit only change the preview", /** Exercises the real UI acceptance boundary rather than submitting its preview draft. @returns Nothing. */ () => {
    const initialValue = { ...createDefaultWriterPageDescriptor("en-GB").GetValue(), width: 11905 };
    const onSubmit = vi.fn();
    render(
      <WriterPageStyleDialog initialValue={initialValue} onCancel={vi.fn()} onSubmit={onSubmit} />,
    );
    expect(screen.getByLabelText("Paper format")).toHaveValue("4");
    fireEvent.click(screen.getByText("OK"));
    expect(onSubmit).toHaveBeenLastCalledWith(initialValue);
    fireEvent.change(screen.getByLabelText("Width (cm)"), { target: { value: "20.99" } });
    expect(screen.getByLabelText("Paper format")).toHaveValue("4");
    fireEvent.click(screen.getByText("OK"));
    expect(onSubmit).toHaveBeenLastCalledWith(initialValue);
  });

  it.each([new Error("Page update rejected"), "rejected"])(
    "reports callback failure %s without dismissing the dialog",
    /** Checks callback failure rendering without dismissing the dialog. @param failure - Original callback failure. @returns Nothing. */ (
      failure,
    ) => {
      const initialValue = createDefaultWriterPageDescriptor("en-US").GetValue();
      render(
        <WriterPageStyleDialog
          initialValue={initialValue}
          onCancel={vi.fn()}
          onSubmit={
            /** Runs the test callback. @returns Test callback result. */ () => {
              throw failure;
            }
          }
        />,
      );
      fireEvent.click(screen.getByText("OK"));
      expect(
        screen.getByText(failure instanceof Error ? failure.message : "Invalid page geometry."),
      ).toBeInTheDocument();
    },
  );
});

it("focuses the mounted page control and cancels with Escape without accepting", /** Native modal keyboard cancellation retains document draft isolation. @returns Nothing. */ () => {
  const cancel = vi.fn(),
    submit = vi.fn();
  render(
    <WriterPageStyleDialog
      initialValue={createDefaultWriterPageDescriptor("en-US").GetValue()}
      onCancel={cancel}
      onSubmit={submit}
    />,
  );
  expect(screen.getByLabelText("Paper format")).toHaveFocus();
  fireEvent.keyDown(screen.getByLabelText("Paper format"), { key: "ArrowDown" });
  fireEvent.keyDown(screen.getByLabelText("Paper format"), { key: "Escape" });
  expect(cancel).toHaveBeenCalledOnce();
  expect(submit).not.toHaveBeenCalled();
});

it("edits custom height and every margin through native geometry while retaining modal pointer ownership", /** Verifies physical units and source form acceptance without replacing the page draft. @returns Nothing. */ () => {
  const submit = vi.fn(),
    cancel = vi.fn();
  render(
    <WriterPageStyleDialog
      initialValue={createDefaultWriterPageDescriptor("en-US").GetValue()}
      onCancel={cancel}
      onSubmit={submit}
    />,
  );
  const format = screen.getByLabelText("Paper format"),
    dialog = screen.getByRole("dialog");
  expect(fireEvent.mouseDown(dialog)).toBe(false);
  expect(fireEvent.mouseDown(format)).toBe(true);
  expect(format).toHaveFocus();
  expect(cancel).not.toHaveBeenCalled();
  fireEvent.change(format, { target: { value: "11" } });
  for (const [name, value] of [
    ["Width (cm)", "8 in"],
    ["Height (cm)", "10 in"],
    ["Left (cm)", "0.5 in"],
    ["Right (cm)", "1 in"],
    ["Top (cm)", "1.5 in"],
    ["Bottom (cm)", "2 in"],
  ] as const)
    fireEvent.change(screen.getByLabelText(name), { target: { value } });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(submit).toHaveBeenCalledWith(
    expect.objectContaining({
      width: 11520,
      height: 14400,
      leftMargin: 720,
      rightMargin: 1440,
      topMargin: 2160,
      bottomMargin: 2880,
    }),
  );
});

it.each([
  [FieldUnit.INCH, "Width (in)", "8.50″"],
  [FieldUnit.MM, "Width (mm)", "215.90 mm"],
] as const)(
  "retains physical Letter geometry in module unit %s",
  /** Actual represented inch and millimetre labels and display values must not rewrite the native page on Cancel. @param unit - Configured unit. @param label - Original accessible field label. @param value - Displayed physical width. @returns Nothing. */ (
    unit,
    label,
    value,
  ) => {
    const cancel = vi.fn(),
      submit = vi.fn();
    render(
      <WriterPageStyleDialog
        initialValue={createDefaultWriterPageDescriptor("en-US").GetValue()}
        unit={unit}
        onCancel={cancel}
        onSubmit={submit}
      />,
    );
    expect(screen.getByRole("spinbutton", { name: label })).toHaveValue(value);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(cancel).toHaveBeenCalledOnce();
    expect(submit).not.toHaveBeenCalled();
  },
);
