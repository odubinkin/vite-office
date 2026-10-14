---
id: "202610131803-TNXVM3"
title: "Implement Calc single and double reference tokens"
result_summary: "Task95 completed on calc: genuine reference token semantics, independent copied data and borrowed bounds via ordinary JS refs, CALC-084 preserved;134 Calc and251 affected shared tests/raw100,16gates/static/Calc0UI pass,3279 exact source hashes. Goal continues past full101 then pauses full111/repairs; full compiler/document/UI/ODS remains pending."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 13
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-13T18:04:03.841Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-13T18:23:36.821Z"
  updated_by: "CODER"
  note: "Task95 exact source d0b668c430aa292e5d77c82e5a64476a6812a11c,3279 committed non-task hashes13 approved paths; same-agent separate EVALUATOR pass not independent. Genuine reference token --write/check474sources8normalcommands1805559bytes; raw Calc134tests26owners3655S2443B682F3253L/shared251tests40owners4272S2147B897F3817L all100/everycounterpositive;16gates/static/Calc0UI pass; links absent/restored. CALC-084 preserved, no memory library/fake peers/full compiler/document/UI/ODS claim. Goal active pause111, continue101."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-13T18:23:36.107Z"
  updated_by: "EVALUATOR"
  note: "Same-agent separate EVALUATOR phase accepts exact d0b668c430aa task95 reference tokens against genuine original methods and current raw/gate evidence; not independent review."
  evaluated_sha: "d0b668c430aa292e5d77c82e5a64476a6812a11c"
  blueprint_digest: "e1daa54a5a00bc6094a86982a4cb50b1fa04ecfb6253651b15e81c48659b62fb"
  evidence_refs:
    - ".agentplane/tasks/202610131803-TNXVM3/README.md"
    - ".agentplane/tasks/202610131803-TNXVM3/quality/20261013-182336107-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610131803-TNXVM3/quality/20261013-182336107-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610131803-TNXVM3/quality/20261013-182336107-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610131803-TNXVM3/blueprint/resolved-snapshot.json"
    - "output/playwright/task95-checks/exact-review.json"
    - "output/playwright/task95-checks/value-coverage-audit.json"
    - "output/playwright/task95-checks/gates-results.json"
    - "output/playwright/calc-reference-token-native/manifest.json"
  findings:
    - "3279 current tracked non-task SHA256 identities match committed Git blobs; baseline3275 differs only13 approved paths (9 changed4 added). Calc134/shared251 scenarios pass raw100, every raw counter positive;16gates pass after recorded bounded repairs and source links restored."
    - "Actual shared FormulaToken and Calc refdata/address/bounds owners reused. Native full original two classes/checkTextEqual/methods/doc-free data bodies and genuine headers,474sources8ordinary commands, complete1805559-byte replay. No fake native peers, new smart pointers, sanitizer commands or memory emulation."
    - "CALC-084 preserves receiver-limit text comparison asymmetry; copies/clones value-copy data and share bounds. Default opcode, flags, normalized ranges, mutable stable members and trim omission retain original behavior. Full compiler/document/UI/ODS remain pending; original document-level QA not executed."
commit:
  hash: "d0b668c430aa292e5d77c82e5a64476a6812a11c"
  message: "🧮 TNXVM3 calc: implement original reference tokens"
comments:
  -
    author: "CODER"
    body: "Start: actual Calc single/double reference tokens and original TextEqual using existing real shared/data/bounds owners and normal native scopes, no fake document or ownership engine."
  -
    author: "CODER"
    body: "Verified: actual Calc single/double reference token value/copy/Clone/member/TextEqual family with existing shared owners; normal original replay, scoped raw100,16gates and exact source review pass."
events:
  -
    type: "status"
    at: "2026-10-13T18:04:11.114Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual Calc single/double reference tokens and original TextEqual using existing real shared/data/bounds owners and normal native scopes, no fake document or ownership engine."
  -
    type: "verify"
    at: "2026-10-13T18:23:36.821Z"
    author: "CODER"
    state: "ok"
    note: "Task95 exact source d0b668c430aa292e5d77c82e5a64476a6812a11c,3279 committed non-task hashes13 approved paths; same-agent separate EVALUATOR pass not independent. Genuine reference token --write/check474sources8normalcommands1805559bytes; raw Calc134tests26owners3655S2443B682F3253L/shared251tests40owners4272S2147B897F3817L all100/everycounterpositive;16gates/static/Calc0UI pass; links absent/restored. CALC-084 preserved, no memory library/fake peers/full compiler/document/UI/ODS claim. Goal active pause111, continue101."
  -
    type: "status"
    at: "2026-10-13T18:23:53.045Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: actual Calc single/double reference token value/copy/Clone/member/TextEqual family with existing shared owners; normal original replay, scoped raw100,16gates and exact source review pass."
