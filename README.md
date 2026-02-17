# FinTrack - Gerenciador Financeiro Pessoal

Aplicativo web PWA para gestão de finanças pessoais com design moderno, tema escuro por padrão e totalmente responsivo.

## Funcionalidades

- **Autenticação** - Login e registro com email/senha e Google OAuth
- **Dashboard** - Resumo financeiro mensal, gráficos de evolução e categorias, transações recentes e faturas próximas
- **Transações** - CRUD completo de receitas e despesas com categorias, filtros por período/tipo/categoria e busca
- **Cartões de Crédito** - Gerenciamento de cartões, faturas mensais, assinaturas e despesas recorrentes
- **Categorias** - Gerenciamento de categorias personalizadas com ícones e cores
- **Temas** - Alternância entre escuro (padrão), claro e automático (sistema)
- **PWA** - Instalável no celular, suporte offline, caching inteligente
- **Responsivo** - Funciona em mobile, tablet e desktop

## Stack

| Camada | Tecnologia |
| --- | --- |
| Frontend | React 19 + TypeScript + Vite 7 |
| UI | shadcn/ui + Tailwind CSS v4 (OKLCH) |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS) |
| Server State | TanStack Query v5 |
| Client State | Zustand v5 |
| Formulários | React Hook Form v7 + Zod v4 |
| Gráficos | Recharts v2 |
| Rotas | React Router v7 (lazy loading) |
| Datas | date-fns (pt-BR) |
| PWA | vite-plugin-pwa + Workbox |

## Estrutura do Projeto

```
src/
├── components/
│   ├── ui/              # Componentes shadcn/ui
│   ├── layout/          # Layout, sidebar, header, navegação mobile
│   └── common/          # Componentes reutilizáveis (currency-input, stat-card, etc.)
├── features/
│   ├── auth/            # Autenticação (login, registro, OAuth, guard)
│   ├── dashboard/       # Dashboard (resumo, gráficos, transações recentes)
│   ├── transactions/    # Transações e categorias (CRUD, filtros, formulários)
│   ├── credit-cards/    # Cartões de crédito (faturas, recorrências)
│   └── settings/        # Configurações (perfil, aparência, dados, conta)
├── hooks/               # Hooks globais (theme, media-query, format-currency)
├── lib/                 # Clientes Supabase/Query, utilitários, formatação
├── stores/              # Zustand stores (tema, sidebar)
├── types/               # Tipos TypeScript e tipos gerados do Supabase
└── routes/              # Páginas da aplicação
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) v18+
- Conta no [Supabase](https://supabase.com/) (gratuito)

## Configuração

### 1. Clonar e instalar

```bash
git clone <url-do-repositorio>
cd fintrack
npm install
```

### 2. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com/dashboard)
1. Copie o arquivo de ambiente:

```bash
cp .env.example .env.local
```

1. Preencha as variáveis em `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 3. Configurar banco de dados

Execute as migrations SQL no **SQL Editor** do Supabase, na ordem:

1. `001_profiles.sql` - Tabela de perfis + trigger auto-create
1. `002_categories.sql` - Categorias de receita/despesa
1. `003_credit_cards.sql` - Cartões de crédito
1. `004_transactions.sql` - Transações
1. `005_credit_card_invoices.sql` - Faturas de cartão
1. `006_recurring_expenses.sql` - Despesas recorrentes
1. `007_rls_policies.sql` - Políticas de Row Level Security
1. `008_functions.sql` - Funções SQL (resumo mensal, categorias)
1. `009_seed_categories.sql` - Função de seed de categorias padrão

### 4. Configurar autenticação Google (opcional)

1. No Supabase Dashboard, vá em **Authentication > Providers > Google**
1. Configure o OAuth com suas credenciais do Google Cloud Console
1. Adicione `http://localhost:5173/auth/callback` como redirect URI

### 5. Executar

```bash
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173)

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (TypeScript + Vite) |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Verificar código com ESLint |

## Rotas

| Rota | Descrição | Acesso |
| --- | --- | --- |
| `/login` | Página de login | Pública |
| `/register` | Página de registro | Pública |
| `/auth/callback` | Callback OAuth | Pública |
| `/` | Dashboard | Autenticado |
| `/transactions` | Lista de transações | Autenticado |
| `/transactions/new` | Nova transação | Autenticado |
| `/transactions/:id/edit` | Editar transação | Autenticado |
| `/credit-cards` | Lista de cartões | Autenticado |
| `/credit-cards/:id` | Detalhe do cartão | Autenticado |
| `/settings` | Configurações | Autenticado |

## Banco de Dados

6 tabelas com Row Level Security (cada usuário acessa apenas seus dados):

- **profiles** - Perfil do usuário (nome, avatar, preferências)
- **categories** - Categorias de receita/despesa com ícone e cor
- **transactions** - Receitas e despesas
- **credit_cards** - Cartões de crédito (nome, últimos 4 dígitos, bandeira, limite)
- **credit_card_invoices** - Faturas mensais por cartão
- **recurring_expenses** - Assinaturas e despesas recorrentes

## Segurança

- **RLS** em todas as tabelas - usuários só acessam seus próprios dados
- **Nenhum dado sensível** de cartão armazenado (apenas nome, últimos 4 dígitos e bandeira)
- **Supabase Auth** gerencia senhas (bcrypt), JWT e sessões
- **Validação Zod** em todos os formulários
- Apenas a `anon key` é exposta (projetada para uso público + RLS)

## Licença

Projeto pessoal - uso privado.
