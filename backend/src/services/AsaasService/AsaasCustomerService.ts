import axios, { AxiosResponse } from "axios";
import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";
import Company from "../../models/Company";

interface AsaasCustomerData {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

interface AsaasCustomerResponse {
  object: string;
  id: string;
  dateCreated: string;
  name: string;
  email: string;
  phone: string;
  mobilePhone: string;
  address: string;
  addressNumber: string;
  complement: string;
  province: string;
  city: string;
  state: string;
  postalCode: string;
  cpfCnpj: string;
  personType: string;
  deleted: boolean;
  additionalEmails: string;
  externalReference: string;
  notificationDisabled: boolean;
  city_ibge?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

class AsaasCustomerService {
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

  async createCustomer(companyData: Company): Promise<AsaasCustomerResponse> {
    try {
      const accessToken = await this.getAsaasToken(companyData.id);
      
      // Validar dados obrigatórios
      if (!companyData.cpfCnpj) {
        throw new AppError("CPF/CNPJ é obrigatório para criar cliente no Asaas", 400);
      }

      // Verificar se cliente já existe
      const existingCustomer = await this.findCustomerByCpfCnpj(companyData.cpfCnpj, companyData.id);
      if (existingCustomer) {
        // Atualizar ID do cliente na empresa
        await companyData.update({ asaasCustomerId: existingCustomer.id });
        return existingCustomer;
      }

      const customerData: AsaasCustomerData = {
        name: companyData.name,
        cpfCnpj: companyData.cpfCnpj,
        email: companyData.email,
        phone: companyData.phone,
        mobilePhone: companyData.phone,
        address: companyData.address,
        addressNumber: companyData.addressNumber,
        complement: companyData.complement,
        province: companyData.province,
        city: companyData.city,
        state: companyData.state,
        postalCode: companyData.postalCode,
        externalReference: `COMPANY_${companyData.id}`,
        notificationDisabled: false
      };

      const response: AxiosResponse<AsaasCustomerResponse> = await axios.post(
        `${this.baseURL}/customers`,
        customerData,
        { headers: this.getHeaders(accessToken) }
      );

      // Atualizar empresa com ID do cliente Asaas
      await companyData.update({ asaasCustomerId: response.data.id });

      return response.data;
    } catch (error) {
      console.error("Erro ao criar cliente no Asaas:", error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.description).join(", ");
        throw new AppError(`Erro no Asaas: ${errorMessages}`, 400);
      }
      throw new AppError("Erro ao criar cliente no Asaas", 500);
    }
  }

  async findCustomerByCpfCnpj(cpfCnpj: string, companyId: number): Promise<AsaasCustomerResponse | null> {
    try {
      const accessToken = await this.getAsaasToken(companyId);
      
      const response: AxiosResponse<{ data: AsaasCustomerResponse[]; totalCount: number }> = await axios.get(
        `${this.baseURL}/customers`,
        {
          params: { cpfCnpj },
          headers: this.getHeaders(accessToken)
        }
      );

      return response.data.totalCount > 0 ? response.data.data[0] : null;
    } catch (error) {
      console.error("Erro ao buscar cliente no Asaas:", error);
      return null;
    }
  }

  async updateCustomer(customerId: string, companyData: Company): Promise<AsaasCustomerResponse> {
    try {
      const accessToken = await this.getAsaasToken(companyData.id);

      const customerData: Partial<AsaasCustomerData> = {
        name: companyData.name,
        email: companyData.email,
        phone: companyData.phone,
        mobilePhone: companyData.phone,
        address: companyData.address,
        addressNumber: companyData.addressNumber,
        complement: companyData.complement,
        province: companyData.province,
        city: companyData.city,
        state: companyData.state,
        postalCode: companyData.postalCode
      };

      const response: AxiosResponse<AsaasCustomerResponse> = await axios.put(
        `${this.baseURL}/customers/${customerId}`,
        customerData,
        { headers: this.getHeaders(accessToken) }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar cliente no Asaas:", error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map((err: any) => err.description).join(", ");
        throw new AppError(`Erro no Asaas: ${errorMessages}`, 400);
      }
      throw new AppError("Erro ao atualizar cliente no Asaas", 500);
    }
  }

  async getCustomerById(customerId: string, companyId: number): Promise<AsaasCustomerResponse> {
    try {
      const accessToken = await this.getAsaasToken(companyId);

      const response: AxiosResponse<AsaasCustomerResponse> = await axios.get(
        `${this.baseURL}/customers/${customerId}`,
        { headers: this.getHeaders(accessToken) }
      );

      return response.data;
    } catch (error) {
      console.error("Erro ao buscar cliente por ID no Asaas:", error);
      throw new AppError("Erro ao buscar cliente no Asaas", 500);
    }
  }

  async ensureCustomerExists(companyData: Company): Promise<string> {
    // Se já tem ID do cliente, verificar se ainda existe
    if (companyData.asaasCustomerId) {
      try {
        await this.getCustomerById(companyData.asaasCustomerId, companyData.id);
        return companyData.asaasCustomerId;
      } catch (error) {
        // Cliente não existe mais, criar novo
        companyData.asaasCustomerId = null;
      }
    }

    // Criar ou encontrar cliente
    const customer = await this.createCustomer(companyData);
    return customer.id;
  }
}

export default new AsaasCustomerService(); 