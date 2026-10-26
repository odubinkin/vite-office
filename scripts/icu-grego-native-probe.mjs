/** @fileoverview Compares the consumed Grego/ClockMath port with unchanged ICU78.3 sources. Requires source/configure --disable-shared --enable-static and built common/stubdata under output/native/AQF9AG-icu-grego. Run with npx tsx scripts/icu-grego-native-probe.mjs. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { ClockMath, Grego } from "../apps/office/src/external/icu/source/i18n/gregoimp.ts";

const build = resolve("output/native/AQF9AG-icu-grego"),
  source = resolve("vendor/icu-reference/source");
writeFileSync(
  `${build}/grego-witness.cc`,
  String.raw`
#include "gregoimp.h"
#include <iostream>
#include <iomanip>
#include <cstdlib>
#include <string>
using namespace icu;
int main() {
 std::cout << std::setprecision(17);
 char kind; std::string text; int b,c;
 while(std::cin >> kind >> text >> b >> c) {
  double a=std::strtod(text.c_str(),nullptr);
  if(kind=='F') {
   std::cout << Grego::fieldsToDay(int32_t(a),b,c) << ' ' << int(Grego::monthLength(int32_t(a),b)) << ' ' << Grego::gregorianShift(int32_t(a)) << '\n';
  } else if(kind=='D'||kind=='T') {
   int32_t y=111,mid=66; int8_t m=22,d=33,w=44; int16_t doy=55; UErrorCode s=UErrorCode(b);
   if(kind=='D') Grego::dayToFields(int32_t(a),y,m,d,w,doy,s);
   else Grego::timeToFields(a,y,m,d,w,doy,mid,s);
   std::cout << y << ' ' << int(m) << ' ' << int(d) << ' ' << int(w) << ' ' << doy << ' ' << mid << ' ' << int(s) << '\n';
  } else if(kind=='C') {
   int32_t r=99; double q=ClockMath::floorDivide(a,b,&r); std::cout << q << ' ' << r << '\n';
  } else if(kind=='Q') {
   double r=99; double q=ClockMath::floorDivide(a,double(b),&r); std::cout << q << ' ' << r << '\n';
  }
 }
}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    // Materialize the source multiply and subtract separately, as binary64 JS does.
    // ARM clang's default contraction changes extreme double/double remainders.
    "-ffp-contract=off",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `-I${source}/i18n`,
    `${build}/grego-witness.cc`,
    `${source}/i18n/gregoimp.cpp`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/grego-witness`,
  ],
  { stdio: "inherit" },
);
const input = [],
  expected = [];
/** Adds a source operation and its port result. @param kind - Native operation. @param a - First input. @param b - Second input. @param c - Third input. @returns Nothing. */
function add(kind, a, b = 0, c = 0) {
  input.push(`${kind} ${a} ${b} ${c}`);
  if (kind === "F")
    expected.push([
      Grego.fieldsToDay(a, b, c).toString(),
      Grego.monthLength(a, b),
      Grego.gregorianShift(a),
    ]);
  else if (kind === "D" || kind === "T") {
    const y = [111],
      m = [22],
      d = [33],
      w = [44],
      doy = [55],
      mid = [66],
      s = [b];
    if (kind === "D") Grego.dayToFields(a, y, m, d, w, doy, s);
    else Grego.timeToFields(a, y, m, d, w, doy, mid, s);
    expected.push([y[0], m[0], d[0], w[0], doy[0], mid[0], s[0]]);
  } else {
    const r = [99],
      q =
        kind === "C"
          ? ClockMath.floorDivideDoubleInt32(a, b, r)
          : ClockMath.floorDivideDouble(a, b, r);
    expected.push([q, r[0]]);
  }
}
for (const year of [
  -2147483648, -1000000, -400, -100, -4, -1, 0, 1, 4, 100, 400, 1582, 1899, 1900, 1970, 2000, 2100,
  32767, 1000000, 2147483647,
]) {
  for (let month = 0; month < 12; month++)
    for (const dom of [1, Grego.monthLength(year, month)]) add("F", year, month, dom);
}
// Stride and endpoints exercise negative eras, cycle boundaries and the checked int32 addition.
for (let day = -2000000; day <= 2000000; day += 137) add("D", day);
for (const day of [
  -2147483648, -719163, -719162, -719161, -25569, -1, 0, 1, 11016, 2146764484, 2146764486,
  2147483647,
])
  for (const status of [-128, 0, 1]) add("D", day, status);
for (const time of [
  -2147483649 * 86400000,
  2147483648 * 86400000,
  -86400000.25,
  -86400000,
  -0.25,
  -Number.MIN_VALUE,
  0,
  0.999,
  86400000 - 0.25,
  951782400000,
])
  for (const status of [-128, 0, 1]) add("T", time, status);
for (const value of [-86400000.25, -1, -Number.MIN_VALUE, 0, 0.25, 86400000.25, 1e15])
  add("C", value, 86400000);
for (const value of [
  -1e25, -86400000.25, 0, 86400000.25, 6.7317038241449352e22, 4.1792057231752762e24, 1e25,
])
  add("Q", value, 86400000);
const actual = execFileSync(`${build}/grego-witness`, {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 16 * 1024 * 1024,
})
  .trim()
  .split("\n");
if (actual.length !== expected.length)
  throw Error(`Native row count ${actual.length} != ${expected.length}`);
for (let i = 0; i < actual.length; i++) {
  const fields = actual[i].split(" ");
  if (
    fields.length !== expected[i].length ||
    fields.some(
      /** Compares lossless int64 day text or exact binary64 result. @param value - Native field. @param j - Field index. @returns Mismatch. */ (
        value,
        j,
      ) =>
        typeof expected[i][j] === "string"
          ? value !== expected[i][j]
          : Number(value) !== expected[i][j],
    )
  )
    throw Error(`${input[i]}: native ${actual[i]}, port ${expected[i]}`);
}
const report = {
  cases: input.length,
  version: "78.3",
  floatingPoint:
    "Separate binary64 multiply/subtract (-ffp-contract=off); contracted ARM FMA results are outside this witness scope.",
  sources: Object.fromEntries(
    ["i18n/gregoimp.cpp", "i18n/gregoimp.h", "common/unicode/utypes.h"].map(
      /** Captures unchanged source identity. @param path - Source relative path. @returns Identity pair. */ (
        path,
      ) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  result: "pass",
  scope:
    "Grego proleptic arithmetic and ClockMath only; GregorianCalendar cutover and LibreOffice date services are not covered.",
};
writeFileSync(`${build}/comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
