# 🎨 Sistema de Personalização Avançado - Guia Completo

## 📋 Resumo das Implementações

O sistema de personalização foi completamente reformulado para permitir que **cada empresa tenha seus próprios logotipos e cores**, resolvendo o problema anterior onde todas as empresas compartilhavam a mesma personalização.

## 🚀 Funcionalidades Implementadas

### ✅ **1. Personalização por Empresa**
- Cada empresa pode definir seus próprios logotipos
- Cores personalizadas por empresa
- Nome da marca customizável
- CSS personalizado opcional

### ✅ **2. Logotipos Personalizados**
- **Logo Modo Claro**: Para tema claro
- **Logo Modo Escuro**: Para tema escuro  
- **Favicon**: Ícone do navegador
- **Logo Login**: Para tela de login
- Upload de imagens (JPG, PNG, GIF, SVG, WebP)
- Prévia em tempo real
- Limite de 2MB por arquivo

### ✅ **3. Cores Personalizadas**
- **Cor Primária (Claro/Escuro)**: Cor principal do sistema
- **Cor Secundária (Claro/Escuro)**: Cor secundária
- Seletor de cores visual
- Aplicação automática no tema

### ✅ **4. Interface Avançada**
- Componente `PersonalizationManager` completo
- Upload via drag-and-drop
- Prévia em tempo real
- Feedback visual de carregamento
- Validação de tipos de arquivo

## 🔧 Estrutura Técnica

### **Backend:**
```
📁 backend/src/
├── 📁 database/migrations/
│   └── 20250108000003-add-personalization-fields-to-companies.ts
├── 📁 models/
│   └── Company.ts (atualizado)
├── 📁 services/CompanyService/
│   └── PersonalizationService.ts
├── 📁 controllers/
│   └── PersonalizationController.ts
├── 📁 config/
│   └── uploadCompanyLogo.ts
└── 📁 routes/
    ├── personalizationRoutes.ts
    └── index.ts (atualizado)
```

### **Frontend:**
```
📁 frontend/src/
├── 📁 components/
│   └── PersonalizationManager/index.js
├── 📁 hooks/
│   └── usePersonalization/index.js
└── 📁 pages/SettingsCustom/
    └── index.js (atualizado)
```

## 📚 Como Usar

### **1. Acessar Configurações**
1. Faça login como administrador da empresa
2. Vá em **Configurações > Personalização**
3. Configure logotipos, cores e nome da marca

### **2. Upload de Logotipos**
1. Clique em "Enviar Logo" na seção desejada
2. Selecione uma imagem (máximo 2MB)
3. Formatos aceitos: JPG, PNG, GIF, SVG, WebP
4. A prévia será exibida automaticamente

### **3. Configurar Cores**
1. Clique no campo de cor desejado
2. Use o seletor de cores para escolher
3. As cores são aplicadas automaticamente
4. Configure tanto modo claro quanto escuro

### **4. Nome da Marca**
1. Digite o nome desejado no campo "Nome do Sistema"
2. O nome será aplicado no título e outras áreas
3. Prévia disponível na interface

## 🔄 Migração dos Dados

### **Executar Migrações:**
```bash
cd backend
npx sequelize db:migrate
```

### **Dados Atuais:**
- Empresas existentes continuam com logos padrão
- Cores padrão mantidas (#2DDD7F verde)
- Migração não afeta funcionamento atual

## 🎯 Benefícios Implementados

### **Para Empresas:**
- ✅ Identidade visual própria
- ✅ Branding personalizado
- ✅ Logo adequado ao negócio
- ✅ Cores da marca
- ✅ Interface única

### **Para Administradores:**
- ✅ Controle total da personalização
- ✅ Upload fácil de logos
- ✅ Prévia em tempo real
- ✅ Configuração por abas organizada

### **Para o Sistema:**
- ✅ Isolamento por empresa
- ✅ Performance otimizada
- ✅ Compatibilidade mantida
- ✅ Escalabilidade garantida

## 🛡️ Segurança e Validações

### **Upload de Arquivos:**
- Validação de tipo MIME
- Limite de tamanho (2MB)
- Pasta isolada por empresa
- Permissões adequadas

### **Dados:**
- Validação backend/frontend
- Sanitização de inputs
- Proteção CSRF
- Autenticação obrigatória

## 📊 API Endpoints

### **Rotas Protegidas:**
```
GET    /personalization         # Buscar personalização
PUT    /personalization         # Atualizar personalização  
GET    /personalization/assets  # Buscar assets da empresa
POST   /personalization/logo    # Upload de logo
DELETE /personalization/logo/:type # Deletar logo
```

### **Rota Pública:**
```
GET    /personalization/public/:companyId # Assets públicos
```

## 🔮 Como Usar nos Componentes

### **Hook usePersonalization:**
```javascript
import usePersonalization from "../../hooks/usePersonalization";

const MyComponent = () => {
  const { getLogo, getColor, getBrandName } = usePersonalization();
  
  return (
    <div>
      <img src={getLogo('light', 'light')} alt="Logo" />
      <h1 style={{ color: getColor('primaryColorLight') }}>
        {getBrandName()}
      </h1>
    </div>
  );
};
```

### **Exemplo Prático:**
```javascript
// Logo dinâmico baseado no tema
const logoSrc = getLogo('light', theme.palette.type);

// Cor primária da empresa
const primaryColor = getColor('primaryColorLight');

// Nome da marca
const brandName = getBrandName();
```

## 🚀 Próximos Passos (Opcionais)

### **Melhorias Futuras:**
1. **Editor CSS Avançado**: Monaco Editor para CSS customizado
2. **Temas Predefinidos**: Templates prontos de cores
3. **Logo Animado**: Suporte a GIFs e SVG animados
4. **Backup/Restore**: Salvar configurações de personalização
5. **Preview Global**: Visualizar mudanças antes de aplicar

## 🔧 Configuração de Desenvolvimento

### **Compilar Backend:**
```bash
cd backend
npm run build
```

### **Executar Migrações:**
```bash
npx sequelize db:migrate
```

### **Reiniciar Serviços:**
```bash
# Backend
npm run dev

# Frontend  
npm start
```

## 📝 Notas Importantes

1. **Compatibilidade**: Sistema mantém retrocompatibilidade total
2. **Performance**: Assets servidos estaticamente via Express
3. **Escalabilidade**: Cada empresa tem pasta própria de assets
4. **Backup**: Fazer backup das pastas `company{ID}/logos/`
5. **Manutenção**: Limpeza periódica de logos não utilizados

---

## 🎉 Resultado Final

✅ **Sistema completamente funcional de personalização por empresa**  
✅ **Interface administrativa completa**  
✅ **Upload e gestão de logotipos**  
✅ **Configuração de cores personalizadas**  
✅ **Aplicação automática em toda interface**  
✅ **Isolamento total entre empresas**

Cada cliente agora pode ter sua identidade visual única no sistema! 🎨 