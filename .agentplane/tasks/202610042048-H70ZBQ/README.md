---
id: "202610042048-H70ZBQ"
title: "Own hyperlink item metadata by value"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 18
origin:
  system: "manual"
depends_on:
  - "202610042020-VSS64R"
tags:
  - "code"
task_kind: "code"
mutation_scope: "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-04T20:48:59.516Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-04T21:04:55.232Z"
  updated_by: "CODER"
  note: "Verified owned hyperlink metadata scope at 7af77163b12d6c0d6b0c86006b37a3252cbd637d: six static first-pass gates; one upstream-absent build,2277 app tests,109 inventory tests,5 script tests,99 Chromium cases;100% app/inventory coverage. Five restored source audits semantic0,341 prior tests unchanged,five paths,234 runtime rows preserved,AP sourcefree,doctor0 errors/routingpass; exact-SHA same-actor quality pass. Broad native/UI parity remains unverified."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-04T21:04:13.311Z"
  updated_by: "EVALUATOR"
  note: "Same-actor read-only exact-SHA review passes approved hyperlink value-ownership scope at 7af77163b12d6c0d6b0c86006b37a3252cbd637d."
  evaluated_sha: "7af77163b12d6c0d6b0c86006b37a3252cbd637d"
  blueprint_digest: "27be13eef277b0a1f48178310c8de79df7b589f2e92177851bef9bef1d84489f"
  evidence_refs:
    - ".agentplane/tasks/202610042048-H70ZBQ/README.md"
    - ".agentplane/tasks/202610042048-H70ZBQ/quality/20261004-210413311-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610042048-H70ZBQ/quality/20261004-210413311-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610042048-H70ZBQ/quality/20261004-210413311-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610042048-H70ZBQ/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610042048-H70ZBQ/evidence/static-gates.json"
    - ".agentplane/tasks/202610042048-H70ZBQ/evidence/absent-profile.json"
    - ".agentplane/tasks/202610042048-H70ZBQ/evidence/restored-source-audits.json"
    - ".agentplane/tasks/202610042048-H70ZBQ/evidence/scope-and-native-hashes.json"
    - "Read-only exact-commit/scope/native-hash audit at 7af77163b12d6c0d6b0c86006b37a3252cbd637d"
  findings:
    - "Exact semantic diff contains five allowed paths; constructor owns supported string values without freezing caller, retains existing optional/JSON/clone contracts.78 literal boundary and actual graph cases cover caller mutation before cloning or ingestion,projection/copy/cut/history independence;all341 prior tests unchanged."
    - "Evidence ties six first-pass static gates,one upstream-absent build/app2277/inventory109/scripts5/Chromium99 run,100% four-metric app/inventory coverage and five restored source audits semantic0 to unchanged semantic bytes.234 runtime rows retain every field/status/default/exception except one bounded appendix;3 native hashes match. AP forbidden0,doctor0 errors/routingpass."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: execute approved iteration121 hyperlink string value ownership correction with literal metadata/actual graph boundaries;tests once absent,no AP helper/source artifacts."
events:
  -
    type: "status"
    at: "2026-10-04T20:48:59.942Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: execute approved iteration121 hyperlink string value ownership correction with literal metadata/actual graph boundaries;tests once absent,no AP helper/source artifacts."
  -
    type: "verify"
    at: "2026-10-04T21:04:55.232Z"
    author: "CODER"
    state: "ok"
    note: "Verified owned hyperlink metadata scope at 7af77163b12d6c0d6b0c86006b37a3252cbd637d: six static first-pass gates; one upstream-absent build,2277 app tests,109 inventory tests,5 script tests,99 Chromium cases;100% app/inventory coverage. Five restored source audits semantic0,341 prior tests unchanged,five paths,234 runtime rows preserved,AP sourcefree,doctor0 errors/routingpass; exact-SHA same-actor quality pass. Broad native/UI parity remains unverified."
