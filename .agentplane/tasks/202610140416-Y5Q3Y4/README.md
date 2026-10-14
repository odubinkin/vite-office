---
id: "202610140416-Y5Q3Y4"
title: "Implement shared configuration group tree and layered member lookup for Calc settings"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 15
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-14T04:17:35.122Z"
  updated_by: "ORCHESTRATOR"
  note: null
verification:
  state: "pending"
  updated_at: null
  updated_by: null
  note: null
  attempts: 0
commit: null
comments:
  -
    author: "CODER"
    body: "Start: actual sharedconfig group/root/member tree andlayerlookup over existingSortedVector/SAL, plainJSrefs,no fakeData/settings or newmemorylibrary;source-backedstrictchecks/nextfull111pause."
events:
  -
    type: "status"
    at: "2026-10-14T04:17:35.522Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: actual sharedconfig group/root/member tree andlayerlookup over existingSortedVector/SAL, plainJSrefs,no fakeData/settings or newmemorylibrary;source-backedstrictchecks/nextfull111pause."
doc_version: 3
doc_updated_at: "2026-10-14T04:29:21.047Z"
doc_updated_by: "CODER"
description: "Task105: genuine configmgr Node/GroupNode/RootNode/NodeMap and config_map length-contents comparator/type responsibility over existing SortedVector, OUString, RuntimeException and SAL_MAX_INT32. Full represented logical layer/finalized/mandatory/description/template/deepclone/cache/ordered entry contracts; ordinaryJSrefs, no new SAL/refcount/staticize/allocator/provider or fake Data/settings. Preserve Node copy description omission, document suspectedcase. No property/XML/backend/locale/defaultConfig stubs; targetedCalc/complete sharedraw100/inventory/gates, nextfull111pause."
sections:
  Summary: "Task105 begins real shared configuration model needed before Calc document/view defaults: actual group/root/layered member tree, not hardcoded locale/year/color defaults."
  Scope: "Actual shared configmgr tree in five source files plus real Root/Group tests; ten runtime/provenance records, one shared capability, three Calc documents. Required dependency-check integration adds the new configmgr module with only cppu/o3tl/sal edges and explicit reverse/application/browser rejection tests in the existing two boundary files. This is two necessary verification-integration paths beyond the twenty planned paths, within the standing goal authorization and five-file expansion limit; no validation weakening, dependency cycle, browser imports, new service/library or unrelated runtime changes. Total22 non-task paths. Existing shared SortedVector/OUString/RuntimeException/Reference/SAL owners reused unchanged. Property/set/localized/Data/services/defaults/document/grid/ODS remain pending."
  Plan: "Port actual configmgr logical Node/GroupNode/RootNode/NodeMap and config_map comparator/type responsibilities in5original source files, using existing SortedVector/OUString/RuntimeException/Reference/SAL_MAX_INT32. Native NodeMap first/second entry references, undefined end cursor, getOrInsert for operator[] and live ordered iteration preserve represented initialized member/cache/insert/erase/deepclone/layer contracts; no whole STL/iterator-address/ABI claim. Node ordinaryJSrefs omit native refcount inheritance/staticize optimization peruser, no no-op lifecyclelibrary or fake Data/service. Int32layer/finalized/mandatory and stable description value, copy description omission and clone template/child rules preserved. SAL_MAX_INT32 equals actualData::NO_LAYER INT_MAX, avoids artificial importcycle withoutduplicatingData. Source-backed realRoot/Group tests and actual unchangedSortedVector tests, no fakeNode/provider ornewCppgenerator. New6source/tests+10records/newcap/3Calcdocs =20paths. WholeCalc andcomplete5newshared+reusedSortedVector owner raw100, actualstatic/Calc0UI/4links,16gates/exacthashes/separate sameagentEVAL(notindependent)/DONE/clean. Property/sets/localized/XML/layers/backend/configdefaults/ScDocOptions/UI/ODS remainpending; nextfull111pause."
  Verify Steps: |-
    1. Source review original complete Node/NodeMap/Group/Root declarations/bodies/config_map/DataNO_LAYER. Real initializedRoot/Group histories prove6kindvalues, Int32metadata, stable description, actualcopy descriptiondrop, templatekeep/childdeepclone/mandatory/extensibility; mapUTF16length-first order/cursor insert duplicate/erase variants/cache invalidation/retained lvalue/newaliases/findNode layerfilter, copied keyinput andsource/target independence. Actual shared RuntimeException for native release getMembers fallback, Rootclone release null documented; native debug/assertion/refcount/staticize/ABI notclaimed. No fakeleafclass ornewCppgenerator.
    2. Whole source-absent npm run test:coverage:calc and complete5newshared+unchangedSortedVector owner/profile with real relevanttests rawS/B/F/L100/everycounterpositive; actualstatic/Calc0UI manifests,4linksrestoreexact. Reused unchanged SAL/cppu dependencies do not become modifiedowners or duplicatedlibraries. NoWriter-onlycoverage repair/fullofficebefore111.
    3. All16 existing repo gates and currentintentionalpathsformat afterlastedit, originalheader/core responsibility records andtruthfulscopegaps/newcap/suspectedcase090. No threshold/sourceRouting weakening or private-state counterforcing. Retain failures beforeboundedcorrection.
    4. Exact baseline/current/committed sourcehashes only intentional22paths (20planned plus2necessary dependency-check integration files), actualsource/gate/coverage manifests sourcecommit-bound, same-agent separateevaluator notindependent, APverify/DONE/cleanbranchcalc. Goalactive; nextfull111requestedpause.

    Blueprint expected evidence
    blueprint_id: code.direct
    blueprint_version: 1
    workflow_mode: direct
    workflow_git: implementation_commit_location=current_checkout finish_commit_source=explicit_hash_or_comment_commit close_tail_required=no lifecycle_comment_commit_location=current_checkout finish_commit_from_comment=yes
    route: intake -> scope -> approval_gate -> context_resolve -> work_unit -> deterministic_check -> verify_record -> quality_gate -> finish
    selection_reasons: task kind resolved to code; workflow mode: direct; mutation scope: code
    policy_modules: .agentplane/policy/dod.code.md, .agentplane/policy/dod.core.md, .agentplane/policy/security.must.md, .agentplane/policy/workflow.direct.md
    allowed_commands: agentplane evaluator run <task-id> --verdict pass|rework|blocked|human_review; agentplane finish <task-id>; agentplane task verify-show <task-id>; agentplane verify <task-id> --ok|--rework; project focused checks
    context_budget: max_policy_modules=4 max_prompt_blocks=12
    context_manifest: 0
    required_evidence: changed_paths, check_result, commit, quality_report
    accepted_recipe_extensions: 0
    rejected_recipe_extensions: 0
    stop_reasons: none
    sgr_decision: blueprint_route_decision selected=code.direct
    Blueprint snapshot evidence
    snapshot_state: current
    snapshot_path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610140416-Y5Q3Y4/blueprint/resolved-snapshot.json
    snapshot_digest: d90ed343c600cf8a2a69d352b4d32bcbe084f852577d76f7ec5bf2b434219516
    snapshot_current_digest: d90ed343c600cf8a2a69d352b4d32bcbe084f852577d76f7ec5bf2b434219516
    snapshot_route_changed: no
    snapshot_required_evidence: code_direct.paths, code_direct.check, code_direct.commit, code_direct.quality
    snapshot_safe_command: agentplane blueprint snapshot 202610140416-Y5Q3Y4
  Verification: "Pending implementation and actual checks."
  Rollback Plan: "Finallyrestore4exactreference links onalltest exits. Revert onlyintentionaltaskchanges throughnewtask, no merge/historyrewrite/unrelatedtask changes."
  Findings: |-
    Command: node output/playwright/task105-checks/portable.mjs; rerun --shared-only after lint-only test annotation correction.
    Result: pass. Whole Calc152tests/52files/32owners S4006/B2654/F787/L3570; shared9tests/2files/6owners S141/B48/F52/L136, everyrawcounterpositive100. Actual static and Calc0UI pass;4links restored exactly.
    Scope: complete new5tree owners and unchanged reused SortedVector. SAL/cppu dependencies reused unchanged, no new lifetime mechanisms. Original10declaration/body/Data files match pinned bytes; source-backed tests, not compiled native/fullQA/ABI proof. Native staticization/refcount/assertions/iterator-address/private-copy accessibility excluded. Description-copy omission CALC-090 preserved.
    Initial provenance/registry/invariant checks rejected class-only symbol lists; actual mapped method symbols were added without lowering validation. Lint rejected five non-null assertions in tests; replaced with erased type annotations/optional lookup, shared coverage rerun passed. Dependency gate found new configmgr unclassified; two necessary existing boundary files now register only cppu/o3tl/sal edges and reject application/reverse/browser imports, within standing goal authorization/two-file expansion. No memory library/provider/Data/default shortcut added. Late harness initially lacked empty results manifest; initialized before actual gate execution. An upstream QA inspection during source absence could not resolve the removed link; successful source review completed after restoration. Preserve all gate firstExitCode evidence.
    Remaining Property/Set/Localized/Data/XML/layer/backend/services and actual Calc default/document/grid/ODS work remain pending. Nextfull111pause after relevant repairs; no Writer-only coverage repair. Separate same-agent EVALUATOR is not independent review.
