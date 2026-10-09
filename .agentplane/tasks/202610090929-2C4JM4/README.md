---
id: "202610090929-2C4JM4"
title: "Preserve native format construction without document mutation"
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
  updated_at: "2026-10-09T09:30:28.085Z"
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
    body: "Start: Restore native construction-only parent registration without document mutation, preserving later explicit mutations and all registered I/O/recovery/settings deviations."
events:
  -
    type: "status"
    at: "2026-10-09T09:30:30.823Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native construction-only parent registration without document mutation, preserving later explicit mutations and all registered I/O/recovery/settings deviations."
doc_version: 3
doc_updated_at: "2026-10-09T09:30:30.823Z"
doc_updated_by: "CODER"
description: "Iteration252 under C9TN6M: native SwFormat constructor registers the original parent and links its item set directly; current constructor incorrectly delegates to mutation SetDerivedFrom and broadcasts a document mutation during initial creation. Correct this functional prerequisite for native root ownership, preserving explicit later parent-change behavior and registered I/O/recovery/settings deviations."
sections:
  Summary: "Make represented native format construction establish original parent ownership without falsely marking the document changed."
  Scope: "Writer only: apps/office/src/sw/source/core/attr/format.ts; new native-format-construction.test.ts and native-format-construction.test.tsx at existing core attribute/browser editor directories, plus existing related tests only if actual native contracts require migration. Two canonical Writer runtime/provenance format.ts records; bounded leaf evidence and append-only parent C9TN6M Findings. No dependency/setup task, network, upstream source/helper snapshots, protected recovery/open/save/settings edits or broad semantic promotion."
  Plan: "Correct the original SwFormat constructor by validating same-pool ownership before registration, registering the original derived-from parent and linking the native attribute-set parent directly. Do not invoke SetDerivedFrom or publish a document mutation at construction. Keep all later explicit mutation contracts and unrelated defaults intact. Add independent native constructor/registration/inheritance/cross-pool tests and actual document-shell/UI lifecycle cases; verify new and related modules upstream-absent once with reportOnFailure and all-four100 source-bound coverage. Later closures failed/new/unexecuted only. Update two canonical runtime/provenance records, retain all historical fields/status/default/classification/evidence prefixes. Perform scoped static, inventory/provenance/tree/routing/doctor checks, bounded English count/hash evidence, non-independent same-agent evaluator, scoped semantic commit/finish and exact append-only parent Findings. Last full247, next full257; pause the active goal after that next full profile and all discovered failures are fixed and verified. Root/page/body/follows and full format mutation/undo contracts remain subsequent work."
  Verify Steps: "1. Compare exact pinned9bc445578031fecf56086729d8e4940c77e14d65 sw/source/core/attr/format.cxx constructor41-65 with SetDerivedFrom333-371. Assert no construction mutation calls/broadcast/model-revision or shell-modified/content-generation change; exact original parent/listener/item-set identity and inherited actual items; absent parent defaults and native automatic flag; cross-pool rejection before any leaked registration; explicit later parent mutations remain observable. 2. New and related native attribute/frame/model/history/session/UI tests physically upstream-absent, reportOnFailure enabled. Require actual source-bound all-four100 changed/app coverage. Prior251 counters only for whole byte-identical modules or complete unchanged declaration/body/enclosing-branch/location proof; no threshold/counter/skip weakening and later closures only failed/new/unexecuted cases. No full252; next full257 then fix failures and pause under latest human instruction. 3. Scoped format/lint/type/dependency/docs/size/static build upstream-absent with finally restoration and exact clean pin. Registry build/Writer/global/provenance/tree/routing/doctor; prove historical metadata/evidence prefixes preserved. 4. Bounded English evidence, explicitly non-independent same-agent evaluator, scoped semantic commit/finish and clean Writer checkout, parent/broad goal unverified and active until requested full-run pause."
  Verification: "Pending current native constructor fix and targeted source-bound checks."
  Rollback Plan: "Normal scoped revert only if requested; no reset, user merge, upstream mutation or dependency setup."
  Findings: "Read-only prerequisite audit for native root ownership: native SwFormat constructor directly Add-registers the original parent and assigns m_aSet.SetParent without any mutation hint. Current constructor calls SetDerivedFrom, which publishes format-inheritance-changed through the document and is classified as content mutation by SwDocShell. Initial format allocation therefore advances model revision and can mark a clean document modified, and subclass mutation overrides may execute before construction completes. Fix this native constructor contract before root-owned format creation, rather than add temporary suppression/restore adapters. Root/page/body/follows and native MakeFrameFormat document undo remain subsequent work. Historical full247 ops task X6VV8G remains the failed-profile record, not a green closure; next scheduled full257 and then fix-before-pause under current instruction."
