---
id: "202610101723-QH6XM1"
title: "Restore native MoveLeftMargin range and attribute history"
result_summary: "Replaced scalar per-node margin undo synthesis with native document-owned range and SwRegHistory attribute history; undo preserves full values/directness/current slots and redo recomputes current tabs.13888related/492files,40fresh,23Chromium/10files, eight actual whole modules100% allfour; eighteen inventory records and WRITER-004 updated. Correction2/10 after BZ14P4; goal remains active."
status: "DONE"
priority: "med"
owner: "CODER"
revision: 21
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-10T18:04:47.891Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-10T18:08:18.977Z"
  updated_by: "CODER"
  note: "Current native range/history correction passes13888related cases/492files including40fresh, actual whole eight modules100% allfour with current hashes and nonnegative counters;23Chromium/10files; upstream-absent static gates and restored nine metadata audits pass. Original804tests and historical canonical statuses/defaults preserved with explicit bounded migrations. Evidence: evidence/verification.json; semantic b6fbc1920747ea4d6eae28e727263b0067015eb5."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-10T18:08:46.467Z"
  updated_by: "EVALUATOR"
  note: "Same-agent, explicitly non-independent review of exact semantic b6fbc1920747ea4d6eae28e727263b0067015eb5: approved native range and attr-history correction, current-source whole-module100% and related/browser/static/metadata evidence pass."
  evaluated_sha: "b6fbc1920747ea4d6eae28e727263b0067015eb5"
  blueprint_digest: "c89e5e9f0fe915787a74c4420f6e4eb2e8baebc1bf76df5a28a15330707177a9"
  evidence_refs:
    - ".agentplane/tasks/202610101723-QH6XM1/README.md"
    - ".agentplane/tasks/202610101723-QH6XM1/quality/20261010-180846467-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610101723-QH6XM1/quality/20261010-180846467-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610101723-QH6XM1/quality/20261010-180846467-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610101723-QH6XM1/blueprint/resolved-snapshot.json"
    - "semantic:b6fbc1920747ea4d6eae28e727263b0067015eb5; git objects for all eight production files match recorded current source hashes"
    - ".agentplane/tasks/202610101723-QH6XM1/evidence/verification.json"
  findings:
    - "Reviewed original typed item ownership, independent list axes, original mutation and history registration order, single range action, temporary direct/reset rollback, current-default redo and source-document validation before mutation;40fresh cases and preserved historical contracts support the bounded change."
    - "Sixteen existing canonical records retain historical status/default/classification; deleted factory current symbol/evidence mapping retired truthfully and two required native mutation operation records registered. WRITER-004 preserves pinned table first-only multi-reset."
commit:
  hash: "b6fbc1920747ea4d6eae28e727263b0067015eb5"
  message: "🧩 QH6XM1 code: restore native range margin history"
comments:
  -
    author: "CODER"
    body: "Start: Restore approved native MoveLeftMargin range and attribute history with owned source-shaped rollback, current-source validation and preserved inventory/deviations."
  -
    author: "CODER"
    body: "Implemented: native typed range margin mutation and original direct/reset attribute history; current source whole-module coverage and related/browser validation pass."
  -
    author: "CODER"
    body: "Verified: restored native typed margin range mutation and original direct/reset history;13888related cases,40fresh,23Chromium scenarios and actual whole eight-module100% allfour pass with current source hashes and references absent during testing. Inventory/source/static gates and exact same-agent semantic review pass; registered deviations and broader native gaps retained."
events:
  -
    type: "status"
    at: "2026-10-10T17:24:49.814Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Restore approved native MoveLeftMargin range and attribute history with owned source-shaped rollback, current-source validation and preserved inventory/deviations."
  -
    type: "status"
    at: "2026-10-10T18:08:18.496Z"
    author: "CODER"
    from: "DOING"
    to: "DOING"
    note: "Implemented: native typed range margin mutation and original direct/reset attribute history; current source whole-module coverage and related/browser validation pass."
  -
    type: "verify"
    at: "2026-10-10T18:08:18.977Z"
    author: "CODER"
    state: "ok"
    note: "Current native range/history correction passes13888related cases/492files including40fresh, actual whole eight modules100% allfour with current hashes and nonnegative counters;23Chromium/10files; upstream-absent static gates and restored nine metadata audits pass. Original804tests and historical canonical statuses/defaults preserved with explicit bounded migrations. Evidence: evidence/verification.json; semantic b6fbc1920747ea4d6eae28e727263b0067015eb5."
  -
    type: "status"
    at: "2026-10-10T18:09:28.891Z"
    author: "CODER"
    from: "DOING"
    to: "DONE"
    note: "Verified: restored native typed margin range mutation and original direct/reset history;13888related cases,40fresh,23Chromium scenarios and actual whole eight-module100% allfour pass with current source hashes and references absent during testing. Inventory/source/static gates and exact same-agent semantic review pass; registered deviations and broader native gaps retained."
