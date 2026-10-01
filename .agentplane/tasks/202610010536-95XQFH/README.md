---
id: "202610010536-95XQFH"
title: "Restore Writer numbering transitions on paragraph style changes"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 28
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-01T06:30:17.817Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "ok"
  updated_at: "2026-10-01T07:22:00.733Z"
  updated_by: "CODER"
  note: "Final unchanged npm run verify passes682 app/109 inventory/19 browser tests,both100% coverage,all static/source/invariant gates;native16 bodies277 sequences10394 actual states and8 unsigned definitions pass. Bounded collection-numbering/undo/ODT/Worker correction only;explicit residuals and prior unexplained UI timing failures retained in Findings;no waived gates or IO deviations."
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: approved persistent parity goal;restore native numbering transitions on explicit paragraph style switches,pooled outline dependencies and exact affected undo state;preserve IO exceptions and all verification gates."
events:
  -
    type: "status"
    at: "2026-10-01T05:38:20.901Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: approved persistent parity goal;restore native numbering transitions on explicit paragraph style switches,pooled outline dependencies and exact affected undo state;preserve IO exceptions and all verification gates."
  -
    type: "verify"
    at: "2026-10-01T07:22:00.733Z"
    author: "CODER"
    state: "ok"
    note: "Final unchanged npm run verify passes682 app/109 inventory/19 browser tests,both100% coverage,all static/source/invariant gates;native16 bodies277 sequences10394 actual states and8 unsigned definitions pass. Bounded collection-numbering/undo/ODT/Worker correction only;explicit residuals and prior unexplained UI timing failures retained in Findings;no waived gates or IO deviations."
