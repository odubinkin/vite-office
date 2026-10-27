/** @fileoverview Checks public timezone factory/canonical dispatch, ICU integer parsing and full-fold comparison against unchanged ICU78.3; exhaustively checks pinned digit/lower/full-fold scalar behavior. Run with tsx after the existing native build. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { UnicodeString } from "../apps/office/src/external/icu/source/common/unistr.ts";
import { u_digit, u_charDigitValue } from "../apps/office/src/external/icu/source/common/uchar.ts";
import {
  ucase_tolower,
  ucase_toFullFolding,
} from "../apps/office/src/external/icu/source/common/ucase.ts";
import { u_strncasecmp } from "../apps/office/src/external/icu/source/common/ustrcase.ts";
import { ICU_Utility } from "../apps/office/src/external/icu/source/common/util_props.ts";
import { ZoneMeta } from "../apps/office/src/external/icu/source/i18n/zonemeta.ts";
import {
  createTimeZone,
  getCanonicalID,
} from "../apps/office/src/external/icu/source/i18n/timezone.create.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/timezone-custom-witness.cc`,
  String.raw`
#include "unicode/timezone.h"
#include "unicode/putil.h"
#include "unicode/uchar.h"
#include "unicode/ustring.h"
#include "unicode/unistr.h"
#include "ucase.h"
#include "util.h"
#include "zonemeta.h"
#include <iostream>
#include <iomanip>
#include <memory>
#include <string>
using namespace icu;
UnicodeString read(){int n,c;std::cin>>n;UnicodeString s;if(n<0){s.setToBogus();return s;}for(int i=0;i<n;i++){std::cin>>c;s.append(char16_t(c));}return s;}
void str(const UnicodeString& s){std::cout<<int(s.isBogus())<<' '<<s.length()<<' ';for(int i=0;i<s.length();i++)std::cout<<int(s.charAt(i))<<' ';}
void i32(int32_t value){uint32_t v=uint32_t(value);char b[4]={char(v),char(v>>8),char(v>>16),char(v>>24)};std::cout.write(b,4);}
void scalar(int c){i32(u_tolower(c));i32(u_charDigitValue(c));for(int radix:{2,10,36})i32(u_digit(c,int8_t(radix)));for(int option=0;option<8;option++){const char16_t* text=nullptr;int result=ucase_toFullFolding(c,&text,option);i32(result);i32(text!=nullptr);if(text)for(int i=0;i<result;i++)i32(text[i]);}}
int main(int argc,char**argv){if(argc!=3)return 1;u_setDataDirectory(argv[1]);std::ios::sync_with_stdio(false);std::cout<<std::setprecision(17);if(std::string(argv[2])=="scalar"){for(int c=0;c<=0x10ffff;c++)scalar(c);scalar(0x110000);scalar(0x7fffffff);return 0;}char kind;
 while(std::cin>>kind){UnicodeString id=read();
  if(kind=='T'){int incoming,alias,bogus;std::cin>>incoming>>alias>>bogus;std::unique_ptr<TimeZone> z(TimeZone::createTimeZone(id));UnicodeString out;z->getID(out);str(out);int32_t raw=12,dst=19;UErrorCode s=U_ZERO_ERROR;z->getOffset(0,false,raw,dst,s);std::cout<<raw<<' '<<dst<<' '<<int(s)<<' ';UnicodeString canonical(u"before");if(bogus)canonical.setToBogus();UBool system=true;s=UErrorCode(incoming);TimeZone::getCanonicalID(alias?canonical:id,canonical,system,s);str(canonical);std::cout<<int(system)<<' '<<int(s)<<' ';}
  else if(kind=='P'){int pos,radix;std::cin>>pos>>radix;int value=ICU_Utility::parseNumber(id,pos,int8_t(radix));std::cout<<value<<' '<<pos<<' ';}
  else if(kind=='C'){UnicodeString other=read();int n;uint32_t flags;std::cin>>n>>flags;std::cout<<u_strncasecmp(id.getTerminatedBuffer(),other.getTerminatedBuffer(),n,flags)<<' ';}
  else if(kind=='Z'){int offset;std::cin>>offset;std::unique_ptr<TimeZone> z(ZoneMeta::createCustomTimeZone(offset));UnicodeString out;z->getID(out);str(out);std::cout<<z->getRawOffset()<<' ';}
  std::cout<<0<<'\n';
 }
}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/timezone-custom-witness.cc`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/timezone-custom-witness`,
  ],
  { stdio: "inherit" },
);
/** Checks unchanged native scalar bytes only when that operation slice is selected. @returns Scalar evidence. */
function verifyScalars() {
  const scalars = execFileSync(
    `${build}/timezone-custom-witness`,
    [`${source}/data/in`, "scalar"],
    {
      maxBuffer: 128 * 1024 * 1024,
    },
  );
  let cursor = 0;
  /** Compares one unchanged native scalar output. @param local - Port result. @param context - Source operation/point. @returns Nothing. */
  function integer(local, context) {
    const native = scalars.readInt32LE(cursor);
    cursor += 4;
    if (native !== local) throw Error(`${context}: native ${native}, port ${local}`);
  }
  for (let index = 0; index < 0x110002; index++) {
    const c = index < 0x110000 ? index : index === 0x110000 ? 0x110000 : 0x7fffffff;
    integer(ucase_tolower(c), `lower ${c}`);
    integer(u_charDigitValue(c), `decimal ${c}`);
    for (const radix of [2, 10, 36]) integer(u_digit(c, radix), `digit ${c}/${radix}`);
    for (let option = 0; option < 8; option++) {
      const p = [null],
        result = ucase_toFullFolding(c, p, option);
      integer(result, `fullFold ${c}/${option}`);
      integer(Number(p[0] !== null), `mapping pointer ${c}/${option}`);
      if (p[0] !== null)
        for (let i = 0; i < result; i++)
          integer(p[0].data[p[0].index + i], `mapping unit ${c}/${option}/${i}`);
    }
  }
  if (cursor !== scalars.length) throw Error("Trailing scalar witness bytes");
  return {
    scalarCodePoints: 0x110002,
    foldOptions: 8,
    scalarBytes: scalars.length,
    scalarSha256: createHash("sha256").update(scalars).digest("hex"),
  };
}
const queriesOnly = process.argv.includes("--queries-only"),
  scalarEvidence = queriesOnly ? { scalarCheck: "not run (--queries-only)" } : verifyScalars();
