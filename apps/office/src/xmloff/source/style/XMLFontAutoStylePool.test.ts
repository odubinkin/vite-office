/** @fileoverview Verifies LibreOffice-shaped font-face pooling and serialization. */

import { describe, expect, it } from "vitest";
import { XMLFontAutoStylePool } from "./XMLFontAutoStylePool";

describe("XMLFontAutoStylePool", /** Groups font auto-style tests. @returns Nothing. */ () => {
  it("deduplicates exact families and resolves face-name collisions", /** Verifies pool identity and XML output. @returns Nothing. */ () => {
    const pool = new XMLFontAutoStylePool();
    expect(pool.Add("Noto Sans;serif")).toBe("Noto Sans");
    expect(pool.Add("Noto Sans;serif")).toBe("Noto Sans");
    expect(pool.Add("Noto Sans;monospace")).toBe("Noto Sans1");
    expect(pool.Add("serif")).toBe("serif");
    expect(pool.Add(";")).toBe("F");
    expect(pool.Find("Noto Sans;serif")).toBe("Noto Sans");
    expect(pool.Find("missing")).toBeUndefined();
    expect(pool.exportXML()).toBe(
      '<office:font-face-decls><style:font-face style:name="Noto Sans" svg:font-family="&apos;Noto Sans&apos;, serif"/><style:font-face style:name="Noto Sans1" svg:font-family="&apos;Noto Sans&apos;, monospace"/><style:font-face style:name="serif" svg:font-family="serif"/><style:font-face style:name="F" svg:font-family=""/></office:font-face-decls>',
    );
  });

  it("preserves the ODF generic family on a newly registered font face", /** Verifies generic font metadata output. @returns Nothing. */ () => {
    const pool = new XMLFontAutoStylePool();
    expect(pool.Add("Missing Roman", "roman")).toBe("Missing Roman");
    expect(pool.exportXML()).toContain('style:font-family-generic="roman"');
  });
});