id_source: "generated"
---
## Summary

Task105 begins real shared configuration model needed before Calc document/view defaults: actual group/root/layered member tree, not hardcoded locale/year/color defaults.

## Scope

Actual shared configmgr tree in five source files plus real Root/Group tests; ten runtime/provenance records, one shared capability, three Calc documents. Required dependency-check integration adds the new configmgr module with only cppu/o3tl/sal edges and explicit reverse/application/browser rejection tests in the existing two boundary files. This is two necessary verification-integration paths beyond the twenty planned paths, within the standing goal authorization and five-file expansion limit; no validation weakening, dependency cycle, browser imports, new service/library or unrelated runtime changes. Total22 non-task paths. Existing shared SortedVector/OUString/RuntimeException/Reference/SAL owners reused unchanged. Property/set/localized/Data/services/defaults/document/grid/ODS remain pending.

## Plan

Port actual configmgr logical Node/GroupNode/RootNode/NodeMap and config_map comparator/type responsibilities in5original source files, using existing SortedVector/OUString/RuntimeException/Reference/SAL_MAX_INT32. Native NodeMap first/second entry references, undefined end cursor, getOrInsert for operator[] and live ordered iteration preserve represented initialized member/cache/insert/erase/deepclone/layer contracts; no whole STL/iterator-address/ABI claim. Node ordinaryJSrefs omit native refcount inheritance/staticize optimization peruser, no no-op lifecyclelibrary or fake Data/service. Int32layer/finalized/mandatory and stable description value, copy description omission and clone template/child rules preserved. SAL_MAX_INT32 equals actualData::NO_LAYER INT_MAX, avoids artificial importcycle withoutduplicatingData. Source-backed realRoot/Group tests and actual unchangedSortedVector tests, no fakeNode/provider ornewCppgenerator. New6source/tests+10records/newcap/3Calcdocs =20paths. WholeCalc andcomplete5newshared+reusedSortedVector owner raw100, actualstatic/Calc0UI/4links,16gates/exacthashes/separate sameagentEVAL(notindependent)/DONE/clean. Property/sets/localized/XML/layers/backend/configdefaults/ScDocOptions/UI/ODS remainpending; nextfull111pause.

