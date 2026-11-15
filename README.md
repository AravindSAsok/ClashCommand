# ClashCommand

<p align="center">
  <strong>Clash of Clans clan, player, and war operations in one dashboard.</strong>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" />
  <img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql" />
  <img alt="Drizzle ORM" src="https://img.shields.io/badge/ORM-Drizzle-C5F74F" />
  <img alt="Tests" src="https://img.shields.io/badge/Tests-Vitest%20%2B%20Playwright-6E9F18" />
</p>

ClashCommand is a web dashboard for organizing saved Clash of Clans clan data, player profiles, and war history. It provides an authenticated application interface, a relational data model, API routes for managing clan and member records, and a synchronization script for refreshing clan data from the Clash of Clans API.

## Core capabilities

- **Dashboard overview:** active clans, active memberships, saved wars, and recorded win rate.
- **Clan management:** browse saved clans, inspect clan details, import clans, and manage membership and roles.
- **Player directory:** search player profiles and inspect saved player information.
- **War history:** browse recorded wars and their results.
- **War data synchronization:** run the local sync script to refresh saved clans and capture available war and attack information.
- **Authentication:** credentials-based sign-in with NextAuth and role-aware admin operations.
- **Relational persistence:** PostgreSQL with Drizzle ORM and explicit tables for clans, players, memberships, seasons, wars, attacks, defenses, and activity logs.

## Technology

| Area | Stack |
| --- | --- |
| Web framework | Next.js 16 App Router |
| UI | React 19, Tailwind CSS 4, Radix/shadcn-style UI components |
| Language | TypeScript |
| Authentication | NextAuth credentials provider, JWT sessions, bcryptjs |
| Database | PostgreSQL (Neon-compatible) |
| ORM and migrations | Drizzle ORM, Drizzle Kit |
| Charts | Recharts |
| Validation | Zod |
| Testing | Vitest, Testing Library, Playwright |
| Automation | GitHub Actions |

## Architecture

~~~mermaid
flowchart TD
  B[Browser] --> N[Next.js App Router]
  N --> AUTH[NextAuth session and role checks]
  N --> API[Route handlers]
  API --> ORM[Drizzle ORM]
  N --> ORM
  ORM --> DB[(PostgreSQL)]
  SYNC[Local clan sync script] --> COC[Clash of Clans API]
  SYNC --> ORM
  DB --> DASH[Clan, member and war dashboards]
~~~

The deployed dashboard reads the shared database. The administrator runs the synchronization script from a trusted local environment to import or refresh external game data. Keep the Clash of Clans API key and database credentials server-side.

## Data model

The Drizzle schema separates the main domain entities:

- Users and roles
- Clans and clan memberships
- Players
- CWL seasons
- Wars and war participants
- War attacks and defenses
- Activity logs

This structure keeps player identity, clan membership, and war performance independently queryable.

## Local development

### Requirements

- Node.js 20 or later (the project package uses Next.js 16)
- PostgreSQL database
- npm
- Optional Clash of Clans API key for external synchronization

### 1. Clone and install

~~~bash
git clone https://github.com/AravindSAsok/ClashCommand.git
cd ClashCommand
npm install
~~~

### 2. Configure environment

Copy .env.example to .env and set the values for your local environment:

~~~dotenv
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clash_command"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="replace-with-a-strong-password"
COC_API_KEY=""
~~~

Generate a strong secret for NEXTAUTH_SECRET. Use a unique admin password. Never commit a real .env file or Clash of Clans API key.

The first admin account is bootstrapped only when the configured ADMIN_EMAIL and ADMIN_PASSWORD match during sign-in. Change the example credentials before starting the app.

### 3. Prepare the database

Generate and apply the Drizzle migrations using the project's configured database:

~~~bash
npm run db:generate
npm run db:migrate
~~~

For an existing database, inspect the generated migration before applying it. Do not run schema push or migrations against production without reviewing the SQL and taking an appropriate backup.

### 4. Start the app

~~~bash
npm run dev
~~~

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command | Purpose |
| --- | --- |
| npm run dev | Start the Next.js development server |
| npm run build | Create a production build |
| npm run start | Start the production server |
| npm run lint | Run ESLint |
| npm run test | Run Vitest tests |
| npm run test:watch | Run Vitest in watch mode |
| npm run test:e2e | Run Playwright end-to-end tests |
| npm run db:generate | Generate Drizzle migrations |
| npm run db:migrate | Apply Drizzle migrations |
| npm run db:push | Push the current schema to the configured database |
| npm run db:studio | Open Drizzle Studio |
| npm run sync:clans | Run the clan data synchronization script |

## Clan data synchronization

The sync script is designed to run from a trusted local environment with database and Clash of Clans API credentials configured.

~~~bash
npm run sync:clans
~~~

The web dashboard displays the saved data; it does not run the synchronization job on every page request. Treat the API key as a secret and review the sync output before relying on imported data.

## Deployment notes

The project is a Next.js application and can be deployed to a compatible Node.js hosting platform such as Vercel. Configure the production PostgreSQL connection and authentication secrets in the hosting provider's environment settings. Apply reviewed database migrations before routing production traffic to a release.

Do not expose the admin bootstrap credentials or external API key to browser code.

## Screenshots

Add current application screenshots under docs/screenshots/ when available. The repository README intentionally avoids fabricated screenshots or sample metrics.

## Maintainer

Built by **Aravind S Asok**.

- GitHub: [@AravindSAsok](https://github.com/AravindSAsok)
- Portfolio: [aravindsasok.netlify.app](https://aravindsasok.netlify.app/)

