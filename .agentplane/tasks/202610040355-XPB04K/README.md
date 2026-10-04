---
id: "202610040355-XPB04K"
title: "Respect consumed browser keys before global accelerator dispatch"
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
  updated_at: "2026-10-04T03:56:13.540Z"
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
    body: "Start: standing parity goal, one global accelerator ownership correction; bounded result/hash evidence only, no upstream tests or source/helper artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T03:56:13.974Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: standing parity goal, one global accelerator ownership correction; bounded result/hash evidence only, no upstream tests or source/helper artifacts."
doc_version: 3
doc_updated_at: "2026-10-04T04:08:54.299Z"
doc_updated_by: "CODER"
description: "Iteration88: restore source local-key-before-global priority; prevent duplicate actual Writer SelectAll and consumed-key command mutation without changing command registries or intentional save/open/recovery behavior."
sections:
  Summary: "Iteration88 restores already-consumed browser key ownership before global Writer accelerator lookup and dispatch."
  Scope: "Six semantic paths: apps/office/src/framework/browser/presentation/use-command-shortcuts.ts; new use-command-shortcuts-ownership.test.tsx beside it; new apps/office/src/sw/browser/presentation/writer-view-accelerator-ownership.test.tsx; new apps/office/e2e/writer-accelerator-ownership.spec.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. All274 prior tests/specs byte-identical;218 prior manifest rows/order/default/status/owner/exception retained; only existing shortcut adapter row append-only evidence/responsibility. Own bounded evidence/task metadata only. No core,command mapping,resource,policy or intentional save/open/recovery changes."
  Plan: "Standing goal authorizes this safe local correction. Read pinned SfxDockingWindow EventNotify and SfxViewShell KeyInput/GlobalKeyInput plus local editor SelectAll route without compiling/executing upstream. Reproduce actual Writer consumed Ctrl/Meta+A calling shell SelectAll twice and consumed Ctrl+B changing model. Add guard before normalization/dispatcher lookup when browser event defaultPrevented, retaining active routing and unconsumed enabled/disabled/unmapped/modifier behavior. New hook tests prove no lookup/argument/execution for owned keys and listener lifecycle; actual Writer tests prove one SelectAll and no consumed mutation followed by normal unconsumed operation, including Sidebar local-owner events. Measured Chromium verifies consumed/nonconsumed formatting,editor selection and subsequent editing. Fullverify plus vendor-absent tests; source/hash/result-only evidence; exact semantic same-actor quality then close leaf and parent progress."
  Verify Steps: "1. Read-only pinned dockwin.cxx EventNotify,viewsh.cxx KeyInput/GlobalKeyInput_Impl and local editor SelectAll routing, source hashes/conclusions only. 2. Actual Writer pre-fix regression fails duplicate SelectAll or consumed command effects; focused owned hook/Writer units pass consumed native/React events, lookup/argument/executor zero,active/disposal/nonmatching/unconsumed disabled behavior; fresh build and Chromium1280/390 consumed/unconsumed formatting,selection/editing pass. 3. Prove exact6semantic paths,274oldtest bytes unchanged,218manifest rows/order with only1append-only evidence/responsibility update,no promotions/exceptions. 4. npm run verify passes all app/inventory/browser/resource/static provenance checks,100% app/inventory coverage,0semantic violations. Static CLI audits separately read pinned inputs; tests never read/compile/invoke upstream. 5. Temporarily rename vendor/libreoffice-reference inside vendor; npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e pass; restoration finally. 6. git diff --check,routing,doctor pass with known unrelated warnings; ignored-inclusive raw/decoded Agentplane source/helper/Python/frame/archive audit0. 7. Same-actor EVALUATOR exact semanticSHA pass; clean final tracked state,leafDONE,parentDOING; whole-native goal remains open."
  Verification: "Pending implementation and declared checks."
  Rollback Plan: "Revert isolated semantic commit if required; preserve bounded result/hash evidence and restore vendor in finally. No history rewrite."
  Findings: |-
    Base8fb521b8ba12b17db4a412efaae13425f927e94e clean main/direct. Previous turn progress: Sidebar ShowPanel iteration87 DONE156c7e47f38d; no blocker audit applies. SfxDockingWindow runs global accelerators only after local Dialog/DockingWindow rejects key. Current browser window hook ignores defaultPrevented after editor SelectAll handled Ctrl/Meta+A; registered SelectAll can execute again. Existing hook scope does not establish full native accelerator ordering,pane F6,modal eligibility,platform mapping or complete browser/native parity; these remain open. No upstream/source/helper scripts in Agentplane.

    Implementation adds defaultPrevented guard before normalization/lookup/argument resolution/execution; no command registry or priority reshuffle. Corrected baseline has4expected failures and1unconsumed pass: real Ctrl/Meta+A SelectAll twice and local-consumed Ctrl+B reaches dispatcher. Initial baseline launch referenced nonexistent vitest.config.ts; bounded fallback ran existing apps/office vite config via cwd, recorded baseline-launch.json. Initial new unconsumed Bold test assumed immediate toolbar checked state, but collapsed native attributes affect subsequent typing; corrected assertion inspects rendered strong text after model insertion. Chromium fixtures required nonempty text before SelectAll and matching Ctrl+B before removing a one-shot local handler (separate Control keydown precedes B). These are fixture corrections, no prior test/assertion edits or production workaround. Focused40ownedcases/5files, scoped lint,fresh build and2Chromium widths pass. Fullverify0:1065app/212files,109inventory/36files,57browser,2resource;100%app/inventory coverage,0semantic violations,217sources/896imports/14allowed edges,548JSDoc sources. Vendor-absent test pipeline running; final hashes/audit and same-actor exact semantic quality pending. Full native accelerator hierarchy,modal/input eligibility,Sidebar explicit key isolation,pane F6/platform mapping and complete browser/native/parent parity remain open.
