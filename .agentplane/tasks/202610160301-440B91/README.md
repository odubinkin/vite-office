---
id: "202610160301-440B91"
title: "Audit native Intl language tag behavior for Calc font prerequisites"
result_summary: "verified-202610160301-440B91"
status: "DONE"
priority: "high"
owner: "CODER"
revision: 16
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "intl-audit"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-16T03:02:16.385Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-16T03:12:42.853Z"
  updated_by: "CODER"
  note: "verified-202610160301-440B91"
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-16T03:12:26.181Z"
  updated_by: "EVALUATOR"
  note: "Same-agent source/evidence review passes the native JS suitability audit;not an independent review."
  evaluated_sha: "b5f2a19cb3c8048fab1bf5faa48d7452cb6dc577"
  blueprint_digest: "00c70046283ce4c1c890d0ad25d1a1c36f72ea2ea0b4797c27316613022d867b"
  evidence_refs:
    - ".agentplane/tasks/202610160301-440B91/README.md"
    - ".agentplane/tasks/202610160301-440B91/quality/20261016-031226181-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610160301-440B91/quality/20261016-031226181-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610160301-440B91/quality/20261016-031226181-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610160301-440B91/blueprint/resolved-snapshot.json"
    - "output/playwright/task189-checks/final-verification.json"
  findings:
    - "Fixture preserves29pinned source expectations including stored first output and invalid string preservation;source audit resolves values/anchors/hashes rather than claiming native execution.Actual Node/Chromium/Worker evidence disproves direct Intl/minimize replacement without requiring a whole library port.16audit/196Calc exact36 raw100,13gates,production build/browser pass;4refs restored.No production owner,policy,guard or inventory changes;full LanguageTag/font/pool/document/UI/ODS remain pending."
commit:
  hash: "373157f364e8ffff11131792183287dce2fa7de7"
  message: "✅ 440B91 quality: record native Intl audit verification"
comments:
  -
    author: "CODER"
    body: "Start: audit native JS language tag normalization against pinned upstream QA and source branches before implementing LanguageTag for actual Calc font defaults. No production fake or library port."
  -
    author: "CODER"
    body: "Verified: verified-202610160301-440B91. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
events:
  -
    type: "status"
    at: "2026-10-16T03:02:27.515Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: audit native JS language tag normalization against pinned upstream QA and source branches before implementing LanguageTag for actual Calc font defaults. No production fake or library port."
  -
    type: "verify"
    at: "2026-10-16T03:12:25.557Z"
    author: "CODER"
    state: "ok"
    note: "29native source QA cases/5pins validated;Node24/Chromium151/DOM-free Worker agree on measured Intl results.Direct APIs15matches,8rejections,6successful differences;minimize10matches.No blanket native JS parity.16audit/196Calc exact36owners raw S4310/B2777/F864/L3857 all100,13gates,build/browser pass,4refs restored.6intentional test/docs paths,no production or inventory/capability claim changes,no all-app run. UI/ODS pending."
  -
    type: "verify"
    at: "2026-10-16T03:12:42.853Z"
    author: "CODER"
    state: "ok"
    note: "verified-202610160301-440B91"
  -
    type: "status"
    at: "2026-10-16T03:12:42.999Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: verified-202610160301-440B91. Guided shortcut recorded verification and is closing the direct task with traceable commit metadata."
