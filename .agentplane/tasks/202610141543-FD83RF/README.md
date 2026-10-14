---
id: "202610141543-FD83RF"
title: "Defer unused weak-object lifecycle machinery after Calc dependency audit"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 8
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T15:49:47.542Z"
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
    body: "Start: implement shared native weak-object/adapter protocol with user-requested JS GC lifetime; preserve interface and listener behavior without new memory management."
events:
  -
    type: "status"
    at: "2026-10-14T15:44:40.299Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement shared native weak-object/adapter protocol with user-requested JS GC lifetime; preserve interface and listener behavior without new memory management."
doc_version: 3
doc_updated_at: "2026-10-14T15:49:46.502Z"
doc_updated_by: "CODER"
description: "Task134 narrowed after human questions memory/lifetime mechanism necessity. Prove native weak helper is not currently consumed by Calc/Writer; discard only this task uncommitted weak-object additions, retain original shared sources exactly, record real UNO inherited-contract dependency as pending and resume UI/ODS core priority. No new GC adapter or runtime inventory claim."
sections:
  Summary: "Task134 audits whether new OWeakObject lifecycle machinery is required for the immediate Calc UI/ODS core priority. Human questioned its memory-management purpose; existing standing instructions prohibit unnecessary memory mechanisms and prioritize native JS. Audit finds no current Calc/Writer runtime consumer of WeakReferenceHelper/queryAdapter/OWeakObject, only original helper definitions. Discard this task uncommitted weak-object proposal and document the honest pending UNO contract. No application runtime change."
  Scope: "One source documentation path docs/program/calc-core.md plus active task artifacts. Restore only this task exact uncommitted weak.ts addition and remove its two new untracked weak header/test files, saving ignored proposal evidence. Do not alter existing shared owners/history or claim full complex-color UNO transport. No API stub, replacement model, memory library, policy/tool changes or new runtime inventory record."
  Plan: "Task134 narrowed: audit actual consumers, discard only task-authored uncommitted unused weak-object proposal, preserve all existing app source hashes, document full UNO helper dependency as pending while prioritizing UI/ODS core. One calc-core documentation path plus task artifacts; docs/routing/doctor/format/diff gates and exact runtime identity, no unnecessary test replay or false runtime parity claim. Standing human JS-GC/no-unnecessary-library priorities and current necessity question support this reduction."
  Verify Steps: "Prove current production references are limited to existing weakref/helper/interface definitions; record all actual search matches. Native UnoComplexColor extends WeakImplHelper<XComplexColor>; no fabricated replacement inheritance or fake component introduced. All existing apps/office runtime/test files must be byte-identical to task base939e2ea2750d and both task-authored new header/test absent after restoration. Diff exactly docs/program/calc-core.md plus canonical task artifacts; original shared runtime/provenance inventory unchanged. Focused npm run check:docs, prettier check on exact doc, node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check pass. Existing task133 Calc174tests and shared Sequence raw100 evidence remains applicable because all app source hashes unchanged; no claim of newly run tests. No full/browser/new runtime coverage rerun for a docs-only result. Record failed lifecycle help lookup as tooling-only, not a runtime failure. Finish exact clean calc source hashes, native-source pins and proper task evidence. Full regression checkpoint still actual minimum UI+ODS readiness then pause."
  Verification: "Pending."
  Rollback Plan: "Revert only this task documentation in a later authorized task; discarded uncommitted proposal retained under ignored task evidence, never reset other work."
  Findings: "Previous task133 is verified progress at51ab912b. Task134 initially proposed actual WeakRef/FinalizationRegistry protocol with no added refcount; human question prompted necessity audit before testing/commit. No current production caller beyond shared definitions exists. Native full UNO inheritance remains genuine required contract if/when ported; it is not required to own a color value or serialize ODS. Immediate dependency-driven priority favors deferral instead of completing unused lifecycle machinery. Do not introduce a weakened replacement helper or falsely claim complex-color UNO complete. Preserve existing weakref implementation unchanged. Runtime proposal was never committed or integrated. Scope narrows to documentation and exact rollback of authored proposal only. Same-agent evaluator not independent."
id_source: "generated"
---
## Summary

Task134 audits whether new OWeakObject lifecycle machinery is required for the immediate Calc UI/ODS core priority. Human questioned its memory-management purpose; existing standing instructions prohibit unnecessary memory mechanisms and prioritize native JS. Audit finds no current Calc/Writer runtime consumer of WeakReferenceHelper/queryAdapter/OWeakObject, only original helper definitions. Discard this task uncommitted weak-object proposal and document the honest pending UNO contract. No application runtime change.

## Scope

One source documentation path docs/program/calc-core.md plus active task artifacts. Restore only this task exact uncommitted weak.ts addition and remove its two new untracked weak header/test files, saving ignored proposal evidence. Do not alter existing shared owners/history or claim full complex-color UNO transport. No API stub, replacement model, memory library, policy/tool changes or new runtime inventory record.

## Plan

Task134 narrowed: audit actual consumers, discard only task-authored uncommitted unused weak-object proposal, preserve all existing app source hashes, document full UNO helper dependency as pending while prioritizing UI/ODS core. One calc-core documentation path plus task artifacts; docs/routing/doctor/format/diff gates and exact runtime identity, no unnecessary test replay or false runtime parity claim. Standing human JS-GC/no-unnecessary-library priorities and current necessity question support this reduction.

## Verify Steps

Prove current production references are limited to existing weakref/helper/interface definitions; record all actual search matches. Native UnoComplexColor extends WeakImplHelper<XComplexColor>; no fabricated replacement inheritance or fake component introduced. All existing apps/office runtime/test files must be byte-identical to task base939e2ea2750d and both task-authored new header/test absent after restoration. Diff exactly docs/program/calc-core.md plus canonical task artifacts; original shared runtime/provenance inventory unchanged. Focused npm run check:docs, prettier check on exact doc, node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check pass. Existing task133 Calc174tests and shared Sequence raw100 evidence remains applicable because all app source hashes unchanged; no claim of newly run tests. No full/browser/new runtime coverage rerun for a docs-only result. Record failed lifecycle help lookup as tooling-only, not a runtime failure. Finish exact clean calc source hashes, native-source pins and proper task evidence. Full regression checkpoint still actual minimum UI+ODS readiness then pause.

## Verification

Pending.

## Rollback Plan

Revert only this task documentation in a later authorized task; discarded uncommitted proposal retained under ignored task evidence, never reset other work.

## Findings

Previous task133 is verified progress at51ab912b. Task134 initially proposed actual WeakRef/FinalizationRegistry protocol with no added refcount; human question prompted necessity audit before testing/commit. No current production caller beyond shared definitions exists. Native full UNO inheritance remains genuine required contract if/when ported; it is not required to own a color value or serialize ODS. Immediate dependency-driven priority favors deferral instead of completing unused lifecycle machinery. Do not introduce a weakened replacement helper or falsely claim complex-color UNO complete. Preserve existing weakref implementation unchanged. Runtime proposal was never committed or integrated. Scope narrows to documentation and exact rollback of authored proposal only. Same-agent evaluator not independent.
