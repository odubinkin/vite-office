/** @fileoverview Compares original ICU78.3 LikelySubtags/LSR classes, native trie key corpus, source statuses, flags/ownership/hash/moves and full script-short-name data. Does not certify native invalid pointers, allocation failures, debug assertions, Calendar/CSV completion. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { LikelySubtags } from "../apps/office/src/external/icu/source/common/loclikelysubtags.ts";
import { LikelySubtagsData } from "../apps/office/src/external/icu/source/common/loclikelysubtags.data.ts";
import { Locale } from "../apps/office/src/external/icu/source/common/locid.ts";
import {
  uloc_addLikelySubtags,
  uloc_minimizeSubtags,
  ulocimp_addLikelySubtags,
  ulocimp_minimizeSubtags,
  ulocimp_getRegionForSupplementalData,
} from "../apps/office/src/external/icu/source/common/loclikely.ts";
import { LSR } from "../apps/office/src/external/icu/source/common/lsr.ts";
import { uscript_getShortName } from "../apps/office/src/external/icu/source/common/unicode/uscript.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego");
writeFileSync(
  `${build}/likelysubtags-witness.cc`,
  String.raw`
#include "loclikelysubtags.h"
#include "lsr.h"
#include "ulocimp.h"
#include "unicode/bytestream.h"
#include "unicode/bytestrie.h"
#include "unicode/locid.h"
#include "unicode/uscript.h"
#include "unicode/ures.h"
#include "unicode/putil.h"
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace icu;
struct WitnessLocale:Locale{using Locale::Locale;using Locale::minimizeSubtags;};
std::string unhex(std::string s){if(s=="-")return {};std::string o;for(size_t i=0;i<s.size();i+=2)o+=char(std::stoi(s.substr(i,2),nullptr,16));return o;}
std::string hex(const char*s){if(!s)return "~";std::string o;const char*t="0123456789abcdef";while(*s){auto c=uint8_t(*s++);o+=t[c>>4];o+=t[c&15];}return o.empty()?"-":o;}
void dump(LSR&l){std::cout<<hex(l.language)<<' '<<hex(l.script)<<' '<<hex(l.region)<<' '<<l.regionIndex<<' '<<l.flags<<' '<<int(l.owned!=nullptr)<<' ';if(l.language&&l.script)l.setHashCode();std::cout<<l.hashCode;}
int main(int argc,char**argv){u_setDataDirectory(argv[1]);UErrorCode init=U_ZERO_ERROR;Locale::setDefault(Locale("en_US"),init);auto*likely=LikelySubtags::getSingleton(init);if(U_FAILURE(init)||!likely)return 2;
if(argc>2){auto*r=ures_openDirect(nullptr,"langInfo",&init);auto*l=ures_getByKey(r,"likely",nullptr,&init);auto*t=ures_getByKey(l,"trie",nullptr,&init);int32_t n;auto*bytes=ures_getBinary(t,&n,&init);BytesTrie::Iterator it(bytes,0,init);std::ofstream f(argv[2]);while(it.next(init)){auto s=it.getString();const char*tbl="0123456789abcdef";for(int i=0;i<s.length();++i){unsigned c=uint8_t(s.data()[i]);f<<tbl[c>>4]<<tbl[c&15];}f<<'\n';}ures_close(t);ures_close(l);ures_close(r);return U_FAILURE(init)?3:0;}
char op;while(std::cin>>op){if(op=='M'){int initial,ret,bogus;std::string id;std::cin>>initial>>ret>>bogus>>id;auto name=unhex(id);Locale l(name.c_str());if(bogus)l.setToBogus();UErrorCode e=UErrorCode(initial);auto result=likely->makeMaximizedLsrFrom(l,ret,e);std::cout<<int(e)<<' ';dump(result);}
else if(op=='W'){int mode,initial,favor,isnull,cap;std::string id;std::cin>>mode>>initial>>favor>>isnull>>cap>>id;auto name=unhex(id);const char*locale=isnull?nullptr:name.c_str();UErrorCode e=UErrorCode(initial);if(mode<2){std::vector<char>buffer(192,77);int n=mode==0?uloc_addLikelySubtags(locale,buffer.data(),cap,&e):uloc_minimizeSubtags(locale,buffer.data(),cap,&e);std::cout<<int(e)<<' '<<n;for(unsigned char b:buffer)std::cout<<' '<<int(b);}else if(mode<4){std::string output;StringByteSink<std::string>sink(&output);if(mode==2)ulocimp_addLikelySubtags(locale,sink,e);else ulocimp_minimizeSubtags(locale,sink,favor,e);std::cout<<int(e)<<' '<<hex(output.c_str());}else if(mode<6){WitnessLocale l(name.c_str());if(isnull)l.setToBogus();if(mode==4)l.addLikelySubtags(e);else l.minimizeSubtags(bool(favor),e);std::cout<<int(e)<<' '<<int(l.isBogus())<<' '<<hex(l.getName());}else{auto region=ulocimp_getRegionForSupplementalData(locale,favor,e);std::cout<<int(e)<<' '<<hex(region.data());}}
else if(op=='m'){int initial,favor;std::string a,b,c;std::cin>>initial>>favor>>a>>b>>c;auto lang=unhex(a),script=unhex(b),region=unhex(c);UErrorCode e=UErrorCode(initial);auto result=likely->minimizeSubtags(StringPiece(lang),StringPiece(script),StringPiece(region),favor,e);std::cout<<int(e)<<' ';dump(result);}
else if(op=='L'){int mode,initial,prefix,flags,move;std::string a,b,c;std::cin>>mode>>initial>>prefix>>flags>>move>>a>>b>>c;auto lang=unhex(a),script=unhex(b),region=unhex(c);UErrorCode e=UErrorCode(initial);LSR result=mode==0?LSR(lang.c_str(),script.c_str(),region.c_str(),flags):mode==1?LSR(StringPiece(lang),StringPiece(script),StringPiece(region),flags,e):LSR(char(prefix),lang.c_str(),script.c_str(),region.c_str(),flags,e);std::cout<<int(e)<<' ';dump(result);if(move){if(move==1){LSR moved(std::move(result));std::cout<<' ';dump(moved);std::cout<<' ';dump(result);}else{LSR moved("zz","Zzzz","ZZ",3);moved=std::move(result);std::cout<<' ';dump(moved);std::cout<<' ';dump(result);}}}
else if(op=='C'){int flags,otherFlags,cache;std::string a,b,c,d,f,g;std::cin>>flags>>otherFlags>>cache>>a>>b>>c>>d>>f>>g;auto al=unhex(a),as=unhex(b),ar=unhex(c),bl=unhex(d),bs=unhex(f),br=unhex(g);LSR l(al.c_str(),as.c_str(),ar.c_str(),flags),r(bl.c_str(),bs.c_str(),br.c_str(),otherFlags);int out=likely->compareLikely(l,r,cache);std::cout<<out<<' '<<likely->compareLikely(l,r,out)<<' '<<int(l.isEquivalentTo(r))<<' '<<int(l==r);}
else if(op=='S'){int code;std::cin>>code;std::cout<<hex(uscript_getShortName(UScriptCode(code)));}
else if(op=='I'){std::string r;std::cin>>r;auto region=unhex(r);std::cout<<LSR::indexForRegion(region.c_str());}
else if(op=='D'){auto&d=likely->getDistanceData();std::cout<<d.paradigmsLength;for(int i=0;i<d.paradigmsLength;++i){LSR l(d.paradigms[i].language,d.paradigms[i].script,d.paradigms[i].region,d.paradigms[i].flags);std::cout<<' ';dump(l);}}
std::cout<<'\n';}}
`,
);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${build}/likelysubtags-witness.cc`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    `${build}/likelysubtags-witness`,
  ],
  { stdio: "inherit" },
);
execFileSync(
  `${build}/likelysubtags-witness`,
  [`${source}/data/in`, `${build}/likelysubtags-native-keys.txt`],
  { stdio: "inherit" },
);
/** Encodes actual counted narrow bytes. @param s - Text/null. @returns Transport. */
function hex(s) {
  return s === null ? "~" : Buffer.from(s, "latin1").toString("hex") || "-";
}
/** Observes actual source logical fields and lazy hash. @param l - LSR. @returns Scalars. */
function dump(l) {
  const row = [
    hex(l.language),
    hex(l.script),
    hex(l.region),
    l.regionIndex,
    l.flags,
    Number(l.owned !== null),
  ];
  if (l.language !== null && l.script !== null) l.setHashCode();
  row.push(l.hashCode);
  return row;
}
/** Test-only legal subclass bridge to the original protected preference overload. */
class WitnessLocale extends Locale {
  /** Exposes the protected source overload only inside this witness. @param favor - Preference. @param status - Status. @returns Nothing. */
  minimizeWithPreference(favor, status) {
    this.minimizeSubtagsFavorScript(favor, status);
  }
}
const init = [0];
Locale.setDefault(new Locale("en_US"), init);
const likely = LikelySubtags.getSingleton(init);
if (init[0] !== 0 || likely === null) throw Error(`Init ${init}`);
const input = [],
  expected = [],
  counts = {};
