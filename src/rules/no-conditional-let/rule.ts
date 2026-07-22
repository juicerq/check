import type { Node, Rule } from "../types.ts"
import { walk } from "../walk.ts"

type Block = Node<"BlockStatement"> | Node<"Program">

type Declarator = Node<"VariableDeclarator">

const MESSAGE = "extract a function that returns this value instead of assigning a let inside a conditional"

const BARRIERS = new Set([
	"ArrowFunctionExpression",
	"DoWhileStatement",
	"ForInStatement",
	"ForOfStatement",
	"ForStatement",
	"FunctionDeclaration",
	"FunctionExpression",
	"WhileStatement",
])

const CONDITIONALS = new Set(["ConditionalExpression", "IfStatement", "SwitchStatement"])

function uninitializedLets(block: Block) {
	const declarators = new Map<string, Declarator>()

	for (const statement of block.body) {
		if (statement.type !== "VariableDeclaration" || statement.kind !== "let") {
			continue
		}

		for (const declarator of statement.declarations) {
			if (!declarator.init && declarator.id.type === "Identifier") {
				declarators.set(declarator.id.name, declarator)
			}
		}
	}

	return declarators
}

export const noConditionalLet: Rule = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Disallow assigning an uninitialized let inside a conditional",
		},
	},
	create(context) {
		function check(block: Block) {
			const declarators = uninitializedLets(block)
			if (declarators.size === 0) {
				return
			}

			walk(block.body, (node) => {
				if (BARRIERS.has(node.type)) {
					return false
				}

				if (!CONDITIONALS.has(node.type)) {
					return
				}

				walk(node, (inner) => {
					if (BARRIERS.has(inner.type)) {
						return false
					}

					if (inner.type !== "AssignmentExpression" || inner.left.type !== "Identifier") {
						return
					}

					const declarator = declarators.get(inner.left.name)
					if (!declarator) {
						return
					}

					declarators.delete(inner.left.name)
					context.report({ message: MESSAGE, node: declarator })
				})

				return false
			})
		}

		return { BlockStatement: check, Program: check }
	},
}
