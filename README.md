# ⚡ ACCIO Roleplay — Portal Oficial de Pré-Registro & Whitelist

![ACCIO Roleplay Banner](public/assets/logohigh_4x.jpg)

> **O primeiro servidor de Roleplay sério em Hogwarts Legacy, construído sobre o framework [Arcane MP](https://github.com/arcane-mp).**

---

## 📖 Visão Geral

Este webapp foi desenvolvido para gerenciar o pré-cadastro oficial, processo de whitelist e distribuição das vagas de pioneiro do **ACCIO Roleplay**. 

Construído com foco em **retenção de público**, estética cinematográfica inspirada em *Hogwarts Legacy*, animações fluidas estilo Apple (*fluid glassmorphism*) e fidelidade estrita à Identidade Visual oficial do servidor.

---

## ✨ Principais Funcionalidades

- 📜 **Experiência Imersiva da Carta de Hogwarts 3D**:
  - Apresentação em perspectiva 3D (`perspective: 1200px`) na primeira visita do usuário.
  - Brasão carmesim em cera com monograma "A" em alto-relevo.
  - Interação de quebra de selo com chuva de faíscas estelares douradas (`canvas-confetti`).
  - Pergaminho oficial de convocação e aceite.

- 🔑 **Autenticação Discord OAuth2**:
  - Porta de entrada obrigatória para registrar personagens e submeter histórias.
  - Sincronização automática do avatar, username e Discord ID.

- ✍️ **Formulário de Whitelist & Backstory de 3.000 Palavras**:
  - **Validador Estrito**: Contador de palavras em tempo real que bloqueia envios com menos de 3.000 palavras.
  - **Auto-save Persistente**: Rascunho salvo no `localStorage` a cada 3 segundos associado ao ID do Discord do usuário.
  - **Seleção de Linhagem & Casa**: Seletor dinâmico com as 4 casas (Grifinória, Sonserina, Corvinal, Lufa-Lufa) com gradientes e lemas canônicos.
  - **Configuração da Varinha**: Madeira, Núcleo, Tamanho e Flexibilidade.
  - **Compatibilidade Arcane MP**: Identificador de conexão do jogador e dados de spawn.

- 🎫 **Bilhete de Embarque do Expresso de Hogwarts**:
  - Bilhete dourado colecionável gerado imediatamente após a submissão com código único `#ACCIO-XXXX`.
  - Exibição de Casa, Linhagem, Varinha e data de emissão.

- 📊 **Sincronização em Tempo Real (Zero Placeholders)**:
  - Painel de vagas consumindo dados diretamente via Supabase (`character_applications`).
  - Cronômetro regressivo dinâmico para a abertura oficial da fase de pioneiros.

---

## 🎨 Identidade Visual & Design System

Paleta cromática oficial do **ACCIO Roleplay**:

| Cor | Hex | Uso |
| :--- | :--- | :--- |
| **Abyss Black** | `#100303` / `#160504` | Fundo principal e containers |
| **Burgundy Crimson** | `#5B1009` | Bordas e modais secundários |
| **Flame Amber** | `#B83A0C` / `#F47A16` | Acentos mágicos e gradientes |
| **Hogwarts Gold** | `#FFC34F` | Destaques nobres e botões de ação |
| **Parchment Ivory** | `#FFF0B2` | Tipografia principal e pergaminho |

---

## 🛠️ Stack Tecnológica

- **Frontend**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vite.dev/)
- **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Efeitos e Partículas**: Canvas 2D nativo + [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)
- **Backend / BaaS**: [Supabase](https://supabase.com/) (PostgreSQL + RLS + Auth + Edge Network)
- **Hospedagem Recomendada**: Vercel / Netlify / Cloudflare Pages

---

## 🚀 Como Executar Localmente

### 1. Clonar o Repositório
```bash
git clone https://github.com/pauloviccs/accio_rp_website.git
cd accio_rp_website
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` baseado no `.env.example`:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-publicavel
```

### 4. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```
O servidor estará disponível em `http://localhost:3000` (ou `3001`).

### 5. Compilar para Produção
```bash
npm run build
```

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

Tabelas essenciais criadas com Row Level Security (RLS):

- **`character_applications`**: Armazena as fichas de personagens, história completa (>= 3.000 palavras), status de aprovação (`pending`, `approved`, `rejected`), número sequencial de registro (`registration_number`) e dados da varinha.
- **`profiles`**: Dados sincronizados dos jogadores via Discord OAuth (avatar, username, email).

---

## ⚖️ Licença & Isenção de Responsabilidade

ACCIO Roleplay é um projeto comunitário sem fins lucrativos desenvolvido com o framework **Arcane MP**.  
*Hogwarts Legacy* e o *Wizarding World* são marcas registradas da Warner Bros. Entertainment Inc. e Avalanche Software. Este projeto não possui afiliação oficial com as detentoras da propriedade intelectual.
