import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import uploadCompanyLogo from "../config/uploadCompanyLogo";
import * as PersonalizationController from "../controllers/PersonalizationController";

const upload = multer(uploadCompanyLogo);
const personalizationRoutes = Router();

// Rotas protegidas (precisam de autenticação)
personalizationRoutes.get("/personalization", isAuth, PersonalizationController.getPersonalization);
personalizationRoutes.put("/personalization", isAuth, PersonalizationController.updatePersonalization);
personalizationRoutes.get("/personalization/assets", isAuth, PersonalizationController.getCompanyAssets);

// Upload de logos
personalizationRoutes.post("/personalization/logo", 
  isAuth, 
  upload.single("logo"), 
  PersonalizationController.uploadLogo
);

// Deletar logo
personalizationRoutes.delete("/personalization/logo/:logoType", 
  isAuth, 
  PersonalizationController.deleteLogo
);

// Rota pública para acessar assets da empresa (para login, etc)
personalizationRoutes.get("/personalization/public/:companyId", 
  PersonalizationController.getPublicAssets
);

export default personalizationRoutes; 