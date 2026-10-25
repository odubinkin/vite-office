/** @fileoverview Verifies consumed Internet/common fields,source session preference and per-instance keyboard/focus at actual DOM inputs. */
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WriterHyperlinkDialog } from "./WriterHyperlinkDialog";
import { HyperlinkInternetTP } from "../../../cui/source/dialogs/hyperlinkinternettabpage";
afterEach(
  /** Unmounts actual controls and restores source preference through its handler. @returns Nothing. */ () => {
    cleanup();
    new HyperlinkInternetTP("").ClickRemoveQueryStringHdl_Impl(false);
  },
);
it("uses source target order and raw Name/custom Frame metadata without touching style data", /** Empty metadata can be cleared while spaces remain actual values. @returns Nothing. */ () => {
  const submit = vi.fn(),
    cancel = vi.fn();
  render(
    <WriterHyperlinkDialog
      initialHyperlink={{
        url: "https://example.test/old",
        name: " Old ",
        targetFrame: "custom",
        styleName: "Special",
        visitedStyleName: "Visited",
      }}
      onSubmit={submit}
      onCancel={cancel}
    />,
  );
  const url = screen.getByLabelText("URL"),
    frame = screen.getByLabelText("Target"),
    name = screen.getByLabelText("Name");
  expect(url).toHaveFocus();
  expect(frame).toHaveValue("custom");
  expect(name).toHaveValue(" Old ");
  expect(screen.queryByLabelText("Text")).toBeNull();
  expect(
    Array.from(
      document.querySelectorAll("datalist option"),
      /** Reads source order. @param option - Actual choice. @returns Raw target. */ (option) =>
        option.getAttribute("value"),
    ),
  ).toEqual(["", "_top", "_parent", "_blank", "_self"]);
  fireEvent.change(frame, { target: { value: " Content " } });
  fireEvent.change(name, { target: { value: "   " } });
  fireEvent.change(url, { target: { value: " https://example.test/new?x#part " } });
  fireEvent.submit(url.closest("form") as HTMLFormElement);
  expect(submit).toHaveBeenLastCalledWith(
    {
      url: "https://example.test/new?x#part",
      name: "   ",
      targetFrame: " Content ",
      styleName: "Special",
      visitedStyleName: "Visited",
    },
    "",
  );
  fireEvent.change(frame, { target: { value: "" } });
  fireEvent.change(name, { target: { value: "" } });
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(submit).toHaveBeenLastCalledWith(
    { url: "https://example.test/new?x#part", styleName: "Special", visitedStyleName: "Visited" },
    "",
  );
  fireEvent.change(url, { target: { value: "   " } });
  fireEvent.submit(url.closest("form") as HTMLFormElement);
  expect(submit).toHaveBeenCalledTimes(2);
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "ArrowDown" });
  fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
  expect(cancel).toHaveBeenCalledOnce();
});
it("removes queries immediately,keeps fragments and remembers checkbox preference even after cancel", /** Cancellation belongs to the document request,not the native module preference. @returns Nothing. */ () => {
  const submit = vi.fn(),
    cancel = vi.fn(),
    first = render(<WriterHyperlinkDialog onSubmit={submit} onCancel={cancel} />);
  const url = screen.getByLabelText("URL"),
    toggle = screen.getByRole("checkbox", { name: "Remove query string" });
  expect(toggle).not.toBeChecked();
  fireEvent.change(url, { target: { value: "https://example.test/a?x#part" } });
  fireEvent.click(toggle);
  expect(url).toHaveValue("https://example.test/a#part");
  fireEvent.change(url, { target: { value: "https://example.test/b?x#tail" } });
  expect(url).toHaveValue("https://example.test/b#tail");
  fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
  expect(submit).not.toHaveBeenCalled();
  first.unmount();
  render(<WriterHyperlinkDialog onSubmit={submit} onCancel={cancel} />);
  expect(screen.getByRole("checkbox")).toBeChecked();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.change(screen.getByLabelText("URL"), {
    target: { value: "https://example.test/new?raw" },
  });
  fireEvent.change(screen.getByLabelText("Text"), { target: { value: "Caption" } });
  fireEvent.click(screen.getByRole("button", { name: "Apply" }));
  expect(submit).toHaveBeenLastCalledWith({ url: "https://example.test/new?raw" }, "Caption");
});
it("focuses each mounted request rather than a global duplicate input ID", /** Multiple original frame clients own separate mounted refs. @returns Nothing. */ () => {
  const first = render(<WriterHyperlinkDialog onSubmit={vi.fn()} onCancel={vi.fn()} />);
  const firstURL = within(first.container).getByLabelText("URL");
  expect(firstURL).toHaveFocus();
  const second = render(<WriterHyperlinkDialog onSubmit={vi.fn()} onCancel={vi.fn()} />);
  expect(within(second.container).getByLabelText("URL")).toHaveFocus();
  expect(firstURL).not.toHaveFocus();
});

describe("Writer hyperlink dialog", /** Groups Writer hyperlink dialog. @returns Test callback result. */ () => {
  it("requires a destination and inserts link text and a new-window target", /** Checks requires a destination and inserts link text and a new-window target. @returns Test callback result. */ () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();
    render(<WriterHyperlinkDialog onCancel={onCancel} onSubmit={onSubmit} />);

    const url = screen.getByLabelText("URL");
    expect(url).toHaveFocus();
    fireEvent.submit(url.closest("form") as HTMLFormElement);
    expect(onSubmit).not.toHaveBeenCalled();

    fireEvent.change(url, { target: { value: "  https://example.com  " } });
    fireEvent.change(screen.getByLabelText("Text"), { target: { value: "Example" } });
    fireEvent.change(screen.getByLabelText("Target"), { target: { value: "_blank" } });
    fireEvent.click(screen.getByText("Apply"));
    expect(onSubmit).toHaveBeenCalledWith(
      { url: "https://example.com", targetFrame: "_blank" },
      "Example",
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("preserves an edited link's metadata and removes a cleared target", /** Checks preserves an edited link's metadata and removes a cleared target. @returns Test callback result. */ () => {
    const onSubmit = vi.fn();
    render(
      <WriterHyperlinkDialog
        initialHyperlink={{ url: "https://old.example", targetFrame: "_blank", name: "named" }}
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    expect(screen.queryByLabelText("Text")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("URL"), {
      target: { value: "https://new.example" },
    });
    fireEvent.change(screen.getByLabelText("Target"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "renamed" } });
    fireEvent.click(screen.getByText("Apply"));
    expect(onSubmit).toHaveBeenCalledWith({ url: "https://new.example", name: "renamed" }, "");
  });
});
