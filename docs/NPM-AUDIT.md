# NPM Audit — Iruobe Portfolio

**Living document.** Not a one-time snapshot — update it in place every time `npm audit` is run. A
security report that self-grades "clean" once and is never revisited is worse than no report, because
it manufactures confidence the tree no longer earns. Advisories get published against packages that
were already installed, so a clean result has a shelf life measured in weeks.

---

## Current status

| | |
|---|---|
| **Last run** | 2026-08-07 |
| **Result** | ✅ **0 vulnerabilities** |
| **Packages audited** | 1,122 |
| **npm version** | 10.9.7 |
| **Node version** | v22.22.2 |
| **Angular** | 20.3.27 (CLI + build-angular 20.3.33) |

```
$ npm audit
found 0 vulnerabilities
```

Reproducible from a clean tree: `rm -rf node_modules && npm ci` → 0 vulnerabilities, 0 `invalid`.

---

## 2026-08-07 — 33 → 0

Reported as "15 vulnerabilities" from the working `node_modules`, but a clean `npm ci` showed **33
(2 low, 8 moderate, 23 high)**. That gap was the first real finding: `node_modules` had drifted from
the lockfile, so the local install was auditing a tree that CI would never reproduce.

**Always audit after `npm ci`, never against a drifted `node_modules`.** The number you get from a
tree that has been `npm install`-ed repeatedly over months is not the number your build produces.

### Finding 1 — the lockfile still carried `netlify-cli` (≈10 of the 23 high)

