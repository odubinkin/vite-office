---
id: "202610040924-V8PQRM"
title: "Preserve native signed-short manual first-line layout boundary"
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
  updated_at: "2026-10-04T09:24:45.565Z"
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
    body: "Start: restore the native signed16 unnumbered manual first-line layout boundary while retaining raw authorship, automatic long values and existing list behavior. Tests only once absent; no upstream source/helper artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T09:24:46.003Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore the native signed16 unnumbered manual first-line layout boundary while retaining raw authorship, automatic long values and existing list behavior. Tests only once absent; no upstream source/helper artifacts."
doc_version: 3
doc_updated_at: "2026-10-04T09:24:46.003Z"
doc_updated_by: "CODER"
description: "Iteration100: correct existing unnumbered manual layout narrowing from native GetFirstLineOfsWithNum, preserving authored items and ruler/dialog/filter/history values. No source/helper artifacts, upstream execution or registered I/O/recovery changes."
sections:
  Summary: "Iteration100 corrects the existing unnumbered manual first-line layout boundary. Native GetFirstLineOfsWithNum writes authored offset through short; SwTextMargin widens that signed result for placement. Current TypeScript incorrectly uses the full authored integer. Preserve raw storage and authoring contracts."
  Scope: |-
    apps/office/src/sw/source/core/text/itrcrsr.ts
    apps/office/src/sw/browser/presentation/writer-view-manual-first-layout.test.tsx
    apps/office/e2e/writer-manual-first-layout.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Task evidence/results and parent progress only. No source copies/helpers/execution, no network/outside-repo access, no registered save/open/recovery changes. Existing numbered geometry remains independently unverified, unchanged by this unnumbered correction.
  Plan: |-
    1. Narrow unnumbered manual first-line layout to native signed16; keep automatic long calculation and numbered geometry separate.
    2. Add literal boundary, direct/inherited, model/Undo/Redo/clone/codec/ODT and actual browser glyph/authoring tests; preserve all prior tests.
    3. Update only existing affected mapping evidence, without status/default/exception promotion.
    4. Run static gates, one upstream-absent application/inventory/scripts/browser pass with finally restoration, then read-only source/scope/artifact audits and exact-SHA quality. Repeat only failed corrected gates. Commit and finish leaf; leave parent/goal active.
  Verify Steps: |-
    1. Independently literal signed-short cases including 32767/32768/65535/65536/65537 and negative boundaries resolve correctly while full raw items remain unchanged; direct/inherited ownership, frozen projections, first/follow CSS, history/no-op, clone/codec/ODT and untouched paragraphs covered. Automatic calculation remains long and existing numbered raw bypass preserved.
    2. Chromium1280/390 product ODT cases for positive/negative wrapped manual offsets check real first-glyph Range geometry, raw dialog/ruler behavior, mode Undo/Redo, independent paragraph and editing. Inspect accepted screenshots.
    3. npm run format:check, lint, typecheck, check:dependencies, test:static, check:docs, check:file-size pass. Exactly one full npm run test; owned script5 and full npm run test:e2e only with vendor/libreoffice-reference unavailable/restored in finally. App/inventory four coverage metrics100%. No passing suite repeats or upstream invocation.
    4. After restoration: resource generator --check, source-tree, provenance, invariants/parity, exact path/old-test/mapping/native hashes, whole Agentplane forbidden artifact0, routing and doctor. Exact semantic SHA EVALUATOR read-only review, then clean leaf finish and parent progress.
  Verification: "Pending final owned local and browser checks. No pre-fix tests invoked."
  Rollback Plan: "Revert the scoped semantic commit and bounded evidence if the native signed16 layout contract is disproved; do not reset shared state, rewrite history, or change registered deviations."
  Findings: "Native source-only inspection confirms active-script/font/language/bidi selection is a separate unresolved layout obligation; no naive CJK heuristic added. Also found persisted listGeometryWins boolean versus native independent list-indent masks; deferred separate source-owned refactor. Neither obligation is certified by this manual integer-boundary task."
id_source: "generated"
---
## Summary

Iteration100 corrects the existing unnumbered manual first-line layout boundary. Native GetFirstLineOfsWithNum writes authored offset through short; SwTextMargin widens that signed result for placement. Current TypeScript incorrectly uses the full authored integer. Preserve raw storage and authoring contracts.

## Scope

apps/office/src/sw/source/core/text/itrcrsr.ts
apps/office/src/sw/browser/presentation/writer-view-manual-first-layout.test.tsx
apps/office/e2e/writer-manual-first-layout.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Task evidence/results and parent progress only. No source copies/helpers/execution, no network/outside-repo access, no registered save/open/recovery changes. Existing numbered geometry remains independently unverified, unchanged by this unnumbered correction.

## Plan

1. Narrow unnumbered manual first-line layout to native signed16; keep automatic long calculation and numbered geometry separate.
2. Add literal boundary, direct/inherited, model/Undo/Redo/clone/codec/ODT and actual browser glyph/authoring tests; preserve all prior tests.
3. Update only existing affected mapping evidence, without status/default/exception promotion.
4. Run static gates, one upstream-absent application/inventory/scripts/browser pass with finally restoration, then read-only source/scope/artifact audits and exact-SHA quality. Repeat only failed corrected gates. Commit and finish leaf; leave parent/goal active.

## Verify Steps

1. Independently literal signed-short cases including 32767/32768/65535/65536/65537 and negative boundaries resolve correctly while full raw items remain unchanged; direct/inherited ownership, frozen projections, first/follow CSS, history/no-op, clone/codec/ODT and untouched paragraphs covered. Automatic calculation remains long and existing numbered raw bypass preserved.
2. Chromium1280/390 product ODT cases for positive/negative wrapped manual offsets check real first-glyph Range geometry, raw dialog/ruler behavior, mode Undo/Redo, independent paragraph and editing. Inspect accepted screenshots.
3. npm run format:check, lint, typecheck, check:dependencies, test:static, check:docs, check:file-size pass. Exactly one full npm run test; owned script5 and full npm run test:e2e only with vendor/libreoffice-reference unavailable/restored in finally. App/inventory four coverage metrics100%. No passing suite repeats or upstream invocation.
4. After restoration: resource generator --check, source-tree, provenance, invariants/parity, exact path/old-test/mapping/native hashes, whole Agentplane forbidden artifact0, routing and doctor. Exact semantic SHA EVALUATOR read-only review, then clean leaf finish and parent progress.

## Verification

Pending final owned local and browser checks. No pre-fix tests invoked.

## Rollback Plan

Revert the scoped semantic commit and bounded evidence if the native signed16 layout contract is disproved; do not reset shared state, rewrite history, or change registered deviations.

## Findings

Native source-only inspection confirms active-script/font/language/bidi selection is a separate unresolved layout obligation; no naive CJK heuristic added. Also found persisted listGeometryWins boolean versus native independent list-indent masks; deferred separate source-owned refactor. Neither obligation is certified by this manual integer-boundary task.
