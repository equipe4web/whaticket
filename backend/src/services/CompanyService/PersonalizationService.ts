import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import fs from "fs";
import path from "path";

interface PersonalizationData {
  companyId: number;
  logoLight?: string;
  logoDark?: string;
  logoFavicon?: string;
  logoLogin?: string;
  primaryColorLight?: string;
  primaryColorDark?: string;
  secondaryColorLight?: string;
  secondaryColorDark?: string;
  customCss?: string;
  brandName?: string;
}

interface LogoUploadData {
  companyId: number;
  logoType: 'light' | 'dark' | 'favicon' | 'login';
  fileName: string;
}

class PersonalizationService {
  
  static async updatePersonalization(data: PersonalizationData): Promise<Company> {
    const { companyId, ...personalizationData } = data;
    
    const company = await Company.findByPk(companyId);
    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    await company.update(personalizationData);
    return company;
  }

  static async uploadLogo(data: LogoUploadData): Promise<string> {
    const { companyId, logoType, fileName } = data;
    
    const company = await Company.findByPk(companyId);
    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    // Criar diretório da empresa se não existir
    const companyDir = path.resolve(__dirname, "..", "..", "..", "public", `company${companyId}`, "logos");
    if (!fs.existsSync(companyDir)) {
      fs.mkdirSync(companyDir, { recursive: true });
      fs.chmodSync(companyDir, 0o777);
    }

    // Atualizar banco de dados com o novo logo
    const logoPath = `company${companyId}/logos/${fileName}`;
    const updateField = logoType === 'light' ? 'logoLight' :
                      logoType === 'dark' ? 'logoDark' :
                      logoType === 'favicon' ? 'logoFavicon' : 'logoLogin';

    await company.update({ [updateField]: logoPath });

    return logoPath;
  }

  static async getPersonalization(companyId: number): Promise<Company> {
    const company = await Company.findByPk(companyId, {
      attributes: [
        'id', 'name', 'logoLight', 'logoDark', 'logoFavicon', 'logoLogin',
        'primaryColorLight', 'primaryColorDark', 'secondaryColorLight', 
        'secondaryColorDark', 'customCss', 'brandName'
      ]
    });

    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    return company;
  }

  static async deleteLogo(companyId: number, logoType: 'light' | 'dark' | 'favicon' | 'login'): Promise<void> {
    const company = await Company.findByPk(companyId);
    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    const updateField = logoType === 'light' ? 'logoLight' :
                      logoType === 'dark' ? 'logoDark' :
                      logoType === 'favicon' ? 'logoFavicon' : 'logoLogin';

    const currentLogo = company[updateField];
    
    if (currentLogo) {
      // Remover arquivo físico
      const filePath = path.resolve(__dirname, "..", "..", "..", "public", currentLogo);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Limpar campo no banco
    await company.update({ [updateField]: null });
  }

  static getDefaultLogos() {
    return {
      light: "assets/vector/logo.svg",
      dark: "assets/vector/logo-dark.svg", 
      favicon: "assets/vector/favicon.svg",
      login: "assets/vector/logo.svg"
    };
  }

  static getDefaultColors() {
    return {
      primaryColorLight: "#2DDD7F",
      primaryColorDark: "#FFFFFF",
      secondaryColorLight: "#F3F3F3", 
      secondaryColorDark: "#333333"
    };
  }

  static async getCompanyAssets(companyId: number) {
    const company = await this.getPersonalization(companyId);
    const defaultLogos = this.getDefaultLogos();
    const defaultColors = this.getDefaultColors();

    return {
      logos: {
        light: company.logoLight || defaultLogos.light,
        dark: company.logoDark || defaultLogos.dark,
        favicon: company.logoFavicon || defaultLogos.favicon,
        login: company.logoLogin || defaultLogos.login
      },
      colors: {
        primaryColorLight: company.primaryColorLight || defaultColors.primaryColorLight,
        primaryColorDark: company.primaryColorDark || defaultColors.primaryColorDark,
        secondaryColorLight: company.secondaryColorLight || defaultColors.secondaryColorLight,
        secondaryColorDark: company.secondaryColorDark || defaultColors.secondaryColorDark
      },
      brandName: company.brandName || "Whaticket SaaS",
      customCss: company.customCss || ""
    };
  }
}

export default PersonalizationService; 