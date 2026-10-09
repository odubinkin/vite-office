---
id: "202610091459-8FSH81"
title: "Port Calc row mark array and iterator"
result_summary: "Implemented original compressed Calc row mark array and iterator with native evidence and documented collapsed Shift boundaries"
status: "DONE"
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
  updated_at: "2026-10-09T15:00:33.356Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T15:14:32.774Z"
  updated_by: "CODER"
  note: "Command: node scripts/calc-markarr-native-probe.mjs --write; node scripts/calc-markarr-native-probe.mjs --check Result: pass. Evidence:2814 initialized sequences; complete unchanged original ScMarkEntry/ScMarkArray/ScMarkArrayIter classes and every out-of-line definition. Six exact pinned Git blobs plus complete-group SHA256 hashes checked; native debug assertions enabled and ASan/UBSan clean. Scope:compressed interval split/shrink/combine/reset, raw Set/empty vectors on defined methods, signed30 assignment, exact signed64 tools::Long displacement before clipping, negative/beyond-bound Search, copy/assignment/explicit move states, receiving limits, equality independent of limits, navigation, single marks and repeated/reset iterators. Portable native comparison checks original private vector equality and all saved public outputs; original mark_test Search expectations also retained literally. Full multi-selection/document/column/UI consumers, vector allocation/capacity/pointer lifetimes, uninitialized/empty-Search/unsafe malformed mutation/undefined signed64 overflow remain uncertified. Native moved-vector outcomes are compared for the probe standard library; unspecified moved state is not claimed across libraries. Logs:output/playwright/markarr-native-write.log and markarr-native-check.log. Command: npm run test:calc -- src/sc/source/core/data/markarr.test.ts; npm run test:coverage:calc Result: pass. Evidence:new five tests pass, all77 Calc tests/17files; actual Istanbul statements1496/1496,branches1315/1315,functions270/270,lines1316/1316 all100. Scope:all Calc runtime owners, native/literal/private-value/state comparisons; no exclusions or threshold/provider changes. New portable test decodes committed fixture via Node fs/NodeURL and explicit wire schema; ordinary tests need neither native compiler nor upstream. Logs:markarr-smoke.log,markarr-coverage.log. Command: npm run typecheck; npm run test:tooling; affected npx eslint and npx prettier --check Result: pass. Evidence:TS7 tools/application;13 tooling tests/3files;new source/header/test/probe lint and code/fixture formatting pass. Missing initial JSDoc declarations/@returns corrected without behavior changes and final checks pass. Scope:no toolchain or Writer changes. Logs:markarr-typecheck.log,markarr-tooling-verified.log,markarr-lint-final.log,markarr-format-final.log. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc Result: pass. Evidence:335 runtime sources/1588 imports/29 edges;1114 documented source files;1117 size checks, new owner283lines/test205/probe328;114 required paths/33retired;336 provenance records(245mapped/74browser/17local). Calc registry15capabilities/127modules,zero semantic violations;semantic parity remains unverified. Scope:original markarr header/core-data owner boundaries reuse real ScSheetLimits and existing coordinate types;no shared copies. Pure-header runtime localSymbols empty and runtime class fields/accessors excluded according to established declaration extraction; provenance preserves actual public field/owner contracts. Logs:markarr-dependencies.log,markarr-doccheck-final.log,markarr-size.log,markarr-tree.log,markarr-provenance.log,markarr-inventory-verified.log. Command: Markdown local proof-link existence validation; native snapshots/literal Shift inspection; git diff --exit-code 8366f17a757a for existing address/sheetlimits/rangelst/refupdat/test partition; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:existing numerical/shared/Writer owners and partition unchanged. New CALC-007 documents exact reversed [1,0] interval after Shift and signed30-before-clamp detail with native source/test links and consumer uncertainty, preserving upstream behavior as user requires. Routing OK;doctor zero errors/two inherited warnings(managed readiness shim and old DONE202610090715-PJV0JK lacks implementation hash). Scope:calc checkout/branch only, task6 of resumed10;full suites due at task10,Writer coverage repair excluded by user. No network, external writes, merge/worktree/global files or unrelated task changes. Final task metadata and close commit must leave clean tracked/untracked status."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T15:14:58.623Z"
  updated_by: "EVALUATOR"
  note: "Original row mark owner and iterator match unchanged native sequences with actual100 Calc coverage and qualified suspicious-case documentation."
  evaluated_sha: "326dfe5eb20e81edf48dcc1814989dfd8fa3d072"
  blueprint_digest: "c7c2c8154fd04fad18104ba831a851491d82338a258964fc82d6e1ac5e7267e5"
  evidence_refs:
    - ".agentplane/tasks/202610091459-8FSH81/README.md"
    - ".agentplane/tasks/202610091459-8FSH81/quality/20261009-151458623-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610091459-8FSH81/quality/20261009-151458623-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610091459-8FSH81/quality/20261009-151458623-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610091459-8FSH81/blueprint/resolved-snapshot.json"
    - "326dfe5eb20e81edf48dcc1814989dfd8fa3d072"
    - "apps/office/src/sc/source/core/data/markarr.test.ts"
    - "scripts/calc-markarr-native-probe.mjs"
    - "docs/program/upstream-suspected-issues.md"
    - "output/playwright/markarr-verification.md"
  findings:
    - "Reviewed compressed interval algorithm and two source invariant reductions, signed30-before-clamp Shift behavior, real ScSheetLimits reuse, copy/assignment/move and iterator ownership, private vector equality, original literal Search expectations, scoped verification and exhaustive runtime/provenance mapping. New CALC-007 retains exact native outcomes and consumer uncertainty."
