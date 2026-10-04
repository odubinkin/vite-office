---
id: "202610041546-HKXYFR"
title: "Restore explicit StyleApply key modifiers and native Ctrl reset history"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on:
  - "202610041514-RRM1E4"
tags:
  - "code"
  - "parity"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T15:59:19.116Z"
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
    body: "Start: implement the approved explicit modifier and native Ctrl reset/history correction under the standing iterative user goal."
events:
  -
    type: "status"
    at: "2026-10-04T15:47:26.764Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved explicit modifier and native Ctrl reset/history correction under the standing iterative user goal."
doc_version: 3
doc_updated_at: "2026-10-04T15:57:45.457Z"
doc_updated_by: "CODER"
description: "Iteration109 of C9TN6M: carry explicit UNO KeyModifier to SfxRequest and document-owned paragraph StyleApply; implement the registered full-character deletion set, Ctrl list eligibility and distinct initial/redo history. Preserve every prior test and all registered I/O deviations; product suites run once with upstream unavailable."
sections:
  Summary: "Restore explicit KeyModifier propagation and native Ctrl paragraph StyleApply in the registered single-PaM Writer profile. Parent C9TN6M remains active; completion is bounded iteration109 progress."
  Scope: |-
    - apps/office/src/sfx2/source/control/request.ts
    - apps/office/src/sfx2/source/control/dispatch.ts
    - apps/office/src/sfx2/source/control/unoctitm.ts
    - apps/office/src/vcl/keycodes.ts
    - apps/office/src/sw/source/uibase/app/docst.ts
    - apps/office/src/sw/source/uibase/app/docsh.ts
    - apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
    - apps/office/src/sw/source/core/edit/edfcol.ts
    - apps/office/src/sw/source/core/doc/docfmt.ts
    - apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts
    - apps/office/src/sw/source/core/txtnode/txtedt.ts
    - apps/office/src/sw/source/core/undo/unfmco.ts
    - apps/office/src/sw/source/core/undo/unattr.ts
    - apps/office/src/sfx2/source/control/unoctitm.test.ts
    - apps/office/src/sw/source/core/edit/edfcol-modifier.test.ts
    - apps/office/src/sw/browser/presentation/writer-style-modifier.test.tsx
    - docs/program/source-provenance.json
    - docs/program/parity/runtime-inventory.json
    Lifecycle evidence stays bounded English prose/hash/count records. No upstream sources, helper scripts, binaries, raw diffs, source frames or Python files in Agentplane. No network/global/outside-repo access.
  Plan: |-
    1. Inspect pinned 26.8.0.2 metadata filtering, KEY_MOD1, document collection/reset/list and history ownership.
    2. Carry explicit unsigned UNO metadata independently of slot arguments; preserve ordinary and URL request behavior and native zero default.
    3. Restore registered Ctrl deletion-set character/node/list transitions and ordered history snapshots without carrying the initial Ctrl flag into native redo.
    4. Add actual request/core/React/ODT evidence without changing any prior test; add two unverified source owners and extend the existing content-manager owner and bounded evidence appendices to existing provenance/inventory records.
    5. Complete static gates first, then run every product suite once with upstream unavailable and finally restored; recover only failed checks. Run source-dependent audits afterward, inspect strict scope and Agentplane content, commit semantic work, perform same-actor exact-SHA review, record verification, close leaf and append parent progress.
  Verify Steps: |-
    1. Static gates before product tests: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Absent-vendor npm run test:static must pass before suites.
    2. Rename vendor/libreoffice-reference inside repository to vendor/.offline-HKXYFR in try/finally. Sequential single absent-only executions: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e. Require all app and inventory metrics100%, all app/inventory/script/Chromium assertions; no concurrent source/scope/artifact audit or present-vendor suite execution. Recover only failed gates, then restore vendor.
    3. New independent local tests assert native request modifier zero/explicit unsigned/filtering/no URL reinterpretation; current Ctrl reset across whole/partial/empty inclusive ranges, selective AUTOFMT versus internet hints, protected nondefault attributes, repeated/matching/different-rule list handling, separate collection/reset history owners and native redo asymmetry. Actual mounted Writer command/frame UI and ODT export/import cover initial Ctrl formatting/link behavior, history/selection, untouched neighbors and continued editing; ordinary toolbar dispatch remains native. Every previous test is byte-identical.
    4. After restoration only: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity with zero semantic violations. Pin exact source hashes and bounded prose; no upstream execution or copied source evidence.
    5. Exact18 semantic paths, all prior test files byte-identical, only two new unverified runtime/source owners and one existing reset-set owner extension and bounded existing-row evidence appendices, no status/default/exception promotion or registered save/open/recovery changes. Ignored-inclusive AP content audit rejects code/scripts/Python/binaries/archives/source frames/raw diffs. Same-actor EVALUATOR review binds actual semantic SHA. Recorded verification, semantic/verification/close commit identities, doctor zero errors and clean tracked/untracked final checkout are required.
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert only this leaf's semantic commit through a new traceable follow-up task if needed; do not rewrite history. Always restore the repository-local vendor path in finally."
  Findings: "Pinned source inspection establishes explicit KeyModifier filtering in unoctitm, zero modifier in SfxRequest, KEY_MOD1=0x2000, Ctrl full-character/list eligibility in docst, selective deletion-set reset before collection history and a separate exact text-reset history. Native redo omits initial full-character flag and uses default non-exact text reset. Full language/field/mark/layout/redline/ring/inline-heading/native style-family/default and complete UI parity remain unverified. Existing registered save/open/recovery deviations remain unchanged. Standing user goal authorizes this single safe local correction; no new approval is needed."