doc_version: 3
doc_updated_at: "2026-10-16T03:13:34.122Z"
doc_updated_by: "CODER"
description: "Task189: compare Intl.Locale/getCanonicalLocales against pinned LibreOffice LanguageTag QA and native fast-path contracts in Node, Chromium and a DOM-free Worker; record exact mismatches and next implementation boundary without ICU/liblangtag or a fake LanguageTag."
sections:
  Summary: "Audit native JavaScript language tag normalization against pinned LibreOffice LanguageTag requirements before choosing the implementation used by Font and Calc defaults. Standing user approval covers required core preparation and explicitly prefers verified native JS over new library ports."
  Scope: "Only branch calc in vite-office-calc. Add a source-anchored QA fixture, reproducible Node/Chromium/Worker comparisons, a Calc-specific audit document and the readiness decision. No production owner changes, ICU/liblangtag/native compiler, memory ownership engine, policy/guard modifications or full all-app run. Maximum 12 intentional non-task files. Upstream QA expectations are static source evidence, not measurements of a running LibreOffice binary."
  Plan: "Audit pinned native LanguageTag QA against real Intl APIs across Node/Chromium/Worker; retain source-anchored fixture and honest parity limits; no runtime fake or library port. Run Calc strict raw coverage and scoped checks then close evidence task; full goal remains active."
  Verify Steps: |-
    - node output/playwright/task189-checks/native-audit.mjs: pinned source hashes, exact constructor/assertion anchors and no production owner changes.
    - node output/playwright/task189-checks/portable.mjs: audit unit scenarios and whole Calc with four source links absent/restored; all Calc raw S/B/F/L counters positive and exact existing 36 owners.
    - node output/playwright/task189-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker audit with four source links absent/restored; no fake production language service.
    - node output/playwright/task189-checks/source-gates.mjs: format, lint, typecheck, docs, size, dependencies, source tree/provenance, inventory, routing, doctor and diff.
    - node output/playwright/task189-checks/final-audit.mjs: exact fixture/source observations, bounded changed paths, clean source references and no implementation changes. Source commit, recorded verify and same-agent EVALUATOR review before finish.
  Verification: |-
    Command: node output/playwright/task189-checks/native-audit.mjs. Result: pass. Evidence:29 exact source constructor/assertion/value/block/line checks,5 pinned native source hashes,no native binary run,production unchanged from764fab782c89. Scope:static native QA/Font/core prerequisite contracts. Command: node output/playwright/task189-checks/portable.mjs. Result:pass. Evidence:16audit scenarios and196Calc/78files,exact36Calc owners raw S4310/B2777/F864/L3857 all100 with every counter positive;four source links absent and restored. No changed shared runtime owner,so no new shared coverage owner. Command: node output/playwright/task189-checks/browser-portable.mjs then --browser-only after JSON import fix. Result:pass. Evidence:production build successful;Chromium151 and actual DOM-free Worker match Node24 on29cases;direct API15matches/8rejections/6different successful strings,minimize10matches;source-preserved invalid string is distinct from validity acceptance. Four references restored. Command: node output/playwright/task189-checks/source-gates.mjs with documented repair/resume. Result:13gates pass. Scope:format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries. Final exact-path evidence and same-agent quality review follow. Production kernel and inventories unchanged;no new capability claim,ICU/liblangtag port,memory engine,Writer change or all-app run. UI/ODS remain pending;goal stays active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-16T03:12:25.557Z — VERIFY — ok

    By: CODER

    Note: 29native source QA cases/5pins validated;Node24/Chromium151/DOM-free Worker agree on measured Intl results.Direct APIs15matches,8rejections,6successful differences;minimize10matches.No blanket native JS parity.16audit/196Calc exact36owners raw S4310/B2777/F864/L3857 all100,13gates,build/browser pass,4refs restored.6intentional test/docs paths,no production or inventory/capability claim changes,no all-app run. UI/ODS pending.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T03:11:32.467Z, excerpt_hash=sha256:8f4223bc53d2de41c80d5cecf9f23140733e4cdfca2c19aa212787b6bf1fd236

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160301-440B91/blueprint/resolved-snapshot.json
    - old_digest: 00c70046283ce4c1c890d0ad25d1a1c36f72ea2ea0b4797c27316613022d867b
    - current_digest: 00c70046283ce4c1c890d0ad25d1a1c36f72ea2ea0b4797c27316613022d867b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160301-440B91

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610160301-440B91
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    ### 2026-10-16T03:12:42.853Z — VERIFY — ok

    By: CODER

    Note: verified-202610160301-440B91
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T03:12:25.621Z, excerpt_hash=sha256:8f4223bc53d2de41c80d5cecf9f23140733e4cdfca2c19aa212787b6bf1fd236

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160301-440B91/blueprint/resolved-snapshot.json
    - old_digest: 00c70046283ce4c1c890d0ad25d1a1c36f72ea2ea0b4797c27316613022d867b
    - current_digest: 00c70046283ce4c1c890d0ad25d1a1c36f72ea2ea0b4797c27316613022d867b
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610160301-440B91

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task complete 202610160301-440B91 --result verified-202610160301-440B91 --commit 373157f364e8ffff11131792183287dce2fa7de7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task source commit and associated docs/fixtures/tests; retain historical task evidence. Do not reset user work or touch unrelated active tasks."
  Findings: |-
    Initial task-new attempt used two primary tags and was rejected before task creation; corrected to one primary code tag, with intl-audit secondary. No source mutation occurred before this executable task.

    - Observation: Fixture extraction found 28 direct getter assertions; first de-Latn-DE case asserts a previously stored aBcp47 value. Expected count29 check correctly stopped before writing fixture. Test scaffolding was inadvertently written after the failed independent extraction in the same tool orchestration.
      Impact: No production changes; fixture must include the stored-value source case explicitly and dependent tool mutations must wait for observed success.
      Resolution: Refresh route, add the exact stored getBcp47 assignment and assertion as native evidence, then validate all29 source blocks before running tests.

    - Observation: Prettier was invoked with repo-relative paths from apps/office and found no files; subsequent independent unit run passed16 scenarios.
      Impact: No formatting was applied by that invocation; no production owner changed.
      Resolution: Run formatting from explicit repository root and retain16 passing Node audit scenarios.

    - Observation: Production build passed; Playwright loader rejected bare JSON fixture import because Node24 ESM requires a JSON import attribute, so no browser scenarios executed.
      Impact: No browser parity evidence yet; all four source-reference links restored by finally. Unit and Calc coverage already passed.
      Resolution: Use standard JSON import attribute in the audit spec and rerun only failed browser stage against the already successful unchanged build.

    - Observation: Scoped lint rejected the test-only IntlTagResult exported type because it lacked JSDoc.
      Impact: Runtime audits pass; source gate remains incomplete.
      Resolution: Add the required type documentation and resume source gates without rerunning unchanged runtime behavior.

    - Observation: JSDoc gate requires documentation on test describe/map/find callbacks as well as exported helpers;16 short audit callbacks were missing it.
      Impact: Only documentation gate incomplete; no behavior or parity result changes.
      Resolution: Document each test callback at its declaration and resume source gates; keep existing runtime results because edits are comments only.

    - Observation: Route task-complete marked DONE but its generated generic result produced a closure subject rejected by commit guard. Repeating finish on DONE is refused; --close and explicit -m are mutually exclusive.
      Impact: Implementation and quality commits remain verified;only completed-task artifacts await persistence. No force or guard change is warranted.
      Resolution: Persist completed-task artifacts with the canonical ordinary ap commit allow-tasks command and an informative closure subject,then recompute route and inspect clean status.
