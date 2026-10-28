# Socius

The Socius schemas define the structure and validation contracts for **engineering knowledge artifacts** — the principles, strategy, decisions, and standards a team accumulates, captured as machine-readable artifacts rather than prose scattered across docs and tickets.

What lives here is the contract: the shape an artifact must take to be created, validated, and consumed consistently. The artifacts themselves live wherever their authors keep them.

## Status

**Pre-stable — still being designed.** Until this section says otherwise, `v1` of every artifact type is a draft. It may change incompatibly in place rather than moving to `v2`, so don't rely on these `$id`s as settled contracts yet.

What's still open: which properties belong on which artifact type, and which of them are required. The base contract (`schema`, `id`, `title`, `summary`) and the relationships between types are settled.

Once this note is removed, the [versioning rules](../README.md#versioning) apply as written and breaking changes go to a new major.

## Layout

One folder per artifact type, with each major version as a file inside it — the layout recommended in the [root README](../README.md):

```
socius/<artifact-type>/v<N>.yaml
```

Each file's `$id` is its published URL, `https://schemas.cavatinasolutions.com/socius/<artifact-type>/v<N>.yaml`. Minor versions live inside the file rather than in the path — see [Versioning](../README.md#versioning).

## Base schemas

Two abstract schemas hold the properties shared across artifact types. Both are abstract — nothing declares itself as either one, and every concrete type extends one of them.

`socius-artifact` defines what every artifact carries, without exception:

- `schema` — identifies the artifact's contract and version
- `id` — stable unique identifier
- `title` — human-readable title
- `summary` — a concise overview of the artifact, **not** its full content

`socius-scoped-artifact` extends `socius-artifact` and adds the [scope fields](#scope). A type that carries scope extends this rather than the base directly, and so gets both sets of properties.

Neither base closes with `unevaluatedProperties`, and neither should. A base that closed itself would reject the properties its own extensions add — only concrete types close.

## Artifact types

| Type                       | Scoped | Role                                                                          |
| -------------------------- | :----: | ----------------------------------------------------------------------------- |
| `socius-principle-core`    |        | Foundational organizational beliefs                                 |
| `socius-principle-derived` |        | More specific enduring beliefs derived from Core Principles (`derived_from`)                       |
| `socius-operating-context` |   ✓    | Dated, measurement-backed snapshots of the current environment                |
| `socius-strategy`          |   ✓    | Intentional engineering direction, guided by principles and operating context |
| `socius-goal`              |   ✓    | A concrete outcome under a `parent_strategy`, with `success_criteria`         |
| `socius-decision`          |   ✓    | A specific choice, with `options_considered`, `rationale`, and `consequences` |
| `socius-standard`          |   ✓    | Authoritative expectations for a cohesive subject, with optional inheritance          |
| `socius-guidance`          |        | Explanatory support for exactly one standard (`supports_standard`)            |
| `socius-toolchain`         |   ✓    | Required tools, version policy, and permitted exceptions                      |
| `socius-term`              |   ✓    | A defined `term` and its `definition`                                         |
| `socius-alias`             |   ✓    | An alternate name that `resolves_to` another artifact                         |
| `socius-organization`      |        | A named organization and its `relationships` to other organizations           |
| `socius-person`            |        | A named person and their organizational `affiliations`                        |

### Principles and Standards

Principles express the organization's enduring beliefs and mindset. They establish the philosophical foundation for how the organization approaches its work without necessarily prescribing a particular implementation.

Standards establish authoritative expectations that contributors are required to follow within their applicable circumstances. They express specific, actionable requirements.

Principles may inform Standards, but a Standard does not require a corresponding Principle. The distinction is between **what the organization believes** and **what it requires contributors to do**.

Each defines the structure unique to its kind of knowledge — a principle has a `statement`, an operating context entry carries `measurements`, a decision records a `decision` and its `rationale`, a standard defines identifiable `expectations`.

Roughly upstream to downstream: principles and operating context feed strategy; strategy drives goals and decisions; decisions produce standards; standards get guidance.

The last four are **vocabulary**. `socius-term` and `socius-alias` record what a word means and what a shorthand expands to; `socius-organization` and `socius-person` name the entities those words refer to. They're knowledge like everything else here — the difference is structural. Every other type derives from something: strategy from principles, goals from strategy, standards from decisions. Vocabulary derives from nothing and feeds nothing. It's what the rest is written in terms of.

### Standards: authoring, retrieval, and inheritance

A Standard defines the organization's authoritative expectations for **one cohesive subject**. It may contain multiple related expectations, but it should not be an atomic lint rule or a catch-all document for everything about a technology. Split unrelated subjects into separate Standards.

Canonical Toolchain configurations own conventions they already express and enforce, such as formatting and lint rules. Standards do not duplicate those configurations in prose. Guidance can explain a Standard, while How-To material describes a task procedure; neither changes what the Standard requires.

**Retrieval starts with the scoped artifact dimensions.** A consumer uses `organization`, `project`, `stack`, and optional `sub_stack` to identify candidates, including broader shared/general records as relevant. A missing `sub_stack` denotes no narrower specialization. For Standards, the required `category` array adds taxonomy labels for retrieving relevant subjects; it is not a second stack or a substitute for scope. For example, general React expectations can use `stack: frontend`, `category: [react]` without a sub-stack, while a HubSpot specialization can use `stack: frontend`, `sub_stack: hubspot`, `category: [react]`. Retrieving general React expectations should not automatically bring in every specialized HubSpot record.

**Explicit inheritance is separate from retrieval.** A Standard may reference one parent by `extends_standard`. After retrieving a selected Standard, the consumer fetches its ancestors even if they are outside the initial category result. It resolves the chain from oldest ancestor to selected descendant. Each expectation has an `id` and a `statement`:

1. Begin with the ancestor's expectations.
2. Add each child expectation whose ID is new.
3. Replace the entire inherited expectation when the child's ID matches.
4. Repeat through the chain; the deepest descendant wins for any repeated ID.

This produces one resolved collection of expectations **before** an agent interprets or follows them. The consumer validates referenced parents, detects cycles and duplicate expectation IDs within a Standard, and must not silently resolve ambiguous or missing references. `related_standards` are informative links, not inheritance. `extends_standard` is specialization, not historical supersession; both parent and child remain current.

The schema supplies structure and relationships, while consumers implement retrieval against their known work context. Category membership alone never implies inheritance or automatic precedence. The authoring model does not require Standard-level `apply_when`, `do_not_apply_when`, or `exceptions`; qualifications intrinsic to an expectation belong in its statement, and separately authorized departures can be represented as Deviations.

## Scope

Most artifacts describe knowledge that applies somewhere in particular. `socius-scoped-artifact` defines the three fields that say where:

- `organization` — the `id` of a `socius-organization` artifact, or `shared`
- `project` — the ID of the project the artifact pertains to, or `shared`
- `stack` — the stack the artifact pertains to, or `general`
- `sub_stack` — optional narrower technology or platform within the stack (for example, `hubspot` under `frontend`)

The first three are required on every scoped type; `sub_stack` is optional. **The three base scope fields are always stated, never inferred from absence** — an artifact that applies everywhere says so with `shared` / `shared` / `general` rather than by leaving the fields out.

Only `organization` names a modeled artifact. `project` and `stack` are free strings whose values are a matter of consumer convention; nothing here enumerates the valid ones.

Scope is inherited and never redeclared: a type gets these fields by `allOf`-ref'ing `socius-scoped-artifact`, and no type defines them itself. Because concrete types close with `unevaluatedProperties: false`, the types that don't inherit scope can't carry it at all — an `organization` on a core principle is _rejected_, not ignored. Whether a kind of artifact can be scoped is therefore part of the contract, not a convention to be remembered.

The unscoped types are unscoped deliberately:

- `socius-principle-core` and `socius-principle-derived` — principles are what the company believes. They don't vary by organization, project, or stack.
- `socius-guidance` — supports exactly one standard and takes that standard's scope. Carrying its own would let the two drift.
- `socius-organization` and `socius-person` — identity records for the entities scope itself refers to. An organization isn't scoped to an organization; it _is_ one.

### Category is not scope

`socius-standard`, `socius-principle-derived`, and `socius-term` carry category-based taxonomy. For Standards, `category` is a nonempty array of labels; the other artifact types retain their own schema-defined shapes. Category groups artifacts for retrieval and says nothing by itself about where an artifact applies. A derived principle's `category` may well hold something stack-shaped in practice (`backend`, say), but no schema treats it as scope, and consumers shouldn't either.

## Composition

Each concrete type:

1. `allOf`-refs its base by canonical `$id` — `socius-scoped-artifact` if it carries scope, `socius-artifact` if it doesn't
2. re-declares `schema` as a `const` — e.g. `socius-decision/v1`
3. adds its own `required` and `properties`
4. closes with `unevaluatedProperties: false`

`unevaluatedProperties` is deliberate and load-bearing. It rejects unknown keys while still allowing inherited properties through the `allOf`, including those two levels up — a scoped type sees both its own properties and `socius-artifact`'s through `socius-scoped-artifact`. Using `additionalProperties: false` here would reject every inherited property instead. Keep the pattern when adding a type, and don't add it to a base.

## Identifying an artifact

An artifact declares its contract through `schema`:

```yaml
schema: socius-principle-core/v1
```

That identifier names both the artifact type and the version of its contract, so a consumer can resolve the right schema and validate against it. The base constrains the format to `^socius-[a-z0-9-]+/v[0-9]+$`, and each type pins its own exact value — so `schema` is also the discriminator that tells you which type you're holding.

## Linking is by ID, not `$ref`

Fields like `guided_by_principles`, `derived_from`, `parent_strategy`, `supports_standard`, `informed_by_operating_context`, `resulting_standards`, and `supersedes` / `superseded_by` hold the plain `id` of another artifact as a string. So do the vocabulary links — `socius-alias`'s `resolves_to.id`, `socius-person`'s `affiliations[].organization`, `socius-organization`'s `relationships[].organization` — and the `organization` scope field itself.

JSON Schema can't check that those IDs resolve, so **referential integrity is a consumer-side concern**. Nothing here catches a dangling reference, and back-links — `derived_principles` on a core principle versus `derived_from` on the derived one — have to be kept in sync by hand.

## Supersession over editing

The time-varying types — `socius-strategy`, `socius-goal`, `socius-decision`, `socius-operating-context` — carry `supersedes` / `superseded_by`, plus `re_evaluate_when` or `reconsider_when` to record what should trigger a revisit.

History is expressed by **superseding a prior artifact, not by editing it in place**. An artifact records what was true and believed when it was written; changing it retroactively destroys that record.

This is a different mechanism from schema versioning: superseding replaces an _artifact_, a new `v<N>.yaml` replaces a _contract_. See [Versioning](../README.md#versioning).

## Ownership

Owned by Cavatina Solutions and its Socius Team. Changes go through PR review on this repository.

## Conventions

- Artifact type names are prefixed `socius-`, matching the `schema` discriminator.
- A new artifact type is a new folder here, a row in the table above, and a decision about which base it extends.
- Schema design should reflect the ontology of the engineering knowledge being represented — not the behavior of any particular Socius agent, workflow, or consumer.