doc_version: 3
doc_updated_at: "2026-10-13T18:23:53.047Z"
doc_updated_by: "CODER"
description: "Task95 actual ScSingleRefToken/ScDoubleRefToken ctor/copy/clone/member references/equality/TextEqual using existing reference data and sheet limits, prerequisite for real compiler/token array/UI/ODS formula references; no document/config substitute."
sections:
  Summary: "Task95 original Calc single/double reference token owners needed by real formula compilation and UI/ODS references."
  Scope: "Extend existing sc/core/tool/token.ts and token header with actual ScSingleRefToken/ScDoubleRefToken constructors/implicit copy/Clone, stable mutable member getters, original base-and-data equality and full matching-type checkTextEqual helper through actual reference data/toAbs/sheet limits. Reuse existing shared FormulaToken, ScSingleRefData/ScComplexRefData/ScSheetLimits/ScAddress/ScRange owners, no duplicated models or new smart pointer. Native complete original two class definitions/member methods/checkTextEqual, genuine real address/refdata/sheet-limit/formula headers and selected complete doc-free reference functions; do not reuse old fake ScDocument scaffold or supply fake peers. Normal-only initialized matching true derived types, code/type mismatch branches, reference/clone/flags/bounds histories. Ordinary JS refs retain sheet bounds; no native memory/count/invalid derived casts/arithmetic overflow/full ABI/QA claim. Add native helper/fixture/test, update original runtime/provenance plus new capability, Calc/GC checkpoint and suspected cases if observed. Whole Calc/affected shared raw100 and existing16gates/static/Calc0UI/exact source closure on calc. True document/compile/config/locale/ODS pipeline remains pending; goal pauses only after second upcoming full111 and relevant repairs, next full101 first."
  Plan: "Actual single/double reference tokens with existing bounds/data/shared base and original TextEqual; genuine normal native value proof, scoped raw100,16gates/exact review/DONE. No fake peers/count emulation; next full101 first, continue then pause after full111/repairs."
  Verify Steps: |-
    1. node scripts/calc-reference-token-native-probe.mjs --write then --check: complete original single/double classes/inline/default/copy/clone/method bodies and checkTextEqual, real formula/address/refdata/sheetlimit headers plus genuine doc-free method definitions and dependencies; normal only. Full initialized live clone/member/flags/coordinate/bounds/base mismatches/value/text comparisons match current tests; original raw counts/ABI/invalid peers/overflow excluded, no fake ScDocument/ScMatrix/Compiler bodies.
    2. Source-absence whole npm run test:coverage:calc and full affected shared FormulaToken/SAL/related owner profile with existing consumer suites; raw S/B/F/L100 every counter positive, four exact reference links restored. Static/Calc browser profile pass,0UI does not prove editable-grid readiness. No Writer-only coverage repair/full run before101.
    3. Existing16whole format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff checks. Actual single token runtime owner and native/source/QA contextual metadata; failure evidence before bounded fixes, no thresholds/private-state forcing or source-validation weakening.
    4. Exact current/committed non-task source hashes and same-agent separate EVALUATOR (not independent reviewer), canonical DONE clean git status --short --untracked-files=all branchcalc. No full compiler/ScTokenArray/document/UI/ODS/native ownership/QA claim. Goal continues past full101 and pauses after full111 plus bounded relevant repairs.
  Verification: |-
    Command: node scripts/calc-reference-token-native-probe.mjs --write then --check.
    Result: pass after initial genuine SALhelper link correction.
    Evidence: output/playwright/task95-checks/native-write-repaired.log and native-check.log; genuine unchanged full two class declarations and complete original methods/checkTextEqual/doc-free reference methods plus full actual headers, 474 source hashes, 17 verified Boost dependency headers (native only), 8 normal terminal commands including four immutable dependency value replays, one original IDL generation, two compiler calls and complete initialized results; 1805559 bytes SHA256 fa772dc5b98fd95fb08605ac4bf8b1dd0e326c6f7c60fed76c6e51b3d4d6372a. No new sanitizer commands, fake document/compiler/matrix peers or runtime memory library.
    Scope: default/custom opcodes, all256flags, coordinate bounds, both equality directions, value-copied source/data/copy/Clone mutations, stable mutable endpoint members, trim retention/omission, receiver bounds and canonical ranges. Original document-level testFormulaTokenEquality anchor is unexecuted consumer context, not full QA proof.

    Command: node output/playwright/task95-checks/portable.mjs; node output/playwright/task95-checks/portable.mjs --checks-only after const-triple typing repair.
    Result: pass. First portable call passed Calc/shared then failed static only; second passed static/Calc0UI and raw audits without repeating unaffected suites.
    Evidence: value-calc/shared-portable.log, value-coverage-audit.json, static.log and calc-browser.log, corresponding manifests. Calc134tests45files26executable owners raw3655S2443B682F3253L; shared251tests56files40owners4272S2147B897F3817L. Every raw S/F/B counter >0, S/B/F/L100. All four upstream/library symlinks absent for portable checks and restored exactly. Annotation-only const tuple fix does not change replay operations.
    Scope: complete current Calc, affected complete real shared token/SAL/string/mdds owners and existing genuine consumers; static/Calc browser0scenarios. No Writer-only repair or full office run (scheduled101, continue afterward, pause111).

    Command: node output/playwright/task95-checks/gates.mjs --early then --late; --recheck for corrected metadata.
    Result: all16 pass.
    Evidence: gates-results.json and gate logs. format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff. First three source-evidence gates rejected a local script marker routed as upstream; actual app fixture/test anchors repaired without resolver/threshold weakening. Other13 gates passed first.
    Scope: current task95 runtime/header/native/test/fixture/metadata/docs; exact source commit and same-agent separate EVALUATOR audit required next. No independent review claim.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-13T18:23:36.821Z — VERIFY — ok

    By: CODER

    Note: Task95 exact source d0b668c430aa292e5d77c82e5a64476a6812a11c,3279 committed non-task hashes13 approved paths; same-agent separate EVALUATOR pass not independent. Genuine reference token --write/check474sources8normalcommands1805559bytes; raw Calc134tests26owners3655S2443B682F3253L/shared251tests40owners4272S2147B897F3817L all100/everycounterpositive;16gates/static/Calc0UI pass; links absent/restored. CALC-084 preserved, no memory library/fake peers/full compiler/document/UI/ODS claim. Goal active pause111, continue101.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-13T18:22:52.026Z, excerpt_hash=sha256:5701323dd88cf91b94fa53fbc6b2b80ba02cc8caa451f9aee6ff81df61bbad44

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610131803-TNXVM3/blueprint/resolved-snapshot.json
    - old_digest: e1daa54a5a00bc6094a86982a4cb50b1fa04ecfb6253651b15e81c48659b62fb
    - current_digest: e1daa54a5a00bc6094a86982a4cb50b1fa04ecfb6253651b15e81c48659b62fb
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610131803-TNXVM3

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610131803-TNXVM3 -m 🧩 TNXVM3 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task95 files through followup task; restore links on every exit; no branch merges/history rewrite or unrelated tasks."
  Findings: |-
    Resolved native failure: original ScSheetLimits inherits actual salhelper::SimpleReferenceObject but reused UNO link omitted its compiled implementation; native-write.log/manifest diagnostics retained. Complete actual salhelper/source/simplereferenceobject.cxx is now linked, no synthetic destructor/typeinfo/refcount. 8 normal commands complete.
    Resolved static failure: test coordinate arrays were inferred number[] with noUncheckedIndexedAccess; static-first-failed.log retained. Const fixed-length tuples preserve exact operations; static and Calc0UI rerun pass.
    Resolved metadata failure: scripts/calc-reference-token-native-probe.mjs evidence resolved as upstream by the existing path contract. Failed gate logs retained; actual apps/office native fixture and replay markers replace script anchors. Provenance/registry/invariants plus metadata-sensitive inventory tests pass; no checker weakening.
    CALC-084 receiver bounds can make original TextEqual asymmetric across different limits; preserve and audit real document/sort caller preconditions later. Range normalization may intentionally differ from raw equality. Trim copied but original range equality omits it. Original QA context is document-level unexecuted, not surrogate evidence.
    Ordinary JS references retain limits and token objects, owned reference data copied independently. No Boost/native ownership/count/pool/finalizer behavior emulated; invalid derived casts/uninitialized refs/arithmetic overflow/native ABI/memory excluded. Complete compiler/ScTokenArray/ScFormulaCell/document/grid/ODS remain pending prioritized owners; no editable UI readiness claim.
    The user explicitly changed pause to second upcoming full111 after relevant Calc/shared repairs; first full101 must continue. Writer-only coverage remains separate. Goal active beyond atomic DONE.
