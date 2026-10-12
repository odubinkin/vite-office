---
id: "202610120100-JVKWMF"
title: "Implement original binary UNO interface holder"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 10
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-12T01:00:42.540Z"
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
    body: "Start: Port the complete original binary UNO interface holder into existing shared dispatcher and prove whole callback/publication/dispatch behavior over original source."
events:
  -
    type: "status"
    at: "2026-10-12T01:00:42.920Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port the complete original binary UNO interface holder into existing shared dispatcher and prove whole callback/publication/dispatch behavior over original source."
doc_version: 3
doc_updated_at: "2026-10-12T01:00:42.920Z"
doc_updated_by: "CODER"
description: "Task56: port the complete original UnoInterfaceReference from include/uno/dispatcher.hxx into the existing shared dispatcher owner, prerequisite of actual generic exception dispatch. Preserve pointer publication and callback order, no acquisition on transfer, direct argument/exception address forwarding. Whole original native normal/sanitized streams plus portable Calc and complete related shared raw100, registry evidence and independent evaluated implementation. Last full51,next61."
sections:
  Summary: "Implement original UnoInterfaceReference binary interface owner for the shared UNO exception path; reuse existing dispatcher C record, SAL no-acquire tag and real typelib/Any contracts."
  Scope: "Eight intentional implementation/evidence paths: existing cppu/inc/uno/dispatcher.ts; adjacent dispatcher.test.ts and native-dispatcher-cases.json; scripts/uno-dispatcher-native-probe.mjs; existing shared runtime/provenance dispatcher records; one new shared capability record; docs/program/calc-core.md. Active task artifacts and owned ignored validation scripts/logs. No generic exception/mapping/environment provider or class/type inference; no Writer-only repairs, profile weakening or upstream body replacement."
  Plan: "1. Port all UnoInterfaceReference bodies, original callback publication order and null dispatch argument contract into existing shared dispatcher owner. 2. Capture complete original header over full unchanged native dependency units, normal/ASan/UBSan, record source/caller/config hashes and whole streams. 3. Reproduce whole initialized valid ownership/move/self-assignment/dispatch traces with actual JS owner and caller callbacks; no body extraction or providers. 4. Update matching registry records and capability with truthful limited scope, then source-absent Calc and exact task55 shared profile plus complete dispatcher test/owner raw100. 5. Run TS7/scoped static and tooling gates, commit actual implementation before independent EVALUATOR, verify and close clean. Last full51,next61."
  Verify Steps: "1. node scripts/uno-dispatcher-native-probe.mjs --write then --check: complete unchanged original header and all actual native dependency owners normal-ASan/UBSan; all terminal statuses, source/generated/config/caller hashes and whole streams match, no body extraction/providers/unresolved suppression. 2. Calc scoped coverage and exact task55 full related shared argv plus dispatcher.test.ts/dispatcher.ts with all3source links absent together and exact restoration; whole owners raw S/B/F/L100, every counter positive. Whole portable dispatcher stream equal original fixture, publication/self-move/borrowed dispatch argument identity assertions. 3. TS7 app/tools, exact authored lint/format, docs,size,boundaries,provenance/tree,shared+Calc inventory,related tooling tests,routing,doctor,diff. 4. Commit actual reviewed source before EVALUATOR with evaluated_sha equality, recorded ap verify and clean finish. Scope excludes complete exception/mapping/environment/physical ABI/thread/resource/full QA."
  Verification: "Pending original native fixture, portable whole-owner raw coverage, scoped gates and implementation-bound independent evaluation."
  Rollback Plan: "Restore all3source links in finally; revert only intentional task56 code/test/native fixture/registry/docs if necessary, retaining failed logs and unrelated tasks."
  Findings: "Previous goal turn is progress: task55 DONE at b1f2b7834c68, complete original desktop exception evidence and direct-JS shortcut counterexample. The next actual implementation dependency is the original UnoInterfaceReference used directly by getCaughtException. Its clear/set publish the pointer after release, unlike existing C++ Reference; must not reuse an incompatible wrapper or infer identical behavior from final counts."
id_source: "generated"
---
## Summary

Implement original UnoInterfaceReference binary interface owner for the shared UNO exception path; reuse existing dispatcher C record, SAL no-acquire tag and real typelib/Any contracts.

## Scope

Eight intentional implementation/evidence paths: existing cppu/inc/uno/dispatcher.ts; adjacent dispatcher.test.ts and native-dispatcher-cases.json; scripts/uno-dispatcher-native-probe.mjs; existing shared runtime/provenance dispatcher records; one new shared capability record; docs/program/calc-core.md. Active task artifacts and owned ignored validation scripts/logs. No generic exception/mapping/environment provider or class/type inference; no Writer-only repairs, profile weakening or upstream body replacement.

## Plan

1. Port all UnoInterfaceReference bodies, original callback publication order and null dispatch argument contract into existing shared dispatcher owner. 2. Capture complete original header over full unchanged native dependency units, normal/ASan/UBSan, record source/caller/config hashes and whole streams. 3. Reproduce whole initialized valid ownership/move/self-assignment/dispatch traces with actual JS owner and caller callbacks; no body extraction or providers. 4. Update matching registry records and capability with truthful limited scope, then source-absent Calc and exact task55 shared profile plus complete dispatcher test/owner raw100. 5. Run TS7/scoped static and tooling gates, commit actual implementation before independent EVALUATOR, verify and close clean. Last full51,next61.

## Verify Steps

1. node scripts/uno-dispatcher-native-probe.mjs --write then --check: complete unchanged original header and all actual native dependency owners normal-ASan/UBSan; all terminal statuses, source/generated/config/caller hashes and whole streams match, no body extraction/providers/unresolved suppression. 2. Calc scoped coverage and exact task55 full related shared argv plus dispatcher.test.ts/dispatcher.ts with all3source links absent together and exact restoration; whole owners raw S/B/F/L100, every counter positive. Whole portable dispatcher stream equal original fixture, publication/self-move/borrowed dispatch argument identity assertions. 3. TS7 app/tools, exact authored lint/format, docs,size,boundaries,provenance/tree,shared+Calc inventory,related tooling tests,routing,doctor,diff. 4. Commit actual reviewed source before EVALUATOR with evaluated_sha equality, recorded ap verify and clean finish. Scope excludes complete exception/mapping/environment/physical ABI/thread/resource/full QA.

## Verification

Pending original native fixture, portable whole-owner raw coverage, scoped gates and implementation-bound independent evaluation.

## Rollback Plan

Restore all3source links in finally; revert only intentional task56 code/test/native fixture/registry/docs if necessary, retaining failed logs and unrelated tasks.

## Findings

Previous goal turn is progress: task55 DONE at b1f2b7834c68, complete original desktop exception evidence and direct-JS shortcut counterexample. The next actual implementation dependency is the original UnoInterfaceReference used directly by getCaughtException. Its clear/set publish the pointer after release, unlike existing C++ Reference; must not reuse an incompatible wrapper or infer identical behavior from final counts.
