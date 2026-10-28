/** @fileoverview Original native-number metadata defaults, owned strings and real subformat copy lifetime. */
import { expect, it } from "vitest";
import { LANGUAGE_DONTKNOW, LANGUAGE_KOREAN } from "../../../i18nlangtag/inc/lang";
import { unicode, text } from "../../../i18nlangtag/source/isolang/isolang.tables";
import { ImpSvNumFor } from "./zformat";
import { SvNumberNatNum } from "./zformat.natnum";
it("distinguishes unset metadata, explicit zero and a known locale without resolving stored language", /** The source completeness test differs from language resolution during modifier mapping. @returns Nothing. */ () => {
  const modifier = new SvNumberNatNum();
  try {
    expect([
      modifier.IsSet(),
      modifier.IsComplete(),
      modifier.GetLang(),
      modifier.GetNatNum(),
      modifier.GetDBNum(),
      text(modifier.GetParams()),
    ]).toEqual([false, false, LANGUAGE_DONTKNOW, 0, 0, ""]);
    modifier.SetNum(0, false);
    expect([modifier.IsSet(), modifier.IsComplete()]).toEqual([true, false]);
    modifier.SetLang(0);
    expect([modifier.GetLang(), modifier.IsComplete()]).toEqual([0, true]);
    modifier.SetNum(259, true);
    modifier.SetLang(LANGUAGE_KOREAN);
    expect([modifier.GetDBNum(), modifier.GetNatNum()]).toEqual([3, 6]);
    modifier.SetDate(true);
    expect([modifier.GetDBNum(), modifier.GetNatNum()]).toEqual([3, 3]);
  } finally {
    modifier.dispose();
  }
});
it("copies actual subformat metadata and retains owned parameters after the source changes and is destroyed", /** Preserves the compiler-generated value assignment inside ImpSvNumFor::Copy. @returns Nothing. */ () => {
  const source = new ImpSvNumFor(),
    copy = new ImpSvNumFor(),
    parameter = unicode("ordinal-number");
  try {
    source.SetNatNumNum(3, true);
    source.SetNatNumLang(LANGUAGE_KOREAN);
    source.SetNatNumDate(true);
    source.SetNatNumParams(parameter);
    copy.Copy(source, null);
    expect(copy.GetNatNum()).not.toBe(source.GetNatNum());
    expect([
      copy.GetNatNum().GetNatNum(),
      copy.GetNatNum().GetDBNum(),
      copy.GetNatNum().GetLang(),
      copy.GetNatNum().IsComplete(),
      text(copy.GetNatNum().GetParams()),
    ]).toEqual([3, 3, LANGUAGE_KOREAN, true, "ordinal-number"]);
    source.SetNatNumDate(false);
    parameter.clear();
    source.SetNatNumParams(parameter);
    expect(source.GetNatNum().GetNatNum()).toBe(6);
    expect(text(copy.GetNatNum().GetParams())).toBe("ordinal-number");
  } finally {
    source.dispose();
    parameter.dispose();
  }
  try {
    expect(copy.GetNatNum().GetNatNum()).toBe(3);
    expect(text(copy.GetNatNum().GetParams())).toBe("ordinal-number");
  } finally {
    copy.dispose();
  }
});
