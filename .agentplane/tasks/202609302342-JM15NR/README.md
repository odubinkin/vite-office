---
id: "202609302342-JM15NR"
title: "Restore native ODF numbering marker parameter transport"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 19
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
  - "numbering"
  - "parity"
verify:
  - "npm run verify"
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T23:43:02.406Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-01T00:08:51.790Z"
  updated_by: "CODER"
  note: "Unchanged npm run verify exits 0: 634 application, 109 inventory and 19 browser tests, both 100% coverage suites; 144 native declaration/applied/export differential cases match. Genuine common/automatic ODT, clone, Worker v16, selected XML and native standard-format approximation pass. Doctor zero errors with two prior warnings, routing/diff pass. Wider numbering and zero-start continuation are separate unresolved obligations; no full parity claim."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-01T00:09:30.447Z"
  updated_by: "EVALUATOR"
  note: "Approved native ODF marker transport and per-level source-owned export satisfy bounded Verify Steps at c8d63aa66bdeba160dbcf355c0ec2ed059f66259."
  evaluated_sha: "c8d63aa66bdeba160dbcf355c0ec2ed059f66259"
  blueprint_digest: "cd237efb975829f95b10ebb1c0651b39e4c7abe271e85d1842e553e240bd4f99"
  evidence_refs:
    - ".agentplane/tasks/202609302342-JM15NR/README.md"
    - ".agentplane/tasks/202609302342-JM15NR/quality/20261001-000930447-recovery-context/quality-report.json"
    - ".agentplane/tasks/202609302342-JM15NR/quality/20261001-000930447-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202609302342-JM15NR/quality/20261001-000930447-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202609302342-JM15NR/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202609302342-JM15NR/verify.log"
    - ".agentplane/tasks/202609302342-JM15NR/native-oracle.py"
    - ".agentplane/tasks/202609302342-JM15NR/native-results.json"
    - ".agentplane/tasks/202609302342-JM15NR/compare-native.ts"
    - "apps/office/src/sw/source/filter/xml/odt-list-marker-roundtrip.test.ts"
  findings:
    - "Code now preserves raw affixes, native start/display parsing and optional alias order/empty patterns, applies ListFormat last, and delegates standard ODF marker output to xmlnume with native signed narrowing/omissions. Actual ODT tests cover common/automatic states, labels, clones, Worker v16 and explicit standard-format approximation; compiled primary excerpts match 144 declaration/applied/export cases. Full unchanged verify passes both 100% suites and all 19 browser checks; module statuses stay unverified. Intentional save/open/recovery behavior is preserved."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Restore native ODF marker parameter transport and source-owned per-level export under the continuing parity goal."
events:
  -
    type: "status"
    at: "2026-09-30T23:43:02.865Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore native ODF marker parameter transport and source-owned per-level export under the continuing parity goal."
  -
    type: "verify"
    at: "2026-10-01T00:08:51.790Z"
    author: "CODER"
    state: "ok"
    note: "Unchanged npm run verify exits 0: 634 application, 109 inventory and 19 browser tests, both 100% coverage suites; 144 native declaration/applied/export differential cases match. Genuine common/automatic ODT, clone, Worker v16, selected XML and native standard-format approximation pass. Doctor zero errors with two prior warnings, routing/diff pass. Wider numbering and zero-start continuation are separate unresolved obligations; no full parity claim."
