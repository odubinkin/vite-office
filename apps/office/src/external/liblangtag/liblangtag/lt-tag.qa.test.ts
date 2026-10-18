/** @fileoverview Literal normal parse/canonical/extlang slices from original pinned liblangtag QA. */
import { expect, it } from "vitest";
import qa from "./fixtures/tag-normal-qa.json";
import contract from "../../../test/fixtures/language-tag-parser-contract.json";
import { lt_tag_new } from "./lt-tag";
import { lt_tag_parse } from "./lt-tag.parse";
import { lt_tag_canonicalize, lt_tag_canonicalize_in_extlang_form } from "./lt-tag.canonicalize";
import type { DiagnosticSlot } from "./lt-error";

for (const row of qa.parse)
  it(`replays native normal parse QA ${row.input}`, /** Runs the complete normal parser, not callback slices. @returns Nothing. */ () => {
    const tag = lt_tag_new(),
      error: DiagnosticSlot = { error: null };
    expect(lt_tag_parse(tag, row.input, error)).toBe(row.valid);
    expect(error.error === null).toBe(row.valid);
  });
for (const row of contract.cases)
  it(`implements the source parser contract previously disproved for Intl: ${row.reason}`, /** These independent source-derived vectors predate this implementation. @returns Nothing. */ () => {
    const tag = lt_tag_new();
    expect(lt_tag_parse(tag, row.input)).toBe(row.sourceExpected.valid);
    if (row.sourceExpected.valid)
      expect(lt_tag_canonicalize(tag)).toBe(row.sourceExpected.canonical);
  });
for (const kind of ["canonical", "extlang"] as const)
  for (const row of qa[kind])
    it(`replays native ${kind} QA ${row.input}`, /** Pins original literal canonical outputs without an executed native oracle. @returns Nothing. */ () => {
      const tag = lt_tag_new(),
        error: DiagnosticSlot = { error: null };
      expect(lt_tag_parse(tag, row.input, error)).toBe(true);
      expect(
        kind === "canonical"
          ? lt_tag_canonicalize(tag, error)
          : lt_tag_canonicalize_in_extlang_form(tag, error),
      ).toBe(row.output);
      expect(error.error).toBeNull();
    });
