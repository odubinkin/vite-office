/** @fileoverview Captures unchanged original RTL ASCII equality and full OUString header methods/literal operators for the Calc locale dependency. */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, openSync, closeSync } from "node:fs";
import { gzipSync } from "node:zlib";
import {
  upstream,
  pin,
  hash,
  scope,
  loadUnicodeNativeSources,
  loadUnicodeOriginal,
  configureUnicodeNativeHeaders,
  unicodeNativeLifetimePrefix,
} from "./rtl-ustring-native-sources.mjs";
const write = process.argv.includes("--write"),
  check = process.argv.includes("--check");
if (Number(write) + Number(check) !== 1) throw new Error("Use exactly --write or --check");
const target = "output/playwright/rtl-ascii-equality-native";
const fixture = "apps/office/src/sal/rtl/native-ascii-equality-cases.json";
const { sources, scopes } = loadUnicodeNativeSources();
const configured = configureUnicodeNativeHeaders(target, sources);
const reverse = scope(
  sources["sal/rtl/strtmpl.hxx"],
  "template <typename C1, typename C2, class Compare>\nsal_Int32 reverseCompare_WithLengths",
  "template <typename C> sal_Int32 hashCode_WithLength",
);
const reverseWrapper = scope(
  sources["sal/rtl/ustring.cxx"],
  "sal_Int32 SAL_CALL rtl_ustr_reverseCompare_WithLength",
  "sal_Int32 SAL_CALL rtl_ustr_compareIgnoreAsciiCase(",
);
const equality = scope(
  sources["sal/rtl/ustring.cxx"],
  "sal_Bool SAL_CALL rtl_ustr_asciil_reverseEquals_WithLength",
  "sal_Int32 SAL_CALL rtl_ustr_ascii_compareIgnoreAsciiCase(",
);
const buffers = [
  [],
  [0],
  [108, 116],
  [116, 114],
  [97, 122],
  [101, 110],
  [76, 84],
  [108],
  [108, 116, 0],
  [97, 0, 98],
  [0xd800],
  [0xdc00],
  [0xffff],
  [128],
  [55296, 0, 56320],
];
const bytes = [
  [],
  [0],
  [108, 116],
  [116, 114],
  [97, 122],
  [101, 110],
  [76, 84],
  [108],
  [108, 116, 0],
  [97, 0, 98],
  [127],
  [1, 127, 0],
];
const calls = [];
for (const unicode of buffers)
  for (const ascii of bytes)
    for (const length of new Set([0, Math.min(unicode.length, ascii.length)]))
      calls.push({
        unicode,
        ascii,
        unicodeOffset: 0,
        asciiOffset: 0,
        length,
        unicodeLength: unicode.length,
        asciiLength: ascii.length,
        nullUnicode: false,
        nullAscii: false,
      });
