---
id: "202610202016-PC6WK7"
title: "Refactor search results to native UNO sequence value contracts"
result_summary: "refactor search results to native UNO sequence value contracts"
status: "DONE"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-20T20:16:47.424Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T20:25:46.258Z"
  updated_by: "CODER"
  note: "166 related cases pass; final affected search replay 137 cases and boundary tooling 48 cases pass. Build and required static/source/registry checks pass; real Sequence contracts replace result arrays without full ABI/UI claim."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-20T20:26:25.352Z"
  updated_by: "EVALUATOR"
  note: "At 9dff2d0282f0 the old result-array shortcut is replaced throughout represented search by real generated value/shared Sequence contracts."
  evaluated_sha: "9dff2d0282f0bdc1cf45694bce8a56b936819f2d"
  blueprint_digest: "1518f4711c0237fbad337f203ea3743aa2ef4f9101cb4e9076e01ccc42c6c81a"
  evidence_refs:
    - ".agentplane/tasks/202610202016-PC6WK7/README.md"
    - ".agentplane/tasks/202610202016-PC6WK7/quality/20261020-202625352-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610202016-PC6WK7/quality/20261020-202625352-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610202016-PC6WK7/quality/20261020-202625352-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610202016-PC6WK7/blueprint/resolved-snapshot.json"
    - "output/playwright/writer-search-result/tests-final.log"
    - "output/playwright/writer-search-result/tests-final-values.log"
    - "output/playwright/writer-search-result/tooling-final.log"
    - "output/playwright/writer-search-result/build-final.log"
  findings:
    - "Reviewed SearchResult IDL, cppumaker constructors/equality and existing Sequence semantics against the changed owner and producers/consumers. Default/full/copy, stable assignment, COW, directional result mapping, equality and local destruction match the represented source contracts."
    - "166 related cases pass, including Writer and frozen native public Sequence replay; final changed search replay passes 137 cases and boundary tooling passes 48 cases. Build/static/source registries pass after precise type/dependency repairs. Literal observation adapters stay in test paths; no guard algorithm or fidelity status was weakened."
commit:
  hash: "9dff2d0282f0bdc1cf45694bce8a56b936819f2d"
  message: "🧩 PC6WK7 search: preserve native result sequence value contracts"
comments:
  -
    author: "CODER"
    body: "Start: replace the old search result array shortcut with actual shared UNO sequence owners and migrate the complete represented search path."
  -
    author: "CODER"
    body: "Verified: replaced search result arrays with actual UNO sequence values throughout represented engine/wrapper/replacement paths; related tests, native Sequence fixture replay, build and required static checks pass. Parent configuration and UI remain open."
events:
  -
    type: "status"
    at: "2026-10-20T20:16:53.722Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: replace the old search result array shortcut with actual shared UNO sequence owners and migrate the complete represented search path."
  -
    type: "verify"
    at: "2026-10-20T20:25:46.258Z"
    author: "CODER"
    state: "ok"
    note: "166 related cases pass; final affected search replay 137 cases and boundary tooling 48 cases pass. Build and required static/source/registry checks pass; real Sequence contracts replace result arrays without full ABI/UI claim."
  -
    type: "status"
    at: "2026-10-20T20:26:35.242Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: replaced search result arrays with actual UNO sequence values throughout represented engine/wrapper/replacement paths; related tests, native Sequence fixture replay, build and required static checks pass. Parent configuration and UI remain open."
