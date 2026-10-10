/** @fileoverview Builds genuine SAL/CPPU dependencies and verified ICU scopes for the original case-mapping caller. */
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, posix } from "node:path";
import { hash, loadUnicodeOriginal, pin, upstream } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";
import { verifyMddsSources } from "./mdds-native-source.mjs";

export const types = "output/playwright/task39-native-types";
export const common = "output/playwright/icu-case-native/icu/source/common";
const archive = "output/playwright/icu-case-native/icu4c-78.3-sources.tgz";
const archiveHash = "3a2e7a47604ba702f345878308e6fefeca612ee895cf4a5f222e7955fabfe0c0";

/** Prepares verified original native owners without substituting generated types or dependency bodies. @param target - Ignored build directory. @returns Build tools and complete source evidence. */
export function prepareCaseNative(target) {
  mkdirSync(target, { recursive: true });
  const manifest = {
    pin,
    state: "preparing",
    commands: [],
    sourceHashes: {},
    generatedHashes: {},
    icuHashes: {},
    scopeHashes: {},
    configurations: {},
  };
  const sources = {};
  /** Saves complete original provenance and terminal state. @returns Nothing. */
  function save() {
    for (const [name, value] of Object.entries(sources)) manifest.sourceHashes[name] = hash(value);
    writeFileSync(`${target}/manifest.json`, JSON.stringify(manifest, null, 2) + "\n");
  }
  process.on(
    "uncaughtExceptionMonitor",
    /** Records a terminal verification failure without suppressing it. @param error - Original failure. @returns Nothing. */
    (error) => {
      manifest.state = "failed";
      manifest.failure = error.message;
      save();
    },
  );
  /** Runs a genuine compiler/tool command with complete diagnostics. @param tool - Executable. @param argv - Arguments. @param label - Artifact stem. @returns Tool stdout. */
  function run(tool, argv, label) {
    const result = spawnSync(tool, argv, { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 });
    writeFileSync(`${target}/${label}.stdout`, result.stdout ?? "");
    writeFileSync(`${target}/${label}.stderr`, result.stderr ?? "");
    manifest.commands.push({ tool, argv, exitCode: result.status, signal: result.signal });
    if (result.status !== 0) manifest.state = "failed";
    save();
    if (result.status !== 0) throw new Error(result.error?.message ?? result.stderr);
    return result.stdout;
  }
  if (
    execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pin
  )
    throw new Error("Expected pinned LibreOffice baseline");
  const generated = JSON.parse(readFileSync(`${types}/objects-manifest.json`, "utf8"));
  if (generated.pin !== pin || generated.state !== "types-generated")
    throw new Error("Run casefolding-native-types.mjs --generate first");
  for (const [name, expected] of Object.entries(generated.sourceHashes))
    if (hash(loadUnicodeOriginal(sources, name)) !== expected)
      throw new Error(`Changed generator input: ${name}`);
  for (const [name, expected] of Object.entries(generated.generatedHashes)) {
    if (hash(readFileSync(name)) !== expected)
      throw new Error(`Changed original generated type: ${name}`);
    manifest.generatedHashes[name] = expected;
  }
  const configs = {
    "config_typesizes.h": generated.configurations.types,
    "config_global.h": generated.configurations.global,
    "config_options.h": loadUnicodeOriginal(sources, "config_host/config_options.h.in"),
    "config_fuzzers.h": loadUnicodeOriginal(sources, "config_host/config_fuzzers.h.in"),
  };
  for (const [name, value] of Object.entries(generated.libraries.configurations)) {
    if (name.startsWith("config_")) {
      let original = loadUnicodeOriginal(sources, `config_host/${name}.h.in`);
      if (name === "config_locales")
        original = original.replace("#define WITH_LOCALE_ALL 0", "#define WITH_LOCALE_ALL 1");
      if (original !== value) throw new Error(`Changed original library configuration: ${name}`);
      configs[`${name}.h`] = value;
    } else if (hash(readFileSync(`${types}/library-dependencies/${name}`)) !== value)
      throw new Error(`Changed archive header: ${name}`);
  }
  for (const [name, value] of Object.entries(configs)) {
    if (readFileSync(`${types}/headers/${name}`, "utf8") !== value)
      throw new Error(`Changed native configuration: ${name}`);
    manifest.configurations[name] = hash(value);
  }
  const downloads = loadUnicodeOriginal(sources, "download.lst");
  for (const tag of ["DRAGONBOX", "FAST_FLOAT"]) {
    const name = downloads.match(new RegExp(`${tag}_TARBALL := ([^\\n]+)`))?.[1];
    const expected = downloads.match(new RegExp(`${tag}_SHA256SUM := ([a-f0-9]+)`))?.[1];
    if (
      !name ||
      !expected ||
      generated.libraries.archives[name] !== expected ||
      hash(readFileSync(`${types}/${name}`)) !== expected
    )
      throw new Error(`Changed pinned archive: ${name}`);
    const prefix = tag === "DRAGONBOX" ? "dragonbox-" : "fast_float-";
    for (const relative of Object.keys(generated.libraries.configurations)) {
      if (!relative.startsWith(prefix)) continue;
      const value = readFileSync(`${types}/library-dependencies/${relative}`);
      if (
        !value.equals(
          execFileSync("tar", ["-xOf", `${types}/${name}`, relative], {
            maxBuffer: value.length + 1024,
          }),
        )
      )
        throw new Error(`Changed complete original archive header: ${relative}`);
    }
  }
  manifest.archiveHashes = {
    ...generated.libraries.archives,
    ...verifyMddsSources().archiveHashes,
    ICU: archiveHash,
  };
  if (hash(readFileSync(archive)) !== archiveHash) throw new Error("Changed pinned ICU archive");
  /** Reads a complete original ICU file verified against its pinned archive. @param name - Archive-relative path. @returns Source text. */
  function icuOriginal(name) {
    const value = readFileSync(`output/playwright/icu-case-native/icu/${name}`);
    if (
      !value.equals(
        execFileSync("tar", ["-xOf", archive, `icu/${name}`], { maxBuffer: value.length + 1024 }),
      )
    )
      throw new Error(`Changed original ICU source: ${name}`);
    manifest.icuHashes[name] = hash(value);
    return value.toString("utf8");
  }
  const icu = icuOriginal("source/common/ucase.cpp");
  for (const name of [
    "ucase.h",
    "utrie2.h",
    "ucase_props_data.h",
    "unicode/uchar.h",
    "unicode/stringoptions.h",
  ])
    icuOriginal(`source/common/${name}`);
  const macros = icu.slice(
    icu.indexOf("#define GET_EXCEPTIONS"),
    icu.indexOf("/* simple case mappings"),
  );
  if (!macros.startsWith("#define GET_EXCEPTIONS"))
    throw new Error("Missing actual ICU exception macros");
  manifest.scopeHashes.icuMacros = hash(macros);
  /** Selects a complete unchanged ICU function, including its original API macros. @param name - Scalar owner. @returns Full function. */
  function icuFunction(name) {
    const marker = icu.indexOf(`${name}(UChar32 c`);
    if (marker < 0) throw new Error(`Missing actual ICU function: ${name}`);
    const start = icu.lastIndexOf("U_CAPI", marker),
      body = icu.indexOf("{", marker);
    let end = body + 1,
      depth = 1;
    for (; depth; end++) {
      if (icu[end] === "{") depth++;
      else if (icu[end] === "}") depth--;
    }
    const value = icu.slice(start, end);
    manifest.scopeHashes[name] = hash(value);
    return value;
  }
  const icuFunctions = [
    "ucase_tolower",
    "ucase_toupper",
    "ucase_totitle",
    "ucase_fold",
    "u_tolower",
    "u_toupper",
    "u_totitle",
    "u_foldCase",
  ]
    .map(icuFunction)
    .join("\n\n");
  const prefix = `#include "ucase.h"\n#include "unicode/uchar.h"\n#include "unicode/stringoptions.h"\n#define INCLUDED_FROM_UCASE_CPP\n#include "ucase_props_data.h"\n${macros}\n${icuFunctions}\n`;
  const flags = [
    "-std=c++20",
    "-O1",
    "-DMACOSX",
    "-DUNX",
    "-DLIBO_INTERNAL_ONLY",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${types}/headers`,
    `-I${types}/generated`,
    `-I${upstream}/include`,
    `-I${upstream}/cppu/inc`,
    `-I${upstream}/i18nutil/source/utility`,
    `-I${common}`,
    "-Ioutput/playwright/mdds-native/boost_1_91_0",
  ];
  /** Builds every original SAL and CPPU object again with matching sanitizer instrumentation. @param sanitized - Instrument all native dependency units. @returns Genuine dependency object paths. */
  function libraries(sanitized) {
    const directory = `${target}/${sanitized ? "asan" : "normal"}`;
    mkdirSync(directory, { recursive: true });
    const sanitizer = sanitized
      ? ["-fsanitize=address,undefined", "-fno-omit-frame-pointer", "-g"]
      : [];
    const commands = generated.commands.filter(
      /** Selects only genuine completed SAL object commands. @param command - Original compiler command. @returns SAL selection. */
      (command) =>
        command.tool === "clang++" &&
        command.exitCode === 0 &&
        command.argv.includes("-c") &&
        command.argv.some(
          /** Identifies the original source unit. @param value - Compiler argument. @returns SAL source flag. */
          (value) => value.startsWith(`${upstream}/sal/`) && /\.(cxx|mm)$/.test(value),
        ),
    );
    if (commands.length !== 67) throw new Error("Incomplete actual SAL compilation graph");
    loadUnicodeOriginal(sources, "cppu/Library_cppu.mk");
    for (const name of ["static_types", "typelib"])
      commands.push({
        argv: [
          ...flags,
          "-DCPPU_DLLIMPLEMENTATION",
          "-c",
          `${upstream}/cppu/source/typelib/${name}.cxx`,
          "-o",
          `${name}.o`,
        ],
      });
    const objects = [];
    for (const command of commands) {
      const input = command.argv[command.argv.indexOf("-c") + 1];
      loadUnicodeOriginal(sources, originalDependency(input));
      const stem = basename(input),
        object = `${directory}/${input.slice(upstream.length + 1).replaceAll("/", "_")}.o`;
      const dependency = object + ".d";
      const argv = command.argv.slice(0, command.argv.indexOf("-c"));
      const marker = argv.indexOf("-MMD");
      if (marker >= 0) argv.splice(marker);
      run(
        "clang++",
        [...argv, ...sanitizer, "-MMD", "-MF", dependency, "-c", input, "-o", object],
        `${sanitized ? "asan" : "normal"}-${objects.length}-${stem}`,
      );
      for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/)) {
        if (file.startsWith(`${upstream}/`)) loadUnicodeOriginal(sources, originalDependency(file));
        else if (file.startsWith(`${common}/`))
          icuOriginal(posix.normalize(file).slice("output/playwright/icu-case-native/icu/".length));
      }
      objects.push(object);
      console.log(
        `Compiled ${sanitized ? "sanitized" : "normal"} original native dependency ${objects.length}/69: ${input}`,
      );
    }
    return objects;
  }
  return { sources, manifest, save, run, flags, prefix, libraries, icuOriginal };
}
