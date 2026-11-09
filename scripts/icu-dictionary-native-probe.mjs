/** @fileoverview Compares original ICU dictionary matchers over builder output and the five linked archive dictionaries. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { format, resolveConfig } from "prettier";
import {
  observeDictionary,
  makeDictionaryFixture,
  observeMatcher,
} from "./icu-dictionary-observe.ts";
import { UCharsTrie } from "../apps/office/src/external/icu/source/common/unicode/ucharstrie.ts";
import { udata_cleanup } from "../apps/office/src/external/icu/source/common/udata.ts";
import {
  udata_open,
  udata_setCommonData,
} from "../apps/office/src/external/icu/source/common/unicode/udata.ts";

import { loadDictionaryMatcherFor } from "../apps/office/src/external/icu/source/common/brkeng.ts";

const source = resolve("vendor/icu-reference/source");
const build = resolve("output/native/AQF9AG-icu-grego");
const root = resolve(build, "dictionary-witness");
const dataDir = resolve(source, "data/in");
mkdirSync(root, { recursive: true });

const cpp = String.raw`
#include <iostream>
#include <memory>
#include <string>
#include <vector>
#include "brkeng.h"
#include "dictionarydata.h"
#include "ubrkimpl.h"
#include "unicode/bytestriebuilder.h"
#include "unicode/ucharstriebuilder.h"
#include "unicode/putil.h"
#include "unicode/udata.h"
#include "unicode/utext.h"

using namespace std;
using namespace icu;

class WitnessFactory : public ICULanguageBreakFactory {
public:
    using ICULanguageBreakFactory::ICULanguageBreakFactory;
    using ICULanguageBreakFactory::loadDictionaryMatcherFor;
};

void printUnitTrie(const UnicodeString &serialized) {
    cout << "U";
    for (int32_t i = 0; i < serialized.length(); ++i) cout << ' ' << int(serialized.charAt(i));
    cout << '\n';
}

void printByteTrie(StringPiece serialized) {
    cout << "B";
    for (int32_t i = 0; i < serialized.length(); ++i) cout << ' ' << int(uint8_t(serialized.data()[i]));
    cout << '\n';
}

unique_ptr<DictionaryMatcher> openNative(const string &name, UErrorCode &status) {
    auto file = udata_open(U_ICUDATA_BRKITR, "dict", name.c_str(), &status);
    if (U_FAILURE(status)) return {};
    auto data = static_cast<const uint8_t *>(udata_getMemory(file));
    auto indexes = reinterpret_cast<const int32_t *>(data);
    auto trie = data + indexes[DictionaryData::IX_STRING_TRIE_OFFSET];
    auto type = indexes[DictionaryData::IX_TRIE_TYPE] & DictionaryData::TRIE_TYPE_MASK;
    if (type == DictionaryData::TRIE_TYPE_UCHARS) {
        return make_unique<UCharsDictionaryMatcher>(reinterpret_cast<const char16_t *>(trie), file);
    }
    if (type == DictionaryData::TRIE_TYPE_BYTES) {
        return make_unique<BytesDictionaryMatcher>(reinterpret_cast<const char *>(trie), indexes[DictionaryData::IX_TRANSFORM], file);
    }
    udata_close(file);
    return {};
}

int main(int argc, char **argv) {
    if (argc != 2) return 2;
    u_setDataDirectory(argv[1]);
    UErrorCode status = U_ZERO_ERROR;
    WitnessFactory factory(status);
    UCharsTrieBuilder ub(status);
    ub.add(UnicodeString(), 19, status)
      .add(u"a", 23, status).add(u"ab", 400001, status).add(u"abc", -17, status)
      .add(u"ax", 1900000000, status).add(u"abcdefghijklmnop-long-tail", 901, status)
      .add(u"\U0001f600", 31, status).add(u"\U0001f600x", 32, status)
      .add(u"a\U0001f600", 33, status).add(u"\u6f22", 401, status).add(u"\u6f22\u5b57", 403, status);
    for (int i = 0; i < 90; ++i) ub.add(UnicodeString(UChar32(0x100 + i)), i + 1000, status);
    UnicodeString serialized;
    ub.buildUnicodeString(USTRINGTRIE_BUILD_SMALL, serialized, status);
    BytesTrieBuilder bb(status);
    const char ff[] = {char(0xff)}, fe[] = {char(0xfe)}, ff3[] = {char(0xff), 3};
    const char one[] = {1}, oneTwo[] = {1, 2}, oneTwoThree[] = {1, 2, 3};
    bb.add(StringPiece(ff, 1), 2550, status)
      .add(StringPiece(fe, 1), 2540, status)
      .add(StringPiece(ff3, 2), 2553, status)
      .add(StringPiece(one, 1), 101, status)
      .add(StringPiece(oneTwo, 2), 102, status)
      .add(StringPiece(oneTwoThree, 3), -103, status);
    auto bytes = bb.buildStringPiece(USTRINGTRIE_BUILD_SMALL, status);
    if (U_FAILURE(status)) return 3;
    printUnitTrie(serialized);
    printByteTrie(bytes);
    UCharsTrie reader(serialized.getBuffer());
    cout << "V " << reader.current() << ' ' << reader.getValue()
         << ' ' << reader.firstForCodePoint(0x1f600) << ' ' << reader.getValue()
         << ' ' << reader.nextForCodePoint('x') << ' ' << reader.getValue()
         << ' ' << reader.next('y') << ' ' << reader.current()
         << ' ' << reader.reset().current() << ' ' << reader.getValue()
         << ' ' << reader.first(0x1f600) << '\n';
    string name;
    int len, start, maxLength, limit, mask;
    while (cin >> name >> len >> start >> maxLength >> limit >> mask) {
        vector<char16_t> units(len + 1);
        for (int i = 0, unit; i < len; ++i) {
            cin >> unit;
            units[i] = static_cast<char16_t>(unit);
        }
        status = U_ZERO_ERROR;
        unique_ptr<DictionaryMatcher> matcher;
        if (name == "U") matcher = make_unique<UCharsDictionaryMatcher>(serialized.getBuffer(), nullptr);
        else if (name == "B") matcher = make_unique<BytesDictionaryMatcher>(bytes.data(), DictionaryData::TRANSFORM_TYPE_OFFSET | 0x0e00, nullptr);
        else if (name.front() == 'F') {
            matcher.reset(factory.loadDictionaryMatcherFor(static_cast<UScriptCode>(stoi(name.substr(1)))));
            if (!matcher) {
                cout << "M\n";
                continue;
            }
        }
        else matcher = openNative(name, status);
        if (!matcher || U_FAILURE(status)) {
            cerr << name << ": " << u_errorName(status) << '\n';
            return 4;
        }
        UText text = UTEXT_INITIALIZER;
        utext_openUChars(&text, units.data(), len, &status);
        utext_setNativeIndex(&text, start);
        int32_t lengths[4] = {8777,8777,8777,8777};
        int32_t cpLengths[4] = {8777,8777,8777,8777};
        int32_t values[4] = {8777,8777,8777,8777};
        int32_t prefix = 7888;
        auto count = matcher->matches(&text, maxLength, limit,
          mask & 1 ? lengths : nullptr, mask & 2 ? cpLengths : nullptr,
          mask & 4 ? values : nullptr, mask & 8 ? &prefix : nullptr);
        cout << "M " << matcher->getType() << ' ' << count << ' ' << prefix << ' ' << utext_getNativeIndex(&text);
        for (auto array : {lengths, cpLengths, values}) for (int i = 0; i < 4; ++i) cout << ' ' << array[i];
        cout << '\n';
        utext_close(&text);
    }
}
`;
writeFileSync(resolve(root, "witness.cpp"), cpp);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    resolve(root, "witness.cpp"),
    resolve(build, "lib/libicuuc.a"),
    resolve(build, "stubdata/libicudata.a"),
    "-o",
    resolve(root, "witness"),
  ],
  { stdio: "inherit" },
);

const cases = [];
for (const [name, texts] of [
  [
    "U",
    [
      "",
      "abcd",
      "ab",
      "ax",
      "a😀",
      "😀x",
      "漢字!",
      "abc\0tail",
      "abcdefghijklmnop-long-tail?",
      "Ł!",
      "ř",
    ],
  ],
  [
    "B",
    ["", "\u0e01\u0e02\u0e03?", "\u200d\u0e03", "\u200c", "x\u0e03", "😀\u0e03", "\u0e01\u200c"],
  ],
  ["thaidict", ["ภาษาไทย", "ประเทศไทย", "ภาษาไทยภาษา", "abc", "ภาษา\u200d"]],
  ["laodict", ["ພາສາລາວ", "ປະເທດລາວ", "😀"]],
  ["burmesedict", ["မြန်မာဘာသာ", "မင်္ဂလာပါ", "မြန်မာ"]],
  ["khmerdict", ["ភាសាខ្មែរ", "ប្រទេសកម្ពុជា", "ខ្មែរ"]],
  ["cjdict", ["東京都", "漢字", "中华人民共和国", "ひらがな", "カタカナ", "𠮷野家", "한글"]],
]) {
  for (const text of texts) {
    for (const [start, max, limit, mask] of [
      [0, 80, 4, 15],
      [0, 0, 4, 15],
      [0, 1, 1, 15],
      [0, 2, 0, 15],
      [0, 80, 4, 8],
      [0, 80, 4, 5],
      [1, 80, 4, 15],
      [text.length, 80, 4, 15],
    ])
      cases.push({ name, text, start, max, limit, mask });
  }
}
const factoryCases = [];
for (const [script, text] of [
  [38, "ภาษาไทย"],
  [24, "ພາສາລາວ"],
  [28, "မြန်မာဘာသာ"],
  [23, "ភាសាខ្មែរ"],
  [17, "東京都"],
  [20, "ひらがな"],
  [22, "カタカナ"],
  [18, "한글"],
  [25, "Latin"],
  [2, "عربي"],
  [0, "?"],
  [54, "ひらカナ"],
]) {
  for (const [start, max, limit, mask] of [
    [0, 80, 4, 15],
    [1, 4, 2, 15],
    [0, 0, 0, 8],
  ]) {
    factoryCases.push({ name: "F" + script, script, text, start, max, limit, mask });
  }
}
let input = "";
for (const c of [...cases, ...factoryCases]) {
  input += `${c.name} ${c.text.length} ${c.start} ${c.max} ${c.limit} ${c.mask} `;
  for (let i = 0; i < c.text.length; ++i) input += c.text.charCodeAt(i) + " ";
  input += "\n";
}
const native = execFileSync(resolve(root, "witness"), [dataDir], {
  input,
  encoding: "utf8",
  maxBuffer: 2 * 1024 * 1024,
});
const rows = { U: [], B: [], V: [], M: [] };
for (const line of native.trimEnd().split("\n")) {
  const fields = line.split(" ");
  rows[fields.shift()].push(fields.map(Number));
}
if (rows.M.length !== cases.length + factoryCases.length)
  throw new Error("Incomplete original matcher observations");
const u = rows.U[0],
  b = rows.B[0];
const trie = new UCharsTrie(new Uint16Array(u));
const traversal = [
  trie.current(),
  trie.getValue(),
  trie.firstForCodePoint(0x1f600),
  trie.getValue(),
  trie.nextForCodePoint(120),
  trie.getValue(),
  trie.next(121),
  trie.current(),
  trie.reset().current(),
  trie.getValue(),
  trie.first(0x1f600),
];
if (JSON.stringify(traversal) !== JSON.stringify(rows.V[0]))
  throw new Error("UCharsTrie reader mismatch");
const archive = readFileSync(resolve(dataDir, "icudt78l.dat"));
const status = [0];
udata_setCommonData(Uint8Array.from(archive), status);
if (status[0] !== 0) throw new Error("Failed to register original ICU archive");
const portable = [];
let real = 0;
try {
  for (const [index, c] of cases.entries()) {
    const file =
      c.name === "U"
        ? makeDictionaryFixture(1, u)
        : c.name === "B"
          ? makeDictionaryFixture(0, b)
          : udata_open("icudt78l-brkitr", "dict", c.name, [0]);
    if (file === null) throw new Error("Failed to open " + c.name);
    const actual = observeDictionary(file, c);
    const expected = rows.M[index];
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      throw new Error(JSON.stringify({ c, actual, expected }));
    if (c.name === "U" || c.name === "B") portable.push({ ...c, expected });
    else ++real;
  }
} finally {
  udata_cleanup();
}
const factory = [];
try {
  for (const [index, c] of factoryCases.entries()) {
    const expected = rows.M[cases.length + index];
    const actual = observeMatcher(loadDictionaryMatcherFor(c.script), c);
    if (JSON.stringify(actual) !== JSON.stringify(expected))
      throw new Error(JSON.stringify({ c, actual, expected }));
    factory.push({ ...c, expected });
  }
} finally {
  udata_cleanup();
}
for (const [file, artifact] of [
  ["brkeng.native-observations.json", { icuVersion: "78.3", factory }],
  [
    "dictionarydata.native-observations.json",
    {
      icuVersion: "78.3",
      archiveSha256: createHash("sha256").update(archive).digest("hex"),
      u,
      b,
      traversal: rows.V[0],
      cases: portable,
    },
  ],
]) {
  const path = resolve("apps/office/src/external/icu/source/common", file);
  const bytes = await format(JSON.stringify(artifact), {
    ...(await resolveConfig(path)),
    parser: "json",
  });
  writeFileSync(path, bytes);
}
console.log(
  `Matched ${portable.length} builder cases and ${real} original archive cases across five dictionaries and ${factory.length} original factory cases`,
);
