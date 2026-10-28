// Reference implementation of Socius inheritance semantics. The future associative resolver
// can consume this logic; candidate discovery and natural-language applicability are separate.
export type Artifact = Record<string, unknown>;
export type ArtifactLookup = (id: string) => Artifact | undefined;
export type ArtifactValidator = (artifact: Artifact) => void;

const isObject = (value: unknown): value is Artifact =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const clone = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(clone);
    if (isObject(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
    return value;
};

function identified(value: unknown): value is Artifact & { id: string } {
    return isObject(value) && typeof value.id === 'string' && value.id.length > 0;
}

function mergeArray(parent: unknown[], child: unknown[]): unknown[] {
    const combined = [...parent, ...child];
    if (combined.every(item => !isObject(item))) return combined.map(clone);
    if (combined.every(identified)) {
        const result: Artifact[] = [];
        const index = new Map<string, number>();
        for (const item of parent) {
            if (!identified(item)) throw new Error('Mixed identified array');
            if (index.has(item.id)) throw new Error(`Duplicate item ID: ${item.id}`);
            index.set(item.id, result.length);
            result.push(clone(item) as Artifact);
        }
        const seen = new Set<string>();
        for (const item of child) {
            if (!identified(item)) throw new Error('Mixed identified array');
            if (seen.has(item.id)) throw new Error(`Duplicate item ID: ${item.id}`);
            seen.add(item.id);
            const position = index.get(item.id);
            if (position === undefined) {
                index.set(item.id, result.length);
                result.push(clone(item) as Artifact);
            } else {
                result[position] = mergeObject(result[position]!, item);
            }
        }
        return result;
    }
    if (combined.some(identified) && combined.some(item => !identified(item))) {
        throw new Error('Mixed identified and unidentified array entries');
    }
    return clone(child) as unknown[];
}

function mergeValue(parent: unknown, child: unknown): unknown {
    if (child === undefined || child === null) return clone(parent);
    if (Array.isArray(parent) && Array.isArray(child)) return mergeArray(parent, child);
    if (isObject(parent) && isObject(child)) return mergeObject(parent, child);
    return clone(child);
}

export function mergeObject(parent: Artifact, child: Artifact): Artifact {
    const result = clone(parent) as Artifact;
    for (const [key, value] of Object.entries(child)) result[key] = mergeValue(parent[key], value);
    return result;
}

export function resolveInheritance(id: string, lookup: ArtifactLookup, validate: ArtifactValidator): Artifact {
    const active = new Set<string>();
    const completed = new Map<string, Artifact>();
    function resolve(currentId: string): Artifact {
        const cached = completed.get(currentId);
        if (cached) return clone(cached) as Artifact;
        if (active.has(currentId)) throw new Error(`Inheritance cycle at ${currentId}`);
        const child = lookup(currentId);
        if (!child) throw new Error(`Missing artifact: ${currentId}`);
        if (child.id !== currentId || typeof child.schema !== 'string') throw new Error(`Invalid artifact identity: ${currentId}`);
        active.add(currentId);
        try {
            const parentId = child.inherits;
            if (child.validation_deferred === true && (typeof parentId !== 'string' || !parentId)) {
                throw new Error(`Deferred validation requires inherits: ${currentId}`);
            }
            // Structural identity is checked before lookup; full schema validation is always
            // performed after composition. Non-deferred stored artifacts validate independently.
            if (child.validation_deferred !== true) validate(child);
            let result: Artifact;
            if (parentId === undefined) {
                result = clone(child) as Artifact;
            } else {
                if (typeof parentId !== 'string' || !parentId) throw new Error(`Invalid inherits: ${currentId}`);
                const parent = resolve(parentId);
                if (parent.schema !== child.schema) throw new Error(`Inheritance type mismatch: ${currentId}`);
                result = mergeObject(parent, child);
            }
            result.id = child.id;
            result.schema = child.schema;
            if (child.inherits === undefined) delete result.inherits;
            else result.inherits = child.inherits;
            if (child.validation_deferred === undefined) delete result.validation_deferred;
            else result.validation_deferred = child.validation_deferred;
            validate(result);
            completed.set(currentId, result);
            return clone(result) as Artifact;
        } finally {
            active.delete(currentId);
        }
    }
    return resolve(id);
}

export function orderedInstructions(artifact: Artifact): Artifact[] {
    const items = artifact.instructions;
    if (!Array.isArray(items)) throw new Error('Guide instructions must be an array');
    if (artifact.is_ordered === false) return clone(items) as Artifact[];
    const result = items.map(item => {
        if (!isObject(item) || !Number.isInteger(item.order)) throw new Error('Ordered Guide instruction missing integer order');
        return clone(item) as Artifact;
    });
    const used = new Set<number>();
    for (const item of result) {
        const order = item.order as number;
        if (used.has(order)) throw new Error(`Duplicate Guide order: ${order}`);
        used.add(order);
    }
    return result.sort((a, b) => (a.order as number) - (b.order as number));
}
