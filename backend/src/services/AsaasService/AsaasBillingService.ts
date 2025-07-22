import axios, { AxiosResponse } from "axios";
import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";
import Company from "../../models/Company";
import Invoices from "../../models/Invoices";
import AsaasCustomerService from "./AsaasCustomerService";

interface AsaasPaymentData {
  customer: string;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  discount?: {
    value: number;
    dueDateLimitDays: number;
  };
  interest?: {
    value: number;
  };
  fine?: {
    value: number;
  };
  postalService?: boolean;
}

interface AsaasPaymentResponse {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink: string;
  value: number;
  netValue: number;
  originalValue: number;
  interestValue: number;
  description: string;
  billingType: string;
  canBePaidAfterDueDate: boolean;
  pixTransaction: string;
  status: string;
  dueDate: string;
  originalDueDate: string;
  paymentDate: string;
  clientPaymentDate: string;
  installmentNumber: number;
  invoiceUrl: string;
  invoiceNumber: string;
  externalReference: string;
  deleted: boolean;
  anticipated: boolean;
  anticipable: boolean;
}

class AsaasBillingService {
  private baseURL = "https://www.asaas.com/api/v3";

  private async getAsaasToken(companyId: number): Promise<string> {
    const asaasSetting = await Setting.findOne({
      where: {
        key: "asaas",
        companyId
      }
    });

    if (!asaasSetting || !asaasSetting.value) {
      throw new AppError("Token do Asaas não configurado para esta empresa", 400);
    }

    return asaasSetting.value;
  }

  private getHeaders(accessToken: string) {
    return {
      "Content-Type": "application/json",
      "access_token": accessToken
    };
  }

