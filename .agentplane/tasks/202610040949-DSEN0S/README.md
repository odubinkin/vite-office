---
id: "202610040949-DSEN0S"
title: "Resolve live list indent precedence from native independent masks"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T09:49:22.505Z"
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
    body: "Start: restore native live independent list-indent masks and selected label-alignment core/browser geometry; preserve raw authored/legacy/filter boundaries, prior tests and registered exceptions. Checks only absent with finally restoration; no AP code artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T09:49:22.958Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native live independent list-indent masks and selected label-alignment core/browser geometry; preserve raw authored/legacy/filter boundaries, prior tests and registered exceptions. Checks only absent with finally restoration; no AP code artifacts."
doc_version: 3
doc_updated_at: "2026-10-04T09:49:22.958Z"
doc_updated_by: "CODER"
description: "Iteration101: restore AreListLevelIndentsApplicable and source-owned label-alignment item selection; wire live core print bounds and frozen browser geometry independently for both axes. Existing import/serialization sideband and wider tab/layout remain unverified separate obligations, no registered I/O/recovery changes."
sections:
  Summary: "Iteration101 restores native independent list-indent applicability from live direct items and paragraph style hierarchy. Existing static listGeometryWins incorrectly forces both coordinates together after live edits. Restore native mask and source-owned supported alignment-mode geometry selection, retaining separate raw authoring values."
  Scope: |-
    apps/office/src/sw/source/core/para/paratr.ts
    apps/office/src/sw/source/core/txtnode/ndtxt-list-indent.ts
    apps/office/src/sw/source/core/txtnode/ndtxt.ts
    apps/office/src/sw/source/core/layout/newfrm.ts
    apps/office/src/sw/browser/presentation/writer-view-projection.ts
    apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
    apps/office/src/sw/browser/presentation/writer-view-list-indent-mask.test.tsx
    apps/office/e2e/writer-list-indent-mask.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    No upstream source copies/native execution/helpers/AP traces. Existing filter/serialized sideband retained as explicitly separate unresolved metadata obligation; modern live geometry stops consuming it. Legacy placement, tab-width/device/RTL/table/full layout remain separately unverified. No registered I/O/recovery/dependency/coverage/policy changes.
  Plan: |-
    1. Add native ListLevelIndents identities and AreListLevelIndentsApplicable ownership/hierarchy contract with a source-owned text-node split to keep native node file under limit.
    2. Resolve supported label-alignment first/left inputs independently, including bound rule presence, counted/no-count, signed16 first offset and existing ignore flag; consume in core print bounds and frozen browser primitives. Preserve detached DTO/legacy fallbacks and separate authored metadata.
    3. Add actual connected-node direct/inherited/style/list/history/no-op/clone/codec and browser transition evidence, with independent literals; preserve all existing tests. Record source hashes and mapping only bounded evidence; no semantic promotion.
    4. Split static gates, one full absent application/coverage/inventory/scripts/browser pipeline with reportOnFailure and finally restoration, then source/audit/quality/finish. Repeat only failed corrected gates, never a passing full suite. Keep parent/goal active.
  Verify Steps: |-
    1. Native mask0/1/2/3 matches actual bound rule, per-axis direct zero/nonzero values, direct rule and style ancestry precedence including same-style indent-before-rule check, parent traversal and root completion. Independent alignment literals prove different first/left winner combinations, counted/ignore flags and signed16; legacy/no-rule bypass remains unchanged.
    2. Actual session frozen projection, rendered marker/body style, print bounds, grouped history/no-op/direct restore, codec and independent paragraph checked. Chromium1280/390 imported real ODT then supported live authoring transitions prove per-axis positions, preserved raw drafts, Undo/Redo, independent text and later editing; screenshots inspected without source access.
    3. All seven static gates pass. One app/inventory coverage pass (both100%fourmetrics), scripts5 and full Chromium run only upstream absent, restored finally; use reportOnFailure to retain original failed coverage. No tests invoke upstream. Repeat only failed corrected gates.
    4. After restoration resources--check/source-tree/provenance/invariants/parity pass; exact approved scope/all304prior tests preserved, mapping fields/status/default/exceptions retained, source hashes intact, whole ignored-inclusive AP forbidden0. Routing/doctor, exact-SHA same-actor read-only EVALUATOR, clean leaf finish and parent update.
  Verification: "Pending final checks; no pre-fix or baseline tests invoked."
  Rollback Plan: "Revert scoped semantic commit if native mask or selected alignment contract is disproved. No shared reset/history rewrite or registered deviation changes."
  Findings: "Source inspection confirms native mask axes are independent and derived from actual GetNum-bound rule/direct items/style hierarchy. Imported arbitrary named styles still partly flatten into direct nodes and persistent sideband remains a separate unverified refactor obligation; this task does not certify custom-style/import/export/native tab/device/RTL/full layout or parent parity."
