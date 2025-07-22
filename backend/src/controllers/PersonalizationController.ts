import { Request, Response } from "express";
import PersonalizationService from "../services/CompanyService/PersonalizationService";
import { getIO } from "../libs/socket";

export const getPersonalization = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    const personalization = await PersonalizationService.getPersonalization(companyId);
    return res.json(personalization);
  } catch (error) {
    console.error("Erro ao buscar personalização:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const updatePersonalization = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const personalizationData = req.body;

  try {
    const company = await PersonalizationService.updatePersonalization({
      companyId,
      ...personalizationData
    });

    // Emitir evento para clientes conectados
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-personalization`, {
      action: "update",
      personalization: company
    });

    return res.json(company);
  } catch (error) {
    console.error("Erro ao atualizar personalização:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const uploadLogo = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { logoType } = req.body;
  
  if (!req.file) {
    return res.status(400).json({ error: "Nenhum arquivo enviado" });
  }

  try {
    const logoPath = await PersonalizationService.uploadLogo({
      companyId,
      logoType,
      fileName: req.file.filename
    });

    // Emitir evento para clientes conectados
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-personalization`, {
      action: "logo-update",
      logoType,
      logoPath
    });

    return res.json({ 
      success: true, 
      logoPath,
      message: "Logo atualizado com sucesso"
    });
  } catch (error) {
    console.error("Erro ao fazer upload do logo:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const deleteLogo = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { logoType } = req.params;

  try {
    await PersonalizationService.deleteLogo(companyId, logoType as any);

    // Emitir evento para clientes conectados
    const io = getIO();
    io.to(`company-${companyId}-mainchannel`).emit(`company-${companyId}-personalization`, {
      action: "logo-delete",
      logoType
    });

    return res.json({ 
      success: true,
      message: "Logo removido com sucesso"
    });
  } catch (error) {
    console.error("Erro ao deletar logo:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const getCompanyAssets = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    const assets = await PersonalizationService.getCompanyAssets(companyId);
    return res.json(assets);
  } catch (error) {
    console.error("Erro ao buscar assets da empresa:", error);
    return res.status(400).json({ error: error.message });
  }
};

export const getPublicAssets = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.params;

  try {
    const assets = await PersonalizationService.getCompanyAssets(Number(companyId));
    return res.json(assets);
  } catch (error) {
    console.error("Erro ao buscar assets públicos:", error);
    return res.status(400).json({ error: error.message });
  }
}; 