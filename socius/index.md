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

## The base artifact

`socius-artifact` defines the properties common to every Socius artifact:

- `schema` — identifies the artifact's contract and version
- `id` — stable unique identifier
- `title` — human-readable title
- `summary` — a concise overview of the artifact, **not** its full content

It's abstract — nothing declares itself a `socius-artifact`. Every concrete type extends it, so these properties stay defined in one place rather than being repeated in every schema.

## Artifact types

| Type | Role |
| --- | --- |
| `socius-principle-core` | Enduring, company-wide engineering principles |
| `socius-principle-derived` | Domain-scoped principles built on core ones (`derived_from`) |
| `socius-operating-context` | Dated, measurement-backed snapshots of the current environment |
| `socius-strategy` | Intentional engineering direction, guided by principles and operating context |
| `socius-goal` | A concrete outcome under a `parent_strategy`, with `success_criteria` |
| `socius-decision` | A specific choice, with `options_considered`, `rationale`, and `consequences` |
| `socius-standard` | A single enforceable `rule`, with `apply_when` / `do_not_apply_when` |
| `socius-guidance` | Explanatory support for exactly one standard (`supports_standard`) |
| `socius-jargon` | Canonical terms and their definitions |
| `socius-toolchain` | Required tools, version policy, and permitted exceptions |

Each defines the structure unique to its kind of knowledge — a principle has a `statement`, an operating context entry carries `measurements`, a decision records a `decision` and its `rationale`, a standard defines a `rule`.

Roughly upstream to downstream: principles and operating context feed strategy; strategy drives goals and decisions; decisions produce standards; standards get guidance.

## Composition

Each concrete type:

1. `allOf`-refs `socius-artifact` by its canonical `$id`
2. re-declares `schema` as a `const` — e.g. `socius-decision/v1`
3. adds its own `required` and `properties`
4. closes with `unevaluatedProperties: false`

`unevaluatedProperties` is deliberate and load-bearing. It rejects unknown keys while still allowing the inherited base properties through the `allOf`. Using `additionalProperties: false` here would reject every inherited property instead — keep the pattern when adding a type.

## Identifying an artifact

An artifact declares its contract through `schema`:

```yaml
schema: socius-principle-core/v1
```

That identifier names both the artifact type and the version of its contract, so a consumer can resolve the right schema and validate against it. The base constrains the format to `^socius-[a-z0-9-]+/v[0-9]+$`, and each type pins its own exact value — so `schema` is also the discriminator that tells you which type you're holding.

## Linking is by ID, not `$ref`

Fields like `guided_by_principles`, `derived_from`, `parent_strategy`, `supports_standard`, `informed_by_operating_context`, `resulting_standards`, and `supersedes` / `superseded_by` hold the plain `id` of another artifact as a string.

JSON Schema can't check that those IDs resolve, so **referential integrity is a consumer-side concern**. Nothing here catches a dangling reference, and back-links — `derived_principles` on a core principle versus `derived_from` on the derived one — have to be kept in sync by hand.

## Supersession over editing

The time-varying types — `socius-strategy`, `socius-goal`, `socius-decision`, `socius-operating-context` — carry `supersedes` / `superseded_by`, plus `re_evaluate_when` or `reconsider_when` to record what should trigger a revisit.

History is expressed by **superseding a prior artifact, not by editing it in place**. An artifact records what was true and believed when it was written; changing it retroactively destroys that record.

This is a different mechanism from schema versioning: superseding replaces an *artifact*, a new `v<N>.yaml` replaces a *contract*. See [Versioning](../README.md#versioning).

## Ownership

Owned by Cavatina Solutions and its Socius Team. Changes go through PR review on this repository.

## Conventions

- Artifact type names are prefixed `socius-`, matching the `schema` discriminator.
- A new artifact type is a new folder here plus a row in the table above.
- Schema design should reflect the ontology of the engineering knowledge being represented — not the behavior of any particular Socius agent, workflow, or consumer.
