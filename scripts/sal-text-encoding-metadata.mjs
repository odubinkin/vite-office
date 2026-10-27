/** @fileoverview Extracts full-locale SAL metadata from pinned original descriptors without binding converter services. */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const mode = process.argv[2];
if (process.argv.length !== 3 || !["--write", "--check"].includes(mode))
  throw new Error("Use exactly --write or --check.");
const root = "vendor/libreoffice-reference";
const pin = "9bc445578031fecf56086729d8e4940c77e14d65";
const revision = spawnSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" });
if (revision.status !== 0 || revision.stdout.trim() !== pin)
  throw new Error("The pinned LibreOffice source checkout is required.");
const sourceHashes = {};
/** Reads and records the original source. @param path - Upstream relative path. @returns Original text. */
function source(path) {
  const value = readFileSync(`${root}/${path}`, "utf8");
  sourceHashes[path] = createHash("sha256").update(value).digest("hex");
  return value;
}
const ids = new Map(
  [
    ...source("include/rtl/textenc.h").matchAll(
      /#define\s+(RTL_TEXTENCODING_\w+)\s+\(RTL_TEXTENC_CAST\(\s*(\d+)/g,
    ),
  ].map(
    /** Applies map to m. @param m - m value. @returns Callback result. */ (m) => [
      m[1],
      Number(m[2]),
    ],
  ),
);
const flags = new Map(
  [
    ...source("include/rtl/tencinfo.h").matchAll(
      /#define\s+(RTL_TEXTENCODING_INFO_\w+)\s+\(\(sal_uInt32\)(0x[\dA-Fa-f]+)\)/g,
    ),
  ].map(
    /** Applies map to m. @param m - m value. @returns Callback result. */ (m) => [
      m[1],
      Number(m[2]),
    ],
  ),
);
const core = source("sal/textenc/textenc.cxx");
const factory = source("sal/textenc/tables.cxx");
const bindings = new Map(
  [...factory.matchAll(/&(\w+)(?:,|\s*\};)\s*\/\*\s*(\w+)\s*\*\//g)].map(
    /** Applies map to m. @param m - m value. @returns Callback result. */ (m) => [m[2], m[1]],
  ),
);
for (const m of core.matchAll(/case RTL_TEXTENCODING_(\w+):\s*return &(\w+)/g))
  bindings.set(m[1], m[2]);
const aggregates = new Map();
for (const [path, text] of [
  ["sal/textenc/textenc.cxx", core],
  ...readdirSync(`${root}/sal/textenc`)
    .filter(
      /** Applies filter to name. @param name - name value. @returns Callback result. */ (name) =>
        name.endsWith(".tab"),
    )
    .sort()
    .map(
      /** Applies map to name. @param name - name value. @returns Callback result. */ (name) => {
        const path = `sal/textenc/${name}`;
        return [path, source(path)];
      },
    ),
]) {
  for (const m of text.matchAll(/ImplTextEncodingData\s+const\s+(\w+)\s*=\s*\{[\s\S]*?\};/g)) {
    const tail = m[0]
      .slice(m[0].lastIndexOf("},") + 2)
      .replace(/\};$/, "")
      .replace(/\/\*[\s\S]*?\*\//g, "");
    const fields = tail
      .split(",")
      .map(
        /** Applies map to field. @param field - field value. @returns Callback result. */ (
          field,
        ) => field.trim(),
      );
    if (fields.length !== 7) throw new Error(`Unexpected descriptor layout: ${m[1]} in ${path}`);
    const values = fields.slice(2, 6).map(Number);
    const terms = fields[6]
      .split("|")
      .map(
        /** Applies map to term. @param term - term value. @returns Callback result. */ (term) =>
          term.trim(),
      );
    const info = terms.reduce(
      /** Applies reduce to value, term. @param value - value value. @param term - term value. @returns Callback result. */ (
        value,
        term,
      ) => {
        const flag = flags.get(term) ?? (/^\d+$/.test(term) ? Number(term) : undefined);
        if (flag === undefined) throw new Error(`Unknown source info flag ${term}`);
        return value | flag;
      },
      0,
    );
    if (
      values.some(
        /** Applies some to value. @param value - value value. @returns Callback result. */ (
          value,
        ) => !Number.isInteger(value),
      )
    )
      throw new Error(`Invalid metadata ${m[1]}`);
    aggregates.set(m[1], {
      MinimumCharSize: values[0],
      MaximumCharSize: values[1],
      AverageCharSize: values[2],
      WindowsCharset: values[3],
      Flags: info,
    });
  }
}
const metadata = {},
  charsets = {};
for (const [name, descriptor] of bindings) {
  const id = ids.get(`RTL_TEXTENCODING_${name}`),
    data = aggregates.get(descriptor);
  if (id === undefined || data === undefined)
    throw new Error(`Unresolved original binding ${name}: ${descriptor}`);
  const { WindowsCharset, ...info } = data;
  metadata[id] = info;
  charsets[id] = WindowsCharset;
}
if (bindings.size !== 88) throw new Error("Pinned full-locale factory changed.");
const actualCharsets = JSON.parse(
  readFileSync("apps/office/src/sal/textenc/windows-charsets.json", "utf8"),
);
if (JSON.stringify(charsets) !== JSON.stringify(actualCharsets))
  throw new Error(
    "Extracted original charset metadata differs from existing pinned charset table.",
  );
const outputs = {
  "apps/office/src/sal/textenc/native-text-encoding-info.json": metadata,
  "apps/office/src/sal/textenc/native-text-encoding-info.sources.json": {
    pin,
    profile: "WITH_LOCALE_ALL; metadata only, no converter-service admission",
    sourceHashes,
  },
};
for (const [path, value] of Object.entries(outputs)) {
  if (mode === "--write") writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
  else if (JSON.stringify(JSON.parse(readFileSync(path, "utf8"))) !== JSON.stringify(value))
    throw new Error(`Stale native encoding metadata: ${path}`);
}
console.log(
  `${mode}: ${bindings.size} original full-locale encoding metadata records; charset table agrees.`,
);
