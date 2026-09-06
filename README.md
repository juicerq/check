# @juicerq/check

One command that runs the whole gate: lint, types, and dead code.

`juicerq-check` runs three tools in order and prints a single summary. It exits non-zero if any of them fails.

| Step | Tool | What it does |
| --- | --- | --- |
| `oxlint` | [oxlint](https://oxc.rs) | Lints with the shared config, type-aware, and applies `--fix` |
| `typecheck` | your project's script | Runs `bun run typecheck` — the project's own TypeScript |
| `knip` | [knip](https://knip.dev) | Finds unused files, exports, and dependencies |

When `--fix` rewrites files, the summary names them, so a fix never lands unnoticed.

## Install

```sh
bun add -d @juicerq/check
```

## Setup

Three pieces.

**1. Extend the shared lint config.** Create `.oxlintrc.json` in the project root:

```json
{
	"extends": ["./node_modules/@juicerq/check/.oxlintrc.json"]
}
```

Add project rules next to `extends` — they win over the shared ones.

**2. Add the scripts.** In `package.json`:

```json
{
	"scripts": {
		"check": "juicerq-check",
		"typecheck": "tsc --noEmit"
	}
}
```

**3. Run it.**

```sh
bun run check
```

## Requirements

`juicerq-check` stops with a message when one of these is missing:

- **A `typecheck` script.** It does not bring its own TypeScript setup, it calls yours.
- **`typescript` installed in the project.** Type-aware linting cannot be skipped.
- **A readable `package.json`** in the directory you run from.

Knip reads the project's own `knip.json` when there is one, and its defaults otherwise.

## Rules

Beyond the oxlint `correctness` set, the shared config caps cyclomatic complexity at 15 (`eslint/complexity`). The count charges `?.` and `??` a branch each, which `typescript/prefer-optional-chain` (also on in this config) pushes code toward, so the ceiling stays above what ordinary branching reaches.

Read a hit as a pointer to open the file, not as a number to bring down. The count cannot tell a good extraction from a bad one, and a rewrite that scores lower is not automatically the better one.

It also turns on three rules from this package:

- **`juicerq/no-conditional-let`** — an empty `let` filled by a following `if`, `switch`, or ternary. [Docs](https://github.com/juicerq/agent-setup/blob/main/check/src/rules/no-conditional-let/docs.md)
- **`juicerq/no-ternary-return`** — a `return` whose whole argument is a ternary. [Docs](https://github.com/juicerq/agent-setup/blob/main/check/src/rules/no-ternary-return/docs.md)
- **`juicerq/no-trivial-call-wrapper`** — a function whose body is one call forwarding its own parameters. [Docs](https://github.com/juicerq/agent-setup/blob/main/check/src/rules/no-trivial-call-wrapper/docs.md)

## Exports

- `@juicerq/check/oxlintrc` — the shared config, if you would rather import it than reference the path.
- `@juicerq/check/plugin` — the oxlint plugin holding the three rules.

## License

MIT