extensions:
  implementation_commit:
    hash: "b5f2a19cb3c8048fab1bf5faa48d7452cb6dc577"
    message: "🔬 440B91 calc: audit native Intl against LanguageTag contracts"
id_source: "generated"
---
## Summary

Audit native JavaScript language tag normalization against pinned LibreOffice LanguageTag requirements before choosing the implementation used by Font and Calc defaults. Standing user approval covers required core preparation and explicitly prefers verified native JS over new library ports.

## Scope

Only branch calc in vite-office-calc. Add a source-anchored QA fixture, reproducible Node/Chromium/Worker comparisons, a Calc-specific audit document and the readiness decision. No production owner changes, ICU/liblangtag/native compiler, memory ownership engine, policy/guard modifications or full all-app run. Maximum 12 intentional non-task files. Upstream QA expectations are static source evidence, not measurements of a running LibreOffice binary.

## Plan

Audit pinned native LanguageTag QA against real Intl APIs across Node/Chromium/Worker; retain source-anchored fixture and honest parity limits; no runtime fake or library port. Run Calc strict raw coverage and scoped checks then close evidence task; full goal remains active.

## Verify Steps

- node output/playwright/task189-checks/native-audit.mjs: pinned source hashes, exact constructor/assertion anchors and no production owner changes.
- node output/playwright/task189-checks/portable.mjs: audit unit scenarios and whole Calc with four source links absent/restored; all Calc raw S/B/F/L counters positive and exact existing 36 owners.
- node output/playwright/task189-checks/browser-portable.mjs: production build and actual Chromium/DOM-free Worker audit with four source links absent/restored; no fake production language service.
- node output/playwright/task189-checks/source-gates.mjs: format, lint, typecheck, docs, size, dependencies, source tree/provenance, inventory, routing, doctor and diff.
- node output/playwright/task189-checks/final-audit.mjs: exact fixture/source observations, bounded changed paths, clean source references and no implementation changes. Source commit, recorded verify and same-agent EVALUATOR review before finish.

## Verification

Command: node output/playwright/task189-checks/native-audit.mjs. Result: pass. Evidence:29 exact source constructor/assertion/value/block/line checks,5 pinned native source hashes,no native binary run,production unchanged from764fab782c89. Scope:static native QA/Font/core prerequisite contracts. Command: node output/playwright/task189-checks/portable.mjs. Result:pass. Evidence:16audit scenarios and196Calc/78files,exact36Calc owners raw S4310/B2777/F864/L3857 all100 with every counter positive;four source links absent and restored. No changed shared runtime owner,so no new shared coverage owner. Command: node output/playwright/task189-checks/browser-portable.mjs then --browser-only after JSON import fix. Result:pass. Evidence:production build successful;Chromium151 and actual DOM-free Worker match Node24 on29cases;direct API15matches/8rejections/6different successful strings,minimize10matches;source-preserved invalid string is distinct from validity acceptance. Four references restored. Command: node output/playwright/task189-checks/source-gates.mjs with documented repair/resume. Result:13gates pass. Scope:format/lint/typecheck/docs/size/dependencies/tree/provenance/inventory/routing/doctor/diff/boundaries. Final exact-path evidence and same-agent quality review follow. Production kernel and inventories unchanged;no new capability claim,ICU/liblangtag port,memory engine,Writer change or all-app run. UI/ODS remain pending;goal stays active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-16T03:12:25.557Z — VERIFY — ok