commit:
  hash: "326dfe5eb20e81edf48dcc1814989dfd8fa3d072"
  message: "✨ 8FSH81 calc: port original row mark array and iterator"
comments:
  -
    author: "CODER"
    body: "Start: Implement approved original row mark array and iterator in calc using existing ScSheetLimits."
  -
    author: "CODER"
    body: "Verified: Original row mark owners match2814 unchanged native sequences;77 Calc tests retain actual100 Istanbul. CALC-007 recorded with preserved upstream behavior."
events:
  -
    type: "status"
    at: "2026-10-09T15:00:41.064Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Implement approved original row mark array and iterator in calc using existing ScSheetLimits."
  -
    type: "verify"
    at: "2026-10-09T15:14:32.774Z"
    author: "CODER"
    state: "ok"
    note: "Command: node scripts/calc-markarr-native-probe.mjs --write; node scripts/calc-markarr-native-probe.mjs --check Result: pass. Evidence:2814 initialized sequences; complete unchanged original ScMarkEntry/ScMarkArray/ScMarkArrayIter classes and every out-of-line definition. Six exact pinned Git blobs plus complete-group SHA256 hashes checked; native debug assertions enabled and ASan/UBSan clean. Scope:compressed interval split/shrink/combine/reset, raw Set/empty vectors on defined methods, signed30 assignment, exact signed64 tools::Long displacement before clipping, negative/beyond-bound Search, copy/assignment/explicit move states, receiving limits, equality independent of limits, navigation, single marks and repeated/reset iterators. Portable native comparison checks original private vector equality and all saved public outputs; original mark_test Search expectations also retained literally. Full multi-selection/document/column/UI consumers, vector allocation/capacity/pointer lifetimes, uninitialized/empty-Search/unsafe malformed mutation/undefined signed64 overflow remain uncertified. Native moved-vector outcomes are compared for the probe standard library; unspecified moved state is not claimed across libraries. Logs:output/playwright/markarr-native-write.log and markarr-native-check.log. Command: npm run test:calc -- src/sc/source/core/data/markarr.test.ts; npm run test:coverage:calc Result: pass. Evidence:new five tests pass, all77 Calc tests/17files; actual Istanbul statements1496/1496,branches1315/1315,functions270/270,lines1316/1316 all100. Scope:all Calc runtime owners, native/literal/private-value/state comparisons; no exclusions or threshold/provider changes. New portable test decodes committed fixture via Node fs/NodeURL and explicit wire schema; ordinary tests need neither native compiler nor upstream. Logs:markarr-smoke.log,markarr-coverage.log. Command: npm run typecheck; npm run test:tooling; affected npx eslint and npx prettier --check Result: pass. Evidence:TS7 tools/application;13 tooling tests/3files;new source/header/test/probe lint and code/fixture formatting pass. Missing initial JSDoc declarations/@returns corrected without behavior changes and final checks pass. Scope:no toolchain or Writer changes. Logs:markarr-typecheck.log,markarr-tooling-verified.log,markarr-lint-final.log,markarr-format-final.log. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc Result: pass. Evidence:335 runtime sources/1588 imports/29 edges;1114 documented source files;1117 size checks, new owner283lines/test205/probe328;114 required paths/33retired;336 provenance records(245mapped/74browser/17local). Calc registry15capabilities/127modules,zero semantic violations;semantic parity remains unverified. Scope:original markarr header/core-data owner boundaries reuse real ScSheetLimits and existing coordinate types;no shared copies. Pure-header runtime localSymbols empty and runtime class fields/accessors excluded according to established declaration extraction; provenance preserves actual public field/owner contracts. Logs:markarr-dependencies.log,markarr-doccheck-final.log,markarr-size.log,markarr-tree.log,markarr-provenance.log,markarr-inventory-verified.log. Command: Markdown local proof-link existence validation; native snapshots/literal Shift inspection; git diff --exit-code 8366f17a757a for existing address/sheetlimits/rangelst/refupdat/test partition; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:existing numerical/shared/Writer owners and partition unchanged. New CALC-007 documents exact reversed [1,0] interval after Shift and signed30-before-clamp detail with native source/test links and consumer uncertainty, preserving upstream behavior as user requires. Routing OK;doctor zero errors/two inherited warnings(managed readiness shim and old DONE202610090715-PJV0JK lacks implementation hash). Scope:calc checkout/branch only, task6 of resumed10;full suites due at task10,Writer coverage repair excluded by user. No network, external writes, merge/worktree/global files or unrelated task changes. Final task metadata and close commit must leave clean tracked/untracked status."
  -
    type: "status"
    at: "2026-10-09T15:15:13.620Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Original row mark owners match2814 unchanged native sequences;77 Calc tests retain actual100 Istanbul. CALC-007 recorded with preserved upstream behavior."
