---
id: "202609302319-9KTM99"
title: "Restore native numbering marker ownership and ListFormat semantics"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "numbering"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T23:19:48.526Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Restore native marker ownership and ListFormat under the continuing parity goal."
events:
  -
    type: "status"
    at: "2026-09-30T23:19:57.183Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native marker ownership and ListFormat under the continuing parity goal."
doc_version: 3
doc_updated_at: "2026-09-30T23:29:19.376Z"
doc_updated_by: "CODER"
description: "Move implemented numbering marker state to SvxNumberFormat, reproduce pinned ListFormat setters and Writer decimal pattern substitution/defaults, and preserve state through clone and Worker transfer."
sections:
  Summary: "Restore native shared numbering marker state and ListFormat behavior for the existing Arabic/bullet subset."
  Scope: "editeng/source/items/numitem.ts/tests, sw/source/core/doc/number.ts/tests, bounded UNO suffix application adjustment, Worker writer-document-codec.ts and affected transfer tests/current schema, existing caller fixtures requiring an explicit decimal suffix, runtime inventory/provenance and task-local primary-source differential evidence. No XML marker import/export expansion in this leaf, native numbering family expansion, policy/gate weakening, network/outside access or registered save/open/recovery changes."
  Plan: "Move prefix/suffix/start/include-upper state to native SvxNumberFormat alongside position state. Implement both SetListFormat contracts, prefix/suffix invalidation and derived compatibility fields, including native unsigned widths and literal unusual pattern behavior. Correct standalone format defaults to native empty suffix and initialize Writer base rules with their level-specific native ListFormat. Replace decimal join shortcut with pinned pattern scanning and native legacy fallback within the currently implemented Arabic/character-special subset. Preserve raw state, including a changed include-upper count independent of ListFormat, in clone and the current Worker graph schema. Keep visible bullet glyph projection separately bounded. Verify using unmodified extracted native setter bodies and bounded Writer formatter probes, focused core/UNO/transfer tests and full unchanged verification."
  Verify Steps: "Compare primary-source SetPrefix/SetSuffix and both SetListFormat bodies for absent/empty/literal formats, percent-delimited patterns, noncontiguous/repeated/%10%/future references, unusual percent affixes and generated clamped levels. Assert native empty standalone suffix, level-specific Writer base patterns, setters invalidation, raw independent field copy, representable start/include ranges, zero counters and mixed Arabic/character-special ancestor handling in decimal format/fallback. Verify document-owned node visible labels, clone isolation and current Worker encode/decode/rejection of malformed list formats without introducing saved-document compatibility. Run npm run verify unchanged (both 100% coverage suites, browser/resources/ODT/type/source/provenance gates), ap doctor, routing and git diff --check. Retain broader module unverified status and record real code commit."
  Verification: "Pending implementation and final mandatory gates."
  Rollback Plan: "Revert the scoped code commit after checking subsequent numbering changes; retain task evidence."
  Findings: |-
    Iteration25 completed; clean main/direct and parent 202609240501-C9TN6M remains active. Persistent user goal authorizes this safe local leaf. Pinned libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65: editeng numitem.cxx owns scalar marker fields and SetListFormat derivation/invalidation; SwNumFormat default constructor only delegates to SvxNumberFormat(ARABIC), with empty suffix. SwNumRule modern base constructors assign %level%. patterns. Local SwNumFormat instead owns readonly marker fields, defaults numeric suffix to a dot and lacks pattern state, while MakeNumString joins counters without native per-level type substitution. Native format parser can derive compatibility fields imperfectly; reproduce observed bodies rather than normalizing. XML marker properties, extended ListFormat import/export, fonts, continuous/outline/NONE/bitmap numbering, hidden-nonnumerical and include-strings formatter variants remain later audit obligations.

    - Observation: Initial focus command referenced a nonexistent Vitest config and exited before executing tests; several read-only guesses for test/probe paths were absent.
      Impact: No semantic test evidence was produced and no runtime regression is inferred.
      Resolution: Discover actual repository config and task probe filenames before rerunning; keep verification scope unchanged.

    - Observation: Compiled 161 native states/labels and 56 clone labels match. Focus passes 27 assertions but two new fixtures fail: percent scanning of %0% derives prefix %0, and the existing node API is GetListLabel.
      Impact: The test expectation and guessed method need correction; extracted source differential confirms current implementation for the unusual percent case.
      Resolution: Use the source-observed compatibility prefix and existing node method; rerun focus and full gates unchanged.

    - Observation: An evidence metadata script assumed the wrong top-level JSON collection key and failed before writing either file.
      Impact: Runtime metadata remains unchanged; source and differential checks still pass.
      Resolution: Inspect actual JSON keys and apply bounded evidence entries without changing status or validators.
