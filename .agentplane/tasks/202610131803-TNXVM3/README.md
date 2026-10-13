---
id: "202610131803-TNXVM3"
title: "Implement Calc single and double reference tokens"
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
  updated_at: "2026-10-13T18:04:03.841Z"
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
    body: "Start: actual Calc single/double reference tokens and original TextEqual using existing real shared/data/bounds owners and normal native scopes, no fake document or ownership engine."
events:
  -
    type: "status"
    at: "2026-10-13T18:04:11.114Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual Calc single/double reference tokens and original TextEqual using existing real shared/data/bounds owners and normal native scopes, no fake document or ownership engine."
doc_version: 3
doc_updated_at: "2026-10-13T18:22:52.026Z"
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

## Rollback Plan

Revert only intentional task95 files through followup task; restore links on every exit; no branch merges/history rewrite or unrelated tasks.

## Findings

Resolved native failure: original ScSheetLimits inherits actual salhelper::SimpleReferenceObject but reused UNO link omitted its compiled implementation; native-write.log/manifest diagnostics retained. Complete actual salhelper/source/simplereferenceobject.cxx is now linked, no synthetic destructor/typeinfo/refcount. 8 normal commands complete.
Resolved static failure: test coordinate arrays were inferred number[] with noUncheckedIndexedAccess; static-first-failed.log retained. Const fixed-length tuples preserve exact operations; static and Calc0UI rerun pass.
Resolved metadata failure: scripts/calc-reference-token-native-probe.mjs evidence resolved as upstream by the existing path contract. Failed gate logs retained; actual apps/office native fixture and replay markers replace script anchors. Provenance/registry/invariants plus metadata-sensitive inventory tests pass; no checker weakening.
CALC-084 receiver bounds can make original TextEqual asymmetric across different limits; preserve and audit real document/sort caller preconditions later. Range normalization may intentionally differ from raw equality. Trim copied but original range equality omits it. Original QA context is document-level unexecuted, not surrogate evidence.
Ordinary JS references retain limits and token objects, owned reference data copied independently. No Boost/native ownership/count/pool/finalizer behavior emulated; invalid derived casts/uninitialized refs/arithmetic overflow/native ABI/memory excluded. Complete compiler/ScTokenArray/ScFormulaCell/document/grid/ODS remain pending prioritized owners; no editable UI readiness claim.
The user explicitly changed pause to second upcoming full111 after relevant Calc/shared repairs; first full101 must continue. Writer-only coverage remains separate. Goal active beyond atomic DONE.