`netlify-cli` was removed from `package.json` in commit `7ec05fd` ("security: remove console logs and
improve HTML sanitization") but the **lockfile was never regenerated**. Its root record still listed
`netlify-cli` as a production dependency, so `npm ci` faithfully installed its entire tree — roughly
950 packages — carrying advisories for `sharp`, `ipx`, `@fastify/static`, `find-my-way`,
`socket.io-parser`, `js-yaml`, `svgo`, `@netlify/dev`, `@netlify/images` and more.

None of it was reachable from any import in `src/`. It was dead weight in the lockfile only.

Checked before removing, because deleting a deploy tool is not a free action:

- No `netlify.toml` in the repo.
- `netlify` / `ntl` not on `PATH`, not installed globally.
- No `netlify_deploy_prod` script in `package.json` (an older note referenced one; it no longer exists).

Deployment runs through Netlify's Git integration on push, so nothing depended on a locally installed
CLI. Reconciling the lockfile to `package.json` took it from **2,092 → 1,148 packages** and **33 → 25**
findings.

> If a local Netlify CLI is ever needed again, add it as a `devDependency` deliberately — do not let
> it back in as a lockfile orphan, where it ships CVEs without appearing in `package.json`.

### Finding 2 — Angular pinned one patch below the fix (9 high)

**GHSA-jj27-h5hq-8x99**, Angular i18n XSS via event-handler attributes, affects `@angular/*`
`20.0.0-next.0 – 20.3.26`. The project sat on **20.3.25**; the fix is **20.3.27**.

`package.json` already declared `^20.3.25`, which permits 20.3.27 — but neither `npm audit fix` nor
`npm install` would move it, and an explicit `npm install @angular/core@20.3.27 …` failed `ERESOLVE`:

```
Found: @angular/common@20.3.25
  peer @angular/common@"20.3.25" from @angular/forms@20.3.25
Conflicting peer dependency: @angular/core@20.3.27
```

Angular's runtime packages peer-depend on one another at an **exact** version. npm kept re-pinning
`@angular/forms@20.3.25` from the lockfile, which peer-required `@angular/common@20.3.25`, and the
resolution deadlocked.

**Working technique — surgical, not scorched-earth:** remove only the `@angular*` entries from
`package-lock.json`, then `npm install`.

```python
# strip 108 @angular / @angular-devkit records; every other pin is preserved
victims = [k for k in lock['packages'] if re.search(r'node_modules/@angular(-devkit)?/', k)]
```

Do **not** delete the whole `package-lock.json` to break an `ERESOLVE`. A full re-resolve silently
drifts every other pin in the tree, including the security overrides below, and the diff is too large
to review. Removing one scope's entries lets npm re-resolve exactly that scope against the ranges
already in `package.json`.

Result: Angular 20.3.25 → **20.3.27**, CLI/build-angular 20.3.30 → **20.3.33**. 25 → 15.

### Finding 3 — the remaining 15, closed with scoped `overrides`

All transitive. Every one fixed with the **narrowest in-major patch** — no major bumps.

| Package | Was | Now | Note |
|---|---|---|---|
| `dompurify` | 3.4.11 | `^3.4.13` | **Only production-bundle finding.** `jspdf` → `dompurify`, ships as a lazy chunk on the resume route. |
| `fast-uri` | 3.1.3 | `^3.1.5` | 4.x exists; no major bump needed. |
| `ip-address` | 10.2.0 | `^10.4.0` | |
| `js-yaml` | 4.3.0 | `^4.3.1` | Stayed on 4.x; 5.x is a major. |
| `socket.io-parser` | 4.2.5 | `^4.2.7` | |
| `hono` | 4.12.x | `^4.13.1` | |
| `undici` | 6.27.0 | `>=6.28.0 <7` | Upper bound deliberate — latest is 8.x, two majors up. |
| `webpack-dev-server` | 5.2.5 | `^5.2.6` | 6.0.0 is a major. |
| `tar` | ≤7.5.20 | `>=7.5.22` | Existing override raised; the advisory range had moved past it. |

**`brace-expansion` — two majors, incompatible export shapes.** The tree holds both `1.1.15` (under
`minimatch@3`, the Karma chain) and `5.0.7` (under `minimatch@5`, npm's own internals). A blanket
override forces one major onto the other's consumers, and `brace-expansion@5`'s CJS export is not the
callable `minimatch@3` expects. Scoped instead:

```jsonc
"brace-expansion": "^1.1.18",              // minimatch@3 / Karma path
"@npmcli/package-json": { "brace-expansion": "^5.0.9" },
"@tufjs/models":        { "brace-expansion": "^5.0.9" },
"cacache":              { "brace-expansion": "^5.0.9" },
"ignore-walk":          { "brace-expansion": "^5.0.9" }
```

**`body-parser` — same shape.** `express@5` (root) wants `^2.2.1` and is already patched at 2.3.0;
only the 1.x consumers were vulnerable. Pinned per-consumer so `express@5` keeps its 2.x copy:

```jsonc
"karma":              { "body-parser": "^1.20.6" },
"webpack-dev-server": { ".": "^5.2.6", "body-parser": "^1.20.6" }
```

Note the `"."` key. Writing `"webpack-dev-server": { "body-parser": "…" }` **replaces** the version
pin with a nested object and silently unpins the package itself — that regressed the count from 1 back
to 3 mid-pass. `"."` pins the package while its siblings override that package's dependencies.

**`@hono/node-server` chain.** `@angular/cli` → `@modelcontextprotocol/sdk` → `@hono/node-server`,
where the SDK pins `^1.19.9` and the fix landed in 2.0.5 (a major). npm's only offered fix was
`@angular/cli@21`, a framework-major bump. Scoped to that one path instead:

```jsonc
"@angular/cli": {
  "@modelcontextprotocol/sdk": "^1.30.0",
  "@hono/node-server": "^2.0.5"
}
```

Both are real, current, patched releases — not downgrades — and the MCP server is a CLI feature this
project never invokes.

### Finding 4 — a pre-existing override was itself causing an `invalid`

`"express": { "path-to-regexp": "0.1.13" }` predates this pass. It was flagging:

```
path-to-regexp@8.4.2 invalid: "0.1.13" from node_modules/router overridden
```

The override applied to *all* express descendants, but the two express majors need different
`path-to-regexp` majors: `express@4` (under `webpack-dev-server`) wants `~0.1.12`, while `router`
(under `express@5`) wants `^8.0.0` and 8.4.2 is not vulnerable.

The override was also **redundant** — `~0.1.12` already resolves to the patched 0.1.13 on its own.
Removed it: audit stayed at 0 and the `invalid` cleared.

**Standing lesson:** prefer the narrowest override that fixes the finding, and always run
`npm ls --all | grep invalid` afterwards. npm reports an over-broad override as `invalid` rather than
failing the install, so it will not stop a build — it just quietly gives some package a dependency
version its code was never written against.

### Verified after the change

`npm ci` from a clean tree → 0 vulnerabilities · 0 `invalid` · `tsc --noEmit` clean · production build
clean · 63/63 tests · all five routes render with one JSON-LD block each.

---

## Direct dependencies at baseline

| Package | Version | Notes |
|---|---|---|
| `@angular/*` (animations, common, compiler, core, forms, platform-browser*, router) | ^20.3.27 | runtime |
| `@angular/cli`, `@angular-devkit/build-angular` | ^20.3.33 | dev |
| `@angular/compiler-cli` | ^20.3.27 | dev |
| `rxjs` | ~7.8.0 | |
| `zone.js` | ~0.15.1 | |
| `typescript` | ~5.8.3 | |
| `tslib` | ^2.3.0 | |
| `@emailjs/browser` | ^4.4.1 | contact form |
| `jspdf`, `html2canvas` | ^4.2.1 / ^1.4.1 | resume PDF export — pulls `dompurify` + `canvg` into the bundle |
| `karma`, `karma-*`, `jasmine-core`, `@types/jasmine` | per `package.json` | test runner |
| `@babel/core` | ^7.29.6 | dev, pinned via override |

---

## Policy

1. **Audit after `npm ci`, not against a drifted `node_modules`.** The 2026-08-07 pass found a
   15-vs-33 gap between the two. Only the `npm ci` number reflects what deploys.
2. **Run `npm audit` before every push to `development`**, and on a regular cadence besides —
   advisories are published against packages already installed, not just newly added ones.
3. **Triage by production exposure, not severity alone.** Run `npm audit --omit=dev` to separate
   them. A high in the Karma chain is not the same risk as a low in `dompurify`, which actually ships
   in the bundle. Fix both, but know which is which.
4. **Prefer the narrowest override.** Scope by parent rather than pinning globally, stay within the
   current major where a patch exists, and use `"."` when a nested override also needs to pin the
   package itself.
5. **Always run `npm ls --all | grep invalid` after adding or changing an override.** An over-broad
   override does not fail the install; it just hands a package a dependency its code never expected.
6. **Never `npm audit fix --force` blindly.** It resolves majors. Evaluate the breaking change first —
   on this pass every finding was closable without one.
7. **Never delete `package-lock.json` to break an `ERESOLVE`.** Remove only the offending scope's
   entries, then `npm install`.
8. **Record every finding here**, including ones judged low-risk and left open, with the reasoning.
   Mark resolved rows resolved; do not delete them.
9. `npm audit` covers **published CVEs only**. Behavioural security issues — a leaked credential in a
   log, an unsanitised `innerHTML`, a missing `rel="noopener"` — are not in scope here and belong in
   the commit history and code review.

## Findings log

| Date | Package | Severity | Production exposure | Status | Notes |
|---|---|---|---|---|---|
| 2026-08-07 | `netlify-cli` tree (≈950 pkgs) | high ×10 | No — orphaned lockfile entry, never imported | ✅ Resolved | Removed from `package.json` in `7ec05fd`; lockfile never regenerated. Reconciled. |
| 2026-08-07 | `@angular/*` | high ×9 | **Yes** — framework | ✅ Resolved | GHSA-jj27-h5hq-8x99 i18n XSS. 20.3.25 → 20.3.27 via targeted lockfile surgery. |
| 2026-08-07 | `dompurify` | low | **Yes** — `jspdf` chunk | ✅ Resolved | `CUSTOM_ELEMENT_HANDLING` bypass. Override `^3.4.13`. |
| 2026-08-07 | `postcss`, `webpack-dev-server`, `undici`, `tar`, `hono`, `fast-uri`, `ip-address`, `js-yaml`, `socket.io-parser` | high/moderate | No — build & dev tooling | ✅ Resolved | In-major patch overrides. |
| 2026-08-07 | `brace-expansion` | high | No — Karma / npm internals | ✅ Resolved | Two majors, scoped separately; 5.x breaks `minimatch@3`. |
| 2026-08-07 | `body-parser` | low | No — Karma / dev server | ✅ Resolved | Per-consumer pins; `express@5` keeps 2.x. |
| 2026-08-07 | `@hono/node-server` ← `@modelcontextprotocol/sdk` ← `@angular/cli` | moderate | No — CLI MCP feature, never invoked | ✅ Resolved | Scoped override instead of the CLI-21 major npm suggested. |
| 2026-08-07 | `path-to-regexp` (`invalid`, not a CVE) | — | No | ✅ Resolved | Pre-existing over-broad `express` override removed; was redundant. |

---

*Angular patterns and dependency standards: `CLAUDE.md`.*