id_source: "generated"
---
## Summary

Restore native shared numbering marker state and ListFormat behavior for the existing Arabic/bullet subset.

## Scope

editeng/source/items/numitem.ts/tests, sw/source/core/doc/number.ts/tests, bounded UNO suffix application adjustment, Worker writer-document-codec.ts and affected transfer tests/current schema, existing caller fixtures requiring an explicit decimal suffix, runtime inventory/provenance and task-local primary-source differential evidence. No XML marker import/export expansion in this leaf, native numbering family expansion, policy/gate weakening, network/outside access or registered save/open/recovery changes.

## Plan

Move prefix/suffix/start/include-upper state to native SvxNumberFormat alongside position state. Implement both SetListFormat contracts, prefix/suffix invalidation and derived compatibility fields, including native unsigned widths and literal unusual pattern behavior. Correct standalone format defaults to native empty suffix and initialize Writer base rules with their level-specific native ListFormat. Replace decimal join shortcut with pinned pattern scanning and native legacy fallback within the currently implemented Arabic/character-special subset. Preserve raw state, including a changed include-upper count independent of ListFormat, in clone and the current Worker graph schema. Keep visible bullet glyph projection separately bounded. Verify using unmodified extracted native setter bodies and bounded Writer formatter probes, focused core/UNO/transfer tests and full unchanged verification.

## Verify Steps

Compare primary-source SetPrefix/SetSuffix and both SetListFormat bodies for absent/empty/literal formats, percent-delimited patterns, noncontiguous/repeated/%10%/future references, unusual percent affixes and generated clamped levels. Assert native empty standalone suffix, level-specific Writer base patterns, setters invalidation, raw independent field copy, representable start/include ranges, zero counters and mixed Arabic/character-special ancestor handling in decimal format/fallback. Verify document-owned node visible labels, clone isolation and current Worker encode/decode/rejection of malformed list formats without introducing saved-document compatibility. Run npm run verify unchanged (both 100% coverage suites, browser/resources/ODT/type/source/provenance gates), ap doctor, routing and git diff --check. Retain broader module unverified status and record real code commit.

## Verification

Pending implementation and final mandatory gates.

## Rollback Plan

Revert the scoped code commit after checking subsequent numbering changes; retain task evidence.

## Findings

Iteration25 completed; clean main/direct and parent 202609240501-C9TN6M remains active. Persistent user goal authorizes this safe local leaf. Pinned libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65: editeng numitem.cxx owns scalar marker fields and SetListFormat derivation/invalidation; SwNumFormat default constructor only delegates to SvxNumberFormat(ARABIC), with empty suffix. SwNumRule modern base constructors assign %level%. patterns. Local SwNumFormat instead owns readonly marker fields, defaults numeric suffix to a dot and lacks pattern state, while MakeNumString joins counters without native per-level type substitution. Native format parser can derive compatibility fields imperfectly; reproduce observed bodies rather than normalizing. XML marker properties, extended ListFormat import/export, fonts, continuous/outline/NONE/bitmap numbering, hidden-nonnumerical and include-strings formatter variants remain later audit obligations.

- Observation: Initial focus command referenced a nonexistent Vitest config and exited before executing tests; several read-only guesses for test/probe paths were absent.
  Impact: No semantic test evidence was produced and no runtime regression is inferred.
  Resolution: Discover actual repository config and task probe filenames before rerunning; keep verification scope unchanged.

- Observation: Compiled 161 native states/labels and 56 clone labels match. Focus passes 27 assertions but two new fixtures fail: percent scanning of %0% derives prefix %0, and the existing node API is GetListLabel.
  Impact: The test expectation and guessed method need correction; extracted source differential confirms current implementation for the unusual percent case.
  Resolution: Use the source-observed compatibility prefix and existing node method; rerun focus and full gates unchanged.

- Observation: An evidence metadata script assumed the wrong top-level JSON collection key and failed before writing either file.
  Impact: Runtime metadata remains unchanged; source and differential checks still pass.
  Resolution: Inspect actual JSON keys and apply bounded evidence entries without changing status or validators.
