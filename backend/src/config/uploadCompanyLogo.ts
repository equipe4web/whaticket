import path from "path";
import multer from "multer";
import fs from "fs";

const publicFolder = path.resolve(__dirname, "..", "..", "public");

export default {
  directory: publicFolder,
  
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const { companyId } = req.user;
      const logoFolder = path.resolve(publicFolder, `company${companyId}`, "logos");
      
      if (!fs.existsSync(logoFolder)) {
        fs.mkdirSync(logoFolder, { recursive: true });
        fs.chmodSync(logoFolder, 0o777);
      }
      
      return cb(null, logoFolder);
    },
    filename: (req, file, cb) => {
      const { logoType } = req.body;
      const extension = path.extname(file.originalname);
      const fileName = `${logoType}-${Date.now()}${extension}`;
      
      return cb(null, fileName);
    }
  }),
  
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = [
      'image/jpeg',
      'image/pjpeg', 
      'image/png',
      'image/gif',
      'image/svg+xml',
      'image/webp'
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo não permitido. Use: JPG, PNG, GIF, SVG ou WebP"));
    }
  },
  
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
}; 