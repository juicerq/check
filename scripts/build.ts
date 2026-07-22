import { chmod, rm } from "node:fs/promises"
import { $ } from "bun"

await rm("dist", { recursive: true, force: true })
await $`tsc -p tsconfig.build.json`
await chmod("dist/bin/check.js", 0o755)
