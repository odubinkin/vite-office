---
id: "202610091102-E75DEZ"
title: "Integrate Writer and Calc into main and synchronize development branches"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 12
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T12:01:51.220Z"
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
    body: "Start: execute approved Writer Calc integration and complete verification across the three designated repositories."
events:
  -
    type: "status"
    at: "2026-10-09T11:02:38.589Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: execute approved Writer Calc integration and complete verification across the three designated repositories."
doc_version: 3
doc_updated_at: "2026-10-09T12:50:37.057Z"
doc_updated_by: "CODER"
description: "User-approved nine-step synchronization across vite-office, vite-office-writer and vite-office-calc. Push development branches, merge into main, resolve conflicts, run complete verification and repair failures, publish main, merge main back and leave all checkouts clean on their intended branches."
sections:
  Summary: "Integrate the current Writer and Calc commits and synchronize all three user-designated repositories."
  Scope: "Push writer and calc; fetch and merge into main; resolve integration conflicts; repair failed checks and add regression coverage where needed; publish main and merge it back into writer and calc. Include task evidence and lifecycle artifacts."
  Plan: "Integrate and synchronize the three branches. User explicitly expanded approval to retain Istanbul coverage, audit all newly reported gaps, add missing tests and fix genuine coverage defects without lowering 100 percent thresholds; then run complete verification and publish/back-merge branches."
  Verify Steps: |-
    - npm run verify: all formatting, lint, types, boundaries, generated resources, unit coverage, inventory coverage, browser tests, static build, documentation, size, source and registry checks must pass.
    - ap doctor and node .agentplane/policy/check-routing.mjs.
    - git diff --check.
    - git status --short --untracked-files=all in all three checkouts must be empty.
    - Confirm main contains original writer and calc heads; both resulting development branches contain published main.
    - Confirm local and remote heads agree for main, writer and calc.
  Verification: |-
    Command: npm run verify.
    Result: pass (exit 0).
    Evidence: evidence/npm-verify-istanbul.log and evidence/istanbul-final-summary.json; 528 application test files, 14192 tests, 100 percent statements/branches/functions/lines using Istanbul, zero negative counters; inventory 38 files/122 tests with 100 percent coverage; 303 browser scenarios; static build and all formatting/lint/type/dependency/resource/tooling/docs/size/tree/provenance/invariant/parity checks passed.
    Scope: merged Writer, Calc and shared application.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass.
    Evidence: zero doctor errors, two inherited warnings; routing valid; no whitespace errors.
    Scope: repository workflow and intentional changes.

    Publication and development-branch synchronization: in progress; final ancestry, remote-tip and clean-state evidence will be recorded after synchronization.
  Rollback Plan: "Retain original heads main=069279d9, writer=9a64ad49, calc=01d07401. If rollback becomes necessary, propose explicit revert commits; do not reset or force-push published history."
  Findings: "Writer and Calc were published using the explicitly authorized HTTPS URL after SSH authentication failed; both merges were conflict-free. V8 complete runs passed all tests but produced a negative paintfrm.ts branch counter ([1371, -153]); focused layout tests reached 100 percent. The application provider is now Istanbul as requested. Existing justified V8/C8 annotations were translated; no new exclusions or relaxed mandatory thresholds were added. New tests close direct default-argument, nearest-frame, DOM focus lookup, font-argument and imported numbering gaps. Three prior exclusions were removed and replaced with tests. The complete npm run verify now passes: 528 application files/14192 tests, 100 percent statements/branches/functions/lines, zero negative counters, inventory 38 files/122 tests with 100 percent coverage and 303 browser scenarios. A type-only compaction keeps txtparae.ts below the file-size limit and was verified to emit identical JavaScript; documentation, lint and types passed again afterwards. Test logs were normalized only to remove trailing spaces from tool output. TypeScript remains 6.0.3: typescript-eslint and four legacy compiler API consumers block the complete TS7 migration (assessment task 202610091107-VKHCRS). Istanbul is not an identified TS7 blocker; full-stack TS7 compatibility has not been verified. AgentPlane doctor passes with two inherited warnings. Main publication and back-merges are the remaining steps."
id_source: "generated"
---
## Summary

Integrate the current Writer and Calc commits and synchronize all three user-designated repositories.

## Scope

Push writer and calc; fetch and merge into main; resolve integration conflicts; repair failed checks and add regression coverage where needed; publish main and merge it back into writer and calc. Include task evidence and lifecycle artifacts.

## Plan

Integrate and synchronize the three branches. User explicitly expanded approval to retain Istanbul coverage, audit all newly reported gaps, add missing tests and fix genuine coverage defects without lowering 100 percent thresholds; then run complete verification and publish/back-merge branches.

## Verify Steps

- npm run verify: all formatting, lint, types, boundaries, generated resources, unit coverage, inventory coverage, browser tests, static build, documentation, size, source and registry checks must pass.
- ap doctor and node .agentplane/policy/check-routing.mjs.
- git diff --check.
- git status --short --untracked-files=all in all three checkouts must be empty.
- Confirm main contains original writer and calc heads; both resulting development branches contain published main.
- Confirm local and remote heads agree for main, writer and calc.

## Verification

Command: npm run verify.
Result: pass (exit 0).
Evidence: evidence/npm-verify-istanbul.log and evidence/istanbul-final-summary.json; 528 application test files, 14192 tests, 100 percent statements/branches/functions/lines using Istanbul, zero negative counters; inventory 38 files/122 tests with 100 percent coverage; 303 browser scenarios; static build and all formatting/lint/type/dependency/resource/tooling/docs/size/tree/provenance/invariant/parity checks passed.
Scope: merged Writer, Calc and shared application.

Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass.
Evidence: zero doctor errors, two inherited warnings; routing valid; no whitespace errors.
Scope: repository workflow and intentional changes.

Publication and development-branch synchronization: in progress; final ancestry, remote-tip and clean-state evidence will be recorded after synchronization.

## Rollback Plan

Retain original heads main=069279d9, writer=9a64ad49, calc=01d07401. If rollback becomes necessary, propose explicit revert commits; do not reset or force-push published history.

## Findings

Writer and Calc were published using the explicitly authorized HTTPS URL after SSH authentication failed; both merges were conflict-free. V8 complete runs passed all tests but produced a negative paintfrm.ts branch counter ([1371, -153]); focused layout tests reached 100 percent. The application provider is now Istanbul as requested. Existing justified V8/C8 annotations were translated; no new exclusions or relaxed mandatory thresholds were added. New tests close direct default-argument, nearest-frame, DOM focus lookup, font-argument and imported numbering gaps. Three prior exclusions were removed and replaced with tests. The complete npm run verify now passes: 528 application files/14192 tests, 100 percent statements/branches/functions/lines, zero negative counters, inventory 38 files/122 tests with 100 percent coverage and 303 browser scenarios. A type-only compaction keeps txtparae.ts below the file-size limit and was verified to emit identical JavaScript; documentation, lint and types passed again afterwards. Test logs were normalized only to remove trailing spaces from tool output. TypeScript remains 6.0.3: typescript-eslint and four legacy compiler API consumers block the complete TS7 migration (assessment task 202610091107-VKHCRS). Istanbul is not an identified TS7 blocker; full-stack TS7 compatibility has not been verified. AgentPlane doctor passes with two inherited warnings. Main publication and back-merges are the remaining steps.
