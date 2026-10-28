/** @fileoverview Persists independently compiled ICU witness output for portable Vitest replay; comparison probes still validate the port before writing. */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
/** Hashes actual pinned source, compiled archive or witness bytes. @param path - Local evidence path. @returns SHA256. */
function hash(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}
/** Writes only native output rows after the caller's complete differential comparison. @param name - Witness basename. @param inputs - Complete native queries. @param rows - Original compiled outputs. @param build - Native build directory. @param source - Pinned source directory. @param sources - ICU-relative source responsibilities. @param directory - Original source family. @returns Nothing. */
export function writeIcuObservations(
  name,
  inputs,
  rows,
  build,
  source,
  sources,
  directory = "i18n",
) {
  if (!process.argv.includes("--write-fixtures")) return;
  if (inputs.length !== rows.length) throw Error("ICU observation row count differs");
  const sourceHashes = Object.fromEntries(
    sources.map(
      /** Retains original source identity. @param path - Source-relative path. @returns Hash pair. */
      (path) => [path, hash(resolve(source, path))],
    ),
  );
  const libraryHashes = Object.fromEntries(
    ["lib/libicui18n.a", "lib/libicuuc.a", "stubdata/libicudata.a"].map(
      /** Identifies the actual unchanged native dependency archives. @param path - Build-relative path. @returns Hash pair. */
      (path) => [path, hash(resolve(build, path))],
    ),
  );
  writeFileSync(
    resolve(`apps/office/src/external/icu/source/${directory}/${name}.native-observations.json`),
    JSON.stringify(
      {
        icuVersion: "78.3",
        capturedAt: new Date().toISOString(),
        sourceHashes,
        libraryHashes,
        witnessSha256: hash(resolve(build, `${name}-witness.cc`)),
        scope:
          "Compiled original ICU public/protected caller observations. Portable replay does not certify native ABI, allocator or concurrency behavior.",
        cases: inputs.map(
          /** Pairs a query exclusively with compiled native output. @param query - Native input. @param index - Row offset. @returns Observation pair. */
          (query, index) => [query, rows[index]],
        ),
      },
      null,
      2,
    ) + "\n",
  );
}
