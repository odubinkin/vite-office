---
id: "202610090950-7JN228"
title: "Use the native edit-window layout owner directly in browser rendering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 9
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-09T09:51:04.176Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-09T10:03:11.417Z"
  updated_by: "CODER"
  note: "202 unique related passes,5 fresh,0 passing replay; actual native owner shared by renderer/cursor, direct editor owner change and current document replacement; changed/app all-four100 source-bound; static upstream-absent and all inventory gates pass,4 canonical history prefixes preserved. Next full257 then verified failures and goal pause."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-09T10:03:55.418Z"
  updated_by: "EVALUATOR"
  note: "Explicitly non-independent same-agent evaluation: production React testLayout and duplicate layout prop removed; actual renderer borrows original native edit-window view-shell root.202 unique related passes,5 fresh,0 passing replay; changed/app all-four100 source-bound and static/inventory gates pass."
  evaluated_sha: "6979a9454604bfe37fc9e7f49c792949144c83d4"
  blueprint_digest: "d6cb6f9aa5da1b9b7daaf77355c77bb2ce777e744629de30b48df524a2ee1752"
  evidence_refs:
    - ".agentplane/tasks/202610090950-7JN228/README.md"
    - ".agentplane/tasks/202610090950-7JN228/quality/20261009-100355418-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610090950-7JN228/quality/20261009-100355418-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610090950-7JN228/quality/20261009-100355418-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610090950-7JN228/blueprint/resolved-snapshot.json"
    - ".agentplane/tasks/202610090950-7JN228/evidence/coverage.json"
    - ".agentplane/tasks/202610090950-7JN228/evidence/checks.json"
  findings:
    - "Original root identity retained across actual rerender/remount, direct editor edit-window change and shell document replacement; no rendering mutation of document/history. Four canonical records preserve full historical prefixes/status/default/classification;509 old tests byte-identical,2 explicit native-owner fixture migrations preserve66 assertions. Protected I/O/recovery/settings runtime remains unchanged. Whole root/page/body/follows/format lifetime parity is not promoted."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: Remove the React-owned fallback layout and use the original edit-window view-shell root; preserve all old rendering assertions, native lifecycle and registered deviations."
events:
  -
    type: "status"
    at: "2026-10-09T09:51:04.988Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: Remove the React-owned fallback layout and use the original edit-window view-shell root; preserve all old rendering assertions, native lifecycle and registered deviations."
  -
    type: "verify"
    at: "2026-10-09T10:03:11.417Z"
    author: "CODER"
    state: "ok"
    note: "202 unique related passes,5 fresh,0 passing replay; actual native owner shared by renderer/cursor, direct editor owner change and current document replacement; changed/app all-four100 source-bound; static upstream-absent and all inventory gates pass,4 canonical history prefixes preserved. Next full257 then verified failures and goal pause."
