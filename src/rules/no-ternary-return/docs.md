## What it does

Flags a `return` whose entire argument is a conditional expression: `return condition ? a : b`.

## Why is this bad?

A ternary return states the condition and both outcomes in one line, so the reader holds all three at once and neither branch gets room to grow. An early return names the exceptional case, disposes of it, and leaves the rest of the function reading as the normal path.

The shape also resists change. Adding a guard, a log, or a second condition to either branch means unwinding the ternary first; early returns just take another statement.

## Examples

Incorrect:

```ts
function extractCode(raw: string) {
	const match = CODE_PATTERN.exec(raw)
	return match ? match[1] : null
}

function label(sale: Sale) {
	return sale.status === "delivered" ? "Entregue" : "Em trânsito"
}
```

Correct:

```ts
function extractCode(raw: string) {
	const match = CODE_PATTERN.exec(raw)
	if (!match) {
		return null
	}

	return match[1]
}

function label(sale: Sale) {
	if (sale.status === "delivered") {
		return "Entregue"
	}

	return "Em trânsito"
}
```

A ternary is still the right tool inside an expression — an argument, a property value, a JSX attribute. This rule is about the `return` statement only.
