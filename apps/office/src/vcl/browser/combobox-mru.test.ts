/** @fileoverview Pinned GTK weld MRU text transitions,including original reverse restoration and tail-duplicate behavior. */
import { expect, it } from "vitest";
import { getComboBoxMruEntries, restoreComboBoxMru, updateComboBoxMru } from "./combobox-mru";
it("restores only exact available names in reverse source insertion order without applying the maximum", /** The GTK source prepends each restored row and does not deduplicate. @returns Nothing. */ () => {
  expect(restoreComboBoxMru(["Alpha", "Missing", "Beta", "alpha"], ["Alpha", "Beta"])).toEqual([
    "Beta",
    "Alpha",
  ]);
  const names = ["A", "B", "C", "D", "E", "F"];
  expect(restoreComboBoxMru(names, names)).toEqual([...names].reverse());
  expect(restoreComboBoxMru(["Alpha", "Alpha"], ["Alpha"])).toEqual(["Alpha", "Alpha"]);
});
it("preserves the original duplicate search exclusion of the old last MRU row", /** This is a source defect below the maximum,not a browser deduplication choice. @returns Nothing. */ () => {
  const original = ["Alpha", "Beta"];
  expect(updateComboBoxMru(original, "Beta", 5)).toEqual(["Beta", "Alpha", "Beta"]);
  expect(original).toEqual(["Alpha", "Beta"]);
  expect(updateComboBoxMru(["Alpha", "Beta", "Gamma"], "Beta", 5)).toEqual([
    "Beta",
    "Alpha",
    "Gamma",
  ]);
});
it("trims at the configured maximum and clears history when the native count is zero", /** Exact typed values are retained,including unknown and empty active names. @returns Nothing. */ () => {
  expect(updateComboBoxMru(["A", "B", "C", "D", "E"], "F", 5)).toEqual(["F", "A", "B", "C", "D"]);
  expect(updateComboBoxMru(["A", "B"], "F", 0)).toEqual([]);
  expect(updateComboBoxMru(["A"], "", 5)).toEqual(["", "A"]);
  expect(getComboBoxMruEntries(["", "A", "A"])).toEqual(["A", "A"]);
});
