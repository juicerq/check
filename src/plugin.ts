import { noConditionalLet } from "./rules/no-conditional-let/rule.ts"
import { noTernaryReturn } from "./rules/no-ternary-return/rule.ts"
import { noTrivialCallWrapper } from "./rules/no-trivial-call-wrapper/rule.ts"

// oxlint-disable-next-line import/no-default-export -- oxlint loads a JS plugin through its default export
export default {
	meta: { name: "juicerq" },
	rules: {
		"no-conditional-let": noConditionalLet,
		"no-ternary-return": noTernaryReturn,
		"no-trivial-call-wrapper": noTrivialCallWrapper,
	},
}
