/** @fileoverview Compares original ICU78.3 normalizers and actual Locale constructors/getters/default ownership. Entire unchanged locid.cpp redirects only the platform host-ID query for a shared browser-semantic input. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { Locale } from "../apps/office/src/external/icu/source/common/locid.ts";
import * as N from "../apps/office/src/external/icu/source/common/uloc.normalize.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  data = JSON.parse(
    readFileSync("apps/office/src/external/icu/source/data/misc/uloc.json", "utf8"),
  ).tables;
writeFileSync(
  `${build}/locale-witness.cc`,
  String.raw`
#include "unicode/putil.h"
#include <string>
std::string hostID;int hostCalls=0;
extern "C" const char* codex_host_locale(){++hostCalls;return hostID.c_str();}
#undef uprv_getDefaultLocaleID
#define uprv_getDefaultLocaleID codex_host_locale
#include "${source}/common/locid.cpp"
#include <iostream>
#include <map>
#include <memory>
using namespace icu;
void emit(std::string_view v){std::cout<<v.size()<<' ';for(unsigned char c:v)std::cout<<int(c)<<' ';}
void snap(const Locale&l){std::cout<<int(l.isBogus())<<' ';emit(l.getName());emit(l.getBaseName());emit(l.getLanguage());emit(l.getScript());emit(l.getCountry());if(!*l.getBaseName()&&*l.getName()&&strchr(l.getName(),'=')==nullptr)std::cout<<-2<<' ';else emit(l.getVariant());}
std::string read(){int n;std::cin>>n;std::string result;int c;for(int i=0;i<n;i++){std::cin>>c;result.push_back(char(c));}return result;}
int main(int argc,char**argv){if(argc!=3)return 2;u_setDataDirectory(argv[1]);hostID=argv[2];auto&root=Locale::getRoot();std::cout<<hostCalls<<' '<<int(&root==&Locale::getRoot())<<' '<<int(&Locale::getChina()==&Locale::getPRC())<<' '<<int(&Locale::getChina()==&Locale::getSimplifiedChinese())<<' ';snap(root);snap(Locale::getDefault());std::cout<<'\n';UErrorCode initial=U_ZERO_ERROR;Locale::setDefault(Locale("en_US"),initial);std::map<const Locale*,int>ids;char op;while(std::cin>>op){if(op=='N'){int mode,incoming;std::cin>>mode>>incoming;auto text=read();UErrorCode s=UErrorCode(incoming);std::string output="seed";StringByteSink<std::string>sink(&output);if(mode==0)ulocimp_getName(text,sink,s);else if(mode==1)ulocimp_canonicalize(text,sink,s);else ulocimp_getBaseName(text,sink,s);std::cout<<int(s)<<' ';emit(output);}else if(op=='L'){int mask;std::cin>>mask;auto a=read(),b=read(),c=read(),d=read();Locale l(mask&1?nullptr:a.c_str(),mask&2?nullptr:b.c_str(),mask&4?nullptr:c.c_str(),mask&8?nullptr:d.c_str());snap(l);std::unique_ptr<Locale>copy(l.clone());l.setToBogus();snap(*copy);std::cout<<int(l==root)<<' ';}else if(op=='F'){int incoming;std::cin>>incoming;auto text=read();UErrorCode s=UErrorCode(incoming);auto l=Locale::forLanguageTag(StringPiece(text.data(),int(text.size())),s);std::cout<<int(s)<<' ';snap(l);}else{int incoming;std::cin>>incoming;auto text=read();UErrorCode s=UErrorCode(incoming);Locale::setDefault(Locale(text.c_str()),s);auto*p=&Locale::getDefault();auto it=ids.find(p);int id;if(it==ids.end()){id=int(ids.size())+1;ids[p]=id;}else id=it->second;std::cout<<int(s)<<' '<<id<<' ';snap(*p);Locale copied;snap(copied);}std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/locale-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/locale-witness`,
  ],
  { stdio: "inherit" },
);
/** Encodes counted bytes. @param value - Narrow span. @returns Native fields. */
function units(value) {
  const out = [value.length];
  for (let i = 0; i < value.length; ++i) out.push(value.charCodeAt(i));
  return out;
}
/** Mirrors only the explicit source-defined getter observation domain; known getVariant out-of-range pointer cases are excluded, not given a native outcome. @param locale - Actual owner. @returns Observations. */
function snap(locale) {
  const out = [
    Number(locale.isBogus()),
    ...units(locale.getName()),
    ...units(locale.getBaseName()),
    ...units(locale.getLanguage()),
    ...units(locale.getScript()),
    ...units(locale.getCountry()),
  ];
  if (locale.getBaseName() === "" && locale.getName() !== "" && !locale.getName().includes("="))
    out.push(-2);
  else out.push(...units(locale.getVariant()));
  return out;
}
const realIntl = Intl.DateTimeFormat,
  hostID = realIntl().resolvedOptions().locale;
