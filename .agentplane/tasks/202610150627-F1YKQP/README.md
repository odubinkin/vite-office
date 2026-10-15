---
id: "202610150627-F1YKQP"
title: "Use native pooled item comparisons for rich text dependencies"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-15T06:28:03.769Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T06:33:57.940Z"
  updated_by: "CODER"
  note: "Verified137related,186Calc,39boundary tests; whole2shared/33Calc raw100, all13source gates/build/inventory pass.9paths/3897hashes/5pins/4links audited. Native comparison order/type checks retained, actual rich text/pool/model/UI/ODS pending; same-agent evaluation not independent."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T06:33:47.233Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review, not independent: native pooled-item identity/null/Which/concrete-type/value ordering restored at shared item-set sites; rich text/model readiness remains honestly pending."
  evaluated_sha: "791653ddb9f59cd5e0ceefe7df77ae81821c82d5"
  blueprint_digest: "92073e542291c4e9fcdd990dbd34fe6227cdb48421b0c10239fee44b53936d04"
  evidence_refs:
    - ".agentplane/tasks/202610150627-F1YKQP/README.md"
    - ".agentplane/tasks/202610150627-F1YKQP/quality/20261015-063347233-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610150627-F1YKQP/quality/20261015-063347233-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610150627-F1YKQP/quality/20261015-063347233-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610150627-F1YKQP/blueprint/resolved-snapshot.json"
    - "output/playwright/task148-checks/verification.json"
    - "output/playwright/task148-checks/native-source-audit.json"
    - "output/playwright/task148-checks/source-gates.json"
    - "output/playwright/task148-checks/build-manifest.json"
  findings:
    - "Original per-derived-class ItemType identity is represented by exact JS concrete-class identity; native numeric ABI and ownership managers are unnecessary. Both actual native overloads and callsites source-audited."
    - "137related,186Calc,39boundary tests and all13source gates/build pass; whole2shared and33Calc executable owners raw100. Existing Writer comparison and notification consumers tested."
    - "9intentional paths/3897source hashes/5native pins/4restored links audited, inventory zero violations and existing parity statuses preserved. Initial selection/style errors corrected and retained in task findings."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore native pooled-item identity/type/value comparison and real shared item-set integration for rich text dependencies, with scoped raw100 validation and no localization or lifetime manager."
events:
  -
    type: "status"
    at: "2026-10-15T06:28:10.640Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native pooled-item identity/type/value comparison and real shared item-set integration for rich text dependencies, with scoped raw100 validation and no localization or lifetime manager."
  -
    type: "verify"
    at: "2026-10-15T06:33:57.940Z"
    author: "CODER"
    state: "ok"
    note: "Verified137related,186Calc,39boundary tests; whole2shared/33Calc raw100, all13source gates/build/inventory pass.9paths/3897hashes/5pins/4links audited. Native comparison order/type checks retained, actual rich text/pool/model/UI/ODS pending; same-agent evaluation not independent."
