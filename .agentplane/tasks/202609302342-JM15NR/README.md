---
id: "202609302342-JM15NR"
title: "Restore native ODF numbering marker parameter transport"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
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
  updated_at: "2026-09-30T23:43:02.406Z"
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
    body: "Start: Restore native ODF marker parameter transport and source-owned per-level export under the continuing parity goal."
events:
  -
    type: "status"
    at: "2026-09-30T23:43:02.865Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native ODF marker parameter transport and source-owned per-level export under the continuing parity goal."
doc_version: 3
doc_updated_at: "2026-10-01T00:04:53.571Z"
doc_updated_by: "CODER"
description: "Preserve native prefix/suffix/start/display and ListFormat properties through XML declaration, Writer UNO application and ODF 1.3 export; refactor rule export into source-owned per-level property records."
sections:
  Summary: "Restore native marker parameter transport for the existing ODF Arabic and bullet numbering pipeline."
  Scope: "xmloff core token/ordered attribute adapter, style/xmlnumi and xmlnume, text import/export records and affected text export tests; Writer UNO property application and XML import/export bridge; focused genuine ODT fixtures, bounded primary-source probes, inventory/provenance and task evidence. Refactor parallel export arrays into per-level property records and relocate marker serialization to xmlnume. Retain ODF 1.3 export version/settings, Worker graph v16, existing unsupported number families and registered save/open/recovery deviations. No network/outside access, policy/gate/threshold changes or whole-module parity promotion."
  Plan: "Add source-owned numeric declaration parsing using native byte-string integer grammar and clamp rules, raw prefix/suffix for both families, and optional style/loext ListFormat with native last-attribute precedence. Generate absent ListFormat at GetProperties with display-level clamping, transport it last through Writer UNO application after prefix/suffix/start/parent properties and native validation/copy/Set. Export prefix/suffix for both families, numeric start and clamped parent count with native omission predicates and signed UNO start narrowing under existing standard ODF 1.3, retaining native lossy fallback of explicit nonstandard patterns. Replace parallel export marker/layout arrays with per-level neutral properties and source-own serialization in xmlnume. Update bounded alias/export conflict checks to account for transported fields. Verify parsed/native state, actual node labels, clones/Worker transfer and export/reopen with literal source-derived fixtures, then full unchanged mandatory gates and lifecycle."
  Verify Steps: "Verify absent/empty/raw affixes, XML escaping, byte-prefix/invalid/negative/overflow start/display values, numeric SHRT bounds, bullet ignoring start/display, native generated pattern clamp and SetListFormat compatibility overwrite. Test standard and loext raw pattern aliases including both attribute orders and empty patterns. Check ordered UNO application and rejection retention, source-owned export records, native conditional prefix/suffix/start/display output and signed start projection. Genuine common and automatic ODT fixtures must assert complete marker state, visible labels, copies, Worker v16, exact selected XML and reopen; explicitly assert native standard ODF 1.3 pattern approximation rather than inventing losslessness. Compare representative declaration/property/export predicates to unmodified extracted pinned bodies with bounded dependency shims. Run npm run verify unchanged with both 100% coverage suites and all browser/source/provenance/ODT gates; ap doctor, policy routing and git diff --check. Record real code hash and clean final tracked state."
  Verification: "Pending implementation and final mandatory gates."
  Rollback Plan: "Revert the scoped implementation commit after inspecting later numbering corrections; retain task evidence."
  Findings: |-
    Previous turn is progress: iteration26 child 202609302319-9KTM99 DONE, implementation 7a5d80e1add85f113e00ea6fcf70e802a0e194cf and parent progress 6c27c2da1724ef23b6f6bd506488ec31c2f0b5ff; clean main/direct and only parent active. Persistent goal authorizes safe local correction. Pinned libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65 xmlnumi accepts raw prefix/suffix for both families, StartWith clamp 0..32767 with negatives->1, ParentNumbering clamp 1..32767, optional style/loext ListFormat in attribute order and generated clamped placeholders. GetProperties always appends ListFormat last; numeric start/parent only. unosett applies prefix/suffix/start/accepted parent then ListFormat; xmlnume emits nonempty affixes for both families, nondefault numeric start and clamped display>1, but raw ListFormat only in extended output. Local XML adapters drop fields/reject suffixes and text export substitutes a dot. SwXML metadata generator/build-id parsing is currently absent/ignored: ancient OOo bogus-bullet-suffix correction and full generator contracts remain a separate unresolved dependency, so no complete legacy/full-module import claim. Extended export and numbering families/fonts/legal/outline/continuous/bitmap/NONE remain unverified; preserve current standard ODF 1.3 settings.

    - Observation: Initial typecheck identifies old parallel-array export fixtures after the approved per-level property-record refactor; runtime implementation compiles. Old partial suffix/bullet-array rejection cases describe states the new transport no longer represents.
      Impact: Fixtures must use coherent level records and verify native missing-property defaults while retaining complete ten-level and invalid-character guards.
      Resolution: Migrate fixture records, replace obsolete partial-array guards with source-backed missing-field default assertions, keep all mandatory gates unchanged and rerun.

    - Observation: Focused run passes 49 tests and fails the prior literal expectation that a closing-parenthesis suffix is unsupported. Pinned xmlnumi stores arbitrary suffixes and native SetListFormat applies them.
      Impact: The old rejection expectation conflicts with source behavior and must become concrete state/visible-label evidence.
      Resolution: Assert imported suffix and actual paragraph marker for the same literal fixture; add genuine ODT parameter and native probe coverage, then rerun full gates.

    - Observation: Focused run passes the migrated exporter/context/UNO and old suffix fixture checks; all three new package fixtures fail before semantic assertions because readOdtDocument requires a metadata argument.
      Impact: The new fixture helper call contract is wrong; no marker behavior mismatch is inferred.
      Resolution: Use the existing reader metadata contract and rerun these fixtures, preserving planned source assertions and full gates.

    - Observation: The bounded C++ probe initially lacked the existing native GetStart inline accessor in its dependency shim; adding the unmodified header accessor fixed compilation. The fixture metadata repair passes all three genuine-package tests.
      Impact: Neither failure indicates a runtime marker mismatch.
      Resolution: Compiled unmodified pinned attribute loop, generated ListFormat block, marker property publication/UNO branches, signed start projection and export predicates. All 144 declarations, 144 applied marker states and 144 standard export attribute sets match local runtime. ASCII OUString/modern-no-build-id/Arabic-bullet/standard-ODF bounds are explicit; no full-native-build claim. The exact scripts/results are task-local; wider and ancient-generator dependencies remain unresolved.