## Verify Steps

1. Source review original complete Node/NodeMap/Group/Root declarations/bodies/config_map/DataNO_LAYER. Real initializedRoot/Group histories prove6kindvalues, Int32metadata, stable description, actualcopy descriptiondrop, templatekeep/childdeepclone/mandatory/extensibility; mapUTF16length-first order/cursor insert duplicate/erase variants/cache invalidation/retained lvalue/newaliases/findNode layerfilter, copied keyinput andsource/target independence. Actual shared RuntimeException for native release getMembers fallback, Rootclone release null documented; native debug/assertion/refcount/staticize/ABI notclaimed. No fakeleafclass ornewCppgenerator.
2. Whole source-absent npm run test:coverage:calc and complete5newshared+unchangedSortedVector owner/profile with real relevanttests rawS/B/F/L100/everycounterpositive; actualstatic/Calc0UI manifests,4linksrestoreexact. Reused unchanged SAL/cppu dependencies do not become modifiedowners or duplicatedlibraries. NoWriter-onlycoverage repair/fullofficebefore111.
3. All16 existing repo gates and currentintentionalpathsformat afterlastedit, originalheader/core responsibility records andtruthfulscopegaps/newcap/suspectedcase090. No threshold/sourceRouting weakening or private-state counterforcing. Retain failures beforeboundedcorrection.
4. Exact baseline/current/committed sourcehashes only intentional22paths (20planned plus2necessary dependency-check integration files), actualsource/gate/coverage manifests sourcecommit-bound, same-agent separateevaluator notindependent, APverify/DONE/cleanbranchcalc. Goalactive; nextfull111requestedpause.