doc_version: 3
doc_updated_at: "2026-10-04T21:04:55.290Z"
doc_updated_by: "CODER"
description: "Iteration121 fixes retained caller metadata alias in existing SwFormatINetFormat. Capture supported immutable string values at construction as in native owned OUString/UIName fields,keeping metadata optional/empty values and existing JSON codecs/defaults. Prove caller/returned/clone isolation through direct items,actual hint graphs,copy/cut/transfer/history boundaries. One upstream-absent profile;registered I/O/recovery deviations untouched."
sections:
  Summary: "Own existing hyperlink item metadata by value instead of retaining mutable caller references."
  Scope: |-
    apps/office/src/sw/source/core/txtnode/fmtatr2.ts
    apps/office/src/sw/source/core/txtnode/hyperlink-metadata-ownership.test.ts
    apps/office/src/sw/source/core/txtnode/owned-hyperlink-metadata.test.ts
    docs/program/source-provenance.json
    docs/program/parity/runtime-inventory.json
    Task metadata/evidence prose/counts/hashes only.341prior tests byte-identical;234 runtime fields unchanged except one bounded appendix;registered I/O/recovery deviations preserved.
  Plan: "Capture SwFormatINetFormat's five supported string metadata fields at construction into its own readonly boundary value;do not retain the caller object. Preserve optional omission versus explicit empty values,existing plain input JSON key order/non-shareability/URL rejection/equality/clone/projection contracts. Capture supported inherited string properties too,without freezing or mutating caller objects. Add literal matrix cases for own/prototype values,optional metadata combinations,caller mutation/field insertion-deletion,returned projection mutation,clone-after-caller-edit and separate later items. Add actual SwTextAttr/node/three-map ownership/copy/cut/transfer/snapshot/undo coverage with caller edited before ingestion,all eight flags. All341 prior tests byte-identical,234 runtime fields/statuses/defaults/exceptions unchanged except one bounded justification/provenance appendix,five semantic paths,no new runtime module. Native constructors/copy/equality and owned string fields inspected; record only hashes/prose. Native style IDs/macros/broadcaster/text backlink/client/refcounts/hierarchy/empty URL/default full UNO and adjacent INET/native InsertText adjustment remain unverified;adjacent INET omission from MergePortions was observed but coupled portable insertion topology requires a separate correction. Six static gates first,one sequential absent build/app/inventory/scripts/Chromium profile with finally restoration,no concurrent audits;failed-only recovery,restored source/resource/invariant/parity audits;scope/native hashes/sourcefree AP/doctor/routing. Same-actor read-only exact-SHA quality pass,CODER verify/finish,clean main/active parent. No AP source/probe/helper files,no network."
  Verify Steps: |-
    1. Inspect pinned fmtinfmt.hxx owned string fields and fmtatr2.cxx construction/copy/equality/Clone; record only hashes/prose. Expected supported metadata strings stay independent of caller mutations;later items see new caller values;return/clone/node/history/copy/move boundaries independent.
    2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass.
    3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory four metrics100%. Recover failed gates/cases only; no present profile or concurrent source/scope/AP audits.
    4. After restoration npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic violations0.
    5. Audit five semantic paths,all341previous tests byte-identical,234runtime fields/statuses/defaults/exceptions unchanged except one justification appendix,provenance only one bounded appendix,native hashes,ignored-inclusive AP source/helper-free. Run ap doctor,node .agentplane/policy/check-routing.mjs; no new errors.
    6. Same-actor read-only EVALUATOR exact semantic SHA quality pass; CODER verify/finish separate commit hashes; clean main/vendor restored;parent/goal active. No broad native/core/UI promotion.
  Verification: |-
    PASS: Iteration121 fixes SwFormatINetFormat caller metadata alias with an owned five-string construction snapshot,including supported inherited fields. Existing plain JSON order/optional omission versus empty strings/non-shareability/URL rejection/equality/Clone codecs preserved.78 literal cases pass:38 direct value/projection/clone/later-item cases and40 actual node/copy/cut/transfer/history/undo cases across all eight flags. Exactly five semantic paths;all341 prior test/spec files byte-identical.234 runtime fields/statuses/defaults/exceptions unchanged except one justification appendix,one provenance appendix,three native hashes. Six static gates first pass;one absent build/app2277/260,inventory109/36,scripts5/2,Chromium99 passed,all app/inventory coverage metrics100%. No suite/build replay or recovery. Vendor restored before five source audits semantic0. Ignored-inclusive AP source/helper scan forbidden0,doctor0 errors/two unchanged warnings,routingpass. Exact-SHA 7af77163b12d6c0d6b0c86006b37a3252cbd637d same-actor read-only quality pass recorded at .agentplane/tasks/202610042048-H70ZBQ/quality/20261004-210413311-recovery-context/quality-report.json. Full native style IDs/macros/broadcaster/text backlink/client/refcounts/hierarchy/default empty URL/full UNO and coupled adjacent INET/native insertion topology remain unverified. Registered I/O/recovery deviations untouched;no module/goal promotion.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-04T21:04:55.232Z — VERIFY — ok

    By: CODER

    Note: Verified owned hyperlink metadata scope at 7af77163b12d6c0d6b0c86006b37a3252cbd637d: six static first-pass gates; one upstream-absent build,2277 app tests,109 inventory tests,5 script tests,99 Chromium cases;100% app/inventory coverage. Five restored source audits semantic0,341 prior tests unchanged,five paths,234 runtime rows preserved,AP sourcefree,doctor0 errors/routingpass; exact-SHA same-actor quality pass. Broad native/UI parity remains unverified.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T21:04:42.058Z, excerpt_hash=sha256:bdf8fe8c14aae4787788354ba77ccc744e2939f5cb9c01d3d90811cbb120a3e7

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610042048-H70ZBQ/blueprint/resolved-snapshot.json
    - old_digest: 27be13eef277b0a1f48178310c8de79df7b589f2e92177851bef9bef1d84489f
    - current_digest: 27be13eef277b0a1f48178310c8de79df7b589f2e92177851bef9bef1d84489f
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610042048-H70ZBQ

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610042048-H70ZBQ
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the semantic commit through a new scoped task,preserve history and other work;no history rewrite."
  Findings: "Iteration121 fixes SwFormatINetFormat caller metadata alias with an owned five-string construction snapshot,including supported inherited fields. Existing plain JSON order/optional omission versus empty strings/non-shareability/URL rejection/equality/Clone codecs preserved.78 literal cases pass:38 direct value/projection/clone/later-item cases and40 actual node/copy/cut/transfer/history/undo cases across all eight flags. Exactly five semantic paths;all341 prior test/spec files byte-identical.234 runtime fields/statuses/defaults/exceptions unchanged except one justification appendix,one provenance appendix,three native hashes. Six static gates first pass;one absent build/app2277/260,inventory109/36,scripts5/2,Chromium99 passed,all app/inventory coverage metrics100%. No suite/build replay or recovery. Vendor restored before five source audits semantic0. Ignored-inclusive AP source/helper scan forbidden0,doctor0 errors/two unchanged warnings,routingpass. Exact-SHA 7af77163b12d6c0d6b0c86006b37a3252cbd637d same-actor read-only quality pass recorded at .agentplane/tasks/202610042048-H70ZBQ/quality/20261004-210413311-recovery-context/quality-report.json. Full native style IDs/macros/broadcaster/text backlink/client/refcounts/hierarchy/default empty URL/full UNO and coupled adjacent INET/native insertion topology remain unverified. Registered I/O/recovery deviations untouched;no module/goal promotion."
