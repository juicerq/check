import { describe, it } from "node:test"
import { RuleTester } from "oxlint/plugins-dev"
import { noTrivialCallWrapper } from "./rule.ts"

RuleTester.describe = describe
RuleTester.it = it

new RuleTester().run("no-trivial-call-wrapper", noTrivialCallWrapper, {
	valid: [
		"function close() { dispatch({ type: 'CLOSE' }) }",
		"function change(event) { onValueChange(event.target.value) }",
		"function handle(_event, payload) { listener(payload) }",
		"function load() { const users = fetchUsers(); return users.filter(Boolean) }",
		"function start() { return getService().boot() }",
		"const load = (id) => fetchUser(id).then(pick)",
		"const label = (user) => user.name",
		"const pick = (list) => list[0](list)",
		"app.on('window-all-closed', () => app.quit())",
		"emitter.on('change', (payload) => listener(payload))",
		"export default () => store.read()",
		"useMutation({ onError: (error) => report(error) })",
		"class Queue { constructor() { this.cleanup() } }",
	],
	invalid: [
		{ code: "function loadUsers() { return fetchUsers() }", errors: 1 },
		{ code: "async function refresh() { return await invalidate() }", errors: 1 },
		{ code: "const forward = (order) => { return api.getSale(order) }", errors: 1 },
		{ code: "const getSale = (order) => api.getSale(order)", errors: 1 },
		{ code: "const sales = { list: (query) => api.listSales(query) }", errors: 1 },
		{ code: "class Repo { find(id) { return this.db.find(id) } }", errors: 1 },
	],
})