doc_version: 3
doc_updated_at: "2026-10-20T20:26:35.244Z"
doc_updated_by: "CODER"
description: "Replace the old array-shaped SearchResult shortcut throughout the shared search engine/wrapper/replacement path with actual generated struct value and shared Sequence<sal_Int32> owners; preserve directional offsets, defaults, copy-on-write and existing algorithms."
sections:
  Summary: "Replace the old parallel JavaScript-array SearchResult shortcut with the original generated UNO struct and actual shared Sequence<sal_Int32> value contracts across native search producers and consumers."
  Scope: "Only vite-office-writer on writer. Up to 35 non-task paths: SearchResult value owner, shared engine/wrapper/helper consumers, related search tests/new value tests and test caller bindings, exact source-backed boundary data if needed, runtime/provenance records and documentation. No replacement Sequence backend, proxy numeric indexing, fake generated type/provider, unrelated configuration/ICU/backend algorithms or browser UI claims."
  Plan: "1. Inspect original SearchResult.idl and actual shared Sequence constructor, assignment, COW and access contracts. 2. Implement zero/default, complete/copy construction, field assignment and erased destructor using actual Sequence<sal_Int32> owners. 3. Migrate absolute/wildcard/remapping producers and wrapper/backreference consumers to actual sequences; remove structural result array paths. 4. Migrate tests through explicit test-only caller encoding/observation helpers and add ownership/COW/independence and end-to-end tests. 5. Run scoped verification/static registries, record review and commit/finish this leaf; keep parent configuration, advanced engine and UI open."
  Verify Steps: "Run new SearchResult value/COW tests, affected i18npool normal/wildcard/options, unotools wrapper/helper/parameter and Writer Find_Text/replacement tests plus actual shared public Sequence tests. Run npm run build; scoped Prettier --check and ESLint --max-warnings 0; check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size and inventory:parity:writer/shared. Run boundary tooling tests if dependency data changes. Run ap doctor, policy routing, git diff --check and git status --short --untracked-files=all. Inspect default/field order and real sequence access/assignment/COW, retain raw directional offsets. Do not promote portable/source checks to compiled native UNO ABI or full UI parity. Seven completed tasks since full checkpoint 6a7dd8660; this would be eighth, full suite is not due."
  Verification: |-
    Command: npx vitest run src/i18npool/source/search/native-search-result.test.ts src/i18npool/source/search/textsearch.test.ts src/i18npool/source/search/textsearch-wildcard.test.ts src/i18npool/source/search/native-search-option-interop.test.ts src/unotools/source/i18n/textsearch.test.ts src/unotools/source/i18n/textsearch-engine.test.ts src/unotools/source/i18n/textsearch-helpers.test.ts src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/crsr/native-search-replace.test.ts src/cppu/inc/com/sun/star/uno/Sequence.test.ts --root apps/office
    Result: pass, 166 cases in ten files. After adding generated equality/inequality and its extra test, affected six search files pass again (137 cases; overlapping replay, not additive).
    Evidence: output/playwright/writer-search-result/tests-final.log and tests-final-values.log.
    Scope: actual generated result and shared sequence owners, source-shaped assignment/COW/direction/exception boundaries; existing parameter, normal/wildcard search and Writer replacement/Find_Text, plus frozen native public Sequence fixture replay.

    Command: npx vitest run scripts/native-search-boundary.test.ts scripts/check-module-boundaries.test.ts --environment node
    Result: pass, 48 cases in two files.
    Evidence: output/playwright/writer-search-result/tooling-final.log.
    Scope: exact source-backed Sequence edge, neighbor/browser rejection and unchanged broad forbidden edges.

    Command: npm run build; scoped npx prettier --check and npx eslint --max-warnings 0; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass after in-scope pointer-type/dependency data repairs. Build retains existing chunk-size warning. Doctor has zero errors and the pre-existing managed-hook readiness warning.
    Evidence: ignored output/playwright/writer-search-result/check-*.log, build-final.log, dependencies-repaired.log, style-final.log, eslint-final.log, provenance-final.log, writer-final.log and shared-final.log.
    Scope: changed authored paths and required static inventories. Seven prior task completions since full checkpoint 6a7dd8660; this leaf is eighth and no full run is due. No fresh native compiled result/UNO ABI or whole application/UI parity claim.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T20:25:46.258Z — VERIFY — ok

    By: CODER

    Note: 166 related cases pass; final affected search replay 137 cases and boundary tooling 48 cases pass. Build and required static/source/registry checks pass; real Sequence contracts replace result arrays without full ABI/UI claim.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T20:25:45.303Z, excerpt_hash=sha256:ee4cc86e1bd7fc0d806d22cd30062c30e974ac3372403e0f215ccafcd72eb5d8

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610202016-PC6WK7/blueprint/resolved-snapshot.json
    - old_digest: 1518f4711c0237fbad337f203ea3743aa2ef4f9101cb4e9076e01ccc42c6c81a
    - current_digest: 1518f4711c0237fbad337f203ea3743aa2ef4f9101cb4e9076e01ccc42c6c81a
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610202016-PC6WK7

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610202016-PC6WK7
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only this result-value refactor and its tests/registry/task evidence, preserving existing search algorithms and prior completed leaves."
  Findings: |-
    Replaced the old array-shaped SearchResult interface with actual generated default/full/copy values, stable two-member sequence ownership, assignment, equality/inequality and erased destructor over the existing shared Sequence<sal_Int32> library. Const sequence reads and mutable COW scalar-cell accesses are explicit; no numeric-index Proxy, alternate sequence implementation or production array transport. Native normal/wildcard/no-match/remapping producers and wrapper/backreference consumers all use those values.

    The previous wrapper replaced the output object's identity on success; original generated assignment instead preserves the caller struct/member addresses. Updated that boundary, local result destruction and original catch-only-UNO Exception behavior. WRITER-019 records and preserves the source positive-forward/nonzero-backward count condition; represented actual engines still produce only zero/one. Test spies for exceptional or negative-count service boundaries are explicitly test-only, not invented production peers.

    Initial new test expectation used the same backward endpoint for normal ss and wildcard s? on folded xssy. The latter genuinely selects the later sy span, so the source-derived expectation now retains its correct source end offset 3. No engine algorithm changed. Initial build required binding getArray's native addressed scalar storage as existing SequenceElements rather than calling .get on the generic byte-or-address union. Added only the exact original i18npool textsearch -> cppu Sequence dependency data and tested negative neighbors; no dependency enforcement algorithm/global edge was weakened. All checks pass after repairs.

    Source evidence includes pinned SearchResult.idl, cppumaker PlainStructType declaration/constructor/equality generator, Sequence.h/hxx and search caller definitions. Registry classifications/statuses remain unchanged. Test fixtures now construct and compare actual native values; literal array decoding is restricted to test caller observations. Existing native public Sequence captured results replay unchanged.

    Authorized local LibreOffice source reading was sufficient. ICU/network remain unapproved and unused. Configuration service dependencies, actual item/configuration defaults, unported algorithms/layout/fields/notes and full browser search UI remain pending under the active parent. No merge, external publication, policy mutation or unrelated file changes.
