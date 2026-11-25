# ⚡ ACCIO Roleplay — Portal Oficial de Pré-Registro & Whitelist

![ACCIO Roleplay Banner](public/assets/logohigh_4x.jpg)

> **Portal oficial de convocação, criação de personagem e admissão ministerial do servidor ACCIO Roleplay (Hogwarts Legacy / [Arcane MP](https://arcane.mp/)).**

---

## 📖 Visão Geral

Esta aplicação web em **React 19 + Vite 6 + TypeScript** gerencia o pré-cadastro oficial de pioneiros, a criação de ficha no padrão de *Hogwarts Legacy*, a geração de pergaminhos de matrícula em PDF e a moderação ministerial em tempo real via **Supabase (`ACCIO_Rp`)** e **Discord**.

---

## ✨ Funcionalidades Implementadas

- 📜 **Carta de Hogwarts 3D (`HogwartsLetterModal.tsx`):**
  - Apresentação tridimensional na primeira visita do usuário com lacre de cera carmesim e partículas douradas (`canvas-confetti`).
  - Persistência de visualização em `localStorage` (`accio_letter_opened_v2`) e acesso rápido pela Navbar.

- 🏰 **Estandartes 3D & Motor Dinâmico de Temas (`CastleBanners3D.tsx` + `index.css`):**
  - Estandartes das Quatro Casas (Grifinória, Sonserina, Corvinal e Lufa-Lufa) renderizados em **Three.js** com simulação de tecido ao vento e iluminação de tochas.
  - Alternância dinâmica de tema global via atributo `data-house-theme` no documento, adaptando cores, gradientes, partículas (`ParticleCanvas`) e modais.

- 🔑 **Autenticação Discord OAuth2 & RBAC (`supabase.ts`):**
  - Login via Discord através do Supabase Auth (e opção de vinculação na ficha quando necessário).
  - Controle de cargos (`user`, `student`, `mod`, `admin`, `super_admin`) na tabela `user_roles`.

- ✍️ **Criação de Personagem & Oficina Ollivanders (`WhitelistFormModal.tsx`):**
  - Fluxo em 4 etapas com seletor de dormitório (`Bruxo / Wizard` vs `Bruxa / Witch`), linhagem mágica e escolha da Casa.
  - **11 Famílias Canônicas de Cabos de Varinha** em PNG transparente (`public/wands/cutouts/`) com alternador entre **`3D Macro`** e **`Guia de Campo`** (sketch em pergaminho).
  - Seletores de madeira, comprimento, flexibilidade e núcleos com descrição canônica de Garrick Ollivanders.
  - Validador de crônica com exigência mínima de **3.000 palavras** (`MIN_WORDS_BACKSTORY = 3000`) e auto-save em `localStorage`.

- 📄 **Gerador de Pergaminho em PDF (`pdfGenerator.ts`):**
  - Gera documento A4 estilizado como pergaminho envelhecido com `html2canvas` e `jsPDF`.
  - Faz download automático para o jogador e envia para o bucket público `character_sheets` no Supabase Storage.

- 🎫 **Bilhete de Embarque & Validação (`TicketModal.tsx`, `ValidationModal.tsx`, `EnchantedSubmissionModal.tsx`):**
  - Transição pós-envio, consulta de status da ficha (`pending`, `approved`, `rejected`, `revision_requested`) e exibição do Bilhete do Expresso de Hogwarts.

- 🛡️ **Painel Ministerial & Cronômetro Realtime (`AdminPanelModal.tsx`, `AppleTimerModal.tsx`):**
  - Revisão de candidaturas com filtros por Casa/status, notas do revisor, download de PDF e gestão de cargos RBAC.
  - Modal de cronômetro estilo iOS sincronizado via `supabase_realtime` com a chave `countdown_timer` em `accio_settings` (prazo padrão de 61 dias / `2027-01-21T23:59:59.000Z`).
  - Notificações automáticas em Rich Embed para o Discord via `discordWebhook.ts`.

- 🎵 **Trilha Sonora & Efeitos Sonoros (`audio.ts`, `MusicPlayerWidget.tsx`):**
  - Efeitos sonoros procedurais gerados via **Web Audio API** (`soundManager`).
  - Player flutuante com 6 faixas MP3 em `public/audio/`, controle de volume, shuffle e crossfade contextual.

---

## 🛠️ Stack Tecnológica

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) (~5.7.2)
- **Build Tool:** [Vite 6](https://vite.dev/)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`, `clsx`, `tailwind-merge`)
- **3D & Gráficos:** [Three.js](https://threejs.org/), Canvas 2D, [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **PDF:** [jsPDF](https://www.npmjs.com/package/jspdf) + [html2canvas](https://html2canvas.hertzen.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Backend / BaaS:** [Supabase](https://supabase.com/) (PostgreSQL, Auth Discord, Storage `character_sheets`, Realtime WebSockets)

---

## 🚀 Como Executar Localmente

### 1. Instalar Dependências
```bash
cd website
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na pasta `website/` baseado em [`.env.example`](.env.example):
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-publicavel
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
O servidor Vite inicia na porta `3000` (`http://localhost:3000`, configurado em `vite.config.ts`).

### 4. Compilar para Produção
```bash
npm run build
```

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

O schema oficial está documentado em [`../scripts/migration_accio_rp.sql`](../scripts/migration_accio_rp.sql) e [`../.agent/context/database_schema.md`](../.agent/context/database_schema.md):

- **`character_applications`**: Armazena as fichas de personagens, dados da varinha, crônica (>= 3.000 palavras), status (`pending`, `approved`, `rejected`), notas de revisão e `pdf_url`.
- **`accio_settings`**: Configurações globais sincronizadas em Realtime (ex.: `countdown_timer`).
- **`user_roles`**: Controle de permissões RBAC por `discord_id` (`user`, `student`, `mod`, `admin`, `super_admin`).
- **Storage Bucket `character_sheets`**: Armazenamento público dos PDFs de matrícula (limite de 10 MB).

---

## ⚖️ Licença & Isenção de Responsabilidade

ACCIO Roleplay é um projeto comunitário sem fins lucrativos desenvolvido para o framework **Arcane MP**.  
*Hogwarts Legacy* e o *Wizarding World* são marcas registradas da Warner Bros. Entertainment Inc. e Avalanche Software. Este projeto não possui afiliação oficial com as detentoras da propriedade intelectual.