doc_version: 3
doc_updated_at: "2026-10-01T07:22:00.784Z"
doc_updated_by: "CODER"
description: "Iteration37 of approved persistent parity goal:implement native ChgFormatColl/HandleModifyAtTextNodeFormatChange/HandleApplyTextNodeFormatChange and existing assigned-heading level updates;restore owned rule/list state,outline suppression attributes and exact undo. Preserve registered document IO deviations and unchanged gates."
sections:
  Summary: "Iteration37 restores source-owned numbering transitions when changing the paragraph format collection,including initial attach,rule rebinding,removal/reset,outline empty-rule suppression and existing assigned-heading levels. Preserve existing IO exceptions and audit evidence."
  Scope: "The approved collection-numbering correction covers sw/source/core/txtnode/ndtxt.ts and the new ndtxt-format-change.ts namespace-helper split;doc/fmtcol.ts,doc/number.ts,attr/swatrset.ts,undo/unfmco.ts;sw/inc/hintids.ts;svl/source/items/intitem.ts and new cintitem.ts. Necessary existing ODT/Worker dependencies:sw/browser/filter/xml/writer-document-codec.ts;sw/source/filter/xml/xmlimp.ts,xmlexp.ts;xmloff/source/style/xmlstyle.ts,new styleexp.ts,and xmloff/source/text/txtparai.ts. New focused unsigned/transition/style-export/ODT tests and existing xmlstyle,writer-attributes,undo,declarations,roundtrip,canonical diagnostic expectations only where pinned evidence proves changed support. Bounded docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json evidence/mappings plus task-local baseline/native/actual comparison/log artifacts. Native shown Arabic/bullet/Outline and ordinary/already-assigned collections,canonical/foreign arrays,direct/inherited ownership,same collection/default/false level flags,reset/restart/count,independent synthesized marker,exact undo/Worker graph and genuine ODT/reopen. General live-format and outline attribute callbacks,derived-style cleanup,footnotes/conditional/inline/index/layout/history/UNO/refcount/name encoding/full XMLStyleExport machinery remain explicit separate obligations. No registered IO deviations,gates,graph version16,ODF1.3 or blanket module/goal status change;no network,outside access or subagents."
  Plan: "Finish the approved iteration37 correction with all prior collection/native/UInt16/undo/ODT/Worker scope and constraints preserved. Final observed Worker dependencies: assignment-baseline.json shows legacy heading level becomes-1 and explicit deleted assignment becomestrue;full verification shows restore adds a direct level0 absent from the snapshot. In existing writer-document-codec.ts graph v16,preserve actual SwTextFormatColl outlineAssignment as an optional boolean,including explicitfalse;only absent legacy fields retain the source pool-factory assignment/outline default when its item is absent. Never infer synthesized empty-list intent from attributes. Restore explicit assignment flags using existing source methods before exact direct-item decoding;use ChgFormatColl with false and restore exact direct paragraph items instead of introducing assignment defaults into snapshots. Test assigned/unassigned/zero/no-direct/legacy/invalid field cases and exact graph stability. Source-backed diagnostic expectations for newly supported outline/list style attributes may change,but unrelated diagnostics and validation remain. Source helper/unsigned ownership,namespace split,named ODT compatibility,independent clone marker,true-only emptyListStyle field,Worker16/ODF1.3 and registered IO settings remain as approved. All native bodies/profile/exact comparison,literal vectors/client identity/undo/real packages/coverage100%/browser/static/source/provenance/routing checks still required. General attribute/live-format callbacks,derived-style cleanup,native outline candidate/index,footnotes/conditional/inline/layout/UNO/history/refcount/name-encoding machinery remain explicit follow-ups;no blanket closure. No network,outside access or subagents. Complete verified child,real code SHA/evaluator/clean state;parent and persistent goal remain active."
  Verify Steps: "Run actual baseline before edits showing effective Counters with no owned record after initial style change and effective Bullets with retained Counters record/decimal label after next style. Compile full unmodified pinned ChgFormatColl,HandleModifyAtTextNodeFormatChange,HandleApplyTextNodeFormatChange,lcl_ResetParAttrs,ChgTextCollUpdateNum,empty suppression and supported outline/assigned helpers with explicit no-footnote/no-conditional/no-inline-layout/platform/history dependencies and byte identity;do not rewrite native bodies or replace behavior expectations with local approximations. Compare actual style/node/rule/list/item state for sequences across inherited/direct rules,none/bullet/Arabic/Outline,same style,bSetListLevel default/false,assigned0..9 levels,foreign arrays,empty suppression return,IDs/restart/count/direct overrides and source reset behavior. Assert literal vectors/labels,record identity and rule clients,exact direct attribute/item clones and undo/redo;genuine ODT/Worker packages and reopen exercise the correction. Validate unsigned item defaults/type/ranges/owned cloning against pinned source. Focused tests,lints/types/docs/source-provenance/parity before unchanged npm run verify;all668+existing tests plus additions,both coverage gates100%,browser/static/resource/source/invariant gates unchanged. Doctor,routing,diff,actual code SHA,evaluator pass and clean final checkout. No waived/changed gates or blanket status/default promotion."
  Verification: |-
    Command: npm run verify. Result: pass exit0 on final runtime and test documentation. Evidence: verify-terminal.log;682 app tests in153 files,109 inventory tests in36 files,19 browser tests16.9s;both coverage gates100% (app10331 statements/7828 branches/2827 functions/9491 lines;inventory1523/1080/384/1464). All unchanged static/build,format/lint/types/dependencies/resources,docs464,file-size467,source-tree111/33,provenance208,34 invariants and semanticViolationCount0 mapping gates pass. Native comparison.json:16 unchanged additional native definitions,277 sequences/10394 real states;unsigned-native-results.json:8 definitions pass. Literal owned vectors/labels/client identity/reset/default/foreign/outline flags,exact undo/Worker and real ODT/reopen assertions pass. Doctor0errors/two old warnings,policy routing pass;no gate waiver or broad parity claim. Earlier failures and residual obligations remain in Findings. Actual implementation SHA and evaluator report follow in lifecycle evidence.

    <!-- BEGIN VERIFICATION RESULTS -->
    ### 2026-10-01T07:22:00.733Z — VERIFY — ok

    By: CODER

    Note: Final unchanged npm run verify passes682 app/109 inventory/19 browser tests,both100% coverage,all static/source/invariant gates;native16 bodies277 sequences10394 actual states and8 unsigned definitions pass. Bounded collection-numbering/undo/ODT/Worker correction only;explicit residuals and prior unexplained UI timing failures retained in Findings;no waived gates or IO deviations.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T07:22:00.372Z, excerpt_hash=sha256:98aa5560861cf87689f901ffe6e41eec0dfcdcdd74cdf09ba984508076c49443

    Details:

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010536-95XQFH/blueprint/resolved-snapshot.json
    - old_digest: cd16e0aefb86c2eba9f5bf7ff0ffe8ad82521785723a7fdd72832cb7b20042e3
    - current_digest: cd16e0aefb86c2eba9f5bf7ff0ffe8ad82521785723a7fdd72832cb7b20042e3
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202610010536-95XQFH

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202610010536-95XQFH
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert only the actual iteration37 implementation commit if contracts fail;preserve task evidence and all prior DONE artifacts. No history rewriting or IO changes."
  Findings: |-
    Command: actual baseline.ts before runtime edits;Result: confirmed mismatch;Evidence: Counters style first attach has no record,Bullets style retains Counters/1.,heading-3 level remains0;Scope: explicit collection numbering. Command: native-oracle.py and compare-native.ts;Result: pass;Evidence:16 unchanged additional native bodies,277 sequences/10394 real style/node/rule/list/item states;8 unsigned native ctor/value/query/clone/equality/default bodies pass literal widths/owned copies. First native compile failed five dependency declarations;repair adapter forward/SwPaM declarations only,not native bodies. First compare failed incorrect getNumItems harness signature;corrected adapter call. Command: focused8 app suites;Result: pass49 tests;Scope: style/list ownership,undo,native heading assignment,UInt16,actual ODT/Worker and marker transfer. Initial ODT tests exposed unsupported native named items and newly assigned heading levels;approved compatibility extension emits/parses direct source attributes and referenced numbering definitions. marker-baseline.json confirms originaltrue/copyfalse/Workerfalse;approved independent copied state and optional true-only v16 field preserve synthesized intent without heuristic inference. Source-stale writer-attributes ResetAttr LIST_LEVEL expectation changed totrue because pinned ChgTextCollUpdateNum/SetAttrListLevel put direct0;style undo payload2 changed3 for owned marker/history. Test-only errors repaired:wrong glyph at level2,wrong pool/error API,swModelVersion field,automatic L1 declaration expectation and banned non-null assertions. Runtime inventory first failed unordered new paths;sorted explicit modules. Command:npm run verify initial;Result:fail lint;Evidence:16 new test non-null assertions,retained verify-initial.log;Scope:no gates changed. Focused lint/type now pass. New codec provenance annotation attempt used mapped-module key on local-infrastructure entry;corrected responsibilities key before checks. Full verification pending. Explicit residuals:general outline attribute/live-style callback handlers,derived-style assignment cleanup iterator,footnote/conditional/inline styles,outline indexes,platform hidden/cache flags,full native history/refcount/lifetime/UNO/name-encoding/default factories remain unverified;ODT direct-outline/normal-outline/inheritance fallback broader contracts separate. No network/outside access/subagents,registered document IO deviations unchanged,parent C9TN6M stays active. Previous iteration36 records immutable.

    Full verify-full.log failed 4 of 680 tests: three obsolete unsupported-attribute diagnostic expectations and one actual Worker restore direct-level mismatch. The source-backed diagnostics were updated; restore now applies collection without defaults and replaces exact direct items. assignment-baseline.json separately proves legacy/deleted assignment loss; explicit assignment is retained independently with absent-field pool-factory compatibility. Focused 5 ODT suites passed34 tests after repairs. Latest unchanged native bodies match277 sequences/10394 actual states. Focused helper/unsigned coverage passes12 tests with100% statements/branches/functions/lines (41/41,41/41,8/8,38/38). SwContentNode::SetAttr and SfxItemSet::PutImpl were read to confirm direct default-valued items are retained. Final unchanged full verification pending.

    Command: npm run verify (verify-final.log); Result: fail; Evidence: 681/682 tests pass,153 files; unchanged WriterMenuBar accessible-menu test exceeds existing30000ms timeout (36800ms),no failed semantic assertion; Scope: full app stage,downstream coverage/inventory/browser/static not reached. Command: npx vitest run src/sw/browser/presentation/WriterMenuBar.test.tsx (menu-isolated.log); Result: pass9 tests; Evidence:26.25s total,20.69s tests with unchanged source/assertions/config; Scope: bounded reproduction only,root cause of full-run timeout unproven. Full unchanged verification will be repeated;no gate waiver. CLI route/verify guidance initially attempted from apps/office rejected E_GIT;recomputed route and ran exact guidance from repository root.

    Command: npm run verify (verify-rerun.log); Result: app tests pass682/682 in153 files,coverage gate fail; Evidence:10330/10331 statements,7827/7828 branches,2827/2827 functions,9490/9491 lines. Single uncovered xmlexp unsupported-direct-item rejection remained after named NUMRULE/OUTLINE support replaced the old unsupported named-rule fixture. Added real direct paragraph outline level4 rejection and state-retention assertions;general direct-outline ODT export remains an explicit residual rather than silently dropping the item. Focused canonical-state test first had imprecise error owner substring;corrected to existing paragraph-at-node context,then passes. No production or gate changes after latest full app pass;complete unchanged verify pending.

    Command: npm run verify (verify-complete.log);Result:fail679/682 app tests;Evidence:unchanged Desktop ODT/TXT browser-list waits cannot find imported names;Save As title remains Untitled during5000ms wait;152/153 files pass;Scope:global app check,not a proven core cause. Command:npx vitest run src/framework/browser/app/desktop.test.tsx (desktop-isolated.log);Result:pass11/11 with unchanged source/config/assertions;Evidence:14.52s total,11.99s tests. These asynchronous UI failures and the earlier menu timeout remain unexplained;isolated passes do not establish causation. No IO policy/assertion/timeout/gate changes;complete unchanged verification rerun required.

    Command:npm run verify (verify-final-pass.log);Result:all runtime stages pass,final docs check fail;Evidence:682 app/153 files,109 inventory/36 files,19 browser13.4s,both100% coverage(app10331/7828/2827/9491;inventory1523/1080/384/1464),build/static pass;JSDoc9 missing comments on new test callbacks. Added documentation only. Subsequent check:docs passes464 files;file-size passes467 with decomposition candidates,source-tree111/33,provenance208(132mapped/60browser/16local),34 invariants valid,parity semanticViolationCount0. Retain full logs and prior unexplained UI failures;no production/assertion/config/gate changes in this documentation repair. Complete unchanged full command required before closure.

    Command:npm run verify (verify-terminal.log,session32251);Result:pass exit0;Evidence:682 app/153 files93.45s,109 inventory/36 files56.35s,19 browser16.9s;both coverage100% on all four metrics(app10331/7828/2827/9491;inventory1523/1080/384/1464);all unchanged build/static/docs464/file-size467/source-tree111+33/provenance208(132mapped/60browser/16local)/34invariants/parity semanticViolationCount0 gates pass. Final doctor0errors,two pre-existing warnings;policy routing passes. git diff --check initially rejects trailing spaces emitted by coverage/Vite in completed task log;normalized log line endings/trailing whitespace only,without changing results. Empty-index guard suggest-allow was premature;use intentional concrete runtime allowlist for code commit. Prior unexplained menu/Desktop waits and old iteration32 browser issue remain carried risks;no whole-module/full-native/parent/goal completion claim. No skipped/waived gates,network,outside access/subagents or registered IO changes.
