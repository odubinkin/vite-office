---
id: "202610151922-BZZ72F"
title: "Connect native locale uppercase for Calc string interning"
result_summary: "Connected required source whole/range uppercase operation for Calc interning, confirmed native-JS differences, reused shared mappings and fixed the shared CPPU initialization dependency."
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
  updated_at: "2026-10-15T19:22:24.061Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-15T19:48:18.327Z"
  updated_by: "CODER"
  note: "PASS: node output/playwright/task166-checks/portable.mjs yields48 related tests/4files and187 Calc/76files; exact3 shared owners S20/B8/F3/L16 and33Calc S4179/B2731/F821/L3727 raw100. build-browser-portable.mjs:production build and2 actual Chromium shared scenarios pass with4 native source links absent/restored. native-audit.mjs pins9 source blobs,19 uppercase assertions/7native QA fixtures,6 JS difference witnesses and14 top-level guard function bodies unchanged. source-gates.mjs all13 pass,including43 boundary tests and inventory. Final evidence output/playwright/task166-checks/final-verification.json. No new ICU/memory/provider or Calc document/UI/ODS readiness claim; full run deferred to user milestone."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-15T19:49:25.649Z"
  updated_by: "EVALUATOR"
  note: "Same-agent review: source whole/range uppercase operation and genuine CPPU catch boundary pass bounded conformance."
  evaluated_sha: "670570562024594d21a73e4f426d309b96b08f0d"
  blueprint_digest: "9612e3e548938a106574786e4e1c628ff3df7991337e9f01f6fce793b0da81d9"
  evidence_refs:
    - ".agentplane/tasks/202610151922-BZZ72F/README.md"
    - ".agentplane/tasks/202610151922-BZZ72F/quality/20261015-194925649-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610151922-BZZ72F/quality/20261015-194925649-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610151922-BZZ72F/quality/20261015-194925649-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610151922-BZZ72F/blueprint/resolved-snapshot.json"
    - "output/playwright/task166-checks/final-verification.json"
    - "output/playwright/task166-checks/native-audit.json"
    - "output/playwright/task166-checks/gate-inventory-final.log"
  findings:
    - "Original clamp and ToUpper no-offset mapping use genuine OUString/Locale and existing i18nutil; Chromium confirms six JS divergences. No new ICU or fake complete CharClass/UNO/memory provider."
    - "48 related,187Calc,production build,2 Chromium shared scenarios and13 source gates pass; exact raw100 owner sets and9 native source pins verified. Final bounded capability acceptance recorded in current source commit."
commit:
  hash: "b446a569b89a863a20a9c37245027f34481c5189"
  message: "🧩 BZZ72F task: record locale uppercase quality review"
comments:
  -
    author: "CODER"
    body: "Start: implement the required source-backed uppercase field operation at original module boundaries, reuse actual shared mappings and verify whole-string JS counterexamples without a new ICU/service facade."
  -
    author: "CODER"
    body: "Verified: source locale uppercase operation preserves original range, mapping and UNO exception contracts;48 related,187Calc,2 Chromium shared scenarios,production build and13 gates pass with strict raw100."
events:
  -
    type: "status"
    at: "2026-10-15T19:22:49.115Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: implement the required source-backed uppercase field operation at original module boundaries, reuse actual shared mappings and verify whole-string JS counterexamples without a new ICU/service facade."
  -
    type: "verify"
    at: "2026-10-15T19:48:18.327Z"
    author: "CODER"
    state: "ok"
    note: "PASS: node output/playwright/task166-checks/portable.mjs yields48 related tests/4files and187 Calc/76files; exact3 shared owners S20/B8/F3/L16 and33Calc S4179/B2731/F821/L3727 raw100. build-browser-portable.mjs:production build and2 actual Chromium shared scenarios pass with4 native source links absent/restored. native-audit.mjs pins9 source blobs,19 uppercase assertions/7native QA fixtures,6 JS difference witnesses and14 top-level guard function bodies unchanged. source-gates.mjs all13 pass,including43 boundary tests and inventory. Final evidence output/playwright/task166-checks/final-verification.json. No new ICU/memory/provider or Calc document/UI/ODS readiness claim; full run deferred to user milestone."
  -
    type: "status"
    at: "2026-10-15T19:49:34.644Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: source locale uppercase operation preserves original range, mapping and UNO exception contracts;48 related,187Calc,2 Chromium shared scenarios,production build and13 gates pass with strict raw100."
