---
id: "202610101521-5TVQA9"
title: "Port original OUString lifetime and SharedString value owners for Calc text cells"
status: "DOING"
priority: "high"
owner: "CODER"
revision: 23
origin:
  system: "manual"
depends_on: []
tags:
  - "calc"
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T15:26:07.918Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-10T15:49:34.057Z"
  updated_by: "CODER"
  note: "Pass: original full-header SharedString native --check4424 states,32 pinned blobs31 scopes,2 runtime guards3 compile guards3 invalid lifetime diagnoses; prior RTL --check3336/20 exact driver44ad48ef. Portable Calc106/24 S2920 B2055 F474 L2564 and affected shared6/3 across8 executable sources S391 B206 F81 L313 all-four100/all raw counters positive with both upstream links absent/restored finally; affected tooling28/4. Typecheck/lint/JSDoc/size/dependencies/tree/provenance/scoped Calc/shared inventories/changed-file formatting/routing/doctor/diff all pass. Evidence output/playwright/task35-{tests,gates,final}/manifest.json and task35-audit.json; no full run at task4/10, next41. Writer unchanged."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Port actual shared OUString and SharedString ownership/reference contracts with pinned native evidence on branchcalc, reusing common RTL data."
events:
  -
    type: "status"
    at: "2026-10-10T15:26:09.672Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Port actual shared OUString and SharedString ownership/reference contracts with pinned native evidence on branchcalc, reusing common RTL data."
  -
    type: "verify"
    at: "2026-10-10T15:49:34.057Z"
    author: "CODER"
    state: "ok"
    note: "Pass: original full-header SharedString native --check4424 states,32 pinned blobs31 scopes,2 runtime guards3 compile guards3 invalid lifetime diagnoses; prior RTL --check3336/20 exact driver44ad48ef. Portable Calc106/24 S2920 B2055 F474 L2564 and affected shared6/3 across8 executable sources S391 B206 F81 L313 all-four100/all raw counters positive with both upstream links absent/restored finally; affected tooling28/4. Typecheck/lint/JSDoc/size/dependencies/tree/provenance/scoped Calc/shared inventories/changed-file formatting/routing/doctor/diff all pass. Evidence output/playwright/task35-{tests,gates,final}/manifest.json and task35-audit.json; no full run at task4/10, next41. Writer unchanged."
