/** @fileoverview Original CSV encoding and absent-versus-empty options through ScDocShell. */
import { expect, it } from "vitest";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ScAddress } from "../../../inc/address";
import { ScDocShell } from "./docsh";

/** Creates the browser identity around an actual source filter request. @param title - Imported name. @returns New document identity. */
function state(title: string): ReturnType<typeof createDocument> {
  return createDocument({ id: crypto.randomUUID(), suiteId: "calc", title });
}

it("opens a BOM-less Windows-1251 CSV with the source DETECT option", /** Uses ICU encoding detection and the separator scan before opening the real document. @returns Completion. */ async () => {
  const shell = new ScDocShell();
  const bytes = Buffer.from(
    "c8ecff3bd1f3ecece00ac0ebe5eaf1e5e93b34320ac220ede0f7e0ebe520e1fbebe020f1f2f0eeeae020e820f1ebe5e4f3fef9e0ff20f1f2f0eeeae020f1eef1f2eeffebe020e8e720eee1fbf7edfbf520f0f3f1f1eae8f520f1ebeee23b34330a",
    "hex",
  );
  try {
    await shell.Open(bytes, state("Detected CSV"), {
      kind: "input",
      name: "legacy.csv",
      source: { kind: "external", reference: bytes },
      filterId: ScDocShell.CSV_FILTER_NAME,
      filterOptions: "DETECT,34,DETECT",
    });
    const doc = shell.GetDocument();
    expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe("Имя");
    expect(text(doc.GetSharedString(new ScAddress(0, 1, 0)).getString())).toBe("Алексей");
    expect(doc.GetValue(new ScAddress(1, 1, 0))).toBe(42);
    expect(doc.GetValue(new ScAddress(1, 2, 0))).toBe(43);
  } finally {
    shell.Close();
  }
});

it("distinguishes omitted import options from a present empty filter item", /** Checks original API defaults and the option owner's own separator default. @returns Completion. */ async () => {
  const shell = new ScDocShell();
  const bytes = new TextEncoder().encode("A;42\n");
  const medium = {
    kind: "input",
    name: "input.csv",
    filterId: ScDocShell.CSV_FILTER_NAME,
    source: { kind: "external", reference: bytes },
  } as const;
  try {
    await shell.Open(bytes, state("No filter item"), medium);
    expect(text(shell.GetDocument().GetSharedString(new ScAddress()).getString())).toBe("A;42");
    await shell.Open(bytes, state("Empty filter item"), { ...medium, filterOptions: "" });
    expect(text(shell.GetDocument().GetSharedString(new ScAddress()).getString())).toBe("A");
    expect(shell.GetDocument().GetValue(new ScAddress(1, 0, 0))).toBe(42);
  } finally {
    shell.Close();
  }
});
