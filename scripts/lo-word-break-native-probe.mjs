/** @fileoverview Compiles the original LibreOffice Unicode word methods against native ICU rule iterators. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { format, resolveConfig } from "prettier";

const icu = resolve("vendor/icu-reference/source");
const patched = process.argv.includes("--libreoffice-patched");
const build = resolve(
  process.argv
    .find(
      /** Selects a native probe path option. @param value - Command argument. @returns Whether this option matches. */ (
        value,
      ) => value.startsWith("--build="),
    )
    ?.slice(8) ?? "output/native/AQF9AG-icu-grego",
);
const ruleObjects = resolve(
  process.argv
    .find(
      /** Selects a native probe path option. @param value - Command argument. @returns Whether this option matches. */ (
        value,
      ) => value.startsWith("--rule-objects="),
    )
    ?.slice(15) ?? resolve(build, "openoffice-rule-iterator"),
);
const root = resolve(
  process.argv
    .find(
      /** Selects a native probe path option. @param value - Command argument. @returns Whether this option matches. */ (
        value,
      ) => value.startsWith("--output="),
    )
    ?.slice(9) ?? resolve(build, "lo-word-break-witness" + (patched ? "-patched" : "")),
);
mkdirSync(root, { recursive: true });
const sourcePath =
  "vendor/libreoffice-reference/i18npool/source/breakiterator/breakiterator_unicode.cxx";
const source = readFileSync(sourcePath, "utf8");
const start = source.indexOf("Boundary SAL_CALL BreakIterator_Unicode::nextWord(");
const end = source.indexOf("sal_Int32 SAL_CALL BreakIterator_Unicode::beginOfSentence(", start);
if (start < 0 || end < 0) throw new Error("Missing original Unicode word bodies");
const methods = source.slice(start, end);