doc_version: 3
doc_updated_at: "2026-10-10T15:49:34.116Z"
doc_updated_by: "CODER"
description: "Task35: reuse original shared RTL data/intern ownership to implement real OUString constructors/lifetime/copy/move/borrowed reference/default empty required by complete original SharedString header/source contract. Preserve separate C++ static empty versus C API empty and live unacquired aliases, both pointer fields, native assignment/move/equality/default/lifetime order. Pin full upstream headers/source/dependencies in actual native compiler evidence; compare complete initialized pointer/refcount/free states and held views without rewriting native algorithms. Branchcalc only, original SVL/SAL ownership and necessary module edge, exhaustive inventory and Calc journal. Strict Calc/affected shared four-metric100; task4/10,next full41. No fake string/document owners, Writer changes, network or merges; remaining OUString algorithms/native ABI/concurrency unverified."
sections:
  Summary: "Task35 implements actual OUString lifetime/value/reference dependencies and the complete original SharedString contract required by Calc text-cell storage, reusing the shared RTL owners completed in task34. Preserve original C++/C empty identities, ownership order, copy/move differences and held unacquired aliases. This is task4/10 after full task31; next full41. The broader Calc application remains unfinished."
  Scope: "Only /Users/odubinkin/Projects/vite-office-calc branchcalc. Runtime owners: apps/office/src/sal/inc/rtl/ustring.ts (original include/rtl/ustring.hxx), sal/inc/types.ts for the original no-acquire enum only if needed; svl/inc/sharedstring.ts and svl/source/misc/sharedstring.ts with a single actual class owner and source/header re-export boundary matching existing native class compilation patterns. Required literal/default storage and C++ reference/type witnesses stay under their actual SAL header owner; no fake strings or independent allocator/refcount/pool. Reuse existing RTL macros/C API and add only the actual SVL->SAL library edge in scripts/check-module-boundaries.mjs plus related test. Native evidence under scripts/rtl-sharedstring-native-probe.mjs, optional shared scripts/rtl-ustring-native-sources.mjs to reuse verified native scopes instead of copying a harness; adjust existing RTL ownership probe only for that shared extraction, retaining its entire existing corpus. Tests and portable fixture under sal/inc or svl/source/misc; shared runtime/provenance/capability records, source-tree boundary ledger if necessary, docs/program/calc-core.md and calc-upstream-suspected-issues.md and active task artifacts. Actual OUString constructor/copy/move/assignment/lifetime/getters/clear/unacquired dependency closure is in scope, not unrelated conversion/search/formatting APIs. Complete original SharedString methods/defaults are in scope. Native process/concurrent/ABI/compile-time/dangling-pointer differences must be explicit; preserve undefined original paths without synthesizing expected defined outcomes. No Writer source/gaps, network, merges, branch changes, policy or acceptance relaxations."
  Plan: |-
    1. Verify exact local source/header and original library dependencies. Compile original full C++ headers where possible using only documented compiler configuration/type/allocator/IO plumbing; use complete pinned unchanged function scopes only as bounded fallback, never rewritten native algorithms.
    2. Port actual shared OUString owners and required literal/static/no-acquire storage. Default C++ empty retains static-only flag0x40000000, distinct from C empty. Runtime move construction resets its source through rtl_uString_new; move assignment swaps data. A native unacquired reference must be a live borrowed alias of a caller field, with no constructor/acquire/release; preserve identity and pointer-field changes using an explicit JS reference adaptation rather than copied strings.
    3. Port complete original SharedString default/raw-pair/OUString/copy/move construction, destruction, copy/move assignment, equality/inequality, pointer/string getters, validity/empty/length, and original empty singleton. Preserve original move/copy order and lack of self-move repairs; record suspicious native reproductions separately.
    4. Capture deterministic initialized native sequences including nonowning views held across reassignment/move, both fields and identities, copies/equality/ignore-case distinction, empty variants, refcounts and complete allocator/free callbacks. Portable tests compare complete observed states and diagnose native invalid/lifetime paths without inventing results after UB. Register exhaustive original provenance/runtime/export contracts with broad flags unverified where full source responsibility is incomplete.
    5. Run original RTL fixture --check after shared native extraction, new native --check, Calc and affected shared all-four100 coverage with all actual raw counters positive and exact source completeness; portable repeats with upstream links absent/restored in finally, affected boundary/provenance/registry tests, typecheck/lint/JSDoc/size/dependencies/tree/provenance/scoped inventories/format/routing/doctor/diff. Heavy tests serial, no whole suite at task4/10. Commit implementation, separate read-only EVALUATOR quality, then close via route with clean intentional state.
  Verify Steps: |-
    1. node scripts/rtl-sharedstring-native-probe.mjs --check: exact pinned original headers/functions/dependencies and complete initialized data/owner/view/allocator observations, native assertions and explicit UB-only diagnostics. Native source bodies are not rewritten and fixtures contain every genuine observation, losslessly encoded if necessary. node scripts/rtl-ustring-ownership-native-probe.mjs --check still reproduces all3336 prior snapshots/20 guards unchanged if its extraction is shared.
    2. npm run test:coverage:calc passes every actual Calc case with S/B/F/L100 and raw counters positive. Affected SAL/SVL tests run with an exact scoped Istanbul include, all four100, complete actual required executable source maps and no threshold/exclusion/timeout weakening. Repeat portable tests with both local upstream symlinks removed/restored in finally.
    3. npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; exact affected module-boundary/source-provenance/registry tests; format check on all changed nongenerated files; routing, ap doctor and git diff --check. All pass; no unapproved native-library edge or duplicate shared owner.
    4. Inspect native original source order, all empty identities and held-view alias behavior against actual implementation commit. EVALUATOR records actual digest/evidence and gaps; task verify-show and required CLI verification pass. Final branchcalc, clean git status --short --untracked-files=all and DONE route. No full run until task41; current4/10.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-10T15:49:34.057Z — VERIFY — ok

    By: CODER

    Note: Pass: original full-header SharedString native --check4424 states,32 pinned blobs31 scopes,2 runtime guards3 compile guards3 invalid lifetime diagnoses; prior RTL --check3336/20 exact driver44ad48ef. Portable Calc106/24 S2920 B2055 F474 L2564 and affected shared6/3 across8 executable sources S391 B206 F81 L313 all-four100/all raw counters positive with both upstream links absent/restored finally; affected tooling28/4. Typecheck/lint/JSDoc/size/dependencies/tree/provenance/scoped Calc/shared inventories/changed-file formatting/routing/doctor/diff all pass. Evidence output/playwright/task35-{tests,gates,final}/manifest.json and task35-audit.json; no full run at task4/10, next41. Writer unchanged.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T15:47:41.553Z, excerpt_hash=sha256:30594cde594f96848abdce694ed10081efaf4f19563b6d5861e8e8cfbb7af8d6

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610101521-5TVQA9/blueprint/resolved-snapshot.json
    - old_digest: 45e9e2f43103635369ff0f538e0ec24050d5116d461643c96c1adcacd7e0592e
    - current_digest: 45e9e2f43103635369ff0f538e0ec24050d5116d461643c96c1adcacd7e0592e
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610101521-5TVQA9

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610101521-5TVQA9
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Use a new forward task to revert only task35 runtime, native helper/extraction, exact graph edge and registry/docs changes if needed; rerun the same scoped gates and original RTL corpus. Never reset history, mutate the pinned upstream checkout, merge branches, repair Writer-only coverage or relax source/coverage policy. All temporary native/build evidence stays ignored inside this repository; symlinks always restored in finally."
  Findings: |-
    Preflight: branchcalc and clean status, only unrelated C9TN6M/X6VV8G active; no duplicate task35. User ongoing goal/continue authorizes safe local scope. Source: full SharedString header/misc owner uses two nullable pointers and live OUString::unacquired field references. OUString default uses private static literal; moved-from runtime uses different C API empty; move assignment swaps, unlike SharedString. Preserve original move self behavior, test only native initialized defined states and document actual undefined cases separately. Original full-header compilation is preferred over hand-built class substitutes. Browser const references and C++ rvalue/destructor invocation need explicit source-backed language adapters; no fake no-op locks, strings or temporary document models.

    - Observation: Read-only header discovery referenced nonexistent include/sal/typesizes.h.in (exit2); original checked-in typesizes.h is empty generated scaffolding.
      Impact: Native full-header build needs actual upstream configuration template location, not an assumed include path.
      Resolution: Recompute route; locate the actual template in the pinned repository and generate only compiler configuration in ignored task output.

    - Observation: First full-header syntax build failed: prefix text replacement for SIZEOFLONG also changed SIZEOFLONGLONG, creating __SIZEOF_LONG__LONG.
      Impact: Compiler plumbing configuration was invalid; no native or runtime behavior was evaluated.
      Resolution: Generate each configuration macro by exact whole-line matching against original template and retry original full headers without source changes.

    - Observation: Read-only lookup used a nonexistent reverse-probe filename (exit1).
      Impact: No source or evidence changed; discovery must use actual tracked paths.
      Resolution: Locate the existing probe with rg --files and reuse its actual extraction intervals.

    - Observation: Initial full-header link probe failed only in caller JSON IO: nested template-literal quote escapes were consumed by JS.
      Impact: Original header/scopes compiled; caller serialization prevented linking the evidence driver.
      Resolution: Use a raw template for native caller plumbing and preserve exact original interpolated scopes; rerun native compilation.

    - Observation: Original full-header compiler rejected caller OUString(nullptr,1): overload resolution is ambiguous with another original constructor.
      Impact: The invalid-input caller needs the original const sal_Unicode pointer type witness; no native-body defect or production change is required.
      Resolution: Use static_cast<sal_Unicode const*>(nullptr) in that diagnostic caller, then retry exact original classes and corpus.

    - Observation: Probe source construction produced a literal newline inside a JavaScript regex for compiler dependency continuations, failing parsing.
      Impact: Native corpus did not run; source extraction/runtime owners remain unchanged.
      Resolution: Parse compiler dependency whitespace directly; standalone continuation backslashes are ignored by the original-path filter. Retry without acceptance changes.

    - Observation: Scoped native replay passed all4423 snapshots; strict coverage failed at literal assertion and SharedString move-assignment folded-null branch. Formatter was invoked with root-relative paths from the workspace and matched no files.
      Impact: Native semantics agree for captured defined calls, but coverage acceptance and formatting are not yet met.
      Resolution: Add source-backed compile-time literal diagnostic and a genuine raw-pair self-contained move with absent folded data; format from repository root and rerun exact scoped gates. Do not relax coverage.

    - Observation: Read-only registry lookup assumed nonexistent svl/inc/listener.ts.json (exit1); existing header owner names differ.
      Impact: No mutation; registry generation must use existing record schemas and actual file enumeration.
      Resolution: Use verified SAL records and enumerate active shared entries rather than inventing another example path.

    - Observation: Const-reference annotation patch hit stale pre-format test context.
      Impact: Patch application must be inspected before retrying; this is a type-boundary correction, not a changed native algorithm.
      Resolution: Read actual edited files, apply the remaining nullable field annotation against current formatted lines and rerun type/scoped checks.

    - Observation: Documentation patch assumed an incorrect calc-core heading; runtime const-reference annotation patch succeeded first.
      Impact: No documentation content changed. Preserve actual document and update only scoped appended section.
      Resolution: Append the new source-backed core/journal sections directly; refresh AST inventory symbols after final type annotations and validate.

    - Observation: Typecheck passed; lint/JSDoc rejected undocumented native overload declarations, unified signatures, test nonnull assertions and two unused extraction imports.
      Impact: Runtime/native replay is unchanged, but required code/documentation gates fail.
      Resolution: Represent exact constructor argument combinations as tuple unions, documenting erased native overload dispatch; replace test nonnull assertions with explicit type witnesses, document assertion callbacks and remove unused imports. No policy suppression or gate weakening.

    - Observation: Source-provenance gate ran during the portable-test interval while both approved upstream symlinks were deliberately removed; it failed ENOENT on an unchanged original border source.
      Impact: This is verification scheduling interference, not a provenance mismatch. Gates through dependencies/tree/lint/docs/size passed; provenance/scoped inventories need links present.
      Resolution: Let the confirmed live portable test process finish and its finally restore both links; then rerun provenance and subsequent gates serially. Keep source tests portable and native checks dependent on present pinned sources.
