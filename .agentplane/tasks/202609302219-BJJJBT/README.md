---
id: "202609302219-BJJJBT"
title: "Restore native list declaration defaults and ownership"
result_summary: "Supported list contexts now follow pinned ownership, optional defaults, index parsing/skipping and unrelated subtree behavior; wider parity goal remains active."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "numbering"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T22:20:09.847Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T22:38:03.630Z"
  updated_by: "CODER"
  note: "Native list declaration ownership/default/index correction verified: 68 compiled-source comparisons, 620 application /109 inventory /19 browser tests, both suites 100% coverage; all mandatory gates and policy checks pass, two known doctor warnings unchanged."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T22:38:30.064Z"
  updated_by: "EVALUATOR"
  note: "Bounded list declaration ownership/default/index correction follows the pinned sources and passes all unchanged mandatory gates."
  evaluated_sha: "161c65ba40f143d4ea8c876afba674d3cc73be25"
  blueprint_digest: "13b52d9800715dc289bccae19f0ec70544103f67511c977c384b6dc0de1dcb71"
  evidence_refs:
    - ".agentplane/tasks/202609302219-BJJJBT/README.md"
    - ".agentplane/tasks/202609302219-BJJJBT/quality/20260930-223830064-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609302219-BJJJBT/quality/20260930-223830064-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609302219-BJJJBT/quality/20260930-223830064-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609302219-BJJJBT/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609302219-BJJJBT/native-results.json"
    - ".agentplane/tasks/202609302219-BJJJBT/verify.log"
    - "apps/office/src/sw/source/filter/xml/odt-list-declaration-defaults.test.ts"
  findings:
    - "The old callback-owned XMLListStyleContext was removed. xmlnumi now owns source-ordered retained level contexts; invalid indices are skipped before property reads; native optional fields and byte-string parsing are covered independently and through ODT cycles."
commit:
  hash: "161c65ba40f143d4ea8c876afba674d3cc73be25"
  message: "🧩 BJJJBT code: restore native list declaration ownership and defaults"
comments:
  -
    author: "CODER"
    body: "Start: Restore native supported declaration defaults and source-owned list/level contexts under the iterative goal."
  -
    author: "CODER"
    body: "Verified: Restore native list declaration ownership/default/index handling; 68 source comparisons and all mandatory gates pass, clean implementation state."
events:
  -
    type: "status"
    at: "2026-09-30T22:20:10.310Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native supported declaration defaults and source-owned list/level contexts under the iterative goal."
  -
    type: "verify"
    at: "2026-09-30T22:38:03.630Z"
    author: "CODER"
    state: "ok"
    note: "Native list declaration ownership/default/index correction verified: 68 compiled-source comparisons, 620 application /109 inventory /19 browser tests, both suites 100% coverage; all mandatory gates and policy checks pass, two known doctor warnings unchanged."
  -
    type: "status"
    at: "2026-09-30T22:38:45.710Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Restore native list declaration ownership/default/index handling; 68 source comparisons and all mandatory gates pass, clean implementation state."
