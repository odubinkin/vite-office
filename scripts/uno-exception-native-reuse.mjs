/** @fileoverview Verifies complete genuine desktop native dependency provenance, replays its whole original witnesses and compiles a new unchanged-owner caller without rebuilding immutable dependencies. */
import { spawnSync, execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { gunzipSync } from "node:zlib";
import { isDeepStrictEqual } from "node:util";
import { hash, pin, upstream, loadUnicodeOriginal } from "./rtl-ustring-native-sources.mjs";
import { originalDependency } from "./casefolding-native-libraries.mjs";
/** Verifies actual existing build and witnesses before reuse; missing/invalid inputs require the original full probe. @param target - New caller directory. @param base - Complete original dependency build. @param fixture - Complete original dependency witness. @param options - Optional normal-only caller mode. @returns Verified caller compiler and full evidence. */
export function reuseExceptionNative(target, base, fixture, options = {}) {
  const text = readFileSync(base + "/manifest.json"),
    previous = JSON.parse(text),
    witness = JSON.parse(readFileSync(fixture, "utf8"));
  if (
    previous.pin !== pin ||
    previous.state !== "captured" ||
    witness.pin !== pin ||
    execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !== pin
  )
    throw Error("Run the original complete dependency probe for the pinned baseline");
  for (const key of ["sourceHashes", "generatedHashes", "configurations"])
    if (!isDeepStrictEqual(previous[key], witness[key]))
      throw Error("Changed native dependency " + key);
  const sources = {};
  for (const [path, expected] of Object.entries(previous.sourceHashes))
    if (hash(loadUnicodeOriginal(sources, path)) !== expected)
      throw Error("Changed original dependency " + path);
  for (const [path, expected] of Object.entries(previous.generatedHashes))
    if (hash(readFileSync(path)) !== expected)
      throw Error("Changed original generated dependency " + path);
  for (const [path, expected] of Object.entries(previous.configurations)) {
    const file = ["config_global.h", "config_cxxabi.h"].includes(path)
      ? base + "/headers/" + path
      : "output/playwright/task39-native-types/headers/" + path;
    if (hash(readFileSync(file)) !== expected) throw Error("Changed native configuration " + file);
  }
  for (const [path, expected] of Object.entries(previous.icuHashes))
    if (hash(readFileSync("vendor/icu-reference/" + path)) !== expected)
      throw Error("Changed ICU input " + path);
  if (hash(readFileSync(base + "/driver.cpp")) !== witness.driverHash)
    throw Error("Changed original witness caller");
  if (
    previous.commands.length !== 219 ||
    previous.commands.some(
      /** Checks every actual terminal command. @param command - Original command. @returns Invalid completion. */ (
        command,
      ) => command.exitCode !== 0 || command.signal !== null,
    )
  )
    throw Error("Incomplete genuine dependency build");
  const compiles = previous.commands.filter(
    /** Selects actual whole original unit compiles. @param command - Original invocation. @returns Compile predicate. */ (
      command,
    ) => command.argv.includes("-c"),
  );
  if (
    compiles.length !== 202 ||
    compiles.filter(
      /** Identifies matching instrumented units. @param command - Compile. @returns Instrumentation predicate. */ (
        command,
      ) => command.argv.includes("-fsanitize=address,undefined"),
    ).length !== 101
  )
    throw Error("Incomplete original dependency instrumentation");
  if (
    previous.commands.some(
      /** Rejects unresolved symbol suppression. @param command - Original command. @returns Unsupported compiler option. */ (
        command,
      ) =>
        command.argv.some(
          /** Examines actual argument. @param value - Argument. @returns Suppression predicate. */ (
            value,
          ) => value.includes("dynamic_lookup") || value.includes("unresolved"),
        ),
    )
  )
    throw Error("Unsupported native dependency link");
  if (previous.featureProbes.length !== 10) throw Error("Changed actual original feature probes");
  for (const probe of previous.featureProbes) {
    if (
      probe.signal !== null ||
      ![0, 1].includes(probe.exitCode) ||
      hash(readFileSync(base + "/" + probe.name + ".cpp")) !== probe.sourceHash
    )
      throw Error("Invalid original feature probe");
    for (const kind of ["stdout", "stderr"])
      if (hash(readFileSync(base + "/" + probe.name + ".cpp." + kind)) !== probe[kind + "Hash"])
        throw Error("Changed probe diagnostics");
  }
  if (
    hash(readFileSync(base + "/loader-probe.cpp")) !== previous.loaderProbe.sourceHash ||
    hash(readFileSync(base + "/headers/config_global.h")) !==
      previous.loaderProbe.configuredGlobalHash ||
    hash(readFileSync("output/playwright/task39-native-types/headers/config_global.h")) !==
      previous.loaderProbe.originalGlobalHash
  )
    throw Error("Changed real native loader evidence");
  mkdirSync(target, { recursive: true });
  const artifactHashes = {};
  for (const command of previous.commands) {
    const index = command.argv.indexOf("-o");
    if (index >= 0) {
      const path = command.argv[index + 1];
      artifactHashes[path] = hash(readFileSync(path));
    }
  }
  const manifest = {
    pin,
    state: "preparing",
    commands: [],
    sourceHashes: previous.sourceHashes,
    generatedHashes: previous.generatedHashes,
    configurations: previous.configurations,
    reusedDependencyBuild: {
      path: base,
      manifestHash: hash(text),
      originalUnitsPerVariant: 101,
      positiveTerminalCommands: 219,
      artifactHashes,
      featureProbes: previous.featureProbes,
      loaderProbe: previous.loaderProbe,
      witnesses: [],
    },
  };
  /** Records full new evidence without touching the original dependency build. @returns Nothing. */
  function save() {
    manifest.sourceHashes = Object.fromEntries(
      Object.entries(sources).map(
        /** Hashes whole original blobs. @param entry - Original source pair. @returns Hash entry. */ ([
          path,
          data,
        ]) => [path, hash(data)],
      ),
    );
    writeFileSync(target + "/manifest.json", JSON.stringify(manifest, null, 2) + "\n");
  }
  /** Executes one real command and preserves every diagnostic byte. @param tool - Native executable. @param argv - Exact arguments. @param label - Owned artifact label. @returns Complete output. */
  function run(tool, argv, label) {
    const result = spawnSync(tool, argv, {
      maxBuffer: 32 * 1024 * 1024,
      env: { ...process.env, ASAN_OPTIONS: "detect_leaks=0", UBSAN_OPTIONS: "halt_on_error=1" },
    });
    writeFileSync(target + "/" + label + ".stdout", result.stdout ?? "");
    writeFileSync(target + "/" + label + ".stderr", result.stderr ?? "");
    manifest.commands.push({ tool, argv, exitCode: result.status, signal: result.signal });
    save();
    if (result.status !== 0 || result.signal !== null || result.error)
      throw Error("Native command failed " + label + ": " + result.stderr);
    return result;
  }
  for (const [mode, capture] of Object.entries(witness.captures)) {
    const expected = gunzipSync(Buffer.from(capture.gzipBase64, "base64"));
    if (expected.length !== capture.byteLength || hash(expected) !== capture.digest)
      throw Error("Invalid original whole witness");
    for (const label of options.normalOnly ? ["normal"] : ["normal", "asan"]) {
      const result = run(
        base + "/" + label + "/caller",
        [mode],
        "dependency-" + label + "-" + mode,
      );
      if (result.stderr.length || !result.stdout.equals(expected))
        throw Error("Changed original whole dependency witness");
      manifest.reusedDependencyBuild.witnesses.push({
        label,
        mode,
        byteLength: expected.length,
        digest: capture.digest,
      });
    }
  }
  /** Compiles the whole new owner caller with unchanged original dependency flags, objects and libraries. @param sanitized - Matching original instrumentation. @param extraArguments - Genuine additional owner sources/include flags. @returns Actual linked caller path. */
  function build(sanitized, extraArguments = []) {
    const label = sanitized ? "asan" : "normal",
      dir = target + "/" + label;
    mkdirSync(dir, { recursive: true });
    const original = previous.commands.find(
      /** Finds the exact prior genuine caller link. @param command - Actual invocation. @returns Corresponding caller predicate. */ (
        command,
      ) =>
        command.argv.includes(base + "/driver.cpp") &&
        command.argv.includes(base + "/" + label + "/caller"),
    );
    if (!original) throw Error("Missing genuine caller command");
    const dependency = dir + "/caller.d",
      argv = original.argv.map(
        /** Replaces only new caller input/output paths. @param arg - Existing compiler argument. @returns Actual new argument. */ (
          arg,
        ) =>
          arg === base + "/driver.cpp"
            ? target + "/driver.cpp"
            : arg === base + "/" + label + "/caller.d"
              ? dependency
              : arg === base + "/" + label + "/caller"
                ? dir + "/caller"
                : arg,
      );
    argv.push(...extraArguments, "-Wl,-rpath," + resolve(base + "/" + label));
    run(original.tool, argv, label + "-link-caller");
    for (const file of readFileSync(dependency, "utf8").replaceAll("\\\n", " ").split(/\s+/))
      if (file.startsWith(upstream + "/")) loadUnicodeOriginal(sources, originalDependency(file));
    for (const [path, expected] of Object.entries(artifactHashes))
      if (hash(readFileSync(path)) !== expected)
        throw Error("Reused dependency changed during caller build");
    save();
    return dir + "/caller";
  }
  save();
  return { sources, manifest, save, run, build };
}
