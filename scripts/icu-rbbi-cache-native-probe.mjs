/** @fileoverview Native original ICU78.3 UVector32/cache witness. Concrete native engines prepare dictionary inputs; the local model projects those observed fields without inventing an engine/factory. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { UVector32 } from "../apps/office/src/external/icu/source/common/uvectr32.ts";
import {
  BreakCache,
  DictionaryCache,
} from "../apps/office/src/external/icu/source/common/rbbi_cache.ts";
import {
  handleNext,
  handleSafePrevious,
} from "../apps/office/src/external/icu/source/common/rbbi.ts";
import { RBBIStateTable } from "../apps/office/src/external/icu/source/common/rbbidata.h.ts";
import { ucptrie_openFromBinary } from "../apps/office/src/external/icu/source/common/ucptrie.ts";
import {
  ucstrTextAccess,
  ucstrTextLength,
  utext_getNativeIndex,
} from "../apps/office/src/external/icu/source/common/utext.ts";
const source = resolve("vendor/icu-reference/source"),
  build = resolve("output/native/AQF9AG-icu-grego"),
  prefix = `${build}/rbbi-cache`;
const old = JSON.parse(
  readFileSync(
    "apps/office/src/external/icu/source/common/rbbi.forward.native-observations.json",
    "utf8",
  ),
);
const rule = old.fixtures.find(
  /** Selects the actual LibreOffice editing-word rules. @param item - Fixture. @returns Match. */ (
    item,
  ) => item.name === "edit_word",
);
if (!rule) throw Error("Missing original word rules");
const binary = Buffer.from(rule.binary, "base64");
writeFileSync(`${prefix}.bin`, binary);
const cpp = String.raw`
#include "unicode/brkiter.h"
#include "unicode/udata.h"
#include "unicode/parseerr.h"
#include "unicode/schriter.h"
#include "unicode/utext.h"
#include <iostream>
#include <fstream>
#include <vector>
#include <memory>
#include <string>
#include <climits>
#define private public
#include "uvectr32.h"
#include "unicode/rbbi.h"
#include "rbbi_cache.h"
#undef private
#include "rbbidata.h"
using namespace icu;using namespace std;
void vectorState(const UVector32&v,int result,UErrorCode status){cout<<"V "<<result<<' '<<int(status)<<' '<<v.count<<' '<<v.capacity<<' '<<v.maxCapacity<<' '<<int(v.isEmpty())<<' '<<v.peeki();for(int i=0;i<v.size();++i)cout<<' '<<v.elementAti(i);cout<<'\n';}
void dictionaryState(const RuleBasedBreakIterator::DictionaryCache&d){cout<<' '<<d.fPositionInCache<<' '<<d.fStart<<' '<<d.fLimit<<' '<<d.fFirstRuleStatusIndex<<' '<<d.fOtherRuleStatusIndex<<' '<<d.fBreaks.capacity<<' '<<d.fBreaks.size();for(int i=0;i<d.fBreaks.size();++i)cout<<' '<<d.fBreaks.elementAti(i);}
void textState(const UText&t){cout<<' '<<t.chunkNativeStart<<' '<<t.chunkNativeLimit<<' '<<t.chunkOffset<<' '<<t.chunkLength<<' '<<t.nativeIndexingLimit<<' '<<t.providerProperties<<' '<<t.a;}
void cacheState(const RuleBasedBreakIterator::BreakCache&c,int result,UErrorCode status,int out1,int out2){auto&bi=*c.fBI;cout<<"C "<<result<<' '<<int(status)<<' '<<bi.fPosition<<' '<<bi.fRuleStatusIndex<<' '<<int(bi.fDone)<<' '<<bi.fDictionaryCharCount<<' '<<c.fStartBufIdx<<' '<<c.fEndBufIdx<<' '<<c.fTextIdx<<' '<<c.fBufIdx<<' '<<c.fSideBuffer.capacity<<' '<<c.fSideBuffer.size();for(int i=0;i<c.fSideBuffer.size();++i)cout<<' '<<c.fSideBuffer.elementAti(i);int size=((c.fEndBufIdx-c.fStartBufIdx)&127)+1;cout<<' '<<size;for(int i=0;i<size;++i){int at=(c.fStartBufIdx+i)&127;cout<<' '<<c.fBoundaries[at]<<' '<<c.fStatuses[at];}dictionaryState(*bi.fDictionaryCache);textState(bi.fText);cout<<' '<<utext_getNativeIndex(&bi.fText)<<' '<<out1<<' '<<out2<<'\n';}
int main(int argc,char**argv){
 if(argc<2)return 2;
 if(string(argv[1])=="vector"){
  UErrorCode status=U_ZERO_ERROR,otherStatus=U_ZERO_ERROR;unique_ptr<UVector32>a(new UVector32(status));UVector32 b(otherStatus);string op;int x,y;
  while(cin>>op){int result=INT32_MIN;
   if(op=="V"){cin>>x>>y;status=UErrorCode(y);a.reset(new UVector32(x,status));}
   else if(op=="W"){cin>>x;status=UErrorCode(x);}
   else if(op=="A"){cin>>x;a->addElement(x,status);}else if(op=="P"){cin>>x;result=a->push(x,status);}else if(op=="O")result=a->popi();
   else if(op=="I"){cin>>x>>y;a->insertElementAt(x,y,status);}else if(op=="M"){cin>>x;a->removeElementAt(x);}else if(op=="Z")a->removeAllElements();
   else if(op=="S"){cin>>x;a->setSize(x);}else if(op=="L"){cin>>x;a->setMaxCapacity(x);}else if(op=="C"){cin>>x;result=a->ensureCapacity(x,status);}else if(op=="G"){cin>>x;result=a->expandCapacity(x,status);}
   else if(op=="E"){cin>>x;result=a->elementAti(x);}else if(op=="R"){cin>>x>>y;a->setElementAt(x,y);}
   else if(op=="B"){cin>>x;b.removeAllElements();otherStatus=U_ZERO_ERROR;while(x--){cin>>y;b.addElement(y,otherStatus);}}
   else if(op=="Q")a->assign(b,status);else if(op=="X")result=a->equals(b);else if(op=="U")result=a->containsAll(b);else if(op=="N")result=a->containsNone(b);
   else if(op=="D")result=a->removeAll(b);else if(op=="T")result=a->retainAll(b);else if(op=="d")result=a->removeAll(*a);else if(op=="t")result=a->retainAll(*a);
   else if(op=="F"){cin>>x;a->sortedInsert(x,status);}else if(op=="K"){cin>>x>>y;result=a->indexOf(x,y);}
   else if(op=="H"){cin>>x;auto*p=a->reserveBlock(x,status);result=p?int(p-a->elements):-999;for(int i=0;p&&i<x;++i)p[i]=1000+i;}
   else if(op=="J"){cin>>x;auto*p=a->popFrame(x);result=int(p-a->elements);}else return 3;
   vectorState(*a,result,status);
  }return 0;
 }
 if(argc!=4)return 4;u_setDataDirectory(argv[2]);ifstream f(argv[3],ios::binary|ios::ate);auto bytes=f.tellg();vector<uint32_t>data((size_t(bytes)+3)/4);f.seekg(0);f.read(reinterpret_cast<char*>(data.data()),bytes);
 int count;cin>>count;vector<u16string>texts(count);for(auto&s:texts){int n;cin>>n;unsigned c;while(n--){cin>>c;s.push_back(char16_t(c));}}
 UErrorCode status=U_ZERO_ERROR;unique_ptr<RuleBasedBreakIterator>bi;string op;int x,y,z;
 while(cin>>op){int result=INT32_MIN,out1=INT32_MIN,out2=INT32_MIN;
  if(op=="s"){
   cin>>x;status=U_ZERO_ERROR;bi.reset(new RuleBasedBreakIterator(reinterpret_cast<const uint8_t*>(data.data()),uint32_t(bytes),status));auto&s=texts[x];auto*ut=utext_openUChars(nullptr,s.data(),s.size(),&status);bi->setText(ut,status);utext_close(ut);if(U_FAILURE(status))return 5;
   for(unsigned i=0;i<bi->fData->fForwardTable->fLookAheadResultsSize;++i)bi->fLookAheadMatches[i]=-1;
   if(x==2)bi->fDictionaryCache->populateDictionary(0,s.size(),101,202);
   cout<<"I "<<x;textState(bi->fText);cout<<' '<<bi->fPosition<<' '<<bi->fRuleStatusIndex<<' '<<int(bi->fDone)<<' '<<bi->fDictionaryCharCount<<' '<<int(bi->fIsPhraseBreaking);dictionaryState(*bi->fDictionaryCache);cout<<'\n';
  }else if(op=="r"){cin>>x>>y;bi->fBreakCache->reset(x,y);}else if(op=="a"){cin>>x>>y>>z;bi->fBreakCache->addFollowing(x,y,RuleBasedBreakIterator::BreakCache::UpdatePositionValues(z));}
  else if(op=="b"){cin>>x>>y>>z;result=bi->fBreakCache->addPreceding(x,y,RuleBasedBreakIterator::BreakCache::UpdatePositionValues(z));}
  else if(op=="c")result=bi->fBreakCache->current();else if(op=="n")bi->fBreakCache->next();else if(op=="p")bi->fBreakCache->previous(status);
  else if(op=="f"){cin>>x;bi->fBreakCache->following(x,status);}else if(op=="g"){cin>>x;bi->fBreakCache->preceding(x,status);}else if(op=="k"){cin>>x;result=bi->fBreakCache->seek(x);}else if(op=="u"){cin>>x;result=bi->fBreakCache->populateNear(x,status);}
  else if(op=="v")result=bi->fBreakCache->populateFollowing();else if(op=="w")result=bi->fBreakCache->populatePreceding(status);else if(op=="e"){cin>>x;status=UErrorCode(x);}else if(op=="d"){cin>>x;bi->fDone=x;}
  else if(op=="h"){cin>>x>>y;bi->fDictionaryCache->populateDictionary(x,y,17,29);}else if(op=="j"){cin>>x;out1=1234;out2=5678;result=bi->fDictionaryCache->following(x,&out1,&out2);}else if(op=="l"){cin>>x;out1=1234;out2=5678;result=bi->fDictionaryCache->preceding(x,&out1,&out2);}else if(op=="q")bi->fDictionaryCache->reset();else return 6;
  cacheState(*bi->fBreakCache,result,status,out1,out2);
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
const vectorCommands = [
  "V 0 7",
  ...Array.from(
    { length: 10 },
    /** Adds through a failed status while capacity permits. @param unused - Unused. @param i - Value. @returns Command. */ (
      unused,
      i,
    ) => `A ${i}`,
  ),
  "C 8",
  "G 8",
  "W 0",
  "L 10",
  "A 55",
  "A 66",
  "A 77",
  "A 88",
  "O",
  "L 4",
  "E -1",
  "E 4",
  "I 42 1",
  "W 0",
  "Z",
  "M 9",
  "Z",
  "V 2147483647 0",
  "C 1",
  "A -4",
  "C -1",
  "W 0",
  "C 536870912",
  "W 0",
  "L 536870912",
  "L 0",
  "Z",
  "B 4 2 2 7 9",
  "Q",
  "X",
  "U",
  "N",
  "K 2 1",
  "R 8 1",
  "I 3 1",
  "M 9",
  "D",
  "T",
  "B 2 8 9",
  "Q",
  "A 9",
  "A 9",
  "D",
  "Z",
  "A 1",
  "A 2",
  "A 3",
  "A 4",
  "d",
  "t",
  "Z",
  "F 7",
  "F 2",
  "F 7",
  "F -2",
  "W 7",
  "F 3",
  "W 0",
  "H 2",
  "J 2",
  "S 2",
  "S 6",
  "L 3",
  "L 0",
  "S 10",
  "Z",
  "P -2147483648",
  "P 2147483647",
  "O",
  "O",
  "O",
];
const vectorRows = execFileSync(prefix, ["vector"], {
  input: vectorCommands.join("\n") + "\n",
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .map(
    /** Reads actual native vector observations. @param row - Native row. @returns Values. */ (
      row,
    ) => row.slice(2).split(" ").map(Number),
  );
let a,
  b = new UVector32([0]),
  status = [0];
for (let i = 0; i < vectorCommands.length; ++i) {
  const [op, ...args] = vectorCommands[i].split(" "),
    [x, y] = args.map(Number);
  let result = -2147483648;
  switch (op) {
    case "V":
      status = [y];
      a = new UVector32(x, status);
      break;
    case "W":
      status[0] = x;
      break;
    case "A":
      a.addElement(x, status);
      break;
    case "P":
      result = a.push(x, status);
      break;
    case "O":
      result = a.popi();
      break;
    case "I":
      a.insertElementAt(x, y, status);
      break;
    case "M":
      a.removeElementAt(x);
      break;
    case "Z":
      a.removeAllElements();
      break;
    case "S":
      a.setSize(x);
      break;
    case "L":
      a.setMaxCapacity(x);
      break;
    case "C":
      result = Number(a.ensureCapacity(x, status));
      break;
    case "G":
      result = Number(a.expandCapacity(x, status));
      break;
    case "E":
      result = a.elementAti(x);
      break;
    case "R":
      a.setElementAt(x, y);
      break;
    case "B":
      b.removeAllElements();
      for (const value of args.slice(1)) b.addElement(Number(value), [0]);
      break;
    case "Q":
      a.assign(b, status);
      break;
    case "X":
      result = Number(a.equals(b));
      break;
    case "U":
      result = Number(a.containsAll(b));
      break;
    case "N":
      result = Number(a.containsNone(b));
      break;
    case "D":
      result = Number(a.removeAll(b));
      break;
    case "T":
      result = Number(a.retainAll(b));
      break;
    case "d":
      result = Number(a.removeAll(a));
      break;
    case "t":
      result = Number(a.retainAll(a));
      break;
    case "F":
      a.sortedInsert(x, status);
      break;
    case "K":
      result = a.indexOf(x, y);
      break;
    case "H": {
      const p = a.reserveBlock(x, status);
      result = p ? (p.byteOffset - a.getBuffer().byteOffset) / 4 : -999;
      for (let j = 0; p && j < x; ++j) p[j] = 1000 + j;
      break;
    }
    case "J":
      result = (a.popFrame(x).byteOffset - a.getBuffer().byteOffset) / 4;
      break;
  }
  const row = [
    result,
    status[0],
    a.size(),
    a.capacity,
    a.maxCapacity,
    Number(a.isEmpty()),
    a.peeki(),
    ...Array.from(
      { length: Math.max(0, a.size()) },
      /** Reads only logically initialized scalar values. @param unused - Unused. @param index - Offset. @returns Value. */ (
        unused,
        index,
      ) => a.elementAti(index),
    ),
  ];
  if (JSON.stringify(row) !== JSON.stringify(vectorRows[i]))
    throw Error(`Vector mismatch ${vectorCommands[i]}: ${row} != ${vectorRows[i]}`);
}
const texts = [
    "a ".repeat(800),
    "alpha beta 12.34 gamma-delta, epsilon.\n".repeat(45),
    "中文日本語文章測試邊界".repeat(15),
  ],
  cacheCommands = ["s 0"];
for (let i = 1; i <= 300; ++i) {
  cacheCommands.push(`a ${i * 2} ${i % 5} 1`);
  if (i % 31 === 0) cacheCommands.push(`k ${(i - 5) * 2 + 1}`, "c");
}
cacheCommands.push(
  "r 1000 0",
  ...Array.from(
    { length: 127 },
    /** Fills every ring slot. @param unused - Unused. @param i - Index. @returns Command. */ (
      unused,
      i,
    ) => `a ${1001 + i} ${i % 7} 1`,
  ),
  "b 999 4 0",
  "b 999 4 1",
  "r 1000 0",
);
for (let i = 1; i <= 300; ++i) cacheCommands.push(`b ${1000 - i} ${i % 5} 1`);
cacheCommands.push(
  "r 0 0",
  "a 1 2 0",
  "a 2 4 0",
  "d 1",
  "n",
  "f 1",
  "e 7",
  "g 2",
  "u 300",
  "e 0",
  "s 1",
  "h 0 90",
  "h 1 2",
);
for (let i = 0; i < 170; ++i) cacheCommands.push("n");
cacheCommands.push("f 1200", "g 200", "f 70", "g 1400", "u 900", "c", "w", "v");
for (let i = 0; i < 35; ++i) cacheCommands.push("p");
cacheCommands.push(
  "s 2",
  "l 1",
  "l 1",
  "j -1",
  "j 0",
  "j 1",
  "j 165",
  "l 165",
  "l 0",
  "q",
  "j 0",
  "s 2",
  "h 1 2",
  "n",
  "n",
  "f 80",
  "g 130",
  "g 2",
  "f 150",
  "g 40",
  "e 7",
  "p",
  "f 10",
  "e 0",
  "g 0",
  "c",
);
const textInput = texts
  .map(
    /** Encodes actual caller UTF16. @param text - Text. @returns Native line. */ (text) =>
      [
        text.length,
        ...Array.from(
          { length: text.length },
          /** Reads original code units. @param unused - Unused. @param i - Offset. @returns Unit. */ (
            unused,
            i,
          ) => text.charCodeAt(i),
        ),
      ].join(" "),
  )
  .join("\n");
const rows = execFileSync(prefix, ["cache", `${source}/data/in`, `${prefix}.bin`], {
  input: `${texts.length}\n${textInput}\n${cacheCommands.join("\n")}\n`,
  encoding: "utf8",
  maxBuffer: 32e6,
})
  .trim()
  .split("\n");
const initial = rows
  .filter(
    /** Selects actual native initialized owner fields. @param row - Native row. @returns Match. */ (
      row,
    ) => row.startsWith("I "),
  )
  .map(
    /** Parses actual fields. @param row - Native row. @returns Values. */ (row) =>
      row.slice(2).split(" ").map(Number),
  );
const expected = rows
  .filter(
    /** Selects complete native cache snapshots. @param row - Native row. @returns Match. */ (
      row,
    ) => row.startsWith("C "),
  )
  .map(
    /** Parses source snapshots. @param row - Native row. @returns Values. */ (row) =>
      row.slice(2).split(" ").map(Number),
  );
/** Compact persisted witness, following an exact live comparison of every field. @param values - Full state. @returns Head, length and numeric hash. */
function summary(values) {
  let hash = 2166136261;
  for (const value of values) hash = Math.imul(hash ^ value, 16777619) >>> 0;
  return [...values.slice(0, 10), values.length, hash];
}
const bytes = new Uint8Array(binary),
  header = new Uint32Array(bytes.buffer, 0, 20),
  fForwardTable = new RBBIStateTable(bytes.subarray(header[4], header[4] + header[5])),
  fReverseTable = new RBBIStateTable(bytes.subarray(header[6], header[6] + header[7])),
  fTrie = ucptrie_openFromBinary(
    0,
    -1,
    bytes.subarray(header[8], header[8] + header[9]),
    header[9],
    null,
    [0],
  );
if (!fTrie) throw Error("Invalid original trie");
let owner, cache;
status = [0];
/** Reads the exact actual dictionary cache fields. @param dictionary - Actual cache. @returns State. */
function dictionaryState(dictionary) {
  const v = dictionary.fBreaks;
  return [
    dictionary.fPositionInCache,
    dictionary.fStart,
    dictionary.fLimit,
    dictionary.fFirstRuleStatusIndex,
    dictionary.fOtherRuleStatusIndex,
    v.capacity,
    v.size(),
    ...Array.from(
      { length: v.size() },
      /** Reads initialized entries. @param unused - Unused. @param i - Offset. @returns Value. */ (
        unused,
        i,
      ) => v.elementAti(i),
    ),
  ];
}
/** Reads source cache and iterator fields without recomputing boundaries. @param result - Actual result. @param outputs - Actual lookup out arguments. @returns Full state. */
function cacheState(result, outputs) {
  const side = cache.fSideBuffer,
    ring = ((cache.fEndBufIdx - cache.fStartBufIdx) & 127) + 1,
    out = [
      result,
      status[0],
      owner.fPosition,
      owner.fRuleStatusIndex,
      Number(owner.fDone),
      owner.fDictionaryCharCount,
      cache.fStartBufIdx,
      cache.fEndBufIdx,
      cache.fTextIdx,
      cache.fBufIdx,
      side.capacity,
      side.size(),
    ];
  for (let i = 0; i < side.size(); ++i) out.push(side.elementAti(i));
  out.push(ring);
  for (let i = 0; i < ring; ++i) {
    const at = (cache.fStartBufIdx + i) & 127;
    out.push(cache.fBoundaries[at], cache.fStatuses[at]);
  }
  out.push(...dictionaryState(owner.fDictionaryCache));
  const t = owner.fText;
  out.push(
    t.chunkNativeStart,
    t.chunkNativeLimit,
    t.chunkOffset,
    t.chunkLength,
    t.nativeIndexingLimit,
    t.providerProperties,
    t.a,
    utext_getNativeIndex(t),
    ...outputs,
  );
  return out;
}
for (let i = 0; i < cacheCommands.length; ++i) {
  const [op, ...args] = cacheCommands[i].split(" "),
    [x, y, z] = args.map(Number);
  let result = -2147483648;
  const outputs = [-2147483648, -2147483648];
  if (op === "s") {
    const fields = initial
        .find(
          /** Resolves this exact native scenario. @param row - Initial fields. @returns Match. */ (
            row,
          ) => row[0] === x,
        )
        .slice(1),
      units = new Uint16Array(texts[x].length + 1);
    for (let j = 0; j < texts[x].length; ++j) units[j] = texts[x].charCodeAt(j);
    owner = {
      fText: {
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
      },
      fData: { fForwardTable, fReverseTable, fTrie },
      fPosition: fields[7],
      fRuleStatusIndex: fields[8],
      fDone: Boolean(fields[9]),
      fDictionaryCharCount: fields[10],
      fIsPhraseBreaking: Boolean(fields[11]),
      fLookAheadMatches: new Int32Array(fForwardTable.fLookAheadResultsSize).fill(-1),
      handleNext,
      handleSafePrevious,
    };
    status = [0];
    const d = (owner.fDictionaryCache = new DictionaryCache(owner, status)),
      v = d.fBreaks;
    d.fPositionInCache = fields[12];
    d.fStart = fields[13];
    d.fLimit = fields[14];
    d.fFirstRuleStatusIndex = fields[15];
    d.fOtherRuleStatusIndex = fields[16];
    v.ensureCapacity(fields[17], status);
    v.setSize(fields[18]);
    v.getBuffer().set(fields.slice(19));
    if (x === 2 && v.size() === 0)
      throw Error("Native dictionary fixture did not load real engines");
    cache = new BreakCache(owner, status);
  } else
    switch (op) {
      case "r":
        cache.reset(x, y);
        break;
      case "a":
        cache.addFollowing(x, y, z);
        break;
      case "b":
        result = Number(cache.addPreceding(x, y, z));
        break;
      case "c":
        result = cache.current();
        break;
      case "n":
        cache.next();
        break;
      case "p":
        cache.previous(status);
        break;
      case "f":
        cache.following(x, status);
        break;
      case "g":
        cache.preceding(x, status);
        break;
      case "k":
        result = Number(cache.seek(x));
        break;
      case "u":
        result = Number(cache.populateNear(x, status));
        break;
      case "v":
        result = Number(cache.populateFollowing());
        break;
      case "w":
        result = Number(cache.populatePreceding(status));
        break;
      case "e":
        status[0] = x;
        break;
      case "d":
        owner.fDone = Boolean(x);
        break;
      case "h":
        owner.fDictionaryCache.populateDictionary(x, y, 17, 29);
        break;
      case "j": {
        const boundary = [1234],
          ruleStatus = [5678];
        result = Number(owner.fDictionaryCache.following(x, boundary, ruleStatus));
        outputs[0] = boundary[0];
        outputs[1] = ruleStatus[0];
        break;
      }
      case "l": {
        const boundary = [1234],
          ruleStatus = [5678];
        result = Number(owner.fDictionaryCache.preceding(x, boundary, ruleStatus));
        outputs[0] = boundary[0];
        outputs[1] = ruleStatus[0];
        break;
      }
      case "q":
        owner.fDictionaryCache.reset();
        break;
    }
  const actual = cacheState(result, outputs);
  if (JSON.stringify(actual) !== JSON.stringify(expected[i]))
    throw Error(`Cache mismatch ${i}:${cacheCommands[i]}\n${actual}\n${expected[i]}`);
}
const hashes = {};
for (const path of [
  "common/uvectr32.cpp",
  "common/uvectr32.h",
  "common/rbbi_cache.cpp",
  "common/rbbi_cache.h",
  "common/brkeng.h",
  "data/in/icudt78l.dat",
])
  hashes[path] = createHash("sha256")
    .update(readFileSync(`${source}/${path}`))
    .digest("hex");
const nativeArtifacts = {};
for (const path of [
  "lib/libicui18n.a",
  "lib/libicuuc.a",
  "stubdata/libicudata.a",
  "rbbi-cache.cpp",
  "rbbi-cache",
  "rbbi-cache.bin",
])
  nativeArtifacts[path] = createHash("sha256")
    .update(readFileSync(`${build}/${path}`))
    .digest("hex");
writeFileSync(
  "apps/office/src/external/icu/source/common/rbbi_cache.native-observations.json",
  JSON.stringify(
    {
      icuVersion: "78.3",
      scope:
        "Exact live logical cache/scalar and consumed-owner field comparison; uninitialized slots are excluded. Dictionary inputs are prepared by native engines. Concrete local engines, iterator bootstrap and allocator/RTTI/thread ABI remain unverified.",
      hashes,
      nativeArtifacts,
      binary: binary.toString("base64"),
      vectorCommands,
      vectorRows,
      texts: texts.map(
        /** Preserves native UTF16 inputs as units. @param text - Text. @returns Units. */ (text) =>
          Array.from(
            { length: text.length },
            /** Reads source units. @param unused - Unused. @param i - Offset. @returns Unit. */ (
              unused,
              i,
            ) => text.charCodeAt(i),
          ),
      ),
      cacheCommands,
      initial,
      cacheRows: expected.map(summary),
    },
    null,
    2,
  ) + "\n",
);
writeFileSync(
  `${prefix}-comparison.json`,
  JSON.stringify(
    { vectorStates: vectorCommands.length, cacheStates: cacheCommands.length, hashes },
    null,
    2,
  ) + "\n",
);
process.stdout.write(
  `Matched ${vectorCommands.length} native vector states and ${cacheCommands.length} logical cache/consumed-owner snapshots.\n`,
);
