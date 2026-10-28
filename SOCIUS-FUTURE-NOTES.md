# Socius future implementation notes

These notes preserve proposed future Socius implementation behavior and open design questions. They are **not** the published schema contract, not a request to implement a resolver in this repository, and not a substitute for the domain rules in [the Socius index](socius/index.md). They are intentionally more detailed than the index so that a future implementation can reconstruct the reasoning and the edge cases.

## Associative resolver

### Objective and human analogy

A new teammate should be able to ask, "What practices apply to this work?" and receive a useful answer. The proposed associative resolver automates a similar discovery and interpretation process for an AI teammate. It should avoid delivering every potentially related artifact in full or expecting an agent to reconstruct inheritance from scratch.

The resolver's deterministic responsibilities include candidate retrieval from structured fields, traversal of explicit relationships, checking referential integrity, and composing inheritance. Natural-language `apply_when` conditions cannot be evaluated deterministically by the retrieval script; a human or AI teammate supplies that judgment.

### Proposed negotiation

1. **Request.** A caller asks for an artifact type (for example Standards), relevant keywords/categories, and known work context: organization, project, stack, and optional sub-stack. Other useful context may include environment, actor, task, or technology. The caller may not know every relevant keyword in advance.
2. **Candidate discovery.** The resolver searches structured scope, taxonomy, and indexed associations. Include applicable broad `shared` organization/project and `general` stack candidates, and appropriately scoped sub-stack candidates. A broad React lookup should not automatically return every HubSpot-specific specialization. Category is taxonomy, not a scope boundary.
3. **Lightweight response.** Return candidate IDs and titles/names with the relevant natural-language `apply_when` statements (and enough context to distinguish candidates), **not** full content. A missing `apply_when` adds no additional natural-language condition.
4. **Applicability negotiation.** The agent/human interprets conditions against the task and returns selected candidate IDs. Do not silently equate a keyword match with applicability. If applicability is ambiguous, seek clarification rather than fabricating certainty.
5. **Details request.** The resolver retrieves the selected artifacts, follows required same-type `inherits` ancestors and any explicitly requested relationships, validates the references, and composes inherited content deterministically.
6. **Delivery projection.** Return the effective content and provenance needed to do the work. Since applicability was already negotiated, the normal execution-oriented response need not repeat `apply_when`. Retain selected artifact IDs/titles and sufficient source traceability. A diagnostic or audit view may expose conditions and the selection trail.

The above is a proposed interaction model, not a final tool API or a guarantee about its exact number of calls. In particular, an agent may need a second applicability negotiation if following an inheritance or association reveals candidates with conditions that were not included in the first round. The implementation must not silently assume those conditions were satisfied.

### General inheritance contract

