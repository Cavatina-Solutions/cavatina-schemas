# Cavatina Solutions — Public Schemas

This repository is the single source of truth for all public [JSON Schema](https://json-schema.org/) definitions used across Cavatina Solutions. If a system, product, or domain needs to publish a schema for others (internal teams, partners, or external consumers) to reference, it lives here.

Schemas are published live at:

```
https://schemas.cavatinasolutions.com/
```

The path of a schema in this repo is its path on that domain — so `socius/socius-decision/v1.yaml` publishes to `https://schemas.cavatinasolutions.com/socius/socius-decision/v1.yaml`. Every schema's `$id` is that URL, and must resolve to a real, dereferenceable document — so `$ref`s work correctly both within this repo and from any external consumer.

## Ground rules

- **Format:** Every schema is written in **YAML**, and is published as YAML.
- **Spec version:** Every schema must conform to **JSON Schema Draft 2020-12**. Set this explicitly at the top of every file:

  ```yaml
  $schema: 'https://json-schema.org/draft/2020-12/schema'
  $id: 'https://schemas.cavatinasolutions.com/<domain>/<schema-name>/v1.yaml'
  $comment: '1.0' # minor version — see Versioning
  ```

  As newer drafts are ratified, this repo will migrate deliberately — all schemas at once, in a single PR. Individual schemas should not silently drift to a newer draft on their own.

## Repository structure

Each **top-level folder** represents one **system, product, or domain**. Only three things are mandated:

1. **One top-level folder per domain.** Don't nest unrelated domains inside each other; if something spans domains, it probably deserves its own top-level folder.
2. **An `index.md` in that folder.** It should explain, in plain language:
   - What this domain/product/system is and who owns it
   - What the schemas in this folder represent and how they relate to each other
   - Any domain-specific conventions (naming, versioning, breaking-change policy) that go beyond what's in this root README
   - Points of contact / owning team, if relevant
3. **Every schema file is YAML and is a valid JSON Schema Draft 2020-12 document.**

**Beyond that, the internal structure of a domain folder is up to that domain.** Organize it however makes sense for the schemas it holds.

### Recommended layout

Unless a domain has a reason to do otherwise, break it down into **one folder per schema, with the version as the filename**:

```
/
├── project-a/
│   ├── index.md
│   ├── customer/
│   │   ├── v1.yaml
│   │   └── v2.yaml
│   └── order/
│       └── v1.yaml
├── project-b/
│   ├── index.md
│   └── event/
│       └── v1.yaml
└── README.md
```

This keeps every version of a schema side by side under one name, makes the published URL read naturally (`.../customer/v1.yaml`), and means adding a new major version is a new file rather than a rename of an existing one. The `socius/` folder follows this layout.

## Naming & referencing

- Recommended schema file path: `<schema-name>/v<N>.yaml`
- **`$id` mirrors the file's path under the published domain**, so the two can always be derived from each other. A file at `project-a/customer/v1.yaml` gets:

  ```yaml
  $id: 'https://schemas.cavatinasolutions.com/project-a/customer/v1.yaml'
  ```

- Cross-schema references use full `$ref` URLs against the published domain (`https://schemas.cavatinasolutions.com/...`) rather than relative file paths, so refs resolve identically whether you're working locally or consuming the schema from anywhere else.
- **Versioning:** see [Versioning](#versioning) below.

## Publishing

Source files are served as-is at their repo path. There's no build step.

_(The actual hosting/CI setup should get documented here once it's wired up.)_

## Verifying

```bash
nvm use
make install
make test
```

`make test` checks every schema in the repo: that it parses, that it's Draft 2020-12, that it compiles with all `$ref`s resolving, that its `$id` mirrors its path, that it carries a minor version agreeing with its filename, and that its domain folder has an `index.md`. It reports everything it finds at once and exits non-zero if anything is wrong.

`make verify` runs it alongside formatting, lint and the typecheck. Run that before opening a PR. CI runs it on every pull request and on pushes to `main`, so a schema that doesn't verify can't merge.

## Adding a new schema

1. If this is a new domain, create a new top-level folder with an `index.md`.
2. Add your schema — `<schema-name>/v1.yaml` if you're following the recommended layout — with `$schema`, `$id`, and `$comment` set. `$id` must match the file's path under `https://schemas.cavatinasolutions.com/`, and `$comment` starts at `"1.0"`.
3. Run `make test`.
4. Update the domain's `index.md` if the new schema changes how the domain's schemas fit together.
5. Open a PR for review.

## Versioning

Schemas are versioned with a **major and a minor**, but only the major is a URL.

```
customer/
  v1.yaml     # always the current 1.x
  v2.yaml     # breaking change
```

`v1.yaml` is a living document that always holds the latest `1.x`. The minor is recorded in the file itself:

```yaml
$schema: 'https://json-schema.org/draft/2020-12/schema'
$id: 'https://schemas.cavatinasolutions.com/<domain>/customer/v1.yaml'
$comment: '1.1'
```

(`$comment` because it's the one place a Draft 2020-12 document can carry a note that every validator ignores — a custom keyword makes strict validators fail.)

### Minor — edit `v1.yaml` in place, bump the minor

For changes that don't break documents already valid against this major: adding an optional property, clarifying a `description`, fixing a typo. A document that validated before must still validate.

### Major — add a new file, leave the old one

For anything that breaks existing documents: adding a required field, removing or renaming a property, narrowing a type or constraint, or changing what a field means even if its shape is unchanged.

1. Add `v<N+1>.yaml` next to the existing version; leave `v<N>.yaml` in place.
2. Point the new file's `$id` at its own path, reset `$comment` to `"<N+1>.0"`, and update any `$ref`s that should follow the new version.
3. Note the change and the migration path in the domain's `index.md`.

**Earlier majors stay published.** Documents created against `v1` need `v1` to keep resolving. Deleting or repointing one breaks every consumer pinned to it.

### Before a domain is stable

A domain can declare itself **pre-stable** in its `index.md`. Until it says otherwise, `v1` is a draft: it may change incompatibly in place, and none of the guarantees above apply.

That's the honest option while a schema is still being designed — the alternative is burning through majors on churn no consumer ever saw. It only works if it's stated plainly, so say what's not settled and what "stable" will mean, rather than leaving people to guess whether a `$id` can be relied on yet.

### Why minors aren't separate URLs

Schemas here are closed — they reject properties they don't define — so a document using a property added in `1.1` is _invalid_ against `1.0`. If consumers could pin to an exact minor, they'd start rejecting perfectly valid documents the moment a minor shipped.

Pointing everyone at `v1` avoids that: the only thing a minor bump can do is accept more than before. The practical consequence is that **consumers should re-fetch rather than vendor a copy** — a stale cached `v1` behaves like a pin. If a consumer starts rejecting documents over an unknown property, a refresh is the first thing to check.

## Writing schemas

Schemas here are contracts other people build against, so they should describe structure and meaning precisely and leave everything else out.

A good schema:

- **Defines one contract.** One schema, one thing being described.
- **Composes rather than duplicates.** If a domain has properties common to many of its schemas, factor them into a base schema and `$ref` it, instead of repeating them in every file.
- **Requires a field only when the document would be incomplete without it.** `required` is a promise to consumers, not a wish list — over-requiring makes valid documents fail.
- **Uses `description` to explain what a field _means_,** not how some consumer handles it. The description is the field's documentation for everyone who ever reads the schema.
- **States types and constraints explicitly** where the contract depends on them, and leaves them open where it doesn't.
- **Models the domain, not a workflow.** A schema should reflect the shape of the thing being described, not the internals of whatever tool happens to consume it first. Tools change; the contract shouldn't have to.

## License

[Apache License 2.0](LICENSE). These schemas are meant to be referenced, copied, and generated from — by internal teams, partners, and anyone else.