id_source: "generated"
---
## Summary

Task35 implements actual OUString lifetime/value/reference dependencies and the complete original SharedString contract required by Calc text-cell storage, reusing the shared RTL owners completed in task34. Preserve original C++/C empty identities, ownership order, copy/move differences and held unacquired aliases. This is task4/10 after full task31; next full41. The broader Calc application remains unfinished.

## Scope

Only /Users/odubinkin/Projects/vite-office-calc branchcalc. Runtime owners: apps/office/src/sal/inc/rtl/ustring.ts (original include/rtl/ustring.hxx), sal/inc/types.ts for the original no-acquire enum only if needed; svl/inc/sharedstring.ts and svl/source/misc/sharedstring.ts with a single actual class owner and source/header re-export boundary matching existing native class compilation patterns. Required literal/default storage and C++ reference/type witnesses stay under their actual SAL header owner; no fake strings or independent allocator/refcount/pool. Reuse existing RTL macros/C API and add only the actual SVL->SAL library edge in scripts/check-module-boundaries.mjs plus related test. Native evidence under scripts/rtl-sharedstring-native-probe.mjs, optional shared scripts/rtl-ustring-native-sources.mjs to reuse verified native scopes instead of copying a harness; adjust existing RTL ownership probe only for that shared extraction, retaining its entire existing corpus. Tests and portable fixture under sal/inc or svl/source/misc; shared runtime/provenance/capability records, source-tree boundary ledger if necessary, docs/program/calc-core.md and calc-upstream-suspected-issues.md and active task artifacts. Actual OUString constructor/copy/move/assignment/lifetime/getters/clear/unacquired dependency closure is in scope, not unrelated conversion/search/formatting APIs. Complete original SharedString methods/defaults are in scope. Native process/concurrent/ABI/compile-time/dangling-pointer differences must be explicit; preserve undefined original paths without synthesizing expected defined outcomes. No Writer source/gaps, network, merges, branch changes, policy or acceptance relaxations.