doc_version: 3
doc_updated_at: "2026-10-15T06:33:58.022Z"
doc_updated_by: "CODER"
description: "Task148 ports SfxPoolItem.areSame identity/null/Which/type/value ordering and adopts it in shared SfxItemSet equality and Put as original upstream requires. This is a real shared dependency for future EditTextObject paragraph/character comparisons; no fake rich text facade, ownership manager or localization."
sections:
  Summary: "Task148 restores original SfxPoolItem.areSame and shared SfxItemSet comparisons required by rich-text paragraph and character attributes."
  Scope: "At most18intentional non-agent paths: poolitem.ts, itemset.ts, direct regression tests, existing related item-set/Writer consumers tests selected without unrelated coverage repairs, matched runtime/provenance/capability records and calc-core documentation. Native identity/null/Which/type/value order is preserved using host object/concrete-class identity. No native type-number ABI, memory manager, fake rich text, UI localization or pool facade."
  Plan: "Restore native shared pooled-item comparison and actual item-set integration, independent type/identity regressions, raw100 scoped coverage and portable gates/build, honest inventory and clean calc finish within18paths."
  Verify Steps: "Read native poolitem.cxx areSame pointer/reference overloads, poolitem.hxx ItemType declarations and itemset.cxx Equals/PutImpl. Test identity short circuit without payload evaluation, both absent/single absent, unequal Which/type before equals, equal/unequal values and sentinels. Use independent permissive-value regression to expose pre-fix wrong-type Equals and replacement; actual concrete types for ordinary equality. Run all related shared itemset/pool/item consumers and affected Writer equality tests; whole changed shared executable owners and whole Calc raw S/B/F/L counters positive100. Writer-only coverage gaps exempt. Portable tests/build remove four reference symlinks and restore finally; no native compiler/probes. All13 scoped source gates including existing boundary suite, inventory zero violations, source/native/hash audit and clean calc. Full all-app suite remains deferred until minimal connected UI plus same-model ODS readiness, then fix applicable failures and pause."
  Verification: |-
    - Command: `node output/playwright/task148-checks/portable.mjs` followed by `--shared-only` after adding the existing Writer Differentiate witness; exact commands/cwd/source absence retained in manifests.
      Result: pass.
      Evidence:137related tests/17files;186whole Calc tests/76files. Both changed shared executable owners raw S186/B142/F54/L156 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. Initial selection coverage gap retained and corrected by including existing relevant Writer test. Erased test-only type assertion style correction leaves executed test behavior unchanged; format/lint/typecheck/diff rerun.
      Scope: identity and null/undefined absence, Which/type short circuits, true/false payload delegation, sentinel distinctions and actual item-set replacement/Equals; related shared ItemInfo/pool/style/set values and Writer automatic equality/table/notifications. Four source links absent during tests/build and restored finally. No Writer-only coverage repair or threshold/source-map/counter changes.
    - Command: all13exact argv in `output/playwright/task148-checks/source-gates.json`; `node output/playwright/task148-checks/build-portable.mjs`.
      Result: pass.
      Evidence: scoped format/lint, typecheck, docs, size, dependencies, tree, provenance, inventory, routing, doctor, diff and39boundary tests; inventory zero semantic violations. Portable production build exit0.
      Scope: original shared owners and9intentional non-agent paths within18approved bound. No UI runtime, dependency graph, source gate exception or policy algorithm changes. Full all-app suite deferred until minimal connected Calc UI plus same-model ODS readiness, then applicable fixes/pause.
    - Command: source-order audit embedded in native-source-audit.json; `python3 output/playwright/task148-checks/audit-final.py`.
      Result: pass.
      Evidence: both native areSame overloads/order, native per-derived-class ItemType contract, real Equals/PutImpl callsites and sentinel null-output behavior inspected.5native source pins at9bc445578031fecf56086729d8e4940c77e14d65;3897source hashes,9intentional paths and4restored links audited. Native Writer frame attribute QA is source context only, not claimed executed or ported.
      Scope: concrete JS class identity substitutes numeric native ItemType identity without ABI enum implementation; actual comparison order retained, no lifetime/interner/weak/holder manager or fake EditTextObject. Shared Writer reuses corrected modules. Same-agent evaluator is not independent. Actual EditTextObject/ScPageHFItem/full Calc pool/model/connected UI/same-model ODS remain pending; UI localization deferred. Final clean calc/source-hash proof required at closure.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T06:33:57.940Z — VERIFY — ok

    By: CODER

    Note: Verified137related,186Calc,39boundary tests; whole2shared/33Calc raw100, all13source gates/build/inventory pass.9paths/3897hashes/5pins/4links audited. Native comparison order/type checks retained, actual rich text/pool/model/UI/ODS pending; same-agent evaluation not independent.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T06:33:32.190Z, excerpt_hash=sha256:8b403e056066144d03980d76e5ac438649bfbe6871f7047429f52e8354246b84

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150627-F1YKQP/blueprint/resolved-snapshot.json
    - old_digest: 92073e542291c4e9fcdd990dbd34fe6227cdb48421b0c10239fee44b53936d04
    - current_digest: 92073e542291c4e9fcdd990dbd34fe6227cdb48421b0c10239fee44b53936d04
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610150627-F1YKQP

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610150627-F1YKQP -m 🧩 F1YKQP task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only intentional task paths through a later authorized task; no reset, merge or publication."
  Findings: |-
    Previous shared direct equals calls omitted native concrete-type guards. This is a local implementation discrepancy, not a suspected upstream issue. JS GC owns lifetime. Same-agent evaluation is not independent.

    - Observation: Initial related selection passed121tests but whole shared-owner raw audit exposed existing Differentiate self-clear branch not included in that selection; initial plan approval also rejected a level1 Summary heading before any implementation.
      Impact: No production failure or native behavior change was found; raw100 requires the existing Writer attribute-notification test and valid canonical task headings.
      Resolution: Corrected Summary to canonical section before start; added existing native-format-attribute-notify.test.ts to related selection, retained initial coverage log and reran shared-only without replaying passed Calc.

    - Observation: Scoped lint rejected two new non-null assertions in tests; all behavioral tests, source gates other than lint, native audit and inventory already passed.
      Impact: Test source style only; no production code or executed JS behavior changes were needed.
      Resolution: Replaced the forbidden assertions with erased SfxPoolItem type assertions and reran format/lint/typecheck/diff; behavioral coverage remains from identical emitted test behavior.
