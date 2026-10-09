---
id: "202610091325-52SMH5"
title: "Port Calc relative reference wrapping"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T13:26:12.049Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T13:34:11.282Z"
  updated_by: "CODER"
  note: "Command: node scripts/calc-refwrap-native-probe.mjs --write; node scripts/calc-refwrap-native-probe.mjs --check Result: pass after selecting native release semantics with NDEBUG (debug validity assertion recorded in Findings). Evidence: 15616 initialized differential cases; unchanged original wrap helper/MoveRelWrap and complete numerical single/complex reference owners, exact pinned blobs and SHA256 hashes; ASan/UBSan clean. Generated JSON canonical-formatted; check compares parsed values exactly. Scope: original single-step relative-axis wrapping, toAbs-before-wrap, validity masks versus supplied wrap masks, positive table counts, sorted write-back, stable endpoints, monotone deletion/trim/flag semantics; native debug assertions, undefined arithmetic and full compiler/document/token/named-range integration remain unverified. Command: npm run test:coverage:calc Result: pass. Evidence: 52 tests in12 files; actual Istanbul statements980/980, branches818/818, functions215/215, lines866/866 all100; no exclusions, thresholds or shared/Writer test changes. Scope: all Calc numerical owners and saved native outputs. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier checks Result: pass. Evidence: TS7 tools/application checks;13 tooling tests/3 files including actual disjoint discovery and native TS7/TS6 API compatibility; three affected authored code files lint clean; code/fixture Prettier clean. Scope: existing merged toolchain, new public wrapping operation and test ownership. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:332 runtime sources/1580 relative imports/29 permitted edges;1101 documented authored files;1104 size checks with existing grouping candidates unchanged;114 required paths/33 retired roots;333 provenance modules (242 mapped,74 browser adaptations,17 local infrastructure). Scope: reuse existing references/limits without duplication or Writer dependencies. Command: npm run inventory:parity:calc Result: pass. Evidence:10 capabilities/124 modules, zero semantic violations. New MoveRelWrap capability and updated source/header runtime/provenance plus older geometry gap reconciliation; semantic parity stays unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK;doctor zero errors,two inherited warnings (managed readiness shim and previously DONE task202610090715-PJV0JK without implementation hash);diff clean, only active task README remains for verification closure. Scope: calc branch/current checkout only; no merges, network, global files or unrelated task corrections. Implementation c3f84b4b86141ad9c0a77b53a887ceb21ce0cd22. First resumed task of ten; full suite scheduled at task10 per user instruction, no full Writer/full E2E run here."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T13:34:12.601Z"
  updated_by: "EVALUATOR"
  note: "Original MoveRelWrap and private helper preserve native responsibilities with independent differential and literal acceptance, actual100 Istanbul and TS7 checks; no semantic certification overclaim."
  evaluated_sha: "c3f84b4b86141ad9c0a77b53a887ceb21ce0cd22"
  blueprint_digest: "6b0d1f71207d92da2391dee494bad97940bf55f939063ca29825a50d7d467343"
  evidence_refs:
    - ".agentplane/tasks/202610091325-52SMH5/README.md"
    - ".agentplane/tasks/202610091325-52SMH5/quality/20261009-133412601-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610091325-52SMH5/quality/20261009-133412601-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610091325-52SMH5/quality/20261009-133412601-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610091325-52SMH5/blueprint/resolved-snapshot.json"
    - "c3f84b4b86141ad9c0a77b53a887ceb21ce0cd22"
    - "output/playwright/calc-resumed-task1-verification.md"
  findings:
    - "No production shared duplication, Writer edits, coverage exclusions or body rewrites. Native release-only custom-limit comparison is explicit; defined bounded arithmetic does not certify full compiler/token ownership."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved original relative wrapping with native differential evidence and scoped Calc actual100 coverage after resumed goal."