extensions:
  implementation_commit:
    hash: "9dff2d0282f0bdc1cf45694bce8a56b936819f2d"
    message: "🧩 PC6WK7 search: preserve native result sequence value contracts"
id_source: "generated"
---
## Summary

Replace the old parallel JavaScript-array SearchResult shortcut with the original generated UNO struct and actual shared Sequence<sal_Int32> value contracts across native search producers and consumers.

## Scope

Only vite-office-writer on writer. Up to 35 non-task paths: SearchResult value owner, shared engine/wrapper/helper consumers, related search tests/new value tests and test caller bindings, exact source-backed boundary data if needed, runtime/provenance records and documentation. No replacement Sequence backend, proxy numeric indexing, fake generated type/provider, unrelated configuration/ICU/backend algorithms or browser UI claims.

## Plan

1. Inspect original SearchResult.idl and actual shared Sequence constructor, assignment, COW and access contracts. 2. Implement zero/default, complete/copy construction, field assignment and erased destructor using actual Sequence<sal_Int32> owners. 3. Migrate absolute/wildcard/remapping producers and wrapper/backreference consumers to actual sequences; remove structural result array paths. 4. Migrate tests through explicit test-only caller encoding/observation helpers and add ownership/COW/independence and end-to-end tests. 5. Run scoped verification/static registries, record review and commit/finish this leaf; keep parent configuration, advanced engine and UI open.

## Verify Steps

Run new SearchResult value/COW tests, affected i18npool normal/wildcard/options, unotools wrapper/helper/parameter and Writer Find_Text/replacement tests plus actual shared public Sequence tests. Run npm run build; scoped Prettier --check and ESLint --max-warnings 0; check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size and inventory:parity:writer/shared. Run boundary tooling tests if dependency data changes. Run ap doctor, policy routing, git diff --check and git status --short --untracked-files=all. Inspect default/field order and real sequence access/assignment/COW, retain raw directional offsets. Do not promote portable/source checks to compiled native UNO ABI or full UI parity. Seven completed tasks since full checkpoint 6a7dd8660; this would be eighth, full suite is not due.

## Verification

