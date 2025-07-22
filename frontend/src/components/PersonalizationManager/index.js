import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  FormControl,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Divider,
  Box,
  Alert,
  CircularProgress
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  Colorize,
  AttachFile,
  Delete,
  CloudUpload,
  Palette,
  Image as ImageIcon
} from "@material-ui/icons";
import { toast } from "react-toastify";

import ColorPicker from "../ColorPicker";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1)
  },
  card: {
    marginBottom: theme.spacing(3),
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
  },
  logoPreview: {
    width: "100%",
    maxWidth: 200,
    height: 80,
    objectFit: "contain",
    border: "2px dashed #ddd",
    borderRadius: 8,
    padding: theme.spacing(1),
    backgroundColor: "#fafafa"
  },
  logoPreviewDark: {
    backgroundColor: "#333",
    borderColor: "#555"
  },
  colorAdornment: {
    width: 20,
    height: 20,
    borderRadius: 4,
    border: "1px solid #ddd"
  },
  uploadInput: {
    display: "none"
  },
  uploadButton: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  previewContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: theme.spacing(1)
  },
  brandNamePreview: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: 8,
    border: "1px solid #ddd",
    textAlign: "center",
    marginTop: theme.spacing(2)
  }
}));

const PersonalizationManager = () => {
  const classes = useStyles();
  
  // Estados
  const [personalization, setPersonalization] = useState({
    logoLight: "",
    logoDark: "",
    logoFavicon: "",
    logoLogin: "",
    primaryColorLight: "#2DDD7F",
    primaryColorDark: "#FFFFFF",
    secondaryColorLight: "#F3F3F3",
    secondaryColorDark: "#333333",
    brandName: "Whaticket SaaS",
    customCss: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState({});
  const [colorPickerOpen, setColorPickerOpen] = useState({});
  
  // Refs para inputs de arquivo
  const logoLightRef = useRef(null);
  const logoDarkRef = useRef(null);
  const logoFaviconRef = useRef(null);
  const logoLoginRef = useRef(null);

  // Carregar personalização atual
  useEffect(() => {
    fetchPersonalization();
  }, []);

  const fetchPersonalization = async () => {
    setLoading(true);
    try {
      const response = await api.get("/personalization");
      setPersonalization(prev => ({
        ...prev,
        ...response.data
      }));
    } catch (error) {
      console.error("Erro ao carregar personalização:", error);
      toast.error("Erro ao carregar configurações de personalização");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePersonalization = async (field, value) => {
    try {
      const updateData = { [field]: value };
      await api.put("/personalization", updateData);
      
      setPersonalization(prev => ({
        ...prev,
        [field]: value
      }));
      
      toast.success("Personalização atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar personalização:", error);
      toast.error("Erro ao atualizar personalização");
    }
  };

  const handleLogoUpload = async (logoType, file) => {
    if (!file) return;

    setUploading(prev => ({ ...prev, [logoType]: true }));
    
    try {
      const formData = new FormData();
      formData.append("logo", file);
      formData.append("logoType", logoType);

      const response = await api.post("/personalization/logo", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setPersonalization(prev => ({
        ...prev,
        [logoType === 'light' ? 'logoLight' : 
         logoType === 'dark' ? 'logoDark' :
         logoType === 'favicon' ? 'logoFavicon' : 'logoLogin']: response.data.logoPath
      }));

      toast.success("Logo atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload do logo:", error);
      toast.error("Erro ao fazer upload do logo");
    } finally {
      setUploading(prev => ({ ...prev, [logoType]: false }));
    }
  };

  const handleDeleteLogo = async (logoType) => {
    try {
      await api.delete(`/personalization/logo/${logoType}`);
      
      setPersonalization(prev => ({
        ...prev,
        [logoType === 'light' ? 'logoLight' : 
         logoType === 'dark' ? 'logoDark' :
         logoType === 'favicon' ? 'logoFavicon' : 'logoLogin']: ""
      }));

      toast.success("Logo removido com sucesso!");
    } catch (error) {
      console.error("Erro ao deletar logo:", error);
      toast.error("Erro ao deletar logo");
    }
  };

  const renderLogoSection = (logoType, title, fieldName, ref, preview) => (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          <ImageIcon style={{ marginRight: 8 }} />
          {title}
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box className={classes.previewContainer}>
              {personalization[fieldName] ? (
                <img
                  src={`${process.env.REACT_APP_BACKEND_URL}/public/${personalization[fieldName]}`}
                  alt={title}
                  className={`${classes.logoPreview} ${logoType === 'dark' ? classes.logoPreviewDark : ''}`}
                />
              ) : (
                <Box className={`${classes.logoPreview} ${logoType === 'dark' ? classes.logoPreviewDark : ''}`}>
                  <Typography variant="caption" color="textSecondary">
                    Nenhum logo carregado
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <input
              type="file"
              accept="image/*"
              ref={ref}
              className={classes.uploadInput}
              onChange={(e) => handleLogoUpload(logoType, e.target.files[0])}
            />
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={uploading[logoType] ? <CircularProgress size={20} /> : <CloudUpload />}
              onClick={() => ref.current?.click()}
              disabled={uploading[logoType]}
              className={classes.uploadButton}
              fullWidth
            >
              {uploading[logoType] ? "Enviando..." : "Enviar Logo"}
            </Button>
            
            {personalization[fieldName] && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<Delete />}
                onClick={() => handleDeleteLogo(logoType)}
                fullWidth
              >
                Remover Logo
              </Button>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderColorSection = (colorKey, label, defaultColor) => (
    <Grid item xs={12} sm={6} md={3}>
      <FormControl fullWidth>
        <TextField
          label={label}
          variant="outlined"
          value={personalization[colorKey] || defaultColor}
          onClick={() => setColorPickerOpen(prev => ({ ...prev, [colorKey]: true }))}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <div
                  style={{ backgroundColor: personalization[colorKey] || defaultColor }}
                  className={classes.colorAdornment}
                />
              </InputAdornment>
            ),
            endAdornment: (
              <IconButton
                size="small"
                onClick={() => setColorPickerOpen(prev => ({ ...prev, [colorKey]: true }))}
              >
                <Colorize />
              </IconButton>
            ),
            readOnly: true
          }}
        />
      </FormControl>
      
      <ColorPicker
        open={colorPickerOpen[colorKey] || false}
        handleClose={() => setColorPickerOpen(prev => ({ ...prev, [colorKey]: false }))}
        onChange={(color) => {
          handleUpdatePersonalization(colorKey, color);
          setColorPickerOpen(prev => ({ ...prev, [colorKey]: false }));
        }}
        currentColor={personalization[colorKey] || defaultColor}
      />
    </Grid>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className={classes.container}>
      <Alert severity="info" style={{ marginBottom: 24 }}>
        <strong>Personalização por Empresa:</strong> Cada empresa pode ter seus próprios logotipos e cores. 
        As configurações definidas aqui se aplicam apenas à sua empresa.
      </Alert>

      {/* Seção de Logotipos */}
      <Typography className={classes.sectionTitle}>
        <ImageIcon />
        Logotipos
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {renderLogoSection("light", "Logo Modo Claro", "logoLight", logoLightRef)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderLogoSection("dark", "Logo Modo Escuro", "logoDark", logoDarkRef)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderLogoSection("favicon", "Favicon", "logoFavicon", logoFaviconRef)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderLogoSection("login", "Logo Login", "logoLogin", logoLoginRef)}
        </Grid>
      </Grid>

      <Divider style={{ margin: "32px 0" }} />

      {/* Seção de Cores */}
      <Typography className={classes.sectionTitle}>
        <Palette />
        Cores Personalizadas
      </Typography>
      
      <Card className={classes.card}>
        <CardContent>
          <Grid container spacing={3}>
            {renderColorSection("primaryColorLight", "Cor Primária (Claro)", "#2DDD7F")}
            {renderColorSection("primaryColorDark", "Cor Primária (Escuro)", "#FFFFFF")}
            {renderColorSection("secondaryColorLight", "Cor Secundária (Claro)", "#F3F3F3")}
            {renderColorSection("secondaryColorDark", "Cor Secundária (Escuro)", "#333333")}
          </Grid>
        </CardContent>
      </Card>

      <Divider style={{ margin: "32px 0" }} />

      {/* Seção de Nome da Marca */}
      <Typography className={classes.sectionTitle}>
        Nome da Marca
      </Typography>
      
      <Card className={classes.card}>
        <CardContent>
          <TextField
            label="Nome do Sistema"
            variant="outlined"
            fullWidth
            value={personalization.brandName || ""}
            onChange={(e) => setPersonalization(prev => ({ ...prev, brandName: e.target.value }))}
            onBlur={(e) => handleUpdatePersonalization("brandName", e.target.value)}
            helperText="Nome que aparecerá no título do sistema e outras áreas"
          />
          
          {personalization.brandName && (
            <Box className={classes.brandNamePreview}>
              <Typography variant="h6" style={{ color: personalization.primaryColorLight }}>
                {personalization.brandName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Prévia do nome da marca
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalizationManager; 