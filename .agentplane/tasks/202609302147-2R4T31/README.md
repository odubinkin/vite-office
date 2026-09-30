---
id: "202609302147-2R4T31"
title: "Restore sequential native numbering rule import"
result_summary: "Native modern base rule plus sequential XML replacement preserves omitted and prior levels, applies duplicates in source order, aborts after invalid properties and retains copied/snapshotted state. Final verify: 617 app, 109 inventory, 19 browser with 100% coverage; 55 focused tests and 170 complete C++ comparison states. Goal and parent remain active."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 24
origin:
  system: "manual"
depends_on: []
tags:
  - "numbering"
  - "parity"
task_kind: "code"
mutation_scope: "code"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T21:48:30.262Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T22:12:24.169Z"
  updated_by: "CODER"
  note: "Complete final verify passes: 617 app, 109 inventory, 19 browser, 100% coverage; 55 focused and 170 native C++ level comparisons; source/routing/diff pass, old doctor warnings unchanged."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T22:13:30.430Z"
  updated_by: "EVALUATOR"
  note: "Scoped sequential native numbering application is source-backed and fully verified; implementation d8bd6fcc54790da70f365460161ea0307a0a4ce2."
  evaluated_sha: "d8bd6fcc54790da70f365460161ea0307a0a4ce2"
  blueprint_digest: "069c2aa1e3a32afee0b9538fd606db0f545d30db966d890ecd6d7c50c5109641"
  evidence_refs:
    - ".agentplane/tasks/202609302147-2R4T31/README.md"
    - ".agentplane/tasks/202609302147-2R4T31/quality/20260930-221330430-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609302147-2R4T31/quality/20260930-221330430-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609302147-2R4T31/quality/20260930-221330430-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609302147-2R4T31/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609302147-2R4T31/verify.log"
    - ".agentplane/tasks/202609302147-2R4T31/focused-verified.log"
    - ".agentplane/tasks/202609302147-2R4T31/native-results.json"
    - ".agentplane/tasks/202609302147-2R4T31/native-oracle.py"
    - ".agentplane/tasks/202609302147-2R4T31/compare-native.mts"
    - "d8bd6fcc54790da70f365460161ea0307a0a4ce2"
  findings:
    - "The native modern base is retained for omitted and empty rules; duplicates apply in source order. Rejection has a whole-level commit boundary and stops later declarations while retaining earlier changes."
    - "Extracted C++ primary-source branches and loop match 170 complete states; independent manual ODT/copy/snapshot/marker tests pass, including accepted-distance export/reopen rejection."
    - "No validator, coverage gate, schema version or registered browser save/open/recovery deviation was changed. Stale implementation markers moved to the actual Writer UNO owner."
commit:
  hash: "d8bd6fcc54790da70f365460161ea0307a0a4ce2"
  message: "🧩 2R4T31 code: restore sequential native numbering rule import"
comments:
  -
    author: "CODER"
    body: "Start: Restore ordered native list-level replacement and failure retention under the approved iterative goal."
  -
    author: "CODER"
    body: "Verified: Restored ordered native list-level application, base defaults and rejection retention; all required gates and bounded differential evidence pass."
events:
  -
    type: "status"
    at: "2026-09-30T21:48:30.716Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore ordered native list-level replacement and failure retention under the approved iterative goal."
  -
    type: "verify"
    at: "2026-09-30T22:12:24.169Z"
    author: "CODER"
    state: "ok"
    note: "Complete final verify passes: 617 app, 109 inventory, 19 browser, 100% coverage; 55 focused and 170 native C++ level comparisons; source/routing/diff pass, old doctor warnings unchanged."
  -
    type: "status"
    at: "2026-09-30T22:13:44.661Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: Restored ordered native list-level application, base defaults and rejection retention; all required gates and bounded differential evidence pass."
