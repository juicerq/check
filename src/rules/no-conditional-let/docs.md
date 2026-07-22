## What it does

Flags a `let` declared without a value and then assigned inside an `if`, `switch`, or ternary in the same block — with no loop or nested function in between.

## Why is this bad?

The `let` is a draft. Between the declaration and the last branch that writes it, the variable has no owner and no meaning, and the compiler cannot prove every path assigns it. A branch added later, or a branch that quietly assigns nothing, produces `undefined` where the type says otherwise.

A function that returns the value moves the decision into one place, makes each branch a `return`, and lets the result be `const` at the call site. The narrowing comes back for free.

## Examples

Incorrect:

```ts
let nextNumber: number

if (reusable != null) {
	nextNumber = reusable
} else {
	const row = await claimNextNumber(company.uuid)
	nextNumber = row.last_emission_number
}
```

```ts
let timer: number

if (isActive && seconds > 0) {
	timer = window.setInterval(tick, 1000)
} else if (seconds === 0) {
	reset()
}

return () => window.clearInterval(timer)
```

The second one is also a defect: neither branch may run, and the cleanup then clears `undefined`.

Correct:

```ts
async function nextEmissionNumber(company: Company, reusable: number | undefined) {
	if (reusable != null) {
		return reusable
	}

	const row = await claimNextNumber(company.uuid)
	return row.last_emission_number
}

const nextNumber = await nextEmissionNumber(company, reusable)
```

State that outlives one pass is not this pattern, and the rule does not report it: a value carried across iterations of a loop, or held in a closure between calls, has to be a `let` in the enclosing scope.

```ts
let current: FileChange | undefined

for (const line of raw.split("\n")) {
	if (line.startsWith("diff --git ")) {
		current = { path: pathOf(line), lines: [] }
		files.push(current)
	}
}
```