doc_version: 3
doc_updated_at: "2026-10-09T15:15:13.622Z"
doc_updated_by: "CODER"
description: "Implement original ScMarkArray compressed row-selection owner and ScMarkArrayIter with native comparison, actual100 Calc coverage and inventory. Sixth task of resumed ten-task interval; preserve upstream quirks."
sections:
  Summary: "Port original ScMarkArray compressed row-selection owner and ScMarkArrayIter, used by Calc marking and column consumers."
  Scope: "Calc checkout and branch only. New sc/inc/markarr.ts header and sc/source/core/data/markarr.ts owner, colocated tests/native JSON, scripts/calc-markarr-native-probe.mjs, matching Calc runtime/provenance/capability records and calc-core documentation. Add a suspicious-case record only if a concrete source observation is confirmed. Reuse ScSheetLimits, native SCROW and existing numerical contracts. No string/document/formula stand-ins, shared owner duplication, Writer edits or test partition changes. Sixth task of resumed ten-task interval."
  Plan: "Port original compressed row marks and iterator with real ScSheetLimits, unchanged native comparisons, actual100 Calc coverage and inventory; task6 of10."
  Verify Steps: "Run native --write and --check with pinned Git blobs/full and extracted source hashes and ASan/UBSan. Compare Search negative/beyond-limit indices, marking splitting/shrinking/coalescing, raw Set, empty/moved state only on defined operations, copy/assignment with destination limits retained, equality independent of limits, next-mark/end and iterator reset/unchanged output references. Include valid start/end and forward interval callers; do not certify native empty Search, out-of-bounds vector access, reversed unsafe mutations or signed64 overflow. Run npm run test:coverage:calc (all four Istanbul metrics actual100), npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies/docs/file-size/source-tree/source-provenance, inventory:parity:calc with zero semantic violations, routing, doctor, diff and final clean status. Full suite remains due at task10; no Writer coverage repair."
  Verification: |-
    Verified complete unchanged native comparisons2814 sequences;77 Calc tests/17files actual100 four Istanbul metrics;TS7,13 tooling tests,affected lint/format,ownership/docs/size/tree/provenance,Calc inventory15capabilities127modules zero semantic violations,routing and doctor pass. CALC-007 documents original Shift outcome without changing behavior;full validation remains due at task10. Detailed bounded evidence is recorded by verify.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T15:14:32.774Z — VERIFY — ok

    By: CODER

    Note: Command: node scripts/calc-markarr-native-probe.mjs --write; node scripts/calc-markarr-native-probe.mjs --check Result: pass. Evidence:2814 initialized sequences; complete unchanged original ScMarkEntry/ScMarkArray/ScMarkArrayIter classes and every out-of-line definition. Six exact pinned Git blobs plus complete-group SHA256 hashes checked; native debug assertions enabled and ASan/UBSan clean. Scope:compressed interval split/shrink/combine/reset, raw Set/empty vectors on defined methods, signed30 assignment, exact signed64 tools::Long displacement before clipping, negative/beyond-bound Search, copy/assignment/explicit move states, receiving limits, equality independent of limits, navigation, single marks and repeated/reset iterators. Portable native comparison checks original private vector equality and all saved public outputs; original mark_test Search expectations also retained literally. Full multi-selection/document/column/UI consumers, vector allocation/capacity/pointer lifetimes, uninitialized/empty-Search/unsafe malformed mutation/undefined signed64 overflow remain uncertified. Native moved-vector outcomes are compared for the probe standard library; unspecified moved state is not claimed across libraries. Logs:output/playwright/markarr-native-write.log and markarr-native-check.log. Command: npm run test:calc -- src/sc/source/core/data/markarr.test.ts; npm run test:coverage:calc Result: pass. Evidence:new five tests pass, all77 Calc tests/17files; actual Istanbul statements1496/1496,branches1315/1315,functions270/270,lines1316/1316 all100. Scope:all Calc runtime owners, native/literal/private-value/state comparisons; no exclusions or threshold/provider changes. New portable test decodes committed fixture via Node fs/NodeURL and explicit wire schema; ordinary tests need neither native compiler nor upstream. Logs:markarr-smoke.log,markarr-coverage.log. Command: npm run typecheck; npm run test:tooling; affected npx eslint and npx prettier --check Result: pass. Evidence:TS7 tools/application;13 tooling tests/3files;new source/header/test/probe lint and code/fixture formatting pass. Missing initial JSDoc declarations/@returns corrected without behavior changes and final checks pass. Scope:no toolchain or Writer changes. Logs:markarr-typecheck.log,markarr-tooling-verified.log,markarr-lint-final.log,markarr-format-final.log. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc Result: pass. Evidence:335 runtime sources/1588 imports/29 edges;1114 documented source files;1117 size checks, new owner283lines/test205/probe328;114 required paths/33retired;336 provenance records(245mapped/74browser/17local). Calc registry15capabilities/127modules,zero semantic violations;semantic parity remains unverified. Scope:original markarr header/core-data owner boundaries reuse real ScSheetLimits and existing coordinate types;no shared copies. Pure-header runtime localSymbols empty and runtime class fields/accessors excluded according to established declaration extraction; provenance preserves actual public field/owner contracts. Logs:markarr-dependencies.log,markarr-doccheck-final.log,markarr-size.log,markarr-tree.log,markarr-provenance.log,markarr-inventory-verified.log. Command: Markdown local proof-link existence validation; native snapshots/literal Shift inspection; git diff --exit-code 8366f17a757a for existing address/sheetlimits/rangelst/refupdat/test partition; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:existing numerical/shared/Writer owners and partition unchanged. New CALC-007 documents exact reversed [1,0] interval after Shift and signed30-before-clamp detail with native source/test links and consumer uncertainty, preserving upstream behavior as user requires. Routing OK;doctor zero errors/two inherited warnings(managed readiness shim and old DONE202610090715-PJV0JK lacks implementation hash). Scope:calc checkout/branch only, task6 of resumed10;full suites due at task10,Writer coverage repair excluded by user. No network, external writes, merge/worktree/global files or unrelated task changes. Final task metadata and close commit must leave clean tracked/untracked status.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T15:14:32.375Z, excerpt_hash=sha256:f6cf0defdef5a03b088e349e2b17e0f9d21750a8bc888361be29c5221475842a

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091459-8FSH81/blueprint/resolved-snapshot.json
    - old_digest: c7c2c8154fd04fad18104ba831a851491d82338a258964fc82d6e1ac5e7267e5
    - current_digest: c7c2c8154fd04fad18104ba831a851491d82338a258964fc82d6e1ac5e7267e5
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610091459-8FSH81

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610091459-8FSH81
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this implementation commit only; existing address/range/reference owners remain intact."
  Findings: |-
    Pinned header records signed30 row bitfields. Original Shift modifies boundaries individually and does not normalize adjacent or collapsed entries. Search accepts negative rows at its first boundary. Native integer narrowing and reference-output preservation require explicit comparisons; no upstream behavior corrections authorized.

    - Observation: Native unchanged classes/methods pass2814 initialized sequences and all5 portable tests. Registry ID command rejected unsupported --prefix; no registry mutation occurred.
      Impact: Only capability ID discovery syntax needs correction; approved scope and validation unchanged.
      Resolution: Use installed inventory:id without unsupported arguments, then reconcile new mapped owners and capability.

    - Observation: All77 Calc tests pass with actual100 Istanbul; TS7 passes. Affected ESLint/JSDoc checks found missing wire-type comments and @returns on void methods/callbacks.
      Impact: Documentation-only omissions in new authored files; numerical behavior and scope unchanged.
      Resolution: Add required JSDoc, rerun affected lint/docs and proceed with inventory/native final checks.

    - Observation: Native --check, affected lint/format, ownership, docs and provenance pass. Runtime inventory rejects header re-export names listed as local declarations.
      Impact: Pure upstream header re-export contains no owned local declarations; provenance correctly maps public exported names, but runtime declaration evidence needs correction.
      Resolution: Follow existing pure-header runtime pattern with empty localSymbols, retain upstream/header/provenance responsibility and new source symbols, rerun Calc inventory and tooling.

    - Observation: Runtime inventory also excludes class fields/accessors from its local declaration symbol extraction; nRow/bMarked are rejected despite real initialized entry fields.
      Impact: Runtime localSymbols must describe supported declaration evidence, while provenance continues to record the real entry field contract.
      Resolution: Remove these two field names only from runtime localSymbols, keep class/method owners and source evidence unchanged, rerun inventory.

    - Observation: Final native --check matches2814 initialized sequences with debug assertions and ASan/UBSan. Calc77tests and all four actual Istanbul metrics100; TS7, tooling13tests, affected lint/format, ownership/docs/size/tree/provenance and inventory pass.
      Impact: Original row selection owners reuse ScSheetLimits;15 capabilities/127 scoped modules and zero semantic violations. CALC-007 documents collapsed Shift boundaries with unchanged outcomes.
      Resolution: Record complete bounded evidence, commit approved files and close task6 of10. Full multi-selection/document/UI consumers and native undefined/unspecified domains remain explicitly uncertified; no Writer/full-suite changes.