id_source: "generated"
---
## Summary

Iteration88 restores already-consumed browser key ownership before global Writer accelerator lookup and dispatch.

## Scope

Six semantic paths: apps/office/src/framework/browser/presentation/use-command-shortcuts.ts; new use-command-shortcuts-ownership.test.tsx beside it; new apps/office/src/sw/browser/presentation/writer-view-accelerator-ownership.test.tsx; new apps/office/e2e/writer-accelerator-ownership.spec.ts; docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json. All274 prior tests/specs byte-identical;218 prior manifest rows/order/default/status/owner/exception retained; only existing shortcut adapter row append-only evidence/responsibility. Own bounded evidence/task metadata only. No core,command mapping,resource,policy or intentional save/open/recovery changes.

## Plan

Standing goal authorizes this safe local correction. Read pinned SfxDockingWindow EventNotify and SfxViewShell KeyInput/GlobalKeyInput plus local editor SelectAll route without compiling/executing upstream. Reproduce actual Writer consumed Ctrl/Meta+A calling shell SelectAll twice and consumed Ctrl+B changing model. Add guard before normalization/dispatcher lookup when browser event defaultPrevented, retaining active routing and unconsumed enabled/disabled/unmapped/modifier behavior. New hook tests prove no lookup/argument/execution for owned keys and listener lifecycle; actual Writer tests prove one SelectAll and no consumed mutation followed by normal unconsumed operation, including Sidebar local-owner events. Measured Chromium verifies consumed/nonconsumed formatting,editor selection and subsequent editing. Fullverify plus vendor-absent tests; source/hash/result-only evidence; exact semantic same-actor quality then close leaf and parent progress.

## Verify Steps

1. Read-only pinned dockwin.cxx EventNotify,viewsh.cxx KeyInput/GlobalKeyInput_Impl and local editor SelectAll routing, source hashes/conclusions only. 2. Actual Writer pre-fix regression fails duplicate SelectAll or consumed command effects; focused owned hook/Writer units pass consumed native/React events, lookup/argument/executor zero,active/disposal/nonmatching/unconsumed disabled behavior; fresh build and Chromium1280/390 consumed/unconsumed formatting,selection/editing pass. 3. Prove exact6semantic paths,274oldtest bytes unchanged,218manifest rows/order with only1append-only evidence/responsibility update,no promotions/exceptions. 4. npm run verify passes all app/inventory/browser/resource/static provenance checks,100% app/inventory coverage,0semantic violations. Static CLI audits separately read pinned inputs; tests never read/compile/invoke upstream. 5. Temporarily rename vendor/libreoffice-reference inside vendor; npm run test; npm exec -- vitest run scripts/check-module-boundaries.test.ts scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm run test:e2e pass; restoration finally. 6. git diff --check,routing,doctor pass with known unrelated warnings; ignored-inclusive raw/decoded Agentplane source/helper/Python/frame/archive audit0. 7. Same-actor EVALUATOR exact semanticSHA pass; clean final tracked state,leafDONE,parentDOING; whole-native goal remains open.

## Verification

Pending implementation and declared checks.

## Rollback Plan

Revert isolated semantic commit if required; preserve bounded result/hash evidence and restore vendor in finally. No history rewrite.

## Findings

Base8fb521b8ba12b17db4a412efaae13425f927e94e clean main/direct. Previous turn progress: Sidebar ShowPanel iteration87 DONE156c7e47f38d; no blocker audit applies. SfxDockingWindow runs global accelerators only after local Dialog/DockingWindow rejects key. Current browser window hook ignores defaultPrevented after editor SelectAll handled Ctrl/Meta+A; registered SelectAll can execute again. Existing hook scope does not establish full native accelerator ordering,pane F6,modal eligibility,platform mapping or complete browser/native parity; these remain open. No upstream/source/helper scripts in Agentplane.

Implementation adds defaultPrevented guard before normalization/lookup/argument resolution/execution; no command registry or priority reshuffle. Corrected baseline has4expected failures and1unconsumed pass: real Ctrl/Meta+A SelectAll twice and local-consumed Ctrl+B reaches dispatcher. Initial baseline launch referenced nonexistent vitest.config.ts; bounded fallback ran existing apps/office vite config via cwd, recorded baseline-launch.json. Initial new unconsumed Bold test assumed immediate toolbar checked state, but collapsed native attributes affect subsequent typing; corrected assertion inspects rendered strong text after model insertion. Chromium fixtures required nonempty text before SelectAll and matching Ctrl+B before removing a one-shot local handler (separate Control keydown precedes B). These are fixture corrections, no prior test/assertion edits or production workaround. Focused40ownedcases/5files, scoped lint,fresh build and2Chromium widths pass. Fullverify0:1065app/212files,109inventory/36files,57browser,2resource;100%app/inventory coverage,0semantic violations,217sources/896imports/14allowed edges,548JSDoc sources. Vendor-absent test pipeline running; final hashes/audit and same-actor exact semantic quality pending. Full native accelerator hierarchy,modal/input eligibility,Sidebar explicit key isolation,pane F6/platform mapping and complete browser/native/parent parity remain open.
