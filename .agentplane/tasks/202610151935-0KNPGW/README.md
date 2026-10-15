---
id: "202610151935-0KNPGW"
title: "Fix generated UNO exception module initialization order"
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
  updated_at: "2026-10-15T19:39:56.504Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T19:47:54.571Z"
  updated_by: "CODER"
  note: "PASS: node output/playwright/task166a-checks/portable.mjs:36 related tests/7files and187 Calc/76files with4 native links absent/restored. Exact2 shared owners S40/B12/F13/L36 and33Calc S4179/B2731/F821/L3727 all raw100. semantic-audit.mjs proves original class/factory token identity and4 native pins. source-gates.mjs initial plus --resume:all13 pass after task166 registered genuine edges. Final evidence output/playwright/task166a-checks/final-verification.json; actual Chromium shared integration also passes. No full-suite milestone or independent review claim."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T19:47:56.067Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review: public generated exception value identity and member bodies preserved; independent first-import paths now initialize correctly."
  evaluated_sha: "f7a078342db3af57d4d19ad861d72b1589575585"
  blueprint_digest: "361e0cf89ab292ee5a758f9a589bf88b05340f1d30376cca63955634fc3ce19a"
  evidence_refs:
    - ".agentplane/tasks/202610151935-0KNPGW/README.md"
    - ".agentplane/tasks/202610151935-0KNPGW/quality/20261015-194756067-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610151935-0KNPGW/quality/20261015-194756067-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610151935-0KNPGW/quality/20261015-194756067-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610151935-0KNPGW/blueprint/resolved-snapshot.json"
    - "output/playwright/task166a-checks/final-verification.json"
    - "output/playwright/task166a-checks/semantic-audit.json"
    - "output/playwright/task166a-checks/source-gates.json"
  findings:
    - "Reviewed base-first shared declaration unit and public reexports; original class/factory token hashes match checkpoint. No new memory manager, type registry or guard cycle exception."
    - "Related36,Calc187,raw100 exact owners,all13 gates and actual browser integration pass. QA pins are source evidence; no new native compilation."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: isolate shared generated exception evaluation order without changing native class member semantics or hiding failures in consumers."
events:
  -
    type: "status"
    at: "2026-10-15T19:39:57.747Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: isolate shared generated exception evaluation order without changing native class member semantics or hiding failures in consumers."
  -
    type: "verify"
    at: "2026-10-15T19:47:54.571Z"
    author: "CODER"
    state: "ok"
    note: "PASS: node output/playwright/task166a-checks/portable.mjs:36 related tests/7files and187 Calc/76files with4 native links absent/restored. Exact2 shared owners S40/B12/F13/L36 and33Calc S4179/B2731/F821/L3727 all raw100. semantic-audit.mjs proves original class/factory token identity and4 native pins. source-gates.mjs initial plus --resume:all13 pass after task166 registered genuine edges. Final evidence output/playwright/task166a-checks/final-verification.json; actual Chromium shared integration also passes. No full-suite milestone or independent review claim."
