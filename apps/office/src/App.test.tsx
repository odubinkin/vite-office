/**
 * @fileoverview Verifies the visible foundation status, suite navigation, and selection behavior of the workbench.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { App } from "./App";
import { suiteDefinitions } from "./domain/suites";

describe("App" /**
 * Groups user-observable workbench foundation tests.
 *
 * @returns Nothing; Vitest registers the enclosed cases.
 */, function defineAppTests(): void {
  it("labels the shell as a non-parity foundation preview" /**
   * Verifies honest status text and the complete planned suite inventory.
   *
   * @returns Nothing; assertions describe the rendered static shell.
   */, function verifyFoundationStatus(): void {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "Browser workbench foundation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("No editor features enabled")).toBeInTheDocument();
    expect(screen.getByText("Static frontend")).toBeInTheDocument();
    expect(
      screen.getByText(/Untitled Writer Document is a serializable new document/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This is a serializable plain-text Writer paragraph preview/),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(suiteDefinitions.length);
  });

  it("updates the preview and live status when a suite is selected" /**
   * Exercises the suite-selection state transition through an accessible button.
   *
   * @returns Nothing; assertions verify the resulting main panel and status line.
   */, function verifySuiteSelection(): void {
    render(<App />);

    const calcButton = screen.getByRole("button", { name: "Calc, Foundation only" });
    fireEvent.click(calcButton);

    expect(calcButton).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Calc: Foundation only")).toBeInTheDocument();
    expect(screen.getByText(/Worksheets, formulas, analysis/)).toBeInTheDocument();
    expect(
      screen.getByText(/Untitled Calc Document is a serializable new document/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Writer paragraph preview/)).not.toBeInTheDocument();
  });
});
