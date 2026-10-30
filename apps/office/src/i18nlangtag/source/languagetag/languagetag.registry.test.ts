/** @fileoverview Native registry realm,system-origin and cache-order contracts on real LanguageTag owners. */
import { expect, it, vi } from "vitest";
import { text, unicode } from "../isolang/isolang.tables";

it("retains resolved old SYSTEM values and resolves new values through the configured owner", /** Uses actual independent source module state,not a simulated conversion service. @returns Nothing. */ async () => {
  vi.resetModules();
  const { LanguageTag } = await import("../../inc/languagetag");
  LanguageTag.setConfiguredSystemLanguage(1031);
  const old = new LanguageTag(),
    explicit = new LanguageTag(1031),
    same = new LanguageTag();
  expect(old.isSystemLocale()).toBe(true);
  expect(old.getLanguageType(false)).toBe(0);
  expect(text(old.getBcp47(false))).toBe("");
  expect(text(old.getLocale(false).Language)).toBe("");
  expect(old.Equals(same)).toBe(true);
  expect(old.Equals(explicit)).toBe(false);
  expect(old.equals(explicit)).toBe(true);
  expect(text(old.getBcp47())).toBe("de-DE");
  expect(old.getLanguageType()).toBe(1031);
  LanguageTag.setConfiguredSystemLanguage(1041);
  expect(text(old.getBcp47())).toBe("de-DE");
  expect(text(new LanguageTag().getBcp47())).toBe("ja-JP");
  LanguageTag.setConfiguredSystemLanguage(0);
  LanguageTag.setConfiguredSystemLanguage(1023);
  expect(text(new LanguageTag().getBcp47())).toBe("ja-JP");
  expect(
    text(
      LanguageTag.convertToBcp47(
        new (await import("../../../udkapi/com/sun/star/lang/Locale")).Locale(),
      ),
    ),
  ).toBe("ja-JP");
  expect(
    LanguageTag.convertToLanguageType(
      new (await import("../../../udkapi/com/sun/star/lang/Locale")).Locale(),
    ),
  ).toBe(1041);
  expect(new LanguageTag("de-DE").LessThan(new LanguageTag("ja-JP"))).toBe(true);
  expect(new LanguageTag("de-DE").LessThan(new LanguageTag("DE-de"))).toBe(false);
});

it("keeps native case-insensitive registry keys and shared non-system origin", /** Source registry aliases do not overwrite the original front-end SYSTEM flag. @returns Nothing. */ async () => {
  vi.resetModules();
  const { LanguageTag, ScriptType } = await import("../../inc/languagetag");
  LanguageTag.setConfiguredSystemLanguage(1031);
  const explicit = new LanguageTag("de-DE"),
    system = new LanguageTag();
  explicit.setScriptType(ScriptType.WESTERN);
  expect(system.getScriptType()).toBe(ScriptType.WESTERN);
  expect(explicit.isSystemLocale()).toBe(false);
  expect(text(explicit.getBcp47(false))).toBe("de-DE");
  expect(explicit.getLanguageType(false)).toBe(1031);
  const upper = new LanguageTag("DE-de", true);
  expect(upper.getScriptType()).toBe(ScriptType.WESTERN);
  expect(upper.Equals(explicit)).toBe(true);
  expect(upper.isSystemLocale()).toBe(false);
});

it("preserves raw numeric aliases and native unknown singleton conversion", /** Checks raw identifier origin separately from real system resolution. @returns Nothing. */ async () => {
  vi.resetModules();
  const { LanguageTag } = await import("../../inc/languagetag");
  LanguageTag.setConfiguredSystemLanguage(1031);
  const alias = new LanguageTag(1024),
    normal = new LanguageTag(1031),
    unknown = new LanguageTag(1023);
  expect(alias.getLanguageType()).toBe(1024);
  expect(text(alias.getBcp47())).toBe("de-DE");
  expect(alias.Equals(normal)).toBe(false);
  expect(unknown.getLanguageType()).toBe(1023);
  expect(text(unknown.getBcp47())).toBe("en-US");
  expect(new LanguageTag(1023).getBcp47()).not.toBe(unknown.getBcp47());
  expect(text(new LanguageTag(1023).getBcp47())).toBe("en-US");
});