doc_version: 3
doc_updated_at: "2026-10-15T19:49:34.646Z"
doc_updated_by: "CODER"
description: "Task166: implement source-aligned locale uppercase operation across original unotools/i18npool boundaries using actual shared Locale/OUString and existing i18nutil mappings. Verify native JS equivalence and retain source behavior where counterexamples exist; no fake CharClass/UNO service or new ICU/memory library."
sections:
  Summary: "Task166: actual source-backed locale uppercase operation required by Calc SharedStringPool, reusing existing case mappings instead of a non-equivalent whole-string JS replacement."
  Scope: "Field-specific uppercase functions in original unotools/inc/charclass.ts, source/i18n/charclass.ts, i18npool/source/characterclassification/cclass_unicode.ts and source/transliteration/transliteration_body.ts; one focused test and conformance evidence; associated shared registry/capability records, Calc docs and necessary original module edges (up to20 non-task paths). No fabricated full CharClass/UNO/Transliteration class, custom memory/refcount/weak/cache manager, native probe/compiler, new ICU implementation or browser consumer migration."
  Plan: "Trace original CharClass uppercase overloads/catch boundary, cclass_Unicode range clamp and no-offset transliterateImpl ToUpper mapping loop. Port this complete required operation as explicit field bindings at original module boundaries using real OUString/Locale, existing MappingType/getValue and native GC-managed typed data. Compare to native JS and retain confirmed divergence witnesses; do not introduce a full service facade or claim complete LanguageTag/CharClass. Test original mapped cases, locale distinctions, expanding/deleting/surrogate mappings, valid ranges/empty/end/overrun clamp, actual UNO exception fallback and propagation of unrelated JS errors. Register bounded evidence and remaining actual string pool/document dependencies; strict raw100 for new executable owners and all Calc, related shared/Writer tests and13 source gates. No app/browser behavior change or full-suite milestone claim."
  Verify Steps: "Audit pinned unotools charclass header/source, cclass_unicode, transliteration_body/commonclass and existing casefolding mapping data; verify exact full/range overload and original ToUpper mode/loop and exception boundary without native compilation. Test genuine shared Locale/OUString values, selected range/count clamp and preserved original input backing for source neighbor rules, expansion/null/surrogate boundaries, en/tr/az/lt/el whole-string JS differences and ASCII matches; compare source-mapping fixtures and real UNO exception type fallback versus unrelated JS errors. New shared owner exact raw S/B/F/L100/all counters positive and all33 Calc owners raw100 with4 reference symlinks absent/restored; run related actual shared/Writer tests and13 existing gates/inventory/provenance. No new ICU/library memory engine, fake full service or UI/ODS readiness claim; no full all-app suite before user milestone."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-15T19:48:18.327Z — VERIFY — ok

    By: CODER

    Note: PASS: node output/playwright/task166-checks/portable.mjs yields48 related tests/4files and187 Calc/76files; exact3 shared owners S20/B8/F3/L16 and33Calc S4179/B2731/F821/L3727 raw100. build-browser-portable.mjs:production build and2 actual Chromium shared scenarios pass with4 native source links absent/restored. native-audit.mjs pins9 source blobs,19 uppercase assertions/7native QA fixtures,6 JS difference witnesses and14 top-level guard function bodies unchanged. source-gates.mjs all13 pass,including43 boundary tests and inventory. Final evidence output/playwright/task166-checks/final-verification.json. No new ICU/memory/provider or Calc document/UI/ODS readiness claim; full run deferred to user milestone.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T19:47:09.326Z, excerpt_hash=sha256:f66da0a7b9aee081fc755f2a643b3912499333cae99bad1a10b7aec183f27f9e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151922-BZZ72F/blueprint/resolved-snapshot.json
    - old_digest: 9612e3e548938a106574786e4e1c628ff3df7991337e9f01f6fce793b0da81d9
    - current_digest: 9612e3e548938a106574786e4e1c628ff3df7991337e9f01f6fce793b0da81d9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610151922-BZZ72F

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610151922-BZZ72F
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task source/test/evidence/registry/docs commit together; existing scalar mappings and all previous tasks stay intact. No document state, browser entrypoint or string pool lifecycle is migrated by this task."
  Findings: |-
    - Observation: Initial related run:20 existing cases passed; new uppercase suite failed during module evaluation with Class extends value undefined at RuntimeException extends Exception. Direct import of Exception reaches Reference -> Any -> genfunc -> RuntimeException before the base class is initialized.
      Impact: No new uppercase assertions executed. This is an existing shared CPPU entry-order defect exposed by the genuine base-exception catch boundary; it must not be hidden by consumer import ordering.
      Resolution: Persist the approved uppercase work as an unverified checkpoint, open a separate source-scoped CPPU initialization correction, preserve public exception class identity/member bodies/type factory and test independent public entry orders. Resume this task after the dependency fix; no goal/full-suite milestone change.

    - Observation: After shared exception fix:48 related tests/4 files,187 Calc tests/76 files and2 Chromium shared scenarios pass; strict3 shared owners S20/B8/F3/L16 and33 Calc S4179/B2731/F821/L3727 all raw counters positive. Native audit pins9 blobs,7 native fixtures/19 uppercase assertions and6 JS divergence witnesses. Metadata gate failures found incorrect QA marker suffixes and the dependency task common-unit filename explanation; no production behavior failed.
      Impact: Whole-string JS locale uppercasing is not equivalent for the selected source contracts. Existing i18nutil mappings are required; no new ICU implementation is justified. Pending metadata gates must pass before task closure.
      Resolution: Use exact testTitleCase/testSigma source fixture names, record explicit ESM module-resolution filename necessity in task166a provenance, retain no full class/service/document/UI/ODS parity claim. Re-run only failed/pending source gates.

    - Observation: Evaluator pass rejected with evaluated_sha_missing after task166a close moved HEAD onto another task-only closure commit. No implementation or test failure occurred.
      Impact: Task166 quality review must be attached to a committed task166 result rather than the unrelated closure tail.
      Resolution: Persist the bounded completed acceptance evidence in this task capability record and commit its exact scope with task artifacts, then evaluate that concrete current commit; do not force finish.
