HTTP Comment Function
====================

What this does:
- Provides an HTTP-triggered Azure Function that creates a comment in the existing MySQL DB using the project's shared Sequelize setup.

Location:
- `code/backend/functions/HttpCommentFunction`

Local run:
1. Install the Azure Functions Core Tools and Node 18+.
2. From `code/backend/functions` run `npm install`.
3. Set your DB connection env vars in `local.settings.json` (or the environment): `DB_REMOTE_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.
4. Start the Functions host:
   func start

Sample request:

POST http://localhost:7071/api/HttpCommentFunction
Content-Type: application/json

{
  "livre_fk": 1,
  "user_fk": 2,
  "contenu": "Great book!"
}

Notes and caveats:
- This function dynamically imports the project's `src/db/sequelize.mjs` to reuse models. Ensure the function host runs with the same Node version and environment variables as your app.
- On Windows the dynamic import path may need adjustment if you hit path resolution errors; I can update this to a safer absolute `file://` import if you want.
- I left the application routes unchanged — your client can POST directly to this function URL instead of the app. If you prefer the app to push to the function, I can patch the route.
