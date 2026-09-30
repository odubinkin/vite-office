---
id: "202609302034-1CZ8BR"
title: "Restore native list label-alignment XML contracts"
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
  updated_at: "2026-09-30T20:36:18.288Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-09-30T21:04:57.940Z"
  updated_by: "CODER"
  note: "Pinned supported list label-alignment parsing/defaults/SHRT bounds, MM100-Writer conversion, native explicit mode/conditional XML and package reopen values verified. 74 compiled native scalar comparisons and 147 focused tests pass; full verify exit 0 at 604/109/19 and required 100% coverage; routing/doctor/diff pass. Wider contracts stay unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-09-30T21:05:45.436Z"
  updated_by: "EVALUATOR"
  note: "The scoped supported list label-alignment pipeline matches pinned XML defaults, MM100 bounds, signed Writer conversion and conditional CM export; full verification passes and wider parity is explicitly unclaimed."
  evaluated_sha: "a2029fe2cf969d6f018b6b6db737b4ee0ced4e4a"
  blueprint_digest: "6e95ad685808144b8f1708264576cca843c799d220a913ddd4402369b9cd793c"
  evidence_refs:
    - ".agentplane/tasks/202609302034-1CZ8BR/README.md"
    - ".agentplane/tasks/202609302034-1CZ8BR/quality/20260930-210545436-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609302034-1CZ8BR/quality/20260930-210545436-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609302034-1CZ8BR/quality/20260930-210545436-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609302034-1CZ8BR/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609302034-1CZ8BR/verify.log"
    - ".agentplane/tasks/202609302034-1CZ8BR/focused.log"
    - ".agentplane/tasks/202609302034-1CZ8BR/native-list-measure-oracle.cxx"
    - ".agentplane/tasks/202609302034-1CZ8BR/native-results.json"
    - ".agentplane/tasks/202609302034-1CZ8BR/compare-native.mjs"
    - ".agentplane/tasks/202609302034-1CZ8BR/diagnostic-evidence.log"
    - "apps/office/src/sw/source/filter/xml/odt-list-label-alignment-roundtrip.test.ts"
    - "apps/office/src/xmloff/source/style/xmlnumi.test.ts"
    - "apps/office/src/xmloff/source/style/xmlnume.test.ts"
  findings:
    - "Removed command-specific default suppression; native mode is always emitted for supported alignment, only nonzero indents and LISTTAB-positive tabs are exported. Modern parsing has native zero/follow defaults, failed-measure fallback and SHRT bounds. Conversion responsibility is owned by Writer unosett and XML/SAX source modules."
    - "Seventy-four scalar comparisons use compiled unmodified native parser/export/integer bodies with bounded platform aliases. Eleven literal cases in each common/automatic container, both default marker families and exact pinned tdf114287 bounds verify package behavior. The two diagnostic-count corrections are justified by exact ten native mode attributes and preserve semantic/reopen guards."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: restore source-owned supported list label-alignment XML defaults, MM100/Writer conversion and native mode/attribute/export contracts; retain registered deviations and verify full package/browser gates."
events:
  -
    type: "status"
    at: "2026-09-30T20:36:18.537Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore source-owned supported list label-alignment XML defaults, MM100/Writer conversion and native mode/attribute/export contracts; retain registered deviations and verify full package/browser gates."
  -
    type: "verify"
    at: "2026-09-30T21:04:57.940Z"
    author: "CODER"
    state: "ok"
    note: "Pinned supported list label-alignment parsing/defaults/SHRT bounds, MM100-Writer conversion, native explicit mode/conditional XML and package reopen values verified. 74 compiled native scalar comparisons and 147 focused tests pass; full verify exit 0 at 604/109/19 and required 100% coverage; routing/doctor/diff pass. Wider contracts stay unverified."
