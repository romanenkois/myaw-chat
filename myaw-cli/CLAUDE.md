
## Using Bun

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.

## Project

Is the CLI tool to launch, and monitor the status of Myaw chat project running. The core idea is to make cli app that would launch the required services with required config, and then print out the logs of each service in separate tabs.

Using React/Inc for UI