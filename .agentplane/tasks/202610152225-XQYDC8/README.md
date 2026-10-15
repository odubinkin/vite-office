---
id: "202610152225-XQYDC8"
title: "Implement native named item-pool construction and copy for Calc document pools"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T22:25:19.916Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T22:33:12.807Z"
  updated_by: "CODER"
  note: "Command: native-audit.mjs,portable.mjs shared-only/calc-only,source-gates.mjs,build-browser-portable.mjs,final-audit.mjs in output/playwright/task176-checks. Result:pass. Evidence:217related/21files,187Calc/76files;exact2measured shared owners S428/B304/F87/L347 and33Calc S4179/B2731/F821/L3727 all raw counters positive100;13gates;production build,pool-copy Chromium,Writer startup/load/edit. Seven pinned originals,37unchanged method bodies and actual constructor-time Clone query prove native metadata staging/MapCM order. Scope:named/copy pool,Clone,metrics,BC,shutdown gate/cache timing and secondary links. Four refs absent at runtime/restored. Native pool destruction/presentation,ScDocumentPool/document/UI/ODS remain pending;no full all-app run."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T22:33:23.173Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review,not independent: named/copy item-pool contracts preserve metadata categories,virtual Clone construction ordering,metrics,independent BC and once-only shutdown;bounded acceptance passes."
  evaluated_sha: "0a92a1ae83bcf733c884cb65155b35fdeef3d95a"
  blueprint_digest: "a62486181486a75f7613a5c440552c594aebe3ba8d8d31df256f467fb15790f0"
  evidence_refs:
    - ".agentplane/tasks/202610152225-XQYDC8/README.md"
    - ".agentplane/tasks/202610152225-XQYDC8/quality/20261015-223323173-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610152225-XQYDC8/quality/20261015-223323173-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610152225-XQYDC8/quality/20261015-223323173-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610152225-XQYDC8/blueprint/resolved-snapshot.json"
    - "output/playwright/task176-checks/final-verification.json"
    - "output/playwright/task176-checks/native-audit.json"
  findings:
    - "Actual source and regression evidence preserve staging all metadata before item Clone,temporary MapCM before source metric,and virtual secondary Clone after local copies. Seven native blobs pinned and37existing method bodies unchanged. Exact raw coverage ownership and four restored refs checked."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement the approved native named/copy item-pool base required by Calc document pools; preserve original value-category and shutdown notification semantics under GC."
events:
  -
    type: "status"
    at: "2026-10-15T22:25:25.123Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the approved native named/copy item-pool base required by Calc document pools; preserve original value-category and shutdown notification semantics under GC."
  -
    type: "verify"
    at: "2026-10-15T22:33:12.807Z"
    author: "CODER"
    state: "ok"
    note: "Command: native-audit.mjs,portable.mjs shared-only/calc-only,source-gates.mjs,build-browser-portable.mjs,final-audit.mjs in output/playwright/task176-checks. Result:pass. Evidence:217related/21files,187Calc/76files;exact2measured shared owners S428/B304/F87/L347 and33Calc S4179/B2731/F821/L3727 all raw counters positive100;13gates;production build,pool-copy Chromium,Writer startup/load/edit. Seven pinned originals,37unchanged method bodies and actual constructor-time Clone query prove native metadata staging/MapCM order. Scope:named/copy pool,Clone,metrics,BC,shutdown gate/cache timing and secondary links. Four refs absent at runtime/restored. Native pool destruction/presentation,ScDocumentPool/document/UI/ODS remain pending;no full all-app run."
