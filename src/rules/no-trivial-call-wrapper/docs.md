## What it does

Flags a named function, method, or arrow whose entire body is one call that forwards its own parameters unchanged: `return other()`, `return await other()`, `other(a, b)`, or `(a) => other(a)`.

Two things are never reported, because neither is a layer you can remove:

- **Anything the arguments change.** The call must pass exactly the function's parameters, in order, untouched. Adapting a signature, reordering, dropping an argument, reading a field, or building an object is work, and the function is doing it.
- **Inline callbacks.** A function passed straight into another call — `app.on("quit", () => app.quit())`, `useMutation({ onError: (e) => report(e) })` — has no caller to inline into; it exists to satisfy the callee's signature. The rule only reports functions anchored to a name: a declaration, a `const`, a class member, or a property of a named object.

## Why is this bad?

A function that only forwards is a second name for the same thing. It adds a hop to read through, an export to maintain, and a rename to keep in sync, and it hides nothing in return. "For symmetry", "to centralize", and "in case we need logic later" are all promises to add behavior that has not arrived.

## The fix is one of two, and they are not the same

The wrapper is empty because the behavior is somewhere else. Decide which side is wrong:

- **Inline it.** The layer behind the wrapper is the real owner, and the wrapper is noise. Call it directly and delete the wrapper.
- **Absorb the layer.** The wrapper is the right owner, and the thing behind it is the noise — a reducer, an action type, a dispatch table that exists only so this function can forward to it. Move that behavior into the wrapper and delete the layer.

Reaching for the first fix when the second one is right produces the worse code: the dead layer survives and its callers now touch it directly.

## Examples

Incorrect:

```ts
function loadUsers() {
	return fetchUsers()
}

const refresh = async () => {
	return await invalidate()
}

class Service {
	start() {
		return engine.boot()
	}
}
```

Correct:

```ts
async function refresh() {
	await invalidate()
	await prewarm()
}

function loadUsers() {
	const users = fetchUsers()
	return users.filter((user) => user.active)
}
```

Not reported, because the arguments carry the behavior:

```ts
function focus(target: Focus) {
	setView((current) => ({ ...current, focus: target }))
}

function report(err: unknown) {
	capture(normalize(err))
}

function change(event: ChangeEvent<HTMLInputElement>) {
	onValueChange(event.target.value)
}
```

Not reported, because there is no caller to inline into:

```ts
app.on("window-all-closed", () => app.quit())

const options = useMutation({ onError: (error) => trpcErrorHandler(error) })
```