events:
  -
    type: "status"
    at: "2026-10-09T13:26:14.057Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved original relative wrapping with native differential evidence and scoped Calc actual100 coverage after resumed goal."
  -
    type: "verify"
    at: "2026-10-09T13:34:11.282Z"
    author: "CODER"
    state: "ok"
    note: "Command: node scripts/calc-refwrap-native-probe.mjs --write; node scripts/calc-refwrap-native-probe.mjs --check Result: pass after selecting native release semantics with NDEBUG (debug validity assertion recorded in Findings). Evidence: 15616 initialized differential cases; unchanged original wrap helper/MoveRelWrap and complete numerical single/complex reference owners, exact pinned blobs and SHA256 hashes; ASan/UBSan clean. Generated JSON canonical-formatted; check compares parsed values exactly. Scope: original single-step relative-axis wrapping, toAbs-before-wrap, validity masks versus supplied wrap masks, positive table counts, sorted write-back, stable endpoints, monotone deletion/trim/flag semantics; native debug assertions, undefined arithmetic and full compiler/document/token/named-range integration remain unverified. Command: npm run test:coverage:calc Result: pass. Evidence: 52 tests in12 files; actual Istanbul statements980/980, branches818/818, functions215/215, lines866/866 all100; no exclusions, thresholds or shared/Writer test changes. Scope: all Calc numerical owners and saved native outputs. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier checks Result: pass. Evidence: TS7 tools/application checks;13 tooling tests/3 files including actual disjoint discovery and native TS7/TS6 API compatibility; three affected authored code files lint clean; code/fixture Prettier clean. Scope: existing merged toolchain, new public wrapping operation and test ownership. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:332 runtime sources/1580 relative imports/29 permitted edges;1101 documented authored files;1104 size checks with existing grouping candidates unchanged;114 required paths/33 retired roots;333 provenance modules (242 mapped,74 browser adaptations,17 local infrastructure). Scope: reuse existing references/limits without duplication or Writer dependencies. Command: npm run inventory:parity:calc Result: pass. Evidence:10 capabilities/124 modules, zero semantic violations. New MoveRelWrap capability and updated source/header runtime/provenance plus older geometry gap reconciliation; semantic parity stays unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK;doctor zero errors,two inherited warnings (managed readiness shim and previously DONE task202610090715-PJV0JK without implementation hash);diff clean, only active task README remains for verification closure. Scope: calc branch/current checkout only; no merges, network, global files or unrelated task corrections. Implementation c3f84b4b86141ad9c0a77b53a887ceb21ce0cd22. First resumed task of ten; full suite scheduled at task10 per user instruction, no full Writer/full E2E run here."
