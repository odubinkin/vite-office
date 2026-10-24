/** @fileoverview Native font-name acceptance and controller focus contracts over the actual shared editable ComboBox. */
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FontNameSelect } from "./FontSelects";
import { FontList } from "../../../svtools/browser/font-list";
import { FONT_MRU_STORAGE_KEY } from "../../../svtools/browser/font-mru-store";
const names = ["Alpha", "Beta"];
it("loads source MRU order,updates it after direct picks and saves on actual unmount", /** Recent rows remain separate from the actual main font inventory. @returns Completion. */ async () => {
  window.localStorage.setItem(FONT_MRU_STORAGE_KEY, "Alpha;Beta\n\n");
  const f = await fixture();
  fireEvent.click(screen.getByRole("button", { name: "Show Family" }));
  expect(
    screen
      .getAllByRole("option")
      .map(
        /** Reads real popup names. @param option - Actual row. @returns Text. */ (option) =>
          option.textContent,
      ),
  ).toEqual(["Beta", "Alpha", "Alpha", "Beta"]);
  fireEvent.click(screen.getAllByRole("option", { name: "Alpha" })[1] as HTMLElement);
  expect(f.trace).toEqual(["focus", "Alpha"]);
  expect(window.localStorage.getItem(FONT_MRU_STORAGE_KEY)).toBe("Alpha;Beta\n\n");
  fireEvent(window, new Event("pagehide"));
  expect(window.localStorage.getItem(FONT_MRU_STORAGE_KEY)).toBe("Alpha;Beta;Alpha\n\n");
  cleanup();
  expect(window.localStorage.getItem(FONT_MRU_STORAGE_KEY)).toBe("Alpha;Beta;Alpha\n\n");
});
it("keeps Tab acceptance out of MRU and preserves current history across refills", /** Native entry activation/direct picks update history;Tab and travel do not. @returns Completion. */ async () => {
  vi.spyOn(FontList, "FromBrowser").mockResolvedValue(new FontList(names));
  const select = vi.fn(),
    props = { value: "Alpha", enabled: true, label: "History", onSelect: select };
  const tree = render(<FontNameSelect {...props} />);
  await act(
    /** Settles native font inventory publication. @returns Completion. */ async () => {
      await Promise.resolve();
    },
  );
  const box = screen.getByRole("combobox", { name: "History" });
  fireEvent.change(box, { target: { value: "Beta" } });
  fireEvent.keyDown(box, { key: "Tab" });
  fireEvent.click(screen.getByRole("button", { name: "Show History" }));
  expect(screen.getAllByRole("option")).toHaveLength(2);
  fireEvent.click(screen.getByRole("option", { name: "Beta" }));
  window.localStorage.setItem(FONT_MRU_STORAGE_KEY, "Alpha\n\n");
  tree.rerender(<FontNameSelect {...props} enabled={false} />);
  tree.rerender(<FontNameSelect {...props} />);
  await act(
    /** Settles the new real inventory. @returns Completion. */ async () => {
      await Promise.resolve();
    },
  );
  fireEvent.click(screen.getByRole("button", { name: "Show History" }));
  expect(
    screen
      .getAllByRole("option")
      .map(
        /** Reads actual ordered text. @param option - Row. @returns Text. */ (option) =>
          option.textContent,
      ),
  ).toEqual(["Beta", "Alpha", "Beta"]);
  tree.unmount();
  expect(window.localStorage.getItem(FONT_MRU_STORAGE_KEY)).toBe("Beta\n\n");
});
afterEach(
  /** Releases actual widget fixtures and font enumeration instrumentation. @returns Nothing. */ () => {
    cleanup();
    vi.restoreAllMocks();
    window.localStorage.removeItem(FONT_MRU_STORAGE_KEY);
  },
);

/** Composes a real input/document focus owner and observes accepted native font values. @param inSidebar - Native controller placement. @returns Widget and ordered observations. */
async function fixture(inSidebar = false) {
  vi.spyOn(FontList, "FromBrowser").mockResolvedValue(new FontList(names));
  const trace: string[] = [];
  render(
    <>
      <input aria-label="Document client" />
      <FontNameSelect
        value="Alpha"
        enabled
        label="Family"
        inSidebar={inSidebar}
        onSelect={
          /** Observes exact native accepted names. @param item - Actual SvxFontItem. @returns Nothing. */ (
            item,
          ) => {
            trace.push(item.GetFamilyName());
          }
        }
        focusDocument={
          /** Releases focus before the controller dispatches. @returns Nothing. */ () => {
            trace.push("focus");
            screen.getByLabelText("Document client").focus();
          }
        }
      />
    </>,
  );
  await act(
    /** Settles actual inventory publication. @returns Completion. */ async () => {
      await Promise.resolve();
    },
  );
  return { box: screen.getByRole("combobox", { name: "Family" }), trace };
}