## Plan

1. Verify exact local source/header and original library dependencies. Compile original full C++ headers where possible using only documented compiler configuration/type/allocator/IO plumbing; use complete pinned unchanged function scopes only as bounded fallback, never rewritten native algorithms.
2. Port actual shared OUString owners and required literal/static/no-acquire storage. Default C++ empty retains static-only flag0x40000000, distinct from C empty. Runtime move construction resets its source through rtl_uString_new; move assignment swaps data. A native unacquired reference must be a live borrowed alias of a caller field, with no constructor/acquire/release; preserve identity and pointer-field changes using an explicit JS reference adaptation rather than copied strings.
3. Port complete original SharedString default/raw-pair/OUString/copy/move construction, destruction, copy/move assignment, equality/inequality, pointer/string getters, validity/empty/length, and original empty singleton. Preserve original move/copy order and lack of self-move repairs; record suspicious native reproductions separately.
4. Capture deterministic initialized native sequences including nonowning views held across reassignment/move, both fields and identities, copies/equality/ignore-case distinction, empty variants, refcounts and complete allocator/free callbacks. Portable tests compare complete observed states and diagnose native invalid/lifetime paths without inventing results after UB. Register exhaustive original provenance/runtime/export contracts with broad flags unverified where full source responsibility is incomplete.
5. Run original RTL fixture --check after shared native extraction, new native --check, Calc and affected shared all-four100 coverage with all actual raw counters positive and exact source completeness; portable repeats with upstream links absent/restored in finally, affected boundary/provenance/registry tests, typecheck/lint/JSDoc/size/dependencies/tree/provenance/scoped inventories/format/routing/doctor/diff. Heavy tests serial, no whole suite at task4/10. Commit implementation, separate read-only EVALUATOR quality, then close via route with clean intentional state.

