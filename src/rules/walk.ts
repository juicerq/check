import type { AnyNode } from "./types.ts"

const SKIP_KEYS = new Set(["parent", "loc", "range", "start", "end"])

function isNode(value: unknown): value is AnyNode {
	return typeof value === "object" && value !== null && typeof Reflect.get(value, "type") === "string"
}

export function walk(value: unknown, visit: (node: AnyNode) => boolean | void) {
	if (Array.isArray(value)) {
		for (const item of value) {
			walk(item, visit)
		}
		return
	}

	if (!isNode(value)) {
		return
	}

	if (visit(value) === false) {
		return
	}

	for (const [key, child] of Object.entries(value)) {
		if (!SKIP_KEYS.has(key)) {
			walk(child, visit)
		}
	}
}