doc_version: 3
doc_updated_at: "2026-10-15T19:47:54.629Z"
doc_updated_by: "CODER"
description: "Task166a: correct the shared CPPU base/derived exception evaluation cycle exposed by direct Exception import. Keep public module exports, actual class identity, generated fields/member bodies and type factory unchanged; no consumer import-order workaround, prototype/type registry or memory manager."
sections:
  Summary: "Task166a fixes the real shared CPPU Exception-first module evaluation failure blocking task166 uppercase integration. Preserve generated value semantics and public class identity; do not mask the cycle by consumer import order."
  Scope: "Existing cppu/inc/com/sun/star/uno/{Exception,RuntimeException}.ts, a common exception-values.ts initialization unit and exception-initialization.test.ts; their runtime/provenance records; CAP-20d5c31d-598e-444e-b968-1431c43403ed and shared implementation documentation. Task-local ignored evidence/scripts are allowed. No new lifetime engine, type registry, import-cycle exception, native executable or Writer-only coverage remediation. Existing generated class/member and type factory bodies must remain unchanged."
  Plan: "1. Audit the generated native exception declarations and current ESM cycle. 2. Co-locate existing base/derived value definitions in dependency-safe declaration order; retain public reexports and the original generated type factory. 3. Test independent public import entry points plus constructors, copy/move/type identity; reuse existing CPPU and Writer tests. 4. Update truthful source provenance/inventory and prove unchanged class/factory bodies. 5. Run related shared strict raw coverage, whole Calc strict coverage and source gates; commit and same-agent evaluator review, then resume task166. Standing user authorization covers necessary canonical shared corrections. No full suite until actual minimum UI plus ODS milestone."
  Verify Steps: "Run isolated entry-order regression tests and related CPPU/Writer tests through Vitest with native reference symlinks absent/restored. Require raw positive S/B/F/L 100% for changed executable shared owners (RuntimeException and exception-values) and exact measured owner set; Writer-only coverage gaps exempt. Run npm run test:coverage:calc and compare exact 33-owner set. Run task-local source-gates.mjs (format, lint, typecheck, docs, size, dependencies, tree, provenance, parity, routing, doctor, diff, boundary tests). Audit pinned native declarations and unchanged original class/factory bodies. Record source commit, verification and same-agent evaluator evidence; no full all-app test run."
  Verification: |-
    Pending implementation and checks; no passed behavior claim.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T19:47:54.571Z — VERIFY — ok

    By: CODER

    Note: PASS: node output/playwright/task166a-checks/portable.mjs:36 related tests/7files and187 Calc/76files with4 native links absent/restored. Exact2 shared owners S40/B12/F13/L36 and33Calc S4179/B2731/F821/L3727 all raw100. semantic-audit.mjs proves original class/factory token identity and4 native pins. source-gates.mjs initial plus --resume:all13 pass after task166 registered genuine edges. Final evidence output/playwright/task166a-checks/final-verification.json; actual Chromium shared integration also passes. No full-suite milestone or independent review claim.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T19:46:05.498Z, excerpt_hash=sha256:d9c4f76dfffb5a4accbb34eb67168ed85af080b3ea7ca3bc7a9f2f4d55a33a72

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151935-0KNPGW/blueprint/resolved-snapshot.json
    - old_digest: 361e0cf89ab292ee5a758f9a589bf88b05340f1d30376cca63955634fc3ce19a
    - current_digest: 361e0cf89ab292ee5a758f9a589bf88b05340f1d30376cca63955634fc3ce19a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610151935-0KNPGW

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610151935-0KNPGW
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only task166a intentional source/registry/documentation changes through a follow-up task; preserve task166 checkpoint and unrelated tasks. No branch reset or merge."
  Findings: |-
    - Observation: Related36 tests and Calc187 pass with raw100 exact shared owners. Source gates format/lint/typecheck/docs/size pass; repository dependency gate exposes five missing module edges in checkpointed task166 uppercase files, outside this exception correction. Semantic audit reached only a retained-evidence schema lookup error after confirming unchanged class/factory token hashes and native pins.
      Impact: Do not claim complete repository gate acceptance until task166 boundary/provenance work is complete. No CPPU cycle exception or guard relaxation is necessary.
      Resolution: Keep task166a DOING; complete the already-approved task166 metadata/boundary registration and rerun failed/pending gates. Correct ignored evidence lookup to use the retained profile key.

    - Observation: Repository provenance gate requires a nonempty declaration symbol list even for a pure public reexport. The Exception provenance entry had been emptied together with its executable runtime owner list.
      Impact: This is metadata schema rejection; source tests, unchanged class bodies and public identity remain valid.
      Resolution: Keep pure facade runtime localSymbols empty, but restore provenance public declaration names. Apply the same declaration-versus-runtime distinction to task166 charclass header.
id_source: "generated"
---
## Summary

Task166a fixes the real shared CPPU Exception-first module evaluation failure blocking task166 uppercase integration. Preserve generated value semantics and public class identity; do not mask the cycle by consumer import order.

## Scope