doc_version: 3
doc_updated_at: "2026-09-30T21:04:57.995Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Correct the existing label-alignment import/export pipeline: MM100 defaults, parsing/clamps and Writer conversion; explicit ODF mode, nondefault attribute presence and native export quantization. Keep unsupported position modes and broader numbering obligations separate."
sections:
  Summary: |-
    Restore native list label-alignment XML contracts

    Child of C9TN6M. Correct the existing label-alignment import/export pipeline: MM100 defaults, parsing/clamps and Writer conversion; explicit ODF mode, nondefault attribute presence and native export quantization. Keep unsupported position modes and broader numbering obligations separate.
  Scope: "Only existing supported list label-alignment XML pipeline: xmloff/source/style/xmlnume.ts and new xmlnume.test.ts; new xmlnumi.ts and xmlnumi.test.ts; xmlstyle.ts; text/txtparae.ts and txtparae.test.ts; text/txtparai.ts; core/xmltoken.ts and core/xmluconv.ts/tests; sax/source/tools/converter.ts/tests; new sw/source/core/unocore/unosett.ts/tests; sw/source/filter/xml/xmlimp.ts, xmlexp.ts, odt-layout-parity.test.ts and new odt-list-label-alignment-roundtrip.test.ts; runtime inventory/provenance data and task artifacts. Retain modern imported MM100 values/defaults until Writer UNO conversion; keep legacy Twip adapter explicitly separate and unchanged. Export supported label-alignment for ODF 1.3 with explicit mode and native conditional attributes, quantization and CM serialization. Legacy position modes, extension NEWLINE, full numbering/UNO model breadth and other defaults remain separate audits. Do not alter validators, thresholds or registered save/open/recovery deviations. No network/outside-repo access. In-scope verification remediation adds scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts: two pinned fixtures contain ten now-recognized list mode attributes each; update exact warning expectations and assert the mode attribute is absent from diagnostics. Existing semantic and warning guards stay intact."
  Plan: "Own modern list label-alignment parsing in xmlnumi with native MM100 defaults, Converter grammar/failure and bounds. Use explicit unit-marked import properties to preserve the unaudited legacy Twip path. Delegate Writer property MM100/Twip conversion to its unosett owner. Project exported layout as native MM100, serialize through XML/SAX converter, and follow xmlnume mode/attribute rules without command-specific suppression. Add pinned source-derived assertions and real ODT cycles, correct contradictory fixtures, update metadata and run all mandatory gates. The active iterative goal explicitly authorizes this correction and necessary responsibility refactoring."
  Verify Steps: "Inspect pinned xmlnumi.cxx label-alignment constructor and SHRT MM100 bounds, xmlnume.cxx mode/version/attribute rules, unosett.cxx MM100/Twip numbering properties, tools/UnitConversion.hxx and o3tl signed rounding, SAX/XML measure export to CM. Context/unit assertions cover zero omitted defaults, supported follow modes and unknown fallback, grammar/failure/clamps and two-stage quantization; export assertions verify explicit mode, default-level retention, nonzero indent suppression and listtab-only positive tab output. Literal real ODT common/automatic list definitions and default Writer commands assert manual model values and exact XML through import/export/reimport, including negative geometry, zeros, partial/invalid measures and native unused tab loss. Preserve genuine tdf114287 geometry. Run focused affected suites then full npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record narrow evidence and residual obligations; no whole-module promotion."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-09-30T21:04:57.940Z — VERIFY — ok

    By: CODER

    Note: Pinned supported list label-alignment parsing/defaults/SHRT bounds, MM100-Writer conversion, native explicit mode/conditional XML and package reopen values verified. 74 compiled native scalar comparisons and 147 focused tests pass; full verify exit 0 at 604/109/19 and required 100% coverage; routing/doctor/diff pass. Wider contracts stay unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T21:04:57.609Z, excerpt_hash=sha256:423d4b15df9deab9418a73459d4393cfaf62bea35f5cb7c71c88ddaea4096036

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302034-1CZ8BR/blueprint/resolved-snapshot.json
    - old_digest: 6e95ad685808144b8f1708264576cca843c799d220a913ddd4402369b9cd793c
    - current_digest: 6e95ad685808144b8f1708264576cca843c799d220a913ddd4402369b9cd793c
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609302034-1CZ8BR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609302034-1CZ8BR
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit if source-backed existing list label-alignment contracts regress; retain earlier verified context and item corrections."
  Findings: |-
    - Observation: Initial affected ODT suites passed 121 tests; the added literal package helper then failed typechecking because it used getText rather than the canonical SwTextNode.GetText API.
      Impact: New test helper issue; no source scope or verification criteria change.
      Resolution: Corrected the helper API and retained the manual source-stage/core/export/reopen assertions. All required checks will run after this in-scope correction.

    - Observation: The first full npm run verify passed 604 application tests with 100% coverage, then stopped at two exact diagnostic-count assertions in the pinned collapsed_bookmark.odt and tdf94882.odt fixtures (expected 90/101, observed 80/91).
      Impact: The newly recognized native list-level-position-and-space-mode attribute occurs exactly ten times in each fixture; the old counts included its unknown-attribute diagnostics. No production contract or gate change is required.
      Resolution: Added one scoped existing inventory-test file, retained exact remaining counts, all bookmark/soft-break/package semantics and zero reopen diagnostics, and asserted no mode diagnostic. diagnostic-evidence.mjs confirms the ten raw attributes and remaining 80/91 diagnostics. The initial failure remains in verify-before-diagnostic-fixtures.log; the complete gate will be rerun.

    - Command: python3 .agentplane/tasks/202609302034-1CZ8BR/native-oracle.py; npx tsx .agentplane/tasks/202609302034-1CZ8BR/compare-native.mjs.
      Result: pass.
      Evidence: 74 scalar comparisons against compiled unmodified pinned SAX parse/export and o3tl integer conversion function bodies.
      Scope: Existing Twip/MM100 core targets, CM XML export, signed numbering conversion and SHRT attribute bounds. Harness platform aliases and unit ratios are supplied locally; wider APIs/units, native full XML/UNO objects and whole-module parity are not claimed.

    - Command: npx vitest run src/sw/source/filter/xml src/sw/source/core/unocore/unosett.test.ts src/xmloff/source/style src/xmloff/source/core/xmluconv.test.ts src/xmloff/source/text/txtpara.test.ts src/xmloff/source/text/txtparae.test.ts src/xmloff/source/text/txtparai.test.ts src/sax/source/tools/converter.test.ts --coverage.enabled=false (cwd apps/office).
      Result: pass.
      Evidence: 147 tests in 33 files; focused.log.
      Scope: All affected package/style/text/converter and new Writer conversion assertions; literal common/automatic list cycles and both default marker families.

    - Command: npm run verify.
      Result: pass, terminal exit 0 after the fixture remediation.
      Evidence: verify.log; 604 app tests in 128 files, 109 inventory tests in 36 files, 19 browser cases, 100% statements/branches/functions/lines in both required coverage suites. Format, lint, types, module boundaries (197 runtime sources, 812 imports, 12 allowed edges), resource regeneration, static builds, docs, strict file size (432 authored files), source tree (111 paths/33 retired roots), provenance (198 modules: 122 mapped/60 browser/16 infrastructure), 34 invariants and parity consistency all pass; semanticViolationCount=0. Terminal-completed log is compacted after source provenance, retaining the remaining gate summaries.
      Scope: Entire repository mandatory gate. No validator/schema/generator/threshold weakening and no registered save/open/recovery behavior change. Broader semantic statuses remain unverified.

    - Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; npx tsx .agentplane/tasks/202609302034-1CZ8BR/diagnostic-evidence.mjs.
      Result: pass.
      Evidence: doctor exit 0 with the same two pre-existing warnings (old hook readiness shim and old DONE task close pointer), routing OK, diff clean after stripping test-output trailing blank lines, diagnostic-evidence.log exact ten recognized attributes and remaining 80/91 structural warnings.
      Scope: Local workflow/policy/patch hygiene and pinned package diagnostics. The first diff check found only a test-log trailing blank EOF; sanitized after completion and repeated successfully.

    - Observation: Supported LABEL_ALIGNMENT import/export now retains native zero/follow defaults and MM100 bounds until the Writer UNO boundary; export has explicit mode, native omission predicates and two-stage signed quantization. Command-specific default-geometry suppression is removed. Native ownership maps to xmlnumi/xmlnume/unosett/XML/SAX without a compatibility re-export.
      Impact: Previously rejected/incorrectly rounded inputs, partial attributes, standard command geometry and unused/nonpositive tabs now reproduce the pinned supported contracts across actual ODT packages.
      Resolution: Retain separate follow-ups for full position-mode model/legacy adapter, NEWLINE extensions, other units/versions, full UNO/default/property ownership, style duplicate/display/default behavior, null dispatch, inline hint/legacy conversion and all other existing runtime/UI obligations. A whole-module or parent completion claim would be unsupported.
