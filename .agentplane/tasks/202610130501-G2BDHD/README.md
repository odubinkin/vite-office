---
id: "202610130501-G2BDHD"
title: "Replace Boost token ownership with native JavaScript references"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 14
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
  - "shared"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T05:03:53.514Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-13T05:48:25.633Z"
  updated_by: "CODER"
  note: "Verified: user-authorized native JS token references remove Boost and token ownership hooks atdf1dc1a89f35456ca3170c731dce33324e2e78c2. Calc125/shared242 whole raw100 every counter positive, original semantic projections/aliases/clone behavior, unchanged fixtures, source-absent build/profile0UI and16final gates/36tooling/123inventory pass. Exact3197hashes and same-agent separate EVALUATOR pass; legacy shared-value cleanup unchanged, main goal remains paused."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-13T05:46:45.923Z"
  updated_by: "EVALUATOR"
  note: "Same-agent separate EVALUATOR passes exact GC-first token adaptationdf1dc1a89f35456ca3170c731dce33324e2e78c2; user explicitly overrides C++ token memory management. No independent review or global shared-value lifetime migration claim."
  evaluated_sha: "df1dc1a89f35456ca3170c731dce33324e2e78c2"
  blueprint_digest: "40e9efb9cff6ab0b0201902da131f10a1ef52857c696cfa38d6f6bc4a4b76aa9"
  evidence_refs:
    - ".agentplane/tasks/202610130501-G2BDHD/README.md"
    - ".agentplane/tasks/202610130501-G2BDHD/quality/20261013-054645923-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610130501-G2BDHD/quality/20261013-054645923-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610130501-G2BDHD/quality/20261013-054645923-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610130501-G2BDHD/blueprint/resolved-snapshot.json"
    - "output/playwright/task82-checks/exact-review.json"
    - "output/playwright/task82-checks/final-source-hashes.json"
    - "output/playwright/task82-checks/value-coverage-audit.json"
    - "output/playwright/task82-checks/gates-results.json"
    - "output/playwright/task82-checks/first-gates-results.json"
    - "docs/program/calc-browser-gc-adaptation.md"
  findings:
    - "All3197current non-task source/test/fixture/config/doc hashes match exact committed blobs;42intentional paths include5removed Boost source/license/mechanism records. FormulaToken references are type-only nullable JS aliases, FAP holds its actual original token directly, token counters/policies/atomic/ADL/delete hooks and replacement managers/finalizers absent."
    - "Token semantic constructors/opcodes/type/equality and payload clones remain original-shaped. Live JS aliases and FAP clone identity/independent numeric payload regressions pass. Original native fixtures byte-identical to pre-task baseline; only C++ token count/policy columns are explicitly projected away, no native lifetime equality or GC timing assertions."
    - "Entire Calc125tests36files and whole affected shared242tests48files39executable owners raw S/B/F/L100 every counter positive: Calc3080S2092B526F2721L, shared4028S2063B829F3611L. Four links absent/restored, static build and Calc profile0UI pass."
    - "All16final gates pass including36tooling tests10files and123inventory tests38files configured coverage100. Current metadata declares browser adaptation and drops Boost capability; stale parent compiler/header evidence and external-edge regression migrated without changing compiler runtime or Writer/shared-string implementation. Initial failure artifacts retained."
    - "Existing SAL/SVL value cleanup remains a separate unchanged legacy boundary; FAP cleanup never cascades into original token. Future unported GetRef cache/mutation algorithms need semantic adaptation. Main goal remains paused, full81 not repeated and no complete Calc/document/UI claim."
commit:
  hash: "df1dc1a89f35456ca3170c731dce33324e2e78c2"
  message: "🧹 G2BDHD calc: replace Boost token ownership with native JS references"
comments:
  -
    author: "CODER"
    body: "Start: explicit user GC-first correction, remove Boost/token memory ownership and preserve plain JS token alias/clone semantics. Whole Calc/affected shared raw100, accurate browser adaptation inventory and exact review; main goal remains paused."
  -
    author: "CODER"
    body: "Implementation: native JS token references committed atdf1dc1a89f35; Boost/token ownership hooks removed, entire Calc125/shared242 raw100 and16final gates pass. Original fixtures unchanged, user-authorized GC adaptation inventoried; same-agent separate EVALUATOR follows, main goal remains paused."