doc_version: 3
doc_updated_at: "2026-09-30T22:13:44.662Z"
doc_updated_by: "CODER"
description: "Apply declared ODF list levels in source order to the native modern Writer base rule, retaining omitted levels and stopping after rejected numbering properties. Replace eager fallback tables with ordered declarations; preserve registered save/open/recovery deviations."
sections:
  Summary: "Restore pinned LibreOffice FillUnoNumRule sequential replacement semantics for the existing Arabic/bullet list import subset."
  Scope: "Runtime: sw/source/core/doc/number.ts, sw/source/core/unocore/unosett.ts, sw/source/filter/xml/xmlimp.ts, xmloff/source/style/xmlstyle.ts, xmloff/source/text/txtparai.ts. Matching core/context/ODT tests and parity metadata only; task-local primary-source evidence and parent progress. No network, outside-repository access, policy/gate changes, or registered open/save/recovery deviation changes."
  Plan: "1. Establish native default rule and copy/validate/commit boundaries from pinned number.cxx, unosett.cxx, xmlnumi.cxx and docstyle.cxx. 2. Introduce a base Arabic rule and owned per-level Set; retain XML declarations in source order, including duplicate and empty declarations. 3. Apply each level through Writer property validation; catch only the native invalid-property failure around the complete loop, preserving previous commits and base omitted levels. 4. Verify source-derived defaults, repeat/abort order, ODT export/reopen, copy and snapshots; run npm run verify. 5. Record evidence, scoped commit, evaluator, finish and parent progress. Existing alias conflicts and unsupported numbering families remain separate audits."
  Verify Steps: "Run focused number/unosett/xmlstyle/txtparai/ODT tests including source-derived modern base defaults, omitted/empty rules, declaration order, duplicate replacement, failure before/after success, failure regardless selected position mode, and invalid-property no partial level commit. Produce bounded differential C++ evidence by extracting actual pinned replacement loop and rejection branches where feasible. Run npm run verify with all required coverage and browser checks unchanged. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record final clean git status and actual implementation hash."
  Verification: |-
    PASS: final complete npm run verify (617 app, 109 inventory, 19 browser; required 100% coverage), 55 focused tests, 17 extracted native C++ cases /170 complete level states, source/invariant/parity/routing/diff checks and doctor (same two old warnings). All initial failures and bounded corrections are recorded in Findings. Broader parity remains unverified; no mandatory check skipped.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T22:12:24.169Z — VERIFY — ok

    By: CODER

    Note: Complete final verify passes: 617 app, 109 inventory, 19 browser, 100% coverage; 55 focused and 170 native C++ level comparisons; source/routing/diff pass, old doctor warnings unchanged.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T22:12:23.350Z, excerpt_hash=sha256:e081f401e237c179c89a9a04d7a423852b7f9c278438a598b8c537badd4484b4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302147-2R4T31/blueprint/resolved-snapshot.json
    - old_digest: 069c2aa1e3a32afee0b9538fd606db0f545d30db966d890ecd6d7c50c5109641
    - current_digest: 069c2aa1e3a32afee0b9538fd606db0f545d30db966d890ecd6d7c50c5109641
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609302147-2R4T31

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202609302147-2R4T31 -m 🧩 2R4T31 task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit after reviewing dependent numbering work; keep task evidence and registered browser deviations."
  Findings: |-
    Authorization: the user's persistent /goal approves iterative safe local parity corrections, one executable child at a time. Preflight: main clean, direct workflow, parent 202609240501-C9TN6M active. Sources: pinned libreoffice-26.8.0.2 commit 9bc445578031fecf56086729d8e4940c77e14d65, repository cached vendor/libreoffice-reference. XML FillUnoNumRule iterates declarations in source order with one exception boundary; Writer SetNumberingRuleByIndex clones before SetPropertiesToNumFormat and commits only after success. Native common and automatic factories use modern base rules under the existing ODF >=1.2 setting. Local eager ten-level construction and first-declared fallback do not implement that state machine. No source-family or full formatter parity promotion is planned.

    Command: npx vitest run --config apps/office/vitest.config.ts ... . Result: fail before test execution; nonexistent config path. Evidence: focused-startup.log. Resolution: use the discovered apps/office/vite.config.ts with the office workspace cwd. Scope and mandatory acceptance checks unchanged; bounded command correction under the approved goal.

    Command: npx vitest run the eight focused core/XML/ODT files from apps/office. Result: 51 passed, one obsolete assertion failed. Evidence: focused.log; omitted level 2 in a one-level bullet declaration now correctly remains numbered instead of first-level bullet fallback. Resolution: update that assertion to the manually source-derived Arabic base and add explicit end-to-end coverage; no acceptance relaxation or scope drift.

    - Observation: Office typecheck found a mistaken test-only WriterViewProjection API call and an unused type import; runtime type contract did not fail.
      Impact: The new integration test cannot typecheck until it uses the established Project API.
      Resolution: Correct the test to Project(document, current node, SwPaM, metadata), remove the unused import and rerun focused checks; no scope or verification changes.

    - Observation: The new integration test exposed browser snapshot loss of the inactive bullet character for Arabic levels; two other failures were fixture omissions (reopen assertion still assumed fallback and error injection lacked Standard style).
      Impact: Native base and duplicate-replacement state did not survive a browser snapshot. This is a required copy/snapshot acceptance issue within the numbering task.
      Resolution: Add one bounded helper remediation in writer-document-codec.ts: encode the stored bullet character for both supported marker kinds using the existing optional schema field. Correct the two fixtures and retain schema v15 and mandatory checks.

    - Observation: Focused run now passes all numbering state/copy/snapshot/ODT cases; only error-injection assertion expected the raw programmer-error message, whereas the SAX bridge wraps propagated errors as malformed XML.
      Impact: No runtime defect: the unrelated error correctly aborts the import and is not swallowed by the native property-failure catch.
      Resolution: Assert the established SAX malformed-XML wrapper; preserve the requirement that unrelated errors abort import. Evidence: focused-pass.log, 54 passed and one test-only expectation failed.

    - Observation: The first C++ probe compilation rejected the adapter overloads for o3tl::toTwips: integer calls were ambiguous between long and double.
      Impact: No native or local semantic result is available from that failed probe; runtime code is unaffected.
      Resolution: Use an integral constrained template for the adapter overload, retaining the extracted native MulDiv implementation and source branches unchanged. Rerun compilation and differential comparison.

    - Observation: Focused lint rejects the new static-only SwXNumberingRules facade and four non-null assertions in the integration test.
      Impact: The repository enforces instance-based classes and explicit fixture guards; semantic comparisons already match the native C++ probe.
      Resolution: Use the native instance facade with replaceByIndex over an owned rule and explicit test guards. Do not suppress lint or alter gates. This refines the existing approved application boundary.

    - Observation: Initial full npm run verify passed app 617/131 with 100% coverage, then inventory validation rejected an obsolete xmlimp.ts::SwNumFormat implementation marker. The read-only parity diagnostic confirms the same stale reference.
      Impact: The implementation owner moved to unosett.ts; metadata still points at eager construction removed from xmlimp.ts. No app or coverage failure; later mandatory gates did not run yet.
      Resolution: Move the existing parity implementation reference to the actual Writer UNO owner without adding compatibility markers or changing validators. Rerun the complete mandatory command. Focused final run passed 55 tests in nine files.

    Final implementation: ordered XMLListLevelImport declarations replace the eager first-declared fallback tables. Empty/omitted levels retain the modern Arabic NUM_RULE base fields, including per-level inactive bullet characters. SwXNumberingRules is an instance service over a Writer rule; it clones a level, validates supported MM100 properties and commits with SwNumRule.Set only on success. The outer XML fill failure boundary retains prior replacements and stops later declarations regardless of selected position mode; duplicate levels apply sequentially. The browser codec uses its existing optional bulletChar field for both marker kinds, retaining inactive state without a schema bump.

    Command: python3 .agentplane/tasks/202609302147-2R4T31/native-oracle.py; npx tsx .agentplane/tasks/202609302147-2R4T31/compare-native.mts.
    Result: pass. Evidence: native-results.json, native-rule-oracle.cxx, extraction script and comparison script; 17 ordered cases / 170 complete level states match. Scope: actual pinned modern base initialization, bullet defaults, MM100 rejection branches, copy/commit statements and source-order XML loop, compiled with bounded type/container/unit adapters. This is not a complete native UNO or platform build.

    Command: npx vitest run the nine focused number/unosett/xmlstyle/txtparai/ODT test files from apps/office.
    Result: pass. Evidence: focused-verified.log, 55 tests / nine files. Scope: manually source-derived defaults, empty/omitted/repeated/out-of-order levels, early/late/duplicate failure, both modes, clone/snapshot/marker/export/reopen, unrelated failure propagation. Accepted 32767 MM100 legacy distance exports as 32768 after quantization; reopen rejects it and stops subsequent declarations as native source dictates. Thirty-six common/automatic rule cases plus the boundary package case are exercised.

    Command: npm run verify.
    Result: pass, terminal exit 0. Evidence: verify.log. App 617 tests /131 files; inventory 109 /36; browser 19. Both required coverage suites retain 100% statements/branches/functions/lines. Boundary check: 198 runtime sources, 815 relative imports, 12 allowed cross-module edges. 436 authored files remain below the hard 1000-line ceiling; 111 required source paths/33 retired roots; 199 provenance modules (123 mapped, 60 browser adaptations, 16 infrastructure), 34 invariants. Resource/static/docs/build/source/invariant/parity gates pass. semanticViolationCount=0 is metadata consistency, not whole-goal parity. The first full run and obsolete metadata-marker diagnostic are retained; three implementation references now point to actual unosett.ts ownership instead of removed eager XML construction.

    Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
    Result: pass. Evidence: zero doctor errors with the same two pre-existing warnings (old hook shim; old DONE task F1JT8K points to close commit), policy routing OK, clean diff formatting. Final clean scoped state will be checked after lifecycle artifacts are committed.

    Residual obligations: broader numbering/UNO services, native sparse/shared base ownership, outline and legacy base factories, numbering families, continuous numbering, font/graphics, extensions/units/versions and full line layout remain unverified. The list-style wrapper still owns marker parsing in xmlstyle rather than native xmlnumi; its unknown-child/attribute/default contract is not yet restored. Named/display/duplicate/cycle style ownership, null-context skip, hint conversion, tab constructor and all other existing core/browser operations remain open. Registered save/open/recovery deviations are unchanged. Next source-backed correction: xmlnumi.cxx level constructor initializes sNumFormat to "1", cBullet to 0 and nLevel to -1; present nonpositive levels normalize to zero, missing levels are skipped by FillUnoNumRule, missing bullet/number-format attributes retain native defaults, and unknown children return null. Local strict required attributes and wrapper ownership still differ; audit that bounded declaration contract next. Parent and goal remain active.