it("keeps instance known-tag validity independent of the one-way external parser switch", /** Native disabling leaves known fast paths valid and rejects static parsing. @returns Nothing. */ async () => {
  vi.resetModules();
  const { LanguageTag } = await import("../../inc/languagetag");
  expect(new LanguageTag("de-DE").isValidBcp47()).toBe(true);
  LanguageTag.disable_lt_tag_parse();
  expect(new LanguageTag("de-DE").isValidBcp47()).toBe(true);
  expect(new LanguageTag("en-x-task197").isValidBcp47()).toBe(false);
  const output = unicode("kept");
  expect(LanguageTag.isValidBcp47(unicode("de-DE"), output)).toBe(false);
  expect(text(output)).toBe("kept");
});

it("preserves finite native on-the-fly ID rollover and exhaustion through real valid tags", /** Covers the source 31primary by62sublanguage namespace and stable previously registered values. @returns Nothing. */ async () => {
  vi.resetModules();
  const { LanguageTag } = await import("../../inc/languagetag");
  const ids = new Set<number>();
  for (let i = 0; i < 1922; i++) {
    const tag = "qaa-x-task197-" + i.toString(36),
      value = new LanguageTag(tag),
      id = value.getLanguageType();
    expect(LanguageTag.isOnTheFlyID(id)).toBe(true);
    expect(ids.has(id)).toBe(false);
    ids.add(id);
    if (i === 0) expect(id).toBe(0x07e0);
    if (i === 30) expect(id).toBe(0x07fe);
    if (i === 31) expect(id).toBe(0x0be0);
    if (i === 1921) expect(id).toBe(0xfbfe);
    expect(text(new LanguageTag(id).getBcp47())).toBe(tag);
  }
  expect(new LanguageTag("qaa-x-task197-overflow").getLanguageType()).toBe(1023);
  expect(new LanguageTag("qaa-x-task197-again").getLanguageType()).toBe(1023);
  expect(new LanguageTag("qaa-x-task197-0").getLanguageType()).toBe(0x07e0);
});

it("replays native Norwegian suggested-primary collision QA", /** Shared primary IDs cannot alias distinct canonical BCP47 strings. @returns Nothing. */ async () => {
  vi.resetModules();
  const { LanguageTag } = await import("../../inc/languagetag");
  const no = new LanguageTag("no", true),
    nb = new LanguageTag("nb", true),
    nn = new LanguageTag("nn", true);
  expect(LanguageTag.isOnTheFlyID(no.getLanguageType())).toBe(true);
  expect(nb.getLanguageType()).not.toBe(no.getLanguageType());
  expect(nn.getLanguageType()).not.toBe(no.getLanguageType());
  expect(nn.getLanguageType()).not.toBe(nb.getLanguageType());
  for (const tag of [no, nb, nn])
    expect(text(new LanguageTag(tag.getLanguageType()).getBcp47())).toBe(text(tag.getBcp47()));
});

it("preserves native short numeric-region cache order before known-tag initialization", /** The source cacheSimpleLSCV stores country and discards numeric region;known-ID priming is intentionally not injected. @returns Nothing. */ async () => {
  vi.resetModules();
  const { LanguageTag } = await import("../../inc/languagetag");
  const first = new LanguageTag("es-419");
  expect(text(first.getBcp47())).toBe("es-419");
  expect([
    text(first.getLocale().Language),
    text(first.getLocale().Country),
    text(first.getLocale().Variant),
  ]).toEqual(["es", "", ""]);
  expect(first.getLanguageType()).toBe(10);
});