id_source: "generated"
---
## Summary

Task95 original Calc single/double reference token owners needed by real formula compilation and UI/ODS references.

## Scope

Extend existing sc/core/tool/token.ts and token header with actual ScSingleRefToken/ScDoubleRefToken constructors/implicit copy/Clone, stable mutable member getters, original base-and-data equality and full matching-type checkTextEqual helper through actual reference data/toAbs/sheet limits. Reuse existing shared FormulaToken, ScSingleRefData/ScComplexRefData/ScSheetLimits/ScAddress/ScRange owners, no duplicated models or new smart pointer. Native complete original two class definitions/member methods/checkTextEqual, genuine real address/refdata/sheet-limit/formula headers and selected complete doc-free reference functions; do not reuse old fake ScDocument scaffold or supply fake peers. Normal-only initialized matching true derived types, code/type mismatch branches, reference/clone/flags/bounds histories. Ordinary JS refs retain sheet bounds; no native memory/count/invalid derived casts/arithmetic overflow/full ABI/QA claim. Add native helper/fixture/test, update original runtime/provenance plus new capability, Calc/GC checkpoint and suspected cases if observed. Whole Calc/affected shared raw100 and existing16gates/static/Calc0UI/exact source closure on calc. True document/compile/config/locale/ODS pipeline remains pending; goal pauses only after second upcoming full111 and relevant repairs, next full101 first.

