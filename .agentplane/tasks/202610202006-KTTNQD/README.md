---
id: "202610202006-KTTNQD"
title: "Implement native replacement references and similarity helpers"
status: "DOING"
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
  updated_at: "2026-10-20T20:07:34.080Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-20T20:13:02.243Z"
  updated_by: "CODER"
  note: "146 related tests pass; changed helper suite 54 tests passes after type-only lint repair; build, style, dependency/source/docs/inventory and policy checks pass. Native source/portable scope only."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: implement approved native replacement-reference and similarity helper family on writer without ICU access."
events:
  -
    type: "status"
    at: "2026-10-20T20:07:41.050Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement approved native replacement-reference and similarity helper family on writer without ICU access."
  -
    type: "verify"
    at: "2026-10-20T20:13:02.243Z"
    author: "CODER"
    state: "ok"
    note: "146 related tests pass; changed helper suite 54 tests passes after type-only lint repair; build, style, dependency/source/docs/inventory and policy checks pass. Native source/portable scope only."
doc_version: 3
doc_updated_at: "2026-10-20T20:13:02.334Z"
doc_updated_by: "CODER"
description: "Continue approved Writer search parent with complete source-shaped shared utl::TextSearch replacement expansion and similarity-scoring methods, preserving native UTF16 and directional quirks without requiring ICU."
sections:
  Summary: "Implement the original shared utl::TextSearch replacement-reference parser and complete static similarity-scoring operation family, as a substantive child of the approved Writer search/UI goal."
  Scope: "Writer checkout/branch only. Extend existing unotools TextSearch owner and header exports, use existing SAL value/buffer owners; add focused tests, source/runtime registry evidence, suspected-issue records and task artifacts. Up to 20 non-task paths. No ICU or network reads, configuration service substitutes, browser regex engine or UI parity claim."
  Plan: "1. Inspect pinned original replacement and all three similarity methods/thresholds. 2. Port original UTF16 parsing, caller-reference updates, weighted distance matrix and substring score flow on the actual shared owner. Preserve asymmetric backward ampersand expansion and empty/single-unit scoring. 3. Test exact source-derived cases, Unicode/isolated surrogate units, optional/reversed references, rejection outputs and distance properties; check existing search and SAL buffer consumers. 4. Update honest source evidence and suspected issues, run targeted checks, record review and commit/finish leaf. Keep parent configuration/backend/UI pending."
  Verify Steps: "Run new focused helper tests and existing unotools textsearch parameter/engine, i18npool normal/wildcard and Writer native-search-replace/Find_Text tests, plus affected SAL buffer tests. Run npm run build; changed-file Prettier --check and ESLint --max-warnings 0; check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size, inventory:parity:writer/shared; ap doctor; policy routing; git diff --check/status. Compare source methods and header thresholds directly. Source/portable evidence only, not native compiled ABI or regex engine fidelity. Six tasks completed since full checkpoint 6a7dd8660; this is seventh, no full run due."
  Verification: |-
    Command: npx vitest run src/unotools/source/i18n/textsearch-helpers.test.ts src/unotools/source/i18n/textsearch.test.ts src/unotools/source/i18n/textsearch-engine.test.ts src/i18npool/source/search/textsearch.test.ts src/i18npool/source/search/textsearch-wildcard.test.ts src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/crsr/native-search-replace.test.ts src/sal/rtl/oustringbuffer.test.ts --root apps/office
    Result: pass, 146 tests / eight files. After type-annotation-only matrix repair, the changed helper suite passed again (54 tests).
    Evidence: output/playwright/writer-search-helpers/tests-final.log and helpers-final.log.
    Scope: source-derived helper cases, actual wrapper result integration, existing shared/Writer search and real SAL buffer owners.

    Command: npm run build; scoped npx eslint --max-warnings 0 and npx prettier --check; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass. Initial lint, callback JSDoc and header metadata declaration checks were corrected within scope and affected checks rerun. Build retains existing chunk-size warning; doctor has zero errors and pre-existing hook-shim warning.
    Evidence: output/playwright/writer-search-helpers/check-*.log, build-final.log, lint-final.log, docs-final.log, prettier-final.log, writer-final.log and shared-final.log.
    Scope: changed code and required complete static inventories. Metadata fidelity statuses are unchanged. Original four methods and public thresholds inspected from the authorized pinned LibreOffice source. No compiled native SAL/UNO, regex/approximate search backend, full UI or whole application parity claim. No full suite due (seventh completion since 6a7dd8660).

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-20T20:13:02.243Z — VERIFY — ok

    By: CODER

    Note: 146 related tests pass; changed helper suite 54 tests passes after type-only lint repair; build, style, dependency/source/docs/inventory and policy checks pass. Native source/portable scope only.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T20:13:01.508Z, excerpt_hash=sha256:98910e4492110ba4477b8381c9348b05a4315fd806deb22eead525cfeaae4a5e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610202006-KTTNQD/blueprint/resolved-snapshot.json
    - old_digest: d4837310118e6ff7afec21d68bdcb97d6006abfb40da5c7c89607533f7444f62
    - current_digest: d4837310118e6ff7afec21d68bdcb97d6006abfb40da5c7c89607533f7444f62
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610202006-KTTNQD

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610202006-KTTNQD
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert this leaf implementation and exact registry/test documentation changes without touching prior search groundwork or user changes; keep parent open."
  Findings: |-
    Implemented complete source-defined ReplaceBackReferences and all three static similarity operations on actual shared utl::TextSearch, with existing SAL OUString/OUStringBuffer owners. Kept exact one-digit dollar capture grammar, unrecognized escape pairs, tab handling, optional capture emptiness, raw ampersand forward subtraction/size_t remainder, caller-owned scores and pair unchanged on rejection. Similarity uses exact UTF16 substring priority and original full weighted matrix/thresholds; it is not a substitute for i18npool approximate search. WRITER-018 documents the original backward ampersand asymmetry and preserves it, with actual wrapper result evidence.

    Initial checks: ESLint rejects non-null assertions, so matrix indexing now binds already-allocated source rows through explicit erased array types. Test callbacks received required JSDoc. The runtime header inventory accepts declaration symbols rather than constants merely re-exported from another file; corrected only the claimed local symbol data, with no detector or known-violation changes. All affected checks pass after correction. Source/runtime classifications and unverified statuses remain unchanged.

    Analogous incident advice was reviewed: maintain source-backed expectations, inspect bounded failures and repair only affected in-scope fixtures/metadata. No incident policy change is needed. ICU access remains pending; no ICU/network or other outside-repository reads were needed. Parent item/configuration, backend algorithms and browser UI remain open. All changes stay on writer in vite-office-writer; no branch merge.
