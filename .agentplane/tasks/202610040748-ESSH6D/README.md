---
id: "202610040748-ESSH6D"
title: "Hide automatic first-line ruler markers"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T07:49:46.649Z"
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
    body: "Start: implement the approved effective auto-first ruler visibility and owned verification under the standing goal authorization."
events:
  -
    type: "status"
    at: "2026-10-04T07:49:47.088Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved effective auto-first ruler visibility and owned verification under the standing goal authorization."
doc_version: 3
doc_updated_at: "2026-10-04T07:49:47.088Z"
doc_updated_by: "CODER"
description: "Iteration 97 of parent 202609240501-C9TN6M: preserve the effective automatic first-line item flag in immutable browser projections and exclude that marker from drawing and hit admission, matching pinned Writer StateTabWin and SvxRuler/Ruler. Owned model/DOM/dialog/Undo/browser evidence only; no upstream execution or stored sources; tests run once absent."
sections:
  Summary: "Match the existing first-line ruler visibility to the effective automatic first-line item. Preserve precise logical indentation, immutable DTO ownership and existing model/history behavior."
  Scope: |-
    apps/office/src/sw/browser/presentation/WriterRulers.tsx
    apps/office/src/sw/browser/presentation/writer-view-projection.ts
    apps/office/src/sw/browser/presentation/writer-view-ruler-auto-first.test.tsx
    apps/office/e2e/writer-ruler-auto-first.spec.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Only bounded results/hashes/conclusions under the task subtree and lifecycle/parent documentation. Preserve all 296 previous tests byte-for-byte; preserve both 220-row manifests, statuses/defaults/owners/exceptions, appending evidence to the two existing browser rows only. No source bodies/helpers/native execution/network/outside-repo access/history rewrite.
  Plan: "Under the standing iterative-goal authorization: 1. Read pinned Writer StateTabWin, SvxRuler UpdatePara and Ruler drawing/hit exclusion; retain file hashes and conclusions only. 2. Add the primitive effective auto-first flag to the frozen computed style, allowing detached older DTOs to omit it as false; conditionally render the existing first-line marker. 3. Add owned actual-model projection, inherited style, retained DTO, dialog cancel/accept and Undo/Redo cases plus real Chromium 1280/390 import/toggle/marker/hit/history/later-editing scenarios. 4. Append two existing provenance/runtime row evidence sets without promotions. 5. Run declared split checks, one upstream-absent test pass, post-restoration audits, screenshot inspection and exact-SHA same-actor EVALUATOR review; finish clean and record parent progress. Stop for material drift; full goal stays active."
  Verify Steps: "Read ap task verify-show and the three pinned source files; no native execution or copied sources. No baseline/focused tests. Run format:check, lint, typecheck, check:dependencies, test:static (build only), check:docs and check:file-size. Rename vendor/libreoffice-reference inside vendor; run npm run test once, npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once, and npm run test:e2e once; restore in finally. Only failed corrected gates/cases may rerun, always absent; never repeat passing suites. Require 100% four-metric app/inventory coverage. After restoration run resource generator --check, source-tree, provenance, invariants and parity CLI separately; require zero semantic violations. Owned tests verify effective true/false flag for signed/zero values, style inheritance, frozen retained DTOs, old detached omission, no rendering mutation, absent hidden hit target, cancel/no history, accepted dialog transaction and Undo/Redo. Chromium at 1280/390 imports own auto-first ODT, hides first marker, retains left/right markers, restores manual marker at exact integer position and actual hit target, toggles/cancels/undoes/redoes and supports later editing. Inspect four actual screenshots outside Agentplane. Scope/source/artifact audits only after vendor restored: six semantic paths, 296 previous tests all byte-identical, two append-only rows per 220-row manifest, three unchanged pinned hashes. Ignore-inclusive Agentplane forbidden source/helper/Python/native/archive/rawframes/code-diff findings zero; five historical prose-only references. Routing/doctor and exact-SHA same-actor EVALUATOR pass; clean finish and parent remains DOING."
  Verification: "Pending approved implementation and the declared single vendor-absent verification pipeline."
  Rollback Plan: "Revert the task semantic commit with a new scoped commit if needed; preserve task traceability and do not rewrite history."
  Findings: "Previous goal turn made verified progress: iteration 96 DONE, semantic 0acd09fb56b886a59ecd07b7721e3446f9334ee7, clean main 75b650755b5b671241041231d295d32e86aceffa. Native Writer copies effective IsAutoFirst into the ruler item; SvxRuler marks the first-line indent invisible; Ruler excludes invisible indents from drawing and hit testing. Browser projection currently discards the flag. This task addresses that existing behavior only. Other recorded native ruler contracts and full parent parity remain unverified; registered save/open/recovery deviations are preserved."
