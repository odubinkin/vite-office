---
id: "202610061043-GVCYWF"
title: "Remove callback editing and clipboard operation adapters from native Writer shell"
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
  updated_at: "2026-10-06T10:44:40.317Z"
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
    body: "Start: remove two callback adapter layers using actual native shell identity; preserve behavior, one absent profile, whole parity unverified."
events:
  -
    type: "status"
    at: "2026-10-06T10:44:40.986Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: remove two callback adapter layers using actual native shell identity; preserve behavior, one absent profile, whole parity unverified."
doc_version: 3
doc_updated_at: "2026-10-06T10:44:40.986Z"
doc_updated_by: "CODER"
description: "Iteration184: remove SwWrtShellEditingOperations/SwWrtShellEditingPort and WriterPasteOperations callback layers; structural editing uses actual SwWrtShell owner, native cursor/document/history methods and direct transfer coordination. Preserve existing behavior and registered I/O deviations; verify all existing acceptance once upstream absent."
sections:
  Summary: "Remove the two callback editing/clipboard operation adapters. Native structural editing and clipboard insertion borrow the actual SwWrtShell identity and call its cursor/document/history operations directly."
  Scope: "apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Existing482 acceptance files unchanged. All270 prior semantic statuses/defaults/classifications and registered I/O/recovery deviations preserved; only removed adapter symbol references replaced by actual direct helper symbols, with full prior justification/evidence retained otherwise. Bounded English AP prose/counts/hashes/outcomes/exact failures; raw maps/cases/source snapshots only ignored app cache. No network/outside access/subagents."
  Plan: "Remove both synthetic callback editing/transfer ports and use actual native SwWrtShell owner directly; preserve existing contracts/order/behavior and all482 test files. Six static gates plus one absent full profile, once-restored source audits and exact-SHA quality; no parity promotion."
  Verify Steps: |-
    1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates repeated. Scoped unchanged JSDoc and actual physical-line checks on3 changed source files.
    2. ONE full upstream-absent profile, vendor renamed inside repo/restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure with JSON raw cases/maps; scripts acceptance; all Chromium against dist. Persist exact failures/counts/errors/hashes before asserting. No full/passing replay or tests invoking upstream; original failure/new-case closure only if necessary.
    3. All482 existing test files remain byte-identical; existing actual shell/mounted/browser cases cover body/table selected input, deletion/split/join, native hints/list state, plain/rich transfer, grouping/Undo/Redo/composition, notifications and replacement.100% actual app/inventory counters; any transfer only identical maps or entire byte-identical ranges with actual counters. No removed adapter symbols/callback objects in production, no runtime dependency cycle; genuine native SwWrtShell owner used directly.
    4. After restoration generation --check/source-tree/provenance/invariants/parity once. Scope audit all270 prior semantic statuses/defaults/classes preserved; precise removed-symbol metadata replacement only. Scoped AP source/helper prohibition, doctor/routing/diff and same-agent exact-SHA quality; scoped implementation/evidence/verification/clean close; preserve entire parent Findings prefix.
  Verification: "Pending direct native-owner refactor and declared gates."
  Rollback Plan: "Revert scoped implementation through a separate leaf if native cursor/history/transfer behavior regresses; preserve immutable DONE evidence and conscious I/O deviations."
  Findings: "Previous turn made verified progress:183 DONE implementation0264126bc5f57c16b0a94884a4722408af1e2d05; parent checkpoint3c430aa4e84ef4c8e5a4d39a6d15677e62a4fe1b. Discovery shows native operations still invoked through SwWrtShellEditingOperations/SwWrtShellEditingPort and WriterPasteOperations object. Callback port originally avoided a runtime cycle, but a type-only actual-shell dependency now removes both synthetic identity layers without runtime import. Optional nonexistent table-paste/readtext/sw-inc-wrtsh/check-dependencies discovery paths resolved via actual rg/package commands; route recomputed before mutation. Full native behavior/layout/protection/clipboard and whole parity remain unverified."
id_source: "generated"
---
## Summary

Remove the two callback editing/clipboard operation adapters. Native structural editing and clipboard insertion borrow the actual SwWrtShell identity and call its cursor/document/history operations directly.

## Scope

apps/office/src/sw/source/uibase/wrtsh/wrtsh-editing.ts; apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts; apps/office/src/sw/source/uibase/dochdl/swdtflvr.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Existing482 acceptance files unchanged. All270 prior semantic statuses/defaults/classifications and registered I/O/recovery deviations preserved; only removed adapter symbol references replaced by actual direct helper symbols, with full prior justification/evidence retained otherwise. Bounded English AP prose/counts/hashes/outcomes/exact failures; raw maps/cases/source snapshots only ignored app cache. No network/outside access/subagents.

## Plan

Remove both synthetic callback editing/transfer ports and use actual native SwWrtShell owner directly; preserve existing contracts/order/behavior and all482 test files. Six static gates plus one absent full profile, once-restored source audits and exact-SHA quality; no parity promotion.

## Verify Steps

1. npm run format:check; npm run lint; npm run typecheck; npm run check:dependencies; npm run check:docs; npm run check:file-size. Only failed gates repeated. Scoped unchanged JSDoc and actual physical-line checks on3 changed source files.
2. ONE full upstream-absent profile, vendor renamed inside repo/restored in finally: npm run test:static; full app/inventory coverage --coverage.reportOnFailure with JSON raw cases/maps; scripts acceptance; all Chromium against dist. Persist exact failures/counts/errors/hashes before asserting. No full/passing replay or tests invoking upstream; original failure/new-case closure only if necessary.
3. All482 existing test files remain byte-identical; existing actual shell/mounted/browser cases cover body/table selected input, deletion/split/join, native hints/list state, plain/rich transfer, grouping/Undo/Redo/composition, notifications and replacement.100% actual app/inventory counters; any transfer only identical maps or entire byte-identical ranges with actual counters. No removed adapter symbols/callback objects in production, no runtime dependency cycle; genuine native SwWrtShell owner used directly.
4. After restoration generation --check/source-tree/provenance/invariants/parity once. Scope audit all270 prior semantic statuses/defaults/classes preserved; precise removed-symbol metadata replacement only. Scoped AP source/helper prohibition, doctor/routing/diff and same-agent exact-SHA quality; scoped implementation/evidence/verification/clean close; preserve entire parent Findings prefix.

## Verification

Pending direct native-owner refactor and declared gates.

## Rollback Plan

Revert scoped implementation through a separate leaf if native cursor/history/transfer behavior regresses; preserve immutable DONE evidence and conscious I/O deviations.

## Findings

Previous turn made verified progress:183 DONE implementation0264126bc5f57c16b0a94884a4722408af1e2d05; parent checkpoint3c430aa4e84ef4c8e5a4d39a6d15677e62a4fe1b. Discovery shows native operations still invoked through SwWrtShellEditingOperations/SwWrtShellEditingPort and WriterPasteOperations object. Callback port originally avoided a runtime cycle, but a type-only actual-shell dependency now removes both synthetic identity layers without runtime import. Optional nonexistent table-paste/readtext/sw-inc-wrtsh/check-dependencies discovery paths resolved via actual rg/package commands; route recomputed before mutation. Full native behavior/layout/protection/clipboard and whole parity remain unverified.