doc_version: 3
doc_updated_at: "2026-10-10T18:09:28.893Z"
doc_updated_by: "CODER"
description: "Replace per-node scalar margin action/group with original SwDoc range mutation and SwUndoMoveLeftMargin retained SwHistory; native attr-set deltas feed SwRegHistory, preserving direct/inherited typed left/first state and recomputing redo from document tabs. One correction2/10 after BZ14P4."
sections:
  Summary: "Restore native MoveLeftMargin range mutation and owned attribute history for existing body/cell paragraphs. Source fidelity includes typed first/left values, direct/inherited restoration, independent list indentation applicability and redo using current tabs."
  Scope: |-
    Eight production modules: apps/office/src/sw/source/core/bastyp/index.ts, apps/office/src/sw/source/core/docnode/node.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/doc/docfmt.ts, apps/office/src/sw/source/core/edit/edattr.ts, apps/office/src/sw/source/core/undo/rolbck.ts, apps/office/src/sw/source/core/undo/unattr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts. Sixteen corresponding canonical runtime/provenance records, parent audit Findings, optional source-backed suspected-issue note; exact native constructor/initial-operation fixture migrations in native-format-node-index.test.ts and undobj.test.ts; up to three fresh acceptance files for history/deltas/range/list/current-index behavior. Preserve all old cases/inputs/expected values except explicit native history payload semantics.

    No new core/browser serialization adapter or arbitrary native flattening. BroadcastingModify identity is supplied through the current TypeScript linear base of node/content-index registry; the C++ three independent bases are not claimed fully identical and their future physical hierarchy refactor remains explicit. No native style registration, frame/vertical/redline merged-layout or complete rich numbering-unit/transport/pooling/hash/general UNO/Repeat infrastructure parity claim. Existing numbering-format profile stores TWIP first-line indentation only; preserve its represented list unit rather than invent an unsupported format state. Existing edit-shell admission guard remains a separate correction. Registered recovery/open/save/settings UI deviations preserved.
    Mandatory inventory closure also includes two canonical operation records in docs/program/registry/writer/operations/: writer.internal.move-left-margin-core.json and writer.internal.move-left-margin-at-shell.json. This completes the user-authorized exhaustive inventory for the two new exported mutation helpers; no production/behavior/verification expansion.
  Plan: "Restore native range margin/history in eight production modules, sixteen runtime/provenance records and two mandatory canonical exported-mutation operation records; exact two old migrations and three fresh files; preserve source limitations and deviations. Complete upstream-absent related whole-module100% and browser validation, restored inventory audits and same-agent exact semantic review; second correction since BZ14P4."
  Verify Steps: |-
    1. Source-only pinned contracts and hashes with no upstream source/helper copies in AgentPlane. Native history direct/reset discriminants, independent owned measures and percentages, source record order and temporary rollback lifetime; unchanged node/style/cursor/indices.
    2. Actual initialized ranges and body/cells: default/empty/custom tabs, modulus/signs, direct/inherited margins, independent list-left/first flags and modes, one range history action, zero/full initial history payload, undo through replacement slots and repeated cycles, redo recomputation from current document defaults without new undo recording. Unsupported source profiles explicitly remain unverified.
    3. Changed format/lint; whole TS7/type/dependencies/file-size/JSDoc/build/static; then Vitest related actual whole eight modules100% lines/statements/functions/branches with complete current source/maps and nonnegative counters plus fresh tests, and related Chromium. Both references absent throughout runtime/static, restore in finally; no with/without double run and no passing replay for helper/metadata repair.
    4. Restored registry-build/source-tree/provenance/registry/resource-generation/invariants/parity/doctor/routing. Historical status/default/classification/evidence prefixes and old test case/input/expectation contracts preserved modulo declared source representation/initial-operation/payload changes. No source/classification promotion to hide gaps.
    5. Exact semantic commit binds current-source hashes; explicit same-agent non-independent evaluator, verification and finish via CLI; clean branch writer and references restored. No full run due this second correction since BZ14P4.
  Verification: |-
    Command: upstream-absent changed format/lint, whole TS7/type/dependencies/file-size/JSDoc/build/static; npm exec vitest related with eight explicit whole-module coverage includes; ten related Writer Chromium files. Exact argv and source/result hashes are recorded in evidence/verification.json.
    Result: pass.
    Evidence: 13888cases/492files including40fresh; actual whole eight modules100% lines1122,statements1244,functions337,branches744, complete current source maps and nonnegative counters. Chromium23cases/10files, no skips/retries/flakes/failures. Both reference symlinks absent throughout runtime/static and restored afterwards. Initial single ownership defect repaired without weakening its existing expected error; earlier maps superseded, not reused.
    Command: restored registry-build/source-tree/source-provenance/registry-check/resource-generation/invariants/parity/routing/doctor.
    Result: pass, nine declared checks.
    Evidence: sixteen existing canonical records preserve historical status/default/classification/evidence except the truthful deleted-factory current owner/evidence mapping; two required native mutation operation records added. Original804testfiles:802byte-identical,two exact native fixture/payload migrations, cases/input matrices and other expected arguments preserved. Parent Findings and old suspected-issue prose retained. WRITER-004 preserves original table first-only multi-reset.
    Scope: approved native range/history correction and mandatory inventory traceability. Existing broad native hierarchy/lifetime/list-units/guard/layout/Repeat gaps remain explicit. Full run not due: correction2/10 after accepted BZ14P4. Goal active under human resume; pause after next full run and necessary repairs.
    Review: exact semantic SHA to be recorded through CLI and evaluated by the same agent, explicitly non-independent.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-10T18:08:18.977Z — VERIFY — ok

    By: CODER

    Note: Current native range/history correction passes13888related cases/492files including40fresh, actual whole eight modules100% allfour with current hashes and nonnegative counters;23Chromium/10files; upstream-absent static gates and restored nine metadata audits pass. Original804tests and historical canonical statuses/defaults preserved with explicit bounded migrations. Evidence: evidence/verification.json; semantic b6fbc1920747ea4d6eae28e727263b0067015eb5.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T18:08:18.496Z, excerpt_hash=sha256:f51815ed3e29a1a87876e83e0c3227af645e6ba5086ee063a0c4dc2035ffb1cf

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610101723-QH6XM1/blueprint/resolved-snapshot.json
    - old_digest: c89e5e9f0fe915787a74c4420f6e4eb2e8baebc1bf76df5a28a15330707177a9
    - current_digest: c89e5e9f0fe915787a74c4420f6e4eb2e8baebc1bf76df5a28a15330707177a9
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610101723-QH6XM1

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610101723-QH6XM1
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only semantic task commits, retain historical evidence and redo scoped checks if rollback is requested. No unrelated checkout/merge/installation changes."
  Findings: |-
    Preflight clean writer, direct mode, standing user goal/resume authorization. Previous7RCNDA turn made verified authoritative progress. SwContentNode currently exposes only generic browser model delta, making native SwRegHistory impossible without native attr-set broadcast. Direct content/history identities are the correction target; independent C++ base hierarchy/native full style registration and full Repeat manager infrastructure remain unverified. No network/subagents; ignored helpers/maps/logs only node_modules cache.

    - Observation: Changed format/lint pass upstream absent; TS7 rejects the native table old-set restore call because the existing frame owner exposes SetFormatAttrSet separately from its single-item method.
      Impact: No runtime profile launched; both references restored in finally. Scope unchanged.
      Resolution: Use the actual native frame set entrypoint, remove unnecessary retained raw cursor state from range history in favor of its presence flag, and run only repaired-file format/lint plus failed/unrun static gates.

    - Observation: Repaired production TS7 passes its tools phase; app typecheck catches fresh fixture authoring against a SwTable as if it were SwTableNode and attempts to mutate borrowed ConstSwNumFormat values.
      Impact: No runtime profile launched. This confirms native ownership boundaries; no casts or mutable const bypass are permitted.
      Resolution: Use actual table.GetTableNode()/GetFrameFormat; clone the borrowed number format, author via its owned rule.Set and retain the post-authoring const identity. Recheck only the two repaired fresh files and failed/unrun static gates.

    - Observation: Final repaired TS7 and dependencies pass; file-size gate rejects wrtsh1.ts at1005authored lines.
      Impact: No runtime profile launched; both references restored and verification thresholds unchanged.
      Resolution: Place the edit-shell transaction body in its original edattr.ts owner and retain a thin native shell delegate, within the existing eight-module scope. Recheck the two affected files format/lint/TS7, failed size and unrun JSDoc/build/static only.

    - Observation: Shell decomposition passes TS7 and file-size; JSDoc rejects the newly extended node delta method because its former no-argument comment does not document two native delta parameters.
      Impact: No runtime profile launched; both references restored. No production logic change is required.
      Resolution: Document borrowed old/new deltas and native-before-model notification order; check the repaired file, failed docs and unrun build/static. Recheck dependency routing because shell decomposition restored its native undo cursor type import.

    - Observation: Initial upstream-absent related profile13882pass/1fail in491files; old foreign-document margin-history acceptance rejects an offset error instead of the preserved ownership error. Actual current full eight-module lines/statements/functions100, branches740/744; four unexecuted source guards are identified at docfmt156,rolbck93/127,unattr328. Browser was not launched.
      Impact: Missing document ownership validation can attempt history rollback before a foreign range failure. This is a genuine production defect within the approved native action, not an assertion to weaken. Both references restored; initial maps are superseded for final evidence.
      Resolution: Retain the original source-bound document identity and validate via existing GetUndoTextNode before rollback/range construction. Add initialized native detached-list record, structural-node, marked core-context and real two-item table reset acceptances; no mocks/counter changes. Recheck changed source/fresh statics then produce new actual whole eight-module current-source maps and dependent tests once. Record the suspicious pinned table multi-reset-first-only source behavior as WRITER-004 and preserve it.
    - Observation: Final runtime13888/492 and40fresh, whole eight modules100%allfour; Chromium23/10 pass. Restored registry-build/source-tree/provenance pass, but exhaustive mutation-helper inventory correctly requires moveLeftMargin and moveLeftMarginAtShell operation records.
      Impact: Two missing canonical operation records in the same authorized inventory update; source/test results remain current and require no replay.
      Resolution: Register both actual native functions under existing CAP-0107 and upstream-mechanism classification, retain all historical records/statuses and retire only the deleted factory current owner/evidence pair. Repeat failed/dependent metadata gates only, preserving passed source audits. Standing human goal and explicit inventory instruction authorize this routine completion.

    - Observation: Registry rebuild rejects prefix-related operation IDs because file ordering with the .json suffix differs from strict ID ordering.
      Impact: The two newly authored records need distinct non-prefix stable IDs; runtime/source results are unchanged.
      Resolution: Name the document operation writer.internal.move-left-margin-core and retain writer.internal.move-left-margin-at-shell, both matching their actual native owner/symbol. Repeat only the failed/dependent metadata route, preserving the prior failed report.