id_source: "generated"
---
## Summary

Task148 restores original SfxPoolItem.areSame and shared SfxItemSet comparisons required by rich-text paragraph and character attributes.

## Scope

At most18intentional non-agent paths: poolitem.ts, itemset.ts, direct regression tests, existing related item-set/Writer consumers tests selected without unrelated coverage repairs, matched runtime/provenance/capability records and calc-core documentation. Native identity/null/Which/type/value order is preserved using host object/concrete-class identity. No native type-number ABI, memory manager, fake rich text, UI localization or pool facade.

## Plan

Restore native shared pooled-item comparison and actual item-set integration, independent type/identity regressions, raw100 scoped coverage and portable gates/build, honest inventory and clean calc finish within18paths.

## Verify Steps

Read native poolitem.cxx areSame pointer/reference overloads, poolitem.hxx ItemType declarations and itemset.cxx Equals/PutImpl. Test identity short circuit without payload evaluation, both absent/single absent, unequal Which/type before equals, equal/unequal values and sentinels. Use independent permissive-value regression to expose pre-fix wrong-type Equals and replacement; actual concrete types for ordinary equality. Run all related shared itemset/pool/item consumers and affected Writer equality tests; whole changed shared executable owners and whole Calc raw S/B/F/L counters positive100. Writer-only coverage gaps exempt. Portable tests/build remove four reference symlinks and restore finally; no native compiler/probes. All13 scoped source gates including existing boundary suite, inventory zero violations, source/native/hash audit and clean calc. Full all-app suite remains deferred until minimal connected UI plus same-model ODS readiness, then fix applicable failures and pause.

## Verification

- Command: `node output/playwright/task148-checks/portable.mjs` followed by `--shared-only` after adding the existing Writer Differentiate witness; exact commands/cwd/source absence retained in manifests.
  Result: pass.
  Evidence:137related tests/17files;186whole Calc tests/76files. Both changed shared executable owners raw S186/B142/F54/L156 and33Calc owners S4179/B2731/F821/L3727 all100, every raw counter positive. Initial selection coverage gap retained and corrected by including existing relevant Writer test. Erased test-only type assertion style correction leaves executed test behavior unchanged; format/lint/typecheck/diff rerun.
  Scope: identity and null/undefined absence, Which/type short circuits, true/false payload delegation, sentinel distinctions and actual item-set replacement/Equals; related shared ItemInfo/pool/style/set values and Writer automatic equality/table/notifications. Four source links absent during tests/build and restored finally. No Writer-only coverage repair or threshold/source-map/counter changes.