doc_version: 3
doc_updated_at: "2026-10-01T00:08:51.842Z"
doc_updated_by: "CODER"
description: "Preserve native prefix/suffix/start/display and ListFormat properties through XML declaration, Writer UNO application and ODF 1.3 export; refactor rule export into source-owned per-level property records."
sections:
  Summary: "Restore native marker parameter transport for the existing ODF Arabic and bullet numbering pipeline."
  Scope: "xmloff core token/ordered attribute adapter, style/xmlnumi and xmlnume, text import/export records and affected text export tests; Writer UNO property application and XML import/export bridge; focused genuine ODT fixtures, bounded primary-source probes, inventory/provenance and task evidence. Refactor parallel export arrays into per-level property records and relocate marker serialization to xmlnume. Retain ODF 1.3 export version/settings, Worker graph v16, existing unsupported number families and registered save/open/recovery deviations. No network/outside access, policy/gate/threshold changes or whole-module parity promotion."
  Plan: "Add source-owned numeric declaration parsing using native byte-string integer grammar and clamp rules, raw prefix/suffix for both families, and optional style/loext ListFormat with native last-attribute precedence. Generate absent ListFormat at GetProperties with display-level clamping, transport it last through Writer UNO application after prefix/suffix/start/parent properties and native validation/copy/Set. Export prefix/suffix for both families, numeric start and clamped parent count with native omission predicates and signed UNO start narrowing under existing standard ODF 1.3, retaining native lossy fallback of explicit nonstandard patterns. Replace parallel export marker/layout arrays with per-level neutral properties and source-own serialization in xmlnume. Update bounded alias/export conflict checks to account for transported fields. Verify parsed/native state, actual node labels, clones/Worker transfer and export/reopen with literal source-derived fixtures, then full unchanged mandatory gates and lifecycle."
  Verify Steps: "Verify absent/empty/raw affixes, XML escaping, byte-prefix/invalid/negative/overflow start/display values, numeric SHRT bounds, bullet ignoring start/display, native generated pattern clamp and SetListFormat compatibility overwrite. Test standard and loext raw pattern aliases including both attribute orders and empty patterns. Check ordered UNO application and rejection retention, source-owned export records, native conditional prefix/suffix/start/display output and signed start projection. Genuine common and automatic ODT fixtures must assert complete marker state, visible labels, copies, Worker v16, exact selected XML and reopen; explicitly assert native standard ODF 1.3 pattern approximation rather than inventing losslessness. Compare representative declaration/property/export predicates to unmodified extracted pinned bodies with bounded dependency shims. Run npm run verify unchanged with both 100% coverage suites and all browser/source/provenance/ODT gates; ap doctor, policy routing and git diff --check. Record real code hash and clean final tracked state."
  Verification: |-
    Pending implementation and final mandatory gates.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-01T00:08:51.790Z — VERIFY — ok

    By: CODER

    Note: Unchanged npm run verify exits 0: 634 application, 109 inventory and 19 browser tests, both 100% coverage suites; 144 native declaration/applied/export differential cases match. Genuine common/automatic ODT, clone, Worker v16, selected XML and native standard-format approximation pass. Doctor zero errors with two prior warnings, routing/diff pass. Wider numbering and zero-start continuation are separate unresolved obligations; no full parity claim.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T00:08:51.368Z, excerpt_hash=sha256:60c05899c03c17f813e26ce2867f9532ef4ad75792848e97811891c55c83903e

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302342-JM15NR/blueprint/resolved-snapshot.json
    - old_digest: cd237efb975829f95b10ebb1c0651b39e4c7abe271e85d1842e553e240bd4f99
    - current_digest: cd237efb975829f95b10ebb1c0651b39e4c7abe271e85d1842e553e240bd4f99
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202609302342-JM15NR

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202609302342-JM15NR
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the scoped implementation commit after inspecting later numbering corrections; retain task evidence."
  Findings: |-
    Previous turn is progress: iteration26 child 202609302319-9KTM99 DONE, implementation 7a5d80e1add85f113e00ea6fcf70e802a0e194cf and parent progress 6c27c2da1724ef23b6f6bd506488ec31c2f0b5ff; clean main/direct and only parent active. Persistent goal authorizes safe local correction. Pinned libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65 xmlnumi accepts raw prefix/suffix for both families, StartWith clamp 0..32767 with negatives->1, ParentNumbering clamp 1..32767, optional style/loext ListFormat in attribute order and generated clamped placeholders. GetProperties always appends ListFormat last; numeric start/parent only. unosett applies prefix/suffix/start/accepted parent then ListFormat; xmlnume emits nonempty affixes for both families, nondefault numeric start and clamped display>1, but raw ListFormat only in extended output. Local XML adapters drop fields/reject suffixes and text export substitutes a dot. SwXML metadata generator/build-id parsing is currently absent/ignored: ancient OOo bogus-bullet-suffix correction and full generator contracts remain a separate unresolved dependency, so no complete legacy/full-module import claim. Extended export and numbering families/fonts/legal/outline/continuous/bitmap/NONE remain unverified; preserve current standard ODF 1.3 settings.

    - Observation: Initial typecheck identifies old parallel-array export fixtures after the approved per-level property-record refactor; runtime implementation compiles. Old partial suffix/bullet-array rejection cases describe states the new transport no longer represents.
      Impact: Fixtures must use coherent level records and verify native missing-property defaults while retaining complete ten-level and invalid-character guards.
      Resolution: Migrate fixture records, replace obsolete partial-array guards with source-backed missing-field default assertions, keep all mandatory gates unchanged and rerun.

    - Observation: Focused run passes 49 tests and fails the prior literal expectation that a closing-parenthesis suffix is unsupported. Pinned xmlnumi stores arbitrary suffixes and native SetListFormat applies them.
      Impact: The old rejection expectation conflicts with source behavior and must become concrete state/visible-label evidence.
      Resolution: Assert imported suffix and actual paragraph marker for the same literal fixture; add genuine ODT parameter and native probe coverage, then rerun full gates.

    - Observation: Focused run passes the migrated exporter/context/UNO and old suffix fixture checks; all three new package fixtures fail before semantic assertions because readOdtDocument requires a metadata argument.
      Impact: The new fixture helper call contract is wrong; no marker behavior mismatch is inferred.
      Resolution: Use the existing reader metadata contract and rerun these fixtures, preserving planned source assertions and full gates.

    - Observation: The bounded C++ probe initially lacked the existing native GetStart inline accessor in its dependency shim; adding the unmodified header accessor fixed compilation. The fixture metadata repair passes all three genuine-package tests.
      Impact: Neither failure indicates a runtime marker mismatch.
      Resolution: Compiled unmodified pinned attribute loop, generated ListFormat block, marker property publication/UNO branches, signed start projection and export predicates. All 144 declarations, 144 applied marker states and 144 standard export attribute sets match local runtime. ASCII OUString/modern-no-build-id/Arabic-bullet/standard-ODF bounds are explicit; no full-native-build claim. The exact scripts/results are task-local; wider and ancient-generator dependencies remain unresolved.

    - Observation: First full npm run verify exits 1 at lint on three unnecessary escaped quotes inside single-quoted literal test expectations.
      Impact: Test source style violates unchanged lint; runtime semantics are not implicated.
      Resolution: Remove the redundant escapes and rerun full mandatory verification without lowering gates.

    - Observation: Final unchanged npm run verify exits 0 (session 68214): 634 application tests / 135 files, 109 inventory tests / 36 files, 19 browser tests; application coverage 100% statements 9833, branches 7389, functions 2712, lines 9046; inventory coverage 100% 1523/1080/384/1464. Source provenance checks 199 modules; 34 invariants valid, parity semanticViolationCount 0. Doctor has zero errors and the same two existing warnings; routing and diff checks pass.
      Impact: Approved marker transport/refactor is validated without gate changes; inventory success does not close wider semantic obligations.
      Resolution: Finish this bounded leaf with the real implementation hash. Separate read-only next-slice audit finds SwList zero-as-uninitialized counter logic: three counted paragraphs at start 0 yield 0.,0.,0. whereas pinned SwNumberTreeNode::ValidateHierarchical increments siblings independently of current numeric value (0,1,2). Preserve this as next executable correction, with authoritative source comparison and broader counter ownership audit. Ancient-generator APIs and other numbering/UNO/extended-format obligations remain unverified.
