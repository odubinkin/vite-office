---
id: "202610010418-7548FA"
title: "Retain native list trees across item mutations"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 20
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T04:31:11.198Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-01T04:44:22.547Z"
  updated_by: "CODER"
  note: "Verified: retained native shown list topology,prefix reads and incremental removal/levels;37 native definitions,864 sequences/73056states;full verify59167 terminal0,663+109tests,19browser,all coverage100%,unchanged gates;parent and goal active."
  attempts: 0
quality_review:
  state: "pass"
  updated_at: "2026-10-01T04:46:02.868Z"
  updated_by: "EVALUATOR"
  note: "Pass bounded retained shown list topology and native prefix reads at 77fda1c876bba94fa18514fa0b2dce43e1d38493; no whole-module/default/goal promotion."
  evaluated_sha: "77fda1c876bba94fa18514fa0b2dce43e1d38493"
  blueprint_digest: "0c3c87f9125c0fdc149043d12cee89d0bf500cb25da76ef1314818d54ef9632d"
  evidence_refs:
    - ".agentplane/tasks/202610010418-7548FA/README.md"
    - ".agentplane/tasks/202610010418-7548FA/quality/20261001-044602868-recovery-context/quality-report.json"
    - ".agentplane/tasks/202610010418-7548FA/quality/20261001-044602868-recovery-context/evaluator-prompt.md"
    - ".agentplane/tasks/202610010418-7548FA/quality/20261001-044602868-recovery-context/evaluator-opinion.md"
    - ".agentplane/tasks/202610010418-7548FA/blueprint/resolved-snapshot.json"
    - "77fda1c876bba94fa18514fa0b2dce43e1d38493"
    - ".agentplane/tasks/202610010418-7548FA/native-results.json"
    - ".agentplane/tasks/202610010418-7548FA/native-oracle.py"
    - ".agentplane/tasks/202610010418-7548FA/verify.log"
    - "apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-lifecycle.test.ts"
  findings:
    - "Reviewed actual13-file implementation and approved constructor cleanup. SwList retains its default-rule root;registered records attach at insertion,level/move transitions preserve identities,source-shaped removal relocates descendants and clears phantoms;obsolete ResetTree/order/level-cache contracts removed."
    - "37 complete native definitions remain unchanged in compiled probe;864sequences/73056states match actual document/list/tree for normal insertion invalidation,reverse immediate reads,mixed counted/restarts,phantom depths and complete removal/reinsert. Source-derived literal tests cover identity,move/delete,independent copied trees,validated uncounted-parent insertion and empty phantom removal. Earlier disabled-invalidation adapter failure is corrected and disclosed."
    - "Full verify59167 terminal0:663 app+109inventory tests,19browser,all metrics100% in both coverage suites,all unchanged gates. Earlier661test coverage failure preserved,source-focused27tests reaches100% before final verify;no threshold/config/status changes. Doctor0errors/two prior warnings,routing/diff clean;clean checkout after actual code commit."
commit: null
comments:
  -
    author: "CODER"
    body: "Start: approved iterative parity goal;retain source-shaped supported list roots and item transitions,prefix validation;preserve IO exceptions and all gates."
events:
  -
    type: "status"
    at: "2026-10-01T04:19:59.297Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: approved iterative parity goal;retain source-shaped supported list roots and item transitions,prefix validation;preserve IO exceptions and all gates."
  -
    type: "verify"
    at: "2026-10-01T04:44:22.547Z"
    author: "CODER"
    state: "ok"
    note: "Verified: retained native shown list topology,prefix reads and incremental removal/levels;37 native definitions,864 sequences/73056states;full verify59167 terminal0,663+109tests,19browser,all coverage100%,unchanged gates;parent and goal active."