events:
  -
    type: "status"
    at: "2026-10-13T05:04:07.207Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: explicit user GC-first correction, remove Boost/token memory ownership and preserve plain JS token alias/clone semantics. Whole Calc/affected shared raw100, accurate browser adaptation inventory and exact review; main goal remains paused."
  -
    type: "status"
    at: "2026-10-13T05:44:10.285Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Implementation: native JS token references committed atdf1dc1a89f35; Boost/token ownership hooks removed, entire Calc125/shared242 raw100 and16final gates pass. Original fixtures unchanged, user-authorized GC adaptation inventoried; same-agent separate EVALUATOR follows, main goal remains paused."
  -
    type: "verify"
    at: "2026-10-13T05:48:25.633Z"
    author: "CODER"
    state: "ok"
    note: "Verified: user-authorized native JS token references remove Boost and token ownership hooks atdf1dc1a89f35456ca3170c731dce33324e2e78c2. Calc125/shared242 whole raw100 every counter positive, original semantic projections/aliases/clone behavior, unchanged fixtures, source-absent build/profile0UI and16final gates/36tooling/123inventory pass. Exact3197hashes and same-agent separate EVALUATOR pass; legacy shared-value cleanup unchanged, main goal remains paused."
doc_version: 3
doc_updated_at: "2026-10-13T05:48:25.710Z"
doc_updated_by: "CODER"
description: "Explicit user correction: remove Boost intrusive_ptr runtime and token retain/release/delete counters, use ordinary JS references for FormulaTokenRef/FormulaConstTokenRef and FAP. Preserve token identity/cloning/semantic values, retain existing shared value cleanup API where needed without token ownership hooks; no GC finalizers/refcount engine. Migrate native tests to explicit semantic projections, update current inventory/deviation docs and verify whole Calc/affected shared raw100. Main goal remains paused."
sections:
  Summary: "Replace the unnecessary Boost intrusive_ptr runtime and FormulaToken memory counters with JavaScript references under the user's explicit GC-first correction. The main Calc goal remains paused."
  Scope: "Only calc checkout/branch. Remove external Boost intrusive_ptr source and unused license plus its current runtime/provenance/capability records. Adapt formula/inc/types and token exports/enums, FormulaToken base, FormulaFAPToken reference field and Calc token clone documentation. Migrate the three directly affected formula/Calc test files, preserving unmodified native captures and semantic value/identity coverage. Update current formula/Calc runtime/provenance/capability evidence, calc-core and a focused browser-GC deviation document; related module boundary rule if its Boost import edge exists. Existing shared string/SAL value owners and their explicit value cleanup remain unchanged: this task removes token memory management, not an unrelated Writer/shared-string migration."
  Plan: "Replace Boost/token ownership counters with ordinary JS references under explicit user authorization, preserve semantic alias/clone/value behavior and current shared value cleanup boundary. Migrate semantic native projections and current inventory/deviation records, whole Calc/affected shared raw100 and gates/exact review, main goal stays paused."
  Verify Steps: |-
    1. Targeted three complete formula/inc/token, native-token and sc/core/tool/token tests: semantic native field projections against unmodified captured original fixtures, explicit JS alias/FAP clone independence and no premature destruction; no native refcount or GC timing assertions.
    2. node output/playwright/task82-checks/portable.mjs: entire Calc and whole directly affected shared formula/SAL/SharedString owners/tests raw S/B/F/L100 with every raw counter positive; four reference links absent/restored, static build and Calc browser profile.
    3. node output/playwright/task82-checks/gates.mjs: format/lint/type/docs/size/dependencies/resources/tree/provenance/registry/invariants/routing/doctor/diff and directly affected complete tooling/inventory validation tests.
    4. No executable Boost imports or token retain/release/delete hooks; direct FAP references and actual clone/alias behavior verified. Exact runtime/test/config/fixture hashes tied to commit, user-authorized browser adaptation accurately documented and inventoried; original native fixtures unchanged; same-agent separate EVALUATOR, authoritative DONE and clean all-files git status. No full-suite rerun after cycle81, main goal remains paused.
  Verification: |-
    Command: complete targeted and whole scoped tests. Result: pass. Evidence:17targeted semantic tests; whole Calc125tests36files raw3080S2092B526F2721L and shared242tests48files39executable owners raw4028S2063B829F3611L, S/B/F/L100 every raw counter positive. Original native fixtures unchanged versus2c9f64d49ecb, classification/stack/constructor/empty/hybrid compare explicit semantic projections omitting only C++ token count/policy; live-alias/FAP clone identity and independent payload behavior pass. Scope: ordinary JS references replace native token memory management, existing shared-value cleanup remains unchanged. Command: node output/playwright/task82-checks/portable.mjs. Result: pass, four links absent/restored, static build and actual Calc profile0UI pass. Command: node output/playwright/task82-checks/gates.mjs plus bounded failed-gate rechecks. Result:16final gates pass,36tooling tests10files and123inventory tests38files configured coverage100. Initial stale evidence/retired-edge/provenance local docs-path failures retained and corrected, compiler runtime and Writer implementation unchanged. Command: exact3197source/blob/hash audit and ap evaluator run. Result: pass atdf1dc1a89f35456ca3170c731dce33324e2e78c2;42intentional paths and5manager files removed. Evidence: output/playwright/task82-checks/exact-review.json and task quality report, same-agent separate EVALUATOR not independent review. Current inventory declares user-approved browser adaptation; no token retain/release/delete counters, custom replacement manager, WeakRef or finalizer. Main goal stays paused, no full-suite replay or global shared-string/Calc/UI completion claim.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-13T05:48:25.633Z — VERIFY — ok

    By: CODER

    Note: Verified: user-authorized native JS token references remove Boost and token ownership hooks atdf1dc1a89f35456ca3170c731dce33324e2e78c2. Calc125/shared242 whole raw100 every counter positive, original semantic projections/aliases/clone behavior, unchanged fixtures, source-absent build/profile0UI and16final gates/36tooling/123inventory pass. Exact3197hashes and same-agent separate EVALUATOR pass; legacy shared-value cleanup unchanged, main goal remains paused.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-13T05:48:24.963Z, excerpt_hash=sha256:97792363cf9ce383821e2012f34a5232e01c44e4a85a0bbcbd59ba69ff2b4200

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610130501-G2BDHD/blueprint/resolved-snapshot.json
    - old_digest: 40e9efb9cff6ab0b0201902da131f10a1ef52857c696cfa38d6f6bc4a4b76aa9
    - current_digest: 40e9efb9cff6ab0b0201902da131f10a1ef52857c696cfa38d6f6bc4a4b76aa9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610130501-G2BDHD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610130501-G2BDHD
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task82 changes through a new approved task; preserve original native evidence and shared string owners. No destructive history, merges or unrelated task changes."
  Findings: |-
    Runtime intrusive_ptr is used only by FormulaToken reference aliases and FAP's original-token field. Current upstream GetRef reuse branches reside in not-yet-ported compiler/interpreter owners; future adaptations must protect shared mutation using semantic copies rather than assume JavaScript reference counts. Native C++ lifetime observations are not business behavior and are excluded explicitly. Existing shared value cleanup is a separate legacy boundary, not token memory deallocation.

    - Observation: First targeted three-file replay passes17semantic tests with unchanged original captures and explicit count/policy projection. First typecheck reported a now-unused FAP import and a test alias widening a concrete double token to the base type; both corrected without runtime semantics changes.
      Impact: No memory manager or fake reference count remains in FormulaToken/FAP; string value cleanup remains the existing separate boundary.
      Resolution: Continue entire Calc/related shared source-absent raw100 and current inventory/gate validation. No native lifetime equality claim or GC timing test.

    - Observation: Entire Calc125/shared242 raw100 and source-absent static/profile pass. First repository gates reject stale removed ownership-test markers in unchanged compiler evidence and the old module-boundary test allowing formula->external; original failing logs/results retained.
      Impact: Runtime native reference adaptation is verified; current inventory/test evidence still referenced retired memory emulation.
      Resolution: Replace only stale compiler evidence anchors with unchanged opcode/classification tests, migrate boundary regression to reject the retired external edge, and rerun the five failed metadata/tooling gates. No compiler runtime change or full application replay.

    - Observation: Boost module/license/current mechanism capability removed; nullable TS reference aliases and direct FAP references replace it. Token counters/policies/atomic/ADL/delete-on-zero hooks absent. Whole scoped raw100 and16final gates pass, original native captures unchanged.
      Impact: Preserves token business fields/identity/Clone without C++ token allocation semantics. Existing SAL/SVL explicit value cleanup and not-yet-ported cache/COW reuse algorithms remain a separately documented boundary.
      Resolution: Commit intentional scope, review exact committed source/test/fixture bytes and removed manager paths in a same-agent separate EVALUATOR phase, then canonical close. Main goal remains paused; no WeakRef/finalizer or replacement memory manager.

    - Observation: Exact3197current/committed hashes matchdf1dc1a89f35456ca3170c731dce33324e2e78c2,42intentional paths and5manager files removed. Same-agent separate EVALUATOR pass recorded; all current scoped acceptance satisfied and original captures unchanged.
      Impact: Explicit user GC-first correction is implemented for Boost/token ownership with native JS identity semantics; existing shared-value cleanup is a transparently separate boundary, not a new GC manager.
      Resolution: Record final blueprint verification after README edits, commit task metadata and canonical finish. Keep main goal paused; do not extend into unrelated Writer or shared string migration.
