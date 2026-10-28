import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Ajv2020 } from 'ajv/dist/2020';
import { load } from 'js-yaml';

import { mergeObject, orderedInstructions, resolveInheritance } from '../scripts/inheritance';

import type { Artifact } from '../scripts/inheritance';

const root = fileURLToPath(new URL('..', import.meta.url));
const types = ['artifact', 'scoped-artifact', 'standard', 'guide', 'way-of-working', 'reference'];
const ajv = new Ajv2020({ allErrors: true, strict: true });
for (const type of types) {
    const schema = load(readFileSync(join(root, 'socius', `socius-${type}`, 'v1.yaml'), 'utf8'));
    ajv.addSchema(schema);
}

function validate(artifact: Artifact): void {
    const schema = artifact.schema;
    const check = ajv.getSchema(`https://schemas.cavatinasolutions.com/socius/${schema}.yaml`);
    if (!check || !check(artifact)) throw new Error(`Invalid resolved artifact: ${JSON.stringify(check?.errors)}`);
}

function store(...artifacts: Artifact[]) {
    const data = new Map(artifacts.map(artifact => [artifact.id as string, artifact]));
    return (id: string) => data.get(id);
}

function standard(id: string, changes: Artifact = {}): Artifact {
    return {
        schema: 'socius-standard/v1', id, title: id, summary: id,
        organization: 'shared', project: 'shared', stack: 'frontend',
        category: ['react'], expectations: [{ id: 'layout', statement: 'Feature slices' }],
        ...changes,
    };
}

function guide(id: string, changes: Artifact = {}): Artifact {
    return {
        schema: 'socius-guide/v1', id, title: id, summary: id,
        organization: 'shared', project: 'shared', stack: 'frontend',
        objective: 'Create an application',
        instructions: [
            { id: 'init', name: 'Initialize', instructions: 'Initialize app', order: 10 },
            { id: 'verify', name: 'Verify', instructions: 'Run checks', order: 30 },
        ],
        ...changes,
    };
}

test('independent schema validation remains the default', () => {
    const parent = standard('parent');
    const incomplete = { schema: 'socius-standard/v1', id: 'child', inherits: 'parent', expectations: [{ id: 'layout', statement: 'Other' }] };
    assert.throws(() => resolveInheritance('child', store(parent, incomplete), validate), /Invalid resolved artifact/);
});

test('deferred validation resolves an incomplete child before full validation', () => {
    const parent = standard('parent');
    const child = { schema: 'socius-standard/v1', id: 'child', inherits: 'parent', validation_deferred: true, expectations: [{ id: 'layout', statement: 'New layout' }] };
    const resolved = resolveInheritance('child', store(parent, child), validate);
    assert.equal(resolved.title, 'parent');
    assert.equal((resolved.expectations as Artifact[])[0]?.statement, 'New layout');
    validate(resolved);
});

test('deferred validation requires a parent', () => {
    assert.throws(() => resolveInheritance('solo', store({ schema: 'socius-standard/v1', id: 'solo', validation_deferred: true }), validate), /requires inherits/);
});

test('invalid resolved artifacts fail even when deferred', () => {
    const parent = standard('parent');
    const child = { schema: 'socius-standard/v1', id: 'child', inherits: 'parent', validation_deferred: true, expectations: [{ id: 'layout', statement: 12 }] };
    assert.throws(() => resolveInheritance('child', store(parent, child), validate), /Invalid resolved artifact/);
});

test('same-type requirement, missing parents, and cycles fail', () => {
    const parent = standard('parent');
    const wrong = guide('child', { inherits: 'parent' });
    assert.throws(() => resolveInheritance('child', store(parent, wrong), validate), /type mismatch/);
    assert.throws(() => resolveInheritance('child', store(guide('child', { inherits: 'absent' })), validate), /Missing artifact/);
    const a = standard('a', { inherits: 'b' });
    const b = standard('b', { inherits: 'a' });
    assert.throws(() => resolveInheritance('a', store(a, b), validate), /cycle/);
});

test('recursive object merge retains absent values and replaces supplied scalars', () => {
    assert.deepEqual(mergeObject({ nested: { x: 1, y: 2 }, flag: true, title: 'old' }, { nested: { y: 9 }, flag: false, title: null }), {
        nested: { x: 1, y: 9 }, flag: false, title: 'old',
    });
});

test('primitive arrays concatenate in parent-first order', () => {
    const parent = standard('parent', { category: ['react'], apply_when: ['Agent work'] });
    const child = standard('child', { inherits: 'parent', category: ['hubspot'], apply_when: ['Production'] });
    const resolved = resolveInheritance('child', store(parent, child), validate);
    assert.deepEqual(resolved.category, ['react', 'hubspot']);
    assert.deepEqual(resolved.apply_when, ['Agent work', 'Production']);
});

test('matching IDs recursively merge properties, new IDs append, and grandchild wins', () => {
    const parent = guide('parent');
    const child = guide('child', { inherits: 'parent', instructions: [
        { id: 'init', name: 'Special initialize', instructions: 'Initialize app', order: 10 },
        { id: 'configure', name: 'Configure', instructions: 'Configure', order: 20 },
    ] });
    const grandchild = guide('grandchild', { inherits: 'child', validation_deferred: true, instructions: [{ id: 'init', order: 25 }] });
    const resolved = resolveInheritance('grandchild', store(parent, child, grandchild), validate);
    const items = resolved.instructions as Artifact[];
    assert.equal(items.find(item => item.id === 'init')?.name, 'Special initialize');
    assert.equal(items.find(item => item.id === 'init')?.order, 25);
    assert.deepEqual(orderedInstructions(resolved).map(item => item.id), ['configure', 'init', 'verify']);
});

test('unidentified object arrays replace rather than merge', () => {
    assert.deepEqual(mergeObject({ things: [{ name: 'old' }] }, { things: [{ name: 'new' }] }).things, [{ name: 'new' }]);
});

test('duplicate identified IDs and mixed identified arrays are rejected', () => {
    assert.throws(() => mergeObject({ items: [{ id: 'a' }, { id: 'a' }] }, { items: [{ id: 'b' }] }), /Duplicate item ID/);
    assert.throws(() => mergeObject({ items: [{ id: 'a' }] }, { items: [{ id: 'a' }, { id: 'a' }] }), /Duplicate item ID/);
    assert.throws(() => mergeObject({ items: [{ id: 'a' }] }, { items: [{ name: 'b' }] }), /Mixed identified/);
});

test('ordered Guides reject missing and duplicate orders; unordered Guides preserve list order', () => {
    assert.throws(() => orderedInstructions({ instructions: [{ id: 'a' }] }), /missing integer order/);
    assert.throws(() => orderedInstructions({ instructions: [{ order: 1 }, { order: 1 }] }), /Duplicate Guide order/);
    assert.deepEqual(orderedInstructions({ is_ordered: false, instructions: [{ id: 'b' }, { id: 'a' }] }).map(item => item.id), ['b', 'a']);
});

test('resolution does not mutate stored artifacts', () => {
    const parent = guide('parent');
    const child = guide('child', { inherits: 'parent' });
    const snapshot = JSON.stringify([parent, child]);
    resolveInheritance('child', store(parent, child), validate);
    assert.equal(JSON.stringify([parent, child]), snapshot);
});
