/** @fileoverview Verifies the installed package retains the accepted official interpreter and all pinned language data. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import Soros from "@vite-office/libnumbertext";
import programs from "@vite-office/libnumbertext/data.json" with { type: "json" };

const root = new URL("../third_party/libnumbertext-js/", import.meta.url);

it("retains the byte-exact official JS body inside its ES module package wrapper", /** Detects algorithm edits or transpilation of the accepted dependency. @returns Nothing. */ () => {
  const original = readFileSync(new URL("Soros.js", root));
  expect(createHash("sha256").update(original).digest("hex")).toBe(
    "62f1c7f303651684a573cf4a7675059c50c84df0f04d11d092b14e47d3ff40a1",
  );
  expect(readFileSync(new URL("index.js", root), "utf8")).toBe(
    "// Packaging only: bind the upstream sloppy-mode temporaries inside the module.\nvar s1, l2;\n" +
      original.toString("utf8") +
      "\nexport default Soros;\n",
  );
  expect(new Soros(programs["en.sor"], "en").run("123")).toBe("one hundred twenty-three");
});

it("retains every source-selected program without edits and preserves notices", /** Checks complete packaging selection and all original program hashes. @returns Nothing. */ () => {
  const metadata = JSON.parse(readFileSync(new URL("source.json", root), "utf8")) as {
    dataSHA256: Record<string, string>;
    packagedPrograms: string[];
  };
  const selection = readFileSync(
    new URL(
      "../vendor/libreoffice-reference/external/libnumbertext/ExternalPackage_numbertext.mk",
      import.meta.url,
    ),
    "utf8",
  );
  const expected = Array.from(
    selection.matchAll(/data\/([A-Za-z_]+)\.sor/g),
    /** Reads the source packaging filename. @param match - Matched filename. @returns Name. */ (
      match,
    ) => match[1],
  );
  expect(metadata.packagedPrograms).toEqual(expected);
  expect(Object.keys(programs).sort()).toEqual(
    [
      ...new Set(
        expected.map(
          /** Adds source extension. @param name - Program name. @returns Filename. */ (name) =>
            name + ".sor",
        ),
      ),
    ].sort(),
  );
  for (const [name, program] of Object.entries(programs))
    expect(createHash("sha256").update(program).digest("hex"), name).toBe(
      metadata.dataSHA256[name],
    );
  expect(readFileSync(new URL("COPYING", root), "utf8")).toContain("Redistribution and use");
  expect(readFileSync(new URL("AUTHORS", root), "utf8")).toContain("Németh");
});