id_source: "generated"
---
## Summary

Match the existing first-line ruler visibility to the effective automatic first-line item. Preserve precise logical indentation, immutable DTO ownership and existing model/history behavior.

## Scope

apps/office/src/sw/browser/presentation/WriterRulers.tsx
apps/office/src/sw/browser/presentation/writer-view-projection.ts
apps/office/src/sw/browser/presentation/writer-view-ruler-auto-first.test.tsx
apps/office/e2e/writer-ruler-auto-first.spec.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Only bounded results/hashes/conclusions under the task subtree and lifecycle/parent documentation. Preserve all 296 previous tests byte-for-byte; preserve both 220-row manifests, statuses/defaults/owners/exceptions, appending evidence to the two existing browser rows only. No source bodies/helpers/native execution/network/outside-repo access/history rewrite.

## Plan

Under the standing iterative-goal authorization: 1. Read pinned Writer StateTabWin, SvxRuler UpdatePara and Ruler drawing/hit exclusion; retain file hashes and conclusions only. 2. Add the primitive effective auto-first flag to the frozen computed style, allowing detached older DTOs to omit it as false; conditionally render the existing first-line marker. 3. Add owned actual-model projection, inherited style, retained DTO, dialog cancel/accept and Undo/Redo cases plus real Chromium 1280/390 import/toggle/marker/hit/history/later-editing scenarios. 4. Append two existing provenance/runtime row evidence sets without promotions. 5. Run declared split checks, one upstream-absent test pass, post-restoration audits, screenshot inspection and exact-SHA same-actor EVALUATOR review; finish clean and record parent progress. Stop for material drift; full goal stays active.

## Verify Steps

Read ap task verify-show and the three pinned source files; no native execution or copied sources. No baseline/focused tests. Run format:check, lint, typecheck, check:dependencies, test:static (build only), check:docs and check:file-size. Rename vendor/libreoffice-reference inside vendor; run npm run test once, npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts once, and npm run test:e2e once; restore in finally. Only failed corrected gates/cases may rerun, always absent; never repeat passing suites. Require 100% four-metric app/inventory coverage. After restoration run resource generator --check, source-tree, provenance, invariants and parity CLI separately; require zero semantic violations. Owned tests verify effective true/false flag for signed/zero values, style inheritance, frozen retained DTOs, old detached omission, no rendering mutation, absent hidden hit target, cancel/no history, accepted dialog transaction and Undo/Redo. Chromium at 1280/390 imports own auto-first ODT, hides first marker, retains left/right markers, restores manual marker at exact integer position and actual hit target, toggles/cancels/undoes/redoes and supports later editing. Inspect four actual screenshots outside Agentplane. Scope/source/artifact audits only after vendor restored: six semantic paths, 296 previous tests all byte-identical, two append-only rows per 220-row manifest, three unchanged pinned hashes. Ignore-inclusive Agentplane forbidden source/helper/Python/native/archive/rawframes/code-diff findings zero; five historical prose-only references. Routing/doctor and exact-SHA same-actor EVALUATOR pass; clean finish and parent remains DOING.

## Verification

Pending approved implementation and the declared single vendor-absent verification pipeline.

## Rollback Plan

Revert the task semantic commit with a new scoped commit if needed; preserve task traceability and do not rewrite history.

## Findings

Previous goal turn made verified progress: iteration 96 DONE, semantic 0acd09fb56b886a59ecd07b7721e3446f9334ee7, clean main 75b650755b5b671241041231d295d32e86aceffa. Native Writer copies effective IsAutoFirst into the ruler item; SvxRuler marks the first-line indent invisible; Ruler excludes invisible indents from drawing and hit testing. Browser projection currently discards the flag. This task addresses that existing behavior only. Other recorded native ruler contracts and full parent parity remain unverified; registered save/open/recovery deviations are preserved.