id_source: "generated"
---
## Summary

Iteration37 restores source-owned numbering transitions when changing the paragraph format collection,including initial attach,rule rebinding,removal/reset,outline empty-rule suppression and existing assigned-heading levels. Preserve existing IO exceptions and audit evidence.

## Scope

The approved collection-numbering correction covers sw/source/core/txtnode/ndtxt.ts and the new ndtxt-format-change.ts namespace-helper split;doc/fmtcol.ts,doc/number.ts,attr/swatrset.ts,undo/unfmco.ts;sw/inc/hintids.ts;svl/source/items/intitem.ts and new cintitem.ts. Necessary existing ODT/Worker dependencies:sw/browser/filter/xml/writer-document-codec.ts;sw/source/filter/xml/xmlimp.ts,xmlexp.ts;xmloff/source/style/xmlstyle.ts,new styleexp.ts,and xmloff/source/text/txtparai.ts. New focused unsigned/transition/style-export/ODT tests and existing xmlstyle,writer-attributes,undo,declarations,roundtrip,canonical diagnostic expectations only where pinned evidence proves changed support. Bounded docs/program/source-provenance.json and docs/program/parity/runtime-inventory.json evidence/mappings plus task-local baseline/native/actual comparison/log artifacts. Native shown Arabic/bullet/Outline and ordinary/already-assigned collections,canonical/foreign arrays,direct/inherited ownership,same collection/default/false level flags,reset/restart/count,independent synthesized marker,exact undo/Worker graph and genuine ODT/reopen. General live-format and outline attribute callbacks,derived-style cleanup,footnotes/conditional/inline/index/layout/history/UNO/refcount/name encoding/full XMLStyleExport machinery remain explicit separate obligations. No registered IO deviations,gates,graph version16,ODF1.3 or blanket module/goal status change;no network,outside access or subagents.