id_source: "generated"
---
## Summary

Restore pinned LibreOffice FillUnoNumRule sequential replacement semantics for the existing Arabic/bullet list import subset.

## Scope

Runtime: sw/source/core/doc/number.ts, sw/source/core/unocore/unosett.ts, sw/source/filter/xml/xmlimp.ts, xmloff/source/style/xmlstyle.ts, xmloff/source/text/txtparai.ts. Matching core/context/ODT tests and parity metadata only; task-local primary-source evidence and parent progress. No network, outside-repository access, policy/gate changes, or registered open/save/recovery deviation changes.

## Plan

1. Establish native default rule and copy/validate/commit boundaries from pinned number.cxx, unosett.cxx, xmlnumi.cxx and docstyle.cxx. 2. Introduce a base Arabic rule and owned per-level Set; retain XML declarations in source order, including duplicate and empty declarations. 3. Apply each level through Writer property validation; catch only the native invalid-property failure around the complete loop, preserving previous commits and base omitted levels. 4. Verify source-derived defaults, repeat/abort order, ODT export/reopen, copy and snapshots; run npm run verify. 5. Record evidence, scoped commit, evaluator, finish and parent progress. Existing alias conflicts and unsupported numbering families remain separate audits.

## Verify Steps

Run focused number/unosett/xmlstyle/txtparai/ODT tests including source-derived modern base defaults, omitted/empty rules, declaration order, duplicate replacement, failure before/after success, failure regardless selected position mode, and invalid-property no partial level commit. Produce bounded differential C++ evidence by extracting actual pinned replacement loop and rejection branches where feasible. Run npm run verify with all required coverage and browser checks unchanged. Run ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record final clean git status and actual implementation hash.