Existing cppu/inc/com/sun/star/uno/{Exception,RuntimeException}.ts, a common exception-values.ts initialization unit and exception-initialization.test.ts; their runtime/provenance records; CAP-20d5c31d-598e-444e-b968-1431c43403ed and shared implementation documentation. Task-local ignored evidence/scripts are allowed. No new lifetime engine, type registry, import-cycle exception, native executable or Writer-only coverage remediation. Existing generated class/member and type factory bodies must remain unchanged.

## Plan

1. Audit the generated native exception declarations and current ESM cycle. 2. Co-locate existing base/derived value definitions in dependency-safe declaration order; retain public reexports and the original generated type factory. 3. Test independent public import entry points plus constructors, copy/move/type identity; reuse existing CPPU and Writer tests. 4. Update truthful source provenance/inventory and prove unchanged class/factory bodies. 5. Run related shared strict raw coverage, whole Calc strict coverage and source gates; commit and same-agent evaluator review, then resume task166. Standing user authorization covers necessary canonical shared corrections. No full suite until actual minimum UI plus ODS milestone.

## Verify Steps

Run isolated entry-order regression tests and related CPPU/Writer tests through Vitest with native reference symlinks absent/restored. Require raw positive S/B/F/L 100% for changed executable shared owners (RuntimeException and exception-values) and exact measured owner set; Writer-only coverage gaps exempt. Run npm run test:coverage:calc and compare exact 33-owner set. Run task-local source-gates.mjs (format, lint, typecheck, docs, size, dependencies, tree, provenance, parity, routing, doctor, diff, boundary tests). Audit pinned native declarations and unchanged original class/factory bodies. Record source commit, verification and same-agent evaluator evidence; no full all-app test run.

## Verification

Pending implementation and checks; no passed behavior claim.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T19:47:54.571Z — VERIFY — ok

By: CODER

Note: PASS: node output/playwright/task166a-checks/portable.mjs:36 related tests/7files and187 Calc/76files with4 native links absent/restored. Exact2 shared owners S40/B12/F13/L36 and33Calc S4179/B2731/F821/L3727 all raw100. semantic-audit.mjs proves original class/factory token identity and4 native pins. source-gates.mjs initial plus --resume:all13 pass after task166 registered genuine edges. Final evidence output/playwright/task166a-checks/final-verification.json; actual Chromium shared integration also passes. No full-suite milestone or independent review claim.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T19:46:05.498Z, excerpt_hash=sha256:d9c4f76dfffb5a4accbb34eb67168ed85af080b3ea7ca3bc7a9f2f4d55a33a72

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151935-0KNPGW/blueprint/resolved-snapshot.json
- old_digest: 361e0cf89ab292ee5a758f9a589bf88b05340f1d30376cca63955634fc3ce19a
- current_digest: 361e0cf89ab292ee5a758f9a589bf88b05340f1d30376cca63955634fc3ce19a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610151935-0KNPGW

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610151935-0KNPGW
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only task166a intentional source/registry/documentation changes through a follow-up task; preserve task166 checkpoint and unrelated tasks. No branch reset or merge.

## Findings

- Observation: Related36 tests and Calc187 pass with raw100 exact shared owners. Source gates format/lint/typecheck/docs/size pass; repository dependency gate exposes five missing module edges in checkpointed task166 uppercase files, outside this exception correction. Semantic audit reached only a retained-evidence schema lookup error after confirming unchanged class/factory token hashes and native pins.
  Impact: Do not claim complete repository gate acceptance until task166 boundary/provenance work is complete. No CPPU cycle exception or guard relaxation is necessary.
  Resolution: Keep task166a DOING; complete the already-approved task166 metadata/boundary registration and rerun failed/pending gates. Correct ignored evidence lookup to use the retained profile key.

- Observation: Repository provenance gate requires a nonempty declaration symbol list even for a pure public reexport. The Exception provenance entry had been emptied together with its executable runtime owner list.
  Impact: This is metadata schema rejection; source tests, unchanged class bodies and public identity remain valid.
  Resolution: Keep pure facade runtime localSymbols empty, but restore provenance public declaration names. Apply the same declaration-versus-runtime distinction to task166 charclass header.
