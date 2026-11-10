/** @fileoverview Captures native dictionary engine constructor sets, break results and UText movement. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { format, resolveConfig } from "prettier";

const source = resolve("vendor/icu-reference/source");
const build = resolve("output/native/AQF9AG-icu-grego");
const root = resolve(build, "dictionary-engine-witness");
mkdirSync(root, { recursive: true });

const cpp = String.raw`
#include <iostream>
#include <memory>
#include <string>
#include <vector>
#include "brkeng.h"
#include "dictionarydata.h"
#include "unicode/uniset.h"
#include "unicode/putil.h"
#include "uvectr32.h"
#define private public
#include "dictbe.h"
#undef private

using namespace std;
using namespace icu;

class WitnessFactory : public ICULanguageBreakFactory {
public:
    using ICULanguageBreakFactory::ICULanguageBreakFactory;
    using ICULanguageBreakFactory::loadDictionaryMatcherFor;
};

void printSet(const string &script, const char *field, const UnicodeSet &set) {
    cout << "S " << script << ' ' << field;
    for (int32_t i = 0; i < set.getRangeCount(); ++i) {
        cout << ' ' << int32_t(set.getRangeStart(i)) << ' ' << int32_t(set.getRangeEnd(i)) + 1;
    }
    cout << '\n';
}

template<typename Engine> void printSets(const string &script, const Engine &engine) {
    printSet(script, "word", engine.fSet);
    printSet(script, "begin", engine.fBeginWordSet);
    printSet(script, "end", engine.fEndWordSet);
    printSet(script, "mark", engine.fMarkSet);
}

int main(int argc, char **argv) {
    if (argc != 2) return 2;
    u_setDataDirectory(argv[1]);
    UErrorCode status = U_ZERO_ERROR;
    WitnessFactory factory(status);
    ThaiBreakEngine thai(factory.loadDictionaryMatcherFor(USCRIPT_THAI), status);
    LaoBreakEngine lao(factory.loadDictionaryMatcherFor(USCRIPT_LAO), status);
    BurmeseBreakEngine burmese(factory.loadDictionaryMatcherFor(USCRIPT_MYANMAR), status);
    KhmerBreakEngine khmer(factory.loadDictionaryMatcherFor(USCRIPT_KHMER), status);
    if (U_FAILURE(status)) return 3;
    printSets("thai", thai);
    printSet("thai", "suffix", thai.fSuffixSet);
    printSets("lao", lao);
    printSets("burmese", burmese);
    printSets("khmer", khmer);

    char op;
    string script;
    int len, position, start, end, phrase, capacity, initialStatus, preset;
    while (cin >> op >> script >> len >> position >> start >> end >> phrase >> capacity >> initialStatus >> preset) {
        vector<char16_t> units(len + 1);
        for (int i = 0, unit; i < len; ++i) {
            cin >> unit;
            units[i] = static_cast<char16_t>(unit);
        }
        status = U_ZERO_ERROR;
        UText text = UTEXT_INITIALIZER;
        utext_openUChars(&text, units.data(), len, &status);
        utext_setNativeIndex(&text, position);
        if (op == 'M') {
            int moved = utext_moveIndex32(&text, start);
            cout << "M " << moved << ' ' << utext_getNativeIndex(&text) << ' ' << utext_current32(&text) << '\n';
        } else {
            const DictionaryBreakEngine *engine = &thai;
            if (script == "lao") engine = &lao;
            else if (script == "burmese") engine = &burmese;
            else if (script == "khmer") engine = &khmer;
            UVector32 found(status);
            found.setMaxCapacity(capacity);
            if (preset >= 0) found.push(preset, status);
            status = static_cast<UErrorCode>(initialStatus);
            int count = engine->findBreaks(&text, start, end, found, phrase != 0, status);
            cout << "D " << count << ' ' << status << ' ' << utext_getNativeIndex(&text) << ' ' << found.size();
            for (int i = 0; i < found.size(); ++i) cout << ' ' << found.elementAti(i);
            cout << '\n';
        }
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

const dictionary = [];
for (const [script, words] of [
  [
    "thai",
    [
      "ภาษาไทย",
      "ประเทศไทย",
      "ฉันกินข้าว",
      "ไปฯมาๆนะ",
      "กกกฯๆๆ",
      "วิทยาศาสตร์",
      "อักษรไทย",
      "ดีดี",
      "ดีดีด",
    ],
  ],
  ["lao", ["ພາສາລາວ", "ປະເທດລາວ", "ສະບາຍດີ", "ຫວຽດນາມ", "ຕົວອັກສອນ", "ດີມາ"]],
  [
    "burmese",
    ["မြန်မာဘာသာ", "မင်္ဂလာပါ", "ကျွန်တော်မြန်မာပါ", "နေကောင်းပါသလား", "တက္ကသိုလ်", "ငွေဈေး"],
  ],
  ["khmer", ["ភាសាខ្មែរ", "ប្រទេសកម្ពុជា", "សួស្តី", "សៀវភៅ", "រាជធានីភ្នំពេញ", "បណ្ណាល័យ"]],
]) {
  const texts = [...words, words.join(""), words.join(" "), words[0] + words[0]];
  for (const raw of texts) {
    const text = "😀" + raw + "\0Z";
    for (const [position, start, end, phrase, capacity, status, preset] of [
      [0, 2, text.length, 0, 0, 0, -1],
      [2, 1, text.length, 0, 0, 0, -1],
      [text.length, 2, text.length, 1, 0, 0, 1],
      [2, 2, text.length, 0, 1, 0, -1],
      [2, 2, text.length, 0, 1, 0, 1],
      [0, 2, Math.min(text.length, 6), 0, 0, 0, -1],
      [0, 2, Math.min(text.length, 7), 0, 0, 0, -1],
      [text.length, 2, text.length, 0, 0, 1, 1],
      [text.length, 2, text.length, 0, 0, -127, 1],
      [0, 2, text.length, 0, 0, 0, text.length + 5],
    ]) {
      dictionary.push({ script, text, position, start, end, phrase, capacity, status, preset });
    }
  }
}
const movement = [];
for (const text of ["", "abc", "x😀z", "\ud800x\udc00😀", "😀😀", "x\0z", "\u0e01😀\u0e02"]) {
  const units = [];
  for (let i = 0; i < text.length; ++i) units.push(text.charCodeAt(i));
  for (const position of [0, 1, 2, text.length, text.length + 1]) {
    for (const delta of [-5, -2, -1, 0, 1, 2, 5]) movement.push({ units, position, delta });
  }
}

/** Encodes counted UChars units so isolated surrogates and embedded NUL are retained. @param text - UTF-16 input. @returns Space-delimited units. */
function codeUnits(text) {
  let result = "";
  for (let i = 0; i < text.length; ++i) result += text.charCodeAt(i) + " ";
  return result;
}

