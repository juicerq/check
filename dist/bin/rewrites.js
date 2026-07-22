import { spawn } from "node:child_process";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import process from "node:process";
function git(directory, args) {
    return new Promise((resolve) => {
        const child = spawn("git", args, { cwd: directory, stdio: ["ignore", "pipe", "ignore"] });
        let output = "";
        child.stdout.on("data", (chunk) => {
            output += chunk;
        });
        child.on("error", () => resolve(null));
        child.on("close", (code) => resolve(code === 0 ? output : null));
    });
}
async function dirtyFiles(root) {
    const status = await git(root, ["status", "--porcelain=v1", "--no-renames", "--untracked-files=all", "-z"]);
    if (status === null) {
        return [];
    }
    const files = [];
    for (const entry of status.split("\0").filter(Boolean)) {
        const path = entry.slice(3);
        const info = await stat(join(root, path)).catch(() => null);
        if (info?.isFile()) {
            files.push(path);
        }
    }
    return files;
}
async function snapshot(root) {
    const files = await dirtyFiles(root);
    if (files.length === 0) {
        return new Map();
    }
    const hashes = await git(root, ["hash-object", "--", ...files]);
    if (hashes === null) {
        return new Map();
    }
    return new Map(hashes.trim().split("\n").map((hash, index) => [files[index] ?? "", hash]));
}
export async function trackRewrites() {
    const root = (await git(process.cwd(), ["rev-parse", "--show-toplevel"]))?.trim();
    if (!root) {
        return null;
    }
    const before = await snapshot(root);
    return async () => {
        const after = await snapshot(root);
        return [...after].filter(([path, hash]) => before.get(path) !== hash).map(([path]) => path);
    };
}