extensions:
  implementation_commit:
    hash: "b6fbc1920747ea4d6eae28e727263b0067015eb5"
    message: "🧩 QH6XM1 code: restore native range margin history"
id_source: "generated"
---
## Summary

Restore native MoveLeftMargin range mutation and owned attribute history for existing body/cell paragraphs. Source fidelity includes typed first/left values, direct/inherited restoration, independent list indentation applicability and redo using current tabs.

## Scope

Eight production modules: apps/office/src/sw/source/core/bastyp/index.ts, apps/office/src/sw/source/core/docnode/node.ts, apps/office/src/sw/source/core/doc/doc.ts, apps/office/src/sw/source/core/doc/docfmt.ts, apps/office/src/sw/source/core/edit/edattr.ts, apps/office/src/sw/source/core/undo/rolbck.ts, apps/office/src/sw/source/core/undo/unattr.ts, apps/office/src/sw/source/uibase/wrtsh/wrtsh1.ts. Sixteen corresponding canonical runtime/provenance records, parent audit Findings, optional source-backed suspected-issue note; exact native constructor/initial-operation fixture migrations in native-format-node-index.test.ts and undobj.test.ts; up to three fresh acceptance files for history/deltas/range/list/current-index behavior. Preserve all old cases/inputs/expected values except explicit native history payload semantics.

