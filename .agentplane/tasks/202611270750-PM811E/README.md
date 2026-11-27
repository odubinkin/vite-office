---
id: "202611270750-PM811E"
title: "Persist Writer Navigator content view and per-category natural ordering"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 5
origin:
  system: "manual"
depends_on: []
tags:
  - "navigator"
  - "writer"
task_kind: "code"
mutation_scope: "code"
verify:
  - "Run focused Navigator and configuration Vitest tests and Chromium Navigator scenarios. Check per-category numeric order, flat sorted headings, identity retention and persistent root and sort state. Run TypeScript, production build, scoped lint, dependencies, source tree, Writer resources and provenance."
plan_approval:
  state: "approved"
  updated_at: "2026-11-27T07:51:10.730Z"
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
    body: "Start: continue direct-mode task in current checkout."
events:
  -
    type: "status"
    at: "2026-11-27T07:51:42.238Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-27T07:51:42.238Z"
doc_updated_by: "CODER"
description: "Connect native Navigator Display Alphabetically and Content Navigation View settings for represented categories. Persist native RootType and SortAlphabeticallyBlock, preserve stable item identities, flatten the sorted outline and admit matching native context actions."
sections:
  Summary: |-
    Persist Writer Navigator content view and per-category natural ordering

    Connect native Navigator Display Alphabetically and Content Navigation View settings for represented categories. Persist native RootType and SortAlphabeticallyBlock, preserve stable item identities, flatten the sorted outline and admit matching native context actions.
  Scope: |-
    - In scope: Connect native Navigator Display Alphabetically and Content Navigation View settings for represented categories. Persist native RootType and SortAlphabeticallyBlock, preserve stable item identities, flatten the sorted outline and admit matching native context actions.
    - Out of scope: unrelated refactors not required for "Persist Writer Navigator content view and per-category natural ordering".
  Plan: "Confirm via both graphs and pinned source the ContentTypeId ordinals, natural sort, flat sorted outline and context admission. Extend SwNavigationConfig with RootType and SortAlphabeticallyBlock, preserving unrelated category bits. Connect content navigation state and browser sorting using the native tree/model ownership and Intl.Collator. Keep sorting a presentation operation and hide the native contextual heading commands in the sorted outline. Add focused order, identity, root and preference tests and record verification before refreshing Graphify."
  Verify Steps: "Run targeted Writer Navigator, storage and shared popup Vitest tests and Chromium Navigator scenarios. Verify per-category natural order, flat outline, context admission, retaining selection and reloading root and sort settings. Run TypeScript, production build, scoped ESLint and Prettier, dependency, Writer resources, source tree and scoped provenance."
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

Persist Writer Navigator content view and per-category natural ordering

Connect native Navigator Display Alphabetically and Content Navigation View settings for represented categories. Persist native RootType and SortAlphabeticallyBlock, preserve stable item identities, flatten the sorted outline and admit matching native context actions.

## Scope

- In scope: Connect native Navigator Display Alphabetically and Content Navigation View settings for represented categories. Persist native RootType and SortAlphabeticallyBlock, preserve stable item identities, flatten the sorted outline and admit matching native context actions.
- Out of scope: unrelated refactors not required for "Persist Writer Navigator content view and per-category natural ordering".

## Plan

Confirm via both graphs and pinned source the ContentTypeId ordinals, natural sort, flat sorted outline and context admission. Extend SwNavigationConfig with RootType and SortAlphabeticallyBlock, preserving unrelated category bits. Connect content navigation state and browser sorting using the native tree/model ownership and Intl.Collator. Keep sorting a presentation operation and hide the native contextual heading commands in the sorted outline. Add focused order, identity, root and preference tests and record verification before refreshing Graphify.

## Verify Steps

Run targeted Writer Navigator, storage and shared popup Vitest tests and Chromium Navigator scenarios. Verify per-category natural order, flat outline, context admission, retaining selection and reloading root and sort settings. Run TypeScript, production build, scoped ESLint and Prettier, dependency, Writer resources, source tree and scoped provenance.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

- Revert task-related commit(s).
- Re-run required checks to confirm rollback safety.

## Findings