doc_version: 3
doc_updated_at: "2026-10-01T04:44:22.629Z"
doc_updated_by: "CODER"
description: "Iteration35 of approved parity goal: replace deferred SwList reconstruction with retained single supported range roots,source-shaped insertion/removal/level transitions and validating counter reads. Preserve registered document IO deviations and all verification gates."
sections:
  Summary: "Iteration35 of the user-authorized persistent parity goal. Retain SwList roots and registered SwNodeNum objects across supported body-range item transitions; remove deferred topology reconstruction and make counter reads validate native prefixes."
  Scope: "Runtime: sw/source/core/doc/list.ts,DocumentListsManager.ts,SwNumberTree/SwNumberTree.ts,SwNumberTree/SwNodeNum.ts,docnode/nodes.ts,txtnode/ndtxt.ts. Tests:list.test.ts,list-invariants.test.ts,number.test.ts,SwNumberTree.test.ts,SwNumberTree-phantoms.test.ts and new SwNumberTree-lifecycle.test.ts. Bounded provenance/runtime-inventory updates and task-local baseline/native probes. Remove source-stale insertion-level cache/constructor parameter at the same retained-object transition boundary. Existing single body-range hierarchical Arabic/bullet slice; no redline/additional-range/continuous numbering or full native notification/lifetime claim. Preserve registered save/open/recovery deviations,Worker16,ODF1.3 and gates. No status/default/module/whole-goal promotion."
  Plan: "1. Record pre-edit direct-read/topology/identity failure. 2. Compile unmodified pinned list/tree transition bodies. 3. Port retained root/incremental registration/removal/level changes,prefix validation and canonical move registration;remove unused ordering and insertion-level cache/constructor contracts including SwNodeNum call sites. 4. Verify source-derived lifecycle/document evidence and bounded provenance. 5. Run focused checks then full unchanged verify,record quality and real code hash,finish only child and update parent. Owner CODER;single correction;safe constructor refactor included under user persistent goal authorization;IO exceptions preserved."
  Verify Steps: "Run actual pre-edit baseline for unattached registered records,empty direct vectors and replaced root/item identities. Compile unchanged pinned AddChild,RemoveChild,RemoveMe,MoveChildren,SetLevelInListTree,GetNumber,GetNumberVector_,IsValid,Validate,ValidateHierarchical,SetLastValid/InvalidateTree and SwList insertion/removal/validation ownership methods with explicit bounded range/text/rule/container/notification adapters. Compare actual document/list/tree objects across shuffled insertion,skipped phantom levels,removal/reinsert,level changes,zero/nonzero starts,restart/count changes and immediate reads;capture literal topology,object identity,counters/vectors/labels. Cover canonical document move/remove/copy/undo and existing genuine ODT/Worker tests. Focused tests,lint,typecheck,docs,provenance/parity before unchanged npm run verify;both coverage suites100%,all browser/resource/static/source/provenance/invariant gates. Doctor,routing,diff,evaluator,actual code SHA and final clean status required. No skipped/relaxed gates or broad metadata promotion."
  Verification: |-
    Command: task-local pre-edit baseline.ts;python3 native-oracle.py;npx tsx compare-native.ts.
    Result: pass after documented normal insertion-invalidation adapter repair.
    Evidence: old actual list records were unattached,direct vector[],counter0;level change replaced both item/root.37 full pinned native definitions remain byte-identical in compiled C++;864 sequences/73056 states match actual document/list/tree for shuffled insertion,mixed counted/restart,zero/nonzero starts,phantom levels,removal/reinsert,level changes and reverse immediate reads. Native single shown range/std::set/text/rule/platform/normal insertion invalidation/debug adapters;callbacks/reading suppression,full range constructor/redline/continuous/full native lifetime not claimed.
    Scope: retained shown body-range hierarchical roots,incremental topology and native prefix validation;no whole-module/default/goal promotion.

    Command: focused Vitest suites;source-focused coverage;typecheck;lint;check:docs;check:source-provenance;inventory:parity.
    Result: pass after documented command,stale assertion,constructor/lint and coverage repairs.
    Evidence:43 focused tests/9files terminal80051 before final two literal contracts;27tests/6files terminal58221 source coverage100% statements182,branches156,functions30,lines152;native recompare/lint62542 terminal0;typecheck7031 terminal0;docs454 and provenance204/128 pass;parity44130 terminal0/semanticViolationCount0. Actual object/root identities,literal vectors/counters,canonical move/delete and independent copied trees tested;existing undo/genuine ODT/Worker tests retained. Full verify validates final source after constructor/ResetTree removal and empty-phantom/uncounted-parent tests.

    Command: npm run verify > .agentplane/tasks/202610010418-7548FA/verify.log 2>&1.
    Result: pass;session59167 terminal exit0.
    Evidence:663 app tests/147files,109 inventory tests/36files,19browser(23.0s). App100% statements10127,branches7655,functions2772,lines9306;inventory100% statements1523,branches1080,functions384,lines1464. Unchanged format/lint/types/dependencies/resources/static/docs454/file-size/source-tree111required/33retired/provenance204(128mapped)/invariants34/parity semanticViolationCount0 gates pass. Earlier full coverage18059 failed only new branch coverage (661 tests passed);failure preserved and fixed without gate weakening. No skips/schema/config/status promotions.

    Command: ap doctor;node .agentplane/policy/check-routing.mjs;git diff --check.
    Result: pass after stripping terminal trailing whitespace from task log artifacts only.
    Evidence:doctor0errors/two old warnings(managed shim readiness,oldDONE F1JT8K close hash);routingOK;source diff clean. Real implementation SHA,quality and final clean checkout recorded on closure.
    Residual obligations:SwTextNode GetNum/GetNumberVector/AddToList/RemoveFromList ownership and lazy entry points;complete native callback/reading suppression,range/redline/continuous trees,phantom configuration,default factories/legacy/MSO/stable-env metadata,full native lifetimes,signed/orphan restart and prior mobile resize/menu instability. Parent and full goal remain active.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-01T04:44:22.547Z — VERIFY — ok

    By: CODER

    Note: Verified: retained native shown list topology,prefix reads and incremental removal/levels;37 native definitions,864 sequences/73056states;full verify59167 terminal0,663+109tests,19browser,all coverage100%,unchanged gates;parent and goal active.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T04:44:21.981Z, excerpt_hash=sha256:da8b27856f4c164fd4ea39f0b495274927a69185cecc109bef7f4eb7475786c4

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010418-7548FA/blueprint/resolved-snapshot.json
    - old_digest: 0c3c87f9125c0fdc149043d12cee89d0bf500cb25da76ef1314818d54ef9632d
    - current_digest: 0c3c87f9125c0fdc149043d12cee89d0bf500cb25da76ef1314818d54ef9632d
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610010418-7548FA

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane commit 202610010418-7548FA -m 🧩 7548FA task: persist canonical task artifacts --allow-tasks
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: true
    - repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the task implementation commit if this bounded lifecycle change fails; preserve task evidence and previous DONE artifacts. No destructive history actions."
  Findings: |-
    Read-only startup: main/direct,clean checkout,parent C9TN6M only active before childcreation;no user-instructions. Native SwList creates roots at construction,AddChild at insertion and RemoveMe at removal;local SwList currently replaces records and reconstructs topology at validation. Existing native prefix validation and descendant-move algorithms can support this correction without rebuilding. One read-only combined search returned1 because DocumentStateManager has no GetNumRule/SwDoc/GetNodes matches;actual file subsequently read,no mutation or assumption from empty search. Persistent user goal authorizes this safe in-repo correction and local lifecycle;network/outside access remains prohibited.

    - Observation: Pre-edit baseline confirms direct vector empty/number0,unattached registered records and replaced item/root after level change. Initial differential failed case48 because old probe disabled insertion invalidation;source IsNotificationEnabled evidence required normal true mode and full unchanged Invalidate/InvalidateMe. Revised37native definitions compare216sequences/9168states. Initial focused commands used guessed vitest.config and then wrong working directory;no tests executed. Typecheck found newly unused document destructure after removing obsolete ordering argument.
      Impact: Failures were bounded source/probe/command issues in the approved contract,not successful evidence;native disabled notification delivery remains explicit.
      Resolution: Enabled native insertion invalidation,ported native prefix invalidation,recomputed route,located actual vite.config and reran from apps/office. Remove unused destructure when confirmed by typecheck;retain literal tests/gates.

    - Observation: Expanded37-definition native probe passes864sequences/73056states. Focused tests initially exposed old assertions that direct counter should remain0 and cached insertion level changes by object replacement;source validating getter and derived-level contracts now require2/current tree level. Lint rejected non-null assertions and an unused constructor level. Strong fixture-presence helper replaces assertions;approved same-goal scope includes SwNodeNum and phantom constructor call sites;removed stale level cache/constructor and obsolete ResetTree.
      Impact: Retained items expose stale constructor metadata that deferred object replacement had hidden. Existing counter/vector literal assertions remain intact except source-stale direct-read0 expectation;phantom depth assertions now use independent supplied levels.
      Resolution: Removed unused ordering/constructor/rebuild contracts and use source-derived GetLevelInListTree. Focused43tests/9files and typecheck7031 now pass;all required gates remain unchanged. Full callback/redline/continuous/native ownership architecture remains separately unverified.

    - Observation: Coverage18059 terminal1:all661tests/147files pass,lines/functions100%,statements99.97%,branches99.94%;four new tree branch paths remained. No threshold/config change. Native source confirms destination is always present for MoveChildren when nonempty or newly created phantom;the added undefined check was unreachable.
      Impact: Mandatory100% coverage not yet satisfied;passing tests alone cannot close task. Empty phantom removal,foreign-child validation and validated uncounted-parent insertion are actual native contracts needing focused evidence.
      Resolution: Removed only the impossible destination guard using native precondition;added literal tests for empty phantom deletion,foreign-child no-op and first-descendant insertion changing uncounted parent6to7. Rerun source-focused coverage then full unchanged verify;parent/goal active.

    - Observation: Focused source coverage58221 terminal0:27tests/6files,tree100% statements182,branches156,functions30,lines152. Native864/73056 comparison still passes after constructor/ResetTree removal;lint62542 terminal0. Full verify59167 now running unchanged. Follow-up primary evidence:ndtxt.hxx owns mpNodeNum;ndtxt.cxx GetNum/GetNumberVector directly access it,while local SwList still owns text-to-record Map and SwTextNode getters force whole-list validation.
      Impact: This task repairs retained root topology and prefix counter contracts but does not complete native node-owned numbering lifecycle/entry points or notification architecture. No goal/default/module completion can follow from current probes.
      Resolution: Keep those residual responsibilities explicit in provenance and active parent;next single correction should examine SwTextNode GetNum/GetNumberVector and AddToList/RemoveFromList ownership. No next task implementation is started before current verification/closure.