## Plan

Actual single/double reference tokens with existing bounds/data/shared base and original TextEqual; genuine normal native value proof, scoped raw100,16gates/exact review/DONE. No fake peers/count emulation; next full101 first, continue then pause after full111/repairs.

## Verify Steps

1. node scripts/calc-reference-token-native-probe.mjs --write then --check: complete original single/double classes/inline/default/copy/clone/method bodies and checkTextEqual, real formula/address/refdata/sheetlimit headers plus genuine doc-free method definitions and dependencies; normal only. Full initialized live clone/member/flags/coordinate/bounds/base mismatches/value/text comparisons match current tests; original raw counts/ABI/invalid peers/overflow excluded, no fake ScDocument/ScMatrix/Compiler bodies.
2. Source-absence whole npm run test:coverage:calc and full affected shared FormulaToken/SAL/related owner profile with existing consumer suites; raw S/B/F/L100 every counter positive, four exact reference links restored. Static/Calc browser profile pass,0UI does not prove editable-grid readiness. No Writer-only coverage repair/full run before101.
3. Existing16whole format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff checks. Actual single token runtime owner and native/source/QA contextual metadata; failure evidence before bounded fixes, no thresholds/private-state forcing or source-validation weakening.
4. Exact current/committed non-task source hashes and same-agent separate EVALUATOR (not independent reviewer), canonical DONE clean git status --short --untracked-files=all branchcalc. No full compiler/ScTokenArray/document/UI/ODS/native ownership/QA claim. Goal continues past full101 and pauses after full111 plus bounded relevant repairs.

## Verification

Command: node scripts/calc-reference-token-native-probe.mjs --write then --check.
Result: pass after initial genuine SALhelper link correction.
Evidence: output/playwright/task95-checks/native-write-repaired.log and native-check.log; genuine unchanged full two class declarations and complete original methods/checkTextEqual/doc-free reference methods plus full actual headers, 474 source hashes, 17 verified Boost dependency headers (native only), 8 normal terminal commands including four immutable dependency value replays, one original IDL generation, two compiler calls and complete initialized results; 1805559 bytes SHA256 fa772dc5b98fd95fb08605ac4bf8b1dd0e326c6f7c60fed76c6e51b3d4d6372a. No new sanitizer commands, fake document/compiler/matrix peers or runtime memory library.
Scope: default/custom opcodes, all256flags, coordinate bounds, both equality directions, value-copied source/data/copy/Clone mutations, stable mutable endpoint members, trim retention/omission, receiver bounds and canonical ranges. Original document-level testFormulaTokenEquality anchor is unexecuted consumer context, not full QA proof.