/** Adds independently observed native query. @param op - Operation. @param args - Wire values. @param result - Actual local output. @returns Nothing. */
function add(op, args, result) {
  input.push([op, ...args].join(" "));
  expected.push(result.join(" "));
  counts[op] = (counts[op] ?? 0) + 1;
}
const ids = new Set([
  "",
  "root",
  "und",
  "en",
  "ru",
  "zh",
  "zh_TW",
  "zh_Hant",
  "zh_Hant_TW",
  "und_Latn",
  "und_Latn_001",
  "und_Latn_150",
  "und_Cyrl",
  "und_Arab",
  "zz",
  "qqq",
  "zz_Latn",
  "zz_Qaaa_001",
  "aa_Qaaa_ZZ",
  "en_Zzzz_ZZ",
  "i-klingon",
  "iw_IL",
  "mo_MD",
  "sh",
  "sr_ME",
  "in",
  "ji",
  "en_BU",
  "en_XA",
  "ar_XB",
  "en_XC",
  "fr__PSACCENT",
  "ar__PSBIDI",
  "fr__PSCRACK",
  "en_GB_PSACCENT",
  "@x=private",
  "x-private",
  "en@calendar=gregorian",
  "en-u-rg-gbzzzz",
  "abcd",
  "abcdefghi",
  "a-b-c",
  "en_US_badvariantthatistoolong",
  "en\0zz",
]);
const keys = readFileSync(`${build}/likelysubtags-native-keys.txt`, "utf8").trim().split("\n");
for (const key of keys) {
  const bytes = Buffer.from(key, "hex"),
    parts = [];
  let part = "";
  for (const b of bytes) {
    if (b === 42 && part.length === 0) {
      parts.push("");
      continue;
    }
    part += String.fromCharCode(b & 127);
    if (b & 128) {
      parts.push(part);
      part = "";
    }
  }
  if (parts.length >= 1) {
    let id = parts[0] || "und";
    if (parts.length > 1 && parts[1]) id += "_" + parts[1];
    if (parts.length > 2 && parts[2]) id += "_" + parts[2];
    ids.add(id);
  }
}
const loaded = new LikelySubtagsData([0]);
const loadStatus = [0];
loaded.load(loadStatus);
if (loadStatus[0] !== 0) throw Error(`Load ${loadStatus}`);
// Include every decoded result LSR and all alias inputs, independently checked through the original service below.
for (const l of loaded.lsrs) ids.add([l.language, l.script, l.region].filter(Boolean).join("_"));
const aliasesResource = JSON.parse(
  readFileSync("apps/office/src/external/icu/source/data/misc/langInfo.json", "utf8"),
).resource.value.likely.value;
for (let i = 0; i < aliasesResource.languageAliases.value.length; i += 2)
  ids.add(aliasesResource.languageAliases.value[i].value);
