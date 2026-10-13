/** @fileoverview Captures complete original formula grammar source/header using a normal-only native caller and verifies every actual header dependency. */
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { isDeepStrictEqual } from "node:util";
import { format, resolveConfig } from "prettier";

const pin = "9bc445578031fecf56086729d8e4940c77e14d65";
const upstream = "vendor/libreoffice-reference";
const target = "output/playwright/formula-grammar-native";
const fixture = "apps/office/src/formula/inc/native-grammar-state-cases.json";
const config = "output/playwright/task39-native-types/headers";
const write = process.argv[2] === "--write";
if (process.argv.length !== 3 || (!write && process.argv[2] !== "--check"))
  throw Error("Use exactly --write or --check");
/** Hashes whole bytes. @param value - Source or output. @returns SHA256. */
function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}
const sources = {};
/** Verifies whole original bytes against the pinned git blob. @param path - Original file. @returns Source. */
function original(path) {
  const bytes = readFileSync(upstream + "/" + path);
  if (!bytes.equals(execFileSync("git", ["-C", upstream, "show", pin + ":" + path])))
    throw Error("Changed original header " + path);
  sources[path] = hash(bytes);
  return bytes.toString();
}
if (execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pin)
  throw Error("Expected pinned original source");
const header = original("include/formula/grammar.hxx");
original("formula/source/core/api/grammar.cxx");
const idl = original("offapi/com/sun/star/sheet/FormulaLanguage.idl");
const names = [...header.matchAll(/^\s*(GRAM_\w+)\s*=/gmu)].map(
  /** Reads original grammar declarations. @param match - Declaration. @returns Name. */ (match) =>
    match[1],
);
const languages = [...idl.matchAll(/const long (\w+)\s*=/gu)].map(
  /** Reads original IDL constant names. @param match - Declaration. @returns Name. */ (match) =>
    match[1],
);
const prior = JSON.parse(
  readFileSync("output/playwright/formula-token-array-native/manifest.json", "utf8"),
);
const generated = "output/playwright/formula-token-array-native/generated";
const generatedHashes = {};
for (const ext of ["hpp", "hdl"]) {
  const path = generated + "/com/sun/star/sheet/FormulaLanguage." + ext;
  generatedHashes[path] = hash(readFileSync(path));
  if (prior.generatedHashes[path] !== generatedHashes[path])
    throw Error("Changed genuine generated FormulaLanguage " + path);
}
const caller = String.raw`
#include <formula/grammar.hxx>
#include <formula/source/core/api/grammar.cxx>
#include <iostream>
using F=formula::FormulaGrammar;
void state(const char*stage,int input,F::Grammar value){
 std::cout<<stage<<" "<<input<<" "<<int(value)<<" "<<F::isEnglish(value)<<" "<<F::isSupported(value)<<" "<<F::extractFormulaLanguage(value)<<" ";
 if(int(value)<0)std::cout<<"excluded";else std::cout<<F::extractRefConvention(value);
 std::cout<<" "<<F::isPODF(value)<<" "<<F::isODFF(value)<<" "<<F::isOOXML(value)<<" ";
 if(int(value)<0)std::cout<<"excluded excluded";else std::cout<<F::isRefConventionOOXML(value)<<" "<<F::isExcelSyntax(value);
 std::cout<<"\n";
}
int main(){
 LANGUAGE_CALLS
 std::cout<<"flags "<<F::kConventionOffset<<" "<<F::kConventionShift<<" "<<F::kEnglishBit<<" "<<F::kFlagMask<<"\n";
 ENUM_CALLS
 for(bool english:{false,true})for(bool xml:{false,true})state("api",int(english)*2+int(xml),F::mapAPItoGrammar(english,xml));
 F::Grammar values[]={GRAMMAR_VALUES static_cast<F::Grammar>(0),static_cast<F::Grammar>(6),static_cast<F::Grammar>(32767),static_cast<F::Grammar>(65535),static_cast<F::Grammar>(65536),static_cast<F::Grammar>(16777216),static_cast<F::Grammar>(16777222),static_cast<F::Grammar>(F::GRAM_EXTERNAL|(9<<16)|F::kEnglishBit)};
 for(auto value:values){state("query",int(value),value);for(bool english:{false,true})state("english",int(english),F::setEnglishBit(value,english));for(int conv=-1;conv<=7;++conv)state("merge",conv,F::mergeToGrammar(value,static_cast<F::AddressConvention>(conv)));}
}
`
  .replace(
    "LANGUAGE_CALLS",
    languages
      .map(
        /** Emits genuine original IDL members. @param name - Constant name. @returns Native caller expression. */ (
          name,
        ) => `std::cout<<"language ${name} "<<css::sheet::FormulaLanguage::${name}<<"\\n";`,
      )
      .join("\n"),
  )
  .replace(
    "ENUM_CALLS",
    names
      .map(
        /** Emits original grammar member values. @param name - Enumerator. @returns Native caller expression. */ (
          name,
        ) => `std::cout<<"enum ${name} "<<int(F::${name})<<"\\n";`,
      )
      .join("\n"),
  )
  .replace(
    "GRAMMAR_VALUES",
    names
      .map(
        /** Includes every original grammar and alias. @param name - Enumerator. @returns Native enum expression. */ (
          name,
        ) => `F::${name},`,
      )
      .join(""),
  );