id_source: "generated"
---
## Summary

Restore native marker parameter transport for the existing ODF Arabic and bullet numbering pipeline.

## Scope

xmloff core token/ordered attribute adapter, style/xmlnumi and xmlnume, text import/export records and affected text export tests; Writer UNO property application and XML import/export bridge; focused genuine ODT fixtures, bounded primary-source probes, inventory/provenance and task evidence. Refactor parallel export arrays into per-level property records and relocate marker serialization to xmlnume. Retain ODF 1.3 export version/settings, Worker graph v16, existing unsupported number families and registered save/open/recovery deviations. No network/outside access, policy/gate/threshold changes or whole-module parity promotion.

## Plan

Add source-owned numeric declaration parsing using native byte-string integer grammar and clamp rules, raw prefix/suffix for both families, and optional style/loext ListFormat with native last-attribute precedence. Generate absent ListFormat at GetProperties with display-level clamping, transport it last through Writer UNO application after prefix/suffix/start/parent properties and native validation/copy/Set. Export prefix/suffix for both families, numeric start and clamped parent count with native omission predicates and signed UNO start narrowing under existing standard ODF 1.3, retaining native lossy fallback of explicit nonstandard patterns. Replace parallel export marker/layout arrays with per-level neutral properties and source-own serialization in xmlnume. Update bounded alias/export conflict checks to account for transported fields. Verify parsed/native state, actual node labels, clones/Worker transfer and export/reopen with literal source-derived fixtures, then full unchanged mandatory gates and lifecycle.

## Verify Steps