id_source: "generated"
---
## Summary

Replace the unnecessary Boost intrusive_ptr runtime and FormulaToken memory counters with JavaScript references under the user's explicit GC-first correction. The main Calc goal remains paused.

## Scope

Only calc checkout/branch. Remove external Boost intrusive_ptr source and unused license plus its current runtime/provenance/capability records. Adapt formula/inc/types and token exports/enums, FormulaToken base, FormulaFAPToken reference field and Calc token clone documentation. Migrate the three directly affected formula/Calc test files, preserving unmodified native captures and semantic value/identity coverage. Update current formula/Calc runtime/provenance/capability evidence, calc-core and a focused browser-GC deviation document; related module boundary rule if its Boost import edge exists. Existing shared string/SAL value owners and their explicit value cleanup remain unchanged: this task removes token memory management, not an unrelated Writer/shared-string migration.

## Plan

Replace Boost/token ownership counters with ordinary JS references under explicit user authorization, preserve semantic alias/clone/value behavior and current shared value cleanup boundary. Migrate semantic native projections and current inventory/deviation records, whole Calc/affected shared raw100 and gates/exact review, main goal stays paused.

## Verify Steps

1. Targeted three complete formula/inc/token, native-token and sc/core/tool/token tests: semantic native field projections against unmodified captured original fixtures, explicit JS alias/FAP clone independence and no premature destruction; no native refcount or GC timing assertions.
2. node output/playwright/task82-checks/portable.mjs: entire Calc and whole directly affected shared formula/SAL/SharedString owners/tests raw S/B/F/L100 with every raw counter positive; four reference links absent/restored, static build and Calc browser profile.
3. node output/playwright/task82-checks/gates.mjs: format/lint/type/docs/size/dependencies/resources/tree/provenance/registry/invariants/routing/doctor/diff and directly affected complete tooling/inventory validation tests.
4. No executable Boost imports or token retain/release/delete hooks; direct FAP references and actual clone/alias behavior verified. Exact runtime/test/config/fixture hashes tied to commit, user-authorized browser adaptation accurately documented and inventoried; original native fixtures unchanged; same-agent separate EVALUATOR, authoritative DONE and clean all-files git status. No full-suite rerun after cycle81, main goal remains paused.

