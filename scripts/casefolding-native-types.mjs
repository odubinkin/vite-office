/** @fileoverview Compiles genuine cppumaker dependency objects for the pending native Locale/UNO closure; does not certify generated types or case mapping. */
import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { verifyMddsSources } from "./mdds-native-source.mjs";
import {
  configureUnicodeNativeHeaders,
  hash,
  loadUnicodeNativeSources,
  loadUnicodeOriginal,
  pin,
  upstream,
} from "./rtl-ustring-native-sources.mjs";

const target = "output/playwright/task39-native-types";
const units = [
  "codemaker/source/cppumaker/cppumaker.cxx",
  "codemaker/source/cppumaker/cppuoptions.cxx",
  "codemaker/source/cppumaker/cpputype.cxx",
  "codemaker/source/cppumaker/dependencies.cxx",
  "codemaker/source/cppumaker/dumputils.cxx",
  "codemaker/source/cppumaker/includes.cxx",
  "codemaker/source/codemaker/exceptiontree.cxx",
  "codemaker/source/codemaker/global.cxx",
  "codemaker/source/codemaker/options.cxx",
  "codemaker/source/codemaker/typemanager.cxx",
  "codemaker/source/codemaker/unotype.cxx",
  "codemaker/source/codemaker/codemaker.cxx",
  "codemaker/source/commoncpp/commoncpp.cxx",
  "unoidl/source/sourcefileprovider.cxx",
  "unoidl/source/sourcetreeprovider.cxx",
  "unoidl/source/unoidl.cxx",
  "unoidl/source/unoidlprovider.cxx",
  "unoidl/source/legacyprovider.cxx",
  "salhelper/source/simplereferenceobject.cxx",
];

if (process.argv.length !== 3 || process.argv[2] !== "--compile")
  throw new Error("Usage: node scripts/casefolding-native-types.mjs --compile");
mkdirSync(`${target}/objects`, { recursive: true });
const { sources } = loadUnicodeNativeSources();
const manifest = {
  pin,
  state: "compiling",
  boundary: "Original objects only; linking, generator execution and native case mapping pending",
  archiveHashes: verifyMddsSources().archiveHashes,
  configurations: configureUnicodeNativeHeaders(target, sources),
  sourceHashes: {},
  generatedHashes: {},
  tools: {},
  commands: [],
};

/** Persists complete evidence even when a native tool fails. @returns Nothing. */
function save() {
  manifest.sourceHashes = Object.fromEntries(
    Object.entries(sources).map(
      /** Hashes whole unchanged source blobs. @param entry - Path and bytes. @returns Path and digest. */ ([
        path,
        bytes,
      ]) => [path, hash(bytes)],
    ),
  );
  writeFileSync(`${target}/objects-manifest.json`, JSON.stringify(manifest, null, 2) + "\n");
}

/** Runs actual tools and retains their complete diagnostics. @param tool - Executable. @param argv - Exact arguments. @param label - Artifact stem. @returns Standard output. */
function run(tool, argv, label) {
  const result = spawnSync(tool, argv, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
  writeFileSync(`${target}/${label}.stdout`, result.stdout ?? "");
  writeFileSync(`${target}/${label}.stderr`, result.stderr ?? "");
  manifest.commands.push({ tool, argv, exitCode: result.status, signal: result.signal });
  if (result.status !== 0) manifest.state = "failed";
  save();
  if (result.status !== 0)
    throw new Error(result.error?.message ?? result.stderr ?? `Failed native tool: ${tool}`);
  return result.stdout;
}

for (const tool of ["clang++", "bison", "flex"])
  manifest.tools[tool] = run(tool, ["--version"], `${tool.replaceAll("+", "p")}-version`);
for (const name of ["config_options", "config_fuzzers"])
  writeFileSync(
    `${target}/headers/${name}.h`,
    loadUnicodeOriginal(sources, `config_host/${name}.h.in`),
  );
for (const path of [
  ...units,
  "codemaker/Executable_cppumaker.mk",
  "codemaker/StaticLibrary_codemaker.mk",
  "codemaker/StaticLibrary_codemaker_cpp.mk",
  "unoidl/Library_unoidl.mk",
  "salhelper/Library_salhelper.mk",
  "solenv/gbuild/LinkTarget.mk",
  "unoidl/source/sourceprovider-parser.y",
  "unoidl/source/sourceprovider-scanner.l",
])
  loadUnicodeOriginal(sources, path);

run(
  "bison",
  [
    "-v",
    `--defines=${target}/headers/sourceprovider-parser.hxx`,
    "-o",
    `${target}/sourceprovider-parser.cxx`,
    `${upstream}/unoidl/source/sourceprovider-parser.y`,
  ],
  "parser-generation",
);
run(
  "flex",
  [`-o${target}/sourceprovider-scanner.cxx`, `${upstream}/unoidl/source/sourceprovider-scanner.l`],
  "scanner-generation",
);
const generated = [`${target}/sourceprovider-parser.cxx`, `${target}/sourceprovider-scanner.cxx`];
for (const path of [...generated, `${target}/headers/sourceprovider-parser.hxx`])
  manifest.generatedHashes[path] = hash(readFileSync(path));

const flags = [
  "-std=c++20",
  "-O1",
  "-DMACOSX",
  "-DUNX",
  "-DLIBO_INTERNAL_ONLY",
  "-DLO_DLLIMPLEMENTATION_UNOIDL",
  "-DSALHELPER_DLLIMPLEMENTATION",
  `-I${target}/headers`,
  `-I${upstream}/include`,
  `-I${upstream}/codemaker/source/cppumaker`,
  `-I${upstream}/unoidl/source`,
  "-Ioutput/playwright/mdds-native/boost_1_91_0",
];
for (const path of [
  ...units.map(
    /** Resolves original compilation units. @param unit - Source path. @returns Compiler input. */ (
      unit,
    ) => `${upstream}/${unit}`,
  ),
  ...generated,
]) {
  const stem = path.replaceAll("/", "_");
  const dependency = `${target}/objects/${stem}.d`;
  run(
    "clang++",
    [...flags, "-MMD", "-MF", dependency, "-c", path, "-o", `${target}/objects/${stem}.o`],
    stem,
  );
  for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
    if (file.startsWith(`${upstream}/`))
      loadUnicodeOriginal(sources, file.slice(upstream.length + 1));
  console.log(`Compiled original unit: ${path}`);
}
manifest.state = "objects-complete";
save();
console.log(
  "Original cppumaker/provider objects complete; full native type generation remains pending.",
);