id_source: "generated"
---
## Summary

Restore native marker parameter transport for the existing ODF Arabic and bullet numbering pipeline.

## Scope

xmloff core token/ordered attribute adapter, style/xmlnumi and xmlnume, text import/export records and affected text export tests; Writer UNO property application and XML import/export bridge; focused genuine ODT fixtures, bounded primary-source probes, inventory/provenance and task evidence. Refactor parallel export arrays into per-level property records and relocate marker serialization to xmlnume. Retain ODF 1.3 export version/settings, Worker graph v16, existing unsupported number families and registered save/open/recovery deviations. No network/outside access, policy/gate/threshold changes or whole-module parity promotion.

## Plan

Add source-owned numeric declaration parsing using native byte-string integer grammar and clamp rules, raw prefix/suffix for both families, and optional style/loext ListFormat with native last-attribute precedence. Generate absent ListFormat at GetProperties with display-level clamping, transport it last through Writer UNO application after prefix/suffix/start/parent properties and native validation/copy/Set. Export prefix/suffix for both families, numeric start and clamped parent count with native omission predicates and signed UNO start narrowing under existing standard ODF 1.3, retaining native lossy fallback of explicit nonstandard patterns. Replace parallel export marker/layout arrays with per-level neutral properties and source-own serialization in xmlnume. Update bounded alias/export conflict checks to account for transported fields. Verify parsed/native state, actual node labels, clones/Worker transfer and export/reopen with literal source-derived fixtures, then full unchanged mandatory gates and lifecycle.