const cpp =
  String.raw`
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <memory>
#include <string>
#include <vector>
#include "unicode/brkiter.h"
#include "unicode/locid.h"
#include "unicode/putil.h"
#include "unicode/rbbi.h"
#include "unicode/uchar.h"
#include "unicode/udata.h"
#include "unicode/utext.h"

extern "C" const char OpenOffice_dat[];
using sal_Int16 = int16_t;
using sal_Int32 = int32_t;
using sal_Bool = bool;
#define SAL_CALL
constexpr sal_Int16 LOAD_WORD_BREAKITERATOR = 1;
struct WordType { enum { ANY_WORD, ANYWORD_IGNOREWHITESPACES, DICTIONARY_WORD, WORD_COUNT }; };
struct Boundary { sal_Int32 startPos, endPos; };
namespace lang { using Locale = icu::Locale; }
using lang::Locale;

// Counted UTF-16 adapter for the original word methods' two OUString operations.
// The selected ICU rule iterator is loaded independently through the real native data APIs.
struct OUString {
    std::vector<char16_t> units;
    sal_Int32 getLength() const { return int32_t(units.size()); }
    UChar32 iterateCodePoints(sal_Int32 *pos, sal_Int32 count) const {
        if (count != 0) std::abort();
        int32_t i = *pos;
        UChar32 c;
        U16_NEXT(units.data(), i, getLength(), c);
        return c;
    }
};

class BreakIterator_Unicode {
    struct Value { icu::BreakIterator *mpBreakIterator; } value;
    struct Slot { Value *mpValue; } slot;
    Slot *icuBI = &slot;

    void loadICUBreakIterator(const Locale&, sal_Int16, sal_Int16, const char*, const OUString&) {}
public:
    explicit BreakIterator_Unicode(icu::BreakIterator *it) : value{it}, slot{&value} {}
    Boundary nextWord(const OUString&, sal_Int32, const Locale&, sal_Int16);
    Boundary previousWord(const OUString&, sal_Int32, const Locale&, sal_Int16);
    Boundary getWordBoundary(const OUString&, sal_Int32, const Locale&, sal_Int16, sal_Bool);
};
` +
  methods +
  String.raw`
int main(int argc, char **argv) {
    if (argc != 2) return 2;
    u_setDataDirectory(argv[1]);
    UErrorCode status = U_ZERO_ERROR;
    udata_setAppData("OpenOffice", OpenOffice_dat, &status);
    if (U_FAILURE(status)) return 3;
    uint32_t hash = 2166136261U;
    for (UChar32 c = 0; c <= 0x10ffff; ++c) {
        uint32_t v = u_isUWhiteSpace(c) | (u_isWhitespace(c) << 1) | (u_isalnum(c) << 2);
        hash = (hash ^ v) * 16777619U;
    }
    std::cout << "P " << hash << '\n';

    std::string name, rule;
    int wordType, length, n;
    while (std::cin >> std::quoted(name) >> rule >> wordType >> length >> n) {
        OUString input;
        for (int i = 0, unit; i < length; ++i) {
            std::cin >> unit;
            input.units.push_back(static_cast<char16_t>(unit));
        }
        Locale locale(name.c_str());
        status = U_ZERO_ERROR;
        std::unique_ptr<icu::BreakIterator> iterator;
        if (rule == "-") {
            iterator.reset(icu::BreakIterator::createWordInstance(locale, status));
        } else {
            auto memory = udata_open("OpenOffice", "brk", rule.c_str(), &status);
            iterator = std::make_unique<icu::RuleBasedBreakIterator>(memory, status);
        }
        if (U_FAILURE(status) || iterator == nullptr) return 4;
        std::cout << "L " << int(status);
        for (auto type : {ULOC_ACTUAL_LOCALE, ULOC_VALID_LOCALE, ULOC_REQUESTED_LOCALE}) {
            std::cout << ' ' << std::quoted(iterator->getLocaleID(type, status));
        }
        std::cout << '\n';
        UText text = UTEXT_INITIALIZER;
        utext_openUChars(&text, input.units.data(), length, &status);
        iterator->setText(&text, status);
        if (U_FAILURE(status)) return 5;
        BreakIterator_Unicode service(iterator.get());
        std::cout << "B";
        for (int i = 0, position, direction; i < n; ++i) {
            char op;
            std::cin >> op >> position >> direction;
            Boundary b;
            if (op == 'N') b = service.nextWord(input, position, locale, wordType);
            else if (op == 'P') b = service.previousWord(input, position, locale, wordType);
            else b = service.getWordBoundary(input, position, locale, wordType, direction != 0);
            std::cout << ' ' << b.startPos << ' ' << b.endPos;
        }
        std::cout << '\n';
        utext_close(&text);
    }
}
`;
writeFileSync(resolve(root, "witness.cpp"), cpp);
const overrides = [];
let dataDirectory = resolve(icu, "data/in");
if (patched) {
  const overlay = resolve(root, "patched-common");
  mkdirSync(overlay, { recursive: true });
  for (const name of [
    "dictbe.cpp",
    "dictbe.h",
    "dictionarydata.cpp",
    "dictionarydata.h",
    "brkeng.cpp",
  ])
    copyFileSync(resolve(icu, "common", name), resolve(overlay, name));
  execFileSync("patch", ["-p3", "--batch"], {
    cwd: overlay,
    input: readFileSync("vendor/libreoffice-reference/external/icu/icu4c-khmerbreakengine.patch.1"),
    stdio: ["pipe", "inherit", "inherit"],
  });
  for (const name of ["dictbe", "dictionarydata", "brkeng"]) {
    const object = resolve(overlay, name + ".o");
    execFileSync(
      "clang++",
      [
        "-std=c++17",
        "-O2",
        "-DU_STATIC_IMPLEMENTATION",
        "-DU_COMMON_IMPLEMENTATION",
        `-I${overlay}`,
        `-I${icu}/common`,
        "-c",
        resolve(overlay, name + ".cpp"),
        "-o",
        object,
      ],
      { stdio: "inherit" },
    );
    overrides.push(object);
  }
  dataDirectory = resolve(root, "data");
  mkdirSync(resolve(dataDirectory, "brkitr"), { recursive: true });
  copyFileSync(
    "vendor/libreoffice-reference/external/icu/khmerdict.dict",
    resolve(dataDirectory, "brkitr/khmerdict.dict"),
  );
  execFileSync(
    resolve(build, "bin/icupkg"),
    [
      "-a",
      "brkitr/khmerdict.dict",
      "-s",
      dataDirectory,
      resolve(build, "data/out/tmp/icudt78l.dat"),
      resolve(dataDirectory, "icudt78l.dat"),
    ],
    { stdio: "inherit" },
  );
}
const objects = [
  "OpenOffice_tmp",
  "count_word_brk",
  "dict_word_hu_brk",
  "dict_word_prepostdash_brk",
  "dict_word_brk",
  "edit_word_hu_brk",
  "edit_word_brk",
  "line_brk",
  "line_cj_brk",
];
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${icu}/common`,
    resolve(root, "witness.cpp"),
    ...objects.map(
      /** Names one actual compiled source rule object. @param name - Original generated stem. @returns Object path. */
      (name) => resolve(ruleObjects, name + ".o"),
    ),
    ...overrides,
    resolve(build, "lib/libicuuc.a"),
    resolve(build, "stubdata/libicudata.a"),
    "-o",
    resolve(root, "witness"),
  ],
  { stdio: "inherit" },
);

const cases = [];
for (const [language, country, name, edit, dictionary, texts] of [
  [
    "en",
    "US",
    "en_US",
    "edit_word",
    "dict_word",
    [
      "One dollar and twenty-two cents.",
      "  don't stop\u200bNow.\u00a0NBSP\u202fNNBSP",
      "😀 x\0y",
      "\u001c\u0085\u2007zero\u001f!",
      "",
    ],
  ],
  ["hu", "HU", "hu_HU", "edit_word_hu", "dict_word_hu", ["első-második. árvíztűrő tükörfúrógép"]],
  ["de", "DE", "de_DE", "edit_word", "dict_word_prepostdash", ["vor- und zurück-, Post- -Text"]],
  ["da", "DK", "da_DK", "edit_word", "dict_word_prepostdash", ["midt- og københavn"]],
  ["ja", "JP", "ja_JP", "edit_word", "dict_word", ["東京都𠮷野家ｶﾞゟ漢字かなカナ。"]],
  ["zh", "TW", "zh_TW", "edit_word", "dict_word", ["中華民國 臺北市"]],
  ["th", "TH", "th_TH", "edit_word", "dict_word", ["ภาษาไทยภาษาไทย"]],
  ["lo", "LA", "lo_LA", "edit_word", "dict_word", ["ພາສາລາວປະເທດລາວ"]],
  ["my", "MM", "my_MM", "edit_word", "dict_word", ["မြန်မာဘာသာမင်္ဂလာပါ"]],
  ["km", "KH", "km_KH", "edit_word", "dict_word", ["ភាសាខ្មែរប្រទេសកម្ពុជា"]],
  ["zz", "ZZ", "zz_ZZ", "edit_word", "dict_word", ["unknown locale"]],
  ["en", "GB", "en_GB", "edit_word", "dict_word", ["same rule, different input"]],
  ["qlt", "", "en_US_POSIX", "edit_word", "dict_word", ["12,345, can't go."]],
]) {
  for (const value of texts) {
    for (const [wordType, rule] of ["-", edit, dictionary, "count_word"].entries()) {
      const operations = [];
      for (const p of new Set([
        -2,
        0,
        1,
        2,
        4,
        Math.floor(value.length / 2),
        value.length,
        value.length + 1,
      ])) {
        operations.push(["B", p, 0], ["B", p, 1], ["N", p, 1]);
        if (p <= value.length) operations.push(["P", p, 0]);
      }
      const variant = language === "qlt" ? "en-US-u-va-posix" : "";
      cases.push({ language, country, variant, name, rule, wordType, value, operations });
    }
  }
}
let input = "";
for (const { name, rule, wordType, value, operations } of cases) {
  input += `${JSON.stringify(name)} ${rule} ${wordType} ${value.length} ${operations.length}\n`;
  for (let i = 0; i < value.length; ++i) input += value.charCodeAt(i) + " ";
  for (const [op, p, direction] of operations) input += `${op} ${p} ${direction} `;
  input += "\n";
}
const output = execFileSync(resolve(root, "witness"), [dataDirectory], {
  input,
  encoding: "utf8",
  maxBuffer: 4 * 1024 * 1024,
});
let props = 0;
let localeIndex = 0;
let boundaryIndex = 0;
for (const line of output.trimEnd().split("\n")) {
  if (line.startsWith("P ")) props = Number(line.slice(2));
  else if (line.startsWith("L ")) {
    const parsed = /^L (-?\d+) "([^"]*)" "([^"]*)" "([^"]*)"$/.exec(line);
    if (parsed === null) throw new Error("Incomplete locale observation " + line);
    cases[localeIndex++].locale = [Number(parsed[1]), ...parsed.slice(2)];
  } else if (line.startsWith("B ")) {
    cases[boundaryIndex++].expected = line.slice(2).split(" ").map(Number);
  }
}
if (localeIndex !== cases.length || boundaryIndex !== cases.length || props === 0)
  throw new Error("Incomplete native word observations");

const path = resolve(
  `apps/office/src/i18npool/source/breakiterator/breakiterator_unicode.${patched ? "libreoffice-patched" : "native"}-observations.json`,
);
const bytes = await format(
  JSON.stringify({
    icuVersion: "78.3",
    ...(patched
      ? {
          libreOfficeKhmerPatchSha256: createHash("sha256")
            .update(
              readFileSync(
                "vendor/libreoffice-reference/external/icu/icu4c-khmerbreakengine.patch.1",
              ),
            )
            .digest("hex"),
          libreOfficeKhmerDictionarySha256: createHash("sha256")
            .update(readFileSync("vendor/libreoffice-reference/external/icu/khmerdict.dict"))
            .digest("hex"),
        }
      : {}),
    originalMethodsSha256: createHash("sha256").update(methods).digest("hex"),
    props,
    cases,
  }),
  { ...(await resolveConfig(path)), parser: "json" },
);
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== bytes)
    throw new Error("Pinned native word observations differ");
} else writeFileSync(path, bytes);
let count = 0;
for (const item of cases) count += item.operations.length;
console.log(
  `Captured ${cases.length} Unicode word sequences, ${count} boundary operations and the native property digest`,
);
