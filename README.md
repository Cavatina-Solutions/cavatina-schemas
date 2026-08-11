# Cavatina Solutions — Public Schemas

This repository is the single source of truth for all public [JSON Schema](https://json-schema.org/) definitions used across Cavatina Solutions. If a system, product, or domain needs to publish a schema for others (internal teams, partners, or external consumers) to reference, it lives here.

Schemas are published live at:

```
https://schemas.cavatinasolutions.com/
```

Every schema's `$id` should resolve to a real, dereferenceable URL under that domain — so `$ref`s work correctly both within this repo and from any external consumer.

## Ground rules

- **Format:** Every schema is written in **YAML**, not JSON. (See [Publishing](#publishing--the-yaml--json-question) below for how these become live JSON files.)
- **Spec version:** Every schema must conform to **JSON Schema Draft 2020-12**. Set this explicitly at the top of every file:

  ```yaml
  $schema: "https://json-schema.org/draft/2020-12/schema"
  $id: "https://schemas.cavatinasolutions.com/<domain>/<schema-name>.json"
  ```

  As newer drafts are ratified, this repo will migrate deliberately (all schemas at once, called out via a PR + changelog entry) — individual schemas should not silently drift to a newer draft on their own.

## Repository structure

Each **top-level folder** represents one **system, product, or domain**:

```
/
├── project-a/
│   ├── index.md
│   ├── customer.schema.yaml
│   └── order.schema.yaml
├── project-b/
│   ├── index.md
│   └── event.schema.yaml
└── README.md
```

- **One folder per domain.** Don't nest unrelated domains inside each other; if something spans domains, it probably deserves its own top-level folder.
- **`index.md` is required in every top-level folder.** It should explain, in plain language:
  - What this domain/product/system is and who owns it
  - What the schemas in this folder represent and how they relate to each other
  - Any domain-specific conventions (naming, versioning, breaking-change policy) that go beyond what's in this root README
  - Points of contact / owning team, if relevant

## Naming & referencing

- Schema files: `<name>.schema.yaml`
- `$id` should mirror the file's eventual published path, e.g. a file at `project-a/customer.schema.yaml` gets:

  ```yaml
  $id: "https://schemas.cavatinasolutions.com/project-a/customer.schema.json"
  ```

  (Note: `.json` in the `$id`/published URL even though the source file is `.yaml` — see below.)
- Cross-schema references use full `$ref` URLs against the published domain (`https://schemas.cavatinasolutions.com/...`) rather than relative file paths, so refs resolve identically whether you're working locally or consuming the schema from anywhere else.

## Publishing — the YAML → JSON question

Source-of-truth files are YAML for readability and easier diffs/reviews. However, most JSON Schema tooling and validators expect actual JSON on the wire. That means what gets served at `schemas.cavatinasolutions.com` should be the **compiled JSON output**, not the raw YAML.

Practically, that means either:
- A small build step (CI action) that converts every `*.schema.yaml` to `*.schema.json` into a `/dist` or `/docs` folder, which is what GitHub Pages actually serves, or
- If we're keeping this dead simple for now, publishing YAML as-is is possible, but any consumer would need to parse YAML instead of JSON — worth flagging as a temporary state, not the target end state.

*(This section should get filled in with the actual build/CI setup once that's wired up — flagging it now so it doesn't get lost.)*

## Adding a new schema

1. If this is a new domain, create a new top-level folder with an `index.md`.
2. Add your `<name>.schema.yaml` file with `$schema` and `$id` set correctly.
3. Validate locally against Draft 2020-12 before opening a PR.
4. Update the domain's `index.md` if the new schema changes how the domain's schemas fit together.
5. Open a PR for review.
