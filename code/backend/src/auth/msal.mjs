import express from "express";
import dotenv from "dotenv";
import { ConfidentialClientApplication } from "@azure/msal-node";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { User } from "../db/sequelize.mjs";

dotenv.config();
const router = express.Router();

const AZURE_ENABLED =
  process.env.AZURE_AUTH_ENABLED === "true" ||
  process.env.AZURE_AUTH_ENABLED === "1";

if (!AZURE_ENABLED) {
  console.info("MSAL is disabled via AZURE_AUTH_ENABLED; msal routes will not perform auth.");
  // Provide minimal routes so importing doesn't break if accidentally mounted.
  router.get("/login", (req, res) => {
    res.status(503).send("MSAL authentication is disabled on this server.");
  });
  router.get("/redirect", (req, res) => {
    res.status(503).send("MSAL authentication is disabled on this server.");
  });
  router.get("/logout", (req, res) => {
    res.status(503).send("MSAL authentication is disabled on this server.");
  });
} else {
  // When enabled, ensure required env vars are present before creating ConfidentialClientApplication
  const missing = [];
  if (!process.env.AZURE_CLIENT_ID) missing.push("AZURE_CLIENT_ID");
  if (!process.env.AZURE_CLIENT_SECRET) missing.push("AZURE_CLIENT_SECRET");
  if (!process.env.AZURE_TENANT_ID) missing.push("AZURE_TENANT_ID");
  if (missing.length > 0) {
    console.error(
      `MSAL is enabled but missing required environment variables: ${missing.join(", ")}`
    );
    // Router returns 500 for safety and a clear message rather than crashing at import time.
    router.use((req, res) => {
      res
        .status(500)
        .send(`MSAL is enabled but missing required environment variables: ${missing.join(", ")}`);
    });
  } else {
    const msalConfig = {
      auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
      },
    };

    const cca = new ConfidentialClientApplication(msalConfig);
    const REDIRECT_URI = process.env.AZURE_REDIRECT_URI;
    const SCOPES = ["openid", "profile", "email", "User.Read"];

    router.get("/login", async (req, res) => {
      const state = req.query.return || "/";
      const authCodeUrlParameters = {
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
        state,
      };
      try {
        const authUrl = await cca.getAuthCodeUrl(authCodeUrlParameters);
        res.redirect(authUrl);
      } catch (err) {
        console.error("MSAL getAuthCodeUrl error", err);
        res.status(500).send("Auth start failed");
      }
    });

    router.get("/redirect", async (req, res) => {
      if (!req.query.code) return res.status(400).send("No code returned");
      const tokenRequest = {
        code: req.query.code,
        scopes: SCOPES,
        redirectUri: REDIRECT_URI,
      };
      try {
        const response = await cca.acquireTokenByCode(tokenRequest);
        const claims = response.idTokenClaims || {};

        // use preferred_username or email as pseudo
        const email =
          claims.preferred_username || claims.email || claims.upn || claims.name || "msal_user";

        // find or create a local user record (DB user requires a password field)
        let [user, created] = await User.findOrCreate({
          where: { pseudo: email },
          defaults: {
            pseudo: email,
            password: await bcrypt.hash(crypto.randomBytes(16).toString("hex"), 10),
          },
        });

        // store light-weight session info
        req.session.auth = {
          user: { id: user.user_id, pseudo: user.pseudo },
          idTokenClaims: claims,
          accessToken: response.accessToken,
        };

        const dest = req.query.state || "/";
        res.redirect(dest);
      } catch (err) {
        console.error("MSAL callback error", err);
        res.status(500).send("Auth callback failed");
      }
    });

    router.get("/logout", (req, res) => {
      req.session.destroy(() => {
        const logoutUrl = `${msalConfig.auth.authority}/oauth2/v2.0/logout?post_logout_redirect_uri=${encodeURIComponent(
          process.env.POST_LOGOUT_REDIRECT || "/"
        )}`;
        res.redirect(logoutUrl);
      });
    });
  }
}

export default router;
