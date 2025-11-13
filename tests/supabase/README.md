# Testes do Supabase

Esta pasta contém testes para verificar a conexão e funcionalidades do Supabase.

## Pré-requisitos

1. Configure as variáveis de ambiente no arquivo `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
   ```

2. Execute o schema SQL no Supabase:
   - Acesse o SQL Editor no Supabase
   - Execute o conteúdo de `supabase/schema.sql`

## Testes Disponíveis

### 1. Teste de Conexão
Verifica se a conexão com o Supabase está funcionando.

```bash
npx tsx tests/supabase/connection.test.ts
```

### 2. Teste de Autenticação
Testa cadastro, login e logout de usuários.

```bash
npx tsx tests/supabase/auth.test.ts
```

## Instalação de Dependências

Se você ainda não tiver o `tsx` instalado:

```bash
npm install -D tsx
```

Ou use `npx` que já vem com o Node.js.

