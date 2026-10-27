/** @fileoverview Checks ICU transition-rule copy ownership and explicitly qualified TimeZone base identity/savings semantics on real recurring zones. */
import { expect, it } from "vitest";
import { DateTimeRule, DateRuleType, TimeRuleType } from "./dtrule";
import { SimpleTimeZone } from "./simpletz";
import { TimeZone } from "./timezone";
import { UnicodeString } from "../common/unistr";

/** Exposes the native protected base-assignment operation on an actual recurring timezone. */
class IdentityZone extends SimpleTimeZone {
  /** Assigns identity independently of derived numeric rule assignment. @param source - Actual base owner. @returns This zone. */
  assignIdentity(source: TimeZone): this {
    return this.assignBase(source);
  }
}

it("copies date rules independently and retains opposite on-or-after/on-or-before modes", /** Uses actual source constructor overloads, clone and assignment boundaries. @returns Nothing. */ () => {
  const after = new DateTimeRule(2, 8, 1, true, 7200000, TimeRuleType.WALL_TIME),
    before = new DateTimeRule(2, 14, 1, false, 7200000, TimeRuleType.WALL_TIME),
    copy = before.clone();
  expect(after.getDateRuleType()).toBe(DateRuleType.DOW_GEQ_DOM);
  expect(before.getDateRuleType()).toBe(DateRuleType.DOW_LEQ_DOM);
  expect(copy).not.toBe(before);
  expect(copy.equals(before)).toBe(true);
  expect(before.assign(before)).toBe(before);
  expect(copy.assign(after)).toBe(copy);
  expect(copy.equals(after)).toBe(true);
  expect(before.getRuleDayOfMonth()).toBe(14);
  expect(before.equals(after)).toBe(false);
});

it("keeps base identity assignment separate from real derived offset and DST state", /** Explicitly qualified source base behavior must not overwrite timezone rules or alias donor IDs. @returns Nothing. */ () => {
  const receiver = new IdentityZone(1234, new UnicodeString("Receiver")),
    donor = new SimpleTimeZone(9876, new UnicodeString("Donor")),
    id = new UnicodeString();
  expect(receiver.assignIdentity(receiver)).toBe(receiver);
  expect(receiver.assignIdentity(donor)).toBe(receiver);
  expect(receiver.getID(id).equals(new UnicodeString("Donor"))).toBe(true);
  expect(receiver.getRawOffset()).toBe(1234);
  donor.setID(new UnicodeString("Changed"));
  expect(receiver.getID(id).equals(new UnicodeString("Donor"))).toBe(true);
  expect(TimeZone.prototype.getDSTSavings.call(receiver)).toBe(0);
  const status: [number] = [0],
    seasonal = new SimpleTimeZone(
      -18000000,
      new UnicodeString("Seasonal"),
      2,
      2,
      1,
      7200000,
      10,
      1,
      1,
      7200000,
      1800000,
      status,
    );
  expect(status[0]).toBe(0);
  expect(seasonal.getDSTSavings()).toBe(1800000);
  expect(TimeZone.prototype.getDSTSavings.call(seasonal)).toBe(3600000);
});