## Verify Steps

1. node scripts/rtl-sharedstring-native-probe.mjs --check: exact pinned original headers/functions/dependencies and complete initialized data/owner/view/allocator observations, native assertions and explicit UB-only diagnostics. Native source bodies are not rewritten and fixtures contain every genuine observation, losslessly encoded if necessary. node scripts/rtl-ustring-ownership-native-probe.mjs --check still reproduces all3336 prior snapshots/20 guards unchanged if its extraction is shared.
2. npm run test:coverage:calc passes every actual Calc case with S/B/F/L100 and raw counters positive. Affected SAL/SVL tests run with an exact scoped Istanbul include, all four100, complete actual required executable source maps and no threshold/exclusion/timeout weakening. Repeat portable tests with both local upstream symlinks removed/restored in finally.
3. npm run typecheck; npm run lint; npm run check:docs; npm run check:file-size; npm run check:dependencies; npm run check:source-tree; npm run check:source-provenance; npm run inventory:parity:calc; npm run inventory:parity:shared; exact affected module-boundary/source-provenance/registry tests; format check on all changed nongenerated files; routing, ap doctor and git diff --check. All pass; no unapproved native-library edge or duplicate shared owner.
4. Inspect native original source order, all empty identities and held-view alias behavior against actual implementation commit. EVALUATOR records actual digest/evidence and gaps; task verify-show and required CLI verification pass. Final branchcalc, clean git status --short --untracked-files=all and DONE route. No full run until task41; current4/10.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-10T15:49:34.057Z — VERIFY — ok

By: CODER

Note: Pass: original full-header SharedString native --check4424 states,32 pinned blobs31 scopes,2 runtime guards3 compile guards3 invalid lifetime diagnoses; prior RTL --check3336/20 exact driver44ad48ef. Portable Calc106/24 S2920 B2055 F474 L2564 and affected shared6/3 across8 executable sources S391 B206 F81 L313 all-four100/all raw counters positive with both upstream links absent/restored finally; affected tooling28/4. Typecheck/lint/JSDoc/size/dependencies/tree/provenance/scoped Calc/shared inventories/changed-file formatting/routing/doctor/diff all pass. Evidence output/playwright/task35-{tests,gates,final}/manifest.json and task35-audit.json; no full run at task4/10, next41. Writer unchanged.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T15:47:41.553Z, excerpt_hash=sha256:30594cde594f96848abdce694ed10081efaf4f19563b6d5861e8e8cfbb7af8d6

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610101521-5TVQA9/blueprint/resolved-snapshot.json
- old_digest: 45e9e2f43103635369ff0f538e0ec24050d5116d461643c96c1adcacd7e0592e
- current_digest: 45e9e2f43103635369ff0f538e0ec24050d5116d461643c96c1adcacd7e0592e
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610101521-5TVQA9

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610101521-5TVQA9
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Use a new forward task to revert only task35 runtime, native helper/extraction, exact graph edge and registry/docs changes if needed; rerun the same scoped gates and original RTL corpus. Never reset history, mutate the pinned upstream checkout, merge branches, repair Writer-only coverage or relax source/coverage policy. All temporary native/build evidence stays ignored inside this repository; symlinks always restored in finally.

## Findings

Preflight: branchcalc and clean status, only unrelated C9TN6M/X6VV8G active; no duplicate task35. User ongoing goal/continue authorizes safe local scope. Source: full SharedString header/misc owner uses two nullable pointers and live OUString::unacquired field references. OUString default uses private static literal; moved-from runtime uses different C API empty; move assignment swaps, unlike SharedString. Preserve original move self behavior, test only native initialized defined states and document actual undefined cases separately. Original full-header compilation is preferred over hand-built class substitutes. Browser const references and C++ rvalue/destructor invocation need explicit source-backed language adapters; no fake no-op locks, strings or temporary document models.

