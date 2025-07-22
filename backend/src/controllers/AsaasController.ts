import { Request, Response } from "express";
import AsaasBillingService from "../services/AsaasService/AsaasBillingService";
import AsaasCustomerService from "../services/AsaasService/AsaasCustomerService";
import Company from "../models/Company";
import Invoices from "../models/Invoices";
import AppError from "../errors/AppError";

export const webhook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const webhookData = req.body;
    
    // Verificar se o webhook é do Asaas (pode verificar header ou outro identificador)
    const userAgent = req.get('User-Agent');
    if (!userAgent || !userAgent.includes('Asaas')) {
      return res.status(400).json({ error: "Webhook não autorizado" });
    }

    // Processar webhook
    await AsaasBillingService.processWebhook(webhookData);
    
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Erro ao processar webhook do Asaas:", error);
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createPayment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { invoiceId, billingType = "PIX" } = req.body;

    const company = await Company.findByPk(companyId);
    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    const invoice = await Invoices.findByPk(invoiceId);
    if (!invoice) {
      throw new AppError("Fatura não encontrada", 404);
    }

    if (invoice.companyId !== companyId) {
      throw new AppError("Fatura não pertence a esta empresa", 403);
    }

    const payment = await AsaasBillingService.createPayment(company, invoice, billingType);
    
    return res.json(payment);
  } catch (error) {
    console.error("Erro ao criar cobrança:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getPaymentDetails = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { paymentId } = req.params;

    const payment = await AsaasBillingService.getPaymentById(paymentId, companyId);
    
    return res.json(payment);
  } catch (error) {
    console.error("Erro ao buscar detalhes do pagamento:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getPixQrCode = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { paymentId } = req.params;

    const pixData = await AsaasBillingService.getPixQrCode(paymentId, companyId);
    
    return res.json(pixData);
  } catch (error) {
    console.error("Erro ao buscar QR Code PIX:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getBankSlipBarCode = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;
    const { paymentId } = req.params;

    const barCodeData = await AsaasBillingService.getBankSlipBarCode(paymentId, companyId);
    
    return res.json(barCodeData);
  } catch (error) {
    console.error("Erro ao buscar código de barras:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createAsaasCustomer = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;

    const company = await Company.findByPk(companyId);
    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    const customer = await AsaasCustomerService.createCustomer(company);
    
    return res.json(customer);
  } catch (error) {
    console.error("Erro ao criar cliente no Asaas:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const syncAsaasCustomer = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { companyId } = req.user;

    const company = await Company.findByPk(companyId);
    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    const customerId = await AsaasCustomerService.ensureCustomerExists(company);
    
    return res.json({ 
      success: true, 
      customerId,
      message: "Cliente sincronizado com sucesso" 
    });
  } catch (error) {
    console.error("Erro ao sincronizar cliente no Asaas:", error);
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    return res.status(500).json({ error: "Erro interno do servidor" });
  }
}; 