mkdirSync(target, { recursive: true });
writeFileSync(target + "/caller.cpp", caller);
const commands = [];
/** Runs and records an exact compiler or caller command. @param tool - Executable. @param argv - Arguments. @param label - Evidence file. @returns Whole stdout. */
function run(tool, argv, label) {
  const result = spawnSync(tool, argv, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  commands.push({ tool, argv, exitCode: result.status, signal: result.signal });
  writeFileSync(target + "/" + label + ".stdout", result.stdout ?? "");
  writeFileSync(target + "/" + label + ".stderr", result.stderr ?? "");
  writeFileSync(target + "/commands.json", JSON.stringify(commands, null, 2) + "\n");
  if (result.status !== 0 || result.signal || result.error || result.stderr)
    throw Error("Native command failed " + label + ": " + result.stderr);
  return result.stdout;
}
run(
  "clang++",
  [
    "-std=c++20",
    "-O1",
    "-DNDEBUG",
    "-I" + upstream,
    "-I" + generated,
    "-DMACOSX",
    "-DUNX",
    "-I" + config,
    "-I" + upstream + "/include",
    "-MMD",
    "-MF",
    target + "/caller.d",
    target + "/caller.cpp",
    "-o",
    target + "/caller",
  ],
  "compile",
);
const knownConfig = JSON.parse(
  readFileSync("output/playwright/uno-object-entry-native/manifest.json", "utf8"),
).configurations;
const configurations = {};
const toolchainMetadata = [];
for (const dependency of readFileSync(target + "/caller.d", "utf8")
  .replaceAll("\\\n", " ")
  .split(/\s+/u)
  .slice(1)
  .filter(Boolean)) {
  if (dependency === target + "/caller.cpp") continue;
  if (dependency.startsWith(generated + "/")) {
    if (hash(readFileSync(dependency)) !== generatedHashes[dependency])
      throw Error("Changed generated grammar dependency");
    continue;
  }
  if (dependency.startsWith(upstream + "/")) original(dependency.slice(upstream.length + 1));
  else if (dependency.startsWith(config + "/")) {
    const name = dependency.slice(config.length + 1),
      actual = hash(readFileSync(dependency));
    if (actual !== knownConfig[name])
      throw Error("Changed original native configuration " + dependency);
    configurations[dependency] = actual;
  } else if (dependency.endsWith("/MacOSX.sdk/SDKSettings.json")) {
    // Compiler-reported SDK metadata is not repository source; no outside-repo file is read here.
    toolchainMetadata.push(dependency);
  } else throw Error("Unexpected native dependency " + dependency);
}
const captures = {};
captures.state = run(target + "/caller", [], "state");
const data = {
  pin,
  normalOnly: true,
  driverHash: hash(caller),
  sourceHashes: sources,
  generatedHashes,
  configurations,
  toolchainMetadata,
  captures,
};
writeFileSync(
  target + "/manifest.json",
  JSON.stringify(
    {
      ...data,
      captures: Object.fromEntries(
        Object.entries(captures).map(
          /** Records whole output identity. @param entry - Capture. @returns Size/hash entry. */
          ([key, value]) => [key, { byteLength: Buffer.byteLength(value), sha256: hash(value) }],
        ),
      ),
      commands,
    },
    null,
    2,
  ) + "\n",
);
if (write)
  writeFileSync(
    fixture,
    await format(JSON.stringify(data), { ...(await resolveConfig(fixture)), parser: "json" }),
  );
else if (!isDeepStrictEqual(JSON.parse(readFileSync(fixture, "utf8")), data))
  throw Error("Committed original whole outputs changed");
console.log(
  JSON.stringify({
    normalOnly: true,
    enumNames: names.length,
    streamBytes: Buffer.byteLength(captures.state),
    streamLines: captures.state.trimEnd().split("\n").length,
    commands: commands.length,
    sources: Object.keys(sources).length,
    configurations: Object.keys(configurations).length,
  }),
);
