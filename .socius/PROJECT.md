# Project

The publication repository for Cavatina Solutions' public JSON Schemas. Each producing domain owns its definitions; for Socius, that source of truth is the Socius project. What needs doing is in
`WORK-ITEMS.md`; what has been noticed and might be a problem is in `CONCERNS.md`.

---

## Purpose

So that any system, product or domain at Cavatina that publishes a schema — for internal teams,
partners or external consumers — publishes it in one place, under one set of rules, at a URL that
can be referenced and relied on.

## Premise

A schema's path in this repo is its path on `https://schemas.cavatinasolutions.com/`, and its `$id`
is that URL. Files are served as they are, with no build step in this repository, so what is reviewed here is exactly
what consumers fetch. Domain-owned pipelines may generate or synchronize files into this repository before review and publication.

A published URL is a contract. Only the major version is a URL; minors are edited in place and may
only ever accept more than before, so a consumer pinned to `v1` keeps validating what it validated.
A breaking change is a new file beside the old one, never an edit to it.

The rules that can be checked mechanically are checked by `scripts/verify.ts` rather than by review.

## Domain modeling

The Socius domain describes how an organization operates: what it knows, believes, chooses,
requires, and does. Engineering is the initial and primary use case, but the underlying
artifact concepts are not inherently limited to software development.

The schemas publish the documented domain model, not an independent exercise in data formatting. Socius owns its domain definitions and resolver behavior; this repository owns publication and contract-integrity checks.
Understanding how humans and AI teammates find, interpret, and apply organizational practices
is part of discovering and refining that model. A new teammate should be able to understand
which practices govern their work, why they are relevant, and how specialized practices relate
to broader ones without knowing the internals of a particular Socius implementation.

Domain design therefore includes the information and relationships needed for retrieval,
applicability, and resolution. For example, scoped artifacts declare their organization,
project, stack, and sub-stack; Standards also provide category-based retrieval and
explicit expectation inheritance. Natural-language applicability conditions can require human
or agent judgment. These distinctions must be documented clearly enough that different
consumers can apply the same domain rules.

Implementation experience, including the transitional Socius tooling and the HWC, is valuable
evidence for refining the model. Neither existing schemas nor a particular implementation
should be treated as unquestionable constraints when real usage exposes a mismatch.

## What it does

- Holds one top-level folder per domain, each with an `index.md` explaining its schemas. `socius/`
  is the only domain so far: contracts for the organizational practices and contextual artifacts used by Socius.
- Verifies every schema on every pull request and push to `main`: it parses, it is Draft 2020-12,
  it compiles with every `$ref` resolving locally, its `$id` mirrors its path, its `$comment`
  carries a minor that agrees with its filename, and its domain has an `index.md`.

## Requirements and acceptance criteria

- **Every schema is YAML and a valid Draft 2020-12 document.**
- **Every `$id` is the file's published URL**, and every cross-schema `$ref` is an absolute URL
  against the published domain.
- **A published major keeps resolving to a compatible contract.** Earlier majors stay published.
  A domain that declares itself pre-stable in its `index.md` is exempt until it says otherwise.
- **`make verify` passes**, locally and in CI.
- **Artifact contracts express meaningful domain distinctions**, including the metadata and relationships needed to find and apply relevant practices.
- **Retrieval and resolution semantics are documented** where they affect the meaning or use of artifacts, independently of any particular consumer implementation.

## Assumptions

- **Schemas are fetched rather than vendored.** A consumer holding a stale copy of `v1` behaves as
  though pinned to an old minor, and starts rejecting documents that use newer optional properties.
- **Consumers resolve `$ref`s against these URLs**, or register every schema first the way the
  verifier does. Anything that does neither tries to fetch over the network.
- **Referential integrity between artifacts is the consumer's to check.** IDs linking one Socius
  artifact to another are plain strings that no schema can resolve.

## Scope

- **In scope:** modeling artifact types, their fields, relationships, constraints, and the
  domain semantics for identifying, retrieving, composing, and applying them. These semantics
  must be understandable to human contributors as well as AI agents.
- **In scope:** revising models in response to real examples and implementation experience;
  modeling and testing how a practice is used are complementary activities.
- **Out of scope:** authoring or maintaining the practice instances themselves; those live in
  their owning repositories, including Cavatina Practices.
- **Out of scope:** implementing a Socius resolver, agent orchestration, a validator SDK, or
  other consumer tooling. Their needs inform these contracts, but their implementations live
  elsewhere.
- **Out of scope:** replacing ticketing, planning, or other operational systems simply because
  Socius artifacts can reference them.
- No build or generated output. What is committed is what is served.

## Deviations

None.