for (let i = 0; i < aliasesResource.regionAliases.value.length; i += 2)
  ids.add("en_" + aliasesResource.regionAliases.value[i].value);
for (const id of ids)
  for (const incoming of [0, -128, 1])
    for (const ret of [false, true]) {
      const s = [incoming],
        l = new Locale(id),
        r = likely.makeMaximizedLsrFrom(l, ret, s);
      add("M", [incoming, Number(ret), 0, hex(id)], [s[0], ...dump(r)]);
    }
for (const incoming of [0, -128, 1])
  for (const ret of [false, true]) {
    const s = [incoming],
      l = new Locale("en");
    l.setToBogus();
    add(
      "M",
      [incoming, Number(ret), 1, hex("en")],
      [
        ...(
          /** Observes bogus-state dispatch and its status after the call. @returns Scalars. */ () => {
            const r = likely.makeMaximizedLsrFrom(l, ret, s);
            return [s[0], ...dump(r)];
          }
        )(),
      ],
    );
  }
const components = new Map();
for (const id of ids) {
  const l = new Locale(id);
  if (!l.isBogus())
    components.set([l.getLanguage(), l.getScript(), l.getCountry()].join("|"), [
      l.getLanguage(),
      l.getScript(),
      l.getCountry(),
    ]);
}
for (const x of [
  ["ru\0zz", "Cyrl", "RU"],
  ["und", "", "419"],
  ["und", "Latn", "150"],
  ["qaa", "Qaaa", "001"],
  ["en", "", "GB\0ZZ"],
])
  components.set(x.join("|"), x);
for (const [lang, script, region] of components.values())
  for (const favor of [false, true])
    for (const incoming of [0, -128, 1]) {
      const s = [incoming],
        r = likely.minimizeSubtags(lang, script, region, favor, s);
      add("m", [incoming, Number(favor), hex(lang), hex(script), hex(region)], [s[0], ...dump(r)]);
    }
