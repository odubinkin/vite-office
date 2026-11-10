/** @fileoverview Captures original ICU CJK UnicodeSets, dictionary break positions and native UTF-16 cursor effects. */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { format, resolveConfig } from "prettier";

const source = resolve("vendor/icu-reference/source");
const build = resolve("output/native/AQF9AG-icu-grego");
const root = resolve(build, "cjk-witness");
mkdirSync(root, { recursive: true });

const cpp = String.raw`
#include <iostream>
#include <string>
#include <vector>
#include "brkeng.h"
#include "dictionarydata.h"
#include "unicode/uniset.h"
#include "unicode/putil.h"
#include "uvectr32.h"
#define private public
#define protected public
#include "dictbe.h"
#undef private
#undef protected

using namespace icu;

class WitnessFactory : public ICULanguageBreakFactory {
public:
    using ICULanguageBreakFactory::ICULanguageBreakFactory;
    using ICULanguageBreakFactory::loadDictionaryMatcherFor;
};

void printSet(const char *name, const UnicodeSet &set) {
    std::cout << "S " << name;
    for (int32_t i = 0; i < set.getRangeCount(); ++i) {
        std::cout << ' ' << int32_t(set.getRangeStart(i)) << ' ' << int32_t(set.getRangeEnd(i)) + 1;
    }
    std::cout << '\n';
}

int main(int argc,char **argv) {
    if (argc != 2) return 2;
    u_setDataDirectory(argv[1]);
    UErrorCode status=U_ZERO_ERROR;
    WitnessFactory factory(status);
    CjkBreakEngine cj(factory.loadDictionaryMatcherFor(USCRIPT_HAN), kChineseJapanese, status);
    CjkBreakEngine ko(factory.loadDictionaryMatcherFor(USCRIPT_HAN), kKorean, status);
    UnicodeSet hiragana(UnicodeString(u"[:Hiragana:]"),status);
    if (U_FAILURE(status)) return 3;
    printSet("cj",cj.fSet);
    printSet("hangul",ko.fSet);
    printSet("digitOrOpenOrAlphabetic",cj.fDigitOrOpenPunctuationOrAlphabetSet);
    printSet("closePunctuation",cj.fClosePunctuationSet);
    printSet("hiragana",hiragana);
    int type, provider, len, position, start, end, phrase, capacity, initialStatus, preset;
    while (std::cin >> type >> provider >> len >> position >> start >> end >> phrase >> capacity >> initialStatus >> preset) {
        std::vector<char16_t> units(len + 1);
        for (int i = 0, unit; i < len; ++i) {
            std::cin >> unit;
            units[i] = static_cast<char16_t>(unit);
        }
        status = U_ZERO_ERROR;
        UText text = UTEXT_INITIALIZER;
        UnicodeString owner(units.data(), len);
        if (provider == 2) utext_openUnicodeString(&text, &owner, &status);
        else utext_openUChars(&text, units.data(), provider == 1 ? -1 : len, &status);
        utext_setNativeIndex(&text, position);
        int providerProps = text.providerProperties;
        UVector32 found(status);
        found.setMaxCapacity(capacity);
        if (preset >= 0) found.push(preset, status);
        status = static_cast<UErrorCode>(initialStatus);
        int count = (type == 0 ? ko : cj).findBreaks(&text, start, end, found, phrase != 0, status);
        std::cout << "D " << count << ' ' << status << ' ' << utext_getNativeIndex(&text) << ' ' << providerProps << ' ' << found.size();
        for (int i = 0; i < found.size(); ++i) std::cout << ' ' << found.elementAti(i);
        std::cout << '\n';
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
for (const [type, texts] of [
  [
    1,
    [
      "東京都に行く",
      "中华人民共和国",
      "漢字かなカナ交じり文",
      "あいうえおかきくけこ",
      "携帯電話",
      "］携帯電話］正しい選択",
      "る文字「そうだ、京都」",
      "乗車率９０％程度だろうか",
      "しかもロゴがＵｎｉｃｏｄｅ！",
      "𠮷野家東京都",
      "𠮷東京㍿",
      "ｶﾞ東京ｶﾀｶﾅ",
      "ゟ東京ヿ",
      "ｶﾞゟ東京神ヿ",
      "神社神宮",
      "カタカナシーケンス",
      "カ".repeat(19),
      "カ".repeat(20),
      "カ".repeat(21),
      "㐀㐁㐂㐃",
      "片仮名".repeat(35),
      "𠮷野家ｶﾞ".repeat(23),
      "𛅐𛅑𛄟東京都",
      "あ\0漢字",
    ],
  ],
  [0, ["한글", "대한민국", "한국어사전한국어", "한글".repeat(38), "한글漢字한글", "한글"]],
]) {
  for (const raw of texts) {
    const text = "😀" + raw + "［Ａ";
    for (const provider of raw.includes("\0") ? [0, 2] : [0, 1, 2]) {
      for (const [position, start, end, phrase, capacity, status, preset] of [
        [0, 2, text.length, 0, 0, 0, -1],
        [text.length, 2, text.length, 1, 0, 0, -1],
        [0, 3, text.length, 1, 0, 0, 1],
        [0, 2, Math.min(text.length, 4), 0, 0, 0, -1],
        [2, 2, text.length, 0, 1, 0, -1],
        [2, 2, text.length, 1, 1, 0, 1],
        [text.length, 2, text.length, 0, 0, 1, 1],
        [text.length, 2, text.length, 1, 0, -127, 1],
      ])
        cases.push({
          type,
          provider,
          text,
          position,
          start,
          end,
          phrase,
          capacity,
          status,
          preset,
        });
    }
  }
}
let input = "";
for (const c of cases) {
  input += `${c.type} ${c.provider} ${c.text.length} ${c.position} ${c.start} ${c.end} ${c.phrase} ${c.capacity} ${c.status} ${c.preset} `;
  for (let i = 0; i < c.text.length; ++i) input += c.text.charCodeAt(i) + " ";
  input += "\n";
}

const native = execFileSync(resolve(root, "witness"), [resolve(source, "data/in")], {
  input,
  encoding: "utf8",
  maxBuffer: 4 * 1024 * 1024,
});
const sets = {};
let index = 0;
for (const line of native.trimEnd().split("\n")) {
  const [op, ...fields] = line.split(" ");
  if (op === "S") sets[fields.shift()] = fields.map(Number);
  else if (op === "D") cases[index++].expected = fields.map(Number);
}
if (index !== cases.length) throw new Error("Incomplete original CJK observations");
for (const [file, artifact] of [
  ["dictbe.cjk.sets.json", sets],
  ["dictbe.cjk.native-observations.json", { icuVersion: "78.3", cases }],
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
console.log(`Captured ${index} native CJK calls`);
