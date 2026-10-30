# Socius future implementation notes

These notes preserve proposed future Socius implementation behavior and open design questions. They are **not** the published schema contract, not a request to implement a resolver in this repository, and not a substitute for the domain rules in [the Socius index](socius/index.md). They are intentionally more detailed than the index so that a future implementation can reconstruct the reasoning and the edge cases.

## Associative resolver

### Objective and human analogy

A new teammate should be able to ask, "What practices apply to this work?" and receive a useful answer. The proposed associative resolver automates a similar discovery and interpretation process for an AI teammate. It should avoid delivering every potentially related artifact in full or expecting an agent to reconstruct inheritance from scratch.

The resolver's deterministic responsibilities include candidate retrieval from structured fields, traversal of explicit relationships, checking referential integrity, and composing inheritance. Natural-language `apply_when` conditions cannot be evaluated deterministically by the retrieval script; a human or AI teammate supplies that judgment.

### Proposed negotiation

1. **Request.** A caller asks for an artifact type (for example Standards), relevant keywords/categories, and known work context: organization, project, stack, and sub-stack. Other useful context may include environment, actor, task, or technology. The caller may not know every relevant keyword in advance.
2. **Candidate discovery.** The resolver searches structured scope, taxonomy, and indexed associations. Include applicable broad `shared` organization/project and `general` stack candidates, and appropriately scoped sub-stack candidates. A broad React lookup should not automatically return every HubSpot-specific specialization. Category is taxonomy, not a scope boundary.
3. **Lightweight response.** Return candidate IDs and titles/names with the relevant natural-language `apply_when` statements (and enough context to distinguish candidates), **not** full content. A missing `apply_when` adds no additional natural-language condition.
4. **Applicability negotiation.** The agent/human interprets conditions against the task and returns selected candidate IDs. Do not silently equate a keyword match with applicability. If applicability is ambiguous, seek clarification rather than fabricating certainty.
5. **Details request.** The resolver retrieves the selected artifacts, follows required same-type `inherits` ancestors and any explicitly requested relationships, validates the references, and composes inherited content deterministically.
6. **Delivery projection.** Return the effective content and provenance needed to do the work. Since applicability was already negotiated, the normal execution-oriented response need not repeat `apply_when`. Retain selected artifact IDs/titles and sufficient source traceability. A diagnostic or audit view may expose conditions and the selection trail.

The above is a proposed interaction model, not a final tool API or a guarantee about its exact number of calls. In particular, an agent may need a second applicability negotiation if following an association reveals candidates with conditions that were not included in the first round. Inheritance does not: a child's own `apply_when` is the whole of its conditions. The implementation must not silently assume those conditions were satisfied.

### General inheritance contract