id_source: "generated"
---
## Summary

Restore native list label-alignment XML contracts

Child of C9TN6M. Correct the existing label-alignment import/export pipeline: MM100 defaults, parsing/clamps and Writer conversion; explicit ODF mode, nondefault attribute presence and native export quantization. Keep unsupported position modes and broader numbering obligations separate.

## Scope

Only existing supported list label-alignment XML pipeline: xmloff/source/style/xmlnume.ts and new xmlnume.test.ts; new xmlnumi.ts and xmlnumi.test.ts; xmlstyle.ts; text/txtparae.ts and txtparae.test.ts; text/txtparai.ts; core/xmltoken.ts and core/xmluconv.ts/tests; sax/source/tools/converter.ts/tests; new sw/source/core/unocore/unosett.ts/tests; sw/source/filter/xml/xmlimp.ts, xmlexp.ts, odt-layout-parity.test.ts and new odt-list-label-alignment-roundtrip.test.ts; runtime inventory/provenance data and task artifacts. Retain modern imported MM100 values/defaults until Writer UNO conversion; keep legacy Twip adapter explicitly separate and unchanged. Export supported label-alignment for ODF 1.3 with explicit mode and native conditional attributes, quantization and CM serialization. Legacy position modes, extension NEWLINE, full numbering/UNO model breadth and other defaults remain separate audits. Do not alter validators, thresholds or registered save/open/recovery deviations. No network/outside-repo access. In-scope verification remediation adds scripts/libreoffice-inventory/odt-upstream-fixtures.test.ts: two pinned fixtures contain ten now-recognized list mode attributes each; update exact warning expectations and assert the mode attribute is absent from diagnostics. Existing semantic and warning guards stay intact.

