/** @fileoverview Verifies Options drafts and real Writer metric application through native item sets. */
import { afterEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { WriterOptionsDialog } from "./WriterOptionsDialog";
import {
  createWriterDocumentSession,
  type WriterDocumentSession,
} from "../composition/writer-module";
import { SwModule } from "../../source/uibase/app/swmodule";
import { ApplyWriterMetricItemSet } from "../../source/uibase/app/appopt";
import { FieldUnit as F } from "../../../tools/inc/fldunit";

const sessions: WriterDocumentSession[] = [];
afterEach(
  /** Releases actual document/view ownership. @returns Nothing. */ () => {
    for (const session of sessions.splice(0)) session.Close();
  },
);
/** Creates a configured native Writer session without changing production defaults. @param unit - Explicit module preference. @returns Session. */
function createSession(unit: F = F.CM): WriterDocumentSession {
  const session = createWriterDocumentSession(
    undefined,
    undefined,
    new SwModule({ "Other/MeasureUnit": unit }),
  );
  sessions.push(session);
  return session;
}

it("applies global units without changing document geometry and resets drafts to the last applied values", /** Exercises real native page/item/view contracts. @returns Nothing. */ () => {
  const session = createSession(),
    close = vi.fn();
  const geometry = session.viewStore.GetSnapshot().pageDescriptor;
  render(
    <WriterOptionsDialog
      view={session.view}
      onClose={close}
      onApply={
        /** Applies native changed items to the current module/view. @param items - Native delta. @returns Nothing. */
        (items) => ApplyWriterMetricItemSet(session.view.GetModule(), items, session.view)
      }
    />,
  );
  const unit = screen.getByRole("combobox", { name: "Measurement unit" });
  expect(
    within(unit)
      .getAllByRole("option")
      .filter(
        /** Excludes the inactive placeholder. @param option - Option node. @returns Whether visible. */
        (option) => !option.hidden,
      )
      .map(
        /** Reads source resource labels. @param option - Option node. @returns Label. */ (
          option,
        ) => option.textContent,
      ),
  ).toEqual(["Millimeter", "Centimeter", "Inch", "Pica", "Point"]);
  fireEvent.change(unit, { target: { value: String(F.INCH) } });
  expect(session.view.GetMetric()).toBe(F.CM);
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(session.view.GetMetric()).toBe(F.INCH);
  expect([session.view.GetHRulerMetric(), session.view.GetVRulerMetric()]).toEqual([
    F.INCH,
    F.INCH,
  ]);
  expect(session.viewStore.GetSnapshot().pageDescriptor).toEqual(geometry);
  expect(close).not.toHaveBeenCalled();
  fireEvent.change(unit, { target: { value: String(F.MM) } });
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(unit).toHaveValue(String(F.INCH));
  fireEvent.change(unit, { target: { value: String(F.POINT) } });
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(close).toHaveBeenCalledTimes(1);
  expect(session.view.GetMetric()).toBe(F.INCH);
});

it("keeps axis units independent and the normal Writer View global selector hidden", /** Tests original View catalogs and per-page Reset. @returns Nothing. */ () => {
  const session = createSession(),
    close = vi.fn();
  render(
    <WriterOptionsDialog
      view={session.view}
      onClose={close}
      onApply={
        /** Dispatches actual axis items. @param items - Native item delta. @returns Nothing. */
        (items) => ApplyWriterMetricItemSet(session.view.GetModule(), items, session.view)
      }
    />,
  );
  fireEvent.keyDown(screen.getByRole("treeitem", { name: "General" }), { key: "ArrowDown" });
  expect(screen.getByRole("treeitem", { name: "View" })).toHaveFocus();
  expect(screen.queryByRole("combobox", { name: "Measurement unit" })).toBeNull();
  const horizontal = screen.getByRole("combobox", { name: "Horizontal ruler unit" });
  const vertical = screen.getByRole("combobox", { name: "Vertical ruler unit" });
  expect(within(horizontal).queryByRole("option", { name: "Line" })).toBeNull();
  expect(within(vertical).queryByRole("option", { name: "Char" })).toBeNull();
  expect(within(horizontal).getByRole("option", { name: "Char" })).toBeInTheDocument();
  expect(within(vertical).getByRole("option", { name: "Line" })).toBeInTheDocument();
  fireEvent.change(horizontal, { target: { value: String(F.MM) } });
  fireEvent.change(vertical, { target: { value: String(F.POINT) } });
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(horizontal).toHaveValue(String(F.CM));
  expect(vertical).toHaveValue(String(F.CM));
  fireEvent.change(horizontal, { target: { value: String(F.MM) } });
  fireEvent.change(vertical, { target: { value: String(F.POINT) } });
  fireEvent.click(screen.getByRole("button", { name: "OK" }));
  expect([
    session.view.GetMetric(),
    session.view.GetHRulerMetric(),
    session.view.GetVRulerMetric(),
  ]).toEqual([F.CM, F.MM, F.POINT]);
  expect(close).toHaveBeenCalledTimes(1);
});

it("reports an application error and keeps the modal available for cancellation", /** Checks failed Apply and Escape. @returns Nothing. */ () => {
  const session = createSession(),
    close = vi.fn();
  render(
    <WriterOptionsDialog
      view={session.view}
      onClose={close}
      onApply={
        /** Models the actual platform write rejection. @returns Never. */ () => {
          throw new Error("Storage denied");
        }
      }
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Storage denied");
  expect(close).not.toHaveBeenCalled();
  fireEvent.keyDown(screen.getByRole("dialog", { name: "Options" }), { key: "Escape" });
  expect(close).toHaveBeenCalledTimes(1);
});

it("retains empty native selections and tree navigation when loaded units are outside option catalogs", /** Exercises original inactive combo rows and browser tree keys. @returns Nothing. */ () => {
  const session = createSession(F.FOOT),
    close = vi.fn();
  render(
    <WriterOptionsDialog
      view={session.view}
      onClose={close}
      onApply={
        /** Represents an opaque platform failure across the host boundary. @returns Never. */ () => {
          throw Object.freeze({ code: "storage-denied" });
        }
      }
    />,
  );
  const general = screen.getByRole("treeitem", { name: "General" });
  fireEvent.click(general);
  expect(screen.getByRole("combobox", { name: "Measurement unit" })).toHaveValue("");
  fireEvent.keyDown(general, { key: "End" });
  const view = screen.getByRole("treeitem", { name: "View" });
  expect(view).toHaveFocus();
  expect(screen.getByRole("combobox", { name: "Horizontal ruler unit" })).toHaveValue("");
  expect(screen.getByRole("combobox", { name: "Vertical ruler unit" })).toHaveValue("");
  fireEvent.keyDown(view, { key: "ArrowUp" });
  expect(general).toHaveFocus();
  fireEvent.keyDown(general, { key: "End" });
  fireEvent.keyDown(view, { key: "Home" });
  expect(general).toHaveFocus();
  expect(fireEvent.keyDown(general, { key: "Enter" })).toBe(true);
  expect(general).toHaveAttribute("aria-selected", "true");
  fireEvent.click(view);
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Unable to save preferences.");
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  expect(close).toHaveBeenCalledOnce();
});
