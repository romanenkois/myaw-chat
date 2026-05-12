# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project type

This repo is **not an Angular application** — it is an Angular **library** workspace built with `ng-packagr`. There is no app shell (no `ng serve` target, no `e2e` target). The default `angular.json` project `myaw-ui` is `projectType: "library"`, rooted at `projects/myaw-ui`, with selector prefix `myaw`.

The library is consumed by sibling repos in the `myaw-chat` umbrella (see `../myaw-main-api` etc.); this workspace only produces the distributable in `dist/myaw-ui/`.

## Commands

- `npm run build` — production library build via `@angular/build:ng-packagr` → `dist/myaw-ui/`.
- `npm run watch` — development build with `--watch`.
- `npm run test` — unit tests via Vitest (`@angular/build:unit-test` builder, `jsdom` environment). There is no Karma.
- `ng generate component <name> --project=myaw-ui` — scaffold inside the library (omit `--project` and Angular CLI will fail since there is no default app).

There is no lint script configured. The README mentions `ng serve` / `ng e2e` but those targets do not exist in `angular.json` — ignore those sections.

## Architecture

- `projects/myaw-ui/src/public-api.ts` is the package entry point declared by `ng-package.json`. Anything that should be importable by consumers of `myaw-ui` must be re-exported from here (typically via the barrel chain `public-api.ts` → `lib/index.ts` → `lib/components/index.ts`).
- Components live under `projects/myaw-ui/src/lib/components/<name>/` with the standard `*.component.ts` / `.html` / `.scss` triple. Add new components to the components barrel **and** ensure they reach `public-api.ts`, or they will not appear in the published bundle.
- TypeScript path alias: `myaw-ui` resolves to `./dist/myaw-ui` (see root `tsconfig.json`), so consumer-style imports only work after a build.
- `projects/myaw-ui/package.json` declares Angular as a `peerDependency` — do not move it to `dependencies` or the published package will pull in a duplicate Angular.

## Conventions

The full TypeScript / Angular / accessibility ruleset for this repo is in `.claude/CLAUDE.md` and `.github/copilot-instructions.md` (identical content). Key points that shape code review here:

- Angular v21, standalone-by-default — never set `standalone: true` in decorators.
- Signals (`signal`, `computed`, `input()`, `output()`) over decorators and RxJS-only state; `ChangeDetectionStrategy.OnPush` on every component.
- Use the `host` object on `@Component` / `@Directive` — `@HostBinding` / `@HostListener` are banned.
- Native control flow (`@if`, `@for`, `@switch`) only; no `*ngIf` / `*ngFor` / `*ngSwitch`, no `ngClass` / `ngStyle`.
- Services use `inject()` and `providedIn: 'root'`.
- Output must pass AXE / WCAG AA.