## Plan

Finish the approved iteration37 correction with all prior collection/native/UInt16/undo/ODT/Worker scope and constraints preserved. Final observed Worker dependencies: assignment-baseline.json shows legacy heading level becomes-1 and explicit deleted assignment becomestrue;full verification shows restore adds a direct level0 absent from the snapshot. In existing writer-document-codec.ts graph v16,preserve actual SwTextFormatColl outlineAssignment as an optional boolean,including explicitfalse;only absent legacy fields retain the source pool-factory assignment/outline default when its item is absent. Never infer synthesized empty-list intent from attributes. Restore explicit assignment flags using existing source methods before exact direct-item decoding;use ChgFormatColl with false and restore exact direct paragraph items instead of introducing assignment defaults into snapshots. Test assigned/unassigned/zero/no-direct/legacy/invalid field cases and exact graph stability. Source-backed diagnostic expectations for newly supported outline/list style attributes may change,but unrelated diagnostics and validation remain. Source helper/unsigned ownership,namespace split,named ODT compatibility,independent clone marker,true-only emptyListStyle field,Worker16/ODF1.3 and registered IO settings remain as approved. All native bodies/profile/exact comparison,literal vectors/client identity/undo/real packages/coverage100%/browser/static/source/provenance/routing checks still required. General attribute/live-format callbacks,derived-style cleanup,native outline candidate/index,footnotes/conditional/inline/layout/UNO/history/refcount/name-encoding machinery remain explicit follow-ups;no blanket closure. No network,outside access or subagents. Complete verified child,real code SHA/evaluator/clean state;parent and persistent goal remain active.