id_source: "generated"
---
## Summary

Own existing hyperlink item metadata by value instead of retaining mutable caller references.

## Scope

apps/office/src/sw/source/core/txtnode/fmtatr2.ts
apps/office/src/sw/source/core/txtnode/hyperlink-metadata-ownership.test.ts
apps/office/src/sw/source/core/txtnode/owned-hyperlink-metadata.test.ts
docs/program/source-provenance.json
docs/program/parity/runtime-inventory.json
Task metadata/evidence prose/counts/hashes only.341prior tests byte-identical;234 runtime fields unchanged except one bounded appendix;registered I/O/recovery deviations preserved.

## Plan

Capture SwFormatINetFormat's five supported string metadata fields at construction into its own readonly boundary value;do not retain the caller object. Preserve optional omission versus explicit empty values,existing plain input JSON key order/non-shareability/URL rejection/equality/clone/projection contracts. Capture supported inherited string properties too,without freezing or mutating caller objects. Add literal matrix cases for own/prototype values,optional metadata combinations,caller mutation/field insertion-deletion,returned projection mutation,clone-after-caller-edit and separate later items. Add actual SwTextAttr/node/three-map ownership/copy/cut/transfer/snapshot/undo coverage with caller edited before ingestion,all eight flags. All341 prior tests byte-identical,234 runtime fields/statuses/defaults/exceptions unchanged except one bounded justification/provenance appendix,five semantic paths,no new runtime module. Native constructors/copy/equality and owned string fields inspected; record only hashes/prose. Native style IDs/macros/broadcaster/text backlink/client/refcounts/hierarchy/empty URL/default full UNO and adjacent INET/native InsertText adjustment remain unverified;adjacent INET omission from MergePortions was observed but coupled portable insertion topology requires a separate correction. Six static gates first,one sequential absent build/app/inventory/scripts/Chromium profile with finally restoration,no concurrent audits;failed-only recovery,restored source/resource/invariant/parity audits;scope/native hashes/sourcefree AP/doctor/routing. Same-actor read-only exact-SHA quality pass,CODER verify/finish,clean main/active parent. No AP source/probe/helper files,no network.