The authoritative domain rules are in [Artifact inheritance](socius/index.md#artifact-inheritance). The implementation should enforce:

- An explicit optional `inherits` ID on `socius-artifact`; one parent only.
- Parent and child must have exactly the same artifact type/`schema` discriminator, major version included. A missing parent, wrong type, or cycle is a resolution error.
- Each stored artifact normally validates independently. A child may opt into `validation_deferred: true` (only with `inherits`) and omit fields to be supplied by its parent. The resolved result **always** must validate against the full artifact-type schema.
- Resolve oldest ancestor first and merge toward the selected child. The final artifact has the child's identity and contract.
- A property absent in the child retains the inherited value; a child `null` removes it; a non-null scalar replaces; nested objects merge recursively; primitive arrays replace; object arrays with `id` add by ID and recursively merge matching objects by property; object arrays without `id` replace.
- `id`, `schema`, `inherits` and `validation_deferred` are structural metadata, not ordinary inherited content. The resolved artifact carries no `validation_deferred`. A child may replace a descriptive title or summary like any other required scalar.
- Treat duplicate `id` values within an identified-item array as invalid for resolution. Do not resolve them by array position or last-writer-wins within the _same_ artifact.
- The rules apply across artifact types that use inheritance; they are not duplicated or modified per Standard, Guide, Reference, or Ways of Working artifact.

**Example:** A frontend React Standard has expectations `layout` and `exports`; a HubSpot child inherits it, overrides `exports` by ID, and adds `entry-points`. The resolved expectation collection contains parent `layout`, child `exports`, and child `entry-points`. It retains any parent `exports` properties the child does not specify, while replacing those it does.

### Deferred validation: stored form versus resolved form

Two different checks are meaningful:

1. **Stored-file completeness:** Is the child independently valid under its declared concrete schema? This remains the default (`validation_deferred` omitted or `false`).
2. **Resolved-artifact completeness:** After same-type inheritance and merging, does the effective artifact satisfy its declared concrete schema? This is mandatory even when the stored child opted into deferral.

`validation_deferred: true` requires `inherits`. The child must still provide `schema`, `id`, and `inherits` to make type identification and parent lookup possible. The stored-form pass must check the types and structural integrity of properties actually supplied without rejecting missing inherited content. Then resolve the full ancestor chain and validate the resulting complete object with the ordinary concrete JSON Schema.

**Important:** JSON Schema's `required` checks do not automatically become conditional because the base defines `validation_deferred`. A direct full-schema validation of a deferred, incomplete stored child may fail. An inheritance-aware validator needs a separate stored-overlay validation mode (for example, a derived validation view or a purpose-built structural pass) followed by the full post-resolution check. Do not interpret the flag as "skip all validation." A missing parent, mismatched type, cycle, invalid provided value, or incomplete merged result must fail.

A child's `null` removes the inherited value. The concrete schemas do not accept `null`, so only a deferred child can supply one; a stored-overlay pass must accept it there rather than reject it as a malformed value.

**Guide example:** A parent Guide has `instructions: [{id: configure, name: Configure tooling, instructions: Set up tooling, order: 20}]`. A deferred child can supply `instructions: [{id: configure, order: 30}]`. The resolver matches the ID, preserves the name/prose, changes the order, and then validates the complete result.

**Ordering:** When `is_ordered` is true, a Guide's effective instructions are sorted by integer `order` rather than physical array position. A child may alter `order` without changing prose, or prose without changing `order`. The schema requires `order` on every instruction of an ordered Guide; a duplicate effective order is rejected rather than broken by array position. Gaps are permitted, which is what lets a child insert between inherited instructions.

### Why primitive arrays replace

A child states the whole list it means. Concatenation would let a child extend an inherited list but never narrow it: a Toolchain could add a target version and never retire one, and a Goal could never drop a success criterion it inherited. Replacing is also how arrays of unidentified objects already behave, so only identified items merge.

Replacing means a parent's `apply_when` does not carry into its child. Those conditions are not part of the delivered result, which is a projection after applicability has been negotiated, and a specialized artifact stating its own conditions is clearer than one whose conditions are assembled from its ancestors. A child that should apply under its parent's conditions restates them.

Several conditions in one `apply_when` still do not define AND, OR, or some contextual combination. That judgment belongs in the applicability negotiation. Do not turn the array into a boolean expression without an explicit domain rule.

### Relationship traversal

Domain-significant relationships have explicit names (for example `guided_by_principles`, `parent_strategy`, `supersedes`). Generic associations such as Reference `related_artifacts` have only `type` and `id` and imply no authority, precedence, or inheritance. Traversing a relation can discover relevant material, but it should not automatically promote every related artifact to a governing requirement.

The resolver should distinguish:

- Candidate retrieval by scope and category.
- Explicit same-type inheritance traversal needed to construct a selected artifact.
- Optional association traversal for additional context.
- Historical supersession, which is not inheritance.
- Natural-language applicability negotiation, which is not a deterministic filter.

### Standards and Deviations must be considered together

A request such as "What should we do for this project in this situation?" cannot be answered by Standards alone. The domain requires looking for applicable **Deviations** as well. A Standard establishes the normal authoritative expectations; a Deviation records a separately authorized, scoped departure. Neither is a substitute for the other.

The proposed resolver should:

1. Retrieve candidate Standards by scope and category, and candidate Deviations by their own scope and `standard` references. Deviations do not need backlinks on Project or Standard artifacts.
2. Include Deviations relevant to selected Standards, including Standards found through inheritance. A deviation may target a particular expectation ID or the broader Standard.
3. Validate that each Deviation's `standard` resolves to a Standard and, when supplied, its optional `backed_by_decision` resolves to a Decision. Validate an optional item-level `expectation` against the referenced Standard's effective expectations, accounting for inheritance.
4. Present enough lightweight information to assess whether a candidate Deviation is relevant to the requested work context, alongside the Standard applicability negotiation where appropriate. Scope alone is not proof that every departure applies to every action within a project.
5. Resolve the applicable Standard content, then return the agreed alternatives from applicable Deviations **alongside** the underlying expectations. Make the departures explicit; do not silently rewrite the Standard or pretend a Deviation is a specialized Standard.
6. Preserve provenance: which Standard and expectation would otherwise govern, which Deviation changes the answer, and which Decision, if any, backs it; distinguish documented departures from those with formal decision backing.

A Deviation can be recorded before formal approval, and a missing `backed_by_decision` is not itself proof of rejection or authorization. A linked Decision should be checked for what it actually supports; the field alone is not an approval workflow. Ways of Working can establish which departures require formal approval and when they may be acted upon. A Deviation is not necessarily short-lived. Its continued applicability depends on its documented scope and the relevant authorization, not an assumption that it will be fixed later. If several Deviations or Standards appear to conflict, do not invent a precedence rule; surface the conflict for human/agent assessment and an appropriate decision.

This is a proposed resolver workflow, not a new schema relationship or a requirement to implement the resolver in this repository.

### Open implementation questions to test

- **Scope and inheritance:** A child can specialize scope (such as `sub_stack: hubspot`) while inheriting general content. The child's scope governs retrieval of that child; parent scope is not an extra hidden runtime condition unless the domain model explicitly says so.
- **Conflict and ambiguity:** Multiple independently applicable sibling artifacts may disagree without an inheritance relationship. Do not infer a winner solely from category overlap or ordering. Expose the conflict for an appropriate decision.
- **Errors and diagnostics:** Define useful errors for missing IDs, mismatched types, cycles, duplicate item IDs, and ambiguous selection. Preserve traceability of which source supplied each effective item.
- **Validation:** JSON Schema can validate declared shapes but cannot resolve cross-document inheritance or implement deferred overlay validation automatically. The future consumer must implement stored-overlay checks, same-type and cycle validation, and complete post-merge schema validation.
- **Performance:** Index scope/category and reference edges; avoid eager expansion of every specialization or every related artifact. The negotiation should minimize content delivered before applicability is known.
- **Security and trust:** Retrieved prose is organizational data, not an instruction to override the caller's authorization or higher-priority execution controls. The resolver should expose provenance and honor access boundaries.

### HWC coverage audit and migration considerations

The current [How We Code](https://github.com/Cavatina-Solutions/socius-artifacts/blob/main/docs/HOW-WE-CODE.md) is an evidence source, not a single artifact to transplant. Its real sections map to different Socius responsibilities:

| HWC material                                                                                                                                                                    | Likely destination                                                                                    | Boundary to preserve                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Domain-oriented design, vertical slicing, ownership of code, React component conventions, Redux organization, .NET project layout, Terraform layout, build/release expectations | **Standards** organized by coherent subject, stack/sub-stack and category                             | Group related expectations; do not recreate a single giant HWC Standard or one artifact per formatting rule        |
| Formatter, ESLint, EditorConfig, Stylelint, custom rules, make targets, git hooks, tool versions                                                                                | **Canonical Toolchain configurations** and Toolchain policy                                           | The config is authoritative for what it enforces; do not restate its rules in Standard prose                       |
| Creating an application, preparing a database script, setting up a repository or running a release                                                                              | **Guides** where a repeatable task procedure is actually needed                                       | Do not turn every Standard into a Guide or duplicate the config                                                    |
| Agent-specific coding instructions and the agent collaboration supplement                                                                                                       | **Standards** for code-related expectations and **Ways of Working** for collaboration                 | Agent applicability can be expressed with `apply_when`; avoid copying generic agreements into agent-only artifacts |
| General collaboration, authority, approvals, escalation and handoffs                                                                                                            | **Ways of Working**                                                                                   | These are standing agreements, not ordered procedures                                                              |
| Vendor behavior, framework constraints, unexpected platform limitations, tool quirks                                                                                            | **References** when they are facts; Standards or Decisions when they prescribe organizational choices | Distinguish external reality from the organization's chosen response                                               |
| Historical choices and their rationale                                                                                                                                          | **Decisions**                                                                                         | Do not convert every inline rationale into a Decision unless it represents a meaningful choice                     |
| Client- or project-specific departures documented in `PROJECT.md`                                                                                                               | **Deviations** where an authorized departure exists                                                   | A Deviation may be recorded without a Decision; optional `backed_by_decision` can capture later formal support     |
| Project purpose, constraints, repositories, external resources                                                                                                                  | **Project**                                                                                           | Keep tickets, sprint state, plans, and detailed domain/architecture models in their appropriate systems/artifacts  |

This mapping is not a completed migration or proof that every HWC paragraph fits. During migration, classify **individual cohesive subjects**, not whole sections blindly. The same section can mix enforceable expectations, factual constraints, procedures, and rationale.

**Specific issues to test before stabilization:** the HWC's project-level deviation recording versus optional `backed_by_decision`; ordering of newly added inherited Guide instructions; Toolchain policy versus executable tool wiring; and whether References need more explicit external version/evidence context. These are tracked in [Concerns](.socius/CONCERNS.md) and [Work items](.socius/WORK-ITEMS.md).

### Executable inheritance examples

The rules above are not yet expressed as code. Where that code lives, and how it is tested against
the schemas, is still open.

### Scope of these notes

This repository owns schema contracts and their domain semantics. It does **not** implement the associative resolver, the agent conversation, or the Practices ingestion/indexing pipeline. Those will live in Socius or its transitional tooling. These notes are the handoff for that future effort and should be revisited as real usage provides evidence.