## Verify Steps

Run actual baseline before edits showing effective Counters with no owned record after initial style change and effective Bullets with retained Counters record/decimal label after next style. Compile full unmodified pinned ChgFormatColl,HandleModifyAtTextNodeFormatChange,HandleApplyTextNodeFormatChange,lcl_ResetParAttrs,ChgTextCollUpdateNum,empty suppression and supported outline/assigned helpers with explicit no-footnote/no-conditional/no-inline-layout/platform/history dependencies and byte identity;do not rewrite native bodies or replace behavior expectations with local approximations. Compare actual style/node/rule/list/item state for sequences across inherited/direct rules,none/bullet/Arabic/Outline,same style,bSetListLevel default/false,assigned0..9 levels,foreign arrays,empty suppression return,IDs/restart/count/direct overrides and source reset behavior. Assert literal vectors/labels,record identity and rule clients,exact direct attribute/item clones and undo/redo;genuine ODT/Worker packages and reopen exercise the correction. Validate unsigned item defaults/type/ranges/owned cloning against pinned source. Focused tests,lints/types/docs/source-provenance/parity before unchanged npm run verify;all668+existing tests plus additions,both coverage gates100%,browser/static/resource/source/invariant gates unchanged. Doctor,routing,diff,actual code SHA,evaluator pass and clean final checkout. No waived/changed gates or blanket status/default promotion.

## Verification

Command: npm run verify. Result: pass exit0 on final runtime and test documentation. Evidence: verify-terminal.log;682 app tests in153 files,109 inventory tests in36 files,19 browser tests16.9s;both coverage gates100% (app10331 statements/7828 branches/2827 functions/9491 lines;inventory1523/1080/384/1464). All unchanged static/build,format/lint/types/dependencies/resources,docs464,file-size467,source-tree111/33,provenance208,34 invariants and semanticViolationCount0 mapping gates pass. Native comparison.json:16 unchanged additional native definitions,277 sequences/10394 real states;unsigned-native-results.json:8 definitions pass. Literal owned vectors/labels/client identity/reset/default/foreign/outline flags,exact undo/Worker and real ODT/reopen assertions pass. Doctor0errors/two old warnings,policy routing pass;no gate waiver or broad parity claim. Earlier failures and residual obligations remain in Findings. Actual implementation SHA and evaluator report follow in lifecycle evidence.