extensions:
  implementation_commit:
    hash: "670570562024594d21a73e4f426d309b96b08f0d"
    message: "🔧 BZZ72F core: persist bounded locale uppercase acceptance evidence"
id_source: "generated"
---
## Summary

Task166: actual source-backed locale uppercase operation required by Calc SharedStringPool, reusing existing case mappings instead of a non-equivalent whole-string JS replacement.

## Scope

Field-specific uppercase functions in original unotools/inc/charclass.ts, source/i18n/charclass.ts, i18npool/source/characterclassification/cclass_unicode.ts and source/transliteration/transliteration_body.ts; one focused test and conformance evidence; associated shared registry/capability records, Calc docs and necessary original module edges (up to20 non-task paths). No fabricated full CharClass/UNO/Transliteration class, custom memory/refcount/weak/cache manager, native probe/compiler, new ICU implementation or browser consumer migration.

## Plan

Trace original CharClass uppercase overloads/catch boundary, cclass_Unicode range clamp and no-offset transliterateImpl ToUpper mapping loop. Port this complete required operation as explicit field bindings at original module boundaries using real OUString/Locale, existing MappingType/getValue and native GC-managed typed data. Compare to native JS and retain confirmed divergence witnesses; do not introduce a full service facade or claim complete LanguageTag/CharClass. Test original mapped cases, locale distinctions, expanding/deleting/surrogate mappings, valid ranges/empty/end/overrun clamp, actual UNO exception fallback and propagation of unrelated JS errors. Register bounded evidence and remaining actual string pool/document dependencies; strict raw100 for new executable owners and all Calc, related shared/Writer tests and13 source gates. No app/browser behavior change or full-suite milestone claim.

## Verify Steps

