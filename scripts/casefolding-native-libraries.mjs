/** @fileoverview Builds genuine cached SAL/OSL/registry/store dependencies for the original native type generator. */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { posix, resolve } from "node:path";
import { hash, loadUnicodeOriginal, upstream } from "./rtl-ustring-native-sources.mjs";

const groups = {
  "registry/source": ["keyimpl", "reflread", "reflwrit", "regimpl", "registry", "regkey"],
  "store/source": [
    "object",
    "lockbyte",
    "storbase",
    "storbios",
    "storcach",
    "stordata",
    "stordir",
    "storlckb",
    "stortree",
    "storpage",
    "store",
  ],
  "sal/rtl": [
    "string",
    "ustring",
    "strbuf",
    "ustrbuf",
    "math",
    "hash",
    "strimp",
    "alloc_arena",
    "alloc_cache",
    "alloc_fini",
    "alloc_global",
    "byteseq",
    "uri",
    "crc",
    "locale",
    "cmdargs",
    "rtl_process",
  ],
  "sal/textenc": [
    "converter",
    "convertsimple",
    "handleundefinedunicodetotextchar",
    "tcvtutf8",
    "tencinfo",
    "textcvt",
    "textenc",
    "unichars",
    "context",
    "convertbig5hkscs",
    "converteuctw",
    "convertgb18030",
    "convertisciidevangari",
    "convertiso2022cn",
    "convertiso2022jp",
    "convertiso2022kr",
    "convertsinglebytetobmpunicode",
    "tables",
    "tcvtbyte",
    "tcvtmb",
    "tcvtutf7",
  ],
  "sal/osl/unx": [
    "file",
    "file_error_transl",
    "file_misc",
    "file_path_helper",
    "file_stat",
    "file_url",
    "tempfile",
    "thread",
    "nlsupport",
    "osxlocale",
    "mutex",
    "process",
    "memory",
    "interlck",
    "time",
    "readwrite_helper",
    "security",
    "process_impl",
    "salinit",
    "socket",
    "soffice",
  ],
  "sal/osl/all": ["filepath", "threadshared", "mutexshared", "log", "debugbase", "compat"],
};

/** Canonicalizes genuine compiler dependency paths without escaping the original source tree. @param file - Actual compiler path. @returns Original repository-relative path. */
export function originalDependency(file) {
  const normalized = posix.normalize(file);
  if (!normalized.startsWith(`${upstream}/`))
    throw new Error(`Original compiler dependency escapes source root: ${file}`);
  return normalized.slice(upstream.length + 1);
}

/** Builds original library units from pinned source and cached verified archives. @param sources - Full original blobs. @param target - Ignored build directory. @param run - Recorded native tool runner. @returns Objects, configured headers and archive evidence. */
export function compileNativeLibraries(sources, target, run) {
  const downloads = loadUnicodeOriginal(sources, "download.lst");
  const archives = {};
  const dependencies = `${target}/library-dependencies`;
  mkdirSync(dependencies, { recursive: true });
  for (const tag of ["DRAGONBOX", "FAST_FLOAT"]) {
    const name = downloads.match(new RegExp(`${tag}_TARBALL := ([^\\n]+)`))?.[1];
    const expected = downloads.match(new RegExp(`${tag}_SHA256SUM := ([a-f0-9]+)`))?.[1];
    if (!name || !expected || hash(readFileSync(`${target}/${name}`)) !== expected)
      throw new Error(`Missing or changed pinned native archive: ${tag}`);
    run("tar", ["-xf", `${target}/${name}`, "-C", dependencies], `${tag}-extraction`);
    archives[name] = expected;
  }
  const configurations = {};
  for (const name of ["config_features", "config_folders", "config_probes", "config_locales"]) {
    let source = loadUnicodeOriginal(sources, `config_host/${name}.h.in`);
    if (name === "config_locales")
      source = source.replace("#define WITH_LOCALE_ALL 0", "#define WITH_LOCALE_ALL 1");
    configurations[name] = source;
    writeFileSync(`${target}/headers/${name}.h`, source);
  }
  for (const path of [
    "registry/Library_reg.mk",
    "store/Library_store.mk",
    "sal/Library_sal.mk",
    "external/dragonbox/UnpackedTarball_dragonbox.mk",
    "external/fast_float/UnpackedTarball_fast_float.mk",
  ])
    loadUnicodeOriginal(sources, path);
  const units = Object.entries(groups).flatMap(
    /** Retains complete original library compilation units. @param entry - Directory and stems. @returns Source paths. */ ([
      directory,
      names,
    ]) =>
      names.map(
        /** Resolves an original source stem. @param name - File stem. @returns Source path. */ (
          name,
        ) => `${directory}/${name}.cxx`,
      ),
  );
  units.push("sal/osl/unx/uunxapi.mm", "sal/osl/unx/system.mm");
  const flags = [
    "-std=c++20",
    "-O1",
    "-DMACOSX",
    "-DUNX",
    "-DLIBO_INTERNAL_ONLY",
    "-DREG_DLLIMPLEMENTATION",
    "-DSTORE_DLLIMPLEMENTATION",
    "-DSAL_DLLIMPLEMENTATION",
    `-DSRCDIR="${resolve(upstream)}"`,
    `-I${target}/headers`,
    `-I${upstream}/include`,
    `-I${upstream}/registry/inc`,
    `-I${upstream}/sal/inc`,
    "-Ioutput/playwright/mdds-native/boost_1_91_0",
    `-I${dependencies}/dragonbox-1.1.3/include`,
    `-I${dependencies}/fast_float-8.2.10/include`,
  ];
  const objects = [];
  for (const unit of units) {
    loadUnicodeOriginal(sources, unit);
    const stem = unit.replaceAll("/", "_");
    const object = `${target}/objects/${stem}.o`,
      dependency = `${object}.d`;
    run(
      "clang++",
      [...flags, "-MMD", "-MF", dependency, "-c", `${upstream}/${unit}`, "-o", object],
      stem,
    );
    for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
      if (file.startsWith(`${upstream}/`)) loadUnicodeOriginal(sources, originalDependency(file));
    for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
      if (file.startsWith(`${dependencies}/`)) {
        const relative = file.slice(dependencies.length + 1);
        // Compiler headers come from the freshly extracted, SHA-verified full archives.
        configurations[relative] = hash(readFileSync(posix.normalize(file)));
      }
    objects.push(object);
    console.log(`Compiled genuine native library: ${unit}`);
  }
  // The original macOS library build permits the system zlib implementation.
  const zlib = execFileSync("clang++", ["-print-file-name=libz.dylib"], {
    encoding: "utf8",
  }).trim();
  return { objects, archives, configurations, systemZlib: zlib };
}
