---
id: "202610222107-NCTYV6"
title: "Implement native formula copying and shared-group lifetime"
status: "TODO"
priority: "high"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on:
  - "202610221740-98YRBY"
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T21:10:11.011Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments: []
events: []
doc_version: 3
doc_updated_at: "2026-10-22T21:08:49.762Z"
doc_updated_by: "PLANNER"
description: "Block75 kernel prerequisite for completing74 without flat clipboard-fill substitutes. Implement original ScFormulaCell copy/clone relocation,ScTokenArray reference adjustment,default document/clipboard/undo mode identity and shared formula group creation,splitting,ownership and listening over actual columns and native area broadcasters. Support the existing numeric/string/error/local-reference and aggregate slice;keep external/named/3D/matrix/device/OpenCL services explicit. Preserve source flags,logical sharing,member/code ownership and default behavior;JS GC replaces physical allocation only. No browser evaluator,formula-source reparse substitute,per-cell flattening of native groups or reduced-original probe facade. Up to110 source/test/registry/probe paths. Calc and changed shared raw100,independent source vectors and genuine original native observations where feasible,browser/Worker and all static/build/source gates. Full all-app checkpoint80."
sections:
  Summary: "Port native formula copy/clone and shared-group ownership/listening needed by internal clipboard fill and full range recalculation."
  Scope: "Block75 depends on73. Native ScFormulaCell copy/clone relocation,ScTokenArray reference adjustment,normal/clipboard/undo mode identity,shared formula group creation/splitting/code ownership and area listening over actual stores. Existing numeric/string/error/local-reference/aggregate slice only;external/named/3D/matrix/OpenCL/device services remain explicit. Up to110 source/test/registry/probe paths;only calc checkout/branch,no network/external writes or merges. Clipboard document pooling/paste undo belongs to dependent76;UI completion remains74."
  Plan: "Inspect complete original copy/group/mode/reference/listener paths;implement genuine token/reference copying and mode identity first,then original group ownership/column splitting and native area listening. Add independent source vectors and unchanged original native observations where feasible without facade probes. Verify real edits/deletion/undo/ODS/Worker lifetimes,Calc and changed shared raw100 and all static/build/source gates. Keep74 pending until clipboard76 and final74 acceptance are complete."
  Verify Steps: "Require independent original-source vectors for relative/absolute reference copying,bounds,mode/flag/default behavior and code/RPN identity;genuine original native observations where feasible without transformed/replacement services. Real groups must share original code,split/rejoin correctly and retain source listener/bulk/teardown behavior under edits,member removal,history and serialization. No formula-source reparsing substitute,flat per-cell group replacement or copied spreadsheet model. Full Calc and changed shared owners raw100 S/B/F/L with unchanged thresholds,related tests,actual browser/DOM-free Worker,production build and type/lint/format/boundary/JSDoc/size/source/provenance/registry/resources/static/routing/doctor gates. Full all-app checkpoint80."
  Verification: "Pending kernel implementation and final acceptance."
  Rollback Plan: "Revert task-owned commits only,preserving the current74 UI checkpoint and integrated user changes."
  Findings: "The original empty-marked AutoSum path uses EnterBlock/PasteFromClip and native CloneFormulaCell grouping. Current same-position-only ScFormulaCell cloning and explicit area-group rejection are real missing prerequisites;using repeated browser EnterData calls would change architecture. Task74 UI progress is source commit82a55d62c3ae and remains unverified;655 Calc scenarios pass but final raw100 and full empty-marked behavior are still required."
id_source: "generated"
---
## Summary

Port native formula copy/clone and shared-group ownership/listening needed by internal clipboard fill and full range recalculation.

## Scope

Block75 depends on73. Native ScFormulaCell copy/clone relocation,ScTokenArray reference adjustment,normal/clipboard/undo mode identity,shared formula group creation/splitting/code ownership and area listening over actual stores. Existing numeric/string/error/local-reference/aggregate slice only;external/named/3D/matrix/OpenCL/device services remain explicit. Up to110 source/test/registry/probe paths;only calc checkout/branch,no network/external writes or merges. Clipboard document pooling/paste undo belongs to dependent76;UI completion remains74.

## Plan

Inspect complete original copy/group/mode/reference/listener paths;implement genuine token/reference copying and mode identity first,then original group ownership/column splitting and native area listening. Add independent source vectors and unchanged original native observations where feasible without facade probes. Verify real edits/deletion/undo/ODS/Worker lifetimes,Calc and changed shared raw100 and all static/build/source gates. Keep74 pending until clipboard76 and final74 acceptance are complete.

## Verify Steps

Require independent original-source vectors for relative/absolute reference copying,bounds,mode/flag/default behavior and code/RPN identity;genuine original native observations where feasible without transformed/replacement services. Real groups must share original code,split/rejoin correctly and retain source listener/bulk/teardown behavior under edits,member removal,history and serialization. No formula-source reparsing substitute,flat per-cell group replacement or copied spreadsheet model. Full Calc and changed shared owners raw100 S/B/F/L with unchanged thresholds,related tests,actual browser/DOM-free Worker,production build and type/lint/format/boundary/JSDoc/size/source/provenance/registry/resources/static/routing/doctor gates. Full all-app checkpoint80.

## Verification

Pending kernel implementation and final acceptance.

## Rollback Plan

Revert task-owned commits only,preserving the current74 UI checkpoint and integrated user changes.

## Findings

The original empty-marked AutoSum path uses EnterBlock/PasteFromClip and native CloneFormulaCell grouping. Current same-position-only ScFormulaCell cloning and explicit area-group rejection are real missing prerequisites;using repeated browser EnterData calls would change architecture. Task74 UI progress is source commit82a55d62c3ae and remains unverified;655 Calc scenarios pass but final raw100 and full empty-marked behavior are still required.