## Plan

Own modern list label-alignment parsing in xmlnumi with native MM100 defaults, Converter grammar/failure and bounds. Use explicit unit-marked import properties to preserve the unaudited legacy Twip path. Delegate Writer property MM100/Twip conversion to its unosett owner. Project exported layout as native MM100, serialize through XML/SAX converter, and follow xmlnume mode/attribute rules without command-specific suppression. Add pinned source-derived assertions and real ODT cycles, correct contradictory fixtures, update metadata and run all mandatory gates. The active iterative goal explicitly authorizes this correction and necessary responsibility refactoring.

## Verify Steps

Inspect pinned xmlnumi.cxx label-alignment constructor and SHRT MM100 bounds, xmlnume.cxx mode/version/attribute rules, unosett.cxx MM100/Twip numbering properties, tools/UnitConversion.hxx and o3tl signed rounding, SAX/XML measure export to CM. Context/unit assertions cover zero omitted defaults, supported follow modes and unknown fallback, grammar/failure/clamps and two-stage quantization; export assertions verify explicit mode, default-level retention, nonzero indent suppression and listtab-only positive tab output. Literal real ODT common/automatic list definitions and default Writer commands assert manual model values and exact XML through import/export/reimport, including negative geometry, zeros, partial/invalid measures and native unused tab loss. Preserve genuine tdf114287 geometry. Run focused affected suites then full npm run verify, ap doctor, node .agentplane/policy/check-routing.mjs and git diff --check. Record narrow evidence and residual obligations; no whole-module promotion.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-09-30T21:04:57.940Z — VERIFY — ok

By: CODER

Note: Pinned supported list label-alignment parsing/defaults/SHRT bounds, MM100-Writer conversion, native explicit mode/conditional XML and package reopen values verified. 74 compiled native scalar comparisons and 147 focused tests pass; full verify exit 0 at 604/109/19 and required 100% coverage; routing/doctor/diff pass. Wider contracts stay unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-09-30T21:04:57.609Z, excerpt_hash=sha256:423d4b15df9deab9418a73459d4393cfaf62bea35f5cb7c71c88ddaea4096036

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302034-1CZ8BR/blueprint/resolved-snapshot.json
- old_digest: 6e95ad685808144b8f1708264576cca843c799d220a913ddd4402369b9cd793c
- current_digest: 6e95ad685808144b8f1708264576cca843c799d220a913ddd4402369b9cd793c
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609302034-1CZ8BR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609302034-1CZ8BR
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit if source-backed existing list label-alignment contracts regress; retain earlier verified context and item corrections.

## Findings

- Observation: Initial affected ODT suites passed 121 tests; the added literal package helper then failed typechecking because it used getText rather than the canonical SwTextNode.GetText API.
  Impact: New test helper issue; no source scope or verification criteria change.
  Resolution: Corrected the helper API and retained the manual source-stage/core/export/reopen assertions. All required checks will run after this in-scope correction.

