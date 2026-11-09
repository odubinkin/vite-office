/** @fileoverview Extracts exact ICU78.3 normalization and phrase resources for the original CJK engine input domain. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const [buildDirectory, mode] = process.argv.slice(2);
if (!buildDirectory || (mode !== undefined && mode !== "--check"))
  throw new Error("Usage: node scripts/writer-cjk-data.mjs <ICU build directory> [--check]");
const build = resolve(root, buildDirectory);
const output = resolve(root, "output/playwright/rtf-properties-native/html83-cjk");
const target = resolve(root, "apps/office/src/external/icu/source/common/dictbe.cjk.data.json");
mkdirSync(output, { recursive: true });
const source = resolve(output, "cjk-data.cpp");
writeFileSync(
  source,
  String.raw`
#include <iostream>
#include <map>
#include <set>
#include <utility>
#include <vector>
#include "unicode/normalizer2.h"
#include "unicode/uniset.h"
#include "unicode/ures.h"
#include "unicode/udata.h"
#include "ubrkimpl.h"

int main() {
    auto status = U_ZERO_ERROR;
    auto nfkc = icu::Normalizer2::getNFKCInstance(status);
    auto nfkd = icu::Normalizer2::getNFKDInstance(status);
    icu::UnicodeSet admitted(icu::UnicodeString(u"[[:Han:][:Hiragana:][:Katakana:]\\u30fc\\uff70\\uff9e\\uff9f]"), status);
    if (U_FAILURE(status)) return 1;
    std::set<int> symbols, noBoundary;
    std::map<int, std::vector<int>> decomposition;
    std::vector<int> ranges;
    for (int j=0; j<admitted.getRangeCount(); ++j) {
        ranges.push_back(admitted.getRangeStart(j));
        ranges.push_back(admitted.getRangeEnd(j));
        for (int code=admitted.getRangeStart(j); code<=admitted.getRangeEnd(j); ++code) {
            if (!nfkc->hasBoundaryBefore(code)) noBoundary.insert(code);
            icu::UnicodeString scalar(code), result = nfkd->normalize(scalar, status);
            std::vector<int> units;
            for (int i=0;i<result.length();) {
                auto part = result.char32At(i);
                symbols.insert(part);
                units.push_back(part);
                i = result.moveIndex32(i,1);
            }
            if (result != scalar) decomposition.emplace(code, std::move(units));
        }
    }
    std::map<int,int> ccc;
    std::map<std::pair<int,int>,int> composition;
    std::vector<int> seconds;
    for (int code : symbols) {
        int value = nfkc->getCombiningClass(code);
        if (value) ccc[code] = value;
        if (!nfkc->hasBoundaryBefore(code)) seconds.push_back(code);
    }
    for (bool changed=true; changed;) {
        changed=false;
        std::vector<int> firsts(symbols.begin(), symbols.end());
        for (int a : firsts) for (int b : seconds) {
            int c = nfkc->composePair(a,b);
            if (c >= 0) {
                composition[{a,b}] = c;
                if (symbols.insert(c).second) changed = true;
            }
        }
    }
    bool hangulIdentity=true;
    for (int code=0xac00;code<=0xd7a3;++code)
        hangulIdentity = hangulIdentity && nfkc->hasBoundaryBefore(code) && nfkc->isNormalized(icu::UnicodeString(code),status);
    if (U_FAILURE(status) || !hangulIdentity) return 2;
    std::cout << "{\"ranges\":[";
    bool first=true;
    auto sep=[&](){ if (!first) std::cout << ','; first=false; };
    for (auto v:ranges) { sep(); std::cout << v; }
    std::cout << "],\"noBoundary\":["; first=true;
    for (auto v:noBoundary) { sep(); std::cout << v; }
    std::cout << "],\"decomposition\":["; first=true;
    for (const auto& [code, units]:decomposition) {
        sep(); std::cout << '[' << code;
        for (auto v:units) std::cout << ',' << v;
        std::cout << ']';
    }
    std::cout << "],\"ccc\":["; first=true;
    for (const auto& [code, value]:ccc) { sep(); std::cout << code << ',' << value; }
    std::cout << "],\"composition\":["; first=true;
    for (const auto& [key, result]:composition) { sep(); std::cout << key.first << ',' << key.second << ',' << result; }
    std::cout << "]";
    const auto printSet = [&](const char *name, const char16_t *pattern) {
        icu::UnicodeSet set(icu::UnicodeString(pattern), status);
        std::cout << ",\"" << name << "\":[";
        for (int i=0; i<set.getRangeCount(); ++i) {
            if (i) std::cout << ',';
            std::cout << set.getRangeStart(i) << ',' << set.getRangeEnd(i);
        }
        std::cout << ']';
    };
    printSet("hiragana", u"[:Hiragana:]");
    printSet("phraseEnd", u"[[:Nd:][:Pi:][:Ps:][:Alphabetic:]]");
    printSet("phraseStart", u"[[:Pc:][:Pd:][:Pe:][:Pf:][:Po:]]");
    auto bundle = ures_open(U_ICUDATA_BRKITR, "ja", &status);
    auto extensions = ures_getByKey(bundle, "extensions", nullptr, &status);
    std::cout << ",\"extensions\":[";
    for (int i=0; i<ures_getSize(extensions); ++i) {
        int32_t length = 0;
        const auto *data = ures_getStringByIndex(extensions, i, &length, &status);
        if (i) std::cout << ',';
        std::cout << '[';
        for (int j=0; j<length; ++j) {
            if (j) std::cout << ',';
            std::cout << uint16_t(data[j]);
        }
        std::cout << ']';
    }
    ures_close(extensions);
    ures_close(bundle);
    if (U_FAILURE(status)) return 3;
    std::cout << "]}\n";
}
`,
);
const executable = resolve(output, "cjk-data");
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-I",
    resolve(root, "vendor/icu-reference/source/common"),
    source,
    resolve(build, "lib/libicuuc.a"),
    resolve(build, "lib/libicudata.a"),
    "-o",
    executable,
  ],
  { stdio: "inherit" },
);
const data = execFileSync(executable, { encoding: "utf8" });
if (mode === "--check") {
  if (data !== readFileSync(target, "utf8"))
    throw new Error("The committed CJK data differs from pinned ICU data.");
} else writeFileSync(target, data);