let hostCalls = 0;
Intl.DateTimeFormat =
  /** Observes the actual browser platform query count. @returns Original Intl formatter. */ function () {
    ++hostCalls;
    return realIntl();
  };
const root = Locale.getRoot(),
  expected = [
    [
      hostCalls,
      Number(root === Locale.getRoot()),
      Number(Locale.getChina() === Locale.getPRC()),
      Number(Locale.getChina() === Locale.getSimplifiedChinese()),
      ...snap(root),
      ...snap(Locale.getDefault()),
    ].join(" "),
  ];
Intl.DateTimeFormat = realIntl;
Locale.setDefault(new Locale("en_US"), [0]);
const input = [],
  counts = { N: 0, L: 0, F: 0, D: 0 };
const ids = new Set([
  "",
  "root",
  "ROOT",
  "und",
  "und.UTF8",
  "en_US",
  "ENG_latn_USA_posix",
  "en_POSIX",
  "en__posix",
  "en-u-ca-gregory",
  "en-u",
  "en-u-ca",
  "en-u-va-posix",
  "en_US@calendar=gregorian",
  "@calendar=gregorian",
  "@" + "a".repeat(30),
  "en_US@a=1;b",
  "en_US@a=",
  "mr.utf8@FOO",
  "mr@FOO",
  "mr@FOO-BAR,BAZ",
  "en_Latn@FOO",
  "i-default@x=y",
  "I-default@x=y",
  "en\0_US@a=b",
  "a_b_u_ca_gregory",
]);
for (const [from, to] of data.CANONICALIZE_MAP) {
  ids.add(from);
  ids.add(to);
  ids.add(from + "@calendar=gregorian");
}
for (const table of [data.LANGUAGES, data.LANGUAGES_3, data.COUNTRIES, data.COUNTRIES_3])
  for (const value of table)
    if (value !== null) ids.add(value + "_Latn_US_POSIX@calendar=gregorian");
for (let i = 0; i < 256; i++)
  for (const pattern of ["en_%_foo", "en@a%=value", "en@a=val%ue", "en-u-ca-gr%gory"])
    ids.add(pattern.replace("%", String.fromCharCode(i)));
for (const n of [10, 11, 12, 16, 17, 18, 63, 64, 65, 178, 179, 180])
  for (const pattern of ["%", "en_%", "en_US_%", "en.%", "en@%", "en@a=%"])
    ids.add(pattern.replace("%", "a".repeat(n)));
let random = 42131;
for (let i = 0; i < 1600; i++) {
  let id = "";
  const chars = "ena_NR_-.@=;us012 ";
  random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
  const n = random % 50;
  for (let j = 0; j < n; j++) {
    random = (Math.imul(random, 1664525) + 1013904223) >>> 0;
    id += chars[random % chars.length];
  }
  ids.add(id);
}
for (const text of ids)
  for (const mode of [0, 1, 2])
    for (const incoming of [-128, 0, 1]) {
      const status = [incoming];
      let output = "seed";
      [N.ulocimp_getName, N.ulocimp_canonicalize, N.ulocimp_getBaseName][mode](
        text,
        {
          /** Appends to actual preexisting output. @param value - Bytes. @returns Nothing. */ Append(
            value,
          ) {
            output += value;
          },
        },
        status,
      );
      input.push(["N", mode, incoming, ...units(text)].join(" "));
      expected.push([status[0], ...units(output)].join(" "));
      ++counts.N;
    }
