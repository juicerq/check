#!/usr/bin/env node
import { spawn } from "node:child_process"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import process from "node:process"
import { trackRewrites } from "./rewrites.ts"

const cwd = process.cwd()

const require = createRequire(import.meta.url)

function fail(reason: string): never {
	process.stderr.write(`juicerq-check: ${reason}\n`)
	process.exit(1)
}

function run(command: string, args: string[]) {
	return new Promise<number>((resolve) => {
		const child = spawn(command, args, { cwd, stdio: "inherit" })
		child.on("error", () => resolve(1))
		child.on("close", (code) => resolve(code ?? 1))
	})
}

function manifestAt(directory: string) {
	try {
		return JSON.parse(readFileSync(join(directory, "package.json"), "utf8"))
	} catch {
		return null
	}
}

function binary(name: string) {
	let directory = dirname(require.resolve(name))

	while (directory !== dirname(directory)) {
		const manifest = manifestAt(directory)
		if (manifest?.name === name) {
			return join(directory, typeof manifest.bin === "string" ? manifest.bin : manifest.bin[name])
		}

		directory = dirname(directory)
	}

	fail(`cannot locate the ${name} package`)
}

function sharedIgnores() {
	const config = JSON.parse(readFileSync(new URL("../../.oxlintrc.json", import.meta.url), "utf8"))
	return config.ignorePatterns.flatMap((pattern: string) => ["--ignore-pattern", pattern])
}

const project = manifestAt(cwd)
if (project === null) {
	fail("no readable package.json in the current directory")
}

if (!project.scripts?.typecheck) {
	fail("the project needs a `typecheck` script: juicerq-check runs the project's own TypeScript")
}

try {
	require.resolve("typescript/package.json", { paths: [cwd] })
} catch {
	fail("the project needs typescript installed: type-aware linting cannot be skipped")
}

const settle = await trackRewrites()

const results = [
	["oxlint", await run(process.execPath, [binary("oxlint"), "--fix", "--type-aware", ...sharedIgnores()])],
	["typecheck", await run("bun", ["run", "typecheck"])],
	["knip", await run(process.execPath, [binary("knip")])],
] as const

const rewritten = await settle?.()

process.stdout.write("\njuicerq-check\n")
for (const [name, code] of results) {
	process.stdout.write(`  ${name.padEnd(10)} ${code === 0 ? "ok" : "failed"}\n`)
}

if (settle === null) {
	process.stdout.write("\n  oxlint --fix may have rewritten files: not a git repository, so they cannot be named\n")
} else if (rewritten && rewritten.length > 0) {
	process.stdout.write(`\n  oxlint --fix rewrote ${rewritten.length} file${rewritten.length === 1 ? "" : "s"}\n`)
	for (const path of rewritten) {
		process.stdout.write(`    ${path}\n`)
	}
}

process.exit(results.some(([, code]) => code !== 0) ? 1 : 0)
