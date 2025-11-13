# CONTRAL - WebApp

Aplicação web moderna para gestão financeira pessoal. O usuário envia mensagens para o número do CONTRAL no WhatsApp e acompanha tudo em um dashboard visual.

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
│   ├── (marketing)/       # Rotas públicas de marketing
│   │   └── page.tsx       # Landing Page
│   ├── (auth)/            # Rotas de autenticação
│   │   ├── login/
│   │   ├── cadastro/
│   │   ├── esqueci-senha/
│   │   ├── redefinir-senha/
│   │   └── verificar-email/
│   ├── (privado)/         # Área autenticada
│   │   ├── dashboard/
│   │   ├── onboarding/
│   │   └── layout.tsx
│   ├── auth/
│   │   └── callback/      # Callback OAuth Supabase
│   ├── layout.tsx         # Layout raiz
│   └── globals.css        # Estilos globais
├── components/
│   ├── layout/
│   │   └── header.tsx
│   └── ui/                # Componentes Shadcn/ui
├── lib/
│   ├── supabase/          # Clientes Supabase (client/server)
│   ├── types/             # Tipos TypeScript
│   └── utils.ts           # Funções utilitárias
├── tests/
│   └── supabase/          # Testes do Supabase
├── supabase/
│   └── schema.sql         # Schema do banco de dados
├── components/
│   └── auth/
│       └── ProtectedRoute.tsx  # Proteção de rotas no cliente
└── public/                # Arquivos estáticos
```

## 🎨 Design System

### Cores
- **Primária**: Azul (`blue-500`)
- **Sucesso**: Verde (`emerald-500`) - para receitas
- **Destrutivo**: Laranja (`orange-500`) - para despesas
- **Background**: Escuro (`slate-950`)
- **Foreground**: Branco/Cinza claro

### Tipografia
- **Display**: Poppins (títulos)
- **Body**: Inter (texto geral)

### Componentes
- Bordas arredondadas
- Sombras sutis
- Animações discretas
- Mobile-first

## 🗄️ Banco de Dados

O schema completo está em `supabase/schema.sql`. Principais tabelas:

- `perfis` / `users` - Dados do usuário
- `categorias` - Categorias de despesas/receitas
- `contas` - Contas do usuário (Carteira, Banco, etc.)
- `transacoes` - Todas as despesas e receitas
- `contas_fixas` - Contas recorrentes
- `pagamentos_contas_fixas` - Histórico de pagamentos

## 🔐 Autenticação

- Autenticação via Supabase Auth
- Proteção de rotas no cliente via `ProtectedRoute`
- Row Level Security (RLS) no banco de dados
- Redirecionamento automático baseado em onboarding
- Hook `useAuth` para gerenciar estado de autenticação

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

## 🧪 Testes

Testes do Supabase estão na pasta `tests/supabase/`:

```bash
# Teste de conexão
npx tsx tests/supabase/connection.test.ts

# Teste de autenticação
npx tsx tests/supabase/auth.test.ts
```

## 📝 Funcionalidades Implementadas

- ✅ Autenticação completa (login, cadastro, recuperação de senha)
- ✅ Onboarding em 3 etapas
- ✅ Dashboard (estrutura básica)
- ✅ Proteção de rotas no cliente (ProtectedRoute)
- ✅ Integração com Supabase configurada

## 📝 Próximos Passos

- [ ] Conectar dashboard com dados reais do Supabase
- [ ] Implementar gráficos com Recharts
- [ ] Criar página de histórico com filtros
- [ ] Implementar contas fixas
- [ ] Página de configurações
- [ ] Sincronização em tempo real (Supabase Realtime)

## 📄 Licença

Este projeto é privado e proprietário.