No new core/browser serialization adapter or arbitrary native flattening. BroadcastingModify identity is supplied through the current TypeScript linear base of node/content-index registry; the C++ three independent bases are not claimed fully identical and their future physical hierarchy refactor remains explicit. No native style registration, frame/vertical/redline merged-layout or complete rich numbering-unit/transport/pooling/hash/general UNO/Repeat infrastructure parity claim. Existing numbering-format profile stores TWIP first-line indentation only; preserve its represented list unit rather than invent an unsupported format state. Existing edit-shell admission guard remains a separate correction. Registered recovery/open/save/settings UI deviations preserved.
Mandatory inventory closure also includes two canonical operation records in docs/program/registry/writer/operations/: writer.internal.move-left-margin-core.json and writer.internal.move-left-margin-at-shell.json. This completes the user-authorized exhaustive inventory for the two new exported mutation helpers; no production/behavior/verification expansion.

## Plan

Restore native range margin/history in eight production modules, sixteen runtime/provenance records and two mandatory canonical exported-mutation operation records; exact two old migrations and three fresh files; preserve source limitations and deviations. Complete upstream-absent related whole-module100% and browser validation, restored inventory audits and same-agent exact semantic review; second correction since BZ14P4.

## Verify Steps

1. Source-only pinned contracts and hashes with no upstream source/helper copies in AgentPlane. Native history direct/reset discriminants, independent owned measures and percentages, source record order and temporary rollback lifetime; unchanged node/style/cursor/indices.
2. Actual initialized ranges and body/cells: default/empty/custom tabs, modulus/signs, direct/inherited margins, independent list-left/first flags and modes, one range history action, zero/full initial history payload, undo through replacement slots and repeated cycles, redo recomputation from current document defaults without new undo recording. Unsupported source profiles explicitly remain unverified.
3. Changed format/lint; whole TS7/type/dependencies/file-size/JSDoc/build/static; then Vitest related actual whole eight modules100% lines/statements/functions/branches with complete current source/maps and nonnegative counters plus fresh tests, and related Chromium. Both references absent throughout runtime/static, restore in finally; no with/without double run and no passing replay for helper/metadata repair.
4. Restored registry-build/source-tree/provenance/registry/resource-generation/invariants/parity/doctor/routing. Historical status/default/classification/evidence prefixes and old test case/input/expectation contracts preserved modulo declared source representation/initial-operation/payload changes. No source/classification promotion to hide gaps.
5. Exact semantic commit binds current-source hashes; explicit same-agent non-independent evaluator, verification and finish via CLI; clean branch writer and references restored. No full run due this second correction since BZ14P4.

