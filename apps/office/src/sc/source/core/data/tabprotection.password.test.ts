/** @fileoverview Original Calc protection verifier encodings and imported XML hash compatibility. */
import { createHash } from "node:crypto";
import { expect, it } from "vitest";
import { ScPasswordHash as Hash } from "../../../inc/tabprotection";
import { ScTableProtection } from "./tabprotection";

it("uses the original UTF-16LE SHA-1 for new protected sheets and accepts historical UTF-8 SHA-1", /** Checks both encodings with an independent digest. @returns Completion. */ async () => {
  const protection = new ScTableProtection();
  const password = "café";
  await protection.setPassword(password);
  expect(protection.getStoredPasswordHash()?.bytes).toEqual(
    new Uint8Array(createHash("sha1").update(password, "utf16le").digest()),
  );
  expect(await protection.verifyPassword(password)).toBe(true);
  expect(await protection.verifyPassword("cafe")).toBe(false);

  protection.setStoredPasswordHash({
    bytes: new Uint8Array(createHash("sha1").update(password, "utf8").digest()),
    primary: Hash.SHA1,
    secondary: Hash.UNSPECIFIED,
  });
  expect(await protection.verifyPassword(password)).toBe(true);
  expect(await protection.verifyPassword("")).toBe(false);
});

it("verifies a legacy Excel sheet password and its ODF second digest", /** Exercises the native 16-bit rotation and ODF compatibility. @returns Completion. */ async () => {
  const protection = new ScTableProtection();
  protection.setXlPasswordHash(0xcf0f);
  expect(await protection.verifyPassword("aa")).toBe(true);
  expect(await protection.verifyPassword("ab")).toBe(false);
  protection.setStoredPasswordHash({
    bytes: new Uint8Array(createHash("sha1").update(Uint8Array.of(0xcf, 0x0f)).digest()),
    primary: Hash.XL,
    secondary: Hash.SHA1,
  });
  expect(await protection.verifyPassword("aa")).toBe(true);
  expect(await protection.verifyPassword("")).toBe(false);
});

it("verifies an imported OOXML SHA verifier with appended little-endian counters", /** Uses the original salt, UTF-16 encoding, and spin order. @returns Completion. */ async () => {
  const password = "café";
  const salt = Buffer.from([4, 5, 6]);
  const spinCount = 3;
  let hash = createHash("sha512").update(salt).update(password, "utf16le").digest();
  const counter = Buffer.alloc(4);
  for (let i = 0; i < spinCount; i++) {
    counter.writeUInt32LE(i);
    hash = createHash("sha512").update(hash).update(counter).digest();
  }
  const protection = new ScTableProtection();
  protection.setOoxPasswordHash({
    algorithmName: "SHA-512",
    hashValue: hash.toString("base64"),
    saltValue: salt.toString("base64"),
    spinCount,
  });
  expect(await protection.verifyPassword(password)).toBe(true);
  expect(await protection.verifyPassword("cafe")).toBe(false);
});
