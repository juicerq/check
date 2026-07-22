import { describe, it } from "node:test"
import { RuleTester } from "oxlint/plugins-dev"
import { noTernaryReturn } from "./rule.ts"

RuleTester.describe = describe
RuleTester.it = it

new RuleTester().run("no-ternary-return", noTernaryReturn, {
	valid: [
		"function label(sale) { if (sale.delivered) { return 'Entregue' } return 'Em trânsito' }",
		"function label(sale) { return { text: sale.delivered ? 'Entregue' : 'Em trânsito' } }",
		"const label = (sale) => (sale.delivered ? 'Entregue' : 'Em trânsito')",
	],
	invalid: [
		{
			code: "function extract(raw) { const match = PATTERN.exec(raw); return match ? match[1] : null }",
			errors: 1,
		},
	],
})