it("accepts direct picks once and releases document focus before the accepted native item", /** Checks native direct-pick ownership and popup names. @returns Completion. */ async () => {
  const f = await fixture();
  fireEvent.click(screen.getByRole("button", { name: "Show Family" }));
  fireEvent.click(screen.getByRole("option", { name: "Beta" }));
  expect(f.trace).toEqual(["focus", "Beta"]);
  expect(screen.getByLabelText("Document client")).toHaveFocus();
});

it("keeps travel tentative, accepts raw missing names and leaves Tab to normal focus traversal", /** Checks exact typed text without inventing installed list rows. @returns Completion. */ async () => {
  const f = await fixture();
  f.box.focus();
  fireEvent.keyDown(f.box, { key: "ArrowDown" });
  expect(f.box).toHaveValue("Beta");
  expect(f.trace).toEqual([]);
  fireEvent.keyDown(f.box, { key: "Enter" });
  expect(f.trace).toEqual(["focus", "Beta"]);
  f.box.focus();
  fireEvent.change(f.box, { target: { value: "Missing: & 字" } });
  fireEvent.click(screen.getByRole("button", { name: "Show Family" }));
  expect(screen.queryByRole("option", { name: "Missing: & 字" })).toBeNull();
  fireEvent.keyDown(f.box, { key: "Tab", shiftKey: true });
  expect(f.trace).toEqual(["focus", "Beta", "Missing: & 字"]);
  expect(f.box).toHaveFocus();
});

it.each([false, true])(
  "restores the saved font on Escape with sidebar=%s",
  /** Pins native toolbar release and sidebar bubbling. @param sidebar - Source placement. @returns Completion. */ async (
    sidebar,
  ) => {
    const f = await fixture(sidebar);
    f.box.focus();
    fireEvent.change(f.box, { target: { value: "Tentative" } });
    const consumed = !fireEvent.keyDown(f.box, { key: "Escape" });
    expect(consumed).toBe(!sidebar);
    expect(f.box).toHaveValue("Alpha");
    expect(f.trace).toEqual(sidebar ? [] : ["focus"]);
  },
);

it("retains typed input when asynchronous inventory replaces rows but the parent assignment is unchanged", /** Preserves user editing across real browser enumeration completion. @returns Completion. */ async () => {
  let finish: (fonts: FontList) => void = /** Initial completion owner. @returns Nothing. */ () =>
    undefined;
  vi.spyOn(FontList, "FromBrowser").mockReturnValue(
    new Promise(
      /** Captures actual asynchronous completion. @param resolve - Inventory completion. @returns Nothing. */ (
        resolve,
      ) => {
        finish = resolve;
      },
    ),
  );
  const select = vi.fn();
  render(<FontNameSelect value="Alpha" enabled label="Async" onSelect={select} />);
  const box = screen.getByRole("combobox", { name: "Async" });
  fireEvent.change(box, { target: { value: "User draft" } });
  await act(
    /** Publishes a new inventory while typing. @returns Completion. */ async () => {
      finish(new FontList(names));
      await Promise.resolve();
    },
  );
  expect(box).toHaveValue("User draft");
  fireEvent.keyDown(box, { key: "Enter" });
  expect(select.mock.calls[0]?.[0].GetFamilyName()).toBe("User draft");
  fireEvent.keyDown(box, { key: "Escape" });
});

it("retains a mixed/absent value without creating an empty installed-family option", /** Checks unavailable default assignment and inactive bindings. @returns Nothing. */ () => {
  const select = vi.fn();
  render(<FontNameSelect value={undefined} enabled={false} label="Inactive" onSelect={select} />);
  const box = screen.getByRole("combobox", { name: "Inactive" });
  expect(box).toHaveValue("");
  expect(box).toBeDisabled();
  fireEvent.keyDown(box, { key: "Enter" });
  expect(select).not.toHaveBeenCalled();
});

it("keeps fallback rows readable during inventory loading and does not warn for an available embedded face", /** The actual popup opens before device inventory resolves;no physical glyph data is fabricated. @returns Completion. */ async () => {
  let complete: (list: FontList) => void = /** Initial unused callback. @returns Nothing. */ () =>
    undefined;
  const pending = new Promise<FontList>(
    /** Holds actual font inventory publication. @param resolve - Completion callback. @returns Nothing. */ (
      resolve,
    ) => {
      complete = resolve;
    },
  );
  vi.spyOn(FontList, "FromBrowser").mockReturnValue(pending);
  render(
    <FontNameSelect
      value="Alpha"
      enabled
      label="Pending family"
      onSelect={vi.fn()}
      embeddedFontFamilies={["Alpha"]}
      fontAvailability={{ Alpha: true }}
      unavailableFontMessage="Unavailable"
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Show Pending family" }));
  expect(screen.getByRole("option", { name: "Arial" })).toHaveTextContent("Arial");
  expect(screen.queryByRole("status")).toBeNull();
  await act(
    /** Publishes real inventory while the native popup is open. @returns Completion. */ async () => {
      complete(new FontList(["Alpha", "Beta"]));
      await pending;
    },
  );
  expect(screen.getByRole("option", { name: "Beta" })).toHaveTextContent("Beta");
});
