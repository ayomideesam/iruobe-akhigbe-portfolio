#!/usr/bin/env node
// Checks every npm override against every consumer's declared range (docs/NPM-AUDIT.md, Policy 5).
//
// npm marks a version forced by an override as "overridden", not "invalid", so `npm ls --all` stays
// green even when an override hands a package a version its own package.json rejects. On
// 2026-10-04 three overrides did exactly that after the Angular 22 upgrade (undici, @babel/core,
// picomatch) and the whole test suite still passed. This script makes that visible.
//
// It also flags overrides whose target is no longer in the tree: dead pins only hide the next problem.
//
// Usage: npm run audit:overrides   (exits 1 on any problem)
import { readFileSync } from 'node:fs';
import semver from 'semver';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const { packages } = JSON.parse(readFileSync('package-lock.json', 'utf8'));

/** The lockfile location a consumer at `from` loads `name` from, using Node's upward lookup. */
function resolveFrom(from, name) {
  let base = from;
  for (;;) {
    const candidate = base ? `${base}/node_modules/${name}` : `node_modules/${name}`;
    if (packages[candidate]) return candidate;
    if (!base) return null;
    const i = base.lastIndexOf('/node_modules/');
    base = i === -1 ? '' : base.slice(0, i);
  }
}

const declaredRange = (meta, name) =>
  meta.dependencies?.[name] ?? meta.optionalDependencies?.[name] ?? meta.peerDependencies?.[name];

let problems = 0;
for (const [name, override] of Object.entries(pkg.overrides ?? {})) {
  const present = Object.keys(packages).some(
    (loc) => loc === `node_modules/${name}` || loc.endsWith(`/node_modules/${name}`));
  if (!present) {
    console.log(`DEAD  ${name}: override ${JSON.stringify(override)} has no target in the tree — remove it`);
    problems++;
    continue;
  }
  for (const [from, consumer] of Object.entries(packages)) {
    const range = declaredRange(consumer, name);
    const target = range && resolveFrom(from, name);
    if (!target) continue;
    const { version } = packages[target];
    if (semver.satisfies(version, range, { includePrerelease: true })) continue;
    const who = from ? from.replace(/.*node_modules\//, '') : 'package.json';
    console.log(`BAD   ${name}@${version} (override ${JSON.stringify(override)}) ← ${who} wants ${range}`);
    problems++;
  }
}

console.log(problems ? `\n${problems} override problem(s).` : 'All overrides have a target and satisfy every consumer.');
process.exit(problems ? 1 : 0);
