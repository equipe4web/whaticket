import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";

const usePersonalization = () => {
  const [personalization, setPersonalization] = useState({
    logos: {
      light: null,
      dark: null,
      favicon: null,
      login: null
    },
    colors: {
      primaryColorLight: "#2DDD7F",
      primaryColorDark: "#FFFFFF",
      secondaryColorLight: "#F3F3F3",
      secondaryColorDark: "#333333"
    },
    brandName: "Whaticket SaaS",
    customCss: ""
  });
  
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    if (user?.companyId) {
      fetchPersonalization();
      
      // Configurar listener do socket para atualizações em tempo real
      const socket = socketManager.getSocket(user.companyId);
      
      const handlePersonalizationUpdate = (data) => {
        if (data.action === "update") {
          setPersonalization(prev => ({
            ...prev,
            ...data.personalization
          }));
        } else if (data.action === "logo-update") {
          setPersonalization(prev => ({
            ...prev,
            logos: {
              ...prev.logos,
              [data.logoType]: data.logoPath
            }
          }));
        } else if (data.action === "logo-delete") {
          setPersonalization(prev => ({
            ...prev,
            logos: {
              ...prev.logos,
              [data.logoType]: null
            }
          }));
        }
      };

      socket.on(`company-${user.companyId}-personalization`, handlePersonalizationUpdate);

      return () => {
        socket.off(`company-${user.companyId}-personalization`, handlePersonalizationUpdate);
      };
    }
  }, [user, socketManager]);

  const fetchPersonalization = async () => {
    setLoading(true);
    try {
      const response = await api.get("/personalization/assets");
      setPersonalization(response.data);
    } catch (error) {
      console.error("Erro ao carregar personalização:", error);
      // Manter valores padrão em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const getLogo = (type, theme = 'light') => {
    const { logos } = personalization;
    
    // Se existe logo personalizado, usar ele
    if (logos[type]) {
      return `${process.env.REACT_APP_BACKEND_URL}/public/${logos[type]}`;
    }
    
    // Usar logos padrão baseado no tema
    const defaultLogos = {
      light: {
        light: "/assets/vector/logo.svg",
        dark: "/assets/vector/logo-dark.svg",
        favicon: "/assets/vector/favicon.svg",
        login: "/assets/vector/logo.svg"
      },
      dark: {
        light: "/assets/vector/logo-dark.svg",
        dark: "/assets/vector/logo.svg",
        favicon: "/assets/vector/favicon.svg",
        login: "/assets/vector/logo-dark.svg"
      }
    };

    return defaultLogos[theme][type] || defaultLogos.light[type];
  };

  const getColor = (colorKey) => {
    return personalization.colors[colorKey] || personalization.colors.primaryColorLight;
  };

  const getBrandName = () => {
    return personalization.brandName || "Whaticket SaaS";
  };

  const getCustomCss = () => {
    return personalization.customCss || "";
  };

  // Função para aplicar cores personalizadas ao tema
  const getCustomTheme = (baseTheme) => {
    return {
      ...baseTheme,
      palette: {
        ...baseTheme.palette,
        primary: { 
          main: getColor(baseTheme.palette.type === 'light' ? 'primaryColorLight' : 'primaryColorDark')
        },
        secondary: {
          main: getColor(baseTheme.palette.type === 'light' ? 'secondaryColorLight' : 'secondaryColorDark')
        }
      }
    };
  };

  return {
    personalization,
    loading,
    getLogo,
    getColor,
    getBrandName,
    getCustomCss,
    getCustomTheme,
    fetchPersonalization
  };
};

export default usePersonalization; 