let input = "";
for (const c of dictionary) {
  input += `D ${c.script} ${c.text.length} ${c.position} ${c.start} ${c.end} ${c.phrase} ${c.capacity} ${c.status} ${c.preset} ${codeUnits(c.text)}\n`;
}
for (const c of movement) {
  input += `M - ${c.units.length} ${c.position} ${c.delta} 0 0 0 0 -1 ${c.units.join(" ")}\n`;
}
const native = execFileSync(resolve(root, "witness"), [resolve(source, "data/in")], {
  input,
  encoding: "utf8",
  maxBuffer: 2 * 1024 * 1024,
});
const sets = { thai: {}, lao: {}, burmese: {}, khmer: {} };
let dictIndex = 0;
let moveIndex = 0;
for (const line of native.trimEnd().split("\n")) {
  const [op, ...fields] = line.split(" ");
  if (op === "S") {
    const [script, field, ...bounds] = fields;
    sets[script][field] = bounds.map(Number);
  } else if (op === "D") dictionary[dictIndex++].expected = fields.map(Number);
  else if (op === "M") movement[moveIndex++].expected = fields.map(Number);
}
if (dictIndex !== dictionary.length || moveIndex !== movement.length)
  throw new Error("Incomplete native engine observations");

for (const [file, artifact] of [
  ["dictbe.sea.sets.json", sets],
  ["dictbe.sea.native-observations.json", { icuVersion: "78.3", dictionary, movement }],
]) {
  const path = resolve("apps/office/src/external/icu/source/common", file);
  const bytes = await format(JSON.stringify(artifact), {
    ...(await resolveConfig(path)),
    parser: "json",
  });
  if (process.argv.includes("--check")) {
    if (readFileSync(path, "utf8") !== bytes)
      throw new Error(`Original ICU observation differs: ${file}`);
  } else writeFileSync(path, bytes);
}
console.log(`Captured ${dictIndex} native engine calls and ${moveIndex} native UText moves`);