## Verification

Command: upstream-absent changed format/lint, whole TS7/type/dependencies/file-size/JSDoc/build/static; npm exec vitest related with eight explicit whole-module coverage includes; ten related Writer Chromium files. Exact argv and source/result hashes are recorded in evidence/verification.json.
Result: pass.
Evidence: 13888cases/492files including40fresh; actual whole eight modules100% lines1122,statements1244,functions337,branches744, complete current source maps and nonnegative counters. Chromium23cases/10files, no skips/retries/flakes/failures. Both reference symlinks absent throughout runtime/static and restored afterwards. Initial single ownership defect repaired without weakening its existing expected error; earlier maps superseded, not reused.
Command: restored registry-build/source-tree/source-provenance/registry-check/resource-generation/invariants/parity/routing/doctor.
Result: pass, nine declared checks.
Evidence: sixteen existing canonical records preserve historical status/default/classification/evidence except the truthful deleted-factory current owner/evidence mapping; two required native mutation operation records added. Original804testfiles:802byte-identical,two exact native fixture/payload migrations, cases/input matrices and other expected arguments preserved. Parent Findings and old suspected-issue prose retained. WRITER-004 preserves original table first-only multi-reset.
Scope: approved native range/history correction and mandatory inventory traceability. Existing broad native hierarchy/lifetime/list-units/guard/layout/Repeat gaps remain explicit. Full run not due: correction2/10 after accepted BZ14P4. Goal active under human resume; pause after next full run and necessary repairs.
Review: exact semantic SHA to be recorded through CLI and evaluated by the same agent, explicitly non-independent.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-10T18:08:18.977Z — VERIFY — ok

By: CODER

Note: Current native range/history correction passes13888related cases/492files including40fresh, actual whole eight modules100% allfour with current hashes and nonnegative counters;23Chromium/10files; upstream-absent static gates and restored nine metadata audits pass. Original804tests and historical canonical statuses/defaults preserved with explicit bounded migrations. Evidence: evidence/verification.json; semantic b6fbc1920747ea4d6eae28e727263b0067015eb5.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-10T18:08:18.496Z, excerpt_hash=sha256:f51815ed3e29a1a87876e83e0c3227af645e6ba5086ee063a0c4dc2035ffb1cf

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610101723-QH6XM1/blueprint/resolved-snapshot.json
- old_digest: c89e5e9f0fe915787a74c4420f6e4eb2e8baebc1bf76df5a28a15330707177a9
- current_digest: c89e5e9f0fe915787a74c4420f6e4eb2e8baebc1bf76df5a28a15330707177a9
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610101723-QH6XM1

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610101723-QH6XM1
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only semantic task commits, retain historical evidence and redo scoped checks if rollback is requested. No unrelated checkout/merge/installation changes.

