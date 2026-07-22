import type { Node, Rule } from "../types.ts"

type FunctionNode = Node<"FunctionDeclaration"> | Node<"ArrowFunctionExpression">

type CallExpression = Node<"CallExpression">

type Statement = NonNullable<Node<"FunctionDeclaration">["body"]>["body"][number]

type Expression = Node<"ExpressionStatement">["expression"]

type ParentNode = Node<"CallExpression">["parent"] | null

const MESSAGE = "this function only forwards a call: inline it at its callers, or absorb the behavior it delegates to"

const NAMED_ANCHORS = new Set(["AccessorProperty", "MethodDefinition", "PropertyDefinition", "VariableDeclarator"])

const LITERAL_LINKS = new Set([
	"ArrayExpression",
	"ObjectExpression",
	"Property",
	"SpreadElement",
	"TSAsExpression",
	"TSSatisfiesExpression",
])

function isNamedDefinition(fn: FunctionNode) {
	if (fn.type === "FunctionDeclaration") {
		return true
	}

	let node: ParentNode = fn.parent
	while (node && LITERAL_LINKS.has(node.type)) {
		node = node.parent
	}

	if (node?.type === "MethodDefinition") {
		return node.kind !== "constructor"
	}

	return node !== null && NAMED_ANCHORS.has(node.type)
}

function statementExpression(statement: Statement) {
	if (statement.type === "ReturnStatement") {
		return statement.argument
	}

	if (statement.type === "ExpressionStatement") {
		return statement.expression
	}

	return null
}

function bodyExpression(fn: FunctionNode) {
	const body = fn.body
	if (!body) {
		return null
	}

	if (body.type !== "BlockStatement") {
		return body
	}

	const [statement] = body.body
	if (!statement || body.body.length !== 1) {
		return null
	}

	return statementExpression(statement)
}

function forwardedCall(fn: FunctionNode) {
	if (fn.generator) {
		return null
	}

	const expression = bodyExpression(fn)
	if (!expression) {
		return null
	}

	const call = expression.type === "AwaitExpression" ? expression.argument : expression
	if (call.type !== "CallExpression") {
		return null
	}

	return call
}

function forwardsOwnParams(fn: FunctionNode, call: CallExpression) {
	if (call.arguments.length !== fn.params.length) {
		return false
	}

	return call.arguments.every((argument, index) => {
		const param = fn.params[index]
		return argument.type === "Identifier" && param?.type === "Identifier" && param.name === argument.name
	})
}

function callsThrough(node: Expression): boolean {
	if (node.type === "CallExpression") {
		return true
	}

	if (node.type === "MemberExpression") {
		return callsThrough(node.object)
	}

	return false
}

function isPlainCallee(callee: CallExpression["callee"]) {
	if (callee.type === "Identifier") {
		return true
	}

	return callee.type === "MemberExpression" && !callee.computed && !callsThrough(callee.object)
}

export const noTrivialCallWrapper: Rule = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Disallow a function whose body is one call forwarding its own parameters",
		},
	},
	create(context) {
		function check(fn: FunctionNode) {
			if (!isNamedDefinition(fn)) {
				return
			}

			const call = forwardedCall(fn)
			if (!call || !isPlainCallee(call.callee) || !forwardsOwnParams(fn, call)) {
				return
			}

			context.report({ message: MESSAGE, node: fn })
		}

		return {
			ArrowFunctionExpression: check,
			FunctionDeclaration: check,
			FunctionExpression: check,
		}
	},
}
