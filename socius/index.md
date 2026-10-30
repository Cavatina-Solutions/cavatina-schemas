# Socius

The Socius schemas define the structure and validation contracts for **organizational practices and contextual artifacts** — the principles, strategies, decisions, standards, and other material that describe how an organization knows, chooses, and works.

What lives here is the published contract: the shape an artifact must take to be created, validated, and consumed consistently. **Socius owns the domain model and resolver behavior**; this repository distributes its schemas and checks their integrity. During the ownership transition these definitions remain editable drafts here, but once the Socius publishing pipeline is established they should be synchronized from the Socius source rather than independently maintained in both repositories. Artifact instances live wherever their authors keep them.

## Status

**Pre-stable — still being designed.** Until this section says otherwise, `v1` of every artifact type is a draft. It may change incompatibly in place rather than moving to `v2`, so don't rely on these `$id`s as settled contracts yet.

What's still open: which properties belong on which artifact type, and which of them are required. The shared identity fields (`schema`, `id`, `title`, `summary`) are established, while the inheritance and relationship contracts remain under review until stabilization.

Once this note is removed, the [versioning rules](../README.md#versioning) apply as written and breaking changes go to a new major.

## Layout

One folder per artifact type, with each major version as a file inside it — the layout recommended in the [root README](../README.md):

```
socius/<artifact-type>/v<N>.yaml
```

Each file's `$id` is its published URL, `https://schemas.cavatinasolutions.com/socius/<artifact-type>/v<N>.yaml`. Minor versions live inside the file rather than in the path — see [Versioning](../README.md#versioning).

## Base schemas

The base schemas hold the properties shared across artifact types. They are abstract — nothing declares itself as either one, and every concrete type extends one of them.

`socius-artifact` defines what every artifact carries, without exception:

- `schema` — identifies the artifact's contract and version
- `id` — stable unique identifier
- `title` — human-readable title
- `summary` — a concise overview of the artifact, **not** its full content
- `inherits` — optional ID of a parent artifact of the **same type**, using the [shared inheritance semantics](#artifact-inheritance)
- `validation_deferred` — optional boolean (default `false`) that allows full validation after inheritance rather than requiring the stored child to be complete; `true` requires `inherits`

`socius-scoped-artifact` extends `socius-artifact` and adds the [scope fields](#scope). A type that carries scope extends this rather than the base directly, and so gets both sets of properties.

Neither base closes with `unevaluatedProperties`, and neither should. A base that closed itself would reject the properties its own extensions add — only concrete types close.

## Artifact types

| Type                       | Scoped | Role                                                                          |
| -------------------------- | :----: | ----------------------------------------------------------------------------- |
| `socius-principle-core`    |        | Foundational organizational beliefs                                           |
| `socius-principle-derived` |        | More specific enduring beliefs derived from Core Principles (`derived_from`)  |
| `socius-operating-context` |   ✓    | Dated, measurement-backed snapshots of the current environment                |
| `socius-strategy`          |   ✓    | Intentional engineering direction, guided by principles and operating context |
| `socius-goal`              |   ✓    | A concrete outcome under a `parent_strategy`, with `success_criteria`         |
| `socius-decision`          |   ✓    | A specific choice, with `options_considered`, `rationale`, and `consequences` |
| `socius-standard`          |   ✓    | Authoritative expectations for a cohesive subject, with optional inheritance  |
| `socius-deviation`         |   ✓    | Documented, scoped departure from a Standard, optionally decision-backed      |
| `socius-guide`             |   ✓    | Instructions for accomplishing an activity, ordered by default                |
| `socius-way-of-working`    |   ✓    | Team collaboration, responsibilities, authority, and working agreements       |
| `socius-reference`         |   ✓    | Reusable factual information organized into named items                       |
| `socius-toolchain`         |   ✓    | Required tools, version policy, and permitted exceptions                      |
| `socius-term`              |   ✓    | A defined `term` and its `definition`                                         |
| `socius-alias`             |   ✓    | An alternate name that `resolves_to` a Term, Organization, Person, or Project |
| `socius-project`           |        | Project identity, purpose, foundational context, and associated resources     |
| `socius-organization`      |        | A named organization and its `relationships` to other organizations           |
| `socius-person`            |        | A named person and their organizational `affiliations`                        |

### Principles and Standards

Principles express the organization's enduring beliefs and mindset. They establish the philosophical foundation for how the organization approaches its work without necessarily prescribing a particular implementation.

Standards establish authoritative expectations that contributors are required to follow within their applicable circumstances. They express specific, actionable requirements.

Principles may inform Standards, but a Standard does not require a corresponding Principle. The distinction is between **what the organization believes** and **what it requires contributors to do**.

Each defines the structure unique to its kind of knowledge — a principle has a `statement`, an operating context entry carries `measurements`, a decision records a `decision` and its `rationale`, a standard defines identifiable `expectations`.

Roughly upstream to downstream: principles and operating context feed strategy; strategy drives goals and decisions; decisions produce standards; standards express the resulting expectations.

The Terminology artifact types are **vocabulary**. `socius-term` records what a word means, while `socius-alias` records an alternate name for a Term, Organization, Person, or Project; `socius-organization` and `socius-person` name the entities those words refer to. They're knowledge like everything else here — the difference is structural. Other artifact types can express domain-specific influences or parentage, but those relationships do not automatically imply inheritance. Vocabulary derives from nothing and feeds nothing. It's what the rest is written in terms of.

### Standards: authoring and retrieval

A Standard defines the organization's authoritative expectations for **one cohesive subject**. It may contain multiple related expectations, but it should not be an atomic lint rule or a catch-all document for everything about a technology. Split unrelated subjects into separate Standards.

A Standard may include an optional `rationale` explaining **why** its expectations exist and what the approach is intended to achieve. This is distinct from the expectations themselves (what contributors must do) and from optional `notes` (supplementary context). Unlike a Decision's rationale, which records why a particular choice was made among alternatives, a Standard's rationale explains the ongoing reasoning behind the established practice. It belongs to the Standard as a whole rather than being repeated for each expectation.

Canonical Toolchain configurations own conventions they already express and enforce, such as formatting and lint rules. Standards do not duplicate those configurations in prose. Guides describe task procedures rather than defining a Standard's expectations.

**Retrieval starts with the scoped artifact dimensions.** A consumer uses `organization`, `project`, `stack`, and `sub_stack` to identify candidates, including broader shared/general records as relevant. `sub_stack: general` denotes no narrower specialization. For Standards, the required `category` array adds taxonomy labels for retrieving relevant subjects; it is not a second stack or a substitute for scope. For example, general React expectations can use `stack: frontend`, `sub_stack: general`, `category: [react]`, while a HubSpot specialization can use `stack: frontend`, `sub_stack: hubspot`, `category: [react]`. Retrieving general React expectations should not automatically bring in every specialized HubSpot record.

**Specialization uses the universal `inherits` relationship.** Standards carry identified `expectations`, so a descendant can add or replace individual expectations using the [shared merge rules](#artifact-inheritance). `related_standards` remains associative only; it does not imply inheritance.

The schema supplies structure and relationships, while consumers implement retrieval against their known work context. Category membership alone never implies inheritance or automatic precedence. Standards may include optional `apply_when` conditions describing additional circumstances of applicability, such as work performed by an AI agent. These are natural-language conditions interpreted by the human or agent, not by the deterministic retrieval script. Standards do not have `do_not_apply_when` or `exceptions`; qualifications intrinsic to an expectation belong in its statement, and separately authorized departures are represented as Deviations.

### Deviations

A Deviation records a **documented departure** from an otherwise applicable Standard. It may be recorded before formal approval or a supporting Decision exists. It does not create a new general Standard, and it is not inherently temporary or defective. It is scoped through `organization`, `project`, `stack`, and `sub_stack`, so the departure can apply to a particular engagement or context without changing the underlying Standard.

Each Deviation identifies exactly one `standard` by ID and requires a `reason` and a nonempty `items` collection. Optional `backed_by_decision` identifies a Decision that supports or formalizes the departure. Each item has a stable `id` and `description` explaining the proposed or agreed alternative; an optional `expectation` identifies the specific expectation within the referenced Standard. This is a meaningful cross-type relationship, not inheritance. Optional `notes` capture additional context.

Determining what the organization expects in a given situation requires examining **both applicable Standards and applicable Deviations**. A Deviation does not erase the Standard; it identifies a documented departure within its scope. A Decision-backed Deviation has explicit supporting authority, but a missing Decision link alone does not establish whether it is approved or permitted; the organization's Ways of Working can define when formal approval is required. Projects and Standards do not need reverse lists of Deviations: the Deviation's scope and direct `standard` reference are sufficient to discover the relationship. The specific retrieval and negotiation workflow belongs in the [future implementation notes](../SOCIUS-FUTURE-NOTES.md).

### Guides

A Guide explains how to accomplish an activity rather than establishing authoritative expectations. It has an `objective` and identified, named `instructions` (each with `id`, `name`, and `instructions`); `is_ordered` defaults to `true`, meaning the sequence matters, and can be set to `false` for independently usable instructional elements. Optional `attachments` reference supporting materials. Guide instructions participate in the universal ID-based array merge: matching IDs identify the same instruction and their properties merge recursively; new IDs add instructions. Unless `is_ordered` is `false`, every instruction carries an integer `order`, and the resolved instructions are sequenced by it, not by their physical array positions. A child can change an inherited instruction's order or prose independently. New instructions must resolve to complete entries. The schema requires `order` on every instruction of an ordered Guide; that no two instructions share an order is beyond JSON Schema, so consumers check it and reject a duplicate rather than guessing.

Guides inherit the same organization, project, stack, and sub-stack retrieval dimensions as other scoped artifacts. Optional `apply_when` adds natural-language circumstances for a human or agent to evaluate after candidate retrieval. Absence of `apply_when` on the resolved Guide means no additional applicability restriction beyond scope and the Guide's subject. Guides do not have `do_not_apply_when`.

### Ways of Working

A Way of Working establishes how teammates organize, coordinate, collaborate, and govern their work: responsibilities, decision authority, approvals, communication, reviews, and working agreements. Unlike a Guide, its `items` are not ordered instructions. Unlike a Standard, it is not primarily an expectation about how a work product is structured or implemented.

Each Way of Working has a nonempty `category` array and nonempty `items` array. Each item has a stable `id`, human-readable `name`, and substantive `description`. Optional `apply_when` captures circumstances such as collaboration with AI agents. The inherited `inherits` property allows an agent-specific working agreement to specialize a general agreement using the [same universal merge rules](#artifact-inheritance); matching item IDs identify the same item and merge their properties recursively.

Optional `guided_by_principles`, `informed_by_strategy`, and `stems_from_decisions` express meaningful domain relationships. `related_ways_of_working` is associative only and does not imply inheritance.

### References

A Reference captures reusable factual information about a subject, such as the behavior, capabilities, or constraints of a technology, platform, or system. It does not itself establish a Standard, record a Decision, or prescribe a procedure. Reference content is organized into a nonempty `items` collection; each item has a stable `id`, a `name` and a prose `description`, so an inheriting Reference can update or add one fact by ID without restating the rest. Keep each Reference focused on a coherent subject rather than accumulating unrelated facts.

References inherit the organization, project, stack, and sub-stack dimensions of scoped artifacts. A required, nonempty `category` array provides additional taxonomy for retrieving references about a subject. Consumers can also follow optional `related_artifacts` associations to retrieve other relevant material. A related Reference remains independently meaningful; an association does not imply inheritance. References can use the optional universal `inherits` property if an author intentionally needs same-type specialization, but it is not required for ordinary reference relationships.

When information depends on a vendor version or other external circumstances, state those qualifications in the relevant item rather than presenting them as universally true. A Reference does not use Standard-style applicability rules to determine whether its facts govern work. When factual information affects a Standard or Guide, the relevant governing artifact must still be identified separately.

## Artifact inheritance

Inheritance is a **domain-wide, explicit** composition mechanism, not a Standard-specific feature. Any Socius artifact may declare `inherits` with the ID of one parent artifact of the **same artifact type** (the same `schema` discriminator, major version included, so a `v2` never inherits a `v1`). Different types, different major versions, missing parents, and cycles are errors; a consumer must not guess a replacement. A parent relationship such as `parent_strategy`, a generic association, and historical `supersedes` are not inheritance.

By default, each stored artifact must be valid against its artifact-type schema independently. A child with `inherits` may instead declare `validation_deferred: true`: its stored representation may omit fields that inheritance supplies, but the **resolved artifact must satisfy the complete artifact-type schema**. This does not change the artifact's type or weaken what constitutes a complete artifact. The child must still declare its own `schema`, `id`, and `inherits` so it can be identified and resolved. Resolve the chain from the oldest ancestor to the selected child using these rules:

| Value kind                          | Merge behavior                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------- |
| Property absent in child            | Keep inherited value                                                                   |
| Child value `null`                  | Remove the inherited value                                                             |
| Non-null scalar                     | Child replaces parent                                                                  |
| Object                              | Recursively merge properties                                                           |
| Array of primitive values           | Child array replaces parent array                                                      |
| Array of objects identified by `id` | Add new IDs; matching IDs identify the same object, whose properties merge recursively |
| Array of objects without `id`       | Child array replaces parent array                                                      |

The child's `id`, `schema`, `inherits` and `validation_deferred` are structural metadata, not inherited payload values. A resolved artifact carries the child's `id`, `schema` and `inherits`, and no `validation_deferred`: once resolved, nothing about it is deferred. When validation is not deferred, all required fields must be present in the stored child. When it is deferred, missing required content must be supplied through resolution. A resolved artifact retains the child's identity and contract. Consumers should detect duplicate IDs within identified-item arrays rather than silently resolving ambiguity. A child's array of primitive values replaces its parent's, so a child can narrow a list as well as extend it, by stating the whole list it wants. `apply_when` follows these same rules: omitting the property inherits the parent's conditions, while supplying an array replaces the inherited conditions in full. A deferred child can use `apply_when: null` to remove the inherited conditions. A `null` removes an inherited value, which lets a child drop an optional property such as a Standard's `notes`; it applies only in a deferred child, since a complete child's stored form is validated on its own and the schemas do not accept `null`. Nulling a required property leaves the resolved artifact incomplete, which fails.

### Inheritance and scope

Scope is judged on the resolved artifact. The scope fields are scalars, so a child that states one replaces its parent's, and one it leaves out is inherited.

**A child must preserve or narrow each field of its parent's resolved scope.** It may retain the parent's value or narrow an unrestricted value (`shared` or `general`, as appropriate for the field) to a specific value. A specific parent value must remain the same: changing it to an unrestricted value broadens scope, and changing it to another specific value moves scope sideways. Both are resolution errors. For example, a child cannot change `project` from one project to another or back to `shared`, or change `stack` from `frontend` to `backend`. Check every scope field independently; narrowing one does not permit broadening or moving another sideways.

**A descendant stands in for its ancestors wherever it applies.** It applies when its resolved scope matches the request and its resolved `apply_when`, if any, holds; which is why standing in is settled after the applicability negotiation, not at scope matching. An ancestor is returned only where none of its descendants applies, since each of them already restates, changes or removes what the ancestor says.

- A child for agents (`apply_when: An AI agent authored the change`) at its parent's scope is returned for an agent's change, and the parent for anyone else's.
- A child at a narrower scope is returned where that scope matches, and the parent elsewhere.
- Where two descendants both apply — siblings for agents and for urgent fixes, on an agent's urgent fix — both are returned, and the ancestor is not. They are reconciled like unrelated artifacts.
- A child whose resolved scope and `apply_when` match its parent's always stands in, so the parent is never returned. That includes a child that leaves both to inheritance. It is valid, but its author should have edited the parent.

**Artifacts not related by inheritance do not stand in for each other.** A general React Standard (`stack: frontend`, `sub_stack: general`, `category: [react]`) and a frontend React Standard with no `inherits` link both apply to a frontend React request, and both are returned. Retrieval still starts from scope, as [Standards: authoring and retrieval](#standards-authoring-and-retrieval) describes; these rules decide which records come back once several match.

JSON Schema cannot check any of this, since it spans more than one artifact; the resolver does.

### Validation timing

There are two legitimate validation questions: whether a stored file is independently complete, and whether the effective artifact after inheritance is complete. `validation_deferred` distinguishes them explicitly:

- Absent or `false`: validate the stored artifact against its full declared schema, even when it inherits another artifact.
- `true`: requires `inherits`. Validate enough of the stored representation to identify its type and parent and ensure provided values are structurally sensible, resolve its same-type inheritance chain, then validate the **complete resolved artifact** against the declared schema. A failure at either stage is an error.

A normal JSON Schema validator does not fetch or merge parent artifacts. It will reject an incomplete deferred child when run directly against the full concrete schema. The `validation_deferred` flag is a **contract for inheritance-aware validation**, not a switch that makes ordinary JSON Schema automatically ignore `required` constraints. A consumer must provide the deferred stored-form check and full post-resolution validation. This distinction should be understandable to a teammate reading the file: a deferred child is intentionally an overlay, not a standalone complete document.

Inheritance composition is distinct from discovering candidates and assessing applicability. A human or agent should be able to identify relevant artifacts using structured scope, taxonomy, relationships, and any natural-language conditions. When determining applicable expectations, relevant Deviations must be considered alongside Standards. See the repository-root [Socius future notes](../SOCIUS-FUTURE-NOTES.md) for the proposed associative-resolver negotiation and delivery workflow; that tool design is not part of the schema contract.

### Projects

A Project is a first-class artifact describing a project's identity and durable foundational context. Its required `purpose` explains why the project exists; optional `context` captures background and premise, while `constraints` records significant boundaries. Optional `organizations` associates organization IDs with their project roles; `repositories` and `resources` link to relevant codebases and external systems (such as Jira projects/boards or Confluence spaces). `related_projects` names associated projects without implying a stronger relationship.

Projects are **unscoped**: the `project` field on scoped artifacts refers to a Project's ID, but a Project is not scoped to itself. Organizational participation is represented explicitly rather than inferred from an organization scope. Projects anchor context without becoming ticket trackers, sprint logs, or containers for detailed requirements, plans, architecture, or domain models. Those concerns can be modeled separately and referenced as appropriate.

## Scope

Most artifacts describe practices or context that apply somewhere in particular. `socius-scoped-artifact` defines the scope fields:

- `organization` — the `id` of a `socius-organization` artifact, or `shared`
- `project` — the ID of the project the artifact pertains to, or `shared`
- `stack` — the stack the artifact pertains to, or `general`
- `sub_stack` — the narrower technology or platform within the stack (for example, `hubspot` under `frontend`), or `general`

All four are required on every scoped type. **Scope is always stated, never inferred from absence** — an artifact that applies everywhere says so with `shared` / `shared` / `general` / `general` rather than by leaving the fields out. The values map onto folders, so what has no sub-stack sits in a `general` folder beside the sub-stack folders rather than among them.

`organization` and `project` can name modeled Organization and Project artifacts, respectively, while the special value `shared` denotes unrestricted scope, as `general` does for `stack` and `sub_stack`. `stack` and `sub_stack` remain free strings whose values are a matter of consumer convention; nothing here enumerates their valid values.

**Each scope field narrows where an artifact applies**, on every scoped type. `stack: frontend` with `shared` / `shared` and `sub_stack: general` covers all of frontend; `sub_stack: react` covers frontend React; adding `project: X` covers how project X does frontend React. A field at `shared` or `general` does not narrow. `sub_stack` narrows even under `stack: general`: `general` / `macos` covers macOS whatever the stack. How scope interacts with inheritance is in [Inheritance and scope](#inheritance-and-scope).

Scope is inherited and never redeclared: a type gets these fields by `allOf`-ref'ing `socius-scoped-artifact`, and no type defines them itself. Because concrete types close with `unevaluatedProperties: false`, the types that don't inherit scope can't carry it at all — an `organization` on a core principle is _rejected_, not ignored. Whether a kind of artifact can be scoped is therefore part of the contract, not a convention to be remembered.

The unscoped types are unscoped deliberately:

- `socius-principle-core` and `socius-principle-derived` — principles are what the company believes. They don't vary by organization, project, or stack.
- `socius-organization`, `socius-project`, and `socius-person` — identity/context records for entities referred to by other artifacts. An organization or project isn't scoped to itself; it _is_ the entity.

### Category is not scope

`socius-standard`, `socius-reference`, `socius-way-of-working`, `socius-principle-derived`, and `socius-term` carry category-based taxonomy. For Standards, References, and Ways of Working, `category` is a nonempty array of labels; the other artifact types retain their own schema-defined shapes. Category groups artifacts for retrieval and says nothing by itself about where an artifact applies. A derived principle's `category` may well hold something stack-shaped in practice (`backend`, say), but no schema treats it as scope, and consumers shouldn't either.

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

That identifier names both the artifact type and the version of its contract, so a consumer can resolve the right schema and validate against it. The base constrains the format to `^socius-(?!(?:scoped-)?artifact/)[a-z0-9-]+/v[0-9]+$`, which also refuses the two abstract base types, and each type pins its own exact value — so `schema` is also the discriminator that tells you which type you're holding.

## Linking is by ID, not `$ref`

Relationships should communicate their domain meaning when that meaning exists. For example, `guided_by_principles`, `derived_from`, `parent_strategy`, `informed_by_operating_context`, `resulting_standards`, and `supersedes` / `superseded_by` describe specific influences, parentage, outcomes, or historical replacement; they are not interchangeable with a generic association. Use individually named fields for such meaningful relationships, rather than flattening them into a generic list.

When the relationship truly conveys only association, a typed `related_artifacts` collection is appropriate. A Reference uses entries with `type` (the target Socius artifact type) and `id` (the target artifact's stable ID). This does not imply that the target governs, informs, derives from, or is overridden by the Reference. Do not invent a stronger relationship merely to avoid a generic association, and do not replace meaningful relationships with generic ones simply because they could be represented that way.

A link names a type by its `schema` value without the version — `socius-standard`, `socius-term` — so it holds across major versions of the target. This applies to `related_artifacts[].type` and `socius-alias`'s `resolves_to.type` alike.

Fields like those above generally hold the plain `id` of another artifact as a string. So do the vocabulary links — `socius-alias`'s `resolves_to.id`, `socius-person`'s `affiliations[].organization`, `socius-organization`'s `relationships[].organization` — and the `organization` scope field itself.

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
- Schema design should reflect the ontology of the organizational practices and context being represented — not the behavior of any particular Socius agent, workflow, or consumer.