id_source: "generated"
---
## Summary

Iteration35 of the user-authorized persistent parity goal. Retain SwList roots and registered SwNodeNum objects across supported body-range item transitions; remove deferred topology reconstruction and make counter reads validate native prefixes.

## Scope

Runtime: sw/source/core/doc/list.ts,DocumentListsManager.ts,SwNumberTree/SwNumberTree.ts,SwNumberTree/SwNodeNum.ts,docnode/nodes.ts,txtnode/ndtxt.ts. Tests:list.test.ts,list-invariants.test.ts,number.test.ts,SwNumberTree.test.ts,SwNumberTree-phantoms.test.ts and new SwNumberTree-lifecycle.test.ts. Bounded provenance/runtime-inventory updates and task-local baseline/native probes. Remove source-stale insertion-level cache/constructor parameter at the same retained-object transition boundary. Existing single body-range hierarchical Arabic/bullet slice; no redline/additional-range/continuous numbering or full native notification/lifetime claim. Preserve registered save/open/recovery deviations,Worker16,ODF1.3 and gates. No status/default/module/whole-goal promotion.

## Plan

1. Record pre-edit direct-read/topology/identity failure. 2. Compile unmodified pinned list/tree transition bodies. 3. Port retained root/incremental registration/removal/level changes,prefix validation and canonical move registration;remove unused ordering and insertion-level cache/constructor contracts including SwNodeNum call sites. 4. Verify source-derived lifecycle/document evidence and bounded provenance. 5. Run focused checks then full unchanged verify,record quality and real code hash,finish only child and update parent. Owner CODER;single correction;safe constructor refactor included under user persistent goal authorization;IO exceptions preserved.