doc_version: 3
doc_updated_at: "2026-09-30T22:38:45.712Z"
doc_updated_by: "CODER"
description: "Move supported list-style and level declaration ownership to xmlnumi, restore native optional marker/format/level defaults and integer parsing, and ignore unrelated list children while preserving explicit unsupported-family errors."
sections:
  Summary: "Restore pinned optional declaration defaults and xmlnumi ownership for existing Arabic/bullet list styles."
  Scope: "Runtime: xmloff/source/style/xmlnumi.ts and xmlstyle.ts. Matching xmlnumi/context/ODT tests, source provenance/parity metadata and task-local differential evidence. Bounded supporting import/type edits if required to keep the current declaration port coherent. No network, outside-repository access, policy/gate/schema changes or registered save/open/recovery changes."
  Plan: "Retain native list and level context references in xmlnumi, with GetLevel/GetProperties and source-ordered collection. Parse the existing supported Arabic/bullet declarations with native missing-field and byte-string integer behavior; skip missing/out-of-range levels, permit empty/missing bullet marker and missing numeric format, and ignore unrelated child subtrees using an explicit adapter for the current strict SAX dispatcher. Keep image/other numbering families explicitly unsupported. Verify independent native scalar/context source evidence plus literal common/automatic ODT, copy/snapshot and reopen cases. Run all final mandatory gates, record scoped commit and quality, finish the child and keep the parent/goal active."
  Verify Steps: "Run focused xmlnumi/xmlstyle and ODT tests for missing/empty/default marker and numeric format, missing/present/invalid/signed/prefix/overflow level attributes, native context ownership/GetLevel/GetProperties, source order and ignored unrelated children. Produce a compiled primary-source differential probe for byte-string toInt32 and native level normalization, comparing manual context fixtures to local output. Verify literal common/automatic ODT cycles, copying/browser snapshots and native empty-bullet serialization. Run complete npm run verify with required 100% coverage unchanged. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check; record the final clean state and real implementation hash."
  Verification: |-
    Command: npm run verify. Result: pass, exit 0 from terminal exec session 31471. Evidence: 620 application tests across 132 files; 109 inventory tests across 36 files; 19 browser scenarios. Both coverage suites report 100% statements, branches, functions and lines. Format, lint, types, boundaries, Writer resources, static smoke, JSDoc, size, source tree, provenance, invariants and parity all pass; semanticViolationCount=0 covers metadata consistency only. Scope: supported list declaration ownership/default/index/skip behavior and all mandatory regression gates. Command: focused xmlnumi/xmlstyle/ODT run. Result: pass (44 tests, 8 files); final full run covers all subsequent bounded changes. Command: python3 .agentplane/tasks/202609302219-BJJJBT/native-oracle.py followed by npx tsx .agentplane/tasks/202609302219-BJJJBT/compare-native.mts. Result: pass; 34 source integer/normalization cases match both supported families, 68 comparisons. Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass; doctor reports zero errors and the same two pre-existing warnings. Scope: lifecycle and whitespace validation. Final clean state and implementation hash are recorded at closure and in the parent progress entry.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T22:38:03.630Z — VERIFY — ok

    By: CODER

    Note: Native list declaration ownership/default/index correction verified: 68 compiled-source comparisons, 620 application /109 inventory /19 browser tests, both suites 100% coverage; all mandatory gates and policy checks pass, two known doctor warnings unchanged.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T22:38:03.284Z, excerpt_hash=sha256:ec2ed0f6c5c76dbaa15e6b8d80b92500ab3db101b07acd1da8e6a6071ef5b1f7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302219-BJJJBT/blueprint/resolved-snapshot.json
    - old_digest: 13b52d9800715dc289bccae19f0ec70544103f67511c977c384b6dc0de1dcb71
    - current_digest: 13b52d9800715dc289bccae19f0ec70544103f67511c977c384b6dc0de1dcb71
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609302219-BJJJBT

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609302219-BJJJBT
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit after inspecting later numbering corrections; preserve task evidence and intentional browser deviations."
  Findings: |-
    Previous goal turn was progress: child 202609302147-2R4T31 DONE, implementation d8bd6fcc54790da70f365460161ea0307a0a4ce2, parent progress 0c452823d826; no live processes or pending mutations. Preflight confirms clean main/direct with only parent 202609240501-C9TN6M active. Persistent /goal authorizes safe local iterative corrections. Pinned source: libreoffice-26.8.0.2 commit 9bc445578031fecf56086729d8e4940c77e14d65 cached in vendor/libreoffice-reference. xmlnumi.cxx level constructor starts sNumFormat='1', cBullet=0, nLevel=-1; present levels use FastAttributeList/o3tl byte-string integer parsing and normalize nonpositive values to level zero. FillUnoNumRule skips invalid indices and reads only valid level properties. Native list context owns a vector of level references. Local xmlstyle owns marker parsing, requires optional fields and rejects unrelated children. o3tl::toInt32 uses signed64 parsing then returns zero outside signed32; byte-string whitespace is ASCII controls 1..32, not JS Unicode trim. Nonnative global null dispatch remains a separate audit; this task uses a bounded ignore-context adaptation at list owners. Prefix/start/display-level/font/graphics/number-family and wider rule contracts remain unverified.

    - Observation: Focused lint rejected ASCII-control ranges in regex via no-control-regex. The native parser requires control bytes 1..32 as whitespace.
      Impact: The regex-based implementation needs an equivalent source-driven form compatible with existing lint; no gate or semantic requirement should change.
      Resolution: Replace control-range regex trimming with a bounded charCodeAt loop, then parse only the decimal sign/digit prefix. Retain native zero behavior for no digits and signed32 overflow. Rerun lint and focus.

    - Observation: The initial full verification exited 2 at typecheck: inferred fixture unions omitted the optional legacy property on generated cases.
      Impact: Test typing prevented the remaining mandatory gates from running; runtime behavior and approved acceptance criteria are unchanged.
      Resolution: Declare the case table shape explicitly, preserve the initial log, and rerun the entire mandatory npm run verify command.

    - Observation: Source-owned list context now retains level references at creation and reads native GetLevel/GetProperties at publication. Optional Arabic format and zero bullet defaults, absent/out-of-range index skipping, ASCII byte-string integer normalization, unrelated subtree skipping and STYLE_TEXT_PROPERTIES geometry are covered by direct contracts and literal common/automatic ODT export/reopen, clone and snapshot tests.
      Impact: Previously strict or callback-owned supported declarations now follow the bounded pinned xmlnumi contracts. Native extracted integer evidence is independent of local fixtures; full gates do not prove whole-module semantic equivalence.
      Resolution: No scope or acceptance drift and no gate weakening. Keep wider prefix/suffix/start/display-level/font/graphics/number-family/UNO/style identity/global null dispatch and layout/UI obligations open for separate one-task iterations. Registered save/open/recovery deviations remain untouched.