- Command: all13exact argv in `output/playwright/task148-checks/source-gates.json`; `node output/playwright/task148-checks/build-portable.mjs`.
  Result: pass.
  Evidence: scoped format/lint, typecheck, docs, size, dependencies, tree, provenance, inventory, routing, doctor, diff and39boundary tests; inventory zero semantic violations. Portable production build exit0.
  Scope: original shared owners and9intentional non-agent paths within18approved bound. No UI runtime, dependency graph, source gate exception or policy algorithm changes. Full all-app suite deferred until minimal connected Calc UI plus same-model ODS readiness, then applicable fixes/pause.
- Command: source-order audit embedded in native-source-audit.json; `python3 output/playwright/task148-checks/audit-final.py`.
  Result: pass.
  Evidence: both native areSame overloads/order, native per-derived-class ItemType contract, real Equals/PutImpl callsites and sentinel null-output behavior inspected.5native source pins at9bc445578031fecf56086729d8e4940c77e14d65;3897source hashes,9intentional paths and4restored links audited. Native Writer frame attribute QA is source context only, not claimed executed or ported.
  Scope: concrete JS class identity substitutes numeric native ItemType identity without ABI enum implementation; actual comparison order retained, no lifetime/interner/weak/holder manager or fake EditTextObject. Shared Writer reuses corrected modules. Same-agent evaluator is not independent. Actual EditTextObject/ScPageHFItem/full Calc pool/model/connected UI/same-model ODS remain pending; UI localization deferred. Final clean calc/source-hash proof required at closure.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T06:33:57.940Z — VERIFY — ok

By: CODER

Note: Verified137related,186Calc,39boundary tests; whole2shared/33Calc raw100, all13source gates/build/inventory pass.9paths/3897hashes/5pins/4links audited. Native comparison order/type checks retained, actual rich text/pool/model/UI/ODS pending; same-agent evaluation not independent.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T06:33:32.190Z, excerpt_hash=sha256:8b403e056066144d03980d76e5ac438649bfbe6871f7047429f52e8354246b84

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610150627-F1YKQP/blueprint/resolved-snapshot.json
- old_digest: 92073e542291c4e9fcdd990dbd34fe6227cdb48421b0c10239fee44b53936d04
- current_digest: 92073e542291c4e9fcdd990dbd34fe6227cdb48421b0c10239fee44b53936d04
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610150627-F1YKQP

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610150627-F1YKQP -m 🧩 F1YKQP task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only intentional task paths through a later authorized task; no reset, merge or publication.

## Findings

Previous shared direct equals calls omitted native concrete-type guards. This is a local implementation discrepancy, not a suspected upstream issue. JS GC owns lifetime. Same-agent evaluation is not independent.

- Observation: Initial related selection passed121tests but whole shared-owner raw audit exposed existing Differentiate self-clear branch not included in that selection; initial plan approval also rejected a level1 Summary heading before any implementation.
  Impact: No production failure or native behavior change was found; raw100 requires the existing Writer attribute-notification test and valid canonical task headings.
  Resolution: Corrected Summary to canonical section before start; added existing native-format-attribute-notify.test.ts to related selection, retained initial coverage log and reran shared-only without replaying passed Calc.

- Observation: Scoped lint rejected two new non-null assertions in tests; all behavioral tests, source gates other than lint, native audit and inventory already passed.
  Impact: Test source style only; no production code or executed JS behavior changes were needed.
  Resolution: Replaced the forbidden assertions with erased SfxPoolItem type assertions and reran format/lint/typecheck/diff; behavioral coverage remains from identical emitted test behavior.
