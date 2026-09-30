---
id: "202609301804-02N2JC"
title: "Restore native per-tab XML context ownership"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
origin:
  system: "manual"
depends_on: []
tags:
  - "code"
verify: []
plan_approval:
  state: "approved"
  updated_at: "2026-09-30T18:06:36.917Z"
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
    body: "Start: restore native per-tab context/value ownership with unchanged metrics/defaults/selection and package evidence."
events:
  -
    type: "status"
    at: "2026-09-30T18:06:37.388Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: restore native per-tab context/value ownership with unchanged metrics/defaults/selection and package evidence."
doc_version: 3
doc_updated_at: "2026-09-30T18:06:37.388Z"
doc_updated_by: "CODER"
description: "Child of C9TN6M. Move one-tab data and parsing into SvxXMLTabStopContext_Impl; store and return leaf contexts, select through getTabStop. Preserve verified metrics/defaults/selection and existing descendant ignore semantics. Broader null-context dispatcher parity remains open."
sections:
  Summary: |-
    Restore native per-tab XML context ownership

    Child of C9TN6M. Move one-tab data and parsing into SvxXMLTabStopContext_Impl; store and return leaf contexts, select through getTabStop. Preserve verified metrics/defaults/selection and existing descendant ignore semantics. Broader null-context dispatcher parity remains open.
  Scope: "Only xmloff/source/style/xmltabi.ts, sw/source/filter/xml/odt-property-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task evidence. Leaf context owns parsing and value, parent stores/returns leaf contexts and selects via getTabStop. Preserve all existing tab defaults, native MM100 conversion and Default selection; keep current descendant ignore behavior. Global null-context dispatcher contract is a separately recorded audit gap, without an intentional-deviation claim. Registered save/open/recovery decisions excluded."
  Plan: "Restore native per-tab data/context responsibility using internal SvxXMLTabStopContext_Impl with getTabStop. Move the existing initializer unchanged, store and return those leaf contexts, and select their values at container close. Use the existing ignore-context adapter to preserve native subtree-skipping outcomes under the current dispatcher; broader null-handler dispatch remains separately unverified. Add meaningful nested-subtree ODT cycle evidence, record AST/source comparison, update narrow mappings, run all required checks and close leaf."
  Verify Steps: "1. Compare leaf constructor/value getter and parent reference creation/storage/selection with pinned xmltabi.cxx; compare native xmlictxt null-child behavior plus fastparser null-subtree skipping to current dispatcher and record remaining adaptation honestly. 2. AST comparison proves moved tab value initializer and source-order selection predicates unchanged. 3. Focused ODT cases continue to verify defaults/MM100/selection; add real direct/inherited package cycle evidence that nested known/unknown leaf subtrees cannot mutate or append tab values or document text. 4. npm run verify, ap doctor, routing and diff checks pass. Review scoped changes and leave wider module parity unverified."
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the task implementation commit if leaf-context lifecycle changes cause a verified regression; preserve unrelated parity fixes."
  Findings: ""
id_source: "generated"
---
## Summary

Restore native per-tab XML context ownership

Child of C9TN6M. Move one-tab data and parsing into SvxXMLTabStopContext_Impl; store and return leaf contexts, select through getTabStop. Preserve verified metrics/defaults/selection and existing descendant ignore semantics. Broader null-context dispatcher parity remains open.

## Scope

Only xmloff/source/style/xmltabi.ts, sw/source/filter/xml/odt-property-roundtrip.test.ts, runtime-inventory.json, source-provenance.json and task evidence. Leaf context owns parsing and value, parent stores/returns leaf contexts and selects via getTabStop. Preserve all existing tab defaults, native MM100 conversion and Default selection; keep current descendant ignore behavior. Global null-context dispatcher contract is a separately recorded audit gap, without an intentional-deviation claim. Registered save/open/recovery decisions excluded.

## Plan

Restore native per-tab data/context responsibility using internal SvxXMLTabStopContext_Impl with getTabStop. Move the existing initializer unchanged, store and return those leaf contexts, and select their values at container close. Use the existing ignore-context adapter to preserve native subtree-skipping outcomes under the current dispatcher; broader null-handler dispatch remains separately unverified. Add meaningful nested-subtree ODT cycle evidence, record AST/source comparison, update narrow mappings, run all required checks and close leaf.

## Verify Steps

1. Compare leaf constructor/value getter and parent reference creation/storage/selection with pinned xmltabi.cxx; compare native xmlictxt null-child behavior plus fastparser null-subtree skipping to current dispatcher and record remaining adaptation honestly. 2. AST comparison proves moved tab value initializer and source-order selection predicates unchanged. 3. Focused ODT cases continue to verify defaults/MM100/selection; add real direct/inherited package cycle evidence that nested known/unknown leaf subtrees cannot mutate or append tab values or document text. 4. npm run verify, ap doctor, routing and diff checks pass. Review scoped changes and leave wider module parity unverified.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the task implementation commit if leaf-context lifecycle changes cause a verified regression; preserve unrelated parity fixes.

## Findings