id_source: "generated"
---
## Summary

Restore pinned optional declaration defaults and xmlnumi ownership for existing Arabic/bullet list styles.

## Scope

Runtime: xmloff/source/style/xmlnumi.ts and xmlstyle.ts. Matching xmlnumi/context/ODT tests, source provenance/parity metadata and task-local differential evidence. Bounded supporting import/type edits if required to keep the current declaration port coherent. No network, outside-repository access, policy/gate/schema changes or registered save/open/recovery changes.

## Plan

Retain native list and level context references in xmlnumi, with GetLevel/GetProperties and source-ordered collection. Parse the existing supported Arabic/bullet declarations with native missing-field and byte-string integer behavior; skip missing/out-of-range levels, permit empty/missing bullet marker and missing numeric format, and ignore unrelated child subtrees using an explicit adapter for the current strict SAX dispatcher. Keep image/other numbering families explicitly unsupported. Verify independent native scalar/context source evidence plus literal common/automatic ODT, copy/snapshot and reopen cases. Run all final mandatory gates, record scoped commit and quality, finish the child and keep the parent/goal active.

## Verify Steps

Run focused xmlnumi/xmlstyle and ODT tests for missing/empty/default marker and numeric format, missing/present/invalid/signed/prefix/overflow level attributes, native context ownership/GetLevel/GetProperties, source order and ignored unrelated children. Produce a compiled primary-source differential probe for byte-string toInt32 and native level normalization, comparing manual context fixtures to local output. Verify literal common/automatic ODT cycles, copying/browser snapshots and native empty-bullet serialization. Run complete npm run verify with required 100% coverage unchanged. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check; record the final clean state and real implementation hash.

## Verification

Command: npm run verify. Result: pass, exit 0 from terminal exec session 31471. Evidence: 620 application tests across 132 files; 109 inventory tests across 36 files; 19 browser scenarios. Both coverage suites report 100% statements, branches, functions and lines. Format, lint, types, boundaries, Writer resources, static smoke, JSDoc, size, source tree, provenance, invariants and parity all pass; semanticViolationCount=0 covers metadata consistency only. Scope: supported list declaration ownership/default/index/skip behavior and all mandatory regression gates. Command: focused xmlnumi/xmlstyle/ODT run. Result: pass (44 tests, 8 files); final full run covers all subsequent bounded changes. Command: python3 .agentplane/tasks/202609302219-BJJJBT/native-oracle.py followed by npx tsx .agentplane/tasks/202609302219-BJJJBT/compare-native.mts. Result: pass; 34 source integer/normalization cases match both supported families, 68 comparisons. Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check. Result: pass; doctor reports zero errors and the same two pre-existing warnings. Scope: lifecycle and whitespace validation. Final clean state and implementation hash are recorded at closure and in the parent progress entry.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T22:38:03.630Z — VERIFY — ok

