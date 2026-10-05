#!/usr/bin/env node
// Fails the build early when angular.json, netlify.toml and .nvmrc disagree about the deploy.
//
// On 2026-10-04 three Netlify deploys in a row died inside @netlify/angular-runtime before the build
// started: the Angular 22 migration had turned the build "outputPath" into an object
// ({ "base": "…" }), and the plugin path.join()s it as a string (ERR_INVALID_ARG_TYPE). The site
// built fine locally, so nothing caught it until production. npm runs this as `prebuild`, locally and
// on Netlify, so the same mistake now stops with a readable message instead of a plugin stack trace.
//
// Usage: node scripts/check-deploy-config.mjs   (exits 1 on any problem)
import { readFileSync } from 'node:fs';
import { posix } from 'node:path';

const PROJECT = 'iruobe-portfolio';
const problems = [];

const angular = JSON.parse(readFileSync('angular.json', 'utf8'));
const build = angular.projects?.[PROJECT]?.architect?.build;
const outputPath = build?.options?.outputPath;

if (build?.builder !== '@angular/build:application') {
  problems.push(`angular.json: expected the @angular/build:application builder, found ${build?.builder}`);
}
if (typeof outputPath !== 'string') {
  problems.push(
    `angular.json: build "outputPath" must be a plain string, found ${JSON.stringify(outputPath)}. ` +
      `Netlify's Angular runtime cannot read the object form.`
  );
}

const toml = readFileSync('netlify.toml', 'utf8');
const publish = toml.match(/^\s*publish\s*=\s*"([^"]+)"/m)?.[1];
const nodeVersion = toml.match(/^\s*NODE_VERSION\s*=\s*"([^"]+)"/m)?.[1];

if (typeof outputPath === 'string') {
  const expected = posix.join(outputPath, 'browser');
  if (!publish || posix.normalize(publish) !== expected) {
    problems.push(`netlify.toml: publish is "${publish}", but the application builder writes to "${expected}"`);
  }
}

const nvmrc = readFileSync('.nvmrc', 'utf8').trim().replace(/^v/, '');
if (nodeVersion !== nvmrc) {
  problems.push(`netlify.toml: NODE_VERSION is "${nodeVersion}", but .nvmrc pins "${nvmrc}"`);
}

if (problems.length) {
  console.error('Deploy config check failed:\n' + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`Deploy config OK: ${posix.join(outputPath, 'browser')} on Node ${nvmrc}`);