## Verify Steps

Run actual pre-edit baseline for unattached registered records,empty direct vectors and replaced root/item identities. Compile unchanged pinned AddChild,RemoveChild,RemoveMe,MoveChildren,SetLevelInListTree,GetNumber,GetNumberVector_,IsValid,Validate,ValidateHierarchical,SetLastValid/InvalidateTree and SwList insertion/removal/validation ownership methods with explicit bounded range/text/rule/container/notification adapters. Compare actual document/list/tree objects across shuffled insertion,skipped phantom levels,removal/reinsert,level changes,zero/nonzero starts,restart/count changes and immediate reads;capture literal topology,object identity,counters/vectors/labels. Cover canonical document move/remove/copy/undo and existing genuine ODT/Worker tests. Focused tests,lint,typecheck,docs,provenance/parity before unchanged npm run verify;both coverage suites100%,all browser/resource/static/source/provenance/invariant gates. Doctor,routing,diff,evaluator,actual code SHA and final clean status required. No skipped/relaxed gates or broad metadata promotion.

## Verification

Command: task-local pre-edit baseline.ts;python3 native-oracle.py;npx tsx compare-native.ts.
Result: pass after documented normal insertion-invalidation adapter repair.
Evidence: old actual list records were unattached,direct vector[],counter0;level change replaced both item/root.37 full pinned native definitions remain byte-identical in compiled C++;864 sequences/73056 states match actual document/list/tree for shuffled insertion,mixed counted/restart,zero/nonzero starts,phantom levels,removal/reinsert,level changes and reverse immediate reads. Native single shown range/std::set/text/rule/platform/normal insertion invalidation/debug adapters;callbacks/reading suppression,full range constructor/redline/continuous/full native lifetime not claimed.
Scope: retained shown body-range hierarchical roots,incremental topology and native prefix validation;no whole-module/default/goal promotion.

