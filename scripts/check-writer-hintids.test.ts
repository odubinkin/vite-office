/** @fileoverview Checks actual pinned Writer identity expressions and rejects drift rather than certifying duplicated tables. */
import { readFile } from "node:fs/promises";
import { expect, it } from "vitest";
import { checkWriterHintIds } from "./check-writer-hintids";
import { createUpstreamInvariantManifest } from "./libreoffice-inventory/upstream-invariants";

it("matches every consumed identity against the current pinned header", /** Includes native range boundaries rather than only selected hand-written IDs. @returns Completion. */ async () => {
  const header = await readFile("vendor/libreoffice-reference/sw/inc/hintids.hxx", "utf8"),
    local = await readFile("apps/office/src/sw/inc/hintids.ts", "utf8");
  expect(checkWriterHintIds(header, local)).toBe(76);
  expect(
    /** The former grid identity is wrong for this pinned baseline. @returns Never. */ () =>
      checkWriterHintIds(header, local.replace("RES_TEXTGRID = 125", "RES_TEXTGRID = 122")),
  ).toThrow("local 122, pinned native 125");
});

it("rejects unresolved, cyclic, unsupported or absent identity evidence", /** An empty or partially evaluated source must never count as evidence. @returns Nothing. */ () => {
  const local = "export const RES_A = 1 as const;";
  for (const header of [
    "",
    "inline constexpr sal_uInt16 RES_A(RES_A + 1);",
    "inline constexpr sal_uInt16 RES_A(1 << 2);",
  ])
    expect(
      /** Rejects this invalid source expression. @returns Never. */ () =>
        checkWriterHintIds(header, local),
    ).toThrow();
  expect(
    /** Rejects an empty declaration set. @returns Never. */ () => checkWriterHintIds("", ""),
  ).toThrow("No consumed");
});

it("evaluates committed invariant values against native expressions, independently of marker presence", /** Equal metadata values alone are insufficient evidence of native identities. @returns Completion. */ async () => {
  const header = await readFile("vendor/libreoffice-reference/sw/inc/hintids.hxx", "utf8");
  const entries = createUpstreamInvariantManifest().entries.filter(
    /** Includes every declared Writer WhichId invariant. @param entry - Catalog entry. @returns Admission. */ (
      entry,
    ) => entry.id.startsWith("writer.which-id."),
  );
  const records = await Promise.all(
    entries.map(
      /** Reads the actual committed registry payload, not a reconstructed duplicate table. @param entry - Catalog entry. @returns Parsed record. */ async (
        entry,
      ) =>
        JSON.parse(
          await readFile(`docs/program/registry/writer/invariants/${entry.id}.json`, "utf8"),
        ).record as typeof entry,
    ),
  );
  for (const side of ["local", "upstream"] as const) {
    const declarations = records
      .map(
        /** Tests the numeric metadata independently of its text marker. @param record - Committed invariant. @returns Declaration. */ (
          record,
        ) =>
          `export const ${record.id.replace("writer.which-id.", "")} = ${record[side].value} as const;`,
      )
      .join("\n");
    expect(checkWriterHintIds(header, declarations)).toBe(entries.length);
  }
});