doc_version: 3
doc_updated_at: "2026-10-09T10:03:11.477Z"
doc_updated_by: "CODER"
description: "Iteration253 under C9TN6M: remove the production React testLayout root and separate layout prop; resolve the existing shared native layout through actual SwEditWin view/editing shell. Preserve rendering, document lifecycle and registered I/O/recovery/settings deviations."
sections:
  Summary: "Remove the extra React-owned layout root and borrow the existing original native edit-window view-shell layout for all browser formatting."
  Scope: "Writer only: browser/editor/WriterPlainTextEditor.tsx and browser/presentation/writer-view.tsx; new browser/editor/native-editor-layout-owner.test.tsx; fixture migrations browser/editor/WriterPlainTextEditor.empty.test.tsx and browser/presentation/WriterPageLayout.test.tsx. Four canonical runtime/provenance records for both runtime modules, bounded leaf evidence and append-only parent C9TN6M Findings. No setup/dependencies/network/upstream snapshot or protected settings/I/O/recovery changes."
  Plan: "Resolve browser formatting exclusively through props.editWindow.GetView().GetWrtShell().GetLayout(). Remove the production testLayout root and duplicate layout prop/writer-view wiring. Migrate only detached empty/page-layout fixtures to explicit native view ownership while preserving every existing assertion. Add real mounted session tests for common renderer/cursor root identity, rerender/remount/device inputs and document replacement. Preserve existing SwRootFrame core geometry algorithm and registered I/O/recovery/settings exceptions. Update four existing canonical runtime/provenance records with narrow evidence and preserve historical field/status/default/classification/evidence prefixes. Targeted new/related tests upstream-absent with reportOnFailure, current-source all-four100 using252 whole unchanged maps or complete declarations/bodies/enclosing branches/all locations; no passing replay except materially changed scenarios. Static/registry/provenance/tree/routing/doctor checks, bounded count/hash evidence outside raw cache, non-independent same-agent evaluator, scoped semantic commit/finish and exact parent Findings append. No full253; last247,next257, then fix discovered failures and pause the goal."
  Verify Steps: "1. Compare pinned edtwin.cxx native rSh.GetLayout calls and vnew.cxx shared view-shell root ownership with existing GetView/GetWrtShell/GetLayout interfaces. Assert actual mounted renderer and native cursor shell use identical original root, retained root across rerender/remount, current-document formatting after replacement and unchanged shell/history state from rendering. All old fixture geometry/rendering assertions preserved. 2. New and related UI/layout/cursor/session tests physically upstream-absent once with reportOnFailure; closures failed/new/unexecuted only. Require changed/app all-four100 source-bound evidence; prior252 transfer only entire source/maps equal or complete unchanged declaration/body/enclosing branches/all locations. 3. Scoped Prettier/ESLint/type/dependencies/docs/size/static build upstream-absent finally restore exact clean pin; canonical history prefix proof; registry4views/Writer/global/provenance/tree/routing/doctor. 4. Bounded English counts/hashes, non-independent same-agent evaluation, scoped semantic commit/finish, clean Writer branch. No full253; next full257, fix failures then pause. Native root frame-format/page/body/follows and overall parity remain unverified."
  Verification: |-
    Command: upstream-absent targeted Vitest profiles with reportOnFailure, initial21files plus failed-only and genuinely new/unexecuted related closures; exact source-bound certificate; scoped Prettier/ESLint and npm run typecheck/check:dependencies/check:docs/check:file-size/test:static; inventory:registry:build/inventory:parity:writer/inventory:registry:check/check:source-provenance/check:source-tree; routing; doctor. Result:202 unique app cases including5 fresh actual native editor owner cases PASS,0 unresolved0 passing replay. Initial155pass1 fresh Workbench viewStore fixture failure retained; direct editor owner fixture fixes only that failed case, preserving literal texts/root identity. Current-source changed2/app318 all-four100 uses actual counters and316 whole unchanged modules plus122 complete unchanged declarations/bodies/enclosing conditions/all exact mapped locations from252. Initial raw coverage threshold exits remain retained; no counter sanitization or changed outer body transfer. Evidence: bounded evidence/coverage.json and checks.json; helpers/maps/raw data ignored outside AgentPlane. Scope: production testLayout and duplicate layout prop removed; rendering borrows original SwEditWin.GetView().GetWrtShell().GetLayout. Four canonical records preserve historical fields/status/default/classification/evidence prefixes.509 prior tests byte-identical;2 detached fixture migrations preserve all66 original assertions and close actual native owners after UI teardown. Static and tests physically upstream-absent, restored clean exact pin. Registry4views, provenance321 (230mapped74browser17infra), tree114+33retired,routing pass,doctor0errors2historicalwarnings. Workbench retained initial viewStore on session replacement is recorded separate next functional follow-up. Native root/page/body/follows/format lifetime and overall parity unverified. Same-agent evaluator non-independent. No full253; next full257 then fix discovered failures and pause goal.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-09T10:03:11.417Z — VERIFY — ok

    By: CODER

    Note: 202 unique related passes,5 fresh,0 passing replay; actual native owner shared by renderer/cursor, direct editor owner change and current document replacement; changed/app all-four100 source-bound; static upstream-absent and all inventory gates pass,4 canonical history prefixes preserved. Next full257 then verified failures and goal pause.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T10:02:43.948Z, excerpt_hash=sha256:41147fd73ddb1af3464a3f1006a67f5e3fc8f139399652d428ddd6b20a3f6ec1

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610090950-7JN228/blueprint/resolved-snapshot.json
    - old_digest: d6cb6f9aa5da1b9b7daaf77355c77bb2ce777e744629de30b48df524a2ee1752
    - current_digest: d6cb6f9aa5da1b9b7daaf77355c77bb2ce777e744629de30b48df524a2ee1752
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610090950-7JN228

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610090950-7JN228
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Normal scoped revert only if requested; no reset, merge or upstream/dependency mutation."
  Findings: |-
    Read-only audit found production useState creates an unused second SwRootFrame on every actual editor mount even when the real view root is supplied. Optional layout prop also permits renderer/cursor roots to diverge. Existing SwEditWin.GetView, SwView.GetWrtShell and SwCursorShell.GetLayout already supply the native owner; use that direct path and keep test fixture ownership explicit. Native full root frame-format lifetime/page/body/follows is subsequent work, not claimed by this browser adapter removal.

    - Observation: Initial targeted profile:155 pass,1 fresh view-change test fails because WriterWorkbench retains its initially selected viewStore, while the test changes its session props. Source-bound audit reaches100 for WriterPlainTextEditor but leaves several unexecuted workbench chrome/modal branches; raw V8 threshold exit retained.
      Impact: The root change test must exercise the approved editor edit-window contract directly with original session projections; workbench session-store replacement is a distinct potential follow-up. No existing acceptance test fails and no production runtime remediation is required.
      Resolution: Keep literal first/second text and original receiver identity assertions, mount WriterPlainTextEditor with actual native edit windows and current original session projections for the failed case. Run only that failed fresh case plus genuinely new/unexecuted related chrome/document-key/title scenarios; no155 passing replay. Preserve raw initial report and coverage.
