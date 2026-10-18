---
id: "202610181503-YCCX41"
title: "Run minimal Calc ODS milestone full regression and pause"
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
  updated_at: "2026-10-18T15:03:44.500Z"
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
    body: "Start:run the user-requested full all-app checkpoint after minimal same-model ODS readiness;classify Writer-only coverage exemption,then pause goal without starting UI."
events:
  -
    type: "status"
    at: "2026-10-18T15:03:44.902Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start:run the user-requested full all-app checkpoint after minimal same-model ODS readiness;classify Writer-only coverage exemption,then pause goal without starting UI."
doc_version: 3
doc_updated_at: "2026-10-18T15:03:44.902Z"
doc_updated_by: "CODER"
description: "Task205:user-requested all-app checkpoint after task204 minimal editable core/basic ODS readiness. Execute full office coverage,inventory,tooling,all browser projects and static checks with all5native references absent. Preserve Writer-only coverage exemption;fix applicable Calc/shared regressions if found. No UI implementation or language detour. After successful applicable checks pause the goal."
sections:
  Summary: "Task205 executes the full all-app regression checkpoint at the minimal Calc core/basic ODS milestone,and then pauses the goal. UI remains a separate future task."
  Scope: "Verification and task evidence only,with all5native reference symlinks absent during all execution and restored afterward. Full office raw coverage,inventory/tooling,all browser projects and static build. Preserve strict Calc/shared raw100 and exact owner audit;Writer-only coverage gaps are explicitly exempt and must not be fixed. Applicable Calc/shared regression fixes,if any,must have concrete causes and task-local evidence;no feature expansion or UI. No network or native execution. Keep calc branch and this checkout."
  Plan: "1.Execute the full all-app verification once at the actual minimal core/ODS milestone,without native source references. 2.Classify failures from retained logs/raw coverage;exempt only Writer coverage gaps and correct applicable regressions within approved scope. 3.Record exact results and same-agent quality review,finish checkpoint,and pause the goal. No UI work."
  Verify Steps: |-
    python3 output/playwright/task205-checks/full-run.py: execute npm run test:coverage -- --coverage.reportOnFailure=true; npm run test:inventory:coverage; npm run test:tooling; npm run test:e2e; npm run test:static,with all5native links absent/restored. Retain complete logs and exit manifests.
    node output/playwright/task205-checks/final-audit.mjs: inspect actual test outcomes/raw counters,accept only Writer-only coverage exception,confirm Calc/shared exact owners and all5links restored,scope/hashes/clean tracked state.
    ap doctor and node .agentplane/policy/check-routing.mjs;record verification,commit task evidence,same-agent quality review,finish;then pause the existing goal as explicitly requested.
  Verification: "Pending full checkpoint. Task204 already passed whole Calc227cases/raw100,related463cases,build+7Calc browser/Worker cases and13source gates."
  Rollback Plan: "No production changes planned. Revert only task205 evidence if needed;restore all5reference symlinks in finally. Preserve all prior Calc/Writer work;no merge."
  Findings: "User explicitly requested full run at minimum readiness,then goal pause,and separately confirmed UI must not be implemented here. Task204 source ca72d59c6fa8/close584100e09d29 reached content-only scalar/local-formula ODS milestone. Standing authorization covers this checkpoint. Deferred language task197 and unrelated active Writer tasks remain untouched."
id_source: "generated"
---
## Summary

Task205 executes the full all-app regression checkpoint at the minimal Calc core/basic ODS milestone,and then pauses the goal. UI remains a separate future task.

## Scope

Verification and task evidence only,with all5native reference symlinks absent during all execution and restored afterward. Full office raw coverage,inventory/tooling,all browser projects and static build. Preserve strict Calc/shared raw100 and exact owner audit;Writer-only coverage gaps are explicitly exempt and must not be fixed. Applicable Calc/shared regression fixes,if any,must have concrete causes and task-local evidence;no feature expansion or UI. No network or native execution. Keep calc branch and this checkout.

## Plan

1.Execute the full all-app verification once at the actual minimal core/ODS milestone,without native source references. 2.Classify failures from retained logs/raw coverage;exempt only Writer coverage gaps and correct applicable regressions within approved scope. 3.Record exact results and same-agent quality review,finish checkpoint,and pause the goal. No UI work.

## Verify Steps

python3 output/playwright/task205-checks/full-run.py: execute npm run test:coverage -- --coverage.reportOnFailure=true; npm run test:inventory:coverage; npm run test:tooling; npm run test:e2e; npm run test:static,with all5native links absent/restored. Retain complete logs and exit manifests.
node output/playwright/task205-checks/final-audit.mjs: inspect actual test outcomes/raw counters,accept only Writer-only coverage exception,confirm Calc/shared exact owners and all5links restored,scope/hashes/clean tracked state.
ap doctor and node .agentplane/policy/check-routing.mjs;record verification,commit task evidence,same-agent quality review,finish;then pause the existing goal as explicitly requested.

## Verification

Pending full checkpoint. Task204 already passed whole Calc227cases/raw100,related463cases,build+7Calc browser/Worker cases and13source gates.

## Rollback Plan

No production changes planned. Revert only task205 evidence if needed;restore all5reference symlinks in finally. Preserve all prior Calc/Writer work;no merge.

## Findings

User explicitly requested full run at minimum readiness,then goal pause,and separately confirmed UI must not be implemented here. Task204 source ca72d59c6fa8/close584100e09d29 reached content-only scalar/local-formula ODS milestone. Standing authorization covers this checkpoint. Deferred language task197 and unrelated active Writer tasks remain untouched.