Audit pinned unotools charclass header/source, cclass_unicode, transliteration_body/commonclass and existing casefolding mapping data; verify exact full/range overload and original ToUpper mode/loop and exception boundary without native compilation. Test genuine shared Locale/OUString values, selected range/count clamp and preserved original input backing for source neighbor rules, expansion/null/surrogate boundaries, en/tr/az/lt/el whole-string JS differences and ASCII matches; compare source-mapping fixtures and real UNO exception type fallback versus unrelated JS errors. New shared owner exact raw S/B/F/L100/all counters positive and all33 Calc owners raw100 with4 reference symlinks absent/restored; run related actual shared/Writer tests and13 existing gates/inventory/provenance. No new ICU/library memory engine, fake full service or UI/ODS readiness claim; no full all-app suite before user milestone.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-15T19:48:18.327Z — VERIFY — ok

By: CODER

Note: PASS: node output/playwright/task166-checks/portable.mjs yields48 related tests/4files and187 Calc/76files; exact3 shared owners S20/B8/F3/L16 and33Calc S4179/B2731/F821/L3727 raw100. build-browser-portable.mjs:production build and2 actual Chromium shared scenarios pass with4 native source links absent/restored. native-audit.mjs pins9 source blobs,19 uppercase assertions/7native QA fixtures,6 JS difference witnesses and14 top-level guard function bodies unchanged. source-gates.mjs all13 pass,including43 boundary tests and inventory. Final evidence output/playwright/task166-checks/final-verification.json. No new ICU/memory/provider or Calc document/UI/ODS readiness claim; full run deferred to user milestone.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-15T19:47:09.326Z, excerpt_hash=sha256:f66da0a7b9aee081fc755f2a643b3912499333cae99bad1a10b7aec183f27f9e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610151922-BZZ72F/blueprint/resolved-snapshot.json
- old_digest: 9612e3e548938a106574786e4e1c628ff3df7991337e9f01f6fce793b0da81d9
- current_digest: 9612e3e548938a106574786e4e1c628ff3df7991337e9f01f6fce793b0da81d9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610151922-BZZ72F

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610151922-BZZ72F
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task source/test/evidence/registry/docs commit together; existing scalar mappings and all previous tasks stay intact. No document state, browser entrypoint or string pool lifecycle is migrated by this task.

## Findings

- Observation: Initial related run:20 existing cases passed; new uppercase suite failed during module evaluation with Class extends value undefined at RuntimeException extends Exception. Direct import of Exception reaches Reference -> Any -> genfunc -> RuntimeException before the base class is initialized.
  Impact: No new uppercase assertions executed. This is an existing shared CPPU entry-order defect exposed by the genuine base-exception catch boundary; it must not be hidden by consumer import ordering.
  Resolution: Persist the approved uppercase work as an unverified checkpoint, open a separate source-scoped CPPU initialization correction, preserve public exception class identity/member bodies/type factory and test independent public entry orders. Resume this task after the dependency fix; no goal/full-suite milestone change.

- Observation: After shared exception fix:48 related tests/4 files,187 Calc tests/76 files and2 Chromium shared scenarios pass; strict3 shared owners S20/B8/F3/L16 and33 Calc S4179/B2731/F821/L3727 all raw counters positive. Native audit pins9 blobs,7 native fixtures/19 uppercase assertions and6 JS divergence witnesses. Metadata gate failures found incorrect QA marker suffixes and the dependency task common-unit filename explanation; no production behavior failed.
  Impact: Whole-string JS locale uppercasing is not equivalent for the selected source contracts. Existing i18nutil mappings are required; no new ICU implementation is justified. Pending metadata gates must pass before task closure.
  Resolution: Use exact testTitleCase/testSigma source fixture names, record explicit ESM module-resolution filename necessity in task166a provenance, retain no full class/service/document/UI/ODS parity claim. Re-run only failed/pending source gates.

- Observation: Evaluator pass rejected with evaluated_sha_missing after task166a close moved HEAD onto another task-only closure commit. No implementation or test failure occurred.
  Impact: Task166 quality review must be attached to a committed task166 result rather than the unrelated closure tail.
  Resolution: Persist the bounded completed acceptance evidence in this task capability record and commit its exact scope with task artifacts, then evaluate that concrete current commit; do not force finish.
