/** @fileoverview Original numeric font toolbox lifecycle over actual FontSizeBox; callbacks represent only platform focus and dispatch. */
import { expect, it } from "vitest";
import { FontSizeBox } from "../../../svtools/source/control/ctrlbox";
import { SvxFontSizeBox_Base } from "./tbunocontroller";

it("retains editable text without dispatch and accepts actual list picks after focus release", /** Browser text is not document formatting until native acceptance. @returns Nothing. */ () => {
  const events: (number | string)[] = [],
    box = new FontSizeBox(".", "");
  const owner = new SvxFontSizeBox_Base(
    box,
    /** Records the real command boundary value. @param value - Point float. @returns Nothing. */ (
      value,
    ) => {
      events.push(value);
    },
    /** Records the real frame focus boundary. @returns Nothing. */ () => {
      events.push("focus");
    },
  );
  expect(box.get_active_text()).toBe("");
  owner.UpdateFont();
  expect(box.GetEntries()).toHaveLength(32);
  owner.statusChanged_Impl(120, false);
  expect(box.get_active_text()).toBe("12 pt");
  box.set_active_or_entry_text("13.3");
  owner.SelectHdl(false);
  expect(events).toEqual([]);
  owner.SelectHdl(true);
  expect(events).toEqual(["focus", 13.300000190734863]);
  owner.statusChanged_Impl(133, false);
  expect(box.get_active_text()).toBe("13.3");
  box.set_active_or_entry_text("13.7");
  expect(owner.ActivateHdl()).toBe(true);
  expect(events.slice(-2)).toEqual(["focus", 13.699999809265137]);
});

it("keeps native Tab, Escape, mixed status and composite focus departure distinct", /** Parent sidebar navigation receives unconsumed Escape; Tab does not refocus the document. @returns Nothing. */ () => {
  const events: (number | string)[] = [],
    box = new FontSizeBox(",", ".");
  const owner = new SvxFontSizeBox_Base(
    box,
    /** Observes actual acceptance. @param value - Points. @returns Nothing. */ (value) => {
      events.push(value);
    },
    /** Observes frame focus. @returns Nothing. */ () => {
      events.push("focus");
    },
  );
  owner.statusChanged_Impl(105, false);
  box.set_active_or_entry_text("14");
  expect(owner.DoKeyInput("ArrowLeft", false)).toBe(false);
  expect(owner.DoKeyInput("Tab", false)).toBe(false);
  expect(events).toEqual([14]);
  owner.statusChanged_Impl(140, false);
  box.set_active_or_entry_text("99");
  expect(owner.DoKeyInput("Escape", true)).toBe(false);
  expect(box.get_active_text()).toBe("14");
  expect(events).toEqual([14]);
  expect(owner.DoKeyInput("Escape", false)).toBe(true);
  expect(events).toEqual([14, "focus"]);
  box.set_active_or_entry_text("88");
  owner.FocusOutHdl(true);
  expect(box.get_active_text()).toBe("88");
  owner.FocusOutHdl(false);
  expect(box.get_active_text()).toBe("14");
  owner.statusChanged_Impl(0, true);
  expect(box.get_active_text()).toBe("");
  owner.UpdateFont();
  expect(box.get_active_text()).toBe("2 pt");
});