extensions:
  implementation_commit:
    hash: "326dfe5eb20e81edf48dcc1814989dfd8fa3d072"
    message: "✨ 8FSH81 calc: port original row mark array and iterator"
id_source: "generated"
---
## Summary

Port original ScMarkArray compressed row-selection owner and ScMarkArrayIter, used by Calc marking and column consumers.

## Scope

Calc checkout and branch only. New sc/inc/markarr.ts header and sc/source/core/data/markarr.ts owner, colocated tests/native JSON, scripts/calc-markarr-native-probe.mjs, matching Calc runtime/provenance/capability records and calc-core documentation. Add a suspicious-case record only if a concrete source observation is confirmed. Reuse ScSheetLimits, native SCROW and existing numerical contracts. No string/document/formula stand-ins, shared owner duplication, Writer edits or test partition changes. Sixth task of resumed ten-task interval.

## Plan

Port original compressed row marks and iterator with real ScSheetLimits, unchanged native comparisons, actual100 Calc coverage and inventory; task6 of10.

## Verify Steps

Run native --write and --check with pinned Git blobs/full and extracted source hashes and ASan/UBSan. Compare Search negative/beyond-limit indices, marking splitting/shrinking/coalescing, raw Set, empty/moved state only on defined operations, copy/assignment with destination limits retained, equality independent of limits, next-mark/end and iterator reset/unchanged output references. Include valid start/end and forward interval callers; do not certify native empty Search, out-of-bounds vector access, reversed unsafe mutations or signed64 overflow. Run npm run test:coverage:calc (all four Istanbul metrics actual100), npm run typecheck, npm run test:tooling, affected ESLint/Prettier, check:dependencies/docs/file-size/source-tree/source-provenance, inventory:parity:calc with zero semantic violations, routing, doctor, diff and final clean status. Full suite remains due at task10; no Writer coverage repair.

