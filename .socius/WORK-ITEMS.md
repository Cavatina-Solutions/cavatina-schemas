# Work items

Everything known to need doing here. Status is the section an item sits in. Work items concern the schema contracts and their documentation; artifact instances and Practices repository changes belong in their respective repositories.

---

## To do

### Document hosting and publishing

**Depends on:** nothing

**Relates to:** Requirements — "Every `$id` is the file's published URL"

The README's "Publishing" section is a placeholder. Write down how `schemas.cavatinasolutions.com` is served from this repo (the `CNAME` suggests GitHub Pages), what triggers a publish, and how long a change takes to reach consumers.

### Clarify the Principles–Standards boundary

**Depends on:** nothing

**Relates to:** `socius-principle-core`, `socius-principle-derived`, `socius-standard`

Document the distinction between enduring organizational beliefs and applicable, enforceable expectations. Make the distinction clear enough that authors can classify real examples, without changing the schemas unless the examples expose a concrete contract gap. Coordinate any corresponding Practices index updates in `cavatina-practices`.

### Introduce a Reference artifact

**Depends on:** nothing

**Relates to:** Socius artifact taxonomy

Model reusable factual reference information about technologies, platforms, systems, and their behaviors or constraints (for example, a HubSpot-specific behavior). Distinguish reference facts from standards, procedures, and operating context; define the schema and update `socius/index.md`. The exact payload and retrieval organization still need design.

### Rename the existing procedural Ways of Working concept to How-To

**Depends on:** nothing

**Relates to:** Existing procedural design in Practices; `socius-way-of-working` if present

The previously designed artifact (`objective`, `apply_when`, optional `do_not_apply_when`, ordered named `process` steps, optional `attachments`) describes instructions for accomplishing a task, not the broader team meaning of Ways of Working. Establish `socius-how-to` and its migration/compatibility treatment, then update the Socius schema index. Coordinate renaming and content migration in Practices. Avoid conflating this with `socius-guidance`, which explains a Standard.

### Model Ways of Working as team collaboration and operating agreements

**Depends on:** Clarify the How-To separation

**Relates to:** Team roles, responsibilities, authority, approvals, collaboration expectations, and working agreements

Design the actual Ways of Working artifact around how an organization and its human/AI team coordinate and govern work (for example, PO authority and approval boundaries). Distinguish standing agreements from ordered how-to procedures. Define its schema and index entry; coordinate the Practices index/README changes. Do not assume collaboration needs a separate artifact type.

### Model Conditional Standards

**Depends on:** Clarify the Principles–Standards boundary

**Relates to:** `socius-standard`, applicability, guidance

Represent an organization's authoritative standard that applies under narrower circumstances, such as a different expected approach when working with HubSpot. Determine whether existing `apply_when` / `do_not_apply_when` suffice or whether an explicit relationship to a general Standard is necessary. Conditional Standards remain Standards, not Deviations.

### Introduce a Deviation artifact

**Depends on:** Model Conditional Standards

**Relates to:** `socius-standard`, scoped artifacts, decisions

Model an acknowledged, authorized departure from the Standard that would otherwise govern a particular project or engagement, including its reason, applicability, agreed alternative, and any relevant approval. A deviation is not inherently temporary or defective, and it does not establish a new organization-wide Standard. Determine the schema and references without reducing the alternative to a short exceptions string.

### Introduce a Project artifact

**Depends on:** nothing

**Relates to:** `socius-scoped-artifact.project`, `socius-organization`

Model project identity and durable foundational context separately from the `project` scope string: purpose, mission, relationships, repositories, and links to external systems such as Jira boards/projects or Confluence spaces as appropriate. Do not turn Project into a ticket tracker or container for every project-related artifact. Determine fields, references, and scoping rules; detailed requirements and plans are separate, parked topics.

### Settle the Socius v1 contracts

**Depends on:** Review active artifact additions and revisions above

**Relates to:** Requirements — "A published major keeps resolving to a compatible contract"

`socius/index.md` declares the domain pre-stable: which properties belong on which artifact type, and which are required, is still open. Settle the active contracts, then decide when to remove the pre-stable note so versioning guarantees apply as written. This is a broader stabilization milestone, not a prerequisite for recording new work items.

---

## In progress

---

## Parked

### Reconcile Toolchain policy with operational tooling

**Depends on:** nothing

**Relates to:** `socius-toolchain`, Practices toolchain profiles/configurations, transitional Claude Code tooling

The current schema captures required tools, version policy, and sanctioned exceptions; the earlier combined manifest also carried detection, scripts, commands, fallbacks, and presentation. The boundary and migration bridge are unresolved. Revisit after the parallel Toolchain/Socius work progresses; do not redesign the schema from the stopgap implementation alone.

### Model Plans

**Depends on:** Strategy/Goal/Project boundaries as needed

**Relates to:** `socius-strategy`, `socius-goal`, Project, external ticket systems

Explore planning artifacts (including quarterly commitments, sequencing, dependencies, assumptions, and links to Jira/JQL) without replacing Jira or treating a plan as a strategy or goal. Intentionally deferred.

### Model Requirements and product-definition artifacts

**Depends on:** Project modeling as needed

**Relates to:** Project, external ticket systems

Explore durable use cases, jobs to be done, feature matrices, and other product-definition knowledge. Determine granularity and boundaries; individual tickets, acceptance criteria, and execution state remain in their owning systems. Intentionally deferred.

### Model Architecture

**Depends on:** nothing

**Relates to:** Current-state representation, diagrams, and project knowledge

Determine how to represent current architecture, diagrams, sequences, ERDs, and related views without confusing them with historical decisions. Intentionally deferred because it requires a separate modeling exercise.

### Model Domain / Ubiquitous Language

**Depends on:** nothing

**Relates to:** Terminology

Explore richer domain concepts, relationships, behavior, actors, aggregates, and use cases separately from basic Term/Alias/Organization/Person resolution. Intentionally deferred; Terminology does not attempt to solve domain modeling.

### Revisit Practices versus repository-local collaboration state

**Depends on:** Project and other artifact boundaries as needed

**Relates to:** Socius stopgap collaboration-state experiments

Clarify which facts and coordination state are maintained centrally in Practices, in external systems, or locally with a repository. Do not assume repository-local means temporary, and do not duplicate Jira work-item tracking. Park until concrete remaining cases justify further modeling.

---

## Done

### Put the repo on the Socius toolchain

**Depends on:** nothing

**Relates to:** Requirements — "`make verify` passes"

Vendored `socius-artifacts/` and declared `git-hooks` and `make-ts-tools`. Moved from npm to yarn, took the Prettier, EditorConfig, ESLint, commitlint, husky, tsconfig and Claude settings samples, fronted every task with make, and ran the verifier through tsx. CI runs `make verify`.

### Provide `NPM_GITHUB_TOKEN` to CI

**Depends on:** nothing

**Relates to:** Requirements — "`make verify` passes"; concern "CI may not be able to read the Cavatina packages"

`.github/workflows/verify.yml` installs with `secrets.NPM_GITHUB_TOKEN`, a personal access token with `read:packages`, which is now available to this repository's Actions. The workflow's own token cannot read packages published from other repositories, so the secret is what lets `make install` fetch the `@cavatina-solutions` packages.
