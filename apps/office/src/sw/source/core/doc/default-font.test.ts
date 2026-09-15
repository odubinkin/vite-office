/** @fileoverview Verifies Writer script/language default-font selection. */

import { describe, expect, it } from "vitest";
import {
  getDefaultFont,
  getWriterDefaultFontLanguage,
  getWriterFontScript,
  type DefaultFontDevice,
} from "./default-font";
import { SwDoc } from "./doc";
import { RES_CHRATR_CJK_FONT } from "../../../inc/hintids";
import { SvxFontItem } from "../../../../editeng/source/items/textitem";

describe("Writer default-font policy", /** Registers default-font tests. @returns Nothing. */ () => {
  it("classifies representative Western, CJK, and CTL languages", /** Verifies language-to-script mapping. @returns Nothing. */ () => {
    expect(getWriterFontScript("en-US")).toBe("western");
    expect(getWriterFontScript("ja-JP")).toBe("cjk");
    expect(getWriterFontScript("ar-SA")).toBe("ctl");
    expect(getWriterDefaultFontLanguage("ja-JP", "cjk")).toBe("ja-JP");
    expect(getWriterDefaultFontLanguage("ja-JP", "western")).toBe("en-US");
    expect(getWriterDefaultFontLanguage("en-GB", "ctl")).toBe("ar-SA");
  });

  it("keeps document defaults stable when the device cannot resolve a font", /** Verifies unavailable-device fallback. @returns Nothing. */ () => {
    const unavailable: DefaultFontDevice = {
      /** Simulates an unavailable family. @returns No family. */ getDefaultFont: () => undefined,
    };
    expect(getDefaultFont(unavailable, "text", "en-US", "western")).toBe("Liberation Serif");
    expect(getDefaultFont(unavailable, "heading", "ja-JP", "cjk")).toBe("Noto Sans CJK");
    expect(getDefaultFont(unavailable, "text", "ar-SA", "ctl")).toBe("Noto Naskh Arabic");
    const blank: DefaultFontDevice = {
      /** Simulates a blank device result. @returns Blank family. */ getDefaultFont: () => "   ",
    };
    expect(getDefaultFont(blank, "fixed", "en-US", "western")).toBe("Liberation Mono");
  });

  it("accepts the single usable family selected by an output device", /** Verifies successful device resolution. @returns Nothing. */ () => {
    const device: DefaultFontDevice = {
      /** Supplies one usable family. @returns Selected family. */ getDefaultFont: () =>
        "Source Han Sans",
    };
    expect(getDefaultFont(device, "heading", "zh-CN", "cjk")).toBe("Source Han Sans");
    const document = new SwDoc({ defaultFontDevice: device, locale: "ja-JP" });
    expect(document.GetLocale()).toBe("ja-JP");
    expect(document.GetDefaultFontDevice()).toBe(device);
    expect(
      (
        document.GetAttrPool().GetUserOrPoolDefaultItem(RES_CHRATR_CJK_FONT) as SvxFontItem
      ).GetFamilyName(),
    ).toBe("Source Han Sans");
  });
});
