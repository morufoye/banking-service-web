# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Run the banking stack behind Nginx

The Nginx proxy is the only host-published service. It listens on HTTP port 80
and routes every service through a path on the shared Docker network. No
application service port is published directly on the host. This HTTP-only
setup is for temporary LAN testing and does not encrypt traffic.

Copy `deployment/.env.example` to `deployment/.env` and set the database
credentials. Start the separate infrastructure stack first; it must create `banking-network`, with
`postgres-banking` and `keycloak` reachable on that network. Keycloak remains
available to the consolidated service on the internal Docker network only; do
not publish its port or proxy its login/admin routes to browsers.

The frontend login page submits credentials to `POST
/consolidated/api/auth/login`, which the proxy forwards to the consolidated
service's `POST /api/auth/login` AuthController. The AuthController talks to
Keycloak internally. The frontend does not redirect to Keycloak or load its
JavaScript adapter. The returned access token is held in session storage and
sent as a bearer token to the banking API. Signing out clears the browser token;
because there is no refresh or revocation endpoint in this temporary flow, users
must sign in again after the access token expires. `VITE_AUTH_API_URL` and
`VITE_API_URL` are embedded at image build time.

Build and publish the web image from this project:

```sh
./build-and-push.sh
```

The script uses `WEB_TAG` (default `1.5`), matching the web image variable in
both Compose files. After publishing a tag that is already deployed, pull it and
recreate the web container so it does not continue using the cached image:

```sh
docker compose -f deployment/docker-compose.yml --env-file deployment/.env pull web
docker compose -f deployment/docker-compose.yml --env-file deployment/.env up -d --force-recreate web
```

The deployment-only Compose, environment, Nginx, and certificate setup files
are kept in `deployment/`, separate from the frontend application source.
Deploy `deployment/docker-compose.yml` and `deployment/.env` to the server;
copy `deployment/nginx-proxy.conf` to the server's mounted
`/opt/banking-nginx/conf.d/` configuration directory, then
reload/recreate the proxy so the Keycloak browser routes are removed.
Start the proxy stack:

```sh
docker compose -f deployment/docker-compose.yml --env-file deployment/.env pull web
docker compose -f deployment/docker-compose.yml --env-file deployment/.env up -d
```

Open the configured public frontend URL. The services routed through Nginx are
the web app (all other paths), the banking API (`/api/`), and the consolidated
API (`/consolidated/`, with the prefix removed). Keycloak login, admin, realms,
resources, and JavaScript routes are not exposed. Downstream services remain
internal on the Docker network and are not routed by Nginx or published on the
host.

The database URL uses `BANKING_DB_HOST` and `BANKING_DB_CONTAINER_PORT` from
`deployment/.env` (default `postgres-banking:5432`). These are the database's Docker
network alias and internal container port; the host-published port `5432` alone
does not make the database reachable from containers on another network. The
database name, username, and password in `deployment/.env` must also match the
banking database container's initialization settings.

The Compose file connects the consolidated API to the downstream ports configured
in `Middleware-consolidated-services`: customer `9080`, teller `9081`, account
`9082`, account stats `9083`, account finance `9085`, DE `9086`, BST `9087`,
image `9088`, and account class `9089`. The provided registry images cover all
of these except BST and image; those URLs default to services listening on the
Docker host, and can be overridden in `deployment/.env`.

Before using authenticated endpoints, provision the `banking` realm, clients, and
roles in Keycloak to match the backend and consolidated services. Passwords in
`deployment/.env` are for local development only and must not be reused in production.
# banking-service-web
