---
id: "202610011119-4H9E82"
title: "Restore Writer numbering format ownership and access contracts"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on:
  - "202610011035-VZ3MGM"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T11:20:52.598Z"
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
    body: "Start: user-authorized iteration 43 restores optional owned formats and shared effective defaults, with consumer and Worker migration and unchanged verification gates."
events:
  -
    type: "status"
    at: "2026-10-01T11:20:53.353Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: user-authorized iteration 43 restores optional owned formats and shared effective defaults, with consumer and Worker migration and unchanged verification gates."
doc_version: 3
doc_updated_at: "2026-10-01T11:20:53.353Z"
doc_updated_by: "CODER"
description: "Iteration 43: separate optional owned levels from shared effective defaults, preserve source-equivalent Set no-op and copy ownership, and migrate existing consumers and Worker serialization without changing registered I/O deviations."
sections:
  Summary: "Iteration 43 restores the existing Writer format ownership boundary against pinned LibreOffice 26.8.0.2 / 9bc445578031fecf56086729d8e4940c77e14d65. Persistent user goal authorizes safe local implementation and verification; full parity remains unproven."
  Scope: "SwNumRule/SwNumFormat and inherited implemented marker/position equality; source-shaped rule constructor and metadata setters; shared NUM/OUTLINE base formats in both modes; DocumentListsManager command assembly; all existing GetNumFormat consumers and fixtures across core, layout, UNO, XML, browser projection and Worker graph codec; related regression tests, runtime source mapping and inventory metadata if required. Preserve registered save/open/recovery deviations. No network, outside-repository reads, policy edits, coverage changes or subagents."
  Plan: |-
    1. Capture fresh baseline and literal pinned native ownership/default/equality evidence.
    2. Restore sparse owned formats, effective const Get, raw optional const GetNumFormat, source-equivalent reference Set, sparse clone and shared four-family defaults. Move browser kind/array assembly out of the source-shaped constructor; preserve established manager and I/O behavior through explicit assembly.
    3. Migrate all real readers to effective Get except native raw-optional restart reads; migrate writers to independent clone then Set. Extend the graph v16 with optional ownership/default-mode/type fields with legacy fallbacks. Add differential and boundary regressions and narrowly scoped metadata evidence.
    4. Run unchanged focused/full validation, retain failure evidence and fix in-scope issues. Review actual CODE in EVALUATOR phase, finish this leaf and append parent progress. Stop for material scope or risk drift; do not close the persistent goal.
  Verify Steps: |-
    1. Record the actual pre-edit eager ownership and equal-Set mismatch. Extract complete unchanged pinned Get/GetNumFormat/reference-Set and constructor/copy/equality definitions; execute native differential traces under ASan/UBSan with named adapters for unsupported platform/client/font/graphic state, retaining identities and limitations.
    2. Compare all ten levels in four native default families; raw absence, shared identity, explicit ownership, equal owned Set identity/no invalidation, unequal Set copying/invalidation, caller-copy isolation and sparse clone ownership. Exercise every implemented equality field including inactive geometry and absent versus empty ListFormat. Getter surfaces must not expose setters.
    3. Preserve existing list/restart/UNO/ODT assertions while migrating mutations to clone-and-Set. Worker transfer must preserve absence and default selection; legacy graph v16 records without ownership metadata must retain existing explicit levels. Verify malformed boundary rejection.
    4. Run focused new and migrated tests and npm run verify unchanged, including both 100% suites, lint/types, browser, genuine ODT fixtures, inventory/provenance/source paths, static build and authored-file sizes. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check.
    5. Record actual CODE SHA, verification and independent quality-phase review, finish only this leaf and leave the parent and goal active. Final tracked state must be clean.
  Verification: "Pending implementation and checks. No module-level parity promotion is authorized."
  Rollback Plan: "Revert only the eventual implementation commit through a new executable task; retain immutable native observations and failed attempts."
  Findings: "Baseline from immutable iteration 42: effective Get absent; ten eager owned slots; equal Set replaces identity and invalidates. Native accessor/ref-Set proof has empty raw slots, shared Get defaults and equal owned no-op. Native pointer Set overload, full style/client/font/graphic ownership and static destruction lifetime remain outside the currently implemented reference overload and must not be claimed certified. Direct workflow remains local. Parent goal has not achieved whole-project parity."
