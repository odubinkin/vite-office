/** @fileoverview Native wrappers catch UNO failures while preserving unexpected JavaScript exceptions. */
import { expect, it, vi } from "vitest";
import { Exception } from "../../../cppu/inc/com/sun/star/uno/Exception";
import { text, unicode } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { convertLanguageToLocale } from "../../../i18nlangtag/source/isolang/mslangid";
import * as classification from "../../../i18npool/source/characterclassification/cclass_unicode";
import { NativeNumberSupplierService } from "../../../i18npool/source/nativenumber/nativenumbersupplier";
import { Transliteration_caseignore } from "../../../i18npool/source/transliteration/transliteration_caseignore";
import { TransliterationFlags } from "../../../i18nutil/inc/transliteration";
import { CharClass, uppercase } from "./charclass";
import { NativeNumberWrapper } from "./nativenumberwrapper";
import { TransliterationWrapper } from "./transliterationwrapper";

it("keeps the original uppercase range and neutral character classifications on UNO failure", /** Injects a provider failure into real wrappers rather than substituting their algorithms. @returns Nothing. */ () => {
  const locale = convertLanguageToLocale(0x0409, false);
  const owner = new CharClass(locale);
  const input = unicode("AbçD");
  const failure = new Exception();
  const mapping = vi.spyOn(classification, "toUpper").mockImplementation(
    /** Reports a native service failure. @returns No mapped value. */ () => {
      throw failure;
    },
  );
  const types = vi.spyOn(classification, "getCharacterType").mockImplementation(
    /** Reports a native classifier failure. @returns No classification. */ () => {
      throw failure;
    },
  );
  try {
    const range = uppercase(input, locale, 1, 2);
    const whole = owner.uppercase(input);
    try {
      expect(text(range)).toBe("bç");
      expect(text(whole)).toBe("AbçD");
      expect(owner.getCharacterType(input, 2)).toBe(0);
      expect(owner.isDigit(input, 2)).toBe(false);
      expect(owner.isLetterNumeric(input, 2)).toBe(false);
    } finally {
      range.dispose();
      whole.dispose();
    }
    const unexpected = new Error("Unexpected native provider failure");
    mapping.mockImplementation(
      /** Reports an unexpected exception. @returns No value. */ () => {
        throw unexpected;
      },
    );
    types.mockImplementation(
      /** Reports an unexpected exception. @returns No value. */ () => {
        throw unexpected;
      },
    );
    expect(
      /** Invokes original uppercase forwarding. @returns No result. */ () =>
        owner.uppercase(input),
    ).toThrow(unexpected);
    expect(
      /** Invokes original classification forwarding. @returns No result. */ () =>
        owner.getCharacterType(input, 2),
    ).toThrow(unexpected);
    expect(
      /** Invokes original digit forwarding. @returns No result. */ () => owner.isDigit(input, 2),
    ).toThrow(unexpected);
    expect(
      /** Invokes original alphanumeric forwarding. @returns No result. */ () =>
        owner.isLetterNumeric(input, 2),
    ).toThrow(unexpected);
  } finally {
    mapping.mockRestore();
    types.mockRestore();
    input.dispose();
    owner.dispose();
    locale.dispose();
    failure.dispose();
  }
});

it("returns an independently owned empty native number string on UNO service failure", /** Checks the source catch policy and unchanged input ownership. @returns Nothing. */ () => {
  const locale = convertLanguageToLocale(0x0411, false);
  const input = unicode("１２３");
  const failure = new Exception();
  const provider = vi
    .spyOn(NativeNumberSupplierService.prototype, "getNativeNumberString")
    .mockImplementation(
      /** Reports a native service failure. @returns No supplier value. */ () => {
        throw failure;
      },
    );
  try {
    const wrapper = new NativeNumberWrapper();
    const result = wrapper.getNativeNumberString(input, locale, 0);
    expect(result.isEmpty()).toBe(true);
    result.dispose();
    expect(text(input)).toBe("１２３");
    const unexpected = new Error("Unexpected number supplier failure");
    provider.mockImplementation(
      /** Reports an unexpected exception. @returns No value. */ () => {
        throw unexpected;
      },
    );
    expect(
      /** Invokes native supplier forwarding. @returns No result. */ () =>
        wrapper.getNativeNumberString(input, locale, 0),
    ).toThrow(unexpected);
  } finally {
    provider.mockRestore();
    failure.dispose();
    input.dispose();
    locale.dispose();
  }
});

it("handles a native codepoint-iteration failure during whole-string digit classification", /** Checks the enclosing classifier catch separately from per-character provider failures. @returns Nothing. */ () => {
  const locale = convertLanguageToLocale(0x0409, false);
  const owner = new CharClass(locale);
  const input = unicode("123");
  const failure = new Exception();
  const iterator = vi.spyOn(input, "iterateCodePoints").mockImplementation(
    /** Reports a native iteration failure. @returns No codepoint. */ () => {
      throw failure;
    },
  );
  try {
    expect(owner.isNumeric(input)).toBe(false);
    const unexpected = new Error("Unexpected iteration failure");
    iterator.mockImplementation(
      /** Reports an unexpected iteration failure. @returns No result. */ () => {
        throw unexpected;
      },
    );
    expect(
      /** Runs the original whole-string classifier. @returns No classification. */ () =>
        owner.isNumeric(input),
    ).toThrow(unexpected);
  } finally {
    iterator.mockRestore();
    failure.dispose();
    input.dispose();
    owner.dispose();
    locale.dispose();
  }
});

it("clears first-call state after a failed native transliteration load and catches comparison UNO failures", /** Checks actual lazy wrapper state and its original exception boundary. @returns Nothing. */ () => {
  const owner = new TransliterationWrapper(TransliterationFlags.IGNORE_CASE);
  const input = unicode("A");
  const failure = new Exception();
  const loader = vi.spyOn(Transliteration_caseignore.prototype, "loadModule").mockImplementation(
    /** Reports a native module-load failure. @returns Nothing. */ () => {
      throw failure;
    },
  );
  const comparison = vi.spyOn(Transliteration_caseignore.prototype, "equals").mockImplementation(
    /** Reports a native comparison failure. @returns No comparison result. */ () => {
      throw failure;
    },
  );
  try {
    owner.loadModuleIfNeeded(0x0409);
    owner.loadModuleIfNeeded(0x0409);
    expect(loader).toHaveBeenCalledTimes(1);
    expect(owner.isEqual(input, input)).toBe(false);
    const unexpected = new Error("Unexpected transliteration failure");
    comparison.mockImplementation(
      /** Reports an unexpected comparison failure. @returns No result. */ () => {
        throw unexpected;
      },
    );
    expect(
      /** Invokes native comparison forwarding. @returns No result. */ () =>
        owner.isEqual(input, input),
    ).toThrow(unexpected);
    loader.mockImplementation(
      /** Reports an unexpected load failure. @returns Nothing. */ () => {
        throw unexpected;
      },
    );
    expect(
      /** Triggers a language-change reload. @returns Nothing. */ () =>
        owner.loadModuleIfNeeded(0x0407),
    ).toThrow(unexpected);
  } finally {
    loader.mockRestore();
    comparison.mockRestore();
    owner.dispose();
    input.dispose();
    failure.dispose();
  }
});