Command: npx vitest run src/i18npool/source/search/native-search-result.test.ts src/i18npool/source/search/textsearch.test.ts src/i18npool/source/search/textsearch-wildcard.test.ts src/i18npool/source/search/native-search-option-interop.test.ts src/unotools/source/i18n/textsearch.test.ts src/unotools/source/i18n/textsearch-engine.test.ts src/unotools/source/i18n/textsearch-helpers.test.ts src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/crsr/native-search-replace.test.ts src/cppu/inc/com/sun/star/uno/Sequence.test.ts --root apps/office
Result: pass, 166 cases in ten files. After adding generated equality/inequality and its extra test, affected six search files pass again (137 cases; overlapping replay, not additive).
Evidence: output/playwright/writer-search-result/tests-final.log and tests-final-values.log.
Scope: actual generated result and shared sequence owners, source-shaped assignment/COW/direction/exception boundaries; existing parameter, normal/wildcard search and Writer replacement/Find_Text, plus frozen native public Sequence fixture replay.

Command: npx vitest run scripts/native-search-boundary.test.ts scripts/check-module-boundaries.test.ts --environment node
Result: pass, 48 cases in two files.
Evidence: output/playwright/writer-search-result/tooling-final.log.
Scope: exact source-backed Sequence edge, neighbor/browser rejection and unchanged broad forbidden edges.

Command: npm run build; scoped npx prettier --check and npx eslint --max-warnings 0; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass after in-scope pointer-type/dependency data repairs. Build retains existing chunk-size warning. Doctor has zero errors and the pre-existing managed-hook readiness warning.
Evidence: ignored output/playwright/writer-search-result/check-*.log, build-final.log, dependencies-repaired.log, style-final.log, eslint-final.log, provenance-final.log, writer-final.log and shared-final.log.
Scope: changed authored paths and required static inventories. Seven prior task completions since full checkpoint 6a7dd8660; this leaf is eighth and no full run is due. No fresh native compiled result/UNO ABI or whole application/UI parity claim.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T20:25:46.258Z — VERIFY — ok

By: CODER

Note: 166 related cases pass; final affected search replay 137 cases and boundary tooling 48 cases pass. Build and required static/source/registry checks pass; real Sequence contracts replace result arrays without full ABI/UI claim.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T20:25:45.303Z, excerpt_hash=sha256:ee4cc86e1bd7fc0d806d22cd30062c30e974ac3372403e0f215ccafcd72eb5d8

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610202016-PC6WK7/blueprint/resolved-snapshot.json
- old_digest: 1518f4711c0237fbad337f203ea3743aa2ef4f9101cb4e9076e01ccc42c6c81a
- current_digest: 1518f4711c0237fbad337f203ea3743aa2ef4f9101cb4e9076e01ccc42c6c81a
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610202016-PC6WK7

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610202016-PC6WK7
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only this result-value refactor and its tests/registry/task evidence, preserving existing search algorithms and prior completed leaves.

## Findings

Replaced the old array-shaped SearchResult interface with actual generated default/full/copy values, stable two-member sequence ownership, assignment, equality/inequality and erased destructor over the existing shared Sequence<sal_Int32> library. Const sequence reads and mutable COW scalar-cell accesses are explicit; no numeric-index Proxy, alternate sequence implementation or production array transport. Native normal/wildcard/no-match/remapping producers and wrapper/backreference consumers all use those values.

The previous wrapper replaced the output object's identity on success; original generated assignment instead preserves the caller struct/member addresses. Updated that boundary, local result destruction and original catch-only-UNO Exception behavior. WRITER-019 records and preserves the source positive-forward/nonzero-backward count condition; represented actual engines still produce only zero/one. Test spies for exceptional or negative-count service boundaries are explicitly test-only, not invented production peers.

Initial new test expectation used the same backward endpoint for normal ss and wildcard s? on folded xssy. The latter genuinely selects the later sy span, so the source-derived expectation now retains its correct source end offset 3. No engine algorithm changed. Initial build required binding getArray's native addressed scalar storage as existing SequenceElements rather than calling .get on the generic byte-or-address union. Added only the exact original i18npool textsearch -> cppu Sequence dependency data and tested negative neighbors; no dependency enforcement algorithm/global edge was weakened. All checks pass after repairs.

Source evidence includes pinned SearchResult.idl, cppumaker PlainStructType declaration/constructor/equality generator, Sequence.h/hxx and search caller definitions. Registry classifications/statuses remain unchanged. Test fixtures now construct and compare actual native values; literal array decoding is restricted to test caller observations. Existing native public Sequence captured results replay unchanged.

Authorized local LibreOffice source reading was sufficient. ICU/network remain unapproved and unused. Configuration service dependencies, actual item/configuration defaults, unported algorithms/layout/fields/notes and full browser search UI remain pending under the active parent. No merge, external publication, policy mutation or unrelated file changes.