Command: focused Vitest suites;source-focused coverage;typecheck;lint;check:docs;check:source-provenance;inventory:parity.
Result: pass after documented command,stale assertion,constructor/lint and coverage repairs.
Evidence:43 focused tests/9files terminal80051 before final two literal contracts;27tests/6files terminal58221 source coverage100% statements182,branches156,functions30,lines152;native recompare/lint62542 terminal0;typecheck7031 terminal0;docs454 and provenance204/128 pass;parity44130 terminal0/semanticViolationCount0. Actual object/root identities,literal vectors/counters,canonical move/delete and independent copied trees tested;existing undo/genuine ODT/Worker tests retained. Full verify validates final source after constructor/ResetTree removal and empty-phantom/uncounted-parent tests.

Command: npm run verify > .agentplane/tasks/202610010418-7548FA/verify.log 2>&1.
Result: pass;session59167 terminal exit0.
Evidence:663 app tests/147files,109 inventory tests/36files,19browser(23.0s). App100% statements10127,branches7655,functions2772,lines9306;inventory100% statements1523,branches1080,functions384,lines1464. Unchanged format/lint/types/dependencies/resources/static/docs454/file-size/source-tree111required/33retired/provenance204(128mapped)/invariants34/parity semanticViolationCount0 gates pass. Earlier full coverage18059 failed only new branch coverage (661 tests passed);failure preserved and fixed without gate weakening. No skips/schema/config/status promotions.

Command: ap doctor;node .agentplane/policy/check-routing.mjs;git diff --check.
Result: pass after stripping terminal trailing whitespace from task log artifacts only.
Evidence:doctor0errors/two old warnings(managed shim readiness,oldDONE F1JT8K close hash);routingOK;source diff clean. Real implementation SHA,quality and final clean checkout recorded on closure.
Residual obligations:SwTextNode GetNum/GetNumberVector/AddToList/RemoveFromList ownership and lazy entry points;complete native callback/reading suppression,range/redline/continuous trees,phantom configuration,default factories/legacy/MSO/stable-env metadata,full native lifetimes,signed/orphan restart and prior mobile resize/menu instability. Parent and full goal remain active.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-01T04:44:22.547Z — VERIFY — ok

By: CODER

Note: Verified: retained native shown list topology,prefix reads and incremental removal/levels;37 native definitions,864 sequences/73056states;full verify59167 terminal0,663+109tests,19browser,all coverage100%,unchanged gates;parent and goal active.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T04:44:21.981Z, excerpt_hash=sha256:da8b27856f4c164fd4ea39f0b495274927a69185cecc109bef7f4eb7475786c4

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010418-7548FA/blueprint/resolved-snapshot.json
- old_digest: 0c3c87f9125c0fdc149043d12cee89d0bf500cb25da76ef1314818d54ef9632d
- current_digest: 0c3c87f9125c0fdc149043d12cee89d0bf500cb25da76ef1314818d54ef9632d
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610010418-7548FA

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane commit 202610010418-7548FA -m 🧩 7548FA task: persist canonical task artifacts --allow-tasks
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: true
- repeat_stop_condition: after any non-zero exit or completed mutation, recompute task next-action before a second step
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the task implementation commit if this bounded lifecycle change fails; preserve task evidence and previous DONE artifacts. No destructive history actions.

