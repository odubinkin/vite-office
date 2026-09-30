---
id: "202609301526-CHAQ5Y"
title: "Align paragraph margin item source ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T15:27:12.778Z"
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
    body: "Start: perform the approved single source-owner correction for existing frame margin and spacing items, preserving class bodies and behavior."
events:
  -
    type: "status"
    at: "2026-09-30T15:27:13.440Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: perform the approved single source-owner correction for existing frame margin and spacing items, preserving class bodies and behavior."
doc_version: 3
doc_updated_at: "2026-09-30T15:27:13.440Z"
doc_updated_by: "CODER"
description: "One bounded architecture correction under approved iterative upstream audit: move the four existing frame-owned margin and spacing item classes to editeng/source/items/frmitems.ts, update all direct consumers and test ownership, and align provenance/inventory data without changing behavior or validators."
sections:
  Summary: |-
    Align paragraph margin item source ownership

    One bounded architecture correction under approved iterative upstream audit: move the four existing frame-owned margin and spacing item classes to editeng/source/items/frmitems.ts, update all direct consumers and test ownership, and align provenance/inventory data without changing behavior or validators.
  Scope: "One source-owner refactor: new editeng/source/items/frmitems.ts and frmitems.test.ts; existing paraitem.ts and textitem.test.ts; the twenty discovered direct consumers of the four moved classes; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. All class bodies and observable runtime behavior remain unchanged. Inventory tooling and conscious save/open/recovery deviations are excluded."
  Plan: "Approved iterative goal permits this single architecture fix. CODER moves unchanged SvxTextLeftMarginItem, SvxFirstLineIndentItem, SvxRightMarginItem and SvxULSpaceItem from editeng/source/items/paraitem.ts into new frmitems.ts (their pinned C++ owner); no forwarding export. Update all twenty current consumers under sw browser/editor, browser/presentation, inc/poolfmt.test.ts, source/filter/xml, source/core/txtnode/ndtxt.ts, core/text/txtfrm.ts, core/attr/swatrset.ts, core/doc/poolfmt-defaults.ts and writer-attributes.test.ts, core/layout/newfrm.test.ts, uibase/shells/textsh1.ts, uibase/wrtsh tests, and editeng/source/items/textitem.test.ts. Move existing frame assertions into new frmitems.test.ts; leave character and line-spacing logic unchanged. Update only data in runtime-inventory.json and source-provenance.json for the new module and relocated evidence. Full focused and repository verification, doctor/routing, recorded review and clean deterministic close. Preserve all product exceptions; no network, inventory schemas/generators/validators, policy, or unrelated runtime changes."
  Verify Steps: "1. Compare the four moved class bodies with pre-change paraitem.ts and confirm exact pinned frmitems.cxx ownership; no forwarding export or stale paraitem imports of the moved symbols remains. 2. Run focused EditEngine item tests and Writer pool default/attribute/ODT/ruler tests to retain signed values, clone/equality, item codec and paragraph behavior. 3. npm run verify passes format, lint, type, dependency, resources, 100% app/inventory coverage, browser, static, docs, size, source-tree, provenance, invariants and parity gates. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff is limited to declared ownership refactor and final git status is clean."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: |-
    - Revert task-related commit(s).
    - Re-run required checks to confirm rollback safety.
  Findings: ""
id_source: "generated"
---
## Summary

Align paragraph margin item source ownership

One bounded architecture correction under approved iterative upstream audit: move the four existing frame-owned margin and spacing item classes to editeng/source/items/frmitems.ts, update all direct consumers and test ownership, and align provenance/inventory data without changing behavior or validators.

## Scope

One source-owner refactor: new editeng/source/items/frmitems.ts and frmitems.test.ts; existing paraitem.ts and textitem.test.ts; the twenty discovered direct consumers of the four moved classes; docs/program/parity/runtime-inventory.json and docs/program/source-provenance.json; canonical task artifacts. All class bodies and observable runtime behavior remain unchanged. Inventory tooling and conscious save/open/recovery deviations are excluded.

## Plan

Approved iterative goal permits this single architecture fix. CODER moves unchanged SvxTextLeftMarginItem, SvxFirstLineIndentItem, SvxRightMarginItem and SvxULSpaceItem from editeng/source/items/paraitem.ts into new frmitems.ts (their pinned C++ owner); no forwarding export. Update all twenty current consumers under sw browser/editor, browser/presentation, inc/poolfmt.test.ts, source/filter/xml, source/core/txtnode/ndtxt.ts, core/text/txtfrm.ts, core/attr/swatrset.ts, core/doc/poolfmt-defaults.ts and writer-attributes.test.ts, core/layout/newfrm.test.ts, uibase/shells/textsh1.ts, uibase/wrtsh tests, and editeng/source/items/textitem.test.ts. Move existing frame assertions into new frmitems.test.ts; leave character and line-spacing logic unchanged. Update only data in runtime-inventory.json and source-provenance.json for the new module and relocated evidence. Full focused and repository verification, doctor/routing, recorded review and clean deterministic close. Preserve all product exceptions; no network, inventory schemas/generators/validators, policy, or unrelated runtime changes.

## Verify Steps

1. Compare the four moved class bodies with pre-change paraitem.ts and confirm exact pinned frmitems.cxx ownership; no forwarding export or stale paraitem imports of the moved symbols remains. 2. Run focused EditEngine item tests and Writer pool default/attribute/ODT/ruler tests to retain signed values, clone/equality, item codec and paragraph behavior. 3. npm run verify passes format, lint, type, dependency, resources, 100% app/inventory coverage, browser, static, docs, size, source-tree, provenance, invariants and parity gates. 4. ap doctor and node .agentplane/policy/check-routing.mjs pass; diff is limited to declared ownership refactor and final git status is clean.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