const input = [],
  expected = [],
  counts = {};
/** Encodes original native UTF16 construction, including bogus values. @param text - String owner. @returns Operand. */
function encode(text) {
  if (text.isBogus()) return "-1";
  const out = [text.length()];
  for (let i = 0; i < text.length(); i++) out.push(text.charAt(i));
  return out.join(" ");
}
/** Encodes complete output state. @param text - String owner. @returns Native output row. */
function str(text) {
  const out = [Number(text.isBogus()), text.length()];
  for (let i = 0; i < text.length(); i++) out.push(text.charAt(i));
  return out;
}
/** Adds exact native query. @param kind - Operation. @param args - Inputs. @param row - Expected native outputs. @returns Nothing. */
function add(kind, args, row) {
  input.push(`${kind} ${args}`);
  expected.push([...row, 0]);
  counts[kind] = (counts[kind] ?? 0) + 1;
}
/** Observes real factory and public canonical dispatch. @param id - Input. @param incoming - Status. @param alias - Alias canonical input/output. @param bogus - Initially bogus output. @returns Nothing. */
function factory(id, incoming = 0, alias = 0, bogus = 0) {
  const z = createTimeZone(id),
    out = new UnicodeString(),
    raw = [12],
    dst = [19],
    s = [0];
  z.getID(out);
  z.getOffset(0, false, raw, dst, s);
  const row = [...str(out), raw[0], dst[0], s[0]],
    canonical = new UnicodeString("before"),
    system = [true];
  if (bogus) canonical.setToBogus();
  s[0] = incoming;
  getCanonicalID(alias ? canonical : id, canonical, system, s);
  add("T", `${encode(id)} ${incoming} ${alias} ${bogus}`, [
    ...row,
    ...str(canonical),
    Number(system[0]),
    s[0],
  ]);
}
/** Observes original parse position/overflow outputs. @param text - Input. @param pos - Start. @param radix - Signed8 radix. @returns Nothing. */
function parse(text, pos, radix) {
  const p = [pos],
    out = ICU_Utility.parseNumber(text, p, radix);
  add("P", `${encode(text)} ${pos} ${radix}`, [out, p[0]]);
}
/** Observes actual source comparison result, without pre-folding proxy strings. @param left - Input. @param right - Input. @param n - Unit limit. @param flags - Options. @returns Nothing. */
function compare(left, right, n, flags) {
  add(
    "C",
    `${encode(new UnicodeString(left, left.length))} ${encode(new UnicodeString(right, right.length))} ${n} ${flags}`,
    [u_strncasecmp(left, right, n, flags)],
  );
}
const cases = [
  "GMT",
  "GMT+",
  "GMT-",
  "GMT+0",
  "GMT-000000",
  "GMT+00:00:30",
  "GMT+23:59:59",
  "GMT+24",
  "GMT+23:60",
  "GMT+001",
  "GMT+12345",
  "GMT+1234567",
  "GMT+2147483647",
  "GMT+2147483648",
  "GMT+999999999999999999999",
  "GMT++1",
  "GMT+1:2",
  "GMT+1:02:",
  "GMT+١٢:٣٤",
  "GMT+１２３４５６",
  "GMT+𝟙",
  "GMT+𝟚",
  "GMT+𝟛",
  "GMT+1\0",
  "gMt-003030",
  "UTC",
  "Etc/Unknown",
  "America/New_York",
  "America/New_York\0trailing",
  "US/Pacific",
  "Unknown",
  "G\0T+1",
  "GMＴ+1",
  "GMT+²",
];
for (const text of cases)
  for (const incoming of [-128, 0, 1])
    for (const alias of [0, 1])
      for (const bogus of [0, 1])
        factory(new UnicodeString(text, text.length), incoming, alias, bogus);
