---
id: "202610040603-E1BQ72"
title: "Match Writer ruler tab insertion replacement semantics"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T06:04:15.688Z"
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
    body: "Start: implement approved insertion replacement semantics under the standing iterative goal; one vendor-absent test pass and separate static source audits."
events:
  -
    type: "status"
    at: "2026-10-04T06:04:22.539Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved insertion replacement semantics under the standing iterative goal; one vendor-absent test pass and separate static source audits."
doc_version: 3
doc_updated_at: "2026-10-04T06:08:23.287Z"
doc_updated_by: "CODER"
description: "Iteration 92: replace an occupied ruler tab position with a fresh Left tab stop, preserving unrelated stored stops and metadata. Keep general paragraph tab-list editing unchanged. Verify once with the pinned upstream directory unavailable; inspect upstream source separately without storing source bodies or helpers in Agentplane."
sections:
  Summary: "Iteration 92 corrects the existing Writer ruler insertion command: a newly inserted Left tab replaces an occupied Default/explicit position using fresh constructor metadata. Preserve unrelated tab fields, stored ordering/default distance, cancellation, immutable projections and one accepted undo transaction."
  Scope: |-
    apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    apps/office/src/sw/browser/presentation/writer-view-ruler-tab-insertion.test.tsx
    apps/office/e2e/writer-ruler-tab-insertion.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Only these five semantic paths plus canonical task/parent records and bounded result/hash evidence. All 286 prior tests/specs byte-identical; all 220 prior manifest rows retain order/status/defaults/exceptions, with append-only evidence for existing SwWrtShell and WriterRulers rows. No new runtime modules/features. No save/open/recovery implementation changes, native probes, network/global/outside access, Agentplane helpers/source bodies/raw diagnostics.
  Plan: "Under the standing goal, implement one insertion correction: validate the selected positive integer position, clone the existing SvxTabStopItem, Insert(new SvxTabStop(position)) and commit through SetParagraphItem. Add owned actual-session/DOM and Chromium regressions, append bounded evidence to two existing manifests without parity promotion, and execute the single vendor-absent verification contract before semantic commit/evaluator/finish."
  Verify Steps: "Read ap task verify-show. Inspect pinned SvxRuler Click, SvxTabStop constructor and SvxTabStopItem Insert read-only, record paths/markers/hashes/conclusions only. Do not execute native code or upstream-backed tests. No pre-fix baseline/focused test run. Run format:check, lint, typecheck, check:dependencies, test:static (build/static only), check:docs, check:file-size. Rename vendor/libreoffice-reference inside vendor and run npm run test once (app/inventory coverage), npx vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once and npm run test:e2e once; restore in finally even on failure. Test failures justify a corrected rerun of affected gates; no routine source-present duplicate. After restoration run npm exec tsx -- scripts/generate-writer-ui-resources.ts --check, check:source-tree, check:source-provenance, inventory:invariants, inventory:parity. Require all checks pass, four coverage summaries 100%, semantic violations zero. Check five-path scope, all 286 old tests unchanged, append-only 220-row manifests/no promotion, ignored-inclusive Agentplane audit zero source/helpers/Python/native archives/raw frames. Run routing validation and ap doctor. Same-actor EVALUATOR evaluates actual semantic SHA; record honest bounded gaps. Finish with clean tracked/untracked state; keep parent goal active."
  Verification: "Pending final single vendor-absent suite pass and separate static audits. No tests run for this iteration yet."
  Rollback Plan: "Revert the isolated semantic commit if necessary. Restore temporarily renamed vendor directory in finally. Preserve bounded task conclusions/hashes; no history rewrite."
  Findings: |-
    Confirmed source-only gap: current AddRulerTabStop reconstructs all positions through general SetTabStopPositions/CreateTabStops, preserving old metadata at collisions and revalidating unrelated legacy positions. Pinned SvxRuler Click inserts a newly constructed tab; SvxTabStopItem Insert removes a matching position so the new stop wins. Correct only Add; preserve supported positive integer <=32767 input contract and general list-edit metadata retention. Full native selector/type glyphs, RTL/snap/capture/platform geometry, wider native signed range and parent/native parity remain unverified. User requires one test pass with upstream unavailable, separate source inspection/static audits. No independent agent review is claimed.

    - Observation: Initial static checks found unsupported Testing Library exact option in the new owned regression and a formatting stabilization issue; no suites have run.
      Impact: Typecheck/build and formatting need correction before the one vendor-absent test pass; approved semantic scope and criteria unchanged.
      Resolution: Remove the unsupported selector option, stabilize owned formatting, then rerun only affected static gates. Keep raw diagnostics out of Agentplane.