id_source: "generated"
---
## Summary

Remove the extra React-owned layout root and borrow the existing original native edit-window view-shell layout for all browser formatting.

## Scope

Writer only: browser/editor/WriterPlainTextEditor.tsx and browser/presentation/writer-view.tsx; new browser/editor/native-editor-layout-owner.test.tsx; fixture migrations browser/editor/WriterPlainTextEditor.empty.test.tsx and browser/presentation/WriterPageLayout.test.tsx. Four canonical runtime/provenance records for both runtime modules, bounded leaf evidence and append-only parent C9TN6M Findings. No setup/dependencies/network/upstream snapshot or protected settings/I/O/recovery changes.

## Plan

Resolve browser formatting exclusively through props.editWindow.GetView().GetWrtShell().GetLayout(). Remove the production testLayout root and duplicate layout prop/writer-view wiring. Migrate only detached empty/page-layout fixtures to explicit native view ownership while preserving every existing assertion. Add real mounted session tests for common renderer/cursor root identity, rerender/remount/device inputs and document replacement. Preserve existing SwRootFrame core geometry algorithm and registered I/O/recovery/settings exceptions. Update four existing canonical runtime/provenance records with narrow evidence and preserve historical field/status/default/classification/evidence prefixes. Targeted new/related tests upstream-absent with reportOnFailure, current-source all-four100 using252 whole unchanged maps or complete declarations/bodies/enclosing branches/all locations; no passing replay except materially changed scenarios. Static/registry/provenance/tree/routing/doctor checks, bounded count/hash evidence outside raw cache, non-independent same-agent evaluator, scoped semantic commit/finish and exact parent Findings append. No full253; last247,next257, then fix discovered failures and pause the goal.

## Verify Steps

1. Compare pinned edtwin.cxx native rSh.GetLayout calls and vnew.cxx shared view-shell root ownership with existing GetView/GetWrtShell/GetLayout interfaces. Assert actual mounted renderer and native cursor shell use identical original root, retained root across rerender/remount, current-document formatting after replacement and unchanged shell/history state from rendering. All old fixture geometry/rendering assertions preserved. 2. New and related UI/layout/cursor/session tests physically upstream-absent once with reportOnFailure; closures failed/new/unexecuted only. Require changed/app all-four100 source-bound evidence; prior252 transfer only entire source/maps equal or complete unchanged declaration/body/enclosing branches/all locations. 3. Scoped Prettier/ESLint/type/dependencies/docs/size/static build upstream-absent finally restore exact clean pin; canonical history prefix proof; registry4views/Writer/global/provenance/tree/routing/doctor. 4. Bounded English counts/hashes, non-independent same-agent evaluation, scoped semantic commit/finish, clean Writer branch. No full253; next full257, fix failures then pause. Native root frame-format/page/body/follows and overall parity remain unverified.