## Verification

Command: complete targeted and whole scoped tests. Result: pass. Evidence:17targeted semantic tests; whole Calc125tests36files raw3080S2092B526F2721L and shared242tests48files39executable owners raw4028S2063B829F3611L, S/B/F/L100 every raw counter positive. Original native fixtures unchanged versus2c9f64d49ecb, classification/stack/constructor/empty/hybrid compare explicit semantic projections omitting only C++ token count/policy; live-alias/FAP clone identity and independent payload behavior pass. Scope: ordinary JS references replace native token memory management, existing shared-value cleanup remains unchanged. Command: node output/playwright/task82-checks/portable.mjs. Result: pass, four links absent/restored, static build and actual Calc profile0UI pass. Command: node output/playwright/task82-checks/gates.mjs plus bounded failed-gate rechecks. Result:16final gates pass,36tooling tests10files and123inventory tests38files configured coverage100. Initial stale evidence/retired-edge/provenance local docs-path failures retained and corrected, compiler runtime and Writer implementation unchanged. Command: exact3197source/blob/hash audit and ap evaluator run. Result: pass atdf1dc1a89f35456ca3170c731dce33324e2e78c2;42intentional paths and5manager files removed. Evidence: output/playwright/task82-checks/exact-review.json and task quality report, same-agent separate EVALUATOR not independent review. Current inventory declares user-approved browser adaptation; no token retain/release/delete counters, custom replacement manager, WeakRef or finalizer. Main goal stays paused, no full-suite replay or global shared-string/Calc/UI completion claim.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-13T05:48:25.633Z — VERIFY — ok

