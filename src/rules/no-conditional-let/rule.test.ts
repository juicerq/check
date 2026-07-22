import { describe, it } from "node:test"
import { RuleTester } from "oxlint/plugins-dev"
import { noConditionalLet } from "./rule.ts"

RuleTester.describe = describe
RuleTester.it = it

new RuleTester().run("no-conditional-let", noConditionalLet, {
	valid: [
		"let total = 0; if (extra) { total = 1 }",
		"let current; for (const line of lines) { if (line.header) { current = line } }",
		"let last; const settle = () => { if (ready) { last = cols } }",
		"let pending; while (queue.length) { if (queue.pop()) { pending = true } }",
	],
	invalid: [
		{
			code: "function next(reusable) { let value; if (reusable != null) { value = reusable } else { value = claim() } return value }",
			errors: 1,
		},
	],
})