## Verification

Verified complete unchanged native comparisons2814 sequences;77 Calc tests/17files actual100 four Istanbul metrics;TS7,13 tooling tests,affected lint/format,ownership/docs/size/tree/provenance,Calc inventory15capabilities127modules zero semantic violations,routing and doctor pass. CALC-007 documents original Shift outcome without changing behavior;full validation remains due at task10. Detailed bounded evidence is recorded by verify.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T15:14:32.774Z — VERIFY — ok

By: CODER

Note: Command: node scripts/calc-markarr-native-probe.mjs --write; node scripts/calc-markarr-native-probe.mjs --check Result: pass. Evidence:2814 initialized sequences; complete unchanged original ScMarkEntry/ScMarkArray/ScMarkArrayIter classes and every out-of-line definition. Six exact pinned Git blobs plus complete-group SHA256 hashes checked; native debug assertions enabled and ASan/UBSan clean. Scope:compressed interval split/shrink/combine/reset, raw Set/empty vectors on defined methods, signed30 assignment, exact signed64 tools::Long displacement before clipping, negative/beyond-bound Search, copy/assignment/explicit move states, receiving limits, equality independent of limits, navigation, single marks and repeated/reset iterators. Portable native comparison checks original private vector equality and all saved public outputs; original mark_test Search expectations also retained literally. Full multi-selection/document/column/UI consumers, vector allocation/capacity/pointer lifetimes, uninitialized/empty-Search/unsafe malformed mutation/undefined signed64 overflow remain uncertified. Native moved-vector outcomes are compared for the probe standard library; unspecified moved state is not claimed across libraries. Logs:output/playwright/markarr-native-write.log and markarr-native-check.log. Command: npm run test:calc -- src/sc/source/core/data/markarr.test.ts; npm run test:coverage:calc Result: pass. Evidence:new five tests pass, all77 Calc tests/17files; actual Istanbul statements1496/1496,branches1315/1315,functions270/270,lines1316/1316 all100. Scope:all Calc runtime owners, native/literal/private-value/state comparisons; no exclusions or threshold/provider changes. New portable test decodes committed fixture via Node fs/NodeURL and explicit wire schema; ordinary tests need neither native compiler nor upstream. Logs:markarr-smoke.log,markarr-coverage.log. Command: npm run typecheck; npm run test:tooling; affected npx eslint and npx prettier --check Result: pass. Evidence:TS7 tools/application;13 tooling tests/3files;new source/header/test/probe lint and code/fixture formatting pass. Missing initial JSDoc declarations/@returns corrected without behavior changes and final checks pass. Scope:no toolchain or Writer changes. Logs:markarr-typecheck.log,markarr-tooling-verified.log,markarr-lint-final.log,markarr-format-final.log. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc Result: pass. Evidence:335 runtime sources/1588 imports/29 edges;1114 documented source files;1117 size checks, new owner283lines/test205/probe328;114 required paths/33retired;336 provenance records(245mapped/74browser/17local). Calc registry15capabilities/127modules,zero semantic violations;semantic parity remains unverified. Scope:original markarr header/core-data owner boundaries reuse real ScSheetLimits and existing coordinate types;no shared copies. Pure-header runtime localSymbols empty and runtime class fields/accessors excluded according to established declaration extraction; provenance preserves actual public field/owner contracts. Logs:markarr-dependencies.log,markarr-doccheck-final.log,markarr-size.log,markarr-tree.log,markarr-provenance.log,markarr-inventory-verified.log. Command: Markdown local proof-link existence validation; native snapshots/literal Shift inspection; git diff --exit-code 8366f17a757a for existing address/sheetlimits/rangelst/refupdat/test partition; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:existing numerical/shared/Writer owners and partition unchanged. New CALC-007 documents exact reversed [1,0] interval after Shift and signed30-before-clamp detail with native source/test links and consumer uncertainty, preserving upstream behavior as user requires. Routing OK;doctor zero errors/two inherited warnings(managed readiness shim and old DONE202610090715-PJV0JK lacks implementation hash). Scope:calc checkout/branch only, task6 of resumed10;full suites due at task10,Writer coverage repair excluded by user. No network, external writes, merge/worktree/global files or unrelated task changes. Final task metadata and close commit must leave clean tracked/untracked status.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T15:14:32.375Z, excerpt_hash=sha256:f6cf0defdef5a03b088e349e2b17e0f9d21750a8bc888361be29c5221475842a

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091459-8FSH81/blueprint/resolved-snapshot.json
- old_digest: c7c2c8154fd04fad18104ba831a851491d82338a258964fc82d6e1ac5e7267e5
- current_digest: c7c2c8154fd04fad18104ba831a851491d82338a258964fc82d6e1ac5e7267e5
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610091459-8FSH81

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610091459-8FSH81
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this implementation commit only; existing address/range/reference owners remain intact.