<!-- BEGIN VERIFICATION RESULTS -->
### 2026-10-01T07:22:00.733Z — VERIFY — ok

By: CODER

Note: Final unchanged npm run verify passes682 app/109 inventory/19 browser tests,both100% coverage,all static/source/invariant gates;native16 bodies277 sequences10394 actual states and8 unsigned definitions pass. Bounded collection-numbering/undo/ODT/Worker correction only;explicit residuals and prior unexplained UI timing failures retained in Findings;no waived gates or IO deviations.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-10-01T07:22:00.372Z, excerpt_hash=sha256:98aa5560861cf87689f901ffe6e41eec0dfcdcdd74cdf09ba984508076c49443

Details:

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202610010536-95XQFH/blueprint/resolved-snapshot.json
- old_digest: cd16e0aefb86c2eba9f5bf7ff0ffe8ad82521785723a7fdd72832cb7b20042e3
- current_digest: cd16e0aefb86c2eba9f5bf7ff0ffe8ad82521785723a7fdd72832cb7b20042e3
- route_changed: no
- safe_command: agentplane blueprint snapshot 202610010536-95XQFH

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202610010536-95XQFH
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert only the actual iteration37 implementation commit if contracts fail;preserve task evidence and all prior DONE artifacts. No history rewriting or IO changes.

## Findings

Command: actual baseline.ts before runtime edits;Result: confirmed mismatch;Evidence: Counters style first attach has no record,Bullets style retains Counters/1.,heading-3 level remains0;Scope: explicit collection numbering. Command: native-oracle.py and compare-native.ts;Result: pass;Evidence:16 unchanged additional native bodies,277 sequences/10394 real style/node/rule/list/item states;8 unsigned native ctor/value/query/clone/equality/default bodies pass literal widths/owned copies. First native compile failed five dependency declarations;repair adapter forward/SwPaM declarations only,not native bodies. First compare failed incorrect getNumItems harness signature;corrected adapter call. Command: focused8 app suites;Result: pass49 tests;Scope: style/list ownership,undo,native heading assignment,UInt16,actual ODT/Worker and marker transfer. Initial ODT tests exposed unsupported native named items and newly assigned heading levels;approved compatibility extension emits/parses direct source attributes and referenced numbering definitions. marker-baseline.json confirms originaltrue/copyfalse/Workerfalse;approved independent copied state and optional true-only v16 field preserve synthesized intent without heuristic inference. Source-stale writer-attributes ResetAttr LIST_LEVEL expectation changed totrue because pinned ChgTextCollUpdateNum/SetAttrListLevel put direct0;style undo payload2 changed3 for owned marker/history. Test-only errors repaired:wrong glyph at level2,wrong pool/error API,swModelVersion field,automatic L1 declaration expectation and banned non-null assertions. Runtime inventory first failed unordered new paths;sorted explicit modules. Command:npm run verify initial;Result:fail lint;Evidence:16 new test non-null assertions,retained verify-initial.log;Scope:no gates changed. Focused lint/type now pass. New codec provenance annotation attempt used mapped-module key on local-infrastructure entry;corrected responsibilities key before checks. Full verification pending. Explicit residuals:general outline attribute/live-style callback handlers,derived-style assignment cleanup iterator,footnote/conditional/inline styles,outline indexes,platform hidden/cache flags,full native history/refcount/lifetime/UNO/name-encoding/default factories remain unverified;ODT direct-outline/normal-outline/inheritance fallback broader contracts separate. No network/outside access/subagents,registered document IO deviations unchanged,parent C9TN6M stays active. Previous iteration36 records immutable.