id_source: "generated"
---
## Summary

Implement the original shared utl::TextSearch replacement-reference parser and complete static similarity-scoring operation family, as a substantive child of the approved Writer search/UI goal.

## Scope

Writer checkout/branch only. Extend existing unotools TextSearch owner and header exports, use existing SAL value/buffer owners; add focused tests, source/runtime registry evidence, suspected-issue records and task artifacts. Up to 20 non-task paths. No ICU or network reads, configuration service substitutes, browser regex engine or UI parity claim.

## Plan

1. Inspect pinned original replacement and all three similarity methods/thresholds. 2. Port original UTF16 parsing, caller-reference updates, weighted distance matrix and substring score flow on the actual shared owner. Preserve asymmetric backward ampersand expansion and empty/single-unit scoring. 3. Test exact source-derived cases, Unicode/isolated surrogate units, optional/reversed references, rejection outputs and distance properties; check existing search and SAL buffer consumers. 4. Update honest source evidence and suspected issues, run targeted checks, record review and commit/finish leaf. Keep parent configuration/backend/UI pending.

## Verify Steps

Run new focused helper tests and existing unotools textsearch parameter/engine, i18npool normal/wildcard and Writer native-search-replace/Find_Text tests, plus affected SAL buffer tests. Run npm run build; changed-file Prettier --check and ESLint --max-warnings 0; check:dependencies, check:source-provenance, check:source-tree, check:docs, check:file-size, inventory:parity:writer/shared; ap doctor; policy routing; git diff --check/status. Compare source methods and header thresholds directly. Source/portable evidence only, not native compiled ABI or regex engine fidelity. Six tasks completed since full checkpoint 6a7dd8660; this is seventh, no full run due.