Command: node output/playwright/task95-checks/portable.mjs; node output/playwright/task95-checks/portable.mjs --checks-only after const-triple typing repair.
Result: pass. First portable call passed Calc/shared then failed static only; second passed static/Calc0UI and raw audits without repeating unaffected suites.
Evidence: value-calc/shared-portable.log, value-coverage-audit.json, static.log and calc-browser.log, corresponding manifests. Calc134tests45files26executable owners raw3655S2443B682F3253L; shared251tests56files40owners4272S2147B897F3817L. Every raw S/F/B counter >0, S/B/F/L100. All four upstream/library symlinks absent for portable checks and restored exactly. Annotation-only const tuple fix does not change replay operations.
Scope: complete current Calc, affected complete real shared token/SAL/string/mdds owners and existing genuine consumers; static/Calc browser0scenarios. No Writer-only repair or full office run (scheduled101, continue afterward, pause111).

Command: node output/playwright/task95-checks/gates.mjs --early then --late; --recheck for corrected metadata.
Result: all16 pass.
Evidence: gates-results.json and gate logs. format/lint/type/docs/size/dependencies/resources/tooling/tree/provenance/registry/invariants/inventory/routing/doctor/diff. First three source-evidence gates rejected a local script marker routed as upstream; actual app fixture/test anchors repaired without resolver/threshold weakening. Other13 gates passed first.
Scope: current task95 runtime/header/native/test/fixture/metadata/docs; exact source commit and same-agent separate EVALUATOR audit required next. No independent review claim.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-13T18:23:36.821Z — VERIFY — ok

By: CODER

Note: Task95 exact source d0b668c430aa292e5d77c82e5a64476a6812a11c,3279 committed non-task hashes13 approved paths; same-agent separate EVALUATOR pass not independent. Genuine reference token --write/check474sources8normalcommands1805559bytes; raw Calc134tests26owners3655S2443B682F3253L/shared251tests40owners4272S2147B897F3817L all100/everycounterpositive;16gates/static/Calc0UI pass; links absent/restored. CALC-084 preserved, no memory library/fake peers/full compiler/document/UI/ODS claim. Goal active pause111, continue101.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-13T18:22:52.026Z, excerpt_hash=sha256:5701323dd88cf91b94fa53fbc6b2b80ba02cc8caa451f9aee6ff81df61bbad44

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610131803-TNXVM3/blueprint/resolved-snapshot.json
- old_digest: e1daa54a5a00bc6094a86982a4cb50b1fa04ecfb6253651b15e81c48659b62fb
- current_digest: e1daa54a5a00bc6094a86982a4cb50b1fa04ecfb6253651b15e81c48659b62fb
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610131803-TNXVM3

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610131803-TNXVM3 -m 🧩 TNXVM3 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task95 files through followup task; restore links on every exit; no branch merges/history rewrite or unrelated tasks.

## Findings

Resolved native failure: original ScSheetLimits inherits actual salhelper::SimpleReferenceObject but reused UNO link omitted its compiled implementation; native-write.log/manifest diagnostics retained. Complete actual salhelper/source/simplereferenceobject.cxx is now linked, no synthetic destructor/typeinfo/refcount. 8 normal commands complete.
Resolved static failure: test coordinate arrays were inferred number[] with noUncheckedIndexedAccess; static-first-failed.log retained. Const fixed-length tuples preserve exact operations; static and Calc0UI rerun pass.
Resolved metadata failure: scripts/calc-reference-token-native-probe.mjs evidence resolved as upstream by the existing path contract. Failed gate logs retained; actual apps/office native fixture and replay markers replace script anchors. Provenance/registry/invariants plus metadata-sensitive inventory tests pass; no checker weakening.
CALC-084 receiver bounds can make original TextEqual asymmetric across different limits; preserve and audit real document/sort caller preconditions later. Range normalization may intentionally differ from raw equality. Trim copied but original range equality omits it. Original QA context is document-level unexecuted, not surrogate evidence.
Ordinary JS references retain limits and token objects, owned reference data copied independently. No Boost/native ownership/count/pool/finalizer behavior emulated; invalid derived casts/uninitialized refs/arithmetic overflow/native ABI/memory excluded. Complete compiler/ScTokenArray/ScFormulaCell/document/grid/ODS remain pending prioritized owners; no editable UI readiness claim.
The user explicitly changed pause to second upcoming full111 after relevant Calc/shared repairs; first full101 must continue. Writer-only coverage remains separate. Goal active beyond atomic DONE.