doc_version: 3
doc_updated_at: "2026-10-09T13:34:11.365Z"
doc_updated_by: "CODER"
description: "Resume Calc after Writer merge and TS7/Istanbul adoption. Port unchanged MoveRelWrap responsibilities and private wrap helper in original ScRefUpdate owner, reuse existing references/limits, native differential comparison, inventory and actual100 scoped coverage. First task of next ten-task full-suite interval."
sections:
  Summary: "Resume Calc with original relative reference wrapping after TS7 and Istanbul merge."
  Scope: "Only calc branch and checkout. Extend apps/office/src/sc/source/core/tool/refupdat.ts, add focused MoveRelWrap test and native fixture, scripts/calc-refwrap-native-probe.mjs, one Calc capability and existing refupdat header/source runtime and provenance records, docs/program/calc-core.md. Existing shared address/reference/limits owners are reused; Writer and coverage configuration unchanged. This is task 1 of the next ten-task full-suite interval."
  Plan: "Port original MoveRelWrap using existing numerical references; exact native differential acceptance, updated inventory, actual100 Istanbul and TS7 scoped checks. First of ten resumed Calc tasks."
  Verify Steps: "Run node scripts/calc-refwrap-native-probe.mjs --write and --check under ASan/UBSan with exact pinned source hashes; canonical-format generated fixture. Compare all native outputs and literal single-step wrap, invalid/deleted, mixed-axis flags, sorted endpoint, custom maxima, positive table counts and identity behavior. Run npm run test:coverage:calc with actual100 Istanbul statements/branches/functions/lines, npm run typecheck, affected ESLint/Prettier, check:dependencies, check:docs, check:file-size, check:source-tree, inventory:parity:calc zero violations, node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check and final clean git status. No full Writer/full E2E run at this milestone; full run every ten tasks per user instruction."
  Verification: |-
    Preflight on clean calc checkout at 44ed369e: existing 48 tests/11 files pass with Istanbul actual100 (959 statements,802 branches,213 functions,853 lines); TS7 tools/application typecheck passes. Implementation evidence pending.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T13:34:11.282Z — VERIFY — ok

    By: CODER

    Note: Command: node scripts/calc-refwrap-native-probe.mjs --write; node scripts/calc-refwrap-native-probe.mjs --check Result: pass after selecting native release semantics with NDEBUG (debug validity assertion recorded in Findings). Evidence: 15616 initialized differential cases; unchanged original wrap helper/MoveRelWrap and complete numerical single/complex reference owners, exact pinned blobs and SHA256 hashes; ASan/UBSan clean. Generated JSON canonical-formatted; check compares parsed values exactly. Scope: original single-step relative-axis wrapping, toAbs-before-wrap, validity masks versus supplied wrap masks, positive table counts, sorted write-back, stable endpoints, monotone deletion/trim/flag semantics; native debug assertions, undefined arithmetic and full compiler/document/token/named-range integration remain unverified. Command: npm run test:coverage:calc Result: pass. Evidence: 52 tests in12 files; actual Istanbul statements980/980, branches818/818, functions215/215, lines866/866 all100; no exclusions, thresholds or shared/Writer test changes. Scope: all Calc numerical owners and saved native outputs. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier checks Result: pass. Evidence: TS7 tools/application checks;13 tooling tests/3 files including actual disjoint discovery and native TS7/TS6 API compatibility; three affected authored code files lint clean; code/fixture Prettier clean. Scope: existing merged toolchain, new public wrapping operation and test ownership. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:332 runtime sources/1580 relative imports/29 permitted edges;1101 documented authored files;1104 size checks with existing grouping candidates unchanged;114 required paths/33 retired roots;333 provenance modules (242 mapped,74 browser adaptations,17 local infrastructure). Scope: reuse existing references/limits without duplication or Writer dependencies. Command: npm run inventory:parity:calc Result: pass. Evidence:10 capabilities/124 modules, zero semantic violations. New MoveRelWrap capability and updated source/header runtime/provenance plus older geometry gap reconciliation; semantic parity stays unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK;doctor zero errors,two inherited warnings (managed readiness shim and previously DONE task202610090715-PJV0JK without implementation hash);diff clean, only active task README remains for verification closure. Scope: calc branch/current checkout only; no merges, network, global files or unrelated task corrections. Implementation c3f84b4b86141ad9c0a77b53a887ceb21ce0cd22. First resumed task of ten; full suite scheduled at task10 per user instruction, no full Writer/full E2E run here.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T13:30:23.504Z, excerpt_hash=sha256:a392114eb4fcd9d9f2d98021594118491f576b1d579b92c38f810612431f56c1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091325-52SMH5/blueprint/resolved-snapshot.json
    - old_digest: 6b0d1f71207d92da2391dee494bad97940bf55f939063ca29825a50d7d467343
    - current_digest: 6b0d1f71207d92da2391dee494bad97940bf55f939063ca29825a50d7d467343
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610091325-52SMH5

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610091325-52SMH5
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the implementation commit for this task; existing transpose/growth and reference owners remain independently verified."
  Findings: |-
    User resumed the paused goal and confirmed merging Writer changes plus TS7/Istanbul. Previous pause instruction was fulfilled and revoked by explicit resume. The helper wraps once, not repeated modulo. toAbs masks invalid axes to -1 before relative wrapping and orders endpoints; SetRange adds deletion flags without clearing old ones. Undefined signed arithmetic remains outside native defined acceptance. No global files/network or merge operations needed.

    - Observation: Native probe stopped at upstream ValidCol debug assertion: native debug build restricts maxima to standard/jumbo constants, while release comparison includes explicit custom limits.
      Impact: No fixture produced; sanitizer-clean release semantics must be selected explicitly before bounded custom-maximum acceptance.
      Resolution: Compile the unchanged native sources with NDEBUG, matching release-only comparison and prior documented exclusion of debug assertion enforcement; retain ASan/UBSan and all original function bodies.

    - Observation: Inventory ID CLI rejects --help; it accepts only id/build/check plus scope.
      Impact: No records changed; capability ID allocation not performed.
      Resolution: Read declared CLI usage and invoke existing npm run inventory:id without extra flags.
id_source: "generated"
---
## Summary

Resume Calc with original relative reference wrapping after TS7 and Istanbul merge.

## Scope

Only calc branch and checkout. Extend apps/office/src/sc/source/core/tool/refupdat.ts, add focused MoveRelWrap test and native fixture, scripts/calc-refwrap-native-probe.mjs, one Calc capability and existing refupdat header/source runtime and provenance records, docs/program/calc-core.md. Existing shared address/reference/limits owners are reused; Writer and coverage configuration unchanged. This is task 1 of the next ten-task full-suite interval.

## Plan

Port original MoveRelWrap using existing numerical references; exact native differential acceptance, updated inventory, actual100 Istanbul and TS7 scoped checks. First of ten resumed Calc tasks.

## Verify Steps

Run node scripts/calc-refwrap-native-probe.mjs --write and --check under ASan/UBSan with exact pinned source hashes; canonical-format generated fixture. Compare all native outputs and literal single-step wrap, invalid/deleted, mixed-axis flags, sorted endpoint, custom maxima, positive table counts and identity behavior. Run npm run test:coverage:calc with actual100 Istanbul statements/branches/functions/lines, npm run typecheck, affected ESLint/Prettier, check:dependencies, check:docs, check:file-size, check:source-tree, inventory:parity:calc zero violations, node .agentplane/policy/check-routing.mjs, ap doctor, git diff --check and final clean git status. No full Writer/full E2E run at this milestone; full run every ten tasks per user instruction.