- Observation: The first full npm run verify passed 604 application tests with 100% coverage, then stopped at two exact diagnostic-count assertions in the pinned collapsed_bookmark.odt and tdf94882.odt fixtures (expected 90/101, observed 80/91).
  Impact: The newly recognized native list-level-position-and-space-mode attribute occurs exactly ten times in each fixture; the old counts included its unknown-attribute diagnostics. No production contract or gate change is required.
  Resolution: Added one scoped existing inventory-test file, retained exact remaining counts, all bookmark/soft-break/package semantics and zero reopen diagnostics, and asserted no mode diagnostic. diagnostic-evidence.mjs confirms the ten raw attributes and remaining 80/91 diagnostics. The initial failure remains in verify-before-diagnostic-fixtures.log; the complete gate will be rerun.

- Command: python3 .agentplane/tasks/202609302034-1CZ8BR/native-oracle.py; npx tsx .agentplane/tasks/202609302034-1CZ8BR/compare-native.mjs.
  Result: pass.
  Evidence: 74 scalar comparisons against compiled unmodified pinned SAX parse/export and o3tl integer conversion function bodies.
  Scope: Existing Twip/MM100 core targets, CM XML export, signed numbering conversion and SHRT attribute bounds. Harness platform aliases and unit ratios are supplied locally; wider APIs/units, native full XML/UNO objects and whole-module parity are not claimed.

- Command: npx vitest run src/sw/source/filter/xml src/sw/source/core/unocore/unosett.test.ts src/xmloff/source/style src/xmloff/source/core/xmluconv.test.ts src/xmloff/source/text/txtpara.test.ts src/xmloff/source/text/txtparae.test.ts src/xmloff/source/text/txtparai.test.ts src/sax/source/tools/converter.test.ts --coverage.enabled=false (cwd apps/office).
  Result: pass.
  Evidence: 147 tests in 33 files; focused.log.
  Scope: All affected package/style/text/converter and new Writer conversion assertions; literal common/automatic list cycles and both default marker families.

- Command: npm run verify.
  Result: pass, terminal exit 0 after the fixture remediation.
  Evidence: verify.log; 604 app tests in 128 files, 109 inventory tests in 36 files, 19 browser cases, 100% statements/branches/functions/lines in both required coverage suites. Format, lint, types, module boundaries (197 runtime sources, 812 imports, 12 allowed edges), resource regeneration, static builds, docs, strict file size (432 authored files), source tree (111 paths/33 retired roots), provenance (198 modules: 122 mapped/60 browser/16 infrastructure), 34 invariants and parity consistency all pass; semanticViolationCount=0. Terminal-completed log is compacted after source provenance, retaining the remaining gate summaries.
  Scope: Entire repository mandatory gate. No validator/schema/generator/threshold weakening and no registered save/open/recovery behavior change. Broader semantic statuses remain unverified.

- Command: ap doctor; node .agentplane/policy/check-routing.mjs; git diff --check; npx tsx .agentplane/tasks/202609302034-1CZ8BR/diagnostic-evidence.mjs.
  Result: pass.
  Evidence: doctor exit 0 with the same two pre-existing warnings (old hook readiness shim and old DONE task close pointer), routing OK, diff clean after stripping test-output trailing blank lines, diagnostic-evidence.log exact ten recognized attributes and remaining 80/91 structural warnings.
  Scope: Local workflow/policy/patch hygiene and pinned package diagnostics. The first diff check found only a test-log trailing blank EOF; sanitized after completion and repeated successfully.

- Observation: Supported LABEL_ALIGNMENT import/export now retains native zero/follow defaults and MM100 bounds until the Writer UNO boundary; export has explicit mode, native omission predicates and two-stage signed quantization. Command-specific default-geometry suppression is removed. Native ownership maps to xmlnumi/xmlnume/unosett/XML/SAX without a compatibility re-export.
  Impact: Previously rejected/incorrectly rounded inputs, partial attributes, standard command geometry and unused/nonpositive tabs now reproduce the pinned supported contracts across actual ODT packages.
  Resolution: Retain separate follow-ups for full position-mode model/legacy adapter, NEWLINE extensions, other units/versions, full UNO/default/property ownership, style duplicate/display/default behavior, null dispatch, inline hint/legacy conversion and all other existing runtime/UI obligations. A whole-module or parent completion claim would be unsupported.