id_source: "generated"
---
## Summary

Iteration 92 corrects the existing Writer ruler insertion command: a newly inserted Left tab replaces an occupied Default/explicit position using fresh constructor metadata. Preserve unrelated tab fields, stored ordering/default distance, cancellation, immutable projections and one accepted undo transaction.

## Scope

apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
apps/office/src/sw/browser/presentation/writer-view-ruler-tab-insertion.test.tsx
apps/office/e2e/writer-ruler-tab-insertion.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Only these five semantic paths plus canonical task/parent records and bounded result/hash evidence. All 286 prior tests/specs byte-identical; all 220 prior manifest rows retain order/status/defaults/exceptions, with append-only evidence for existing SwWrtShell and WriterRulers rows. No new runtime modules/features. No save/open/recovery implementation changes, native probes, network/global/outside access, Agentplane helpers/source bodies/raw diagnostics.

## Plan

Under the standing goal, implement one insertion correction: validate the selected positive integer position, clone the existing SvxTabStopItem, Insert(new SvxTabStop(position)) and commit through SetParagraphItem. Add owned actual-session/DOM and Chromium regressions, append bounded evidence to two existing manifests without parity promotion, and execute the single vendor-absent verification contract before semantic commit/evaluator/finish.

## Verify Steps

Read ap task verify-show. Inspect pinned SvxRuler Click, SvxTabStop constructor and SvxTabStopItem Insert read-only, record paths/markers/hashes/conclusions only. Do not execute native code or upstream-backed tests. No pre-fix baseline/focused test run. Run format:check, lint, typecheck, check:dependencies, test:static (build/static only), check:docs, check:file-size. Rename vendor/libreoffice-reference inside vendor and run npm run test once (app/inventory coverage), npx vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once and npm run test:e2e once; restore in finally even on failure. Test failures justify a corrected rerun of affected gates; no routine source-present duplicate. After restoration run npm exec tsx -- scripts/generate-writer-ui-resources.ts --check, check:source-tree, check:source-provenance, inventory:invariants, inventory:parity. Require all checks pass, four coverage summaries 100%, semantic violations zero. Check five-path scope, all 286 old tests unchanged, append-only 220-row manifests/no promotion, ignored-inclusive Agentplane audit zero source/helpers/Python/native archives/raw frames. Run routing validation and ap doctor. Same-actor EVALUATOR evaluates actual semantic SHA; record honest bounded gaps. Finish with clean tracked/untracked state; keep parent goal active.

## Verification

Pending final single vendor-absent suite pass and separate static audits. No tests run for this iteration yet.

## Rollback Plan

Revert the isolated semantic commit if necessary. Restore temporarily renamed vendor directory in finally. Preserve bounded task conclusions/hashes; no history rewrite.

## Findings

Confirmed source-only gap: current AddRulerTabStop reconstructs all positions through general SetTabStopPositions/CreateTabStops, preserving old metadata at collisions and revalidating unrelated legacy positions. Pinned SvxRuler Click inserts a newly constructed tab; SvxTabStopItem Insert removes a matching position so the new stop wins. Correct only Add; preserve supported positive integer <=32767 input contract and general list-edit metadata retention. Full native selector/type glyphs, RTL/snap/capture/platform geometry, wider native signed range and parent/native parity remain unverified. User requires one test pass with upstream unavailable, separate source inspection/static audits. No independent agent review is claimed.

- Observation: Initial static checks found unsupported Testing Library exact option in the new owned regression and a formatting stabilization issue; no suites have run.
  Impact: Typecheck/build and formatting need correction before the one vendor-absent test pass; approved semantic scope and criteria unchanged.
  Resolution: Remove the unsupported selector option, stabilize owned formatting, then rerun only affected static gates. Keep raw diagnostics out of Agentplane.
