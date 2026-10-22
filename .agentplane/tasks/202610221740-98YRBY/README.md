---
id: "202610221740-98YRBY"
title: "Connect formula ranges to native area recalculation and aggregate execution"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on:
  - "202610221740-JMM9C5"
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-22T17:41:25.408Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-10-22T18:48:38.038Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-10-22T18:48:38.038Z"
doc_updated_by: "CODER"
description: "Block73 dependent on72: implement native local-A1/ODFF double-reference compilation/output,real area dependency notifications through ScBroadcastArea/Slot/SlotMachine and ScDocument lifetime,then aggregate range traversal through actual RangeColumnSpanSet/NumericCellAccumulator and native array summation. Do not flatten ranges into individual cell listeners or use a browser evaluator. Verify liveSUMrange edits,errors,history,large sparse ranges and ODS/browser reopen. Preserve source slot distribution,bulk/deferred erasure and default non-grouped semantics;unported advanced modes stay explicit. Scope up to80source/test/registry/probe paths. Calc and changed shared100;full checkpoint80."
sections:
  Summary: "Connect real range operands to native dependency notifications and aggregate range computation."
  Scope: "Block73 depends on block72. Native local and ODFF rectangular double references,source area slots/document lifetime/bulk erasure,range column actions and numeric accumulation. Up to80source/test/registry/probe paths. No individual-cell listener expansion or browser computations;advanced unported modes remain explicit."
  Plan: "After72,port canonical range references,area subscriptions and native aggregate range actions,then verify live full-range SUM through UI and ODS without substitute dependency/evaluation models."
  Verify Steps: "Require complete source-shaped area geometry,duplicate/listener/bulk/deferred erasure and lifetime tests;independent compiler/reference vectors;native summation observations. Mounted range formulas must recompute after editing any range member and after undo/redo and ODS reload,including large sparse spans and style/geometry preservation. Calc and all changed shared owners must retain raw100 S/B/F/L with original thresholds;run related Writer cases and actual browser/Worker checks. All static/source/build/registry/routing/doctor gates pass. No full all-app checkpoint before80 unless material failures require it."
  Verification: "Pending;dependency72 not yet complete."
  Rollback Plan: "Revert task-owned implementation commits only;preserve integrated user changes."
  Findings: "Current formulas listen only through individual-cell broadcasters. Native default range SUM uses RangeColumnSpanSet and NumericCellAccumulator;using a row-major iterator or a flat range listener list would change native ordering and architecture."
id_source: "generated"
---
## Summary

Connect real range operands to native dependency notifications and aggregate range computation.

## Scope

Block73 depends on block72. Native local and ODFF rectangular double references,source area slots/document lifetime/bulk erasure,range column actions and numeric accumulation. Up to80source/test/registry/probe paths. No individual-cell listener expansion or browser computations;advanced unported modes remain explicit.

## Plan

After72,port canonical range references,area subscriptions and native aggregate range actions,then verify live full-range SUM through UI and ODS without substitute dependency/evaluation models.

## Verify Steps

Require complete source-shaped area geometry,duplicate/listener/bulk/deferred erasure and lifetime tests;independent compiler/reference vectors;native summation observations. Mounted range formulas must recompute after editing any range member and after undo/redo and ODS reload,including large sparse spans and style/geometry preservation. Calc and all changed shared owners must retain raw100 S/B/F/L with original thresholds;run related Writer cases and actual browser/Worker checks. All static/source/build/registry/routing/doctor gates pass. No full all-app checkpoint before80 unless material failures require it.

## Verification

Pending;dependency72 not yet complete.

## Rollback Plan

Revert task-owned implementation commits only;preserve integrated user changes.

## Findings

Current formulas listen only through individual-cell broadcasters. Native default range SUM uses RangeColumnSpanSet and NumericCellAccumulator;using a row-major iterator or a flat range listener list would change native ordering and architecture.