## Verification

PASS: final complete npm run verify (617 app, 109 inventory, 19 browser; required 100% coverage), 55 focused tests, 17 extracted native C++ cases /170 complete level states, source/invariant/parity/routing/diff checks and doctor (same two old warnings). All initial failures and bounded corrections are recorded in Findings. Broader parity remains unverified; no mandatory check skipped.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T22:12:24.169Z — VERIFY — ok

By: CODER

Note: Complete final verify passes: 617 app, 109 inventory, 19 browser, 100% coverage; 55 focused and 170 native C++ level comparisons; source/routing/diff pass, old doctor warnings unchanged.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T22:12:23.350Z, excerpt_hash=sha256:e081f401e237c179c89a9a04d7a423852b7f9c278438a598b8c537badd4484b4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302147-2R4T31/blueprint/resolved-snapshot.json
- old_digest: 069c2aa1e3a32afee0b9538fd606db0f545d30db966d890ecd6d7c50c5109641
- current_digest: 069c2aa1e3a32afee0b9538fd606db0f545d30db966d890ecd6d7c50c5109641
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609302147-2R4T31

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202609302147-2R4T31 -m 🧩 2R4T31 task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit after reviewing dependent numbering work; keep task evidence and registered browser deviations.

## Findings

Authorization: the user's persistent /goal approves iterative safe local parity corrections, one executable child at a time. Preflight: main clean, direct workflow, parent 202609240501-C9TN6M active. Sources: pinned libreoffice-26.8.0.2 commit 9bc445578031fecf56086729d8e4940c77e14d65, repository cached vendor/libreoffice-reference. XML FillUnoNumRule iterates declarations in source order with one exception boundary; Writer SetNumberingRuleByIndex clones before SetPropertiesToNumFormat and commits only after success. Native common and automatic factories use modern base rules under the existing ODF >=1.2 setting. Local eager ten-level construction and first-declared fallback do not implement that state machine. No source-family or full formatter parity promotion is planned.

