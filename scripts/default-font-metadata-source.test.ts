/** @fileoverview Pins the exact native configured/matched GetDefaultFont metadata consumed by Calc document-pool construction. */
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
/** Reads a pinned original source. @param path - Native path. @returns Original text. */
function source(path: string): string {
  return readFileSync("vendor/libreoffice-reference/" + path, "utf8");
}
it("pins original role-family,pitch,symbol,12height and explicit thread encoding", /** Verifies actual VCL switch and selected-family path. @returns Nothing. */ () => {
  const native = source("vcl/source/outdev/font.cxx"),
    start = native.indexOf("vcl::Font OutputDevice::GetDefaultFont(");
  expect(start).toBeGreaterThan(0);
  const code = native.slice(start);
  expect(code).toContain("aFont.SetPitch( PITCH_VARIABLE )");
  expect(code).toMatch(
    /case DefaultFontType::LATIN_SPREADSHEET:[\s\S]*?aFont.SetFamily\( FAMILY_SWISS \)/,
  );
  expect(code).toMatch(
    /case DefaultFontType::LATIN_TEXT:[\s\S]*?aFont.SetFamily\( FAMILY_ROMAN \)/,
  );
  expect(code).toMatch(
    /case DefaultFontType::FIXED:[\s\S]*?aFont.SetPitch\( PITCH_FIXED \);\s*aFont.SetFamily\( FAMILY_MODERN \)/,
  );
  expect(code).toMatch(
    /case DefaultFontType::SYMBOL:\s*aFont.SetCharSet\( RTL_TEXTENCODING_SYMBOL \)/,
  );
  expect(code).toMatch(/case DefaultFontType::CTL_DISPLAY:\s*aFont.SetFamily\( FAMILY_SYSTEM \)/);
  expect(code).toContain("aFont.SetFontHeight( 12 )");
  expect(code).toContain("aFont.SetCharSet( osl_getThreadTextEncoding() )");
  expect(code).toContain("aFont.SetFamilyName( aName )");
});
it("pins actual ScDocumentPool metadata fields and the three spreadsheet roles", /** Verifies the genuine consumer contract without fabricating its unported constructor. @returns Nothing. */ () => {
  const native = source("sc/source/core/data/docpool.cxx");
  for (const role of ["LATIN_SPREADSHEET", "CJK_SPREADSHEET", "CTL_SPREADSHEET"])
    expect(native).toContain(`DefaultFontType::${role}`);
  expect(native).toContain(
    "aDefFont.GetFamilyTypeMaybeAskConfig(), aDefFont.GetFamilyName(), aDefFont.GetStyleName()",
  );
  expect(native).toContain("aDefFont.GetPitchMaybeAskConfig(), aDefFont.GetCharSet(), nItemId");
});
