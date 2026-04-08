# 🏢 Grupo GAB - Sistema de Gestão Empresarial

Sistema ERP moderno e completo para gestão empresarial de grande porte.

## ✨ O que foi Modernizado

- ✅ **Dashboard Moderno** - Cards animados, métricas em tempo real
- ✅ **Layout Responsivo** - Sidebar colapsável, design profissional
- ✅ **Contas a Pagar** - Gestão financeira completa
- ✅ **Contas a Receber** - Controle de receitas
- ✅ **CRM** - Funil de vendas com kanban
- ✅ **Projetos** - Gestão de obras e tarefas
- ✅ **Relatórios** - Analytics com gráficos

## 📦 Como Fazer Upload para o GitHub + Vercel

### Passo 1: Preparar o Repositório no GitHub

1. Acesse: https://github.com/tiacquax-web/GrupoGab2
2. **Opção A:** Delete o repositório atual e crie um novo (limpa problemas)
3. **Opção B:** Continue usando o mesmo (vou te dar comandos abaixo)

### Passo 2: Baixar e Extrair o ZIP

1. Baixe o arquivo `grupogab-vercel-ready.zip`
2. Extraia em uma pasta no seu computador
3. Abra o terminal/prompt na pasta extraída

### Passo 3: Configurar Git (no terminal)

```bash
# Inicializar git (se for repositório novo)
git init

# Adicionar remote do seu repositório
git remote add origin https://github.com/tiacquax-web/GrupoGab2.git

# Ou se já existe:
git remote set-url origin https://github.com/tiacquax-web/GrupoGab2.git
```

### Passo 4: Fazer Commit e Push

```bash
# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: sistema modernizado completo - pronto para Vercel"

# Push (força se necessário)
git push -u origin main --force
```

### Passo 5: Configurar o Vercel

1. Acesse: https://vercel.com/tiacquax-web
2. Importe o repositório `GrupoGab2`
3. **Configurações importantes:**
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist/public`
   - **Install Command:** `npm install`
4. Clique em "Deploy"

### Passo 6: Aguardar Deploy

- ⏱️ O deploy leva ~2-3 minutos
- ✅ Quando terminar, você terá uma URL funcionando!

---

## 🚨 IMPORTANTE: Este é Frontend Only

Este deploy mostra **apenas a interface moderna**. Os dados são mockados porque:

❌ **Backend não incluído** (Node.js + Express + MySQL)  
❌ **Banco de dados não incluído** (precisa de servidor separado)

### Para ter Backend Funcionando:

**Opção 1: Backend Separado (Recomendado)**
- Frontend no Vercel (este deploy)
- Backend no Railway, Render ou DigitalOcean
- Conectar via API

**Opção 2: Tudo em Um**
- Deploy completo no Railway ou Render
- Frontend + Backend + MySQL juntos

**Opção 3: Local (Para desenvolvimento)**
```bash
npm install
npm run dev
# Abre em http://localhost:5173
```

---

## 📂 Estrutura do Projeto

```
grupogab-sistema/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas do sistema
│   │   │   ├── DashboardModerno.tsx
│   │   │   ├── financeiro/
│   │   │   │   ├── ContasPagarModerno.tsx
│   │   │   │   └── ContasReceberModerno.tsx
│   │   │   ├── crm/
│   │   │   │   └── CRMModerno.tsx
│   │   │   ├── projetos/
│   │   │   │   └── ProjetosModerno.tsx
│   │   │   └── RelatoriosModerno.tsx
│   │   ├── lib/           # Utilitários
│   │   └── design-system.ts
│   ├── public/
│   └── index.html
├── server/                # Backend (não incluído no Vercel)
├── package.json
├── vite.config.ts
└── vercel.json
```

---

## 🎨 Design System

### Cores Principais
- **Primary:** `#3B82F6` (Azul)
- **Success:** `#10B981` (Verde)
- **Warning:** `#F59E0B` (Laranja)
- **Danger:** `#EF4444` (Vermelho)

### Componentes
- Radix UI (Acessível)
- Tailwind CSS (Estilização)
- Framer Motion (Animações)
- Lucide Icons (Ícones)

---

## 🔧 Solução de Problemas

### Build Falha no Vercel

**Erro: "pnpm install failed"**
```bash
# Solução: package.json já está configurado para npm
# Se ainda falhar, verifique se vercel.json existe
```

**Erro: "No Output Directory"**
```bash
# Solução: Verificar vercel.json
{
  "outputDirectory": "dist/public"
}
```

### Página em Branco no Deploy

**Problema: Rota 404**
```bash
# Solução: vercel.json deve ter rewrite
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Dados não Aparecem

**Normal!** Este é frontend only. Para dados reais:
1. Configure backend separado
2. Ou use dados mockados (vou adicionar se necessário)

---

## 📊 Documentação Incluída

- `ANALISE_COMPLETA.md` - Análise técnica do Claude
- `BUGS_E_ISSUES.md` - Bugs identificados
- `PLANO_DE_ACAO.md` - Plano de correções
- `ROADMAP_MODERNIZACAO_UI.md` - Roadmap de UI
- `SUMARIO_EXECUTIVO.md` - Resumo executivo

---

## 🚀 Próximos Passos

Depois do deploy funcionando:

1. ✅ **Ver interface moderna no ar**
2. ⏳ **Decidir sobre backend** (Railway? Render? Local?)
3. ⏳ **Implementar multi-empresa** (se necessário)
4. ⏳ **Adicionar gráficos reais** (Recharts)
5. ⏳ **Corrigir bugs críticos** (veja BUGS_E_ISSUES.md)

---

## 💡 Suporte

Dúvidas? Problemas no deploy?

1. Verifique os logs do Vercel
2. Confira se todos os arquivos foram commitados
3. Teste localmente primeiro (`npm run dev`)

---

## 📝 Licença

MIT

---

**Desenvolvido com ❤️ para Acqua X do Brasil**