The authoritative domain rules are in [Artifact inheritance](socius/index.md#artifact-inheritance). The implementation should enforce:

- An explicit optional `inherits` ID on `socius-artifact`; one parent only.
- Parent and child must have exactly the same artifact type/`schema` discriminator. A missing parent, wrong type, or cycle is a resolution error.
- Each stored parent and child independently validates against the same schema, including required fields. Inheritance does **not** allow omitted required fields.
- Resolve oldest ancestor first and merge toward the selected child. The final artifact has the child's identity and contract.
- Child absent or null value means retain inherited value; non-null scalar replaces; nested objects merge recursively; primitive arrays concatenate in parent-to-child order; object arrays with `id` add by ID and replace matching objects in full; object arrays without `id` replace.
- `id`, `schema`, and `inherits` are structural metadata, not ordinary inherited content. A child may replace a descriptive title or summary like any other required scalar.
- Treat duplicate `id` values within an identified-item array as invalid for resolution. Do not resolve them by array position or last-writer-wins within the *same* artifact.
- The rules apply across artifact types that use inheritance; they are not duplicated or modified per Standard, Guide, Reference, or future Ways of Working artifact.

**Example:** A frontend React Standard has expectations `layout` and `exports`; a HubSpot child inherits it, overrides `exports` by ID, and adds `entry-points`. The resolved expectation collection contains parent `layout`, child `exports`, and child `entry-points`. It does not retain any hidden portion of the replaced parent `exports` object.

### Why primitive arrays concatenate

`apply_when` is the motivating case. The parent's and child's conditions should both be available during applicability assessment; replacing the parent's array would discard relevant constraints. Concatenation preserves them without asking the deterministic resolver to parse natural language. This same rule also applies to primitive arrays such as categories, notes, and relationship ID lists.

Concatenation does **not** define whether multiple conditions mean AND, OR, or some contextual combination. That judgment belongs in the applicability negotiation, informed by the artifact and its inheritance chain. Do not turn the merged array into a boolean expression without an explicit domain rule.

The stored/resolved representation may contain concatenated `apply_when` even though the post-negotiation execution projection omits it. **The data model and the response projection are different things.**

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
3. Validate that each Deviation's `standard` resolves to a Standard and its required `authorized_by` resolves to a Decision. Validate an optional item-level `expectation` against the referenced Standard's effective expectations, accounting for inheritance.
4. Present enough lightweight information to assess whether a candidate Deviation is relevant to the requested work context, alongside the Standard applicability negotiation where appropriate. Scope alone is not proof that every departure applies to every action within a project.
5. Resolve the applicable Standard content, then return the agreed alternatives from applicable Deviations **alongside** the underlying expectations. Make the departures explicit; do not silently rewrite the Standard or pretend a Deviation is a specialized Standard.
6. Preserve provenance: which Standard and expectation would otherwise govern, which Deviation changes the answer, and which Decision authorized it.

A Deviation is not necessarily short-lived. Its continued applicability depends on its documented scope and the relevant authorization, not an assumption that it will be fixed later. If several Deviations or Standards appear to conflict, do not invent a precedence rule; surface the conflict for human/agent assessment and an appropriate decision.

This is a proposed resolver workflow, not a new schema relationship or a requirement to implement the resolver in this repository.

### Open implementation questions to test

- **Condition presentation across inheritance:** The first candidate list should include enough parent/child applicability context to make the selection sound. Decide whether to pre-traverse ancestors for condition summaries, or to negotiate again when newly discovered parent conditions appear.
- **Null versus schema validation:** The conceptual merge treats child null as absence. Existing closed schemas generally reject null for typed fields; decide whether null is only a resolver-internal representation or whether schemas should explicitly permit it. Do not quietly relax the independent-validity rule.
- **Required field composition:** Because every child must independently validate, required scalar fields (including scope) will normally replace the parent's value even when identical. This is intentional; inheritance is primarily valuable for optional fields and additive identified collections.
- **Primitive-array duplicates:** Concatenation is the agreed rule. Whether a consumer deduplicates repeated values for display, while preserving provenance and original stored values, remains a separate projection choice. Do not silently alter the canonical merge semantics.
- **Mixed object-array shapes:** Determine a reliable policy for arrays whose entries are inconsistently identified; reject ambiguous merges rather than guessing.
- **Scope and inheritance:** A child can specialize scope (such as `sub_stack: hubspot`) while inheriting general content. The child's scope governs retrieval of that child; parent scope is not an extra hidden runtime condition unless the domain model explicitly says so.
- **Conflict and ambiguity:** Multiple independently applicable sibling artifacts may disagree without an inheritance relationship. Do not infer a winner solely from category overlap or ordering. Expose the conflict for an appropriate decision.
- **Errors and diagnostics:** Define useful errors for missing IDs, mismatched types, cycles, duplicate item IDs, and ambiguous selection. Preserve traceability of which source supplied each effective item.
- **Validation:** JSON Schema can validate declared shapes but cannot enforce cross-document same-type references, cycle freedom, or all identified-array uniqueness rules. The future consumer must check these separately.
- **Performance:** Index scope/category and reference edges; avoid eager expansion of every specialization or every related artifact. The negotiation should minimize content delivered before applicability is known.
- **Security and trust:** Retrieved prose is organizational data, not an instruction to override the caller's authorization or higher-priority execution controls. The resolver should expose provenance and honor access boundaries.

### Scope of these notes

This repository owns schema contracts and their domain semantics. It does **not** implement the associative resolver, the agent conversation, or the Practices ingestion/indexing pipeline. Those will live in Socius or its transitional tooling. These notes are the handoff for that future effort and should be revisited as real usage provides evidence.