By: CODER

Note: Verified: user-authorized native JS token references remove Boost and token ownership hooks atdf1dc1a89f35456ca3170c731dce33324e2e78c2. Calc125/shared242 whole raw100 every counter positive, original semantic projections/aliases/clone behavior, unchanged fixtures, source-absent build/profile0UI and16final gates/36tooling/123inventory pass. Exact3197hashes and same-agent separate EVALUATOR pass; legacy shared-value cleanup unchanged, main goal remains paused.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-13T05:48:24.963Z, excerpt_hash=sha256:97792363cf9ce383821e2012f34a5232e01c44e4a85a0bbcbd59ba69ff2b4200

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610130501-G2BDHD/blueprint/resolved-snapshot.json
- old_digest: 40e9efb9cff6ab0b0201902da131f10a1ef52857c696cfa38d6f6bc4a4b76aa9
- current_digest: 40e9efb9cff6ab0b0201902da131f10a1ef52857c696cfa38d6f6bc4a4b76aa9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610130501-G2BDHD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610130501-G2BDHD
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task82 changes through a new approved task; preserve original native evidence and shared string owners. No destructive history, merges or unrelated task changes.

## Findings

Runtime intrusive_ptr is used only by FormulaToken reference aliases and FAP's original-token field. Current upstream GetRef reuse branches reside in not-yet-ported compiler/interpreter owners; future adaptations must protect shared mutation using semantic copies rather than assume JavaScript reference counts. Native C++ lifetime observations are not business behavior and are excluded explicitly. Existing shared value cleanup is a separate legacy boundary, not token memory deallocation.

- Observation: First targeted three-file replay passes17semantic tests with unchanged original captures and explicit count/policy projection. First typecheck reported a now-unused FAP import and a test alias widening a concrete double token to the base type; both corrected without runtime semantics changes.
  Impact: No memory manager or fake reference count remains in FormulaToken/FAP; string value cleanup remains the existing separate boundary.
  Resolution: Continue entire Calc/related shared source-absent raw100 and current inventory/gate validation. No native lifetime equality claim or GC timing test.

- Observation: Entire Calc125/shared242 raw100 and source-absent static/profile pass. First repository gates reject stale removed ownership-test markers in unchanged compiler evidence and the old module-boundary test allowing formula->external; original failing logs/results retained.
  Impact: Runtime native reference adaptation is verified; current inventory/test evidence still referenced retired memory emulation.
  Resolution: Replace only stale compiler evidence anchors with unchanged opcode/classification tests, migrate boundary regression to reject the retired external edge, and rerun the five failed metadata/tooling gates. No compiler runtime change or full application replay.

- Observation: Boost module/license/current mechanism capability removed; nullable TS reference aliases and direct FAP references replace it. Token counters/policies/atomic/ADL/delete-on-zero hooks absent. Whole scoped raw100 and16final gates pass, original native captures unchanged.
  Impact: Preserves token business fields/identity/Clone without C++ token allocation semantics. Existing SAL/SVL explicit value cleanup and not-yet-ported cache/COW reuse algorithms remain a separately documented boundary.
  Resolution: Commit intentional scope, review exact committed source/test/fixture bytes and removed manager paths in a same-agent separate EVALUATOR phase, then canonical close. Main goal remains paused; no WeakRef/finalizer or replacement memory manager.

- Observation: Exact3197current/committed hashes matchdf1dc1a89f35456ca3170c731dce33324e2e78c2,42intentional paths and5manager files removed. Same-agent separate EVALUATOR pass recorded; all current scoped acceptance satisfied and original captures unchanged.
  Impact: Explicit user GC-first correction is implemented for Boost/token ownership with native JS identity semantics; existing shared-value cleanup is a transparently separate boundary, not a new GC manager.
  Resolution: Record final blueprint verification after README edits, commit task metadata and canonical finish. Keep main goal paused; do not extend into unrelated Writer or shared string migration.