Command: npx vitest run --config apps/office/vitest.config.ts ... . Result: fail before test execution; nonexistent config path. Evidence: focused-startup.log. Resolution: use the discovered apps/office/vite.config.ts with the office workspace cwd. Scope and mandatory acceptance checks unchanged; bounded command correction under the approved goal.

Command: npx vitest run the eight focused core/XML/ODT files from apps/office. Result: 51 passed, one obsolete assertion failed. Evidence: focused.log; omitted level 2 in a one-level bullet declaration now correctly remains numbered instead of first-level bullet fallback. Resolution: update that assertion to the manually source-derived Arabic base and add explicit end-to-end coverage; no acceptance relaxation or scope drift.

- Observation: Office typecheck found a mistaken test-only WriterViewProjection API call and an unused type import; runtime type contract did not fail.
  Impact: The new integration test cannot typecheck until it uses the established Project API.
  Resolution: Correct the test to Project(document, current node, SwPaM, metadata), remove the unused import and rerun focused checks; no scope or verification changes.

- Observation: The new integration test exposed browser snapshot loss of the inactive bullet character for Arabic levels; two other failures were fixture omissions (reopen assertion still assumed fallback and error injection lacked Standard style).
  Impact: Native base and duplicate-replacement state did not survive a browser snapshot. This is a required copy/snapshot acceptance issue within the numbering task.
  Resolution: Add one bounded helper remediation in writer-document-codec.ts: encode the stored bullet character for both supported marker kinds using the existing optional schema field. Correct the two fixtures and retain schema v15 and mandatory checks.

- Observation: Focused run now passes all numbering state/copy/snapshot/ODT cases; only error-injection assertion expected the raw programmer-error message, whereas the SAX bridge wraps propagated errors as malformed XML.
  Impact: No runtime defect: the unrelated error correctly aborts the import and is not swallowed by the native property-failure catch.
  Resolution: Assert the established SAX malformed-XML wrapper; preserve the requirement that unrelated errors abort import. Evidence: focused-pass.log, 54 passed and one test-only expectation failed.

- Observation: The first C++ probe compilation rejected the adapter overloads for o3tl::toTwips: integer calls were ambiguous between long and double.
  Impact: No native or local semantic result is available from that failed probe; runtime code is unaffected.
  Resolution: Use an integral constrained template for the adapter overload, retaining the extracted native MulDiv implementation and source branches unchanged. Rerun compilation and differential comparison.

- Observation: Focused lint rejects the new static-only SwXNumberingRules facade and four non-null assertions in the integration test.
  Impact: The repository enforces instance-based classes and explicit fixture guards; semantic comparisons already match the native C++ probe.
  Resolution: Use the native instance facade with replaceByIndex over an owned rule and explicit test guards. Do not suppress lint or alter gates. This refines the existing approved application boundary.

