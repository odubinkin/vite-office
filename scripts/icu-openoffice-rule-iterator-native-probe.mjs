/** @fileoverview Exports the linked LibreOffice OpenOffice_dat table and native ICU UChars and rule-iterator observations. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const icu = resolve("vendor/icu-reference/source");
const lo = resolve("vendor/libreoffice-reference/i18npool");
const build = resolve("output/native/AQF9AG-icu-grego");
const root = resolve(build, "openoffice-rule-iterator");
mkdirSync(root, { recursive: true });
const rules = [
  "count_word",
  "dict_word_hu",
  "dict_word_prepostdash",
  "dict_word",
  "edit_word_hu",
  "edit_word",
  "line",
  "line_cj",
];
const objects = [];
for (const name of rules) {
  const file = resolve(root, name + ".brk");
  execFileSync(resolve(build, "bin/genbrk"), [
    "-i",
    resolve(icu, "data/in"),
    "-r",
    resolve(lo, "source/breakiterator/data", name + ".txt"),
    "-o",
    file,
  ]);
  execFileSync(resolve(build, "bin/genccode"), ["-n", "OpenOffice", "-d", root, file]);
  const object = resolve(root, name + "_brk.o");
  execFileSync("clang", [
    "-DU_STATIC_IMPLEMENTATION",
    `-I${icu}/common`,
    "-c",
    resolve(root, name + "_brk.c"),
    "-o",
    object,
  ]);
  objects.push(object);
}
const response = resolve(root, "rules.lst");
writeFileSync(response, rules.join(".brk\n") + ".brk\n");
execFileSync(
  resolve(build, "bin/gencmn"),
  ["-n", "OpenOffice", "-t", "tmp", "-S", "-d", root, "0", response],
  { cwd: root },
);
const tocObject = resolve(root, "OpenOffice_tmp.o");
execFileSync("clang", [
  "-DU_STATIC_IMPLEMENTATION",
  `-I${icu}/common`,
  "-c",
  resolve(root, "OpenOffice_tmp.c"),
  "-o",
  tocObject,
]);

const cpp = String.raw`
#include <cstring>
#include <iomanip>
#include <iostream>
#include <string>
#include <vector>
#include "unicode/rbbi.h"
#include "unicode/udata.h"
#include "unicode/utext.h"
#include "ucmndata.h"
#include "udatamem.h"
#include "rbbidata.h"
using namespace std;
using namespace icu;
extern "C" const char OpenOffice_dat[];
struct Entry { const char *name; const DataHeader *data; };
struct Table { uint32_t count, reserved; Entry entries[1]; };

void hexBytes(const void *data, size_t size) {
    auto bytes = static_cast<const uint8_t *>(data);
    cout << hex << setfill('0');
    for (size_t i = 0; i < size; ++i) cout << setw(2) << unsigned(bytes[i]);
    cout << dec;
}
void emitPackage() {
    auto toc = reinterpret_cast<const Table *>(OpenOffice_dat + 32);
    cout << "H "; hexBytes(OpenOffice_dat, 40); cout << '\n';
    for (uint32_t i = 0; i < toc->count; ++i) {
        auto entry = toc->entries[i];
        auto header = UDataMemory_normalizeDataPointer(entry.data);
        auto rules = reinterpret_cast<const RBBIDataHeader *>(reinterpret_cast<const char *>(header) + header->dataHeader.headerSize);
        size_t bytes = reinterpret_cast<const char *>(rules) - reinterpret_cast<const char *>(entry.data) + rules->fLength;
        cout << "R " << entry.name << ' '; hexBytes(entry.data, bytes); cout << '\n';
    }
}
void observeText() {
    char16_t chars[] = {u'a', 0xd83d, 0xde00, u'b', 0, u'z', 0};
    UText source = UTEXT_INITIALIZER, shallow = UTEXT_INITIALIZER, deep = UTEXT_INITIALIZER;
    UErrorCode status = U_ZERO_ERROR;
    utext_openUChars(&source, chars, -1, &status);
    cout << "T " << source.flags << ' ' << source.providerProperties << ' ' << source.a << ' ' << source.chunkLength;
    cout << ' ' << utext_char32At(&source, 2) << ' ' << utext_getNativeIndex(&source);
    cout << ' ' << utext_nativeLength(&source) << ' ' << source.providerProperties << ' ' << source.chunkLength;
    utext_clone(&shallow, &source, false, true, &status);
    utext_clone(&deep, &source, true, false, &status);
    cout << ' ' << int(shallow.context == source.context) << ' ' << int(deep.context == source.context)
         << ' ' << int(deep.chunkContents == source.chunkContents) << ' ' << deep.providerProperties;
    chars[0] = u'Q';
    cout << ' ' << utext_char32At(&deep, 0) << ' ' << static_cast<const char16_t *>(deep.context)[0] + 0;
    utext_close(&deep);
    cout << ' ' << deep.flags << ' ' << int(deep.context == nullptr) << ' ' << int(deep.pFuncs == nullptr);
    utext_close(&shallow);
    cout << ' ' << shallow.flags << ' ' << int(shallow.context == source.context);
    utext_close(&source);
    UText *heap = utext_openUChars(nullptr, nullptr, 0, &status);
    cout << ' ' << heap->flags << ' ' << int(utext_close(heap) == nullptr) << ' ' << int(status) << '\n';
}
int main() {
    emitPackage();
    observeText();
    UErrorCode status = U_ZERO_ERROR;
    udata_setAppData("OpenOffice", OpenOffice_dat, &status);
    string name;
    int count, operations;
    while (cin >> name >> count >> operations) {
        vector<char16_t> text(count + 1);
        for (int i = 0, unit; i < count; ++i) { cin >> unit; text[i] = static_cast<char16_t>(unit); }
        status = U_ZERO_ERROR;
        auto memory = udata_open("OpenOffice", "brk", name.c_str(), &status);
        RuleBasedBreakIterator iterator(memory, status);
        UText source = UTEXT_INITIALIZER;
        utext_openUChars(&source, text.data(), count, &status);
        iterator.setText(&source, status);
        if (U_FAILURE(status)) return 2;
        cout << "B";
        for (int i = 0, arg; i < operations; ++i) {
            char op;
            cin >> op >> arg;
            int result = -1;
            switch (op) {
              case 'F': result = iterator.first(); break;
              case 'L': result = iterator.last(); break;
              case 'N': result = iterator.next(); break;
              case 'P': result = iterator.previous(); break;
              case 'A': result = iterator.following(arg); break;
              case 'B': result = iterator.preceding(arg); break;
              case 'I': result = iterator.isBoundary(arg); break;
              case 'C': result = iterator.next(arg); break;
            }
            cout << ' ' << result << ' ' << iterator.current() << ' ' << iterator.getRuleStatus();
        }
        cout << '\n';
        utext_close(&source);
    }
}
`;
writeFileSync(resolve(root, "witness.cpp"), cpp);
execFileSync(
  "clang++",
  [
    "-std=c++17",
    "-DU_STATIC_IMPLEMENTATION",
    `-I${icu}/common`,
    resolve(root, "witness.cpp"),
    tocObject,
    ...objects,
    resolve(build, "lib/libicuuc.a"),
    resolve(build, "stubdata/libicudata.a"),
    "-o",
    resolve(root, "witness"),
  ],
  { stdio: "inherit" },
);

const cases = [];
for (const rule of rules) {
  for (const text of [
    "",
    "one  two, three.",
    "a😀 b\0c",
    "École Привет العربية",
    "x y. ".repeat(160),
  ]) {
    const operations = [
      ["F", 0],
      ["N", 0],
      ["P", 0],
      ["C", 2],
      ["C", -1],
      ["L", 0],
    ];
    for (const index of [
      -3,
      0,
      1,
      2,
      3,
      5,
      127,
      230,
      text.length - 1,
      text.length,
      text.length + 1,
    ]) {
      operations.push(["I", index], ["A", index], ["B", index]);
    }
    cases.push({ rule, text, operations });
  }
}
let input = "";
for (const { rule, text, operations } of cases) {
  input += `${rule} ${text.length} ${operations.length}\n`;
  for (let i = 0; i < text.length; ++i) input += `${text.charCodeAt(i)} `;
  for (const [op, arg] of operations) input += `${op} ${arg} `;
  input += "\n";
}
const observations = execFileSync(resolve(root, "witness"), {
  input,
  encoding: "utf8",
  cwd: root,
  maxBuffer: 8 * 1024 * 1024,
});
const linked = { header: "", entries: [] };
let utext = [];
const boundaries = [];
for (const line of observations.trimEnd().split("\n")) {
  const fields = line.split(" ");
  const kind = fields.shift();
  if (kind === "H") linked.header = Buffer.from(fields[0], "hex").toString("base64");
  if (kind === "R")
    linked.entries.push([fields[0], Buffer.from(fields[1], "hex").toString("base64")]);
  if (kind === "T") utext = fields.map(Number);
  if (kind === "B") boundaries.push(fields.map(Number));
}
if (boundaries.length !== cases.length || linked.entries.length !== rules.length)
  throw new Error("Incomplete native witness");
/** Records the reference used for generation. @param path - Source or generated input. @returns SHA256. */
function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}
const asset = "apps/office/src/i18npool/source/breakiterator/data/OpenOffice_dat.json";
const fixture = "apps/office/src/external/icu/source/common/rbbi.owner.native-observations.json";
mkdirSync(resolve(asset, ".."), { recursive: true });
writeFileSync(asset, JSON.stringify(linked, null, 2) + "\n");
writeFileSync(
  fixture,
  JSON.stringify(
    {
      icuVersion: "78.3",
      sources: {
        "CustomTarget_breakiterator.mk": sha256(resolve(lo, "CustomTarget_breakiterator.mk")),
        "gencmn.c": sha256(resolve(icu, "tools/gencmn/gencmn.c")),
        "utext.cpp": sha256(resolve(icu, "common/utext.cpp")),
        "rbbi.cpp": sha256(resolve(icu, "common/rbbi.cpp")),
      },
      linkedSha256: sha256(asset),
      utext,
      cases,
      boundaries,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `Exported ${linked.entries.length} linked rule symbols and ${cases.length} native boundary sequences`,
);
