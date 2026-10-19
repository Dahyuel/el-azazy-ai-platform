# Setup guide

## Dashboard

Requires Node.js 22.13+ (or a compatible newer release with `node:sqlite`), npm, and a separate Chatwoot installation with PostgreSQL access.

1. In `dashboard/`, install dependencies with `npm ci`.
2. Copy `.env.example` to `.env` and configure your own endpoints and credentials.
3. Generate a random 32-byte session key using the command in the example.
4. Supply a dedicated PostgreSQL role with SELECT-only access to the Chatwoot tables/columns queried in `backend/server.cjs` and `backend/management.cjs`. Do not grant writes or access to password/token columns.
5. Run `node --env-file=.env backend/server.cjs` from `dashboard/`.
6. Open `http://127.0.0.1:8787` and sign in with an administrator account in your own Chatwoot installation.

The source currently targets Chatwoot account ID 2 and project-specific inbox/user IDs, including AI sender ID 2. Inspect and adapt these mappings before using another installation. It assumes the documented Chatwoot v4.17-era database layout; schema compatibility must be reviewed for other versions.

Background collection is disabled in the example for first-time setup. Enable it only after reviewing account mappings and database access. Keep GROQ_API_KEY blank until you intentionally authorize external evaluation. The model identifier is inherited configuration, not a guarantee of future provider availability.

The PostgreSQL database name is currently `chatwoot` in the source. The dashboard does not provision Chatwoot, WhatsApp, Redis, PostgreSQL or user accounts.

## Saved Gemini evidence

The integration helpers expect n8n file access under `/files/audit-media`. Review helper paths and runtime availability before connecting capture nodes. The dashboard reads a consistent SQLite snapshot at `/evidence/dashboard-evidence.sqlite`; without this optional mount, saved media evidence is unavailable. The snapshot helper expects the source evidence database under `/files/audit-media/data`. Production schedules are intentionally not exported.

## n8n

Import workflow JSON into a separate development project. All exports are inactive and credential references have been removed. Reconnect every provider, Chatwoot and Redis credential; replace placeholder endpoints/tokens; configure pricing/catalog inputs and file mounts; review workflow IDs and Execute Workflow references. No automatic cross-workflow remapping or infrastructure provisioning is supplied. Never activate these directly against production without reviewing node parameters and mappings.

## Services and routing

Service Dockerfiles/package manifests and source are included. Production compose/environment files are excluded. Create your own compose deployment after reviewing dependencies, internal URLs, storage and limits. Analyzer and bundler each have their own build directory, Dockerfile, package.json, server.js and lib directory under services/. Build from the individual service directory.

Routing scripts are examples tied to the original account/inbox mappings. They mutate assignments when run. Do not schedule them against a live instance before adapting and reviewing their behavior.

## Exposure and backups

The example binds to localhost. Keep it private or configure your own TLS reverse proxy and access controls. Encrypted backups contain sensitive dashboard configuration: never commit backup archives or recovery keys, and keep keys separate from archives.
