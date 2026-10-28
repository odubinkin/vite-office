/** @fileoverview Independently compiled original LibreOffice temporal methods exercise genuine Gregorian, era, Hijri and Jewish service owners; ICU calendars alone are a distinct contract. */
import { expect, it } from "vitest";
import observations from "./temporal.native-observations.json";
import {
  Calendar_gregorian,
  Calendar_gengou,
  Calendar_ROC,
  Calendar_dangi,
  Calendar_buddhist,
} from "./calendar_gregorian";
import { Calendar_hijri } from "./calendar_hijri";
import { Calendar_jewish } from "./calendar_jewish";
import { unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";

const owners = [
  Calendar_gregorian,
  Calendar_gengou,
  Calendar_ROC,
  Calendar_dangi,
  Calendar_buddhist,
  Calendar_hijri,
  Calendar_jewish,
];
it.each(
  owners.map(
    /** Retains native service identities. @param Owner - Actual original owner. @param index - Native type. @returns Test identity. */
    (Owner, index) => [Owner, index] as const,
  ),
)(
  "matches original temporal service %s (native type %i)",
  /** Uses only public timezone/local-time/pending-field APIs; source validity and all17 fields are independent native expectations. @param Owner - Actual class. @param type - Native type. @returns Nothing. */
  (Owner, type) => {
    const rows = observations.cases.filter(
      /** Selects native queries for one real owner family. @param row - Native input/output. @returns Whether selected. */
      (row) => Number(row[0]?.split(" ")[0]) === type,
    );
    expect(rows.length).toBeGreaterThan(300);
    for (const [query, native] of rows) {
      const parts = (query as string).split(" "),
        cal = new Owner(),
        id = unicode(parts[1] as string);
      try {
        cal.setTimeZone(id);
        cal.setLocalDateTime(Number(parts[2]));
        for (let i = 0; i < Number(parts[3]); ++i)
          cal.setValue(Number(parts[4 + i * 2]), Number(parts[5 + i * 2]));
        const actual = [Number(cal.isValid()), cal.getDateTime(), cal.getLocalDateTime()];
        for (let field = 0; field < 17; ++field) actual.push(cal.getValue(field));
        expect(actual, query).toEqual((native as string).trim().split(/\s+/).map(Number));
      } finally {
        id.dispose();
        cal.dispose();
      }
    }
  },
);