calls.push(
  {
    unicode: [],
    ascii: [],
    unicodeOffset: 0,
    asciiOffset: 0,
    length: 0,
    unicodeLength: 0,
    asciiLength: 0,
    nullUnicode: true,
    nullAscii: true,
  },
  {
    unicode: [90, 108, 116, 90],
    ascii: [90, 108, 116, 90],
    unicodeOffset: 1,
    asciiOffset: 1,
    length: 2,
    unicodeLength: 2,
    asciiLength: 2,
    nullUnicode: false,
    nullAscii: false,
  },
  {
    unicode: [108, 116],
    ascii: [],
    unicodeOffset: 0,
    asciiOffset: 0,
    length: 0,
    unicodeLength: 2,
    asciiLength: 0,
    nullUnicode: false,
    nullAscii: true,
  },
);
const fields = [
  "cEquality",
  "memberEquality",
  "literalLt",
  "literalTr",
  "literalAz",
  "borrowedEquality",
  "sameDataPointer",
  "beforeRefCount",
  "afterRefCount",
  "sameBuffers",
];
const driver = String.raw`${unicodeNativeLifetimePrefix(scopes, reverse, reverseWrapper)}
${equality}
#include <array>
#include <climits>
#include <cstdio>
#include <string>
static_assert(CHAR_MIN == -128 && sizeof(sal_Unicode)==2);
int main(int argc,char**argv){std::string mode=argc>1?argv[1]:"pairs";
if(mode=="guard"){sal_Unicode u[]={0};char a[]={0};volatile auto value=rtl_ustr_asciil_reverseEquals_WithLength(u,a,-1);(void)value;return 0;}
if(mode=="cases"){std::cout<<'[';bool comma=false;int un,an,uo,ao,n,ul,al,nu,na;while(std::cin>>un>>an>>uo>>ao>>n>>ul>>al>>nu>>na){std::vector<sal_Unicode>u(un+1);std::vector<char>a(an+1);unsigned x;for(int i=0;i<un;i++){std::cin>>x;u[i]=x;}for(int i=0;i<an;i++){std::cin>>x;a[i]=x;}auto const usaved=u;auto const asaved=a;auto up=nu?nullptr:u.data()+uo;auto ap=na?nullptr:a.data()+ao;OUString text(up,ul);auto p=text.pData;auto rc=p->refCount;auto const&borrowed=OUString::unacquired(&text.pData);std::array<long long,${fields.length}>row={rtl_ustr_asciil_reverseEquals_WithLength(up,ap,n),text.equalsAsciiL(ap,al),text=="lt",text=="tr",text=="az",borrowed.equalsAsciiL(ap,al),text.pData==p,rc,text.pData->refCount,u==usaved&&a==asaved};if(comma)std::cout<<',';comma=true;std::cout<<'[';for(unsigned i=0;i<row.size();i++){if(i)std::cout<<',';std::cout<<row[i];}std::cout<<']';}std::cout<<']';return 0;}
for(sal_uInt32 code=0;code<=0xffff;code++){sal_Unicode u=code;OUString text(u);std::array<unsigned char,256>row;for(unsigned b=0;b<128;b++){char a=b;row[b*2]=rtl_ustr_asciil_reverseEquals_WithLength(&u,&a,1);row[b*2+1]=text.equalsAsciiL(&a,1);}if(std::fwrite(row.data(),1,row.size(),stdout)!=row.size())return 3;}return 0;}
`;
writeFileSync(`${target}/driver.cpp`, driver);
const flags = [
  "-std=c++20",
  "-O1",
  "-DLIBO_INTERNAL_ONLY",
  "-DMACOSX",
  `-I${target}/headers`,
  `-I${upstream}/include`,
  "-pthread",
];
/** Compiles complete original scopes and genuine full headers. @param sanitized - Enable actual sanitizers. @returns Binary. */
function build(sanitized) {
  const binary = `${target}/driver${sanitized ? "-asan" : ""}`;
  const result = spawnSync(
    "clang++",
    [
      ...flags,
      ...(sanitized ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"] : []),
      `${target}/driver.cpp`,
      "-o",
      binary,
    ],
    { encoding: "utf8" },
  );
  writeFileSync(`${binary}.compile.stderr`, result.stderr);
  if (result.status !== 0) throw new Error(result.stderr);
  return binary;
}
const binary = build(false);
const deps = execFileSync("clang++", [...flags, "-MM", `${target}/driver.cpp`], {
  encoding: "utf8",
})
  .split(/\s+/)
  .filter(
    /** Selects actual original compiler dependencies. @param p - Dependency path. @returns Original source flag. */
    (p) => p.startsWith(upstream + "/"),
  );
for (const p of new Set(deps)) loadUnicodeOriginal(sources, p.slice(upstream.length + 1));
const input =
  calls
    .map(
      /** Serializes only original caller inputs. @param c - Native caller. @returns Input line. */
      (c) =>
        [
          c.unicode.length,
          c.ascii.length,
          c.unicodeOffset,
          c.asciiOffset,
          c.length,
          c.unicodeLength,
          c.asciiLength,
          Number(c.nullUnicode),
          Number(c.nullAscii),
          ...c.unicode,
          ...c.ascii,
        ].join(" "),
    )
    .join("\n") + "\n";
writeFileSync(`${target}/calls.txt`, input);
/** Retains complete raw native output with actual diagnostics. @param executable - Original caller. @param mode - Corpus selector. @returns Full observed bytes. */
function capture(executable, mode) {
  const path = `${executable}.${mode}`,
    fd = openSync(path, "w");
  let result;
  try {
    result = spawnSync(executable, [mode], {
      input: mode === "cases" ? input : undefined,
      stdio: ["pipe", fd, "pipe"],
      encoding: "utf8",
      env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
    });
  } finally {
    closeSync(fd);
  }
  writeFileSync(path + ".stderr", result.stderr);
  if (result.status !== 0) throw new Error(result.stderr);
  return readFileSync(path);
}
const pairs = capture(binary, "pairs"),
  cases = capture(binary, "cases");
if (pairs.length !== 65536 * 128 * 2) throw new Error("Incomplete original pair corpus");
const sanitized = build(true);
for (const [mode, bytes] of [
  ["pairs", pairs],
  ["cases", cases],
])
  if (!capture(sanitized, mode).equals(bytes))
    throw new Error(`Sanitized native output differs: ${mode}`);
const guard = spawnSync(binary, ["guard"], { encoding: "utf8" });
writeFileSync(`${target}/guard.stderr`, guard.stderr);
if (guard.signal !== "SIGABRT" || !guard.stderr.includes("nStrLen >= 0"))
  throw new Error("Missing original negative-length assertion");
const configuration = execFileSync("clang++", [...flags, "-dM", "-E", `${target}/driver.cpp`], {
  encoding: "utf8",
});
writeFileSync(`${target}/configuration.txt`, configuration);
const result = {
  baselineCommit: pin,
  sourceHashes: Object.fromEntries(
    Object.entries(sources).map(
      /** Records each full verified original source blob. @param entry - Full bytes. @returns Digest pair. */
      ([name, bytes]) => [name, hash(bytes)],
    ),
  ),
  configuredHeaderHashes: { types: hash(configured.types), global: hash(configured.global) },
  driverHash: hash(driver),
  equalityScopeHash: hash(equality),
  configurationHash: hash(configuration),
  pairs: {
    unicodeCount: 65536,
    asciiCount: 128,
    fields: ["rtl_ustr_asciil_reverseEquals_WithLength", "OUString::equalsAsciiL"],
    rawBytes: pairs.length,
    rawHash: hash(pairs),
    gzipBase64: gzipSync(pairs, { level: 9 }).toString("base64"),
  },
  fields,
  calls,
  observations: JSON.parse(cases),
  guard: { signal: guard.signal, expression: "nStrLen >= 0" },
  sanitizedIdentical: true,
  evidenceScope:
    "Original C ASCII equality, complete OUString header method/literal operators and borrowed views on the signed-char64-bit target; original ASCII0..127 caller precondition retained. Does not generate Locale or UNO exceptions, execute casefolding getValue/getConditionalValue, or certify diagnostic logging, invalid storage, native ABI or other char-sign targets.",
};
if (write) writeFileSync(fixture, JSON.stringify(result) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(result))
  throw new Error("Original ASCII equality capture differs");
console.log(
  JSON.stringify({
    status: write ? "written" : "verified",
    pairs: 65536 * 128,
    rawBytes: pairs.length,
    rawHash: result.pairs.rawHash,
    calls: calls.length,
    sources: Object.keys(sources).length,
    sanitizedIdentical: true,
    guard: result.guard,
  }),
);
