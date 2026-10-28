/** @fileoverview Compares real ICU78.3 standard calendar owners and inherited public field/time paths, before assembling the general Calendar factory. Explicit type constructors in this witness are test inputs, not production fallback dispatch. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { Locale } from "../apps/office/src/external/icu/source/common/locid.ts";
import { GregorianCalendar } from "../apps/office/src/external/icu/source/i18n/gregocal.ts";
import { BuddhistCalendar } from "../apps/office/src/external/icu/source/i18n/buddhcal.ts";
import { TaiwanCalendar } from "../apps/office/src/external/icu/source/i18n/taiwncal.ts";
import { ISO8601Calendar } from "../apps/office/src/external/icu/source/i18n/iso8601cal.ts";
import { CopticCalendar } from "../apps/office/src/external/icu/source/i18n/coptccal.ts";
import {
  EthiopicCalendar,
  EthiopicAmeteAlemCalendar,
} from "../apps/office/src/external/icu/source/i18n/ethpccal.ts";
import { PersianCalendar } from "../apps/office/src/external/icu/source/i18n/persncal.ts";
import { IndianCalendar } from "../apps/office/src/external/icu/source/i18n/indiancal.ts";
import { ChineseCalendar } from "../apps/office/src/external/icu/source/i18n/chnsecal.ts";
import { DangiCalendar } from "../apps/office/src/external/icu/source/i18n/dangical.ts";
import {
  IslamicCalendar,
  IslamicCivilCalendar,
  IslamicTBLACalendar,
  IslamicRGSACalendar,
  IslamicUmalquraCalendar,
} from "../apps/office/src/external/icu/source/i18n/islamcal.ts";
import { JapaneseCalendar } from "../apps/office/src/external/icu/source/i18n/japancal.ts";
import { HebrewCalendar } from "../apps/office/src/external/icu/source/i18n/hebrwcal.ts";
import { SimpleTimeZone } from "../apps/office/src/external/icu/source/i18n/simpletz.ts";
import { adoptDefault } from "../apps/office/src/external/icu/source/i18n/timezone.default.ts";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
const build = resolve("output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
writeFileSync(
  `${build}/standard-calendar-witness.cc`,
  String.raw`
#include "unicode/gregocal.h"
#include "unicode/simpletz.h"
#include "unicode/putil.h"
#include "unicode/uloc.h"
#include "buddhcal.h"
#include "taiwncal.h"
#include "iso8601cal.h"
#include "coptccal.h"
#include "ethpccal.h"
#include "persncal.h"
#include "indiancal.h"
#include "hebrwcal.h"
#include "japancal.h"
#include "islamcal.h"
#include "chnsecal.h"
#include "dangical.h"
#include <iostream>
#include <iomanip>
#include <memory>
using namespace icu;
int main(int argc,char**argv){u_setDataDirectory(argv[1]);UErrorCode init=U_ZERO_ERROR;uloc_setDefault("en_US",&init);TimeZone::adoptDefault(new SimpleTimeZone(0,UnicodeString(u"UTC")));char op;int type,strict,initial,copy,count,f,v;std::string loc;double time;while(std::cin>>op>>type>>loc>>strict>>initial>>copy){UErrorCode s=U_ZERO_ERROR;std::unique_ptr<Calendar>cal;Locale l(loc=="-"?"":loc.c_str());switch(type){case 0:cal.reset(new GregorianCalendar(l,s));break;case 1:cal.reset(new BuddhistCalendar(l,s));break;case 2:cal.reset(new TaiwanCalendar(l,s));break;case 3:cal.reset(new ISO8601Calendar(l,s));break;case 4:cal.reset(new CopticCalendar(l,s));break;case 5:cal.reset(new EthiopicCalendar(l,s));break;case 6:cal.reset(new EthiopicAmeteAlemCalendar(l,s));break;case 7:cal.reset(new PersianCalendar(l,s));break;case 8:cal.reset(new IndianCalendar(l,s));break;case 9:cal.reset(new HebrewCalendar(l,s));break;case 10:cal.reset(new JapaneseCalendar(l,s));break;case 11:cal.reset(new IslamicCalendar(l,s));break;case 12:cal.reset(new IslamicCivilCalendar(l,s));break;case 13:cal.reset(new IslamicTBLACalendar(l,s));break;case 14:cal.reset(new IslamicRGSACalendar(l,s));break;case 15:cal.reset(new IslamicUmalquraCalendar(l,s));break;case 16:cal.reset(new ChineseCalendar(l,s));break;case 17:cal.reset(new DangiCalendar(l,s));break;}
std::cout<<int(s)<<' '<<cal->getType()<<' '<<cal->getFirstDayOfWeek()<<' '<<int(cal->getMinimalDaysInFirstWeek());cal->adoptTimeZone(new SimpleTimeZone(0,UnicodeString(u"UTC")));s=U_ZERO_ERROR;cal->setTime(0,s);cal->setLenient(!strict);if(op=='F'){cal->clear();std::cin>>count;for(int i=0;i<count;++i){std::cin>>f>>v;cal->set(UCalendarDateFields(f),v);}}else{std::cin>>time;cal->setTime(time,s);}if(copy)cal.reset(cal->clone());s=UErrorCode(initial);std::cout<<' '<<std::setprecision(17)<<cal->getTime(s)<<' '<<int(s);for(int i=0;i<UCAL_FIELD_COUNT;++i)std::cout<<' '<<cal->get(UCalendarDateFields(i),s);std::cout<<' '<<int(s);for(int i=0;i<UCAL_FIELD_COUNT;++i)std::cout<<' '<<cal->getMinimum(UCalendarDateFields(i))<<' '<<cal->getGreatestMinimum(UCalendarDateFields(i))<<' '<<cal->getLeastMaximum(UCalendarDateFields(i))<<' '<<cal->getMaximum(UCalendarDateFields(i));std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/standard-calendar-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/standard-calendar-witness`,
  ],
  { stdio: "inherit" },
);
Locale.setDefault(new Locale("en_US"), [0]);
adoptDefault(new SimpleTimeZone(0, new UnicodeString("UTC")));
const classes = [
  GregorianCalendar,
  BuddhistCalendar,
  TaiwanCalendar,
  ISO8601Calendar,
  CopticCalendar,
  EthiopicCalendar,
  EthiopicAmeteAlemCalendar,
  PersianCalendar,
  IndianCalendar,
  HebrewCalendar,
  JapaneseCalendar,
  IslamicCalendar,
  IslamicCivilCalendar,
  IslamicTBLACalendar,
  IslamicRGSACalendar,
  IslamicUmalquraCalendar,
  ChineseCalendar,
  DangiCalendar,
];
const input = [],
  expected = [];
/** Executes an actual calendar with public fields and source dependency owners. @param type - Constructor input. @param loc - Locale. @param fields - Set fields/null. @param time - Explicit UTC. @param strict - Strict mode. @param incoming - Status. @param copy - Clone before completion. @returns Nothing. */
function add(type, loc, fields, time = 0, strict = 0, incoming = 0, copy = 0) {
  const mode = fields === null ? "T" : "F";
  input.push(
    `${mode} ${type} ${loc || "-"} ${strict} ${incoming} ${copy} ` +
      (fields === null ? String(time) : [fields.length, ...fields.flat()].join(" ")),
  );
  const s = [0];
  let cal = new classes[type](new Locale(loc), s);
  const out = [s[0], cal.getType(), cal.getFirstDayOfWeek(), cal.getMinimalDaysInFirstWeek()];
  cal.adoptTimeZone(new SimpleTimeZone(0, new UnicodeString("UTC")));
  s[0] = 0;
  cal.setTime(0, s);
  cal.setLenient(!strict);
  if (fields !== null) {
    cal.clear();
    for (const [f, v] of fields) cal.set(f, v);
  } else cal.setTime(time, s);
  if (copy) cal = cal.clone();
  s[0] = incoming;
  out.push(cal.getTime(s), s[0]);
  for (let i = 0; i < 24; ++i) out.push(cal.get(i, s));
  out.push(s[0]);
  for (let i = 0; i < 24; ++i)
    out.push(
      cal.getMinimum(i),
      cal.getGreatestMinimum(i),
      cal.getLeastMaximum(i),
      cal.getMaximum(i),
    );
  expected.push(out);
}
for (let type = 0; type < classes.length; ++type) {
  for (const loc of [
    "root",
    "en_US",
    "en_GB",
    "th_TH",
    "fa_IR",
    "he_IL",
    "en_US@fw=wed",
    "en_US@rg=gbzzzz",
  ]) {
    for (const time of [
      -1e15, -180799862400000, -62167219200000, -12219292800000, -1e12, -0.25, 0, 1e12,
      1710000000000, 1e15,
    ])
      for (const copy of [0, 1]) add(type, loc, null, time, 0, 0, copy);
    for (const year of [-1000, 0, 1, 78, 1582, 1900, 2000, 2024, 5784])
      for (const strict of [0, 1])
        add(
          type,
          loc,
          [
            [1, year],
            [2, 1],
            [5, 30],
          ],
          0,
          strict,
        );
  }
  for (const month of [-25, -1, 0, 5, 11, 12, 13, 235])
    for (const strict of [0, 1])
      for (const incoming of [0, -128, 1])
        add(
          type,
          "en_US",
          [
            [19, 2024],
            [2, month],
            [5, 1],
          ],
          0,
          strict,
          incoming,
        );
  for (const fields of [
    [
      [1, 5783],
      [23, 6],
      [5, 1],
    ],
    [
      [1, 5784],
      [23, 6],
      [5, 1],
    ],
    [
      [0, 3],
      [1, 2024],
      [2, 0],
      [5, 1],
    ],
    [
      [1, 1502],
      [2, 11],
      [5, 30],
    ],
    [
      [1, 1503],
      [2, 11],
      [5, 30],
    ],
  ])
    add(type, "en_US", fields, 0, 1);
}
const rows = execFileSync(`${build}/standard-calendar-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
for (let i = 0; i < expected.length; ++i) {
  const native = rows[i]?.split(" "),
    local = expected[i];
  if (native?.length !== local.length) throw Error(`Row length ${i}`);
  for (let k = 0; k < local.length; ++k)
    if (
      typeof local[k] === "string"
        ? local[k] !== native[k]
        : Number(native[k]) !== local[k] &&
          !(Number.isNaN(Number(native[k])) && Number.isNaN(local[k]))
    )
      throw Error(
        `Standard calendar mismatch ${i} col${k}: ${input[i]}\nC++ ${rows[i]}\nTS ${local.join(" ")}`,
      );
}
writeFileSync(
  `${build}/standard-calendar-comparison.json`,
  JSON.stringify(
    {
      result: "pass",
      cases: input.length,
      types: classes.length,
      scope:
        "Real constructors/clones, inherited public time/field resolution, ordinal month precedence, strict/lenient validation and limit matrices; unconsumed add/roll/century/temporal-month-code APIs remain unported",
    },
    null,
    2,
  ) + "\n",
);
process.stdout.write(`Matched ${input.length} standard calendar cases\n`);
