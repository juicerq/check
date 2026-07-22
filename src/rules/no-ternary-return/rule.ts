import type { Rule } from "../types.ts"

const MESSAGE = "return early instead of returning a ternary"

export const noTernaryReturn: Rule = {
	meta: {
		type: "suggestion",
		docs: {
			description: "Disallow a return whose entire argument is a ternary",
		},
	},
	create(context) {
		return {
			ReturnStatement(node) {
				if (node.argument?.type === "ConditionalExpression") {
					context.report({ message: MESSAGE, node })
				}
			},
		}
	},
}
