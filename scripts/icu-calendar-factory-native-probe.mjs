/** @fileoverview Compares ICU Calendar factory/cache type identity, default/locale/adopt/reference overloads and bounded type-buffer writes against unchanged ICU78.3 libraries. Service registration and allocation failures remain outside this witness. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createInstance,
  createInstanceFromZoneReference,
  getCalendarTypeFromLocale,
} from "../apps/office/src/external/icu/source/i18n/calendar.factory.ts";
import { gCalTypes } from "../apps/office/src/external/icu/source/i18n/calendar.type.ts";
import { Locale } from "../apps/office/src/external/icu/source/common/locid.ts";
import { SimpleTimeZone } from "../apps/office/src/external/icu/source/i18n/simpletz.ts";
import { adoptDefault } from "../apps/office/src/external/icu/source/i18n/timezone.default.ts";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
const build = resolve("output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
writeFileSync(
  `${build}/factory-witness.cc`,
  String.raw`
#include "unicode/calendar.h"
#include "unicode/simpletz.h"
#include "unicode/putil.h"
#include "sharedcalendar.h"
#include <iostream>
#include <typeinfo>
#include <memory>
#include <cstring>
using namespace icu;
int main(int argc,char**argv){u_setDataDirectory(argv[1]);UErrorCode s=U_ZERO_ERROR;Locale::setDefault(Locale("en_US"),s);TimeZone::adoptDefault(new SimpleTimeZone(0,UnicodeString(u"UTC")));std::cout<<typeid(SharedCalendar).name()<<'\n';char op;std::string name;int mode,incoming,capacity;while(std::cin>>op>>name>>mode>>incoming>>capacity){Locale l(name=="-"?"":name.c_str());s=UErrorCode(incoming);if(op=='B'){char buffer[32];memset(buffer,0x58,sizeof(buffer));Calendar::getCalendarTypeFromLocale(l,buffer,capacity,s);std::cout<<int(s);for(int i=0;i<32;++i)std::cout<<' '<<int(uint8_t(buffer[i]));}else{std::unique_ptr<Calendar>c;SimpleTimeZone reference(20700000,UnicodeString(u"Reference"));switch(mode){case 0:c.reset(Calendar::createInstance(s));break;case 1:c.reset(Calendar::createInstance(l,s));break;case 2:c.reset(Calendar::createInstance(new SimpleTimeZone(-18000000,UnicodeString(u"Adopted")),l,s));break;case 3:c.reset(Calendar::createInstance(static_cast<TimeZone*>(nullptr),l,s));break;case 4:c.reset(Calendar::createInstance(reference,l,s));break;}std::cout<<int(s)<<' '<<bool(c);if(c){UnicodeString id;c->getTimeZone().getID(id);std::string text;id.toUTF8String(text);std::cout<<' '<<c->getType()<<' '<<text<<' '<<c->getFirstDayOfWeek()<<' '<<int(c->getMinimalDaysInFirstWeek());s=U_ZERO_ERROR;c->setTime(0,s);for(int f=0;f<UCAL_FIELD_COUNT;++f)std::cout<<' '<<c->get(UCalendarDateFields(f),s);std::cout<<' '<<int(s);}}std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/factory-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/factory-witness`,
  ],
  { stdio: "inherit" },
);
Locale.setDefault(new Locale("en_US"), [0]);
adoptDefault(new SimpleTimeZone(0, new UnicodeString("UTC")));
const inputs = [],
  expected = [],
  names = [
    "",
    "root",
    "en_US",
    "th_TH",
    "fa_IR",
    "ja_JP_TRADITIONAL",
    "ar_SA",
    "he_IL",
    "en@rg=thzzzz",
    "en@calendar=missing",
    "en@timezone=usnyc",
    ...gCalTypes.map(
      /** Constructs source calendar keyword input. @param name - Type. @returns Locale name. */ (
        name,
      ) => "en@calendar=" + name,
    ),
    ...Object.keys(
      JSON.parse(
        readFileSync("apps/office/src/external/icu/source/data/in/icudt78l.resources.json", "utf8"),
      ).bundles,
    ),
  ];
for (const name of names)
  for (const mode of [0, 1, 2, 3, 4])
    for (const incoming of [0, -128, 1]) {
      const s = [incoming],
        locale = new Locale(name);
      let c;
      switch (mode) {
        case 0:
          c = createInstance(s);
          break;
        case 1:
          c = createInstance(locale, s);
          break;
        case 2:
          c = createInstance(
            new SimpleTimeZone(-18000000, new UnicodeString("Adopted")),
            locale,
            s,
          );
          break;
        case 3:
          c = createInstance(null, locale, s);
          break;
        case 4:
          c = createInstanceFromZoneReference(
            new SimpleTimeZone(20700000, new UnicodeString("Reference")),
            locale,
            s,
          );
          break;
      }
      const row = [s[0], Number(c !== null)];
      if (c) {
        row.push(
          c.getType(),
          c.getTimeZone().getID(new UnicodeString()).getBuffer(),
          c.getFirstDayOfWeek(),
          c.getMinimalDaysInFirstWeek(),
        );
        s[0] = 0;
        c.setTime(0, s);
        for (let f = 0; f < 24; ++f) row.push(c.get(f, s));
        row.push(s[0]);
      }
      expected.push(row.join(" "));
      inputs.push(`F ${name || "-"} ${mode} ${incoming} 0`);
    }
for (const name of names.slice(0, 29))
  for (const capacity of [1, 2, 8, 16, 32])
    for (const incoming of [0, -128, 1]) {
      const s = [incoming],
        buffer = new Uint8Array(32).fill(0x58);
      getCalendarTypeFromLocale(new Locale(name), buffer, capacity, s);
      inputs.push(`B ${name || "-"} 0 ${incoming} ${capacity}`);
      expected.push([s[0], ...buffer].join(" "));
    }
const rows = execFileSync(`${build}/factory-witness`, [`${source}/data/in`], {
    input: inputs.join("\n") + "\n",
    encoding: "utf8",
    maxBuffer: 32e6,
  })
    .trimEnd()
    .split("\n"),
  typeName = rows.shift();
if (typeName !== "N6icu_7814SharedCalendarE")
  throw Error("Unexpected original template RTTI identity " + typeName);
if (rows.length !== expected.length) throw Error("Factory case count");
for (let i = 0; i < rows.length; ++i)
  if (rows[i] !== expected[i])
    throw Error(`Factory ${i}: ${inputs[i]}\nnative ${rows[i]}\nlocal ${expected[i]}`);
console.log(
  `Matched ${rows.length} native Calendar factory/cache/positive-capacity type-buffer cases; RTTI ${typeName}.`,
);
