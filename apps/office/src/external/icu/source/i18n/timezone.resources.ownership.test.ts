/** @fileoverview Actual source resource-reference cleanup through system-zone construction, canonicalization and missing-ID failure. */
import { expect, it } from "vitest";
import { createSystemTimeZone } from "./timezone.create";
import { UnicodeString } from "../common/unistr";
import { entryOpenDirect, entryClose, ures_flushCache } from "../common/uresbund.entries";
it("releases root, alias, transition and final-rule temporary bundle references across repeated factory calls", /** Observable cached-entry counts catch leaked handles in the actual consumer chain. @returns Nothing. */ () => {
  const initial: [number] = [0],
    entry = entryOpenDirect(null, "zoneinfo64", initial);
  expect(initial[0]).toBe(0);
  expect(entry?.fCountExisting).toBe(1);
  try {
    for (let repeat = 0; repeat < 3; ++repeat)
      for (const id of ["UTC", "Europe/London", "America/New_York", "Asia/Kolkata", "Not/AZone"]) {
        const status: [number] = [0],
          zone = createSystemTimeZone(new UnicodeString(id), status);
        if (id === "Not/AZone") expect(zone).toBeNull();
        else {
          expect(status[0]).toBe(0);
          expect(zone).not.toBeNull();
        }
        expect(entry?.fCountExisting).toBe(1);
      }
    for (const name of ["keyTypeData", "timezoneTypes"]) {
      const status: [number] = [0],
        resource = entryOpenDirect(null, name, status);
      try {
        expect(status[0]).toBe(0);
        expect(resource?.fCountExisting).toBe(1);
      } finally {
        entryClose(resource);
      }
    }
  } finally {
    entryClose(entry);
    ures_flushCache();
  }
});