const spans = [
  "",
  "en",
  "und",
  "Latn",
  "US",
  "RU",
  "419",
  "us",
  "ZZ",
  "000",
  "999",
  "A1",
  "\0",
  "en\0x",
  "a".repeat(31),
  "a".repeat(32),
  "b".repeat(63),
  "c".repeat(64),
  "d".repeat(97),
  "\xff\x80",
];
for (const lang of spans)
  for (const script of ["", "Latn", "\xff"])
    for (const region of ["", "US", "us", "419", "000", "ZZ", "GB\0X"])
      for (const mode of [0, 1, 2])
        for (const incoming of [0, -128, 1])
          for (const move of [0, 1, 2]) {
            const flags = 7,
              prefix = 39,
              s = [incoming],
              l =
                mode === 0
                  ? new LSR(lang, script, region, flags)
                  : mode === 1
                    ? new LSR(lang, script, region, flags, s)
                    : new LSR(prefix, lang, script, region, flags, s),
              row = [s[0], ...dump(l)];
            if (move) {
              const moved = move === 1 ? LSR.move(l) : new LSR("zz", "Zzzz", "ZZ", 3).assignMove(l);
              row.push(...dump(moved), ...dump(l));
            }
            add(
              "L",
              [mode, incoming, prefix, flags, move, hex(lang), hex(script), hex(region)],
              row,
            );
          }
for (let a = 0; a < 256; ++a)
  for (let b = 0; b < 256; ++b) {
    const r = String.fromCharCode(a, b);
    add("I", [hex(r)], [LSR.indexForRegion(r)]);
  }
for (let i = 0; i < 1000; ++i) {
  const r = String(i).padStart(3, "0");
  add("I", [hex(r)], [LSR.indexForRegion(r)]);
}
for (let code = -1; code <= 65536; ++code) add("S", [code], [hex(uscript_getShortName(code))]);
for (const code of [-2147483648, -257, 2147483647])
  add("S", [code], [hex(uscript_getShortName(code))]);
for (const lang of ["en", "ru", "zh", "und", "zz"])
  for (const script of ["Latn", "Cyrl", "Hant", ""])
    for (const region of ["US", "RU", "CN", "TW", ""])
      for (const otherScript of [script, "Zzzz"])
        for (const otherRegion of [region, "GB"]) {
          const a = new LSR(lang, script, region, 4),
            b = new LSR(lang, otherScript, otherRegion, 7);
          const out = likely.compareLikely(a, b, -1);
          add(
            "C",
            [
              4,
              7,
              -1,
              hex(lang),
              hex(script),
              hex(region),
              hex(lang),
              hex(otherScript),
              hex(otherRegion),
            ],
            [
              out,
              likely.compareLikely(a, b, out),
              Number(a.isEquivalentTo(b)),
              Number(a.equals(b)),
            ],
          );
        }
const distance = likely.getDistanceData(),
  row = [distance.paradigmsLength];
for (const l of distance.paradigms)
  row.push(...dump(new LSR(l.language, l.script, l.region, l.flags)));
add("D", [], row);
const wrapperIds = new Set(
  [...ids].filter(
    /** Bounds the corpus without dropping original trie inputs from service proof. @param id - Source ID. @returns Representative. */ (
      id,
    ) => id.length <= 18,
  ),
);
for (const id of [
  "en_US_POSIX",
  "en_US_VARIANTTOOLONG",
  "abcd",
  "abcd_Latn",
  "abcde",
  "abcdefghi",
  "en@calendar=gregorian",
  "@calendar=gregorian",
  "en@rg=gbzzzz",
  "en@rg=usXXX",
  "en@rg=419zzz",
  "en@rg=zzzzzz",
  "en@sd=usca",
  "en@sd=GBeng",
  "en_US@rg=deZZZZ;sd=gbeng",
  "en-u-rg-gbzzzz",
  "ru-u-fw-mon",
  "en@rg=GB!",
  "en@rg=GB+",
  "@rg=gbzzz",
  "en@rg=",
  "en@rg=US;bad=",
  "en\0ru",
])
  wrapperIds.add(id);