## Verification

Command: upstream-absent targeted Vitest profiles with reportOnFailure, initial21files plus failed-only and genuinely new/unexecuted related closures; exact source-bound certificate; scoped Prettier/ESLint and npm run typecheck/check:dependencies/check:docs/check:file-size/test:static; inventory:registry:build/inventory:parity:writer/inventory:registry:check/check:source-provenance/check:source-tree; routing; doctor. Result:202 unique app cases including5 fresh actual native editor owner cases PASS,0 unresolved0 passing replay. Initial155pass1 fresh Workbench viewStore fixture failure retained; direct editor owner fixture fixes only that failed case, preserving literal texts/root identity. Current-source changed2/app318 all-four100 uses actual counters and316 whole unchanged modules plus122 complete unchanged declarations/bodies/enclosing conditions/all exact mapped locations from252. Initial raw coverage threshold exits remain retained; no counter sanitization or changed outer body transfer. Evidence: bounded evidence/coverage.json and checks.json; helpers/maps/raw data ignored outside AgentPlane. Scope: production testLayout and duplicate layout prop removed; rendering borrows original SwEditWin.GetView().GetWrtShell().GetLayout. Four canonical records preserve historical fields/status/default/classification/evidence prefixes.509 prior tests byte-identical;2 detached fixture migrations preserve all66 original assertions and close actual native owners after UI teardown. Static and tests physically upstream-absent, restored clean exact pin. Registry4views, provenance321 (230mapped74browser17infra), tree114+33retired,routing pass,doctor0errors2historicalwarnings. Workbench retained initial viewStore on session replacement is recorded separate next functional follow-up. Native root/page/body/follows/format lifetime and overall parity unverified. Same-agent evaluator non-independent. No full253; next full257 then fix discovered failures and pause goal.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-09T10:03:11.417Z — VERIFY — ok

By: CODER

Note: 202 unique related passes,5 fresh,0 passing replay; actual native owner shared by renderer/cursor, direct editor owner change and current document replacement; changed/app all-four100 source-bound; static upstream-absent and all inventory gates pass,4 canonical history prefixes preserved. Next full257 then verified failures and goal pause.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-09T10:02:43.948Z, excerpt_hash=sha256:41147fd73ddb1af3464a3f1006a67f5e3fc8f139399652d428ddd6b20a3f6ec1

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office-writer/.agentplane/tasks/202610090950-7JN228/blueprint/resolved-snapshot.json
- old_digest: d6cb6f9aa5da1b9b7daaf77355c77bb2ce777e744629de30b48df524a2ee1752
- current_digest: d6cb6f9aa5da1b9b7daaf77355c77bb2ce777e744629de30b48df524a2ee1752
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610090950-7JN228

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610090950-7JN228
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Normal scoped revert only if requested; no reset, merge or upstream/dependency mutation.

## Findings

Read-only audit found production useState creates an unused second SwRootFrame on every actual editor mount even when the real view root is supplied. Optional layout prop also permits renderer/cursor roots to diverge. Existing SwEditWin.GetView, SwView.GetWrtShell and SwCursorShell.GetLayout already supply the native owner; use that direct path and keep test fixture ownership explicit. Native full root frame-format lifetime/page/body/follows is subsequent work, not claimed by this browser adapter removal.

- Observation: Initial targeted profile:155 pass,1 fresh view-change test fails because WriterWorkbench retains its initially selected viewStore, while the test changes its session props. Source-bound audit reaches100 for WriterPlainTextEditor but leaves several unexecuted workbench chrome/modal branches; raw V8 threshold exit retained.
  Impact: The root change test must exercise the approved editor edit-window contract directly with original session projections; workbench session-store replacement is a distinct potential follow-up. No existing acceptance test fails and no production runtime remediation is required.
  Resolution: Keep literal first/second text and original receiver identity assertions, mount WriterPlainTextEditor with actual native edit windows and current original session projections for the failed case. Run only that failed fresh case plus genuinely new/unexecuted related chrome/document-key/title scenarios; no155 passing replay. Preserve raw initial report and coverage.