## Verify Steps

Verify absent/empty/raw affixes, XML escaping, byte-prefix/invalid/negative/overflow start/display values, numeric SHRT bounds, bullet ignoring start/display, native generated pattern clamp and SetListFormat compatibility overwrite. Test standard and loext raw pattern aliases including both attribute orders and empty patterns. Check ordered UNO application and rejection retention, source-owned export records, native conditional prefix/suffix/start/display output and signed start projection. Genuine common and automatic ODT fixtures must assert complete marker state, visible labels, copies, Worker v16, exact selected XML and reopen; explicitly assert native standard ODF 1.3 pattern approximation rather than inventing losslessness. Compare representative declaration/property/export predicates to unmodified extracted pinned bodies with bounded dependency shims. Run npm run verify unchanged with both 100% coverage suites and all browser/source/provenance/ODT gates; ap doctor, policy routing and git diff --check. Record real code hash and clean final tracked state.

## Verification

Pending implementation and final mandatory gates.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-01T00:08:51.790Z — VERIFY — ok

By: CODER

Note: Unchanged npm run verify exits 0: 634 application, 109 inventory and 19 browser tests, both 100% coverage suites; 144 native declaration/applied/export differential cases match. Genuine common/automatic ODT, clone, Worker v16, selected XML and native standard-format approximation pass. Doctor zero errors with two prior warnings, routing/diff pass. Wider numbering and zero-start continuation are separate unresolved obligations; no full parity claim.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T00:08:51.368Z, excerpt_hash=sha256:60c05899c03c17f813e26ce2867f9532ef4ad75792848e97811891c55c83903e

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202609302342-JM15NR/blueprint/resolved-snapshot.json
- old_digest: cd237efb975829f95b10ebb1c0651b39e4c7abe271e85d1842e553e240bd4f99
- current_digest: cd237efb975829f95b10ebb1c0651b39e4c7abe271e85d1842e553e240bd4f99
- route_changed: no
- safe_command: agentplane blueprint snapshot 202609302342-JM15NR

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202609302342-JM15NR
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the scoped implementation commit after inspecting later numbering corrections; retain task evidence.

## Findings