id_source: "generated"
---
## Summary

Iteration101 restores native independent list-indent applicability from live direct items and paragraph style hierarchy. Existing static listGeometryWins incorrectly forces both coordinates together after live edits. Restore native mask and source-owned supported alignment-mode geometry selection, retaining separate raw authoring values.

## Scope

apps/office/src/sw/source/core/para/paratr.ts
apps/office/src/sw/source/core/txtnode/ndtxt-list-indent.ts
apps/office/src/sw/source/core/txtnode/ndtxt.ts
apps/office/src/sw/source/core/layout/newfrm.ts
apps/office/src/sw/browser/presentation/writer-view-projection.ts
apps/office/src/sw/browser/editor/WriterEditableParagraph.tsx
apps/office/src/sw/browser/presentation/writer-view-list-indent-mask.test.tsx
apps/office/e2e/writer-list-indent-mask.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
No upstream source copies/native execution/helpers/AP traces. Existing filter/serialized sideband retained as explicitly separate unresolved metadata obligation; modern live geometry stops consuming it. Legacy placement, tab-width/device/RTL/table/full layout remain separately unverified. No registered I/O/recovery/dependency/coverage/policy changes.

## Plan

1. Add native ListLevelIndents identities and AreListLevelIndentsApplicable ownership/hierarchy contract with a source-owned text-node split to keep native node file under limit.
2. Resolve supported label-alignment first/left inputs independently, including bound rule presence, counted/no-count, signed16 first offset and existing ignore flag; consume in core print bounds and frozen browser primitives. Preserve detached DTO/legacy fallbacks and separate authored metadata.
3. Add actual connected-node direct/inherited/style/list/history/no-op/clone/codec and browser transition evidence, with independent literals; preserve all existing tests. Record source hashes and mapping only bounded evidence; no semantic promotion.
4. Split static gates, one full absent application/coverage/inventory/scripts/browser pipeline with reportOnFailure and finally restoration, then source/audit/quality/finish. Repeat only failed corrected gates, never a passing full suite. Keep parent/goal active.

## Verify Steps

1. Native mask0/1/2/3 matches actual bound rule, per-axis direct zero/nonzero values, direct rule and style ancestry precedence including same-style indent-before-rule check, parent traversal and root completion. Independent alignment literals prove different first/left winner combinations, counted/ignore flags and signed16; legacy/no-rule bypass remains unchanged.
2. Actual session frozen projection, rendered marker/body style, print bounds, grouped history/no-op/direct restore, codec and independent paragraph checked. Chromium1280/390 imported real ODT then supported live authoring transitions prove per-axis positions, preserved raw drafts, Undo/Redo, independent text and later editing; screenshots inspected without source access.
3. All seven static gates pass. One app/inventory coverage pass (both100%fourmetrics), scripts5 and full Chromium run only upstream absent, restored finally; use reportOnFailure to retain original failed coverage. No tests invoke upstream. Repeat only failed corrected gates.
4. After restoration resources--check/source-tree/provenance/invariants/parity pass; exact approved scope/all304prior tests preserved, mapping fields/status/default/exceptions retained, source hashes intact, whole ignored-inclusive AP forbidden0. Routing/doctor, exact-SHA same-actor read-only EVALUATOR, clean leaf finish and parent update.

## Verification

Pending final checks; no pre-fix or baseline tests invoked.

## Rollback Plan

Revert scoped semantic commit if native mask or selected alignment contract is disproved. No shared reset/history rewrite or registered deviation changes.

## Findings

Source inspection confirms native mask axes are independent and derived from actual GetNum-bound rule/direct items/style hierarchy. Imported arbitrary named styles still partly flatten into direct nodes and persistent sideband remains a separate unverified refactor obligation; this task does not certify custom-style/import/export/native tab/device/RTL/full layout or parent parity.
