import jwt from "jsonwebtoken";
import { privKey } from "./privKey.mjs";

const auth = (req, res, next) => {
  const token = req.cookies.passionLecture;
  if (!token) {
    return res.status(401).json({
      message: "Aucun jeton d'authentification trouvé dans les cookies.",
    });
  }

  try {
    const decoded = jwt.verify(token, privKey);
    req.user_Id = decoded.user_Id;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Accès refusé, jeton invalide ou expiré.",
    });
  }
};

export default auth;
