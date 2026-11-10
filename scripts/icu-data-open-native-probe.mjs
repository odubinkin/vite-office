/** @fileoverview Generates public ICU data-open observations with original POSIX mappings and linked stub data. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const icu = resolve("vendor/icu-reference/source");
const build = resolve("output/native/AQF9AG-icu-grego");
const root = resolve(build, "data-open-witness");
const pkg = readFileSync(resolve(build, "ucmndata-data/OpenOffice.dat"));
const toc = pkg.readUInt16LE(0);
const start = toc + pkg.readUInt32LE(toc + 8);
const end = toc + pkg.readUInt32LE(toc + 16);
const common = Buffer.from(pkg);
for (let i = 0; i < pkg.readUInt32LE(toc); ++i) {
  const name = toc + pkg.readUInt32LE(toc + 4 + i * 8);
  common.copyWithin(name + 8, name + 10, common.indexOf(0, name) + 1);
  common.write("icudt78l", name);
}
const item = Buffer.from(pkg.subarray(start, end));
item[20] = 0xab;
const bad = Buffer.from(item);
bad[2] = 0;

for (const dir of ["good/OpenOffice/tree", "bad/OpenOffice", "disk", "badpkg", "zone", "icudata"]) {
  mkdirSync(resolve(root, dir), { recursive: true });
}
writeFileSync(resolve(root, "icudata/icudt78l.dat"), common);
writeFileSync(resolve(root, "good/OpenOffice/count_word.brk"), item);
writeFileSync(resolve(root, "good/OpenOffice/tree/count_word.brk"), item);
writeFileSync(resolve(root, "good/OpenOfficea"), item);
writeFileSync(resolve(root, "bad/OpenOffice/count_word.brk"), bad);
writeFileSync(resolve(root, "disk/OpenOffice.dat"), pkg);
writeFileSync(resolve(root, "badpkg/OpenOffice.dat"), bad);
writeFileSync(resolve(root, "zone/zoneinfo64.res"), item);
writeFileSync(resolve(root, "app.dat"), pkg);

const cpp = String.raw`
#include <fstream>
#include <iostream>
#include <iterator>
#include <string>
#include <vector>
#include "unicode/putil.h"
#include "unicode/udata.h"
#include "ucmndata.h"
#include "udatamem.h"
using namespace std;

UBool U_CALLCONV accept(void *context, const char *type, const char *name, const UDataInfo *info) {
    cout << info->dataVersion[0] + 0 << ' ';
    return *(int *)context != 2 || info->dataVersion[0] != 0xab;
}

int main(int argc, char **argv) {
    if (argc != 10) return 2;
    int access = stoi(argv[1]), callback = stoi(argv[4]);
    UErrorCode status = U_ZERO_ERROR;
    if (access >= 0) udata_setFileAccess(UDataFileAccess(access), &status);
    u_setDataDirectory(argv[2]);
    if (stoi(argv[5])) u_setTimeZoneFilesDirectory("zone", &status);
    ifstream input("app.dat", ios::binary);
    vector<char> package((istreambuf_iterator<char>(input)), {});
    if (stoi(argv[3])) udata_setAppData("OpenOffice", package.data(), &status);
    if (U_FAILURE(status)) return 3;
    status = UErrorCode(stoi(argv[9]));
    auto cstr = [](const char *s) { return string(s) == "<null>" ? nullptr : s; };
    auto path = cstr(argv[6]), type = cstr(argv[7]), name = cstr(argv[8]);
    auto data = callback == 0
        ? udata_open(path, type, name, &status)
        : udata_openChoice(path, type, name, callback == 3 ? nullptr : accept, &callback, &status);
    cout << "| " << int(status);
    if (data) {
        auto payload = static_cast<const uint8_t *>(udata_getMemory(data));
        cout << ' ' << data->length << ' ' << udata_getLength(data)
             << ' ' << int(data->heapAllocated) << ' ' << int(data->map != nullptr)
             << ' ' << int(data->pHeader->info.dataVersion[0]);
        for (int i = 0; i < 4; ++i) cout << ' ' << int(payload[i]);
        udata_close(data);
    }
    cout << '\n';
}
`;
writeFileSync(resolve(root, "open.cpp"), cpp);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${icu}/common`,
    resolve(root, "open.cpp"),
    resolve(build, "lib/libicuuc.a"),
    resolve(build, "stubdata/libicudata.a"),
    "-o",
    resolve(root, "open"),
  ],
  { stdio: "inherit" },
);

/** Creates original public API arguments for one process. @param access - File access policy or -1 for default. @param dir - Data directory. @param registered - App package registration. @param callback - Callback selector. @param path - Package path. @param type - Item type. @param name - Item name. @param initial - Initial status. @param timezone - Set timezone file directory. @returns Test input. */
function input(
  access,
  dir,
  registered,
  callback = 0,
  path = "OpenOffice",
  type = "brk",
  name = "count_word",
  initial = 0,
  timezone = false,
) {
  return { access, dir, registered, callback, path, type, name, initial, timezone };
}
const cases = [
  input(-1, "good", true),
  input(0, "good", true, 1),
  input(1, "good", true, 1),
  input(2, "good", true, 1),
  input(3, "good", true, 1),
  input(0, "bad:good", true, 1),
  input(0, "bad", true, 1),
  input(0, "bad", false),
  input(0, "miss", true, 2),
  input(0, "good", true, 2),
  input(0, "good", false, 2),
  input(2, "good", false, 1),
  input(1, "disk", false),
  input(3, "disk", false),
  input(1, "badpkg:disk", false),
  input(0, "", false, 1, "good/OpenOffice"),
  input(0, "", false, 1, "./good/OpenOffice"),
  input(0, "good", false, 1, "OpenOffice-tree"),
  input(0, "good", false, 1, "OpenOffice", null, "a"),
  input(0, "good", false, 1, "OpenOffice", "", "a"),
  input(0, "miss", false, 1),
  input(0, "good", true, 0, "OpenOffice", "brk", "line_cj"),
  input(0, "good", true, 0, "OpenOffice", "brk", ""),
  input(0, "good", true, 0, "OpenOffice", "brk", null),
  input(0, "good", true, 3),
  input(0, "good", true, 1, "OpenOffice", "brk", "count_word", 7),
  input(0, "good", true, 1, "OpenOffice", "brk", "count_word", -124),
  input(0, "", false, 0, null, "brk"),
  input(0, "icudata", false, 1, null, "brk"),
  input(3, "icudata", false, 1, "ICUDATA", "brk"),
  input(0, "", false, 0, "ICUDATA-brkitr", "brk"),
  input(3, "", false, 1, null, "res", "zoneinfo64", 0, true),
];
const observations = [];
for (const itemCase of cases) {
  const { access, dir, registered, callback, timezone, path, type, name, initial } = itemCase;
  const output = execFileSync(
    resolve(root, "open"),
    [
      String(access),
      dir,
      String(Number(registered)),
      String(callback),
      String(Number(timezone)),
      path ?? "<null>",
      type ?? "<null>",
      name ?? "<null>",
      String(initial),
    ],
    { cwd: root, encoding: "utf8" },
  ).trim();
  const [calls, result] = output.split("|");
  observations.push({
    ...itemCase,
    calls: calls.trim() ? calls.trim().split(/\s+/u).map(Number) : [],
    result: result.trim().split(/\s+/u).map(Number),
  });
}

/** Records bytes actually linked or read. @param bytes - Data or source bytes. @returns SHA256. */
function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
const fixture = {
  icuVersion: "78.3",
  packageSha256: sha256(pkg),
  commonSha256: sha256(common),
  sourceHashes: Object.fromEntries(
    ["udata.cpp", "umapfile.cpp"].map(
      /** Fingerprints a native implementation. @param name - Source filename. @returns Hash entry. */
      (name) => [name, sha256(readFileSync(resolve(icu, "common", name)))],
    ),
  ),
  observations,
};
writeFileSync(
  "apps/office/src/external/icu/source/common/udata.open.native-observations.json",
  JSON.stringify(fixture, null, 2) + "\n",
);
console.log(`Recorded ${observations.length} original ICU data-open cases`);