## Verification

Preflight on clean calc checkout at 44ed369e: existing 48 tests/11 files pass with Istanbul actual100 (959 statements,802 branches,213 functions,853 lines); TS7 tools/application typecheck passes. Implementation evidence pending.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T13:34:11.282Z — VERIFY — ok

By: CODER

Note: Command: node scripts/calc-refwrap-native-probe.mjs --write; node scripts/calc-refwrap-native-probe.mjs --check Result: pass after selecting native release semantics with NDEBUG (debug validity assertion recorded in Findings). Evidence: 15616 initialized differential cases; unchanged original wrap helper/MoveRelWrap and complete numerical single/complex reference owners, exact pinned blobs and SHA256 hashes; ASan/UBSan clean. Generated JSON canonical-formatted; check compares parsed values exactly. Scope: original single-step relative-axis wrapping, toAbs-before-wrap, validity masks versus supplied wrap masks, positive table counts, sorted write-back, stable endpoints, monotone deletion/trim/flag semantics; native debug assertions, undefined arithmetic and full compiler/document/token/named-range integration remain unverified. Command: npm run test:coverage:calc Result: pass. Evidence: 52 tests in12 files; actual Istanbul statements980/980, branches818/818, functions215/215, lines866/866 all100; no exclusions, thresholds or shared/Writer test changes. Scope: all Calc numerical owners and saved native outputs. Command: npm run typecheck; npm run test:tooling; affected ESLint/Prettier checks Result: pass. Evidence: TS7 tools/application checks;13 tooling tests/3 files including actual disjoint discovery and native TS7/TS6 API compatibility; three affected authored code files lint clean; code/fixture Prettier clean. Scope: existing merged toolchain, new public wrapping operation and test ownership. Command: npm run check:dependencies; npm run check:docs; npm run check:file-size; npm run check:source-tree; npm run check:source-provenance Result: pass. Evidence:332 runtime sources/1580 relative imports/29 permitted edges;1101 documented authored files;1104 size checks with existing grouping candidates unchanged;114 required paths/33 retired roots;333 provenance modules (242 mapped,74 browser adaptations,17 local infrastructure). Scope: reuse existing references/limits without duplication or Writer dependencies. Command: npm run inventory:parity:calc Result: pass. Evidence:10 capabilities/124 modules, zero semantic violations. New MoveRelWrap capability and updated source/header runtime/provenance plus older geometry gap reconciliation; semantic parity stays unverified. Command: node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git status --short --untracked-files=all Result: pass. Evidence:routing OK;doctor zero errors,two inherited warnings (managed readiness shim and previously DONE task202610090715-PJV0JK without implementation hash);diff clean, only active task README remains for verification closure. Scope: calc branch/current checkout only; no merges, network, global files or unrelated task corrections. Implementation c3f84b4b86141ad9c0a77b53a887ceb21ce0cd22. First resumed task of ten; full suite scheduled at task10 per user instruction, no full Writer/full E2E run here.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T13:30:23.504Z, excerpt_hash=sha256:a392114eb4fcd9d9f2d98021594118491f576b1d579b92c38f810612431f56c1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610091325-52SMH5/blueprint/resolved-snapshot.json
- old_digest: 6b0d1f71207d92da2391dee494bad97940bf55f939063ca29825a50d7d467343
- current_digest: 6b0d1f71207d92da2391dee494bad97940bf55f939063ca29825a50d7d467343
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610091325-52SMH5

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610091325-52SMH5
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the implementation commit for this task; existing transpose/growth and reference owners remain independently verified.

## Findings

User resumed the paused goal and confirmed merging Writer changes plus TS7/Istanbul. Previous pause instruction was fulfilled and revoked by explicit resume. The helper wraps once, not repeated modulo. toAbs masks invalid axes to -1 before relative wrapping and orders endpoints; SetRange adds deletion flags without clearing old ones. Undefined signed arithmetic remains outside native defined acceptance. No global files/network or merge operations needed.

- Observation: Native probe stopped at upstream ValidCol debug assertion: native debug build restricts maxima to standard/jumbo constants, while release comparison includes explicit custom limits.
  Impact: No fixture produced; sanitizer-clean release semantics must be selected explicitly before bounded custom-maximum acceptance.
  Resolution: Compile the unchanged native sources with NDEBUG, matching release-only comparison and prior documented exclusion of debug assertion enforcement; retain ASan/UBSan and all original function bodies.

- Observation: Inventory ID CLI rejects --help; it accepts only id/build/check plus scope.
  Impact: No records changed; capability ID allocation not performed.
  Resolution: Read declared CLI usage and invoke existing npm run inventory:id without extra flags.
