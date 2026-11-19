/** @fileoverview Native theme survives the Writer Worker graph transfer and legacy records. */
import { expect, it } from "vitest";
import { Color, ColorTransparency } from "../../../../tools/inc/color";
import { ColorSet } from "../../../../docmodel/inc/theme/ColorSet";
import { Theme, FontScheme } from "../../../../docmodel/inc/theme/Theme";
import { ThemeColorType } from "../../../../docmodel/inc/theme/ThemeColorType";
import { SwDoc } from "../../../source/core/doc/doc";
import { encodeWriterDocument, decodeWriterDocument } from "./writer-document-codec";

it("preserves palette presence and original font scheme values in a Worker record", /** Copies actual model objects through the existing graph boundary. @returns Nothing. */ () => {
  const original = new SwDoc();
  let restored: SwDoc | undefined;
  let legacy: SwDoc | undefined;
  try {
    const theme = new Theme("Theme");
    const colors = new ColorSet("Palette");
    theme.colorSet = colors;
    theme.fontScheme = new FontScheme("Fonts");
    theme.fontScheme.majorFont.set("latin", {
      typeface: "Native Major",
      pitchFamily: 16,
      panose: "0123456789",
      charset: 1,
    });
    theme.fontScheme.minorFont.set("ea", {
      typeface: "Native Minor",
      pitchFamily: 0,
      panose: "",
      charset: 128,
    });
    theme.fontScheme.majorSupplemental.push({ script: "Hang", typeface: "Major supplemental" });
    theme.fontScheme.minorSupplemental.push({ script: "Jpan", typeface: "Minor supplemental" });
    colors.add(
      ThemeColorType.Accent1,
      new Color(ColorTransparency, 0x42010203, "ColorTransparencyTag"),
    );
    colors.add(ThemeColorType.Accent2, new Color(0));
    original.theme = theme;

    const record = structuredClone(encodeWriterDocument(original));
    colors.add(ThemeColorType.Accent1, new Color(0xff0000));
    restored = decodeWriterDocument(record);
    expect(encodeWriterDocument(restored).theme).toEqual(record.theme);
    expect(restored.theme?.colorSet?.findColor(ThemeColorType.Accent1)?.toUInt32()).toBe(
      0x42010203,
    );
    expect(restored.theme?.colorSet?.findColor(ThemeColorType.Accent2)?.toUInt32()).toBe(0);
    expect(restored.theme?.colorSet?.findColor(ThemeColorType.Accent3)).toBeUndefined();
    const { theme: storedTheme, ...old } = record;
    expect(storedTheme?.fontScheme.minorSupplemental[0]?.typeface).toBe("Minor supplemental");
    legacy = decodeWriterDocument(old);
    expect(legacy.theme).toBeUndefined();
    original.theme = new Theme("Font scheme only");
    const fontOnly = decodeWriterDocument(structuredClone(encodeWriterDocument(original)));
    try {
      expect(fontOnly.theme?.colorSet).toBeUndefined();
      expect(fontOnly.theme?.fontScheme.majorFont.get("latin")?.typeface).toBe("Arial");
    } finally {
      fontOnly.Dispose();
    }
  } finally {
    legacy?.Dispose();
    restored?.Dispose();
    original.Dispose();
  }
});

it("rejects malformed theme values in the isolated Writer graph", /** Exercises the actual Worker decoder without adopting an invalid graph. @returns Nothing. */ () => {
  const doc = new SwDoc();
  try {
    const valid = encodeWriterDocument(doc);
    const baseFonts = {
      name: "F",
      major: [],
      minor: [],
      majorSupplemental: [],
      minorSupplemental: [],
    };
    for (const theme of [
      null,
      { name: 0 },
      { name: "T", fontScheme: {} },
      { name: "T", fontScheme: { ...baseFonts, major: 0 } },
      { name: "T", fontScheme: { ...baseFonts, major: [["unknown", {}]] } },
      { name: "T", fontScheme: { ...baseFonts, major: [["latin", { typeface: false }]] } },
      {
        name: "T",
        fontScheme: { ...baseFonts, major: [["ea", { typeface: "A", panose: false }]] },
      },
      {
        name: "T",
        fontScheme: {
          ...baseFonts,
          major: [["cs", { typeface: "A", panose: "", pitchFamily: 1.5 }]],
        },
      },
      {
        name: "T",
        fontScheme: {
          ...baseFonts,
          major: [["latin", { typeface: "A", panose: "", pitchFamily: 0, charset: null }]],
        },
      },
      { name: "T", fontScheme: { ...baseFonts, majorSupplemental: 0 } },
      { name: "T", fontScheme: { ...baseFonts, majorSupplemental: [{ script: 0 }] } },
      {
        name: "T",
        fontScheme: { ...baseFonts, majorSupplemental: [{ script: "Jpan", typeface: false }] },
      },
      { name: "T", fontScheme: baseFonts, colors: { name: 0 } },
      { name: "T", fontScheme: baseFonts, colors: { name: "C" } },
      ...[
        [-1, 0],
        [13, 0],
        [1.5, 0],
        [1, 1.5],
        [1, -1],
        [1, 0x100000000],
      ].map(
        /** Wraps one invalid color entry. @param entry - Malformed slot or RGB. @returns Theme record. */
        (entry) => ({ name: "T", fontScheme: baseFonts, colors: { name: "C", entries: [entry] } }),
      ),
    ]) {
      expect(
        /** Decodes a corrupted theme on a fresh model. @returns Writer graph. */ () =>
          decodeWriterDocument({ ...valid, theme }),
      ).toThrow(/theme|font/i);
    }
  } finally {
    doc.Dispose();
  }
});