## Findings

Preflight clean writer, direct mode, standing user goal/resume authorization. Previous7RCNDA turn made verified authoritative progress. SwContentNode currently exposes only generic browser model delta, making native SwRegHistory impossible without native attr-set broadcast. Direct content/history identities are the correction target; independent C++ base hierarchy/native full style registration and full Repeat manager infrastructure remain unverified. No network/subagents; ignored helpers/maps/logs only node_modules cache.

- Observation: Changed format/lint pass upstream absent; TS7 rejects the native table old-set restore call because the existing frame owner exposes SetFormatAttrSet separately from its single-item method.
  Impact: No runtime profile launched; both references restored in finally. Scope unchanged.
  Resolution: Use the actual native frame set entrypoint, remove unnecessary retained raw cursor state from range history in favor of its presence flag, and run only repaired-file format/lint plus failed/unrun static gates.

- Observation: Repaired production TS7 passes its tools phase; app typecheck catches fresh fixture authoring against a SwTable as if it were SwTableNode and attempts to mutate borrowed ConstSwNumFormat values.
  Impact: No runtime profile launched. This confirms native ownership boundaries; no casts or mutable const bypass are permitted.
  Resolution: Use actual table.GetTableNode()/GetFrameFormat; clone the borrowed number format, author via its owned rule.Set and retain the post-authoring const identity. Recheck only the two repaired fresh files and failed/unrun static gates.

- Observation: Final repaired TS7 and dependencies pass; file-size gate rejects wrtsh1.ts at1005authored lines.
  Impact: No runtime profile launched; both references restored and verification thresholds unchanged.
  Resolution: Place the edit-shell transaction body in its original edattr.ts owner and retain a thin native shell delegate, within the existing eight-module scope. Recheck the two affected files format/lint/TS7, failed size and unrun JSDoc/build/static only.

- Observation: Shell decomposition passes TS7 and file-size; JSDoc rejects the newly extended node delta method because its former no-argument comment does not document two native delta parameters.
  Impact: No runtime profile launched; both references restored. No production logic change is required.
  Resolution: Document borrowed old/new deltas and native-before-model notification order; check the repaired file, failed docs and unrun build/static. Recheck dependency routing because shell decomposition restored its native undo cursor type import.

- Observation: Initial upstream-absent related profile13882pass/1fail in491files; old foreign-document margin-history acceptance rejects an offset error instead of the preserved ownership error. Actual current full eight-module lines/statements/functions100, branches740/744; four unexecuted source guards are identified at docfmt156,rolbck93/127,unattr328. Browser was not launched.
  Impact: Missing document ownership validation can attempt history rollback before a foreign range failure. This is a genuine production defect within the approved native action, not an assertion to weaken. Both references restored; initial maps are superseded for final evidence.
  Resolution: Retain the original source-bound document identity and validate via existing GetUndoTextNode before rollback/range construction. Add initialized native detached-list record, structural-node, marked core-context and real two-item table reset acceptances; no mocks/counter changes. Recheck changed source/fresh statics then produce new actual whole eight-module current-source maps and dependent tests once. Record the suspicious pinned table multi-reset-first-only source behavior as WRITER-004 and preserve it.
- Observation: Final runtime13888/492 and40fresh, whole eight modules100%allfour; Chromium23/10 pass. Restored registry-build/source-tree/provenance pass, but exhaustive mutation-helper inventory correctly requires moveLeftMargin and moveLeftMarginAtShell operation records.
  Impact: Two missing canonical operation records in the same authorized inventory update; source/test results remain current and require no replay.
  Resolution: Register both actual native functions under existing CAP-0107 and upstream-mechanism classification, retain all historical records/statuses and retire only the deleted factory current owner/evidence pair. Repeat failed/dependent metadata gates only, preserving passed source audits. Standing human goal and explicit inventory instruction authorize this routine completion.

- Observation: Registry rebuild rejects prefix-related operation IDs because file ordering with the .json suffix differs from strict ID ordering.
  Impact: The two newly authored records need distinct non-prefix stable IDs; runtime/source results are unchanged.
  Resolution: Name the document operation writer.internal.move-left-margin-core and retain writer.internal.move-left-margin-at-shell, both matching their actual native owner/symbol. Repeat only the failed/dependent metadata route, preserving the prior failed report.
