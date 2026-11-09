/** @fileoverview Portable replay of the original ICU NFKC owner and its cleanup contract. */
import { expect, it } from "vitest";
import native from "./normalizer2.native-observations.json" with { type: "json" };
import { ucln_lib_cleanup } from "./ucln_cmn.h";
import { getNFKCInstance, type Normalizer2 } from "./unicode/normalizer2";
import { UErrorCode as E } from "./unicode/utypes";
import { UnicodeString } from "./unistr";

/** Gets the actual loaded singleton or fails the replay. @returns Loaded normalizer. */
function normalizer(): Normalizer2 {
  const status: [number] = [0];
  const value = getNFKCInstance(status);
  if (value === null || status[0] !== 0) throw new Error("Missing NFKC data");
  return value;
}

/** Original witness digest over scalars and flags. @param hash - Previous digest. @param word - Next value. @returns Unsigned digest. */
function mix(hash: number, word: number): number {
  return Math.imul(hash ^ word, 16777619) >>> 0;
}

it("matches original scalar normalization and boundary-before digests", /** Replays the entire code-point domain over the loaded native tables. @returns Nothing. */ () => {
  const nfkc = normalizer();
  const dest = new UnicodeString();
  const status: [number] = [0];
  for (const [block, expected] of native.scalarDigests.entries()) {
    const base = block * 0x1000;
    let hash = 2166136261;
    for (let c = base; c < base + 0x1000; ++c) {
      const input = String.fromCodePoint(c);
      const src = new UnicodeString(input, input.length);
      hash = mix(hash, Number(nfkc.hasBoundaryBefore(c)));
      hash = mix(hash, Number(nfkc.isNormalized(src, status)));
      nfkc.normalize(src, dest, status);
      hash = mix(hash, dest.length());
      for (let i = 0; i < dest.length(); ++i) hash = mix(hash, dest.charAt(i));
    }
    expect(hash, `block ${base.toString(16)}`).toBe(expected);
  }
  expect(status[0]).toBe(0);
}, 20000);

it("retains original counted composition, alias rejection and cleanup", /** Replays native interaction samples and the production singleton lifetime. @returns Nothing. */ () => {
  const nfkc = normalizer();
  const dest = new UnicodeString();
  for (const c of native.samples) {
    const src = new UnicodeString(String.fromCharCode(...c.units), c.units.length);
    const status: [number] = [0];
    const normalized = nfkc.isNormalized(src, status);
    expect(nfkc.normalize(src, dest, status)).toBe(dest);
    const actual = [Number(normalized), dest.length()];
    for (let i = 0; i < dest.length(); ++i) actual.push(dest.charAt(i));
    expect(actual, JSON.stringify(c.units)).toEqual(c.expected);
    expect(status[0]).toBe(0);
  }
  const alias = new UnicodeString("Ａ");
  const aliasStatus: [number] = [0];
  expect(nfkc.normalize(alias, alias, aliasStatus)).toBe(alias);
  expect(alias.isBogus()).toBe(true);
  expect(aliasStatus[0]).toBe(E.U_ILLEGAL_ARGUMENT_ERROR);
  expect(nfkc.isNormalized(alias, [E.U_ILLEGAL_ARGUMENT_ERROR])).toBe(false);
  expect(getNFKCInstance([E.U_INVALID_FORMAT_ERROR])).toBeNull();
  ucln_lib_cleanup();
  const reopened = normalizer();
  expect(reopened).not.toBe(nfkc);
  reopened.normalize(new UnicodeString("ｶﾞ"), dest, [0]);
  expect(dest.getBuffer()).toBe("ガ");
});
