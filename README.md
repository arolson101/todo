# Todo starter app

It takes a while to install & configure modern JS technologies, so here is a depot to start development on your next cool app.

## Technologies

### Development

- everything in [Typescript](https://www.typescriptlang.org/)
- [Bun](https://bun.sh/) for server bundling and runtime
- [Prettier](https://prettier.io/) (with plugins) and [EditorConfig](https://editorconfig.org/) code formatting
- [ESLint](https://eslint.org/) to catch problems early
- [Visual Studio Code](https://code.visualstudio.com/) centered development
- [Zod](https://zod.dev/) for type validation

### Server

- [Hono](https://hono.dev/) api server
- [Postgres](https://www.postgresql.org/) database using [Drizzle ORM](https://orm.drizzle.team/)
- type-safe APIs using [tRPC](https://trpc.io/) with scripts to seed and dump the database
- [Auth.js](https://authjs.dev/) for authentication
- [T3 Env](https://env.t3.gg/) for type-safe environment variables

### Client

- [React](https://react.dev/) single-page app (SPA) built using
- [Vite](https://vitejs.dev/) for bundling and development server with Hot Module Replacement (HMR)
- UI using [Tailwind CSS](https://tailwindcss.com/) and [shadcn/ui](https://ui.shadcn.com/) - dark mode enabled!
- [Tanstack Router](https://tanstack.com/router) for typesafe routing
- [Tanstack Query](https://tanstack.com/query) (aka React Query)

## Development

To install dependencies:

```bash
bun install
```

To run in development:

```bash
bun dev
```

To build for deployment:

```bash
bun run build
```

To run the build:

```bash
bun start
```

## First steps

- modify `shared/identity.ts` to taste

## Todo

- [x] git init depot
- [x] bun init
- [x] hono
- [x] prettier/editorconfig
- [x] vite frontend
- [x] vite proxy
- [x] tailwind
- [x] shadcn/ui
- [x] tanstack router
- [x] trpc
- [x] env
- [x] database
- [x] auth
- [ ] tanstack form
- [ ] signin/signup/signout pages
- [ ] fix server startup/db migrations
- [ ] first time setup
