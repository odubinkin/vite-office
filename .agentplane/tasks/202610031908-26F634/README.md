---
id: "202610031908-26F634"
title: "Restore numbering record constructor and registration policy"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 11
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-10-03T19:09:40.857Z"
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
    body: "Start: restore complete selected native constructor family and hidden registration lifecycle, adapting existing callers while preserving assertions and artifact/test restrictions."
events:
  -
    type: "status"
    at: "2026-10-03T19:10:37.618Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore complete selected native constructor family and hidden registration lifecycle, adapting existing callers while preserving assertions and artifact/test restrictions."
doc_version: 3
doc_updated_at: "2026-10-03T19:10:37.618Z"
doc_updated_by: "CODER"
description: "Iteration67 under C9TN6M: replace merged text/optional-rule SwNodeNum constructor with native text-pointer+required hidden bool and independent rule-pointer overload; preserve null initial text rule, root hidden=false, private flag, factory and complete selected PreAdd/PostRemove suppression. Adapt all existing callers and owned tests without old matcher/literal changes. No upstream tests/source/helper artifacts or IO/recovery changes."
sections:
  Summary: "Restore the complete selected SwNodeNum constructor family and hidden-redline registration lifecycle from pinned LibreOffice. Iteration67 under active C9TN6M; full redline root arrays/layout/browser lifetime remain unproven."
  Scope: "Approved semantic candidates: apps/office/src/sw/source/core/txtnode/direct-attribute-lifecycle.test.ts; apps/office/src/sw/source/core/txtnode/node-numbering-lifecycle.test.ts; apps/office/src/sw/source/core/txtnode/numbering-notification-policy.test.ts; apps/office/src/sw/source/core/txtnode/ndtxt.ts; apps/office/src/sw/source/core/txtnode/number-classification.test.ts; apps/office/src/sw/source/core/doc/DocumentListItemsManager.test.ts; apps/office/src/sw/source/core/doc/list.test.ts; apps/office/src/sw/source/core/doc/list.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-validity.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-insertion-order.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-phantoms.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-vector.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-removal.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-contract.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-document-context.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNodeNum-start-value.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-container.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-prefix.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-children.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-state.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-root.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-vector-ownership.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-helper-contracts.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-counting-contract.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-lifecycle.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-notification-access.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-policy.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNodeNum.ts; apps/office/src/sw/source/core/SwNumberTree/SwNodeNum-construction.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Three production owners only:SwNodeNum constructor/privateflag/PreAdd/PostRemove/Create,SwList root creation,SwTextNode shown creation. Existing caller test changes mechanically adapt constructor args; preserve old matcher/literal AST. Existing test fixtures with explicit prebound text-rule arguments may bind via actual ChangeNumRule or controlled text-rule lookup, documenting fixture state integrity. Metadata exactly3existing narrow rows each;no classifications/status/defaults/omissions/deviations/IO/recovery/gate promotion. No source/helper/native executable/Python files in Agentplane;bounded hashes/logs/outcomes only."
  Plan: "1. Manually inspect/hash pinned constructor declarations/defaults/factory/registration/removal and shown/hidden callsites; inventory all78existing constructors without storing scripts/source. 2. Add owned overload/privateflag/type tests and real rule/text/root/phantom registration scenarios,prove baseline constructor and hidden-client mismatches. 3. Replace merged API with native required text+bool and rule-only overloads,retain native null text-rule and false no-text flag,implement full selected PreAdd/PostRemove hidden suppression,adapt production and existing test callers without compatibility shim. 4. Preserve prior assertions/counter bodies and narrow metadata;vendor-absent focused tests,full npm verify and policy/doctor/integrity checks,exact semantic-SHA quality,clean leaf closure. Parent/full goal remain active."
  Verify Steps: |-
    1. Fresh manual pinned file hashes/declarations/defaults/PreAdd/PostRemove/Create and ndtxt/list callsites inspection;no native execution or source/helper artifacts. Final authored owned baseline fails native overload/privateflag/runtime registration tests and typechecking; corrected tests/types pass.
    2. Assert required text+bool versus required nullable rule-pointer overloads,reject old text-only/text+rule/no-arg forms,no public flag/setters,initial text rule absent,root flagfalse,factory retaining rule and resetting no-text flagfalse. Real shown/hidden records bind before insertion,shown adds rule then document registry,hidden suppresses both;remove registry before rule and clear bound rule,hidden removal preserves existing shown clients/registry. Cover no rule,no text,non-document nodes,raw counters/topology,reading suppression and actual production caller modes;ChangeNumRule existing native policy unchanged. Owned diagnostic fixtures do not certify complete hidden root selection/redline/layout/client destruction.
    3. Existing matcher/literal AST values unchanged despite constructor syntax;all unaffected test files and unrelated method bodies byte-identical. Three narrowly changed metadata rows each with all non-evidence fields/order preserved. Focused core number/doc/text plus boundary/resource tests pass vendor absent/restored exact pin in finally. Ignored-inclusive Agentplane tasks/tmp prohibited source/helper/executable/Python count0.
    4. npm run verify passes every gate including both100percent coverage and browser tests. ap doctor stays0errors/2existingwarnings;policy routing and diffcheck pass. Record canonical verification,actual semantic-SHA EVALUATOR review and clean leaf closure;parent/full module/goal remain open.
  Verification: "Pending exact final authored baseline,implementation and terminal check evidence. No claim of full hidden/original root arrays,layout/redline/const/final/destructor/browser lifetimes."
  Rollback Plan: "Revert only this leaf semantic commit;retain task evidence and prior iterations. No history rewriting."
  Findings: "Preflight clean main/direct at591977974bc293184f5463d7398ae869ef4de996. Previous goal turn progress:iteration66 semantic9318359f and leaf,parent closure/evidence recorded. User standing goal authorizes coherent constructor/registration refactor. Native text ctor starts mpNumRule null and stores required hidden flag;rootctor accepts rule and falseflag. Current merged text/optional-rule API lacksflag,registers every real record,factory/root/shown callsites differ.78existing direct/inherited ctor calls in29files,including7explicit text-rule test fixture calls. Full redline root/layout/selector/destructor/final-const obligations remain separately unverified."
