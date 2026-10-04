---
id: "202610041642-VG6XZG"
title: "Restore native selective text hint reset decisions and no-op ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on:
  - "202610041546-HKXYFR"
tags:
  - "code"
  - "parity"
  - "writer"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T16:43:01.844Z"
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
    body: "Start: Restore the approved native selective hint reset contract with independent local regressions and one absent-only verification profile."
events:
  -
    type: "status"
    at: "2026-10-04T16:43:09.432Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore the approved native selective hint reset contract with independent local regressions and one absent-only verification profile."
doc_version: 3
doc_updated_at: "2026-10-04T16:54:07.346Z"
doc_updated_by: "CODER"
description: "Continue approved existing-functionality parity goal with one bounded txtedt reset contract leaf. Preserve state markers, direct hint deletion, exact-range precedence and no-op identity against pinned LibreOffice; add independent local real-owner regressions and bounded metadata."
sections:
  Summary: "Restore the registered full-node selective RstTextAttr decision contract against pinned LibreOffice 26.8.0.2. Existing functionality only; one executable leaf under the ongoing parity goal."
  Scope: "Exactly four semantic paths: apps/office/src/sw/source/core/txtnode/txtedt.ts; apps/office/src/sw/source/core/txtnode/txtedt-selective.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Task metadata and bounded prose/hash/count evidence are lifecycle scope. No upstream code or helpers in Agentplane, no network/outside-repo access, no existing test modification or status/default/exception promotion. Save/open/recovery deviations remain unchanged."
  Plan: "Restore exact-range precedence, direct SET hint deletion, direct SET common automatic-style filtering with lazy copy, marker preservation and no-op hint ownership. Add independent real-model and actual Writer command/history assertions. Append bounded evidence to existing provenance/runtime rows. Static gates precede one absent-only product profile; restore upstream before source audits. Review exact semantic commit and close with clean checkout."
  Verify Steps: |-
    1. Before suites: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Then absent-vendor npm run test:static.
    2. Rename vendor/libreoffice-reference to vendor/.offline-VG6XZG inside repository using try/finally. Sequential single absent-only executions: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Require every assertion and app/inventory coverage100%. Recover failed gates only, no present-vendor tests or concurrent source/scope/AP audit. Restore vendor.
    3. New independent local tests exercise real SwTextNode/SfxItemSet owners: SET versus INVALID/DISABLED/default/inherited states, empty/noncommon deletion sets, direct automatic/internet hint SET deletion, retained range/flags, no-op identity and notification, exact full-range precedence. Actual Writer frame dispatch with KeyModifier and repeated undo/redo must preserve selective state markers initially and native redo behavior. Every previous323 test file stays byte-identical.
    4. After restoration only: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity, zero semantic violations. Record native source hashes with bounded prose only.
    5. Exact four semantic paths;230 existing runtime rows retain all status/default/exception fields and only one bounded evidence appendix; source rows retain prior evidence. Ignored-inclusive Agentplane audit rejects stored source/scripts/Python/executables/archives/raw diffs/source frames. Same-actor EVALUATOR review binds semantic SHA; ap doctor and node .agentplane/policy/check-routing.mjs must pass. Recorded verification and distinct semantic/verification/close commits plus clean final tracked/untracked checkout required.
  Verification: "Pending execution. No source-dependent product tests are authorized. Passing gates will not be repeated."
  Rollback Plan: "Revert only the task semantic commit with a new commit if required; do not rewrite history. Restore upstream directory in finally on every absent-profile exit."
  Findings: "Confirmed pinned full-node decision gap and repaired it without broad parity promotion. All static gates and all product assertions passed first execution:1571 app/241files,109 inventory/36files,5 scripts/2files,99 Chromium. Product suites ran once with upstream unavailable and restored afterward; app/inventory four required coverage metrics100%. All323 previous test/spec files are byte-identical; exact four semantic paths and230 unchanged runtime statuses/defaults/exceptions. Evidence-reader recovery only: ignored the optional zero-total branchesTrue coverage field; refined whole-tree source-body detection to distinguish symbol references and primitive assertion diffs from stored code. No product gate failed or was repeated. Complete native replacement flags, notification kinds and unsupported hint/field/mark/layout/redline/range/style-access contracts remain separately unverified. No network/outside-repo access, upstream source execution or Agentplane source/helper storage."