id_source: "generated"
---
## Summary

Make represented native format construction establish original parent ownership without falsely marking the document changed.

## Scope

Writer only: apps/office/src/sw/source/core/attr/format.ts; new native-format-construction.test.ts and native-format-construction.test.tsx at existing core attribute/browser editor directories, plus existing related tests only if actual native contracts require migration. Two canonical Writer runtime/provenance format.ts records; bounded leaf evidence and append-only parent C9TN6M Findings. No dependency/setup task, network, upstream source/helper snapshots, protected recovery/open/save/settings edits or broad semantic promotion.

## Plan

Correct the original SwFormat constructor by validating same-pool ownership before registration, registering the original derived-from parent and linking the native attribute-set parent directly. Do not invoke SetDerivedFrom or publish a document mutation at construction. Keep all later explicit mutation contracts and unrelated defaults intact. Add independent native constructor/registration/inheritance/cross-pool tests and actual document-shell/UI lifecycle cases; verify new and related modules upstream-absent once with reportOnFailure and all-four100 source-bound coverage. Later closures failed/new/unexecuted only. Update two canonical runtime/provenance records, retain all historical fields/status/default/classification/evidence prefixes. Perform scoped static, inventory/provenance/tree/routing/doctor checks, bounded English count/hash evidence, non-independent same-agent evaluator, scoped semantic commit/finish and exact append-only parent Findings. Last full247, next full257; pause the active goal after that next full profile and all discovered failures are fixed and verified. Root/page/body/follows and full format mutation/undo contracts remain subsequent work.

## Verify Steps

1. Compare exact pinned9bc445578031fecf56086729d8e4940c77e14d65 sw/source/core/attr/format.cxx constructor41-65 with SetDerivedFrom333-371. Assert no construction mutation calls/broadcast/model-revision or shell-modified/content-generation change; exact original parent/listener/item-set identity and inherited actual items; absent parent defaults and native automatic flag; cross-pool rejection before any leaked registration; explicit later parent mutations remain observable. 2. New and related native attribute/frame/model/history/session/UI tests physically upstream-absent, reportOnFailure enabled. Require actual source-bound all-four100 changed/app coverage. Prior251 counters only for whole byte-identical modules or complete unchanged declaration/body/enclosing-branch/location proof; no threshold/counter/skip weakening and later closures only failed/new/unexecuted cases. No full252; next full257 then fix failures and pause under latest human instruction. 3. Scoped format/lint/type/dependency/docs/size/static build upstream-absent with finally restoration and exact clean pin. Registry build/Writer/global/provenance/tree/routing/doctor; prove historical metadata/evidence prefixes preserved. 4. Bounded English evidence, explicitly non-independent same-agent evaluator, scoped semantic commit/finish and clean Writer checkout, parent/broad goal unverified and active until requested full-run pause.

## Verification

Pending current native constructor fix and targeted source-bound checks.

## Rollback Plan

Normal scoped revert only if requested; no reset, user merge, upstream mutation or dependency setup.

## Findings

Read-only prerequisite audit for native root ownership: native SwFormat constructor directly Add-registers the original parent and assigns m_aSet.SetParent without any mutation hint. Current constructor calls SetDerivedFrom, which publishes format-inheritance-changed through the document and is classified as content mutation by SwDocShell. Initial format allocation therefore advances model revision and can mark a clean document modified, and subclass mutation overrides may execute before construction completes. Fix this native constructor contract before root-owned format creation, rather than add temporary suppression/restore adapters. Root/page/body/follows and native MakeFrameFormat document undo remain subsequent work. Historical full247 ops task X6VV8G remains the failed-profile record, not a green closure; next scheduled full257 and then fix-before-pause under current instruction.
