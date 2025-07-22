# 🚀 Integração Asaas - Configuração e Uso

## 📋 Resumo das Melhorias Implementadas

A integração com o Asaas foi completamente reestruturada para corrigir os problemas identificados e oferecer uma solução robusta de cobrança.

### ✅ Problemas Corrigidos:

1. **Campos Obrigatórios**: Adicionados CPF/CNPJ e endereço no cadastro de empresas
2. **Criação Automática de Clientes**: Sistema agora cria clientes automaticamente no Asaas
3. **Cobrança Completa**: Implementação completa do ciclo de cobrança
4. **Webhook Funcional**: Sistema de webhook do Asaas para atualização automática de status
5. **Interface Melhorada**: Formulários atualizados para capturar dados necessários

## 🔧 Configuração

### 1. Executar Migrações do Banco de Dados

```bash
cd backend
npx sequelize db:migrate
```

### 2. Configurar Token do Asaas

1. Acesse o painel administrativo do sistema
2. Vá em **Configurações → Integrações**
3. Na seção **ASAAS**, insira seu token de API do Asaas
4. Salve as configurações

### 3. Configurar Webhook no Asaas

No painel do Asaas:
1. Acesse **Configurações → Webhooks**
2. Adicione uma nova URL: `https://seudominio.com/asaas/webhook`
3. Selecione os eventos:
   - `PAYMENT_RECEIVED`
   - `PAYMENT_OVERDUE`
   - `PAYMENT_DELETED`

## 📝 Como Usar

### 1. Cadastrar Empresa com Dados Completos

Ao cadastrar uma nova empresa, preencha os campos obrigatórios:

- **Dados Básicos**: Nome, email, telefone
- **Dados para Cobrança (Asaas)**:
  - CPF/CNPJ
  - Endereço completo
  - Cidade, Estado, CEP

### 2. Cobrança Automática

O sistema agora:
- ✅ Cria automaticamente o cliente no Asaas quando empresa é cadastrada
- ✅ Gera cobranças automaticamente via PIX
- ✅ Atualiza status de pagamento via webhook
- ✅ Renova automaticamente data de vencimento após pagamento

### 3. Funcionalidades Disponíveis

#### Via API:
- `POST /asaas/payment` - Criar cobrança manual
- `GET /asaas/payment/:id` - Obter detalhes da cobrança
- `GET /asaas/payment/:id/pix` - Obter QR Code PIX
- `GET /asaas/payment/:id/barcode` - Obter código de barras boleto
- `POST /asaas/customer/sync` - Sincronizar cliente

#### Automaticamente:
- Criação de cliente no Asaas ao cadastrar empresa
- Geração de cobrança mensal automática
- Atualização de status via webhook
- Reativação automática após pagamento

## 🎯 Benefícios da Implementação

### Para Administradores:
- ✅ Cobrança automática via PIX (mais rápida e barata)
- ✅ Controle total do ciclo de cobrança
- ✅ Atualização automática de status
- ✅ Reativação automática de empresas após pagamento
- ✅ Dados completos para conformidade fiscal

### Para Clientes:
- ✅ Múltiplas formas de pagamento (PIX, Boleto)
- ✅ QR Code PIX para pagamento rápido
- ✅ Desconto para pagamento antecipado (5%)
- ✅ Link direto para pagamento
- ✅ Reativação automática após pagamento

## 🔐 Segurança

- Webhook protegido com verificação de User-Agent
- Validação de dados obrigatórios
- Tratamento robusto de erros
- Logs detalhados para auditoria

## 📊 Monitoramento

O sistema registra logs detalhados para:
- Criação de clientes no Asaas
- Geração de cobranças
- Processamento de webhooks
- Erros e exceções

## 🚨 Importante

1. **Token Asaas**: Certifique-se de usar o token de produção correto
2. **Webhook URL**: Configure corretamente no painel do Asaas
3. **CPF/CNPJ**: Campo obrigatório para criação de cliente
4. **Backup**: Sempre faça backup antes de executar migrações

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs do sistema
2. Confirme configuração do token Asaas
3. Teste webhook manualmente
4. Verifique dados obrigatórios das empresas

---

## 🔄 Fluxo Completo de Cobrança

1. **Empresa é cadastrada** → Cliente criado automaticamente no Asaas
2. **Sistema gera fatura** → Cobrança criada automaticamente no Asaas
3. **Cliente recebe link/QR Code** → Pagamento via PIX ou boleto
4. **Pagamento confirmado** → Webhook atualiza status automaticamente
5. **Sistema renova vencimento** → Empresa mantém acesso ativo

Este fluxo garante uma experiência completa e automatizada de cobrança! 🎉 