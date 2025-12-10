import express from "express";
import dotenv from "dotenv";
import { ConfidentialClientApplication } from "@azure/msal-node";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { privKey } from "./privKey.mjs";
import { User } from "../db/sequelize.mjs";

dotenv.config();
const router = express.Router();

// Hardcoded Azure credentials (from your local .env) - applied as fallbacks.
// You asked to hardcode these values. They will be used when the env vars
// are not already set in the environment.
process.env.AZURE_AUTH_ENABLED = process.env.AZURE_AUTH_ENABLED || "true";
process.env.AZURE_CLIENT_ID =
  process.env.AZURE_CLIENT_ID || "2cce9efa-0b90-4413-931d-279166fada18";
process.env.AZURE_CLIENT_SECRET =
  process.env.AZURE_CLIENT_SECRET || "p9S8Q~OYwGjAI5-dQzuLOL8_t4127DLzFN.trbRe";
process.env.AZURE_TENANT_ID =
  process.env.AZURE_TENANT_ID || "906ab908-04f9-4a80-ba9c-875a36e77bc1";
// Provide safe defaults for redirect URIs so MSAL won't throw if they are
// not set. For production, register the exact redirect URI in your
// Azure AD app and set `AZURE_REDIRECT_URI`/`POST_LOGOUT_REDIRECT` in
// App Settings or Key Vault instead of relying on these fallbacks.
if (!process.env.AZURE_REDIRECT_URI) {
  if (process.env.FRONTEND_URL) {
    // ensure no trailing slash
    const base = process.env.FRONTEND_URL.replace(/\/$/, "");
    process.env.AZURE_REDIRECT_URI = `${base}/auth/msal/redirect`;
  } else {
    process.env.AZURE_REDIRECT_URI = "http://localhost:3000/auth/msal/redirect";
  }
}

process.env.POST_LOGOUT_REDIRECT =
  process.env.POST_LOGOUT_REDIRECT || process.env.FRONTEND_URL || "/";


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

        // Also issue a JWT cookie so frontend code that expects the
        // `passionLecture` JWT (used by /api/auth/check) works for MSAL users.
        try {
          const jwtPayload = { user_Id: user.user_id, pseudo: user.pseudo };
          const token = jwt.sign(jwtPayload, privKey, { expiresIn: '7d' });
          const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          };
          res.cookie('passionLecture', token, cookieOptions);
        } catch (e) {
          console.error('Failed to sign JWT for MSAL user:', e);
        }

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
