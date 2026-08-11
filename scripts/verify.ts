/**
 * Verifies the invariants this repository depends on. Run with `npm test`.
 *
 * These are the things nothing else catches: a schema that doesn't compile, a
 * `$id` that has drifted from its path, a missing minor version. See the README
 * for what each rule means and why it exists.
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { load } from "js-yaml";
import { Ajv2020 } from "ajv/dist/2020.js";

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLISH_ROOT = "https://schemas.cavatinasolutions.com/";
const SPEC_VERSION = "https://json-schema.org/draft/2020-12/schema";

/** Directories that never hold published schemas. */
const NOT_SCHEMAS = new Set(["node_modules", "scripts"]);

/** The recommended `v<major>.yaml` filename. Layout is a recommendation, so this is only used where it matches. */
const VERSION_FILENAME = /^v(\d+)\.yaml$/;

/** The `$comment` minor version, `<major>.<minor>`. */
const MINOR_VERSION = /^(\d+)\.(\d+)$/;

type Schema = {
  /** Repo-relative path, e.g. `socius/socius-decision/v1.yaml`. */
  readonly file: string;
  readonly doc: Record<string, unknown>;
};

type Problem = {
  readonly file: string;
  readonly detail: string;
};

const problems: Problem[] = [];

function report(file: string, detail: string): void {
  problems.push({ file, detail });
}

function describe(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function show(value: unknown): string {
  return value === undefined ? "nothing" : JSON.stringify(value);
}

/** The URL a file at this path publishes to. */
function publishedUrl(file: string): string {
  return PUBLISH_ROOT + file.split(sep).join("/");
}

function findSchemaFiles(directory: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || NOT_SCHEMAS.has(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...findSchemaFiles(path));
    else if (entry.name.endsWith(".yaml")) found.push(path);
  }
  return found;
}

function loadSchemas(paths: readonly string[]): Schema[] {
  const schemas: Schema[] = [];
  for (const path of paths) {
    const file = relative(REPO_ROOT, path);
    let doc: unknown;
    try {
      doc = load(readFileSync(path, "utf8"));
    } catch (error) {
      report(file, `is not parseable as YAML — ${describe(error)}`);
      continue;
    }
    if (typeof doc !== "object" || doc === null || Array.isArray(doc)) {
      report(file, "does not hold a YAML mapping at the top level");
      continue;
    }
    schemas.push({ file, doc: doc as Record<string, unknown> });
  }
  return schemas;
}

/** Every schema lives inside a domain folder, and every domain folder explains itself. */
function checkDomains(schemas: readonly Schema[]): void {
  const domains = new Set<string>();
  for (const { file } of schemas) {
    const [domain] = file.split(sep);
    if (domain === undefined || !file.includes(sep)) {
      report(file, "sits at the repository root — every schema belongs to a top-level domain folder");
      continue;
    }
    domains.add(domain);
  }
  for (const domain of [...domains].sort()) {
    if (!existsSync(join(REPO_ROOT, domain, "index.md"))) {
      report(`${domain}/`, "has no index.md — every domain folder needs one");
    }
  }
}

function checkMetadata(schemas: readonly Schema[]): void {
  for (const { file, doc } of schemas) {
    if (doc["$schema"] !== SPEC_VERSION) {
      report(file, `declares $schema ${show(doc["$schema"])} — every schema must be Draft 2020-12`);
    }

    const expected = publishedUrl(file);
    if (doc["$id"] !== expected) {
      report(file, `declares $id ${show(doc["$id"])} — it must mirror the file's path, so "${expected}"`);
    }

    const comment = doc["$comment"];
    const minor = typeof comment === "string" ? MINOR_VERSION.exec(comment) : null;
    if (minor === null) {
      report(file, `declares $comment ${show(comment)} — it must carry the minor version as "<major>.<minor>"`);
      continue;
    }

    // Only meaningful when the file follows the recommended layout.
    const named = VERSION_FILENAME.exec(basename(file));
    if (named !== null && named[1] !== minor[1]) {
      report(file, `is major ${named[1]} by its filename but ${minor[1]} by its $comment`);
    }
  }
}

/** Registers everything first so absolute `$ref`s resolve locally instead of over the network. */
function checkCompiles(schemas: readonly Schema[]): void {
  const ajv = new Ajv2020({ strict: true, allErrors: true });
  const registered: Schema[] = [];

  for (const schema of schemas) {
    try {
      ajv.addSchema(schema.doc);
      registered.push(schema);
    } catch (error) {
      report(schema.file, `was rejected by the validator — ${describe(error)}`);
    }
  }

  for (const { file, doc } of registered) {
    const id = doc["$id"];
    if (typeof id !== "string") continue;
    try {
      ajv.getSchema(id);
    } catch (error) {
      report(file, `does not compile — ${describe(error)}`);
    }
  }
}

const paths = findSchemaFiles(REPO_ROOT);
if (paths.length === 0) {
  console.error("Found no schemas to verify.");
  process.exit(1);
}

const schemas = loadSchemas(paths);
checkDomains(schemas);
checkMetadata(schemas);
checkCompiles(schemas);

if (problems.length > 0) {
  for (const { file, detail } of problems.toSorted((a, b) => a.file.localeCompare(b.file))) {
    console.error(`${file} ${detail}`);
  }
  const count = problems.length === 1 ? "1 problem" : `${problems.length} problems`;
  console.error(`\n${count} across ${paths.length} schemas.`);
  process.exit(1);
}

console.log(`${schemas.length} schemas OK`);
