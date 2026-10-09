/** @fileoverview Optional genuine pinned container utility comparison; ordinary tests consume committed portable outputs. */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const pinned = "9bc445578031fecf56086729d8e4940c77e14d65";
const upstream = "vendor/libreoffice-reference";
const target = "output/playwright/mdds-native";
const reference = "vendor/mdds-reference";
/** Hashes exact source bytes. @param bytes - Source. @returns Digest. */
export function digest(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/** Validates actual complete pinned compiler inputs. @returns Source and archive evidence. */
export function verifyMddsSources() {
  /** Verifies a complete pinned LibreOffice source blob. @param file - Native path. @returns Original bytes. */
  function original(file) {
    const bytes = readFileSync(`${upstream}/${file}`);
    if (!bytes.equals(execFileSync("git", ["-C", upstream, "show", `${pinned}:${file}`])))
      throw new Error(`Changed pinned LibreOffice source: ${file}`);
    return bytes;
  }
  if (
    execFileSync("git", ["-C", upstream, "rev-parse", "HEAD"], { encoding: "utf8" }).trim() !==
    pinned
  )
    throw new Error("The native probe requires the exact pinned LibreOffice checkout.");
  const downloads = original("download.lst").toString();
  const archives = { mdds: "mdds-3.2.1.tar.xz", boost: "boost_1_91_0.tar.xz" };
  const archiveHashes = {};
  for (const [name, archive] of Object.entries(archives)) {
    const prefix = name.toUpperCase();
    const expected = downloads.match(new RegExp(`${prefix}_SHA256SUM\\s*:?=\\s*([a-f0-9]+)`))?.[1];
    const bytes = readFileSync(`${target}/${archive}`);
    if (!expected || digest(bytes) !== expected || !downloads.includes(archive))
      throw new Error(`Archive differs from pinned download.lst: ${archive}`);
    archiveHashes[name] = expected;
  }
  // Validate actual compiler inputs against freshly extracted verified archives,
  // including the exact original LibreOffice patch. No synthesized native helpers.
  const clean = `${target}/verified`;
  mkdirSync(clean, { recursive: true });
  execFileSync("tar", ["-xf", `${target}/${archives.mdds}`, "-C", clean]);
  execFileSync("tar", ["-xf", `${target}/${archives.boost}`, "-C", clean, "boost_1_91_0/boost"]);
  const patch = original("external/mdds/gcc-12-silence-use-after-free.patch.1");
  execFileSync("patch", ["-d", `${clean}/mdds-3.2.1`, "-p1"], { input: patch });
  /** Checks every actual header against verified upstream files. @param actual - Compiler directory. @param expected - Verified directory. @returns Nothing. */
  function verifyDirectory(actual, expected) {
    for (const entry of readdirSync(expected, { withFileTypes: true })) {
      const a = path.join(actual, entry.name),
        e = path.join(expected, entry.name);
      if (entry.isDirectory()) verifyDirectory(a, e);
      else if (!readFileSync(a).equals(readFileSync(e)))
        throw new Error(`Changed native dependency: ${a}`);
    }
  }
  verifyDirectory(`${reference}/include`, `${clean}/mdds-3.2.1/include`);
  verifyDirectory(`${target}/boost_1_91_0/boost`, `${clean}/boost_1_91_0/boost`);
  const sourceHashes = Object.fromEntries(
    [
      "global.hpp",
      "multi_type_vector/types.hpp",
      "multi_type_vector/types_util.hpp",
      "multi_type_vector/delayed_delete_vector.hpp",
      "multi_type_vector/standard_element_blocks.hpp",
      "multi_type_vector/block_funcs.hpp",
      "multi_type_vector/macro.hpp",
      "multi_type_vector/util.hpp",
      "multi_type_vector/soa/main.hpp",
      "multi_type_vector/soa/main_def.inl",
      "multi_type_vector/soa/iterator.hpp",
      "multi_type_vector/iterator_node.hpp",
      "multi_type_vector/soa/block_util.hpp",
    ].map(
      /** Hashes the unchanged compiler source. @param file - Header. @returns Path and digest. */
      (file) => [file, digest(readFileSync(`${reference}/include/mdds/${file}`))],
    ),
  );

  return { pinned, target, reference, archiveHashes, sourceHashes };
}