- Observation: Read-only header discovery referenced nonexistent include/sal/typesizes.h.in (exit2); original checked-in typesizes.h is empty generated scaffolding.
  Impact: Native full-header build needs actual upstream configuration template location, not an assumed include path.
  Resolution: Recompute route; locate the actual template in the pinned repository and generate only compiler configuration in ignored task output.

- Observation: First full-header syntax build failed: prefix text replacement for SIZEOFLONG also changed SIZEOFLONGLONG, creating __SIZEOF_LONG__LONG.
  Impact: Compiler plumbing configuration was invalid; no native or runtime behavior was evaluated.
  Resolution: Generate each configuration macro by exact whole-line matching against original template and retry original full headers without source changes.

- Observation: Read-only lookup used a nonexistent reverse-probe filename (exit1).
  Impact: No source or evidence changed; discovery must use actual tracked paths.
  Resolution: Locate the existing probe with rg --files and reuse its actual extraction intervals.

- Observation: Initial full-header link probe failed only in caller JSON IO: nested template-literal quote escapes were consumed by JS.
  Impact: Original header/scopes compiled; caller serialization prevented linking the evidence driver.
  Resolution: Use a raw template for native caller plumbing and preserve exact original interpolated scopes; rerun native compilation.

- Observation: Original full-header compiler rejected caller OUString(nullptr,1): overload resolution is ambiguous with another original constructor.
  Impact: The invalid-input caller needs the original const sal_Unicode pointer type witness; no native-body defect or production change is required.
  Resolution: Use static_cast<sal_Unicode const*>(nullptr) in that diagnostic caller, then retry exact original classes and corpus.

- Observation: Probe source construction produced a literal newline inside a JavaScript regex for compiler dependency continuations, failing parsing.
  Impact: Native corpus did not run; source extraction/runtime owners remain unchanged.
  Resolution: Parse compiler dependency whitespace directly; standalone continuation backslashes are ignored by the original-path filter. Retry without acceptance changes.

- Observation: Scoped native replay passed all4423 snapshots; strict coverage failed at literal assertion and SharedString move-assignment folded-null branch. Formatter was invoked with root-relative paths from the workspace and matched no files.
  Impact: Native semantics agree for captured defined calls, but coverage acceptance and formatting are not yet met.
  Resolution: Add source-backed compile-time literal diagnostic and a genuine raw-pair self-contained move with absent folded data; format from repository root and rerun exact scoped gates. Do not relax coverage.

- Observation: Read-only registry lookup assumed nonexistent svl/inc/listener.ts.json (exit1); existing header owner names differ.
  Impact: No mutation; registry generation must use existing record schemas and actual file enumeration.
  Resolution: Use verified SAL records and enumerate active shared entries rather than inventing another example path.

- Observation: Const-reference annotation patch hit stale pre-format test context.
  Impact: Patch application must be inspected before retrying; this is a type-boundary correction, not a changed native algorithm.
  Resolution: Read actual edited files, apply the remaining nullable field annotation against current formatted lines and rerun type/scoped checks.

- Observation: Documentation patch assumed an incorrect calc-core heading; runtime const-reference annotation patch succeeded first.
  Impact: No documentation content changed. Preserve actual document and update only scoped appended section.
  Resolution: Append the new source-backed core/journal sections directly; refresh AST inventory symbols after final type annotations and validate.

- Observation: Typecheck passed; lint/JSDoc rejected undocumented native overload declarations, unified signatures, test nonnull assertions and two unused extraction imports.
  Impact: Runtime/native replay is unchanged, but required code/documentation gates fail.
  Resolution: Represent exact constructor argument combinations as tuple unions, documenting erased native overload dispatch; replace test nonnull assertions with explicit type witnesses, document assertion callbacks and remove unused imports. No policy suppression or gate weakening.

- Observation: Source-provenance gate ran during the portable-test interval while both approved upstream symlinks were deliberately removed; it failed ENOENT on an unchanged original border source.
  Impact: This is verification scheduling interference, not a provenance mismatch. Gates through dependencies/tree/lint/docs/size passed; provenance/scoped inventories need links present.
  Resolution: Let the confirmed live portable test process finish and its finally restore both links; then rerun provenance and subsequent gates serially. Keep source tests portable and native checks dependent on present pinned sources.