for (const id of wrapperIds)
  for (const mode of [2, 3, 4, 5, 6])
    for (const favor of [0, 1])
      for (const initial of [0, -124, 1]) {
        const status = [initial];
        let row;
        if (mode < 4) {
          let output = "";
          const sink = {
            /** Receives actual source output. @param bytes - Narrow span. @returns Nothing. */ Append(
              bytes,
            ) {
              output += bytes;
            },
          };
          if (mode === 2) ulocimp_addLikelySubtags(id, sink, status);
          else ulocimp_minimizeSubtags(id, sink, Boolean(favor), status);
          row = [status[0], hex(output)];
        } else if (mode < 6) {
          const locale = new WitnessLocale(id);
          if (mode === 4) locale.addLikelySubtags(status);
          else locale.minimizeWithPreference(Boolean(favor), status);
          row = [status[0], Number(locale.isBogus()), hex(locale.getName())];
        } else {
          const region = ulocimp_getRegionForSupplementalData(id, Boolean(favor), status);
          row = [status[0], hex(region)];
        }
        add("W", [mode, initial, favor, 0, 0, hex(id)], row);
      }
for (const id of [
  "",
  "ru",
  "zh_Hant_TW",
  "abcd",
  "en_US_POSIX",
  "en@calendar=gregorian",
  "en_US_VARIANTTOOLONG",
  null,
])
  for (const mode of [0, 1])
    for (const cap of [-1, 0, 1, 2, 6, 11, 12, 16, 24, 96])
      for (const initial of [0, -128, -124, 1]) {
        const status = [initial],
          output = new Uint8Array(192).fill(77),
          n = (mode === 0 ? uloc_addLikelySubtags : uloc_minimizeSubtags)(id, output, cap, status);
        add(
          "W",
          [mode, initial, 0, Number(id === null), cap, hex(id ?? "")],
          [status[0], n, ...output],
        );
      }
for (const mode of [2, 3, 4, 5, 6])
  for (const favor of [0, 1])
    for (const initial of [0, -128, 1]) {
      const status = [initial];
      let row;
      if (mode < 4) {
        let output = "";
        const sink = {
          /** Receives default-locale conversion. @param bytes - Span. @returns Nothing. */ Append(
            bytes,
          ) {
            output += bytes;
          },
        };
        if (mode === 2) ulocimp_addLikelySubtags(null, sink, status);
        else ulocimp_minimizeSubtags(null, sink, Boolean(favor), status);
        row = [status[0], hex(output)];
      } else if (mode < 6) {
        const l = new WitnessLocale("");
        l.setToBogus();
        if (mode === 4) l.addLikelySubtags(status);
        else l.minimizeWithPreference(Boolean(favor), status);
        row = [status[0], Number(l.isBogus()), hex(l.getName())];
      } else {
        const region = ulocimp_getRegionForSupplementalData(null, Boolean(favor), status);
        row = [status[0], hex(region)];
      }
      add("W", [mode, initial, favor, 1, 0, hex("")], row);
    }
const native = execFileSync(`${build}/likelysubtags-witness`, [`${source}/data/in`], {
  input: input.join("\n") + "\n",
  encoding: "utf8",
  maxBuffer: 128 * 1024 * 1024,
})
  .trimEnd()
  .split("\n");
if (native.length !== expected.length) throw Error(`Rows ${native.length}/${expected.length}`);
for (let i = 0; i < native.length; ++i)
  if (native[i].trim() !== expected[i])
    throw Error(`Row ${i} ${input[i]} native ${native[i]} port ${expected[i]}`);
const report = {
  result: "pass",
  cases: expected.length,
  counts,
  nativeTrieKeys: keys.length,
  locales: ids.size,
  lsrs: loaded.lsrsLength,
  paradigms: distance.paradigmsLength,
  sources: Object.fromEntries(
    [
      "common/loclikelysubtags.cpp",
      "common/loclikelysubtags.h",
      "common/lsr.cpp",
      "common/lsr.h",
      "common/ustring.cpp",
      "common/propname.cpp",
      "common/uniquecharstr.h",
      "common/charstrmap.h",
      "data/in/icudt78l.dat",
    ].map(
      /** Hashes pinned native source/data. @param path - Source. @returns Pair. */ (path) => [
        path,
        createHash("sha256")
          .update(readFileSync(`${source}/${path}`))
          .digest("hex"),
      ],
    ),
  ),
  scope:
    "Actual unchanged ICU78.3 public LikelySubtags/LSR methods and original resource corpus. Maximization/retained flags/ownership, counted minimization both preferences, incoming statuses, bogus/private/pseudo locales, alias inputs, comparisons/cached likely bits, move residual fields, region alphabet, sparse signed32 hash and complete16-bit script short-name lookup. Native-invalid spans/pointers, native allocation failure/mutex/ABI, debug-only behavior, complete Calendar/CSV remain uncertified.",
};
writeFileSync(`${build}/likelysubtags-comparison.json`, JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