## Verify Steps

1. Inspect pinned fmtinfmt.hxx owned string fields and fmtatr2.cxx construction/copy/equality/Clone; record only hashes/prose. Expected supported metadata strings stay independent of caller mutations;later items see new caller values;return/clone/node/history/copy/move boundaries independent.
2. Run npm run format:check,npm run lint,npm run typecheck,npm run check:dependencies,npm run check:docs,npm run check:file-size. All pass.
3. Rename vendor/libreoffice-reference inside repo and restore in finally. Run once sequentially npm run test:static; npm run test:coverage --workspace @vite-office/office -- --coverage.reportOnFailure; npm run test:inventory:coverage -- --coverage.reportOnFailure; npm exec -- vitest run scripts/check-source-provenance.test.ts scripts/writer-ui-resource-model.test.ts; npm exec -- playwright test --config apps/office/playwright.config.ts. All pass,app/inventory four metrics100%. Recover failed gates/cases only; no present profile or concurrent source/scope/AP audits.
4. After restoration npm exec -- tsx scripts/generate-writer-ui-resources.ts --check;npm run check:source-tree;npm run check:source-provenance;npm run inventory:invariants;npm run inventory:parity. All pass,semantic violations0.
5. Audit five semantic paths,all341previous tests byte-identical,234runtime fields/statuses/defaults/exceptions unchanged except one justification appendix,provenance only one bounded appendix,native hashes,ignored-inclusive AP source/helper-free. Run ap doctor,node .agentplane/policy/check-routing.mjs; no new errors.
6. Same-actor read-only EVALUATOR exact semantic SHA quality pass; CODER verify/finish separate commit hashes; clean main/vendor restored;parent/goal active. No broad native/core/UI promotion.

## Verification