id_source: "generated"
---
## Summary

Restore the registered full-node selective RstTextAttr decision contract against pinned LibreOffice 26.8.0.2. Existing functionality only; one executable leaf under the ongoing parity goal.

## Scope

Exactly four semantic paths: apps/office/src/sw/source/core/txtnode/txtedt.ts; apps/office/src/sw/source/core/txtnode/txtedt-selective.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Task metadata and bounded prose/hash/count evidence are lifecycle scope. No upstream code or helpers in Agentplane, no network/outside-repo access, no existing test modification or status/default/exception promotion. Save/open/recovery deviations remain unchanged.

## Plan

Restore exact-range precedence, direct SET hint deletion, direct SET common automatic-style filtering with lazy copy, marker preservation and no-op hint ownership. Add independent real-model and actual Writer command/history assertions. Append bounded evidence to existing provenance/runtime rows. Static gates precede one absent-only product profile; restore upstream before source audits. Review exact semantic commit and close with clean checkout.

## Verify Steps

1. Before suites: npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Then absent-vendor npm run test:static.
2. Rename vendor/libreoffice-reference to vendor/.offline-VG6XZG inside repository using try/finally. Sequential single absent-only executions: npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. Require every assertion and app/inventory coverage100%. Recover failed gates only, no present-vendor tests or concurrent source/scope/AP audit. Restore vendor.
3. New independent local tests exercise real SwTextNode/SfxItemSet owners: SET versus INVALID/DISABLED/default/inherited states, empty/noncommon deletion sets, direct automatic/internet hint SET deletion, retained range/flags, no-op identity and notification, exact full-range precedence. Actual Writer frame dispatch with KeyModifier and repeated undo/redo must preserve selective state markers initially and native redo behavior. Every previous323 test file stays byte-identical.
4. After restoration only: npm exec -- tsx scripts/generate-writer-ui-resources.ts --check; npm run check:source-tree; npm run check:source-provenance; npm run inventory:invariants; npm run inventory:parity, zero semantic violations. Record native source hashes with bounded prose only.
5. Exact four semantic paths;230 existing runtime rows retain all status/default/exception fields and only one bounded evidence appendix; source rows retain prior evidence. Ignored-inclusive Agentplane audit rejects stored source/scripts/Python/executables/archives/raw diffs/source frames. Same-actor EVALUATOR review binds semantic SHA; ap doctor and node .agentplane/policy/check-routing.mjs must pass. Recorded verification and distinct semantic/verification/close commits plus clean final tracked/untracked checkout required.

## Verification

Pending execution. No source-dependent product tests are authorized. Passing gates will not be repeated.

## Rollback Plan

Revert only the task semantic commit with a new commit if required; do not rewrite history. Restore upstream directory in finally on every absent-profile exit.

## Findings

Confirmed pinned full-node decision gap and repaired it without broad parity promotion. All static gates and all product assertions passed first execution:1571 app/241files,109 inventory/36files,5 scripts/2files,99 Chromium. Product suites ran once with upstream unavailable and restored afterward; app/inventory four required coverage metrics100%. All323 previous test/spec files are byte-identical; exact four semantic paths and230 unchanged runtime statuses/defaults/exceptions. Evidence-reader recovery only: ignored the optional zero-total branchesTrue coverage field; refined whole-tree source-body detection to distinguish symbol references and primitive assertion diffs from stored code. No product gate failed or was repeated. Complete native replacement flags, notification kinds and unsupported hint/field/mark/layout/redline/range/style-access contracts remain separately unverified. No network/outside-repo access, upstream source execution or Agentplane source/helper storage.
