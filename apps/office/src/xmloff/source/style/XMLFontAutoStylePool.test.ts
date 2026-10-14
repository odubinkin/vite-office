/** @fileoverview Native font auto-style value keys, name/return behavior, ordering and complete supported font metadata. */
import { expect, it } from "vitest";
import { XMLFontAutoStylePool } from "./XMLFontAutoStylePool";
import { FontFamily, FontPitch } from "../../../tools/inc/fontenum";
import {
  RTL_TEXTENCODING_DONTKNOW,
  RTL_TEXTENCODING_SYMBOL,
  RTL_TEXTENCODING_UNICODE,
} from "../../../sal/inc/rtl/textenc";
it("retains original first-insertion empty Add result, actual Find names and comparator declaration order", /** Uses the real five-field API; the new-entry return peculiarity is preserved rather than patched. @returns Nothing. */ () => {
  const pool = new XMLFontAutoStylePool();
  expect(pool.Add("Noto Sans;serif", "", 0, 0, 0)).toBe("");
  expect(pool.Add("Noto Sans;serif", "", 0, 0, 0)).toBe("Noto Sans");
  expect(pool.Add("Noto Sans;monospace", "", 0, 0, 0)).toBe("");
  expect(pool.Add("serif", "", 0, 0, 0)).toBe("");
  expect(pool.Add(";", "", 0, 0, 0)).toBe("");
  expect(pool.Find("Noto Sans;serif", "", 0, 0, 0)).toBe("Noto Sans");
  expect(pool.Find("missing", "", 0, 0, 0)).toBe("");
  expect(pool.exportXML()).toBe(
    '<office:font-face-decls><style:font-face style:name="F" svg:font-family=""/><style:font-face style:name="Noto Sans1" svg:font-family="&apos;Noto Sans&apos;, monospace"/><style:font-face style:name="Noto Sans" svg:font-family="&apos;Noto Sans&apos;, serif"/><style:font-face style:name="serif" svg:font-family="serif"/></office:font-face-decls>',
  );
});
it("keys actual style family pitch and symbol encoding while collapsing non-symbol encodings as upstream", /** Native comparator equivalence governs deduplication, not a family-only dictionary. @returns Nothing. */ () => {
  const pool = new XMLFontAutoStylePool();
  const variants = [
    ["Face", "B", FontFamily.FAMILY_ROMAN, FontPitch.PITCH_VARIABLE, RTL_TEXTENCODING_DONTKNOW],
    ["Face", "A", FontFamily.FAMILY_ROMAN, FontPitch.PITCH_VARIABLE, RTL_TEXTENCODING_DONTKNOW],
    ["Face", "A", FontFamily.FAMILY_SWISS, FontPitch.PITCH_VARIABLE, RTL_TEXTENCODING_DONTKNOW],
    ["Face", "A", FontFamily.FAMILY_SWISS, FontPitch.PITCH_FIXED, RTL_TEXTENCODING_DONTKNOW],
    ["Face", "A", FontFamily.FAMILY_SWISS, FontPitch.PITCH_FIXED, RTL_TEXTENCODING_SYMBOL],
  ] as const;
  for (const fields of variants)
    expect(pool.Add(fields[0], fields[1], fields[2], fields[3], fields[4])).toBe("");
  expect(pool.Find("Face", "B", 3, 2, RTL_TEXTENCODING_UNICODE)).toBe("Face");
  expect(pool.Add("Face", "B", 3, 2, RTL_TEXTENCODING_UNICODE)).toBe("Face");
  expect(pool.Find("Face", "A", 5, 1, RTL_TEXTENCODING_SYMBOL)).toBe("Face4");
  const xml = pool.exportXML();
  expect(xml).toContain('style:font-adornments="A"');
  expect(xml).toContain('style:font-family-generic="roman"');
  expect(xml).toContain('style:font-family-generic="swiss"');
  expect(xml).toContain('style:font-pitch="fixed"');
  expect(xml).toContain('style:font-pitch="variable"');
  expect(xml).toContain('style:font-charset="x-symbol"');
  expect(xml.indexOf('style:name="Face4"')).toBeLessThan(xml.indexOf('style:name="Face"'));
});
it("retains native semicolon naming and plain whitespace without CSS validation", /** Name fallback and collision loop use the same native prefix policy. @returns Nothing. */ () => {
  const pool = new XMLFontAutoStylePool();
  expect(pool.exportXML()).toBe("<office:font-face-decls></office:font-face-decls>");
  pool.Add("", "", 0, 0, 0);
  pool.Add(";a", "", 0, 0, 0);
  pool.Add(";b", "", 0, 0, 0);
  pool.Add(" X ", "", 0, 0, 0);
  pool.Add("  X ;serif", "", 0, 0, 0);
  pool.Add(" \t ;serif", "", 0, 0, 0);
  pool.Add("\u00a0X\u00a0;serif", "", 0, 0, 0);
  expect(pool.Find("", "", 0, 0, 0)).toBe("F");
  expect(pool.Find(";a", "", 0, 0, 0)).toBe("F1");
  expect(pool.Find(";b", "", 0, 0, 0)).toBe("F2");
  expect(pool.Find(" X ", "", 0, 0, 0)).toBe(" X ");
  expect(pool.Find("  X ;serif", "", 0, 0, 0)).toBe("X");
  expect(pool.Find(" \t ;serif", "", 0, 0, 0)).toBe("F3");
  expect(pool.Find("\u00a0X\u00a0;serif", "", 0, 0, 0)).toBe("\u00a0X\u00a0");
});
it("keeps shared browser package resources attached to actual font-family entries", /** Existing package hooks do not alter original native font key or first-insertion result. @returns Nothing. */ () => {
  const pool = new XMLFontAutoStylePool(),
    font = {
      faceName: "Face",
      familyName: "Face",
      path: "Fonts/font.ttf",
      format: "truetype",
      weight: "normal",
      style: "normal",
    } as const;
  pool.AddEmbedded(font);
  pool.AddEmbedded(font);
  const xml = pool.exportXML();
  expect(xml.match(/<svg:font-face-uri /gu)?.length).toBe(1);
  expect(xml).toContain('xlink:href="Fonts/font.ttf"');
});