Verify absent/empty/raw affixes, XML escaping, byte-prefix/invalid/negative/overflow start/display values, numeric SHRT bounds, bullet ignoring start/display, native generated pattern clamp and SetListFormat compatibility overwrite. Test standard and loext raw pattern aliases including both attribute orders and empty patterns. Check ordered UNO application and rejection retention, source-owned export records, native conditional prefix/suffix/start/display output and signed start projection. Genuine common and automatic ODT fixtures must assert complete marker state, visible labels, copies, Worker v16, exact selected XML and reopen; explicitly assert native standard ODF 1.3 pattern approximation rather than inventing losslessness. Compare representative declaration/property/export predicates to unmodified extracted pinned bodies with bounded dependency shims. Run npm run verify unchanged with both 100% coverage suites and all browser/source/provenance/ODT gates; ap doctor, policy routing and git diff --check. Record real code hash and clean final tracked state.

## Verification

Pending implementation and final mandatory gates.

## Rollback Plan

Revert the scoped implementation commit after inspecting later numbering corrections; retain task evidence.

## Findings

Previous turn is progress: iteration26 child 202609302319-9KTM99 DONE, implementation 7a5d80e1add85f113e00ea6fcf70e802a0e194cf and parent progress 6c27c2da1724ef23b6f6bd506488ec31c2f0b5ff; clean main/direct and only parent active. Persistent goal authorizes safe local correction. Pinned libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65 xmlnumi accepts raw prefix/suffix for both families, StartWith clamp 0..32767 with negatives->1, ParentNumbering clamp 1..32767, optional style/loext ListFormat in attribute order and generated clamped placeholders. GetProperties always appends ListFormat last; numeric start/parent only. unosett applies prefix/suffix/start/accepted parent then ListFormat; xmlnume emits nonempty affixes for both families, nondefault numeric start and clamped display>1, but raw ListFormat only in extended output. Local XML adapters drop fields/reject suffixes and text export substitutes a dot. SwXML metadata generator/build-id parsing is currently absent/ignored: ancient OOo bogus-bullet-suffix correction and full generator contracts remain a separate unresolved dependency, so no complete legacy/full-module import claim. Extended export and numbering families/fonts/legal/outline/continuous/bitmap/NONE remain unverified; preserve current standard ODF 1.3 settings.

- Observation: Initial typecheck identifies old parallel-array export fixtures after the approved per-level property-record refactor; runtime implementation compiles. Old partial suffix/bullet-array rejection cases describe states the new transport no longer represents.
  Impact: Fixtures must use coherent level records and verify native missing-property defaults while retaining complete ten-level and invalid-character guards.
  Resolution: Migrate fixture records, replace obsolete partial-array guards with source-backed missing-field default assertions, keep all mandatory gates unchanged and rerun.

- Observation: Focused run passes 49 tests and fails the prior literal expectation that a closing-parenthesis suffix is unsupported. Pinned xmlnumi stores arbitrary suffixes and native SetListFormat applies them.
  Impact: The old rejection expectation conflicts with source behavior and must become concrete state/visible-label evidence.
  Resolution: Assert imported suffix and actual paragraph marker for the same literal fixture; add genuine ODT parameter and native probe coverage, then rerun full gates.

- Observation: Focused run passes the migrated exporter/context/UNO and old suffix fixture checks; all three new package fixtures fail before semantic assertions because readOdtDocument requires a metadata argument.
  Impact: The new fixture helper call contract is wrong; no marker behavior mismatch is inferred.
  Resolution: Use the existing reader metadata contract and rerun these fixtures, preserving planned source assertions and full gates.

- Observation: The bounded C++ probe initially lacked the existing native GetStart inline accessor in its dependency shim; adding the unmodified header accessor fixed compilation. The fixture metadata repair passes all three genuine-package tests.
  Impact: Neither failure indicates a runtime marker mismatch.
  Resolution: Compiled unmodified pinned attribute loop, generated ListFormat block, marker property publication/UNO branches, signed start projection and export predicates. All 144 declarations, 144 applied marker states and 144 standard export attribute sets match local runtime. ASCII OUString/modern-no-build-id/Arabic-bullet/standard-ODF bounds are explicit; no full-native-build claim. The exact scripts/results are task-local; wider and ancient-generator dependencies remain unresolved.