  async createPayment(
    company: Company,
    invoice: Invoices,
    billingType: "BOLETO" | "PIX" = "PIX"
  ): Promise<AsaasPaymentResponse> {
    try {
      const accessToken = await this.getAsaasToken(company.id);
      
      // Garantir que cliente existe no Asaas
      const customerId = await AsaasCustomerService.ensureCustomerExists(company);

      const paymentData: AsaasPaymentData = {
        customer: customerId,
        billingType,
        value: parseFloat(invoice.value.toString()),
        dueDate: invoice.dueDate.toISOString().split('T')[0],
        description: `${invoice.detail} - Fatura #${invoice.id}`,
        externalReference: `INVOICE_${invoice.id}`,
        postalService: false
      };

      // Configurar desconto para pagamento antecipado (5% até 5 dias antes do vencimento)
      paymentData.discount = {
        value: 5.00, // 5% de desconto
        dueDateLimitDays: 5
      };

      // Configurar juros de mora (2% ao mês)
      paymentData.interest = {
        value: 2.00
      };

      // Configurar multa por atraso (2%)
      paymentData.fine = {
        value: 2.00
      };

      const response: AxiosResponse<AsaasPaymentResponse> = await axios.post(
        `${this.baseURL}/payments`,
        paymentData,
        { headers: this.getHeaders(accessToken) }
      );

      // Atualizar invoice com dados do Asaas
      await invoice.update({
        asaasPaymentId: response.data.id,
        paymentLink: response.data.paymentLink,
        invoiceUrl: response.data.invoiceUrl
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao criar cobrança no Asaas:", error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.description).join(", ");
        throw new AppError(`Erro no Asaas: ${errorMessages}`, 400);
      }
      throw new AppError("Erro ao criar cobrança no Asaas", 500);
    }
  }

  async getPaymentById(paymentId: string, companyId: number): Promise<AsaasPaymentResponse> {
    try {
      const accessToken = await this.getAsaasToken(companyId);

      const response: AxiosResponse<AsaasPaymentResponse> = await axios.get(
        `${this.baseURL}/payments/${paymentId}`,
        { headers: this.getHeaders(accessToken) }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar cobrança no Asaas:", error);
      throw new AppError("Erro ao buscar cobrança no Asaas", 500);
    }
  }

  async getPixQrCode(paymentId: string, companyId: number): Promise<{ success: boolean; payload: string; expirationDate: string }> {
    try {
      const accessToken = await this.getAsaasToken(companyId);

      const response: AxiosResponse<{ success: boolean; payload: string; expirationDate: string }> = await axios.get(
        `${this.baseURL}/payments/${paymentId}/pixQrCode`,
        { headers: this.getHeaders(accessToken) }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar QR Code PIX no Asaas:", error);
      throw new AppError("Erro ao buscar QR Code PIX no Asaas", 500);
    }
  }

  async getBankSlipBarCode(paymentId: string, companyId: number): Promise<{ identificationField: string; barCode: string }> {
    try {
      const accessToken = await this.getAsaasToken(companyId);

      const response: AxiosResponse<{ identificationField: string; barCode: string }> = await axios.get(
        `${this.baseURL}/payments/${paymentId}/identificationField`,
        { headers: this.getHeaders(accessToken) }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar código de barras no Asaas:", error);
      throw new AppError("Erro ao buscar código de barras no Asaas", 500);
    }
  }

  async cancelPayment(paymentId: string, companyId: number): Promise<AsaasPaymentResponse> {
    try {
      const accessToken = await this.getAsaasToken(companyId);

      const response: AxiosResponse<AsaasPaymentResponse> = await axios.delete(
        `${this.baseURL}/payments/${paymentId}`,
        { headers: this.getHeaders(accessToken) }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao cancelar cobrança no Asaas:", error);
      throw new AppError("Erro ao cancelar cobrança no Asaas", 500);
    }
  }

  async listOverduePayments(customerId: string, companyId: number): Promise<AsaasPaymentResponse[]> {
    try {
      const accessToken = await this.getAsaasToken(companyId);

      const response: AxiosResponse<{ data: AsaasPaymentResponse[]; totalCount: number }> = await axios.get(
        `${this.baseURL}/payments`,
        {
          params: { customer: customerId, status: 'OVERDUE' },
          headers: this.getHeaders(accessToken)
        }
      );

      return response.data.data;
    } catch (error) {
      console.error("Erro ao buscar cobranças em atraso no Asaas:", error);
      return [];
    }
  }

  async listPendingPayments(customerId: string, companyId: number): Promise<AsaasPaymentResponse[]> {
    try {
      const accessToken = await this.getAsaasToken(companyId);

      const response: AxiosResponse<{ data: AsaasPaymentResponse[]; totalCount: number }> = await axios.get(
        `${this.baseURL}/payments`,
        {
          params: { customer: customerId, status: 'PENDING' },
          headers: this.getHeaders(accessToken)
        }
      );

      return response.data.data;
    } catch (error) {
      console.error("Erro ao buscar cobranças pendentes no Asaas:", error);
      return [];
    }
  }

  /**
   * Processa webhook do Asaas para atualizar status de pagamentos
   */
  async processWebhook(webhookData: any): Promise<void> {
    try {
      const { event, payment } = webhookData;
      
      if (!payment || !payment.externalReference) {
        return;
      }

      // Extrair ID da invoice do externalReference
      const invoiceId = payment.externalReference.replace('INVOICE_', '');
      
      const invoice = await Invoices.findByPk(invoiceId);
      if (!invoice) {
        console.warn(`Invoice não encontrada: ${invoiceId}`);
        return;
      }

      // Atualizar status baseado no evento
      switch (event) {
        case 'PAYMENT_RECEIVED':
          await invoice.update({ 
            status: 'paid',
            paymentDate: payment.paymentDate 
          });
          
          // Atualizar data de vencimento da empresa
          const company = await Company.findByPk(invoice.companyId);
          if (company) {
            const currentDueDate = new Date(company.dueDate);
            const newDueDate = new Date(currentDueDate);
            newDueDate.setMonth(newDueDate.getMonth() + 1); // Adicionar 1 mês
            
            await company.update({ 
              dueDate: newDueDate.toISOString().split('T')[0],
              status: true // Reativar empresa se estiver inativa
            });
          }
          break;

        case 'PAYMENT_OVERDUE':
          await invoice.update({ status: 'overdue' });
          break;

        case 'PAYMENT_DELETED':
          await invoice.update({ status: 'cancelled' });
          break;

        default:
          console.log(`Evento não tratado: ${event}`);
      }
    } catch (error) {
      console.error("Erro ao processar webhook do Asaas:", error);
      throw error;
    }
  }
}

export default new AsaasBillingService(); 