id_source: "generated"
---
## Summary

Restore explicit KeyModifier propagation and native Ctrl paragraph StyleApply in the registered single-PaM Writer profile. Parent C9TN6M remains active; completion is bounded iteration109 progress.

## Scope

- apps/office/src/sfx2/source/control/request.ts
- apps/office/src/sfx2/source/control/dispatch.ts
- apps/office/src/sfx2/source/control/unoctitm.ts
- apps/office/src/vcl/keycodes.ts
- apps/office/src/sw/source/uibase/app/docst.ts
- apps/office/src/sw/source/uibase/app/docsh.ts
- apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts
- apps/office/src/sw/source/core/edit/edfcol.ts
- apps/office/src/sw/source/core/doc/docfmt.ts
- apps/office/src/sw/source/core/doc/DocumentContentOperationsManager.ts
- apps/office/src/sw/source/core/txtnode/txtedt.ts
- apps/office/src/sw/source/core/undo/unfmco.ts
- apps/office/src/sw/source/core/undo/unattr.ts
- apps/office/src/sfx2/source/control/unoctitm.test.ts
- apps/office/src/sw/source/core/edit/edfcol-modifier.test.ts
- apps/office/src/sw/browser/presentation/writer-style-modifier.test.tsx
- docs/program/source-provenance.json
- docs/program/parity/runtime-inventory.json
Lifecycle evidence stays bounded English prose/hash/count records. No upstream sources, helper scripts, binaries, raw diffs, source frames or Python files in Agentplane. No network/global/outside-repo access.

## Plan

1. Inspect pinned 26.8.0.2 metadata filtering, KEY_MOD1, document collection/reset/list and history ownership.
2. Carry explicit unsigned UNO metadata independently of slot arguments; preserve ordinary and URL request behavior and native zero default.
3. Restore registered Ctrl deletion-set character/node/list transitions and ordered history snapshots without carrying the initial Ctrl flag into native redo.
4. Add actual request/core/React/ODT evidence without changing any prior test; add two unverified source owners and extend the existing content-manager owner and bounded evidence appendices to existing provenance/inventory records.
5. Complete static gates first, then run every product suite once with upstream unavailable and finally restored; recover only failed checks. Run source-dependent audits afterward, inspect strict scope and Agentplane content, commit semantic work, perform same-actor exact-SHA review, record verification, close leaf and append parent progress.

## Verify Steps

1. Static gates before product tests: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Absent-vendor npm run test:static must pass before suites.
2. Rename vendor/libreoffice-reference inside repository to vendor/.offline-HKXYFR in try/finally. Sequential single absent-only executions: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e. Require all app and inventory metrics100%, all app/inventory/script/Chromium assertions; no concurrent source/scope/artifact audit or present-vendor suite execution. Recover only failed gates, then restore vendor.
3. New independent local tests assert native request modifier zero/explicit unsigned/filtering/no URL reinterpretation; current Ctrl reset across whole/partial/empty inclusive ranges, selective AUTOFMT versus internet hints, protected nondefault attributes, repeated/matching/different-rule list handling, separate collection/reset history owners and native redo asymmetry. Actual mounted Writer command/frame UI and ODT export/import cover initial Ctrl formatting/link behavior, history/selection, untouched neighbors and continued editing; ordinary toolbar dispatch remains native. Every previous test is byte-identical.
4. After restoration only: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity with zero semantic violations. Pin exact source hashes and bounded prose; no upstream execution or copied source evidence.
5. Exact18 semantic paths, all prior test files byte-identical, only two new unverified runtime/source owners and one existing reset-set owner extension and bounded existing-row evidence appendices, no status/default/exception promotion or registered save/open/recovery changes. Ignored-inclusive AP content audit rejects code/scripts/Python/binaries/archives/source frames/raw diffs. Same-actor EVALUATOR review binds actual semantic SHA. Recorded verification, semantic/verification/close commit identities, doctor zero errors and clean tracked/untracked final checkout are required.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert only this leaf's semantic commit through a new traceable follow-up task if needed; do not rewrite history. Always restore the repository-local vendor path in finally.

## Findings

Pinned source inspection establishes explicit KeyModifier filtering in unoctitm, zero modifier in SfxRequest, KEY_MOD1=0x2000, Ctrl full-character/list eligibility in docst, selective deletion-set reset before collection history and a separate exact text-reset history. Native redo omits initial full-character flag and uses default non-exact text reset. Full language/field/mark/layout/redline/ring/inline-heading/native style-family/default and complete UI parity remain unverified. Existing registered save/open/recovery deviations remain unchanged. Standing user goal authorizes this single safe local correction; no new approval is needed.
