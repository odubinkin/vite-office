/** @fileoverview Captures unchanged md4c HTML search limits and borrowed source line subsets; no invalid native container, mark or reference state is constructed. */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
const mode = process.argv[2],
  fixture = process.argv[3] ?? "apps/office/src/external/md4c/src/native-scan-limits.json";
if (process.argv.length > 4 || !["--write", "--check"].includes(mode))
  throw new Error("Use --write or --check with an optional fixture path");
const archive = "vendor/md4c-reference/md4c-release-0.5.3.tar.gz",
  target = "test-results/native/B8TCAE-md4c-limits";
/** Hashes exact bytes. @param bytes - Source bytes. @returns SHA256. */
function hash(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
const archiveSha256 = hash(readFileSync(archive));
if (archiveSha256 !== "353c346f376b87c954a13f3415ede2d51264cc61dc5abcd38ff1d2aa0d059b9e")
  throw new Error("Changed pinned md4c archive");
const members = execFileSync("tar", ["-tf", archive], { encoding: "utf8" }).trim().split("\n"),
  sourceHashes = {};
for (const name of ["md4c.c", "md4c.h"]) {
  const paths = members.filter(
    /** Finds the exact original source member. @param path - Archive path. @returns Whether selected. */ (
      path,
    ) => path.endsWith(`/src/${name}`),
  );
  if (paths.length !== 1) throw new Error("Ambiguous original md4c source");
  const bytes = readFileSync(`vendor/md4c-reference/src/${name}`),
    original = execFileSync("tar", ["-xOf", archive, paths[0]]);
  if (!bytes.equals(original)) throw new Error(`Changed original ${name}`);
  sourceHashes[`src/${name}`] = hash(bytes);
}
mkdirSync(target, { recursive: true });
const texts = ["<a \n b>", "<a \n b/>"],
  lookupText = "abc\nxyz\nend";
const driver = String.raw`#include "../../../vendor/md4c-reference/src/md4c.c"
int main(void){
 const char* texts[]={"<a \n b>","<a \n b/>"};
 for(int kind=0;kind<2;kind++){
  MD_CTX ctx={0};ctx.text=texts[kind];ctx.size=strlen(ctx.text);MD_LINE lines[]={{0,3},{4,ctx.size}};
  for(OFF limit=3;limit<=ctx.size;limit++){OFF end=424242;int ok=md_is_html_tag(&ctx,lines,2,0,limit,&end);printf("H %d %u %d\n",kind,limit,ok?(int)end:-1);}
 }
 MD_LINE lines[]={{0,3},{4,7}};
 for(int view=0;view<2;view++)for(OFF off=0;off<=11;off++){MD_SIZE index=424242;const MD_LINE* line=md_lookup_line(off,lines+view,2-view,&index);if(line)printf("L %d %u %u %u %u\n",view,off,line->beg,line->end,index);else printf("L %d %u -1 -1 -1\n",view,off);}
 return 0;
}
`;
writeFileSync(`${target}/driver.c`, driver);
execFileSync("clang", ["-std=c99", "-O2", `${target}/driver.c`, "-o", `${target}/driver`], {
  stdio: "inherit",
});
const output = execFileSync(`${target}/driver`, [], { encoding: "utf8" }).trim().split("\n");
const cases = output.map(
  /** Associates native results with complete initialized caller input. @param row - Original output record. @returns Portable case. */ (
    row,
  ) => {
    const [operation, ...values] = row.split(" "),
      numbers = values.map(Number);
    if (operation === "H")
      return {
        operation: "html-tag",
        text: texts[numbers[0]],
        maxEnd: numbers[1],
        result: numbers[2],
      };
    if (operation === "L")
      return {
        operation: "line-lookup",
        text: lookupText,
        lines: [
          { beg: 0, end: 3 },
          { beg: 4, end: 7 },
        ].slice(numbers[0]),
        offset: numbers[1],
        result: numbers[2] < 0 ? null : numbers.slice(2),
      };
    throw new Error("Unexpected native output");
  },
);
const record = {
  md4cVersion: "0.5.3",
  archiveSha256,
  sourceHashes,
  witnessSha256: hash(driver),
  scope:
    "Unchanged original md_is_html_tag with its independent max_end bound and md_lookup_line over nonempty borrowed line subsets of a longer initialized source buffer. All offsets are inside the actual global buffer; no absent-reference dereference, zero-line native lookup, inconsistent containers or forged marks. Logical native success/end and actual selected line/index observations only; no full public parser/ABI/fault equivalence claim.",
  cases,
};
if (mode === "--write") writeFileSync(fixture, JSON.stringify(record) + "\n");
else if (JSON.stringify(JSON.parse(readFileSync(fixture, "utf8"))) !== JSON.stringify(record))
  throw new Error("Native scan-limit fixture changed");
process.stdout.write(
  `${cases.length} unchanged original bounded scanner/line observations ${mode}\n`,
);