- Observation: Initial full npm run verify passed app 617/131 with 100% coverage, then inventory validation rejected an obsolete xmlimp.ts::SwNumFormat implementation marker. The read-only parity diagnostic confirms the same stale reference.
  Impact: The implementation owner moved to unosett.ts; metadata still points at eager construction removed from xmlimp.ts. No app or coverage failure; later mandatory gates did not run yet.
  Resolution: Move the existing parity implementation reference to the actual Writer UNO owner without adding compatibility markers or changing validators. Rerun the complete mandatory command. Focused final run passed 55 tests in nine files.

Final implementation: ordered XMLListLevelImport declarations replace the eager first-declared fallback tables. Empty/omitted levels retain the modern Arabic NUM_RULE base fields, including per-level inactive bullet characters. SwXNumberingRules is an instance service over a Writer rule; it clones a level, validates supported MM100 properties and commits with SwNumRule.Set only on success. The outer XML fill failure boundary retains prior replacements and stops later declarations regardless of selected position mode; duplicate levels apply sequentially. The browser codec uses its existing optional bulletChar field for both marker kinds, retaining inactive state without a schema bump.

Command: python3 .agentplane/tasks/202609302147-2R4T31/native-oracle.py; npx tsx .agentplane/tasks/202609302147-2R4T31/compare-native.mts.
Result: pass. Evidence: native-results.json, native-rule-oracle.cxx, extraction script and comparison script; 17 ordered cases / 170 complete level states match. Scope: actual pinned modern base initialization, bullet defaults, MM100 rejection branches, copy/commit statements and source-order XML loop, compiled with bounded type/container/unit adapters. This is not a complete native UNO or platform build.

Command: npx vitest run the nine focused number/unosett/xmlstyle/txtparai/ODT test files from apps/office.
Result: pass. Evidence: focused-verified.log, 55 tests / nine files. Scope: manually source-derived defaults, empty/omitted/repeated/out-of-order levels, early/late/duplicate failure, both modes, clone/snapshot/marker/export/reopen, unrelated failure propagation. Accepted 32767 MM100 legacy distance exports as 32768 after quantization; reopen rejects it and stops subsequent declarations as native source dictates. Thirty-six common/automatic rule cases plus the boundary package case are exercised.

Command: npm run verify.
Result: pass, terminal exit 0. Evidence: verify.log. App 617 tests /131 files; inventory 109 /36; browser 19. Both required coverage suites retain 100% statements/branches/functions/lines. Boundary check: 198 runtime sources, 815 relative imports, 12 allowed cross-module edges. 436 authored files remain below the hard 1000-line ceiling; 111 required source paths/33 retired roots; 199 provenance modules (123 mapped, 60 browser adaptations, 16 infrastructure), 34 invariants. Resource/static/docs/build/source/invariant/parity gates pass. semanticViolationCount=0 is metadata consistency, not whole-goal parity. The first full run and obsolete metadata-marker diagnostic are retained; three implementation references now point to actual unosett.ts ownership instead of removed eager XML construction.

Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check.
Result: pass. Evidence: zero doctor errors with the same two pre-existing warnings (old hook shim; old DONE task F1JT8K points to close commit), policy routing OK, clean diff formatting. Final clean scoped state will be checked after lifecycle artifacts are committed.

Residual obligations: broader numbering/UNO services, native sparse/shared base ownership, outline and legacy base factories, numbering families, continuous numbering, font/graphics, extensions/units/versions and full line layout remain unverified. The list-style wrapper still owns marker parsing in xmlstyle rather than native xmlnumi; its unknown-child/attribute/default contract is not yet restored. Named/display/duplicate/cycle style ownership, null-context skip, hint conversion, tab constructor and all other existing core/browser operations remain open. Registered save/open/recovery deviations are unchanged. Next source-backed correction: xmlnumi.cxx level constructor initializes sNumFormat to "1", cBullet to 0 and nLevel to -1; present nonpositive levels normalize to zero, missing levels are skipped by FillUnoNumRule, missing bullet/number-format attributes retain native defaults, and unknown children return null. Local strict required attributes and wrapper ownership still differ; audit that bounded declaration contract next. Parent and goal remain active.
