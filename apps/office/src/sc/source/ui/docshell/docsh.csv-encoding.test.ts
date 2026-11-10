/** @fileoverview Original CSV encoding and absent-versus-empty options through ScDocShell. */
import { expect, it } from "vitest";
import { text } from "../../../../i18nlangtag/source/isolang/isolang.tables";
import {
  RTL_TEXTENCODING_BIG5,
  RTL_TEXTENCODING_GB_18030,
  RTL_TEXTENCODING_ISO_2022_CN,
} from "../../../../sal/inc/rtl/textenc";
import { createDocument } from "../../../../sfx2/source/doc/objsh";
import { ScAddress } from "../../../inc/address";
import { ScImportOptions } from "../dbgui/imoptdlg";
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

it.each([
  [
    RTL_TEXTENCODING_BIG5,
    "a96da6573b34320ac163c5e9a4a4a4e5aababd64a8d2b8eaaec6adabbdc6a8acb0f7c5fdb0bbb4fabeb9bfebc3d1b36fadd3bd73bd583b34330a",
    "姓名",
    "a96da6573b34320a",
  ],
  [
    RTL_TEXTENCODING_GB_18030,
    "d0d5c3fb3b34320ad6d0bbaac8cbc3f1b9b2bacdb9fac6d5cda8bbb0b5c4babad7d6b1e0c2ebbacdbcf2cce5d6d0cec4b5c4cafdbeddcae4c8ebb2e2cad43b34330a",
    "姓名",
    "d0d5c3fb3b34320a",
  ],
  [RTL_TEXTENCODING_ISO_2022_CN, "1b2429410e56500f3b34320a", "中", "1b2429410e56500f3b34320a"],
] as const)(
  "opens auto-detected SAL encoding %i and exports its native bytes",
  /** Uses a sample whose best match was observed in pinned native ICU. @param encoding - Detected native encoding. @param hex - CSV bytes. @param label - First cell text. @param firstRecord - Expected first exported line. @returns Completion. */ async (
    encoding,
    hex,
    label,
    firstRecord,
  ) => {
    const shell = new ScDocShell();
    const bytes = Buffer.from(hex, "hex");
    try {
      await shell.Open(bytes, state("Detected CSV"), {
        kind: "input",
        name: "legacy.csv",
        source: { kind: "external", reference: bytes },
        filterId: ScDocShell.CSV_FILTER_NAME,
        filterOptions: "DETECT,34,DETECT",
      });
      const doc = shell.GetDocument();
      expect(text(doc.GetSharedString(new ScAddress()).getString())).toBe(label);
      expect(doc.GetValue(new ScAddress(1, 0, 0))).toBe(42);

      const options = new ScImportOptions();
      options.nFieldSepCode = ";";
      options.SetTextEncoding(encoding);
      const saved = shell.AsciiSave(options);
      const expected = Buffer.from(firstRecord, "hex");
      expect([...saved.subarray(0, expected.length)]).toEqual([...expected]);
    } finally {
      shell.Close();
    }
  },
);
