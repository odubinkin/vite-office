---
id: "202611211611-K6CHJV"
title: "Configure Graphify as the default repository context"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 6
origin:
  system: "manual"
depends_on: []
tags:
  - "docs"
verify:
  - "Query the local Graphify index for a vite-office code symbol and confirm its source location."
  - "ap doctor"
  - "node .agentplane/policy/check-routing.mjs"
plan_approval:
  state: "approved"
  updated_at: "2026-11-21T16:11:56.942Z"
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
    at: "2026-11-21T16:12:01.181Z"
    author: "CODER"
    from: "TODO"
    to: "DOING"
    note: "Start: continue direct-mode task in current checkout."
doc_version: 3
doc_updated_at: "2026-11-21T16:12:01.181Z"
doc_updated_by: "CODER"
description: "Install Graphify in a repository-local environment, build a local code graph, and route coding agents to it for code navigation."
sections:
  Summary: |-
    Configure Graphify as the default repository context

    Install Graphify in a repository-local environment, build a local code graph, and route coding agents to it for code navigation.
  Scope: |-
    - In scope: Install Graphify in a repository-local environment, build a local code graph, and route coding agents to it for code navigation.
    - Out of scope: unrelated refactors not required for "Configure Graphify as the default repository context".
  Plan: "Install the official Graphify CLI in a repository-local Python environment. Add local index scope and a query-first rule to AGENTS.md with a source fallback. Build the code-only graph, verify a real query and repository policy, and close the task."
  Verify Steps: |-
    1. Run node .agentplane/policy/check-routing.mjs, ap doctor, and git diff --check.
    2. Build the local Graphify code index, then query it for a vite-office symbol and verify the returned path against source.
    3. Check the AGENTS.md query-first rule and confirm the environment and generated index are ignored.
  Verification: |-
    <!-- BEGIN VERIFICATION RESULTS -->
    <!-- END VERIFICATION RESULTS -->
  Rollback Plan: "Revert the integration commit. The ignored environment and graph can be removed independently."
  Findings: ""
id_source: "generated"
---
## Summary

Configure Graphify as the default repository context

Install Graphify in a repository-local environment, build a local code graph, and route coding agents to it for code navigation.

## Scope

- In scope: Install Graphify in a repository-local environment, build a local code graph, and route coding agents to it for code navigation.
- Out of scope: unrelated refactors not required for "Configure Graphify as the default repository context".

## Plan

Install the official Graphify CLI in a repository-local Python environment. Add local index scope and a query-first rule to AGENTS.md with a source fallback. Build the code-only graph, verify a real query and repository policy, and close the task.

## Verify Steps

1. Run node .agentplane/policy/check-routing.mjs, ap doctor, and git diff --check.
2. Build the local Graphify code index, then query it for a vite-office symbol and verify the returned path against source.
3. Check the AGENTS.md query-first rule and confirm the environment and generated index are ignored.

## Verification

<!-- BEGIN VERIFICATION RESULTS -->
<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the integration commit. The ignored environment and graph can be removed independently.

## Findings