doc_version: 3
doc_updated_at: "2026-10-15T22:33:12.867Z"
doc_updated_by: "CODER"
description: "Task176: actual SfxItemPool name,metric,copy/Clone and shutdown notification contracts required by ScDocumentPool. Reuse actual OUString,SfxBroadcaster and native metadata; GC owns physical lifetimes. No fabricated Calc pool or surrogate/lifetime framework."
sections:
  Summary: "Task176 implements native named/copy item-pool construction,Clone,metric and shutdown notification required before ScDocumentPool can use the shared pool base."
  Scope: "Existing shared itempool source/header; real metadata copy and secondary Clone propagation; native name/metric/BC/shutdown API; focused unit and shared-browser tests; runtime/provenance/capability/readiness/suspected-case inventory. Maximum25non-task files. No fake ScDocumentPool,object-lifetime/cache/refcount/surrogate engine,full presentation implementation or all-app run. Existing no-argument browser constructor remains a declared empty-name adaptation. Browser-only snapshot registry is not native metadata and is not silently promoted to copied native packages."
  Plan: "Audit native name/copy/Clone,metrics and BC/shutdown contracts. Implement in existing shared owner with original metadata category decisions and secondary copy order,using actual shared OUString,MapUnit and SfxBroadcaster. Erase native physical lifetime registries. Test real registered package/value/set/listener graphs and native shutdown timing,reentrant once gate,default metadata classifications and independent copy state. Update truthful inventory and readiness; run declared portable strict100 checks and source/browser gates,review and close task while UI/ODS goal remains active."
  Verify Steps: "Pin original itempool.hxx,itempool.cxx,docpool.cxx and actual notify sources. Verify native scalar/static/dynamic/user metadata copies,original/effective reset,secondary virtual Clone linkage,fresh empty broadcaster and independent range cache,names and metric defaults/changes; actual Dying shutdown exactly once with reentrancy and cache reset after delivery. Use real items,packages,sets and listeners. Run whole Calc plus related shared/Writer tests with exact executable owner raw S/B/F/L100,Writer-only coverage exempt;13source gates,production build,actual shared Chromium plus targeted Writer startup/load/edit. Runtime must pass with four native links absent and restored afterward. Record source quirks without correcting upstream. No native compiler,memory probe or full all-app run."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T22:33:12.807Z — VERIFY — ok

    By: CODER

    Note: Command: native-audit.mjs,portable.mjs shared-only/calc-only,source-gates.mjs,build-browser-portable.mjs,final-audit.mjs in output/playwright/task176-checks. Result:pass. Evidence:217related/21files,187Calc/76files;exact2measured shared owners S428/B304/F87/L347 and33Calc S4179/B2731/F821/L3727 all raw counters positive100;13gates;production build,pool-copy Chromium,Writer startup/load/edit. Seven pinned originals,37unchanged method bodies and actual constructor-time Clone query prove native metadata staging/MapCM order. Scope:named/copy pool,Clone,metrics,BC,shutdown gate/cache timing and secondary links. Four refs absent at runtime/restored. Native pool destruction/presentation,ScDocumentPool/document/UI/ODS remain pending;no full all-app run.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T22:30:15.092Z, excerpt_hash=sha256:de67d360441cf89ea983885951c5e41a70d45f23c422742aa8552d050d6b78f9

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610152225-XQYDC8/blueprint/resolved-snapshot.json
    - old_digest: a62486181486a75f7613a5c440552c594aebe3ba8d8d31df256f467fb15790f0
    - current_digest: a62486181486a75f7613a5c440552c594aebe3ba8d8d31df256f467fb15790f0
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610152225-XQYDC8

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610152225-XQYDC8
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task176 commits; preserve calc branch,unrelated tasks and reference links. No history rewriting or validator/coverage weakening."
  Findings: |-
    - Observation: Initial related run:215passed,1fixture failure. Secondary Clone test called merged native ranges on an unregistered empty child,which violates the existing nonzero range precondition.
      Impact: The test did not establish a valid metadata chain; no production range policy should be relaxed.
      Resolution: Give the actual secondary pool its own registered disjoint package and retain the initial log before rerunning.

    - Observation: TS7 exactOptionalPropertyTypes rejects assigning undefined to the optional test observer callback;runtime scenarios already pass.
      Impact: Required typecheck gate failed in new test code,not application behavior.
      Resolution: Delete the optional callback property at the end of its scope and retain the initial diagnostic.

    - Observation: Inventory requires nonempty upstream test references;the new capability initially declared only source-derived fixtures and an empty upstream test list.
      Impact: Required inventory gate rejects the incomplete evidence schema.
      Resolution: Reference actual SfxBroadcaster listener-count QA as supporting dependency context only;explicitly retain that pool-copy/shutdown fixtures are source-derived and are not a native pool QA suite port.

    - Observation: Review of native initializer and body ordering shows all metadata vectors/maps are copied before virtual item Clone calls,and eDefMetric remains MapCM until the copy loop completes.
      Impact: Incrementally pushing cloned entries and initializing MapTwip would expose different state to legitimate virtual Clone implementations that query the destination pool.
      Resolution: Match native staging exactly:copy current and saved metadata first,then transform their entries;initialize MapCM and set MapTwip only in the ordinary constructor branch;add a concrete dynamic Clone observer for later entries,saved originals and constructor-time metrics.
id_source: "generated"
---
## Summary

Task176 implements native named/copy item-pool construction,Clone,metric and shutdown notification required before ScDocumentPool can use the shared pool base.

## Scope