## Verification

Command: npx vitest run src/unotools/source/i18n/textsearch-helpers.test.ts src/unotools/source/i18n/textsearch.test.ts src/unotools/source/i18n/textsearch-engine.test.ts src/i18npool/source/search/textsearch.test.ts src/i18npool/source/search/textsearch-wildcard.test.ts src/sw/source/core/crsr/findtxt.test.ts src/sw/source/core/crsr/native-search-replace.test.ts src/sal/rtl/oustringbuffer.test.ts --root apps/office
Result: pass, 146 tests / eight files. After type-annotation-only matrix repair, the changed helper suite passed again (54 tests).
Evidence: output/playwright/writer-search-helpers/tests-final.log and helpers-final.log.
Scope: source-derived helper cases, actual wrapper result integration, existing shared/Writer search and real SAL buffer owners.

Command: npm run build; scoped npx eslint --max-warnings 0 and npx prettier --check; npm run check:dependencies; npm run check:source-provenance; npm run check:source-tree; npm run check:docs; npm run check:file-size; npm run inventory:parity:writer; npm run inventory:parity:shared; ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass. Initial lint, callback JSDoc and header metadata declaration checks were corrected within scope and affected checks rerun. Build retains existing chunk-size warning; doctor has zero errors and pre-existing hook-shim warning.
Evidence: output/playwright/writer-search-helpers/check-*.log, build-final.log, lint-final.log, docs-final.log, prettier-final.log, writer-final.log and shared-final.log.
Scope: changed code and required complete static inventories. Metadata fidelity statuses are unchanged. Original four methods and public thresholds inspected from the authorized pinned LibreOffice source. No compiled native SAL/UNO, regex/approximate search backend, full UI or whole application parity claim. No full suite due (seventh completion since 6a7dd8660).

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-20T20:13:02.243Z — VERIFY — ok

By: CODER

Note: 146 related tests pass; changed helper suite 54 tests passes after type-only lint repair; build, style, dependency/source/docs/inventory and policy checks pass. Native source/portable scope only.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-20T20:13:01.508Z, excerpt_hash=sha256:98910e4492110ba4477b8381c9348b05a4315fd806deb22eead525cfeaae4a5e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610202006-KTTNQD/blueprint/resolved-snapshot.json
- old_digest: d4837310118e6ff7afec21d68bdcb97d6006abfb40da5c7c89607533f7444f62
- current_digest: d4837310118e6ff7afec21d68bdcb97d6006abfb40da5c7c89607533f7444f62
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610202006-KTTNQD

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610202006-KTTNQD
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert this leaf implementation and exact registry/test documentation changes without touching prior search groundwork or user changes; keep parent open.

## Findings

Implemented complete source-defined ReplaceBackReferences and all three static similarity operations on actual shared utl::TextSearch, with existing SAL OUString/OUStringBuffer owners. Kept exact one-digit dollar capture grammar, unrecognized escape pairs, tab handling, optional capture emptiness, raw ampersand forward subtraction/size_t remainder, caller-owned scores and pair unchanged on rejection. Similarity uses exact UTF16 substring priority and original full weighted matrix/thresholds; it is not a substitute for i18npool approximate search. WRITER-018 documents the original backward ampersand asymmetry and preserves it, with actual wrapper result evidence.

Initial checks: ESLint rejects non-null assertions, so matrix indexing now binds already-allocated source rows through explicit erased array types. Test callbacks received required JSDoc. The runtime header inventory accepts declaration symbols rather than constants merely re-exported from another file; corrected only the claimed local symbol data, with no detector or known-violation changes. All affected checks pass after correction. Source/runtime classifications and unverified statuses remain unchanged.

Analogous incident advice was reviewed: maintain source-backed expectations, inspect bounded failures and repair only affected in-scope fixtures/metadata. No incident policy change is needed. ICU access remains pending; no ICU/network or other outside-repository reads were needed. Parent item/configuration, backend algorithms and browser UI remain open. All changes stay on writer in vite-office-writer; no branch merge.