By: CODER

Note: 29native source QA cases/5pins validated;Node24/Chromium151/DOM-free Worker agree on measured Intl results.Direct APIs15matches,8rejections,6successful differences;minimize10matches.No blanket native JS parity.16audit/196Calc exact36owners raw S4310/B2777/F864/L3857 all100,13gates,build/browser pass,4refs restored.6intentional test/docs paths,no production or inventory/capability claim changes,no all-app run. UI/ODS pending.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T03:11:32.467Z, excerpt_hash=sha256:8f4223bc53d2de41c80d5cecf9f23140733e4cdfca2c19aa212787b6bf1fd236

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160301-440B91/blueprint/resolved-snapshot.json
- old_digest: 00c70046283ce4c1c890d0ad25d1a1c36f72ea2ea0b4797c27316613022d867b
- current_digest: 00c70046283ce4c1c890d0ad25d1a1c36f72ea2ea0b4797c27316613022d867b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160301-440B91

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610160301-440B91
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

### 2026-10-16T03:12:42.853Z — VERIFY — ok

By: CODER

Note: verified-202610160301-440B91
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-16T03:12:25.621Z, excerpt_hash=sha256:8f4223bc53d2de41c80d5cecf9f23140733e4cdfca2c19aa212787b6bf1fd236

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610160301-440B91/blueprint/resolved-snapshot.json
- old_digest: 00c70046283ce4c1c890d0ad25d1a1c36f72ea2ea0b4797c27316613022d867b
- current_digest: 00c70046283ce4c1c890d0ad25d1a1c36f72ea2ea0b4797c27316613022d867b
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610160301-440B91

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task complete 202610160301-440B91 --result verified-202610160301-440B91 --commit 373157f364e8ffff11131792183287dce2fa7de7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task source commit and associated docs/fixtures/tests; retain historical task evidence. Do not reset user work or touch unrelated active tasks.

## Findings

Initial task-new attempt used two primary tags and was rejected before task creation; corrected to one primary code tag, with intl-audit secondary. No source mutation occurred before this executable task.

- Observation: Fixture extraction found 28 direct getter assertions; first de-Latn-DE case asserts a previously stored aBcp47 value. Expected count29 check correctly stopped before writing fixture. Test scaffolding was inadvertently written after the failed independent extraction in the same tool orchestration.
  Impact: No production changes; fixture must include the stored-value source case explicitly and dependent tool mutations must wait for observed success.
  Resolution: Refresh route, add the exact stored getBcp47 assignment and assertion as native evidence, then validate all29 source blocks before running tests.

- Observation: Prettier was invoked with repo-relative paths from apps/office and found no files; subsequent independent unit run passed16 scenarios.
  Impact: No formatting was applied by that invocation; no production owner changed.
  Resolution: Run formatting from explicit repository root and retain16 passing Node audit scenarios.

- Observation: Production build passed; Playwright loader rejected bare JSON fixture import because Node24 ESM requires a JSON import attribute, so no browser scenarios executed.
  Impact: No browser parity evidence yet; all four source-reference links restored by finally. Unit and Calc coverage already passed.
  Resolution: Use standard JSON import attribute in the audit spec and rerun only failed browser stage against the already successful unchanged build.

- Observation: Scoped lint rejected the test-only IntlTagResult exported type because it lacked JSDoc.
  Impact: Runtime audits pass; source gate remains incomplete.
  Resolution: Add the required type documentation and resume source gates without rerunning unchanged runtime behavior.

- Observation: JSDoc gate requires documentation on test describe/map/find callbacks as well as exported helpers;16 short audit callbacks were missing it.
  Impact: Only documentation gate incomplete; no behavior or parity result changes.
  Resolution: Document each test callback at its declaration and resume source gates; keep existing runtime results because edits are comments only.

- Observation: Route task-complete marked DONE but its generated generic result produced a closure subject rejected by commit guard. Repeating finish on DONE is refused; --close and explicit -m are mutually exclusive.
  Impact: Implementation and quality commits remain verified;only completed-task artifacts await persistence. No force or guard change is warranted.
  Resolution: Persist completed-task artifacts with the canonical ordinary ap commit allow-tasks command and an informative closure subject,then recompute route and inspect clean status.