## Findings

Read-only startup: main/direct,clean checkout,parent C9TN6M only active before childcreation;no user-instructions. Native SwList creates roots at construction,AddChild at insertion and RemoveMe at removal;local SwList currently replaces records and reconstructs topology at validation. Existing native prefix validation and descendant-move algorithms can support this correction without rebuilding. One read-only combined search returned1 because DocumentStateManager has no GetNumRule/SwDoc/GetNodes matches;actual file subsequently read,no mutation or assumption from empty search. Persistent user goal authorizes this safe in-repo correction and local lifecycle;network/outside access remains prohibited.

- Observation: Pre-edit baseline confirms direct vector empty/number0,unattached registered records and replaced item/root after level change. Initial differential failed case48 because old probe disabled insertion invalidation;source IsNotificationEnabled evidence required normal true mode and full unchanged Invalidate/InvalidateMe. Revised37native definitions compare216sequences/9168states. Initial focused commands used guessed vitest.config and then wrong working directory;no tests executed. Typecheck found newly unused document destructure after removing obsolete ordering argument.
  Impact: Failures were bounded source/probe/command issues in the approved contract,not successful evidence;native disabled notification delivery remains explicit.
  Resolution: Enabled native insertion invalidation,ported native prefix invalidation,recomputed route,located actual vite.config and reran from apps/office. Remove unused destructure when confirmed by typecheck;retain literal tests/gates.

- Observation: Expanded37-definition native probe passes864sequences/73056states. Focused tests initially exposed old assertions that direct counter should remain0 and cached insertion level changes by object replacement;source validating getter and derived-level contracts now require2/current tree level. Lint rejected non-null assertions and an unused constructor level. Strong fixture-presence helper replaces assertions;approved same-goal scope includes SwNodeNum and phantom constructor call sites;removed stale level cache/constructor and obsolete ResetTree.
  Impact: Retained items expose stale constructor metadata that deferred object replacement had hidden. Existing counter/vector literal assertions remain intact except source-stale direct-read0 expectation;phantom depth assertions now use independent supplied levels.
  Resolution: Removed unused ordering/constructor/rebuild contracts and use source-derived GetLevelInListTree. Focused43tests/9files and typecheck7031 now pass;all required gates remain unchanged. Full callback/redline/continuous/native ownership architecture remains separately unverified.

- Observation: Coverage18059 terminal1:all661tests/147files pass,lines/functions100%,statements99.97%,branches99.94%;four new tree branch paths remained. No threshold/config change. Native source confirms destination is always present for MoveChildren when nonempty or newly created phantom;the added undefined check was unreachable.
  Impact: Mandatory100% coverage not yet satisfied;passing tests alone cannot close task. Empty phantom removal,foreign-child validation and validated uncounted-parent insertion are actual native contracts needing focused evidence.
  Resolution: Removed only the impossible destination guard using native precondition;added literal tests for empty phantom deletion,foreign-child no-op and first-descendant insertion changing uncounted parent6to7. Rerun source-focused coverage then full unchanged verify;parent/goal active.

- Observation: Focused source coverage58221 terminal0:27tests/6files,tree100% statements182,branches156,functions30,lines152. Native864/73056 comparison still passes after constructor/ResetTree removal;lint62542 terminal0. Full verify59167 now running unchanged. Follow-up primary evidence:ndtxt.hxx owns mpNodeNum;ndtxt.cxx GetNum/GetNumberVector directly access it,while local SwList still owns text-to-record Map and SwTextNode getters force whole-list validation.
  Impact: This task repairs retained root topology and prefix counter contracts but does not complete native node-owned numbering lifecycle/entry points or notification architecture. No goal/default/module completion can follow from current probes.
  Resolution: Keep those residual responsibilities explicit in provenance and active parent;next single correction should examine SwTextNode GetNum/GetNumberVector and AddToList/RemoveFromList ownership. No next task implementation is started before current verification/closure.