Blueprint expected evidence
blueprint_id: code.direct
blueprint_version: 1
workflow_mode: direct
workflow_git: implementation_commit_location=current_checkout finish_commit_source=explicit_hash_or_comment_commit close_tail_required=no lifecycle_comment_commit_location=current_checkout finish_commit_from_comment=yes
route: intake -> scope -> approval_gate -> context_resolve -> work_unit -> deterministic_check -> verify_record -> quality_gate -> finish
selection_reasons: task kind resolved to code; workflow mode: direct; mutation scope: code
policy_modules: .agentplane/policy/dod.code.md, .agentplane/policy/dod.core.md, .agentplane/policy/security.must.md, .agentplane/policy/workflow.direct.md
allowed_commands: agentplane evaluator run <task-id> --verdict pass|rework|blocked|human_review; agentplane finish <task-id>; agentplane task verify-show <task-id>; agentplane verify <task-id> --ok|--rework; project focused checks
context_budget: max_policy_modules=4 max_prompt_blocks=12
context_manifest: 0
required_evidence: changed_paths, check_result, commit, quality_report
accepted_recipe_extensions: 0
rejected_recipe_extensions: 0
stop_reasons: none
sgr_decision: blueprint_route_decision selected=code.direct
Blueprint snapshot evidence
snapshot_state: current
snapshot_path: /Users/odubinkin/Projects/vite-office-calc/.agentplane/tasks/202610140416-Y5Q3Y4/blueprint/resolved-snapshot.json
snapshot_digest: d90ed343c600cf8a2a69d352b4d32bcbe084f852577d76f7ec5bf2b434219516
snapshot_current_digest: d90ed343c600cf8a2a69d352b4d32bcbe084f852577d76f7ec5bf2b434219516
snapshot_route_changed: no
snapshot_required_evidence: code_direct.paths, code_direct.check, code_direct.commit, code_direct.quality
snapshot_safe_command: agentplane blueprint snapshot 202610140416-Y5Q3Y4

## Verification

Pending implementation and actual checks.

## Rollback Plan

Finallyrestore4exactreference links onalltest exits. Revert onlyintentionaltaskchanges throughnewtask, no merge/historyrewrite/unrelatedtask changes.

## Findings

Command: node output/playwright/task105-checks/portable.mjs; rerun --shared-only after lint-only test annotation correction.
Result: pass. Whole Calc152tests/52files/32owners S4006/B2654/F787/L3570; shared9tests/2files/6owners S141/B48/F52/L136, everyrawcounterpositive100. Actual static and Calc0UI pass;4links restored exactly.
Scope: complete new5tree owners and unchanged reused SortedVector. SAL/cppu dependencies reused unchanged, no new lifetime mechanisms. Original10declaration/body/Data files match pinned bytes; source-backed tests, not compiled native/fullQA/ABI proof. Native staticization/refcount/assertions/iterator-address/private-copy accessibility excluded. Description-copy omission CALC-090 preserved.
Initial provenance/registry/invariant checks rejected class-only symbol lists; actual mapped method symbols were added without lowering validation. Lint rejected five non-null assertions in tests; replaced with erased type annotations/optional lookup, shared coverage rerun passed. Dependency gate found new configmgr unclassified; two necessary existing boundary files now register only cppu/o3tl/sal edges and reject application/reverse/browser imports, within standing goal authorization/two-file expansion. No memory library/provider/Data/default shortcut added. Late harness initially lacked empty results manifest; initialized before actual gate execution. An upstream QA inspection during source absence could not resolve the removed link; successful source review completed after restoration. Preserve all gate firstExitCode evidence.
Remaining Property/Set/Localized/Data/XML/layer/backend/services and actual Calc default/document/grid/ODS work remain pending. Nextfull111pause after relevant repairs; no Writer-only coverage repair. Separate same-agent EVALUATOR is not independent review.