const invalid = new UnicodeString();
invalid.setToBogus();
factory(invalid);
for (const prefix of ["GMT+", "gmt-", "GmT+"])
  for (let h = 0; h < 26; h++)
    for (const m of [0, 1, 30, 59, 60])
      for (const sec of [0, 1, 30, 59, 60])
        for (const format of [0, 1, 2]) {
          const value =
            format === 0
              ? `${h.toString().padStart(2, "0")}${m.toString().padStart(2, "0")}${sec.toString().padStart(2, "0")}`
              : format === 1
                ? `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
                : `${h}:${m.toString().padStart(2, "0")}`;
          factory(new UnicodeString(prefix + value));
        }
for (const text of [
  "",
  "0",
  "2147483647",
  "2147483648",
  "99999999999999999",
  "000000000000000000001",
  "12x",
  "١٢٣",
  "１２３",
  "𝟙",
  "𝟙𝟚",
  "𝟛x",
  "\ud800",
  "aFf",
  "1\0x",
])
  for (let pos = 0; pos <= text.length + 1; pos++)
    for (const radix of [0, 1, 2, 10, 16, 36, 37, 128])
      parse(new UnicodeString(text, text.length), pos, radix);
const strings = [
  "",
  "GMT",
  "gmt",
  "GmT",
  "G\0T",
  "ß",
  "SS",
  "Fust",
  "Fußball",
  "İ",
  "i\u0307",
  "I",
  "ı",
  "ﬃ",
  "ffi",
  "\ud800",
  "\udc00",
  "\ud800\udc00",
  "\ud800\ud800\udc01",
  "\ud800\udc00\ud800",
  "\ud801\udc00",
  "\ud801\udc28",
  "\ue000",
  "\uffff",
  "A\0B",
];
for (const left of strings)
  for (const right of strings)
    for (const n of [-1, 0, 1, 2, 3, 4, 10])
      for (const flags of [0, 1, 2, 0x8000, 0x8001]) compare(left, right, n, flags);
let seed = 0x3a0712;
/** Deterministic malformed/supplementary/full-fold coverage input generator only. @returns Word. */
function random() {
  seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return seed;
}
for (let i = 0; i < 10000; i++) {
  const left = strings[random() % strings.length] + String.fromCharCode(random() & 0xffff),
    right = strings[random() % strings.length] + String.fromCharCode(random() & 0xffff);
  compare(left, right, [-1, 1, 2, 3, 4, 10][random() % 6], [0, 1, 0x8000, 0x8001][random() % 4]);
}
for (const offset of [-86399000, -19830000, -30000, -1000, 0, 1000, 30000, 19830000, 86399000]) {
  const zone = ZoneMeta.createCustomTimeZone(offset),
    id = new UnicodeString();
  zone.getID(id);
  add("Z", `0 ${offset}`, [...str(id), zone.getRawOffset()]);
}
const actual = execFileSync(`${build}/timezone-custom-witness`, [`${source}/data/in`, "query"], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 64 * 1024 * 1024,
})
  .trim()
  .split("\n");
if (actual.length !== expected.length)
  throw Error(`Custom query rows differ ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; i++) {
  const row = actual[i].trim().split(" ");
  if (
    row.length !== expected[i].length ||
    row.some(
      /** Compares exact source outputs. @param value - Native value. @param j - Column. @returns Mismatch. */ (
        value,
        j,
      ) => Number(value) !== expected[i][j],
    )
  )
    throw Error(`${input[i]}: native ${actual[i]}; port ${expected[i]}`);
}
const report = {
  result: "pass",
  ...scalarEvidence,
  queries: input.length,
  operations: counts,
  sources: Object.fromEntries(
    [
      "common/ucase.cpp",
      "common/uchar.cpp",
      "common/ustrcase.cpp",
      "common/util_props.cpp",
      "i18n/timezone.cpp",
      "i18n/zonemeta.cpp",
      "data/in/icudt78l.dat",
    ].map(
      /** Records exact source/data identity. @param path - Path. @returns Hash pair. */ (path) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  scope:
    (queriesOnly
      ? "Query slice only; scalar checks are not rerun. "
      : "All Unicode code points (including surrogate code points) plus two nonnegative out-of-range lower/digit/full-fold inputs; ") +
    "Consumed parseNumber and full-fold u_strncasecmp, public system/custom/Unknown factory/canonical dispatch and numeric ZoneMeta custom zones. Private parser partial outputs, default/host factories, prefix-match outputs, native allocator/lifetime/ABI and undefined input preconditions remain uncertified.",
};
writeFileSync(
  `${build}/timezone-custom-${queriesOnly ? "queries-" : ""}comparison.json`,
  JSON.stringify(report, null, 2) + "\n",
);
console.log(JSON.stringify(report, null, 2));
