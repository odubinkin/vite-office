---
id: "202610152044-R2GWB4"
title: "Restore native shared Sfx notification contracts for Calc styles"
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
  updated_at: "2026-10-15T20:44:17.349Z"
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
    body: "Start: implement approved native shared notification contracts in calc checkout with source-derived tests and portable verification."
events:
  -
    type: "status"
    at: "2026-10-15T20:44:21.899Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native shared notification contracts in calc checkout with source-derived tests and portable verification."
doc_version: 3
doc_updated_at: "2026-10-15T20:44:21.899Z"
doc_updated_by: "CODER"
description: "Task170: replace bounded generic Sfx notification APIs with pinned native SfxHint, SfxBroadcaster and SfxListener contracts; detach browser payload typing; native QA, strict shared and Calc coverage, related Writer checks, inventory and portable browser evidence."
sections:
  Summary: "Restore native Sfx notification values, reciprocal subscriptions, duplicate handling, mutation order and destruction notification needed by Calc style pools. Standing user authorization covers shared corrections."
  Scope: "Task170: svl/inc/hint.ts; svl/source/notify SfxBroadcaster/lstner and tests; browser payload type separation in Svt and sw/inc/hints; shared runtime/provenance/capability registry; calc readiness documentation; selected shared browser scenario. Maximum 30 intentional non-task files. No native probes, memory manager, full Writer coverage repair or full all-app run."
  Plan: "1. Source-audit pinned hint/broadcaster/listener headers, implementations and five native QA fixtures. 2. Restore SfxHint IDs/value contracts and non-generic Sfx notification graph; isolate existing browser payload typing without runtime changes to Writer/Svt. 3. Test duplicate/copy/mutation/forward/destruction semantics and all raw counters. 4. Update inventory and readiness evidence, run strict shared and all Calc coverage, related Writer functional tests, 13 source gates and production build/selected browser. 5. Commit source, evaluate with explicit same-agent limitation and close task; leave goal active and full-run milestone pending."
  Verify Steps: "Run node output/playwright/task170-checks/native-audit.mjs against pinned sources and five upstream SfxBroadcaster QA fixtures. Run node output/playwright/task170-checks/portable.mjs: all Calc and changed shared owners exact-set raw S/B/F/L100, related Writer functional tests with Writer-only coverage exempt. Run node output/playwright/task170-checks/source-gates.mjs: format, lint, TS7 typecheck, docs, size, dependencies, tree, provenance, inventory, routing, doctor, diff and boundary tests. Run node output/playwright/task170-checks/build-browser-portable.mjs with production build and actual Sfx browser scenario. Keep all reference links absent during runtime verification and restored afterward. Record source pins, raw owner counts, native preconditions and remaining readiness gaps. Full all-app run deferred by user until minimum UI plus ODS milestone."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task170 source and inventory commits; preserve unrelated tasks, user work, calc branch and shared reference links. No branch merges or history rewriting."
  Findings: ""
id_source: "generated"
---
## Summary

Restore native Sfx notification values, reciprocal subscriptions, duplicate handling, mutation order and destruction notification needed by Calc style pools. Standing user authorization covers shared corrections.

## Scope

Task170: svl/inc/hint.ts; svl/source/notify SfxBroadcaster/lstner and tests; browser payload type separation in Svt and sw/inc/hints; shared runtime/provenance/capability registry; calc readiness documentation; selected shared browser scenario. Maximum 30 intentional non-task files. No native probes, memory manager, full Writer coverage repair or full all-app run.

## Plan

1. Source-audit pinned hint/broadcaster/listener headers, implementations and five native QA fixtures. 2. Restore SfxHint IDs/value contracts and non-generic Sfx notification graph; isolate existing browser payload typing without runtime changes to Writer/Svt. 3. Test duplicate/copy/mutation/forward/destruction semantics and all raw counters. 4. Update inventory and readiness evidence, run strict shared and all Calc coverage, related Writer functional tests, 13 source gates and production build/selected browser. 5. Commit source, evaluate with explicit same-agent limitation and close task; leave goal active and full-run milestone pending.

## Verify Steps

Run node output/playwright/task170-checks/native-audit.mjs against pinned sources and five upstream SfxBroadcaster QA fixtures. Run node output/playwright/task170-checks/portable.mjs: all Calc and changed shared owners exact-set raw S/B/F/L100, related Writer functional tests with Writer-only coverage exempt. Run node output/playwright/task170-checks/source-gates.mjs: format, lint, TS7 typecheck, docs, size, dependencies, tree, provenance, inventory, routing, doctor, diff and boundary tests. Run node output/playwright/task170-checks/build-browser-portable.mjs with production build and actual Sfx browser scenario. Keep all reference links absent during runtime verification and restored afterward. Record source pins, raw owner counts, native preconditions and remaining readiness gaps. Full all-app run deferred by user until minimum UI plus ODS milestone.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task170 source and inventory commits; preserve unrelated tasks, user work, calc branch and shared reference links. No branch merges or history rewriting.

## Findings