By: CODER

Note: Native list declaration ownership/default/index correction verified: 68 compiled-source comparisons, 620 application /109 inventory /19 browser tests, both suites 100% coverage; all mandatory gates and policy checks pass, two known doctor warnings unchanged.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T22:38:03.284Z, excerpt_hash=sha256:ec2ed0f6c5c76dbaa15e6b8d80b92500ab3db101b07acd1da8e6a6071ef5b1f7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302219-BJJJBT/blueprint/resolved-snapshot.json
- old_digest: 13b52d9800715dc289bccae19f0ec70544103f67511c977c384b6dc0de1dcb71
- current_digest: 13b52d9800715dc289bccae19f0ec70544103f67511c977c384b6dc0de1dcb71
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609302219-BJJJBT

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609302219-BJJJBT
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit after inspecting later numbering corrections; preserve task evidence and intentional browser deviations.

## Findings

Previous goal turn was progress: child 202609302147-2R4T31 DONE, implementation d8bd6fcc54790da70f365460161ea0307a0a4ce2, parent progress 0c452823d826; no live processes or pending mutations. Preflight confirms clean main/direct with only parent 202609240501-C9TN6M active. Persistent /goal authorizes safe local iterative corrections. Pinned source: libreoffice-26.8.0.2 commit 9bc445578031fecf56086729d8e4940c77e14d65 cached in vendor/libreoffice-reference. xmlnumi.cxx level constructor starts sNumFormat='1', cBullet=0, nLevel=-1; present levels use FastAttributeList/o3tl byte-string integer parsing and normalize nonpositive values to level zero. FillUnoNumRule skips invalid indices and reads only valid level properties. Native list context owns a vector of level references. Local xmlstyle owns marker parsing, requires optional fields and rejects unrelated children. o3tl::toInt32 uses signed64 parsing then returns zero outside signed32; byte-string whitespace is ASCII controls 1..32, not JS Unicode trim. Nonnative global null dispatch remains a separate audit; this task uses a bounded ignore-context adaptation at list owners. Prefix/start/display-level/font/graphics/number-family and wider rule contracts remain unverified.

- Observation: Focused lint rejected ASCII-control ranges in regex via no-control-regex. The native parser requires control bytes 1..32 as whitespace.
  Impact: The regex-based implementation needs an equivalent source-driven form compatible with existing lint; no gate or semantic requirement should change.
  Resolution: Replace control-range regex trimming with a bounded charCodeAt loop, then parse only the decimal sign/digit prefix. Retain native zero behavior for no digits and signed32 overflow. Rerun lint and focus.

- Observation: The initial full verification exited 2 at typecheck: inferred fixture unions omitted the optional legacy property on generated cases.
  Impact: Test typing prevented the remaining mandatory gates from running; runtime behavior and approved acceptance criteria are unchanged.
  Resolution: Declare the case table shape explicitly, preserve the initial log, and rerun the entire mandatory npm run verify command.

- Observation: Source-owned list context now retains level references at creation and reads native GetLevel/GetProperties at publication. Optional Arabic format and zero bullet defaults, absent/out-of-range index skipping, ASCII byte-string integer normalization, unrelated subtree skipping and STYLE_TEXT_PROPERTIES geometry are covered by direct contracts and literal common/automatic ODT export/reopen, clone and snapshot tests.
  Impact: Previously strict or callback-owned supported declarations now follow the bounded pinned xmlnumi contracts. Native extracted integer evidence is independent of local fixtures; full gates do not prove whole-module semantic equivalence.
  Resolution: No scope or acceptance drift and no gate weakening. Keep wider prefix/suffix/start/display-level/font/graphics/number-family/UNO/style identity/global null dispatch and layout/UI obligations open for separate one-task iterations. Registered save/open/recovery deviations remain untouched.