id_source: "generated"
---
## Summary

Iteration 43 restores the existing Writer format ownership boundary against pinned LibreOffice 26.8.0.2 / 9bc445578031fecf56086729d8e4940c77e14d65. Persistent user goal authorizes safe local implementation and verification; full parity remains unproven.

## Scope

SwNumRule/SwNumFormat and inherited implemented marker/position equality; source-shaped rule constructor and metadata setters; shared NUM/OUTLINE base formats in both modes; DocumentListsManager command assembly; all existing GetNumFormat consumers and fixtures across core, layout, UNO, XML, browser projection and Worker graph codec; related regression tests, runtime source mapping and inventory metadata if required. Preserve registered save/open/recovery deviations. No network, outside-repository reads, policy edits, coverage changes or subagents.

## Plan

1. Capture fresh baseline and literal pinned native ownership/default/equality evidence.
2. Restore sparse owned formats, effective const Get, raw optional const GetNumFormat, source-equivalent reference Set, sparse clone and shared four-family defaults. Move browser kind/array assembly out of the source-shaped constructor; preserve established manager and I/O behavior through explicit assembly.
3. Migrate all real readers to effective Get except native raw-optional restart reads; migrate writers to independent clone then Set. Extend the graph v16 with optional ownership/default-mode/type fields with legacy fallbacks. Add differential and boundary regressions and narrowly scoped metadata evidence.
4. Run unchanged focused/full validation, retain failure evidence and fix in-scope issues. Review actual CODE in EVALUATOR phase, finish this leaf and append parent progress. Stop for material scope or risk drift; do not close the persistent goal.

## Verify Steps

1. Record the actual pre-edit eager ownership and equal-Set mismatch. Extract complete unchanged pinned Get/GetNumFormat/reference-Set and constructor/copy/equality definitions; execute native differential traces under ASan/UBSan with named adapters for unsupported platform/client/font/graphic state, retaining identities and limitations.
2. Compare all ten levels in four native default families; raw absence, shared identity, explicit ownership, equal owned Set identity/no invalidation, unequal Set copying/invalidation, caller-copy isolation and sparse clone ownership. Exercise every implemented equality field including inactive geometry and absent versus empty ListFormat. Getter surfaces must not expose setters.
3. Preserve existing list/restart/UNO/ODT assertions while migrating mutations to clone-and-Set. Worker transfer must preserve absence and default selection; legacy graph v16 records without ownership metadata must retain existing explicit levels. Verify malformed boundary rejection.
4. Run focused new and migrated tests and npm run verify unchanged, including both 100% suites, lint/types, browser, genuine ODT fixtures, inventory/provenance/source paths, static build and authored-file sizes. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check.
5. Record actual CODE SHA, verification and independent quality-phase review, finish only this leaf and leave the parent and goal active. Final tracked state must be clean.

## Verification

Pending implementation and checks. No module-level parity promotion is authorized.

## Rollback Plan

Revert only the eventual implementation commit through a new executable task; retain immutable native observations and failed attempts.

## Findings

Baseline from immutable iteration 42: effective Get absent; ten eager owned slots; equal Set replaces identity and invalidates. Native accessor/ref-Set proof has empty raw slots, shared Get defaults and equal owned no-op. Native pointer Set overload, full style/client/font/graphic ownership and static destruction lifetime remain outside the currently implemented reference overload and must not be claimed certified. Direct workflow remains local. Parent goal has not achieved whole-project parity.