PASS: Iteration121 fixes SwFormatINetFormat caller metadata alias with an owned five-string construction snapshot,including supported inherited fields. Existing plain JSON order/optional omission versus empty strings/non-shareability/URL rejection/equality/Clone codecs preserved.78 literal cases pass:38 direct value/projection/clone/later-item cases and40 actual node/copy/cut/transfer/history/undo cases across all eight flags. Exactly five semantic paths;all341 prior test/spec files byte-identical.234 runtime fields/statuses/defaults/exceptions unchanged except one justification appendix,one provenance appendix,three native hashes. Six static gates first pass;one absent build/app2277/260,inventory109/36,scripts5/2,Chromium99 passed,all app/inventory coverage metrics100%. No suite/build replay or recovery. Vendor restored before five source audits semantic0. Ignored-inclusive AP source/helper scan forbidden0,doctor0 errors/two unchanged warnings,routingpass. Exact-SHA 7af77163b12d6c0d6b0c86006b37a3252cbd637d same-actor read-only quality pass recorded at .agentplane/tasks/202610042048-H70ZBQ/quality/20261004-210413311-recovery-context/quality-report.json. Full native style IDs/macros/broadcaster/text backlink/client/refcounts/hierarchy/default empty URL/full UNO and coupled adjacent INET/native insertion topology remain unverified. Registered I/O/recovery deviations untouched;no module/goal promotion.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-04T21:04:55.232Z — VERIFY — ok

By: CODER

Note: Verified owned hyperlink metadata scope at 7af77163b12d6c0d6b0c86006b37a3252cbd637d: six static first-pass gates; one upstream-absent build,2277 app tests,109 inventory tests,5 script tests,99 Chromium cases;100% app/inventory coverage. Five restored source audits semantic0,341 prior tests unchanged,five paths,234 runtime rows preserved,AP sourcefree,doctor0 errors/routingpass; exact-SHA same-actor quality pass. Broad native/UI parity remains unverified.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-04T21:04:42.058Z, excerpt_hash=sha256:bdf8fe8c14aae4787788354ba77ccc744e2939f5cb9c01d3d90811cbb120a3e7

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610042048-H70ZBQ/blueprint/resolved-snapshot.json
- old_digest: 27be13eef277b0a1f48178310c8de79df7b589f2e92177851bef9bef1d84489f
- current_digest: 27be13eef277b0a1f48178310c8de79df7b589f2e92177851bef9bef1d84489f
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610042048-H70ZBQ

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610042048-H70ZBQ
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the semantic commit through a new scoped task,preserve history and other work;no history rewrite.

## Findings

Iteration121 fixes SwFormatINetFormat caller metadata alias with an owned five-string construction snapshot,including supported inherited fields. Existing plain JSON order/optional omission versus empty strings/non-shareability/URL rejection/equality/Clone codecs preserved.78 literal cases pass:38 direct value/projection/clone/later-item cases and40 actual node/copy/cut/transfer/history/undo cases across all eight flags. Exactly five semantic paths;all341 prior test/spec files byte-identical.234 runtime fields/statuses/defaults/exceptions unchanged except one justification appendix,one provenance appendix,three native hashes. Six static gates first pass;one absent build/app2277/260,inventory109/36,scripts5/2,Chromium99 passed,all app/inventory coverage metrics100%. No suite/build replay or recovery. Vendor restored before five source audits semantic0. Ignored-inclusive AP source/helper scan forbidden0,doctor0 errors/two unchanged warnings,routingpass. Exact-SHA 7af77163b12d6c0d6b0c86006b37a3252cbd637d same-actor read-only quality pass recorded at .agentplane/tasks/202610042048-H70ZBQ/quality/20261004-210413311-recovery-context/quality-report.json. Full native style IDs/macros/broadcaster/text backlink/client/refcounts/hierarchy/default empty URL/full UNO and coupled adjacent INET/native insertion topology remain unverified. Registered I/O/recovery deviations untouched;no module/goal promotion.
