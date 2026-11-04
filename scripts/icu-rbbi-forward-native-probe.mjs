/** @fileoverview Original ICU78.3 private forward-method witness using real LibreOffice rule compilation, UText and actual ICU libraries. A private-to-public test-access token changes header access only; no native method/provider body is replaced. Run with npx tsx. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import {
  handleNext,
  handleSafePrevious,
} from "../apps/office/src/external/icu/source/common/rbbi.ts";
import { RBBIStateTable } from "../apps/office/src/external/icu/source/common/rbbidata.h.ts";
import { ucptrie_openFromBinary } from "../apps/office/src/external/icu/source/common/ucptrie.ts";
import {
  ucstrTextAccess,
  ucstrTextLength,
  utext_current32,
  utext_getPreviousNativeIndex,
  utext_previous32,
  utext_nativeLength,
  utext_getNativeIndex,
  utext_setNativeIndex,
  utext_next32,
} from "../apps/office/src/external/icu/source/common/utext.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  prefix = `${build}/rbbi-forward`;
const names = [
  "edit_word",
  "edit_word_hu",
  "dict_word",
  "dict_word_hu",
  "dict_word_prepostdash",
  "count_word",
  "line",
  "line_cj",
];
const rules = names.map(
  /** Resolves original custom rule files. @param name - Source basename. @returns Actual file. */ (
    name,
  ) => resolve(`vendor/libreoffice-reference/i18npool/source/breakiterator/data/${name}.txt`),
);
writeFileSync(`${prefix}-lookahead.txt`, "!!chain; a/b {11}; .;\n");
writeFileSync(
  `${prefix}-many-states.txt`,
  Array.from(
    { length: 300 },
    /** Creates a rule-compiler state-width witness, not a replacement rule compiler. @param unused - Unused element. @param index - Literal branch. @returns Rule. */ (
      unused,
      index,
    ) => `'a${index}z' {${index + 1}};`,
  ).join("\n") + "\n.;\n",
);
rules.push(`${prefix}-lookahead.txt`, `${prefix}-many-states.txt`);
const texts = [
  "a".repeat(31) + "😀" + "b".repeat(40),
  "",
  "one dollar and twenty-two cents",
  "a.b_c-d – e—f",
  "a\t b\r\nc",
  "ababa ab",
  "a299z a12z",
  "École Straße İSTANBUL Σίσυφος",
  'אבג"דה a',
  "中文a日本語",
  "ภาษาไทย a ខ្មែរ",
  "😀a👩‍👩‍👧‍👦z",
  "\uD800x\uDC00\uD83D\uDE00",
  "a\u0301\u200Db\u00A0c",
  "\0a\0b",
];
const cpp = String.raw`
#include "unicode/brkiter.h"
#include "unicode/udata.h"
#include "unicode/parseerr.h"
#include "unicode/schriter.h"
#include "unicode/utext.h"
#include <fstream>
#include <iostream>
#include <sstream>
#include <vector>
#include <iterator>
#define private public
#include "unicode/rbbi.h"
#undef private
#include "rbbidata.h"
using namespace icu;using namespace std;
int main(int argc,char**argv){
 if(argc<4)return 2;u_setDataDirectory(argv[1]);
 vector<u16string>texts;int n;while(cin>>n){u16string s;unsigned c;while(n--){cin>>c;s.push_back(char16_t(c));}texts.push_back(s);}
 for(int rid=3;rid<argc;++rid){
  ifstream f(argv[rid]);string rule((istreambuf_iterator<char>(f)),{});UErrorCode status=U_ZERO_ERROR;UParseError parse{};
  RuleBasedBreakIterator bi(UnicodeString::fromUTF8(rule),parse,status);
  if(U_FAILURE(status)){cerr<<argv[rid]<<":"<<u_errorName(status)<<":"<<parse.line<<":"<<parse.offset<<"\n";return 3;}
  uint32_t length;auto*binary=bi.getBinaryRules(length);ofstream(string(argv[2])+"-"+to_string(rid-3)+".bin",ios::binary).write(reinterpret_cast<const char*>(binary),length);
  cout<<"R "<<rid-3<<' '<<length<<'\n';
  for(size_t tid=0;tid<texts.size();++tid){auto&s=texts[tid];
   for(int start=0;start<=int(s.size());++start){
    UText*ut=utext_openUChars(nullptr,reinterpret_cast<const char16_t*>(s.data()),s.size(),&status);bi.setText(ut,status);utext_close(ut);if(U_FAILURE(status))return 4;
    bi.fPosition=start;bi.fRuleStatusIndex=777;bi.fDictionaryCharCount=888;bi.fDone=false;
    for(unsigned i=0;i<bi.fData->fForwardTable->fLookAheadResultsSize;++i)bi.fLookAheadMatches[i]=-1;
    auto&t=bi.fText;
    cout<<"C "<<rid-3<<' '<<tid<<' '<<start<<' '<<t.chunkNativeStart<<' '<<t.chunkNativeLimit<<' '<<t.chunkOffset<<' '<<t.chunkLength<<' '<<t.nativeIndexingLimit<<' '<<t.providerProperties<<' '<<t.a;
    int result=bi.handleNext();
    cout<<' '<<result<<' '<<bi.fPosition<<' '<<bi.fRuleStatusIndex<<' '<<bi.fDictionaryCharCount<<' '<<int(bi.fDone)<<' '<<utext_getNativeIndex(&t)<<' '<<t.chunkOffset<<'\n';
    ut=utext_openUChars(nullptr,reinterpret_cast<const char16_t*>(s.data()),s.size(),&status);bi.setText(ut,status);utext_close(ut);if(U_FAILURE(status))return 6;
    bi.fPosition=start;bi.fRuleStatusIndex=777;bi.fDictionaryCharCount=888;bi.fDone=false;
    cout<<"B "<<rid-3<<' '<<tid<<' '<<start<<' '<<t.chunkNativeStart<<' '<<t.chunkNativeLimit<<' '<<t.chunkOffset<<' '<<t.chunkLength<<' '<<t.nativeIndexingLimit<<' '<<t.providerProperties<<' '<<t.a;
    result=bi.handleSafePrevious(start);
    cout<<' '<<result<<' '<<bi.fPosition<<' '<<bi.fRuleStatusIndex<<' '<<bi.fDictionaryCharCount<<' '<<int(bi.fDone)<<' '<<utext_getNativeIndex(&t)<<' '<<t.chunkOffset<<'\n';
   }
  }
 }
 for(size_t tid=0;tid<texts.size();++tid)for(int mode=0;mode<2;++mode)for(int direct=0;direct<2;++direct)for(int pos=-2;pos<=int(texts[tid].size())+2;++pos){
  UErrorCode status=U_ZERO_ERROR;auto&s=texts[tid];UText*t=utext_openUChars(nullptr,s.data(),mode?-1:s.size(),&status);if(U_FAILURE(status))return 5;
  cout<<"U "<<tid<<' '<<mode<<' '<<pos<<' '<<direct<<' '<<t->chunkNativeStart<<' '<<t->chunkNativeLimit<<' '<<t->chunkOffset<<' '<<t->chunkLength<<' '<<t->nativeIndexingLimit<<' '<<t->providerProperties<<' '<<t->a;
  if(direct)t->pFuncs->access(t,pos,true);else utext_setNativeIndex(t,pos);auto before=utext_getNativeIndex(t);int c=utext_next32(t);
  cout<<' '<<before<<' '<<c<<' '<<utext_getNativeIndex(t)<<' '<<t->chunkNativeLimit<<' '<<t->chunkOffset<<' '<<t->chunkLength<<' '<<t->nativeIndexingLimit<<' '<<t->providerProperties<<' '<<t->a;
  int current=utext_current32(t);auto currentIndex=utext_getNativeIndex(t),previousIndex=utext_getPreviousNativeIndex(t),restoredIndex=utext_getNativeIndex(t);int previous=utext_previous32(t);auto previousPosition=utext_getNativeIndex(t),length=utext_nativeLength(t);
  cout<<' '<<current<<' '<<currentIndex<<' '<<previousIndex<<' '<<restoredIndex<<' '<<previous<<' '<<previousPosition<<' '<<length<<' '<<t->chunkNativeLimit<<' '<<t->chunkOffset<<' '<<t->chunkLength<<' '<<t->nativeIndexingLimit<<' '<<t->providerProperties<<' '<<t->a<<'\n';utext_close(t);
 }
}
`;
writeFileSync(`${prefix}.cpp`, cpp);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${source}/common`,
    `${prefix}.cpp`,
    `${build}/lib/libicui18n.a`,
    `${build}/lib/libicuuc.a`,
    `${build}/stubdata/libicudata.a`,
    "-o",
    prefix,
  ],
  { stdio: "inherit" },
);
const input =
  texts
    .map(
      /** Supplies explicit UTF16 spans including embedded NUL/unpaired surrogates. @param text - Text. @returns Native input line. */ (
        text,
      ) =>
        [
          text.length,
          ...Array.from(
            { length: text.length },
            /** Reads code units independently of scalar iteration. @param unused - Unused. @param index - Unit offset. @returns Unit. */ (
              unused,
              index,
            ) => text.charCodeAt(index),
          ),
        ].join(" "),
    )
    .join("\n") + "\n";
const rows = execFileSync(prefix, [`${source}/data/in`, prefix, ...rules], {
    input,
    encoding: "utf8",
    maxBuffer: 8e6,
  })
    .trim()
    .split("\n"),
  fixtures = [];
let matched = 0,
  matchedReverse = 0;
for (let rid = 0; rid < rules.length; ++rid) {
  const bytes = new Uint8Array(readFileSync(`${prefix}-${rid}.bin`)),
    header = new Uint32Array(bytes.buffer, bytes.byteOffset, 20),
    status = [0];
  const fForwardTable = new RBBIStateTable(bytes.subarray(header[4], header[4] + header[5])),
    fReverseTable = new RBBIStateTable(bytes.subarray(header[6], header[6] + header[7])),
    fTrie = ucptrie_openFromBinary(
      0,
      -1,
      bytes.subarray(header[8], header[8] + header[9]),
      header[9],
      null,
      status,
    );
  if (!fTrie) throw Error(`Bad native trie ${status}`);
  const cases = rows
    .filter(
      /** Selects actual method rows for this compiled rule. @param row - Native row. @returns Match. */ (
        row,
      ) => row.startsWith(`C ${rid} `),
    )
    .map(
      /** Replays native prepared fields and compares actual mutated state. @param row - Native row. @returns Persistent observation. */ (
        row,
      ) => {
        const values = row.split(" ").slice(2).map(Number),
          [tid, start, ...fields] = values,
          text = texts[tid],
          units = Uint16Array.from(
            Array.from(
              { length: text.length },
              /** Reads the same caller-provided UTF16 span. @param unused - Unused. @param index - Offset. @returns Unit. */ (
                unused,
                index,
              ) => text.charCodeAt(index),
            ),
          );
        const fText = {
          chunkNativeStart: fields[0],
          chunkNativeLimit: fields[1],
          chunkOffset: fields[2],
          chunkLength: fields[3],
          nativeIndexingLimit: fields[4],
          providerProperties: fields[5],
          a: fields[6],
          context: units,
          chunkContents: units,
          pFuncs: {
            access: ucstrTextAccess,
            nativeLength: ucstrTextLength,
            mapOffsetToNative: null,
            mapNativeIndexToUTF16: null,
          },
        };
        const state = {
          fData: { fForwardTable, fTrie },
          fText,
          fPosition: start,
          fRuleStatusIndex: 777,
          fDictionaryCharCount: 888,
          fDone: false,
          fLookAheadMatches: new Int32Array(fForwardTable.fLookAheadResultsSize).fill(-1),
        };
        const result = handleNext.call(state),
          actual = [
            result,
            state.fPosition,
            state.fRuleStatusIndex,
            state.fDictionaryCharCount,
            Number(state.fDone),
            utext_getNativeIndex(fText),
            fText.chunkOffset,
          ],
          expected = fields.slice(7);
        if (JSON.stringify(actual) !== JSON.stringify(expected))
          throw Error(
            `Native forward mismatch ${rules[rid]} ${tid}/${start}: ${actual} != ${expected}`,
          );
        ++matched;
        return { text: tid, start, initial: fields.slice(0, 7), expected };
      },
    );
  const reverseCases = rows
    .filter(
      /** Selects original safe reverse rows. @param row - Native row. @returns Match. */ (row) =>
        row.startsWith(`B ${rid} `),
    )
    .map(
      /** Compares original safe reverse cursor/unchanged iterator state. @param row - Native row. @returns Exact observation tuple. */ (
        row,
      ) => {
        const values = row.split(" ").slice(2).map(Number),
          [tid, start, ...fields] = values,
          text = texts[tid],
          units = new Uint16Array(text.length + 1);
        for (let i = 0; i < text.length; ++i) units[i] = text.charCodeAt(i);
        const fText = {
          chunkNativeStart: fields[0],
          chunkNativeLimit: fields[1],
          chunkOffset: fields[2],
          chunkLength: fields[3],
          nativeIndexingLimit: fields[4],
          providerProperties: fields[5],
          a: fields[6],
          context: units,
          chunkContents: units,
          pFuncs: {
            access: ucstrTextAccess,
            nativeLength: ucstrTextLength,
            mapOffsetToNative: null,
            mapNativeIndexToUTF16: null,
          },
        };
        const state = {
          fText,
          fData: { fReverseTable, fTrie },
          fPosition: start,
          fRuleStatusIndex: 777,
          fDictionaryCharCount: 888,
          fDone: false,
        };
        const result = handleSafePrevious.call(state, start),
          actual = [
            result,
            state.fPosition,
            state.fRuleStatusIndex,
            state.fDictionaryCharCount,
            Number(state.fDone),
            utext_getNativeIndex(fText),
            fText.chunkOffset,
          ];
        if (JSON.stringify(actual) !== JSON.stringify(fields.slice(7)))
          throw Error(
            `Native safe reverse mismatch ${rid}/${tid}/${start}: ${actual} != ${fields.slice(7)}`,
          );
        ++matchedReverse;
        return values;
      },
    );
  fixtures.push({
    name: rid < names.length ? names[rid] : rid === names.length ? "lookahead" : "many-states",
    binary: Buffer.from(bytes).toString("base64"),
    flags: fForwardTable.fFlags,
    cases,
    reverseFlags: fReverseTable.fFlags,
    reverseCases,
  });
}
const utextCases = rows
  .filter(
    /** Selects independent UText observations. @param row - Native row. @returns Match. */ (row) =>
      row.startsWith("U "),
  )
  .map(
    /** Replays native explicit/NUL-length access and forward state. @param row - Native observation. @returns Persistent case. */ (
      row,
    ) => {
      const [tid, mode, start, direct, ...fields] = row.slice(2).split(" ").map(Number),
        text = texts[tid],
        units = Uint16Array.from([
          ...Array.from(
            { length: text.length },
            /** Reads actual supplied UTF16 units. @param unused - Unused. @param index - Position. @returns Unit. */ (
              unused,
              index,
            ) => text.charCodeAt(index),
          ),
          0,
        ]);
      const fText = {
        chunkNativeStart: fields[0],
        chunkNativeLimit: fields[1],
        chunkOffset: fields[2],
        chunkLength: fields[3],
        nativeIndexingLimit: fields[4],
        providerProperties: fields[5],
        a: fields[6],
        context: units,
        chunkContents: units,
        pFuncs: {
          access: ucstrTextAccess,
          nativeLength: ucstrTextLength,
          mapOffsetToNative: null,
          mapNativeIndexToUTF16: null,
        },
      };
      if (direct) ucstrTextAccess(fText, start, true);
      else utext_setNativeIndex(fText, start);
      const before = utext_getNativeIndex(fText),
        c = utext_next32(fText),
        actual = [
          before,
          c,
          utext_getNativeIndex(fText),
          fText.chunkNativeLimit,
          fText.chunkOffset,
          fText.chunkLength,
          fText.nativeIndexingLimit,
          fText.providerProperties,
          fText.a,
        ],
        expected = fields.slice(7);
      const current = utext_current32(fText),
        currentIndex = utext_getNativeIndex(fText),
        previousIndex = utext_getPreviousNativeIndex(fText),
        restoredIndex = utext_getNativeIndex(fText),
        previous = utext_previous32(fText),
        previousPosition = utext_getNativeIndex(fText),
        length = utext_nativeLength(fText);
      actual.push(
        current,
        currentIndex,
        previousIndex,
        restoredIndex,
        previous,
        previousPosition,
        length,
        fText.chunkNativeLimit,
        fText.chunkOffset,
        fText.chunkLength,
        fText.nativeIndexingLimit,
        fText.providerProperties,
        fText.a,
      );
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw Error(`Native UText mismatch ${tid}/${mode}/${start}: ${actual} != ${expected}`);
      return { text: tid, mode, start, direct, initial: fields.slice(0, 7), expected };
    },
  );
const hashes = {};
for (const path of [
  ...rules,
  `${source}/common/rbbi.cpp`,
  `${source}/common/utext.cpp`,
  `${source}/common/rbbidata.h`,
  `${build}/lib/libicuuc.a`,
  `${build}/lib/libicui18n.a`,
  `${prefix}.cpp`,
  prefix,
])
  hashes[path.slice(resolve(".").length + 1)] = createHash("sha256")
    .update(readFileSync(path))
    .digest("hex");
const report = {
  icuVersion: "78.3",
  scope:
    "Original private forward/safe reverse methods and explicit/NUL-length UChars index/current/forward/backward/length state. Access-only header token; unchanged native method/provider bodies. No complete iterator/cache/dictionary/title/service claim.",
  matched,
  matchedReverse,
  hashes,
  texts: texts.map(
    /** Stores explicit UTF16 units, including lone surrogates, without relying on JSON scalar normalization. @param text - Actual supplied text. @returns Original code units. */ (
      text,
    ) =>
      Array.from(
        { length: text.length },
        /** Reads an unchanged native input unit. @param unused - Unused. @param index - Offset. @returns Unit. */ (
          unused,
          index,
        ) => text.charCodeAt(index),
      ),
  ),
  fixtures,
  utextCases,
};
writeFileSync(
  "apps/office/src/external/icu/source/common/rbbi.forward.native-observations.json",
  JSON.stringify(report, null, 2) + "\n",
);
writeFileSync(
  `${prefix}-comparison.json`,
  JSON.stringify({ matched, matchedReverse, utextCases: utextCases.length, hashes }, null, 2) +
    "\n",
);
process.stdout.write(
  `Matched ${matched} original forward-state observations, ${matchedReverse} safe reverse observations for ${rules.length} compiled rule sets and ${utextCases.length} UText sequences.\n`,
);