Full verify-full.log failed 4 of 680 tests: three obsolete unsupported-attribute diagnostic expectations and one actual Worker restore direct-level mismatch. The source-backed diagnostics were updated; restore now applies collection without defaults and replaces exact direct items. assignment-baseline.json separately proves legacy/deleted assignment loss; explicit assignment is retained independently with absent-field pool-factory compatibility. Focused 5 ODT suites passed34 tests after repairs. Latest unchanged native bodies match277 sequences/10394 actual states. Focused helper/unsigned coverage passes12 tests with100% statements/branches/functions/lines (41/41,41/41,8/8,38/38). SwContentNode::SetAttr and SfxItemSet::PutImpl were read to confirm direct default-valued items are retained. Final unchanged full verification pending.

Command: npm run verify (verify-final.log); Result: fail; Evidence: 681/682 tests pass,153 files; unchanged WriterMenuBar accessible-menu test exceeds existing30000ms timeout (36800ms),no failed semantic assertion; Scope: full app stage,downstream coverage/inventory/browser/static not reached. Command: npx vitest run src/sw/browser/presentation/WriterMenuBar.test.tsx (menu-isolated.log); Result: pass9 tests; Evidence:26.25s total,20.69s tests with unchanged source/assertions/config; Scope: bounded reproduction only,root cause of full-run timeout unproven. Full unchanged verification will be repeated;no gate waiver. CLI route/verify guidance initially attempted from apps/office rejected E_GIT;recomputed route and ran exact guidance from repository root.

Command: npm run verify (verify-rerun.log); Result: app tests pass682/682 in153 files,coverage gate fail; Evidence:10330/10331 statements,7827/7828 branches,2827/2827 functions,9490/9491 lines. Single uncovered xmlexp unsupported-direct-item rejection remained after named NUMRULE/OUTLINE support replaced the old unsupported named-rule fixture. Added real direct paragraph outline level4 rejection and state-retention assertions;general direct-outline ODT export remains an explicit residual rather than silently dropping the item. Focused canonical-state test first had imprecise error owner substring;corrected to existing paragraph-at-node context,then passes. No production or gate changes after latest full app pass;complete unchanged verify pending.

Command: npm run verify (verify-complete.log);Result:fail679/682 app tests;Evidence:unchanged Desktop ODT/TXT browser-list waits cannot find imported names;Save As title remains Untitled during5000ms wait;152/153 files pass;Scope:global app check,not a proven core cause. Command:npx vitest run src/framework/browser/app/desktop.test.tsx (desktop-isolated.log);Result:pass11/11 with unchanged source/config/assertions;Evidence:14.52s total,11.99s tests. These asynchronous UI failures and the earlier menu timeout remain unexplained;isolated passes do not establish causation. No IO policy/assertion/timeout/gate changes;complete unchanged verification rerun required.

Command:npm run verify (verify-final-pass.log);Result:all runtime stages pass,final docs check fail;Evidence:682 app/153 files,109 inventory/36 files,19 browser13.4s,both100% coverage(app10331/7828/2827/9491;inventory1523/1080/384/1464),build/static pass;JSDoc9 missing comments on new test callbacks. Added documentation only. Subsequent check:docs passes464 files;file-size passes467 with decomposition candidates,source-tree111/33,provenance208(132mapped/60browser/16local),34 invariants valid,parity semanticViolationCount0. Retain full logs and prior unexplained UI failures;no production/assertion/config/gate changes in this documentation repair. Complete unchanged full command required before closure.

Command:npm run verify (verify-terminal.log,session32251);Result:pass exit0;Evidence:682 app/153 files93.45s,109 inventory/36 files56.35s,19 browser16.9s;both coverage100% on all four metrics(app10331/7828/2827/9491;inventory1523/1080/384/1464);all unchanged build/static/docs464/file-size467/source-tree111+33/provenance208(132mapped/60browser/16local)/34invariants/parity semanticViolationCount0 gates pass. Final doctor0errors,two pre-existing warnings;policy routing passes. git diff --check initially rejects trailing spaces emitted by coverage/Vite in completed task log;normalized log line endings/trailing whitespace only,without changing results. Empty-index guard suggest-allow was premature;use intentional concrete runtime allowlist for code commit. Prior unexplained menu/Desktop waits and old iteration32 browser issue remain carried risks;no whole-module/full-native/parent/goal completion claim. No skipped/waived gates,network,outside access/subagents or registered IO changes.
