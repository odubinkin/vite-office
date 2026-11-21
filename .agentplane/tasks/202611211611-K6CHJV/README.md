---
id: "202611211611-K6CHJV"
title: "Configure Graphify as the default repository context"
status: "DOING"
priority: "med"
owner: "CODER"
revision: 7
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
  state: "ok"
  updated_at: "2026-11-21T16:21:16.392Z"
  updated_by: "CODER"
  note: "Graphify 0.9.114 built a code-only index with 58,159 nodes and 224,460 edges. CLI queries for SwDoc and ScDocument returned the exact source files and lines. Routing, ignore rules, package dependencies, README formatting, and git diff checks passed. AgentPlane doctor passed with the existing managed hook shim warning."
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
  -
    type: "verify"
    at: "2026-11-21T16:21:16.392Z"
    author: "CODER"
    state: "ok"
    note: "Graphify 0.9.114 built a code-only index with 58,159 nodes and 224,460 edges. CLI queries for SwDoc and ScDocument returned the exact source files and lines. Routing, ignore rules, package dependencies, README formatting, and git diff checks passed. AgentPlane doctor passed with the existing managed hook shim warning."
doc_version: 3
doc_updated_at: "2026-11-21T16:21:16.448Z"
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
    ### 2026-11-21T16:21:16.392Z — VERIFY — ok

    By: CODER

    Note: Graphify 0.9.114 built a code-only index with 58,159 nodes and 224,460 edges. CLI queries for SwDoc and ScDocument returned the exact source files and lines. Routing, ignore rules, package dependencies, README formatting, and git diff checks passed. AgentPlane doctor passed with the existing managed hook shim warning.
    Attempts: 0

    VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T16:12:01.181Z, excerpt_hash=sha256:01fd2c5bc116723812f968d646a19318c656e1799d7084fc5925f12f1254e02a

    Details:

    Commands: graphify extract . --code-only --max-workers 4; graphify query SwDoc --budget 1000; graphify query ScDocument --budget 1000; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git check-ignore; prettier --check README.md; uv pip check. Scope: AGENTS.md, README.md, .graphifyignore, .gitignore, and .dockerignore. Canonical links: README.md links to the upstream Graphify repository and the new repository context section in AGENTS.md.

    BlueprintSnapshotRef:
    - state: current
    - path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211611-K6CHJV/blueprint/resolved-snapshot.json
    - old_digest: 25259f2ed92987d9327217c0ab4b5298ff48b7470d90bdefaebfbd4b5ca60555
    - current_digest: 25259f2ed92987d9327217c0ab4b5298ff48b7470d90bdefaebfbd4b5ca60555
    - route_changed: no
    - safe_command: agentplane blueprint snapshot 202611211611-K6CHJV

    DecisionContextRef:
    - operator_action: run_exact_argv
    - can_execute_now: true
    - safe_command: agentplane task verify-show 202611211611-K6CHJV
    - diagnostic_command: none
    - source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
    - freshness: route=computed_local remote=remote_skipped
    - repeat_allowed: false
    - repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
    - risks: none

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
### 2026-11-21T16:21:16.392Z — VERIFY — ok

By: CODER

Note: Graphify 0.9.114 built a code-only index with 58,159 nodes and 224,460 edges. CLI queries for SwDoc and ScDocument returned the exact source files and lines. Routing, ignore rules, package dependencies, README formatting, and git diff checks passed. AgentPlane doctor passed with the existing managed hook shim warning.
Attempts: 0

VerifyStepsRef: doc_version=3, doc_updated_at=2026-11-21T16:12:01.181Z, excerpt_hash=sha256:01fd2c5bc116723812f968d646a19318c656e1799d7084fc5925f12f1254e02a

Details:

Commands: graphify extract . --code-only --max-workers 4; graphify query SwDoc --budget 1000; graphify query ScDocument --budget 1000; node .agentplane/policy/check-routing.mjs; ap doctor; git diff --check; git check-ignore; prettier --check README.md; uv pip check. Scope: AGENTS.md, README.md, .graphifyignore, .gitignore, and .dockerignore. Canonical links: README.md links to the upstream Graphify repository and the new repository context section in AGENTS.md.

BlueprintSnapshotRef:
- state: current
- path: /Users/odubinkin/Projects/vite-office/.agentplane/tasks/202611211611-K6CHJV/blueprint/resolved-snapshot.json
- old_digest: 25259f2ed92987d9327217c0ab4b5298ff48b7470d90bdefaebfbd4b5ca60555
- current_digest: 25259f2ed92987d9327217c0ab4b5298ff48b7470d90bdefaebfbd4b5ca60555
- route_changed: no
- safe_command: agentplane blueprint snapshot 202611211611-K6CHJV

DecisionContextRef:
- operator_action: run_exact_argv
- can_execute_now: true
- safe_command: agentplane task verify-show 202611211611-K6CHJV
- diagnostic_command: none
- source_of_truth: route=task_next_action diagnostic=task_next_action remote=not_checked
- freshness: route=computed_local remote=remote_skipped
- repeat_allowed: false
- repeat_stop_condition: do not repeat task verify-show; complete the approved semantic work and verification before recomputing the route
- risks: none

<!-- END VERIFICATION RESULTS -->

## Rollback Plan

Revert the integration commit. The ignored environment and graph can be removed independently.

## Findings
