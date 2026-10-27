/** @fileoverview Source AskConfig precedence, one-shot state and existing copy-on-write font value behavior. */
import { expect, it } from "vitest";
import { Font } from "./font";
import {
  FontFamily as F,
  FontPitch as P,
  FontWeight as W,
  FontWidth as D,
} from "../../../tools/inc/fontenum";

it.each([
  ["Liberation Sans", F.FAMILY_SWISS, P.PITCH_DONTKNOW],
  ["Liberation Serif", F.FAMILY_ROMAN, P.PITCH_DONTKNOW],
  ["Courier New", F.FAMILY_MODERN, P.PITCH_FIXED],
  ["Microsoft Courier New", F.FAMILY_MODERN, P.PITCH_FIXED],
  ["Broadway", F.FAMILY_DECORATIVE, P.PITCH_DONTKNOW],
  ["Vendor Script", F.FAMILY_DONTKNOW, P.PITCH_DONTKNOW],
  ["OpenSymbol", F.FAMILY_DONTKNOW, P.PITCH_DONTKNOW],
  ["Vendor Serif Sans", F.FAMILY_ROMAN, P.PITCH_DONTKNOW],
  ["Vendor italic", F.FAMILY_SCRIPT, P.PITCH_DONTKNOW],
])(
  "resolves %s using original configuration then heuristic family precedence",
  (name, family, pitch) => {
    const font = new Font();
    font.SetFamilyName(name);
    const copy = new Font(font);
    expect(font.GetFamilyType()).toBe(F.FAMILY_DONTKNOW);
    expect(font.GetFamilyTypeMaybeAskConfig()).toBe(family);
    expect(font.GetPitchMaybeAskConfig()).toBe(pitch);
    expect(copy.GetFamilyType()).toBe(F.FAMILY_DONTKNOW);
    expect(copy.GetPitch()).toBe(P.PITCH_DONTKNOW);
  },
);
it("fills heuristic weight and width only when unknown, independently from configured field defaults", () => {
  const font = new Font();
  font.SetFamilyName("vendor semilight condensed 123");
  expect(font.GetWeightMaybeAskConfig()).toBe(W.WEIGHT_SEMILIGHT);
  expect(font.GetWidthTypeMaybeAskConfig()).toBe(D.WIDTH_CONDENSED);
  const configured = new Font();
  configured.SetFamilyName("Liberation Sans");
  expect(configured.GetWeightMaybeAskConfig()).toBe(W.WEIGHT_DONTKNOW);
  expect(configured.GetWidthType()).toBe(D.WIDTH_DONTKNOW);
  const specified = new Font();
  specified.SetFamilyName("vendor semilight condensed");
  specified.SetWeight(W.WEIGHT_BOLD);
  specified.SetWidthType(D.WIDTH_EXPANDED);
  specified.GetFamilyTypeMaybeAskConfig();
  expect(specified.GetWeight()).toBe(W.WEIGHT_BOLD);
  expect(specified.GetWidthType()).toBe(D.WIDTH_EXPANDED);
});
it("retains the source completed lookup flag after changing an unresolved family name", () => {
  const font = new Font();
  font.SetFamilyName("zzunregisteredzz");
  expect(font.GetFamilyTypeMaybeAskConfig()).toBe(F.FAMILY_DONTKNOW);
  const copied = new Font(font);
  copied.SetFamilyName("Courier New");
  expect(copied.GetPitchMaybeAskConfig()).toBe(P.PITCH_DONTKNOW);
  font.SetFamilyName("Courier New");
  expect(font.GetPitchMaybeAskConfig()).toBe(P.PITCH_DONTKNOW);
  expect(font.GetFamilyTypeMaybeAskConfig()).toBe(F.FAMILY_DONTKNOW);
  const fresh = new Font();
  fresh.SetFamilyName("Courier New");
  expect(fresh.GetPitchMaybeAskConfig()).toBe(P.PITCH_FIXED);
});
it("preserves explicit family/pitch and the source omission of width from equality", () => {
  const font = new Font();
  font.SetFamilyName("Courier New");
  font.SetFamily(F.FAMILY_DECORATIVE);
  font.SetPitch(P.PITCH_VARIABLE);
  expect(font.GetFamilyTypeMaybeAskConfig()).toBe(F.FAMILY_DECORATIVE);
  expect(font.GetPitchMaybeAskConfig()).toBe(P.PITCH_VARIABLE);
  const copy = new Font(font);
  copy.SetWidthType(D.WIDTH_ULTRA_EXPANDED);
  expect(font.GetWidthType()).toBe(D.WIDTH_DONTKNOW);
  expect(copy.GetWidthType()).toBe(D.WIDTH_ULTRA_EXPANDED);
  expect(copy.Equals(font)).toBe(true);
});
