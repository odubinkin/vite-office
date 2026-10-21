/** @fileoverview Verifies paragraph dimensional fields retain physical values across display units. */
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { WriterParagraphDialog } from "./WriterParagraphDialog";
import { FieldUnit as F } from "../../../tools/inc/fldunit";
import type { WriterParagraphDialogRequest } from "../../source/uibase/dialog/writer-dialog-controller";

const request: WriterParagraphDialogRequest = {
  commandUrl: ".uno:ParagraphDialog",
  kind: "paragraph",
  paintLineNumbers: false,
  initialValue: {
    upperPt: 72,
    lowerPt: 0,
    firstLineIndentPt: -36,
    contextual: false,
    lineMode: "fixed",
    lineValue: 240,
    tabStopsPt: [36],
    keepWithNext: false,
    countLineNumbers: true,
  },
};

it("edits inch,explicit suffix,and tab values through the unchanged physical paragraph contract", /** Checks text entry and accepted paragraph values. @returns Nothing. */ () => {
  const submit = vi.fn();
  render(
    <WriterParagraphDialog
      dialogRequest={{ id: 1, request }}
      fontSizePt={12}
      unit={F.INCH}
      onDialogCancel={vi.fn()}
      onDialogSubmit={submit}
    />,
  );
  expect(screen.getByRole("spinbutton", { name: "Above paragraph (in)" })).toHaveValue("1.00″");
  expect(screen.getByRole("spinbutton", { name: "First line indent (in)" })).toHaveValue("-0.50″");
  fireEvent.change(screen.getByRole("spinbutton", { name: "Above paragraph (in)" }), {
    target: { value: "12 pt" },
  });
  fireEvent.change(screen.getByRole("spinbutton", { name: "Value (in)" }), {
    target: { value: "0.25 in" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "Tabs" }));
  expect(screen.getByRole("option", { name: "0.50″" })).toBeInTheDocument();
  fireEvent.change(screen.getByRole("spinbutton", { name: "Position (in)" }), {
    target: { value: "1 in" },
  });
  fireEvent.click(screen.getByRole("button", { name: "New" }));
  fireEvent.change(screen.getByRole("listbox", { name: "Tab stops" }), {
    target: { value: "36" },
  });
  expect(screen.getByRole("spinbutton", { name: "Position (in)" })).toHaveValue("0.50″");
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(submit).toHaveBeenCalledWith(1, {
    paintLineNumbers: false,
    paragraphFormat: {
      ...request.initialValue,
      upperPt: 12.25,
      lineValue: 360,
      tabStopsPt: [36, 72],
    },
  });
});

it("keeps proportional spacing as a percent when module units change", /** Checks numeric and dimensional boundaries separately. @returns Nothing. */ () => {
  const submit = vi.fn();
  render(
    <WriterParagraphDialog
      dialogRequest={{
        id: 2,
        request: {
          ...request,
          initialValue: { ...request.initialValue, lineMode: "proportional", lineValue: 115 },
        },
      }}
      fontSizePt={12}
      unit={F.MM}
      onDialogCancel={vi.fn()}
      onDialogSubmit={submit}
    />,
  );
  expect(screen.getByRole("spinbutton", { name: "Above paragraph (mm)" })).toHaveValue("25.40 mm");
  fireEvent.change(screen.getByRole("spinbutton", { name: "Value (%)" }), {
    target: { value: "135" },
  });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect(submit.mock.calls[0]?.[1].paragraphFormat).toEqual({
    ...request.initialValue,
    lineMode: "proportional",
    lineValue: 135,
  });
});

it("uses native default metric labels and routes character-unit vertical fields independently", /** Checks actual dialog unit routing without changing the initial physical draft on Cancel. @returns Nothing. */ () => {
  for (const unit of [undefined, F.CHAR]) {
    const cancel = vi.fn(),
      submit = vi.fn();
    render(
      <WriterParagraphDialog
        dialogRequest={{ id: 21, request }}
        fontSizePt={12}
        {...(unit === undefined ? {} : { unit })}
        onDialogCancel={cancel}
        onDialogSubmit={submit}
      />,
    );
    expect(
      screen.getByRole("spinbutton", {
        name: unit === undefined ? "Above paragraph (cm)" : "Above paragraph (line)",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", {
        name: unit === undefined ? "Below paragraph (cm)" : "Below paragraph (line)",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("spinbutton", { name: unit === undefined ? "Value (cm)" : "Value (pt)" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(cancel).toHaveBeenCalledWith(21);
    expect(submit).not.toHaveBeenCalled();
    cleanup();
  }
});