Previous turn is progress: iteration26 child 202609302319-9KTM99 DONE, implementation 7a5d80e1add85f113e00ea6fcf70e802a0e194cf and parent progress 6c27c2da1724ef23b6f6bd506488ec31c2f0b5ff; clean main/direct and only parent active. Persistent goal authorizes safe local correction. Pinned libreoffice-26.8.0.2 /9bc445578031fecf56086729d8e4940c77e14d65 xmlnumi accepts raw prefix/suffix for both families, StartWith clamp 0..32767 with negatives->1, ParentNumbering clamp 1..32767, optional style/loext ListFormat in attribute order and generated clamped placeholders. GetProperties always appends ListFormat last; numeric start/parent only. unosett applies prefix/suffix/start/accepted parent then ListFormat; xmlnume emits nonempty affixes for both families, nondefault numeric start and clamped display>1, but raw ListFormat only in extended output. Local XML adapters drop fields/reject suffixes and text export substitutes a dot. SwXML metadata generator/build-id parsing is currently absent/ignored: ancient OOo bogus-bullet-suffix correction and full generator contracts remain a separate unresolved dependency, so no complete legacy/full-module import claim. Extended export and numbering families/fonts/legal/outline/continuous/bitmap/NONE remain unverified; preserve current standard ODF 1.3 settings.

- Observation: Initial typecheck identifies old parallel-array export fixtures after the approved per-level property-record refactor; runtime implementation compiles. Old partial suffix/bullet-array rejection cases describe states the new transport no longer represents.
  Impact: Fixtures must use coherent level records and verify native missing-property defaults while retaining complete ten-level and invalid-character guards.
  Resolution: Migrate fixture records, replace obsolete partial-array guards with source-backed missing-field default assertions, keep all mandatory gates unchanged and rerun.

- Observation: Focused run passes 49 tests and fails the prior literal expectation that a closing-parenthesis suffix is unsupported. Pinned xmlnumi stores arbitrary suffixes and native SetListFormat applies them.
  Impact: The old rejection expectation conflicts with source behavior and must become concrete state/visible-label evidence.
  Resolution: Assert imported suffix and actual paragraph marker for the same literal fixture; add genuine ODT parameter and native probe coverage, then rerun full gates.

- Observation: Focused run passes the migrated exporter/context/UNO and old suffix fixture checks; all three new package fixtures fail before semantic assertions because readOdtDocument requires a metadata argument.
  Impact: The new fixture helper call contract is wrong; no marker behavior mismatch is inferred.
  Resolution: Use the existing reader metadata contract and rerun these fixtures, preserving planned source assertions and full gates.

- Observation: The bounded C++ probe initially lacked the existing native GetStart inline accessor in its dependency shim; adding the unmodified header accessor fixed compilation. The fixture metadata repair passes all three genuine-package tests.
  Impact: Neither failure indicates a runtime marker mismatch.
  Resolution: Compiled unmodified pinned attribute loop, generated ListFormat block, marker property publication/UNO branches, signed start projection and export predicates. All 144 declarations, 144 applied marker states and 144 standard export attribute sets match local runtime. ASCII OUString/modern-no-build-id/Arabic-bullet/standard-ODF bounds are explicit; no full-native-build claim. The exact scripts/results are task-local; wider and ancient-generator dependencies remain unresolved.

- Observation: First full npm run verify exits 1 at lint on three unnecessary escaped quotes inside single-quoted literal test expectations.
  Impact: Test source style violates unchanged lint; runtime semantics are not implicated.
  Resolution: Remove the redundant escapes and rerun full mandatory verification without lowering gates.

- Observation: Final unchanged npm run verify exits 0 (session 68214): 634 application tests / 135 files, 109 inventory tests / 36 files, 19 browser tests; application coverage 100% statements 9833, branches 7389, functions 2712, lines 9046; inventory coverage 100% 1523/1080/384/1464. Source provenance checks 199 modules; 34 invariants valid, parity semanticViolationCount 0. Doctor has zero errors and the same two existing warnings; routing and diff checks pass.
  Impact: Approved marker transport/refactor is validated without gate changes; inventory success does not close wider semantic obligations.
  Resolution: Finish this bounded leaf with the real implementation hash. Separate read-only next-slice audit finds SwList zero-as-uninitialized counter logic: three counted paragraphs at start 0 yield 0.,0.,0. whereas pinned SwNumberTreeNode::ValidateHierarchical increments siblings independently of current numeric value (0,1,2). Preserve this as next executable correction, with authoritative source comparison and broader counter ownership audit. Ancient-generator APIs and other numbering/UNO/extended-format obligations remain unverified.