for (const text of ids) {
  const args = [text, "", "", ""],
    locale = new Locale(...args),
    copy = locale.clone();
  locale.setToBogus();
  input.push(["L", 14, ...args.flatMap(units)].join(" "));
  expected.push([...snap(copy), ...snap(copy), Number(locale.equals(root))].join(" "));
  ++counts.L;
}
for (const args of [
  ["en", "US", "__foo__", "calendar=gregorian"],
  ["", "", "", "calendar=gregorian"],
  [null, null, null, "calendar=gregorian"],
  ["sr", "RS", "___", "Latn"],
  ["en\0de", "us", "a\0b", "ca=gregory\0x"],
  ["en", "", "", "Latn"],
  ["", "US", "posix", null],
]) {
  const locale = new Locale(...args),
    copy = locale.clone();
  locale.setToBogus();
  let mask = 0;
  args.forEach(
    /** Preserves original nullable constructor arguments. @param value - Argument. @param i - Index. @returns Nothing. */ (
      value,
      i,
    ) => {
      if (value === null) mask |= 1 << i;
    },
  );
  input.push(
    [
      "L",
      mask,
      ...args.flatMap(
        /** Encodes null placeholder storage. @param value - Argument. @returns Bytes. */ (value) =>
          units(value ?? ""),
      ),
    ].join(" "),
  );
  expected.push([...snap(copy), ...snap(copy), Number(locale.equals(root))].join(" "));
  ++counts.L;
}
for (const text of ids)
  for (const incoming of [-128, 0, 1]) {
    const status = [incoming],
      locale = Locale.forLanguageTag(text, status);
    input.push(["F", incoming, ...units(text)].join(" "));
    expected.push([status[0], ...snap(locale)].join(" "));
    ++counts.F;
  }
const cache = new Map();
for (const text of [
  "en_US",
  "fr-FR",
  "en-US",
  "@calendar=gregorian",
  "en_US",
  "fr_FR",
  "a".repeat(12),
  "",
  "i-default@x=y",
])
  for (const incoming of [0, 1]) {
    const status = [incoming];
    Locale.setDefault(new Locale(text), status);
    const locale = Locale.getDefault();
    if (!cache.has(locale)) cache.set(locale, cache.size + 1);
    input.push(["D", incoming, ...units(text)].join(" "));
    expected.push([status[0], cache.get(locale), ...snap(locale), ...snap(new Locale())].join(" "));
    ++counts.D;
  }
const actual = execFileSync(`${build}/locale-witness`, [`${source}/data/in`, hostID], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 128 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (actual.length !== expected.length) throw Error(`Rows ${actual.length}/${expected.length}`);
for (let i = 0; i < actual.length; i++)
  if (actual[i].trim() !== expected[i])
    throw Error(
      `Row ${i}, input ${i ? input[i - 1] : "ROOT/HOST"}: native ${actual[i]}, port ${expected[i]}`,
    );
const report = {
  result: "pass",
  cases: expected.length,
  operations: counts,
  hostID,
  sources: Object.fromEntries(
    ["common/uloc.cpp", "common/locid.cpp", "common/unicode/locid.h", "data/in/icudt78l.dat"].map(
      /** Records source/data identity. @param path - Source. @returns Hash pair. */ (path) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  scope:
    "Original entire locid.cpp with only the OS ID function redirected to the same actual browser-semantic ID; other ICU78.3 code/data unchanged. Name/base/legacy canonical sinks, Locale ordinary constructors/copy/clone/getters, strict tag factory, fixed/root/default caching/identity and source initial host lookup match. Native out-of-range getVariant pointers are excluded and documented separately. OS environment/charset equivalence, native Nest/Heap allocation/move/destructor/mutex/ABI, modern alias-resource canonicalization, likely subtags and calendar service construction remain uncertified/pending.",
};
writeFileSync(`${build}/locale-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
