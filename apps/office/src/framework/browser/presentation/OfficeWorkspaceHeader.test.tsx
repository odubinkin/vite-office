/** @fileoverview Shared office header retains optional formatting-region visibility independent of suite composition. */
import { cleanup, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { OfficeWorkspaceHeader } from "./OfficeWorkspaceHeader";
it("omits an absent formatting region and mounts the owning view's supplied controls", /** Verifies the header's public optional-region contract when both current applications normally supply it. @returns Nothing. */ () => {
  const common = {
    documentTitle: "Shared document",
    onDocumentTitleChange: vi.fn(),
    titleLabel: "Document title",
    editTitleLabel: "Edit document title",
    subtitle: "Office workspace",
    standardToolbarLabel: "Standard controls",
    formattingToolbarLabel: "Formatting controls",
    menuBar: <nav aria-label="Office menus" />,
    toolbar: <button type="button">Open document</button>,
  };
  const mounted = render(<OfficeWorkspaceHeader {...common} />);
  expect(screen.getByRole("toolbar", { name: "Standard controls" })).toBeVisible();
  expect(screen.queryByRole("toolbar", { name: "Formatting controls" })).not.toBeInTheDocument();
  mounted.rerender(
    <OfficeWorkspaceHeader
      {...common}
      formattingToolbar={<button type="button">Format selection</button>}
    />,
  );
  expect(
    within(screen.getByRole("toolbar", { name: "Formatting controls" })).getByRole("button", {
      name: "Format selection",
    }),
  ).toBeVisible();
  expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Shared document");
  cleanup();
});