## Findings

Pinned header records signed30 row bitfields. Original Shift modifies boundaries individually and does not normalize adjacent or collapsed entries. Search accepts negative rows at its first boundary. Native integer narrowing and reference-output preservation require explicit comparisons; no upstream behavior corrections authorized.

- Observation: Native unchanged classes/methods pass2814 initialized sequences and all5 portable tests. Registry ID command rejected unsupported --prefix; no registry mutation occurred.
  Impact: Only capability ID discovery syntax needs correction; approved scope and validation unchanged.
  Resolution: Use installed inventory:id without unsupported arguments, then reconcile new mapped owners and capability.

- Observation: All77 Calc tests pass with actual100 Istanbul; TS7 passes. Affected ESLint/JSDoc checks found missing wire-type comments and @returns on void methods/callbacks.
  Impact: Documentation-only omissions in new authored files; numerical behavior and scope unchanged.
  Resolution: Add required JSDoc, rerun affected lint/docs and proceed with inventory/native final checks.

- Observation: Native --check, affected lint/format, ownership, docs and provenance pass. Runtime inventory rejects header re-export names listed as local declarations.
  Impact: Pure upstream header re-export contains no owned local declarations; provenance correctly maps public exported names, but runtime declaration evidence needs correction.
  Resolution: Follow existing pure-header runtime pattern with empty localSymbols, retain upstream/header/provenance responsibility and new source symbols, rerun Calc inventory and tooling.

- Observation: Runtime inventory also excludes class fields/accessors from its local declaration symbol extraction; nRow/bMarked are rejected despite real initialized entry fields.
  Impact: Runtime localSymbols must describe supported declaration evidence, while provenance continues to record the real entry field contract.
  Resolution: Remove these two field names only from runtime localSymbols, keep class/method owners and source evidence unchanged, rerun inventory.

- Observation: Final native --check matches2814 initialized sequences with debug assertions and ASan/UBSan. Calc77tests and all four actual Istanbul metrics100; TS7, tooling13tests, affected lint/format, ownership/docs/size/tree/provenance and inventory pass.
  Impact: Original row selection owners reuse ScSheetLimits;15 capabilities/127 scoped modules and zero semantic violations. CALC-007 documents collapsed Shift boundaries with unchanged outcomes.
  Resolution: Record complete bounded evidence, commit approved files and close task6 of10. Full multi-selection/document/UI consumers and native undefined/unspecified domains remain explicitly uncertified; no Writer/full-suite changes.
