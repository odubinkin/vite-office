/** @fileoverview Missing optional glyphs retain the actual formatting controls and dispatch contracts. */
import { render, screen, cleanup } from "@testing-library/react";
import { it, expect, vi } from "vitest";
it("retains native border controls when their optional icon registry entries are absent", /** Uses the actual shared registry and source bindings. @returns Completion. */ async () => {
  vi.resetModules();
  const { officeCommandIcons } =
      await import("../../../framework/browser/presentation/office-command-icons"),
    keys = [".uno:SetBorderStyle", ".uno:LineStyle", ".uno:FrameLineColor"];
  const get = officeCommandIcons.get.bind(officeCommandIcons),
    registry = vi
      .spyOn(officeCommandIcons, "get")
      .mockImplementation(
        /** Retains unrelated glyph lookup. @param key - Source command. @returns Optional glyph. */ (
          key,
        ) => (keys.includes(key) ? undefined : get(key)),
      );
  const { createCalcSession } = await import("../composition/calc-module"),
    { CalcWorkbench } = await import("./calc-workbench"),
    s = createCalcSession();
  try {
    render(
      <CalcWorkbench
        controller={s.controller}
        frame={s.frame}
        fileWorkflows={s.fileWorkflows}
        sheetWorkflows={s.sheetWorkflows}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Borders (Shift to overwrite)" }).querySelector("svg"),
    ).toBeNull();
    expect(screen.getByRole("button", { name: /^Border Color$/ })).toBeEnabled();
  } finally {
    cleanup();
    s.Close();
    registry.mockRestore();
    vi.resetModules();
  }
});
