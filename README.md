# CONTRAL - WebApp

Aplicação web moderna para gestão financeira pessoal, complemento visual do sistema de gestão via WhatsApp.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utility-first
- **Shadcn/ui** - Componentes UI reutilizáveis
- **Supabase** - Backend (Auth, Database, Realtime)
- **React Hook Form + Zod** - Formulários e validação
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones

## 📁 Estrutura do Projeto

```
contral-app/
├── app/                    # App Router do Next.js
│   ├── (privado)/         # Rotas protegidas (requerem autenticação)
│   │   ├── dashboard/
│   │   ├── historico/
│   │   ├── contas-fixas/
│   │   ├── configuracoes/
│   │   ├── ajuda/
│   │   └── layout.tsx     # Layout com Header para área privada
│   ├── login/
│   ├── cadastro/
│   ├── onboarding/
│   ├── layout.tsx         # Layout raiz
│   ├── page.tsx           # Landing Page
│   └── globals.css        # Estilos globais
├── components/
│   ├── ui/                # Componentes Shadcn/ui
│   └── header.tsx         # Header da aplicação
├── lib/
│   ├── supabase/          # Clientes Supabase (client/server)
│   └── utils.ts           # Funções utilitárias
├── supabase/
│   └── schema.sql         # Schema do banco de dados
└── middleware.ts          # Middleware de autenticação
```

## 🎨 Design System

### Cores
- **Primária**: Azul confiável (`blue-500`)
- **Sucesso**: Verde vibrante (`emerald-500`) - para receitas
- **Destrutivo**: Laranja suave (`orange-500`) - para despesas
- **Background**: Branco
- **Foreground**: Cinza escuro

### Tipografia
- **Display**: Poppins (títulos)
- **Body**: Inter (texto geral)

### Componentes
- Bordas arredondadas (`rounded-md`, `rounded-lg`)
- Sombras sutis
- Animações discretas
- Mobile-first

## 🗄️ Banco de Dados

O schema completo está em `supabase/schema.sql`. Principais tabelas:

- `perfis` - Dados do usuário
- `categorias` - Categorias de despesas/receitas
- `contas` - Contas do usuário (Carteira, Banco, etc.)
- `transacoes` - Todas as despesas e receitas
- `contas_fixas` - Contas recorrentes
- `pagamentos_contas_fixas` - Histórico de pagamentos

## 🔐 Autenticação

- Autenticação via Supabase Auth
- Middleware protege rotas privadas
- Row Level Security (RLS) no banco de dados

## 🚦 Como Começar

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   Crie um arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

3. **Configurar banco de dados:**
   - Crie um projeto no Supabase
   - Execute o SQL em `supabase/schema.sql` no SQL Editor

4. **Rodar em desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acessar:**
   Abra [http://localhost:3000](http://localhost:3000)

## 📝 Próximos Passos

- [ ] Implementar onboarding completo
- [ ] Conectar dashboard com dados reais do Supabase
- [ ] Implementar gráfico de pizza com Recharts
- [ ] Adicionar sincronização em tempo real (Supabase Realtime)
- [ ] Criar página de histórico com filtros
- [ ] Implementar contas fixas
- [ ] Página de configurações
- [ ] Sistema de assinatura

## 📄 Licença

Este projeto é privado e proprietário.