Existing shared itempool source/header; real metadata copy and secondary Clone propagation; native name/metric/BC/shutdown API; focused unit and shared-browser tests; runtime/provenance/capability/readiness/suspected-case inventory. Maximum25non-task files. No fake ScDocumentPool,object-lifetime/cache/refcount/surrogate engine,full presentation implementation or all-app run. Existing no-argument browser constructor remains a declared empty-name adaptation. Browser-only snapshot registry is not native metadata and is not silently promoted to copied native packages.

## Plan

Audit native name/copy/Clone,metrics and BC/shutdown contracts. Implement in existing shared owner with original metadata category decisions and secondary copy order,using actual shared OUString,MapUnit and SfxBroadcaster. Erase native physical lifetime registries. Test real registered package/value/set/listener graphs and native shutdown timing,reentrant once gate,default metadata classifications and independent copy state. Update truthful inventory and readiness; run declared portable strict100 checks and source/browser gates,review and close task while UI/ODS goal remains active.

## Verify Steps

Pin original itempool.hxx,itempool.cxx,docpool.cxx and actual notify sources. Verify native scalar/static/dynamic/user metadata copies,original/effective reset,secondary virtual Clone linkage,fresh empty broadcaster and independent range cache,names and metric defaults/changes; actual Dying shutdown exactly once with reentrancy and cache reset after delivery. Use real items,packages,sets and listeners. Run whole Calc plus related shared/Writer tests with exact executable owner raw S/B/F/L100,Writer-only coverage exempt;13source gates,production build,actual shared Chromium plus targeted Writer startup/load/edit. Runtime must pass with four native links absent and restored afterward. Record source quirks without correcting upstream. No native compiler,memory probe or full all-app run.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T22:33:12.807Z — VERIFY — ok

By: CODER

Note: Command: native-audit.mjs,portable.mjs shared-only/calc-only,source-gates.mjs,build-browser-portable.mjs,final-audit.mjs in output/playwright/task176-checks. Result:pass. Evidence:217related/21files,187Calc/76files;exact2measured shared owners S428/B304/F87/L347 and33Calc S4179/B2731/F821/L3727 all raw counters positive100;13gates;production build,pool-copy Chromium,Writer startup/load/edit. Seven pinned originals,37unchanged method bodies and actual constructor-time Clone query prove native metadata staging/MapCM order. Scope:named/copy pool,Clone,metrics,BC,shutdown gate/cache timing and secondary links. Four refs absent at runtime/restored. Native pool destruction/presentation,ScDocumentPool/document/UI/ODS remain pending;no full all-app run.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T22:30:15.092Z, excerpt_hash=sha256:de67d360441cf89ea983885951c5e41a70d45f23c422742aa8552d050d6b78f9

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610152225-XQYDC8/blueprint/resolved-snapshot.json
- old_digest: a62486181486a75f7613a5c440552c594aebe3ba8d8d31df256f467fb15790f0
- current_digest: a62486181486a75f7613a5c440552c594aebe3ba8d8d31df256f467fb15790f0
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610152225-XQYDC8

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610152225-XQYDC8
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task176 commits; preserve calc branch,unrelated tasks and reference links. No history rewriting or validator/coverage weakening.

## Findings

- Observation: Initial related run:215passed,1fixture failure. Secondary Clone test called merged native ranges on an unregistered empty child,which violates the existing nonzero range precondition.
  Impact: The test did not establish a valid metadata chain; no production range policy should be relaxed.
  Resolution: Give the actual secondary pool its own registered disjoint package and retain the initial log before rerunning.

- Observation: TS7 exactOptionalPropertyTypes rejects assigning undefined to the optional test observer callback;runtime scenarios already pass.
  Impact: Required typecheck gate failed in new test code,not application behavior.
  Resolution: Delete the optional callback property at the end of its scope and retain the initial diagnostic.

- Observation: Inventory requires nonempty upstream test references;the new capability initially declared only source-derived fixtures and an empty upstream test list.
  Impact: Required inventory gate rejects the incomplete evidence schema.
  Resolution: Reference actual SfxBroadcaster listener-count QA as supporting dependency context only;explicitly retain that pool-copy/shutdown fixtures are source-derived and are not a native pool QA suite port.

- Observation: Review of native initializer and body ordering shows all metadata vectors/maps are copied before virtual item Clone calls,and eDefMetric remains MapCM until the copy loop completes.
  Impact: Incrementally pushing cloned entries and initializing MapTwip would expose different state to legitimate virtual Clone implementations that query the destination pool.
  Resolution: Match native staging exactly:copy current and saved metadata first,then transform their entries;initialize MapCM and set MapTwip only in the ordinary constructor branch;add a concrete dynamic Clone observer for later entries,saved originals and constructor-time metrics.
