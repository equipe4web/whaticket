import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as AsaasController from "../controllers/AsaasController";

const asaasRoutes = Router();

// Webhook público (sem autenticação)
asaasRoutes.post("/asaas/webhook", AsaasController.webhook);

// Rotas privadas (com autenticação)
asaasRoutes.post("/asaas/payment", isAuth, AsaasController.createPayment);
asaasRoutes.get("/asaas/payment/:paymentId", isAuth, AsaasController.getPaymentDetails);
asaasRoutes.get("/asaas/payment/:paymentId/pix", isAuth, AsaasController.getPixQrCode);
asaasRoutes.get("/asaas/payment/:paymentId/barcode", isAuth, AsaasController.getBankSlipBarCode);
asaasRoutes.post("/asaas/customer", isAuth, AsaasController.createAsaasCustomer);
asaasRoutes.post("/asaas/customer/sync", isAuth, AsaasController.syncAsaasCustomer);

export default asaasRoutes; 