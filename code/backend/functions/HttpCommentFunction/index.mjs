import dotenv from "dotenv";
dotenv.config({ path: "../local.settings.json" });

// Import the shared sequelize setup from the backend. Path assumes this Functions folder
// is at code/backend/functions and backend code is at code/backend/src
import path from "path";
const sequelizePath = path.resolve(new URL(import.meta.url).pathname, "../../src/db/sequelize.mjs");

// Dynamic import because we're inside a function runtime and want to reuse ESM module
const { Comment } = await import(sequelizePath);

export default async function (context, req) {
  context.log("HTTP function received a request to create a comment");
  try {
    const body = req.body || {};
    const { livre_fk, user_fk, contenu } = body;
    if (!livre_fk || !user_fk || !contenu) {
      context.res = { status: 400, body: { error: "Missing required fields: livre_fk, user_fk, contenu" } };
      return;
    }

    const created = await Comment.create({ livre_fk, user_fk, contenu });

    context.res = {
      status: 201,
      body: { message: "Comment created", comment: created }
    };
  } catch (err) {
    context.log.error(err);
    context.res = { status: 500, body: { error: err.message || String(err) } };
  }
}