id_source: "generated"
---
## Summary

Restore the complete selected SwNodeNum constructor family and hidden-redline registration lifecycle from pinned LibreOffice. Iteration67 under active C9TN6M; full redline root arrays/layout/browser lifetime remain unproven.

## Scope

Approved semantic candidates: apps/office/src/sw/source/core/txtnode/direct-attribute-lifecycle.test.ts; apps/office/src/sw/source/core/txtnode/node-numbering-lifecycle.test.ts; apps/office/src/sw/source/core/txtnode/numbering-notification-policy.test.ts; apps/office/src/sw/source/core/txtnode/ndtxt.ts; apps/office/src/sw/source/core/txtnode/number-classification.test.ts; apps/office/src/sw/source/core/doc/DocumentListItemsManager.test.ts; apps/office/src/sw/source/core/doc/list.test.ts; apps/office/src/sw/source/core/doc/list.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-validity.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-insertion-order.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-phantoms.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-vector.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-removal.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-contract.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-document-context.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNodeNum-start-value.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-container.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-prefix.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-children.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-state.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-root.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-vector-ownership.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-helper-contracts.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-counting-contract.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-lifecycle.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-notification-access.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNumberTree-policy.test.ts; apps/office/src/sw/source/core/SwNumberTree/SwNodeNum.ts; apps/office/src/sw/source/core/SwNumberTree/SwNodeNum-construction.test.ts; docs/program/source-provenance.json; docs/program/parity/runtime-inventory.json. Three production owners only:SwNodeNum constructor/privateflag/PreAdd/PostRemove/Create,SwList root creation,SwTextNode shown creation. Existing caller test changes mechanically adapt constructor args; preserve old matcher/literal AST. Existing test fixtures with explicit prebound text-rule arguments may bind via actual ChangeNumRule or controlled text-rule lookup, documenting fixture state integrity. Metadata exactly3existing narrow rows each;no classifications/status/defaults/omissions/deviations/IO/recovery/gate promotion. No source/helper/native executable/Python files in Agentplane;bounded hashes/logs/outcomes only.

## Plan

1. Manually inspect/hash pinned constructor declarations/defaults/factory/registration/removal and shown/hidden callsites; inventory all78existing constructors without storing scripts/source. 2. Add owned overload/privateflag/type tests and real rule/text/root/phantom registration scenarios,prove baseline constructor and hidden-client mismatches. 3. Replace merged API with native required text+bool and rule-only overloads,retain native null text-rule and false no-text flag,implement full selected PreAdd/PostRemove hidden suppression,adapt production and existing test callers without compatibility shim. 4. Preserve prior assertions/counter bodies and narrow metadata;vendor-absent focused tests,full npm verify and policy/doctor/integrity checks,exact semantic-SHA quality,clean leaf closure. Parent/full goal remain active.

## Verify Steps

1. Fresh manual pinned file hashes/declarations/defaults/PreAdd/PostRemove/Create and ndtxt/list callsites inspection;no native execution or source/helper artifacts. Final authored owned baseline fails native overload/privateflag/runtime registration tests and typechecking; corrected tests/types pass.
2. Assert required text+bool versus required nullable rule-pointer overloads,reject old text-only/text+rule/no-arg forms,no public flag/setters,initial text rule absent,root flagfalse,factory retaining rule and resetting no-text flagfalse. Real shown/hidden records bind before insertion,shown adds rule then document registry,hidden suppresses both;remove registry before rule and clear bound rule,hidden removal preserves existing shown clients/registry. Cover no rule,no text,non-document nodes,raw counters/topology,reading suppression and actual production caller modes;ChangeNumRule existing native policy unchanged. Owned diagnostic fixtures do not certify complete hidden root selection/redline/layout/client destruction.
3. Existing matcher/literal AST values unchanged despite constructor syntax;all unaffected test files and unrelated method bodies byte-identical. Three narrowly changed metadata rows each with all non-evidence fields/order preserved. Focused core number/doc/text plus boundary/resource tests pass vendor absent/restored exact pin in finally. Ignored-inclusive Agentplane tasks/tmp prohibited source/helper/executable/Python count0.
4. npm run verify passes every gate including both100percent coverage and browser tests. ap doctor stays0errors/2existingwarnings;policy routing and diffcheck pass. Record canonical verification,actual semantic-SHA EVALUATOR review and clean leaf closure;parent/full module/goal remain open.

## Verification

Pending exact final authored baseline,implementation and terminal check evidence. No claim of full hidden/original root arrays,layout/redline/const/final/destructor/browser lifetimes.

## Rollback Plan

Revert only this leaf semantic commit;retain task evidence and prior iterations. No history rewriting.

## Findings

Preflight clean main/direct at591977974bc293184f5463d7398ae869ef4de996. Previous goal turn progress:iteration66 semantic9318359f and leaf,parent closure/evidence recorded. User standing goal authorizes coherent constructor/registration refactor. Native text ctor starts mpNumRule null and stores required hidden flag;rootctor accepts rule and falseflag. Current merged text/optional-rule API lacksflag,registers every real record,factory/root/shown callsites differ.78existing direct/inherited ctor calls in29files,including7explicit text-rule test fixture calls. Full redline root/layout/selector/destructor/final-const obligations remain separately unverified.
